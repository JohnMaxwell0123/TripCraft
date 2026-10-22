'use client';

import { useEffect, type ComponentType, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import {
  BedIcon,
  CarIcon,
  CheckIcon,
  CoffeeIcon,
  LandmarkIcon,
  MountainIcon,
  UtensilsIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 应用视窗内的界面零件（C 端 App 与 B 端线路工作室共用）
 *
 * 只用语义令牌（globals.css「产品界面令牌」、tailwind.config.ts 的 ui-*），不写死色值：
 * 视觉方向由视窗根节点的 data-ui 决定，换方向不改组件。
 * 尺寸遵守 8pt 网格：控件高 32px，间距取 4 / 8 / 12 / 16 / 24px；正文 13px，辅助文字不小于 12px。
 * 只做静态外观；按进度变化的状态由调用方用 useStep 算好再传进来。
 */

export const btn = {
  primary: 'ui-btn ui-btn-primary',
  secondary: 'ui-btn ui-btn-secondary',
  quiet: 'ui-btn ui-btn-quiet',
};

/** 页面标题栏：一个页面一个主任务，标题 + 一行说明 + 右侧操作 */
export function PageHeader({
  title,
  subtitle,
  leading,
  actions,
  className = '',
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  leading?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={`flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4 ${className}`}>
      {leading}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold leading-5 text-ui-ink">{title}</h3>
        {subtitle ? <p className="truncate text-xs leading-4 text-ui-ink-3">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const BADGE_TONES = {
  neutral: 'bg-ui-sunken text-ui-ink-2',
  accent: 'bg-ui-accent/10 text-ui-accent-ink',
  signal: 'bg-ui-signal/10 text-ui-signal-ink',
  /** 旧名：等同 signal */
  flame: 'bg-ui-signal/10 text-ui-signal-ink',
  success: 'bg-ui-success/10 text-ui-success',
  /** 旧名：等同 success */
  green: 'bg-ui-success/10 text-ui-success',
  dark: 'bg-ui-ink text-ui-panel',
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 text-xs font-medium ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** 小节标题（12px，次级灰） */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-medium text-ui-ink-3 ${className}`}>{children}</p>;
}

export function Switch({ on }: { on: boolean }) {
  return (
    <span aria-hidden className={`relative inline-flex h-5 w-8 shrink-0 items-center rounded-full transition-colors duration-200 ${on ? 'bg-ui-success' : 'bg-ui-line-strong'}`}>
      <span className={`absolute left-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.2)] transition-transform duration-200 ${on ? 'translate-x-3' : ''}`} />
    </span>
  );
}

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200 ${
        checked ? 'border-ui-primary bg-ui-primary text-ui-on-primary' : 'border-ui-line-strong bg-ui-surface text-transparent'
      }`}
    >
      <CheckIcon className="h-3 w-3" />
    </span>
  );
}

/** 分段控件：active 为当前选中项序号 */
export function Segmented({ options, active, className = '' }: { options: readonly string[]; active: number; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-ui-ctl bg-ui-sunken p-0.5 text-xs ${className}`}>
      {options.map((o, i) => (
        <span
          key={o}
          className={`rounded-[calc(var(--ui-r-ctl)-2px)] px-2 py-0.5 transition-colors duration-200 ${i === active ? 'bg-ui-surface font-medium text-ui-ink shadow-ui-card' : 'text-ui-ink-3'}`}
        >
          {o}
        </span>
      ))}
    </span>
  );
}

/** 两端对齐的一行「名称 · 值」 */
export function KeyValue({ label, value, className = '' }: { label: ReactNode; value: ReactNode; className?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 text-[13px] ${className}`}>
      <span className="min-w-0 truncate text-ui-ink-2">{label}</span>
      <span className="shrink-0 tabular-nums text-ui-ink">{value}</span>
    </div>
  );
}

