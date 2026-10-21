'use client';

import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useFade, useFadeVisibility, useStep } from '@/lib/motion';
import { TapCursor, useProgress } from './primitives';
import type { IconProps } from '@/components/common/Icons';

/**
 * 应用视窗外壳：一扇可信的桌面 / 手机应用窗口
 *
 * 宽视窗（≥ 560px）：标题栏 + 侧栏导航 + 内嵌内容面板 + 底部状态栏；≥ 800px 时侧栏显示文字。
 * 窄视窗（手机）：不画桌面标题栏，内容铺满，底部是移动端标签栏。
 * 视窗是 container-name: win 的尺寸容器，内部用 cq-sm / cq-md / cq-lg 变体按视窗自身宽度排版（见 tailwind.config.ts）。
 *
 * 当前高亮哪个导航项、状态栏写什么、标题栏的时钟显示几点，由 sections 按全局进度分段决定——随故事推进切换，
 * 状态栏只写对这一步有实际意义的信息（数据来源、合规口径、同步状态），不放装饰性遥测。
 * 导航项可以带演示光标（tap）：章节之间的衔接通过点击真实的导航完成，下一屏就是这次点击的结果。
 */

export interface WindowNavItem {
  id: string;
  label: string;
  Icon: ComponentType<IconProps>;
  /** 角标显示区间（全局进度），例如新咨询到达后、打开之前 */
  badge?: { text: string; range: readonly [number, number] };
  /** 演示光标点击这一项（侧栏与手机标签栏各画一个，同一时刻只有一个可见） */
  tap?: { approach: readonly [number, number]; clickAt: number; hideAt: number };
}

export interface WindowSection {
  /** 本段起点（全局进度） */
  at: number;
  nav: string;
  status: ReactNode;
  statusRight?: ReactNode;
  /** 标题栏右侧的时钟（B 端「定制师的一天」用来交代时间推进） */
  time?: string;
}

interface AppWindowProps {
  title: string;
  /** 侧栏顶部的产品名 */
  product: string;
  nav: readonly WindowNavItem[];
  sections: readonly WindowSection[];
  /** 侧栏底部的账号区 */
  account: { avatar: ReactNode; name: string; note?: ReactNode };
  ariaLabel: string;
  children: ReactNode;
}

