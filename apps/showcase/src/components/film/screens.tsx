'use client';

import type { CSSProperties, ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ease } from '@/lib/motion';
import { DAYS, SELF_DRIVE_ROUTE, TRIPS } from '@/data/trip';
import { Avatar } from '@/components/stage/primitives';
import { Badge, CatMark, CatTile, type PlaceCategory } from '@/components/stage/ui';
import { RouteGlyph } from '@/components/stage/RouteGlyph';
import { MapCanvas } from '@/components/stage/MapCanvas';
import {
  BuildingIcon,
  CarIcon,
  CheckIcon,
  HeightIcon,
  LinkIcon,
  MapIcon,
  MessageIcon,
  MonitorIcon,
  NavigationIcon,
  ParkingIcon,
  ShareIcon,
  SmartphoneIcon,
  TabletIcon,
  WalkIcon,
} from '@/components/common/Icons';
import { useFilmTime, useKeys, useShown } from './clock';

/**
 * 片子里各块屏的产品界面（按原大排版，内容与 SHOWCASE §4.2 幕 04 一致）：
 * 行程空间「西行计划」——D0 的三行（14:30 取车、19:15 入住地面车位、领队确认后插入的 20:00 正宁路夜市）与 D1–D6；
 * 领队手机上的提名与 AI 评估（只算代价，不替大家决定）；「今天的路线 → 投递到车机导航」；车机导航自己的界面。
 * 所有时刻都是片子时钟的秒数。
 */

const [XIXING] = TRIPS;

/* ═════════════════════ 版本号 ═════════════════════ */

export function VersionBadge({ at, large = false }: { at: number; large?: boolean }) {
  const t = useFilmTime();
  const v11 = useKeys(t, [at - 0.03, at], [0, 1], ease.linear);
  const v10 = useTransform(v11, (v) => 1 - v);
  const s11 = useShown(v11);
  const s10 = useShown(v10);
  const cls = large ? '!h-7 !px-2.5 !text-[15px]' : '';
  return (
    <span className="relative inline-grid">
      <motion.span className="col-start-1 row-start-1" style={{ opacity: v10, visibility: s10 }}>
        <Badge className={cls}>v1.0</Badge>
      </motion.span>
      <motion.span className="col-start-1 row-start-1" style={{ opacity: v11, visibility: s11 }}>
        <Badge tone="success" className={cls}>
          <CheckIcon className="h-3 w-3" />
          v1.1
        </Badge>
      </motion.span>
    </span>
  );
}

/* ═════════════════════ 插入的一行：20:00 正宁路夜市 ═════════════════════ */

export interface Sweep {
  /** 高亮从哪一侧扫进来（线从哪边进屏） */
  from: 'left' | 'right' | 'center';
  /** 扫过整行的起止（秒） */
  t: readonly [number, number];
}

/**
 * 领队确认后插入 D0 晚上的一行：先长出高度，再被一道橙色高亮扫过（线穿过这一行），字随后出现。
 * sweep 省略时高亮直接淡入。data-row-anchor 标出这一行的位置，镜头与线用它对齐。
 */
