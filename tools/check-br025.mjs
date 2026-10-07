#!/usr/bin/env node
/**
 * BR-025 校验器 —— 产物中不得内联算路 API 返回的路线几何。
 *
 * 规则出处：docs/07-legal-and-compliance.md §7.8.1（唯一来源）
 * 检测思路：docs/01-resilience-and-failover.md §1.3.2
 *
 * 为什么这条规则存在：
 *   我们的编译流水线会把路线烘焙进静态产物，产物会被分发、长期保存、
 *   可能被 CDN 缓存 —— 这在法律性质上是「存储」，不是「实时展示」。
 *   高德条款对这两者的授权完全不同（第 3.5 / 4.12.3 / 4.12.8 条）。
 *
 * 判据：
 *   高德/百度算路 polyline 是密集点串（通常数百至数千点）；
 *   DSL 自有的节点坐标是稀疏的 POI（一天 5~20 个点）。
 *   阈值取 50 —— 宽松上限，不误伤正常数据，但能抓住任何一次
 *   "图省事直接把 SDK 算路结果塞进去"的偷懒。
 *
 * 用法：
 *   node tools/check-br025.mjs            # 扫描 examples/ 与 docs/
 *   node tools/check-br025.mjs --self-test # 含注入测试
 */

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

/** 连续 ≥50 个「lng,lat;」点对 */
const DENSE_POLYLINE = /"?\d{2,3}\.\d{4,},\d{2}\.\d{4,}(?:;\d{2,3}\.\d{4,},\d{2}\.\d{4,}){50,}"?/g;

export function findNavPolyline(text) {
  return text.match(DENSE_POLYLINE) || [];
}

function walk(dir, exts, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.includes(extname(p))) out.push(p);
  }
  return out;
}

let failures = 0;

function scan(files, pad) {
  for (const f of files) {
    const hits = findNavPolyline(readFileSync(f, 'utf8'));
    if (hits.length) {
      failures++;
      console.log(`  ✗ ${f}  —— ${hits.length} 处疑似算路几何`);
      console.log(`      首处前 80 字符: ${hits[0].slice(0, 80)}…`);
    } else {
      console.log(`  ${pad}${f}`);
    }
  }
}

console.log('BR-025 扫描：产物中不得内联算路 API 返回的路线几何\n');

console.log('扫描 examples/');
scan(walk('examples', ['.json']), '✓ ');

console.log('\n扫描 docs/ 内联示例');
scan(walk('docs', ['.md']), '✓ ');

if (process.argv.includes('--self-test')) {
  console.log('\n注入测试（构造 80 点算路 polyline）');
  const injected =
    '{"polyline":"' +
    Array.from({ length: 80 }, (_, i) =>
      `${(94.1 + i * 0.01).toFixed(5)},${(40.1 + i * 0.01).toFixed(5)}`
    ).join(';') +
    '"}';
  const caught = findNavPolyline(injected).length;
  if (caught === 1) {
    console.log('  ✓ 注入的 80 点 polyline 被正确捕获');
  } else {
    console.log(`  ✗ 注入测试失败：期望捕获 1 处，实际 ${caught} 处`);
    failures++;
  }

  console.log('\n边界测试（49 点，应放行）');
  const near =
    '{"polyline":"' +
    Array.from({ length: 49 }, (_, i) =>
      `${(94.1 + i * 0.01).toFixed(5)},${(40.1 + i * 0.01).toFixed(5)}`
    ).join(';') +
    '"}';
  const missed = findNavPolyline(near).length;
  if (missed === 0) {
    console.log('  ✓ 49 点未被误报（阈值边界正确）');
  } else {
    console.log(`  ✗ 阈值边界错误：49 点被误报为算路几何`);
    failures++;
  }
}

console.log('');
if (failures) {
  console.log(`✗ BR-025 校验失败：${failures} 项`);
  process.exit(1);
}
console.log('✓ BR-025 校验通过：未发现内联的算路几何');
