'use client';

import { motion, useTransform } from 'framer-motion';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, Reveal, useProgress } from './primitives';
import {
  CarIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  UtensilsIcon,
  RadioIcon,
  SmartphoneIcon,
  MonitorIcon,
} from '@/components/common/Icons';

/**
 * 05 章：多端同频 · 全团同行（SHOWCASE §4 终态闭环）
 *
 * 核心设计原则：
 * 1. 桌面三栏工作台作为母体保持清晰可见（不淡出、不缩小隐藏）。
 * 2. 前台下层以 Continuity 连续互联质感浮动底座，优雅呼应副驾随身手机、座舱车机大屏与随身离线安全锦囊，展现多端实时流转。
 * 3. 展现从“手端/协同端决策，到车机无缝流转，再到智驾系统巡航导航与限高避险”的完整闭环。
 * 4. 常驻强调“线上实时多端协同，离线安全从容兜底”。
 */
export function DeliverScene() {
  const p = useProgress();
  const visibility = useVisibility(p, T.syncStart[0] - 0.01, 1.0);
  const deckOpacity = useFade(p, T.devicesIn[0], T.devicesIn[1]);
  const deckScale = useRange(p, [T.devicesIn[0], T.devicesIn[1]], [0.95, 1], { easing: ease.back, rest: 1 });
  const deckY = useRange(p, [T.devicesIn[0], T.devicesIn[1]], [36, 0], { easing: ease.out, rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex flex-col justify-end overflow-hidden pb-1 sm:pb-2.5 px-2 sm:px-4 md:px-6 gpu-layer [contain:layout_paint]"
      style={{ visibility }}
      role="region"
      aria-label="多端同频与智能座舱流转演示"
    >
      <motion.div
        className="pointer-events-auto flex flex-col items-center w-full max-w-[1080px] mx-auto glass-strong rounded-container border border-slate-200/60 p-2 sm:p-3 shadow-level-float backdrop-blur-2xl"
        style={{ opacity: deckOpacity, scale: deckScale, y: deckY }}
      >
        {/* 多端实时同频流转连接条 */}
        <SyncFlowBar />

        {/* 多设备并列场景：副驾手机端 + 座舱车机中控 + 离线安全锦囊 */}
        <div className="flex items-stretch justify-center gap-2 sm:gap-3 md:gap-4 w-full">
          <PhoneCompanionDevice />
          <CockpitCompanionDevice />
          <OfflinePouchCard />
        </div>

        {/* 底部升华标语 */}
        <Reveal at={[T.tagline[0], T.tagline[1]]} y={6} className="mt-1.5 sm:mt-2 text-center px-4">
          <p className="font-serif text-xs sm:text-sm md:text-base font-bold text-ink">
            从桌面掌控到座舱流转，
            <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 bg-clip-text text-transparent">
              多端同频 · 全团同行
            </span>
            。
          </p>
          <p className="text-[10px] sm:text-xs text-ink-soft mt-0.5">
            线上实时多端协同，离线安全从容兜底。
          </p>
        </Reveal>
      </motion.div>
    </motion.div>
  );
}

/* ── 顶部数据流转指示条（动态呈现数据流在多设备间的广播跃迁） ── */
function SyncFlowBar() {
  const p = useProgress();
  // 流转步进：0=未激活，1=桌面母体广播，2=手机收到更新，3=座舱巡航就绪，4=离线兜底固化
  const step = useStep(p, [T.streamSync[0], 0.892, 0.904, 0.914]);

  return (
    <div
      className="mb-1.5 sm:mb-2 flex w-full max-w-2xl items-center justify-between rounded-pill border border-slate-200/70 bg-paper/95 px-2.5 py-1 shadow-level-static backdrop-blur-xl sm:px-4"
      aria-label="多端同频广播流流转状态"
    >
      <div className="flex items-center gap-1.5 text-xs font-semibold text-ink">
        <RadioIcon className="h-3.5 w-3.5 text-amber-600 animate-pulse" aria-hidden="true" />
        <span className="text-[11px] sm:text-xs">多端同频广播流</span>
        <span
          className={`font-mono text-[9px] sm:text-[10px] px-1.5 py-0.2 rounded-pill font-semibold transition-colors duration-300 ${
            step >= 4
              ? 'bg-jade/15 text-jade border border-jade/30'
              : step >= 2
                ? 'bg-amber-500/15 text-amber-800 border border-amber-500/30'
                : 'bg-slate-900/5 text-ink-soft'
          }`}
        >
          {step >= 4 ? '18ms 极速对齐 · 全团同频' : step >= 2 ? '流转进行中 · 极速同步' : '广播通道就绪'}
        </span>
      </div>

      <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-ink-soft">
        <span
          className={`inline-flex items-center gap-0.5 sm:gap-1 font-medium transition-colors duration-200 ${
            step >= 1 ? 'text-amber-700 font-semibold' : 'text-ink-soft'
          }`}
        >
          <MonitorIcon className="h-3 w-3 text-amber-600" aria-hidden="true" />
          <span>桌面母体</span>
        </span>
        <span className="text-ink/30">➔</span>
        <span
          className={`inline-flex items-center gap-0.5 sm:gap-1 font-medium transition-colors duration-200 ${
            step >= 2 ? 'text-jade font-semibold' : 'text-ink-soft'
          }`}
        >
          <SmartphoneIcon className="h-3 w-3 text-jade" aria-hidden="true" />
          <span>副驾手机</span>
        </span>
        <span className="text-ink/30">➔</span>
        <span
          className={`inline-flex items-center gap-0.5 sm:gap-1 font-medium transition-colors duration-200 ${
            step >= 3 ? 'text-blue-600 font-semibold' : 'text-ink-soft'
          }`}
        >
          <CarIcon className="h-3 w-3 text-blue-600" aria-hidden="true" />
          <span>座舱巡航</span>
        </span>
        <span className="hidden text-ink/30 sm:inline">➔</span>
        <span
          className={`hidden sm:inline-flex items-center gap-0.5 sm:gap-1 font-medium transition-colors duration-200 ${
            step >= 4 ? 'text-amber-800 font-semibold' : 'text-ink-soft'
          }`}
        >
          <ShieldIcon className="h-3 w-3 text-amber-700" aria-hidden="true" />
          <span>离线兜底</span>
        </span>
      </div>
    </div>
  );
}

/* ── 设备 1：副驾随身手机端（实时感知最新行程与多人状态） ──── */
function PhoneCompanionDevice() {
  const p = useProgress();
  const step = useStep(p, [0.892]);
  const syncGlow = useRange(p, [0.892, 0.902, 0.916], [0, 1, 0.25]);
  const cardBorder = useTransform(syncGlow, (v) => `rgba(245, 158, 11, ${0.3 + v * 0.4})`);
  const cardShadow = useTransform(syncGlow, (v) => `0 0 ${v * 12}px rgba(245, 158, 11, ${v * 0.3})`);

  return (
    <div
      className="relative h-[195px] sm:h-[215px] w-[130px] sm:w-[155px] shrink-0 rounded-[24px] sm:rounded-[28px] bg-[#16181d] p-[4px] sm:p-[5px] shadow-level-float ring-1 ring-white/10 overflow-hidden"
      role="region"
      aria-label="副驾手机协同端"
    >
      <div className="relative flex h-full flex-col overflow-hidden rounded-[20px] sm:rounded-[23px] bg-[#faf6ee] text-ink">
        {/* 顶部灵动岛与状态栏 */}
        <div className="relative flex h-5 items-center justify-between px-2 sm:px-2.5 pt-1 text-[9px] font-mono font-semibold text-slate-800">
          <span>20:00</span>
          <div className="absolute left-1/2 top-1 h-2.5 w-10 sm:w-12 -translate-x-1/2 rounded-full bg-black" />
          <span className="text-[8px] sm:text-[9px]">5G · 98%</span>
        </div>

        {/* 手机 App 顶栏 */}
        <div className="flex items-center gap-1 border-b border-ink/[0.08] px-2 py-0.5 sm:py-1">
          <Avatar name="小雨" tone="lapis" size={16} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] sm:text-[11px] font-bold text-ink">副驾 · 小雨</p>
          </div>
          <span className="flex items-center gap-0.5 text-[8px] sm:text-[9px] font-semibold text-jade">
            <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
            {step >= 1 ? '已同频' : '同步中'}
          </span>
        </div>

        {/* 实时同步的 D0 晚间最新行程卡 */}
        <div className="p-1.5 sm:p-2 space-y-1 sm:space-y-1.5 flex-1 overflow-hidden">
          <motion.div
            className="rounded-control bg-gradient-to-br from-amber-500/15 to-amber-600/10 p-1.5 sm:p-2 border"
            style={{ borderColor: cardBorder, boxShadow: cardShadow }}
          >
            <div className="flex items-center justify-between">
              <span className="font-serif text-[10px] sm:text-[11px] font-bold text-amber-900">D0 晚间 · 已同步</span>
              <span className="chip rounded-pill bg-jade/20 text-jade text-[8px] sm:text-[9px] px-1 font-mono font-bold">v1.1</span>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-ink truncate">
              <UtensilsIcon className="h-3 w-3 text-amber-700 shrink-0" aria-hidden="true" />
              <span>正宁路夜市</span>
            </p>
            <p className="text-[9px] sm:text-[10px] text-ink-soft truncate">赵记牛奶鸡蛋醪糟 · 必吃</p>
          </motion.div>

          <div className="rounded-control bg-paper/90 p-1 sm:p-1.5 border border-slate-200/60 text-[9px] sm:text-[10px] space-y-0.5 sm:space-y-1">
            <div className="flex items-center justify-between text-ink-soft">
              <span>步行导航</span>
              <span className="font-mono text-ink font-semibold">650m · 8分钟</span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 text-[8px] sm:text-[9px] text-amber-700">
              <CheckIcon className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
              <span className="truncate">阿杰已确认 · 领队已采纳</span>
            </div>
          </div>
        </div>

        {/* 手机底部离线兜底标识 */}
        <div className="mt-auto border-t border-ink/[0.06] bg-slate-900/5 px-1.5 py-0.5 text-center text-[8px] sm:text-[9px] font-mono text-ink-soft">
          <span className="text-jade font-semibold">● IndexedDB</span> 本地随身离线秒开
        </div>
      </div>
    </div>
  );
}

