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
    desc: '不用面对冷冰冰的繁琐表单。说出出行人员、车型配置与在意事项，AI 定制师自动提炼长辈少台阶、幼儿午休与 2.28m 车高限高等专属守护规则。',
    duration: 11000,
  },
  {
    id: 'outline-topology',
    title: '九日路书与航线拓扑',
    desc: '一段话瞬间长成一本看得见的专业路书。九天日程时序、河西走廊拓扑航线、海拔爬升剖面与 7 座 MPV 地面车位几秒内依次就位。',
    duration: 11500,
  },
  {
    id: 'wechat-collab',
    title: '微信免登愿望池协同',
    desc: '同行亲友微信扫码即写，免注册免装 App。全团心愿实时上屏，智能评估顺路度与绕行代价，领队一键确认即全团同步。',
    duration: 15500,
  },
  {
    id: 'cockpit-pilot',
    title: '车道级领航与限高拦截',
    desc: '副驾手机一键流转至车载大屏，3D 车道级导引光毯、实时车速 HUD 与老城 2.0m 地库限高提前预警改道，停稳后自动接力步行导航。',
    duration: 13000,
  },
  {
    id: 'multi-device-offline',
    title: '多端同频与无网离线守护',
    desc: '跨手机、车机与桌面端全天候毫秒级同频。驶入戈壁无人区脱网时，自动无感切换至本地离线沙盘，地图、避险规则与应急专线全量可用。',
    duration: 11500,
  },
];