export function InsertRow({ open, sweep, rowH = 44, size = 'md', nominator = true }: { open: number; sweep?: Sweep; rowH?: number; size?: 'md' | 'lg'; nominator?: boolean }) {
  const t = useFilmTime();
  const height = useKeys(t, [open, open + 0.28], [0, rowH], ease.out);
  const [s0, s1] = sweep?.t ?? [open + 0.1, open + 0.3];
  const reveal = useKeys(t, [s0, s1], [0, 1], sweep ? ease.linear : ease.out);
  const clip = useTransform(reveal, (k) => {
    const hidden = (1 - k) * 100;
    if (!sweep || sweep.from === 'left') return `inset(0 ${hidden}% 0 0 round 10px)`;
    if (sweep.from === 'right') return `inset(0 0 0 ${hidden}% round 10px)`;
    return `inset(0 ${hidden / 2}% 0 ${hidden / 2}% round 10px)`;
  });
  const textIn = useKeys(t, [s0 + (s1 - s0) * 0.35, s1 + 0.12], [0, 1]);
  const textShown = useShown(textIn);
  const glow = useKeys(t, [s1, s1 + 1.8], [1, 0.55]);
  const lg = size === 'lg';
  return (
    <motion.li data-row-anchor className="relative list-none" style={{ height }}>
      <motion.span aria-hidden className="absolute -inset-x-2 inset-y-0.5 rounded-[10px] bg-ui-accent/[0.13]" style={{ clipPath: clip, WebkitClipPath: clip, opacity: glow }} />
      <motion.span aria-hidden className="absolute -left-2 inset-y-1.5 w-[3px] rounded-full bg-ui-accent" style={{ clipPath: clip, WebkitClipPath: clip }} />
      <motion.span className={`relative flex h-full items-center ${lg ? 'gap-3.5' : 'gap-3'}`} style={{ opacity: textIn, visibility: textShown }}>
        <span className={`shrink-0 font-semibold tabular-nums text-ui-accent-ink ${lg ? 'w-12 text-[15px]' : 'w-11 text-[13px]'}`}>20:00</span>
        <CatMark cat="food" size={lg ? 26 : 22} className="relative ring-2 ring-ui-surface" />
        <span className={`min-w-0 flex-1 truncate font-semibold text-ui-ink ${lg ? 'text-[16px]' : 'text-[15px]'}`}>正宁路夜市 · 赵记醪糟</span>
        {nominator ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 text-[13px] text-ui-ink-3">
            <Avatar name="阿杰" tone="teal" size={20} ring={false} />
            提名
          </span>
        ) : null}
      </motion.span>
    </motion.li>
  );
}

function TimeRow({ time, cat, text, rowH = 44, lg = false }: { time: string; cat: PlaceCategory; text: ReactNode; rowH?: number; lg?: boolean }) {
  return (
    <li className={`relative flex list-none items-center ${lg ? 'gap-3.5' : 'gap-3'}`} style={{ height: rowH }}>
      <span className={`shrink-0 tabular-nums text-ui-ink-3 ${lg ? 'w-12 text-[15px]' : 'w-11 text-[13px]'}`}>{time}</span>
      <CatMark cat={cat} size={lg ? 26 : 22} className="relative ring-2 ring-ui-surface" />
      <span className={`min-w-0 flex-1 truncate text-ui-ink ${lg ? 'text-[16px]' : 'text-[15px]'}`}>{text}</span>
    </li>
  );
}

/** D0 卡：两行原有安排 + 插入的一行 */
function D0Card({ open, sweep, rowH = 44, lg = false, className = '' }: { open: number; sweep?: Sweep; rowH?: number; lg?: boolean; className?: string }) {
  return (
    <div className={`ui-card ${lg ? 'px-5 py-4' : 'px-4 py-3.5'} ${className}`}>
      <p className={`flex items-center gap-2.5 font-semibold text-ui-ink ${lg ? 'text-[17px]' : 'text-[15px]'}`}>
        <span className={`rounded-full bg-ui-ink px-2 font-semibold tabular-nums text-white ${lg ? 'text-[13px] leading-6' : 'text-xs leading-[22px]'}`}>D0</span>
        9/24 · 兰州 · 落地取车
      </p>
      <ul className="relative mt-2">
        <span aria-hidden className={`absolute bottom-4 top-4 border-l-2 border-dotted border-ui-line-strong ${lg ? 'left-[73px]' : 'left-[66px]'}`} />
        <TimeRow time="14:30" cat="transport" text="中川机场取车 · 腾势 D9" rowH={rowH} lg={lg} />
        <TimeRow time="19:15" cat="stay" text="入住黄河边酒店 · 地面车位" rowH={rowH} lg={lg} />
        <InsertRow open={open} sweep={sweep} rowH={rowH} size={lg ? 'lg' : 'md'} />
      </ul>
    </div>
  );
}

