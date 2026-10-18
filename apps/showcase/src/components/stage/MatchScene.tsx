'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, actSpan } from './timeline';
import { Pop, TapCursor, useProgress } from './primitives';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CheckIcon,
  ChevronDownIcon,
  FilmIcon,
  SparklesIcon,
  StarIcon,
} from '@/components/common/Icons';

/**
 * 03 幕 · 路径 B 旅行社线路匹配：筛选页（docs/16 §16.6–§16.7）
 *
 * 价格滑块上方是真实的柱状分布（分面计数，范围内着色，标出你的预算与市场中位）；
 * 天数滑块；条件方块带结果数，来自需求画像的方块默认选中并带 ★；
 * 结果卡带匹配度环形图、3 条理由与 1 条差距。筛选是硬过滤，匹配度不随滑块变化。
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
  fromProfile?: boolean;
}

const TILE_GROUPS: { title: string; tiles: Tile[] }[] = [
  {
    title: '人群适配',
    tiles: [
      { label: '适合长辈', count: 19, selected: true, fromProfile: true },
      { label: '适合儿童', count: 16, selected: true, fromProfile: true },
      { label: '无障碍', count: 3 },
      { label: '可带宠物', count: 0 },
    ],
  },
  {
    title: '行程节奏',
    tiles: [
      { label: '轻松', count: 23, selected: true, fromProfile: true },
      { label: '适中', count: 31 },
      { label: '紧凑', count: 25 },
    ],
  },
  {
    title: '出行方式',
    tiles: [
      { label: '自驾 · 社里订房', count: 6 },
      { label: '包车带司机', count: 9 },
      { label: '私家团', count: 11 },
      { label: '拼小团', count: 5 },
    ],
  },
];

interface Route {
  title: string;
  agency: string;
  rating: string;
  score: number;
  reasons: string[];
  gap: string;
  price: string;
  family: string;
  reel?: boolean;
}

const ROUTES: Route[] = [
  {
    title: '河西走廊 9 日 · 长辈友好私家团',
    agency: '敦煌某国际旅行社',
    rating: '4.8',
    score: 91,
    reasons: ['必去 2/2', '日均车程 3.1h', '标注适合长辈'],
    gap: '午休安排未注明',
    price: '人均 ¥6,280 起',
    family: '全家预估 ¥29,860',
    reel: true,
  },
  {
    title: '敦煌 · 张掖 8 日 · 包车带司机',
    agency: '张掖某旅行社',
    rating: '4.6',
    score: 86,
    reasons: ['必去 2/2', '7 座 MPV 带司机', '全程无高台阶'],
    gap: '鸣沙山排在午后',
    price: '人均 ¥5,460 起',
    family: '全家预估 ¥26,100',
    reel: true,
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

/* ═════════════════════ 02 → 03：路径 A 结果页底部的交叉提示（§16.5.2） ═════════════════════ */
export function PathCrossHint() {
  const p = useProgress();
  const [a, b] = T.crossHint;
  const opacity = useFade(p, a, b);
  const y = useRange(p, [a, b], [14, 0], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, T.matchIn[1] + 0.002);
  const press = useRange(p, [T.crossClick - 0.002, T.crossClick, T.crossClick + 0.002], [1, 0.97, 1]);

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-2 bottom-2 z-30 flex justify-center sm:inset-x-auto sm:bottom-3 sm:right-3"
      style={{ opacity, y, visibility }}
    >
      <motion.span
        className="relative inline-flex max-w-full items-center gap-2 rounded-[12px] border border-[#E2E2D8] bg-[#FFFFF9] px-3 py-2 text-[13px] text-[#241E20] shadow-[0_16px_40px_rgba(36,30,32,0.14)]"
        style={{ scale: press }}
      >
        <BuildingIcon className="h-4 w-4 shrink-0 text-[#FE3C01]" />
        <span className="min-w-0 truncate">
          <span className="hidden sm:inline">
            有 <b className="font-mono font-semibold">5 条</b>旅行社线路与这份方案相似，最高匹配{' '}
          </span>
          <span className="sm:hidden">5 条相似旅行社线路 · 最高匹配 </span>
          <b className="font-mono font-semibold text-[#FE3C01]">91%</b>
        </span>
        <span className="shrink-0 font-semibold">→</span>
        <TapCursor approach={T.crossCursor} clickAt={T.crossClick} hideAt={T.matchIn[1]} className="right-8 top-5" />
      </motion.span>
    </motion.div>
  );
}

