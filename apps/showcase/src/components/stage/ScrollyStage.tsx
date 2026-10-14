'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ReducedMotionContext, ease, useFade, useMediaQuery, useRange, useStep } from '@/lib/motion';
import { CHAPTERS, STAGE_VH, T, type Chapter } from './timeline';
import { LayoutContext, ProgressContext, useProgress } from './primitives';
import { ChatScene } from './ChatScene';
import { Workspace } from './Workspace';
import { CollabDrawer, PhoneMock, ShareSheet, Topbar } from './Collab';
import { Backdrop, RecommendModal, StageToasts } from './Recommend';
import { DeliverScene } from './Deliver';
import { PlayIcon, PauseIcon, RotateCcwIcon, TerminalIcon, DatabaseIcon, ShieldIcon } from '@/components/common/Icons';

/**
 * 核心视差滚动演示区（SHOWCASE §4）
 * 外层高 STAGE_VH vh 提供滚动行程，内层 sticky 视口固钉，
 * 所有场景订阅同一个 scrollProgress（经轻量弹簧平滑）。
 * 支持下滑进入后自动演进播放，用户滚动鼠标可随时无缝接管与恢复。
 */
export function ScrollyStage() {
  const ref = useRef<HTMLElement>(null);
  const reducedPref = useReducedMotion();
  const reduced = reducedPref ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 160, damping: 32, mass: 0.35, restDelta: 0.0001 });
  const progress = reduced ? scrollYProgress : smooth;
  const desktop = useMediaQuery('(min-width: 768px)');
  const wide = useMediaQuery('(min-width: 1280px)');

  // 自动播放与交互状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [speed, setSpeed] = useState<number>(0.9);
  const [isInsideStage, setIsInsideStage] = useState(false);

  const isPlayingRef = useRef(false);
  const isInteractingRef = useRef(false);
  const isJumpingRef = useRef(false);
  const userPausedRef = useRef(false);
  const speedRef = useRef(0.9);
  const lastAutoScrollYRef = useRef(0);
  const lastAutoScrollTimeRef = useRef(0);
  const isAutoScrollingRef = useRef(false);
  const lastTimeRef = useRef<number | null>(null);
  const userScrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafIdRef = useRef<number | null>(null);

  // 检测舞台在视口中的状态：进入吸顶区域后自动激活演示
  const updateStageStatus = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const travel = el.offsetHeight - window.innerHeight;
    const stageTop = rect.top + window.scrollY;
    const currentRelY = window.scrollY - stageTop;

    // 当舞台顶部到达视口顶部且尚未完全滚出时，判定为在舞台内
    const inside = rect.top <= 20 && rect.bottom >= window.innerHeight - 20;
    setIsInsideStage(inside);

    if (inside) {
      if (currentRelY >= travel - 4) {
        setIsAtEnd(true);
        isPlayingRef.current = false;
        setIsPlaying(false);
      } else {
        setIsAtEnd(false);
        // 如果用户未主动点击暂停，且非跳转中，进入舞台后自动激活演示
        if (!userPausedRef.current && !isJumpingRef.current && !reduced) {
          if (!isPlayingRef.current) {
            isPlayingRef.current = true;
            setIsPlaying(true);
            lastAutoScrollYRef.current = window.scrollY;
            lastAutoScrollTimeRef.current = performance.now();
          }
        }
      }
    } else {
      // 离开舞台（滚回顶部 Hero 或滚入 Bento 矩阵）
      if (isPlayingRef.current) {
        isPlayingRef.current = false;
        setIsPlaying(false);
      }
      // 若滚回舞台上方，重置手动暂停标记，便于用户再次向下滑入时能再次自启动
      if (rect.top > 20) {
        userPausedRef.current = false;
      }
    }
  }, [reduced]);

  // 用户手动交互监听（滚轮、触摸、键盘、滚动条拖拽），让出 100% 滚动主导权
  const onUserInteraction = useCallback(() => {
    isInteractingRef.current = true;
    setIsInteracting(true);

    if (userScrollTimeoutRef.current) {
      clearTimeout(userScrollTimeoutRef.current);
    }
    userScrollTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
      setIsInteracting(false);
      userScrollTimeoutRef.current = null;
      lastAutoScrollYRef.current = window.scrollY;
      lastAutoScrollTimeRef.current = performance.now();
      // 停顿后刷新舞台状态，平滑续播
      updateStageStatus();
    }, 900);
  }, [updateStageStatus]);

  // 核心逐帧平滑推进循环
  useEffect(() => {
    const tick = (now: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = now;
      }
      const dt = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      const el = ref.current;
      if (
        el &&
        isPlayingRef.current &&
        !isInteractingRef.current &&
        !isJumpingRef.current &&
        !reduced
      ) {
        const stageTop = el.getBoundingClientRect().top + window.scrollY;
        const travel = el.offsetHeight - window.innerHeight;
        const currentRelY = window.scrollY - stageTop;

        if (currentRelY >= -20 && currentRelY < travel) {
          // 全剧情标准时长：48 秒完整演进 5 大章节
          const baseDuration = 48;
          const speedPxPerSec = (travel / baseDuration) * speedRef.current;
          const delta = speedPxPerSec * dt;
          const nextY = Math.max(stageTop, window.scrollY + delta);
          const targetY = Math.min(stageTop + travel, nextY);

          isAutoScrollingRef.current = true;
          lastAutoScrollYRef.current = targetY;
          lastAutoScrollTimeRef.current = performance.now();
          window.scrollTo({ top: targetY, behavior: 'instant' });

          if (targetY >= stageTop + travel - 2) {
            isPlayingRef.current = false;
            setIsPlaying(false);
            setIsAtEnd(true);
          }
        } else if (currentRelY >= travel) {
          isPlayingRef.current = false;
          setIsPlaying(false);
          setIsAtEnd(true);
        }
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    lastTimeRef.current = performance.now();
    rafIdRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (userScrollTimeoutRef.current) {
        clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, [reduced]);

  // 从头重播
  const replay = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    isJumpingRef.current = true;
    lastAutoScrollYRef.current = top;
    lastAutoScrollTimeRef.current = performance.now();
    window.scrollTo({ top, behavior: 'smooth' });

    setTimeout(() => {
      isJumpingRef.current = false;
      userPausedRef.current = false;
      isInteractingRef.current = false;
      setIsInteracting(false);
      setIsAtEnd(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastAutoScrollYRef.current = window.scrollY;
      lastAutoScrollTimeRef.current = performance.now();
    }, 750);
  }, []);

  // 切换播放 / 暂停
  const togglePlay = useCallback(() => {
    if (isAtEnd) {
      replay();
      return;
    }
    if (isPlayingRef.current) {
      userPausedRef.current = true;
      isPlayingRef.current = false;
      setIsPlaying(false);
    } else {
      userPausedRef.current = false;
      isInteractingRef.current = false;
      setIsInteracting(false);
      isPlayingRef.current = true;
      setIsPlaying(true);
      lastAutoScrollYRef.current = window.scrollY;
      lastAutoScrollTimeRef.current = performance.now();
    }
  }, [isAtEnd, replay]);

  // 切换播放倍速 (0.9x -> 1.0x -> 1.5x -> 2.0x -> 0.9x)
  const cycleSpeed = useCallback(() => {
    const speeds = [0.9, 1.0, 1.5, 2.0];
    const currentIndex = speeds.indexOf(speedRef.current);
    const nextSpeed = currentIndex === -1 ? speeds[0] : speeds[(currentIndex + 1) % speeds.length];
    setSpeed(nextSpeed);
    speedRef.current = nextSpeed;
  }, []);

  // 点击章节导轨跳转
  const jumpTo = useCallback((chapter: Chapter) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const target = top + travel * Math.min(1, chapter.start + (chapter.start === 0 ? 0 : 0.012));

    isJumpingRef.current = true;
    lastAutoScrollYRef.current = target;
    lastAutoScrollTimeRef.current = performance.now();
    window.scrollTo({ top: target, behavior: reduced ? 'auto' : 'smooth' });

    setTimeout(() => {
      isJumpingRef.current = false;
      isInteractingRef.current = false;
      setIsInteracting(false);
      lastAutoScrollYRef.current = window.scrollY;
      lastAutoScrollTimeRef.current = performance.now();
      if (!userPausedRef.current && !reduced) {
        isPlayingRef.current = true;
        setIsPlaying(true);
        setIsAtEnd(false);
      }
    }, 850);
  }, [reduced]);

  // 滚动监听与高速滚动降级处理
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let isFastScrolling = false;

    const onScroll = () => {
      const now = performance.now();
      const isProgrammatic =
        isAutoScrollingRef.current ||
        (now - lastAutoScrollTimeRef.current < 60 &&
          Math.abs(window.scrollY - lastAutoScrollYRef.current) < 50);

      isAutoScrollingRef.current = false;

      // 若滚动非由自动播放器驱动（例如用户拖拽原生滚动条）
      if (!isProgrammatic) {
        onUserInteraction();
      }

      updateStageStatus();

      // 仅在用户高速手动滚动时降级模糊，自动演示平滑状态下保持全额液态玻璃质感
      if (isInteractingRef.current) {
        if (!isFastScrolling) {
          isFastScrolling = true;
          document.documentElement.setAttribute('data-scrolling', 'true');
        }
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          isFastScrolling = false;
          document.documentElement.removeAttribute('data-scrolling');
          timer = null;
        }, 120);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateStageStatus();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (timer) clearTimeout(timer);
      document.documentElement.removeAttribute('data-scrolling');
    };
  }, [onUserInteraction, updateStageStatus]);

  // 用户物理输入监听（鼠标滚轮、触摸手势、键盘翻页按键与空格播放切换）
  useEffect(() => {
    const handleWheel = () => onUserInteraction();
    const handleTouch = () => onUserInteraction();
    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest('button') || target?.closest('a') || target?.closest('input')) {
        return;
      }
      onUserInteraction();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(e.key)) {
        onUserInteraction();
      }
      if (e.code === 'Space') {
        const activeEl = document.activeElement as HTMLElement | null;
        if (
          activeEl?.tagName === 'INPUT' ||
          activeEl?.tagName === 'TEXTAREA' ||
          activeEl?.tagName === 'BUTTON'
        ) {
          return;
        }
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= 20 && rect.bottom >= window.innerHeight - 20) {
          e.preventDefault();
          togglePlay();
        }
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('touchmove', handleTouch, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('touchmove', handleTouch);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onUserInteraction, togglePlay]);

  // 浏览器标签页切换挂起保护
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        lastTimeRef.current = null;
      } else {
        lastTimeRef.current = performance.now();
        lastAutoScrollYRef.current = window.scrollY;
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  return (
    <ReducedMotionContext.Provider value={reduced}>
      <ProgressContext.Provider value={progress}>
        <LayoutContext.Provider value={{ desktop, wide }}>
          <section ref={ref} id="demo" aria-label="TripCraft 路书诞生全过程演示" className="relative" style={{ height: `${STAGE_VH}vh` }}>
            <div className="sticky top-0 h-[100svh] overflow-hidden">
              <StageBackdrop />
              <MobileProgress />
              <div className="relative mx-auto flex h-full max-w-[1240px] flex-col px-3 pb-4 pt-[4.25rem] md:px-8 md:pb-6 md:pt-[4.75rem]">
                <Captions />
                <div className="relative min-h-0 flex-1">
                  <StageWindow />
                  <PhoneMock />
                  <DeliverScene />
                </div>
              </div>
              <ChapterRail onJump={jumpTo} />
              <AnimatePresence>
                {isInsideStage && (
                  <AutoPlayController
                    isPlaying={isPlaying}
                    isInteracting={isInteracting}
                    isAtEnd={isAtEnd}
                    speed={speed}
                    onToggle={togglePlay}
                    onCycleSpeed={cycleSpeed}
                    onReplay={replay}
                  />
                )}
              </AnimatePresence>
            </div>
          </section>
        </LayoutContext.Provider>
      </ProgressContext.Provider>
    </ReducedMotionContext.Provider>
  );
}

