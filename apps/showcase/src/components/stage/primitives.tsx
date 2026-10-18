'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useFade, useRange, useVisibility, interp, ease } from '@/lib/motion';
import { CheckIcon } from '@/components/common/Icons';

/* -------------------------------------------------------------------------- */
/*  舞台进度上下文                                                               */
/* -------------------------------------------------------------------------- */

export const ProgressContext = createContext<MotionValue<number> | null>(null);

export function useProgress(): MotionValue<number> {
  const p = useContext(ProgressContext);
  if (!p) throw new Error('useProgress 必须在 <ScrollyStage> 内使用');
  return p;
}

export const LayoutContext = createContext<{ desktop: boolean; wide: boolean }>({ desktop: false, wide: false });
export const useLayout = () => useContext(LayoutContext);

/* -------------------------------------------------------------------------- */
/*  演示光标：访客无需操作，光标自动移动并「点击」                                   */
/* -------------------------------------------------------------------------- */

interface FakeCursorProps {
  /** 关键帧时刻（全局进度） */
  times: readonly number[];
  /** 对应位置（父容器百分比） */
  xs: readonly number[];
  ys: readonly number[];
  clickAt: number;
  /** 光标消失时刻 */
  hideAt?: number;
  label?: string;
  /** 按压、涟漪与淡入淡出的时长系数：幕次的全局跨度越短，系数越小（默认 1） */
  tempo?: number;
}

export function FakeCursor({ times, xs, ys, clickAt, hideAt, label, tempo = 1 }: FakeCursorProps) {
  const p = useProgress();
  const t0 = times[0];
  const end = hideAt ?? clickAt + 0.012 * tempo;
  const fade = 0.004 * tempo;
  const visibility = useTransform(p, (v) => (v >= t0 - fade - 0.001 && v <= end ? 'visible' : 'hidden'));
  const opacity = useRange(p, [t0 - fade, t0, end - fade, end], [0, 1, 1, 0]);
  const x = useTransform(p, (v) => {
    if (v < t0 - fade - 0.001 || v > end) return `${xs[0]}cqw`;
    return `${interp(v, times, xs, ease.smooth)}cqw`;
  });
  const y = useTransform(p, (v) => {
    if (v < t0 - fade - 0.001 || v > end) return `${ys[0]}cqh`;
    return `${interp(v, times, ys, ease.smooth)}cqh`;
  });
  const press = useRange(p, [clickAt - 0.003 * tempo, clickAt, clickAt + 0.003 * tempo], [1, 0.82, 1]);
  const ring = useRange(p, [clickAt, clickAt + 0.01 * tempo], [0, 1], { easing: ease.out });
  const ringOpacity = useRange(p, [clickAt - 0.0005 * tempo, clickAt, clickAt + 0.01 * tempo], [0, 0.9, 0]);

  return (
    <div className="pointer-events-none absolute inset-0 [container-type:size]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-[60] gpu-layer [contain:layout_paint]"
        style={{ x, y, opacity, visibility }}
      >
        <motion.span
          className="absolute -left-5 -top-5 h-10 w-10 rounded-full border-2 border-gold"
          style={{ scale: ring, opacity: ringOpacity }}
        />
        <motion.svg width="22" height="22" viewBox="0 0 24 24" style={{ scale: press }} className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
          <path d="M4 2.5 L19.5 12 L12.4 13.6 L9 20.5 Z" fill="#fff" stroke="rgb(58 46 31)" strokeWidth="1.6" strokeLinejoin="round" />
        </motion.svg>
        {label ? (
          <span className="absolute left-5 top-4 whitespace-nowrap rounded-pill bg-ink px-2 py-0.5 text-xs font-medium text-paper shadow-level-static">{label}</span>
        ) : null}
      </motion.div>
    </div>
  );
}

/**
 * 贴在目标元素上的演示光标：从偏移处滑到锚点并按下。
 * 目标位置随断点变化时（桌面侧栏 / 手机底部抽屉）比按容器百分比定位的 FakeCursor 更准。
 * 放在一个 relative 容器内，用 className 指定锚点（如 "right-6 top-1/2"）。
 */
