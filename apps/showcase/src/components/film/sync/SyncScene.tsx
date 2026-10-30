'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { layoutRect } from '@/components/stage/camera';
import { CheckIcon } from '@/components/common/Icons';
import { camAt, fitScale, shotCam, useCamera, useFilmTime, useKeys, useRaster, useShown, type Cam, type CamRef, type Frame, type Shot, type View } from '../clock';
import { CAR, CarDisplay, Dim, LAPTOP, Laptop, PHONE, Phone, Placed, TABLET, Tablet } from '../devices';
import { WorldLine, WorldStations, headAt, makeTrack, openGaps, pointAt, timeAt, type Box, type HeadMotion, type Pt, type Track } from '../line';
import { CarNavScreen, JoinToast, NominationSheet, TodaySheet, TripLaptopScreen, TripPhoneScreen, TripTabletScreen, type Joins, type Sweep } from '../screens';

/**
 * 高潮：「每一块屏，同一个版本」与「交给车机」（分镜 A7–A11，片子时钟从这一段的开头算起）
 *
 * A7 静：领队手机上只剩「加入 D0 晚上」与悬着的手指。
 * A8 点下：手机里插入的那一行亮起，一根橙线从这一行出发，沿线路图穿过全家每一块屏的同一行；线到哪块屏，哪块屏亮起、翻到 v1.1。
 *    镜头跟着线拉远（取景框始终装下领队的手机和线头前方的下一块屏）。
 * A9 全景停住：一根线串起全家的屏；大字「每一块屏，同一个版本。」
 * A10 夜里全家的屏熄灭，纸面转成清晨的冷白；只有领队的手机亮起来，时钟是 07:42，「今天的路线」升起；大字「9 月 24 日」。
 * A11 领队点「投递到车机导航」：线从手机底边落下，镜头跟着往下摇，线进车机屏的一刻交给车机导航自己的蓝色路线
 *     （车机导航带路；TripCraft 不驾驶、不读车况）。
 *
 * 横屏（16:9）与竖屏（9:16）是两张不同的「线路图」：横屏四块屏排成一行，线一笔水平穿过；
 * 竖屏两部手机并排在上、电脑与平板依次在下，线沿蛇形拐进每一块屏的同一行。不是把横屏缩小。
 */

export type Layout = 'land' | 'port';
type Dev = 'hero' | 'laptop' | 'tablet' | 'ajie';
const DEVS: readonly Dev[] = ['hero', 'laptop', 'tablet', 'ajie'];
const OTHERS: readonly Exclude<Dev, 'hero'>[] = ['laptop', 'tablet', 'ajie'];

/* ═════════════════════ 时间线（秒） ═════════════════════ */

export const T = {
  dim: [0.35, 1.2] as const,
  finger: [1.0, 1.55] as const,
  /** 推到按钮并停住：之后镜头完全静止，直到点下（静的这一刻约 0.9 秒） */
  still: 2.0,
  tap: 2.9,
  hide: [3.27, 3.55] as const,
  /** 镜头退到整部手机并停住；停住的这一刻领队手机按新的缩放重画一次，插入的一行再长出来 */
  k2: 3.71,
  open: 3.79,
  launch: 4.15,
  /** 夜里：全家的屏熄灭，停一下，然后硬切到出发当天的清晨（时间过去用剪辑交代，不让镜头扫过黑着的屏） */
  night: [10.65, 11.2] as const,
  dawnCam: [11.35, 11.351] as const,
  dawn: [11.35, 11.6] as const,
  /** 清晨：领队的手机在晨光里亮起（熄屏期间时钟已经换成早上） */
  clock: 11.4,
  wake: [11.75, 12.15] as const,
  todayIn: [12.5, 12.95] as const,
  carIn: [13.15, 13.75] as const,
  finger2: [13.35, 13.75] as const,
  dispatch: 14.05,
  drop: [14.15, 14.55] as const,
  /** 镜头跟着落下的线往下摇，停在车机上 */
  carCam: [14.0, 15.3] as const,
  route: [14.55, 15.8] as const,
  end: 18.6,
};

const HEAD: HeadMotion = { launch: T.launch, speed: 1700, ramp: 0.3 };

/* ═════════════════════ 量取 ═════════════════════ */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Measure {
  /** 每块屏里插入的那一行（设备内坐标） */
  row: Record<Dev, Rect>;
  /** 领队手机上的「加入 D0 晚上」「投递到车机导航」与行程封面 */
  cta: Rect;
  dispatch: Rect;
  cover: Rect;
}

/** 首帧的估算值（挂载后按真实排版量取） */
const GUESS: Measure = {
  row: {
    hero: { x: 44, y: 266, w: 326, h: 44 },
    ajie: { x: 44, y: 266, w: 326, h: 44 },
    laptop: { x: 300, y: 291, w: 594, h: 42 },
    tablet: { x: 62, y: 256, w: 438, h: 44 },
  },
  cta: { x: 174, y: 772, w: 208, h: 48 },
  dispatch: { x: 32, y: 772, w: 350, h: 48 },
  cover: { x: 32, y: 78, w: 44, h: 44 },
};

