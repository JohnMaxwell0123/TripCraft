'use client';

import { motion, useTransform } from 'framer-motion';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { useProgress } from './primitives';
import {
  CarIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
  UtensilsIcon,
  RadioIcon,
  CompassIcon,
  SparklesIcon,
  ClockIcon,
  PinIcon,
  ElderIcon,
  BabyIcon,
} from '@/components/common/Icons';

/**
 * TripCraft C-CABIN 原生智能座舱与车道级 NOA 领航沙盘
 *
 * 彻底对齐顶级智能电动汽车座舱 (Apple CarPlay / NIO / Denza Link) 极简奢华体验：
 * 1. 哑光钛黑金属窄边框 + 超薄悬浮大屏视感
 * 2. 精致车规排版、无刺眼高饱和纯色、自然温润微光
 * 3. 拟真透视车道沙盘、腾势 D9 顶视流线车身、2.15m 限高刚性拦截
 */
export function CockpitScene() {
  const p = useProgress();
  const visibility = useVisibility(p, T.cockpitIn[0] - 0.008, T.cockpitOut[1] + 0.008);

  const opacity = useFade(p, T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]);
  const scale = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [0.94, 1, 1, 0.96],
    { easing: ease.back, rest: 1 },
  );
  const y = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [32, 0, 0, -20],
    { easing: ease.out, rest: 0 },
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 gpu-layer [contain:layout_paint]"
      style={{ visibility }}
      role="region"
      aria-label="TripCraft 车载座舱与自动驾驶领航导航演示"
    >
      {/* 镜头 1: 手机投车飞向中控的高光脉冲 */}
      <PhoneToCockpitPulse />

      {/* 车载横向中控大屏外壳 (C-CABIN 极简奢华车规形态) */}
      <motion.div
        className="pointer-events-auto relative flex flex-col w-full max-w-[1040px] h-[min(530px,94%)] rounded-[26px] sm:rounded-[32px] bg-[#141620] border border-white/15 p-2 sm:p-3 shadow-[0_32px_90px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.15)] text-white overflow-hidden [container-type:size] backdrop-blur-3xl"
        style={{ opacity, scale, y }}
      >
        {/* 顶部微高光反光层 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[26px] sm:rounded-[32px] ring-1 ring-inset ring-white/10" />

        {/* 1. 车规顶栏 */}
        <CockpitHeader />

        {/* 2. 团队路书实时流转系统通知 */}
        <CockpitSyncNotification />

        {/* 3. 中控主体：左侧时序行程流 + 右侧车道级高精沙盘 */}
        <div className="relative flex-1 min-h-0 flex flex-col md:flex-row gap-2.5 sm:gap-3 mt-2 overflow-hidden">
          <CockpitScheduleFlow />
          <CockpitAutonomousNav />
        </div>

        {/* 4. 镜头 4: 2.15m 限高规则拦截与自动改道告警 */}
        <ClearanceAlertOverlay />

        {/* 5. 镜头 5: 驻车完成与下车步行接力横幅 */}
        <ParkingHandoffBanner />
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 1. 车规顶栏 (Cockpit Master Header) ═════════════════════ */
function CockpitHeader() {
  const p = useProgress();
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <header className="relative flex h-8 sm:h-9 shrink-0 items-center justify-between border-b border-white/[0.08] px-2 select-none">
      {/* 左侧：TripCraft 旅字标 + C-CABIN 原生座舱标识 + 车型 */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-[6px] bg-[#241E20] border border-white/20 font-serif text-[10px] sm:text-xs font-bold text-white shadow-sm">
          旅
        </span>
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-sans text-xs sm:text-sm font-bold tracking-tight text-white">
            TripCraft <span className="text-[#FE3C01] font-mono text-[11px] font-semibold">C-CABIN</span>
          </span>
          <span className="hidden sm:inline-flex rounded-full bg-white/[0.06] text-[10px] font-mono px-2 py-0.5 text-white/70 border border-white/10">
            腾势 D9 · 旗舰版
          </span>
        </div>
      </div>

      {/* 中间：挡位控制器 (D 挡巡航 ➔ P 挡驻车) */}
      <div className="flex items-center gap-1 sm:gap-1.5 rounded-full bg-black/30 px-2 py-0.5 border border-white/10 font-mono text-[10px] sm:text-xs">
        <span
          className={`px-1.5 py-0.5 rounded font-bold transition-all duration-300 ${
            isParked ? 'bg-emerald-500 text-black shadow-sm scale-105' : 'text-white/30'
          }`}
        >
          P
        </span>
        <span className="text-white/15">|</span>
        <span className="text-white/30">R</span>
        <span className="text-white/15">|</span>
        <span className="text-white/30">N</span>
        <span className="text-white/15">|</span>
        <span
          className={`px-1.5 py-0.5 rounded font-bold transition-all duration-300 ${
            !isParked ? 'bg-[#FE3C01] text-white shadow-sm scale-105' : 'text-white/30'
          }`}
        >
          D
        </span>
      </div>

      {/* 右侧：RTK高精定位、5G网络信标、时间与室外温度 */}
      <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] sm:text-[11px] text-white/60">
        <span className="hidden xs:inline-flex items-center gap-1 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>RTK 厘米级</span>
        </span>
        <span className="text-white/20 hidden xs:inline">|</span>
        <span className="flex items-center gap-1 text-white/80">
          <RadioIcon className="h-3 w-3 text-[#FE3C01]" />
          <span>5G · 18ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white font-semibold">20:05</span>
        <span className="hidden sm:inline text-white/50">19°C 兰州</span>
      </div>
    </header>
  );
}