/* ═════════════════════ 03 幕主体 ═════════════════════ */
export function MatchScene() {
  const p = useProgress();
  const opacity = useFade(p, T.matchIn[0], T.matchIn[1]);
  const visibility = useVisibility(p, T.matchIn[0] - 0.002, T.studioIn[1] + 0.004);

  return (
    <motion.section
      aria-label="路径 B：旅行社线路匹配与筛选"
      className="absolute inset-0 z-30 flex flex-col overflow-hidden bg-[#FAF8F5] text-left text-[#241E20] select-none"
      style={{ opacity, visibility }}
    >
      <MatchHeader />

      {/* 桌面：左筛选 + 右结果 */}
      <div className="hidden min-h-0 flex-1 gap-3 p-3 md:flex lg:gap-4 lg:p-4">
        <div className="flex w-[244px] shrink-0 flex-col overflow-hidden rounded-[12px] border border-[#E2E2D8] bg-white p-3 lg:w-[256px] xl:w-[276px]">
          <FilterPanel />
        </div>
        <ResultsPanel />
      </div>

      {/* 手机：结果列表 + 底部筛选抽屉（§16.7.7） */}
      <div className="relative min-h-0 flex-1 md:hidden">
        <div className="flex h-full flex-col p-2.5">
          <ResultsPanel mobile />
        </div>
        <FilterDrawer />
      </div>

      <AskAiToast />
    </motion.section>
  );
}

function MatchHeader() {
  return (
    <div className="flex h-11 shrink-0 items-center gap-2 border-b border-[#E2E2D8] bg-white px-3 text-xs">
      <span className="inline-flex shrink-0 items-center gap-1 text-[#625F61]">
        <ArrowLeftIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">返回对话</span>
      </span>
      <span className="h-4 w-px shrink-0 bg-[#E2E2D8]" />
      <span className="min-w-0 flex-1 truncate font-medium text-[#241E20]">
        5 人 · 1 长者 1 儿童<span className="hidden lg:inline"> · 国庆前后</span> · 8–10 天 · 河西走廊
      </span>
      <span className="hidden shrink-0 rounded-[5px] border border-[#E2E2D8] px-2 py-1 font-semibold text-[#241E20] sm:inline-flex">编辑需求</span>
      <span className="inline-flex shrink-0 items-center gap-1 rounded-[5px] bg-[#241E20] px-2 py-1 font-semibold text-[#FFFFF9]">
        <SparklesIcon className="h-3 w-3 text-[#FE3C01]" />
        问 AI
      </span>
    </div>
  );
}

/* ═════════════════════ 筛选面板：分布图滑块 + 条件方块 ═════════════════════ */
function FilterPanel({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`flex min-h-0 flex-col ${compact ? 'gap-3' : 'gap-3.5'}`}>
      <PriceFilter compact={compact} />
      <DaysFilter />
      <div className="flex flex-col gap-2.5">
        {TILE_GROUPS.slice(0, compact ? 2 : 3).map((g, gi) => (
          <div key={g.title}>
            <p className="mb-1 flex items-center justify-between text-xs font-semibold text-[#625F61]">
              {g.title}
              {gi === 0 ? (
                <span className="inline-flex items-center gap-1 font-normal text-[#828081]">
                  <StarIcon className="h-3 w-3 text-[#FE3C01]" />= 来自你的需求
                </span>
              ) : null}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {g.tiles.map((t, ti) => (
                <Pop key={t.label} at={T.tilesStart + (gi * 4 + ti) * T.tileStep} dur={T.tileStep * 2.5}>
                  <TileChip tile={t} />
                </Pop>
              ))}
            </div>
          </div>
        ))}
      </div>
      {!compact ? (
        <p className="inline-flex items-center gap-1 border-t border-[#E5E5E0] pt-2 text-xs text-[#828081]">
          <ChevronDownIcon className="h-3 w-3" />
          更多条件（8 组）
        </p>
      ) : null}
    </div>
  );
}