const ROW_H: Record<Dev, number> = { hero: 44, ajie: 44, laptop: 42, tablet: 44 };
const SIZE: Record<Dev, { w: number; h: number }> = { hero: PHONE, ajie: PHONE, laptop: LAPTOP, tablet: TABLET };
/** 电脑的线只穿过屏幕盖（底座在下面） */
const LID = (LAPTOP.w - LAPTOP.lidW) / 2;

/* ═════════════════════ 两张线路图 ═════════════════════ */

interface World {
  pos: Record<Dev, Pt>;
  /** 挡住线的外框（世界坐标） */
  box: Record<Dev, Box>;
  /** 整块设备的外框（取景用） */
  body: Record<Dev, Box>;
  track: Track;
  gaps: [number, number][];
  stations: number[];
  /** 线进、出这块屏的轨道距离 */
  span: Record<Dev, [number, number]>;
  /** 屏里那一行被线扫过的轨道距离（按线走的顺序） */
  sweep: Record<Dev, [number, number]>;
  from: Record<Dev, Sweep['from']>;
  car: Pt;
  /** 线头走完全部屏之后的距离：取景框不再随线头扩大 */
  dDone: number;
  base: Box;
  final: Box;
  lead: { ahead: number; side: number; ramp: number };
  /** 片名在画面顶部占的比例（全景时） */
  titleTop: number;
  labels: { id: Dev; name: string; x: number; y: number; anchor: 'left' | 'center' }[];
  dawnBox: Box;
  carBox: Box;
}

const NAMES: Record<Dev, string> = { hero: '我的手机 · 领队', laptop: '我的电脑', tablet: '小雨的平板', ajie: '阿杰的手机' };
/** 竖屏画面很窄时（手机上）并排两部手机的标签用短名 */
const SHORT: Record<Dev, string> = { hero: '领队', laptop: '我的电脑', tablet: '小雨的平板', ajie: '阿杰' };

const boxOf = (x: number, y: number, w: number, h: number): Box => ({ x0: x, y0: y, x1: x + w, y1: y + h });
const pad = (b: Box, l: number, t: number, r = l, btm = t): Box => ({ x0: b.x0 - l, y0: b.y0 - t, x1: b.x1 + r, y1: b.y1 + btm });
const union = (a: Box, b: Box): Box => ({ x0: Math.min(a.x0, b.x0), y0: Math.min(a.y0, b.y0), x1: Math.max(a.x1, b.x1), y1: Math.max(a.y1, b.y1) });
const clampTo = (b: Box, lim: Box): Box => ({ x0: Math.max(b.x0, lim.x0), y0: Math.max(b.y0, lim.y0), x1: Math.min(b.x1, lim.x1), y1: Math.min(b.y1, lim.y1) });
const lerpBox = (a: Box, b: Box, k: number): Box => ({ x0: a.x0 + (b.x0 - a.x0) * k, y0: a.y0 + (b.y0 - a.y0) * k, x1: a.x1 + (b.x1 - a.x1) * k, y1: a.y1 + (b.y1 - a.y1) * k });
const frameOf = (b: Box): Frame => ({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 });

/** 车机地图上路线的起点（CAR_ROUTE 的 M520 …，地图占屏宽的 1.55/2.55）离车机外框左边的距离 */
const CAR_ROUTE_X = CAR.bezel + ((CAR.screenW * 1.55) / 2.55) * (520 / 700);

/** 线沿轨道穿过一个外框的区间 */
function spanOf(tr: Track, b: Box): [number, number] {
  const g = openGaps(tr, [b]);
  // openGaps 返回露出的区间；被挡住的就是两段露出之间的那一段
  const hid: [number, number] = [0, tr.len];
  for (const [a, e] of g) {
    if (a <= 0.01) hid[0] = e;
    else {
      hid[1] = a;
      break;
    }
  }
  return hid;
}

