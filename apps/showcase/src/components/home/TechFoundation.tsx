'use client';

import { useState, type KeyboardEvent } from 'react';

/**
 * 技术底座（产品基线 v3 的四条工程主张）
 *
 * 数字与代码都来自仓库本身：spec/ 下的 6 份 JSON Schema、`npm run check` 的 4 道门禁、10 份 ADR、
 * PRD-03 / PRD-04 的 21 个场景与 79 项功能。代码窗口里是契约文件的节选（删去了部分描述），不是示意代码。
 * 版式学 Unify：数字卡用衬线常规字重的大数字；四条主张用左侧选项卡（进度条在留白里）+ 右侧炭黑代码窗口。
 * 本段以圆角纸面压在页脚的氛围带上（rounded-b + relative z-10）。
 */

const REPO = 'https://github.com/JohnMaxwell0123/TripCraft';

const NUMBERS = [
  { value: '6', label: '份 JSON Schema 契约', source: 'spec/*.schema.json' },
  { value: '4', label: '道 CI 门禁', source: '契约 · 链接 · BR-025 · 追溯' },
  { value: '10', label: '份架构决策记录', source: 'ADR-001 – ADR-010' },
  { value: '21 / 79', label: '个场景 / 项功能，双向追溯', source: 'PRD-03 · PRD-04 · DLV-03' },
];

interface Pillar {
  id: string;
  title: string;
  desc: string;
  file: string;
  href: string;
  code: string;
}

const PILLARS: Pillar[] = [
  {
    id: 'profile',
    title: '需求画像是两条路径的共同输入',
    desc: '对话之后只留下一份带来源的画像：每个特征点标明是用户明说、模型推断还是行业默认。推断项没确认，匹配结果会提示「含推断项」；画像里不存对话全文和 API Key。',
    file: 'spec/profile.schema.json',
    href: `${REPO}/blob/main/spec/profile.schema.json`,
    code: `"source": {
  "type": "string",
  "enum": ["stated", "inferred", "default"],
  "description": "stated = 用户明说；inferred = 模型推断（画像回显卡上带「推断 · 请确认」标记）；default = 行业默认。"
},

"sourced": {
  "type": "object",
  "required": ["source"],
  "properties": {
    "source": { "$ref": "#/$defs/source" },
    "confirmed": { "type": "boolean", "default": false },
    "pending": { "type": "boolean", "default": false },
    "evidence": { "type": "string", "maxLength": 300 }
  }
}`,
  },
  {
    id: 'listing',
    title: '价格与素材透明，写进上架契约',
    desc: '起价必须写明成立条件；「适合长辈」这类标签必须附一句可核验的说明；每张图片标明实拍、示意还是 AI 生成。上架契约里没有成本价字段。',
    file: 'spec/listing.schema.json',
    href: `${REPO}/blob/main/spec/listing.schema.json`,
    code: `"from": {
  "required": ["amountCents", "conditions"],
  "properties": {
    "conditions": { "type": "array", "minItems": 1, "maxItems": 6,
      "description": "起价成立的条件，如「6 人成团」「舒适型住宿」「7 月平日」" }
  }
},

"audienceFitTag": {
  "required": ["tag", "explanation"],
  "properties": {
    "tag": { "enum": ["senior_friendly", "child_friendly", "accessible", "pet_friendly"] },
    "explanation": { "type": "string", "minLength": 6, "maxLength": 200 }
  }
},

"capture": { "enum": ["real_shot", "illustrative", "ai_generated"] }`,
  },
  {
    id: 'match',
    title: '匹配度可复现，付费不进分数',
    desc: '先判资格再算分：资质、团期、身体约束不满足的线路不展示；其余按维度加权，每一项附一句理由。评分是纯函数，规则版本随结果保存；推广位单独标注「广告」。',
    file: 'ADR-010 · 建议决策（摘录）',
    href: `${REPO}/blob/main/docs/architecture/adr/ADR-010-route-matching-scoring.md`,
    code: `score(profile, listing, weights, rulesVersion)   # 纯函数，可复现

默认权重
  目的地覆盖      25%
  预算贴合        20%
  天数与日期      15%
  节奏与体力      15%
  人群适配        10%
  主题偏好        10%
  住宿与服务       5%

不进入匹配度：旅行社评分 · 推广付费 · 资料完整度
展示：round(score × 100)，上限 99；默认阈值 60`,
  },
  {
    id: 'sync',
    title: '版本只增不改，冲突交给人',
    desc: '行程以递增的修订号为准；离线时的改动打包成增量补丁，联网后基于同一版本合并。冲突不交给算法投票，由领队拍板。报价也一样：只新增版本，自动列出差异。',
    file: 'spec/patch.schema.json',
    href: `${REPO}/blob/main/spec/patch.schema.json`,
    code: `"required": ["patchVersion", "tripId", "baseRevision", "ops", "issuedAt"],

"tripId": {
  "type": "string",
  "pattern": "^trip_[0-9]{8}_[a-z0-9][a-z0-9-]{1,63}$",
  "description": "目标行程 ID。不匹配则拒绝应用"
},

"baseRevision": {
  "type": "integer",
  "minimum": 0,
  "description": "若本地 revision < baseRevision 则拒绝（存在信息缺口）；若 > baseRevision 则可尝试应用但需提示冲突"
}`,
  },
];