function TileChip({ tile }: { tile: Tile }) {
  const empty = tile.count === 0;
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-[5px] border px-2 py-1 text-xs ${
        tile.selected
          ? 'border-[#241E20] bg-[#F4F4EE] font-semibold text-[#241E20]'
          : empty
            ? 'border-dashed border-[#E2E2D8] text-[#828081]/70'
            : 'border-[#E2E2D8] bg-white text-[#625F61]'
      }`}
      title={empty ? '当前条件下没有此类线路' : undefined}
    >
      {tile.selected ? <CheckIcon className="h-3 w-3" /> : null}
      {tile.label}
      <span className="font-mono tabular-nums text-[#828081]">{tile.count}</span>
      {tile.fromProfile ? <StarIcon className="h-3 w-3 text-[#FE3C01]" /> : null}
    </span>
  );
}

/** 价格上限把手：先停在画像预算的上沿，「问 AI」后移到 ¥8,000 */
function usePriceHigh() {
  const p = useProgress();
  return useRange(p, T.budgetDrag, [BUDGET[1], 8000]);
}

function PriceFilter({ compact }: { compact: boolean }) {
  const p = useProgress();
  const hi = usePriceHigh();
  const rangeOn = useRange(p, T.priceRange, [0, 1]);
  const markers = useFade(p, T.priceRange[0] + actSpan('match', 0.03), T.priceRange[1]);
  const hiLeft = useTransform(hi, (v) => `${pricePct(v)}%`);
  const loLeft = `${pricePct(BUDGET[0])}%`;
  const fill = useTransform(hi, (v) => `${pricePct(v) - pricePct(BUDGET[0])}%`);
  const hiRef = useScrollCounter(p, BUDGET[1], 8000, T.budgetDrag[0], T.budgetDrag[1], 0, fmt);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">价格</p>
        <span className="inline-flex rounded-[5px] border border-[#E2E2D8] p-0.5 text-xs">
          <span className="rounded-[4px] bg-[#241E20] px-1.5 text-[#FFFFF9]">人均</span>
          <span className="px-1.5 text-[#828081]">全家总价</span>
        </span>
      </div>

      <p className="sr-only">价格分布：44 条线路集中在 3,000 到 4,500 元与 5,000 到 7,000 元两段，市场中位 5,800 元。</p>

      {/* 真实柱状分布（不拟合曲线）+ 市场中位虚线 */}
      <div aria-hidden className={`relative mt-6 ${compact ? 'h-12' : 'h-14'}`}>
        <div className="absolute inset-0 flex items-end gap-px">
          {PRICE_COUNTS.map((c, i) => (
            <PriceBar key={i} index={i} count={c} hi={hi} rangeOn={rangeOn} />
          ))}
        </div>
        <motion.div className="absolute -top-1 bottom-0 border-l border-dashed border-[#241E20]/50" style={{ left: `${pricePct(MEDIAN)}%`, opacity: markers }}>
          <span className="absolute bottom-full left-0 mb-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-[#625F61]">市场中位 {fmt(MEDIAN)}</span>
        </motion.div>
      </div>

      {/* 双把手滑块 */}
      <div aria-hidden className="relative mt-1.5 h-4">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E2E2D8]" />
        <motion.div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#241E20]" style={{ left: loLeft, width: fill, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: loLeft, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: hiLeft, opacity: rangeOn }} />
      </div>

      {/* 把手读数 + 「你的预算」参考（来自画像，推断项） */}
      <motion.div className="mt-1 flex items-center justify-between font-mono text-xs tabular-nums" style={{ opacity: rangeOn }}>
        <span className="rounded-[5px] border border-[#E2E2D8] bg-white px-1.5 py-0.5">{fmt(BUDGET[0])}</span>
        <span className="text-[#828081]">—</span>
        <span className="rounded-[5px] border border-[#E2E2D8] bg-white px-1.5 py-0.5">
          <span ref={hiRef}>{fmt(BUDGET[1])}</span>
        </span>
      </motion.div>
      <motion.p className="mt-1 flex items-center gap-1 text-xs text-[#FE3C01]" style={{ opacity: markers }}>
        <span aria-hidden>▲</span>
        你的预算 {fmt(BUDGET[0])}–{fmt(BUDGET[1]).slice(1)}
        <span className="text-[#828081]">（画像推断）</span>
      </motion.p>
    </div>
  );
}

function PriceBar({ index, count, hi, rangeOn }: { index: number; count: number; hi: MotionValue<number>; rangeOn: MotionValue<number> }) {
  const p = useProgress();
  const [a, b] = T.priceBars;
  const at = a + ((b - a) * index) / PRICE_COUNTS.length;
  const grow = useRange(p, [at, at + (b - a) * 0.3], [0, 1], { easing: ease.out });
  const center = PRICE_MIN + index * PRICE_BIN + PRICE_BIN / 2;
  const lit = useTransform([rangeOn, hi], ([r, h]) => ((r as number) > 0 && center > BUDGET[0] && center < (h as number) ? (r as number) : 0));
  const height = count === 0 ? '2px' : `${(count / PRICE_PEAK) * 100}%`;

  return (
    <motion.div className="relative flex-1 origin-bottom rounded-t-[2px] bg-[#E2E2D8]" style={{ height, scaleY: grow }}>
      <motion.span className="absolute inset-0 rounded-t-[2px] bg-[#FE3C01]" style={{ opacity: lit }} />
    </motion.div>
  );
}

function DaysFilter() {
  const p = useProgress();
  const rangeOn = useRange(p, [T.dayBars[1] - actSpan('match', 0.04), T.dayBars[1]], [0, 1]);
  const peak = Math.max(...DAY_COUNTS);
  const lo = ((DAY_RANGE[0] + 0.5) / DAY_COUNTS.length) * 100;
  const hi = ((DAY_RANGE[1] + 0.5) / DAY_COUNTS.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold">天数</p>
        <motion.span className="font-mono text-xs text-[#625F61]" style={{ opacity: rangeOn }}>
          8–10 天
        </motion.span>
      </div>
      <div aria-hidden className="mt-1.5 flex h-8 items-end gap-1">
        {DAY_COUNTS.map((c, i) => (
          <DayBar key={DAY_LABELS[i]} index={i} height={`${(c / peak) * 100}%`} inRange={i >= DAY_RANGE[0] && i <= DAY_RANGE[1]} rangeOn={rangeOn} />
        ))}
      </div>
      <div aria-hidden className="relative mt-1 h-3">
        <div className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#E2E2D8]" />
        <motion.div className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-[#241E20]" style={{ left: `${lo}%`, width: `${hi - lo}%`, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: `${lo}%`, opacity: rangeOn }} />
        <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#241E20] bg-white" style={{ left: `${hi}%`, opacity: rangeOn }} />
      </div>
      <div aria-hidden className="mt-0.5 flex font-mono text-xs text-[#828081]">
        {DAY_LABELS.map((l) => (
          <span key={l} className="flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

function DayBar({ index, height, inRange, rangeOn }: { index: number; height: string; inRange: boolean; rangeOn: MotionValue<number> }) {
  const p = useProgress();
  const [a, b] = T.dayBars;
  const at = a + ((b - a) * index) / DAY_COUNTS.length;
  const grow = useRange(p, [at, at + (b - a) * 0.35], [0, 1], { easing: ease.out });
  return (
    <motion.div className="relative flex-1 origin-bottom rounded-t-[2px] bg-[#E2E2D8]" style={{ height, scaleY: grow }}>
      {inRange ? <motion.span className="absolute inset-0 rounded-t-[2px] bg-[#FE3C01]" style={{ opacity: rangeOn }} /> : null}
    </motion.div>
  );
}

/* ═════════════════════ 结果列表 ═════════════════════ */
function ResultsPanel({ mobile = false }: { mobile?: boolean }) {
  const p = useProgress();
  const widened = useStep(p, [T.budgetDrag[1] - actSpan('match', 0.01)]) === 1;
  const caption = useFade(p, T.budgetDrag[1], T.budgetDrag[1] + actSpan('match', 0.03));
  const times = mobile ? T.mobileCards : T.resultCards;
  const nearAt: readonly [number, number] = mobile
    ? [T.mobileCards[2] + actSpan('match', 0.04), T.mobileCards[2] + actSpan('match', 0.08)]
    : T.nearMiss;
  const nearOpacity = useFade(p, nearAt[0], nearAt[1]);
  const headerOpacity = useFade(p, times[0] - actSpan('match', 0.04), times[0]);

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <motion.div className="flex shrink-0 items-baseline justify-between gap-2 pb-1" style={{ opacity: headerOpacity }}>
        <p className="text-[13px]">
          <b className="font-mono text-base tabular-nums text-[#241E20]">{widened ? 27 : 23}</b> 条线路符合
          <span className="text-[#828081]"> · 共 68 条</span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-[#625F61]">
          排序：匹配度
          <ChevronDownIcon className="h-3 w-3" />
        </span>
      </motion.div>
      <motion.p className="shrink-0 pb-1.5 text-xs text-[#625F61]" style={{ opacity: caption }}>
        筛选只决定显示哪些线路，匹配度不随滑块变化
      </motion.p>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {ROUTES.map((r, i) => (
          <ResultCard key={r.title} route={r} at={times[i]} mobile={mobile} first={i === 0} className={i === 2 ? 'hidden xl:block' : ''} />
        ))}

        <motion.div className="shrink-0" style={{ opacity: nearOpacity }}>
          <p className="mb-1 text-xs font-semibold text-[#625F61]">接近但不满足（3 条）</p>
          <div className="flex items-center gap-2 rounded-[12px] border border-dashed border-[#E2E2D8] bg-white px-3 py-2 text-[13px]">
            <span className="min-w-0 flex-1 truncate font-medium">河西 + 青海湖 10 日</span>
            <span className="shrink-0 font-mono text-xs font-semibold">89%</span>
            <span className="shrink-0 text-xs text-[#C43200]">△ 比价格上限高 8%</span>
          </div>
        </motion.div>
      </div>

      <p className="shrink-0 border-t border-[#E5E5E0] pt-2 text-xs leading-relaxed text-[#625F61]">
        以下线路由持证旅行社提供；匹配度为信息参考，具体以旅行社报价与合同为准。
      </p>
    </div>
  );
}

function ResultCard({ route, at, mobile, first, className = '' }: { route: Route; at: number; mobile: boolean; first: boolean; className?: string }) {
  const p = useProgress();
  const opacity = useFade(p, at, at + actSpan('match', 0.04));
  const y = useRange(p, [at, at + actSpan('match', 0.05)], [16, 0], { easing: ease.out, rest: 0 });
  const picked = useStep(p, [T.pickClick]) === 1 && first;

  return (
    <motion.article
      className={`relative shrink-0 rounded-[12px] border bg-white p-2.5 transition-colors duration-200 ${
        picked ? 'border-[#FE3C01] shadow-[0_0_0_3px_rgba(254,60,1,0.12)]' : 'border-[#E2E2D8]'
      } ${className}`}
      style={{ opacity, y }}
    >
      <div className="flex items-start gap-2.5">
        <MatchRing score={route.score} at={at + actSpan('match', 0.02)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold">{route.title}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[#625F61]">
            <span className="truncate">{route.agency}</span>
            <span className="inline-flex shrink-0 items-center gap-0.5 text-[#0E8A5F]">
              <CheckIcon className="h-3 w-3" />
              已认证
            </span>
            <span className="shrink-0 font-mono">★{route.rating}</span>
          </p>
        </div>
      </div>

      <ul className="mt-1.5 flex flex-wrap gap-x-2 gap-y-0.5 text-xs">
        {route.reasons.map((r) => (
          <li key={r} className="text-[#241E20]">
            <span className="text-[#0E8A5F]">✓</span> {r}
          </li>
        ))}
        <li className="text-[#C43200]">△ {route.gap}</li>
      </ul>

      <div className="mt-1.5 flex items-center justify-between gap-2 text-xs">
        <span className="min-w-0 truncate">
          <b className="font-mono font-semibold">{route.price}</b>
          <span className="text-[#828081]"> · {route.family}</span>
        </span>
        {route.reel && !mobile ? (
          <span className="hidden shrink-0 items-center gap-1 rounded-full border border-[#E2E2D8] px-2 py-0 text-[#625F61] xl:inline-flex">
            <FilmIcon className="h-3 w-3" />
            路线动画 · AI 路书
          </span>
        ) : null}
      </div>

      {first ? <TapCursor approach={T.pickCursor} clickAt={T.pickClick} hideAt={T.studioIn[1]} className="right-1/4 top-3" /> : null}
    </motion.article>
  );
}

/** 匹配度环形图：上限 99%，不显示 100%（§16.6.2） */
function MatchRing({ score, at }: { score: number; at: number }) {
  const p = useProgress();
  const draw = useRange(p, [at, at + T.ringDur], [0, score / 100], { easing: ease.out });
  const ref = useScrollCounter(p, 0, score, at, at + T.ringDur);
  return (
    <span className="relative flex h-11 w-11 shrink-0 items-center justify-center">
      <svg viewBox="0 0 44 44" className="absolute inset-0 -rotate-90">
        <circle cx="22" cy="22" r="18" fill="none" stroke="#F4F4EE" strokeWidth="4" />
        <motion.circle cx="22" cy="22" r="18" fill="none" stroke="#FE3C01" strokeWidth="4" strokeLinecap="round" style={{ pathLength: draw }} />
      </svg>
      <span className="relative font-mono text-xs font-bold tabular-nums">
        <span ref={ref}>{score}</span>%
      </span>
    </span>
  );
}

/* ═════════════════════ 手机：底部筛选抽屉 ═════════════════════ */
function FilterDrawer() {
  const p = useProgress();
  const inSpan = actSpan('match', 0.04);
  const y = useRange(p, [T.matchIn[0], T.matchIn[0] + inSpan, T.drawerOut[0], T.drawerOut[1]], [105, 0, 0, 105], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, T.matchIn[0], T.drawerOut[1]);
  const widened = useStep(p, [T.budgetDrag[1] - actSpan('match', 0.01)]) === 1;
  const press = useRange(p, [T.drawerTap - actSpan('match', 0.01), T.drawerTap, T.drawerTap + actSpan('match', 0.01)], [1, 0.96, 1]);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 top-1 z-20 flex flex-col rounded-t-[16px] border-t border-[#E2E2D8] bg-[#FFFFF9] shadow-[0_-16px_40px_rgba(36,30,32,0.12)]"
      style={{ y: yPct, visibility }}
    >
      <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-[#E2E2D8]" />
      <div className="min-h-0 flex-1 overflow-hidden px-3 pt-2">
        <FilterPanel compact />
      </div>
      <div className="shrink-0 border-t border-[#E5E5E0] p-2.5">
        <motion.span className="relative flex h-10 items-center justify-center rounded-[5px] bg-[#241E20] text-[13px] font-semibold text-[#FFFFF9]" style={{ scale: press }}>
          查看 <span className="mx-1 font-mono tabular-nums text-[#FE3C01]">{widened ? 27 : 23}</span> 条线路
          <TapCursor approach={[T.drawerTap - actSpan('match', 0.05), T.drawerTap - actSpan('match', 0.005)]} clickAt={T.drawerTap} hideAt={T.drawerOut[1]} className="right-1/4 top-5" />
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 与对话的双向联动（§16.7.4） ═════════════════════ */
function AskAiToast() {
  const p = useProgress();
  const [a, b, c, d] = T.askAi;
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [-12, 0, 0, -8], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);

  return (
    <motion.div
      role="status"
      className="pointer-events-none absolute inset-x-3 bottom-[68px] z-30 md:inset-x-auto md:bottom-14 md:right-5 md:w-[300px]"
      style={{ opacity, y, visibility }}
    >
      <div className="rounded-[12px] border border-[#E2E2D8] bg-white p-2.5 text-[13px] shadow-[0_16px_40px_rgba(36,30,32,0.14)]">
        <p className="text-xs text-[#625F61]">你对 AI 说：「预算可以到 8000」</p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-medium">已按你的话调整：人均 ≤ ¥8,000</span>
          <span className="shrink-0 rounded-[5px] border border-[#E2E2D8] px-2 py-0.5 text-xs font-semibold">撤销</span>
        </div>
      </div>
    </motion.div>
  );
}
