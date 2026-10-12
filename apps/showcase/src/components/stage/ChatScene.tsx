'use client';

import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useScrollTypewriter, useStep, useVisibility, ease } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, FakeCursor, Pop, Reveal, useProgress } from './primitives';

const USER_TEXT =
  '我们全家 5 口人，带 70 岁爷爷和 4 岁小孩，国庆去甘肃自驾。租了一辆 7 座豪华 MPV（腾势 D9），加了车顶行李箱。爷爷膝盖做过手术不能爬长楼梯；孩子每天要午休。想去莫高窟、鸣沙山看日落，千万别太赶。';

const AI_TEXT =
  '收到。70 岁长辈膝盖术后、4 岁宝宝、一台 2.15 米高（带车顶箱）的 7 座 MPV——这趟必须按「慢」来设计。我先把你在意的事记下来，有一处想和你确认：';

const CONSTRAINTS = [
  { icon: '👴', title: '70 岁长辈', note: '规避高长台阶 · 步行 ≤ 500m', ring: 'ring-gold/50', glow: 'shadow-[0_0_24px_rgb(var(--tc-gold)/0.35)]' },
  { icon: '👶', title: '4 岁幼儿', note: '13:00–14:30 午休 · 防中暑', ring: 'ring-[#d98a3a]/50', glow: 'shadow-[0_0_24px_rgba(217,138,58,0.35)]' },
  { icon: '🚙', title: '7座 MPV (车顶箱)', note: '车高 2.15m · 避开 2m 限高地库', ring: 'ring-lapis/40', glow: 'shadow-[0_0_24px_rgb(var(--tc-lapis)/0.3)]' },
  { icon: '🌅', title: '鸣沙山日落', note: '锁定 19:30 日落窗口', ring: 'ring-[#d9776b]/50', glow: 'shadow-[0_0_24px_rgba(217,119,107,0.35)]' },
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
      aria-label="AI 对话规划演示"
      className="absolute inset-0 flex gap-5 p-4 md:p-6 gpu-layer [contain:layout_paint]"
      style={{ opacity, x, scale, pointerEvents, visibility }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <ModelRow />
        <MobileChips />
        <Thread />
        <InputBar />
      </div>
      <ConstraintPanel />
    </motion.section>
  );
}

/* ── 模型分级：默认高吞吐 / 会员深度推理 / BYOK ─────────────────── */
function ModelRow() {
  const p = useProgress();
  const lit = useFade(p, T.modelLit[0], T.modelLit[1]);
  return (
    <div className="flex flex-wrap items-center gap-2 pb-3">
      <span className="relative chip bg-paper/70 text-ink ring-1 ring-ink/10">
        <motion.span className="absolute inset-0 rounded-full shadow-glow" style={{ opacity: lit }} />
        <span className="relative">⚡ DeepSeek-v4.1-flash</span>
        <motion.span className="relative text-gold-ink" style={{ opacity: lit }}>
          · 默认 · 秒级响应
        </motion.span>
      </span>
      <span className="chip hidden bg-ink/5 text-ink-soft sm:inline-flex">🧠 深度推理 R1 / Claude / GPT · 会员</span>
      <span className="chip hidden bg-ink/5 text-ink-soft lg:inline-flex">🔑 BYOK · 密钥仅存本机</span>
    </div>
  );
}

function MobileChips() {
  return (
    <div className="flex flex-wrap gap-1.5 pb-2 md:hidden">
      {CONSTRAINTS.map((c, i) => (
        <Pop key={c.title} at={T.chips[i]}>
          <span className={`chip bg-paper/80 text-ink ring-1 ${c.ring}`}>
            {c.icon} {c.title}
          </span>
        </Pop>
      ))}
    </div>
  );
}