function buildWorld(layout: Layout, m: Measure): World {
  const pos = {} as Record<Dev, Pt>;
  let points: Pt[];
  let radius = 0;
  let rowY: Record<Dev, number>;
  const rowOff = (d: Dev) => m.row[d].y + ROW_H[d] / 2;

  if (layout === 'land') {
    const G = 260;
    const ROW = 0;
    pos.hero = { x: 0, y: ROW - rowOff('hero') };
    pos.laptop = { x: PHONE.w + G - LID, y: ROW - rowOff('laptop') };
    pos.tablet = { x: pos.laptop.x + LID + LAPTOP.lidW + G, y: ROW - rowOff('tablet') };
    pos.ajie = { x: pos.tablet.x + TABLET.w + G, y: ROW - rowOff('ajie') };
    rowY = { hero: ROW, laptop: ROW, tablet: ROW, ajie: ROW };
    points = [
      { x: pos.hero.x + m.row.hero.x - 8, y: ROW },
      { x: pos.ajie.x + PHONE.w + 3200, y: ROW },
    ];
  } else {
    const GX = 220;
    const GV = 210;
    const R = 800;
    const L = -800;
    radius = 90;
    pos.hero = { x: -(PHONE.w + GX / 2), y: -rowOff('hero') };
    pos.ajie = { x: GX / 2, y: -rowOff('ajie') };
    const tier2 = pos.hero.y + PHONE.h + GV;
    pos.laptop = { x: -LAPTOP.w / 2, y: tier2 };
    const tier3 = tier2 + LAPTOP.h + GV;
    pos.tablet = { x: -TABLET.w / 2, y: tier3 };
    rowY = { hero: 0, ajie: 0, laptop: tier2 + rowOff('laptop'), tablet: tier3 + rowOff('tablet') };
    points = [
      { x: pos.hero.x + m.row.hero.x - 8, y: 0 },
      { x: R, y: 0 },
      { x: R, y: rowY.laptop },
      { x: L, y: rowY.laptop },
      { x: L, y: rowY.tablet },
      { x: R, y: rowY.tablet },
      { x: R, y: rowY.tablet + 2600 },
    ];
  }

  const body = {} as Record<Dev, Box>;
  const box = {} as Record<Dev, Box>;
  for (const d of DEVS) {
    body[d] = boxOf(pos[d].x, pos[d].y, SIZE[d].w, SIZE[d].h);
    box[d] = d === 'laptop' ? boxOf(pos[d].x + LID, pos[d].y, LAPTOP.lidW, LAPTOP.lidH) : body[d];
  }
  const track = makeTrack(points, radius);
  const gaps = openGaps(
    track,
    DEVS.map((d) => box[d]),
  );
  const span = {} as Record<Dev, [number, number]>;
  const sweep = {} as Record<Dev, [number, number]>;
  const from = {} as Record<Dev, Sweep['from']>;
  for (const d of DEVS) {
    span[d] = d === 'hero' ? [0, gaps[0][0]] : spanOf(track, box[d]);
    // 这一行左右两端在轨道上的距离：线穿过这块屏时，沿行进方向先碰到的那一端是起点
    const p0 = pointAt(track, span[d][0]);
    const p1 = pointAt(track, span[d][1]);
    const goingRight = p1.x >= p0.x;
    const rx0 = pos[d].x + m.row[d].x - 8;
    const rx1 = pos[d].x + m.row[d].x + m.row[d].w + 8;
    const enterX = goingRight ? rx0 : rx1;
    const exitX = goingRight ? rx1 : rx0;
    sweep[d] = [span[d][0] + Math.abs(enterX - p0.x), span[d][0] + Math.abs(exitX - p0.x)];
    from[d] = goingRight ? 'left' : 'right';
  }
  sweep.hero = [0, m.row.hero.w + 16];
  const stations = gaps.flatMap(([a, b]) => [a, b]).filter((d) => d > 1 && d < track.len - 1);
  const last = layout === 'land' ? 'ajie' : 'tablet';
  const dDone = span[last][1] + 120;

  const all = DEVS.map((d) => body[d]).reduce(union);
  // 车机：放在领队手机正下方，地图上路线的起点正对手机中线
  const heroCx = pos.hero.x + PHONE.w / 2;
  const car = { x: heroCx - CAR_ROUTE_X, y: body.hero.y1 + (layout === 'land' ? 250 : 230) };
  const carBody = boxOf(car.x, car.y, CAR.w, CAR.h);

  let base: Box;
  let final: Box;
  let lead: World['lead'];
  let titleTop: number;
  let labels: World['labels'];
  let dawnBox: Box;
  let carBox: Box;
  if (layout === 'land') {
    final = pad(all, 230, 170, 230, 210);
    // 线出发前：领队的手机在画面正中，右边露出一截待机的电脑
    base = pad(body.hero, 560, 70, 560, 70);
    lead = { ahead: 560, side: 320, ramp: 760 };
    titleTop = 0.1;
    const labelY = all.y1 + 46;
    labels = DEVS.map((d) => ({ id: d, name: NAMES[d], x: d === 'laptop' ? box.laptop.x0 : body[d].x0, y: labelY, anchor: 'left' as const }));
    // 出发当天：先是领队手机的中景（左边留给「9 月 24 日」），再跟着线往下摇到车机
    dawnBox = { x0: heroCx - 1380, y0: body.hero.y0 - 110, x1: heroCx + 360, y1: body.hero.y1 + 110 };
    carBox = pad(carBody, 200, 250, 200, 170);
  } else {
    final = pad(union(all, { x0: -800, y0: all.y0, x1: 800, y1: all.y1 }), 110, 90, 110, 240);
    base = pad(body.hero, 70, 70);
    lead = { ahead: 420, side: 420, ramp: 640 };
    titleTop = 0.19;
    labels = [
      { id: 'hero', name: NAMES.hero, x: body.hero.x0 + PHONE.w / 2, y: body.hero.y1 + 40, anchor: 'center' },
      { id: 'ajie', name: NAMES.ajie, x: body.ajie.x0 + PHONE.w / 2, y: body.ajie.y1 + 40, anchor: 'center' },
      { id: 'laptop', name: NAMES.laptop, x: 0, y: body.laptop.y1 + 40, anchor: 'center' },
      { id: 'tablet', name: NAMES.tablet, x: 0, y: body.tablet.y1 + 40, anchor: 'center' },
    ];
    dawnBox = pad(body.hero, 90, 80, 90, 120);
    carBox = pad(union(body.hero, carBody), 60, 60, 60, 220);
  }
  return { pos, box, body, track, gaps, stations, span, sweep, from, car, dDone, base, final, lead, titleTop, labels, dawnBox, carBox };
}