/* ── 自动播放控制胶囊（Apple 风格液态玻璃底座） ───────────── */
interface AutoPlayControllerProps {
  isPlaying: boolean;
  isInteracting: boolean;
  isAtEnd: boolean;
  speed: number;
  onToggle: () => void;
  onCycleSpeed: () => void;
  onReplay: () => void;
}

function AutoPlayController({
  isPlaying,
  isInteracting,
  isAtEnd,
  speed,
  onToggle,
  onCycleSpeed,
  onReplay,
}: AutoPlayControllerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.3 }}
      className="absolute bottom-3 right-3 z-40 max-w-[calc(100vw-1.5rem)] sm:bottom-6 sm:right-8"
      role="region"
      aria-label="路书故事流播放控制"
    >
      <div className="glass-strong glass-sheen flex items-center gap-2 rounded-pill border border-ink/[0.08] px-3 py-1.5 shadow-level-float backdrop-blur-xl sm:gap-3 sm:px-4 sm:py-2">
        {/* 状态指示 */}
        <div className="flex items-center gap-1.5 text-xs">
          {isAtEnd ? (
            <>
              <span className="h-2 w-2 rounded-full bg-jade" />
              <span className="font-medium text-ink">演示完毕</span>
            </>
          ) : isInteracting ? (
            <>
              <span className="h-2 w-2 rounded-full bg-ochre animate-pulse" />
              <span className="font-medium text-ink">手动接管中</span>
              <span className="hidden text-xs text-ink-soft sm:inline">· 停顿后继续</span>
            </>
          ) : isPlaying ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-600 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              <span className="font-medium text-ink">自动演进中</span>
              <span className="hidden text-xs text-ink-soft md:inline">· 滚动可随时接管</span>
            </>
          ) : (
            <>
              <span className="h-2 w-2 rounded-full bg-ink/30" />
              <span className="font-medium text-ink-soft">已暂停</span>
            </>
          )}
        </div>

        <div className="h-3.5 w-px bg-ink/15" />

        {/* 控制按钮 */}
        {isAtEnd ? (
          <button
            type="button"
            onClick={onReplay}
            title="重新播放全流程演示"
            className="btn-primary flex min-h-[40px] items-center gap-1.5 rounded-pill px-4 py-1.5 text-xs font-semibold shadow-level-static hover:scale-105 active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcwIcon className="h-3.5 w-3.5" />
            <span>重播</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggle}
            title={isPlaying ? '暂停自动播放演示 (快捷键: 空格)' : '继续自动播放演示 (快捷键: 空格)'}
            className={`flex min-h-[40px] items-center gap-1.5 rounded-pill px-4 py-1.5 text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isPlaying
                ? 'bg-ink/10 text-ink hover:bg-ink/20 active:scale-95'
                : 'btn-primary shadow-level-static hover:scale-105 active:scale-95'
            }`}
          >
            {isPlaying ? <PauseIcon className="h-3.5 w-3.5" /> : <PlayIcon className="h-3.5 w-3.5" />}
            <span>{isPlaying ? '暂停' : '继续'}</span>
          </button>
        )}

        {/* 速度切换 */}
        {!isAtEnd && (
          <button
            type="button"
            onClick={onCycleSpeed}
            title={`点击切换播放倍速 (当前: ${speed.toFixed(1)}x)`}
            aria-label={`当前播放倍速 ${speed.toFixed(1)}x，点击切换`}
            className="chip min-h-[36px] px-3 py-1 font-mono text-xs tabular-nums font-semibold text-ink-soft transition-all active:scale-95 hover:bg-paper/90 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            {speed.toFixed(1)}x
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── 舞台背景：沙色纸面 + 随章节流转的暖光 ─────────────────── */
function StageBackdrop() {
  const p = useProgress();
  const glowX = useRange(p, [0, 0.42, 0.62, 1], [70, 30, 75, 50], { rest: 50 });
  const glowHue = useRange(p, [0, 0.42, 0.62, 0.84, 1], [0, 1, 0, 1, 0]);
  const glowTransform = useTransform(glowX, (n) => `${n}vw`);
  return (
    <div aria-hidden className="paper-texture absolute inset-0">
      <motion.div
        className="stage-glow absolute -top-1/3 left-0 h-[90vh] w-[90vh] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,134,59,0.08),transparent_65%)] blur-2xl will-change-transform gpu-layer"
        style={{ x: glowTransform }}
      />
      <motion.div
        className="stage-glow absolute -bottom-1/3 right-0 h-[80vh] w-[80vh] rounded-full bg-[radial-gradient(circle,rgba(122,85,32,0.06),transparent_65%)] blur-2xl will-change-transform gpu-layer"
        style={{ opacity: glowHue }}
      />
    </div>
  );
}

/* ── 章节标题（Apple 式大字幕） ───────────────────────────── */
function Captions() {
  return (
    <div className="relative h-[4.75rem] shrink-0 sm:h-[6rem] md:h-[8.25rem]">
      {CHAPTERS.map((c, i) => (
        <Caption key={c.id} chapter={c} first={i === 0} last={i === CHAPTERS.length - 1} />
      ))}
    </div>
  );
}

function Caption({ chapter, first, last }: { chapter: Chapter; first: boolean; last: boolean }) {
  const p = useProgress();
  const { start, end } = chapter;
  const f = 0.014;
  const input = first ? [end - f, end] : last ? [start, start + f] : [start, start + f, end - f, end];
  const output = first ? [1, 0] : last ? [0, 1] : [0, 1, 1, 0];
  const yOut = first ? [0, -18] : last ? [22, 0] : [22, 0, 0, -18];
  const opacity = useRange(p, input, output);
  const y = useRange(p, input, yOut, { rest: 0, easing: ease.out });
  const visibility = useTransform(p, (v) => {
    if (first) return v <= end + 0.005 ? 'visible' : 'hidden';
    if (last) return v >= start - 0.005 ? 'visible' : 'hidden';
    return v >= start - 0.005 && v <= end + 0.005 ? 'visible' : 'hidden';
  });

  return (
    <motion.div
      className="absolute inset-0 flex flex-col items-center text-center will-change-transform gpu-layer [contain:layout_paint]"
      style={{ opacity, y, visibility }}
      aria-hidden={false}
    >
      <p className="eyebrow text-blue-900 font-semibold">{chapter.eyebrow}</p>
      <h2 className="mt-1 sm:mt-2 text-balance font-sans text-xl sm:text-2xl md:text-3xl lg:text-[2.5rem] font-bold leading-[1.25] sm:leading-[1.3] text-ink">{chapter.title}</h2>
      <p className="mt-1 sm:mt-2 max-w-2xl text-pretty text-[11px] sm:text-xs md:text-sm leading-tight sm:leading-relaxed text-ink-soft line-clamp-2 md:line-clamp-none">{chapter.desc}</p>
    </motion.div>
  );
}

/* ── 演示窗口外壳（主工作台作为母体保持清晰可见） ─────── */
function StageWindow() {
  const p = useProgress();
  const scale = useRange(p, [T.windowIn[0], T.windowIn[1]], [0.94, 1], { rest: 1 });
  const opacity = useFade(p, T.windowIn[0], T.windowIn[1]);

  return (
    <motion.div
      className="glass-strong glass-sheen macos-window absolute inset-x-0 top-0 mx-auto flex h-full max-h-[720px] w-full max-w-[1180px] flex-col overflow-hidden rounded-xl sm:rounded-container shadow-level-float gpu-layer [contain:layout_paint] bg-[#FAF8F5]/98"
      style={{ scale, opacity }}
    >
      <Topbar />
      <div className="relative min-h-0 flex-1">
        <ChatScene />
        <Workspace />
        <CollabDrawer />
        <ShareSheet />
        <Backdrop />
        <RecommendModal />
        <StageToasts />
      </div>
      <InAppStatusBar />
    </motion.div>
  );
}

/* ── App 原生底栏遥测状态栏 (In-App Master Footer Telemetry Bar) ── */
function InAppStatusBar() {
  const p = useProgress();
  const chapterStep = useStep(p, [0.20, 0.42, 0.62, 0.84]);
  const isV11 = useStep(p, [T.version]) === 1;
  const isDelivery = chapterStep === 4;

  const telemetry = [
    { text: '智能语义解析: 提取 5 人自驾意图 · 适老适幼与 MPV 规则契约锁死', badge: 'AI 规则引擎' },
    { text: 'GIS 拓扑沙盘: 38.05°N, 102.64°E · G30 连霍高速 (1,980km 贯通)', badge: '拓扑沙盘' },
    { text: '团队实时协同网: 3 端同频在线 · 微信免登免密极速入队 · 愿望池广播', badge: '多端同频' },
    { text: '协同重排调度引擎: 顺路度 98% · 领队一键确认 · 全团毫秒广播', badge: '共创决策' },
    { text: '车路云协同流转: 腾势 D9 巡航导航与 2.15m 限高预案已推车机 · 无人区离线舱就绪', badge: '车机流转' },
  ][chapterStep] || { text: '云协同网络已就绪 · 全团毫秒同频', badge: '云协同' };

  return (
    <footer className="relative z-30 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-ink/[0.08] bg-paper/85 px-2.5 sm:px-4 text-[9px] sm:text-[10px] font-mono text-ink-soft select-none backdrop-blur-md">
      {/* 左侧：云协同网络已连接 + 弱网/无人区离线乐观保活 + 版本分支 */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        <span className="flex items-center gap-1 font-semibold text-jade">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
          <span className="hidden xs:inline">云协同网络已连接</span>
          <span className="xs:hidden">云协同已连</span>
          <span className="text-ink-soft font-normal text-[9px] hidden lg:inline">(双向加密 · 18ms)</span>
        </span>
        <span className="text-ink/20 hidden xs:inline">|</span>
        <span className="text-gold-ink font-medium hidden sm:inline-flex items-center gap-0.5">
          <span>{isDelivery ? '⚡ 离线无感切换' : '⚡ 离线乐观保活'}</span>
        </span>
        <span className="text-ink/20">|</span>
        <span className="font-medium text-ink flex items-center gap-1">
          <span className="text-gold-ink font-bold">git:</span>
          <span>{isV11 ? '西行计划-v1.1' : '西行计划-v1.0'}</span>
        </span>
      </div>

      {/* 中间：根据当前章节动态遥测的主控状态 */}
      <div className="hidden md:flex items-center gap-1.5 text-ink">
        <TerminalIcon className="h-2.5 w-2.5 text-gold-ink shrink-0" />
        <span className="truncate max-w-[380px] lg:max-w-[480px]">{telemetry.text}</span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft text-[8px] px-1 py-0">{telemetry.badge}</span>
      </div>

      {/* 右侧：无人区离线舱/容灾包 + 契约校验 + 视图比例 */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-gold-ink font-semibold flex items-center gap-0.5">
          <ShieldIcon className="h-2.5 w-2.5 text-gold-ink" />
          <span>无人区离线舱已就绪</span>
        </span>
        <span className="text-ink/20 hidden sm:inline">|</span>
        <span className="text-jade font-semibold hidden sm:inline-flex items-center gap-0.5">
          <span>契约校验对齐</span>
        </span>
        <span className="text-ink/20 hidden xs:inline">|</span>
        <span className="hidden xs:inline text-ink-soft">100%</span>
      </div>
    </footer>
  );
}

/* ── 章节导轨（xl 桌面）：可点击跳转 ───────────────────── */
function ChapterRail({ onJump }: { onJump: (c: Chapter) => void }) {
  const p = useProgress();
  const active = useStep(p, CHAPTERS.slice(1).map((c) => c.start));
  const fill = useRange(p, [0, 1], [0, 1], { easing: ease.linear });
  return (
    <nav aria-label="演示章节" className="absolute left-5 top-1/2 hidden -translate-y-1/2 2xl:block">
      <div className="relative flex flex-col gap-6 pl-5">
        <span className="absolute bottom-1 left-[5px] top-1 w-px bg-ink/15" />
        <motion.span className="absolute left-[5px] top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-blue-600" style={{ scaleY: fill }} />
        {CHAPTERS.map((c, i) => (
          <button
            key={c.id}
            type="button"
            onClick={() => onJump(c)}
            className={`group relative flex min-h-[36px] items-center gap-2 text-left text-xs transition-colors rounded-pill px-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${i === active ? 'text-blue-900 font-bold' : 'text-ink-soft hover:text-ink'}`}
            aria-current={i === active ? 'step' : undefined}
          >
            <span
              className={`absolute -left-[19px] h-[11px] w-[11px] rounded-full border-2 transition-all duration-300 ${
                i <= active ? 'border-blue-600 bg-blue-600' : 'border-ink/25 bg-sand'
              } ${i === active ? 'scale-125 shadow-sm ring-2 ring-blue-600/40' : ''}`}
            />
            <span className="font-mono font-semibold tabular-nums">{c.no}</span>
            <span>{c.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

/* ── 移动端顶部进度条 ─────────────────────────────────── */
function MobileProgress() {
  const p = useProgress();
  const fill = useRange(p, [0, 1], [0, 1], { easing: ease.linear });
  return (
    <div aria-hidden className="absolute inset-x-0 top-[3.5rem] z-10 h-0.5 bg-ink/10 2xl:hidden">
      <motion.div className="h-full origin-left bg-gradient-to-r from-blue-700 via-blue-900 to-indigo-600" style={{ scaleX: fill }} />
    </div>
  );
}
