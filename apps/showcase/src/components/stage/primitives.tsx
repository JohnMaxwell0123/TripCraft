'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useFade, useRange, interp, ease } from '@/lib/motion';
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
}

export function FakeCursor({ times, xs, ys, clickAt, hideAt, label }: FakeCursorProps) {
  const p = useProgress();
  const t0 = times[0];
  const end = hideAt ?? clickAt + 0.012;
  const visibility = useTransform(p, (v) => (v >= t0 - 0.005 && v <= end ? 'visible' : 'hidden'));
  const opacity = useRange(p, [t0 - 0.004, t0, end - 0.004, end], [0, 1, 1, 0]);
  const x = useTransform(p, (v) => {
    if (v < t0 - 0.005 || v > end) return `${xs[0]}cqw`;
    return `${interp(v, times, xs, ease.smooth)}cqw`;
  });
  const y = useTransform(p, (v) => {
    if (v < t0 - 0.005 || v > end) return `${ys[0]}cqh`;
    return `${interp(v, times, ys, ease.smooth)}cqh`;
  });
  const press = useRange(p, [clickAt - 0.003, clickAt, clickAt + 0.003], [1, 0.82, 1]);
  const ring = useRange(p, [clickAt, clickAt + 0.01], [0, 1], { easing: ease.out });
  const ringOpacity = useRange(p, [clickAt - 0.0005, clickAt, clickAt + 0.01], [0, 0.9, 0]);

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

/** 弹簧式弹出（芯片 / 徽标） */
export function Pop({ at, className = '', children }: { at: number; className?: string; children: ReactNode }) {
  const p = useProgress();
  const scale = useRange(p, [at, at + 0.008], [0.6, 1], { easing: ease.back, rest: 1 });
  const opacity = useRange(p, [at, at + 0.005], [0, 1]);
  return (
    <motion.div className={className} style={{ scale, opacity }}>
      {children}
    </motion.div>
  );
}
