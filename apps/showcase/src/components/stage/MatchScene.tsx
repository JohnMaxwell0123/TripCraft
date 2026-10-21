'use client';

import type { ComponentType } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { LISTING_COVERS, type TripSummary } from '@/data/trip';
import { ease, useFade, useFadeStyle, useFadeVisibility, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { Ring, Segmented, btn } from './ui';
import { RouteGlyph } from './RouteGlyph';
import {
  AccessibleIcon,
  CalendarIcon,
  CheckIcon,
  ChevronDownIcon,
  ElderIcon,
  PaceIcon,
  PawIcon,
  PersonGlyph,
  ShieldCheckIcon,
  SlidersIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 03 幕（上）· 路径 B 旅行社线路筛选页（docs/16 §16.6–§16.7）
 *
 * 从路径 A 的「看旅行社线路」进来，页面先「套用需求画像」：标题下的一排胶囊就是画像里的条件；
 * 分布图一开始就在，画像里的预算区间与天数范围随后着色，来自画像的条件方块依次选中并带 ★。
 * 结果卡：线路封面（用线路自己的路线形状画成）、匹配度环、旅行社与认证、3 条理由与 1 条差距、人均起价与全家预估。
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
  Icon: ComponentType<IconProps>;
  selected?: boolean;
}

const AUDIENCE: Tile[] = [
  { label: '长辈', count: 19, Icon: ElderIcon, selected: true },
  { label: '儿童', count: 16, Icon: (props) => <PersonGlyph kind="child" {...props} />, selected: true },
  { label: '无障碍', count: 3, Icon: AccessibleIcon },
  { label: '带宠物', count: 0, Icon: PawIcon },
];

const PACE: Tile[] = [
  { label: '轻松', count: 23, Icon: (props) => <PaceIcon level={1} {...props} />, selected: true },
  { label: '适中', count: 31, Icon: (props) => <PaceIcon level={2} {...props} /> },
  { label: '紧凑', count: 25, Icon: (props) => <PaceIcon level={3} {...props} /> },
];

/** 来自画像的方块按这个顺序依次选中（长辈 → 儿童 → 轻松） */
const PROFILE_TILES = [...AUDIENCE, ...PACE].filter((t) => t.selected).map((t) => t.label);

interface Result {
  cover: TripSummary;
  title: string;
  agency: string;
  rating: string;
  score: number;
  reasons: string[];
  gap: string;
  price: number;
  family: string;
}

export const RESULTS: Result[] = [
  {
    cover: LISTING_COVERS.elder,
    title: '河西走廊 9 日 · 长辈友好私家团',
    agency: '敦煌某国际旅行社',
    rating: '4.8',
    score: 91,
    reasons: ['必去 2/2', '日均车程 3.1 小时', '标注适合长辈'],
    gap: '最长一天车程 6 小时',
    price: 6280,
    family: '全家预估 ¥29,500',
  },
  {
    cover: LISTING_COVERS.charter,
    title: '敦煌 · 张掖 8 日 · 包车带司机',
    agency: '张掖某旅行社',
    rating: '4.6',
    score: 86,
    reasons: ['必去 2/2', '7 座 MPV 带司机', '全程无高台阶'],
    gap: '鸣沙山排在午后',
    price: 5460,
    family: '全家预估 ¥25,700',
  },
  {
    cover: LISTING_COVERS.family,
    title: '河西走廊 10 日 · 亲子慢游小团',
    agency: '兰州某旅行社',
    rating: '4.7',
    score: 82,
    reasons: ['节奏轻松', '标注适合儿童', '含莫高窟'],
    gap: '拼小团 ≤ 8 人',
    price: 5180,
    family: '全家预估 ¥24,320',
  },
];

export function MatchScene() {
  return (
    <Scene range={T.filterScene} label="路径 B：旅行社线路筛选">
      <header className="flex h-14 shrink-0 items-center gap-3 px-4">
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ui-ink">旅行社线路</h3>
        <span className={`${btn.secondary} hidden cq-md:inline-flex`}>编辑需求</span>
        <AskAiButton />
      </header>
      <ProfileBar />

      <div className="relative flex min-h-0 flex-1 border-t border-ui-line">
        {/* 宽视窗：左侧常驻筛选面板 */}
        <aside className="hidden w-[252px] shrink-0 flex-col gap-4 overflow-hidden border-r border-ui-line p-4 cq-md:flex">
          <FilterPanel />
        </aside>
        <section className="flex min-w-0 flex-1 flex-col bg-ui-sunken/60 p-3 cq-sm:p-4">
          <ResultsPanel />
        </section>

        {/* 窄视窗：筛选面板收进底部抽屉（§16.7.7） */}
        <FilterDrawer />
        <AskAiPopover />
      </div>
    </Scene>
  );
}

/* ── 已套用的需求画像：画像里的条件变成一排胶囊 ── */
function ProfileBar() {
  return (
    <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-hidden whitespace-nowrap px-4 pb-2">
      <span className="ui-chip !bg-ui-accent/10 font-medium !text-ui-accent-ink">
        <SparklesIcon className="h-3.5 w-3.5" />
        已套用需求画像
      </span>
      <span className="ui-chip">
        <UsersIcon className="h-3.5 w-3.5 text-ui-ink-3" />5 人 · 1 长者 1 儿童
      </span>
      <span className="ui-chip">
        <CalendarIcon className="h-3.5 w-3.5 text-ui-ink-3" />
        国庆前后 · 8–10 天
      </span>
      <span className="ui-chip hidden cq-lg:inline-flex">少走台阶 · 13:00 午休</span>
    </div>
  );
}

/* ═════════════════════ 「问 AI」：与对话双向联动（§16.7.4） ═════════════════════ */
function AskAiButton() {
  const p = useProgress();
  const press = useRange(p, [T.askClick - 0.003, T.askClick, T.askClick + 0.003], [1, 0.94, 1]);
  return (
    <motion.span className={`${btn.secondary} relative`} style={{ scale: press }}>
      <SparklesIcon className="h-3.5 w-3.5 text-ui-accent" />
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
  const reply = useFadeStyle(p, T.askReply, T.askReply + sec(0.3));

  return (
    <motion.div
      role="status"
      className="ui-float absolute bottom-4 right-4 z-40 w-[min(300px,calc(100%-2rem))] rounded-ui-card p-3 !shadow-ui-pop"
      style={{ opacity, y, visibility }}
    >
      <p className="ml-auto w-fit rounded-[16px] rounded-br-[6px] bg-ui-bubble-user px-3 py-1.5 text-[13px] text-ui-on-bubble-user">预算可以到 8000</p>
      <motion.div className="mt-2.5 flex items-center gap-2" style={reply}>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#241E20] text-xs font-bold text-[#FFFFF9]">旅</span>
        <p className="min-w-0 flex-1 text-[13px] text-ui-ink">
          已调整：人均 ≤ <b className="font-semibold tabular-nums">¥8,000</b>
        </p>
        <span className="shrink-0 text-xs font-medium text-ui-ink-2 underline underline-offset-2">撤销</span>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 筛选面板：分布图滑块 + 条件方块 ═════════════════════ */
function FilterPanel({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const fromProfile = useFadeStyle(p, T.tilesStart - sec(0.2), T.tilesStart);
  return (
    <>
      <PriceFilter />
      {compact ? null : <DaysFilter />}
      <div>
        <p className="mb-2 flex items-center justify-between text-xs font-medium text-ui-ink-2">
          适合人群
          <motion.span className="inline-flex items-center gap-1 font-normal text-ui-ink-3" style={fromProfile}>
            <StarIcon className="h-3 w-3 text-ui-accent" />
            来自你的需求
          </motion.span>
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {AUDIENCE.map((t) => (
            <TileCard key={t.label} tile={t} />
          ))}
        </div>
      </div>
      {compact ? (
        <p className="inline-flex items-center gap-1 text-xs text-ui-ink-3">
          <ChevronDownIcon className="h-3 w-3" />
          更多条件：行程节奏、出行方式等 6 组
        </p>
      ) : (
        <div>
          <p className="mb-2 text-xs font-medium text-ui-ink-2">行程节奏</p>
          <div className="grid grid-cols-3 gap-1.5">
            {PACE.map((t) => (
              <TileCard key={t.label} tile={t} inline />
            ))}
          </div>
        </div>
      )}
    </>
  );
}

/** 条件方块：图形 + 名称 + 数量；来自画像的方块在套用画像的那一刻选中并带 ★ */
function TileCard({ tile, inline = false }: { tile: Tile; inline?: boolean }) {
  const p = useProgress();
  const order = PROFILE_TILES.indexOf(tile.label);
  const on = useStep(p, [order >= 0 ? T.tilesStart + order * T.tileStep : 2]) === 1;
  const empty = tile.count === 0;
  return (
    <span
      className={`relative flex items-center justify-center rounded-ui-ctl border text-xs transition-colors duration-200 ${inline ? 'h-9 gap-1.5' : 'h-[52px] flex-col gap-1'} ${
        on ? 'border-ui-ink bg-ui-sunken font-medium text-ui-ink' : empty ? 'border-dashed border-ui-line-strong text-ui-ink-3' : 'border-ui-line bg-ui-surface text-ui-ink-2'
      }`}
    >
      <tile.Icon className={`h-[18px] w-[18px] ${on ? 'text-ui-ink' : 'text-ui-ink-3'}`} />
      <span className="flex items-center gap-1 leading-none">
        {tile.label}
        <span className="tabular-nums text-ui-ink-3">{tile.count}</span>
      </span>
      {on ? <StarIcon className={`absolute h-3 w-3 text-ui-accent ${inline ? '-right-1 -top-1' : 'right-1 top-1'}`} /> : null}
    </span>
  );
}

function PriceFilter() {
  const p = useProgress();
  const hi = useRange(p, T.budgetDrag, [BUDGET[1], 8000]);
  const rangeOn = useRange(p, T.priceRange, [0, 1]);
  const rangeVisibility = useFadeVisibility(rangeOn);
  const markers = useFadeStyle(p, T.priceRange[0] + sec(0.4), T.priceRange[1] + sec(0.3));
  const hiLeft = useTransform(hi, (v) => `${pricePct(v)}%`);
  const loLeft = `${pricePct(BUDGET[0])}%`;
  const fill = useTransform(hi, (v) => `${pricePct(v) - pricePct(BUDGET[0])}%`);
  const hiRef = useScrollCounter(p, BUDGET[1], 8000, T.budgetDrag[0], T.budgetDrag[1], 0, fmt, ease.smooth);

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ui-ink">价格</p>
        <Segmented options={['人均', '全家']} active={0} />
      </div>

      {/* 真实柱状分布（不拟合曲线）+ 市场中位虚线 */}
      <div aria-hidden className="relative mt-6 h-14">
        <div className="absolute inset-0 flex items-end gap-px">
          {PRICE_COUNTS.map((c, i) => (
            <PriceBar key={i} count={c} hi={hi} rangeOn={rangeOn} center={PRICE_MIN + i * PRICE_BIN + PRICE_BIN / 2} />
          ))}
        </div>
        <motion.div className="absolute -top-1 bottom-0 border-l border-dashed border-ui-ink/50" style={{ left: `${pricePct(MEDIAN)}%`, ...markers }}>
          <span className="absolute bottom-full left-0 mb-1 -translate-x-1/2 whitespace-nowrap text-xs text-ui-ink-2">市场中位 {fmt(MEDIAN)}</span>
        </motion.div>
      </div>

      {/* 双把手滑块 */}
      <div aria-hidden className="relative mt-2 h-4">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ui-line" />
        <motion.div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ui-ink" style={{ left: loLeft, width: fill, opacity: rangeOn, visibility: rangeVisibility }} />
        <Handle left={loLeft} opacity={rangeOn} />
        <Handle left={hiLeft} opacity={rangeOn} />
      </div>

      <motion.div className="mt-2 flex items-center justify-between text-xs tabular-nums text-ui-ink" style={{ opacity: rangeOn, visibility: rangeVisibility }}>
        <span className="rounded-ui-ctl bg-ui-sunken px-2 py-1">{fmt(BUDGET[0])}</span>
        <span className="text-ui-ink-3">—</span>
        <span className="rounded-ui-ctl bg-ui-sunken px-2 py-1">
          <span ref={hiRef}>{fmt(BUDGET[1])}</span>
        </span>
      </motion.div>
      <motion.p className="mt-2 text-xs text-ui-accent-ink" style={markers}>
        ▲ 你的预算 {fmt(BUDGET[0])}–{fmt(BUDGET[1]).slice(1)}
        <span className="text-ui-ink-3"> · 画像推断</span>
      </motion.p>
    </div>
  );
}

function Handle({ left, opacity }: { left: string | MotionValue<string>; opacity: MotionValue<number> }) {
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.span
      className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ui-ink bg-ui-surface shadow-ui-card"
      style={{ left, opacity, visibility }}
    />
  );
}

/** 分布图的柱子随页面一起出现（市场行情与画像无关）；画像里的预算区间随后着色 */
function PriceBar({ count, hi, rangeOn, center }: { count: number; hi: MotionValue<number>; rangeOn: MotionValue<number>; center: number }) {
  const lit = useTransform([rangeOn, hi], ([r, h]) => ((r as number) > 0 && center > BUDGET[0] && center < (h as number) ? (r as number) : 0));
  const litVisibility = useFadeVisibility(lit);
  const height = count === 0 ? '2px' : `${(count / PRICE_PEAK) * 100}%`;

  return (
    <div className="relative flex-1 rounded-t-[3px] bg-ui-line" style={{ height }}>
      <motion.span className="absolute inset-0 rounded-t-[3px] bg-ui-accent" style={{ opacity: lit, visibility: litVisibility }} />
    </div>
  );
}

function DaysFilter() {
  const p = useProgress();
  const rangeOn = useRange(p, T.dayRange, [0, 1]);
  const rangeVisibility = useFadeVisibility(rangeOn);
  const peak = Math.max(...DAY_COUNTS);
  const lo = ((DAY_RANGE[0] + 0.5) / DAY_COUNTS.length) * 100;
  const hi = ((DAY_RANGE[1] + 0.5) / DAY_COUNTS.length) * 100;

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ui-ink">天数</p>
        <motion.span className="text-xs tabular-nums text-ui-ink-2" style={{ opacity: rangeOn, visibility: rangeVisibility }}>
          8–10 天
        </motion.span>
      </div>
      <div aria-hidden className="mt-2 flex h-8 items-end gap-1">
        {DAY_COUNTS.map((c, i) => (
          <DayBar key={DAY_LABELS[i]} height={`${(c / peak) * 100}%`} inRange={i >= DAY_RANGE[0] && i <= DAY_RANGE[1]} rangeOn={rangeOn} />
        ))}
      </div>
      <div aria-hidden className="relative mt-1 h-3">
        <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ui-line" />
        <motion.div className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-ui-ink" style={{ left: `${lo}%`, width: `${hi - lo}%`, opacity: rangeOn, visibility: rangeVisibility }} />
      </div>
      <div aria-hidden className="mt-1 flex text-xs tabular-nums text-ui-ink-3">
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
  const visibility = useFadeVisibility(rangeOn);
  return (
    <div className="relative flex-1 rounded-t-[3px] bg-ui-line" style={{ height }}>
      {inRange ? <motion.span className="absolute inset-0 rounded-t-[3px] bg-ui-accent" style={{ opacity: rangeOn, visibility }} /> : null}
    </div>
  );
}

/* ═════════════════════ 结果列表 ═════════════════════ */
function ResultsPanel() {
  const p = useProgress();
  const widened = useStep(p, [T.widened]) === 1;
  const caption = useFadeStyle(p, T.caption[0], T.caption[1]);
  const header = useFadeStyle(p, T.resultCards[0] - sec(0.4), T.resultCards[0]);
  const near = useFadeStyle(p, T.resultCards[2] + sec(0.6), T.resultCards[2] + sec(1));

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      <motion.div className="flex shrink-0 items-baseline justify-between gap-2" style={header}>
        <p className="text-[13px] text-ui-ink">
          <b className="text-base font-semibold tabular-nums">{widened ? 27 : 23}</b> 条线路符合
          <span className="text-ui-ink-3"> · 共 68 条</span>
        </p>
        <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ui-ink-2">
          <SlidersIcon className="h-3.5 w-3.5" />
          按匹配度
        </span>
      </motion.div>
      <div className="relative h-6 shrink-0">
        <motion.p className="absolute inset-x-0 top-1 truncate text-xs text-ui-ink-2" style={caption}>
          筛选只决定显示哪些线路，匹配度不随滑块变化
        </motion.p>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden">
        {RESULTS.map((r, i) => (
          <ResultCard key={r.title} result={r} index={i} first={i === 0} className={i === 2 ? 'hidden cq-lg:block' : ''} />
        ))}

        <motion.div className="shrink-0" style={near}>
          <p className="mb-1 text-xs font-medium text-ui-ink-2">接近但不满足（3 条）</p>
          <div className="flex items-center gap-2.5 rounded-ui-card border border-dashed border-ui-line-strong bg-ui-surface/60 px-2.5 py-2 text-[13px]">
            <RouteGlyph trip={LISTING_COVERS.qinghai} className="h-7 w-7 shrink-0 rounded-[7px]" />
            <span className="min-w-0 flex-1 truncate text-ui-ink">河西 + 青海湖 11 日</span>
            <span className="shrink-0 text-xs font-semibold tabular-nums text-ui-ink">89%</span>
            <span className="shrink-0 text-xs text-ui-signal-ink">△ 比期望多 1 天</span>
          </div>
        </motion.div>
      </div>

      <p className="flex shrink-0 items-start gap-1.5 border-t border-ui-line pt-2 text-xs leading-relaxed text-ui-ink-2">
        <ShieldCheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ui-success" />
        以下线路由持证旅行社提供；匹配度为信息参考，具体以旅行社报价与合同为准。
      </p>
    </div>
  );
}

function ResultCard({ result, index, first, className = '' }: { result: Result; index: number; first: boolean; className?: string }) {
  const p = useProgress();
  // 宽视窗按 resultCards 依次出现；窄视窗等筛选抽屉收起后再出现
  const desktopAt = T.resultCards[index];
  const mobileAt = T.mobileCards[Math.min(index, T.mobileCards.length - 1)];
  const desktop = useFadeStyle(p, desktopAt, desktopAt + sec(0.35));
  const mobile = useFadeStyle(p, mobileAt, mobileAt + sec(0.35));
  const y = useRange(p, [desktopAt, desktopAt + sec(0.4)], [10, 0], { easing: ease.out, rest: 0 });
  const ring = useRange(p, [desktopAt, desktopAt + T.ringDur], [0, result.score / 100], { easing: ease.out });
  const picked = useStep(p, [T.pickClick]) === 1 && first;

  return (
    <motion.article className={`relative shrink-0 ${className}`} style={{ y }}>
      {/* 两套透明度分别给宽 / 窄视窗用，同一时间只有一套可见 */}
      <motion.div className="hidden cq-md:block" style={desktop}>
        <CardBody result={result} picked={picked} ring={ring} />
      </motion.div>
      <motion.div className="cq-md:hidden" style={mobile}>
        <CardBody result={result} picked={picked} ring={result.score / 100} />
      </motion.div>
      {first ? <TapCursor approach={T.pickCursor} clickAt={T.pickClick} hideAt={T.detailScene[1]} className="right-1/4 top-8" /> : null}
    </motion.article>
  );
}

function CardBody({ result, picked, ring }: { result: Result; picked: boolean; ring: number | MotionValue<number> }) {
  return (
    <div
      className={`ui-card flex gap-3 p-2.5 transition-[border-color,box-shadow] duration-200 ${
        picked ? '!border-ui-ink shadow-[0_0_0_3px_rgb(var(--ui-ink)/0.08)]' : ''
      }`}
    >
      <span className="relative shrink-0">
        <RouteGlyph trip={result.cover} className="h-16 w-16 rounded-[10px] cq-sm:h-[76px] cq-sm:w-[76px]" />
        <span className="absolute bottom-1 left-1 rounded-full bg-black/30 px-1.5 text-xs leading-5 text-white">示意</span>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold leading-5 text-ui-ink">{result.title}</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-xs text-ui-ink-2">
              <span className="truncate">{result.agency}</span>
              <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-ui-success" />
              <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums">
                <StarIcon className="h-3 w-3 fill-ui-ink text-ui-ink" />
                {result.rating}
              </span>
            </p>
          </div>
          <Ring value={ring} size={38} stroke={3.5}>
            <span className="text-xs font-semibold tabular-nums text-ui-ink">{result.score}</span>
          </Ring>
        </div>
        <p className="mt-1.5 flex min-w-0 items-center gap-2 overflow-hidden whitespace-nowrap text-xs text-ui-ink">
          {result.reasons.map((r, i) => (
            <span key={r} className={`shrink-0 items-center gap-0.5 ${i === 2 ? 'hidden cq-sm:inline-flex' : 'inline-flex'}`}>
              <CheckIcon className="h-3 w-3 text-ui-success" />
              {r}
            </span>
          ))}
        </p>
        <p className="mt-1 flex items-baseline justify-between gap-2 text-xs">
          <span className="truncate text-ui-signal-ink">△ {result.gap}</span>
          <span className="shrink-0 text-ui-ink-3">
            <b className="text-[13px] font-semibold tabular-nums text-ui-ink">{fmt(result.price)}</b> 起 / 人
          </span>
        </p>
      </div>
    </div>
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
    <motion.div className="ui-float absolute inset-x-0 bottom-0 top-2 z-20 flex flex-col rounded-t-ui-panel !border-x-0 !border-b-0 cq-md:hidden" style={{ y: yPct, visibility }}>
      <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-ui-line-strong" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pt-2">
        <FilterPanel compact />
      </div>
      <div className="shrink-0 border-t border-ui-line p-3">
        <motion.span className={`${btn.primary} relative h-10 w-full`} style={{ scale: press }}>
          查看 23 条线路
          <TapCursor approach={[T.drawerTap - sec(0.6), T.drawerTap - sec(0.05)]} clickAt={T.drawerTap} hideAt={T.drawerOut[1]} className="right-1/4 top-5" />
        </motion.span>
      </div>
    </motion.div>
  );
}
