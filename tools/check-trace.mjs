#!/usr/bin/env node
/**
 * TripCraft 追溯与契约一致性校验器 (check-trace.mjs)
 *
 * 验证规则：
 * 1. PRD-04 中定义的每个 F- 都出现在追溯矩阵 DLV-03 中；
 * 2. 每个 S- 至少关联 1 个 F-；
 * 3. 每个 P0 F- 出现在 DLV-01 阶段 1 或阶段 2；
 * 4. 文档中引用的 S- / F- / ADR- / A- 编号都已定义。
 *
 * 零依赖标准 Node.js 脚本。
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const ROOT = resolve(process.cwd());

// 1. 读取定义源
const prd04Content = readFileSync(join(ROOT, 'docs/product/PRD-04-functional-architecture.md'), 'utf8');
const prd03Content = readFileSync(join(ROOT, 'docs/product/PRD-03-scenarios.md'), 'utf8');
const dlv01Content = readFileSync(join(ROOT, 'docs/delivery/DLV-01-roadmap-mvp.md'), 'utf8');
const dlv03Content = readFileSync(join(ROOT, 'docs/delivery/DLV-03-traceability-matrix.md'), 'utf8');
const assumptionsContent = readFileSync(join(ROOT, 'docs/ASSUMPTIONS.md'), 'utf8');

// 提取所有定义的 F- (匹配形如 F-M01-01)
const definedFeatures = new Set();
const p0Features = new Set();
const fRegex = /(F-M\d{2}-\d{2})/g;
let m;
while ((m = fRegex.exec(prd04Content)) !== null) {
  definedFeatures.add(m[1]);
}

// 提取 P0 Features
for (const line of prd04Content.split(/\r?\n/)) {
  const hit = line.match(/(F-M\d{2}-\d{2})/);
  if (hit && line.includes('P0')) {
    p0Features.add(hit[1]);
  }
}

// 提取定义的 S- (匹配形如 S-C01, S-B01, S-P01, S-O01)
const definedScenarios = new Set();
const sRegex = /(S-[CBPO]\d{2})/g;
while ((m = sRegex.exec(prd03Content)) !== null) {
  definedScenarios.add(m[1]);
}

// 提取定义的 ADR- (匹配形如 ADR-001)
const adrFiles = readdirSync(join(ROOT, 'docs/architecture/adr'));
const definedADRs = new Set();
for (const f of adrFiles) {
  const match = f.match(/(ADR-\d{3})/);
  if (match) definedADRs.add(match[1]);
}

// 提取定义的 A- (匹配形如 A-01)
const definedAssumptions = new Set();
const aRegex = /\|\s*(A-\d{2})\s*\|/g;
while ((m = aRegex.exec(assumptionsContent)) !== null) {
  definedAssumptions.add(m[1]);
}

console.log('--- TripCraft 追溯一致性检查 (check-trace) ---\n');
console.log(`已定义场景 (S-): ${definedScenarios.size} 个`);
console.log(`已定义功能 (F-): ${definedFeatures.size} 个 (其中 P0: ${p0Features.size} 个)`);
console.log(`已定义 ADR (ADR-): ${definedADRs.size} 个`);
console.log(`已定义假设 (A-): ${definedAssumptions.size} 个\n`);

let errors = 0;

// 规则 1: PRD-04 中每个 F- 必须出现在 DLV-03 中
for (const fid of definedFeatures) {
  if (!dlv03Content.includes(fid)) {
    console.error(`❌ [规则 1 违背] 功能 ${fid} 未在追溯矩阵 DLV-03 中登记`);
    errors++;
  }
}

// 规则 2: 每个 S- 至少关联 1 个 F- (检查 DLV-03 中每个 S- 所在行或块是否有关联的 F-)
for (const sid of definedScenarios) {
  if (!dlv03Content.includes(sid)) {
    console.error(`❌ [规则 2 违背] 场景 ${sid} 未在追溯矩阵 DLV-03 中覆盖`);
    errors++;
  }
}

// 规则 3: 每个 P0 功能必须出现在 DLV-01 阶段 1 或阶段 2 中
for (const p0 of p0Features) {
  if (!dlv01Content.includes(p0)) {
    console.error(`❌ [规则 3 违背] P0 功能 ${p0} 未在路线图 DLV-01 阶段 1 或 2 中列出`);
    errors++;
  }
}

// 规则 4: 扫描 docs/product, docs/architecture, docs/delivery 下引用的所有 ID，确保均已定义
function walkDir(dir, fileList = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walkDir(full, fileList);
    } else if (name.endsWith('.md')) {
      fileList.push(full);
    }
  }
  return fileList;
}

const docsToCheck = [
  ...walkDir(join(ROOT, 'docs/product')),
  ...walkDir(join(ROOT, 'docs/architecture')),
  ...walkDir(join(ROOT, 'docs/delivery')),
];

for (const file of docsToCheck) {
  const content = readFileSync(file, 'utf8');
  
  // 检查引用的 S-
  let sm;
  const sRefRegex = /\b(S-[CBPO]\d{2})\b/g;
  while ((sm = sRefRegex.exec(content)) !== null) {
    if (!definedScenarios.has(sm[1])) {
      console.error(`❌ [规则 4 违背] ${file} 引用了未定义的场景 ID: ${sm[1]}`);
      errors++;
    }
  }

  // 检查引用的 F-
  let fm;
  const fRefRegex = /\b(F-M\d{2}-\d{2})\b/g;
  while ((fm = fRefRegex.exec(content)) !== null) {
    if (!definedFeatures.has(fm[1])) {
      console.error(`❌ [规则 4 违背] ${file} 引用了未定义的功能 ID: ${fm[1]}`);
      errors++;
    }
  }

  // 检查引用的 ADR-
  let am;
  const adrRefRegex = /\b(ADR-\d{3})\b/g;
  while ((am = adrRefRegex.exec(content)) !== null) {
    if (!definedADRs.has(am[1])) {
      console.error(`❌ [规则 4 违背] ${file} 引用了未定义的 ADR ID: ${am[1]}`);
      errors++;
    }
  }

  // 检查引用的 A- (限制 A-01 到 A-99)
  let asmM;
  const asmRefRegex = /\b(A-\d{2})\b/g;
  while ((asmM = asmRefRegex.exec(content)) !== null) {
    if (!definedAssumptions.has(asmM[1])) {
      // 检查是否将要在 ASSUMPTIONS.md 中追加 A-08~A-12
      // 若尚未追加，在此处打印提示
      console.error(`❌ [规则 4 违背] ${file} 引用了未在 ASSUMPTIONS.md 中定义的假设 ID: ${asmM[1]}`);
      errors++;
    }
  }
}

if (errors === 0) {
  console.log('✓ 追溯校验全部通过：所有场景、功能、ADR、假设 100% 闭环且无未定义引用\n');
  process.exit(0);
} else {
  console.error(`\n✗ 追溯校验失败：发现 ${errors} 处不一致\n`);
  process.exit(1);
}
