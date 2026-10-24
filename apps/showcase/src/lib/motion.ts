'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';

/* -------------------------------------------------------------------------- */
/*  纯函数：分段插值                                                             */
/* -------------------------------------------------------------------------- */

export type Easing = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  /** 默认：缓入缓出（smoothstep），滚动联动时最自然 */
  smooth: (t: number) => t * t * (3 - 2 * t),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  in: (t: number) => t * t * t,
  /** 轻微回弹，模拟弹簧落位 */
  back: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
} satisfies Record<string, Easing>;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** 分段线性插值 + 每段可选缓动。input 必须单调递增。 */
export function interp(v: number, input: readonly number[], output: readonly number[], easing: Easing = ease.smooth): number {
  const n = input.length;
  if (n === 0) return 0;
  if (v <= input[0]) return output[0];
  if (v >= input[n - 1]) return output[n - 1];
  for (let i = 0; i < n - 1; i++) {
    const a = input[i];
    const b = input[i + 1];
    if (v >= a && v <= b) {
      const t = b === a ? 1 : (v - a) / (b - a);
      return output[i] + (output[i + 1] - output[i]) * easing(t);
    }
  }
  return output[n - 1];
}

/** 将全局进度映射为某区间内的局部进度 0~1 */
export const local = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));

/* -------------------------------------------------------------------------- */
/*  减弱动态效果上下文                                                           */
/* -------------------------------------------------------------------------- */

export const ReducedMotionContext = createContext(false);
export const useReduced = () => useContext(ReducedMotionContext);

/* -------------------------------------------------------------------------- */
/*  Hooks                                                                       */
/* -------------------------------------------------------------------------- */

interface RangeOptions {
  easing?: Easing;
  /**
   * 「位移类」动画：开启减弱动态效果时直接固定为该静止值，
   * 只保留透明度淡入，避免视动眩晕（SHOWCASE §6.3-1）。
   */
  rest?: number;
}

/**
 * 滚动进度 → 数值。使用函数式 transformer + ref，保证断点切换（桌面/移动）后
 * 新的 input/output 立即生效，而不依赖 useTransform 的数组依赖比较。
 */
export function useRange(
  progress: MotionValue<number>,
  input: readonly number[],
  output: readonly number[],
  opts: RangeOptions = {},
): MotionValue<number> {
  const reduced = useReduced();
  const cfg = useRef({ input, output, opts, reduced });
  cfg.current = { input, output, opts, reduced };
  return useTransform(progress, (v: number) => {
    const c = cfg.current;
    if (c.reduced && c.opts.rest !== undefined) return c.opts.rest;
    return interp(v, c.input, c.output, c.opts.easing);
  });
}

/** 渐显 / 渐隐的常用简写：[a,b] 淡入，[c,d] 淡出（可省略） */
export function useFade(progress: MotionValue<number>, a: number, b: number, c?: number, d?: number) {
  const input = c !== undefined && d !== undefined ? [a, b, c, d] : [a, b];
  const output = c !== undefined && d !== undefined ? [0, 1, 1, 0] : [0, 1];
  return useRange(progress, input, output);
}

/**
 * 离散阈值：返回当前所处的段落序号。仅在跨越阈值时 setState，
 * 避免每帧触发 React 重渲染（INP 友好）。
 */
export function useStep(progress: MotionValue<number>, thresholds: readonly number[]): number {
  const compute = (v: number) => {
    let i = 0;
    while (i < thresholds.length && v >= thresholds[i]) i++;
    return i;
  };
  const [step, setStep] = useState(() => compute(progress.get()));
  const last = useRef(step);
  useMotionValueEvent(progress, 'change', (v) => {
    const s = compute(v);
    if (s !== last.current) {
      last.current = s;
      setStep(s);
    }
  });
  return step;
}

/**
 * 视口离屏剔除：在活跃区间外返回 'hidden'，区间内返回 'inherit'（跟随祖先，见 useFadeVisibility）。
 * 直接绑定至 Framer Motion 原生 style={{ visibility }}，
 * 彻底卸载非活跃阶段的 GPU 合成与模糊光栅化，完全绕过 React 重渲染。
 */
