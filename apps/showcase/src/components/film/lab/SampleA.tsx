'use client';

import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease } from '@/lib/motion';
import { layoutRect } from '@/components/stage/camera';
import { CheckIcon } from '@/components/common/Icons';
import { FilmClock, solvePose, useBoxSize, useFilmTime, useKeys, useShown, useWorldCamera, type Pose } from '../clock';

type CamRef = { current: { poses: readonly Pose[]; view: { w: number; h: number } } };
import { CAR, CarDisplay, LAPTOP, Laptop, PHONE, Phone, TABLET, Tablet } from '../devices';
import { CarNavScreen, NominationSheet, TodaySheet, TripLaptopScreen, TripPhoneScreen, TripTabletScreen, type Sweep } from '../screens';

/**
 * 样片 A ·「一根线」的高潮（实验页 /lab/a，选定方向前的样片，最终 PR 前删除）
 *
 * 领队手指下的「加入 D0 晚上」→ 静 → 点下 → 手机里插入的那一行亮起，橙线从这一行的两端冲出去，
 * 沿同一条水平线穿过全家每一块屏——每块屏里亮起的正是同一行（20:00 正宁路夜市），版本翻到 v1.1；
 * 镜头随线拉远，停在「同一根线串起全家的屏」的全景。出发当天：纸面转成清晨的冷白，领队把今天的路线投递到车机，
 * 线进车机屏的一刻变成车机导航自己的蓝色路线（交给车机导航带路，TripCraft 不驾驶、不读车况）。
 */

const DUR = 10;
/** 线所在的水平线（世界坐标）：四块屏的「D0 · 20:00」一行都对齐到这里 */
const ROW_Y = 1200;
/** 线头速度（世界 px / 秒） */
const SPEED = 1330;
const TAP = 2.0;
const EXIT = 2.95;

type Dev = 'laptop' | 'hero' | 'tablet' | 'ajie';

/** 设备的横向位置与屏幕的左右边（相对设备左边） */
const X: Record<Dev, number> = { laptop: 0, hero: 1560, tablet: 2234, ajie: 3558 };
const SIZE: Record<Dev, { w: number; h: number }> = { laptop: LAPTOP, hero: PHONE, tablet: TABLET, ajie: PHONE };
const OUTER: Record<Dev, [number, number]> = {
  laptop: [(LAPTOP.w - LAPTOP.lidW) / 2, (LAPTOP.w + LAPTOP.lidW) / 2],
  hero: [0, PHONE.w],
  tablet: [0, TABLET.w],
  ajie: [0, PHONE.w],
};
const SCREEN: Record<Dev, [number, number]> = {
  laptop: [OUTER.laptop[0] + LAPTOP.bezel, OUTER.laptop[0] + LAPTOP.bezel + LAPTOP.screenW],
  hero: [PHONE.bezel, PHONE.bezel + PHONE.screenW],
  tablet: [TABLET.bezel, TABLET.bezel + TABLET.screenW],
  ajie: [PHONE.bezel, PHONE.bezel + PHONE.screenW],
};
const ROW_H: Record<Dev, number> = { laptop: 42, hero: 44, tablet: 44, ajie: 44 };
/** 行在设备里的纵向位置（行顶到设备顶）：首帧按估算排，挂载后量取 */
const GUESS: Record<Dev, number> = { laptop: 290, hero: 270, tablet: 250, ajie: 270 };

const ax = (d: Dev, local: number) => X[d] + local;
const HERO_CX = X.hero + PHONE.w / 2;
const LEFT0 = ax('hero', SCREEN.hero[0]);
const RIGHT0 = ax('hero', SCREEN.hero[1]);

/** 线头走到 x 的时刻（向左 / 向右两支，同一速度） */
const atLeft = (x: number) => EXIT + (LEFT0 - x) / SPEED;
const atRight = (x: number) => EXIT + (x - RIGHT0) / SPEED;

