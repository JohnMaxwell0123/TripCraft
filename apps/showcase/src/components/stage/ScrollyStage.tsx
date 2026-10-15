'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useMediaQuery, useStep } from '@/lib/motion';
import { CHAPTERS, T } from './timeline';
import { LayoutContext, ProgressContext, useProgress } from './primitives';
import { ChatScene } from './ChatScene';
import { Workspace } from './Workspace';
import { CollabDrawer, PhoneMock, ShareSheet, Topbar } from './Collab';
import { Backdrop, RecommendModal, StageToasts } from './Recommend';
import { CockpitScene } from './CockpitScene';
import { DeliverScene } from './Deliver';
import {
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  TerminalIcon,
  ShieldIcon,
  CheckIcon,
} from '@/components/common/Icons';

/**
 * TripCraft · 旅艺 交互式导览沙盒 (Autonomous Stories Stage)
 * 
 * 核心架构特色：
 * 1. 【时钟解耦】：独立的自运行沙盒时钟 (RAF / Timer)。用户在页面上下自由滑动翻看，
 *    右侧演示丝滑推进，绝不锁死或篡改滚轮事件 (No Scroll Hijacking)。
 * 2. 【垂直流光进度步进器】：左侧 5 个阶段垂直排列，激活项由橙红进度条 (#FE3C01)
 *    自上而下匀速填充，填满后平滑切换至下一幕；用户亦可随时点击任意项即刻切入。
 * 3. 【高保真全场景母体画布】：右侧在深色奢华极光渐变背板上漂浮应用视窗，
 *    无缝串联：
 *    - 01 零表单倾诉 (自然语言意图提炼与苏格拉底反问核准)
 *    - 02 结构化生成 (九日行程时序、路线拓扑与海拔剖面)
 *    - 03 零门槛共创 (微信扫码免登、手机端互联、愿望池提名与 AI 决策推荐)
 *    - 04 车规级座舱 (腾势 D9 车道级领航、2.15m 限高刚性拦截与自动改道)
 *    - 05 本地优先交付 (多端同频、单文件离线容灾安全舱)
 */

interface StoryTab {
  id: string;
  eyebrow: string;
  title: string;
  desc: string;
  duration: number; // 持续时长 (ms)
}

const TABS: StoryTab[] = [
  {
    id: 'intent-parsing',
    eyebrow: '01 · 零表单倾诉',
    title: '自然语言意图提炼与反问核准',
    desc: '不用面对冷冰冰的繁琐表单。说出出行人员、车型配置与在意事项，AI 架构师毫秒级抽取长辈步行限制、幼儿作息与 2.15m 限高等刚性规则。',
    duration: 7500,
  },
  {
    id: 'outline-topology',
    eyebrow: '02 · 结构化生成',
    title: '九日路书时序与拓扑沙盘',
    desc: '一句话瞬间长成一本看得见的专业路书。九天日程时序、矢量拓扑航线、海拔爬升剖面与 7 座 MPV 地面车位几秒内依次就位。',
    duration: 7500,
  },
  {
    id: 'wechat-collab',
    eyebrow: '03 · 零门槛共创',
    title: '微信免登愿望池协同与推荐决策',
    desc: '同行亲友微信扫码即写，免注册免装 App。全团愿望实时上屏投票，算法毫秒级评估顺路度与绕行代价，一人领队全团同频。',
    duration: 8000,
  },
  {
    id: 'cockpit-pilot',
    eyebrow: '04 · 车机原生座舱',
    title: '车道级领航与限高刚性拦截',
    desc: '深邃钛黑车规大屏，3D 车道级虚拟光毯、实时车速 HUD 与老城 2.0m 涵洞物理拦截，全车在无人区脱网途中依然尽在掌握。',
    duration: 7500,
  },
  {
    id: 'zero-build-offline',
    eyebrow: '05 · 本地优先交付',
    title: '多端同频与零构建离线安全舱',
    desc: '多端同频无缝流转，一键将全套交互式路书编译为自包含单 HTML 文件。双击秒开，断网飞行模式全量功能可查，数据主权永存本地。',
    duration: 7000,
  },
];

/** 每个 Tab 对应的全局时间轴进度跨度 (映射至 timeline.ts) */
const TAB_RANGES: [number, number][] = [
  [0.00, 0.198],   // Tab 0: 倾诉与反问
  [0.22, 0.41],    // Tab 1: 路线大纲与高程
  [0.42, 0.77],    // Tab 2: 微信协同与推荐决策
  [0.795, 0.92],   // Tab 3: 车机原生座舱与限高拦截
  [0.94, 0.998],   // Tab 4: 多端同频与离线交付
];

