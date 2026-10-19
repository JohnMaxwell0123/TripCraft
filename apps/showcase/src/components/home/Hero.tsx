'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageIcon,
  CompassIcon,
  UsersIcon,
  CheckIcon,
  SparklesIcon,
  BuildingIcon,
  SmartphoneIcon,
  TabletIcon,
  MonitorIcon,
} from '@/components/common/Icons';

interface PromptItem {
  tag: string;
  full: string;
}

// 推荐说法：口语化的需求，覆盖路径 A（自己开车）与路径 B（找旅行社）
const PROMPTS: PromptItem[] = [
  {
    tag: '川西家庭慢游（带长辈幼儿）',
    full: '带爸妈和4岁宝宝自驾川西环线6天，老人膝盖不好不能爬陡坡，想要不赶路的慢游路线',
  },
  {
    tag: '青甘大环线（想找旅行社）',
    full: '国庆一家5人想走青海甘肃大环线8天，不想自己开车，想找旅行社小包团，人均预算6000左右',
  },
  {
    tag: '独库公路与伊犁（拍雪山星空）',
    full: '4人自驾新疆独库公路加伊犁7天，想拍雪山和星空，沿途想吃地道的手抓饭和烤包子',
  },
];

type HeroTab = 'profile' | 'paths' | 'space';

const TABS: { id: HeroTab; label: string; short: string; Icon: typeof MessageIcon }[] = [
  { id: 'profile', label: '对话与需求画像', short: '需求画像', Icon: MessageIcon },
  { id: 'paths', label: '两条规划路径', short: '两条路径', Icon: CompassIcon },
  { id: 'space', label: '行程空间', short: '行程空间', Icon: UsersIcon },
];