/** 每块屏：线进屏、出屏的时刻 */
const PASS: Record<Exclude<Dev, 'hero'>, { in: number; out: number; from: 'left' | 'right' }> = {
  laptop: { in: atLeft(ax('laptop', SCREEN.laptop[1])), out: atLeft(ax('laptop', SCREEN.laptop[0])), from: 'right' },
  tablet: { in: atRight(ax('tablet', SCREEN.tablet[0])), out: atRight(ax('tablet', SCREEN.tablet[1])), from: 'left' },
  ajie: { in: atRight(ax('ajie', SCREEN.ajie[0])), out: atRight(ax('ajie', SCREEN.ajie[1])), from: 'left' },
};
const HERO_ROW: Sweep = { from: 'center', t: [2.7, EXIT] };

/** 线段（只画在屏与屏之间；屏里由那一行的高亮接上） */
const SEGMENTS: { x0: number; x1: number; dir: 'left' | 'right' }[] = [
  { x0: ax('laptop', OUTER.laptop[1]), x1: ax('hero', OUTER.hero[0]), dir: 'left' },
  { x0: ax('hero', OUTER.hero[1]), x1: ax('tablet', OUTER.tablet[0]), dir: 'right' },
  { x0: ax('tablet', OUTER.tablet[1]), x1: ax('ajie', OUTER.ajie[0]), dir: 'right' },
];
/** 两端出屏后一直走出画面：这根线不止这几块屏 */
const ENDS = [
  { x: ax('laptop', OUTER.laptop[0]), at: atLeft(ax('laptop', OUTER.laptop[0])), dir: 'left' as const, len: 2600 },
  { x: ax('ajie', OUTER.ajie[1]), at: atRight(ax('ajie', OUTER.ajie[1])), dir: 'right' as const, len: 2600 },
];

/* ── 出发当天 ── */
const DAWN: readonly [number, number] = [6.45, 7.35];
const TODAY_IN: readonly [number, number] = [7.0, 7.4];
const DISPATCH = 7.95;
const DROP: readonly [number, number] = [8.02, 8.36];
const CAR_ROUTE_T: readonly [number, number] = [8.36, 9.3];
const CAR_Y = 2010;
/** 车机地图上路线起点（CAR_ROUTE 的 M520 …）正好在领队手机的正下方 */
const CAR_X = HERO_CX - (CAR.bezel + ((CAR.screenW * 1.55) / 2.55) * (520 / 700));

const BG_NIGHT = '#FFFFF9';
const BG_DAWN = '#EDF0F1';

export function SampleA() {
  return (
    <FilmClock duration={DUR}>
      <Stage />
    </FilmClock>
  );
}