/* ── 对话流 ───────────────────────────────────────────── */
function Thread() {
  const p = useProgress();
  const stackY = useRange(p, [T.socraticIn[0], T.socraticIn[1]], [0, -88], { rest: 0 });
  const userOpacity = useRange(p, [T.userBubble[0], T.userBubble[1], T.socraticIn[0], T.socraticIn[1]], [0, 1, 1, 0.35]);
  const userY = useRange(p, [T.userBubble[0], T.userBubble[1]], [40, 0], { easing: ease.out, rest: 0 });
  const thinking = useFade(p, T.thinking[0], T.thinking[0] + 0.004, T.aiStream[0], T.aiStream[0] + 0.004);
  const aiOpacity = useFade(p, T.aiStream[0] - 0.002, T.aiStream[0] + 0.004);
  const aiRef = useScrollTypewriter(p, AI_TEXT, T.aiStream[0], T.aiStream[1]);
  const caretOpacity = useFade(p, T.aiStream[0], T.aiStream[0] + 0.001, T.aiStream[1] - 0.001, T.aiStream[1]);

  return (
    <div className="relative min-h-0 flex-1 overflow-hidden [mask-image:linear-gradient(180deg,transparent,#000_10%,#000)]">
      <motion.div className="flex flex-col gap-3 pt-4" style={{ y: stackY }}>
        {/* 用户气泡 */}
        <motion.div className="ml-auto max-w-[88%] md:max-w-[80%]" style={{ opacity: userOpacity, y: userY }}>
          <div className="rounded-2xl rounded-br-md bg-lapis px-4 py-3 text-[13px] leading-relaxed text-paper shadow-lg md:text-sm">
            {USER_TEXT}
          </div>
        </motion.div>

        {/* AI 思考中 */}
        <motion.div className="flex items-center gap-2" style={{ opacity: thinking }}>
          <Avatar name="老" tone="gold" size={26} />
          <span className="flex gap-1 rounded-full bg-paper/80 px-3 py-2 ring-1 ring-ink/5">
            {[0, 1, 2].map((i) => (
              <span key={i} className="h-1.5 w-1.5 animate-breathe rounded-full bg-gold" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </span>
        </motion.div>

        {/* AI 流式回复 */}
        <motion.div className="-mt-9 flex max-w-[92%] items-start gap-2" style={{ opacity: aiOpacity }}>
          <Avatar name="老" tone="gold" size={26} className="mt-1" />
          <div className="rounded-2xl rounded-tl-md bg-paper/85 px-4 py-3 text-[13px] leading-relaxed text-ink ring-1 ring-ink/5 md:text-sm">
            <span ref={aiRef}>{AI_TEXT}</span>
            <motion.span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-caret bg-gold" style={{ opacity: caretOpacity }} />
          </div>
        </motion.div>

        <SocraticCard />
      </motion.div>
    </div>
  );
}

/* ── 苏格拉底式追问卡：事实 / 建议分离 + 保留否决权 ─────────────── */
function SocraticCard() {
  const p = useProgress();
  const opacity = useFade(p, T.socraticIn[0], T.socraticIn[1]);
  const y = useRange(p, [T.socraticIn[0], T.socraticIn[1]], [60, 0], { easing: ease.back, rest: 0 });

  return (
    <motion.div className="glass-sub glass-sheen relative ml-8 rounded-2xl p-4 gpu-layer" style={{ opacity, y }}>
      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="font-semibold text-gold-ink">老定制师 · 专业意见</span>
        <span className="chip bg-ink/5 px-2 py-0.5 text-[10px] text-ink-soft">可否决</span>
      </div>
      <p className="text-[13px] leading-relaxed text-ink md:text-sm">
        <span className="mr-1 rounded bg-lapis/10 px-1 text-[11px] font-semibold text-lapis">事实</span>
        莫高窟常规洞窟需攀爬多段陡峭高架栈道，且自驾私家车需统一停放游客中心换乘。
        <br />
        <span className="mr-1 rounded bg-gold/15 px-1 text-[11px] font-semibold text-gold-ink">建议</span>
        改乘景区无障碍摆渡车，主看 4 个平层大窟，让长辈慢慢看。
      </p>
      <SocraticOptions />
      <Reveal at={[T.lockA, T.lockA + 0.006]} y={6} className="mt-2 text-[11px] font-medium text-jade">
        ✓ 已锁定排程策略，写入 constraints.hard，开始生成路书…
      </Reveal>
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
    <Reveal at={[T.optionsIn[0], T.optionsIn[1]]} y={8} className="relative mt-3 flex flex-wrap gap-2">
      <span
        className={`relative chip overflow-hidden py-1.5 text-[12px] transition-colors duration-300 ${
          locked ? 'bg-gold text-paper shadow-glow' : 'bg-jade/10 text-jade ring-1 ring-jade/30'
        }`}
      >
        <motion.span className="absolute inset-0 rounded-full bg-gold" style={{ scale: ripple, opacity: rippleOpacity }} />
        <span className="relative">{locked ? '✓' : '●'} 方案 A：无障碍慢游（推荐）</span>
      </span>
      <span className={`chip py-1.5 text-[12px] ring-1 ring-ink/10 transition-opacity duration-300 ${locked ? 'opacity-40' : ''}`}>
        方案 B：常规窟 · 人工陪护
      </span>
      <span className={`chip hidden py-1.5 text-[12px] ring-1 ring-ink/10 transition-opacity duration-300 sm:inline-flex ${locked ? 'opacity-40' : ''}`}>
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
    <div className="glass-sub mt-3 flex items-end gap-3 rounded-2xl p-2 pl-4">
      <div className="relative min-h-[44px] flex-1 py-2.5 text-[13px] leading-relaxed text-ink md:text-sm">
        <motion.span className="pointer-events-none absolute inset-y-2.5 left-0 text-ink-soft" style={{ opacity: placeholder }}>
          说说这趟旅行：谁去、开什么车、最在意什么…
        </motion.span>
        <motion.span className="line-clamp-2" style={{ opacity: textOpacity }}>
          <span ref={typed}>{USER_TEXT}</span>
          <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[3px] animate-caret bg-lapis" />
        </motion.span>
      </div>
      <motion.span
        aria-hidden
        className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold to-gold-ink text-paper gpu-layer"
        style={{ scale: press }}
      >
        <motion.span className="absolute inset-0 rounded-xl shadow-glow" style={{ opacity: sendGlow }} />
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="relative">
          <path d="M4 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </motion.span>
    </div>
  );
}

/* ── 右侧：结构化约束芯片 ─────────────────────────────────── */
function ConstraintPanel() {
  const p = useProgress();
  const panel = useFade(p, T.chips[0] - 0.012, T.chips[0]);
  return (
    <motion.aside className="hidden w-[36%] max-w-[340px] flex-col md:flex" style={{ opacity: panel }}>
      <div className="glass-sub flex h-full flex-col rounded-2xl p-4">
        <p className="eyebrow text-gold-ink">已理解的约束</p>
        <p className="mt-1 text-xs text-ink-soft">从你的话里抽取，可随时修改</p>
        <ul className="mt-4 flex flex-col gap-2.5">
          {CONSTRAINTS.map((c, i) => (
            <li key={c.title}>
              <Pop at={T.chips[i]}>
                <div className={`flex items-center gap-3 rounded-xl bg-paper/80 p-2.5 ring-1 ${c.ring} ${c.glow}`}>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand text-lg">{c.icon}</span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-ink">{c.title}</span>
                    <span className="block truncate text-[11px] text-ink-soft">{c.note}</span>
                  </span>
                </div>
              </Pop>
            </li>
          ))}
        </ul>
        <Reveal at={[T.chips[3] + 0.008, T.chips[3] + 0.014]} y={6} className="mt-auto pt-4">
          <p className="rounded-lg bg-ink/[0.04] p-2.5 font-mono text-[10.5px] leading-relaxed text-ink-soft">
            constraints.hard ← 4 条
            <br />
            schema: trip.schema.json · <span className="text-jade">AJV ✓</span>
          </p>
        </Reveal>
      </div>
    </motion.aside>
  );
}
