'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CarIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  CompassIcon,
  ClockIcon,
  PinIcon,
  SparklesIcon,
} from '@/components/common/Icons';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'studio' | 'cockpit'>('studio');
  const [promptText, setPromptText] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  const PROMPTS = [
    '帮我规划 7 天川西自驾，车高 2.15m 避开老城限高地库与暗冰垭口',
    '全团 5 人微信扫码同频愿望池：塔公草原露营 vs 墨石公园投票',
    '编译生成自包含零依赖单文件离线路书 HTML，无人区断网保活',
  ];

  // 打字机循环轮换提示词
  useEffect(() => {
    let currentIdx = 0;
    const interval = setInterval(() => {
      currentIdx = (currentIdx + 1) % PROMPTS.length;
      setActivePromptIndex(currentIdx);
    }, 4500);
    return () => clearInterval(interval);
  }, [PROMPTS.length]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = typeof window !== 'undefined' && window.innerWidth >= 768 ? 80 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24 bg-[#FFFFF9]">
      {/* Ambient background subtle radial glow (Unify supercharge aura) */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[720px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(254,60,1,0.045),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(212,160,78,0.035),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8 flex flex-col items-center text-center">
        {/* 1. Unify Eyebrow Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="unify-pill-badge mb-6 cursor-pointer hover:border-[#241E20]/25 transition-colors"
          onClick={() => scrollToSection('demo')}
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FE3C01] animate-pulse" />
          <span className="text-xs font-medium text-[#241E20]">
            TripCraft 2.0 · Autonomous agents for your self-driving journey
          </span>
          <span className="text-xs text-[#241E20]/40">→</span>
        </motion.div>

        {/* 2. Unify Classic Serif + Supercharge Glow Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-4xl sm:text-6xl lg:text-[76px] font-normal tracking-[-0.03em] leading-[1.08] text-[#241E20] max-w-4xl"
        >
          <span className="supercharge">Autonomous agents</span>
          <br className="hidden sm:inline" /> for every road trip crew
        </motion.h1>

        {/* 3. Subtitle with Unify Tight Typography */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#6E6A67] font-normal"
        >
          从倾诉式 AI 诉求提取，到万人微信协同愿望池；从车路云车道级领航，到无人区零构建离线安全舱。
        </motion.p>

        {/* 4. Unify Search & Prompt Interface (Central Interaction Sandbox) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-full max-w-3xl"
        >
          {/* Dual Tab Controller: Studio vs Cockpit */}
          <div className="flex items-center justify-center mb-4">
            <div className="inline-flex rounded-full bg-[#241E20]/[0.05] p-1 border border-[#241E20]/[0.08]">
              <button
                type="button"
                onClick={() => setActiveTab('studio')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'studio'
                    ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                    : 'text-[#6E6A67] hover:text-[#241E20]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'studio' ? 'bg-[#FE3C01]' : 'bg-transparent'}`} />
                <span>Studio 协同规划端</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('cockpit')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'cockpit'
                    ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                    : 'text-[#6E6A67] hover:text-[#241E20]'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'cockpit' ? 'bg-[#FE3C01]' : 'bg-transparent'}`} />
                <span>Cockpit 智驾座舱端</span>
              </button>
            </div>
          </div>

          {/* Interactive Prompt Input Box (Unify home-hero-input-wrap style) */}
          <div className="relative rounded-[14px] bg-white border border-[#241E20]/15 p-2 sm:p-3 shadow-[0_8px_30px_rgba(36,30,32,0.06)] transition-all focus-within:border-[#FE3C01] focus-within:ring-2 focus-within:ring-[#FE3C01]/20">
            <div className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-[#FE3C01] font-serif text-lg">✦</span>
              <input
                type="text"
                aria-label="自驾规划与车道级领航需求"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={PROMPTS[activePromptIndex]}
                className="w-full bg-transparent text-sm sm:text-base text-[#241E20] placeholder-[#6E6A67]/60 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!promptText) setPromptText(PROMPTS[activePromptIndex]);
                  scrollToSection('demo');
                }}
                aria-label="提交自驾意图"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#241E20] text-white hover:bg-[#FE3C01] transition-all"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* Quick Prompt Suggestions */}
            <div className="mt-2 pt-2 border-t border-[#241E20]/[0.06] flex items-center gap-2 overflow-x-auto text-left px-2 py-1 scrollbar-none">
              <span className="text-[11px] font-medium text-[#6E6A67] whitespace-nowrap">推荐意图:</span>
              {PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(p)}
                  className="whitespace-nowrap rounded-full bg-[#FFFFF9] px-2.5 py-1 text-[11px] text-[#241E20]/80 border border-[#241E20]/[0.08] hover:border-[#FE3C01]/40 hover:text-[#FE3C01] transition-colors"
                >
                  {p.slice(0, 18)}...
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 5. Unify High-Fidelity Sandbox Canvas (Hero Tab Content) */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-8 w-full max-w-5xl rounded-[16px] bg-[#FFFFFF] border border-[#241E20]/10 p-3 sm:p-5 shadow-[0_20px_50px_rgba(36,30,32,0.08)] overflow-hidden"
        >
          {/* Top Window Bar (Minimal macOS / Unify style) */}
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#241E20]/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-[#241E20]/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#241E20]/20" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#241E20]/20" />
              <span className="ml-2 font-mono text-[11px] text-[#6E6A67]">
                {activeTab === 'studio' ? 'tripcraft.studio/川西大环线-7D-AST' : 'c-cabin.os/autonomous-noa/denza-d9'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-[#6E6A67]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>AJV 2020-12 校验通过</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'studio' ? (
              <motion.div
                key="studio"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="grid gap-4 lg:grid-cols-12 text-left"
              >
                {/* Left 4 Cols: AI Prompt Dialog */}
                <div className="lg:col-span-4 rounded-[10px] bg-[#FFFFF9] border border-[#241E20]/[0.08] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#241E20] text-white text-[10px] font-serif">
                        AI
                      </span>
                      <span className="text-xs font-semibold text-[#241E20]">智能行程规划师</span>
                      <span className="text-[10px] text-[#FE3C01] bg-[#FE3C01]/10 px-1.5 py-0.5 rounded font-mono">
                        Online
                      </span>
                    </div>
                    <div className="space-y-2.5 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-[#241E20]/[0.06] text-[#241E20] shadow-sm">
                        “已检测到全团 5 人包含 2 位长辈。为您定制川西 7 日慢行方案，避开高反剧烈的垭口住宿。”
                      </div>
                      <div className="rounded-lg bg-[#241E20]/[0.03] p-2.5 text-[#6E6A67]">
                        “已读取车辆配置：<strong>腾势 D9 顶置行李箱（总高 2.15m）</strong>，沿途已全部标记限高 2.2m 预警与地面宽位充电桩。”
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#6E6A67]">智能体调度状态:</span>
                    <span className="text-emerald-700 font-medium">4 个子任务协同完成</span>
                  </div>
                </div>

                {/* Center 4 Cols: Collaborative Wishlist */}
                <div className="lg:col-span-4 rounded-[10px] bg-[#FFFFF9] border border-[#241E20]/[0.08] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#241E20]">全团愿望池投票 (微信免登)</span>
                      <span className="text-[11px] font-mono text-[#6E6A67]">5/5 已同频</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-[#241E20]/[0.06] shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-[#241E20]">折多山观雪山 (D1 14:00)</span>
                          <span className="text-[11px] font-mono text-[#FE3C01] font-semibold">100% 极高意向</span>
                        </div>
                        <div className="w-full bg-[#241E20]/[0.06] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#FE3C01] h-full w-full" />
                        </div>
                        <span className="text-[10px] text-[#6E6A67] mt-1 block">王叔叔提议 · 刚性预留 40min 拍照</span>
                      </div>

                      <div className="rounded-lg bg-white p-2.5 border border-[#241E20]/[0.06] shadow-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-medium text-[#241E20]">塔公草原日落营地 (D2 17:30)</span>
                          <span className="text-[11px] font-mono text-emerald-600 font-semibold">80% 意向</span>
                        </div>
                        <div className="w-full bg-[#241E20]/[0.06] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full w-4/5" />
                        </div>
                        <span className="text-[10px] text-[#6E6A67] mt-1 block">自动对齐 18:05 黄金日落窗口</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#6E6A67]">冲突协调:</span>
                    <span className="text-blue-800 font-medium">无冲突，自动插入时序</span>
                  </div>
                </div>

                {/* Right 4 Cols: Rigid Physical Guardrails */}
                <div className="lg:col-span-4 rounded-[10px] bg-[#FFFFF9] border border-[#241E20]/[0.08] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-[#241E20]">物理规则断言 (BR-025)</span>
                      <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono font-medium">
                        风控拦截就绪
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="rounded-lg bg-white p-2.5 border border-amber-500/25 shadow-sm">
                        <div className="flex items-start gap-2">
                          <span className="text-amber-600 font-bold">⚠</span>
                          <div>
                            <span className="font-semibold text-[#241E20] block">康定老城地下停车场 (限高 2.0m)</span>
                            <span className="text-[11px] text-[#6E6A67] leading-tight block mt-0.5">
                              自车高度 2.15m (含顶箱)，直接进场将发生物理擦碰！
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-amber-500/15 flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                          <span>✓ 自动重定向:</span>
                          <span>地面露天专用车位 (距 150m)</span>
                        </div>
                      </div>

                      <div className="rounded-lg bg-white p-2 border border-[#241E20]/[0.06] text-[11px] text-[#6E6A67]">
                        <span className="font-medium text-[#241E20]">长辈高程缓冲:</span> 海拔自 500m 缓升至 2,560m，坡度曲线梯度符合安全标定。
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex items-center justify-between text-[11px]">
                    <span className="text-[#6E6A67]">零构建交付:</span>
                    <span className="text-emerald-700 font-semibold font-mono">1.2s 编译离线快照</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Cockpit NOA Tab: High-Fidelity Autonomous Cockpit Preview */
              <motion.div
                key="cockpit"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
                className="relative rounded-[12px] bg-[#12151E] text-white p-4 sm:p-5 border border-white/10 overflow-hidden shadow-2xl"
              >
                {/* Cockpit HUD Top Status Bar */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-amber-500 to-amber-700 text-white font-serif font-bold text-xs">
                      旅
                    </span>
                    <span className="font-bold tracking-tight">C-CABIN · 原生车机领航系统</span>
                    <span className="rounded bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 text-[10px] font-mono border border-emerald-500/30">
                      NOA 领航巡航中
                    </span>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-white/70">
                    <span>腾势 D9 四驱尊享</span>
                    <span className="text-amber-400 font-bold">2.15m 车高断言</span>
                    <span>RTK 厘米级定位</span>
                  </div>
                </div>

                {/* Cockpit Screen Body */}
                <div className="mt-3 grid gap-3 md:grid-cols-12 text-left">
                  {/* Left 4 Cols: Live Schedule Feed */}
                  <div className="md:col-span-4 rounded-[8px] bg-white/[0.04] border border-white/10 p-3 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-white/90">实时行程流转</span>
                        <span className="text-[10px] font-mono text-emerald-400">已同频全车大屏</span>
                      </div>
                      <div className="space-y-2 text-xs">
                        <div className="rounded bg-white/[0.06] p-2 border-l-2 border-amber-400">
                          <span className="text-[10px] text-white/50 block">当前锚点 (距离 14 km)</span>
                          <span className="font-semibold text-white block">折多山 4,298m 观景垭口</span>
                          <span className="text-[10px] text-white/70 block mt-0.5">全员投票第一 · 驻车后自动下发步行镜头</span>
                        </div>
                        <div className="rounded bg-white/[0.03] p-2 text-white/60">
                          <span className="text-[10px] text-white/40 block">下一锚点 (17:40)</span>
                          <span className="text-white/80 block">塔公草原营地 · 黄金日落窗口</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                      <span>后排微信愿望同频:</span>
                      <span className="text-amber-400 font-mono">5 人已联结</span>
                    </div>
                  </div>

                  {/* Right 8 Cols: Lane-Level 3D Navigation Sandtable */}
                  <div className="md:col-span-8 rounded-[8px] bg-gradient-to-b from-[#181C28] to-[#0E1017] border border-white/10 p-3.5 relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    {/* Top Alert & Speed Metrics */}
                    <div className="flex items-center justify-between z-10">
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono text-3xl font-bold text-white tracking-tight">82</span>
                        <span className="text-xs text-white/50 font-mono">km/h</span>
                        <span className="ml-2 text-[11px] text-amber-400 font-mono">限速 90</span>
                      </div>

                      <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-300 border border-amber-500/30">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                        <span>前向 1.2km 老城地下通道限高 2.0m · 提前右转改走地面</span>
                      </div>
                    </div>

                    {/* 3D Road Sandtable Perspective Graphics */}
                    <div className="relative my-2 h-24 w-full flex items-center justify-center">
                      <svg className="w-full h-full" viewBox="0 0 400 100" fill="none" preserveAspectRatio="none">
                        {/* Perspective Road Lanes */}
                        <path d="M120 100 L180 10 L220 10 L280 100" fill="rgba(255,255,255,0.03)" />
                        {/* Golden NOA Guidance Carpet */}
                        <path d="M160 100 L195 10 L205 10 L240 100" fill="url(#goldCarpet)" opacity="0.6" />
                        {/* Dashed Lane Lines */}
                        <line x1="200" y1="100" x2="200" y2="10" stroke="#FE3C01" strokeWidth="2" strokeDasharray="6 6" />
                        {/* Denza D9 Vehicle Avatar (Top-down) */}
                        <g transform="translate(190, 52)">
                          <rect x="0" y="0" width="20" height="34" rx="4" fill="#E2E8F0" stroke="#0F172A" strokeWidth="1" />
                          <rect x="3" y="8" width="14" height="16" rx="2" fill="#38BDF8" opacity="0.8" />
                          <rect x="5" y="10" width="10" height="12" rx="1" fill="#FE3C01" opacity="0.9" />
                          <circle cx="10" cy="5" r="1.5" fill="#F59E0B" />
                        </g>
                        <defs>
                          <linearGradient id="goldCarpet" x1="0%" y1="100%" x2="0%" y2="0%">
                            <stop offset="0%" stopColor="#FE3C01" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#FE3C01" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>

                    {/* Bottom Lane Actions & Radar Info */}
                    <div className="flex items-center justify-between text-[11px] text-white/60 pt-2 border-t border-white/10 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-semibold">● 自动避障就绪</span>
                        <span>前向感知雷达: 85m 无障碍物</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => scrollToSection('demo')}
                        className="text-amber-400 hover:text-white transition-colors underline font-medium"
                      >
                        全屏体验五幕长镜头演示 →
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 6. Unify NBC Stats Counter & Social Proof Bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 w-full pt-10 border-t border-[#241E20]/[0.08]"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#6E6A67]">
                Proven Reliability Across Deep Explorations
              </p>
              <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-[#241E20] font-normal">
                TripCraft has powered{' '}
                <span className="font-mono font-bold text-[#FE3C01]">12,840+ km</span> of autonomous journeys
              </h2>
            </div>

            <div className="flex items-center gap-6 sm:gap-8 font-mono text-xs text-[#241E20]">
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-[#241E20]">318+</span>
                <span className="text-[11px] text-[#6E6A67]">自驾车队护航</span>
              </div>
              <div className="h-8 w-[1px] bg-[#241E20]/10" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-[#241E20]">2.15m</span>
                <span className="text-[11px] text-[#6E6A67]">限高拦截准确率 100%</span>
              </div>
              <div className="h-8 w-[1px] bg-[#241E20]/10" />
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-[#241E20]">0 次</span>
                <span className="text-[11px] text-[#6E6A67]">无人区白屏故障</span>
              </div>
            </div>
          </div>

          {/* Partner & Tech Ecosystem Marquee (Unify Logo Strip) */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-12 opacity-70 grayscale hover:grayscale-0 transition-all text-xs font-semibold text-[#241E20]">
            <span className="flex items-center gap-1.5 tracking-tight font-sans">
              <span className="font-bold text-sm">DENZA</span> 腾势汽车座舱
            </span>
            <span className="flex items-center gap-1.5 tracking-tight font-sans">
              <span className="font-bold text-sm">AutoNavi</span> 高德车道级导航
            </span>
            <span className="flex items-center gap-1.5 tracking-tight font-sans">
              <span className="font-bold text-sm">WeChat</span> 微信小程序免登协同
            </span>
            <span className="flex items-center gap-1.5 tracking-tight font-mono">
              <span className="font-bold text-sm">IndexedDB</span> Local-First 本地优先
            </span>
            <span className="flex items-center gap-1.5 tracking-tight font-mono">
              <span className="font-bold text-sm">AJV</span> 2020-12 数据契约
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
