'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useFade, useFadeVisibility, useRange, useVisibility, interp, ease } from '@/lib/motion';
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
  const opacity = useRange(p, [a, a + span * 0.4, hideAt - span * 0.4, hideAt], [0, 1, 1, 0]);
  const visibility = useFadeVisibility(opacity);
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

export type AvatarTone = 'gold' | 'jade' | 'lapis' | 'ochre';

export function Avatar({ name, tone, size = 28, className = '' }: { name: string; tone: AvatarTone; size?: number; className?: string }) {
  const bg = {
    gold: 'bg-[#8C6A2F]',
    jade: 'bg-[#0E7A5A]',
    lapis: 'bg-[#3D5A80]',
    ochre: 'bg-[#B4441B]',
  }[tone];
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-2 ring-white ${bg} ${className}`}
      style={{ width: size, height: size, fontSize: Math.max(12, Math.round(size * 0.46)) }}
    >
      {name.slice(0, 1)}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  气泡提示                                                                     */
/* -------------------------------------------------------------------------- */

/** 轻提示：白底发丝边框，一次只说一件事；range 为 [淡入起, 淡入止, 淡出起, 淡出止]（淡出可省略，停留到舞台结束） */
export function Toast({
  range,
  children,
  tone = 'jade',
  className = '',
}: {
  range: readonly [number, number] | readonly [number, number, number, number];
  children: ReactNode;
  tone?: 'jade' | 'neutral';
  className?: string;
}) {
  const p = useProgress();
  const out = range.length === 4;
  const opacity = useFade(p, range[0], range[1], out ? range[2] : undefined, out ? range[3] : undefined);
  const y = useRange(p, out ? [range[0], range[1], range[2], range[3]] : [range[0], range[1]], out ? [-8, 0, 0, -6] : [-8, 0], { easing: ease.out, rest: 0 });
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.div
      role="status"
      className={`flex max-w-full items-center gap-2 rounded-[10px] border border-[#E2E2D8] bg-white px-3 py-2 text-[13px] font-medium leading-snug text-[#241E20] shadow-[0_8px_24px_rgba(36,30,32,0.10)] ${className}`}
      style={{ opacity, y, visibility }}
    >
      <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-white ${tone === 'jade' ? 'bg-[#0E7A5A]' : 'bg-[#241E20]'}`}>
        <CheckIcon className="h-3 w-3" />
      </span>
      <span className="min-w-0">{children}</span>
    </motion.div>
  );
}

/**
 * 视窗里的一屏：绝对铺满主区，按进度淡入（叠在上一屏之上），完全盖住后上一屏再隐藏，
 * 交接过程中不会露出空白。range 为 [淡入起, 淡入止] 或 [淡入起, 淡入止, 隐藏起, 隐藏止]。
 */
export function Scene({
  range,
  label,
  className = '',
  children,
}: {
  range: readonly [number, number] | readonly [number, number, number, number];
  label: string;
  className?: string;
  children: ReactNode;
}) {
  const p = useProgress();
  const out = range.length === 4;
  const opacity = useRange(p, range, out ? [0, 1, 1, 0] : [0, 1]);
  const visibility = useVisibility(p, range[0] - 0.0005, out ? range[3] + 0.0005 : 2);
  return (
    <motion.section
      aria-label={label}
      className={`absolute inset-0 flex flex-col overflow-hidden bg-white ${className}`}
      style={{ opacity, visibility }}
    >
      {children}
    </motion.section>
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
  const visibility = useFadeVisibility(opacity);
  const ty = useRange(p, out ? [at[0], at[1], out[0], out[1]] : [at[0], at[1]], out ? [y, 0, 0, -y] : [y, 0], { rest: 0 });
  return (
    <motion.div className={className} style={{ opacity, visibility, y: ty }}>
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
  const visibility = useFadeVisibility(opacity);
  const y = useRange(p, [at[0], at[1]], [10, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.div className={`shrink-0 overflow-hidden ${className}`} style={{ maxHeight, opacity, visibility, y }}>
      {children}
    </motion.div>
  );
}

/** 弹簧式弹出（芯片 / 徽标）；dur 为弹出所占的全局进度跨度 */
export function Pop({ at, dur = 0.008, className = '', children }: { at: number; dur?: number; className?: string; children: ReactNode }) {
  const p = useProgress();
  const scale = useRange(p, [at, at + dur], [0.6, 1], { easing: ease.back, rest: 1 });
  const opacity = useRange(p, [at, at + dur * 0.625], [0, 1]);
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.div className={className} style={{ scale, opacity, visibility }}>
      {children}
    </motion.div>
  );
}
