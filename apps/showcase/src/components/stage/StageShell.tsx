'use client';

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { motion, useMotionValue, type MotionValue } from 'framer-motion';
import { ReducedMotionContext, useMediaQuery } from '@/lib/motion';
import { ProgressContext } from './primitives';
import type { Range } from './acts';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon, RotateCcwIcon } from '@/components/common/Icons';

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
 * - 换章时版面不动：桌面左栏顶端对齐，旧章说明收起与新章说明展开同时进行；手机的当前章说明占固定高度。
 *   版面高度一变，浏览器的滚动锚定就会替访客滚动页面，看起来像整页跳了一下。
 *
 * 视觉（.agents/rules/unify-gtm-design-system.md）：眉题炭黑小字、标题用衬线、章节标题 20px 常规字重，
 * 进度条贴在文字左侧的留白里，当前章用烈焰橙填充。tone="band" 是深色氛围带（B 端），文字反白。
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
type Tone = 'canvas' | 'band';

interface StageShellProps {
  id: string;
  ariaLabel: string;
  eyebrow: string;
  title: ReactNode;
  intro: ReactNode;
  chapters: readonly StageChapter[];
  /** 挂在 window 上的调试钩子名：传入全局进度即跳到该帧并暂停（视觉巡检用） */
  debugHook: string;
  /** canvas：暖纸画布；band：深色氛围带（文字反白） */
  tone?: Tone;
  /** 与相邻分区的衔接：sheet = 底边圆角的纸面压在下一段氛围带上 */
  edge?: 'sheet' | 'none';
  children: ReactNode;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/**
 * 播放速率：时间轴按 1 倍书写（章节时长、关键帧都以「时间轴秒」计），时钟按这个速率推进。
 * 0.9 = 整体放慢到 0.9 倍：C 端 55.1 → 约 61 秒（2026-10-29 导演版：01–03 幕 48 → 33.6 秒、04 幕 20 → 21.5 秒；
 * 原为 68 → 约 76 秒），B 端 61 → 约 68 秒。调整整体节奏只改这里，不动关键帧。
 */
export const PLAYBACK_RATE = 0.9;

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

  /**
   * 暂停时跳到某一帧之后，再轻推两帧进度（差一亿分之一）：几个派生值合成的样式（镜头、地图跟拍）
   * 在同一帧里可能先于某个输入算完，播放时下一帧就会更正，暂停时却会一直停在旧值上。
   */
  const settle = useCallback(() => {
    let n = 0;
    const nudge = () => {
      if (statusRef.current === 'playing') return;
      progress.set(progress.get() + 1e-9);
      if (++n < 2) requestAnimationFrame(nudge);
    };
    requestAnimationFrame(nudge);
  }, [progress]);

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
      settle();
    },
    [chapters, chapterProgress, progress, settle],
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
        elapsedRef.current += dt * PLAYBACK_RATE;
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
      settle();
    };
    return () => {
      delete win[debugHook];
    };
  }, [chapters, debugHook, place, progress, changeStatus, settle]);

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

/** 两种底色下的文字与线条颜色 */
const INK = {
  canvas: {
    eyebrow: 'text-[#241E20]',
    title: 'text-[#241E20]',
    body: 'text-[#241E20]/75',
    num: 'text-[#241E20]/55',
    active: 'text-[#241E20]',
    idle: 'text-[#241E20]/[0.62] group-hover:text-[#241E20]/85',
    desc: 'text-[#241E20]/70',
    track: 'bg-[#241E20]/[0.12]',
    done: 'bg-[#241E20]/30',
    rule: 'border-[#241E20]/[0.12]',
    btn: 'border-[#241E20]/15 bg-[#FFFFF9] text-[#241E20] hover:border-[#241E20]/40',
  },
  band: {
    eyebrow: 'text-[#FFFFF9]/85',
    title: 'text-[#FFFFF9]',
    body: 'text-[#FFFFF9]/75',
    num: 'text-[#FFFFF9]/55',
    active: 'text-[#FFFFF9]',
    idle: 'text-[#FFFFF9]/60 group-hover:text-[#FFFFF9]/85',
    desc: 'text-[#FFFFF9]/70',
    track: 'bg-[#FFFFF9]/[0.16]',
    done: 'bg-[#FFFFF9]/40',
    rule: 'border-[#FFFFF9]/[0.14]',
    btn: 'border-[#FFFFF9]/25 bg-[#FFFFF9]/[0.06] text-[#FFFFF9] hover:border-[#FFFFF9]/50',
  },
} as const;

