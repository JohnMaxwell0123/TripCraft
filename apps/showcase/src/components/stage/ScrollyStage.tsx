'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CompassIcon,
  ClockIcon,
  SparklesIcon,
  PlayIcon,
  PauseIcon,
  RotateCcwIcon,
  ElderIcon,
  BabyIcon,
  PinIcon,
  SignalSlashIcon,
  ChevronRightIcon,
} from '@/components/common/Icons';

/**
 * Unify 风格交互式导览沙盒 (Autonomous Stories Stage)
 * 
 * 核心架构机理：
 * 1. 【时钟解耦】：摒弃传统将动画强制绑定在页面滚轮高度 (Scroll Hijacking) 的做法，
 *    采用独立的自运行沙盒时钟 (RAF / Timer)。用户在页面上下自由滑动翻看，
 *    右侧演示丝滑推进，绝不卡顿或倒退。
 * 2. 【垂直流光进度步进器】：左侧 5 个阶段垂直排列，激活项由橙红进度条 (#FE3C01)
 *    自上而下匀速填充，填满后平滑切换至下一幕；用户亦可随时点击任意项即刻切入。
 * 3. 【极简拟物视窗与氛围底板】：右侧在深色奢华极光渐变背板上漂浮应用视窗，
 *    内部自运行展示 5 大自驾核心业务闭环。
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
    title: '自然语言意图提炼',
    desc: '不用面对冷冰冰的繁琐表单。说出出行人员、车型配置与在意事项，AI 毫秒级抽取长辈步行限制、幼儿作息与 2.15m 限高等刚性规则。',
    duration: 7000,
  },
  {
    id: 'wechat-collab',
    eyebrow: '02 · 零门槛共创',
    title: '微信免登愿望池协同',
    desc: '同行亲友微信扫码即写，免注册免装 App。全团愿望实时上屏投票，算法毫秒级评估顺路度与绕行代价，一人领队全团同频。',
    duration: 7000,
  },
  {
    id: 'risk-interceptor',
    eyebrow: '03 · 实时物理风控',
    title: '2.15m 限高与险路拦截',
    desc: '针对自驾车顶行李箱（腾势 D9 达 2.28m）、暗冰非铺装与施工涵洞实施毫秒级碰撞与净空计算。提前 50km 智能规避，安全隐患归零。',
    duration: 7500,
  },
  {
    id: 'cockpit-pilot',
    eyebrow: '04 · 车机原生座舱',
    title: 'C-CABIN 车道级 NOA 领航',
    desc: '深邃钛黑车机专属大屏，3D 车道级虚拟光毯、海拔爬升剖面与连续发卡弯预警，全车在无人区脱网途中依然尽在掌握。',
    duration: 7500,
  },
  {
    id: 'zero-build-offline',
    eyebrow: '05 · 本地优先主权',
    title: '零构建单文件离线交付',
    desc: '一键将全套交互式路书编译为自包含单 HTML 文件。双击秒开，断网飞行模式全量功能可查，数据主权永存本地。',
    duration: 7000,
  },
];

export function ScrollyStage() {
  const [activeTab, setActiveTab] = useState(0);
  const [progress, setProgress] = useState(0); // 0 -> 1
  const [isPaused, setIsPaused] = useState(false);
  const [isInView, setIsInView] = useState(true);

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

        if (currentProgress >= 1) {
          // 步进到下一幕
          const nextTab = (activeTabRef.current + 1) % TABS.length;
          setActiveTab(nextTab);
          startTimeRef.current = now;
          setProgress(0);
          pausedProgressRef.current = 0;
        }
      } else {
        startTimeRef.current = null;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  // 用户点击左侧 Tab 手动切入
  const handleSelectTab = useCallback((index: number) => {
    setActiveTab(index);
    setProgress(0);
    pausedProgressRef.current = 0;
    startTimeRef.current = performance.now();
  }, []);

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

      <div className="relative mx-auto max-w-[1360px] px-6 sm:px-10 lg:px-12">
        {/* 顶部标题区 (对齐 Unify 大字号 + 橙红高亮词) */}
        <div className="max-w-4xl mb-14 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-tight leading-[1.2] text-[#241E20]">
              告别碎片路书与导航死角，<br className="hidden sm:inline" />
              一体化协同中枢涵盖 <span className="text-[#FE3C01]">意图解析</span>、
              <span className="text-[#FE3C01]">心愿协同</span>、
              <span className="text-[#FE3C01]">风控拦截</span> 与{' '}
              <span className="text-[#FE3C01]">车道级 NOA 领航</span>。
            </h2>
            <p className="mt-4 text-base sm:text-lg text-black/60 max-w-2xl font-sans">
              五大核心场景自运行演进。上下翻阅页面绝不打断右侧沙盒演示，点击左侧卡片随时切入查看。
            </p>
          </motion.div>
        </div>

        {/* 左右分栏交互容器：左侧 5 个垂直指示条 Tab，右侧自运行应用视窗 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* 左侧：5 个垂直流光步进指示器 */}
          <div className="lg:col-span-5 flex flex-col space-y-6 sm:space-y-8" role="tablist">
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

                  {/* 标题 */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-lg sm:text-xl transition-colors duration-200 ${
                        isActive
                          ? 'font-medium text-[#241E20]'
                          : 'font-normal text-black/40 group-hover:text-black/75'
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
                      <p className="text-sm sm:text-[15px] text-black/65 leading-relaxed mt-2.5 max-w-md font-sans">
                        {tab.desc}
                      </p>
                    </motion.div>
                  )}
                </div>
              );
            })}
          </div>

          {/* 右侧：深色极光氛围背板 + 拟物应用视窗 */}
          <div className="lg:col-span-7 w-full">
            <div className="rounded-3xl bg-gradient-to-tr from-[#161211] via-[#241714] to-[#120f0e] border border-[#382b26] p-3 sm:p-5 md:p-7 relative shadow-[0_32px_80px_rgba(0,0,0,0.4)] overflow-hidden">
              {/* 氛围暖橙与琥珀散光微斑 (Unify 极光氛围) */}
              <div
                aria-hidden
                className="pointer-events-none absolute -top-24 -right-24 w-80 h-80 rounded-full bg-[#FE3C01]/12 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#D4A04E]/10 blur-3xl"
              />

              {/* 拟物应用视窗 (Window Chrome) */}
              <div className="w-full h-[470px] sm:h-[510px] md:h-[530px] rounded-2xl bg-[#0f1117] border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.65)] flex flex-col overflow-hidden relative">
                {/* 视窗标题栏 */}
                <div className="h-11 px-4 bg-[#161922] border-b border-white/[0.08] flex items-center justify-between shrink-0 select-none">
                  {/* 左侧应用标识与标题 */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-md bg-[#FE3C01] flex items-center justify-center text-white shadow-sm">
                      <SparklesIcon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium text-white/90 tracking-tight">
                      TripCraft Studio · 川西甘青大环线中枢
                    </span>
                    <span className="hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-white/[0.06] text-white/60 border border-white/5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      自运行沙盒
                    </span>
                  </div>

                  {/* 右侧窗口三原点控制器与播放暂停胶囊 */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={togglePause}
                      className="flex items-center gap-1 text-[11px] text-white/50 hover:text-white transition-colors px-2 py-0.5 rounded bg-white/5 hover:bg-white/10"
                      title={isPaused ? '继续播放' : '暂停演示'}
                    >
                      {isPaused ? <PlayIcon className="w-2.5 h-2.5" /> : <PauseIcon className="w-2.5 h-2.5" />}
                      <span className="hidden sm:inline">{isPaused ? '继续' : '暂停'}</span>
                    </button>
                    <div className="flex items-center gap-1.5 text-white/30 text-xs">
                      <span>—</span>
                      <span>▢</span>
                      <span>✕</span>
                    </div>
                  </div>
                </div>

                {/* 视窗内容主体：5 幕独立场景沙盒 */}
                <div className="relative flex-1 p-4 sm:p-6 overflow-hidden flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    {activeTab === 0 && <SceneIntent key="intent" progress={progress} />}
                    {activeTab === 1 && <SceneCollab key="collab" progress={progress} />}
                    {activeTab === 2 && <SceneRisk key="risk" progress={progress} />}
                    {activeTab === 3 && <SceneCockpit key="cockpit" progress={progress} />}
                    {activeTab === 4 && <SceneDeliver key="deliver" progress={progress} />}
                  </AnimatePresence>
                </div>

                {/* 底部微型控制器 */}
                <div className="h-9 px-4 bg-[#12141c] border-t border-white/[0.06] flex items-center justify-between text-xs text-white/40">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white/70">0{activeTab + 1}</span>
                    <span>/ 05</span>
                    <span className="text-white/20">|</span>
                    <span className="text-white/60 truncate max-w-[200px] sm:max-w-none">
                      {TABS[activeTab].title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrev}
                      className="p-1 hover:text-white transition-colors"
                      title="上一幕"
                    >
                      ←
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-1 hover:text-white transition-colors"
                      title="下一幕"
                    >
                      →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────────────────────
   场景 01: 自然语言意图提炼 (Intent Parsing)
   ───────────────────────────────────────────────────────────── */
function SceneIntent({ progress }: { progress: number }) {
  // 打字进度与卡片弹出时刻
  const text = '全家5口，70岁爷爷做过膝盖手术，开腾势D9带车顶行李箱，去甘肃大环线';
  const charCount = Math.min(text.length, Math.floor(progress * text.length * 2.2));
  const showResult = progress > 0.42;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full justify-between gap-4"
    >
      {/* 顶部模拟输入框 */}
      <div className="rounded-xl bg-[#1b1e2a] border border-white/10 p-3.5 shadow-inner">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <span className="text-xs text-white/40 block mb-1">自然语言愿望输入：</span>
            <div className="text-sm text-white/90 font-mono tracking-tight min-h-[44px] leading-relaxed">
              {text.slice(0, charCount)}
              {progress < 0.42 && <span className="inline-block w-2 h-4 bg-[#FE3C01] ml-0.5 animate-pulse align-middle" />}
            </div>
          </div>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
              progress > 0.38 ? 'bg-[#FE3C01] text-white scale-95 shadow-md shadow-[#FE3C01]/30' : 'bg-white/10 text-white/40'
            }`}
          >
            <SparklesIcon className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* AI 思考中与意图规则卡片 */}
      <div className="flex-1 flex flex-col justify-center gap-2.5">
        <div className="flex items-center gap-2 text-xs text-white/60">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>TripCraft 规则引擎毫秒级提炼约束 AST：</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* 规则 1 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showResult ? 1 : 0.2, scale: showResult ? 1 : 0.98 }}
            className="rounded-lg bg-[#141722] border border-white/8 p-2.5 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <ElderIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/90 truncate">长辈膝关节保护</div>
              <div className="text-[11px] text-white/50 truncate">单次步行≤500m · 规避高阶梯</div>
            </div>
          </motion.div>

          {/* 规则 2 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showResult ? 1 : 0.2, scale: showResult ? 1 : 0.98 }}
            transition={{ delay: 0.05 }}
            className="rounded-lg bg-[#141722] border border-white/8 p-2.5 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
              <CarIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/90 truncate">腾势 D9 物理轮廓</div>
              <div className="text-[11px] text-white/50 truncate">车顶行李箱 · 综合高 2.28m</div>
            </div>
          </motion.div>

          {/* 规则 3 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showResult ? 1 : 0.2, scale: showResult ? 1 : 0.98 }}
            transition={{ delay: 0.1 }}
            className="rounded-lg bg-[#141722] border border-white/8 p-2.5 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-rose-500/10 text-rose-400 flex items-center justify-center shrink-0">
              <BabyIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/90 truncate">幼儿作息防中暑</div>
              <div className="text-[11px] text-white/50 truncate">13:00-14:30 午休静止期</div>
            </div>
          </motion.div>

          {/* 规则 4 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: showResult ? 1 : 0.2, scale: showResult ? 1 : 0.98 }}
            transition={{ delay: 0.15 }}
            className="rounded-lg bg-[#141722] border border-white/8 p-2.5 flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
              <CompassIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs font-medium text-white/90 truncate">甘肃青海大环线</div>
              <div className="text-[11px] text-white/50 truncate">9天慢节奏 · 避开暗冰垭口</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* 底部生成完成状态条 */}
      <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 flex items-center justify-between text-xs text-emerald-400">
        <span className="flex items-center gap-1.5 font-medium">
          <CheckIcon className="w-3.5 h-3.5" /> 结构化路书 DSL AST 解析完毕
        </span>
        <span className="text-[10px] text-emerald-400/70 font-mono">耗时 320ms · AJV 严格校验通过</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   场景 02: 微信免登愿望池协同 (WeChat Live Collab)
   ───────────────────────────────────────────────────────────── */
function SceneCollab({ progress }: { progress: number }) {
  const showCard1 = progress > 0.15;
  const showCard2 = progress > 0.4;
  const showCard3 = progress > 0.65;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full justify-between gap-3"
    >
      {/* 协同头栏 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-white/90">全团愿望池 · 微信免登协同</span>
        </div>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/60">
          3 位成员实时在线
        </span>
      </div>

      {/* 协同卡片流动瀑布 */}
      <div className="flex-1 flex flex-col justify-center space-y-2.5">
        {/* 卡片 1 */}
        <motion.div
          animate={{ opacity: showCard1 ? 1 : 0.2, x: showCard1 ? 0 : -8 }}
          className="rounded-xl bg-[#171a25] border border-white/10 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-300 font-medium text-xs flex items-center justify-center shrink-0 border border-pink-500/30">
              妈妈
            </div>
            <div>
              <div className="text-xs text-white/90 font-medium">投送愿望：鸣沙山月牙泉看日落驼队</div>
              <div className="text-[11px] text-white/40">微信对话直连 · 免下载 App</div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            +2 赞同 · 顺路
          </span>
        </motion.div>

        {/* 卡片 2 */}
        <motion.div
          animate={{ opacity: showCard2 ? 1 : 0.2, x: showCard2 ? 0 : -8 }}
          className="rounded-xl bg-[#171a25] border border-white/10 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-300 font-medium text-xs flex items-center justify-center shrink-0 border border-blue-500/30">
              爸爸
            </div>
            <div>
              <div className="text-xs text-white/90 font-medium">投送愿望：大柴旦翡翠湖航拍 + 供氧温泉酒店</div>
              <div className="text-[11px] text-white/40">硬件需求自动绑定到当日日程</div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
            已采纳 · 排入 D4
          </span>
        </motion.div>

        {/* 卡片 3 */}
        <motion.div
          animate={{ opacity: showCard3 ? 1 : 0.2, x: showCard3 ? 0 : -8 }}
          className="rounded-xl bg-[#171a25] border border-white/10 p-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 font-medium text-xs flex items-center justify-center shrink-0 border border-amber-500/30">
              小姨
            </div>
            <div>
              <div className="text-xs text-white/90 font-medium">投送愿望：莫高窟数字展示中心 A类特窟</div>
              <div className="text-[11px] text-white/40">门票预约库存已智能预警锁定</div>
            </div>
          </div>
          <span className="text-[11px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
            全团通过
          </span>
        </motion.div>
      </div>

      {/* 协同算法结算 */}
      <div className="rounded-lg bg-[#141620] border border-white/10 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2 text-white/80">
          <SparklesIcon className="w-4 h-4 text-[#FE3C01]" />
          <span>算法动态重排：全团顺路度 <span className="text-emerald-400 font-mono font-medium">98.4%</span></span>
        </div>
        <span className="text-[11px] text-white/50">新增绕行仅 +14km</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   场景 03: 2.15m 限高风控拦截 (2.15m Risk Interceptor)
   ───────────────────────────────────────────────────────────── */
function SceneRisk({ progress }: { progress: number }) {
  const isAlert = progress > 0.25;
  const isResolved = progress > 0.65;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full justify-between gap-3"
    >
      {/* 顶部风控雷达扫描条 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldIcon className="w-4 h-4 text-[#FE3C01]" />
          <span className="text-xs font-medium text-white/90">车辆物理模型与道路净空实时对撞检测</span>
        </div>
        <span className="text-[11px] font-mono text-white/50">G315 国道桩号 K142+500</span>
      </div>

      {/* 核心风控警示卡片 */}
      <div className="flex-1 flex flex-col justify-center gap-3">
        {/* 碰撞检测面板 */}
        <div className="rounded-xl bg-[#191c28] border border-white/10 p-3.5 flex items-center justify-between">
          <div>
            <div className="text-xs text-white/50 mb-1">当前车组全高剖面：</div>
            <div className="text-sm font-medium text-white flex items-center gap-2">
              <CarIcon className="w-4 h-4 text-white/70" />
              <span>腾势 D9 (1.96m) + 车顶行李箱 (0.32m)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-white/50 block">总通过高度</span>
            <span className="text-base font-mono font-bold text-amber-400">2.28 m</span>
          </div>
        </div>

        {/* 拦截状态 */}
        <div
          className={`rounded-xl border p-3.5 transition-all duration-500 ${
            isResolved
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : isAlert
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300 animate-pulse'
              : 'bg-white/5 border-white/10 text-white/60'
          }`}
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                isResolved
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : isAlert
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-white/10 text-white/40'
              }`}
            >
              <AlertTriangleIcon className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold tracking-tight">
                {isResolved
                  ? '✓ 避险走廊重规划完成 · 风险彻底消解'
                  : isAlert
                  ? '⛔ 触发物理限高刚性拦截：前方涵洞施工 2.15m'
                  : '正在对撞沿线 80 处涵洞与地库净空...'}
              </div>
              <div className="text-[11px] opacity-80 mt-1 leading-relaxed">
                {isResolved
                  ? '已自动切换 S434 走廊（净空 3.8m），增加耗时仅 7 分钟，副驾微信与车载中控已无感同步。'
                  : isAlert
                  ? '计算差值: 2.15m - 2.28m = -13cm 刮顶险情！系统已自动阻断原路径通行。'
                  : '车辆物理限界 2.28m 已装载入调度器。'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 底部风控状态标牌 */}
      <div className="rounded-lg bg-[#12151e] border border-white/8 px-3 py-2 flex items-center justify-between text-[11px]">
        <span className="text-white/60">自驾风控评级：<span className="text-emerald-400 font-medium">A+ 绝对安全</span></span>
        <span className="text-white/40 font-mono">提前 50km 预警并规避</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   场景 04: C-CABIN 车道级 NOA 领航 (Cockpit Lane Navigation)
   ───────────────────────────────────────────────────────────── */
function SceneCockpit({ progress }: { progress: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full justify-between gap-3 text-white"
    >
      {/* 车规座舱顶栏 */}
      <div className="flex items-center justify-between text-xs px-1 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-emerald-400 font-bold tracking-wider">DENZA NOA</span>
          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[10px]">
            领航中
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-white/60 font-mono">
          <span>海拔 3180m</span>
          <span>室外 18°C</span>
          <span>4G/卫星</span>
        </div>
      </div>

      {/* 3D 虚拟车道透视沙盘 */}
      <div className="relative flex-1 rounded-xl bg-gradient-to-b from-[#0d1017] to-[#171b26] border border-white/10 overflow-hidden flex items-center justify-center">
        {/* 3D 透视车道 */}
        <div className="absolute inset-0 flex items-center justify-center [perspective:400px]">
          <div className="w-56 h-full border-x border-white/20 [transform:rotateX(60deg)] relative flex justify-center">
            {/* 绿色领航光毯 */}
            <div className="absolute inset-y-0 w-24 bg-gradient-to-t from-emerald-500/30 via-emerald-500/10 to-transparent" />
            {/* 车道虚线 */}
            <div className="w-[2px] h-full bg-[repeating-linear-gradient(to_bottom,white_0,white_14px,transparent_14px,transparent_28px)] opacity-40 animate-pulse" />
          </div>
        </div>

        {/* 腾势 D9 顶视流线车身 */}
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-14 h-24 rounded-2xl bg-gradient-to-b from-[#252a38] to-[#151922] border border-white/30 shadow-[0_12px_28px_rgba(0,0,0,0.8)] flex flex-col items-center justify-between p-1.5">
            <div className="w-10 h-3 rounded bg-sky-400/30 border border-sky-400/40" />
            <div className="text-[9px] font-mono text-white/50 tracking-tighter">D9 领航版</div>
            <div className="w-10 h-2 rounded bg-red-500/40" />
          </div>
        </div>

        {/* 悬浮车速 HUD */}
        <div className="absolute left-4 top-4 z-20">
          <div className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow">
            78 <span className="text-xs font-normal text-white/50">km/h</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> 车道居中保持中
          </div>
        </div>

        {/* 前方路况微提醒 */}
        <div className="absolute right-4 bottom-4 z-20 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1.5 text-right">
          <div className="text-[11px] text-white/50">前方 800m 连续弯道</div>
          <div className="text-xs font-medium text-amber-300">建议降速至 45 km/h</div>
        </div>
      </div>

      {/* 座舱底栏状态 */}
      <div className="rounded-lg bg-[#141722] border border-white/8 px-3 py-1.5 flex items-center justify-between text-xs text-white/70">
        <span className="flex items-center gap-2">
          <CompassIcon className="w-3.5 h-3.5 text-white/50" /> 下一出口：G315 大柴旦收费站 (距 18km)
        </span>
        <span className="text-emerald-400 text-[11px] font-mono">全程无网络自包含运行</span>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────
   场景 05: 零构建单文件离线交付 (Zero-Build Offline Delivery)
   ───────────────────────────────────────────────────────────── */
function SceneDeliver({ progress }: { progress: number }) {
  const isOffline = progress > 0.35;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="flex flex-col h-full justify-between gap-3 text-white"
    >
      {/* 离线交付头栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SignalSlashIcon className={`w-4 h-4 ${isOffline ? 'text-amber-400' : 'text-white/40'}`} />
          <span className="text-xs font-medium text-white/90">
            单文件离线沙盒自验证 (断网测试)
          </span>
        </div>
        <div
          className={`text-[11px] px-2.5 py-0.5 rounded-full border font-mono transition-colors ${
            isOffline
              ? 'bg-amber-500/20 border-amber-500/30 text-amber-300'
              : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300'
          }`}
        >
          {isOffline ? '● 飞行模式 (完全脱网)' : '● 正在打包产物'}
        </div>
      </div>

      {/* 离线单文件展示卡 */}
      <div className="flex-1 flex flex-col justify-center space-y-3">
        {/* 打包规格卡 */}
        <div className="rounded-xl bg-[#161a26] border border-white/10 p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <CheckIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-medium text-white/90">tripcraft-gansu-qinghai.html</div>
              <div className="text-[11px] text-white/40">1.2 MB 自包含单文件 · 双击秒开</div>
            </div>
          </div>
          <span className="text-xs font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
            零运行时依赖
          </span>
        </div>

        {/* 性能与主权监控器 */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-[#141620] border border-white/8 p-3">
            <div className="text-[11px] text-white/40 mb-1">脱网网络请求包：</div>
            <div className="text-xl font-mono font-bold text-emerald-400">0 KB</div>
            <div className="text-[10px] text-white/40 mt-1">杜绝运行时外部 CDN 拉取</div>
          </div>
          <div className="rounded-xl bg-[#141620] border border-white/8 p-3">
            <div className="text-[11px] text-white/40 mb-1">离线地图与交互帧率：</div>
            <div className="text-xl font-mono font-bold text-sky-400">60 FPS</div>
            <div className="text-[10px] text-white/40 mt-1">本地 IndexedDB 秒级加载</div>
          </div>
        </div>
      </div>

      {/* 铁律 1 达成徽章 */}
      <div className="rounded-lg bg-gradient-to-r from-amber-500/10 via-[#FE3C01]/10 to-amber-500/10 border border-amber-500/20 p-2.5 flex items-center justify-between text-xs text-amber-300">
        <span className="flex items-center gap-1.5 font-medium">
          <SparklesIcon className="w-4 h-4 text-amber-400" />
          遵循铁律 1：零构建交付 · 降级不白屏 · 数据主权永存本地
        </span>
        <span className="text-[10px] text-amber-400/80 font-mono">100% 离线可用</span>
      </div>
    </motion.div>
  );
}
