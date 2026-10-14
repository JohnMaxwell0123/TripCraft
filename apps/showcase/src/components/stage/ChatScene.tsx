'use client';

import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useScrollTypewriter, useStep, useVisibility, ease } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, FakeCursor, Pop, Reveal, useLayout, useProgress } from './primitives';
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
} from '@/components/common/Icons';

const USER_TEXT =
  '我们全家 5 口人，带 70 岁爷爷和 4 岁小孩，国庆去甘肃自驾。租了一辆 7 座豪华 MPV（腾势 D9），加了车顶行李箱。爷爷膝盖做过手术不能爬长楼梯；孩子每天要午休。想去莫高窟、鸣沙山看日落，千万别太赶。';

const AI_TEXT =
  '收到。70 岁长辈膝盖术后、4 岁宝宝、一台 2.15 米高（带车顶箱）的 7 座 MPV——这趟必须按「慢」来设计。我先把你在意的事记下来，有一处想和你确认：';

const USER_TAGS = [
  { label: '5人全家', tone: 'ink' },
  { label: '70岁长辈 · 膝盖术后', tone: 'gold' },
  { label: '4岁幼儿 · 需午休', tone: 'ochre' },
  { label: '腾势 D9 · 车高 2.15m', tone: 'lapis' },
  { label: '鸣沙山日落 · 慢游', tone: 'rose' },
];

const CONSTRAINTS = [
  {
    Icon: ElderIcon,
    title: '70 岁长辈 · 膝关节风控',
    type: 'HARD 硬性规则',
    note: '规避高长台阶 · 单次步行 ≤ 500m',
    ring: 'ring-gold/50',
    iconColor: 'text-gold-ink',
    glow: 'shadow-[0_0_24px_rgba(184,134,59,0.25)]',
  },
  {
    Icon: BabyIcon,
    title: '4 岁幼儿 · 作息节律',
    type: 'HARD 硬性规则',
    note: '13:00–14:30 午休静止期 · 防中暑',
    ring: 'ring-ochre/50',
    iconColor: 'text-ochre',
    glow: 'shadow-[0_0_24px_rgba(199,107,43,0.25)]',
  },
  {
    Icon: CarIcon,
    title: '7座 MPV · 腾势 D9 轮廓',
    type: 'HARD 物理限高',
    note: '车高 2.15m (车顶箱) · 避让 2.0m 地库',
    ring: 'ring-lapis/40',
    iconColor: 'text-lapis',
    glow: 'shadow-[0_0_24px_rgba(31,78,121,0.25)]',
  },
  {
    Icon: SunsetIcon,
    title: '鸣沙山月牙泉 · 摄影机位',
    type: 'SOFT 景观偏好',
    note: '锁定 19:30 黄金日落窗口',
    ring: 'ring-rose-500/50',
    iconColor: 'text-rose-600',
    glow: 'shadow-[0_0_24px_rgba(244,63,94,0.25)]',
  },
];

export function ChatScene() {
  const p = useProgress();
  const opacity = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0]);
  const x = useRange(p, [T.chatOut[0], T.chatOut[1]], [0, -48], { rest: 0 });
  const scale = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0.97], { rest: 1 });
  const pointerEvents = useTransform(p, (v) => (v >= T.chatOut[1] ? 'none' : 'auto'));
  const visibility = useVisibility(p, 0, T.chatOut[1] + 0.005);

  return (
    <motion.section
      aria-label="AI 智能路书对话规划工作台"
      className="absolute inset-0 flex gap-3 sm:gap-5 p-2.5 sm:p-4 md:p-5 gpu-layer [contain:layout_paint]"
      style={{ opacity, x, scale, pointerEvents, visibility }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        {/* 对话工作台顶栏：助手状态与模型引擎 */}
        <AssistantStatusBar />
        <MobileChips />
        <Thread />
        <InputBar />
      </div>

      {/* 右侧：路书 AST 约束规则检查器 (桌面端展示结构化专业能力) */}
      <ConstraintPanel />
    </motion.section>
  );
}

