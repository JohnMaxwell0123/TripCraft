'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { ease, interp, type Easing } from '@/lib/motion';

/**
 * 片子的时钟与镜头
 *
 * 时钟：一条以「秒」计的 MotionValue，rAF 推进，播放过程 0 React 重渲染。
 * window.__film 提供 play / seek：逐帧录制与视觉巡检时用它对齐。
 * 舞台用 useFilmControl 控制播放（进入视口才播、离开就停、章节跳转、播完停在片尾）。
 * 镜头：世界坐标里的一串机位，缩放按对数插值，像镜头推拉而不是放大图片。
 * 世界里的东西按「原大」排版（手机 390 宽、电脑 1192 宽），镜头只缩小或在特写时适度放大，字始终清晰。
 */

const FilmTimeContext = createContext<MotionValue<number> | null>(null);

export function useFilmTime(): MotionValue<number> {
  const t = useContext(FilmTimeContext);
  if (!t) throw new Error('useFilmTime 必须在 <FilmClock> 内使用');
  return t;
}

export type FilmStatus = 'idle' | 'playing' | 'paused' | 'ended';

export interface FilmControl {
  duration: number;
  t: MotionValue<number>;
  status: FilmStatus;
  play: (from?: number) => void;
  pause: () => void;
  seek: (s: number) => void;
}

const FilmControlContext = createContext<FilmControl | null>(null);

export function useFilmControl(): FilmControl {
  const c = useContext(FilmControlContext);
  if (!c) throw new Error('useFilmControl 必须在 <FilmClock> 内使用');
  return c;
}

/** 片子的时钟；什么时候播由舞台用 useFilmControl 决定（进入视口才播、离开就停） */
export function FilmClock({ duration, children }: { duration: number; children: ReactNode }) {
  const t = useMotionValue(0);
  const [status, setStatus] = useState<FilmStatus>('idle');
  const playing = useRef(false);
  const api = useRef<Omit<FilmControl, 't' | 'status' | 'duration'> | null>(null);
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64) / 1000;
      last = now;
      if (playing.current) {
        const v = Math.min(duration, t.get() + dt);
        t.set(v);
        if (v >= duration) {
          playing.current = false;
          setStatus('ended');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const play = (from?: number) => {
      if (from !== undefined) t.set(from);
      else if (t.get() >= duration) t.set(0);
      last = performance.now();
      playing.current = true;
      setStatus('playing');
    };
    const pause = () => {
      playing.current = false;
      setStatus((s) => (s === 'ended' ? s : 'paused'));
    };
    const seek = (s: number) => {
      playing.current = false;
      t.set(Math.max(0, Math.min(duration, s)));
      setStatus(s >= duration ? 'ended' : 'paused');
    };
    api.current = { play, pause, seek };
    (window as unknown as Record<string, unknown>).__film = { duration, play, seek };
    return () => {
      cancelAnimationFrame(raf);
      delete (window as unknown as Record<string, unknown>).__film;
    };
  }, [duration, t]);
  const control: FilmControl = {
    duration,
    t,
    status,
    play: (from) => api.current?.play(from),
    pause: () => api.current?.pause(),
    seek: (s) => api.current?.seek(s),
  };
  return (
    <FilmControlContext.Provider value={control}>
      <FilmTimeContext.Provider value={t}>{children}</FilmTimeContext.Provider>
    </FilmControlContext.Provider>
  );
}

/** 子树里的时间整体后移 by 秒：一段场景按自己的 0 秒写时间轴，放进全片时只在外面套一层 */
export function TimeShift({ by, children }: { by: number; children: ReactNode }) {
  const t = useFilmTime();
  const local = useTransform(t, (v) => v - by);
  return <FilmTimeContext.Provider value={local}>{children}</FilmTimeContext.Provider>;
}

/**
 * 子树只在 [from, to] 这段时间里跟着时钟走，之外停在边界上：时钟的值不再变，子树里的几百个插值就不再每帧重算。
 * 只用在「这段时间之外整块看不见」的部分——边界上的样子，就是它在这段时间之外的样子。
 */
