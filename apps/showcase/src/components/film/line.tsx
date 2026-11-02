'use client';

import type { ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease } from '@/lib/motion';
import { useFilmTime, useShown, type Cam } from './clock';

/**
 * 那一根线：世界坐标里的一条「线路图」轨道（水平、竖直、圆角转弯），线头以恒定速度沿轨道走。
 * 线只画在屏与屏之间的空隙里；经过一块屏时被屏遮住，由屏里那一行的高亮接上（SHOWCASE §4，片子的语言，不是界面）。
 */

export interface Pt {
  x: number;
  y: number;
}

interface Seg {
  kind: 'L';
  a: Pt;
  b: Pt;
  d0: number;
  len: number;
}

interface Arc {
  kind: 'A';
  c: Pt;
  r: number;
  a0: number;
  /** 转过的角度（带符号；屏幕坐标 y 向下，正值为顺时针） */
  da: number;
  d0: number;
  len: number;
}

type Prim = Seg | Arc;

export interface Track {
  prims: Prim[];
  len: number;
}

export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

const unit = (a: Pt, b: Pt): Pt => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const l = Math.hypot(dx, dy) || 1;
  return { x: dx / l, y: dy / l };
};

/** 折线 → 轨道：直角转弯处换成半径 r 的四分之一圆弧 */
export function makeTrack(points: readonly Pt[], r: number): Track {
  const prims: Prim[] = [];
  let d = 0;
  let cur = points[0];
  const line = (a: Pt, b: Pt) => {
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (len > 0.01) prims.push({ kind: 'L', a, b, d0: d, len });
    d += len;
  };
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const next = points[i + 1];
    if (!next) {
      line(cur, p);
      break;
    }
    const u = unit(cur, p);
    const v = unit(p, next);
    const start = { x: p.x - u.x * r, y: p.y - u.y * r };
    const end = { x: p.x + v.x * r, y: p.y + v.y * r };
    line(cur, start);
    const c = { x: start.x + v.x * r, y: start.y + v.y * r };
    const a0 = Math.atan2(start.y - c.y, start.x - c.x);
    const cross = u.x * v.y - u.y * v.x;
    const da = (cross > 0 ? 1 : -1) * (Math.PI / 2);
    const len = (r * Math.PI) / 2;
    prims.push({ kind: 'A', c, r, a0, da, d0: d, len });
    d += len;
    cur = end;
  }
  return { prims, len: d };
}

const arcPt = (p: Arc, k: number): Pt => {
  const a = p.a0 + p.da * k;
  return { x: p.c.x + p.r * Math.cos(a), y: p.c.y + p.r * Math.sin(a) };
};

const primAt = (p: Prim, d: number): Pt => {
  const k = Math.max(0, Math.min(1, (d - p.d0) / p.len));
  if (p.kind === 'L') return { x: p.a.x + (p.b.x - p.a.x) * k, y: p.a.y + (p.b.y - p.a.y) * k };
  return arcPt(p, k);
};

/** 轨道上距离 d 处的点 */
export function pointAt(tr: Track, d: number): Pt {
  for (const p of tr.prims) if (d <= p.d0 + p.len) return primAt(p, d);
  const last = tr.prims[tr.prims.length - 1];
  return primAt(last, last.d0 + last.len);
}

/** 轨道上 [d0, d1] 这一段在屏幕上的 SVG 路径 */
export function slicePath(tr: Track, d0: number, d1: number, c: Cam): string {
  if (d1 <= d0) return '';
  const X = (p: Pt) => `${(c[0] + c[2] * p.x).toFixed(2)} ${(c[1] + c[2] * p.y).toFixed(2)}`;
  let out = '';
  for (const p of tr.prims) {
    const a = Math.max(d0, p.d0);
    const b = Math.min(d1, p.d0 + p.len);
    if (b <= a) continue;
    if (!out) out = `M${X(primAt(p, a))}`;
    if (p.kind === 'L') out += `L${X(primAt(p, b))}`;
    else {
      const r = (p.r * c[2]).toFixed(2);
      out += `A${r} ${r} 0 0 ${p.da > 0 ? 1 : 0} ${X(primAt(p, b))}`;
    }
  }
  return out;
}

