'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useMediaQuery } from '@/lib/motion';
import { PauseIcon, PlayIcon, RotateCcwIcon } from '@/components/common/Icons';
import { FilmClock, useBoxSize, useFilmControl } from './clock';
import { CLIMAX_AT } from './opening/Opening';
import { FILM_DURATION, TravelerFilm } from './TravelerFilm';
import { FilmSound } from './sound';

/**
 * C 端演示舞台（发布会级重拍，方向 A「一根线」）：标题在上，一块宽银幕，下面一条细的播放条。
 * 桌面与平板是 16:9 的横屏片；手机上是另一张竖向的线路图（9:16，通栏），不是把横屏缩小（SHOWCASE §4）。
 * 进入视口才开始播，离开就停；播完停在片尾；减弱动态效果时不自动播放，章节按钮切换静帧。
 * 声音默认关闭，观众在播放条上打开（WebAudio 现场合成，见 sound.ts）。
 */

interface Chapter {
  id: string;
  label: string;
  /** 章节在片子里开始的时刻（秒） */
  at: number;
  /** 减弱动态效果时这一章的静帧 */
  still: number;
}

const CHAPTERS: Chapter[] = [
  { id: 'say', label: '一句话', at: 0, still: 9.6 },
  { id: 'paths', label: '两条路', at: 12.5, still: 15.8 },
  { id: 'sync', label: '同一版本', at: 16.8, still: CLIMAX_AT + 8.3 },
  { id: 'car', label: '交给车机', at: CLIMAX_AT + 10.65, still: CLIMAX_AT + 16.4 },
];

/** 给读屏软件的文字版：片子里发生了什么（画面本身只靠线与真界面讲） */
const TRANSCRIPT = [
  '领队在输入框里说了一句话：全家 5 口国庆前后去河西走廊玩 9 天左右，带 70 岁的爷爷和 4 岁的女儿，爷爷不能爬高台阶，孩子每天要午休，想看莫高窟和鸣沙山日落，自己开车或者找旅行社都行。',
  'AI 读懂的六处被画上下划线，整理成需求画像：日期、同行、身体、必去、方式；只追问了一句车有多高，回答是总高 2.28 米。',
  '同一份画像分出两条路：持证旅行社线路（示例数据，匹配度为信息参考）与 AI 规划的 9 天自驾路线，自驾路线存进领队手机里的行程「西行计划」。',
  '阿杰和小雨通过链接加入；阿杰提名正宁路夜市，AI 只算代价，提醒夜市地库限高 2.0 米、车停酒店地面车位。',
  '领队点「加入 D0 晚上」，这一行同步到电脑、小雨的平板和阿杰的手机，每块屏都是 v1.1。',
  '出发当天早上，领队把今天的路线投递到车机导航，由车机导航带路到酒店的地面停车场入口。',
];

