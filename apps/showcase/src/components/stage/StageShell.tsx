'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useMotionValue, type MotionValue } from 'framer-motion';
import { ReducedMotionContext, useMediaQuery } from '@/lib/motion';
import { ProgressContext } from './primitives';
import type { Range } from './acts';
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/components/common/Icons';

/**
 * 演示舞台外壳（C 端旅客流程与 B 端旅行社工作室共用）
 *
 * 左侧：眉题、标题、章节导航（桌面竖排、手机横排进度条）与播放控制；右侧：一扇应用视窗（children）。
 * 一只 rAF 时钟按章节时长推进全局进度 MotionValue，场景组件经 ProgressContext 读取，播放过程 0 React 重渲染。
 *
 * - 只播放一遍：最后一章结束后停在终帧，按钮变为「重新播放」。
 * - 视窗露出不足 35% 时挂起；时钟累加每帧耗时（单帧最多计 64ms），切走标签页或掉帧回来不会跳幕。
 * - prefers-reduced-motion：不自动播放，每章停在一张能说明结果的静帧（still），由访客点选章节或手动播放。
 * - 手动点选章节时落在 enter（本章画面已完全淡入的时刻），不会闪过上一章的画面。
 */

export interface StageChapter {
  id: string;
  title: string;
  /** 手机横排导航上的短标题 */
  short: string;
  desc: string;
  /** 章节在全局进度上的区间（来自各舞台的 timeline） */
  range: Range;
  /** 章节时长（毫秒） */
  duration: number;
  /** 手动切入时的起点（章内局部进度） */
  enter: number;
  /** 暂停或减弱动态效果时展示的静帧（章内局部进度） */
  still: number;
  /** 章节序号位置改显示的时间标签（B 端「定制师的一天」） */
  time?: string;
}

type Status = 'playing' | 'paused' | 'ended';

