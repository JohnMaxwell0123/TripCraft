#!/usr/bin/env node
/**
 * TripCraft 契约校验器
 * ---------------------------------------------------------------------------
 * 两件事：
 *   1. 元校验：所有 spec/*.schema.json 是否为合法的 JSON Schema 2020-12
 *   2. 实例校验：examples/ 下的每个 trip.json / brand.json / patch.json /
 *      profile.json / listing.json 是否真的符合对应契约
 *   3. 跨文件与语义校验：JSON Schema 表达不了的约束——
 *      listing.json 以 tripRef 引用同目录 trip.json 时，id / revision 必须对得上，
 *      并把行程内联后按「发布快照」形态再校验一次；以及区间上下界、选项互斥 / 依赖引用等
 *
 * 这是 TripCraft DSL「契约优先」工程方式的守门人。任何 Schema 改动若
 * 打破既有实例，CI 必须红。
 *
 * 用法：  node tools/validate-schemas.js      （或 npm run validate）
 * 依赖：  ajv@8 / ajv-formats@2（仅开发期，运行时零依赖 —— 见铁律 1）
 *
 * 退出码：0 全绿；1 有失败项
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SPEC_DIR = path.join(ROOT, 'spec');
const EXAMPLES_DIR = path.join(ROOT, 'examples');

let ajv;
try {
  const Ajv2020 = require('ajv/dist/2020').default;
  const addFormats = require('ajv-formats');
  ajv = new Ajv2020({ strict: false, allErrors: true, validateFormats: true });
  addFormats(ajv);
} catch (e) {
  console.error('缺少开发依赖。请先运行：  npm install');
  process.exit(2);
}

let failures = 0;
const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));

// ── 1. 元校验：Schema 本身是否合法 ─────────────────────────────────────────
// addSchema() 内部会做元模式校验；不抛异常即结构合法。
const schemaFiles = fs.existsSync(SPEC_DIR)
  ? fs.readdirSync(SPEC_DIR).filter((f) => f.endsWith('.json')).sort()
  : [];

if (!schemaFiles.length) {
  console.error('spec/ 目录下没有找到任何 .json Schema');
  process.exit(1);
}

console.log('契约元校验');
for (const f of schemaFiles) {
  const abs = path.join(SPEC_DIR, f);
  try {
    const schema = readJson(abs);
    ajv.addSchema(schema, schema.$id);
    console.log(`  ✓ ${f}   ${schema.$id || '(无 $id)'}`);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${f}   ${String(e.message).split('\n')[0]}`);
  }
}

// ── 2. 实例校验：示例数据是否真的符合契约 ──────────────────────────────────
const INSTANCE_MAP = {
  'trip.json': 'https://tripcraft.dev/schema/v1.0.0/trip.schema.json',
  'brand.json': 'https://tripcraft.dev/schema/v1.0.0/brand.schema.json',
  'patch.json': 'https://tripcraft.dev/schema/v1.0.0/patch.schema.json',
  'profile.json': 'https://tripcraft.dev/schema/v1.0.0/profile.schema.json',
  'listing.json': 'https://tripcraft.dev/schema/v1.0.0/listing.schema.json',
};

function walkInstances(dir) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkInstances(abs));
    else if (INSTANCE_MAP[entry.name]) out.push(abs);
  }
  return out;
}

// ── 3. 语义与跨文件校验：JSON Schema 表达不了的约束 ───────────────────────
function rangeCheck(out, label, lo, hi) {
  if (lo !== undefined && hi !== undefined && lo > hi) out.push(`${label}：下界 ${lo} 大于上界 ${hi}`);
}

function semanticCheck(kind, data, abs, validate) {
  const out = [];
  if (kind === 'profile.json') {
    rangeCheck(out, '/days', data.days?.value.min, data.days?.value.max);
    rangeCheck(out, '/dates', data.dates?.value.earliest, data.dates?.value.latest);
    rangeCheck(out, '/budget', data.budget?.value.minCents, data.budget?.value.maxCents);
    const ids = [...(data.hard || []), ...(data.soft || [])].map((c) => c.value.id);
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) out.push(`/hard + /soft：约束 id 重复 ${[...new Set(dup)].join(', ')}`);
  }
  if (kind === 'listing.json') {
    rangeCheck(out, '/departures', data.departures.minGroupSize, data.departures.maxCapacity);
    rangeCheck(out, '/pricing/display/range', data.pricing.display.range?.minCents, data.pricing.display.range?.maxCents);
    const optionIds = new Set((data.options || []).map((o) => o.id));
    if (optionIds.size !== (data.options || []).length) out.push('/options：选项 id 重复');
    for (const o of data.options || []) {
      for (const ref of [...(o.excludes || []), ...(o.requires || [])]) {
        if (!optionIds.has(ref)) out.push(`/options/${o.id}：引用了不存在的选项 ${ref}`);
        if (ref === o.id) out.push(`/options/${o.id}：不能引用自身`);
      }
      for (const ref of o.excludes || []) {
        if ((o.requires || []).includes(ref)) out.push(`/options/${o.id}：${ref} 同时出现在 excludes 与 requires`);
      }
    }
    // tripRef → 同目录 trip.json：id / revision 对得上，且内联后仍符合 listing 契约
    const ref = data.itinerary.tripRef;
    if (ref) {
      const tripPath = path.join(path.dirname(abs), 'trip.json');
      if (!fs.existsSync(tripPath)) {
        out.push(`/itinerary/tripRef：同目录下找不到 trip.json（引用 ${ref.id}）`);
      } else {
        const trip = readJson(tripPath);
        if (trip.id !== ref.id) out.push(`/itinerary/tripRef：id ${ref.id} 与 trip.json 的 ${trip.id} 不一致`);
        if ((trip.meta.revision || 1) !== ref.revision) {
          out.push(`/itinerary/tripRef：revision ${ref.revision} 与 trip.json 的 ${trip.meta.revision} 不一致`);
        }
        const snapshot = { ...data, itinerary: { trip } };
        if (!validate(snapshot)) {
          for (const err of validate.errors.slice(0, 10)) {
            out.push(`内联行程快照 ${err.instancePath || '/'} ${err.message}`);
          }
        }
      }
    }
  }
  return out;
}

const instances = walkInstances(EXAMPLES_DIR);
console.log('\n实例校验');
if (!instances.length) {
  console.log('  (examples/ 下暂无可校验实例)');
}

for (const abs of instances) {
  const rel = path.relative(ROOT, abs).replace(/\\/g, '/');
  const schemaId = INSTANCE_MAP[path.basename(abs)];
  const validate = ajv.getSchema(schemaId);

  if (!validate) {
    failures++;
    console.log(`  ✗ ${rel}   找不到对应契约 ${schemaId}`);
    continue;
  }

  let data;
  try {
    data = readJson(abs);
  } catch (e) {
    failures++;
    console.log(`  ✗ ${rel}   JSON 解析失败: ${e.message}`);
    continue;
  }

  if (validate(data)) {
    const problems = semanticCheck(path.basename(abs), data, abs, validate);
    if (problems.length) {
      failures++;
      console.log(`  ✗ ${rel}   语义 / 跨文件校验失败`);
      for (const p of problems) console.log(`      · ${p}`);
    } else {
      console.log(`  ✓ ${rel}`);
    }
  } else {
    failures++;
    console.log(`  ✗ ${rel}   违反 ${path.basename(schemaId)}`);
    // 按实例路径聚合，避免一个拼写错误刷屏
    const seen = new Map();
    for (const err of validate.errors) {
      const key = (err.instancePath || '/') + ' ' + err.message;
      seen.set(key, (seen.get(key) || 0) + 1);
    }
    for (const [key] of [...seen].slice(0, 20)) console.log(`      · ${key}`);
    if (seen.size > 20) console.log(`      … 另有 ${seen.size - 20} 类问题`);
  }
}

// ── 汇总 ───────────────────────────────────────────────────────────────────
console.log('');
if (failures) {
  console.log(`✗ 契约校验失败：${failures} 项`);
  process.exit(1);
}
console.log(`✓ 契约校验全部通过（${schemaFiles.length} 份 Schema，${instances.length} 份实例）`);