/* ── 设备 2：智能座舱车机中控大屏（巡航流转与限高避险） ─────── */
function CockpitCompanionDevice() {
  const p = useProgress();
  // 关键帧流转：0.904 车机接收，0.918~0.958 智驾限高警报与巡航细节高亮
  const alertGlow = useRange(p, [T.deviceDetail[0], T.deviceDetail[0] + 0.015, T.deviceDetail[1]], [0, 1, 0.45]);
  const alertBorder = useTransform(alertGlow, (v) => `rgba(245, 158, 11, ${0.35 + v * 0.55})`);
  const alertShadow = useTransform(alertGlow, (v) => `0 0 ${v * 16}px rgba(245, 158, 11, ${v * 0.35})`);
  const isDetailActive = useStep(p, [T.deviceDetail[0]]) >= 1;

  return (
    <div
      className="relative h-[195px] sm:h-[215px] flex-1 min-w-[210px] max-w-[500px] shrink rounded-card bg-[#11141b] p-2 sm:p-2.5 shadow-level-float ring-1 ring-white/10 text-white overflow-hidden flex flex-col justify-between"
      role="region"
      aria-label="智能座舱巡航导航中控"
    >
      {/* 顶部微反光条 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      {/* 车机顶栏状态 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-1 sm:pb-1.5 shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <CarIcon className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
          <span className="font-serif text-[11px] sm:text-xs font-bold tracking-wide text-white truncate">
            7座 MPV 智能座舱 · 巡航导航流转系统
          </span>
        </div>
        <div className="flex items-center gap-1 text-[9px] sm:text-[10px] font-mono text-white/70 shrink-0">
          <span className="flex items-center gap-1 text-jade">
            <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
            Tier 0 无缝流转
          </span>
          <span className="text-white/30 hidden xs:inline">|</span>
          <span className="hidden xs:inline">3 端联机</span>
        </div>
      </div>

      {/* 车机中控主体：左侧下一站路线 + 右侧 7座 MPV 限高避险与长下坡预案 */}
      <div className="my-1 grid grid-cols-2 gap-1.5 sm:gap-2 text-xs flex-1">
        {/* 左栏：下一站与散步指引 */}
        <div className="flex flex-col justify-between rounded-control bg-white/5 p-1.5 sm:p-2 border border-white/10">
          <div>
            <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-amber-400/90 font-mono">NEXT STOP</p>
            <p className="font-serif text-xs sm:text-sm font-bold text-white mt-0.5">正宁路夜市</p>
            <p className="text-[9px] sm:text-[10px] text-white/70 font-mono mt-0.5">距宿点 650m · 全团漫步 12m</p>
          </div>
          <div className="mt-1 pt-1 border-t border-white/10 text-[9px] sm:text-[10px] text-white/80 leading-tight">
            <span className="text-amber-300 font-semibold">泊车指引：</span>
            <span>7座豪华 MPV 停泊于酒店地面车位 (车顶箱限高2.15m)</span>
          </div>
        </div>

        {/* 右栏：智驾系统限高警报与避险措施（由 alertGlow 真实驱动光波） */}
        <motion.div
          className="flex flex-col justify-between rounded-control bg-amber-500/10 p-1.5 sm:p-2 border"
          style={{ borderColor: alertBorder, boxShadow: alertShadow }}
        >
          <div>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-amber-300">
              <AlertTriangleIcon className="h-3.5 w-3.5 text-amber-400 shrink-0 animate-bounce" aria-hidden="true" />
              <span>7座 MPV 2.15m 限高警报</span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-white/85 leading-tight mt-0.5">
              夜市步行街机动车全段禁行！智驾已完成步行接驳避障。
            </p>
          </div>
          <div
            className={`mt-1 pt-1 border-t border-amber-500/20 text-[8px] sm:text-[9px] font-mono leading-tight transition-colors duration-300 ${
              isDetailActive ? 'text-amber-200 font-medium' : 'text-amber-200/60'
            }`}
          >
            D1 乌鞘岭 18km 长下坡巡航预案已推至仪表
          </div>
        </motion.div>
      </div>

      {/* 车机底栏：途经点序列 */}
      <div className="flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-white/60 shrink-0 pt-0.5 border-t border-white/10">
        <span>12 个途经点已完整下发车机</span>
        <span className="text-amber-400 font-semibold">智驾巡航系统待命中 · 零依赖车企 SDK</span>
      </div>
    </div>
  );
}