/** 水平段上横坐标 x 处的轨道距离（y 是这一段的纵坐标；找不到返回 null） */
export function distAtX(tr: Track, y: number, x: number): number | null {
  for (const p of tr.prims) {
    if (p.kind !== 'L' || Math.abs(p.a.y - y) > 0.5 || Math.abs(p.b.y - y) > 0.5) continue;
    const lo = Math.min(p.a.x, p.b.x);
    const hi = Math.max(p.a.x, p.b.x);
    if (x < lo - 0.5 || x > hi + 0.5) continue;
    return p.d0 + Math.abs(x - p.a.x);
  }
  return null;
}

/** 轨道被这些矩形（屏）遮住的区间 → 露出来的空隙区间 */
export function openGaps(tr: Track, boxes: readonly Box[]): [number, number][] {
  const hidden: [number, number][] = [];
  for (const p of tr.prims) {
    if (p.kind !== 'L') continue;
    for (const b of boxes) {
      const horizontal = Math.abs(p.a.y - p.b.y) < 0.5;
      if (!horizontal || p.a.y < b.y0 || p.a.y > b.y1) continue;
      const lo = Math.max(Math.min(p.a.x, p.b.x), b.x0);
      const hi = Math.min(Math.max(p.a.x, p.b.x), b.x1);
      if (hi <= lo) continue;
      const da = p.d0 + Math.abs(lo - p.a.x);
      const db = p.d0 + Math.abs(hi - p.a.x);
      hidden.push([Math.min(da, db), Math.max(da, db)]);
    }
  }
  hidden.sort((a, b) => a[0] - b[0]);
  const gaps: [number, number][] = [];
  let at = 0;
  for (const [a, b] of hidden) {
    if (a > at) gaps.push([at, a]);
    at = Math.max(at, b);
  }
  if (at < tr.len) gaps.push([at, tr.len]);
  return gaps;
}

/** 线头的运动：launch 时刻从 0 出发，ramp 秒内匀加速到 speed，之后匀速 */
export interface HeadMotion {
  launch: number;
  speed: number;
  ramp: number;
}

export function headAt(m: HeadMotion, v: number): number {
  const tau = v - m.launch;
  if (tau <= 0) return 0;
  if (tau < m.ramp) return (m.speed * tau * tau) / (2 * m.ramp);
  return m.speed * (tau - m.ramp / 2);
}

/** 线头走到距离 d 的时刻 */
export function timeAt(m: HeadMotion, d: number): number {
  const knee = (m.speed * m.ramp) / 2;
  if (d <= knee) return m.launch + Math.sqrt((2 * m.ramp * Math.max(0, d)) / m.speed);
  return m.launch + d / m.speed + m.ramp / 2;
}

/**
 * 线（世界坐标里的实物）：只在空隙里画到线头为止。每一段直线是一块纯色条，线头经过时沿行进方向 scale 伸出来；
 * 转弯处是四分之一圆环，线头走到弯的一半时出现；站点是白心橙圈。
 * 全部只改 transform，由合成器完成：线头走、镜头推拉都不触发重排与重画。线粗按世界坐标给，跟着镜头一起缩放。
 */
export function WorldLine({
  track,
  gaps,
  motion: head,
  width,
  fade,
}: {
  track: Track;
  gaps: readonly (readonly [number, number])[];
  motion: HeadMotion;
  width: number;
  fade?: MotionValue<number>;
}) {
  const t = useFilmTime();
  const shown = useShown(fade ?? t);
  const parts: ReactNode[] = [];
  for (const [ga, gb] of gaps) {
    for (const p of track.prims) {
      const a = Math.max(ga, p.d0);
      const b = Math.min(gb, p.d0 + p.len);
      if (b - a < 0.5) continue;
      if (p.kind === 'L') parts.push(<Bar key={`l${a}`} a={primAt(p, a)} b={primAt(p, b)} d0={a} d1={b} head={head} width={width} />);
      else parts.push(<Corner key={`c${a}`} arc={p} head={head} width={width} />);
    }
  }
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0" style={fade ? { opacity: fade, visibility: shown } : undefined}>
      {parts}
    </motion.div>
  );
}

