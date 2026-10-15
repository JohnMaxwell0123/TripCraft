'use client';

import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useVisibility, ease } from '@/lib/motion';
import { T } from './timeline';
import { Pop, Reveal, useProgress } from './primitives';
import {
  ElderIcon,
  BabyIcon,
  CarIcon,
  SunsetIcon,
  ZapIcon,
  BrainIcon,
  KeyIcon,
  CheckIcon,
  SparklesIcon,
  SlidersIcon,
  ShieldIcon,
} from '@/components/common/Icons';

const USER_TEXT =
  '全家 5 口人自驾甘肃，带 70 岁爷爷和 4 岁小孩，租腾势 D9（加装车顶箱总高 2.28m）。老人膝盖术后不能爬高楼梯；孩子每天要午休。想去莫高窟、鸣沙山看日落，千万别太赶。';

const CONSTRAINTS = [
  {
    Icon: ElderIcon,
    title: '70 岁长辈 · 膝关节风控',
    type: '刚性安全规则',
    note: '规避高长台阶 · 单次步行 ≤ 500m',
    ring: 'ring-gold/50',
    iconColor: 'text-gold-ink',
  },
  {
    Icon: BabyIcon,
    title: '4 岁幼儿 · 作息节律',
    type: '刚性安全规则',
    note: '13:00–14:30 午休静止期 · 防中暑',
    ring: 'ring-ochre/50',
    iconColor: 'text-ochre',
  },
  {
    Icon: CarIcon,
    title: '7座 MPV · 腾势 D9 轮廓',
    type: '刚性物理限高',
    note: '车高 2.28m (车顶箱) · 避让 2.0m 地库',
    ring: 'ring-lapis/40',
    iconColor: 'text-lapis',
  },
  {
    Icon: SunsetIcon,
    title: '鸣沙山月牙泉 · 摄影机位',
    type: '柔性景观偏好',
    note: '锁定 19:30 黄金日落窗口',
    ring: 'ring-rose-500/50',
    iconColor: 'text-rose-600',
  },
];

export function ChatScene() {
  const p = useProgress();
  const opacity = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0]);
  const x = useRange(p, [T.chatOut[0], T.chatOut[1]], [0, -36], { rest: 0 });
  const scale = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0.98], { rest: 1 });
  const pointerEvents = useTransform(p, (v) => (v >= T.chatOut[1] ? 'none' : 'auto'));
  const visibility = useVisibility(p, 0, T.chatOut[1] + 0.005);

  return (
    <motion.section
      aria-label="TripCraft AI 意图解析与思维链推理工作台"
      className="absolute inset-0 flex gap-4 lg:gap-6 p-3.5 sm:p-5 md:p-6 gpu-layer overflow-hidden bg-[#FAF8F5]/90 text-left select-none"
      style={{ opacity, x, scale, pointerEvents, visibility }}
    >
      {/* 左侧主视界：Prompt 输入胶囊 + Unify 标志性层级思维链推理树 */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 顶部助手引擎状态条 (无折行，清晰稳重) */}
        <AssistantStatusBar />

        {/* 移动端紧凑规则标签 */}
        <MobileChips />

        {/* 核心推理区：顶部 Prompt 胶囊 + 下方思维链执行树 (完全对齐 Unify 图2) */}
        <ReasoningCanvas />
      </div>

      {/* 右侧：路书 AST 约束规则检查器 (结构化形式化契约) */}
      <ConstraintPanel />
    </motion.section>
  );
}

/* ── AI 助手引擎顶栏 (单行自适应，彻底杜绝文本堆叠重叠与截断) ── */
function AssistantStatusBar() {
  const p = useProgress();
  const lit = useFade(p, T.modelLit[0], T.modelLit[1]);

  return (
    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-ink/[0.08] shrink-0">
      <div className="flex items-center gap-2 text-xs text-ink min-w-0">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-control bg-gold/15 text-gold-ink">
          <SparklesIcon className="h-3 w-3" />
        </span>
        <span className="font-semibold text-xs tracking-tight text-[#241E20] whitespace-nowrap">
          路线架构师引擎
        </span>
        <span className="text-[10px] text-ink-soft hidden sm:inline font-mono whitespace-nowrap">
          · 意图解析与物理规则推演
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="relative chip bg-paper text-ink ring-1 ring-ink/10 text-[10px] sm:text-[11px] py-0.5 px-2 font-mono">
          <motion.span className="absolute inset-0 rounded-full shadow-glow" style={{ opacity: lit }} />
          <span className="relative flex items-center gap-1">
            <ZapIcon className="h-2.5 w-2.5 text-gold shrink-0" />
            <span className="font-semibold">思维链引擎</span>
          </span>
        </span>
        <span className="chip hidden bg-ink/[0.03] text-ink-soft md:inline-flex items-center gap-1 text-[10px] py-0.5 px-2 font-mono">
          <KeyIcon className="h-2.5 w-2.5 text-ink-soft shrink-0" />
          <span>端侧隐私</span>
        </span>
      </div>
    </div>
  );
}