function DayList({ count = 6, rowH = 52, lg = false }: { count?: number; rowH?: number; lg?: boolean }) {
  return (
    <ol className="mt-2 flex flex-col">
      {DAYS.slice(1, 1 + count).map((d) => (
        <li key={d.tag} className="flex items-center gap-3 border-b border-ui-line px-1 last:border-b-0" style={{ height: rowH }}>
          <CatTile cat={d.cat} size={lg ? 34 : 30} />
          <span className="w-7 shrink-0 text-[13px] font-semibold tabular-nums text-ui-ink-3">{d.tag}</span>
          <span className={`min-w-0 flex-1 truncate text-ui-ink ${lg ? 'text-[16px]' : 'text-[15px]'}`}>{d.title}</span>
          {d.drive ? (
            <span className="inline-flex shrink-0 items-center gap-1 text-[13px] tabular-nums text-ui-ink-3">
              <CarIcon className="h-4 w-4" />
              {d.drive}
            </span>
          ) : null}
        </li>
      ))}
    </ol>
  );
}

/** 行程标题：封面 + 西行计划 + 版本号 */
function TripTitle({ at, title = 'text-[17px]' }: { at: number; title?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <RouteGlyph trip={XIXING} className="h-11 w-11 shrink-0 rounded-[12px]" />
      <div className="min-w-0">
        <p className={`flex items-center gap-2 font-semibold leading-6 text-ui-ink ${title}`}>
          西行计划
          <VersionBadge at={at} />
        </p>
        <p className="truncate text-[13px] leading-5 text-ui-ink-3">河西走廊 · 9/24–10/2 · 5 人 · 领队：我</p>
      </div>
    </div>
  );
}

function Members({ size = 28 }: { size?: number }) {
  return (
    <span className="flex shrink-0 items-center">
      <Avatar name="我" tone="violet" size={size} />
      <Avatar name="阿杰" tone="teal" size={size} className="-ml-2" />
      <Avatar name="小雨" tone="rose" size={size} className="-ml-2" />
    </span>
  );
}

/* ═════════════════════ 手机 · 行程空间 ═════════════════════ */

