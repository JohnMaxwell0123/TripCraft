'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { qrPath } from '@/data/trip';
import { ease, useFade, useRange, useScrollTypewriter, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, FakeCursor, Reveal, useLayout, useProgress } from './primitives';
import { PinIcon, UtensilsIcon, HotelIcon, SearchIcon, CheckIcon, ShieldIcon } from '@/components/common/Icons';

const QR = qrPath();

/** macOS 经典红黄绿交通灯控制按钮群 */
export function MacTrafficLights() {
  return (
    <div
      className="group/traffic flex shrink-0 items-center gap-2 select-none py-1 pr-1.5 sm:pr-2.5"
      role="group"
      aria-label="macOS 窗口控制"
    >
      {/* 关闭 (Close) */}
      <button
        type="button"
        title="关闭窗口"
        aria-label="关闭窗口"
        className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ff5f56] border border-[#e0443e] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.45)] transition-colors active:scale-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#e0443e]"
      >
        <svg
          viewBox="0 0 8 8"
          className="h-2 w-2 stroke-[#4d0000]/85 opacity-0 transition-opacity duration-150 group-hover/traffic:opacity-100"
          fill="none"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M2 2l4 4M6 2L2 6" />
        </svg>
      </button>

      {/* 最小化 (Minimize) */}
      <button
        type="button"
        title="最小化窗口"
        aria-label="最小化窗口"
        className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#ffbd2e] border border-[#dea123] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.45)] transition-colors active:scale-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#dea123]"
      >
        <svg
          viewBox="0 0 8 8"
          className="h-2 w-2 stroke-[#5c3c00]/85 opacity-0 transition-opacity duration-150 group-hover/traffic:opacity-100"
          fill="none"
          strokeWidth="1.2"
          strokeLinecap="round"
        >
          <path d="M1.5 4h5" />
        </svg>
      </button>

      {/* 全屏 / 最大化 (Zoom) */}
      <button
        type="button"
        title="最大化 / 全屏窗口"
        aria-label="最大化 / 全屏窗口"
        className="relative flex h-3 w-3 items-center justify-center rounded-full bg-[#27c93f] border border-[#1aab29] shadow-[inset_0_1px_0.5px_rgba(255,255,255,0.45)] transition-colors active:scale-90 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#1aab29]"
      >
        <svg
          viewBox="0 0 8 8"
          className="h-2 w-2 fill-[#004d11]/85 opacity-0 transition-opacity duration-150 group-hover/traffic:opacity-100"
        >
          <path d="M1.5 1.5h3L1.5 4.5zM6.5 6.5h-3L6.5 3.5z" />
        </svg>
      </button>
    </div>
  );
}

