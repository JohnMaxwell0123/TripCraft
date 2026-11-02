'use client';

import { createContext, useContext, useRef, type ReactNode, type RefObject } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { clamp01, ease, useFadeVisibility, useReduced } from '@/lib/motion';
import { camRect, type Rect } from './camera';
import { useProgress } from './primitives';

/**
 * 跨区域的「飞行」：一个小信物从一处起飞、落到另一处（共享元素转场）。
 *
 * 用来交代因果：对话里的一句话飞进需求画像、保存的路线缩成封面飞进侧栏、匹配度环从上一屏落到下一屏的结果卡、
 * 发出的咨询飞向「行程空间」。眼睛跟着信物走，换屏时注意力不断线。
 *
 * - 起点与终点是带 data-cam 的元素；起飞那一刻再量位置（对话流随新消息上移，提前量会量偏），
 *   终点在当前排版里不显示（例如手机布局没有右侧画像面板）时，按 to 数组里的下一个候选落地，都没有就不飞。
 * - 飞行层在视窗内容层里，和内容一起被摄影机推近拉远。
 * - 减弱动态效果：不飞，终点的内容照常淡入。
 */

export type CamRef = string | readonly string[];

export interface FlightSpec {
  id: string;
  /** 起点（data-cam；数组时取第一个正在显示的） */
  from: CamRef;
  /** 终点（同上） */
  to: CamRef;
  /** 起飞 → 落地（全局进度） */
  t: readonly [number, number];
  /** 飞行中的样子 */
  token: ReactNode;
  /** 弧线最高点相对直线抬起多少（px，默认 40） */
  lift?: number;
  /** 起飞与落地时的缩放（默认 [1, 0.9]）：从大缩小，像收进去 */
  scale?: readonly [number, number];
}

/** 视窗内容层（摄影机作用的那一层），飞行层从这里量位置 */
export const CamRootContext = createContext<RefObject<HTMLElement | null> | null>(null);

const HIDDEN = [0, 0, 1, 0] as const;

/** 起点或终点：data-cam 可以是数组，按顺序取第一个正在显示的 */
function pick(root: HTMLElement, ref: CamRef): Rect | null {
  const ids = typeof ref === 'string' ? [ref] : ref;
  for (const id of ids) {
    const r = camRect(root, id);
    if (r) return r;
  }
  return null;
}

export function FlightLayer({ flights, epoch }: { flights: readonly FlightSpec[]; epoch: MotionValue<number> }) {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-[70]">
      {flights.map((f) => (
        <Flight key={f.id} spec={f} epoch={epoch} />
      ))}
    </div>
  );
}

function Flight({ spec, epoch }: { spec: FlightSpec; epoch: MotionValue<number> }) {
  const p = useProgress();
  const reduced = useReduced();
  const rootRef = useContext(CamRootContext);
  const tokenRef = useRef<HTMLDivElement>(null);
  /** 本次飞行的起终点：进入飞行区间时量一次，离开后作废；视窗尺寸变化（epoch）也作废 */
  const route = useRef<{ from: Rect; to: Rect; w: number; h: number; epoch: number } | null>(null);
  const [a, b] = spec.t;
  const lift = spec.lift ?? 40;
  const [s0, s1] = spec.scale ?? [1, 0.9];

  const pose = useTransform([p, epoch], ([v, ep]) => {
    const t = v as number;
    if (reduced || t < a || t > b) {
      route.current = null;
      return HIDDEN;
    }
    const root = rootRef?.current;
    const token = tokenRef.current;
    if (!root || !token) return HIDDEN;
    if (!route.current || route.current.epoch !== ep) {
      const from = pick(root, spec.from);
      const to = pick(root, spec.to);
      route.current = from && to ? { from, to, w: token.offsetWidth, h: token.offsetHeight, epoch: ep as number } : null;
    }
    const r = route.current;
    if (!r) return HIDDEN;
    const k = clamp01((t - a) / (b - a));
    const e = ease.smooth(k);
    const x0 = r.from.x + r.from.w / 2;
    const y0 = r.from.y + r.from.h / 2;
    const x1 = r.to.x + r.to.w / 2;
    const y1 = r.to.y + r.to.h / 2;
    // 二次贝塞尔：控制点在中点上方 lift 处，信物走一道弧线
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2 - lift;
    const x = (1 - e) * (1 - e) * x0 + 2 * (1 - e) * e * cx + e * e * x1;
    const y = (1 - e) * (1 - e) * y0 + 2 * (1 - e) * e * cy + e * e * y1;
    const s = s0 + (s1 - s0) * e;
    // 起飞时淡入，落地前淡出（终点的内容在落地时接替它）
    const o = Math.min(1, k / 0.12, (1 - k) / 0.18);
    return [x - r.w / 2, y - r.h / 2, s, Math.max(0, o)] as const;
  });

  const x = useTransform(pose, (q) => q[0]);
  const y = useTransform(pose, (q) => q[1]);
  const scale = useTransform(pose, (q) => q[2]);
  const opacity = useTransform(pose, (q) => q[3]);
  const visibility = useFadeVisibility(opacity);

  return (
    <motion.div ref={tokenRef} className="absolute left-0 top-0 origin-center" style={{ x, y, scale, opacity, visibility }}>
      {spec.token}
    </motion.div>
  );
}
