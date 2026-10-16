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
  ElderIcon,
  BabyIcon,
} from '@/components/common/Icons';

/**
 * TripCraft C-CABIN 原生智能座舱与车道级 NOA 领航沙盘
 *
 * 彻底对齐现代化顶级智能汽车座舱 (小米汽车 SU7 / 蔚来 / 理想) 16:10 悬浮大屏体验：
 * 1. 哑光钛黑金属窄边框 + 超薄悬浮大屏视感
 * 2. 左右黄金分屏架构 (完全对齐真机实拍)：
 *    - 左侧 55%：3D NOA 智驾感知视界 (浅灰蓝天际线、大字号数字车速 82 km/h、前向引导光毯、前车货车感知、2.15m 限高激光刚性拦截)
 *    - 右侧 45%：高精实景路线导航卡片 (转向指示牌 ↱ 800m、车道指示 ↑↑↱、路网车道流、MPV 地面大车位已锁定)
 * 3. 顶部车规状态栏 (PRND 档位、429km 续航、5G·18ms、RTK 厘米级) + 底部完整车控 Dock (空调、应用坞、媒体卡)
 */
export function CockpitScene() {
  const p = useProgress();
  const visibility = useVisibility(p, T.cockpitIn[0] - 0.008, T.cockpitOut[1] + 0.004);

  const opacity = useFade(p, T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]);
  const scale = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [0.96, 1, 1, 0.98],
    { easing: ease.out, rest: 1 },
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-[#07090E] p-1.5 sm:p-2 gpu-layer"
      style={{ visibility, opacity }}
      role="region"
      aria-label="TripCraft 车载座舱与自动驾驶领航导航演示"
    >
      {/* 手机投车飞向中控的高光脉冲 */}
      <PhoneToCockpitPulse />

      {/* 车载横向中控大屏外壳 (全画幅原生车规座舱，告别窗口套窗口) */}
      <motion.div
        className="pointer-events-auto relative flex flex-col w-full h-full rounded-[20px] sm:rounded-[24px] bg-[#0E1118] border border-white/15 p-2 sm:p-2.5 shadow-[0_24px_80px_rgba(0,0,0,0.75),inset_0_1px_0_rgba(255,255,255,0.18)] text-white overflow-hidden"
        style={{ scale }}
      >
        {/* 顶部微高光反光层 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[24px] ring-1 ring-inset ring-white/10" />

        {/* 1. 车规顶栏 (PRND 档位、429km 续航、5G、RTK) */}
        <CockpitHeader />

        {/* 2. 团队路书实时流转系统通知 */}
        <CockpitSyncNotification />

        {/* 3. 中控主体分屏：左侧 3D NOA 智驾感知区 + 右侧高精路线导航卡片 */}
        <div className="relative flex-1 min-h-0 flex flex-col md:flex-row gap-2 sm:gap-2.5 mt-1.5 overflow-hidden">
          <CockpitPerceptionView />
          <CockpitNavigationCard />
        </div>

        {/* 4. 底部完整车规控制坞 (Dock) */}
        <CockpitBottomDock />
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 1. 车规顶栏 (Cockpit Master Header) ═════════════════════ */
function CockpitHeader() {
  const p = useProgress();
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <header className="relative flex h-8 shrink-0 items-center justify-between border-b border-white/[0.08] px-2.5 select-none text-xs">
      {/* 左侧：PRND 挡位 + 429km 电池续航 */}
      <div className="flex items-center gap-3 min-w-0">
        {/* 挡位控制器 */}
        <div className="flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 border border-white/10 font-mono text-[11px]">
          <span
            className={`px-1.5 py-0.2 rounded font-bold transition-all duration-300 ${
              isParked ? 'bg-emerald-500 text-black shadow-sm' : 'text-white/30'
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
            className={`px-1.5 py-0.2 rounded font-bold transition-all duration-300 ${
              !isParked ? 'bg-[#0284C7] text-white shadow-sm' : 'text-white/30'
            }`}
          >
            D
          </span>
        </div>

        {/* 电池续航 */}
        <div className="hidden xs:flex items-center gap-1.5 font-mono text-[11px] text-white/80">
          <span className="text-cyan-400 font-bold">⚡ 429km</span>
          <div className="w-6 h-2.5 rounded-sm border border-white/30 p-0.5 flex items-center">
            <div className="h-full w-[80%] bg-cyan-400 rounded-2xs" />
          </div>
        </div>
      </div>

      {/* 中间：TripCraft C-CABIN 原生座舱标识 + 车型 */}
      <div className="flex items-center gap-1.5">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-[#FE3C01] font-serif text-[10px] font-bold text-white shadow-sm">
          旅
        </span>
        <span className="font-sans text-xs font-semibold tracking-tight text-white hidden sm:inline">
          TripCraft <span className="text-cyan-400 font-mono text-[11px]">C-CABIN</span> · 腾势 D9
        </span>
      </div>

      {/* 右侧：RTK高精定位、5G网络信标、时间与室外温度 */}
      <div className="flex items-center gap-2 sm:gap-2.5 font-mono text-[10px] sm:text-[11px] text-white/70">
        <span className="hidden sm:inline-flex items-center gap-1 text-emerald-400">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>RTK 厘米级</span>
        </span>
        <span className="text-white/20 hidden sm:inline">|</span>
        <span className="flex items-center gap-1 text-white/80">
          <RadioIcon className="h-3 w-3 text-cyan-400" />
          <span>5G · 18ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white/70">18°C 兰州</span>
        <span className="text-white font-semibold">20:05</span>
      </div>
    </header>
  );
}

/* ═════════════════════ 2. 团队路书实时流转系统通知 (置于底栏上方居中，不遮挡导航转向标题) ═════════════════════ */
function CockpitSyncNotification() {
  const p = useProgress();
  const notifOpacity = useFade(
    p,
    T.cockpitIn[1],
    T.cockpitIn[1] + 0.006,
    T.heightAlert[0] - 0.008,
    T.heightAlert[0] - 0.002,
  );
  const notifY = useRange(p, [T.cockpitIn[1], T.cockpitIn[1] + 0.006], [10, 0], { rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-12 z-30 flex justify-center px-3"
      style={{ opacity: notifOpacity, y: notifY }}
    >
      <div className="flex items-center gap-2 rounded-full bg-[#181C28]/95 px-3.5 py-1 border border-cyan-500/40 shadow-xl backdrop-blur-xl text-[11px] sm:text-xs">
        <SparklesIcon className="h-3.5 w-3.5 text-cyan-400" />
        <span className="text-white font-medium">副驾与领队同步新路书</span>
        <span className="rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono px-2 py-0.2 border border-emerald-500/30">
          v1.1
        </span>
        <span className="text-cyan-300 font-medium hidden sm:inline">· 正宁路夜市已注入中控排程 (顺路度 98%)</span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 3. 左侧：3D NOA 智驾感知视界 (55% 宽度) ════════════════════ */
function CockpitPerceptionView() {
  const p = useProgress();

  // 真实城区车速演进：城区巡航 56 km/h -> 限高改道减速至 24 km/h -> 抵达地面车位驻车 0 km/h
  const speedText = useTransform(p, (v) => {
    if (v < T.heightAlert[0]) return '56';
    if (v < T.heightAlert[1]) {
      const t = (v - T.heightAlert[0]) / (T.heightAlert[1] - T.heightAlert[0]);
      return String(Math.round(56 - t * 32));
    }
    if (v < T.parkEngage[0]) return '24';
    if (v < T.parkEngage[1]) {
      const t = (v - T.parkEngage[0]) / (T.parkEngage[1] - T.parkEngage[0]);
      return String(Math.max(0, Math.round(24 * (1 - t))));
    }
    return '0';
  });

  // 道路标线平滑流动
  const laneOffset = useRange(p, [T.cockpitNav[0], T.cockpitNav[1]], [0, 80]);
  const laneDashOffset = useTransform(laneOffset, (v) => `${(v * 3.5) % 36}px`);

  // 改道与泊车步进判断
  const isAlerting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 md:w-[54%] lg:w-[56%] shrink-0 rounded-2xl bg-gradient-to-b from-[#DCE3EB] via-[#E8EFF6] to-[#F1F5F9] border border-black/10 overflow-hidden flex flex-col justify-between text-slate-800 shadow-sm">
      {/* 顶部速度仪表盘与智驾状态 (城区巡航 56 km/h + 限速 60 + NOA 绿标) */}
      <div className="relative z-20 flex items-center justify-between p-3 select-none">
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline">
            <motion.span className="text-4xl sm:text-5xl font-bold font-sans tabular-nums tracking-tight text-slate-900 leading-none">
              {speedText}
            </motion.span>
            <span className="text-xs font-semibold text-slate-500 ml-1 font-mono">km/h</span>
          </div>

          {/* 城区红圈限速 60 标识 */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-rose-500 bg-white shadow-sm font-mono text-[10px] font-bold text-slate-800">
            60
          </div>
        </div>

        {/* 右侧智驾领航状态 */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-white text-[11px] font-semibold shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>{isParked ? 'P 挡已驻车' : 'NOA 领航辅助'}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
            {isParked ? '地面专属车位已泊入' : '车道居中 · 绿波畅行'}
          </span>
        </div>
      </div>

      {/* 核心 3D 透视车道沙盘 (无遮挡展示天际线、前车 35m、导引光毯与自车 MPV) */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* 蓝色引导光毯渐变 */}
            <linearGradient id="noa-blue-carpet" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.08" />
            </linearGradient>

            {/* 改道地面车位引导光毯 (触发 2.28m 限高规避时变色拐向) */}
            <linearGradient id="reroute-carpet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FE3C01" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.7" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* 远景天地交界线与浅色地面 */}
          <rect x="0" y="0" width="500" height="320" fill="transparent" />

          {/* 3D 透视多车道 (宽阔三车道道路底基，浅灰微光) */}
          <polygon points="60,320 200,90 300,90 440,320" fill="#E2E8F0" opacity="0.8" />

          {/* 道路左右边缘边界实线 */}
          <line x1="60" y1="320" x2="200" y2="90" stroke="#94A3B8" strokeWidth="2.5" />
          <line x1="440" y1="320" x2="300" y2="90" stroke="#94A3B8" strokeWidth="2.5" />

          {/* 车道虚线 1 (左车道分界线，动态流动) */}
          <line
            x1="185"
            y1="320"
            x2="233"
            y2="90"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="12 12"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.75"
          />

          {/* 车道虚线 2 (右车道分界线，动态流动) */}
          <line
            x1="315"
            y1="320"
            x2="267"
            y2="90"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeDasharray="12 12"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.75"
          />

          {/* 核心导引光毯 */}
          <polygon
            points={isAlerting ? "210,320 290,320 330,120 280,120" : "210,320 290,320 270,110 230,110"}
            fill={isAlerting ? "url(#reroute-carpet)" : "url(#noa-blue-carpet)"}
          />

          {/* 感知前车 1：正前方的蓝色客车/货车 (无遮挡完整呈现) */}
          <g transform="translate(236, 122)">
            <rect x="-14" y="-28" width="28" height="34" rx="4" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
            <rect x="-11" y="-25" width="22" height="12" rx="2" fill="#38BDF8" fillOpacity="0.8" />
            <rect x="-12" y="-10" width="24" height="12" rx="2" fill="#0284C7" />
            <circle cx="-9" cy="4" r="2" fill="#EF4444" />
            <circle cx="9" cy="4" r="2" fill="#EF4444" />
            <rect x="-4" y="2" width="8" height="3" fill="#F8FAFC" />
            <g transform="translate(0, -36)">
              <rect x="-24" y="-8" width="48" height="14" rx="3" fill="#1E293B" fillOpacity="0.88" />
              <text x="0" y="2.5" fontSize="8" fontWeight="600" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif">
                前车 35m
              </text>
            </g>
          </g>

          {/* 感知侧向车辆 2：左车道白车 */}
          <g transform="translate(140, 195)">
            <rect x="-12" y="-20" width="24" height="30" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="-9" y="-17" width="18" height="8" rx="2" fill="#64748B" fillOpacity="0.4" />
            <circle cx="-8" cy="8" r="1.5" fill="#EF4444" />
            <circle cx="8" cy="8" r="1.5" fill="#EF4444" />
          </g>

          {/* 感知侧向车辆 3：右车道白车 */}
          <g transform="translate(360, 218)">
            <rect x="-12" y="-20" width="24" height="30" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="-9" y="-17" width="18" height="8" rx="2" fill="#64748B" fillOpacity="0.4" />
            <circle cx="-8" cy="8" r="1.5" fill="#EF4444" />
            <circle cx="8" cy="8" r="1.5" fill="#EF4444" />
          </g>

          {/* 自车模型：7座豪华 MPV (腾势 D9，车顶行李箱 2.28m 标定) */}
          <g transform="translate(250, 260)">
            <ellipse cx="0" cy="8" rx="24" ry="10" fill="#64748B" fillOpacity="0.3" />
            <rect x="-19" y="-34" width="38" height="46" rx="7" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
            <rect x="-14" y="-30" width="28" height="20" rx="4" fill="#38BDF8" fillOpacity="0.5" />
            <rect x="-9" y="-26" width="18" height="28" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
            <text x="0" y="-10" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#FBBF24" fontFamily="mono">
              2.28m
            </text>
            <rect x="-16" y="9" width="32" height="2.5" rx="1" fill="#EF4444" />
          </g>
        </svg>

        {/* 2.28m 限高刚性拦截与自动改道横幅 (置于底部贴边，彻底避让前车 35m 与天际线，且零截断) */}
        {isAlerting && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute inset-x-2.5 bottom-2 z-30 flex items-center justify-between rounded-xl bg-[#181C28]/95 px-2.5 py-1.5 border border-amber-400/50 text-white shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-black font-bold text-[11px]">
                !
              </span>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-amber-200 whitespace-nowrap">
                  老城地库 2.0m 限高预警 · 车高 2.28m
                </p>
                <p className="text-[9.5px] text-white/80 whitespace-nowrap">
                  已切换至酒店地面大车位 · 步行 950m 逛夜市
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[9.5px] font-bold text-black shrink-0 ml-1.5 whitespace-nowrap">
              {isParked ? '已泊入地面位' : '已自动改道'}
            </span>
          </motion.div>
        )}
      </div>

      {/* 底部智驾微标 (车辆物理安全契约) */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 bg-white/80 backdrop-blur-sm text-[10px] text-slate-600 select-none">
        <span className="flex items-center gap-1 font-semibold text-slate-800 whitespace-nowrap">
          <CarIcon className="h-3 w-3 text-[#0284C7]" />
          <span>腾势 D9 车顶箱 2.28m 限高守护中</span>
        </span>
        <span className="text-emerald-700 font-mono font-medium truncate ml-2">白银路 → 水岸云上酒店地面专属通道</span>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右侧：高精路线导航卡片 (45% 宽度) ════════════════════ */
function CockpitNavigationCard() {
  const p = useProgress();
  const isAlerting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 md:w-[46%] lg:w-[44%] shrink-0 rounded-2xl bg-white shadow-md border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden text-slate-900">
      {/* 顶部转向指示栏 */}
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900">
            <span className="text-emerald-600 font-bold">{isParked ? '✓ 已到达' : '↱ 800m'}</span>
            <span>{isParked ? '地面大车位已泊入' : '驶入地面专属车位'}</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAlerting ? '水岸云上酒店地面停车场 · 避开 2.0m 地下车库' : '正宁路夜市专属地面通道'}
          </p>
        </div>

        {/* 车道导引箭头 */}
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono shrink-0">
          <span className="text-slate-400">↑</span>
          <span className="text-slate-400">↑</span>
          <span className="font-bold text-emerald-600 bg-white px-1 rounded shadow-xs">↱</span>
        </div>
      </div>

      {/* 中间高精矢量导航地图 */}
      <div className="relative flex-1 min-h-[140px] my-2 rounded-xl bg-[#F8FAFC] border border-slate-200/80 overflow-hidden">
        <svg viewBox="0 0 320 180" className="w-full h-full object-cover">
          {/* 背景路网 */}
          <rect width="320" height="180" fill="#F1F5F9" />
          <path d="M -10 40 L 330 30" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
          <path d="M -10 130 L 330 120" stroke="#CBD5E1" strokeWidth="6" strokeLinecap="round" />
          <path d="M 80 -10 L 90 190" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />
          <path d="M 220 -10 L 230 190" stroke="#CBD5E1" strokeWidth="7" strokeLinecap="round" />

          {/* 黄河水系风情线 */}
          <path d="M -10 60 C 60 40, 150 70, 330 35" stroke="#93C5FD" strokeWidth="18" fill="none" strokeLinecap="round" opacity="0.7" />
          <text x="140" y="48" fontSize="10" fontWeight="bold" fill="#2563EB" opacity="0.6">黄河</text>

          {/* 实时高精领航路径 */}
          <path
            d="M 90 170 C 110 120, 140 100, 180 96 S 240 70, 240 50"
            stroke="#10B981"
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
          />

          {/* 终点 / 目的地标记：正宁路夜市 */}
          <g transform="translate(240, 50)">
            <circle r="9" fill="#FE3C01" stroke="#FFFFFF" strokeWidth="2.5" />
            <text y="3.5" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">终</text>
            <text x="14" y="4" fontSize="11" fontWeight="bold" fill="#0F172A">正宁路夜市</text>
          </g>

          {/* 酒店 MPV 地面大车位标定 */}
          <g transform="translate(180, 96)">
            <rect x="-8" y="-7" width="16" height="14" rx="3" fill="#0284C7" stroke="#FFFFFF" strokeWidth="1.5" />
            <text y="3.5" fontSize="9" textAnchor="middle" fill="#FFFFFF" fontWeight="bold">P</text>
            <text x="-2" y="18" fontSize="9" textAnchor="middle" fontWeight="bold" fill="#0369A1">MPV地面位</text>
          </g>

          {/* 当前车辆实时位置光标 */}
          <g transform={isParked ? 'translate(180, 96)' : 'translate(110, 130)'}>
            <circle r="12" fill="#0284C7" fillOpacity="0.2" className="animate-ping" />
            <circle r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </svg>

        {/* 目的地信息微标签 */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-0.5 border border-slate-200 text-[10px] font-medium text-slate-700 shadow-xs">
          <UtensilsIcon className="h-3 w-3 text-[#FE3C01]" />
          <span>赵记牛奶鸡蛋醪糟 · 顺路度 98%</span>
        </div>
      </div>

      {/* 底部到达时间与距离 */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-sm font-bold font-mono text-slate-900">{isParked ? '已驻车 · 步行 950m' : '20:00 到达'}</span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span className="text-slate-600 font-mono">地面专属位</span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span className="text-slate-600">漫步 12 分钟</span>
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200 shrink-0">
          全车同频中
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════ 5. 底部车规级单色矢量控制坞 (Cockpit Bottom Dock) ═════════════════════ */
function CockpitBottomDock() {
  return (
    <footer className="h-9 sm:h-10 shrink-0 bg-[#0A0C12] border-t border-white/10 px-2.5 sm:px-4 flex items-center justify-between text-xs text-white/80 select-none">
      {/* 左侧：主页按钮 + 主驾空调温度控制 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          aria-label="返回中控主页"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] text-white/80 hover:bg-white/[0.12] hover:text-white transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3.5 w-3.5">
            <path d="M3 9.5L10 3l7 6.5V16a1 1 0 0 1-1 1h-4v-4H8v4H4a1 1 0 0 1-1-1V9.5z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className="flex items-center gap-1.5 font-mono text-white/90 text-[11px] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          <span className="text-white/40 cursor-pointer">‹</span>
          <span className="font-bold">22.0°C</span>
          <span className="text-white/40 cursor-pointer">›</span>
        </div>
      </div>

      {/* 中间：车规级单色线性矢量图标坞 (彻底告别彩色系统 Emoji) */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* 导航 (激活态) */}
        <span
          title="车道级导航"
          className="flex h-7 items-center gap-1 rounded-lg bg-cyan-500/15 border border-cyan-400/30 px-2 text-[11px] font-medium text-cyan-300"
        >
          <CompassIcon className="h-3.5 w-3.5 text-cyan-400" />
          <span className="hidden sm:inline">领航</span>
        </span>
        {/* 360 环视 */}
        <span
          title="360° 全景环视"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-white/75 hover:bg-white/[0.1] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
            <circle cx="10" cy="10" r="6.5" />
            <circle cx="10" cy="10" r="2.2" />
          </svg>
        </span>
        {/* 音乐媒体 */}
        <span
          title="车载音响"
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.05] text-white/75 hover:bg-white/[0.1] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-3.5 w-3.5">
            <path d="M7 15V5l9-2v10" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="5" cy="15" r="2" />
            <circle cx="14" cy="13" r="2" />
          </svg>
        </span>
        {/* 车辆设定 */}
        <span
          title="车辆与悬挂设置"
          className="flex h-7 items-center gap-1 rounded-lg bg-white/[0.05] px-2 text-[10px] font-mono text-white/70"
        >
          <CarIcon className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden md:inline">云辇舒适</span>
        </span>
      </div>

      {/* 右侧：丝路音乐微件 + 副驾空调 */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-white/65 font-sans bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
          <span className="truncate max-w-[110px]">河西走廊 · 丝路民谣</span>
          <span className="text-white/40 font-mono">01:42</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-white/90 text-[11px] bg-white/[0.06] px-2.5 py-0.5 rounded-full border border-white/[0.06]">
          <span className="text-white/40 cursor-pointer">‹</span>
          <span className="font-bold">22.5°C</span>
          <span className="text-white/40 cursor-pointer">›</span>
        </div>
      </div>
    </footer>
  );
}

/* ═════════════════════ 手机投车飞向中控的高光脉冲 ═════════════════════ */
function PhoneToCockpitPulse() {
  const p = useProgress();
  const [a, b] = T.streamFly;
  const opacity = useFade(p, a, a + 0.004, b - 0.004, b);
  const x = useRange(p, [a, b], [240, 0]);
  const y = useRange(p, [a, b], [160, 0]);
  const scale = useRange(p, [a, b], [0.4, 1.2]);

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute z-50 flex items-center justify-center"
      style={{ opacity, x, y, scale }}
    >
      <div className="h-10 w-10 rounded-full bg-cyan-400 blur-md opacity-80" />
      <div className="absolute h-5 w-5 rounded-full bg-white shadow-[0_0_20px_#38BDF8]" />
    </motion.div>
  );
}