/* ── 设备 3：随身离线安全锦囊（单文件 1.8MB 零外部依赖兜底） ── */
function OfflinePouchCard() {
  const p = useProgress();
  const step = useStep(p, [0.914]);

  return (
    <div
      className="hidden lg:flex h-[195px] sm:h-[215px] w-[155px] sm:w-[170px] shrink-0 flex-col rounded-card border border-amber-500/35 bg-paper/95 p-2 sm:p-2.5 shadow-level-float backdrop-blur-xl justify-between"
      role="region"
      aria-label="随身离线安全锦囊"
    >
      <div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-amber-900">
            <ShieldIcon className="h-3.5 w-3.5 text-amber-600" aria-hidden="true" />
            <span>离线安全锦囊</span>
          </span>
          <span className="chip rounded-pill bg-amber-500/15 text-amber-800 text-[8px] sm:text-[9px] font-mono font-bold px-1.5 py-0">
            1.8 MB
          </span>
        </div>
        <p className="mt-0.5 text-[9px] sm:text-[10px] text-ink-soft truncate font-mono">西行计划.v1.1.html</p>

        <ul className="mt-1.5 space-y-1 text-[9px] sm:text-[10px] text-ink">
          <li className="flex items-center gap-1">
            <CheckIcon className="h-3 w-3 text-jade shrink-0" aria-hidden="true" />
            <span>自包含单文件路书</span>
          </li>
          <li className="flex items-center gap-1">
            <CheckIcon className="h-3 w-3 text-jade shrink-0" aria-hidden="true" />
            <span>双击秒开 · 0 外部请求</span>
          </li>
          <li className="flex items-center gap-1">
            <CheckIcon className="h-3 w-3 text-jade shrink-0" aria-hidden="true" />
            <span>无人区断网从容阅览</span>
          </li>
        </ul>
      </div>

      <div
        className={`rounded-control p-1 text-center text-[9px] sm:text-[10px] font-semibold transition-colors duration-300 ${
          step >= 1 ? 'bg-jade/15 text-jade border border-jade/30' : 'bg-amber-500/10 text-amber-800'
        }`}
      >
        {step >= 1 ? '✓ IndexedDB 离线固化完成' : '线上多端同频，离线从容兜底'}
      </div>
    </div>
  );
}