function Stage() {
  const t = useFilmTime();
  const boxRef = useRef<HTMLDivElement>(null);
  const view = useBoxSize(boxRef);
  const worldRef = useRef<HTMLDivElement>(null);
  const [rowTop, setRowTop] = useState(GUESS);

  // 量取每块屏里「插入行」的位置，让四块屏的这一行对齐到同一条水平线
  useLayoutEffect(() => {
    const measure = () => {
      const next = { ...GUESS };
      for (const d of Object.keys(GUESS) as Dev[]) {
        const dev = worldRef.current?.querySelector<HTMLElement>(`[data-dev="${d}"]`);
        const row = dev?.querySelector<HTMLElement>('[data-row-anchor]');
        const r = dev && row ? layoutRect(dev, row) : null;
        if (r) next[d] = r.y;
      }
      setRowTop((prev) => ((Object.keys(next) as Dev[]).some((d) => Math.abs(next[d] - prev[d]) > 0.5) ? next : prev));
    };
    measure();
    document.fonts?.ready.then(measure, () => {});
  }, []);

  const top = (d: Dev) => ROW_Y - rowTop[d] - ROW_H[d] / 2;
  const heroTop = top('hero');
  const right = ax('ajie', PHONE.w);
  // 标签落在同一条基线上（四块屏高矮不一，标签不跟着各自的底边走）
  const labelY = Math.max(top('laptop') + LAPTOP.h, heroTop + PHONE.h, top('tablet') + TABLET.h, top('ajie') + PHONE.h) + 44;
  const wide = Math.min(0.455, (view.w - 150) / right);

  const poses = useMemo<Pose[]>(
    () => [
      { t: 0, x: HERO_CX, y: heroTop + 690, s: 3.05 },
      { t: TAP, x: HERO_CX, y: heroTop + 690, s: 3.3, ease: ease.linear },
      // 先退到整部手机（插入的一行亮起），再随线一口气拉到全景
      { t: 2.95, from: 2.2, x: HERO_CX, y: heroTop + PHONE.h / 2, s: 1.0, ease: ease.out },
      { t: 4.45, x: right / 2, y: 1215, s: wide, ease: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2) },
      { t: DAWN[0], x: right / 2, y: 1225, s: wide * 1.015, ease: ease.linear },
      { t: 7.45, from: DAWN[0], x: HERO_CX, y: 1735, s: 0.58 },
      { t: 8.25, x: HERO_CX, y: 1745, s: 0.59, ease: ease.linear },
      { t: 9.4, x: CAR_X + CAR.w / 2, y: CAR_Y + CAR.h / 2 - 20, s: 1.05 },
      { t: DUR, x: CAR_X + CAR.w / 2, y: CAR_Y + CAR.h / 2 - 20, s: 1.07, ease: ease.linear },
    ],
    [heroTop, right, wide],
  );
  const { transform, cfg } = useWorldCamera(t, poses, view);
  const bg = useTransform(t, [DAWN[0], DAWN[1]], [BG_NIGHT, BG_DAWN]);
  const sheetDim = useKeys(t, [1.0, 1.5], [1, 0.32]);

  return (
    <motion.div ref={boxRef} className="fixed inset-0 overflow-hidden" style={{ background: bg }}>
      <motion.div ref={worldRef} className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0', width: right, height: 2600 }}>
        <CarStation />
        <Device id="laptop" top={top('laptop')}>
          <Laptop>
            <TripLaptopScreen updateAt={PASS.laptop.in} open={PASS.laptop.in - 0.16} sweep={{ from: PASS.laptop.from, t: [PASS.laptop.in, PASS.laptop.out] }} />
            <Sleep until={PASS.laptop.in} />
          </Laptop>
        </Device>
        <Device id="hero" top={heroTop}>
          <Phone>
            <TripPhoneScreen updateAt={2.7} open={2.55} sweep={HERO_ROW}>
              <NominationSheet tapAt={TAP} approach={[0.85, 1.35]} hideAt={[2.25, 2.5]} dim={sheetDim} />
              <TodaySheet inAt={TODAY_IN} tapAt={DISPATCH} approach={[7.45, 7.75]} />
            </TripPhoneScreen>
          </Phone>
        </Device>
        <Device id="tablet" top={top('tablet')}>
          <Tablet>
            <TripTabletScreen updateAt={PASS.tablet.in} open={PASS.tablet.in - 0.16} sweep={{ from: PASS.tablet.from, t: [PASS.tablet.in, PASS.tablet.out] }} />
            <Sleep until={PASS.tablet.in} />
          </Tablet>
        </Device>
        <Device id="ajie" top={top('ajie')}>
          <Phone>
            <TripPhoneScreen updateAt={PASS.ajie.in} open={PASS.ajie.in - 0.16} sweep={{ from: PASS.ajie.from, t: [PASS.ajie.in, PASS.ajie.out] }} time="21:07" />
            <Sleep until={PASS.ajie.in} />
          </Phone>
        </Device>


        <Label x={ax('laptop', OUTER.laptop[0])} y={labelY} at={PASS.laptop.in} name="我的电脑" />
        <Label x={X.hero} y={labelY} at={2.7} name="我的手机 · 领队" />
        <Label x={X.tablet} y={labelY} at={PASS.tablet.in} name="小雨的平板" />
        <Label x={X.ajie} y={labelY} at={PASS.ajie.in} name="阿杰的手机" />
      </motion.div>

      <LineOverlay cam={cfg} dropTop={heroTop + PHONE.h} />
      <Titles />
    </motion.div>
  );
}

/* ═════════════════════ 设备与标签 ═════════════════════ */

function Device({ id, top, children }: { id: Dev; top: number; children: ReactNode }) {
  const t = useFilmTime();
  // 出发当天：除了领队的手机，其他屏退到背景
  const fade = useKeys(t, [DAWN[0], DAWN[0] + 0.6], [1, id === 'hero' ? 1 : 0]);
  const shown = useShown(fade);
  return (
    <motion.div data-dev={id} className="absolute" style={{ left: X[id], top, width: SIZE[id].w, height: SIZE[id].h, opacity: fade, visibility: shown }}>
      {children}
    </motion.div>
  );
}