/* ── AI 助手状态与模型规格栏 ─────────────────── */
function AssistantStatusBar() {
  const p = useProgress();
  const lit = useFade(p, T.modelLit[0], T.modelLit[1]);
  return (
    <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-ink/[0.06]">
      <div className="flex items-center gap-1.5 text-xs text-ink">
        <span className="flex h-5 w-5 items-center justify-center rounded-control bg-gold/15 text-gold-ink">
          <SparklesIcon className="h-3 w-3" />
        </span>
        <span className="font-semibold">路线架构师 AI</span>
        <span className="text-[10px] text-ink-soft hidden sm:inline">· 适老/适幼/车规模型已装载</span>
      </div>

      <div className="flex items-center gap-1.5">
        <span className="relative chip bg-paper/85 text-ink ring-1 ring-ink/10 text-[11px] py-0.5">
          <motion.span className="absolute inset-0 rounded-full shadow-glow" style={{ opacity: lit }} />
          <span className="relative flex items-center gap-1">
            <ZapIcon className="h-2.5 w-2.5 text-gold" />
            <span className="font-mono font-semibold">DeepSeek-v4.1</span>
          </span>
          <motion.span className="relative text-gold-ink font-mono text-[10px]" style={{ opacity: lit }}>
            ~420 tok/s
          </motion.span>
        </span>
        <span className="chip hidden bg-ink/[0.03] text-ink-soft md:inline-flex items-center gap-1 text-[10px] py-0.5">
          <BrainIcon className="h-2.5 w-2.5 text-ink-soft" />
          <span>R1 深度推理</span>
        </span>
        <span className="chip hidden bg-ink/[0.03] text-ink-soft lg:inline-flex items-center gap-1 text-[10px] py-0.5">
          <KeyIcon className="h-2.5 w-2.5 text-ink-soft" />
          <span>BYOK</span>
        </span>
      </div>
    </div>
  );
}

function MobileChips() {
  return (
    <div className="flex flex-wrap gap-1 pt-1.5 pb-1 md:hidden">
      {CONSTRAINTS.map((c, i) => (
        <Pop key={c.title} at={T.chips[i]}>
          <span className={`chip bg-paper/90 text-ink ring-1 ${c.ring} text-[10px] px-2 py-0.5`}>
            <c.Icon className={`h-2.5 w-2.5 inline mr-1 ${c.iconColor}`} />
            {c.title.split('·')[0]}
          </span>
        </Pop>
      ))}
    </div>
  );
}