export function TechFoundation() {
  const [active, setActive] = useState(0);
  const [copy, setCopy] = useState<'idle' | 'done' | 'failed'>('idle');
  const pillar = PILLARS[active];

  const select = (i: number) => {
    setActive(i);
    setCopy('idle');
  };

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const next = e.key === 'ArrowDown' ? Math.min(PILLARS.length - 1, i + 1) : Math.max(0, i - 1);
    select(next);
    document.getElementById(`pillar-tab-${PILLARS[next].id}`)?.focus();
  };

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(pillar.code);
      setCopy('done');
    } catch (err) {
      console.warn('[TechFoundation] 复制到剪贴板失败', err);
      setCopy('failed');
    }
  };

  return (
    <section id="foundation" className="relative z-10 scroll-mt-16 rounded-b-[28px] bg-[#FFFFF9] pb-24 md:pb-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 pt-24 md:pt-32 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="u-eyebrow">技术底座</p>
            <h2 className="mt-4 text-balance font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20] sm:text-[40px] lg:text-[44px]">
              契约先行，事实可追溯
            </h2>
          </div>
          <p className="text-base leading-relaxed text-[#241E20]/70 lg:col-span-5">
            两条规划路径共用一份需求画像，产出同一种行程数据；地点等事实来自图商核验，模型只写建议；匹配度可复现，付费不进分数。下面的数字与代码都来自仓库本身。
          </p>
        </div>

        {/* 数字卡 */}
        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {NUMBERS.map((n) => (
            <div key={n.label} className="u-card flex min-h-[180px] flex-col p-5 sm:p-6">
              <p className="font-serif text-[44px] font-normal leading-none tracking-[-0.03em] text-[#241E20] tabular-nums sm:text-[56px]">{n.value}</p>
              <p className="mt-3 text-[15px] leading-snug text-[#241E20]">{n.label}</p>
              <p className="mt-auto pt-4 font-mono text-[13px] leading-snug text-[#241E20]/60">{n.source}</p>
            </div>
          ))}
        </div>

        {/* 四条工程主张：左侧选项卡 + 右侧代码窗口 */}
        <div className="mt-16 grid gap-10 lg:grid-cols-[360px_minmax(0,1fr)] lg:gap-14">
          <div role="tablist" aria-orientation="vertical" aria-label="技术主张" className="flex flex-col">
            {PILLARS.map((p, i) => {
              const on = i === active;
              return (
                <button
                  key={p.id}
                  id={`pillar-tab-${p.id}`}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  aria-controls="pillar-panel"
                  tabIndex={on ? 0 : -1}
                  onClick={() => select(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  className="group relative rounded-[5px] py-3 pl-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01] lg:pl-0"
                >
                  <span aria-hidden className={`absolute inset-y-2 left-0 w-[3px] rounded-full lg:-left-6 ${on ? 'bg-[#FE3C01]' : 'bg-[#241E20]/[0.12]'}`} />
                  <span className={`block text-xl leading-snug transition-colors ${on ? 'text-[#241E20]' : 'text-[#241E20]/[0.62] group-hover:text-[#241E20]/85'}`}>{p.title}</span>
                  <span className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${on ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} aria-hidden={!on}>
                    <span className="overflow-hidden">
                      <span className="block pt-2 text-[15px] leading-relaxed text-[#241E20]/70">{p.desc}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id="pillar-panel" role="tabpanel" aria-labelledby={`pillar-tab-${pillar.id}`} className="min-w-0 overflow-hidden rounded-[18px] bg-[#241E20] text-[#FFFFF9] shadow-[0_32px_64px_-24px_rgba(36,30,32,0.45)]">
            <div className="flex items-center gap-3 border-b border-[#FFFFF9]/10 px-5 py-3">
              <span aria-hidden className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-[#FFFFF9]/20" />
                <span className="h-3 w-3 rounded-full bg-[#FFFFF9]/20" />
                <span className="h-3 w-3 rounded-full bg-[#FFFFF9]/20" />
              </span>
              <a href={pillar.href} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-mono text-[13px] text-[#FFFFF9]/80 hover:text-[#FFFFF9]">
                <span className="u-link pb-0.5">{pillar.file}</span>
              </a>
              <span className="hidden shrink-0 rounded-full px-2.5 py-0.5 text-[13px] text-[#FFFFF9]/70 shadow-[inset_0_0_0_1px_rgba(255,255,249,0.2)] sm:inline">节选</span>
              <button
                type="button"
                onClick={copyCode}
                className="h-9 shrink-0 rounded-[5px] px-3 text-[13px] font-medium text-[#FFFFF9]/85 shadow-[inset_0_0_0_1px_rgba(255,255,249,0.2)] transition-colors hover:text-[#FFFFF9] hover:shadow-[inset_0_0_0_1px_rgba(255,255,249,0.45)]"
              >
                {copy === 'done' ? '已复制' : copy === 'failed' ? '复制失败' : '复制'}
              </button>
            </div>
            <pre className="max-h-[440px] overflow-auto whitespace-pre-wrap px-5 py-5 font-mono text-[13px] leading-relaxed text-[#FFFFF9]/90 [overflow-wrap:anywhere]">
              <code>{pillar.code}</code>
            </pre>
          </div>
        </div>

        <p className="mt-10 text-sm text-[#241E20]/65">
          契约、架构决策与门禁脚本都在
          <a href={REPO} target="_blank" rel="noreferrer" className="mx-1 font-medium text-[#241E20]">
            <span className="u-link pb-0.5">GitHub 仓库</span>
          </a>
          里公开；<code className="mx-1 font-mono text-[13px] text-[#241E20]">npm run check</code>在每次推送与合并请求时运行。
        </p>
      </div>
    </section>
  );
}