export function TimeGate({ from, to, children }: { from: number; to: number; children: ReactNode }) {
  const t = useFilmTime();
  const gated = useTransform(t, (v) => Math.min(to, Math.max(from, v)));
  return <FilmTimeContext.Provider value={gated}>{children}</FilmTimeContext.Provider>;
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

/* ═════════════════════ 镜头：机位写成「要装下的世界矩形」，任何画幅都成立 ═════════════════════ */

export interface View {
  w: number;
  h: number;
}

/** 画面里要完整装下的世界矩形：中心 + 宽高 */
export interface Frame {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** 镜头此刻的状态：[平移 x, 平移 y, 缩放]，世界坐标 (wx, wy) 在屏幕上是 (tx + s·wx, ty + s·wy) */
export type Cam = readonly [number, number, number];

/** 取景框 → 缩放（装下整个矩形）；top 是画面顶部留给片名的比例 */
export const fitScale = (f: Frame, V: View, top = 0) => Math.min(V.w / f.w, (V.h * (1 - top)) / f.h);

/** 以世界坐标 (x, y) 为画面中心；top 把中心下移，让出画面顶部 */
export const camAt = (x: number, y: number, s: number, V: View, top = 0): Cam => [V.w / 2 - s * x, (V.h * (1 + top)) / 2 - s * y, s];

/** 一个机位：到位时刻 + 取景框（top：画面顶部留白的比例） */
export interface Shot {
  t: number;
  f: Frame;
  top?: number;
  ease?: Easing;
  /** 从上一个机位出发的时刻（默认紧接上一个机位到位） */
  from?: number;
}

/** 机位之间的推拉：缩放按对数插值；中心的权重随缩放走（焦点在屏幕上匀速滑动，不先甩出去再回来） */
export function shotCam(v: number, shots: readonly Shot[], V: View): Cam {
  let cur = shots[0];
  let s = fitScale(cur.f, V, cur.top);
  let x = cur.f.x;
  let y = cur.f.y;
  let top = cur.top ?? 0;
  for (let i = 1; i < shots.length; i++) {
    const next = shots[i];
    const start = next.from ?? cur.t;
    const s0 = fitScale(cur.f, V, cur.top);
    const s1 = fitScale(next.f, V, next.top);
    if (v <= start) break;
    if (v >= next.t) {
      cur = next;
      s = s1;
      x = next.f.x;
      y = next.f.y;
      top = next.top ?? 0;
      continue;
    }
    const k = (next.ease ?? ease.smooth)((v - start) / (next.t - start));
    s = Math.exp(Math.log(s0) + (Math.log(s1) - Math.log(s0)) * k);
    const w = Math.abs(s1 - s0) < 1e-6 ? k : (1 / s - 1 / s0) / (1 / s1 - 1 / s0);
    x = cur.f.x + (next.f.x - cur.f.x) * w;
    y = cur.f.y + (next.f.y - cur.f.y) * w;
    top = (cur.top ?? 0) + ((next.top ?? 0) - (cur.top ?? 0)) * k;
    break;
  }
  return camAt(x, y, s, V, top);
}

/** 世界坐标 → 屏幕坐标 */
export const toScreen = (c: Cam, x: number, y: number): [number, number] => [c[0] + c[2] * x, c[1] + c[2] * y];

export type CamFn = (v: number, V: View) => Cam;
export type CamRef = { current: { fn: CamFn; view: View } };

/** 世界层的 transform（transform-origin 为左上角）；叠层（线、标签、片名）用 camRef 算同一个镜头 */
export function useCamera(t: MotionValue<number>, fn: CamFn, view: View) {
  const cam = useRef({ fn, view });
  cam.current = { fn, view };
  const transform = useTransform(t, (v) => {
    const [x, y, s] = cam.current.fn(v, cam.current.view);
    return `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) scale(${s.toFixed(5)})`;
  });
  return { transform, cam: cam as CamRef };
}

/**
 * 栅格策略：镜头推拉时，设备层带 will-change: transform——浏览器只按第一次栅格化的结果由合成器缩放，不逐帧重画；
 * fresh 时段（镜头停住的时刻）去掉其中的 transform，让这一层按当前缩放重新栅格化一次，字重新变清楚。
 * will-change 里始终保留 opacity：层常驻合成，切换时不会触发整层的拆并（translateZ(0) 不一定算 3D 变换）。
 */
export function useRaster(ref: RefObject<HTMLElement | null>, fresh: readonly (readonly [number, number])[]) {
  const t = useFilmTime();
  const list = useRef(fresh);
  list.current = fresh;
  useEffect(() => {
    const apply = (v: number) => {
      const el = ref.current;
      if (!el) return;
      const want = list.current.some(([a, b]) => v >= a && v < b) ? 'opacity' : 'transform, opacity';
      if (el.style.willChange !== want) el.style.willChange = want;
    };
    apply(t.get());
    return t.on('change', apply);
  }, [ref, t]);
}