/* ═════════════════════ 窗口顶栏 ═════════════════════ */
export function Topbar() {
  const p = useProgress();
  const named = useFade(p, T.timelineIn[0], T.timelineIn[1]);
  const draft = useRange(p, [T.timelineIn[0], T.timelineIn[1]], [1, 0]);
  const shareGlow = useFade(p, T.shareCursor[0], T.shareClick, T.shareSheet[2], T.shareSheet[3]);
  const sharePress = useRange(p, [T.shareClick - 0.003, T.shareClick, T.shareClick + 0.003], [1, 0.9, 1]);

  return (
    <header className="relative z-30 flex h-12 shrink-0 items-center gap-2 sm:gap-3 border-b border-ink/[0.08] bg-paper/40 backdrop-blur-md px-3.5 md:h-14 md:px-5">
      {/* 顶部微高光反光层 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
      <MacTrafficLights />
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-gold via-gold-ink to-ink font-serif text-sm font-bold text-paper shadow-level-static ring-1 ring-gold/40">旅</span>
      <div className="relative h-5 min-w-0 flex-1 overflow-hidden text-xs font-semibold text-ink md:text-sm">
        <motion.span className="absolute inset-0 truncate" style={{ opacity: draft }}>
          新的旅行 <span className="font-normal text-ink-soft">· 对话中</span>
        </motion.span>
        <motion.span className="absolute inset-0 truncate" style={{ opacity: named }}>
          西行计划 <span className="hidden font-normal text-ink-soft sm:inline">· 丝路自驾路书</span>
        </motion.span>
      </div>

      <MultiDeviceSyncBadge />
      <OfflinePouchBadge />
      <VersionBadge />

      <AvatarStack />

      <motion.span
        className="btn-primary relative flex h-8 items-center gap-1.5 rounded-pill px-3 text-xs font-semibold shadow-level-static hover:shadow-level-hover"
        style={{ scale: sharePress }}
      >
        <motion.span className="absolute inset-0 rounded-pill shadow-glow" style={{ opacity: shareGlow }} />
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="relative">
          <path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 002 2h10a2 2 0 002-2v-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="relative hidden sm:inline">邀请</span>
      </motion.span>
      <FakeCursor times={[T.shareCursor[0], T.shareCursor[1]]} xs={[78, 95]} ys={[260, 55]} clickAt={T.shareClick} />
    </header>
  );
}

function MultiDeviceSyncBadge() {
  const p = useProgress();
  const opacity = useFade(p, 0.84, 0.854);
  return (
    <motion.span
      className="hidden items-center gap-1.5 rounded-pill border border-jade/30 bg-jade/10 px-2 py-0.5 text-xs font-medium text-jade md:inline-flex"
      style={{ opacity }}
    >
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
      </span>
      <span className="font-mono text-xs">3端同频</span>
    </motion.span>
  );
}

function OfflinePouchBadge() {
  const p = useProgress();
  const opacity = useFade(p, T.timelineIn[1], T.timelineIn[1] + 0.02);
  return (
    <motion.span
      className="hidden items-center gap-1 rounded-pill border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs font-medium text-gold-ink lg:inline-flex"
      style={{ opacity }}
      title="单文件 1.8MB 随身离线兜底 · 零外部网络依赖"
    >
      <ShieldIcon className="h-3 w-3 text-gold-ink" />
      <span>离线锦囊</span>
    </motion.span>
  );
}

function VersionBadge() {
  const p = useProgress();
  const ver = useStep(p, [T.version]) === 1;
  const verOpacity = useFade(p, T.camera[1] - 0.01, T.camera[1]);
  const verPulse = useRange(p, [T.version, T.version + 0.004, T.version + 0.016], [1, 1.18, 1], { rest: 1 });
  return (
    <motion.span
      className={`chip rounded-pill hidden px-2 py-0.5 font-mono tabular-nums text-xs border transition-colors duration-500 sm:inline-flex ${ver ? 'bg-jade/10 text-jade border-jade/30' : 'bg-ink/[0.05] text-ink-soft border-ink/[0.08]'}`}
      style={{ opacity: verOpacity, scale: verPulse }}
    >
      {ver ? 'v1.1' : 'v1.0'}
    </motion.span>
  );
}

function AvatarStack() {
  return (
    <div className="flex items-center">
      <Avatar name="我" tone="gold" size={28} />
      <JoiningAvatar name="阿杰" tone="jade" range={T.joinAJie} />
      <JoiningAvatar name="小雨" tone="lapis" range={T.joinXiaoyu} />
    </div>
  );
}

function JoiningAvatar({ name, tone, range }: { name: string; tone: 'jade' | 'lapis'; range: readonly [number, number] }) {
  const p = useProgress();
  const width = useRange(p, [range[0], range[1]], [0, 20]);
  const scale = useRange(p, [range[0], range[1]], [0, 1], { easing: ease.back });
  const halo = useRange(p, [range[1], range[1] + 0.006, range[1] + 0.03], [0, 1, 0.35]);
  return (
    <motion.span className="relative flex h-7 justify-end" style={{ width }}>
      <motion.span className="relative" style={{ scale }}>
        <motion.span className={`absolute -inset-1 rounded-full ${tone === 'jade' ? 'bg-jade/40' : 'bg-lapis/40'} blur-[3px]`} style={{ opacity: halo }} />
        <Avatar name={name} tone={tone} size={28} className="relative" />
      </motion.span>
    </motion.span>
  );
}

/* ═════════════════════ 分享面板：免登二维码 ═════════════════════ */
export function ShareSheet() {
  const p = useProgress();
  const [a, b, c, d] = T.shareSheet;
  const visibility = useVisibility(p, a - 0.005, d + 0.005);
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [-24, 0, 0, -16], { rest: 0, easing: ease.out });
  const scale = useRange(p, [a, b], [0.96, 1], { rest: 1 });
  return (
    <motion.div
      className="glass-strong absolute right-3 top-2 z-40 w-[min(320px,calc(100%-1.5rem))] rounded-card border border-ink/[0.08] p-4 shadow-level-float gpu-layer [contain:layout_paint]"
      style={{ opacity, y, scale, visibility }}
    >
      <p className="text-sm font-semibold text-ink">邀请同行的人</p>
      <p className="mt-0.5 text-xs text-ink-soft">免注册 · 微信扫码即加入 · 7 天有效</p>
      <div className="mt-3 flex gap-3">
        <div className="relative rounded-control bg-paper p-2 border border-ink/[0.08] shadow-level-static">
          <svg viewBox="-1 -1 27 27" className="h-24 w-24" shapeRendering="crispEdges" aria-label="邀请二维码（演示）">
            <path d={QR} fill="rgb(58 46 31)" />
          </svg>
          <span className="absolute left-1/2 top-1/2 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-control bg-gradient-to-br from-gold to-ochre font-serif text-xs font-bold text-paper ring-2 ring-paper">旅</span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between text-xs">
          <span className="truncate rounded-control bg-ink/[0.05] px-2 py-1.5 font-mono tabular-nums text-ink border border-ink/[0.08]">tc.trip/j/西行-7QX</span>
          <div className="flex flex-col gap-1 text-ink-soft">
            <span className="flex items-center gap-1"><CheckIcon className="h-3 w-3 text-jade shrink-0" /> 可提名景点 / 美食</span>
            <span className="flex items-center gap-1"><CheckIcon className="h-3 w-3 text-jade shrink-0" /> 可评论与投票</span>
            <span className="flex items-center gap-1"><CheckIcon className="h-3 w-3 text-jade shrink-0" /> 改路线需领队确认</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 手机模拟：好友扫码加入 ═════════════════════ */
export function PhoneMock() {
  const p = useProgress();
  const [a, b, c, d] = T.phoneIn;
  const visibility = useVisibility(p, a - 0.005, d + 0.005);
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [120, 0, 0, 80], { easing: ease.out, rest: 0 });
  const rotate = useRange(p, [a, b], [10, -4], { rest: -4 });
  const tap = useRange(p, [T.phoneSteps[2] - 0.002, T.phoneSteps[2], T.phoneSteps[2] + 0.008], [0, 0.8, 0]);
  const tapScale = useRange(p, [T.phoneSteps[2], T.phoneSteps[2] + 0.008], [0.4, 1.8]);

  // 纯 MotionValue 状态直写，消除 4 次步骤触发的整屏 Phone 重渲染
  const screen1Opacity = useRange(p, [T.phoneSteps[1] - 0.002, T.phoneSteps[1] + 0.002], [1, 0]);
  const screen2Opacity = useRange(p, [T.phoneSteps[1] - 0.002, T.phoneSteps[1] + 0.002, T.phoneSteps[3] - 0.002, T.phoneSteps[3] + 0.002], [0, 1, 1, 0]);
  const screen3Opacity = useRange(p, [T.phoneSteps[3] - 0.002, T.phoneSteps[3] + 0.002], [0, 1]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-4 bottom-[-12px] z-50 hidden lg:block xl:-right-10 gpu-layer [contain:layout_paint]"
      style={{ opacity, y, rotate, visibility }}
    >
      <div className="relative h-[380px] w-[188px] rounded-[38px] bg-[#1b1a18] p-[7px] shadow-[0_40px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/10">
        <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-[#0f1114]">
          <div className="absolute left-1/2 top-2 z-10 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
          {/* 0~1: 扫码取景 */}
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ opacity: screen1Opacity }}>
            <p className="mb-4 text-xs font-medium text-white/80">扫一扫</p>
            <div className="relative h-32 w-32">
              {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
                <span key={c} className={`absolute h-5 w-5 border-[#2fd18b] ${c}`} />
              ))}
              <svg viewBox="-1 -1 27 27" className="absolute inset-4 opacity-70" shapeRendering="crispEdges">
                <path d={QR} fill="#e8e3d8" />
              </svg>
              <span className="absolute inset-x-2 top-0 h-full">
                <span className="block h-0.5 w-full animate-scanline bg-gradient-to-r from-transparent via-[#2fd18b] to-transparent shadow-[0_0_12px_#2fd18b]" />
              </span>
            </div>
            <p className="mt-4 text-xs text-white/60">将二维码放入框内</p>
          </motion.div>
          {/* 2~3: 邀请卡 */}
          <motion.div className="absolute inset-0 flex flex-col bg-sand p-4 pt-10 pointer-events-none" style={{ opacity: screen2Opacity }}>
            <div className="h-24 rounded-control bg-gradient-to-br from-dusk via-gold to-ochre p-3 text-paper">
              <p className="text-xs opacity-90">你被邀请加入</p>
              <p className="mt-1 font-serif text-lg font-bold leading-tight">西行计划</p>
              <p className="text-xs opacity-90">9 天 · 河西走廊 · 7座 MPV</p>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-ink-soft">
              <Avatar name="我" tone="gold" size={18} /> 来自领队 · 已有 3 人
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">无需注册与密码，加入后可提名想去的景点和想吃的店。</p>
            <div className="relative mt-auto">
              <span className="flex h-10 items-center justify-center rounded-control text-xs font-semibold text-paper bg-jade shadow-level-static">
                加入行程（免注册）
              </span>
              <motion.span className="absolute left-1/2 top-1/2 -ml-4 -mt-4 h-8 w-8 rounded-full bg-white" style={{ opacity: tap, scale: tapScale }} />
            </div>
          </motion.div>
          {/* 4: 已加入 */}
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center bg-sand pointer-events-none" style={{ opacity: screen3Opacity }}>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-jade text-paper shadow-level-static">
              <CheckIcon className="h-7 w-7" />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">阿杰，欢迎上车</p>
            <p className="mt-1 text-xs text-ink-soft">正在打开路书…</p>
          </motion.div>
        </div>
      </div>
      <span className="mt-2 block text-center text-xs font-medium text-ink-soft">阿杰的手机</span>
    </motion.div>
  );
}