function PhoneStatus({ time = '21:06' }: { time?: string }) {
  return (
    <div className="flex h-[54px] items-end justify-between px-8 pb-1.5 text-[15px] font-semibold tabular-nums text-ui-ink">
      <span>{time}</span>
      <span className="flex items-center gap-1.5" aria-hidden>
        <span className="flex items-end gap-[2px]">
          {[5, 7, 9, 11].map((h) => (
            <span key={h} className="w-[3px] rounded-[1px] bg-ui-ink" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[12px] w-[24px] rounded-[4px] border-[1.5px] border-ui-ink/70 p-[1.5px]">
          <span className="block h-full w-[70%] rounded-[1.5px] bg-ui-ink" />
        </span>
      </span>
    </div>
  );
}

function PhoneTabs() {
  const tab = (Icon: typeof MessageIcon, label: string, active = false) => (
    <span className={`flex flex-1 flex-col items-center gap-1 pt-2.5 text-xs ${active ? 'font-medium text-ui-accent-ink' : 'text-ui-ink-3'}`}>
      <Icon className="h-6 w-6" />
      {label}
    </span>
  );
  return (
    <div className="absolute inset-x-0 bottom-0 flex h-[84px] border-t border-ui-line bg-ui-surface">
      {tab(MessageIcon, '对话')}
      {tab(MapIcon, '行程空间', true)}
      {tab(BuildingIcon, '旅行社线路')}
    </div>
  );
}

/** 手机里的行程空间：updateAt 这一刻翻到 v1.1；sweep 是线穿过插入行的方式 */
export function TripPhoneScreen({ updateAt, open, sweep, time, children }: { updateAt: number; open?: number; sweep?: Sweep; time?: string; children?: ReactNode }) {
  return (
    <div className="absolute inset-0 bg-ui-shell">
      <PhoneStatus time={time} />
      <div className="flex items-center justify-between gap-2 px-5 pb-3 pt-3">
        <TripTitle at={updateAt} />
        <Members size={26} />
      </div>
      <div className="px-4">
        <D0Card open={open ?? updateAt - 0.1} sweep={sweep} />
        <DayList count={6} />
      </div>
      <PhoneTabs />
      {children}
    </div>
  );
}

/* ═════════════════════ 手机 · 提名与 AI 评估（领队） ═════════════════════ */

function EvalRow({ icon, ok, children }: { icon: ReactNode; ok: boolean; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-ui-success/10 text-ui-success' : 'bg-[#B45309]/10 text-[#B45309]'}`}>{icon}</span>
      <span className="min-w-0 flex-1 text-[15px] leading-snug text-ui-ink">{children}</span>
      <span className={`shrink-0 text-[13px] font-medium ${ok ? 'text-ui-success' : 'text-[#B45309]'}`}>{ok ? '✓' : '注意'}</span>
    </li>
  );
}

/** 两个状态的按钮：点之前一个样子，点之后另一个样子 */
export function Pressable({ at, before, after, className = '' }: { at: number; before: ReactNode; after: ReactNode; className?: string }) {
  const t = useFilmTime();
  const done = useKeys(t, [at, at + 0.06], [0, 1], ease.linear);
  const not = useTransform(done, (v) => 1 - v);
  const sd = useShown(done);
  const sn = useShown(not);
  const press = useKeys(t, [at - 0.12, at, at + 0.14], [1, 0.95, 1]);
  return (
    <motion.span className={`relative grid ${className}`} style={{ scale: press }}>
      <motion.span className="col-start-1 row-start-1 grid" style={{ opacity: not, visibility: sn }}>
        {before}
      </motion.span>
      <motion.span className="col-start-1 row-start-1 grid" style={{ opacity: done, visibility: sd }}>
        {after}
      </motion.span>
    </motion.span>
  );
}

/** 手指：手机上不画箭头光标，画一个按下去的指尖（屏幕外的「片子语言」，不是界面） */
export function Fingertip({ approach, at, size = 46, className = '' }: { approach: readonly [number, number]; at: number; size?: number; className?: string }) {
  const t = useFilmTime();
  const [a, b] = approach;
  const opacity = useKeys(t, [a, b, at + 0.2, at + 0.45], [0, 0.92, 0.92, 0]);
  const shown = useShown(opacity);
  const scale = useKeys(t, [a, b, at - 0.07, at, at + 0.16], [1.35, 1, 1, 0.84, 1]);
  const ring = useKeys(t, [at, at + 0.5], [0.7, 2.1], ease.out);
  const ringOpacity = useKeys(t, [at - 0.01, at, at + 0.5], [0, 0.55, 0]);
  return (
    <motion.span aria-hidden className={`pointer-events-none absolute z-40 -translate-x-1/2 -translate-y-1/2 ${className}`} style={{ width: size, height: size, opacity, visibility: shown }}>
      <motion.span className="absolute inset-0 rounded-full border-2 border-ui-accent" style={{ scale: ring, opacity: ringOpacity }} />
      <motion.span className="absolute inset-0 rounded-full bg-[#241E20]/30 ring-[3px] ring-white/85 backdrop-blur-[1px]" style={{ scale }} />
    </motion.span>
  );
}

/** 领队手机上的提名卡（底部抽屉）：AI 只算代价；领队点「加入 D0 晚上」 */
export function NominationSheet({ tapAt, approach, hideAt, dim }: { tapAt: number; approach: readonly [number, number]; hideAt: readonly [number, number]; dim?: MotionValue<number> }) {
  const t = useFilmTime();
  const y = useKeys(t, [hideAt[0], hideAt[1]], [0, 105], ease.in);
  const yPct = useTransform(y, (n) => `${n}%`);
  const still = useMotionValue(1);
  const fade = dim ?? still;
  return (
    <motion.div className="ui-float absolute inset-x-0 bottom-0 z-30 rounded-t-[30px] !border-x-0 !border-b-0 px-5 pb-9 pt-3" style={{ y: yPct }}>
      <span aria-hidden className="mx-auto mb-4 block h-[5px] w-10 rounded-full bg-ui-line-strong" />
      <motion.div style={{ opacity: fade }}>
        <p className="flex items-center gap-2.5 text-[13px] text-ui-ink-3">
          <Avatar name="阿杰" tone="teal" size={26} ring={false} />
          <span className="text-[15px] font-medium text-ui-ink">阿杰</span>提名 · 刚刚
        </p>
        <div className="mt-3 flex items-center gap-3 rounded-[14px] bg-ui-sunken p-3">
          <CatTile cat="food" size={46} className="!bg-ui-surface" />
          <span className="min-w-0">
            <span className="block truncate text-[17px] font-semibold text-ui-ink">正宁路夜市 · 赵记醪糟</span>
            <span className="block truncate text-[13px] text-ui-ink-3">兰州 · 小吃 · D0 晚上</span>
          </span>
        </div>
        <p className="mt-3 text-[15px] leading-relaxed text-ui-ink-2">“离第一晚的酒店走路就到，想带爷爷去喝碗醪糟。”</p>
        <p className="mt-4 border-t border-ui-line pt-3.5 text-[13px] font-medium text-ui-ink-3">AI 评估 · 只算代价，不替大家决定</p>
        <ul className="mt-3 flex flex-col gap-3">
          <EvalRow ok icon={<WalkIcon className="h-4 w-4" />}>
            离 D0 酒店步行 950 m，约 12 分钟
          </EvalRow>
          <EvalRow ok icon={<CarIcon className="h-4 w-4" />}>
            不增加车程，不影响次日出发
          </EvalRow>
          <EvalRow ok={false} icon={<HeightIcon className="h-4 w-4" />}>
            夜市地库限高 2.0 m：车停酒店地面车位
          </EvalRow>
        </ul>
      </motion.div>
      <div className="relative mt-6 flex gap-3">
        <motion.span className="ui-btn ui-btn-secondary !h-12 flex-1 !text-[15px]" style={{ opacity: fade }}>
          暂不
        </motion.span>
        <span className="relative flex-[1.6]">
          <Pressable
            at={tapAt}
            before={<span className="ui-btn ui-btn-primary !h-12 w-full !text-[15px]">加入 D0 晚上</span>}
            after={
              <span className="ui-btn ui-btn-secondary !h-12 w-full !text-[15px] !text-ui-success">
                <CheckIcon className="h-4 w-4" />
                已加入 D0
              </span>
            }
          />
          <Fingertip approach={approach} at={tapAt} className="left-[58%] top-1/2" />
        </span>
      </div>
    </motion.div>
  );
}

/** 领队手机上的「今天的路线」（出发当天）：投递到车机导航——领队再点一下，由车机导航带路 */
export function TodaySheet({ inAt, tapAt, approach }: { inAt: readonly [number, number]; tapAt: number; approach: readonly [number, number] }) {
  const t = useFilmTime();
  const y = useKeys(t, [inAt[0], inAt[1]], [105, 0], ease.out);
  const yPct = useTransform(y, (n) => `${n}%`);
  const shown = useShown(useKeys(t, [inAt[0] - 0.01, inAt[0]], [0, 1], ease.linear));
  return (
    <motion.div className="ui-float absolute inset-x-0 bottom-0 z-30 rounded-t-[30px] !border-x-0 !border-b-0 px-5 pb-9 pt-3" style={{ y: yPct, visibility: shown }}>
      <span aria-hidden className="mx-auto mb-4 block h-[5px] w-10 rounded-full bg-ui-line-strong" />
      <p className="text-[13px] font-medium text-ui-ink-3">今天的路线 · 9/24 · D0</p>
      <ol className="mt-2.5 flex flex-col gap-1">
        <li className="flex h-11 items-center gap-3 text-[16px] text-ui-ink">
          <CatMark cat="transport" size={26} />
          中川机场 · 取车
        </li>
        <li className="flex h-11 items-center gap-3 text-[16px] font-semibold text-ui-ink">
          <CatMark cat="stay" size={26} />
          黄河边酒店 · 地面停车场入口
        </li>
      </ol>
      <p className="mt-2 flex items-center gap-2 rounded-[10px] bg-ui-accent/10 px-3 py-2 text-[13px] text-ui-accent-ink">
        <HeightIcon className="h-4 w-4 shrink-0" />
        车高 2.28 m（画像）· 不进 2.0 m 地库
      </p>
      <span className="relative mt-5 block">
        <Pressable
          at={tapAt}
          before={
            <span className="ui-btn ui-btn-primary !h-12 w-full !text-[15px]">
              <NavigationIcon className="h-4 w-4" />
              投递到车机导航
            </span>
          }
          after={
            <span className="ui-btn ui-btn-secondary !h-12 w-full !text-[15px] !text-ui-success">
              <CheckIcon className="h-4 w-4" />
              已投递 · 由车机导航带路
            </span>
          }
        />
        <Fingertip approach={approach} at={tapAt} className="left-1/2 top-1/2" />
      </span>
    </motion.div>
  );
}

/* ═════════════════════ 电脑 · 行程空间 ═════════════════════ */

function SyncList({ at }: { at: number }) {
  const rows: { Icon: typeof MonitorIcon; name: string; tone: 'violet' | 'teal' | 'rose'; who: string }[] = [
    { Icon: MonitorIcon, name: '我的电脑', tone: 'violet', who: '我' },
    { Icon: SmartphoneIcon, name: '我的手机', tone: 'violet', who: '我' },
    { Icon: SmartphoneIcon, name: '阿杰的手机', tone: 'teal', who: '阿杰' },
    { Icon: TabletIcon, name: '小雨的平板', tone: 'rose', who: '小雨' },
  ];
  return (
    <div>
      <p className="flex items-center justify-between text-[15px] font-semibold text-ui-ink">
        同步
        <span className="text-[13px] font-normal text-ui-ink-3">离线也能打开</span>
      </p>
      <ul className="mt-2.5 flex flex-col gap-2">
        {rows.map((r) => (
          <li key={r.name} className="flex h-10 items-center gap-2.5 rounded-[10px] bg-ui-sunken px-2.5">
            <Avatar name={r.who} tone={r.tone} size={24} ring={false} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">{r.name}</span>
            <r.Icon className="h-4 w-4 text-ui-ink-3" />
            <VersionBadge at={at} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TripLaptopScreen({ updateAt, open, sweep }: { updateAt: number; open?: number; sweep?: Sweep }) {
  const nav = (Icon: typeof MessageIcon, label: string, active = false) => (
    <li className={`flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-[14px] ${active ? 'ui-nav-active font-medium text-ui-ink' : 'text-ui-ink-2'}`}>
      <Icon className={`h-[18px] w-[18px] ${active ? 'text-ui-ink' : 'text-ui-ink-3'}`} />
      {label}
    </li>
  );
  return (
    <div className="absolute inset-0 flex flex-col bg-ui-shell">
      <div className="flex h-10 shrink-0 items-center gap-2 px-4">
        <span aria-hidden className="flex gap-2">
          <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
          <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
          <span className="h-3 w-3 rounded-full bg-[#28C840]" />
        </span>
        <span className="flex-1 text-center text-[13px] font-medium text-ui-ink-3">TripCraft</span>
        <span className="w-[52px]" />
      </div>
      <div className="flex min-h-0 flex-1">
        <nav className="flex w-[206px] shrink-0 flex-col px-3 pb-4">
          <div className="flex h-10 items-center gap-2.5 px-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#241E20] text-[13px] font-bold text-[#FFFFF9]">旅</span>
            <span className="text-[15px] font-semibold text-ui-ink">TripCraft</span>
          </div>
          <ul className="mt-3 flex flex-col gap-0.5">
            {nav(MessageIcon, '对话')}
            {nav(MapIcon, '行程空间', true)}
            {nav(BuildingIcon, '旅行社线路')}
          </ul>
          <p className="mt-6 px-2.5 text-[13px] font-medium text-ui-ink-3">我的行程</p>
          <ul className="mt-1.5 flex flex-col gap-1">
            {TRIPS.map((trip, i) => (
              <li key={trip.id} className={`flex items-center gap-2.5 rounded-[8px] px-2 py-1.5 ${i === 0 ? 'bg-ui-surface/80' : ''}`}>
                <RouteGlyph trip={trip} className="h-9 w-9 shrink-0 rounded-[9px]" />
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-ui-ink">{trip.name}</span>
                  <span className="block truncate text-xs text-ui-ink-3">{trip.sub}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto flex items-center gap-2.5 px-1.5">
            <Avatar name="我" tone="violet" size={28} />
            <span className="min-w-0">
              <span className="block text-[13px] font-medium text-ui-ink">我</span>
              <span className="block text-xs text-ui-ink-3">3 台设备已登录</span>
            </span>
          </div>
        </nav>
        <main className="mb-3 mr-3 flex min-w-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-ui-line bg-ui-panel">
          <header className="flex h-[76px] shrink-0 items-center gap-3 border-b border-ui-line px-5">
            <div className="min-w-0 flex-1">
              <TripTitle at={updateAt} />
            </div>
            <Members />
            <span className="ui-btn ui-btn-secondary !h-9 !text-[13px]">
              <LinkIcon className="h-4 w-4" />
              邀请
            </span>
            <span className="ui-btn ui-btn-secondary !h-9 !text-[13px]">
              <ShareIcon className="h-4 w-4" />
              做成可分享的路书
            </span>
          </header>
          <div className="flex min-h-0 flex-1">
            <section className="min-w-0 flex-1 px-5 py-4">
              <D0Card open={open ?? updateAt - 0.1} sweep={sweep} rowH={42} lg />
              <DayList count={5} rowH={50} lg />
            </section>
            <aside className="w-[300px] shrink-0 border-l border-ui-line p-5">
              <p className="flex items-center justify-between text-[15px] font-semibold text-ui-ink">
                提名
                <span className="text-[13px] font-normal text-ui-ink-3">由领队确认</span>
              </p>
              <div className="mt-2.5 flex items-center gap-2.5 rounded-[12px] border border-ui-line p-2.5">
                <CatTile cat="food" size={34} />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ui-ink">正宁路夜市 · 赵记醪糟</span>
              </div>
              <div className="mt-5">
                <SyncList at={updateAt} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

/* ═════════════════════ 平板 · 行程空间（左日程、右地图） ═════════════════════ */

export function TripTabletScreen({ updateAt, open, sweep }: { updateAt: number; open?: number; sweep?: Sweep }) {
  const full = useMotionValue(1);
  return (
    <div className="absolute inset-0 flex flex-col bg-ui-shell">
      <div className="flex h-[38px] shrink-0 items-end justify-between px-7 pb-1 text-[13px] font-semibold tabular-nums text-ui-ink">
        <span>21:06</span>
        <span className="h-[11px] w-[22px] rounded-[3px] border-[1.5px] border-ui-ink/70 p-[1.5px]">
          <span className="block h-full w-[70%] rounded-[1px] bg-ui-ink" />
        </span>
      </div>
      <div className="flex items-center justify-between gap-3 px-6 pb-3 pt-2">
        <TripTitle at={updateAt} />
        <Members />
      </div>
      <div className="flex min-h-0 flex-1 gap-4 px-6 pb-6">
        <div className="w-[470px] shrink-0">
          <D0Card open={open ?? updateAt - 0.1} sweep={sweep} />
          <DayList count={5} rowH={50} />
        </div>
        <div className="relative min-w-0 flex-1 overflow-hidden rounded-[16px] border border-ui-line">
          <MapCanvas route={SELF_DRIVE_ROUTE} draw={full} labels={['lz', 'zy', 'jyg', 'dh']} head={false} scale={false} minimal legendClass="bottom-2.5 right-2.5" />
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 车机导航（不是 TripCraft 的界面） ═════════════════════ */

/** 车机地图上的路线：中川机场（右上）→ 黄河边酒店地面停车场（左下），示意 */
export const CAR_ROUTE = 'M520 34 C 476 130, 432 186, 380 250 S 300 340, 250 372';

/**
 * 车机导航自己的界面：中性底色、交通蓝的路线，只在角上标「来自 TripCraft」。
 * 屏上只有导航：没有车速、电量、档位与领航辅助（PRD-01 §5、docs/02 §2.1）。
 */
export function CarNavScreen({ litAt, routeAt, draw }: { litAt: number; routeAt: readonly [number, number]; draw?: MotionValue<number> }) {
  const t = useFilmTime();
  const lit = useKeys(t, [litAt, litAt + 0.5], [0, 1]);
  const own = useKeys(t, [routeAt[0], routeAt[1]], [0, 1], ease.smooth);
  const pathLength = draw ?? own;
  const got = useKeys(t, [routeAt[0] + 0.1, routeAt[0] + 0.45], [0, 1]);
  const gotShown = useShown(got);
  const idle = useTransform(got, (v) => 1 - v);
  const idleShown = useShown(idle);
  const park = useKeys(t, [routeAt[1] - 0.1, routeAt[1] + 0.2], [0, 1]);
  return (
    <motion.div className="absolute inset-0 flex font-sans text-[#1F2328]" style={{ opacity: lit }}>
      <div className="relative min-w-0 flex-[1.55] overflow-hidden bg-[#E6EAEE]">
        <svg viewBox="0 0 700 448" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
          <rect width="700" height="448" fill="#E6EAEE" />
          <path d="M-20 300 C 140 280, 260 330, 420 300 S 640 250, 720 270" fill="none" stroke="#B7D0E8" strokeWidth="26" strokeLinecap="round" />
          <path d="M80 -20 L 170 470" fill="none" stroke="#FFFFFF" strokeWidth="14" />
          <path d="M-20 120 L 720 96" fill="none" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M600 -20 C 560 120, 590 260, 520 470" fill="none" stroke="#FFFFFF" strokeWidth="12" />
          <path d="M-20 420 C 200 400, 360 430, 720 404" fill="none" stroke="#FFFFFF" strokeWidth="10" />
          <path d={CAR_ROUTE} fill="none" stroke="#FFFFFF" strokeWidth="22" strokeLinecap="round" />
          <motion.path d={CAR_ROUTE} fill="none" stroke="#3A78D2" strokeWidth="13" strokeLinecap="round" style={{ pathLength }} />
          <circle cx="520" cy="34" r="13" fill="#3A78D2" stroke="#FFFFFF" strokeWidth="5" />
        </svg>
        <motion.span className="absolute flex h-10 w-10 items-center justify-center rounded-full bg-[#1F2328] text-white ring-4 ring-white" style={{ left: '35.7%', top: '83%', x: '-50%', y: '-50%', opacity: park }}>
          <ParkingIcon className="h-5 w-5" />
        </motion.span>
        <span className="absolute left-4 top-4 rounded-full bg-white/85 px-3 text-[13px] leading-7 text-[#4A5058]">示意</span>
      </div>
      <div className="relative flex min-w-0 flex-1 flex-col justify-center border-l border-[#D6DBE0] bg-white px-8">
        <p className="text-[15px] font-medium text-[#4A5058]">车机导航</p>
        <motion.p className="mt-3 text-[24px] text-[#4A5058]" style={{ opacity: idle, visibility: idleShown }}>
          未设置目的地
        </motion.p>
        <motion.div className="absolute inset-x-8 top-1/2 -translate-y-1/2" style={{ opacity: got, visibility: gotShown }}>
          <p className="text-[15px] text-[#4A5058]">前往</p>
          <p className="mt-1 text-[32px] font-semibold leading-tight">黄河边酒店</p>
          <p className="mt-0.5 text-[20px]">地面停车场入口</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#3A78D2]/10 px-3.5 text-[15px] leading-8 text-[#2F63B0]">
            <NavigationIcon className="h-4 w-4" />
            导航中
          </p>
        </motion.div>
        <motion.p className="absolute bottom-5 left-8 right-6 truncate text-[13px] text-[#4A5058]" style={{ opacity: got, visibility: gotShown }}>
          来自 TripCraft · 西行计划
        </motion.p>
      </div>
    </motion.div>
  );
}

/** 车机的空位：出发当天才接上 */
export function CarSlot({ className = '', style, children }: { className?: string; style?: CSSProperties; children?: ReactNode }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 rounded-[34px] border-2 border-dashed border-[#CFCBC2] text-[#241E20]/55 ${className}`} style={style}>
      <CarIcon className="h-9 w-9" />
      <span className="text-[22px]">车机导航 · 出发当天接上</span>
      {children}
    </div>
  );
}