/** 每个 Tab 对应的全局时间轴进度跨度 (映射至 timeline.ts，留出充足静止驻留阅读欣赏时间) */
const TAB_RANGES: [number, number][] = [
  [0.00, 0.198],   // Tab 0: 倾诉与规则推演 (0.15 完成，0.15-0.198 静态驻留)
  [0.20, 0.415],   // Tab 1: 路线大纲与拓扑沙盘 (0.395 完成，0.395-0.415 静态驻留)
  [0.42, 0.775],   // Tab 2: 微信协同与推荐决策 + 兰州步行微镜 (0.758 完成，0.758-0.775 静态驻留)
  [0.78, 0.925],   // Tab 3: 手机投车与车机原生座舱 (0.91 完成停稳，0.91-0.925 静态驻留)
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

  // 供自动化视觉巡检与调试工具精确跳转到任意全局进度帧
  useEffect(() => {
    const win = window as unknown as {
      __setStageProgress?: (globalVal: number) => void;
    };
    win.__setStageProgress = (globalVal: number) => {
      const clamped = Math.max(0, Math.min(1, globalVal));
      let idx = TAB_RANGES.findIndex(([s, e]) => clamped >= s && clamped <= e);
      if (idx === -1) {
        idx = clamped >= 0.925 ? 4 : 0;
      }
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
      aria-label="TripCraft 智能旅行协同中枢全功能导览"
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
                <span>全链路数字化自驾协同中枢</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-[30px] font-sans font-bold tracking-tight leading-[1.32] text-[#1E2024] text-balance">
                告别碎片路书与导航死角，
                <br />
                打造一体化自驾协同中枢
              </h2>
              <p className="mt-2.5 text-sm sm:text-[15px] text-black/60 leading-relaxed font-sans max-w-xl">
                打通自然语言倾诉、河西走廊拓扑沙盘、微信免登愿望池、车道级领航与无网离线守护，让每一程自驾从容同频。
              </p>
            </motion.div>

            {/* 5 个垂直流光步进指示器 (紧凑舒朗，确保 1440x900 视口一屏完整呈现) */}
            <div className="flex flex-col space-y-3.5 sm:space-y-4 xl:space-y-5">
              {TABS.map((tab, idx) => {
                const isActive = activeTab === idx;
                return (
                  <div
                    key={tab.id}
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
            <div className="mt-5 pt-4 border-t border-black/[0.08] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
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
                  type="button"
                  onClick={handlePrev}
                  className="px-2.5 py-1 rounded-md hover:bg-black/5 hover:text-black transition-colors"
                  title="上一幕"
                >
                  ← 上一幕
                </button>
                <button
                  type="button"
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
          <div className="lg:col-span-8 xl:col-span-8 w-full relative flex items-center min-h-[600px] sm:min-h-[660px] xl:min-h-[700px]">
            <ProgressContext.Provider value={virtualProgress}>
              <LayoutContext.Provider value={{ desktop, wide }}>
                {/* 视窗包装容器：允许子元素 (如副驾手机) 自然悬浮探出，绝不被硬裁切 */}
                <div className="relative z-10 w-full">
                  {/* 核心应用高保真母体视窗 */}
                  <div className="macos-window relative flex h-[600px] sm:h-[650px] lg:h-[680px] w-full flex-col overflow-hidden rounded-2xl bg-[#FAF8F5]/98 text-left border border-[#241E20]/[0.08] shadow-[0_28px_80px_rgba(0,0,0,0.14)]">
                    <Topbar />
                    <div className="relative min-h-0 flex-1 overflow-hidden">
                      <ChatScene />
                      <Workspace />
                      <CollabDrawer />
                      <ShareSheet />
                      <Backdrop />
                      <RecommendModal />
                      <StageToasts />
                      <DeliverScene />
                    </div>
                    <InAppStatusBar />
                    {/* 车载中控座舱作为独立硬件大屏完整接管舞台视窗，拒绝套在桌面窗口顶底栏内部 */}
                    <CockpitScene />
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
  const chapterStep = useStep(p, [0.20, 0.42, 0.62, 0.84]);
  const isV11 = useStep(p, [T.version]) === 1;
  const isDelivery = chapterStep === 4;

  const telemetry = [
    { text: '已提取 5 人家庭出行偏好 · 长辈少台阶、幼儿午休与 2.28m 车高保障已生效', badge: '专属定制' },
    { text: '河西走廊 9 日全线贯通 · 兰州 ➔ 张掖 ➔ 嘉峪关 ➔ 敦煌 (1,980km)', badge: '全景航线' },
    { text: '3 位同行人实时在线 · 微信扫码免登加入 · 愿望池提名实时共享', badge: '多人共创' },
    { text: '正宁路夜市顺路度 98% · 领队已确认并入 D0 晚间 · 全团秒级同步', badge: '智能重排' },
    { text: '腾势 D9 座舱与随身离线包已同步 · 48.6 MB 离线地图与应急专线常驻', badge: '离线守护' },
  ][chapterStep] || { text: '多端实时同频已就绪', badge: '实时同频' };

  return (
    <footer className="relative z-30 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-ink/[0.08] bg-paper/90 px-3 sm:px-4 text-[10px] font-sans text-ink-soft select-none backdrop-blur-md overflow-hidden whitespace-nowrap">
      {/* 左侧：连接状态 + 版本 */}
      <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
        <span className="flex items-center gap-1.5 font-semibold text-jade">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
          <span>{isDelivery ? '无人区离线守护中' : '多端实时同频'}</span>
        </span>
        <span className="text-ink/20">|</span>
        <span className="font-medium text-ink flex items-center gap-1 font-mono text-[9.5px]">
          <span className="text-ink-soft">版本</span>
          <span className="font-semibold text-gold-ink">{isV11 ? 'v1.1 (已含夜市加点)' : 'v1.0'}</span>
        </span>
      </div>

      {/* 中间：当前章节场景摘要 */}
      <div className="hidden md:flex items-center gap-1.5 text-ink shrink min-w-0 overflow-hidden whitespace-nowrap">
        <SparklesIcon className="h-2.5 w-2.5 text-gold-ink shrink-0" />
        <span className="truncate max-w-[360px] lg:max-w-[440px]">{telemetry.text}</span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft text-[9px] px-1.5 py-0 shrink-0">{telemetry.badge}</span>
      </div>

      {/* 右侧：离线安全保障 */}
      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="text-emerald-700 font-semibold flex items-center gap-1">
          <ShieldIcon className="h-2.5 w-2.5 text-emerald-600" />
          <span className="hidden sm:inline">48.6 MB 离线包已就绪</span>
          <span className="sm:hidden">离线就绪</span>
        </span>
      </div>
    </footer>
  );
}