function MobileChips() {
  return (
    <div className="flex flex-wrap gap-1 pb-2 md:hidden">
      {CONSTRAINTS.map((c, i) => (
        <Pop key={c.title} at={T.chips[i]}>
          <span className={`chip bg-paper text-ink ring-1 ${c.ring} text-[10px] px-2 py-0.5`}>
            <c.Icon className={`h-2.5 w-2.5 inline mr-1 ${c.iconColor}`} />
            {c.title.split('·')[0]}
          </span>
        </Pop>
      ))}
    </div>
  );
}

/* ── 核心推理画布：Prompt 胶囊 + Unify 标志性思维链层级推理树 ── */
function ReasoningCanvas() {
  const p = useProgress();

  // 首帧即有内容，彻底杜绝白屏等待感 (0.00~0.015 优雅入场)
  const promptOpacity = useRange(p, [0, 0.012], [0.8, 1]);
  const promptY = useRange(p, [0, 0.012], [8, 0], { easing: ease.out, rest: 0 });

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3.5">
      {/* 1. 顶部 Prompt 提示词卡片 (对齐 Unify 图2 右上角 Prompt 胶囊) */}
      <motion.div
        className="relative ml-auto max-w-[96%] sm:max-w-[90%] rounded-2xl bg-[#F4F0E8] border border-ink/[0.08] p-3 sm:p-3.5 shadow-sm text-left"
        style={{ opacity: promptOpacity, y: promptY }}
      >
        <div className="text-[10px] text-ink-soft mb-1 font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FE3C01] animate-pulse" />
          <span>自然语言出行诉求输入 (User Prompt)</span>
        </div>
        <p className="text-xs sm:text-[13px] text-[#241E20] leading-relaxed font-sans font-medium">
          {USER_TEXT}
        </p>

        {/* Unify 标志性黑晶演示指针 (对齐图2光标) */}
        <div className="absolute -bottom-2 -right-1.5 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#241E20" stroke="#FAF8F5" strokeWidth="1.2">
            <path d="M4 2.5 L19.5 12 L12.4 13.6 L9 20.5 Z" />
          </svg>
        </div>
      </motion.div>

      {/* 2. Unify 标志性层级思维链推理树 (Chain of Thought Execution Tree) */}
      <div className="relative pl-6 space-y-3.5 pt-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-ink/15">
        
        {/* Step 1: 意图抽取与全要素结构化 (0.018 ~ 0.038) */}
        <Reveal at={[0.018, 0.038]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-paper border border-ink/30 flex items-center justify-center text-[9px] text-ink font-mono font-bold shadow-sm">
            1
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-[#FE3C01]" />
              <span>全家同行画像与车型轮廓语义解构</span>
            </span>
            <span className="text-[10px] font-mono text-ink-soft">0.4s · 完成</span>
          </div>
          <div className="mt-1.5 pl-5 space-y-1 text-[11px] text-ink-soft font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-[#FE3C01]">•</span>
              <span>提取适老适幼红线：70 岁膝盖术后 (单次步行 ≤500m) + 4 岁幼儿 13:00–14:30 午休</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#FE3C01]">•</span>
              <span>标定车辆物理轮廓：腾势 D9 顶装行李箱，整车总高 2.28m (避让 2.0m 地库)</span>
            </div>
          </div>
        </Reveal>

        {/* Step 2: 空间时空规则交叉核验与刚性风控拦截 (0.05 ~ 0.075) */}
        <Reveal at={[0.05, 0.075]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-[#FE3C01]/15 border border-[#FE3C01]/50 flex items-center justify-center text-[9px] text-[#FE3C01] font-mono font-bold shadow-sm">
            2
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>交叉比对莫高窟洞窟动线与高程爬升阶数</span>
            </span>
            <span className="text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              1.2s · 触发安全防御
            </span>
          </div>
          <div className="mt-1.5 pl-5 space-y-2 text-[11px] text-ink-soft font-sans">
            <p className="text-ink leading-relaxed">
              核验莫高窟常规动线：需爬升悬空高架栈道 (阶梯 &gt; 120 阶)，触发长辈膝关节风控刚性拦截。
            </p>
            {/* 动态执行重排调度 (对齐 Unify 图2 中的 Spinning Task 任务胶囊) */}
            <div className="flex items-center gap-2 text-xs font-medium text-[#C43200] bg-[#FFF5ED] border border-[#FE3C01]/30 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="w-3 h-3 border-2 border-[#FE3C01] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>自动优化重排：预约特种无障碍摆渡车，锁定 4 处平层特窟慢游方案</span>
            </div>
          </div>
        </Reveal>

        {/* Step 3: AST 拓扑契约写入与 1,980km 日程锁死 (0.095 ~ 0.125) */}
        <Reveal at={[0.095, 0.125]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[9px] text-emerald-800 font-mono font-bold shadow-sm">
            3
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>写入形式化契约与 1,980km 全地形日程大纲</span>
            </span>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              2.0s · 契约锁死
            </span>
          </div>
          <div className="mt-1.5 pl-5 space-y-1 text-[11px] text-ink-soft font-mono">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>鸣沙山月牙泉锁定 19:30 黄金日落窗口，避开正午烈日高温与强紫外线</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>老城 2.0m 限高路段刚性截断，预先为 2.28m MPV 分配地面宽位专属车位</span>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}

/* ── 右侧：路书 AST 约束规则检查器 (Constraints Rule Inspector) ── */
function ConstraintPanel() {
  const p = useProgress();
  // 面板常驻呈现，随场景淡出 (彻底杜绝首帧空白)
  const panel = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0]);
  // 四条刚性规则跟随左侧思维链 1、2、3 步依次点亮解析
  const RULE_TIMES = [0.025, 0.055, 0.085, 0.115];

  return (
    <motion.aside className="hidden w-[38%] max-w-[340px] flex-col md:flex shrink-0" style={{ opacity: panel }}>
      <div className="glass-strong flex h-full flex-col rounded-card border border-ink/[0.08] p-3.5 shadow-level-static bg-paper/70">
        <div className="flex items-center justify-between pb-1.5 border-b border-ink/[0.06]">
          <div className="flex items-center gap-1.5">
            <SlidersIcon className="h-3.5 w-3.5 text-gold-ink" />
            <span className="font-semibold text-xs text-ink">AST 约束规则检查器</span>
          </div>
          <span className="chip rounded-pill bg-jade/10 text-jade text-[10px] px-1.5 py-0 font-medium">4 条已解析</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-soft">语义精准映射至 trip.schema 约束集合</p>

        <ul className="mt-3 flex flex-col gap-2">
          {CONSTRAINTS.map((c, i) => (
            <li key={c.title}>
              <Pop at={RULE_TIMES[i]}>
                <div className={`flex items-start gap-2.5 rounded-control bg-paper p-2.5 border border-ink/[0.08] shadow-level-static ${c.ring}`}>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-sand/70 mt-0.5">
                    <c.Icon className={`h-4 w-4 ${c.iconColor}`} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="block text-xs font-semibold text-ink truncate">{c.title}</span>
                    </div>
                    <span className="block text-[10px] text-gold-ink font-mono font-medium">{c.type}</span>
                    <span className="block truncate text-[11px] text-ink-soft tabular-nums font-mono mt-0.5">{c.note}</span>
                  </div>
                </div>
              </Pop>
            </li>
          ))}
        </ul>

        <Reveal at={[0.13, 0.15]} y={6} className="mt-auto pt-3 border-t border-ink/[0.06]">
          <div className="rounded-control bg-ink/[0.04] p-2 text-[10px] leading-relaxed text-ink-soft font-mono">
            <div className="flex items-center justify-between text-jade font-semibold">
              <span className="flex items-center gap-1">
                <CheckIcon className="h-3 w-3" />
                <span>AJV 2020-12 校验通过</span>
              </span>
              <span>0 警告</span>
            </div>
            <p className="mt-0.5 text-ink-soft">spec/trip.schema.json · 云端协同模型已对齐</p>
          </div>
        </Reveal>
      </div>
    </motion.aside>
  );
}