export function Hero() {
  const [activeTab, setActiveTab] = useState<HeroTab>('profile');
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
        {/* 1. 顶部胶囊标牌：一句话定位 */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="unify-pill-badge mb-6 cursor-pointer hover:border-[#241E20]/25 transition-colors"
          onClick={() => scrollToSection('demo')}
        >
          <span className="flex h-2 w-2 shrink-0 rounded-full bg-[#FE3C01] animate-pulse" />
          <span className="text-xs font-medium text-[#241E20]">
            <span className="hidden sm:inline">TripCraft · 旅艺 · </span>多端同步、多人共享的 AI 旅行规划 App
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
          说出想去哪里，
          <br className="hidden sm:inline" />
          全家一起把行程
          <span className="relative inline-block text-[#FE3C01] ml-1 sm:ml-2">
            <span className="relative z-10">定下来</span>
            <span className="absolute inset-0 -m-3 bg-[#FE3C01]/25 blur-xl -z-1 rounded-full pointer-events-none" />
          </span>
        </motion.h1>

        {/* 3. 副标题：对话 → 追问 → 两条路径 → 共享同步 */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 max-w-2xl text-base sm:text-lg leading-relaxed text-[#625F61] font-normal"
        >
          像和 AI 聊天一样说出想法，它会追问几句帮你把需求想清楚，再给出两种方案：AI 规划的自驾路线，或按匹配度排好的持证旅行社线路。行程放进共享空间，家人朋友一起看、一起提意见，手机、平板、电脑实时同步。
        </motion.p>

        {/* 4. 对话输入栏 */}
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
                aria-label="用一句话描述你的出行需求"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder={PROMPTS[activePromptIndex].full}
                className="w-full min-w-0 bg-transparent text-sm sm:text-base text-[#241E20] placeholder-[#828081] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  if (!promptText) setPromptText(PROMPTS[activePromptIndex].full);
                  scrollToSection('demo');
                }}
                aria-label="开始对话规划"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-white hover:bg-[#FE3C01] transition-all"
                title="开始对话规划"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </div>

            {/* 推荐说法快捷标签 */}
            <div className="mt-2 pt-2 border-t border-[#E2E2D8] flex items-center gap-2 overflow-x-auto text-left px-2 py-1 scrollbar-none">
              <span className="text-xs font-medium text-[#625F61] whitespace-nowrap">试试这样说:</span>
              {PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setPromptText(p.full)}
                  className="whitespace-nowrap rounded-full bg-[#FFFFF9] px-2.5 py-1 text-xs text-[#241E20]/80 border border-[#E2E2D8] hover:border-[#FE3C01]/40 hover:text-[#FE3C01] transition-colors"
                >
                  {p.tag}
                </button>
              ))}
            </div>
            <p className="px-3 pt-1 pb-0.5 text-left text-xs text-[#828081]">
              默认使用平台模型，也可以换用你自己的模型 API
            </p>
          </div>
        </motion.div>

        {/* 5. 产品工作台三视图预览 */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 w-full max-w-[1200px] rounded-[16px] bg-[#FFFFFF] border border-[#E2E2D8] p-3 sm:p-5 shadow-[0_4px_24px_rgba(0,0,0,0.04)] overflow-hidden"
        >
          {/* 顶栏：视图切换与状态 */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 mb-3 border-b border-[#241E20]/[0.06] gap-2.5">
            <div
              role="tablist"
              aria-label="产品视图"
              className="flex w-full sm:w-auto rounded-full bg-[#241E20]/[0.04] p-1 border border-[#241E20]/[0.06] self-start sm:self-auto overflow-x-auto scrollbar-none"
            >
              {TABS.map(({ id, label, short, Icon }) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === id}
                  onClick={() => setActiveTab(id)}
                  className={`flex flex-1 sm:flex-none items-center justify-center gap-1.5 whitespace-nowrap px-3 sm:px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                    activeTab === id
                      ? 'bg-white text-[#241E20] shadow-sm font-semibold'
                      : 'text-[#6E6A67] hover:text-[#241E20]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0 text-[#FE3C01]" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden">{short}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-[#6E6A67]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>青甘大环线 · 一家 5 口 · 3 台设备已同步</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* 视图 1：对话与需求画像 */}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 lg:grid-cols-12 text-left"
              >
                {/* 左：对话 */}
                <div className="lg:col-span-6 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2">
                    <span className="font-bold text-[#241E20]">AI 对话</span>
                    <span className="text-[#625F61]">平台模型 · 第 2 轮追问</span>
                  </div>
                  <div className="self-end max-w-[88%] rounded-[12px] bg-[#241E20] text-white px-3 py-2 text-sm leading-relaxed">
                    国庆一家 5 口想走青海甘肃大环线，8 天左右，爸妈 60 多岁，还有个 4 岁的孩子。
                  </div>
                  <div className="self-start max-w-[88%] rounded-[12px] bg-white border border-[#E2E2D8] px-3 py-2 text-sm leading-relaxed text-[#241E20]">
                    明白。想先确认一件事：这趟是你们自己开车，还是希望找旅行社安排车和司机？
                  </div>
                  <div className="self-end max-w-[88%] rounded-[12px] bg-[#241E20] text-white px-3 py-2 text-sm leading-relaxed">
                    都想看看，自己开的话每天别超过 4 小时。
                  </div>
                  <p className="text-xs text-[#625F61]">每轮只问一个问题，最多三轮就整理成需求画像。</p>
                </div>

                {/* 右：需求画像 */}
                <div className="lg:col-span-6 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2 mb-3">
                      <span className="font-bold text-[#241E20]">需求画像</span>
                      <span className="text-[#625F61]">可随时修改</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <ProfileRow kind="硬约束" text="8 天左右 · 国庆出发 · 5 人（含 2 位长辈、1 名幼儿）" source="你说的" />
                      <ProfileRow kind="硬约束" text="自驾时每天车程不超过 4 小时" source="你说的" />
                      <ProfileRow kind="偏好" text="鸣沙山看日落、翡翠湖" source="你说的" />
                      <ProfileRow kind="偏好" text="景点步行少、少爬台阶" source="推断 · 待确认" inferred />
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-[#E2E2D8] flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-[#625F61]">需求画像已形成，可以选择规划路径</span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('paths')}
                      className="font-semibold text-[#FE3C01] hover:underline"
                    >
                      查看两条路径 →
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 视图 2：两条规划路径 */}
            {activeTab === 'paths' && (
              <motion.div
                key="paths"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 lg:grid-cols-2 text-left"
              >
                {/* 路径 A */}
                <div className="rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2 mb-3">
                      <span className="font-bold text-[#241E20]">路径 A · AI 规划自驾</span>
                      <span className="text-[#625F61]">8 天 · 约 1,280 km</span>
                    </div>
                    <div className="space-y-2.5">
                      <DayRow day="D1" title="西宁 → 日月山 → 青海湖" note="沿湖观景台 · 午饭黑马河手抓羊肉" km="约 152 km" />
                      <DayRow day="D2" title="茶卡盐湖 → 德令哈" note="盐湖栈道平缓 · 傍晚到达，不赶夜路" km="约 208 km" />
                      <DayRow day="D3" title="德令哈 → 大柴旦翡翠湖" note="沿途加油与补给点已标出" km="约 190 km" />
                    </div>
                  </div>
                  <p className="mt-3 pt-2.5 border-t border-[#E2E2D8] text-xs text-[#625F61] leading-relaxed">
                    景点与餐厅来自图商数据，AI 只做编排；车程为估算，实际行车请以车辆导航系统与现场交通标识为准。
                  </p>
                </div>

                {/* 路径 B */}
                <div className="rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2 mb-3">
                      <span className="font-bold text-[#241E20]">路径 B · 旅行社线路匹配</span>
                      <span className="text-[#625F61]">符合条件 6 条</span>
                    </div>
                    <div className="space-y-2.5">
                      <RouteRow
                        match={92}
                        title="青甘大环线 8 日 · 2 家庭小包团"
                        agency="西宁某持证旅行社"
                        reason="每天车程 ≤ 4 小时 · 含长辈幼儿适配说明"
                        price="¥5,880 起/人"
                      />
                      <RouteRow
                        match={85}
                        title="敦煌 · 张掖 · 青海湖 7 日"
                        agency="兰州某持证旅行社"
                        reason="少 1 天 · 翡翠湖不在线路内"
                        price="¥4,960 起/人"
                      />
                    </div>
                  </div>
                  <p className="mt-3 pt-2.5 border-t border-[#E2E2D8] text-xs text-[#625F61] leading-relaxed">
                    以上线路由持证旅行社提供；匹配度为信息参考，预估价以旅行社正式报价与合同为准。
                  </p>
                </div>
              </motion.div>
            )}

            {/* 视图 3：行程空间 */}
            {activeTab === 'space' && (
              <motion.div
                key="space"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="grid gap-4 lg:grid-cols-12 text-left"
              >
                {/* 左：提名 */}
                <div className="lg:col-span-7 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4">
                  <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2 mb-3">
                    <span className="font-bold text-[#241E20]">大家的提名</span>
                    <span className="text-[#625F61]">通过邀请链接加入 · 5 人</span>
                  </div>
                  <div className="space-y-2.5">
                    <NominationRow who="小林" place="鸣沙山骑骆驼看日落" note="顺路 · 建议放在 D5 傍晚" status="已采纳" ok />
                    <NominationRow who="张阿姨" place="塔尔寺" note="需多住西宁一晚" status="待领队确认" />
                    <NominationRow who="王叔" place="祁连山草原骑马" note="绕行约 2 小时 · 孩子年龄偏小" status="待领队确认" />
                  </div>
                  <p className="mt-3 text-xs text-[#625F61]">
                    平台只负责把意见收齐、标出冲突，由领队拍板，不做多数投票。
                  </p>
                </div>

                {/* 右：多端同步 */}
                <div className="lg:col-span-5 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-xs border-b border-[#E2E2D8] pb-2 mb-3">
                      <span className="font-bold text-[#241E20]">多端同步</span>
                      <span className="text-emerald-700 font-medium">已是最新</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <DeviceRow Icon={SmartphoneIcon} name="领队的手机" time="刚刚" />
                      <DeviceRow Icon={TabletIcon} name="爸妈的平板" time="1 分钟前" />
                      <DeviceRow Icon={MonitorIcon} name="家里的电脑" time="3 分钟前" />
                    </div>
                  </div>
                  <p className="mt-3 pt-2.5 border-t border-[#E2E2D8] text-xs text-[#625F61] leading-relaxed">
                    没信号的路段，已同步的行程照常可读；出发前也可以把全天途经点交给车机导航。
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* 底部：C 端与 B 端入口 */}
          <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-[#241E20]/[0.06] pt-3 text-xs text-[#6E6A67] gap-2">
            <span className="flex items-center gap-1.5 text-[#241E20] font-medium">
              <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-[#FE3C01]" />
              <span>对话说需求 · 两条规划路径 · 多人共享 · 多端同步</span>
            </span>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <button
                type="button"
                onClick={() => scrollToSection('demo')}
                className="font-semibold text-[#FE3C01] hover:underline"
              >
                看旅客完整流程 →
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('agency')}
                className="inline-flex items-center gap-1 font-semibold text-[#241E20] hover:text-[#FE3C01]"
              >
                <BuildingIcon className="h-3.5 w-3.5" />
                旅行社线路工作室 →
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProfileRow({ kind, text, source, inferred }: { kind: string; text: string; source: string; inferred?: boolean }) {
  return (
    <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-start gap-2.5 shadow-sm">
      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
          kind === '硬约束' ? 'bg-[#241E20] text-white' : 'bg-[#FE3C01]/10 text-[#B42D00]'
        }`}
      >
        {kind}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[#241E20] leading-snug">{text}</div>
        <div className={`mt-0.5 text-xs ${inferred ? 'text-amber-700 font-medium' : 'text-[#625F61]'}`}>{source}</div>
      </div>
    </div>
  );
}

function DayRow({ day, title, note, km }: { day: string; title: string; note: string; km: string }) {
  return (
    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#FE3C01]">{day}</span>
          <span className="text-sm font-semibold text-[#241E20]">{title}</span>
        </div>
        <p className="text-xs text-[#625F61] mt-1">{note}</p>
      </div>
      <span className="shrink-0 whitespace-nowrap text-xs px-2 py-0.5 rounded-full bg-[#241E20]/[0.05] text-[#625F61]">{km}</span>
    </div>
  );
}

function RouteRow({
  match,
  title,
  agency,
  reason,
  price,
}: {
  match: number;
  title: string;
  agency: string;
  reason: string;
  price: string;
}) {
  return (
    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start gap-3">
      <div className="shrink-0 flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 border-[#FE3C01]/70 text-[#241E20]">
        <span className="text-sm font-bold leading-none">{match}%</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#241E20]">{title}</div>
        <div className="mt-0.5 text-xs text-[#625F61]">{agency} · {reason}</div>
        <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[#241E20]">
            预估价 <strong className="font-semibold">{price}</strong>
            <span className="text-[#625F61]">（以旅行社正式报价为准）</span>
          </span>
          <span className="font-semibold text-[#FE3C01]">向旅行社咨询</span>
        </div>
      </div>
    </div>
  );
}

function NominationRow({ who, place, note, status, ok }: { who: string; place: string; note: string; status: string; ok?: boolean }) {
  return (
    <div className="rounded-[12px] bg-white p-3 border border-[#E2E2D8] shadow-sm flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5 min-w-0">
        <span className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full bg-[#241E20]/[0.06] text-xs font-semibold text-[#241E20]">
          {who.slice(0, 1)}
        </span>
        <div className="min-w-0">
          <div className="text-sm text-[#241E20]">
            <span className="font-semibold">{place}</span>
            <span className="text-[#625F61]"> · {who}提名</span>
          </div>
          <div className="text-xs text-[#625F61] mt-0.5">{note}</div>
        </div>
      </div>
      <span
        className={`shrink-0 whitespace-nowrap text-xs font-medium px-2 py-0.5 rounded-full ${
          ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function DeviceRow({ Icon, name, time }: { Icon: typeof SmartphoneIcon; name: string; time: string }) {
  return (
    <div className="rounded-[12px] bg-white p-2.5 border border-[#E2E2D8] flex items-center gap-2.5 shadow-sm">
      <Icon className="h-4 w-4 shrink-0 text-[#241E20]" />
      <span className="flex-1 text-[#241E20]">{name}</span>
      <span className="flex items-center gap-1 text-xs text-emerald-700">
        <CheckIcon className="h-3.5 w-3.5" />
        {time}
      </span>
    </div>
  );
}
