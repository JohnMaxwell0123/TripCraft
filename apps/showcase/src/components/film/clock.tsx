'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ease, interp, type Easing } from '@/lib/motion';

/**
 * 片子的时钟与镜头（发布会级重拍的实验页 /lab 用；选定方向后并入 StageShell）
 *
 * 时钟：一条以「秒」计的 MotionValue，rAF 推进，播放过程 0 React 重渲染。
 * window.__film 提供 play / seek：录制与截关键帧时用它对齐（?rec 时不自动播放，等录制脚本调用 play）。
 * 镜头：世界坐标里的一串机位（中心 + 缩放），缩放按对数插值，像镜头推拉而不是放大图片。
 * 世界里的东西按「原大」排版（手机 390 宽、电脑 1192 宽），镜头只缩小或在特写时适度放大，字始终清晰。
 */

const FilmTimeContext = createContext<MotionValue<number> | null>(null);

export function useFilmTime(): MotionValue<number> {
  const t = useContext(FilmTimeContext);
  if (!t) throw new Error('useFilmTime 必须在 <FilmClock> 内使用');
  return t;
}

export function FilmClock({ duration, children }: { duration: number; children: ReactNode }) {
  const t = useMotionValue(0);
  useEffect(() => {
    const manual = new URLSearchParams(window.location.search).has('rec');
    let raf = 0;
    let last = performance.now();
    let playing = false;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (playing) {
        const v = Math.min(duration, t.get() + dt);
        t.set(v);
        if (v >= duration) playing = false;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const api = {
      duration,
      play: (from?: number) => {
        if (from !== undefined) t.set(from);
        last = performance.now();
        playing = true;
      },
      seek: (s: number) => {
        playing = false;
        t.set(s);
      },
    };
    (window as unknown as Record<string, unknown>).__film = api;
    let timer = 0;
    if (!manual) {
      const start = () => {
        timer = window.setTimeout(() => api.play(0), 700);
      };
      document.fonts?.ready.then(start, start);
    }
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(timer);
      delete (window as unknown as Record<string, unknown>).__film;
    };
  }, [duration, t]);
  return <FilmTimeContext.Provider value={t}>{children}</FilmTimeContext.Provider>;
}

/** 分段插值的简写：times 单调递增（秒） */
export function useKeys(t: MotionValue<number>, times: readonly number[], values: readonly number[], easing: Easing = ease.smooth) {
  const cfg = useRef({ times, values, easing });
  cfg.current = { times, values, easing };
  return useTransform(t, (v) => interp(v, cfg.current.times, cfg.current.values, cfg.current.easing));
}

/** 透明度为 0 时同时隐藏（与 useFadeVisibility 同理：WebKit 不残影） */
export function useShown(opacity: MotionValue<number>) {
  return useTransform(opacity, (v) => (v <= 0.001 ? 'hidden' : 'inherit'));
}

/** 舞台尺寸（随窗口变化） */
export function useBoxSize(ref: RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({ w: 1920, h: 1080 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => setSize({ w: el.offsetWidth || 1920, h: el.offsetHeight || 1080 });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return size;
}

/* ═════════════════════ 镜头 ═════════════════════ */

export interface Pose {
  /** 到位的时刻（秒）；从上一个机位移动过来 */
  t: number;
  /** 画面中心（世界坐标） */
  x: number;
  y: number;
  /** 缩放：1 = 原大 */
  s: number;
  /** 从上一个机位到这里的缓动（默认 smooth） */
  ease?: Easing;
  /** 从上一个机位出发的时刻（默认紧接上一个机位到位） */
  from?: number;
}

/**
 * 世界镜头：返回世界层的 transform（transform-origin 为左上角）。
 * 缩放按对数插值；中心按「屏幕上的移动」插值——推拉时焦点稳定地滑向新位置，不先甩出去再回来。
 */
/** 某一时刻的机位 → [平移 x, 平移 y, 缩放]：世界坐标 (wx, wy) 在屏幕上是 (x + s·wx, y + s·wy) */
export function solvePose(v: number, P: readonly Pose[], V: { w: number; h: number }): [number, number, number] {
  let cur = P[0];
  let x = cur.x;
  let y = cur.y;
  let s = cur.s;
  for (let i = 1; i < P.length; i++) {
    const next = P[i];
    const start = next.from ?? cur.t;
    if (v <= start) break;
    if (v >= next.t) {
      cur = next;
      x = next.x;
      y = next.y;
      s = next.s;
      continue;
    }
    const k = (next.ease ?? ease.smooth)((v - start) / (next.t - start));
    s = Math.exp(Math.log(cur.s) + (Math.log(next.s) - Math.log(cur.s)) * k);
    // 中心的插值权重随缩放走：放大时晚一点到、缩小时早一点到，焦点在屏幕上匀速滑动
    const w = cur.s === next.s ? k : (1 / s - 1 / cur.s) / (1 / next.s - 1 / cur.s);
    x = cur.x + (next.x - cur.x) * w;
    y = cur.y + (next.y - cur.y) * w;
    break;
  }
  return [V.w / 2 - s * x, V.h / 2 - s * y, s];
}

export function useWorldCamera(t: MotionValue<number>, poses: readonly Pose[], view: { w: number; h: number }) {
  const cfg = useRef({ poses, view });
  cfg.current = { poses, view };
  const transform = useTransform(t, (v) => {
    const [x, y, s] = solvePose(v, cfg.current.poses, cfg.current.view);
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
  });
  return { transform, cfg };
}