/* ── 对话流 ───────────────────────────────────────────── */
function Thread() {
  const p = useProgress();
  const { desktop } = useLayout();
  const stackY = useRange(p, [T.socraticIn[0], T.socraticIn[1]], desktop ? [0, -78] : [0, -132], { rest: 0 });
  const userOpacity = useRange(p, [T.userBubble[0], T.userBubble[1], T.socraticIn[0], T.socraticIn[1]], [0, 1, 1, desktop ? 0.45 : 0.2]);
  const userY = useRange(p, [T.userBubble[0], T.userBubble[1]], [36, 0], { easing: ease.out, rest: 0 });
  const thinking = useFade(p, T.thinking[0], T.thinking[0] + 0.004, T.aiStream[0], T.aiStream[0] + 0.004);
  const aiOpacity = useFade(p, T.aiStream[0] - 0.002, T.aiStream[0] + 0.004);
  const aiRef = useScrollTypewriter(p, AI_TEXT, T.aiStream[0], T.aiStream[1]);
  const caretOpacity = useFade(p, T.aiStream[0], T.aiStream[0] + 0.001, T.aiStream[1] - 0.001, T.aiStream[1]);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_6%,#000)]">
      <motion.div className="flex flex-col gap-2.5 pt-2 sm:pt-3" style={{ y: stackY }}>
        {/* 用户气泡 + 提取的意图标签 */}
        <motion.div className="ml-auto max-w-[94%] sm:max-w-[85%] space-y-1.5" style={{ opacity: userOpacity, y: userY }}>
          <div className="rounded-card rounded-br-sm border border-blue-600/40 bg-gradient-to-br from-blue-900 to-slate-900 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-white shadow-level-static">
            {USER_TEXT}
          </div>
          {/* 用户需求意图解析微标：展示成熟 AI 产品的即时语义抽取 */}
          <div className="flex flex-wrap justify-end gap-1">
            {USER_TAGS.map((t) => (
              <span
                key={t.label}
                className={`chip rounded-pill text-[10px] px-1.5 py-0 font-medium ${
                  t.tone === 'gold'
                    ? 'bg-gold/15 text-gold-ink border border-gold/30'
                    : t.tone === 'ochre'
                      ? 'bg-ochre/15 text-ochre border border-ochre/30'
                      : t.tone === 'lapis'
                        ? 'bg-lapis/15 text-lapis border border-lapis/30'
                        : 'bg-ink/[0.05] text-ink-soft border border-ink/[0.08]'
                }`}
              >
                #{t.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* AI 深度思考推理轨迹：展示成熟 AI SaaS 的可解释性与规则映射 */}
        <motion.div className="flex items-start gap-2 max-w-[94%] sm:max-w-[88%]" style={{ opacity: thinking }}>
          <Avatar name="老" tone="gold" size={24} className="mt-0.5 shrink-0" />
          <div className="rounded-card border border-gold/30 bg-gold/10 px-3 py-2 text-xs text-gold-ink shadow-level-static space-y-1">
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5 text-[11px]">
                <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-gold" />
                <span>老定制师深度思考中</span>
              </span>
              <span className="chip rounded-pill bg-gold/20 text-gold-ink text-[9px] font-mono px-1.5 py-0 font-bold">
                1.2s · 420 tok/s
              </span>
            </div>
            <ul className="text-[10px] text-ink-soft space-y-0.5 font-mono leading-tight">
              <li>• 适老适幼: 70岁膝关节术后 ➔ 筛除长梯洞窟；4岁幼童 ➔ 锁定 13:00 午休</li>
              <li>• 车辆物理: 腾势 D9 2.15m (车顶箱) ➔ 规避 2.0m 地库，排布地面车位</li>
              <li>• 拓扑引擎: 1,980km 丝路大纲生成 ➔ 校验 trip.schema (0 警告)</li>
            </ul>
          </div>
        </motion.div>

        {/* AI 流式回复 */}
        <motion.div className="-mt-8 flex max-w-[94%] sm:max-w-[90%] items-start gap-2" style={{ opacity: aiOpacity }}>
          <Avatar name="老" tone="gold" size={26} className="mt-0.5 shrink-0" />
          <div className="rounded-card rounded-tl-sm border border-ink/[0.08] bg-paper/95 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-ink shadow-level-static">
            <span ref={aiRef}>{AI_TEXT}</span>
            <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-caret bg-gold" style={{ opacity: caretOpacity }} />
          </div>
        </motion.div>

        {/* 苏格拉底反问卡片 */}
        <SocraticCard />
      </motion.div>
    </div>
  );
}

/* ── 苏格拉底式追问卡：事实 / 建议分离 + 决策选项 ─────────────── */
function SocraticCard() {
  const p = useProgress();
  const opacity = useFade(p, T.socraticIn[0], T.socraticIn[1]);
  const y = useRange(p, [T.socraticIn[0], T.socraticIn[1]], [50, 0], { easing: ease.back, rest: 0 });

  return (
    <motion.div
      className="glass-strong relative ml-2 sm:ml-8 rounded-card border border-gold/35 p-3 sm:p-4 shadow-level-static gpu-layer"
      style={{ opacity, y }}
    >
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gold-ink text-xs">老定制师 · 专业排程决策</span>
          <span className="chip rounded-pill border border-gold/30 bg-gold/10 px-1.5 py-0 text-[10px] text-gold-ink">
            反问核准
          </span>
        </div>
        <span className="text-[10px] text-ink-soft">保留否决权</span>
      </div>

      <div className="space-y-1 text-xs leading-relaxed text-ink">
        <p className="flex items-start gap-1.5">
          <span className="rounded-control bg-ink/[0.08] px-1 py-0.2 text-[10px] font-bold text-ink shrink-0 mt-0.5">
            事实核查
          </span>
          <span>莫高窟常规洞窟需攀爬多段陡峭高架栈道（步梯 &gt; 120 阶），且自驾车辆需统一定位换乘。</span>
        </p>
        <p className="flex items-start gap-1.5">
          <span className="rounded-control bg-gold/20 px-1 py-0.2 text-[10px] font-bold text-gold-ink shrink-0 mt-0.5">
            定制建议
          </span>
          <span>改预约特种无障碍摆渡车，主看 4 个平层大窟，让长辈慢慢看，不爬长楼梯。</span>
        </p>
      </div>

      <SocraticOptions />

      <Reveal at={[T.lockA, T.lockA + 0.006]} y={4} className="mt-2 text-[11px] font-medium text-jade flex items-center gap-1">
        <CheckIcon className="h-3.5 w-3.5 shrink-0" />
        <span>策略已写入 constraints.hard，通过 trip.schema 校验，正在生成大纲…</span>
      </Reveal>

      {/* 虚拟点击光标（平滑划过并点击选项 A） */}
      <FakeCursor times={[T.cursorA[0], T.cursorA[1]]} xs={[78, 22]} ys={[130, 72]} clickAt={T.clickA} hideAt={T.lockA + 0.01} />
    </motion.div>
  );
}

function SocraticOptions() {
  const p = useProgress();
  const locked = useStep(p, [T.lockA]) === 1;
  const ripple = useRange(p, [T.clickA, T.clickA + 0.014], [0, 1], { easing: ease.out });
  const rippleOpacity = useRange(p, [T.clickA, T.clickA + 0.002, T.clickA + 0.014], [0, 0.6, 0]);

  return (
    <Reveal at={[T.optionsIn[0], T.optionsIn[1]]} y={6} className="relative mt-2.5 flex flex-wrap gap-1.5">
      <span
        className={`relative chip rounded-pill overflow-hidden py-1 text-xs transition-colors duration-300 font-medium ${
          locked ? 'btn-primary text-paper shadow-level-static' : 'bg-gold/15 text-gold-ink border border-gold/30'
        }`}
      >
        <motion.span className="absolute inset-0 rounded-pill bg-gold" style={{ scale: ripple, opacity: rippleOpacity }} />
        <span className="relative inline-flex items-center gap-1">
          {locked ? <CheckIcon className="h-3 w-3 shrink-0" /> : <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />}
          <span>方案 A：无障碍慢游 (推荐)</span>
        </span>
      </span>
      <span
        className={`chip rounded-pill border border-ink/[0.08] bg-white/70 py-1 text-xs text-ink transition-opacity duration-300 ${
          locked ? 'opacity-40' : ''
        }`}
      >
        方案 B：常规窟 · 人工陪护
      </span>
      <span
        className={`chip rounded-pill hidden border border-ink/[0.08] bg-white/70 py-1 text-xs text-ink transition-opacity duration-300 sm:inline-flex ${
          locked ? 'opacity-40' : ''
        }`}
      >
        我再想想
      </span>
    </Reveal>
  );
}

/* ── 输入框：滚动驱动打字 ─────────────────────────────────── */
function InputBar() {
  const p = useProgress();
  const typed = useScrollTypewriter(p, USER_TEXT, T.typeInput[0], T.typeInput[1]);
  const textOpacity = useRange(p, [T.send - 0.002, T.send], [1, 0]);
  const placeholder = useRange(p, [T.typeInput[0] - 0.004, T.typeInput[0], T.send, T.send + 0.004], [1, 0, 0, 1]);
  const press = useRange(p, [T.send - 0.003, T.send, T.send + 0.003], [1, 0.86, 1]);
  const sendGlow = useRange(p, [T.typeInput[1] - 0.004, T.typeInput[1], T.send + 0.002, T.send + 0.006], [0, 1, 1, 0]);

  return (
    <div className="glass-strong mt-2 flex items-end gap-2 rounded-control border border-ink/[0.08] p-1.5 sm:p-2 pl-3 sm:pl-4 shadow-level-static">
      <div className="relative min-h-[40px] flex-1 py-2 text-xs leading-relaxed text-ink md:text-sm">
        <motion.span className="pointer-events-none absolute inset-y-2 left-0 text-ink-soft text-xs" style={{ opacity: placeholder }}>
          说说这趟旅行：谁去、开什么车、最在意什么…
        </motion.span>
        <motion.span className="line-clamp-2" style={{ opacity: textOpacity }}>
          <span ref={typed}>{USER_TEXT}</span>
          <span className="ml-0.5 inline-block h-3.5 w-[2px] translate-y-[2px] animate-caret bg-gold" />
        </motion.span>
      </div>
      <motion.span
        aria-hidden
        className="btn-primary !min-h-0 !p-0 relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-control shadow-level-static gpu-layer"
        style={{ scale: press }}
      >
        <motion.span className="absolute inset-0 rounded-control shadow-glow" style={{ opacity: sendGlow }} />
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="relative text-white">
          <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </div>
  );
}

/* ── 右侧：路书 AST 约束规则检查器 (Constraints Rule Inspector) ─────────────────── */
function ConstraintPanel() {
  const p = useProgress();
  const panel = useFade(p, T.chips[0] - 0.012, T.chips[0]);
  return (
    <motion.aside className="hidden w-[35%] max-w-[340px] flex-col md:flex" style={{ opacity: panel }}>
      <div className="glass-strong flex h-full flex-col rounded-card border border-ink/[0.08] p-3.5 shadow-level-static">
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
              <Pop at={T.chips[i]}>
                <div className={`flex items-start gap-2.5 rounded-control bg-paper/90 p-2.5 border border-ink/[0.08] shadow-level-static ${c.ring}`}>
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

        <Reveal at={[T.chips[3] + 0.008, T.chips[3] + 0.014]} y={6} className="mt-auto pt-3 border-t border-ink/[0.06]">
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
