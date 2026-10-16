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
  FileTextIcon,
  BookOpenIcon,
  ZapIcon,
  ElderIcon,
  BabyIcon,
  SunsetIcon,
} from '@/components/common/Icons';

interface PromptItem {
  tag: string;
  full: string;
}

const PROMPTS: PromptItem[] = [
  {
    tag: '川西家庭慢游（带长辈幼儿）',
    full: '带爸妈和4岁宝宝自驾川西环线6天，租腾势D9带车顶行李箱，老人膝盖不好不能爬陡坡，求不赶路的慢游路线',
  },
  {
    tag: '青甘丝路大环线（摄影避坑）',
    full: '国庆全家5人首刷青海甘肃大环线8天，想去翡翠湖航拍和鸣沙山看日落，避开老城限高地库和暗冰烂路',
  },
  {
    tag: '独库公路与伊犁（全地形自驾）',
    full: '4人自驾新疆独库公路加伊犁7天，开越野车想拍雪山日照金山和星空，需要精准避开封路涵洞并离线保活',
  },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState<'canvas' | 'schedule' | 'export'>('canvas');
  const [promptText, setPromptText] = useState('');
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  // 轮流切换输入框占位符
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % PROMPTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = typeof window !== 'undefined' && window.innerWidth >= 768 ? 80 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
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
    :root { --sand: #FFFFF9; --ink: #241E20; --accent: #FE3C01; --paper: #FFFFFF; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--sand); color: var(--ink); padding: 32px 20px; }
    .card { background: var(--paper); border: 1px solid rgba(36,30,32,0.1); border-radius: 12px; padding: 28px; max-width: 640px; margin: 0 auto; box-shadow: 0 4px 20px rgba(36,30,32,0.06); }
    h1 { font-size: 24px; font-weight: 700; color: var(--ink); margin-top: 0; font-family: Georgia, serif; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(254,60,1,0.1); color: var(--accent); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .day { border-left: 3px solid var(--accent); padding-left: 14px; margin-bottom: 18px; }
    .tip { background: #faf8f5; border: 1px solid rgba(36,30,32,0.08); border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ TripCraft 出游容灾舱 · 自包含离线保活样例</div>
    <h1>青甘大环线 · 8日全地形自驾路书</h1>
    <p style="color: #6E6A67; font-size: 14px;">8 天 1,280 km · 2.28m 车高与高程安全守护 · 离线状态已封存</p>
    <div class="day">
      <strong>D1 · 西宁 ➔ 日月山 ➔ 青海湖黑马河</strong><br>
      <small style="color: #6E6A67;">全车整备 ➔ 2.0m 限高地库规避 ➔ 3,200m 海拔平缓适应</small>
    </div>
    <div class="day">
      <strong>D2 · 茶卡盐湖 ➔ 德令哈 ➔ 大柴旦翡翠湖</strong><br>
      <small style="color: #6E6A67;">微信愿望池航拍打卡点 ➔ 安排供氧地暖酒店 ➔ 避开暗冰烂路</small>
    </div>
    <div class="tip">
      <strong>[安全防护] 物理规则引擎：</strong>已核验腾势 D9 顶装行李箱总高 2.28m 与沿线涵洞净空，确保全地形探索安全无虞。
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TripCraft_数字化自驾路书_离线单文件样例.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-24 bg-[#FFFFF9]">
      {/* 极简背景微光网格与光晕 */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[720px] w-[900px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(254,60,1,0.045),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-0 h-[480px] w-[480px] rounded-full bg-[radial-gradient(circle,rgba(212,160,78,0.035),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* 1. 顶部纯中文胶囊标牌 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="unify-pill-badge mb-6 cursor-pointer hover:border-[#241E20]/25 transition-colors"
          onClick={() => scrollToSection('demo')}
        >
          <span className="flex h-2 w-2 rounded-full bg-[#FE3C01] animate-pulse" />
          <span className="text-xs font-medium text-[#241E20]">
            TripCraft · 旅艺 2.0 · 面向高品质自驾的智能协同中枢
          </span>
          <span className="text-xs text-[#241E20]/40">→</span>
        </motion.div>

        {/* 2. Unify Display Serif 高对比度编辑部大标题 + 烈焰光晕 */}
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="font-serif text-[40px] sm:text-[54px] lg:text-[68px] font-bold tracking-[-0.035em] leading-[1.08] sm:leading-[1.05] text-[#241E20] max-w-4xl"
        >
          让每一次自驾出行，
          <br className="hidden sm:inline" />
          都成为有温度的
          <span className="relative inline-block text-[#FE3C01] ml-1 sm:ml-2">
            <span className="relative z-10">活路书</span>
            <span className="absolute inset-0 -m-3 bg-[#FE3C01]/25 blur-xl -z-1 rounded-full pointer-events-none" />
          </span>
        </motion.h1>

        {/* 3. 纯中文副标题 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#625F61] font-normal"
        >
          告别繁复碎片攻略与出行焦虑。从自然语言倾诉提取全家偏好，到亲友微信免登实时协同；从车道级领航避障，到无人区断网秒开的随身安全舱。
        </motion.p>

        {/* 4. 核心搜索与自然意图输入栏 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 w-full max-w-3xl"
        >
          {/* 输入框外壳：严格 16px 外壳与 1px 发丝线 */}
          <div className="relative rounded-[16px] bg-white border border-[#E2E2D8] p-2 sm:p-3 shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all focus-within:border-[#FE3C01] focus-within:ring-2 focus-within:ring-[#FE3C01]/20">
            <div className="flex items-center gap-3 px-3 py-1.5">
              <span className="text-[#FE3C01] font-serif text-lg select-none">✦</span>
              <input
                id="hero-prompt-input"
                name="prompt"
                type="text"
                aria-label="自驾规划与车道级领航诉求"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={PROMPTS[activePromptIndex].full}
                className="w-full bg-transparent text-sm sm:text-base text-[#241E20] placeholder-[#828081] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!promptText) setPromptText(PROMPTS[activePromptIndex].full);
                  scrollToSection('demo');
                }}
                aria-label="生成自驾路书方案"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-white hover:bg-[#FE3C01] transition-all"
                title="开启智能编排"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* 真实自驾推荐意图快捷选择标签 */}
            <div className="mt-2 pt-2 border-t border-[#E2E2D8] flex items-center gap-2 overflow-x-auto text-left px-2 py-1 scrollbar-none">
              <span className="text-[11px] font-medium text-[#625F61] whitespace-nowrap">推荐意图:</span>
              {PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(p.full)}
                  className="whitespace-nowrap rounded-full bg-[#FFFFF9] px-2.5 py-1 text-[11px] text-[#241E20]/80 border border-[#E2E2D8] hover:border-[#FE3C01]/40 hover:text-[#FE3C01] transition-colors"
                >
                  {p.tag}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* 5. 高保真工作台三模态交互视窗 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 w-full max-w-[1200px] rounded-[16px] bg-[#FFFFFF] border border-[#E2E2D8] p-3 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* 顶栏：模式切换与状态 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-[#241E20]/[0.06] gap-2.5">
            {/* 三模态切换胶囊 */}
            <div className="inline-flex rounded-full bg-[#241E20]/[0.04] p-1 border border-[#241E20]/[0.06] self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('canvas')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'canvas'
                    ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                    : 'text-[#6E6A67] hover:text-[#241E20]'
                }`}
              >
                <CompassIcon className="w-3.5 h-3.5 text-[#FE3C01]" />
                <span>路线全景画布</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('schedule')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'schedule'
                    ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                    : 'text-[#6E6A67] hover:text-[#241E20]'
                }`}
              >
                <ClockIcon className="w-3.5 h-3.5 text-blue-600" />
                <span>智能排期预算</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('export')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  activeTab === 'export'
                    ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                    : 'text-[#6E6A67] hover:text-[#241E20]'
                }`}
              >
                <FileTextIcon className="w-3.5 h-3.5 text-emerald-600" />
                <span>出游容灾交付</span>
              </button>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#6E6A67]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>全项物理规则校验通过</span>
              <span className="text-black/20">|</span>
              <span className="font-mono text-emerald-700 font-semibold">100% 本地自包含</span>
            </div>
          </div>

          {/* 模态内容区域 */}
          <AnimatePresence mode="wait">
            {/* 模态 1: 路线全景画布 */}
            {activeTab === 'canvas' && (
              <motion.div
                key="canvas"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 lg:grid-cols-12 text-left"
              >
                {/* 左 4 列: 行程概况与风控规则 */}
                <div className="lg:col-span-5 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 border-b border-[#E2E2D8] pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-[5px] bg-[#241E20] text-white flex items-center justify-center text-[10px] font-bold">
                          旅
                        </div>
                        <span className="text-xs font-bold text-[#241E20]">青海甘肃大环线 · 8日深度游</span>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-medium px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
                        8天 1,280km
                      </span>
                    </div>

                    <p className="text-xs text-[#625F61] leading-relaxed mb-3">
                      全家 5 人出行，含长辈与幼儿。车型为腾势 D9（加装车顶行李箱，总高 2.28m）。
                    </p>

                    {/* 4 项刚性防御规则 */}
                    <div className="space-y-2">
                      <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-center gap-2.5 text-xs shadow-sm">
                        <ElderIcon className="w-4 h-4 text-amber-600 shrink-0" />
                        <div>
                          <div className="font-medium text-[#241E20]">长辈膝关节风控</div>
                          <div className="text-[11px] text-[#625F61]">单次步行≤500m · 规避高陡台阶</div>
                        </div>
                      </div>

                      <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-center gap-2.5 text-xs shadow-sm">
                        <BabyIcon className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <div className="font-medium text-[#241E20]">幼儿作息避暑</div>
                          <div className="text-[11px] text-[#625F61]">13:00–14:30 午休静止期</div>
                        </div>
                      </div>

                      <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-center gap-2.5 text-xs shadow-sm">
                        <CarIcon className="w-4 h-4 text-blue-600 shrink-0" />
                        <div>
                          <div className="font-medium text-[#241E20]">物理限高避让</div>
                          <div className="text-[11px] text-[#625F61]">整车总高 2.28m · 避让 2.0m 限高地库</div>
                        </div>
                      </div>

                      <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-center gap-2.5 text-xs shadow-sm">
                        <SunsetIcon className="w-4 h-4 text-purple-600 shrink-0" />
                        <div>
                          <div className="font-medium text-[#241E20]">鸣沙山黄金采光</div>
                          <div className="text-[11px] text-[#625F61]">锁定 19:30 落日驼队机位</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E2E2D8] flex items-center justify-between text-[11px]">
                    <span className="text-[#625F61]">风控合规评级：</span>
                    <span className="font-semibold text-emerald-700">A+ 绝对安全通达</span>
                  </div>
                </div>

                {/* 右 7 列: 真实途经点走廊预览 */}
                <div className="lg:col-span-7 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3 text-xs">
                      <span className="font-bold text-[#241E20]">沿线关键走廊与驻泊点</span>
                      <span className="text-[11px] text-[#625F61]">西宁 ➔ 德令哈 ➔ 敦煌 ➔ 张掖</span>
                    </div>

                    <div className="space-y-2.5">
                      <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#FE3C01]">D1</span>
                            <span className="text-xs font-semibold text-[#241E20]">西宁 ➔ 日月山 ➔ 青海湖</span>
                          </div>
                          <p className="text-[11px] text-[#625F61] mt-1">
                            全车整备 ➔ 地面专用宽车位 ➔ 海拔 3,200m 平缓过渡
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">152 km</span>
                      </div>

                      <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#FE3C01]">D2</span>
                            <span className="text-xs font-semibold text-[#241E20]">茶卡盐湖 ➔ 德令哈 ➔ 大柴旦</span>
                          </div>
                          <p className="text-[11px] text-[#625F61] mt-1">
                            微信愿望池推荐 ➔ 大柴旦翡翠湖航拍 ➔ 入住供氧地暖酒店
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">208 km</span>
                      </div>

                      <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#FE3C01]">D3</span>
                            <span className="text-xs font-semibold text-[#241E20]">南八仙雅丹 ➔ 鸣沙山月牙泉</span>
                          </div>
                          <p className="text-[11px] text-[#625F61] mt-1">
                            规避施工限高走廊 ➔ 锁定落日机位 ➔ 驻车步行接力
                          </p>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-mono">245 km</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E2E2D8] flex items-center justify-between text-xs">
                    <span className="text-[#625F61] flex items-center gap-1.5">
                      <SparklesIcon className="w-3.5 h-3.5 text-[#FE3C01]" />
                      <span>全团同频：微信免登直连 · 副驾与领队实时共享</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => scrollToSection('demo')}
                      className="text-xs font-semibold text-[#FE3C01] hover:underline"
                    >
                      查看动态演进 →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 模态 2: 智能排期预算 */}
            {activeTab === 'schedule' && (
              <motion.div
                key="schedule"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 text-left"
              >
                <div className="rounded-[12px] bg-[#F4F4EE] p-4 border border-[#E2E2D8] shadow-sm space-y-3">
                  <div className="flex items-center justify-between border-b border-[#E2E2D8] pb-2 text-xs">
                    <span className="font-bold text-[#241E20]">全天智能时间预算与节奏分析</span>
                    <span className="font-mono text-xs font-bold text-emerald-700">
                      舒适度指数: 98%
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8]">
                      <div className="font-mono text-xs font-bold text-[#FE3C01]">08:30</div>
                      <p className="font-semibold text-[#241E20] mt-1">启程预检与全车胎压核准</p>
                      <p className="text-[11px] text-[#625F61] mt-0.5">避开早高峰，规划最优出城高架</p>
                    </div>

                    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8]">
                      <div className="font-mono text-xs font-bold text-[#FE3C01]">12:15</div>
                      <p className="font-semibold text-[#241E20] mt-1">高景驿站补给与驾驶员轮换</p>
                      <p className="text-[11px] text-[#625F61] mt-0.5">地面宽位停车，避免车顶箱倒车盲区</p>
                    </div>

                    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8]">
                      <div className="font-mono text-xs font-bold text-[#FE3C01]">16:45</div>
                      <p className="font-semibold text-[#241E20] mt-1">黄金采光摄影窗口与营地停泊</p>
                      <p className="text-[11px] text-[#625F61] mt-0.5">落日黄金光照打卡，车机同频流转</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[12px] bg-amber-500/10 p-3 border border-amber-500/20 text-xs text-amber-900 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <ClockIcon className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>今日自驾时长 <strong className="font-mono">4.5h</strong> · 驾驶疲劳风险极低 · 老人幼儿作息充分保障</span>
                  </span>
                  <span className="font-bold text-emerald-700">✓ 节奏适中</span>
                </div>
              </motion.div>
            )}

            {/* 模态 3: 出游容灾交付 */}
            {activeTab === 'export' && (
              <motion.div
                key="export"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 text-left"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-[12px] bg-[#F4F4EE] p-4 border border-[#E2E2D8] shadow-sm flex flex-col items-center justify-center">
                    <FileTextIcon className="h-6 w-6 text-emerald-600" />
                    <div className="mt-2 font-bold text-[#241E20]">出游容灾安全舱</div>
                    <div className="mt-0.5 text-[11px] text-emerald-700 font-medium">
                      1.2MB 单文件 · 双击秒开
                    </div>
                  </div>

                  <div className="rounded-[12px] bg-[#F4F4EE] p-4 border border-[#E2E2D8] shadow-sm flex flex-col items-center justify-center">
                    <CarIcon className="h-6 w-6 text-blue-600" />
                    <div className="mt-2 font-bold text-[#241E20]">车机原生深链唤醒</div>
                    <div className="mt-0.5 text-[11px] text-blue-700 font-medium">
                      中控大屏与抬显秒级流转
                    </div>
                  </div>

                  <div className="rounded-[12px] bg-[#F4F4EE] p-4 border border-[#E2E2D8] shadow-sm flex flex-col items-center justify-center">
                    <BookOpenIcon className="h-6 w-6 text-amber-600" />
                    <div className="mt-2 font-bold text-[#241E20]">A5 纸电双模折页</div>
                    <div className="mt-0.5 text-[11px] text-amber-700 font-medium">
                      符合印刷标准的实体路书
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadSample}
                    className="w-full sm:w-auto inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[5px] bg-[#241E20] px-8 text-xs font-semibold text-white hover:bg-[#FE3C01] transition-all shadow-md active:scale-95"
                  >
                    <ZapIcon className="h-4 w-4 text-white" />
                    <span>立即下载出游容灾舱样例 (.html)</span>
                  </button>
                  <p className="text-xs text-[#625F61] text-center sm:text-left">
                    零依赖自包含 · 断网飞行模式依然完整可查 · 数据主权永存本地
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 底部出行守护承诺条 */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between border-t border-[#241E20]/[0.06] pt-3 text-xs text-[#6E6A67] gap-2">
            <span className="flex items-center gap-1.5 text-emerald-700 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              全链路安心守护：亲友微信免登同频 · 2.28m 车高智能避障 · 无人区断网秒开
            </span>
            <span className="text-[#6E6A67]/60">青海甘肃自驾路线标准已装载</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