export function ScrollyStage() {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0); // 0 -> 1
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);

  // 虚拟全局时间轴进度 (MotionValue)，驱动内部所有自运行场景
  const virtualProgress = useMotionValue(0);

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

  // 自运行沙盒时钟引擎 (RAF 独立平滑推进，上下滚动绝不打断)
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
        setProgress(currentProgress);
        pausedProgressRef.current = currentProgress;

        // 计算当前阶段在全局时间轴上的映射值，写入 virtualProgress
        const [rangeStart, rangeEnd] = TAB_RANGES[activeTabRef.current];
        const globalVal = rangeStart + currentProgress * (rangeEnd - rangeStart);
        virtualProgress.set(globalVal);

        if (currentProgress >= 1) {
          // 步进到下一幕
          const nextTab = (activeTabRef.current + 1) % TABS.length;
          setActiveTab(nextTab);
          startTimeRef.current = now;
          setProgress(0);
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
  }, [virtualProgress]);

  // 用户点击左侧 Tab 手动切入
  const handleSelectTab = useCallback((index: number) => {
    setActiveTab(index);
    setProgress(0);
    pausedProgressRef.current = 0;
    virtualProgress.set(TAB_RANGES[index][0]);
    startTimeRef.current = performance.now();
  }, [virtualProgress]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => {
      const next = !prev;
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
      className="py-20 md:py-28 bg-[#FFFFF9] text-[#241E20] relative overflow-hidden"
      aria-label="TripCraft 智能旅行协同中枢全功能导览"
    >
      {/* 极简背景微光网格 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#241E20_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]"
      />

      <div className="relative mx-auto max-w-[1360px] px-4 sm:px-8 lg:px-10">
        {/* 顶部标题区 (对齐 Unify 大字号 + 橙红高亮词) */}
        <div className="max-w-4xl mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.2] text-[#241E20]">
              告别碎片路书与导航死角，<br className="hidden sm:inline" />
              一体化协同中枢涵盖 <span className="text-[#FE3C01]">意图解析</span>、
              <span className="text-[#FE3C01]">航线拓扑</span>、
              <span className="text-[#FE3C01]">愿望协同</span>、
              <span className="text-[#FE3C01]">车道级领航</span> 与{' '}
              <span className="text-[#FE3C01]">离线交付</span>。
            </h2>
            <p className="mt-4 text-base sm:text-lg text-black/60 max-w-2xl font-sans">
              五大核心场景自运行演进。上下翻阅页面绝不打断右侧沙盒演示，点击左侧卡片随时切入查看。
            </p>
          </motion.div>
        </div>

        {/* 左右分栏交互容器：左侧 5 个垂直指示条 Tab，右侧自运行应用视窗 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* 左侧：5 个垂直流光步进指示器 */}
          <div className="lg:col-span-4 flex flex-col space-y-5 sm:space-y-7" role="tablist">
            {TABS.map((tab, idx) => {
              const isActive = activeTab === idx;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleSelectTab(idx)}
                  role="tab"
                  aria-selected={isActive}
                  tabIndex={0}
                  className="relative pl-6 py-1 cursor-pointer transition-all duration-300 text-left w-full group outline-none"
                >
                  {/* 左侧垂直轨道与流光进度条 */}
                  <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-black/10 rounded-full overflow-hidden">
                    {isActive && (
                      <div
                        className="w-full bg-[#FE3C01] rounded-full transition-all duration-75"
                        style={{ height: `${progress * 100}%` }}
                      />
                    )}
                  </div>

                  {/* 阶段标牌 */}
                  <p className="text-[11px] font-mono uppercase tracking-wider text-black/40 group-hover:text-black/60 transition-colors">
                    {tab.eyebrow}
                  </p>

                  {/* 标题 */}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-base sm:text-lg transition-colors duration-200 ${
                        isActive
                          ? 'font-bold text-[#241E20]'
                          : 'font-medium text-black/50 group-hover:text-black/80'
                      }`}
                    >
                      {tab.title}
                    </span>
                  </div>

                  {/* 激活项展开详情与描述 (对齐 Unify) */}
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs sm:text-sm text-black/65 leading-relaxed mt-2 max-w-md font-sans">
                        {tab.desc}
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 右侧：深色极光氛围背板 + 高保真母体应用视窗 */}
          <div className="lg:col-span-8 w-full">
            <div className="rounded-3xl bg-gradient-to-tr from-[#161211] via-[#241714] to-[#120f0e] border border-[#382b26] p-2.5 sm:p-4 md:p-5 relative shadow-[0_32px_80px_rgba(0,0,0,0.45)] overflow-hidden">
              {/* 氛围暖橙与琥珀散光微斑 (Unify 极光氛围) */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FE3C01]/12 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4A04E]/10 blur-3xl"
              />

              {/* 拟物外壳顶栏控制条 */}
              <div className="mb-2.5 px-2 flex items-center justify-between text-white/80 select-none">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-[#FE3C01] flex items-center justify-center text-white text-[10px]">
                    <SparklesIcon className="w-2.5 h-2.5" />
                  </div>
                  <span className="text-xs font-medium text-white/90">
                    TripCraft Studio · 川西甘青大环线中枢
                  </span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] bg-white/[0.08] text-white/70 border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    自运行沙盒
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <button
                    onClick={togglePause}
                    className="flex items-center gap-1 text-[11px] text-white/60 hover:text-white transition-colors px-2 py-0.5 rounded bg-white/10 hover:bg-white/15"
                    title={isPaused ? '继续播放' : '暂停演示'}
                  >
                    {isPaused ? <PlayIcon className="w-2.5 h-2.5" /> : <PauseIcon className="w-2.5 h-2.5" />}
                    <span>{isPaused ? '继续' : '暂停'}</span>
                  </button>

                  <div className="flex items-center gap-1 font-mono text-white/50 text-[11px]">
                    <span className="text-white font-bold">0{activeTab + 1}</span>
                    <span>/ 05</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrev}
                      className="p-0.5 hover:text-white text-white/50 transition-colors"
                      title="上一幕"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-0.5 hover:text-white text-white/50 transition-colors"
                      title="下一幕"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>

              {/* 核心应用高保真母体视窗 (注入 virtualProgress 上下文) */}
              <ProgressContext.Provider value={virtualProgress}>
                <LayoutContext.Provider value={{ desktop, wide }}>
                  <div className="glass-strong macos-window relative flex h-[560px] sm:h-[600px] lg:h-[630px] w-full flex-col overflow-hidden rounded-xl sm:rounded-2xl border border-ink/[0.08] shadow-[0_25px_60px_rgba(0,0,0,0.5)] bg-[#FAF8F5]/98 text-left">
                    <Topbar />
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <ChatScene />
                      <Workspace />
                      <CollabDrawer />
                      <ShareSheet />
                      <PhoneMock />
                      <Backdrop />
                      <RecommendModal />
                      <StageToasts />
                      <CockpitScene />
                      <DeliverScene />
                    </div>
                    <InAppStatusBar />
                  </div>
                </LayoutContext.Provider>
              </ProgressContext.Provider>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── App 原生底栏遥测状态栏 (In-App Master Footer Telemetry Bar) ── */
function InAppStatusBar() {
  const p = useProgress();
  const chapterStep = useStep(p, [0.20, 0.42, 0.62, 0.84]);
  const isV11 = useStep(p, [T.version]) === 1;
  const isDelivery = chapterStep === 4;

  const telemetry = [
    { text: '智能语义解析: 提取 5 人自驾意图 · 适老适幼与 MPV 刚性规则契约锁死', badge: 'AI 规则引擎' },
    { text: 'GIS 拓扑沙盘: 38.05°N, 102.64°E · G30 连霍高速 (1,980km 全程贯通)', badge: '拓扑沙盘' },
    { text: '团队实时协同网: 3 端同频在线 · 微信免登免密极速入队 · 愿望池实时广播', badge: '多端同频' },
    { text: '协同重排调度引擎: 顺路度 98% · 领队一键确认 · 全团毫秒级广播', badge: '共创决策' },
    { text: '车路云协同流转: 腾势 D9 巡航导航与 2.15m 限高预案已推车机 · 无人区离线舱就绪', badge: '车机流转' },
  ][chapterStep] || { text: '云协同网络已就绪 · 全团毫秒级同频', badge: '云协同' };

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
          <span className="text-gold-ink font-bold">版本:</span>
          <span>{isV11 ? '西行计划-v1.1' : '西行计划-v1.0'}</span>
        </span>
      </div>

      {/* 中间：根据当前章节动态遥测的主控状态 */}
      <div className="hidden md:flex items-center gap-1.5 text-ink">
        <TerminalIcon className="h-2.5 w-2.5 text-gold-ink shrink-0" />
        <span className="truncate max-w-[360px] lg:max-w-[460px]">{telemetry.text}</span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft text-[8px] px-1 py-0">{telemetry.badge}</span>
      </div>

      {/* 右侧：无人区离线舱/容灾包 + 契约校验 + 视图比例 */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <span className="text-gold-ink font-semibold flex items-center gap-0.5">
          <ShieldIcon className="h-2.5 w-2.5 text-gold-ink" />
          <span className="hidden sm:inline">无人区离线舱已就绪</span>
          <span className="sm:hidden">离线就绪</span>
        </span>
        <span className="text-ink/20 hidden sm:inline">|</span>
        <span className="text-jade font-semibold hidden sm:inline-flex items-center gap-0.5">
          <CheckIcon className="h-2.5 w-2.5 text-jade" />
          <span>契约校验对齐</span>
        </span>
      </div>
    </footer>
  );
}