type Ink = (typeof INK)[Tone];

export function StageShell({ id, ariaLabel, eyebrow, title, intro, chapters, debugHook, tone = 'canvas', edge = 'none', children }: StageShellProps) {
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const { progress, chapterProgress, active, status, select, toggle, viewRef } = useStageClock(chapters, debugHook, reduced);
  const ink = INK[tone];

  const surface =
    tone === 'band'
      ? // 深色氛围带：从上一段纸面的圆角下面伸出来，再被下一段纸面盖住
        'atmo atmo-dusk -mt-7 pb-[calc(6rem+1.75rem)] pt-[calc(6rem+1.75rem)] md:pb-[calc(8rem+1.75rem)] md:pt-[calc(8rem+1.75rem)]'
      : `bg-[#FFFFF9] py-24 md:py-32 ${edge === 'sheet' ? 'relative z-10 rounded-b-[28px]' : ''}`;

  return (
    <section id={id} aria-label={ariaLabel} className={`relative scroll-mt-16 overflow-hidden ${surface}`}>
      <div className="relative mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-14">
          <div className="text-left">
            <p className={`text-[13px] font-semibold tracking-[0.08em] ${ink.eyebrow}`}>{eyebrow}</p>
            <h2 className={`mt-4 text-balance font-serif text-[30px] font-semibold leading-[1.18] tracking-[-0.02em] sm:text-[34px] xl:text-[38px] ${ink.title}`}>{title}</h2>
            <p className={`mt-4 max-w-xl text-base leading-relaxed ${ink.body}`}>{intro}</p>

            <ChapterList id={id} chapters={chapters} active={active} chapterProgress={chapterProgress} ink={ink} onSelect={select} />
            <Controls className="mt-6 hidden lg:flex xl:mt-8" active={active} total={chapters.length} status={status} ink={ink} onToggle={toggle} onSelect={select} />
            <ChapterStrip id={id} chapters={chapters} active={active} chapterProgress={chapterProgress} ink={ink} onSelect={select} />
          </div>

          <div ref={viewRef} className="w-full" role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
            <ProgressContext.Provider value={progress}>
              <ReducedMotionContext.Provider value={reduced}>{children}</ReducedMotionContext.Provider>
            </ProgressContext.Provider>
            <Controls className="mt-4 flex lg:hidden" active={active} total={chapters.length} status={status} ink={ink} onToggle={toggle} onSelect={select} />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── 桌面：竖排章节导航（进度条在文字左侧留白里；当前章展开说明，旧章同时收起） ── */
function ChapterList({
  id,
  chapters,
  active,
  chapterProgress,
  ink,
  onSelect,
}: {
  id: string;
  chapters: readonly StageChapter[];
  active: number;
  chapterProgress: MotionValue<number>;
  ink: Ink;
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
    <div role="tablist" aria-orientation="vertical" aria-label="章节" className="mt-10 hidden flex-col lg:flex">
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
            className="group relative w-full rounded-[5px] py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
          >
            <span aria-hidden className={`absolute inset-y-1 -left-5 w-[3px] overflow-hidden rounded-full xl:-left-6 ${ink.track}`}>
              {i < active ? <span className={`block h-full w-full ${ink.done}`} /> : null}
              {isActive ? <motion.span className="block h-full w-full origin-top bg-[#FE3C01]" style={{ scaleY: chapterProgress }} /> : null}
            </span>
            <span className="flex items-baseline gap-3">
              <span className={`${hasTime ? 'w-11' : 'w-6'} shrink-0 font-mono text-xs tabular-nums ${ink.num}`}>{ch.time ?? String(i + 1).padStart(2, '0')}</span>
              <span className={`text-xl leading-snug transition-colors duration-200 ${isActive ? ink.active : ink.idle}`}>{ch.title}</span>
            </span>
            {/* 说明：所有章都渲染，靠 grid 行高 0fr ↔ 1fr 同时收放，列表总高度不变 */}
            <span
              className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${isActive ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
              aria-hidden={!isActive}
            >
              <span className="overflow-hidden">
                <span className={`block pt-2 text-[15px] leading-relaxed ${ink.desc} ${hasTime ? 'pl-14' : 'pl-9'}`}>{ch.desc}</span>
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ── 手机 / 平板：横排进度条 + 当前章标题与说明（固定高度），紧贴视窗上方 ── */
function ChapterStrip({
  id,
  chapters,
  active,
  chapterProgress,
  ink,
  onSelect,
}: {
  id: string;
  chapters: readonly StageChapter[];
  active: number;
  chapterProgress: MotionValue<number>;
  ink: Ink;
  onSelect: (i: number) => void;
}) {
  const ch = chapters[active];
  return (
    <div className="mt-8 lg:hidden">
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
              className="flex min-h-[44px] flex-col justify-center gap-2 rounded-[5px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
            >
              <span aria-hidden className={`relative block h-[3px] overflow-hidden rounded-full ${ink.track}`}>
                {i < active ? <span className={`absolute inset-0 ${ink.done}`} /> : null}
                {isActive ? <motion.span className="absolute inset-0 origin-left bg-[#FE3C01]" style={{ scaleX: chapterProgress }} /> : null}
              </span>
              <span className={`truncate text-[13px] ${isActive ? `font-semibold ${ink.active}` : ink.idle}`}>{c.short}</span>
            </button>
          );
        })}
      </div>
      {/* 固定高度：换章时下方视窗的位置不变 */}
      <div className="mt-4 min-h-[124px] sm:min-h-[100px]">
        <p className={`text-lg font-semibold leading-snug ${ink.active}`}>
          <span className={`mr-2 font-mono text-xs font-normal tabular-nums ${ink.num}`}>{ch.time ?? String(active + 1).padStart(2, '0')}</span>
          {ch.title}
        </p>
        <p className={`mt-1.5 line-clamp-3 text-[15px] leading-relaxed ${ink.desc}`}>{ch.desc}</p>
      </div>
    </div>
  );
}

/* ── 播放控制 ── */
function Controls({
  className = '',
  active,
  total,
  status,
  ink,
  onToggle,
  onSelect,
}: {
  className?: string;
  active: number;
  total: number;
  status: Status;
  ink: Ink;
  onToggle: () => void;
  onSelect: (i: number) => void;
}) {
  const label = status === 'playing' ? '暂停' : status === 'ended' ? '重新播放' : '播放';
  const Icon = status === 'playing' ? PauseIcon : status === 'ended' ? RotateCcwIcon : PlayIcon;
  // 紧凑排布：iPad 横屏（1024–1279px）时左栏只有 300px，「上一章 / 下一章」用图标按钮，整行不折行
  const step = `flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px] border transition-colors disabled:pointer-events-none disabled:opacity-35 ${ink.btn}`;
  return (
    <div className={`items-center justify-between gap-3 whitespace-nowrap border-t pt-5 ${ink.rule} ${className}`}>
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-[5px] border px-3.5 text-sm font-medium transition-colors ${ink.btn}`}
        >
          <Icon className="h-3.5 w-3.5 text-[#FE3C01]" />
          {label}
        </button>
        <span className={`font-mono text-xs tabular-nums ${ink.num}`}>
          {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" aria-label="上一章" title="上一章" disabled={active === 0} onClick={() => onSelect(active - 1)} className={step}>
          <ChevronLeftIcon className="h-4 w-4" />
        </button>
        <button type="button" aria-label="下一章" title="下一章" disabled={active === total - 1} onClick={() => onSelect(active + 1)} className={step}>
          <ChevronRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