export function TapCursor({
  approach,
  clickAt,
  hideAt,
  from = [30, 22],
  className = '',
}: {
  approach: readonly [number, number];
  clickAt: number;
  hideAt: number;
  from?: readonly [number, number];
  className?: string;
}) {
  const p = useProgress();
  const [a, b] = approach;
  const span = b - a;
  const visibility = useVisibility(p, a, hideAt);
  const opacity = useRange(p, [a, a + span * 0.4, hideAt - span * 0.4, hideAt], [0, 1, 1, 0]);
  const x = useRange(p, [a, b], [from[0], 0], { rest: 0 });
  const y = useRange(p, [a, b], [from[1], 0], { rest: 0 });
  const press = useRange(p, [clickAt - span * 0.3, clickAt, clickAt + span * 0.3], [1, 0.8, 1]);
  const ring = useRange(p, [clickAt, clickAt + span * 0.9], [0.4, 1.8], { easing: ease.out });
  const ringOpacity = useRange(p, [clickAt - span * 0.05, clickAt, clickAt + span * 0.9], [0, 0.7, 0]);
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute z-30 block h-[18px] w-[18px] ${className}`}
      style={{ x, y, opacity, visibility }}
    >
      <motion.span className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border-2 border-[#FE3C01]" style={{ scale: ring, opacity: ringOpacity }} />
      <motion.svg width="18" height="18" viewBox="0 0 24 24" className="relative drop-shadow-[0_2px_5px_rgba(0,0,0,0.3)]" style={{ scale: press }}>
        <path d="M4 2.5 L19.5 12 L12.4 13.6 L9 20.5 Z" fill="#241E20" stroke="#FFFFF9" strokeWidth="1.4" strokeLinejoin="round" />
      </motion.svg>
    </motion.span>
  );
}

/* -------------------------------------------------------------------------- */
/*  头像                                                                        */
/* -------------------------------------------------------------------------- */

export function Avatar({ name, tone, size = 28, className = '' }: { name: string; tone: 'gold' | 'jade' | 'lapis' | 'ochre'; size?: number; className?: string }) {
  const bg = {
    gold: 'bg-gradient-to-br from-gold to-gold-ink',
    jade: 'bg-gradient-to-br from-jade to-[#0a5d51]',
    lapis: 'bg-gradient-to-br from-lapis to-lapis-deep',
    ochre: 'bg-gradient-to-br from-ochre to-[#5e2419]',
  }[tone];
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-paper ring-2 ring-paper ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  气泡提示                                                                     */
/* -------------------------------------------------------------------------- */

export function Toast({ range, children, tone = 'jade' }: { range: readonly [number, number, number, number]; children: ReactNode; tone?: 'jade' | 'gold' }) {
  const p = useProgress();
  const opacity = useFade(p, range[0], range[1], range[2], range[3]);
  const y = useRange(p, [range[0], range[1], range[2], range[3]], [-14, 0, 0, -10], { rest: 0 });
  const scale = useRange(p, [range[0], range[1]], [0.94, 1], { easing: ease.back, rest: 1 });
  return (
    <motion.div
      role="status"
      className="glass-strong flex items-center gap-2 whitespace-nowrap rounded-pill border border-ink/[0.08] px-4 py-1.5 text-xs font-medium text-ink shadow-level-float"
      style={{ opacity, y, scale }}
    >
      <span className={`flex h-5 w-5 items-center justify-center rounded-full text-xs font-bold text-paper ${tone === 'jade' ? 'bg-jade' : 'bg-gradient-to-br from-gold to-gold-ink'}`}>
        <CheckIcon className="h-3 w-3" />
      </span>
      {children}
    </motion.div>
  );
}

/** 一段按进度显隐的块（常用简写） */
export function Reveal({
  at,
  out,
  y = 12,
  className = '',
  children,
}: {
  at: readonly [number, number];
  out?: readonly [number, number];
  y?: number;
  className?: string;
  children: ReactNode;
}) {
  const p = useProgress();
  const opacity = useFade(p, at[0], at[1], out?.[0], out?.[1]);
  const ty = useRange(p, out ? [at[0], at[1], out[0], out[1]] : [at[0], at[1]], out ? [y, 0, 0, -y] : [y, 0], { rest: 0 });
  return (
    <motion.div className={className} style={{ opacity, y: ty }}>
      {children}
    </motion.div>
  );
}

/**
 * 按进度「长出来」的块：高度上限从 0 展开到 max，同时淡入上浮。
 * 用于对话流——新消息占位后把旧消息顶上去，模拟聊天窗口的自动滚动。
 */
export function Grow({
  at,
  max,
  className = '',
  children,
}: {
  at: readonly [number, number];
  max: number;
  className?: string;
  children: ReactNode;
}) {
  const p = useProgress();
  const maxHeight = useRange(p, [at[0], at[1]], [0, max]);
  const opacity = useRange(p, [at[0] + (at[1] - at[0]) * 0.3, at[1]], [0, 1]);
  const y = useRange(p, [at[0], at[1]], [10, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.div className={`shrink-0 overflow-hidden ${className}`} style={{ maxHeight, opacity, y }}>
      {children}
    </motion.div>
  );
}

/** 弹簧式弹出（芯片 / 徽标）；dur 为弹出所占的全局进度跨度 */
export function Pop({ at, dur = 0.008, className = '', children }: { at: number; dur?: number; className?: string; children: ReactNode }) {
  const p = useProgress();
  const scale = useRange(p, [at, at + dur], [0.6, 1], { easing: ease.back, rest: 1 });
  const opacity = useRange(p, [at, at + dur * 0.625], [0, 1]);
  return (
    <motion.div className={className} style={{ scale, opacity }}>
      {children}
    </motion.div>
  );
}
