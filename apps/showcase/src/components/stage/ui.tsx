'use client';

import type { ReactNode } from 'react';
import { CheckIcon } from '@/components/common/Icons';

/**
 * 应用视窗内的界面零件（C 端 App 与 B 端线路工作室共用）
 *
 * 只做静态外观；按进度变化的状态由调用方用 useStep 算好再传进来。
 * 尺寸遵守 8pt 网格：控件高 32px，间距取 4 / 8 / 12 / 16 / 24px；正文 13px，辅助文字不小于 12px。
 * 色彩沿用 Unify GTM：炭黑主操作、发丝边框，烈焰橙只用于需要注意的信号；
 * 12px 的橙色文字用加深的 #C43200，保证在白底上的对比度。
 */

export const btn = {
  primary:
    'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] bg-[#241E20] px-3 text-[13px] font-medium text-[#FFFFF9]',
  secondary:
    'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] border border-[#E2E2D8] bg-white px-3 text-[13px] font-medium text-[#241E20]',
  quiet:
    'inline-flex h-8 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-[5px] px-2 text-[13px] font-medium text-[#625F61]',
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
    <header className={`flex h-14 shrink-0 items-center gap-3 border-b border-[#EEEDE7] px-4 ${className}`}>
      {leading}
      <div className="min-w-0 flex-1">
        <h3 className="truncate text-[15px] font-semibold leading-5 text-[#241E20]">{title}</h3>
        {subtitle ? <p className="truncate text-xs leading-4 text-[#828081]">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const BADGE_TONES = {
  neutral: 'border-[#E2E2D8] bg-[#F7F6F1] text-[#625F61]',
  flame: 'border-[#FE3C01]/30 bg-[#FE3C01]/[0.06] text-[#C43200]',
  green: 'border-[#0E7A5A]/25 bg-[#0E7A5A]/[0.06] text-[#0E7A5A]',
  dark: 'border-[#241E20] bg-[#241E20] text-[#FFFFF9]',
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({ tone = 'neutral', children, className = '' }: { tone?: BadgeTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex h-5 shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2 text-xs font-medium ${BADGE_TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** 小节标题（12px，次级灰） */
export function SectionLabel({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <p className={`text-xs font-medium text-[#828081] ${className}`}>{children}</p>;
}

export function Switch({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors duration-200 ${on ? 'bg-[#241E20]' : 'bg-[#DCDBD3]'}`}
    >
      <span className={`absolute left-0.5 h-3 w-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${on ? 'translate-x-3' : ''}`} />
    </span>
  );
}

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[4px] border transition-colors duration-200 ${
        checked ? 'border-[#241E20] bg-[#241E20] text-white' : 'border-[#CFCEC6] bg-white text-transparent'
      }`}
    >
      <CheckIcon className="h-3 w-3" />
    </span>
  );
}

/** 分段控件：active 为当前选中项序号 */
export function Segmented({ options, active, className = '' }: { options: readonly string[]; active: number; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 rounded-[5px] border border-[#E2E2D8] bg-[#F7F6F1] p-0.5 text-xs ${className}`}>
      {options.map((o, i) => (
        <span
          key={o}
          className={`rounded-[4px] px-2 py-0.5 transition-colors duration-200 ${i === active ? 'bg-white font-medium text-[#241E20] shadow-[0_1px_2px_rgba(36,30,32,0.08)]' : 'text-[#828081]'}`}
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
      <span className="min-w-0 truncate text-[#625F61]">{label}</span>
      <span className="shrink-0 tabular-nums text-[#241E20]">{value}</span>
    </div>
  );
}

/** 向导步骤：当前步实心，已完成打勾（新建线路：导入 → 上架信息 → 路书） */
export function Steps({ labels, active, className = '' }: { labels: readonly string[]; active: number; className?: string }) {
  return (
    <ol className={`flex items-center gap-2 text-xs ${className}`}>
      {labels.map((label, i) => (
        <li key={label} className="flex items-center gap-2">
          {i > 0 ? <span aria-hidden className="h-px w-3 bg-[#DCDBD3]" /> : null}
          <span className={`inline-flex items-center gap-1.5 ${i === active ? 'font-medium text-[#241E20]' : i < active ? 'text-[#625F61]' : 'text-[#A3A19B]'}`}>
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full text-xs leading-none ${
                i === active ? 'bg-[#241E20] text-white' : i < active ? 'bg-[#E8E7E0] text-[#625F61]' : 'border border-[#DCDBD3] text-[#A3A19B]'
              }`}
            >
              {i < active ? <CheckIcon className="h-2.5 w-2.5" /> : i + 1}
            </span>
            {label}
          </span>
        </li>
      ))}
    </ol>
  );
}