/** 线到之前，这块屏是暗的（待机）；线一到，屏亮起 */
function Sleep({ until }: { until: number }) {
  const t = useFilmTime();
  const opacity = useKeys(t, [until - 0.04, until + 0.3], [0.58, 0], ease.out);
  const shown = useShown(opacity);
  return <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-[60] bg-[#1C1819]" style={{ opacity, visibility: shown }} />;
}

/** 屏下的标签：谁的屏 · 版本（片子的说明字，不是界面） */
function Label({ x, y, at, name }: { x: number; y: number; at: number; name: string }) {
  const t = useFilmTime();
  const v11 = useKeys(t, [at, at + 0.25], [0, 1]);
  const v10 = useTransform(v11, (v) => 1 - v);
  const fade = useKeys(t, [3.95, 4.45, DAWN[0], DAWN[0] + 0.4], [0, 1, 1, 0]);
  const shown = useShown(fade);
  return (
    <motion.p className="absolute flex items-center gap-3 whitespace-nowrap text-[40px] leading-[1.2] text-[#241E20]/70" style={{ left: x, top: y, opacity: fade, visibility: shown }}>
      <span className="font-medium text-[#241E20]">{name}</span>
      <span className="relative inline-grid">
        <motion.span className="col-start-1 row-start-1 tabular-nums" style={{ opacity: v10 }}>
          v1.0
        </motion.span>
        <motion.span className="col-start-1 row-start-1 inline-flex items-center gap-2 font-medium tabular-nums text-[#0E7A5A]" style={{ opacity: v11 }}>
          <CheckIcon className="h-8 w-8" />
          v1.1
        </motion.span>
      </span>
    </motion.p>
  );
}

/* ═════════════════════ 线（屏幕空间的 SVG：线粗恒定、每帧只改坐标，不触发排版） ═════════════════════ */

const LINE_PX = 4;
/** 屏与屏之间的空隙（线只画在这里；屏里由那一行的高亮接上） */
const GAPS: { x0: number; x1: number; dir: 'left' | 'right' }[] = [
  ...SEGMENTS,
  { x0: ENDS[0].x - ENDS[0].len, x1: ENDS[0].x, dir: 'left' },
  { x0: ENDS[1].x, x1: ENDS[1].x + ENDS[1].len, dir: 'right' },
];
const STATIONS = SEGMENTS.flatMap((g) => [g.x0, g.x1]);

/** 线头此刻走到的 x（左右两支） */
const headLeft = (v: number) => LEFT0 - Math.max(0, v - EXIT) * SPEED;
const headRight = (v: number) => RIGHT0 + Math.max(0, v - EXIT) * SPEED;

function LineOverlay({ cam, dropTop }: { cam: CamRef; dropTop: number }) {
  const t = useFilmTime();
  const fade = useKeys(t, [DAWN[0], DAWN[0] + 0.6], [1, 0]);
  const shown = useShown(fade);
  const pose = (v: number) => solvePose(v, cam.current.poses, cam.current.view);
  const d = useTransform(t, (v) => {
    if (v < EXIT) return '';
    const [tx, ty, s] = pose(v);
    const y = (ty + s * ROW_Y).toFixed(2);
    const hl = headLeft(v);
    const hr = headRight(v);
    let out = '';
    for (const g of GAPS) {
      if (g.dir === 'left') {
        if (hl >= g.x1) continue;
        const a = Math.max(g.x0, hl);
        out += `M${(tx + s * g.x1).toFixed(2)} ${y}H${(tx + s * a).toFixed(2)}`;
      } else {
        if (hr <= g.x0) continue;
        const b = Math.min(g.x1, hr);
        out += `M${(tx + s * g.x0).toFixed(2)} ${y}H${(tx + s * b).toFixed(2)}`;
      }
    }
    return out;
  });
  const stations = useTransform(t, (v) => {
    const [tx, ty, s] = pose(v);
    return STATIONS.map((x) => {
      const at = x < HERO_CX ? atLeft(x) : atRight(x);
      const k = Math.max(0, Math.min(1, (v - at + 0.02) / 0.12));
      return [tx + s * x, ty + s * ROW_Y, ease.out(k)] as const;
    });
  });
  const drop = useTransform(t, (v) => {
    const k = ease.in(Math.max(0, Math.min(1, (v - DROP[0]) / (DROP[1] - DROP[0]))));
    if (k <= 0) return '';
    const [tx, ty, s] = pose(v);
    const x = (tx + s * HERO_CX).toFixed(2);
    return `M${x} ${(ty + s * dropTop).toFixed(2)}V${(ty + s * (dropTop + (CAR_Y - dropTop) * k)).toFixed(2)}`;
  });
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      <motion.g style={{ opacity: fade, visibility: shown }}>
        <motion.path d={d} fill="none" stroke="#FE3C01" strokeWidth={LINE_PX} strokeLinecap="round" />
        {STATIONS.map((x, i) => (
          <StationDot key={x} index={i} stations={stations} />
        ))}
      </motion.g>
      <motion.path d={drop} fill="none" stroke="#FE3C01" strokeWidth={LINE_PX} strokeLinecap="round" />
    </svg>
  );
}

