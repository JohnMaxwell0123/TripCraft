'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { PageHeader, Segmented, btn } from './ui';
import { CheckIcon, ChevronDownIcon, SparklesIcon, StarIcon } from '@/components/common/Icons';

/**
 * 03 幕（上）· 路径 B 旅行社线路筛选页（docs/16 §16.6–§16.7）
 *
 * 从路径 A 的「看旅行社线路」进来，页面先「套用需求画像」：分布图一开始就在，
 * 画像里的预算区间与天数范围随后着色，来自画像的条件方块依次选中并带 ★——访客看得见画像怎样变成筛选条件。
 * 价格滑块上方是真实的柱状分布（分面计数，标出你的预算与市场中位）；结果卡：匹配度、3 条理由与 1 条差距。
 * 「问 AI」后价格上限移到 ¥8,000，结果数变化，但匹配度不变——筛选是硬过滤，画像是软评分。
 */

const fmt = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;

/* ── 价格分布：通过其他筛选条件的 44 条线路，箱宽 ¥500，末箱合并为 12k+ ── */
const PRICE_MIN = 2000;
const PRICE_MAX = 12500;
const PRICE_BIN = 500;
const PRICE_COUNTS = [0, 1, 3, 4, 3, 2, 4, 6, 7, 6, 3, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1];
const PRICE_PEAK = Math.max(...PRICE_COUNTS);
const BUDGET: [number, number] = [5000, 7000];
const MEDIAN = 5800;
const pricePct = (v: number) => ((v - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100;

/* ── 天数分布：5 … 12、13+ ── */
const DAY_COUNTS = [2, 4, 7, 9, 10, 6, 3, 2, 1];
const DAY_LABELS = ['5', '6', '7', '8', '9', '10', '11', '12', '13+'];
const DAY_RANGE: [number, number] = [3, 5];

interface Tile {
  label: string;
  count: number;
  selected?: boolean;
}

const TILE_GROUPS: { title: string; tiles: Tile[] }[] = [
  {
    title: '适合人群',
    tiles: [
      { label: '长辈', count: 19, selected: true },
      { label: '儿童', count: 16, selected: true },
      { label: '无障碍', count: 3 },
      { label: '带宠物', count: 0 },
    ],
  },
  {
    title: '行程节奏',
    tiles: [
      { label: '轻松', count: 23, selected: true },
      { label: '适中', count: 31 },
      { label: '紧凑', count: 25 },
    ],
  },
];

interface Result {
  title: string;
  agency: string;
  rating: string;
  score: number;
  reasons: string[];
  gap: string;
  price: string;
  family: string;
}

export const RESULTS: Result[] = [
  {
    title: '河西走廊 9 日 · 长辈友好私家团',
    agency: '敦煌某国际旅行社',
    rating: '4.8',
    score: 91,
    reasons: ['必去 2/2', '日均车程 3.1 小时', '标注适合长辈'],
    gap: '最长一天车程 6 小时',
    price: '人均 ¥6,280 起',
    family: '全家预估 ¥29,500',
  },
  {
    title: '敦煌 · 张掖 8 日 · 包车带司机',
    agency: '张掖某旅行社',
    rating: '4.6',
    score: 86,
    reasons: ['必去 2/2', '7 座 MPV 带司机', '全程无高台阶'],
    gap: '鸣沙山排在午后',
    price: '人均 ¥5,460 起',
    family: '全家预估 ¥25,700',
  },
  {
    title: '河西走廊 10 日 · 亲子慢游小团',
    agency: '兰州某旅行社',
    rating: '4.7',
    score: 82,
    reasons: ['节奏轻松', '标注适合儿童', '含莫高窟'],
    gap: '拼小团 ≤ 8 人',
    price: '人均 ¥5,180 起',
    family: '全家预估 ¥24,320',
  },
];

export function MatchScene() {
  return (
    <Scene range={T.filterScene} label="路径 B：旅行社线路筛选">
      <PageHeader
        title="旅行社线路"
        subtitle={
          <>
            <span className="font-medium text-[#C43200]">已套用需求画像</span> · 5 人 · 1 长者 1 儿童 · 国庆前后 · 8–10 天
          </>
        }
        actions={
          <>
            <span className={`${btn.secondary} hidden cq-md:inline-flex`}>编辑需求</span>
            <AskAiButton />
          </>
        }
      />

      <div className="relative flex min-h-0 flex-1">
        {/* 宽视窗：左侧常驻筛选面板 */}
        <aside className="hidden w-[248px] shrink-0 flex-col gap-5 overflow-hidden border-r border-[#EEEDE7] p-4 cq-md:flex">
          <FilterPanel />
        </aside>
        <section className="flex min-w-0 flex-1 flex-col p-4">
          <ResultsPanel />
        </section>

        {/* 窄视窗：筛选面板收进底部抽屉（§16.7.7） */}
        <FilterDrawer />
        <AskAiPopover />
      </div>
    </Scene>
  );
}

/* ═════════════════════ 「问 AI」：与对话双向联动（§16.7.4） ═════════════════════ */
function AskAiButton() {
  const p = useProgress();
  const press = useRange(p, [T.askClick - 0.003, T.askClick, T.askClick + 0.003], [1, 0.94, 1]);
  return (
    <motion.span className={`${btn.secondary} relative`} style={{ scale: press }}>
      <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
      问 AI
      <TapCursor approach={T.askCursor} clickAt={T.askClick} hideAt={T.askClick + sec(0.4)} className="left-10 top-4" />
    </motion.span>
  );
}

function AskAiPopover() {
  const p = useProgress();
  const [a, b, c, d] = T.askPopover;
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [8, 0, 0, 6], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);
  const reply = useFade(p, T.askReply, T.askReply + sec(0.3));

  return (
    <motion.div
      role="status"
      className="absolute bottom-4 right-4 z-40 w-[min(296px,calc(100%-2rem))] rounded-[12px] border border-[#E2E2D8] bg-white p-3 shadow-[0_16px_40px_rgba(36,30,32,0.14)]"
      style={{ opacity, y, visibility }}
    >
      <p className="ml-auto w-fit rounded-[10px] rounded-tr-[4px] bg-[#241E20] px-3 py-1.5 text-[13px] text-[#FFFFF9]">预算可以到 8000</p>
      <motion.div className="mt-2 flex items-center gap-2" style={{ opacity: reply }}>
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-white">
          <SparklesIcon className="h-3 w-3" />
        </span>
        <p className="min-w-0 flex-1 text-[13px] text-[#241E20]">已调整：人均 ≤ ¥8,000</p>
        <span className="shrink-0 text-xs font-medium text-[#625F61] underline underline-offset-2">撤销</span>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 筛选面板：分布图滑块 + 条件方块 ═════════════════════ */
/** 来自画像的方块按这个顺序依次选中（长辈 → 儿童 → 轻松） */
const PROFILE_TILES = TILE_GROUPS.flatMap((g) => g.tiles.filter((t) => t.selected).map((t) => t.label));

function FilterPanel({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const fromProfile = useFade(p, T.tilesStart - sec(0.2), T.tilesStart);
  return (
    <>
      <PriceFilter />
      <DaysFilter />
      <div className="flex flex-col gap-3">
        {TILE_GROUPS.slice(0, compact ? 1 : TILE_GROUPS.length).map((g, gi) => (
          <div key={g.title}>
            <p className="mb-2 flex items-center justify-between text-xs font-medium text-[#625F61]">
              {g.title}
              {gi === 0 ? (
                <motion.span className="inline-flex items-center gap-1 font-normal text-[#828081]" style={{ opacity: fromProfile }}>
                  <StarIcon className="h-3 w-3 text-[#FE3C01]" />
                  来自你的需求
                </motion.span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-2">
              {g.tiles.map((t) => (
                <TileChip key={t.label} tile={t} selectedAt={t.selected ? T.tilesStart + PROFILE_TILES.indexOf(t.label) * T.tileStep : undefined} />
              ))}
            </div>
          </div>
        ))}
        {compact ? (
          <p className="inline-flex items-center gap-1 text-xs text-[#828081]">
            <ChevronDownIcon className="h-3 w-3" />
            更多条件：行程节奏、出行方式等 6 组
          </p>
        ) : null}
      </div>
    </>
  );
}

/** 条件方块：来自画像的方块在 selectedAt 时选中（套用画像的那一刻） */
function TileChip({ tile, selectedAt }: { tile: Tile; selectedAt?: number }) {
  const p = useProgress();
  const on = useStep(p, [selectedAt ?? 2]) === 1;
  const empty = tile.count === 0;
  return (
    <span
      className={`inline-flex h-7 items-center gap-1 whitespace-nowrap rounded-[5px] border px-2 text-xs transition-colors duration-200 ${
        on ? 'border-[#241E20] bg-[#F4F4EE] font-medium text-[#241E20]' : empty ? 'border-dashed border-[#E2E2D8] text-[#A3A19B]' : 'border-[#E2E2D8] bg-white text-[#625F61]'
      }`}
    >
      {on ? <CheckIcon className="h-3 w-3" /> : null}
      {tile.label}
      <span className="tabular-nums text-[#828081]">{tile.count}</span>
      {on ? <StarIcon className="h-3 w-3 text-[#FE3C01]" /> : null}
    </span>
  );
}

function PriceFilter() {
  const p = useProgress();
  const hi = useRange(p, T.budgetDrag, [BUDGET[1], 8000]);
  const rangeOn = useRange(p, T.priceRange, [0, 1]);
  const markers = useFade(p, T.priceRange[0] + sec(0.4), T.priceRange[1] + sec(0.3));
  const hiLeft = useTransform(hi, (v) => `${pricePct(v)}%`);
  const loLeft = `${pricePct(BUDGET[0])}%`;
  const fill = useTransform(hi, (v) => `${pricePct(v) - pricePct(BUDGET[0])}%`);
  const hiRef = useScrollCounter(p, BUDGET[1], 8000, T.budgetDrag[0], T.budgetDrag[1], 0, fmt, ease.smooth);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#241E20]">价格</p>
        <Segmented options={['人均', '全家']} active={0} />
      </div>

      {/* 真实柱状分布（不拟合曲线）+ 市场中位虚线 */}
      <div aria-hidden className="relative mt-6 h-14">
        <div className="absolute inset-0 flex items-end gap-px">
          {PRICE_COUNTS.map((c, i) => (
            <PriceBar key={i} count={c} hi={hi} rangeOn={rangeOn} center={PRICE_MIN + i * PRICE_BIN + PRICE_BIN / 2} />
          ))}
        </div>
        <motion.div className="absolute -top-1 bottom-0 border-l border-dashed border-[#241E20]/50" style={{ left: `${pricePct(MEDIAN)}%`, opacity: markers }}>
          <span className="absolute bottom-full left-0 mb-1 -translate-x-1/2 whitespace-nowrap text-xs text-[#625F61]">市场中位 {fmt(MEDIAN)}</span>
        </motion.div>
      </div>

      {/* 双把手滑块 */}
      <div aria-hidden className="relative mt-2 h-4">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E2E2D8]" />
        <motion.div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#241E20]" style={{ left: loLeft, width: fill, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: loLeft, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: hiLeft, opacity: rangeOn }} />
      </div>

      <motion.div className="mt-2 flex items-center justify-between text-xs tabular-nums text-[#241E20]" style={{ opacity: rangeOn }}>
        <span className="rounded-[5px] border border-[#E2E2D8] bg-white px-2 py-0.5">{fmt(BUDGET[0])}</span>
        <span className="text-[#828081]">—</span>
        <span className="rounded-[5px] border border-[#E2E2D8] bg-white px-2 py-0.5">
          <span ref={hiRef}>{fmt(BUDGET[1])}</span>
        </span>
      </motion.div>
      <motion.p className="mt-2 text-xs text-[#C43200]" style={{ opacity: markers }}>
        ▲ 你的预算 {fmt(BUDGET[0])}–{fmt(BUDGET[1]).slice(1)}
        <span className="text-[#828081]"> · 画像推断</span>
      </motion.p>
    </div>
  );
}

/** 分布图的柱子随页面一起出现（市场行情与画像无关）；画像里的预算区间随后着色 */
function PriceBar({ count, hi, rangeOn, center }: { count: number; hi: MotionValue<number>; rangeOn: MotionValue<number>; center: number }) {
  const lit = useTransform([rangeOn, hi], ([r, h]) => ((r as number) > 0 && center > BUDGET[0] && center < (h as number) ? (r as number) : 0));
  const height = count === 0 ? '2px' : `${(count / PRICE_PEAK) * 100}%`;

  return (
    <div className="relative flex-1 rounded-t-[2px] bg-[#E2E2D8]" style={{ height }}>
      <motion.span className="absolute inset-0 rounded-t-[2px] bg-[#FE3C01]" style={{ opacity: lit }} />
    </div>
  );
}

function DaysFilter() {
  const p = useProgress();
  const rangeOn = useRange(p, T.dayRange, [0, 1]);
  const peak = Math.max(...DAY_COUNTS);
  const lo = ((DAY_RANGE[0] + 0.5) / DAY_COUNTS.length) * 100;
  const hi = ((DAY_RANGE[1] + 0.5) / DAY_COUNTS.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-medium text-[#241E20]">天数</p>
        <motion.span className="text-xs tabular-nums text-[#625F61]" style={{ opacity: rangeOn }}>
          8–10 天
        </motion.span>
      </div>
      <div aria-hidden className="mt-2 flex h-8 items-end gap-1">
        {DAY_COUNTS.map((c, i) => (
          <DayBar key={DAY_LABELS[i]} height={`${(c / peak) * 100}%`} inRange={i >= DAY_RANGE[0] && i <= DAY_RANGE[1]} rangeOn={rangeOn} />
        ))}
      </div>
      <div aria-hidden className="relative mt-1 h-3">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E2E2D8]" />
        <motion.div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#241E20]" style={{ left: `${lo}%`, width: `${hi - lo}%`, opacity: rangeOn }} />
      </div>
      <div aria-hidden className="mt-1 flex text-xs tabular-nums text-[#828081]">
        {DAY_LABELS.map((l) => (
          <span key={l} className="flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function DayBar({ height, inRange, rangeOn }: { height: string; inRange: boolean; rangeOn: MotionValue<number> }) {
  return (
    <div className="relative flex-1 rounded-t-[2px] bg-[#E2E2D8]" style={{ height }}>
      {inRange ? <motion.span className="absolute inset-0 rounded-t-[2px] bg-[#FE3C01]" style={{ opacity: rangeOn }} /> : null}
    </div>
  );
}

/* ═════════════════════ 结果列表 ═════════════════════ */
function ResultsPanel() {
  const p = useProgress();
  const widened = useStep(p, [T.widened]) === 1;
  const caption = useFade(p, T.caption[0], T.caption[1]);
  const headerOpacity = useFade(p, T.resultCards[0] - sec(0.4), T.resultCards[0]);
  const nearOpacity = useFade(p, T.resultCards[2] + sec(0.6), T.resultCards[2] + sec(1));

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <motion.div className="flex shrink-0 items-baseline justify-between gap-2" style={{ opacity: headerOpacity }}>
        <p className="text-[13px] text-[#241E20]">
          <b className="text-base font-semibold tabular-nums">{widened ? 27 : 23}</b> 条线路符合
          <span className="text-[#828081]"> · 共 68 条</span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-[#625F61]">
          排序：匹配度
          <ChevronDownIcon className="h-3 w-3" />
        </span>
      </motion.div>
      <div className="relative h-6 shrink-0">
        <motion.p className="absolute inset-x-0 top-1 truncate text-xs text-[#625F61]" style={{ opacity: caption }}>
          筛选只决定显示哪些线路，匹配度不随滑块变化
        </motion.p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {RESULTS.map((r, i) => (
          <ResultCard key={r.title} result={r} index={i} first={i === 0} className={i === 2 ? 'hidden cq-lg:block' : ''} />
        ))}

        <motion.div className="shrink-0" style={{ opacity: nearOpacity }}>
          <p className="mb-1 text-xs font-medium text-[#625F61]">接近但不满足（3 条）</p>
          <div className="flex items-center gap-2 rounded-[10px] border border-dashed border-[#E2E2D8] px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate text-[#241E20]">河西 + 青海湖 11 日</span>
            <span className="shrink-0 text-xs font-semibold tabular-nums">89%</span>
            <span className="shrink-0 text-xs text-[#C43200]">△ 比期望多 1 天</span>
          </div>
        </motion.div>
      </div>

      <p className="shrink-0 border-t border-[#EEEDE7] pt-2 text-xs leading-relaxed text-[#625F61]">以下线路由持证旅行社提供；匹配度为信息参考，具体以旅行社报价与合同为准。</p>
    </div>
  );
}

function ResultCard({ result, index, first, className = '' }: { result: Result; index: number; first: boolean; className?: string }) {
  const p = useProgress();
  // 宽视窗按 resultCards 依次出现；窄视窗等筛选抽屉收起后再出现
  const desktopAt = T.resultCards[index];
  const mobileAt = T.mobileCards[Math.min(index, T.mobileCards.length - 1)];
  const opacityD = useFade(p, desktopAt, desktopAt + sec(0.35));
  const opacityM = useFade(p, mobileAt, mobileAt + sec(0.35));
  const y = useRange(p, [desktopAt, desktopAt + sec(0.4)], [10, 0], { easing: ease.out, rest: 0 });
  const picked = useStep(p, [T.pickClick]) === 1 && first;

  return (
    <motion.article className={`relative shrink-0 ${className}`} style={{ y }}>
      {/* 两套透明度分别给宽 / 窄视窗用，同一时间只有一套可见 */}
      <motion.div className="hidden cq-md:block" style={{ opacity: opacityD }}>
        <CardBody result={result} picked={picked} />
      </motion.div>
      <motion.div className="cq-md:hidden" style={{ opacity: opacityM }}>
        <CardBody result={result} picked={picked} />
      </motion.div>
      {first ? <TapCursor approach={T.pickCursor} clickAt={T.pickClick} hideAt={T.detailScene[1]} className="right-1/4 top-6" /> : null}
    </motion.article>
  );
}

function CardBody({ result, picked }: { result: Result; picked: boolean }) {
  return (
    <div
      className={`rounded-[12px] border bg-white p-3 transition-[border-color,box-shadow] duration-200 ${
        picked ? 'border-[#241E20] shadow-[0_0_0_3px_rgba(36,30,32,0.08)]' : 'border-[#E2E2D8]'
      }`}
    >
      <div className="flex items-start gap-3">
        <MatchRing score={result.score} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#241E20]">{result.title}</p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-[#625F61]">
            <span className="truncate">{result.agency}</span>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[#0E7A5A]">
              <CheckIcon className="h-3 w-3" />
              已认证
            </span>
            <span className="shrink-0 tabular-nums">★ {result.rating}</span>
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-xs leading-5 text-[#241E20]">
        {result.reasons.map((r) => (
          <span key={r} className="mr-2">
            <span className="text-[#0E7A5A]">✓</span> {r}
          </span>
        ))}
        <span className="whitespace-nowrap text-[#C43200]">△ {result.gap}</span>
      </p>
      <p className="mt-1 truncate text-xs">
        <b className="font-semibold tabular-nums text-[#241E20]">{result.price}</b>
        <span className="text-[#828081]"> · {result.family}</span>
      </p>
    </div>
  );
}

/** 匹配度环：上限 99%，不显示 100%（§16.6.2） */
function MatchRing({ score }: { score: number }) {
  return (
    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r="16" fill="none" stroke="#F0EFE9" strokeWidth="3.5" />
        <circle cx="20" cy="20" r="16" fill="none" stroke="#FE3C01" strokeWidth="3.5" strokeLinecap="round" pathLength={100} strokeDasharray={`${score} 100`} />
      </svg>
      <span className="relative text-xs font-semibold tabular-nums text-[#241E20]">{score}%</span>
    </span>
  );
}

/* ═════════════════════ 窄视窗：底部筛选抽屉 ═════════════════════ */
function FilterDrawer() {
  const p = useProgress();
  const y = useRange(p, [T.filterScene[0], T.filterScene[1], T.drawerOut[0], T.drawerOut[1]], [105, 0, 0, 105], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, T.filterScene[0], T.drawerOut[1]);
  const press = useRange(p, [T.drawerTap - sec(0.15), T.drawerTap, T.drawerTap + sec(0.15)], [1, 0.96, 1]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 top-2 z-20 flex flex-col rounded-t-[16px] border-t border-[#E2E2D8] bg-white shadow-[0_-16px_40px_rgba(36,30,32,0.12)] cq-md:hidden"
      style={{ y: yPct, visibility }}
    >
      <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-[#E2E2D8]" />
      <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden px-4 pt-1">
        <FilterPanel compact />
      </div>
      <div className="shrink-0 border-t border-[#EEEDE7] p-3">
        <motion.span className={`${btn.primary} relative h-10 w-full`} style={{ scale: press }}>
          查看 23 条线路
          <TapCursor approach={[T.drawerTap - sec(0.6), T.drawerTap - sec(0.05)]} clickAt={T.drawerTap} hideAt={T.drawerOut[1]} className="right-1/4 top-5" />
        </motion.span>
      </div>
    </motion.div>
  );
}