/** 向导步骤：当前步实心，已完成打勾（新建线路：导入 → 上架信息 → 路书） */
export function Steps({ labels, active, className = '' }: { labels: readonly string[]; active: number; className?: string }) {
  return (
    <ol className={`flex items-center gap-2 text-xs ${className}`}>
      {labels.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden className={`h-px w-4 ${i <= active ? 'bg-ui-ink-3' : 'bg-ui-line-strong'}`} /> : null}
          <span className={`inline-flex items-center gap-1.5 ${i === active ? 'font-medium text-ui-ink' : i < active ? 'text-ui-ink-2' : 'text-ui-ink-3'}`}>
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-xs leading-none ${
                i === active ? 'bg-ui-primary text-ui-on-primary' : i < active ? 'bg-ui-success text-white' : 'border border-ui-line-strong text-ui-ink-3'
              }`}
            >
              {i < active ? <CheckIcon className="h-3 w-3" /> : i + 1}
            </span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}

/* -------------------------------------------------------------------------- */
/*  进度环：数值可以是静态的，也可以是 MotionValue（随进度连续变化）               */
/* -------------------------------------------------------------------------- */

export function Ring({
  value,
  size = 28,
  stroke = 3,
  tone = 'accent',
  children,
  className = '',
}: {
  value: number | MotionValue<number>;
  size?: number;
  stroke?: number;
  tone?: 'accent' | 'success' | 'route';
  children?: ReactNode;
  className?: string;
}) {
  const r = (size - stroke) / 2;
  const toneClass = { accent: 'stroke-ui-accent', success: 'stroke-ui-success', route: 'stroke-ui-route' }[tone];
  // 数值统一成 MotionValue；为 0 时不画圆头线帽留下的小点
  const fallback = useMotionValue(typeof value === 'number' ? value : 0);
  useEffect(() => {
    if (typeof value === 'number') fallback.set(value);
  }, [value, fallback]);
  const mv = typeof value === 'number' ? fallback : value;
  const arcOpacity = useTransform(mv, (v): number => (v > 0.002 ? 1 : 0));
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" className="stroke-ui-line" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          className={toneClass}
          strokeWidth={stroke}
          strokeLinecap="round"
          style={{ pathLength: mv, opacity: arcOpacity }}
        />
      </svg>
      {children ? <span className="relative">{children}</span> : null}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/*  地点类别：图钉、地点卡片与画像里的地点用同一套颜色和图形                         */
/* -------------------------------------------------------------------------- */

export type PlaceCategory = 'sight' | 'nature' | 'food' | 'stay' | 'transport' | 'service';

export const CAT_ICON: Record<PlaceCategory, ComponentType<IconProps>> = {
  sight: LandmarkIcon,
  nature: MountainIcon,
  food: UtensilsIcon,
  stay: BedIcon,
  transport: CarIcon,
  service: CoffeeIcon,
};

export const CAT_BG: Record<PlaceCategory, string> = {
  sight: 'bg-ui-cat-sight',
  nature: 'bg-ui-cat-nature',
  food: 'bg-ui-cat-food',
  stay: 'bg-ui-cat-stay',
  transport: 'bg-ui-cat-transport',
  service: 'bg-ui-cat-service',
};

export const CAT_SOFT: Record<PlaceCategory, string> = {
  sight: 'bg-ui-cat-sight/[0.12] text-ui-cat-sight',
  nature: 'bg-ui-cat-nature/[0.12] text-ui-cat-nature',
  food: 'bg-ui-cat-food/[0.12] text-ui-cat-food',
  stay: 'bg-ui-cat-stay/[0.12] text-ui-cat-stay',
  transport: 'bg-ui-cat-transport/[0.12] text-ui-cat-transport',
  service: 'bg-ui-cat-service/[0.12] text-ui-cat-service',
};

/** 类别圆标：实心底 + 白色图形（地图图钉、地点卡片） */
export function CatMark({ cat, size = 20, Icon, className = '' }: { cat: PlaceCategory; size?: number; Icon?: ComponentType<IconProps>; className?: string }) {
  const Glyph = Icon ?? CAT_ICON[cat];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-full text-white ${CAT_BG[cat]} ${className}`} style={{ width: size, height: size }}>
      <Glyph style={{ width: Math.round(size * 0.56), height: Math.round(size * 0.56) }} />
    </span>
  );
}

/** 类别方标：浅底 + 同色图形（列表里的地点、日程卡片） */
export function CatTile({ cat, size = 32, Icon, className = '' }: { cat: PlaceCategory; size?: number; Icon?: ComponentType<IconProps>; className?: string }) {
  const Glyph = Icon ?? CAT_ICON[cat];
  return (
    <span className={`inline-flex shrink-0 items-center justify-center rounded-ui-ctl ${CAT_SOFT[cat]} ${className}`} style={{ width: size, height: size }}>
      <Glyph style={{ width: Math.round(size * 0.5), height: Math.round(size * 0.5) }} />
    </span>
  );
}

/** 胶囊：图标 + 文字 */
export function Chip({
  Icon,
  children,
  tone = 'neutral',
  className = '',
}: {
  Icon?: ComponentType<IconProps>;
  children: ReactNode;
  tone?: 'neutral' | 'accent' | 'signal' | 'outline' | 'selected';
  className?: string;
}) {
  const toneClass = {
    neutral: '',
    accent: '!bg-ui-accent/10 !text-ui-accent-ink',
    signal: '!bg-ui-signal/10 !text-ui-signal-ink',
    outline: '!bg-transparent shadow-[inset_0_0_0_1px_rgb(var(--ui-line-strong))] !text-ui-ink-2',
    selected: '!bg-ui-primary !text-ui-on-primary',
  }[tone];
  return (
    <span className={`ui-chip ${toneClass} ${className}`}>
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      {children}
    </span>
  );
}