/* ═════════════════════ 协同愿望池抽屉 ═════════════════════ */
const SEARCH = '正宁路夜市';
const REASON = '上过《舌尖上的中国》，离第一晚酒店走路就到，晚上必须去喝一碗！';
const SUGGESTIONS = [
  { name: '赵记牛奶鸡蛋醪糟', meta: '正宁路夜市 · 距 D0 酒店 950m · 评分 4.8' },
  { name: '正宁路烤肉一条街', meta: '正宁路夜市 · 人均 ¥45 · 评分 4.6' },
  { name: '马子禄牛肉面', meta: '大众巷 · 早餐 · 评分 4.7' },
];

export function CollabDrawer() {
  const p = useProgress();
  const { desktop } = useLayout();
  const [a, b, c, d] = T.drawer;
  const visibility = useVisibility(p, a - 0.005, d + 0.005);
  const x = useRange(p, [a, b, c, d], desktop ? [110, 0, 0, 110] : [0, 0, 0, 0], { easing: ease.out });
  const y = useRange(p, [a, b, c, d], desktop ? [0, 0, 0, 0] : [110, 0, 0, 110], { easing: ease.out });
  const opacity = useFade(p, a, a + 0.004, d - 0.004, d);
  const xs = useTransformPercent(x);
  const ys = useTransformPercent(y);

  const searchRef = useScrollTypewriter(p, SEARCH, T.searchType[0], T.searchType[1]);
  const reasonRef = useScrollTypewriter(p, REASON, T.reasonType[0], T.reasonType[1]);
  const suggestListOpacity = useRange(p, [T.suggestIn[0], T.suggestIn[0] + 0.003, T.suggestPick, T.suggestPick + 0.003], [0, 1, 1, 0]);
  const detailOpacity = useRange(p, [T.suggestPick, T.suggestPick + 0.003], [0, 1]);

  return (
    <motion.aside
      aria-label="协同愿望池"
      className="glass-strong absolute inset-x-0 bottom-0 z-40 flex h-[86%] flex-col rounded-t-container border border-ink/[0.08] p-4 shadow-level-float md:inset-x-auto md:bottom-3 md:right-3 md:top-3 md:h-auto md:w-[340px] md:rounded-container gpu-layer [contain:layout_paint]"
      style={{ x: xs, y: ys, opacity, visibility }}
    >
      <div className="flex items-center gap-2">
        <span className="font-serif text-base font-semibold text-ink">愿望池</span>
        <span className="text-xs text-ink-soft">想去的 · 想吃的，先丢进来</span>
      </div>
      <div className="mt-1 flex items-center gap-1.5 text-xs text-jade">
        <Avatar name="阿杰" tone="jade" size={18} /> 阿杰 正在添加…
      </div>
      <div className="mt-3 flex gap-2">
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft border border-ink/[0.08] inline-flex items-center gap-1">
          <PinIcon className="h-3 w-3 text-gold" />
          <span>景点</span>
        </span>
        <span className="chip rounded-pill bg-ink text-paper shadow-level-static inline-flex items-center gap-1">
          <UtensilsIcon className="h-3 w-3 text-gold" />
          <span>美食</span>
        </span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft border border-ink/[0.08] inline-flex items-center gap-1">
          <HotelIcon className="h-3 w-3 text-ink-soft" />
          <span>住宿</span>
        </span>
      </div>
      <div className="mt-3 flex h-11 items-center gap-2 rounded-control bg-paper px-3 border border-ink/[0.08] shadow-level-static">
        <SearchIcon className="h-4 w-4 text-ink-soft shrink-0" />
        <span className="text-sm text-ink">
          <span ref={searchRef}>{SEARCH}</span>
        </span>
        <span className="h-4 w-[2px] animate-caret bg-gold" />
      </div>

      <div className="relative mt-3 min-h-0 flex-1">
        {/* 联想列表：纯 MotionValue 控制显隐 */}
        <motion.ul className="absolute inset-x-0 top-0 flex flex-col gap-1.5 pointer-events-none" style={{ opacity: suggestListOpacity }}>
          <FirstSuggestionItem name={SUGGESTIONS[0].name} meta={SUGGESTIONS[0].meta} />
          {SUGGESTIONS.slice(1).map((s) => (
            <li key={s.name} className="rounded-control bg-paper/75 px-3 py-2 border border-ink/[0.08] shadow-level-static">
              <p className="text-xs font-semibold text-ink md:text-sm">{s.name}</p>
              <p className="text-xs tabular-nums text-ink-soft">{s.meta}</p>
            </li>
          ))}
        </motion.ul>
        {/* 已选详情 + 推荐理由：纯 MotionValue 控制显隐 */}
        <motion.div className="absolute inset-x-0 top-0 flex flex-col gap-2.5 pointer-events-none" style={{ opacity: detailOpacity }}>
          <div className="flex gap-3 rounded-control bg-paper/85 p-2.5 border border-ink/[0.08] shadow-level-static">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-control bg-gold/15 text-gold-ink">
              <UtensilsIcon className="h-7 w-7 text-gold-ink" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-ink">赵记牛奶鸡蛋醪糟</span>
              <span className="block text-xs tabular-nums text-ink-soft font-mono">正宁路夜市 · 人均 ¥15</span>
              <span className="mt-1 inline-block rounded-control bg-jade/10 px-1.5 text-xs font-semibold tabular-nums text-jade font-mono">距 D0 酒店 950m</span>
            </span>
          </div>
          <div className="min-h-[72px] rounded-control bg-paper px-3 py-2 text-xs leading-relaxed text-ink border border-ink/[0.08] shadow-level-static md:text-sm">
            <span className="mb-1 block text-xs font-semibold text-ink-soft">推荐理由</span>
            <span ref={reasonRef}>{REASON}</span>
          </div>
          <CollabSubmitButton />
        </motion.div>
        <FakeCursor times={[T.suggestIn[1], T.suggestPick - 0.002]} xs={[80, 40]} ys={[80, 12]} clickAt={T.suggestPick} label="阿杰" />
        <FakeCursor times={[T.reasonType[1] - 0.002, T.submitClick - 0.002]} xs={[85, 60]} ys={[60, 66]} clickAt={T.submitClick} label="阿杰" />
      </div>
      <Reveal at={[T.drawer[1], T.drawer[1] + 0.006]} y={4} className="pt-3 text-xs text-ink-soft">
        提名进入「待决池」，不会直接改动路线 · 由领队与算法共同编排
      </Reveal>
    </motion.aside>
  );
}

