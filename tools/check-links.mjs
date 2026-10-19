import * as fs from 'node:fs';
import { dirname, resolve } from 'node:path';
const { readFileSync, existsSync, statSync } = fs;

/**
 * fs.globSync 自 Node 22 起才有；CI（Node 20）与 package.json engines（>=18）上它不存在，
 * 具名导入会让整个脚本加载失败。这里退回一个只覆盖本仓库用法的小实现：一层花括号、** 与 *。
 */
function globFallback(pattern) {
  const braces = pattern.match(/^\{(.*)\}$/);
  const out = new Set();
  for (const p of braces ? braces[1].split(',') : [pattern]) {
    const parts = p.split('/');
    const firstWild = parts.findIndex((x) => /[*?]/.test(x));
    if (firstWild === -1) {
      if (existsSync(p)) out.add(p);
      continue;
    }
    const base = parts.slice(0, firstWild).join('/') || '.';
    const re = new RegExp(
      '^' +
        parts
          .slice(firstWild)
          .join('/')
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*\*\//g, '\u0000')
          .replace(/\*/g, '[^/]*')
          .replace(/\?/g, '[^/]')
          .replace(/\u0000/g, '(?:.*/)?') +
        '$',
    );
    const walk = (dir) => {
      if (!existsSync(dir)) return;
      for (const name of fs.readdirSync(dir)) {
        const full = dir === '.' ? name : `${dir}/${name}`;
        if (statSync(full).isDirectory()) walk(full);
        else if (re.test(base === '.' ? full : full.slice(base.length + 1))) out.add(full);
      }
    };
    walk(base);
  }
  return [...out].sort();
}
const globSync = fs.globSync ?? globFallback;
const slug = (s) => s.trim().toLowerCase().replace(/[^\p{L}\p{N} -]/gu, '').replace(/ /g, '-');
function anchorsOf(file) {
  const set = []; let fence = false;
  for (const ln of readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (/^\s*```/.test(ln)) { fence = !fence; continue; }
    if (fence) continue;
    const m = ln.match(/^#{1,6}\s+(.*?)\s*$/);
    if (m) set.push(slug(m[1]));
  }
  return set;
}
const cache = new Map();
const anchors = (f) => {
  const abs = resolve(f);
  if (!cache.has(abs)) cache.set(abs, (existsSync(abs) && !statSync(abs).isDirectory()) ? anchorsOf(abs) : null);
  return cache.get(abs);
};
const files = globSync(process.argv[2]);
let total = 0, bad = 0;
for (const f of files) {
  const dir = dirname(f);
  let fence = false;
  for (const ln of readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (/^\s*```/.test(ln)) { fence = !fence; continue; }
    if (fence) continue;
    const re = /\]\(([^)\s#]*)(#[^)\s]+)?\)/g;
    let m;
    while ((m = re.exec(ln))) {
      const [, target, frag] = m;
      if (/^(https?:|mailto:|tel:)/.test(target)) continue;
      if (!frag && !target) continue;
      if (target.endsWith('/')) {
        total++;
        const dirPath = resolve(dir, target);
        if (!existsSync(dirPath) || !statSync(dirPath).isDirectory()) {
          console.log(`❌ ${f}\n   目录不存在: ${target}`);
          bad++;
        }
        continue;
      }
      total++;
      const path = target ? resolve(dir, target) : resolve(f);
      const a = anchors(path);
      if (a === null) { console.log(`❌ ${f}\n   文件不存在: ${target}`); bad++; continue; }
      if (frag) {
        const t = decodeURIComponent(frag.slice(1));
        if (!a.includes(t)) {
          const key = t.replace(/[^a-z0-9一-鿿]/gi,'').slice(0, 14);
          const near = a.filter(x => x.replace(/[^a-z0-9一-鿿]/gi,'').startsWith(key)).slice(0,1);
          console.log(`❌ ${f}\n   锚点失效: ${target}${frag}` + (near.length ? `\n   ↳ 应改为: ${target}#${near[0]}` : ''));
          bad++;
        }
      }
    }
  }
}
console.log(`\n跨文件链接: ${total}  |  失效: ${bad}`);
if (bad > 0) {
  process.exit(1);
}