/* ═════════════════════ 2. 团队路书实时流转系统通知 ═════════════════════ */
function CockpitSyncNotification() {
  const p = useProgress();
  const notifOpacity = useFade(
    p,
    T.cockpitIn[1],
    T.cockpitIn[1] + 0.006,
    T.cockpitSchedule[1] + 0.012,
    T.cockpitSchedule[1] + 0.018,
  );
  const notifY = useRange(p, [T.cockpitIn[1], T.cockpitIn[1] + 0.006], [-10, 0], { rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 top-11 sm:top-12 z-30 flex justify-center px-3"
      style={{ opacity: notifOpacity, y: notifY }}
    >
      <div className="flex items-center gap-2 rounded-full bg-[#181C28]/95 px-3.5 py-1.5 border border-[#FE3C01]/40 shadow-xl backdrop-blur-xl text-[11px] sm:text-xs">
        <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
        <span className="text-white font-medium">副驾与领队同步新路书</span>
        <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.5 border border-emerald-500/30">
          v1.1
        </span>
        <span className="text-[#FE3C01] font-medium hidden sm:inline">· 正宁路夜市已注入中控排程 (顺路度 98%)</span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 3. 左侧：时序行程流 (Cockpit Schedule Flow) ════════════════════ */
function CockpitScheduleFlow() {
  const p = useProgress();
  const isRerouted = useStep(p, [T.heightAlert[0]]) >= 1;

  return (
    <div className="relative w-full md:w-[320px] lg:w-[340px] shrink-0 rounded-[14px] bg-[#10121A]/80 border border-white/[0.08] p-3 flex flex-col justify-between overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
          <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
            <ClockIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            <span>实时行程排期 · D1 兰州</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            全车同频中
          </span>
        </div>

        <div className="mt-2.5 space-y-2">
          {/* 节点 1: 枢纽启程 */}
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span className="h-4 w-4 shrink-0 rounded-full bg-white/[0.05] flex items-center justify-center font-mono text-[9px]">
              ✓
            </span>
            <span className="font-mono">16:30</span>
            <span className="truncate">中川国际机场整备出发</span>
          </div>

          {/* 节点 2: 黄河风情线 (已打卡) */}
          <div className="flex items-center gap-2 text-[11px] text-white/60">
            <span className="h-4 w-4 shrink-0 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-mono text-[9px]">
              ✓
            </span>
            <span className="font-mono">18:20</span>
            <span className="truncate">黄河母亲雕塑日落观景</span>
          </div>

          {/* 节点 3: 核心途经点 (正宁路夜市) */}
          <div className="rounded-[10px] bg-white/[0.06] p-2.5 border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#FE3C01] flex items-center gap-1">
                <UtensilsIcon className="h-3 w-3" />
                <span>20:00 正宁路夜市</span>
              </span>
              <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-1.5 py-0.2 border border-emerald-500/30">
                顺路度 98%
              </span>
            </div>
            <p className="text-xs font-semibold text-white mt-1">
              赵记牛奶鸡蛋醪糟 (舌尖名店)
            </p>
            <div className="mt-2 flex items-center justify-between text-[10px] text-white/60 border-t border-white/[0.06] pt-1.5">
              <span>全团微信愿望池置顶</span>
              <span className="text-[#FE3C01] font-mono font-semibold">
                {isRerouted ? '泊车：地面大巴车位' : '距目的地 950m'}
              </span>
            </div>
          </div>

          {/* 节点 4: 晚间安歇 */}
          <div className="flex items-center gap-2 text-[11px] text-white/40">
            <span className="h-4 w-4 shrink-0 rounded-full border border-white/10 flex items-center justify-center font-mono text-[9px]">
              4
            </span>
            <span className="font-mono">21:30</span>
            <span className="truncate">漫步黄河铁桥返回酒店安歇</span>
          </div>
        </div>
      </div>

      {/* 底部自驾物理契约微标 */}
      <div className="rounded-[8px] bg-black/25 p-2 border border-white/[0.06] text-[10px] space-y-1 mt-3">
        <div className="flex items-center justify-between text-white/80">
          <span className="flex items-center gap-1 font-semibold text-white">
            <CarIcon className="h-3 w-3 text-[#FE3C01]" />
            <span>7座 MPV 契约</span>
          </span>
          <span className="font-mono text-emerald-400">车高 2.15m 限高硬约束</span>
        </div>
        <div className="flex items-center justify-between text-white/50 text-[9px]">
          <span className="flex items-center gap-1">
            <ElderIcon className="h-2.5 w-2.5 text-white/60" />
            <span>长辈无障碍慢行</span>
          </span>
          <span className="flex items-center gap-1">
            <BabyIcon className="h-2.5 w-2.5 text-white/60" />
            <span>幼儿作息锁定</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右侧：3D 车道级高精沙盘 (Autonomous NOA Sandbox) ══════════ */
function CockpitAutonomousNav() {
  const p = useProgress();

  // 动态车速读数：巡航时 82 km/h，限高改道后减速至泊车 0 km/h
  const speedRef = useScrollCounter(p, 82, 0, T.parkEngage[0], T.parkEngage[1], 0);

  // 道路标线平滑流动
  const laneOffset = useRange(p, [T.cockpitNav[0], T.cockpitNav[1]], [0, 80]);
  const laneDashOffset = useTransform(laneOffset, (v) => `${(v * 3.5) % 36}px`);

  // 改道与泊车步进判断
  const isRerouting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 min-h-0 rounded-[14px] bg-gradient-to-b from-[#161924] to-[#0E1018] border border-white/[0.08] overflow-hidden flex flex-col justify-between">
      {/* 顶部智驾辅助与领航状态胶囊条 */}
      <div className="relative z-20 flex items-center justify-between p-2.5 bg-gradient-to-b from-[#141620] via-[#141620]/80 to-transparent">
        {/* NOA 状态胶囊 */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 border border-emerald-500/40 text-[10px] sm:text-xs font-semibold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            <span>NOA 领航辅助巡航中</span>
          </span>
          <span className="text-[10px] font-mono text-white/50 hidden sm:inline">车道居中 · 绿波畅行</span>
        </div>

        {/* 下一机动点指示牌 */}
        <div className="flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1 border border-white/10 text-[10px] sm:text-xs font-mono">
          <CompassIcon className="h-3 w-3 text-[#FE3C01]" />
          <span className="text-white/70">前方 800m ➔</span>
          <span className="font-bold text-white">
            {isRerouting ? '水岸云上酒店地面大巴位 (右转)' : '白银路 (直行)'}
          </span>
        </div>
      </div>

      {/* 核心高精矢量车道沙盘透视区 */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {/* 远景微光 */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#0B0D14] to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 600 360"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* NOA 流金引导光毯渐变 */}
            <linearGradient id="noa-carpet" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FE3C01" stopOpacity="0.75" />
              <stop offset="60%" stopColor="#FE3C01" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#FE3C01" stopOpacity="0.05" />
            </linearGradient>

            {/* 改道地面车位引导光毯 */}
            <linearGradient id="reroute-carpet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FE3C01" stopOpacity="0.8" />
              <stop offset="55%" stopColor="#F59E0B" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.2" />
            </linearGradient>

            {/* 自车雷达锥形波 */}
            <radialGradient id="lidar-cone-soft" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor="rgba(254, 60, 1, 0.3)" />
              <stop offset="60%" stopColor="rgba(254, 60, 1, 0.08)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* 道路底基 (沥青深灰) */}
          <polygon points="120,360 250,110 350,110 480,360" fill="#1C1F2B" />

          {/* 道路边缘护栏 */}
          <line x1="120" y1="360" x2="250" y2="110" stroke="#374151" strokeWidth="3" />
          <line x1="480" y1="360" x2="350" y2="110" stroke="#374151" strokeWidth="3" />

          {/* 车道标线 1 */}
          <line
            x1="240"
            y1="360"
            x2="283"
            y2="110"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeDasharray="14 14"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.4"
          />

          {/* 车道标线 2 */}
          <line
            x1="360"
            y1="360"
            x2="317"
            y2="110"
            stroke="#9CA3AF"
            strokeWidth="2"
            strokeDasharray="14 14"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.4"
          />

          {/* NOA 推荐巡航光毯 */}
          {!isRerouting ? (
            <polygon
              points="245,360 286,115 314,115 355,360"
              fill="url(#noa-carpet)"
            />
          ) : (
            /* 限高拦截后切向右侧地面车位的引导光毯 */
            <polygon
              points="245,360 295,240 420,160 460,190 345,360"
              fill="url(#reroute-carpet)"
            />
          )}

          {/* 前方 35m 前车感应框 */}
          <g transform="translate(300, 150)">
            <rect x="-14" y="-8" width="28" height="18" rx="4" fill="rgba(255,255,255,0.08)" stroke="#38BDF8" strokeWidth="1.2" />
            <line x1="-10" y1="10" x2="10" y2="10" stroke="#EF4444" strokeWidth="2" />
            <rect x="-22" y="-20" width="44" height="11" rx="2.5" fill="#141620" stroke="#38BDF8" strokeWidth="0.8" />
            <text x="0" y="-12" textAnchor="middle" fill="#38BDF8" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
              前车 35m
            </text>
          </g>

          {/* 腾势 D9 顶视流线豪华自车 */}
          <g transform="translate(300, 290)">
            {/* 激光雷达波纹扫描 */}
            <motion.path
              d="M -70 -40 L 0 0 L 70 -40 Z"
              fill="url(#lidar-cone-soft)"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* 车身阴影 */}
            <ellipse cx="0" cy="8" rx="28" ry="14" fill="rgba(0,0,0,0.5)" />

            {/* 腾势 D9 流线车体 */}
            <rect x="-22" y="-36" width="44" height="72" rx="10" fill="#242838" stroke="#FE3C01" strokeWidth="1.5" />
            {/* 前后玻璃窗 */}
            <path d="M -16 -16 L 16 -16 L 12 -2 M -12 -2 Z" fill="#10121A" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <path d="M -14 20 L 14 20 L 12 28 L -12 28 Z" fill="#10121A" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

            {/* 车顶旅行行李箱 (2.15m 限高物理特征) */}
            <rect x="-10" y="-12" width="20" height="34" rx="5" fill="#141620" stroke="#F59E0B" strokeWidth="1.2" />
            <text x="0" y="8" textAnchor="middle" fill="#F59E0B" fontSize="7.5" fontFamily="monospace" fontWeight="bold">
              2.15m
            </text>

            {/* LED 前大灯 */}
            <circle cx="-16" cy="-33" r="2.5" fill="#FFFFFF" />
            <circle cx="16" cy="-33" r="2.5" fill="#FFFFFF" />

            {/* 贯穿式红色尾灯 */}
            <rect x="-18" y="33" width="36" height="2.5" rx="1" fill="#EF4444" />
          </g>

          {/* 右侧地面大巴车位指示标 (限高触发后出现) */}
          {isRerouting && (
            <g transform="translate(440, 145)">
              <rect x="-36" y="-14" width="72" height="28" rx="6" fill="#162E25" stroke="#10B981" strokeWidth="1.5" />
              <text x="0" y="3" textAnchor="middle" fill="#FFFFFF" fontSize="9.5" fontWeight="bold">
                P 地面大巴位
              </text>
              <text x="0" y="16" textAnchor="middle" fill="#10B981" fontSize="7.5" fontWeight="bold">
                无高度限制 · 已预约
              </text>
            </g>
          )}
        </svg>

        {/* 悬浮车规 HUD 投影 (Heads-Up Display) */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-[10px] bg-black/60 p-2.5 border border-white/10 backdrop-blur-md">
          <div className="flex items-baseline gap-1">
            <span ref={speedRef} className="font-mono text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              82
            </span>
            <span className="text-[10px] font-mono text-white/50">km/h</span>
          </div>

          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-red-500 bg-white font-bold text-black text-[8px]">
              80
            </span>
            <span className="text-emerald-400 font-semibold">绿波引导 75-85</span>
          </div>

          <div className="text-[9px] text-white/50 font-mono mt-0.5">
            {isParked ? '已安全泊入专属车位' : '距目的地 1.2km · 4分钟'}
          </div>
        </div>
      </div>

      {/* 车机底栏：当前路段信标 */}
      <footer className="relative z-20 flex h-7 shrink-0 items-center justify-between border-t border-white/[0.08] px-3 bg-[#10121A] text-[9px] font-mono text-white/50">
        <span className="truncate">白银路 ➔ 黄河水岸云上酒店地面专属通道</span>
        <span className="text-[#FE3C01] font-semibold hidden xs:inline">
          {isRerouting ? '物理风控避障中 · 刚性拦截生效' : 'TripCraft C-CABIN 高精车规领航'}
        </span>
      </footer>
    </div>
  );
}

/* ═════════════════════ 4. 镜头 4: 2.15m 限高规则拦截与自动改道告警 ═════════════════ */
function ClearanceAlertOverlay() {
  const p = useProgress();
  const [a, b, c, d] = T.heightAlert;
  const visibility = useVisibility(p, a - 0.004, d + 0.004);
  const opacity = useFade(p, a, b, c, d);
  const scale = useRange(p, [a, b, c, d], [0.92, 1, 1, 0.95], { easing: ease.back, rest: 1 });
  const y = useRange(p, [a, b, c, d], [16, 0, 0, -12], { rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-3 sm:inset-x-6 top-12 sm:top-14 z-50 flex justify-center"
      style={{ opacity, scale, y, visibility }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 rounded-[14px] bg-[#1C1814]/98 p-3 sm:p-4 border border-[#FE3C01]/60 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-2xl max-w-xl text-left">
        <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-[8px] bg-[#FE3C01]/20 text-[#FE3C01] border border-[#FE3C01]/40">
          <AlertTriangleIcon className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-sans text-xs sm:text-sm font-bold text-white">
              7座 MPV (车顶箱) 2.15m 限高物理规则拦截！
            </span>
            <span className="rounded-full bg-[#FE3C01]/20 text-[#FE3C01] text-[9px] font-mono font-bold px-2 py-0.5 border border-[#FE3C01]/30">
              刚性风控
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-white/80 leading-tight">
            正宁路老城地下通道限高 <b className="text-[#FE3C01]">2.0m</b> 严禁驶入！已触发自驾风控断言。
          </p>
          <div className="mt-1.5 flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-400 font-medium">
            <CheckIcon className="h-3 w-3 text-emerald-400 shrink-0" />
            <span>已自动改道至「水岸云上酒店地面专属大巴车位」(无高度限制)</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 5. 镜头 5: 驻车完成与下车步行接力横幅 ═════════════════════ */
function ParkingHandoffBanner() {
  const p = useProgress();
  const [a, b] = T.parkEngage;
  const visibility = useVisibility(p, a - 0.003, T.cockpitOut[1] + 0.005);
  const opacity = useFade(p, a, b, T.cockpitOut[0], T.cockpitOut[1]);
  const y = useRange(p, [a, b], [16, 0], { easing: ease.back, rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-3 sm:inset-x-8 bottom-3 sm:bottom-4 z-40 flex justify-center"
      style={{ opacity, y, visibility }}
    >
      <div className="flex items-center justify-between w-full max-w-lg rounded-full bg-[#141620]/95 px-4 py-2 border border-emerald-500/40 shadow-2xl backdrop-blur-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-black font-bold text-xs">
            P
          </span>
          <div>
            <span className="font-bold text-white">已安全泊入地面大巴位</span>
            <span className="text-emerald-400 font-mono ml-1.5">· 步行漫步接力开启</span>
          </div>
        </div>

        <span className="rounded-full bg-white/10 text-white text-[10px] font-mono px-2.5 py-0.5 font-medium border border-white/15">
          步行卡片已推全员手机 ➔
        </span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 镜头 1: 手机投车飞向车机的高光脉冲 ═════════════════════ */
function PhoneToCockpitPulse() {
  const p = useProgress();
  const [a, b] = T.streamFly;
  const visibility = useVisibility(p, a - 0.002, b + 0.002);
  const opacity = useFade(p, a, a + 0.004, b - 0.004, b);

  // 从右下角副驾手机位置抛物线飞向中控
  const x = useRange(p, [a, b], [82, 50], { easing: ease.smooth });
  const y = useRange(p, [a, b], [85, 45], { easing: ease.back });
  const scale = useRange(p, [a, b], [0.6, 1.4]);

  const xTransform = useTransform(x, (v) => `${v}%`);
  const yTransform = useTransform(y, (v) => `${v}%`);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-50 flex items-center justify-center gpu-layer"
      style={{ x: xTransform, y: yTransform, opacity, scale, visibility }}
    >
      <div className="relative flex items-center justify-center">
        <span className="h-6 w-6 rounded-full bg-[#FE3C01] animate-ping opacity-75" />
        <span className="absolute h-4 w-4 rounded-full bg-[#FE3C01] shadow-[0_0_16px_rgba(254,60,1,0.9)]" />
        <span className="absolute -top-4 font-mono text-[9px] font-bold text-white whitespace-nowrap bg-black/80 px-2 py-0.5 rounded-full border border-[#FE3C01]/50">
          ⚡ 途经点同频中
        </span>
      </div>
    </motion.div>
  );
}