function FirstSuggestionItem({ name, meta }: { name: string; meta: string }) {
  const p = useProgress();
  const picked = useStep(p, [T.suggestPick]) === 1;
  return (
    <li
      className={`rounded-control px-3 py-2 border transition-colors duration-200 ${picked ? 'bg-gold/15 border-gold/50 shadow-level-static' : 'border-ink/[0.08] bg-paper/75'}`}
    >
      <p className="text-xs font-semibold text-ink md:text-sm">{name}</p>
      <p className="text-xs tabular-nums text-ink-soft">{meta}</p>
    </li>
  );
}

function CollabSubmitButton() {
  const p = useProgress();
  const submitPress = useRange(p, [T.submitClick - 0.003, T.submitClick, T.submitClick + 0.003], [1, 0.92, 1]);
  const submitted = useStep(p, [T.submitClick + 0.001]) === 1;
  return (
    <motion.span
      className={`btn-primary flex h-11 items-center justify-center gap-1.5 rounded-control text-sm font-semibold shadow-level-hover ${submitted ? 'bg-jade text-paper shadow-level-static' : ''}`}
      style={{ scale: submitPress }}
    >
      {submitted ? (
        <>
          <CheckIcon className="h-4 w-4" />
          <span>已放进愿望池</span>
        </>
      ) : (
        '放进愿望池'
      )}
    </motion.span>
  );
}

function useTransformPercent(v: MotionValue<number>) {
  return useTransform(v, (n) => `${n}%`);
}