interface StageShellProps {
  id: string;
  ariaLabel: string;
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  chapters: readonly StageChapter[];
  /** 挂在 window 上的调试钩子名：传入全局进度即跳到该帧并暂停（视觉巡检用） */
  debugHook: string;
  tone?: 'canvas' | 'module';
  children: ReactNode;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

function useStageClock(chapters: readonly StageChapter[], debugHook: string, reduced: boolean) {
  const progress = useMotionValue(0);
  const chapterProgress = useMotionValue(0);
  const [active, setActive] = useState(0);
  const [status, setStatus] = useState<Status>('playing');

  const activeRef = useRef(0);
  const statusRef = useRef<Status>('playing');
  const elapsedRef = useRef(0);
  const inViewRef = useRef(false);
  const viewRef = useRef<HTMLDivElement>(null);

  const changeStatus = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  /** 定位到第 index 章的局部进度 local */
  const place = useCallback(
    (index: number, local: number) => {
      const ch = chapters[index];
      const l = clamp01(local);
      if (activeRef.current !== index) {
        activeRef.current = index;
        setActive(index);
      }
      elapsedRef.current = l * ch.duration;
      chapterProgress.set(l);
      progress.set(ch.range[0] + (ch.range[1] - ch.range[0]) * l);
    },
    [chapters, chapterProgress, progress],
  );

  // 时钟
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 64);
      last = now;
      if (statusRef.current === 'playing' && inViewRef.current) {
        const i = activeRef.current;
        const ch = chapters[i];
        elapsedRef.current += dt;
        const l = elapsedRef.current / ch.duration;
        if (l < 1) {
          chapterProgress.set(l);
          progress.set(ch.range[0] + (ch.range[1] - ch.range[0]) * l);
        } else if (i < chapters.length - 1) {
          // 余量带入下一章，章节区间首尾相接，进度连续
          place(i + 1, (elapsedRef.current - ch.duration) / chapters[i + 1].duration);
        } else {
          place(i, 1);
          changeStatus('ended');
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [chapters, chapterProgress, progress, place, changeStatus]);

  // 视口感知
  useEffect(() => {
    const el = viewRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      inViewRef.current = true;
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.intersectionRatio >= 0.35;
      },
      { threshold: [0, 0.35, 0.7] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // 减弱动态效果：停在当前章的静帧，不自动播放
  useEffect(() => {
    if (!reduced) return;
    changeStatus('paused');
    place(activeRef.current, chapters[activeRef.current].still);
  }, [reduced, chapters, place, changeStatus]);

  // 视觉巡检钩子
  useEffect(() => {
    const win = window as unknown as Record<string, unknown>;
    win[debugHook] = (globalVal: number) => {
      const v = clamp01(globalVal);
      let idx = 0;
      chapters.forEach((ch, i) => {
        if (v >= ch.range[0]) idx = i;
      });
      const [s, e] = chapters[idx].range;
      changeStatus('paused');
      place(idx, e > s ? (v - s) / (e - s) : 1);
      progress.set(v);
    };
    return () => {
      delete win[debugHook];
    };
  }, [chapters, debugHook, place, progress, changeStatus]);

  const select = useCallback(
    (index: number) => {
      const i = Math.max(0, Math.min(chapters.length - 1, index));
      if (reduced || statusRef.current === 'paused') {
        place(i, chapters[i].still);
        if (statusRef.current === 'ended') changeStatus('paused');
      } else {
        place(i, chapters[i].enter);
        changeStatus('playing');
      }
    },
    [chapters, place, reduced, changeStatus],
  );

  const toggle = useCallback(() => {
    if (statusRef.current === 'playing') {
      changeStatus('paused');
    } else if (statusRef.current === 'ended') {
      place(0, 0);
      changeStatus('playing');
    } else {
      changeStatus('playing');
    }
  }, [place, changeStatus]);

  return { progress, chapterProgress, active, status, select, toggle, viewRef };
}

export function StageShell({ id, ariaLabel, eyebrow, title, intro, chapters, debugHook, tone = 'canvas', children }: StageShellProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { progress, chapterProgress, active, status, select, toggle, viewRef } = useStageClock(chapters, debugHook, reduced);

  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`relative scroll-mt-20 overflow-hidden py-14 text-[#241E20] md:py-20 ${tone === 'module' ? 'bg-[#F4F4EE]' : 'bg-[#FFFFF9]'}`}
    >
      <div className="relative mx-auto max-w-[1640px] px-4 sm:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8 xl:gap-12">
          <div className="text-left lg:col-span-4">
            <p className="inline-flex items-center gap-2 rounded-full bg-[#FE3C01]/10 px-3 py-1 text-xs font-semibold tracking-wider text-[#C43200]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FE3C01]" />
              {eyebrow}
            </p>
            <h2 className="mt-3 text-balance text-2xl font-bold leading-[1.3] tracking-tight text-[#1E2024] sm:text-3xl lg:text-[26px] xl:text-[30px]">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-black/60 sm:text-[15px]">{intro}</p>

            <ChapterList id={id} chapters={chapters} active={active} chapterProgress={chapterProgress} reduced={reduced} onSelect={select} />
            <Controls className="mt-6 hidden lg:flex" active={active} total={chapters.length} status={status} onToggle={toggle} onSelect={select} />
            <ChapterStrip id={id} chapters={chapters} active={active} chapterProgress={chapterProgress} onSelect={select} />
          </div>

          <div ref={viewRef} className="w-full lg:col-span-8" role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            <ProgressContext.Provider value={progress}>
              <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>
            </ProgressContext.Provider>
            <Controls className="mt-4 flex lg:hidden" active={active} total={chapters.length} status={status} onToggle={toggle} onSelect={select} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 桌面：竖排章节导航（标题 + 进度条，当前章展开说明） ── */
function ChapterList({
  id,
  chapters,
  active,
  chapterProgress,
  reduced,
  onSelect,
}: {
  id: string;
  chapters: readonly StageChapter[];
  active: number;
  chapterProgress: MotionValue<number>;
  reduced: boolean;
  onSelect: (i: number) => void;
}) {
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const next = e.key === 'ArrowDown' ? Math.min(chapters.length - 1, i + 1) : Math.max(0, i - 1);
      onSelect(next);
      document.getElementById(`${id}-tab-${next}`)?.focus();
    }
  };

  // 序号列宽：B 端显示「09:30」这样的时间标签，C 端只显示两位序号
  const hasTime = chapters.some((c) => c.time);

  return (
    <div role="tablist" aria-orientation="vertical" aria-label="章节" className="mt-6 hidden flex-col gap-4 lg:flex xl:gap-5">
      {chapters.map((ch, i) => {
        const isActive = i === active;
        return (
          <button
            key={ch.id}
            id={`${id}-tab-${i}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className="group relative w-full rounded-sm pl-5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
          >
            <span aria-hidden className="absolute inset-y-0 left-0 w-[2px] overflow-hidden rounded-full bg-[#241E20]/10">
              {i < active ? <span className="block h-full w-full bg-[#241E20]/35" /> : null}
              {isActive ? <motion.span className="block h-full w-full origin-top bg-[#FE3C01]" style={{ scaleY: chapterProgress }} /> : null}
            </span>
            <span className="flex items-baseline gap-2">
              <span className={`${hasTime ? 'w-11' : 'w-6'} shrink-0 font-mono text-xs tabular-nums text-[#241E20]/40`}>{ch.time ?? String(i + 1).padStart(2, '0')}</span>
              <span
                className={`text-lg leading-snug transition-colors duration-200 ${
                  isActive ? 'font-semibold text-[#241E20]' : 'font-medium text-[#241E20]/45 group-hover:text-[#241E20]/75'
                }`}
              >
                {ch.title}
              </span>
            </span>
            {isActive ? (
              <motion.span
                className="block overflow-hidden"
                initial={reduced ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.25 }}
              >
                <span className={`mt-1.5 block max-w-md text-sm leading-relaxed text-[#241E20]/60 ${hasTime ? 'pl-[52px]' : 'pl-8'}`}>{ch.desc}</span>
              </motion.span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/* ── 手机 / 平板：横排进度条 + 当前章标题与说明，紧贴视窗上方 ── */
function ChapterStrip({
  id,
  chapters,
  active,
  chapterProgress,
  onSelect,
}: {
  id: string;
  chapters: readonly StageChapter[];
  active: number;
  chapterProgress: MotionValue<number>;
  onSelect: (i: number) => void;
}) {
  const ch = chapters[active];
  return (
    <div className="mt-6 lg:hidden">
      <div role="tablist" aria-label="章节" className="grid gap-2" style={{ gridTemplateColumns: `repeat(${chapters.length}, minmax(0, 1fr))` }}>
        {chapters.map((c, i) => {
          const isActive = i === active;
          return (
            <button
              key={c.id}
              id={`${id}-mtab-${i}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onSelect(i)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  const next = e.key === 'ArrowRight' ? Math.min(chapters.length - 1, i + 1) : Math.max(0, i - 1);
                  onSelect(next);
                  document.getElementById(`${id}-mtab-${next}`)?.focus();
                }
              }}
              className="flex min-h-[44px] flex-col justify-center gap-2 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
            >
              <span aria-hidden className="relative block h-[3px] overflow-hidden rounded-full bg-[#241E20]/10">
                {i < active ? <span className="absolute inset-0 bg-[#241E20]/35" /> : null}
                {isActive ? <motion.span className="absolute inset-0 origin-left bg-[#FE3C01]" style={{ scaleX: chapterProgress }} /> : null}
              </span>
              <span className={`truncate text-xs ${isActive ? 'font-semibold text-[#241E20]' : 'text-[#241E20]/50'}`}>{c.short}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-base font-semibold text-[#241E20]">
        <span className="mr-2 font-mono text-xs font-normal tabular-nums text-[#241E20]/40">{ch.time ?? String(active + 1).padStart(2, '0')}</span>
        {ch.title}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-[#241E20]/60">{ch.desc}</p>
    </div>
  );
}

/* ── 播放控制 ── */
function Controls({
  className = '',
  active,
  total,
  status,
  onToggle,
  onSelect,
}: {
  className?: string;
  active: number;
  total: number;
  status: Status;
  onToggle: () => void;
  onSelect: (i: number) => void;
}) {
  const label = status === 'playing' ? '暂停' : status === 'ended' ? '重新播放' : '播放';
  const Icon = status === 'playing' ? PauseIcon : status === 'ended' ? RotateCcwIcon : PlayIcon;
  return (
    <div className={`items-center justify-between border-t border-[#E2E2D8] pt-4 ${className}`}>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex h-8 items-center gap-1.5 rounded-[5px] bg-[#241E20]/[0.05] px-3 text-xs font-semibold text-[#241E20]/80 transition-colors hover:bg-[#241E20]/10 hover:text-[#241E20]"
        >
          <Icon className="h-3.5 w-3.5 text-[#FE3C01]" />
          {label}
        </button>
        <span className="font-mono text-xs tabular-nums text-[#241E20]/45">
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-[#241E20]/60">
        <button
          type="button"
          disabled={active === 0}
          onClick={() => onSelect(active - 1)}
          className="h-8 rounded-[5px] px-2.5 transition-colors hover:bg-[#241E20]/5 hover:text-[#241E20] disabled:pointer-events-none disabled:opacity-35"
        >
          ← 上一章
        </button>
        <button
          type="button"
          disabled={active === total - 1}
          onClick={() => onSelect(active + 1)}
          className="h-8 rounded-[5px] px-2.5 transition-colors hover:bg-[#241E20]/5 hover:text-[#241E20] disabled:pointer-events-none disabled:opacity-35"
        >
          下一章 →
        </button>
      </div>
    </div>
  );
}