/** 线与设备相接处的「站」：白心橙圈，像线路图上的站点 */
function StationDot({ index, stations }: { index: number; stations: MotionValue<(readonly [number, number, number])[]> }) {
  const cx = useTransform(stations, (all) => all[index][0]);
  const cy = useTransform(stations, (all) => all[index][1]);
  const r = useTransform(stations, (all) => 6 * all[index][2]);
  return <motion.circle cx={cx} cy={cy} r={r} fill="#FFFFFF" stroke="#FE3C01" strokeWidth={3} />;
}

function CarStation() {
  const t = useFilmTime();
  const lit = useKeys(t, [DAWN[0] + 0.35, DAWN[0] + 0.95], [0, 1]);
  const litShown = useShown(lit);
  const rise = useKeys(t, [DAWN[0] + 0.35, DAWN[0] + 1.0], [60, 0], ease.out);
  const got = useKeys(t, [CAR_ROUTE_T[0] + 0.3, CAR_ROUTE_T[0] + 0.6], [0, 1]);
  return (
    <div className="absolute" style={{ left: CAR_X, top: CAR_Y, width: CAR.w, height: CAR.h }}>
      <motion.div className="absolute inset-0" style={{ opacity: lit, visibility: litShown, y: rise }}>
        <CarDisplay>
          <CarNavScreen litAt={DAWN[0] + 0.5} routeAt={CAR_ROUTE_T} />
        </CarDisplay>
        <motion.p className="absolute left-0 top-full mt-8 flex items-center gap-3 whitespace-nowrap text-[40px] text-[#241E20]/70" style={{ opacity: got }}>
          <span className="font-medium text-[#241E20]">车机导航 · 腾势 D9</span>
          <span className="inline-flex items-center gap-2 font-medium text-[#0E7A5A]">
            <CheckIcon className="h-8 w-8" />
            已收到今天的路线
          </span>
        </motion.p>
      </motion.div>
    </div>
  );
}

/* ═════════════════════ 片名字（屏幕空间，片子的排版，不是界面） ═════════════════════ */

function Titles() {
  const t = useFilmTime();
  const a = useKeys(t, [4.5, 5.0, DAWN[0] - 0.1, DAWN[0] + 0.25], [0, 1, 1, 0]);
  const aShown = useShown(a);
  const ay = useKeys(t, [4.5, 5.15], [14, 0], ease.out);
  const b = useKeys(t, [6.95, 7.45], [0, 1]);
  const bShown = useShown(b);
  const by = useKeys(t, [6.95, 7.6], [14, 0], ease.out);
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.h2 className="absolute left-[7.2vw] top-[8.4vh] font-serif text-[min(4.4vw,84px)] font-semibold leading-[1.1] tracking-[-0.02em] text-[#241E20]" style={{ opacity: a, visibility: aShown, y: ay }}>
        每一块屏，<span className="text-[#FE3C01]">同一个版本</span>。
      </motion.h2>
      <motion.div className="absolute left-[7.2vw] top-[8.4vh]" style={{ opacity: b, visibility: bShown, y: by }}>
        <p className="font-serif text-[min(4.4vw,84px)] font-semibold leading-[1.1] tracking-[-0.02em] text-[#241E20]">9 月 24 日</p>
        <p className="mt-4 text-[min(1.35vw,26px)] text-[#241E20]/70">出发当天 · 今天的路线交给车机导航</p>
      </motion.div>
    </div>
  );
}
