'use client';

import { useEffect, useRef, type RefObject } from 'react';
import { useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { clamp01, ease, useReduced } from '@/lib/motion';

/**
 * 演示舞台的虚拟摄影机（SHOWCASE §4.1「镜头」）
 *
 * 视窗是布景，摄影机是叙述者：每一拍只推近到此刻唯一要看的地方，拍完再拉远。
 * 镜头对准的是界面里带 data-cam 的元素，位置沿 offsetParent 链量取——不受任何 transform 影响
 * （入场位移、摄影机自己的缩放都不会让镜头量偏），视窗换断点、字体加载完都会重新量。
 * 同一个 data-cam 可以出现在宽、窄两套布局里，取当前排版里真正显示的那一个。
 *
 * - 缩放按对数插值（推近与拉远的速度感一致），中心线性插值，每一帧都夹在内容范围里，不露出视窗外的空白。
 * - 窄视窗（手机）默认不推近：手机布局已经是特写，除非镜头单独给了 zoomNarrow。
 * - 减弱动态效果：镜头不动，始终是全景。
 */

export interface CameraShot {
  /** 镜头开始移动 → 到位（全局进度）；到位后一直停在这里，直到下一个镜头开始 */
  t: readonly [number, number];
  /** 对准的元素（data-cam），数组取并集；省略 = 全景 */
  target?: string | readonly string[];
  /** 宽视窗最多推近几倍（默认 1.4） */
  zoom?: number;
  /** 窄视窗最多推近几倍（默认 1，不推近） */
  zoomNarrow?: number;
  /** 目标四周留白（内容坐标 px，默认 20） */
  pad?: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface View {
  cx: number;
  cy: number;
  s: number;
}

/** 窄视窗：与 AppWindow 的 cq-sm 断点一致（手机布局） */
export const NARROW_WIN = 560;

/**
 * 元素在 root 里的排版位置：沿 offsetParent 链累加，不含任何 transform。
 * 元素没有排版（自己或祖先 display: none，例如另一套断点的布局）时返回 null。
 */
export function layoutRect(root: HTMLElement, el: HTMLElement): Rect | null {
  if (el === root) return { x: 0, y: 0, w: root.offsetWidth, h: root.offsetHeight };
  if (!el.offsetParent || el.offsetWidth === 0) return null;
  let x = 0;
  let y = 0;
  let n: HTMLElement | null = el;
  while (n && n !== root) {
    x += n.offsetLeft;
    y += n.offsetTop;
    n = n.offsetParent as HTMLElement | null;
  }
  if (n !== root) return null;
  return { x, y, w: el.offsetWidth, h: el.offsetHeight };
}

/** 按 data-cam 找到当前排版里显示的那个元素的位置；数组取并集 */
export function camRect(root: HTMLElement, target: string | readonly string[]): Rect | null {
  const ids = typeof target === 'string' ? [target] : target;
  let box: { x0: number; y0: number; x1: number; y1: number } | null = null;
  for (const id of ids) {
    let r: Rect | null = null;
    for (const el of root.querySelectorAll<HTMLElement>(`[data-cam="${id}"]`)) {
      r = layoutRect(root, el);
      if (r) break;
    }
    if (!r) continue;
    box = box
      ? { x0: Math.min(box.x0, r.x), y0: Math.min(box.y0, r.y), x1: Math.max(box.x1, r.x + r.w), y1: Math.max(box.y1, r.y + r.h) }
      : { x0: r.x, y0: r.y, x1: r.x + r.w, y1: r.y + r.h };
  }
  return box ? { x: box.x0, y: box.y0, w: box.x1 - box.x0, h: box.y1 - box.y0 } : null;
}

/** 把中心夹在内容范围里：缩放 s 时可见的半宽是 W / 2s */
function clampView(v: View, W: number, H: number): View {
  const hw = W / (2 * v.s);
  const hh = H / (2 * v.s);
  return { s: v.s, cx: Math.min(W - hw, Math.max(hw, v.cx)), cy: Math.min(H - hh, Math.max(hh, v.cy)) };
}

function resolve(root: HTMLElement, shot: CameraShot, W: number, H: number): View {
  const full = { cx: W / 2, cy: H / 2, s: 1 };
  if (!shot.target) return full;
  const r = camRect(root, shot.target);
  if (!r) return full;
  const narrow = W < NARROW_WIN;
  const max = narrow ? shot.zoomNarrow ?? 1 : shot.zoom ?? 1.4;
  const pad = shot.pad ?? 20;
  const s = Math.max(1, Math.min(max, W / (r.w + pad * 2), H / (r.h + pad * 2)));
  return clampView({ cx: r.x + r.w / 2, cy: r.y + r.h / 2, s }, W, H);
}

function lerpView(a: View, b: View, k: number, W: number, H: number): View {
  const s = Math.exp(Math.log(a.s) + (Math.log(b.s) - Math.log(a.s)) * k);
  return clampView({ s, cx: a.cx + (b.cx - a.cx) * k, cy: a.cy + (b.cy - a.cy) * k }, W, H);
}

/**
 * 重新量取的触发器：视窗尺寸变化、网络字体加载完。返回一个每次重新量取都会加一的 MotionValue，
 * 让依赖它的 useTransform 在暂停时（静帧、调试钩子）也能拿到新位置。
 */
export function useLayoutEpoch(rootRef: RefObject<HTMLElement | null>, onMeasure?: () => void) {
  const epoch = useMotionValue(0);
  const cb = useRef(onMeasure);
  cb.current = onMeasure;
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const bump = () => {
      cb.current?.();
      epoch.set(epoch.get() + 1);
    };
    bump();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(bump) : null;
    ro?.observe(root);
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined;
    fonts?.ready.then(bump).catch((e) => console.warn('[TripCraft] 字体就绪事件失败，镜头按系统字体量取', e));
    fonts?.addEventListener?.('loadingdone', bump);
    return () => {
      ro?.disconnect();
      fonts?.removeEventListener?.('loadingdone', bump);
    };
  }, [rootRef, epoch]);
  return epoch;
}