/* ═════════════════════ 镜头 ═════════════════════ */

/** 跟着线头的取景框：装下领队的手机、线头前方一段，以及线头即将到达（渐进）和已经到过的每一块屏 */
function followBox(w: World, h: number): Box {
  const hh = Math.min(h, w.dDone);
  const p = pointAt(w.track, hh);
  const around = { x0: p.x - w.lead.ahead, y0: p.y - w.lead.side, x1: p.x + w.lead.ahead, y1: p.y + w.lead.side };
  let b = union(w.base, around);
  for (const d of OTHERS) {
    const k = ease.smooth(Math.max(0, Math.min(1, (hh - (w.span[d][0] - w.lead.ramp)) / w.lead.ramp)));
    if (k > 0) b = union(b, lerpBox(around, w.body[d], k));
  }
  // 线头走完之后取景框收成最终的全景
  const k = ease.smooth(Math.max(0, Math.min(1, (h - w.dDone + 400) / 400)));
  if (k > 0) b = lerpBox(b, w.final, k);
  return clampTo(b, union(w.final, w.base));
}

/** 高潮的第一个机位：提名卡的下半（AI 的三条代价 + 按钮） */
export function macroStart(w: World, m: Measure, layout: Layout): Frame {
  const heroCx = w.pos.hero.x + PHONE.w / 2;
  const ctaY = w.pos.hero.y + m.cta.y + m.cta.h / 2;
  return layout === 'land' ? { x: heroCx, y: ctaY - 150, w: 640, h: 360 } : { x: heroCx, y: ctaY - 230, w: 440, h: 782 };
}

function makeCamera(w: World, m: Measure, layout: Layout) {
  const heroCx = w.pos.hero.x + PHONE.w / 2;
  const cta = { x: w.pos.hero.x + m.cta.x + m.cta.w / 2, y: w.pos.hero.y + m.cta.y + m.cta.h / 2 };
  const land = layout === 'land';
  // 微距：提名卡的下半（AI 的三条代价 + 按钮）→ 推到按钮
  const m0 = macroStart(w, m, layout);
  const m1: Frame = land ? { x: cta.x - 40, y: cta.y - 40, w: 580, h: 326 } : { x: heroCx + 30, y: cta.y - 120, w: 390, h: 693 };
  const k2 = frameOf(followBox(w, 0));
  const macro: Shot[] = [
    { t: 0, f: m0 },
    { t: T.still, from: 0.2, f: m1, ease: ease.smooth },
    { t: T.k2, from: T.tap + 0.4, f: k2, ease: ease.out },
  ];
  const finalF = frameOf(w.final);
  const tail: Shot[] = [
    { t: T.dawnCam[0], f: finalF, top: w.titleTop },
    { t: T.dawnCam[1], from: T.dawnCam[0], f: frameOf(w.dawnBox), top: land ? 0 : 0.2, ease: ease.linear },
    { t: T.carCam[1], from: T.carCam[0], f: frameOf(w.carBox), ease: ease.smooth },
  ];
  const follow = (v: number, V: View): Cam => {
    const h = headAt(HEAD, v);
    const b = followBox(w, h);
    const k = Math.max(0, Math.min(1, h / w.dDone));
    const top = w.titleTop * ease.smooth(k);
    const f = frameOf(b);
    return camAt(f.x, f.y, fitScale(f, V, top), V, top);
  };
  const raw = (v: number, V: View): Cam => {
    if (v < T.launch) return shotCam(v, macro, V);
    if (v < T.dawnCam[0]) return follow(v, V);
    return shotCam(v, tail, V);
  };
  // 跟拍段做时间上的平滑（三角窗）：线头带着镜头走，但起步与停稳都是缓的。
  // 窗口从起跑那一刻的 0 逐渐放宽，保证与前面的推拉首尾相接
  const N = 9;
  const end = T.dawnCam[0] - 0.05;
  const smooth = (v: number, V: View): Cam => {
    const W = Math.min(0.35, v - T.launch, end - v);
    if (W <= 0.001) return raw(v, V);
    let tx = 0;
    let ty = 0;
    let s = 0;
    let sum = 0;
    for (let i = 0; i < N; i++) {
      const u = -1 + (2 * i) / (N - 1);
      const wt = 1 - Math.abs(u) + 1e-3;
      const c = raw(v + u * W, V);
      tx += c[0] * wt;
      ty += c[1] * wt;
      s += c[2] * wt;
      sum += wt;
    }
    return [tx / sum, ty / sum, s / sum];
  };
  // 同一帧里世界层、标签都要用镜头：按时刻缓存，一帧只算一次
  let lastV = Number.NaN;
  let lastView: View | null = null;
  let last: Cam = [0, 0, 1];
  return (v: number, V: View): Cam => {
    if (v !== lastV || V !== lastView) {
      last = smooth(v, V);
      lastV = v;
      lastView = V;
    }
    return last;
  };
}

