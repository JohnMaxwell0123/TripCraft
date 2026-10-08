import { readFileSync, existsSync, statSync, globSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
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