/**
 * 视窗内容的摄影机：返回内容层的 x / y / scale（transform-origin 为左上角）。
 * shots 按时间先后排列；第一个镜头开始之前是全景。
 */
export function useLensCamera(progress: MotionValue<number>, shots: readonly CameraShot[] | undefined, rootRef: RefObject<HTMLElement | null>) {
  const reduced = useReduced();
  const views = useRef<View[]>([]);
  const size = useRef({ w: 1, h: 1 });
  const epoch = useLayoutEpoch(rootRef, () => {
    const root = rootRef.current;
    if (!root || !shots?.length) return;
    const W = root.offsetWidth || 1;
    const H = root.offsetHeight || 1;
    size.current = { w: W, h: H };
    views.current = shots.map((s) => resolve(root, s, W, H));
  });

  const pose = useTransform([progress, epoch], ([v]) => {
    const { w: W, h: H } = size.current;
    if (reduced || !shots?.length || views.current.length !== shots.length) return [0, 0, 1] as const;
    let cur: View = { cx: W / 2, cy: H / 2, s: 1 };
    for (let i = 0; i < shots.length; i++) {
      const [a, b] = shots[i].t;
      const target = views.current[i];
      if ((v as number) < a) break;
      if ((v as number) >= b) {
        cur = target;
        continue;
      }
      cur = lerpView(cur, target, ease.smooth(clamp01(((v as number) - a) / (b - a))), W, H);
      break;
    }
    return [W / 2 - cur.s * cur.cx, H / 2 - cur.s * cur.cy, cur.s] as const;
  });

  const x = useTransform(pose, (p) => p[0]);
  const y = useTransform(pose, (p) => p[1]);
  const scale = useTransform(pose, (p) => p[2]);
  return { x, y, scale, epoch };
}