/** 站点（画在屏的上面：线与屏相接的地方压住屏的边） */
export function WorldStations({ track, at, motion: head, width, fade }: { track: Track; at: readonly number[]; motion: HeadMotion; width: number; fade?: MotionValue<number> }) {
  const t = useFilmTime();
  const shown = useShown(fade ?? t);
  return (
    <motion.div className="pointer-events-none absolute left-0 top-0" style={fade ? { opacity: fade, visibility: shown } : undefined}>
      {at.map((d) => (
        <Station key={d} at={d} track={track} head={head} width={width} />
      ))}
    </motion.div>
  );
}

const LINE_COLOR = '#FE3C01';

/** 一段直线：线头经过时从起点一侧伸出来 */
function Bar({ a, b, d0, d1, head, width }: { a: Pt; b: Pt; d0: number; d1: number; head: HeadMotion; width: number }) {
  const t = useFilmTime();
  const horizontal = Math.abs(a.y - b.y) < 0.5;
  const k = useTransform(t, (v) => Math.max(0, Math.min(1, (headAt(head, v) - d0) / (d1 - d0))));
  const transform = useTransform(k, (n) => (horizontal ? `scaleX(${n.toFixed(4)})` : `scaleY(${n.toFixed(4)})`));
  const visibility = useTransform(k, (n) => (n <= 0 ? 'hidden' : 'visible'));
  const box = horizontal
    ? { left: Math.min(a.x, b.x), top: a.y - width / 2, width: Math.abs(b.x - a.x), height: width }
    : { left: a.x - width / 2, top: Math.min(a.y, b.y), width, height: Math.abs(b.y - a.y) };
  const origin = horizontal ? (b.x >= a.x ? 'left center' : 'right center') : b.y >= a.y ? 'center top' : 'center bottom';
  return <motion.span className="absolute" style={{ ...box, background: LINE_COLOR, transform, transformOrigin: origin, visibility, willChange: 'transform' }} />;
}

/** 转弯：四分之一圆环（外缘两条边 + 外角圆角），线头走到弯的一半时出现 */
function Corner({ arc, head, width }: { arc: Arc; head: HeadMotion; width: number }) {
  const t = useFilmTime();
  const mid = arc.a0 + arc.da / 2;
  const qx = Math.cos(mid) >= 0 ? 1 : -1;
  const qy = Math.sin(mid) >= 0 ? 1 : -1;
  const R = arc.r + width / 2;
  const on = timeAt(head, arc.d0 + arc.len / 2);
  const visibility = useTransform(t, (v) => (v >= on ? 'visible' : 'hidden'));
  const side = (h: 'Top' | 'Bottom' | 'Left' | 'Right') => ({ [`border${h}`]: `${width}px solid ${LINE_COLOR}` });
  const corner = `border${qy < 0 ? 'Top' : 'Bottom'}${qx < 0 ? 'Left' : 'Right'}Radius`;
  return (
    <motion.span
      className="absolute"
      style={{
        left: qx < 0 ? arc.c.x - R : arc.c.x,
        top: qy < 0 ? arc.c.y - R : arc.c.y,
        width: R,
        height: R,
        boxSizing: 'border-box',
        ...side(qy < 0 ? 'Top' : 'Bottom'),
        ...side(qx < 0 ? 'Left' : 'Right'),
        [corner]: R,
        visibility,
      }}
    />
  );
}

/** 线与屏相接处的站点：白心橙圈，线头经过时长出来 */
function Station({ at, track, head, width }: { at: number; track: Track; head: HeadMotion; width: number }) {
  const t = useFilmTime();
  const p = pointAt(track, at);
  const passAt = timeAt(head, at);
  const k = useTransform(t, (v) => ease.out(Math.max(0, Math.min(1, (v - passAt + 0.02) / 0.14))));
  const visibility = useTransform(k, (n) => (n <= 0.001 ? 'hidden' : 'visible'));
  const size = width * 2.6;
  return (
    <motion.span
      className="absolute rounded-full"
      style={{ left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, boxSizing: 'border-box', background: '#FFFFF9', border: `${width * 0.8}px solid ${LINE_COLOR}`, scale: k, visibility, willChange: 'transform' }}
    />
  );
}