/** 每块屏（连同投影）第一次进画面的时刻：在这之前它的栅格倍数随镜头走（不在画面里，不花栅格化的工夫），进画面起固定 */
function entryTimes(w: World, cam: (v: number, V: View) => Cam, V: View): Record<Exclude<Dev, 'hero'>, number> {
  const out = {} as Record<Exclude<Dev, 'hero'>, number>;
  for (const d of OTHERS) {
    const b = pad(w.body[d], 70, 70);
    out[d] = T.dawnCam[0];
    for (let v = 0; v < T.dawnCam[0]; v += 1 / 120) {
      const c = cam(v, V);
      const x0 = c[0] + c[2] * b.x0;
      const x1 = c[0] + c[2] * b.x1;
      const y0 = c[1] + c[2] * b.y0;
      const y1 = c[1] + c[2] * b.y1;
      if (x1 > 0 && x0 < V.w && y1 > 0 && y0 < V.h) {
        out[d] = Math.max(0, v - 1 / 60);
        break;
      }
    }
  }
  return out;
}

/** 全景停稳的时刻（标签、片名、重新栅格化都以它为准） */
const wideAt = (w: World) => timeAt(HEAD, w.dDone) + 0.6;

/* ═════════════════════ 场景 ═════════════════════ */

/** 夜里熄屏的暗度；线到之前待机的暗度 */
const NIGHT = 0.74;
const IDLE = 0.62;
/** 线到之前待机、线到时亮起、夜里熄屏 */
const wakeThenNight = (at: number) => ({ keys: [at - 0.02, at + 0.32, T.night[0], T.night[1]], values: [IDLE, 0, 0, NIGHT] });

/** 量取每块屏里「插入行」、领队手机上的两个按钮与封面（设备内坐标），线和镜头都以它为准 */
export function measureSync(root: HTMLElement): Measure {
  const next: Measure = { row: { ...GUESS.row }, cta: GUESS.cta, dispatch: GUESS.dispatch, cover: GUESS.cover };
  for (const d of DEVS) {
    const dev = root.querySelector<HTMLElement>(`[data-dev="${d}"]`);
    const row = dev?.querySelector<HTMLElement>('[data-row-anchor]');
    const r = dev && row ? layoutRect(dev, row) : null;
    if (r) next.row[d] = { ...r, h: ROW_H[d] };
  }
  const hero = root.querySelector<HTMLElement>('[data-dev="hero"]');
  for (const k of ['cta', 'dispatch', 'cover'] as const) {
    const el = hero?.querySelector<HTMLElement>(`[data-anchor="${k}"]`);
    const r = hero && el ? layoutRect(hero, el) : null;
    if (r) next[k] = r;
  }
  return next;
}