export function FilmStage() {
  return (
    <section id="demo" aria-label="旅客端演示片：一句话、两条路、全家同一个版本、交给车机导航" className="relative z-10 scroll-mt-16 rounded-b-[28px] bg-[#FFFFF9] py-24 md:py-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <p className="text-[13px] font-semibold tracking-[0.08em] text-[#241E20]">旅客端 · 演示片</p>
        <h2 className="mt-4 max-w-[900px] text-balance font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20] sm:text-[40px] lg:text-[44px]">
          说一句话，<em className="not-italic text-[#FE3C01]">全家</em>围着同一份行程
        </h2>
        <p className="mt-4 max-w-[760px] text-[17px] leading-[1.65] text-[#241E20]/75 sm:text-lg">
          AI 追问一句就读懂这一家人要什么，自驾路线和持证旅行社线路都从这份画像出来。领队确认的每一处改动，全家每一块屏都是同一个版本；出发当天，路线交给车机导航。
        </p>
        <FilmClock duration={FILM_DURATION} autoplay={false}>
          <Player />
        </FilmClock>
        <ol className="sr-only">
          {TRANSCRIPT.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Player() {
  const control = useFilmControl();
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  const frameRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const view = useBoxSize(boxRef);
  const [portrait, setPortrait] = useState(false);
  const userPaused = useRef(false);
  const inView = useRef(false);
  const engine = useRef<FilmSound | null>(null);
  const [soundOn, setSoundOn] = useState(false);
  const toggleSound = () => {
    if (!engine.current) engine.current = new FilmSound();
    if (soundOn) {
      engine.current.disable();
      setSoundOn(false);
    } else if (engine.current.enable()) setSoundOn(true);
  };

  // 画幅：窄屏（手机）用竖屏的线路图
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    const measure = () => setPortrait(el.offsetWidth < 640);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // 进入视口才播，离开就停（不打断用户自己按的暂停，播完不重播）；减弱动态效果时停在第一章的静帧
  const statusRef = useRef(control.status);
  statusRef.current = control.status;
  const controlRef = useRef(control);
  controlRef.current = control;
  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;
    if (reduced) {
      controlRef.current.seek(CHAPTERS[0].still);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        const c = controlRef.current;
        inView.current = entry.intersectionRatio >= 0.5;
        if (inView.current && !userPaused.current && statusRef.current !== 'ended' && statusRef.current !== 'playing') c.play();
        else if (!inView.current && statusRef.current === 'playing') c.pause();
      },
      { threshold: [0, 0.5, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  // 调试钩子（视觉巡检脚本用）：跳到全片进度 v（0–1）并暂停
  useEffect(() => {
    const hook = (v: number) => controlRef.current.seek(v * FILM_DURATION);
    (window as unknown as Record<string, unknown>).__setStageProgress = hook;
    return () => {
      delete (window as unknown as Record<string, unknown>).__setStageProgress;
    };
  }, []);

  const toggle = () => {
    if (control.status === 'playing') {
      userPaused.current = true;
      control.pause();
    } else {
      userPaused.current = false;
      control.play();
    }
  };
  const jump = (c: Chapter) => {
    if (reduced) control.seek(c.still);
    else {
      userPaused.current = false;
      control.play(c.at);
    }
  };

  const aspect = portrait ? 'aspect-[9/16]' : 'aspect-video';
  return (
    <div className="mt-10 md:mt-12">
      {/* 手机上通栏，桌面与平板在版心里 */}
      <div ref={frameRef} className="-mx-5 sm:mx-0">
        <div
          ref={boxRef}
          role="img"
          aria-label="演示片画面：一根橙色的线从那句话出发，串起 AI 读懂的需求、两条路线、全家的每一块屏，最后交给车机导航"
          className={`relative w-full overflow-hidden bg-[#FFFFF9] ${aspect} sm:rounded-[10px] sm:shadow-[inset_0_0_0_1px_rgba(163,163,163,0.28)]`}
        >
          {view.w > 0 ? <TravelerFilm layout={portrait ? 'port' : 'land'} view={view} sound={{ engine: engine.current, on: soundOn }} /> : null}
          {/* 外框的发丝线压在画面上面（画面自己的底色会盖住 inset 阴影）；手机上通栏，只画上下两条 */}
          <span aria-hidden className="pointer-events-none absolute inset-0 shadow-[inset_0_1px_0_rgba(163,163,163,0.28),inset_0_-1px_0_rgba(163,163,163,0.28)] sm:rounded-[10px] sm:shadow-[inset_0_0_0_1px_rgba(163,163,163,0.28)]" />
        </div>
      </div>
      <TransportBar status={control.status} onToggle={toggle} onJump={jump} soundOn={soundOn} onSound={toggleSound} />
    </div>
  );
}

/* ═════════════════════ 播放条 ═════════════════════ */

function TransportBar({
  status,
  onToggle,
  onJump,
  soundOn,
  onSound,
}: {
  status: ReturnType<typeof useFilmControl>['status'];
  onToggle: () => void;
  onJump: (c: Chapter) => void;
  soundOn: boolean;
  onSound: () => void;
}) {
  const control = useFilmControl();
  const label = status === 'playing' ? '暂停' : status === 'ended' ? '重播' : '播放';
  const Icon = status === 'playing' ? PauseIcon : status === 'ended' ? RotateCcwIcon : PlayIcon;
  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    e.preventDefault();
    const next = Math.max(0, Math.min(CHAPTERS.length - 1, i + (e.key === 'ArrowRight' ? 1 : -1)));
    onJump(CHAPTERS[next]);
    document.getElementById(`film-ch-${next}`)?.focus();
  };
  return (
    <div className="mt-4 flex items-start gap-4 sm:gap-5">
      <button
        type="button"
        onClick={onToggle}
        aria-label={label}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#241E20] text-[#FFFFF9] transition-colors duration-300 hover:bg-[#3A3234] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#241E20]"
      >
        <Icon className="h-4 w-4" />
      </button>
      <div className="grid min-w-0 flex-1 grid-cols-4 gap-1.5 sm:gap-2" role="group" aria-label="章节">
        {CHAPTERS.map((c, i) => (
          <ChapterButton key={c.id} c={c} i={i} t={control.t} onJump={onJump} onKeyDown={onKeyDown} />
        ))}
      </div>
      <button
        type="button"
        onClick={onSound}
        aria-pressed={soundOn}
        aria-label={soundOn ? '关闭声音' : '打开声音'}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#241E20] shadow-[inset_0_0_0_1px_rgba(139,139,139,0.32)] transition-colors duration-300 hover:bg-[#241E20]/[0.05] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#241E20]"
      >
        <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M11 5 6 9H3v6h3l5 4z" />
          {soundOn ? (
            <>
              <path d="M15.5 8.5a5 5 0 0 1 0 7" />
              <path d="M18.5 5.5a9 9 0 0 1 0 13" />
            </>
          ) : (
            <>
              <path d="m16 9 5 6" />
              <path d="m21 9-5 6" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}

function ChapterButton({ c, i, t, onJump, onKeyDown }: { c: Chapter; i: number; t: ReturnType<typeof useFilmControl>['t']; onJump: (c: Chapter) => void; onKeyDown: (e: KeyboardEvent<HTMLButtonElement>, i: number) => void }) {
  const end = i < CHAPTERS.length - 1 ? CHAPTERS[i + 1].at : FILM_DURATION;
  const fill = useTransform(t, (v) => Math.max(0, Math.min(1, (v - c.at) / (end - c.at))));
  const current = useTransform(t, (v) => (v >= c.at && v < end) || (i === CHAPTERS.length - 1 && v >= end));
  const ink = useTransform(current, (on) => (on ? 'rgb(36 30 32)' : 'rgb(36 30 32 / 0.62)'));
  return (
    <button id={`film-ch-${i}`} type="button" onClick={() => onJump(c)} onKeyDown={(e) => onKeyDown(e, i)} className="group min-w-0 pt-[18px] text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#241E20]">
      <span aria-hidden className="relative block h-[2px] overflow-hidden rounded-full bg-[#241E20]/[0.12]">
        <motion.span className="absolute inset-0 origin-left bg-[#FE3C01]" style={{ scaleX: fill }} />
      </span>
      <motion.span className="mt-2 block truncate text-[13px] font-medium tabular-nums sm:text-[15px]" style={{ color: ink }}>
        <span className="mr-1.5 hidden sm:inline">0{i + 1}</span>
        {c.label}
      </motion.span>
    </button>
  );
}
