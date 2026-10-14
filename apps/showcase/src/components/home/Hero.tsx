'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClockIcon, FileTextIcon, CarIcon, BookOpenIcon, ZapIcon, ShieldIcon } from '@/components/common/Icons';

export function Hero() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'schedule' | 'export'>('canvas');

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleDownloadSample = () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TripCraft · 数字化自驾路书 (出游容灾舱样例)</title>
  <style>
    :root { --sand: #F8FAFC; --ink: #0F172A; --gold: #B8863B; --paper: #FFFFFF; --jade: #10B981; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: var(--sand); color: var(--ink); padding: 32px 20px; }
    .card { background: var(--paper); border: 1px solid rgba(15,23,42,0.1); border-radius: 20px; padding: 28px; max-width: 640px; margin: 0 auto; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.08); }
    h1 { font-size: 22px; font-weight: 700; color: var(--ink); margin-top: 0; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16,185,129,0.1); color: var(--jade); padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 18px; }
    .day { border-left: 3px solid var(--gold); padding-left: 14px; margin-bottom: 18px; }
    .tip { background: #f8fafc; border: 1px solid rgba(15,23,42,0.08); border-radius: 12px; padding: 14px; font-size: 13px; line-height: 1.6; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ TripCraft 出游容灾舱 · 多端同频与无人区无感保活交付样例</div>
    <h1>全地形自驾路书 · 离线交互快照</h1>
    <p style="color: #64748B; font-size: 14px;">9 天 1,280 km · 物理规则刚性防御引擎 · AST 状态已封存</p>
    <div class="day">
      <strong>D1 · 枢纽启程 & 车辆姿态智能自检</strong><br>
      <small style="color: #64748B;">全车整备 ➔ 地面专用宽位就绪 ➔ 道路拓扑自动计算</small>
    </div>
    <div class="day">
      <strong>D2 · 高地山海巡航 & 动力自适应配额</strong><br>
      <small style="color: #64748B;">连续弯道高程巡航 ➔ 制动热衰减防御 ➔ 黄金采光窗口打卡</small>
    </div>
    <div class="tip">
      <strong>[规则防护] BR-025 物理规则刚性防护：</strong>已完成车型外廓与老城地库限高通达断言，确保全地形探索安全无忧。
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TripCraft_数字化自驾路书_出游容灾舱样例.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };


  return (
    <section className="relative overflow-hidden pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-36 md:pb-24 paper-texture">
      {/* Decorative ambient lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[640px] w-[640px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.07),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(184,134,59,0.06),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-60 -left-10 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.05),transparent_70%)] blur-3xl"
      />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Vision & Headlines */}
          <div className="text-center lg:col-span-6 lg:text-left">
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-pill border border-blue-900/15 bg-blue-50/80 px-4 py-1.5 shadow-level-static backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-blue-950">
                次世代智能自驾协同中枢 · 多端实时云协同与容灾交付引擎
              </span>
            </motion.div>

            {/* Main Headline with generous line-height for Chinese reading rhythm */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-sans text-3xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-5xl xl:text-6xl leading-[1.28] sm:leading-[1.24] lg:leading-[1.2]"
            >
              让每一次自驾出行，
              <br />
              <span className="inline-block sm:whitespace-nowrap bg-gradient-to-r from-ink via-blue-950 to-blue-800 bg-clip-text text-transparent">
                都成为有温度的活路书。
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-pretty text-sm sm:text-base leading-relaxed text-ink-soft"
            >
              从大白话旅行诉求，到 AI 老定制师启发式多维推演；
              从全团微信免登协同愿望池，到车路云一体秒级流转与领队确认。
              多端实时云端同频，断网无感切换无人区离线舱，出游全程安心。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
            >
              <button
                onClick={() => scrollToSection('demo')}
                className="btn-primary min-h-[48px] px-8 text-sm font-semibold"
              >
                <span>体验路书诞生故事流</span>
                <span className="text-base">↓</span>
              </button>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-ink-soft lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 免登极速协同
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 工业级拓扑重算
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 车辆空间物理刚性断言
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600 font-bold">✓</span> 端云协同与数据隐私安全
              </span>
            </motion.div>
          </div>

          {/* Right Column: Modern Universal SaaS Roadbook Studio Canvas Preview */}
          <div className="flex justify-center lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full max-w-[500px]"
            >
              {/* Outer macOS Window Chrome */}
              <div className="glass-strong glass-sheen macos-window relative overflow-hidden rounded-container p-5 sm:p-6 shadow-level-float">
                {/* Window Title Bar */}
                <div className="flex items-center justify-between border-b border-ink/[0.08] pb-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F56]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FFBD2E]" />
                      <span className="h-2.5 w-2.5 rounded-full bg-[#27C93F]" />
                    </div>
                    <span className="ml-2 font-mono text-xs font-semibold text-ink">
                      TripCraft Studio
                    </span>
                    <span className="rounded-control bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-900 tabular-nums border border-blue-200/50">
                      v2.4
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-xs font-semibold text-emerald-600 tabular-nums">
                      云协同连接中 · 18ms
                    </span>
                  </div>
                </div>

                {/* Interactive Mode Tabs */}
                <div className="mt-3.5 flex items-center gap-1.5 rounded-control bg-sand/80 p-1" role="tablist" aria-label="Studio 交互模式切换">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'canvas'}
                    onClick={() => setActiveTab('canvas')}
                    className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-control px-2 py-2 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      activeTab === 'canvas'
                        ? 'bg-paper text-ink shadow-level-static ring-1 ring-blue-600/30'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <svg className={`h-3.5 w-3.5 ${activeTab === 'canvas' ? 'text-blue-900' : 'text-ink-soft'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                      <line x1="8" y1="2" x2="8" y2="18" />
                      <line x1="16" y1="6" x2="16" y2="22" />
                    </svg>
                    <span>路线画布</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'schedule'}
                    onClick={() => setActiveTab('schedule')}
                    className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-control px-2 py-2 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      activeTab === 'schedule'
                        ? 'bg-paper text-ink shadow-level-static ring-1 ring-blue-600/30'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <svg className={`h-3.5 w-3.5 ${activeTab === 'schedule' ? 'text-blue-900' : 'text-ink-soft'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>智能排期</span>
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'export'}
                    onClick={() => setActiveTab('export')}
                    className={`flex-1 flex min-h-[44px] items-center justify-center gap-1.5 rounded-control px-2 py-2 text-xs font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                      activeTab === 'export'
                        ? 'bg-paper text-ink shadow-level-static ring-1 ring-blue-600/30'
                        : 'text-ink-soft hover:text-ink'
                    }`}
                  >
                    <svg className={`h-3.5 w-3.5 ${activeTab === 'export' ? 'text-blue-900' : 'text-ink-soft'}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                      <line x1="12" y1="22.08" x2="12" y2="12" />
                    </svg>
                    <span>交付中枢</span>
                  </button>
                </div>

                {/* Tab Dynamic Content */}
                <div className="mt-4 min-h-[290px]">
                  <AnimatePresence mode="wait">
                    {activeTab === 'canvas' && (
                      <motion.div
                        key="canvas"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3.5"
                      >
                        {/* Canvas Header Metrics */}
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-card bg-sand/60 p-3.5 border border-ink/[0.08] shadow-level-static">
                          <div>
                            <p className="text-xs font-bold text-ink">
                              Grand Tour Pro · 全地形自驾方案
                            </p>
                            <p className="text-xs text-ink-soft">
                              工业级时序拓扑 · 动态物理安全约束
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <span className="rounded-pill bg-gold/10 px-3 py-1 font-mono text-xs font-bold text-gold-ink tabular-nums border border-gold/30">
                              1,280 km
                            </span>
                            <span className="rounded-pill bg-emerald-50 px-3 py-1 font-mono text-xs font-bold text-emerald-700 tabular-nums border border-emerald-200/60">
                              4 成员在线
                            </span>
                          </div>
                        </div>

                        {/* Interactive Route Topology Stages */}
                        <div className="space-y-2 rounded-card bg-paper p-3.5 border border-ink/[0.08] shadow-level-static">
                          {/* Node 1 */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-emerald-50 font-mono text-xs font-bold text-emerald-700 tabular-nums">
                              01
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-ink">
                                  城市枢纽启程 · 车辆自检
                                </span>
                                <span className="text-xs text-emerald-600 font-medium">✓ 已就绪</span>
                              </div>
                              <p className="text-xs text-ink-soft truncate">
                                能源充沛 100% · 地面专用车位就绪 · 避开老城限高
                              </p>
                            </div>
                          </div>

                          <div className="ml-3.5 h-3 w-px bg-ink/10" />

                          {/* Node 2 */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-gold/10 font-mono text-xs font-bold text-gold-ink tabular-nums">
                              02
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-ink">
                                  高程山隘巡航 · 动力编排
                                </span>
                                <span className="text-xs text-gold-ink font-medium">● 编排中</span>
                              </div>
                              <p className="text-xs text-ink-soft truncate">
                                连续坡道监控 · 制动降温窗口建议 · 动态高程补偿
                              </p>
                            </div>
                          </div>

                          <div className="ml-3.5 h-3 w-px bg-ink/10" />

                          {/* Node 3 */}
                          <div className="flex items-center gap-3">
                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-sand font-mono text-xs font-bold text-ink-soft tabular-nums">
                              03
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-ink">
                                  山海营地停泊 · 拓扑信标
                                </span>
                                <span className="text-xs text-ink-soft font-medium">已对齐</span>
                              </div>
                              <p className="text-xs text-ink-soft truncate">
                                矢量高保真沙盘 · 卫星坐标信标对齐 · 云端模型已对齐
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Real-time Collaborators Presence */}
                        <div className="flex items-center justify-between rounded-control bg-sand/60 px-3.5 py-2.5 border border-ink/[0.08] text-xs shadow-level-static">
                          <div className="flex items-center gap-2.5">
                            <div className="flex -space-x-1.5">
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs font-bold text-white ring-2 ring-white">
                                领
                              </span>
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 text-xs font-bold text-white ring-2 ring-white">
                                策
                              </span>
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold text-xs font-bold text-white ring-2 ring-white">
                                驾
                              </span>
                            </div>
                            <span className="text-xs text-ink-soft">
                              Alex 正在拖拽微调节点 #2 · <span className="font-mono font-bold text-gold-ink tabular-nums">14ms</span> 协同同频
                            </span>
                          </div>
                          <span className="font-mono text-xs font-semibold text-ink-soft">
                            RFC 6902
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'schedule' && (
                      <motion.div
                        key="schedule"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="rounded-card bg-paper p-3.5 border border-ink/[0.08] shadow-level-static space-y-2.5">
                          <div className="flex items-center justify-between border-b border-ink/[0.06] pb-2 text-xs">
                            <span className="font-bold text-ink">当日智能时间预算</span>
                            <span className="font-mono text-xs font-bold text-emerald-700 tabular-nums">
                              舒适度评级: 98%
                            </span>
                          </div>
                          <div className="space-y-2.5 text-xs">
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono text-xs font-bold text-ink-soft mt-0.5 tabular-nums">
                                08:30
                              </span>
                              <div>
                                <p className="font-semibold text-ink">启程预检与全车胎压核准</p>
                                <p className="text-xs text-ink-soft">避开早高峰，规划最优出城环线</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono text-xs font-bold text-ink-soft mt-0.5 tabular-nums">
                                12:15
                              </span>
                              <div>
                                <p className="font-semibold text-ink">高景驿站补给与驾驶员轮换</p>
                                <p className="text-xs text-ink-soft">地面宽敞停车位，避免高车顶箱倒车死角</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2.5">
                              <span className="font-mono text-xs font-bold text-ink-soft mt-0.5 tabular-nums">
                                16:45
                              </span>
                              <div>
                                <p className="font-semibold text-ink">黄金采光摄影窗口与营地停泊</p>
                                <p className="text-xs text-ink-soft">落日黄金光照窗口打卡，高保真矢量拓扑与车机流转</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-control bg-gold/10 p-3 border border-gold/30 text-xs text-gold-ink flex items-center justify-between shadow-level-static">
                          <span className="flex items-center gap-1.5">
                            <ClockIcon className="h-3.5 w-3.5 text-gold shrink-0" />
                            <span>今日自驾时长 <span className="font-mono font-bold tabular-nums">4.5h</span> · 驾驶疲劳风险指数极低</span>
                          </span>
                          <span className="font-bold">✓ 节奏适中</span>
                        </div>
                      </motion.div>
                    )}

                    {activeTab === 'export' && (
                      <motion.div
                        key="export"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-3"
                      >
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-card bg-paper p-3 sm:p-3.5 border border-ink/[0.08] shadow-level-static hover:shadow-level-hover transition-shadow flex flex-col items-center justify-center">
                            <FileTextIcon className="h-5 w-5 text-emerald-600" />
                            <div className="mt-1 font-bold text-ink text-xs">出游容灾舱</div>
                            <div className="mt-0.5 font-mono text-xs text-emerald-700 font-bold tabular-nums">
                              无人区就绪
                            </div>
                          </div>
                          <div className="rounded-card bg-paper p-3 sm:p-3.5 border border-ink/[0.08] shadow-level-static hover:shadow-level-hover transition-shadow flex flex-col items-center justify-center">
                            <CarIcon className="h-5 w-5 text-blue-600" />
                            <div className="mt-1 font-bold text-ink text-xs">Tier 0 车机</div>
                            <div className="mt-0.5 font-mono text-xs text-blue-600 font-bold tabular-nums">
                              HUD 免装深链
                            </div>
                          </div>
                          <div className="rounded-card bg-paper p-3 sm:p-3.5 border border-ink/[0.08] shadow-level-static hover:shadow-level-hover transition-shadow flex flex-col items-center justify-center">
                            <BookOpenIcon className="h-5 w-5 text-gold" />
                            <div className="mt-1 font-bold text-ink text-xs">A5 实体折页</div>
                            <div className="mt-0.5 font-mono text-xs text-gold-ink font-bold tabular-nums">
                              CMYK 双模
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleDownloadSample}
                          className="btn-primary w-full min-h-[46px] text-xs font-semibold flex items-center justify-center gap-2"
                        >
                          <ZapIcon className="h-3.5 w-3.5 text-white" />
                          <span>立即导出出游容灾舱 (.html)</span>
                        </button>

                        <p className="text-center text-xs text-ink-soft">
                          双击秒开 · 全要素离线封存 · 无信号区域无感保活守护
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Bottom Safety & Integrity Seal */}
                <div className="mt-3.5 flex items-center justify-between border-t border-ink/[0.08] pt-3 text-xs">
                  <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    BR-025 车辆物理空间通达校验通过
                  </span>
                  <span className="font-mono text-ink-soft">spec/trip.schema.json</span>
                </div>
              </div>

              {/* Floating Ambient Badges (Displayed on sm+ desktop screens, hidden on small mobile to prevent occluding window chrome) */}
              <div className="hidden sm:flex absolute sm:-top-4 sm:-right-4 rounded-pill border border-ink/[0.08] bg-paper/95 px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-level-float backdrop-blur-md ring-1 ring-ink/[0.04] z-20 items-center gap-1">
                <ZapIcon className="h-3 w-3 text-gold" />
                <span className="font-mono text-xs font-bold text-gold-ink tabular-nums">14ms</span>
                <span className="text-xs font-medium text-ink">毫秒级协同调度</span>
              </div>

              <div className="hidden sm:flex absolute sm:-bottom-4 sm:-left-4 rounded-pill border border-ink/[0.08] bg-paper/95 px-3 py-1 sm:px-3.5 sm:py-1.5 shadow-level-float backdrop-blur-md ring-1 ring-ink/[0.04] z-20 items-center gap-1">
                <ShieldIcon className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-xs font-medium text-ink">
                  多端实时同频 · 无人区无感守护
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