/** 挂载后（以及网络字体到了之后）量一次；结果没变就不触发重渲染 */
export function useMeasured<M>(root: { current: HTMLElement | null }, measure: (el: HTMLElement) => M, initial: M, deps: readonly unknown[]) {
  const [m, setM] = useState<M>(initial);
  useLayoutEffect(() => {
    const run = () => {
      if (!root.current) return;
      const next = measure(root.current);
      setM((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    run();
    document.fonts?.ready.then(run, () => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return m;
}

export interface SyncModel {
  layout: Layout;
  w: World;
  m: Measure;
  /** 这一段自己的镜头（时间从高潮的 0 秒算） */
  camFn: (v: number, V: View) => Cam;
  wide: number;
  entry: Record<Exclude<Dev, 'hero'>, number>;
  /** 线粗（世界坐标）：全景里不细于 2.2px */
  lw: number;
}

export function useSyncModel(layout: Layout, view: View, m: Measure): SyncModel {
  const w = useMemo(() => buildWorld(layout, m), [layout, m]);
  const camFn = useMemo(() => makeCamera(w, m, layout), [w, m, layout]);
  const entry = useMemo(() => entryTimes(w, camFn, view), [w, camFn, view]);
  const lw = Math.max(7, 2.2 / fitScale(frameOf(w.final), view, w.titleTop));
  return { layout, w, m, camFn, wide: wideAt(w), entry, lw };
}

/** 高潮之前在领队手机里发生的事（A5–A6，时刻相对高潮的 0 秒，都是负数） */
export interface Prelude {
  /** 线走进手机、屏亮起来 */
  wake: number;
  joins: Joins;
  /** 阿杰的提名卡升起、AI 评估三条依次算出 */
  sheetIn: number;
  evalAt: readonly [number, number, number];
  /** 镜头在这两个时刻停住：整部手机、推到提名卡（领队手机按当时的缩放各重画一次） */
  settle: readonly number[];
  /** 领队的手机第一次进画面的时刻：在这之前不渲染，也不按开场的微距倍数栅格化 */
  heroFrom: number;
}

/** 世界里的内容：线、车机、四块屏、站点 */
export function SyncWorld({ model, prelude }: { model: SyncModel; prelude?: Prelude }) {
  const t = useFilmTime();
  const { w, wide, entry, lw } = model;
  // 时刻表：线进每块屏（亮起、翻到 v1.1）、扫过那一行
  const enter = (d: Dev) => timeAt(HEAD, w.span[d][0]);
  const sweepT = (d: Dev): Sweep => ({ from: w.from[d], t: [timeAt(HEAD, w.sweep[d][0]), timeAt(HEAD, w.sweep[d][1])] });
  // 别的屏里这一行的位置一开始就留好（卡片底部多出一行的空白，看上去就是卡片的留白），线到时只擦出高亮与字：
  // 整片里这几块屏不发生重排，镜头推拉时不必重画
  const rowAt = () => -1;
  // 栅格：领队的手机在镜头静止的时刻各按当时的缩放重画一次——推到按钮停住时、退到整部手机停住时、全景停稳时。
  // 其余的屏在进画面之前不渲染，进画面的那一刻起固定栅格，之后镜头再拉远只由合成器缩小；
  // 电脑在退到整部手机之前就进了画面，停住时也跟着重画一次
  const settle = (a: number): readonly [number, number] => [a, a + 0.06];
  const freshHero = [...(prelude ? [[-1e6, prelude.heroFrom] as const] : []), ...(prelude?.settle ?? []).map(settle), settle(T.still + 0.15), settle(T.k2), settle(wide)];
  const freshOf = (d: Exclude<Dev, 'hero'>): (readonly [number, number])[] => [[-1e6, entry[d]], ...(entry[d] < T.k2 ? [settle(T.k2)] : []), settle(wide)];
  // 熄屏之后，别的屏随镜头离开画面，再悄悄退场（不在画面里留下半透明的残影）
  const othersOut = useKeys(t, [T.dawnCam[0] - 0.001, T.dawnCam[0]], [1, 0], ease.linear);
  const lineOut = useKeys(t, [T.dawnCam[0] - 0.001, T.dawnCam[0]], [1, 0], ease.linear);
  const sheetDim = useKeys(t, [T.dim[0], T.dim[1]], [1, 0.14]);
  // 领队的手机：线走进来之前是暗的；夜里熄屏，清晨镜头到位后亮起
  const heroDim = prelude
    ? { keys: [prelude.wake - 0.02, prelude.wake + 0.4, T.night[0], T.night[1], T.wake[0], T.wake[1]], values: [0.86, 0, 0, NIGHT, NIGHT, 0] }
    : { keys: [T.night[0], T.night[1], T.wake[0], T.wake[1]], values: [0, NIGHT, NIGHT, 0] };
  return (
    <>
      <WorldLine track={w.track} gaps={w.gaps} motion={HEAD} width={lw} fade={lineOut} />
      <DropLine w={w} width={lw} />
      <CarStation w={w} />
      <Placed id="hero" x={w.pos.hero.x} y={w.pos.hero.y} w={PHONE.w} h={PHONE.h} fresh={freshHero} from={prelude?.heroFrom}>
        <Phone>
          <TripPhoneScreen updateAt={T.hide[0]} open={T.open} sweep={sweepT('hero')} dawn={{ at: T.clock, time: '07:42' }} joins={prelude?.joins}>
            {prelude ? (
              <>
                <JoinToast
                  at={prelude.joins.ajie}
                  names={[
                    { name: '阿杰', tone: 'teal' },
                    { name: '小雨', tone: 'rose' },
                  ]}
                />
              </>
            ) : null}
            <NominationSheet tapAt={T.tap} approach={T.finger} hideAt={T.hide} dim={sheetDim} inAt={prelude?.sheetIn} evalAt={prelude?.evalAt} />
            <TodaySheet inAt={T.todayIn} tapAt={T.dispatch} approach={T.finger2} />
          </TripPhoneScreen>
          <Dim {...heroDim} />
        </Phone>
      </Placed>
      <Placed id="laptop" x={w.pos.laptop.x} y={w.pos.laptop.y} w={LAPTOP.w} h={LAPTOP.h} fresh={freshOf('laptop')} from={entry['laptop']} opacity={othersOut}>
        <Laptop>
          <TripLaptopScreen updateAt={enter('laptop')} open={rowAt()} grow={0} sweep={sweepT('laptop')} />
          <Dim {...wakeThenNight(enter('laptop'))} />
        </Laptop>
      </Placed>
      <Placed id="tablet" x={w.pos.tablet.x} y={w.pos.tablet.y} w={TABLET.w} h={TABLET.h} fresh={freshOf('tablet')} from={entry['tablet']} opacity={othersOut}>
        <Tablet>
          <TripTabletScreen updateAt={enter('tablet')} open={rowAt()} grow={0} sweep={sweepT('tablet')} />
          <Dim {...wakeThenNight(enter('tablet'))} />
        </Tablet>
      </Placed>
      <Placed id="ajie" x={w.pos.ajie.x} y={w.pos.ajie.y} w={PHONE.w} h={PHONE.h} fresh={freshOf('ajie')} from={entry['ajie']} opacity={othersOut}>
        <Phone>
          <TripPhoneScreen updateAt={enter('ajie')} open={rowAt()} grow={0} sweep={sweepT('ajie')} time="21:07" />
          <Dim {...wakeThenNight(enter('ajie'))} />
        </Phone>
      </Placed>
      <WorldStations track={w.track} at={w.stations} motion={HEAD} width={lw} fade={lineOut} />
    </>
  );
}

/** 屏幕空间的叠层：屏下标签、片名 */
export function SyncOverlays({ model, cam, view }: { model: SyncModel; cam: CamRef; view: View }) {
  return (
    <>
      <Labels cam={cam} w={model.w} view={view} layout={model.layout} wide={model.wide} />
      <Titles layout={model.layout} view={view} wide={model.wide} />
    </>
  );
}

/** 高潮里线进每块屏的时刻（这一段自己的时间；声音按它们触发） */
export function syncBeats(model: SyncModel) {
  const enter = (d: Dev) => timeAt(HEAD, model.w.span[d][0]);
  return { laptop: enter('laptop'), tablet: enter('tablet'), ajie: enter('ajie'), wide: model.wide };
}

export const BG_NIGHT = '#FFFFF9';
export const BG_DAWN = '#EEF1F2';

/** 实验页用：单独播高潮 */
export function SyncScene({ layout, view }: { layout: Layout; view: View }) {
  const t = useFilmTime();
  const worldRef = useRef<HTMLDivElement>(null);
  const m = useMeasured(worldRef, measureSync, GUESS, [layout]);
  const model = useSyncModel(layout, view, m);
  const { transform, cam } = useCamera(t, model.camFn, view);
  // 晨光：一层清晨冷白的底色淡入（只改透明度；直接改底色会每一帧重画整个画面）
  const dawnIn = useKeys(t, [T.dawn[0], T.dawn[1]], [0, 1]);
  return (
    <div data-film className="absolute inset-0 overflow-hidden" style={{ background: BG_NIGHT }}>
      <motion.div aria-hidden className="absolute inset-0" style={{ background: BG_DAWN, opacity: dawnIn, willChange: 'opacity' }} />
      <motion.div ref={worldRef} className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0' }}>
        <SyncWorld model={model} />
      </motion.div>
      <SyncOverlays model={model} cam={cam} view={view} />
    </div>
  );
}

export { GUESS as SYNC_GUESS, HEAD as SYNC_HEAD, frameOf, pad, union, boxOf };
export type { World as SyncWorldModel, Dev as SyncDev };

/* ═════════════════════ 车机 ═════════════════════ */

function CarStation({ w }: { w: World }) {
  const t = useFilmTime();
  const ref = useRef<HTMLDivElement>(null);
  // 镜头往下摇到车机时只由合成器放大，停稳后按最终的缩放重画一次
  useRaster(ref, [[0, T.carIn[0]], [T.carCam[1] + 0.05, T.carCam[1] + 0.11]]);
  const lit = useKeys(t, [T.carIn[0], T.carIn[1]], [0, 1]);
  const rise = useKeys(t, [T.carIn[0], T.carIn[1]], [70, 0], ease.out);
  const riseT = useTransform(rise, (v) => `translate3d(0, ${v.toFixed(2)}px, 0)`);
  const shown = useShown(lit);
  const rendered = useTransform(lit, (v) => (v <= 0.001 ? 'hidden' : 'visible'));
  return (
    <motion.div ref={ref} data-dev="car" className="absolute" style={{ left: w.car.x, top: w.car.y, width: CAR.w, height: CAR.h, opacity: lit, visibility: shown, contentVisibility: rendered, transform: riseT }}>
      <CarDisplay>
        <CarNavScreen litAt={T.carIn[0] + 0.2} routeAt={T.route} />
      </CarDisplay>
    </motion.div>
  );
}

/** 出发当天：线从领队手机底边落下，进车机屏的一刻停在屏的上沿，交给车机导航自己的蓝色路线 */
function DropLine({ w, width }: { w: World; width: number }) {
  const t = useFilmTime();
  const x = w.pos.hero.x + PHONE.w / 2;
  const y0 = w.body.hero.y1;
  const y1 = w.car.y + CAR.bezel;
  const k = useTransform(t, (v) => ease.in(Math.max(0, Math.min(1, (v - T.drop[0]) / (T.drop[1] - T.drop[0])))));
  const transform = useTransform(k, (n) => `scaleY(${n.toFixed(4)})`);
  const visibility = useTransform(k, (n) => (n <= 0 ? 'hidden' : 'visible'));
  return <motion.span className="pointer-events-none absolute" style={{ left: x - width / 2, top: y0, width, height: y1 - y0, background: '#FE3C01', transform, transformOrigin: 'center top', visibility, willChange: 'transform' }} />;
}

/* ═════════════════════ 片子的说明字（屏幕空间，不随镜头缩放，字号不低于 13px） ═════════════════════ */

function Labels({ cam, w, view, layout, wide }: { cam: CamRef; w: World; view: View; layout: Layout; wide: number }) {
  const size = Math.max(13, Math.round(layout === 'land' ? view.w / 100 : view.w / 40));
  return (
    <div className="pointer-events-none absolute inset-0">
      {w.labels.map((l) => (
        <Label key={l.id} cam={cam} x={l.x} y={l.y} anchor={l.anchor} name={layout === 'port' && view.w < 700 ? SHORT[l.id] : l.name} size={size} wide={wide} />
      ))}
      <CarLabel cam={cam} w={w} size={size} />
    </div>
  );
}

/** 跟着镜头走的屏幕坐标；只在 [from, to] 这段（标签看得见的时候）逐帧更新，其余时间不动，不触发样式与图层更新 */
function useScreenPos(cam: CamRef, x: number, y: number, from: number, to: number) {
  const t = useFilmTime();
  return useTransform(t, (v) => {
    const c = cam.current.fn(Math.max(from, Math.min(to, v)), cam.current.view);
    return `translate3d(${(c[0] + c[2] * x).toFixed(1)}px, ${(c[1] + c[2] * y).toFixed(1)}px, 0)`;
  });
}

function Label({ cam, x, y, anchor, name, size, wide }: { cam: CamRef; x: number; y: number; anchor: 'left' | 'center'; name: string; size: number; wide: number }) {
  const t = useFilmTime();
  const fade = useKeys(t, [wide - 0.1, wide + 0.35, T.night[0] - 0.1, T.night[0] + 0.25], [0, 1, 1, 0]);
  const shown = useShown(fade);
  const transform = useScreenPos(cam, x, y, wide - 0.1, T.night[0] + 0.25);
  return (
    <motion.div className="absolute left-0 top-0" style={{ transform, opacity: fade, visibility: shown }}>
      <p className={`flex items-center whitespace-nowrap leading-[1.3] text-[#241E20]/70 ${anchor === 'center' ? '-translate-x-1/2' : ''}`} style={{ fontSize: size, gap: size * 0.45 }}>
        <span className="font-medium text-[#241E20]">{name}</span>
        <span className="inline-flex items-center font-medium tabular-nums text-[#0E7A5A]" style={{ gap: size * 0.2 }}>
          <CheckIcon style={{ width: size * 0.9, height: size * 0.9 }} />
          v1.1
        </span>
      </p>
    </motion.div>
  );
}

function CarLabel({ cam, w, size }: { cam: CamRef; w: World; size: number }) {
  const t = useFilmTime();
  const fade = useKeys(t, [T.route[0] + 0.5, T.route[0] + 0.9], [0, 1]);
  const shown = useShown(fade);
  const transform = useScreenPos(cam, w.car.x, w.car.y + CAR.h + 30, T.route[0] + 0.5, T.end);
  return (
    <motion.div className="absolute left-0 top-0" style={{ transform, opacity: fade, visibility: shown }}>
      <p className="flex items-center whitespace-nowrap leading-[1.3] text-[#241E20]/70" style={{ fontSize: size, gap: size * 0.45 }}>
        <span className="font-medium text-[#241E20]">车机导航 · 腾势 D9</span>
        <span className="inline-flex items-center font-medium text-[#0E7A5A]" style={{ gap: size * 0.2 }}>
          <CheckIcon style={{ width: size * 0.9, height: size * 0.9 }} />
          收到今天的路线，由车机导航带路
        </span>
      </p>
    </motion.div>
  );
}

/* ═════════════════════ 片名（屏幕空间的大字） ═════════════════════ */

function Titles({ layout, view, wide }: { layout: Layout; view: View; wide: number }) {
  const t = useFilmTime();
  const a = useKeys(t, [wide + 0.15, wide + 0.7, T.night[0] - 0.3, T.night[0] + 0.05], [0, 1, 1, 0]);
  const aShown = useShown(a);
  const ay = useKeys(t, [wide + 0.15, wide + 0.85], [12, 0], ease.out);
  const b = useKeys(t, [T.wake[0] + 0.2, T.wake[0] + 0.75, T.carCam[0], T.carCam[0] + 0.35], [0, 1, 1, 0]);
  const bShown = useShown(b);
  const by = useKeys(t, [T.wake[0] + 0.2, T.wake[0] + 0.9], [12, 0], ease.out);
  const land = layout === 'land';
  const big = land ? Math.min(view.w * 0.044, (view.h * 16 * 0.044) / 9) : view.w * 0.088;
  const small = Math.max(14, big * (land ? 0.3 : 0.32));
  const left = land ? view.w * 0.072 : view.w * 0.08;
  const top = land ? view.h * 0.085 : view.h * 0.055;
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.h2 className="absolute font-serif font-semibold leading-[1.12] tracking-[-0.02em] text-[#241E20]" style={{ left, top, fontSize: big, opacity: a, visibility: aShown, y: ay }}>
        每一块屏，{land ? null : <br />}
        <span className="text-[#FE3C01]">同一个版本</span>。
      </motion.h2>
      <motion.div className="absolute" style={{ left, top, opacity: b, visibility: bShown, y: by }}>
        <p className="font-serif font-semibold leading-[1.12] tracking-[-0.02em] text-[#241E20]" style={{ fontSize: big }}>
          9 月 24 日
        </p>
        <p className="text-[#241E20]/70" style={{ fontSize: small, marginTop: big * 0.22 }}>
          出发当天 · 今天的路线交给车机导航
        </p>
      </motion.div>
    </div>
  );
}
