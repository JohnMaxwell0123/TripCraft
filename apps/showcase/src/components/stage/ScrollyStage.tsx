'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useMediaQuery, useStep } from '@/lib/motion';
import { ACTS, T, type ActId } from './timeline';
import { LayoutContext, ProgressContext, useProgress } from './primitives';
import { DialogueScene } from './DialogueScene';
import { Workspace } from './Workspace';
import { MatchScene, PathCrossHint } from './MatchScene';
import { StudioScene } from './StudioScene';
import { CollabDrawer, PhoneMock, ShareSheet, Topbar } from './Collab';
import { Backdrop, RecommendModal, StageToasts } from './Recommend';
import { SyncFinale } from './SyncFinale';
import {
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  ShieldIcon,
} from '@/components/common/Icons';

/**
 * TripCraft · 旅艺 交互式导览沙盒 (Autonomous Stories Stage)
 * 
 * 彻底对齐 Unify 现代化宽屏排版：
 * 1. 【超宽容器与自然呼吸边距】：容器宽度拓展至 max-w-[1480px]，彻底消灭左右两侧大块荒芜空白。
 * 2. 【极简垂直流光步进器】：左侧大字号标题（未激活优雅灰字，激活加粗黑字），配以橙红流光垂直进度条 (#FE3C01)，
 *    杜绝层叠徽标的拥挤感，完全还原 Unify 审美。
 * 3. 【右侧流动艺术卡 + 超宽独立应用视窗】：
 *    去除笨重黑褐色包裹外壳，改为清爽的白色现代拟物视窗，右后方辅以大漠晚霞流动艺术纹理底板。
 *    视窗内部宽度拓展至 950px+，完美容纳三栏路书与高清沙盘，无水平挤压。
 */

interface StoryTab {
  act: ActId;
  title: string;
  desc: string;
  duration: number; // 持续时长 (ms)
}

/** 五幕顺序即产品基线 v3 的核心流程（PRD-01 §2）；车机投递与离线交付作为支撑能力收在第 5 幕末尾 */
const TABS: StoryTab[] = [
  {
    act: 'dialogue',
    title: 'AI 对话与需求画像',
    desc: '像和大模型聊天一样说出想法，平台模型或自带 API 都行。AI 每轮只追问一个问题，把同行人、身体情况、车辆与预算整理成一张可确认的需求画像，推断项单独标出。',
    duration: 12000,
  },
  {
    act: 'drive',
    title: '路径 A · AI 规划自驾',
    desc: '选自驾，AI 按画像编排九天骨架、午休节奏与限高停车；地点与开放时间来自图商核验，模型只写建议。结果页底部提示相似的旅行社线路。',
    duration: 12500,
  },
  {
    act: 'match',
    title: '路径 B · 旅行社线路匹配',
    desc: '想省心就看持证旅行社的线路。价格滑块上方是真实的价格分布，标出你的预算与市场中位；来自需求的条件自动选中并带 ★。匹配度为信息参考，具体以旅行社报价与合同为准。',
    duration: 15000,
  },
  {
    act: 'studio',
    title: '旅行社线路工作室',
    desc: '旅行社导入已有行程单，AI 抽取后逐字段确认；一键生成交互路书与路线动画；价格分项列出，按旅客要求调整后生成新的报价版本，差异自动列明。',
    duration: 16000,
  },
  {
    act: 'share',
    title: '多人共享 · 多端同步',
    desc: '方案进入行程空间，家人扫码加入、提名想去的地方；AI 评估顺路度，领队确认后手机、平板、电脑同步更新。离线可读、单文件导出与车机投递作为支撑能力随行。',
    duration: 18000,
  },
];

/** 每个 Tab 对应的全局时间轴进度跨度（见 timeline.ts ACTS，每幕末尾留有静止驻留） */
const TAB_RANGES: (readonly [number, number])[] = TABS.map((tab) => ACTS[tab.act]);
const TAB_STARTS = TAB_RANGES.slice(1).map(([s]) => s);

