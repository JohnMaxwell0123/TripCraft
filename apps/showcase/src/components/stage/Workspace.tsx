'use client';

import type { ComponentType } from 'react';
import { motion, useTransform } from 'framer-motion';
import { DAYS, SELF_DRIVE_ROUTE, type DayPlan, type DayTagIcon } from '@/data/trip';
import { ease, useFadeStyle, useRange, useStep } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, Toast, useProgress } from './primitives';
import { CatTile, Ring, btn } from './ui';
import { MapCanvas } from './MapCanvas';
import {
  AccessibleIcon,
  ArrowRightIcon,
  BusIcon,
  CalendarIcon,
  CarIcon,
  CheckIcon,
  CoffeeIcon,
  MoonIcon,
  MountainIcon,
  ParkingIcon,
  PlaneIcon,
  RouteIcon,
  SparklesIcon,
  SunsetIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 02 幕 · 路径 A · AI 规划自驾（docs/16 §16.5）
 *
 * 地图优先：路线在底图上按天推进，带类别的途经点（自然、景点、服务区）路线画到时落下；
 * 下方是带交通段的日程时间轴（宽视窗横排、手机是底部抽屉里的竖排），当天随线头高亮并滚到视野里。
 * 每天用图形标签写清它怎样照顾到画像（午休、台阶、车高、日落）。
 * 画完先「保存到行程空间」（04 幕里全家看到的就是它），随后底部提示同一份画像也匹配到旅行社线路，点击进入路径 B。
 */

const TAG_ICON: Record<DayTagIcon, ComponentType<IconProps>> = {
  parking: ParkingIcon,
  mountain: MountainIcon,
  bus: BusIcon,
  sunset: SunsetIcon,
  coffee: CoffeeIcon,
  accessible: AccessibleIcon,
  moon: MoonIcon,
  plane: PlaneIcon,
};

export function Workspace() {
  const p = useProgress();
  const draw = useRange(p, T.routeDraw.t, T.routeDraw.v, { easing: ease.linear });

  return (
    <Scene range={T.driveScene} label="路径 A：AI 规划的自驾草案">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4">
        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-ui-ctl bg-ui-accent/10 text-ui-accent-ink cq-sm:flex">
          <SparklesIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-ui-ink">河西走廊 9 日 · 自驾草案</h3>
          <p className="truncate text-xs leading-4 text-ui-ink-3">按需求画像生成 · 地点与开放时间经图商核验，推荐理由由 AI 撰写</p>
        </div>
        <span className={`${btn.secondary} hidden cq-md:inline-flex`}>换一个方案</span>
        <SaveButton />
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col">
        {/* 地图：宽视窗占上半部；手机铺满，下半部被日程抽屉盖住 */}
        <div className="relative min-h-0 flex-1">
          <MapCanvas
            route={SELF_DRIVE_ROUTE}
            draw={draw}
            labels={['lz', 'zy', 'jyg', 'dh', 'yd']}
            frame="left-3 right-3 top-11 bottom-[57%] cq-sm:left-4 cq-sm:right-14 cq-sm:top-12 cq-sm:bottom-3"
            controls="right-3 top-3 hidden cq-sm:flex"
            legendClass="right-2 top-2 cq-sm:top-auto cq-sm:bottom-2"
          />
          <Stats className="absolute left-3 top-3 hidden cq-sm:flex" />
          <div className="pointer-events-none absolute inset-x-4 top-3 z-30 flex justify-center">
            <Toast range={T.savedToast}>已保存到行程空间「西行计划」</Toast>
          </div>
          <MobileDaySheet />
        </div>

        <DayStrip />
        <CrossHint />
      </div>
    </Scene>
  );
}

/* ── 全程概要：天数、里程、开车天数 ── */
function Stats({ className = '' }: { className?: string }) {
  return (
    <span className={`ui-glass h-8 items-center gap-3 rounded-full px-3 text-xs text-ui-ink ${className}`}>
      <span className="inline-flex items-center gap-1.5">
        <CalendarIcon className="h-3.5 w-3.5 text-ui-ink-3" />9 天
      </span>
      <span className="inline-flex items-center gap-1.5 tabular-nums">
        <RouteIcon className="h-3.5 w-3.5 text-ui-ink-3" />
        1,980 km
      </span>
      <span className="inline-flex items-center gap-1.5">
        <CarIcon className="h-3.5 w-3.5 text-ui-ink-3" />
        开车 6 天
      </span>
    </span>
  );
}

/* ── 保存到行程空间：路径 A 的草案落进行程空间（S-C08 第 4 步） ── */
function SaveButton() {
  const p = useProgress();
  const saved = useStep(p, [T.saveClick]) === 1;
  const press = useRange(p, [T.saveClick - sec(0.12), T.saveClick, T.saveClick + sec(0.12)], [1, 0.95, 1]);
  return (
    <motion.span className={`${saved ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: press }}>
      {saved ? <CheckIcon className="h-3.5 w-3.5" /> : null}
      <span className="cq-sm:hidden">{saved ? '已保存' : '保存'}</span>
      <span className="hidden cq-sm:inline">{saved ? '已存入行程空间' : '保存到行程空间'}</span>
      <TapCursor approach={T.saveCursor} clickAt={T.saveClick} hideAt={T.saveClick + sec(0.45)} className="left-1/2 top-4" />
    </motion.span>
  );
}

/* ═════════════════════ 日程：带交通段的时间轴 ═════════════════════ */

/** 进入下一天之前的交通段：开车时长与里程；不开车的日子写「市内」 */
function Leg({ day, vertical = false }: { day: DayPlan; vertical?: boolean }) {
  const label = day.drive ? (
    <>
      <span className="font-medium text-ui-ink">{day.drive}</span>
      <span className="tabular-nums text-ui-ink-3">{day.km} km</span>
    </>
  ) : (
    <span className="text-ui-ink-3">市内</span>
  );
  if (vertical) {
    return (
      <li className="relative flex h-7 items-center gap-2 pl-[38px] text-xs">
        <span aria-hidden className="absolute bottom-0 left-[13px] top-0 w-0 border-l-2 border-dotted border-ui-line-strong" />
        {day.drive ? <CarIcon className="h-3.5 w-3.5 text-ui-ink-3" /> : null}
        {label}
      </li>
    );
  }
  return (
    <li className="flex w-[84px] shrink-0 flex-col items-center justify-center gap-1 text-xs">
      <span className="flex w-full items-center gap-1">
        <span aria-hidden className="h-0 flex-1 border-t-2 border-dotted border-ui-line-strong" />
        <span className={`flex h-6 w-6 items-center justify-center rounded-full ${day.drive ? 'bg-ui-sunken text-ui-ink-2' : 'text-ui-ink-3'}`}>
          {day.drive ? <CarIcon className="h-3.5 w-3.5" /> : <span className="h-1.5 w-1.5 rounded-full bg-ui-line-strong" />}
        </span>
        <span aria-hidden className="h-0 flex-1 border-t-2 border-dotted border-ui-line-strong" />
      </span>
      <span className="flex items-baseline gap-1 whitespace-nowrap">{label}</span>
    </li>
  );
}

/** 图形标签；compact 时只有第一个带文字，其余只留图形（卡片窄） */
function Tags({ day, compact = false, className = '' }: { day: DayPlan; compact?: boolean; className?: string }) {
  return (
    <span className={`flex min-w-0 items-center gap-2 text-xs text-ui-ink-2 ${className}`}>
      {day.tags.map((t, i) => {
        const Icon = TAG_ICON[t.icon];
        const iconOnly = compact && i > 0;
        return (
          <span key={t.text} className={`inline-flex items-center gap-1 ${iconOnly ? 'shrink-0' : 'min-w-0'}`} title={iconOnly ? t.text : undefined}>
            <Icon className="h-3.5 w-3.5 shrink-0 text-ui-ink-3" />
            {iconOnly ? null : <span className="truncate">{t.text}</span>}
          </span>
        );
      })}
    </span>
  );
}

/** 当天：随线头高亮 */
function useActiveDay() {
  const p = useProgress();
  return useStep(p, T.dayAt);
}

/** 时间轴滚动：当天移到视野里（按全局进度平滑过渡，不触发 React 渲染） */
function useFollow(unit: number, center: number) {
  const p = useProgress();
  const input: number[] = [];
  const output: number[] = [];
  T.dayAt.forEach((t, k) => {
    input.push(t, t + sec(0.35));
    output.push(k * unit + center, (k + 1) * unit + center);
  });
  return useRange(p, input, output, { rest: undefined });
}

/* ── 宽视窗：横排日程卡片 ── */
const CARD_W = 172;
const LEG_W = 84;
const STRIP_UNIT = CARD_W + LEG_W;
const STRIP_TOTAL = DAYS.length * CARD_W + (DAYS.length - 1) * LEG_W;

function DayStrip() {
  const active = useActiveDay();
  const p = useProgress();
  const center = useFollow(STRIP_UNIT, CARD_W / 2);
  // 当天卡片居中；两端不留空
  const left = useTransform(center, (c) => `clamp(calc(100% - ${STRIP_TOTAL + 16}px), calc(50% - ${c.toFixed(1)}px), 16px)`);
  const fade = useFadeStyle(p, T.daysIn[0], T.daysIn[1]);

  return (
    <motion.div className="relative hidden h-[124px] shrink-0 overflow-hidden border-t border-ui-line bg-ui-panel cq-sm:block" style={fade}>
      <motion.ol className="absolute top-3 flex items-stretch" style={{ left }}>
        {DAYS.map((day, i) => (
          <DayCardWithLeg key={day.tag} day={day} index={i} active={active === i} done={active > i} />
        ))}
      </motion.ol>
    </motion.div>
  );
}

function DayCardWithLeg({ day, index, active, done }: { day: DayPlan; index: number; active: boolean; done: boolean }) {
  return (
    <>
      {index > 0 ? <Leg day={day} /> : null}
      <li
        className={`ui-card flex h-[98px] w-[172px] shrink-0 flex-col px-3 py-2.5 transition-[border-color,box-shadow,opacity] duration-300 ${
          active ? '!border-ui-route shadow-[0_0_0_3px_rgb(var(--ui-route)/0.14)]' : done ? '' : 'opacity-60'
        }`}
      >
        <span className="flex items-center gap-2">
          <CatTile cat={day.cat} size={24} />
          <span className={`text-xs font-semibold tabular-nums ${active ? 'text-ui-accent-ink' : 'text-ui-ink'}`}>{day.tag}</span>
          <span className="text-xs tabular-nums text-ui-ink-3">{day.date.replace(/^0/, '')}</span>
        </span>
        <span className="mt-1.5 truncate text-[13px] font-semibold text-ui-ink">{day.title}</span>
        <Tags day={day} compact className="mt-1" />
      </li>
    </>
  );
}

/* ── 手机：底部抽屉里的竖排时间轴 ── */
const ROW_H = 52;
const LEG_H = 28;
const LIST_UNIT = ROW_H + LEG_H;

function MobileDaySheet() {
  const active = useActiveDay();
  const center = useFollow(LIST_UNIT, ROW_H / 2);
  const total = DAYS.length * ROW_H + (DAYS.length - 1) * LEG_H;
  const top = useTransform(center, (c) => `clamp(calc(100% - ${total}px), calc(35% - ${c.toFixed(1)}px), 0px)`);

  return (
    <div className="ui-glass absolute inset-x-0 bottom-0 top-[44%] z-10 flex flex-col rounded-t-ui-panel !border-x-0 !border-b-0 cq-sm:hidden">
      <span aria-hidden className="mx-auto mt-2 block h-1 w-9 shrink-0 rounded-full bg-ui-line-strong" />
      <div className="flex shrink-0 items-center gap-3 px-4 pb-2 pt-2.5 text-xs text-ui-ink">
        <span className="inline-flex items-center gap-1.5">
          <CalendarIcon className="h-3.5 w-3.5 text-ui-ink-3" />9 天
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <RouteIcon className="h-3.5 w-3.5 text-ui-ink-3" />
          1,980 km
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CarIcon className="h-3.5 w-3.5 text-ui-ink-3" />
          开车 6 天
        </span>
      </div>
      <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_12px,#000_calc(100%-24px),transparent)]">
        <motion.ol className="absolute inset-x-0 px-4" style={{ top }}>
          {DAYS.map((day, i) => (
            <MobileDayRow key={day.tag} day={day} index={i} active={active === i} />
          ))}
        </motion.ol>
      </div>
    </div>
  );
}

function MobileDayRow({ day, index, active }: { day: DayPlan; index: number; active: boolean }) {
  return (
    <>
      {index > 0 ? <Leg day={day} vertical /> : null}
      <li className="flex h-[52px] items-center gap-3">
        <span
          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold tabular-nums transition-colors duration-300 ${
            active ? 'bg-ui-route text-white' : 'bg-ui-sunken text-ui-ink-2'
          }`}
        >
          {index}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-baseline gap-2">
            <span className="truncate text-[13px] font-semibold text-ui-ink">{day.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-ui-ink-3">{day.date.replace(/^0/, '')}</span>
          </span>
          <Tags day={day} className="mt-0.5" />
        </span>
        <CatTile cat={day.cat} size={28} />
      </li>
    </>
  );
}

/* ── 结果页底部：同一份需求画像也匹配到旅行社线路（§16.5.2 交叉提示，带画像进入筛选页）──
 * 宽视窗：换下底部的日程条（地图不被遮挡）；手机：浮在日程抽屉底部。 */
function CrossHint() {
  const p = useProgress();
  const [a, b] = T.crossHint;
  const fade = useFadeStyle(p, a, b);
  const y = useRange(p, [a, b], [12, 0], { easing: ease.out, rest: 0 });
  const press = useRange(p, [T.crossClick - sec(0.12), T.crossClick, T.crossClick + sec(0.12)], [1, 0.96, 1]);
  const opening = useStep(p, [T.crossClick]) === 1;

  return (
    <motion.div
      className="absolute inset-x-3 bottom-3 z-20 flex justify-center cq-sm:inset-x-0 cq-sm:bottom-0 cq-sm:h-[124px] cq-sm:items-center cq-sm:border-t cq-sm:border-ui-line cq-sm:bg-ui-panel cq-sm:px-4"
      style={{ ...fade, y }}
    >
      <div className="ui-float flex w-full max-w-[520px] items-center gap-3 rounded-ui-card p-2.5 !shadow-ui-pop cq-sm:gap-4 cq-sm:p-3.5">
        <Ring value={0.91} size={44} stroke={3.5} tone="accent">
          <span className="text-xs font-semibold tabular-nums text-ui-ink">91%</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-ui-ink">
            同一份画像也匹配到 <b className="font-semibold tabular-nums">23 条</b>旅行社线路
          </p>
          <p className="mt-0.5 truncate text-xs text-ui-ink-3">其中 5 条与这份草案相似 · 最高匹配 91%</p>
        </div>
        <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
          {opening ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              套用画像…
            </>
          ) : (
            <>
              <span className="hidden cq-sm:inline">看旅行社线路</span>
              <span className="cq-sm:hidden">去看看</span>
              <ArrowRightIcon className="h-3.5 w-3.5" />
            </>
          )}
          <TapCursor approach={T.crossCursor} clickAt={T.crossClick} hideAt={T.filterScene[1]} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}
