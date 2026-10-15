'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { qrPath } from '@/data/trip';
import { ease, interp, useFade, useRange, useScrollTypewriter, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, FakeCursor, Reveal, useLayout, useProgress } from './primitives';
import {
  PinIcon,
  UtensilsIcon,
  HotelIcon,
  SearchIcon,
  CheckIcon,
  ShieldIcon,
  SparklesIcon,
  CompassIcon,
  FlameIcon,
  RadioIcon,
  CommandIcon,
  ShareIcon,
  SmartphoneIcon,
  CarIcon,
  PlayIcon,
  PauseIcon,
  LayersIcon,
  FileTextIcon,
} from '@/components/common/Icons';

const QR = qrPath();

/** macOS 经典红黄绿交通灯控制按钮群 */
export function MacTrafficLights() {
  return (
    <div
      className="group/traffic flex shrink-0 items-center gap-1.5 sm:gap-2 select-none py-1 pr-1.5 sm:pr-2.5"
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

export interface TourControls {
  activeTab: number;
  totalTabs: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onPrev: () => void;
  onNext: () => void;
}

/* ═════════════════════ App 原生界面顶栏 (单层真实桌面应用主标题栏) ═════════════════════ */
export function Topbar() {
  const p = useProgress();
  const shareGlow = useFade(p, T.shareCursor[0], T.shareClick, T.shareSheet[2], T.shareSheet[3]);
  const sharePress = useRange(p, [T.shareClick - 0.003, T.shareClick, T.shareClick + 0.003], [1, 0.9, 1]);

  return (
    <header className="relative z-30 flex h-11 shrink-0 items-center justify-between gap-3 border-b border-ink/[0.08] bg-[#FAF8F5] px-3 sm:px-4 select-none">
      {/* 顶部微高光反光层 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent" />

      {/* 左侧：macOS 交通灯 + TripCraft Studio + 项目标题 + 本地持久化状态 */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 min-w-0">
        <MacTrafficLights />

        <div className="flex items-center gap-1.5 pl-1 pr-2.5 border-r border-ink/10">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-[#FE3C01] text-[11px] font-bold text-white shadow-sm">
            旅
          </span>
          <span className="font-semibold text-xs tracking-tight text-[#241E20] hidden sm:inline whitespace-nowrap">
            TripCraft Studio
          </span>
        </div>

        {/* 真实文档标题 + 本地存储状态 */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs text-[#241E20] whitespace-nowrap">
            西行计划 · 9D 深度自驾
          </span>
          <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-500/10 text-emerald-700 font-mono font-medium border border-emerald-500/20 shrink-0 whitespace-nowrap">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>本地已保存 (IndexedDB)</span>
          </span>
        </div>
      </div>

      {/* 中间：真实桌面软件视图切换器 (路书编排 / GIS沙盘 / 全景工作台) + 快捷搜索 (⌘K) */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        <div className="flex items-center rounded-lg bg-black/[0.04] p-0.5 text-xs font-medium text-ink-soft border border-black/[0.04]">
          <span className="flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-ink font-semibold shadow-sm whitespace-nowrap">
            <CompassIcon className="w-3.5 h-3.5 text-[#FE3C01]" />
            <span>路书沙盘工作台</span>
          </span>
          <span className="flex items-center gap-1.5 px-2.5 py-1 text-ink-soft hover:text-ink transition-colors cursor-pointer whitespace-nowrap">
            <LayersIcon className="w-3.5 h-3.5 text-ink-soft" />
            <span>日程全景</span>
          </span>
        </div>

        <span
          title="全局检索 (⌘K)"
          className="hidden xl:inline-flex items-center gap-1.5 rounded-lg border border-ink/[0.08] bg-black/[0.02] px-2.5 py-1 text-[11px] text-ink-soft hover:bg-black/[0.05] transition-colors cursor-pointer whitespace-nowrap"
        >
          <SearchIcon className="h-3 w-3" />
          <span>搜索景点、限高桩号</span>
          <kbd className="font-mono text-[9px] bg-black/[0.06] px-1 py-0.2 rounded text-ink/70">⌘K</kbd>
        </span>
      </div>

      {/* 右侧：在线协作者头像栈 + 邀请按钮 + 离线单文件导出 */}
      <div className="flex items-center gap-2 shrink-0">
        <AvatarStack />

        {/* 邀请好友加入按钮 */}
        <motion.button
          type="button"
          aria-label="邀请同行人加入协作"
          className="btn-primary relative flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold shadow-sm hover:shadow whitespace-nowrap"
          style={{ scale: sharePress }}
        >
          <motion.span className="absolute inset-0 rounded-full shadow-glow" style={{ opacity: shareGlow }} />
          <ShareIcon className="h-3 w-3" />
          <span className="relative">邀请同行</span>
        </motion.button>
        <FakeCursor times={[T.shareCursor[0], T.shareCursor[1]]} xs={[78, 95]} ys={[260, 55]} clickAt={T.shareClick} />

        {/* 离线单文件导出按钮 */}
        <button
          type="button"
          title="导出零构建自包含离线路书 (.html)"
          className="hidden sm:flex h-7 items-center gap-1.5 rounded-full border border-ink/[0.12] bg-white px-3 text-xs font-semibold text-ink hover:bg-ink/[0.04] transition-colors shadow-sm whitespace-nowrap"
        >
          <FileTextIcon className="h-3 w-3 text-gold-ink" />
          <span>导出单文件</span>
        </button>
      </div>
    </header>
  );
}

function CommandPaletteBadge() {
  return (
    <span
      title="全局指令面板 (⌘K)"
      className="hidden xl:inline-flex items-center gap-1 rounded-control border border-ink/[0.08] bg-ink/[0.03] px-2 py-0.5 text-[10px] font-mono text-ink-soft"
    >
      <CommandIcon className="h-2.5 w-2.5" />
      <span>K</span>
    </span>
  );
}

function MultiDeviceSyncBadge() {
  const p = useProgress();
  const opacity = useFade(p, 0.42, 0.435);
  const isCh5 = useStep(p, [0.84]) === 1;
  return (
    <motion.span
      className="hidden items-center gap-1 rounded-pill border border-jade/30 bg-jade/10 px-2 py-0.5 text-[11px] font-medium text-jade md:inline-flex"
      style={{ opacity }}
      title="多端云同频 · 极速双向同步"
    >
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade opacity-75" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-jade" />
      </span>
      <span className="font-mono text-[10px]">{isCh5 ? '3端+车机同频' : '3端云同频'}</span>
    </motion.span>
  );
}

function DisasterRecoveryBadge() {
  const p = useProgress();
  const opacity = useFade(p, T.timelineIn[1], T.timelineIn[1] + 0.02);
  return (
    <motion.span
      className="hidden items-center gap-1 rounded-pill border border-gold/30 bg-gold/10 px-2 py-0.5 text-[11px] font-medium text-gold-ink xl:inline-flex"
      style={{ opacity }}
      title="多端云同频极速同步 · 无人区离线容灾就绪"
    >
      <ShieldIcon className="h-3 w-3 text-gold-ink" />
      <span className="font-mono text-[10px]">离线容灾防护</span>
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
      className={`chip rounded-pill hidden px-1.5 py-0 font-mono tabular-nums text-[10px] border transition-colors duration-500 sm:inline-flex ${
        ver ? 'bg-jade/10 text-jade border-jade/30 font-semibold' : 'bg-ink/[0.05] text-ink-soft border-ink/[0.08]'
      }`}
      style={{ opacity: verOpacity, scale: verPulse }}
    >
      {ver ? 'v1.1' : 'v1.0'}
    </motion.span>
  );
}

function AvatarStack() {
  return (
    <div className="flex items-center">
      <Avatar name="我" tone="gold" size={24} />
      <JoiningAvatar name="阿杰" tone="jade" range={T.joinAJie} />
      <JoiningAvatar name="小雨" tone="lapis" range={T.joinXiaoyu} />
    </div>
  );
}

function JoiningAvatar({ name, tone, range }: { name: string; tone: 'jade' | 'lapis'; range: readonly [number, number] }) {
  const p = useProgress();
  const width = useRange(p, [range[0], range[1]], [0, 18]);
  const scale = useRange(p, [range[0], range[1]], [0, 1], { easing: ease.back });
  const halo = useRange(p, [range[1], range[1] + 0.006, range[1] + 0.03], [0, 1, 0.35]);
  return (
    <motion.span className="relative flex h-6 justify-end" style={{ width }}>
      <motion.span className="relative" style={{ scale }}>
        <motion.span className={`absolute -inset-1 rounded-full ${tone === 'jade' ? 'bg-jade/40' : 'bg-lapis/40'} blur-[3px]`} style={{ opacity: halo }} />
        <Avatar name={name} tone={tone} size={24} className="relative" />
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
      role="dialog"
      aria-label="邀请同行人加入路书协同"
    >
      <div className="flex items-center justify-between pb-1 border-b border-ink/[0.06]">
        <p className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <SmartphoneIcon className="h-4 w-4 text-gold" />
          <span>邀请同行人实时协同</span>
        </p>
        <span className="chip rounded-pill bg-jade/10 text-jade text-[10px] px-1.5 py-0 font-medium">微信免登</span>
      </div>
      <p className="mt-1 text-xs text-ink-soft">免注册 · 微信扫码即加入 · 权限受控</p>

      <div className="mt-3 flex gap-3">
        <div className="relative rounded-control bg-paper p-2 border border-ink/[0.08] shadow-level-static">
          <svg viewBox="-1 -1 27 27" className="h-22 w-22" shapeRendering="crispEdges" aria-label="邀请二维码（演示）">
            <path d={QR} fill="rgb(58 46 31)" />
          </svg>
          <span className="absolute left-1/2 top-1/2 flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-control bg-gradient-to-br from-gold to-ochre font-serif text-[10px] font-bold text-paper ring-2 ring-paper">
            旅
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between text-xs">
          <span className="truncate rounded-control bg-ink/[0.05] px-2 py-1 font-mono tabular-nums text-ink border border-ink/[0.08] text-[11px]">
            tc.trip/j/西行-7QX
          </span>
          <div className="flex flex-col gap-1 text-ink-soft text-[11px]">
            <span className="flex items-center gap-1">
              <CheckIcon className="h-3 w-3 text-jade shrink-0" />
              <span>微信扫码免登 · 3 人实时同频</span>
            </span>
            <span className="flex items-center gap-1">
              <CheckIcon className="h-3 w-3 text-jade shrink-0" />
              <span>愿望池自由提名与点赞投票</span>
            </span>
            <span className="flex items-center gap-1 text-gold-ink font-medium">
              <ShieldIcon className="h-3 w-3 text-gold-ink shrink-0" />
              <span>路线变更领队确认 · 车机秒级流转</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 手机模拟：高保真好友扫码与随身协同端 ═════════════════════ */
export function PhoneMock() {
  const p = useProgress();
  const [a, b, c, d] = T.phoneIn;
  const hA = T.phoneHandoff[0] - 0.008;
  const hB = T.phoneHandoff[0];
  const hC = T.cockpitIn[1];
  const hD = T.cockpitIn[1] + 0.012;

  // 手机模拟器在共创扫码阶段与采纳后手车流转阶段平滑现身
  const visibility = useTransform(p, (v) => {
    if ((v >= a - 0.005 && v <= d + 0.005) || (v >= hA - 0.005 && v <= hD + 0.005)) {
      return 'visible';
    }
    return 'hidden';
  });

  const opacity = useTransform(p, (v) => {
    if (v >= a - 0.005 && v <= d + 0.005) {
      return interp(v, [a, b, c, d], [0, 1, 1, 0]);
    }
    if (v >= hA - 0.005 && v <= hD + 0.005) {
      return interp(v, [hA, hB, hC, hD], [0, 1, 1, 0]);
    }
    return 0;
  });

  const y = useTransform(p, (v) => {
    if (v >= hA - 0.005 && v <= hD + 0.005) {
      return interp(v, [hA, hB, hC, hD], [80, 0, 0, 60], ease.out);
    }
    return interp(v, [a, b, c, d], [120, 0, 0, 80], ease.out);
  });

  const rotate = useRange(p, [a, b], [8, -3], { rest: -3 });
  const tap = useRange(p, [T.phoneSteps[2] - 0.002, T.phoneSteps[2], T.phoneSteps[2] + 0.008], [0, 0.8, 0]);
  const tapScale = useRange(p, [T.phoneSteps[2], T.phoneSteps[2] + 0.008], [0.4, 1.8]);

  // 镜头 1 投车按钮按压
  const handoffPress = useRange(p, [T.streamFly[0] - 0.003, T.streamFly[0], T.streamFly[0] + 0.004], [1, 0.92, 1]);
  const handoffGlow = useRange(p, [T.streamFly[0] - 0.004, T.streamFly[0], T.streamFly[0] + 0.008], [0, 1, 0]);

  // 纯 MotionValue 状态切换
  const screen1Opacity = useRange(p, [T.phoneSteps[1] - 0.002, T.phoneSteps[1] + 0.002], [1, 0]);
  const screen2Opacity = useRange(p, [T.phoneSteps[1] - 0.002, T.phoneSteps[1] + 0.002, T.phoneSteps[3] - 0.002, T.phoneSteps[3] + 0.002], [0, 1, 1, 0]);
  const screen3Opacity = useRange(p, [T.phoneSteps[3] - 0.002, T.phoneSteps[3] + 0.002, hA, hA + 0.004], [0, 1, 1, 0]);
  const screen4Opacity = useRange(p, [hA, hA + 0.004], [0, 1]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute right-2 sm:right-4 md:-right-1 lg:-right-4 xl:-right-6 bottom-5 sm:bottom-7 md:bottom-6 lg:bottom-7 z-50 origin-bottom-right scale-[0.78] xs:scale-[0.85] sm:scale-[0.92] md:scale-100 gpu-layer"
      style={{ opacity, y, rotate, visibility }}
    >
      {/* 现代智能手机高保真外壳 (全圆角 3D 悬浮，无硬裁切，深度物理阴影) */}
      <div className="relative h-[390px] w-[195px] rounded-[38px] bg-[#1a1c23] p-[7px] shadow-[0_28px_65px_rgba(15,23,42,0.48),0_12px_24px_rgba(15,23,42,0.22)] ring-1 ring-white/20">
        <div className="relative h-full w-full overflow-hidden rounded-[31px] bg-[#0c0e14] text-white">
          {/* 顶部灵动岛与状态栏 */}
          <div className="absolute inset-x-0 top-0 z-30 flex h-7 items-center justify-between px-3 text-[9px] font-mono">
            <span className="font-semibold text-white/90">20:00</span>
            <div className="absolute left-1/2 top-1.5 h-3.5 w-16 -translate-x-1/2 rounded-full bg-black ring-1 ring-white/10" />
            <span className="text-white/70">5G · 98%</span>
          </div>

          {/* 状态 1: 微信扫码取景器 */}
          <motion.div className="absolute inset-0 flex flex-col items-center justify-center p-3 pt-6 pointer-events-none" style={{ opacity: screen1Opacity }}>
            <p className="mb-2 text-[11px] font-medium text-white/80">微信扫一扫 · 免登加入</p>
            <div className="relative h-28 w-28">
              {['left-0 top-0 border-l-2 border-t-2', 'right-0 top-0 border-r-2 border-t-2', 'left-0 bottom-0 border-l-2 border-b-2', 'right-0 bottom-0 border-r-2 border-b-2'].map((c) => (
                <span key={c} className={`absolute h-4 w-4 border-[#2fd18b] ${c}`} />
              ))}
              <svg viewBox="-1 -1 27 27" className="absolute inset-3 opacity-60" shapeRendering="crispEdges">
                <path d={QR} fill="#ffffff" />
              </svg>
              <span className="absolute inset-x-1 top-0 h-full">
                <span className="block h-0.5 w-full animate-scanline bg-gradient-to-r from-transparent via-[#2fd18b] to-transparent shadow-[0_0_12px_#2fd18b]" />
              </span>
            </div>
            <p className="mt-3 text-[10px] text-white/60">已识别: 西行计划协同空间</p>
          </motion.div>

          {/* 状态 2: 微信小程序入队邀请卡 */}
          <motion.div className="absolute inset-0 flex flex-col bg-sand p-3 pt-8 text-ink pointer-events-none" style={{ opacity: screen2Opacity }}>
            <div className="rounded-control bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 p-2.5 text-paper shadow-level-static">
              <span className="chip rounded-pill bg-gold/25 text-gold text-[9px] px-1.5 py-0 font-medium">TripCraft 微信协同</span>
              <p className="mt-1 font-serif text-base font-bold leading-tight text-white">西行计划</p>
              <p className="text-[10px] text-slate-300">9 天 · 河西走廊 · 7座 MPV</p>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-ink-soft">
              <Avatar name="我" tone="gold" size={18} />
              <span>来自领队邀请 · 3 人协同在线</span>
            </div>
            <p className="mt-2 text-[10px] leading-relaxed text-ink-soft">免注册免密码，微信扫码秒入，愿望池自由提名与点赞投票，中控秒级同频。</p>
            <div className="relative mt-auto pb-1">
              <span className="flex h-9 items-center justify-center rounded-control text-xs font-semibold text-paper bg-jade shadow-level-static">
                一键加入行程 (微信免登)
              </span>
              <motion.span className="absolute left-1/2 top-1/2 -ml-3.5 -mt-3.5 h-7 w-7 rounded-full bg-white" style={{ opacity: tap, scale: tapScale }} />
            </div>
          </motion.div>

          {/* 状态 3: TripCraft 移动端原生路书界面 */}
          <motion.div className="absolute inset-0 flex flex-col bg-sand text-ink pointer-events-none" style={{ opacity: screen3Opacity }}>
            {/* 移动端 App 顶栏 */}
            <div className="flex items-center justify-between border-b border-ink/[0.08] bg-paper px-3 pt-8 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded bg-gold text-paper flex items-center justify-center text-[9px] font-bold">旅</span>
                <span className="text-[11px] font-bold text-ink">TripCraft 随身路书</span>
              </div>
              <span className="chip rounded-pill bg-jade/15 text-jade text-[9px] px-1 py-0 font-medium">● 实时同频</span>
            </div>

            {/* 欢迎加入与操作提示 */}
            <div className="p-2 space-y-1.5 flex-1 overflow-hidden flex flex-col justify-between">
              <div className="rounded-control bg-jade/10 p-2 border border-jade/30">
                <p className="text-[11px] font-bold text-jade flex items-center gap-1">
                  <CheckIcon className="h-3 w-3" />
                  <span>阿杰，欢迎上车！</span>
                </p>
                <p className="text-[9px] text-ink-soft mt-0.5">全团最新路线已秒级同频 · 离线容灾就绪</p>
              </div>

              {/* 阿杰正在提名的 POI 卡片 */}
              <div className="rounded-control bg-paper p-2 border border-gold/40 shadow-level-static">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-gold-ink uppercase font-mono">D0 晚间候选</span>
                  <span className="chip rounded-pill bg-gold/15 text-gold-ink text-[8px] px-1">4.8分</span>
                </div>
                <p className="text-[11px] font-bold text-ink mt-0.5 truncate">正宁路夜市 · 牛奶鸡蛋醪糟</p>
                <p className="text-[9px] text-ink-soft font-mono">距酒店 950m · 步行即达</p>
                <div className="mt-1.5 flex items-center justify-between border-t border-ink/[0.06] pt-1 text-[8px]">
                  <span className="text-jade font-medium">✓ 已提交至待决池</span>
                  <span className="text-ink-soft">待领队一键确认</span>
                </div>
              </div>

              {/* 移动端底栏指示 */}
              <div className="rounded-control bg-ink/[0.04] p-1 text-center text-[8px] font-mono text-ink-soft">
                ⚡ 多端云协同实时同频 · 微信免登
              </div>
            </div>
          </motion.div>

          {/* 状态 4: 镜头 1 副驾手机端一键投车 (Companion Handoff) */}
          <motion.div className="absolute inset-0 flex flex-col bg-[#111319] text-white pointer-events-none" style={{ opacity: screen4Opacity }}>
            {/* 移动端 App 顶栏 */}
            <div className="flex items-center justify-between border-b border-white/10 bg-[#161a24] px-3 pt-8 pb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-4 w-4 rounded bg-gold text-paper flex items-center justify-center text-[9px] font-bold">旅</span>
                <span className="text-[11px] font-bold text-white">随身协同 · 阿杰</span>
              </div>
              <span className="chip rounded-pill bg-jade/20 text-jade text-[8px] font-mono font-bold px-1.5">
                v1.1 已对齐
              </span>
            </div>

            <div className="p-2 space-y-1.5 flex-1 overflow-hidden flex flex-col justify-between">
              <div className="rounded-control bg-gold/15 p-2 border border-gold/40">
                <p className="text-[10px] font-bold text-gold flex items-center gap-1">
                  <SparklesIcon className="h-3 w-3" />
                  <span>领队已确认新路线</span>
                </p>
                <p className="text-[9px] text-white/70 mt-0.5">检测到车载座舱在线 · 推荐流转</p>
              </div>

              <div className="rounded-control bg-white/5 p-2 border border-white/10 text-[9px]">
                <div className="flex items-center justify-between text-white/80">
                  <span className="font-bold text-white truncate">正宁路夜市 (加点)</span>
                  <span className="text-jade font-mono font-bold">已并入</span>
                </div>
                <p className="text-white/50 text-[8px] mt-0.5 font-mono">目标车机: 腾势 D9 C-CABIN</p>
              </div>

              {/* 一键投车高光交互按钮 */}
              <div className="relative mt-auto pb-1">
                <motion.div
                  className="relative flex h-9 items-center justify-center gap-1 rounded-control text-xs font-bold text-paper bg-gradient-to-r from-gold to-ochre shadow-[0_0_16px_rgba(212,160,78,0.6)]"
                  style={{ scale: handoffPress }}
                >
                  <CarIcon className="h-3.5 w-3.5 text-paper" />
                  <span>一键流转至车机</span>
                </motion.div>
                <motion.span
                  className="absolute inset-0 rounded-control bg-white/40 pointer-events-none"
                  style={{ opacity: handoffGlow }}
                />
              </div>

              <div className="text-center font-mono text-[7px] text-white/50">
                ⚡ 车路云协同网络 · 18ms 秒级同步
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex justify-center">
        <span className="mt-1.5 sm:mt-2 inline-flex items-center justify-center gap-1 text-[10px] sm:text-xs font-semibold text-[#1E2024]/75 bg-white/90 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-black/8 shadow-sm">
          副驾阿杰的手机 · 随身协同端
        </span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 协同愿望池抽屉 (In-App POI Nomination Drawer) ═════════════════════ */
const SEARCH = '正宁路夜市';
const REASON = '上过《舌尖上的中国》，离第一晚酒店走路就到，晚上必须去喝一碗！';
const SUGGESTIONS = [
  { name: '赵记牛奶鸡蛋醪糟 (正宗老店)', meta: '正宁路夜市 · 距 D0 酒店 950m · 评分 4.8 · 地面停车畅通' },
  { name: '正宁路烤肉一条街', meta: '正宁路夜市 · 人均 ¥45 · 评分 4.6' },
  { name: '马子禄牛肉面', meta: '大众巷 · 早餐名店 · 评分 4.7' },
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
      className="glass-strong absolute inset-x-0 bottom-0 z-40 flex h-[82%] sm:h-[86%] flex-col rounded-t-container border border-ink/[0.08] p-3 sm:p-4 shadow-level-float md:inset-x-auto md:bottom-3 md:right-3 md:top-3 md:h-auto md:w-[350px] md:rounded-container gpu-layer [contain:layout_paint]"
      style={{ x: xs, y: ys, opacity, visibility }}
    >
      <div className="flex items-center justify-between border-b border-ink/[0.06] pb-2">
        <div>
          <span className="font-serif text-base font-semibold text-ink flex items-center gap-1.5">
            <FlameIcon className="h-4 w-4 text-gold" />
            <span>愿望池提名</span>
          </span>
          <span className="text-[11px] text-ink-soft">想去的 · 想吃的，全员实时共创</span>
        </div>
        <span className="chip rounded-pill bg-jade/10 text-jade text-[10px] px-1.5 py-0 font-medium flex items-center gap-1">
          <Avatar name="阿杰" tone="jade" size={16} />
          <span>阿杰正在编辑</span>
        </span>
      </div>

      {/* 类别筛选 */}
      <div className="mt-2.5 flex gap-1.5">
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft border border-ink/[0.08] inline-flex items-center gap-1 text-xs">
          <PinIcon className="h-3 w-3 text-gold" />
          <span>景点</span>
        </span>
        <span className="chip rounded-pill bg-blue-900 text-paper shadow-level-static inline-flex items-center gap-1 text-xs font-semibold">
          <UtensilsIcon className="h-3 w-3 text-gold" />
          <span>美食 (已选)</span>
        </span>
        <span className="chip rounded-pill bg-ink/[0.05] text-ink-soft border border-ink/[0.08] inline-flex items-center gap-1 text-xs">
          <HotelIcon className="h-3 w-3 text-ink-soft" />
          <span>住宿</span>
        </span>
      </div>

      {/* POI 搜索输入框 */}
      <div className="mt-2.5 flex h-10 items-center gap-2 rounded-control bg-paper px-3 border border-ink/[0.08] shadow-level-static">
        <SearchIcon className="h-4 w-4 text-ink-soft shrink-0" />
        <span className="text-xs sm:text-sm text-ink font-medium">
          <span ref={searchRef}>{SEARCH}</span>
        </span>
        <span className="h-4 w-[2px] animate-caret bg-gold" />
      </div>

      <div className="relative mt-2.5 min-h-0 flex-1">
        {/* 联想列表：纯 MotionValue 控制显隐 */}
        <motion.ul className="absolute inset-x-0 top-0 flex flex-col gap-1.5 pointer-events-none" style={{ opacity: suggestListOpacity }}>
          <FirstSuggestionItem name={SUGGESTIONS[0].name} meta={SUGGESTIONS[0].meta} />
          {SUGGESTIONS.slice(1).map((s) => (
            <li key={s.name} className="rounded-control bg-paper/75 px-2.5 py-2 border border-ink/[0.08] shadow-level-static">
              <p className="text-xs font-semibold text-ink">{s.name}</p>
              <p className="text-[11px] tabular-nums text-ink-soft">{s.meta}</p>
            </li>
          ))}
        </motion.ul>

        {/* 已选详情 + 推荐理由：纯 MotionValue 控制显隐 */}
        <motion.div className="absolute inset-x-0 top-0 flex flex-col gap-2 pointer-events-none" style={{ opacity: detailOpacity }}>
          <div className="flex gap-2.5 rounded-control bg-paper/90 p-2.5 border border-ink/[0.08] shadow-level-static">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-gold/15 text-gold-ink">
              <UtensilsIcon className="h-6 w-6 text-gold-ink" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs sm:text-sm font-semibold text-ink truncate">赵记牛奶鸡蛋醪糟</span>
              <span className="block text-[11px] tabular-nums text-ink-soft font-mono">正宁路夜市 · 评分 4.8 · 人均 ¥15</span>
              <span className="mt-0.5 inline-block rounded-control bg-jade/10 px-1.5 text-[10px] font-semibold tabular-nums text-jade font-mono">
                距 D0 酒店 950m · 步道平坦
              </span>
            </span>
          </div>

          <div className="min-h-[64px] rounded-control bg-paper px-3 py-2 text-xs leading-relaxed text-ink border border-ink/[0.08] shadow-level-static">
            <span className="mb-0.5 block text-[10px] font-semibold uppercase tracking-wider text-ink-soft">推荐理由</span>
            <span ref={reasonRef}>{REASON}</span>
          </div>

          <CollabSubmitButton />
        </motion.div>

        <FakeCursor times={[T.suggestIn[1], T.suggestPick - 0.002]} xs={[80, 40]} ys={[80, 12]} clickAt={T.suggestPick} label="阿杰" />
        <FakeCursor times={[T.reasonType[1] - 0.002, T.submitClick - 0.002]} xs={[85, 60]} ys={[60, 66]} clickAt={T.submitClick} label="阿杰" />
      </div>

      <Reveal at={[T.drawer[1], T.drawer[1] + 0.006]} y={4} className="pt-2 text-[11px] text-ink-soft border-t border-ink/[0.06]">
        提名进入「愿望池」实时广播 · 经算法顺路重排，由领队一键确认生效
      </Reveal>
    </motion.aside>
  );
}

function FirstSuggestionItem({ name, meta }: { name: string; meta: string }) {
  const p = useProgress();
  const picked = useStep(p, [T.suggestPick]) === 1;
  return (
    <li
      className={`rounded-control px-2.5 py-2 border transition-colors duration-200 ${
        picked ? 'bg-gold/15 border-gold/50 shadow-level-static' : 'border-ink/[0.08] bg-paper/75'
      }`}
    >
      <p className="text-xs font-semibold text-ink">{name}</p>
      <p className="text-[11px] tabular-nums text-ink-soft">{meta}</p>
    </li>
  );
}

function CollabSubmitButton() {
  const p = useProgress();
  const submitPress = useRange(p, [T.submitClick - 0.003, T.submitClick, T.submitClick + 0.003], [1, 0.92, 1]);
  const submitted = useStep(p, [T.submitClick + 0.001]) === 1;
  return (
    <motion.span
      className={`btn-primary flex h-10 items-center justify-center gap-1.5 rounded-control text-xs sm:text-sm font-semibold shadow-level-hover ${
        submitted ? 'bg-jade text-paper shadow-level-static' : ''
      }`}
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