export function useVisibility(
  progress: MotionValue<number>,
  start: number,
  end: number,
): MotionValue<'inherit' | 'hidden'> {
  return useTransform(progress, (v) => (v >= start && v <= end ? 'inherit' : 'hidden'));
}

/** 布尔阈值 */
export const useAfter = (progress: MotionValue<number>, t: number) => useStep(progress, [t]) === 1;

/**
 * 透明度为 0 时同时隐藏（visibility: hidden）。
 * iPad Safari 有时不重绘透明度为 0 的合成层，层里留着上一次画上去的字——需求画像空状态里出现过
 * 「少山日落」「8–10 天」这样的残影。隐藏之后 WebKit 不再绘制这一层，残影无处可留。
 * 凡是只靠透明度隐藏的元素，都把它和 opacity 一起绑上。
 * 显示时写 'inherit' 而不是 'visible'：'visible' 会盖掉祖先的 hidden，已经隐藏的一屏里会留下
 * 上百个透明度为 0 却仍然可见的文字（2026-10-24 WebKit 巡检），重播时同样可能留下残影。
 */
export function useFadeVisibility(opacity: MotionValue<number>): MotionValue<'inherit' | 'hidden'> {
  return useTransform(opacity, (v) => (v <= 0.001 ? 'hidden' : 'inherit'));
}

/** useFade + useFadeVisibility：直接展开进 style={{ ...fade }} */
export function useFadeStyle(progress: MotionValue<number>, a: number, b: number, c?: number, d?: number) {
  const opacity = useFade(progress, a, b, c, d);
  const visibility = useFadeVisibility(opacity);
  return { opacity, visibility };
}

/**
 * 滚动驱动的打字机：直接写 textContent，不经过 React 渲染。
 * SSR 与首帧渲染完整文本（利于 SEO / 无 JS 可读），挂载后按进度裁切。
 * 引入 lastN 缓存，在非活跃区间与重复帧下 0 DOM 读写。
 * clearAt：到这一刻清空（输入框发送之后文字进入气泡，输入框回到空白的一行）。
 */
export function useScrollTypewriter(
  progress: MotionValue<number>,
  text: string,
  a: number,
  b: number,
  clearAt?: number,
) {
  const ref = useRef<HTMLSpanElement>(null);
  const chars = useRef(Array.from(text));
  chars.current = Array.from(text);
  const lastN = useRef(-1);
  const apply = (v: number) => {
    const el = ref.current;
    if (!el) return;
    const n = clearAt !== undefined && v >= clearAt ? 0 : Math.round(local(v, a, b) * chars.current.length);
    if (n === lastN.current) return;
    lastN.current = n;
    el.textContent = chars.current.slice(0, n).join('');
  };
  useEffect(() => {
    apply(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);
  useMotionValueEvent(progress, 'change', apply);
  return ref;
}

/** 滚动驱动的数字计数器：缓存 lastVal，避免高频 DOM 读写；format 可自定义显示（如千分位），easing 默认先快后慢（时间码请传 ease.linear） */
export function useScrollCounter(
  progress: MotionValue<number>,
  from: number,
  to: number,
  a: number,
  b: number,
  decimals = 0,
  format?: (n: number) => string,
  easing: Easing = ease.out,
) {
  const ref = useRef<HTMLSpanElement>(null);
  const lastVal = useRef('');
  const apply = (v: number) => {
    const el = ref.current;
    if (!el) return;
    const val = from + (to - from) * easing(local(v, a, b));
    const next = format ? format(val) : val.toFixed(decimals);
    if (next === lastVal.current) return;
    lastVal.current = next;
    el.textContent = next;
  };
  useEffect(() => {
    apply(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useMotionValueEvent(progress, 'change', apply);
  return ref;
}

/** 视口断点（挂载后才确定，SSR 默认移动端，防水合不一致） */
export function useMediaQuery(query: string): boolean {
  const [match, setMatch] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatch(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);
  return match;
}