export function AppWindow({ title, product, nav, sections, account, ariaLabel, children }: AppWindowProps) {
  const p = useProgress();
  const step = useStep(
    p,
    sections.slice(1).map((s) => s.at),
  );
  const current = sections[step];

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className="relative h-[620px] w-full overflow-hidden rounded-[18px] border border-[#D7D7CF] bg-[#F7F6F1] text-left shadow-[inset_0_1px_0_rgba(255,255,255,0.86),0_0_0_1px_rgba(0,0,0,0.03),0_32px_64px_-24px_rgba(36,30,32,0.28)] [container-name:win] [container-type:inline-size] sm:h-[640px] lg:h-[660px]"
    >
      <div className="pointer-events-none flex h-full select-none flex-col">
        {/* 标题栏 */}
        <div className="hidden h-10 shrink-0 items-center gap-2 px-4 cq-sm:flex">
          <span aria-hidden className="flex w-14 gap-1.5">
            <span className="h-3 w-3 rounded-full bg-[#FF5F57]" />
            <span className="h-3 w-3 rounded-full bg-[#FEBC2E]" />
            <span className="h-3 w-3 rounded-full bg-[#28C840]" />
          </span>
          <span className="flex-1 truncate text-center text-xs font-medium text-[#828081]">{title}</span>
          <span className="w-14 shrink-0 text-right text-xs tabular-nums text-[#625F61]">{current.time ?? ''}</span>
        </div>

        <div className="flex min-h-0 flex-1">
          {/* 侧栏：≥560 图标，≥800 图标 + 文字 */}
          <nav aria-label={`${product}导航`} className="hidden w-14 shrink-0 flex-col px-2 pb-3 cq-sm:flex cq-lg:w-[156px]">
            <div className="flex h-9 items-center gap-2 px-1.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-xs font-bold text-[#FFFFF9]">旅</span>
              <span className="hidden truncate text-[13px] font-semibold text-[#241E20] cq-lg:inline">{product}</span>
            </div>
            <ul className="mt-3 flex flex-col gap-0.5">
              {nav.map((item) => (
                <NavRow key={item.id} item={item} active={item.id === current.nav} />
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-2 px-1.5">
              {account.avatar}
              <span className="hidden min-w-0 cq-lg:block">
                <span className="block truncate text-xs font-medium text-[#241E20]">{account.name}</span>
                {account.note ? <span className="block truncate text-xs text-[#828081]">{account.note}</span> : null}
              </span>
            </div>
          </nav>

          {/* 内容面板 */}
          <main className="relative min-h-0 min-w-0 flex-1 overflow-hidden bg-white cq-sm:mb-0 cq-sm:mr-2 cq-sm:rounded-[12px] cq-sm:border cq-sm:border-[#E8E7E0]">
            {children}
          </main>
        </div>

        {/* 状态栏 */}
        <div className="hidden h-8 shrink-0 items-center gap-3 px-4 text-xs text-[#828081] cq-sm:flex">
          <span className="min-w-0 flex-1 truncate">{current.status}</span>
          {current.statusRight ? <span className="hidden shrink-0 truncate cq-md:inline">{current.statusRight}</span> : null}
        </div>

        {/* 手机标签栏 */}
        <div className="flex h-[52px] shrink-0 items-stretch border-t border-[#EEEDE7] bg-white cq-sm:hidden">
          {nav.map((item) => (
            <TabRow key={item.id} item={item} active={item.id === current.nav} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NavBadge({ badge }: { badge: NonNullable<WindowNavItem['badge']> }) {
  const p = useProgress();
  const opacity = useFade(p, badge.range[0], badge.range[0] + 0.004, badge.range[1] - 0.002, badge.range[1]);
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.span
      className="ml-auto hidden h-4 min-w-4 items-center justify-center rounded-full bg-[#FE3C01] px-1 text-xs font-semibold leading-none text-white cq-lg:flex"
      style={{ opacity, visibility }}
    >
      {badge.text}
    </motion.span>
  );
}

function NavDot({ badge }: { badge: NonNullable<WindowNavItem['badge']> }) {
  const p = useProgress();
  const opacity = useFade(p, badge.range[0], badge.range[0] + 0.004, badge.range[1] - 0.002, badge.range[1]);
  const visibility = useFadeVisibility(opacity);
  return <motion.span aria-hidden className="absolute right-1 top-1 h-2 w-2 rounded-full bg-[#FE3C01] ring-2 ring-[#F7F6F1] cq-lg:hidden" style={{ opacity, visibility }} />;
}

function NavRow({ item, active }: { item: WindowNavItem; active: boolean }) {
  return (
    <li
      className={`relative flex h-8 items-center gap-2 rounded-[5px] px-2 text-[13px] transition-colors duration-200 ${
        active ? 'bg-white font-medium text-[#241E20] shadow-[0_1px_2px_rgba(36,30,32,0.06)]' : 'text-[#625F61]'
      }`}
      title={item.label}
    >
      <item.Icon className={`h-4 w-4 shrink-0 ${active ? 'text-[#241E20]' : 'text-[#828081]'}`} />
      <span className="hidden truncate cq-lg:inline">{item.label}</span>
      {item.badge ? (
        <>
          <NavBadge badge={item.badge} />
          <NavDot badge={item.badge} />
        </>
      ) : null}
      {item.tap ? <TapCursor approach={item.tap.approach} clickAt={item.tap.clickAt} hideAt={item.tap.hideAt} className="left-5 top-4" /> : null}
    </li>
  );
}

function TabRow({ item, active }: { item: WindowNavItem; active: boolean }) {
  return (
    <span className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-xs ${active ? 'font-medium text-[#241E20]' : 'text-[#828081]'}`}>
      <item.Icon className="h-[18px] w-[18px]" />
      {item.label}
      {item.badge ? <TabDot badge={item.badge} /> : null}
      {item.tap ? <TapCursor approach={item.tap.approach} clickAt={item.tap.clickAt} hideAt={item.tap.hideAt} className="left-1/2 top-4" /> : null}
    </span>
  );
}

function TabDot({ badge }: { badge: NonNullable<WindowNavItem['badge']> }) {
  const p = useProgress();
  const opacity = useFade(p, badge.range[0], badge.range[0] + 0.004, badge.range[1] - 0.002, badge.range[1]);
  const visibility = useFadeVisibility(opacity);
  return <motion.span aria-hidden className="absolute left-1/2 top-1.5 ml-2 h-2 w-2 rounded-full bg-[#FE3C01]" style={{ opacity, visibility }} />;
}
