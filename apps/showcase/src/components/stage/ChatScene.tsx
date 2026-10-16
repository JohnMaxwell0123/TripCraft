'use client';

import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useVisibility, useScrollTypewriter, useStep, ease } from '@/lib/motion';
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
          私人自驾定制师
        </span>
        <span className="text-[10px] text-ink-soft hidden sm:inline font-sans whitespace-nowrap">
          · 全家需求解析与沿途路况核验
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
        <span className="relative chip bg-paper text-ink ring-1 ring-ink/10 text-[10px] sm:text-[11px] py-0.5 px-2 font-sans">
          <motion.span className="absolute inset-0 rounded-full shadow-glow" style={{ opacity: lit }} />
          <span className="relative flex items-center gap-1">
            <ZapIcon className="h-2.5 w-2.5 text-gold shrink-0" />
            <span className="font-semibold">深度推演中</span>
          </span>
        </span>
        <span className="chip hidden bg-ink/[0.03] text-ink-soft md:inline-flex items-center gap-1 text-[10px] py-0.5 px-2 font-sans">
          <KeyIcon className="h-2.5 w-2.5 text-ink-soft shrink-0" />
          <span>本地隐私保护</span>
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

/* ── 核心推理画布：出行倾诉卡片 + 路线定制推演树 ── */
function ReasoningCanvas() {
  const p = useProgress();

  // 首帧即有容器入场，打字机在 T.typeInput (0.003 ~ 0.050) 逐字输入
  const promptOpacity = useRange(p, [0, 0.010], [0.85, 1]);
  const promptY = useRange(p, [0, 0.010], [6, 0], { easing: ease.out, rest: 0 });

  // 逐字输入打字机动画 (0 React 重渲染，DOM 直接写入)
  const typedRef = useScrollTypewriter(p, USER_TEXT, T.typeInput[0], T.typeInput[1]);
  const placeholderOpacity = useRange(p, [0, 0.003], [0.75, 0]);
  const isSubmitted = useStep(p, [T.send]) === 1;

  // 光标在打字中保持闪烁，并在提交意图后平滑淡出
  const caretOpacity = useTransform(p, (v) => {
    if (v < 0.001) return 1;
    if (v >= T.send + 0.004) return 0;
    if (v >= T.typeInput[1]) return 1 - (v - T.typeInput[1]) / (T.send + 0.004 - T.typeInput[1]);
    return 1;
  });

  // 演示鼠标指针：在打字完成瞬间悬浮并执行模拟“提交”点击
  const cursorScale = useRange(p, [T.cursorA[0], T.clickA, T.cursorA[1]], [1, 0.82, 1]);

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-1 space-y-3.5">
      {/* 1. 顶部领队倾诉卡片 (逐字输入打字交互) */}
      <motion.div
        className="relative ml-auto max-w-[96%] sm:max-w-[92%] rounded-2xl bg-[#F4F0E8] border border-ink/[0.08] p-3 sm:p-3.5 shadow-sm text-left transition-colors duration-300"
        style={{ opacity: promptOpacity, y: promptY }}
      >
        <div className="text-[10px] text-ink-soft mb-1.5 font-sans flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isSubmitted ? 'bg-emerald-500' : 'bg-[#FE3C01] animate-pulse'}`} />
            <span className="font-medium text-[#241E20]/80">
              {isSubmitted ? '领队心愿已提交 · 结构化需求解析中' : '领队出行心愿倾诉 · 语音 / 文字免填表'}
            </span>
          </div>
          <span className="font-mono text-[9px] text-ink-soft/70">
            {isSubmitted ? '0.4s 快速解析' : '实时输入中'}
          </span>
        </div>

        {/* 稳固容器高，杜绝文本逐字增加时的页面抖动 (CLS = 0) */}
        <div className="relative min-h-[58px] sm:min-h-[48px]">
          <motion.p
            className="pointer-events-none absolute inset-0 text-xs sm:text-[13px] text-ink-soft/40 leading-relaxed font-sans italic select-none"
            style={{ opacity: placeholderOpacity }}
          >
            正在倾诉出行心愿：谁去、开什么车、最在意什么…
          </motion.p>
          <p className="text-xs sm:text-[13px] text-[#241E20] leading-relaxed font-sans font-medium">
            <span ref={typedRef}>{USER_TEXT}</span>
            <motion.span
              className="inline-block w-[2px] h-3.5 ml-0.5 align-middle bg-[#FE3C01] rounded-sm animate-pulse"
              style={{ opacity: caretOpacity }}
            />
          </p>
        </div>

        {/* 演示指针 (输入完毕后模拟点击提交) */}
        <motion.div
          className="absolute -bottom-2 -right-1.5 pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)]"
          style={{ scale: cursorScale }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="#241E20" stroke="#FAF8F5" strokeWidth="1.2">
            <path d="M4 2.5 L19.5 12 L12.4 13.6 L9 20.5 Z" />
          </svg>
        </motion.div>
      </motion.div>

      {/* 2. 层级路线推演树 (在逐字打字完成后依次执行并展开) */}
      <div className="relative pl-6 space-y-3.5 pt-1 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-ink/15">
        
        {/* Step 1: 意图抽取与全要素结构化 (0.056 ~ 0.078) */}
        <Reveal at={[0.056, 0.078]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-paper border border-ink/30 flex items-center justify-center text-[9px] text-ink font-mono font-bold shadow-sm">
            1
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <SparklesIcon className="w-3.5 h-3.5 text-[#FE3C01]" />
              <span>识别同行家人照护需求与车辆尺寸</span>
            </span>
            <span className="text-[10px] font-mono text-ink-soft">0.4s · 完成</span>
          </div>
          <div className="mt-1.5 pl-5 space-y-1 text-[11px] text-ink-soft font-sans">
            <div className="flex items-center gap-1.5">
              <span className="text-[#FE3C01]">•</span>
              <span>适老适幼关怀：70 岁爷爷膝盖术后（单次步行 ≤500m）+ 4 岁宝宝每日 13:00–14:30 午休</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[#FE3C01]">•</span>
              <span>车辆通行尺寸：腾势 D9 加装车顶行李箱，整车总高 2.28m（全程避开 2.0m 限高地库）</span>
            </div>
          </div>
        </Reveal>

        {/* Step 2: 空间时空规则交叉核验与刚性风控拦截 (0.086 ~ 0.110) */}
        <Reveal at={[0.086, 0.110]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-[#FE3C01]/15 border border-[#FE3C01]/50 flex items-center justify-center text-[9px] text-[#FE3C01] font-mono font-bold shadow-sm">
            2
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <ShieldIcon className="w-3.5 h-3.5 text-amber-600" />
              <span>核验莫高窟游览步道与台阶坡度</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
              1.2s · 适老动线优化
            </span>
          </div>
          <div className="mt-1.5 pl-5 space-y-2 text-[11px] text-ink-soft font-sans">
            <p className="text-ink leading-relaxed">
              发现莫高窟常规动线需攀爬多层悬空栈道（连续台阶 &gt; 120 级），超出长辈膝关节舒适上限。
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-[#C43200] bg-[#FFF5ED] border border-[#FE3C01]/30 px-3 py-1.5 rounded-lg shadow-sm">
              <span className="w-3 h-3 border-2 border-[#FE3C01] border-t-transparent rounded-full animate-spin shrink-0" />
              <span>已自动切换方案：预约无障碍接驳专车，精选 4 处一楼平层大窟慢游</span>
            </div>
          </div>
        </Reveal>

        {/* Step 3: 1,980km 日程就绪 (0.118 ~ 0.142) */}
        <Reveal at={[0.118, 0.142]} y={8} className="relative">
          <div className="absolute -left-[23px] top-0.5 w-4 h-4 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center text-[9px] text-emerald-800 font-mono font-bold shadow-sm">
            3
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#241E20] flex items-center gap-1.5">
              <CheckIcon className="w-3.5 h-3.5 text-emerald-600" />
              <span>生成河西走廊 9 日慢游路书与安全预案</span>
            </span>
            <span className="text-[10px] font-sans font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              2.0s · 方案已就绪
            </span>
          </div>
          <div className="mt-1.5 pl-5 space-y-1 text-[11px] text-ink-soft font-sans">
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>鸣沙山月牙泉锁定 19:30 黄金落日时段，避开正午高温暴晒</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>沿途老城 2.0m 限高地库提前规避，全部酒店预留地面 MPV 宽车位</span>
            </div>
          </div>
        </Reveal>

      </div>
    </div>
  );
}

/* ── 右侧：家庭出行守护清单 (Family Travel Safeguards) ── */
function ConstraintPanel() {
  const p = useProgress();
  // 面板常驻呈现，随场景淡出 (彻底杜绝首帧空白)
  const panel = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0]);
  // 四条刚性规则跟随左侧思维链 1、2、3 步依次点亮解析
  const RULE_TIMES = T.chips;

  return (
    <motion.aside className="hidden w-[38%] max-w-[330px] flex-col md:flex shrink-0" style={{ opacity: panel }}>
      <div className="glass-strong flex h-full flex-col rounded-card border border-ink/[0.08] p-3.5 shadow-level-static bg-paper/70">
        <div className="flex items-center justify-between pb-1.5 border-b border-ink/[0.06]">
          <div className="flex items-center gap-1.5">
            <SlidersIcon className="h-3.5 w-3.5 text-gold-ink" />
            <span className="font-semibold text-xs text-ink">家庭出行守护清单</span>
          </div>
          <span className="chip rounded-pill bg-jade/10 text-jade text-[10px] px-1.5 py-0 font-medium">4 项已锁定</span>
        </div>
        <p className="mt-1 text-[11px] text-ink-soft">从对话自动提炼专属行程保障，全程生效</p>

        <ul className="mt-2.5 flex flex-col gap-2">
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
                    <span className="block text-[10px] text-gold-ink font-sans font-medium">{c.type}</span>
                    <span className="block truncate text-[11px] text-ink-soft tabular-nums font-sans mt-0.5">{c.note}</span>
                  </div>
                </div>
              </Pop>
            </li>
          ))}
        </ul>

        <Reveal at={[0.142, 0.158]} y={6} className="mt-auto pt-3 border-t border-ink/[0.06]">
          <div className="rounded-control bg-emerald-50/70 border border-emerald-500/20 p-2 text-[10px] leading-relaxed text-ink-soft font-sans">
            <div className="flex items-center justify-between text-emerald-800 font-semibold">
              <span className="flex items-center gap-1">
                <CheckIcon className="h-3 w-3 text-emerald-600" />
                <span>全程 1,980km 安全核验通过</span>
              </span>
              <span className="font-mono text-[9.5px]">0 冲突</span>
            </div>
            <p className="mt-0.5 text-ink-soft">已规避陡坡栈道与 2.0m 限高地库 · 桌面/手机/车机已同步</p>
          </div>
        </Reveal>
      </div>
    </motion.aside>
  );
}

