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
 * 彻底对齐 Unify 现代化宽屏排版：
 * 1. 【超宽容器与自然呼吸边距】：容器宽度拓展至 max-w-[1480px]，彻底消灭左右两侧大块荒芜空白。
 * 2. 【极简垂直流光步进器】：左侧大字号标题（未激活优雅灰字，激活加粗黑字），配以橙红流光垂直进度条 (#FE3C01)，
 *    杜绝层叠徽标的拥挤感，完全还原 Unify 审美。
 * 3. 【右侧流动艺术卡 + 超宽独立应用视窗】：
 *    去除笨重黑褐色包裹外壳，改为清爽的白色现代拟物视窗，右后方辅以大漠晚霞流动艺术纹理底板。
 *    视窗内部宽度拓展至 950px+，完美容纳三栏路书与高清沙盘，无水平挤压。
 */

interface StoryTab {
  id: string;
  title: string;
  desc: string;
  duration: number; // 持续时长 (ms)
}

const TABS: StoryTab[] = [
  {
    id: 'intent-parsing',
    title: '自然语言意图提炼',
    desc: '不用面对冷冰冰的繁琐表单。说出出行人员、车型配置与在意事项，AI 架构师毫秒级抽取长辈步行限制、幼儿作息与 2.15m 限高等刚性规则。',
    duration: 11000,
  },
  {
    id: 'outline-topology',
    title: '九日路书与航线拓扑',
    desc: '一句话瞬间长成一本看得见的专业路书。九天日程时序、矢量拓扑航线、海拔爬升剖面与 7 座 MPV 地面车位几秒内依次就位。',
    duration: 11000,
  },
  {
    id: 'wechat-collab',
    title: '微信免登愿望池协同',
    desc: '同行亲友微信扫码即写，免注册免装 App。全团愿望实时上屏投票，算法毫秒级评估顺路度与绕行代价，一人领队全团同频。',
    duration: 14000,
  },
  {
    id: 'cockpit-pilot',
    title: '车道级领航与限高拦截',
    desc: '深邃钛黑车规大屏，3D 车道级虚拟光毯、实时车速 HUD 与老城 2.0m 涵洞物理拦截，全车在无人区脱网途中依然尽在掌握。',
    duration: 12000,
  },
  {
    id: 'multi-device-offline',
    title: '多端同频与无网离线守护',
    desc: '跨手机、车机与电脑端全天候毫秒级同频。进入无人区脱网时，系统全自动无感切换至离线安全模式，离线地图、避险规则与应急专线全量可用，出网自动差量同步。',
    duration: 11500,
  },
];

/** 每个 Tab 对应的全局时间轴进度跨度 (映射至 timeline.ts，留出充足静止驻留阅读欣赏时间) */
const TAB_RANGES: [number, number][] = [
  [0.00, 0.198],   // Tab 0: 倾诉与规则推演 (0.18 完成，0.18-0.198 静态驻留)
  [0.20, 0.415],   // Tab 1: 路线大纲与拓扑沙盘 (0.395 完成，0.395-0.415 静态驻留)
  [0.42, 0.775],   // Tab 2: 微信协同与推荐决策 (0.75 完成，0.75-0.775 静态驻留)
  [0.785, 0.925],  // Tab 3: 车机原生座舱与限高拦截 (0.91 完成停稳，0.91-0.925 静态驻留)
  [0.93, 0.998],   // Tab 4: 多端同频与全自动离线守护 (0.93-0.998 全景交互)
];

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
      className="py-16 md:py-24 bg-[#FFFFF9] text-[#241E20] relative overflow-hidden"
      aria-label="TripCraft 智能旅行协同中枢全功能导览"
    >
      {/* 极简背景微光网格 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(#241E20_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.035]"
      />

      <div className="relative mx-auto max-w-[1640px] px-6 sm:px-10 lg:px-12 xl:px-16">
        {/* 左右分栏交互容器：左侧大标题+5个垂直Tab，右侧浮动应用视窗+背景艺术画报 (完全对齐 Unify 图2) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 xl:gap-14 items-center">
          {/* 左侧栏 (lg:col-span-4 xl:col-span-4)：顶部大标题 + 5个垂直指示条 Tab + 导览控制 */}
          <div className="lg:col-span-4 xl:col-span-4 flex flex-col justify-center text-left" role="tablist">
            {/* 顶部标题区 (现代无衬线高保真排版，舒朗呼吸感，告别拥挤与杂乱倾斜) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-8 lg:mb-10"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FE3C01]/10 text-[#FE3C01] text-xs font-semibold tracking-wider mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE3C01]" />
                <span>全链路数字化自驾协同中枢</span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-[32px] xl:text-[38px] font-sans font-bold tracking-tight leading-[1.38] text-[#1E2024]">
                告别碎片路书与导航死角，<br className="hidden sm:inline" />
                打造一体化自驾协同中枢
              </h2>
              <p className="mt-3.5 text-base sm:text-lg text-black/60 leading-relaxed font-sans max-w-xl">
                打通自然语义提炼、GIS 拓扑沙盘、多端实时愿望池、车道级领航与离线交付，让每一程自驾丝滑同频。
              </p>
            </motion.div>

            {/* 5 个垂直流光步进指示器 (完全对齐 Unify 极简设计) */}
            <div className="flex flex-col space-y-6 sm:space-y-7 xl:space-y-8">
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
                    {/* 左侧垂直轨道与流光进度条 (GPU 硬件加速，0 React 重渲染) */}
                    <div className="absolute left-0 top-0 bottom-0 w-[2.5px] bg-black/10 rounded-full overflow-hidden">
                      {isActive && (
                        <motion.div
                          className="w-full bg-[#FE3C01] rounded-full origin-top"
                          style={{ scaleY: tabProgress, height: '100%' }}
                        />
                      )}
                    </div>

                    {/* 标题：大字号，未激活为自然灰，激活为加粗黑字 (对齐 Unify 图2) */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xl sm:text-2xl transition-colors duration-200 ${
                          isActive
                            ? 'font-bold text-[#241E20]'
                            : 'font-normal text-black/40 group-hover:text-black/75'
                        }`}
                      >
                        {tab.title}
                      </span>
                    </div>

                    {/* 激活项展开描述 (对齐 Unify 图2) */}
                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-sm sm:text-base text-black/60 leading-relaxed mt-2.5 max-w-md font-sans">
                          {tab.desc}
                        </p>
                      </motion.div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 导览播放控制坞 (放置于左侧栏底部，绝不遮挡右侧产品主视窗与悬浮手机) */}
            <div className="mt-8 pt-5 border-t border-black/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-black/5 hover:bg-black/10 text-black/75 hover:text-black transition-colors"
                  title={isPaused ? '继续播放' : '暂停演进'}
                >
                  {isPaused ? <PlayIcon className="w-3.5 h-3.5 text-[#FE3C01]" /> : <PauseIcon className="w-3.5 h-3.5 text-[#FE3C01]" />}
                  <span>{isPaused ? '继续播放' : '暂停演进'}</span>
                </button>
                <span className="font-mono text-black/45 text-xs">
                  0{activeTab + 1} / 0{TABS.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-black/60 text-xs">
                <button
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-md hover:bg-black/5 hover:text-black transition-colors"
                  title="上一幕"
                >
                  ← 上一幕
                </button>
                <button
                  onClick={handleNext}
                  className="px-2.5 py-1 rounded-md hover:bg-black/5 hover:text-black transition-colors"
                  title="下一幕"
                >
                  下一幕 →
                </button>
              </div>
            </div>
          </div>

          {/* 右侧栏 (lg:col-span-8 xl:col-span-8)：全宽原生应用视窗 (向右完全展开，手机自由悬浮无硬裁切) */}
          <div className="lg:col-span-8 xl:col-span-8 w-full relative flex items-center min-h-[620px] sm:min-h-[680px] xl:min-h-[740px]">
            <ProgressContext.Provider value={virtualProgress}>
              <LayoutContext.Provider value={{ desktop, wide }}>
                {/* 视窗包装容器：允许子元素 (如副驾手机) 自然悬浮探出，绝不被硬裁切 */}
                <div className="relative z-10 w-full">
                  {/* 核心应用高保真母体视窗 */}
                  <div className="macos-window relative flex h-[620px] sm:h-[660px] lg:h-[700px] w-full flex-col overflow-hidden rounded-2xl bg-[#FAF8F5]/98 text-left border border-[#241E20]/[0.08] shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
                    <Topbar />
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <ChatScene />
                      <Workspace />
                      <CollabDrawer />
                      <ShareSheet />
                      <Backdrop />
                      <RecommendModal />
                      <StageToasts />
                      <CockpitScene />
                      <DeliverScene />
                    </div>
                    <InAppStatusBar />
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
    <footer className="relative z-30 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-ink/[0.08] bg-paper/85 px-2.5 sm:px-4 text-[9px] sm:text-[10px] font-mono text-ink-soft select-none backdrop-blur-md overflow-hidden whitespace-nowrap">
      {/* 左侧：云协同网络已连接 + 弱网/无人区离线乐观保活 + 版本分支 */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap">
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
      <div className="hidden md:flex items-center gap-1.5 text-ink shrink min-w-0 overflow-hidden whitespace-nowrap">
        <TerminalIcon className="h-2.5 w-2.5 text-gold-ink shrink-0" />
        <span className="truncate max-w-[340px] lg:max-w-[420px]">{telemetry.text}</span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft text-[8px] px-1 py-0 shrink-0">{telemetry.badge}</span>
      </div>

      {/* 右侧：无人区离线舱/容灾包 + 契约校验 + 视图比例 */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 whitespace-nowrap">
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