export function ScrollyStage() {
  const [activeTab, setActiveTab] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // 虚拟全局时间轴进度 (MotionValue)，驱动内部所有自运行场景 (0 React 重渲染)
  const virtualProgress = useMotionValue(0);

  // 单 Tab 局部进度 (MotionValue)，驱动左侧流光指示条 (GPU 合成，0 React 重渲染，彻底消除卡顿与跳帧加速)
  const tabProgress = useMotionValue(0);

  const desktop = useMediaQuery('(min-width: 768px)');
  const wide = useMediaQuery('(min-width: 1280px)');

  const containerRef = useRef<HTMLElement>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedProgressRef = useRef(0);
  const activeTabRef = useRef(0);
  const isPausedRef = useRef(false);
  const isInViewRef = useRef(true);

  activeTabRef.current = activeTab;
  isPausedRef.current = isPaused;
  isInViewRef.current = isInView;

  // 视口感知：脱离视口时挂起时钟省电，滑入视口时平滑续播
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.isIntersecting;
        setIsInView(visible);
        if (visible) {
          startTimeRef.current = performance.now() - pausedProgressRef.current * TABS[activeTabRef.current].duration;
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 自运行沙盒时钟引擎 (纯 MotionValue 驱动，丝滑 60/120fps，绝无 React 频繁调度卡顿与加速抢播)
  useEffect(() => {
    let rafId: number;

    const tick = (now: number) => {
      if (!isPausedRef.current && isInViewRef.current) {
        const curTabDuration = TABS[activeTabRef.current].duration;
        if (startTimeRef.current === null) {
          startTimeRef.current = now;
        }

        const elapsed = now - startTimeRef.current;
        const currentProgress = Math.min(1, elapsed / curTabDuration);
        tabProgress.set(currentProgress);
        pausedProgressRef.current = currentProgress;

        // 计算当前阶段在全局时间轴上的映射值，写入 virtualProgress (纯 MotionValue，0 重渲染)
        const [rangeStart, rangeEnd] = TAB_RANGES[activeTabRef.current];
        const globalVal = rangeStart + currentProgress * (rangeEnd - rangeStart);
        virtualProgress.set(globalVal);

        if (currentProgress >= 1) {
          // 步进到下一幕
          const nextTab = (activeTabRef.current + 1) % TABS.length;
          activeTabRef.current = nextTab;
          setActiveTab(nextTab);
          startTimeRef.current = now;
          tabProgress.set(0);
          pausedProgressRef.current = 0;
          virtualProgress.set(TAB_RANGES[nextTab][0]);
        }
      } else {
        startTimeRef.current = null;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [tabProgress, virtualProgress]);

  // 供自动化视觉巡检与调试工具精确跳转到任意全局进度帧
  useEffect(() => {
    const win = window as unknown as {
      __setStageProgress?: (globalVal: number) => void;
    };
    win.__setStageProgress = (globalVal: number) => {
      const clamped = Math.max(0, Math.min(1, globalVal));
      // 落在两幕之间的空隙时，归到起点不晚于它的最后一幕
      let idx = 0;
      TAB_RANGES.forEach(([s], i) => {
        if (clamped >= s) idx = i;
      });
      const [s, e] = TAB_RANGES[idx];
      const local = e > s ? Math.max(0, Math.min(1, (clamped - s) / (e - s))) : 1;
      activeTabRef.current = idx;
      setActiveTab(idx);
      isPausedRef.current = true;
      setIsPaused(true);
      pausedProgressRef.current = local;
      tabProgress.set(local);
      virtualProgress.set(clamped);
    };
    return () => {
      delete win.__setStageProgress;
    };
  }, [tabProgress, virtualProgress]);

  // 用户点击左侧 Tab 手动切入
  const handleSelectTab = useCallback((index: number) => {
    activeTabRef.current = index;
    setActiveTab(index);
    tabProgress.set(0);
    pausedProgressRef.current = 0;
    virtualProgress.set(TAB_RANGES[index][0]);
    startTimeRef.current = performance.now();
  }, [tabProgress, virtualProgress]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
      isPausedRef.current = next;
      if (!next) {
        startTimeRef.current = performance.now() - pausedProgressRef.current * TABS[activeTabRef.current].duration;
      }
      return next;
    });
  }, []);

  const handleNext = useCallback(() => {
    handleSelectTab((activeTab + 1) % TABS.length);
  }, [activeTab, handleSelectTab]);

  const handlePrev = useCallback(() => {
    handleSelectTab((activeTab - 1 + TABS.length) % TABS.length);
  }, [activeTab, handleSelectTab]);

  return (
    <section
      ref={containerRef}
      id="demo"
      className="py-12 md:py-16 bg-[#FFFFF9] text-[#241E20] relative overflow-hidden"
      aria-label="TripCraft 产品主线导览：对话、双路径规划、旅行社线路工作室与共享同步"
    >
      {/* 极简背景微光网格 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#241E20_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]"
      />

      <div className="relative mx-auto max-w-[1640px] px-6 sm:px-10 lg:px-12 xl:px-16">
        {/* 左右分栏交互容器：左侧大标题+5个垂直Tab，右侧浮动应用视窗 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 xl:gap-12 items-center">
          {/* 左侧栏 (lg:col-span-4 xl:col-span-4)：顶部大标题 + 5个垂直指示条 Tab + 导览控制 */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center text-left" role="tablist" aria-label="核心场景演进步进器">
            {/* 顶部标题区：严控字号与断行，彻底消灭单字成行（寡字） */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-5 lg:mb-6"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FE3C01]/10 text-[#FE3C01] text-xs font-semibold tracking-wider mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE3C01]" />
                <span>一段对话 · 两条路径 · 全家同步</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-[30px] font-sans font-bold tracking-tight leading-[1.32] text-[#1E2024] text-balance">
                说清需求，
                <br />
                自驾或旅行社线路任你选
              </h2>
              <p className="mt-2.5 text-sm sm:text-[15px] text-black/60 leading-relaxed font-sans max-w-xl">
                AI 追问出一份需求画像，再自主规划自驾路线，或匹配持证旅行社的线路；旅行社在线路工作室上架、出路书、透明报价。方案进入行程空间后，全家一起看、多端同步。
              </p>
            </motion.div>

            {/* 5 个垂直流光步进指示器 (紧凑舒朗，确保 1440x900 视口一屏完整呈现) */}
            <div className="flex flex-col space-y-3.5 sm:space-y-4 xl:space-y-5">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={tab.act}
                    onClick={() => handleSelectTab(idx)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectTab(idx);
                      } else if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        handleSelectTab((idx + 1) % TABS.length);
                      } else if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        handleSelectTab((idx - 1 + TABS.length) % TABS.length);
                      }
                    }}
                    role="tab"
                    aria-selected={isActive}
                    tabIndex={0}
                    className="relative pl-5 py-0.5 cursor-pointer transition-all duration-300 text-left w-full group outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01] rounded-sm"
                  >
                    {/* 左侧垂直轨道与流光进度条 (GPU 硬件加速，0 React 重渲染) */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-black/10 rounded-full overflow-hidden">
                      {isActive && (
                        <motion.div
                          className="w-full bg-[#FE3C01] rounded-full origin-top"
                          style={{ scaleY: tabProgress, height: '100%' }}
                        />
                      )}
                    </div>

                    {/* 标题：未激活为自然灰，激活为加粗黑字 */}
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-black/35">
                        0{idx + 1}
                      </span>
                      <span
                        className={`text-lg sm:text-xl transition-colors duration-200 ${
                          isActive
                            ? 'font-bold text-[#241E20]'
                            : 'font-medium text-black/45 group-hover:text-black/75'
                        }`}
                      >
                        {tab.title}
                      </span>
                    </div>

                    {/* 激活项展开描述 */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs sm:text-sm text-black/60 leading-relaxed mt-1.5 max-w-md font-sans">
                          {tab.desc}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 导览播放控制坞 (放置于左侧栏底部，绝不遮挡右侧产品主视窗与悬浮手机) */}
            <div className="mt-5 pt-4 border-t border-[#E2E2D8] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={togglePause}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[5px] bg-[#241E20]/5 hover:bg-[#241E20]/10 text-[#241E20]/75 hover:text-[#241E20] transition-colors"
                  title={isPaused ? '继续播放' : '暂停演进'}
                >
                  {isPaused ? <PlayIcon className="w-3.5 h-3.5 text-[#FE3C01]" /> : <PauseIcon className="w-3.5 h-3.5 text-[#FE3C01]" />}
                  <span>{isPaused ? '继续播放' : '暂停演进'}</span>
                </button>
                <span className="font-mono text-[#241E20]/45 text-xs">
                  0{activeTab + 1} / 0{TABS.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[#241E20]/60 text-xs">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-[5px] hover:bg-[#241E20]/5 hover:text-[#241E20] transition-colors"
                  title="上一幕"
                >
                  ← 上一幕
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-[5px] hover:bg-[#241E20]/5 hover:text-[#241E20] transition-colors"
                  title="下一幕"
                >
                  下一幕 →
                </button>
              </div>
            </div>
          </div>

          {/* 右侧栏 (lg:col-span-8 xl:col-span-8)：全宽原生应用视窗 (向右完全展开，手机自由悬浮无硬裁切) */}
          <div className="lg:col-span-8 xl:col-span-8 w-full relative flex items-center min-h-[600px] sm:min-h-[660px] xl:min-h-[700px]">
            <ProgressContext.Provider value={virtualProgress}>
              <LayoutContext.Provider value={{ desktop, wide }}>
                {/* 视窗包装容器：允许子元素 (如副驾手机) 自然悬浮探出，绝不被硬裁切 */}
                <div className="relative z-10 w-full">
                  {/* 核心应用高保真母体视窗 */}
                  <div className="macos-window relative flex h-[600px] sm:h-[650px] lg:h-[680px] w-full flex-col overflow-hidden rounded-[16px] bg-[#FAF8F5]/98 text-left border border-[#E2E2D8] shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
                    <Topbar />
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <DialogueScene />
                      <Workspace />
                      <PathCrossHint />
                      <MatchScene />
                      <CollabDrawer />
                      <ShareSheet />
                      <Backdrop />
                      <RecommendModal />
                      <StageToasts />
                      <SyncFinale />
                    </div>
                    <InAppStatusBar />
                    {/* 旅行社线路工作室是 B 端另一款界面，整窗接管（含顶栏与状态条） */}
                    <StudioScene />
                  </div>

                  {/* 随身手机协同端 (独立悬浮于母体视窗之上，完全无边缘硬裁切，超高质感 3D 悬浮投影) */}
                  <PhoneMock />
                </div>
              </LayoutContext.Provider>
            </ProgressContext.Provider>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── App 原生底栏状态条 (In-App Master Footer Status Bar) ── */
function InAppStatusBar() {
  const p = useProgress();
  const chapterStep = useStep(p, TAB_STARTS);
  const isV11 = useStep(p, [T.version]) === 1;

  const telemetry = [
    { text: '平台模型 · 追问 1 轮 · 需求画像 7 项特征点（1 项推断待确认）', badge: '需求画像' },
    { text: '路径 A · 河西走廊 9 日自驾草案 · 地点经图商核验，模型只写建议', badge: 'AI 规划' },
    { text: '路径 B · 持证旅行社线路按匹配度排序 · 匹配度为信息参考', badge: '线路匹配' },
    { text: '线路工作室 · 报价 v2 已生成，差异自动列出', badge: '旅行社端' },
    { text: '3 位同行人在线 · 领队确认后手机、平板、电脑同步更新', badge: '共享同步' },
  ][chapterStep];

  return (
    <footer className="relative z-30 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-ink/[0.08] bg-paper/90 px-3 sm:px-4 text-xs font-sans text-ink-soft select-none backdrop-blur-md overflow-hidden whitespace-nowrap">
      {/* 左侧：同步状态 + 版本 */}
      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
        <span className="flex items-center gap-1.5 font-semibold text-emerald-700">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
          <span>多端实时同步</span>
        </span>
        <span className="text-ink/20">|</span>
        <span className="font-medium text-ink flex items-center gap-1 font-mono">
          <span className="text-ink-soft">版本</span>
          <span className="font-semibold text-gold-ink">{isV11 ? 'v1.1' : 'v1.0'}</span>
        </span>
      </div>

      {/* 中间：当前幕次摘要 */}
      <div className="hidden md:flex items-center gap-1.5 text-ink shrink min-w-0 overflow-hidden whitespace-nowrap">
        <SparklesIcon className="h-3 w-3 text-gold-ink shrink-0" />
        <span className="truncate max-w-[360px] lg:max-w-[440px]">{telemetry.text}</span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft px-1.5 py-0 shrink-0">{telemetry.badge}</span>
      </div>

      {/* 右侧：支撑能力（离线可读） */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="text-ink-soft flex items-center gap-1">
          <ShieldIcon className="h-3 w-3 text-emerald-600" />
          <span>离线可读</span>
        </span>
      </div>
    </footer>
  );
}
