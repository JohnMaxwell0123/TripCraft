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
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-3 md:p-4 gpu-layer"
      style={{ visibility }}
      role="region"
      aria-label="TripCraft 车载座舱与自动驾驶领航导航演示"
    >
      {/* 手机投车飞向中控的高光脉冲 */}
      <PhoneToCockpitPulse />

      {/* 车载横向中控大屏外壳 (完全对齐小米 SU7 极简奢华车规形态) */}
      <motion.div
        className="pointer-events-auto relative flex flex-col w-full max-w-[1040px] h-[min(530px,96%)] rounded-[26px] sm:rounded-[32px] bg-[#0E1118] border border-white/20 p-2 sm:p-2.5 shadow-[0_36px_100px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.2)] text-white overflow-hidden backdrop-blur-3xl"
        style={{ opacity, scale, y }}
      >
        {/* 顶部微高光反光层 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[26px] sm:rounded-[32px] ring-1 ring-inset ring-white/10" />

        {/* 1. 车规顶栏 (PRND 档位、429km 续航、5G、RTK) */}
        <CockpitHeader />

        {/* 2. 团队路书实时流转系统通知 */}
        <CockpitSyncNotification />

        {/* 3. 中控主体分屏：左侧 3D NOA 智驾感知区 + 右侧高精路线导航卡片 (对齐实机图3) */}
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
      {/* 左侧：PRND 挡位 + 429km 电池续航 (完全对齐图3) */}
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

      {/* 右侧：RTK高精定位、5G网络信标、时间与室外温度 (完全对齐图3) */}
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
      className="pointer-events-none absolute inset-x-0 top-10 sm:top-11 z-30 flex justify-center px-3"
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

/* ═════════════════════ 3. 左侧：3D NOA 智驾感知视界 (55% 宽度，完全对齐图3) ════════════════════ */
function CockpitPerceptionView() {
  const p = useProgress();

  // 动态车速读数：巡航时 82 km/h，限高改道后减速至泊车 0 km/h
  const speed = useScrollCounter(p, 82, 0, T.parkEngage[0], T.parkEngage[1], 0);

  // 道路标线平滑流动
  const laneOffset = useRange(p, [T.cockpitNav[0], T.cockpitNav[1]], [0, 80]);
  const laneDashOffset = useTransform(laneOffset, (v) => `${(v * 3.5) % 36}px`);

  // 改道与泊车步进判断
  const isAlerting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 md:w-[54%] lg:w-[56%] shrink-0 rounded-2xl bg-gradient-to-b from-[#DCE3EB] via-[#E8EFF6] to-[#F1F5F9] border border-black/10 overflow-hidden flex flex-col justify-between text-slate-800 shadow-sm">
      {/* 顶部速度仪表盘与智驾状态 (大字号 82 km/h + 红圈限速 80 + NOA 绿标，完全对齐图3) */}
      <div className="relative z-20 flex items-center justify-between p-3 select-none">
        {/* 左侧车速读数 (动态滚动计数器通过 ref 驱动 DOM，零 React 重渲染) */}
        <div className="flex items-baseline gap-2">
          <div className="flex items-baseline">
            <span
              ref={speed}
              className="text-4xl sm:text-5xl font-bold font-sans tracking-tight text-slate-900 leading-none"
            >
              82
            </span>
            <span className="text-xs font-semibold text-slate-500 ml-1 font-mono">km/h</span>
          </div>

          {/* 红圈限速标识 (图3中的 100 / 80 限速圈) */}
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-rose-500 bg-white shadow-sm font-mono text-[10px] font-bold text-slate-800">
            80
          </div>
        </div>

        {/* 右侧智驾领航状态 (对齐图3绿色 NOA 状态胶囊) */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-white text-[11px] font-semibold shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            <span>{isParked ? 'P 挡已驻车' : 'NOA 领航辅助'}</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">车道居中 · 绿波畅行</span>
        </div>
      </div>

      {/* 核心 3D 透视车道沙盘 (高精矢量渲染：蓝色彩车前车感知、蓝色导引光毯、自车 MPV，完全对齐图3) */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        <svg
          viewBox="0 0 500 320"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* 蓝色引导光毯渐变 (对齐图3中的前方高亮蓝色导引光毯) */}
            <linearGradient id="noa-blue-carpet" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.85" />
              <stop offset="60%" stopColor="#38BDF8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#7DD3FC" stopOpacity="0.08" />
            </linearGradient>

            {/* 改道地面车位引导光毯 (触发 2.15m 限高规避时变色拐向) */}
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

          {/* 核心导引光毯 (自车前方的蓝色导引路径，完全还原图3!) */}
          <polygon
            points={isAlerting ? "210,320 290,320 330,120 280,120" : "210,320 290,320 270,110 230,110"}
            fill={isAlerting ? "url(#reroute-carpet)" : "url(#noa-blue-carpet)"}
          />

          {/* 感知前车 1：正前方的蓝色大货车/客车 (完全对齐图3实拍照中的前车模型!) */}
          <g transform="translate(236, 125)">
            {/* 前车外框与阴影 */}
            <rect x="-14" y="-28" width="28" height="34" rx="4" fill="#0284C7" stroke="#0369A1" strokeWidth="1.5" />
            <rect x="-11" y="-25" width="22" height="12" rx="2" fill="#38BDF8" fillOpacity="0.8" />
            <rect x="-12" y="-10" width="24" height="12" rx="2" fill="#0284C7" />
            {/* 尾灯与牌照 */}
            <circle cx="-9" cy="4" r="2" fill="#EF4444" />
            <circle cx="9" cy="4" r="2" fill="#EF4444" />
            <rect x="-4" y="2" width="8" height="3" fill="#F8FAFC" />
            {/* 前车跟车距离微标 */}
            <g transform="translate(0, -36)">
              <rect x="-24" y="-8" width="48" height="14" rx="3" fill="#1E293B" fillOpacity="0.85" />
              <text x="0" y="2.5" fontSize="8" fontWeight="600" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif">
                前车 35m
              </text>
            </g>
          </g>

          {/* 感知侧向车辆 2：左车道白车 (对齐图3旁边车道的小白车) */}
          <g transform="translate(140, 200)">
            <rect x="-12" y="-20" width="24" height="30" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="-9" y="-17" width="18" height="8" rx="2" fill="#64748B" fillOpacity="0.4" />
            <circle cx="-8" cy="8" r="1.5" fill="#EF4444" />
            <circle cx="8" cy="8" r="1.5" fill="#EF4444" />
          </g>

          {/* 感知侧向车辆 3：右车道白车 (对齐图3右侧车道小车) */}
          <g transform="translate(360, 230)">
            <rect x="-12" y="-20" width="24" height="30" rx="4" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            <rect x="-9" y="-17" width="18" height="8" rx="2" fill="#64748B" fillOpacity="0.4" />
            <circle cx="-8" cy="8" r="1.5" fill="#EF4444" />
            <circle cx="8" cy="8" r="1.5" fill="#EF4444" />
          </g>

          {/* 自车模型：7座豪华 MPV (腾势 D9，车顶行李箱 2.28m 标定，完全对齐图3自车位置) */}
          <g transform="translate(250, 275)">
            {/* 车身阴影 */}
            <ellipse cx="0" cy="8" rx="24" ry="10" fill="#64748B" fillOpacity="0.3" />
            {/* 腾势 D9 车顶轮廓 */}
            <rect x="-19" y="-34" width="38" height="46" rx="7" fill="#1E293B" stroke="#0EA5E9" strokeWidth="1.5" />
            {/* 天窗与全景玻璃 */}
            <rect x="-14" y="-30" width="28" height="20" rx="4" fill="#38BDF8" fillOpacity="0.5" />
            {/* 加装车顶行李箱 (刚性高度 2.28m 物理实体) */}
            <rect x="-9" y="-26" width="18" height="28" rx="3" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
            <text x="0" y="-10" fontSize="7" fontWeight="bold" textAnchor="middle" fill="#FBBF24" fontFamily="mono">
              2.28m
            </text>
            {/* 贯穿式尾灯 */}
            <rect x="-16" y="9" width="32" height="2.5" rx="1" fill="#EF4444" />
          </g>
        </svg>

        {/* 2.15m 限高激光刚性拦截与自动改道告警浮动横幅 */}
        {isAlerting && (
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute inset-x-4 top-14 z-30 flex items-center justify-between rounded-xl bg-[#7F1D1D]/95 px-3 py-2 border border-rose-500 text-white shadow-2xl backdrop-blur-md"
          >
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-500 text-white font-bold text-xs">
                !
              </span>
              <div>
                <p className="text-xs font-bold text-rose-100">
                  老城地库 2.0m 限高拦截生效
                </p>
                <p className="text-[10px] text-rose-200">
                  车高 2.28m 触发物理硬约束 · 已自动重排至地面大车位
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-black shrink-0">
              改道成功
            </span>
          </motion.div>
        )}
      </div>

      {/* 底部智驾微标 (车辆物理安全契约) */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-slate-200 bg-white/70 backdrop-blur-sm text-[10px] text-slate-600 select-none">
        <span className="flex items-center gap-1 font-semibold text-slate-800">
          <CarIcon className="h-3 w-3 text-[#0284C7]" />
          <span>腾势 D9 顶箱 2.28m 刚性校验通过</span>
        </span>
        <span className="text-emerald-700 font-mono font-medium">白银路 → 水岸云上酒店专属地面通道</span>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右侧：高精路线导航卡片 (45% 宽度，完全对齐图3实拍) ════════════════════ */
function CockpitNavigationCard() {
  const p = useProgress();
  const isAlerting = useStep(p, [T.heightAlert[0]]) >= 1;

  return (
    <div className="relative flex-1 md:w-[46%] lg:w-[44%] shrink-0 rounded-2xl bg-white shadow-md border border-slate-200/90 p-3 sm:p-3.5 flex flex-col justify-between overflow-hidden text-slate-900">
      {/* 顶部转向指示栏 (完全对齐图3实拍的 ↱ 5.2公里进入 绕城高速 + 车道引导箭头) */}
      <div className="flex items-start justify-between pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-1.5 text-lg sm:text-xl font-bold font-sans tracking-tight text-slate-900">
            <span className="text-emerald-600 font-bold">↱ 800m</span>
            <span>进入专属车道</span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAlerting ? '水岸云上酒店 · MPV 地面大巴位' : '正宁路夜市专属通道'}
          </p>
        </div>

        {/* 车道导引箭头 (对齐图3中的 ↑ ↑ ↱ 实时高精车道示意) */}
        <div className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg border border-slate-200 text-xs font-mono">
          <span className="text-slate-400">↑</span>
          <span className="text-slate-400">↑</span>
          <span className="font-bold text-emerald-600 bg-white px-1 rounded shadow-xs">↱</span>
        </div>
      </div>

      {/* 中间高精矢量导航地图 (黄河水系、连霍高速路线、实时绿色拥堵感知) */}
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

          {/* 实时高精领航路径 (绿色畅行高亮，完全对齐图3的实机路线!) */}
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

          {/* 当前车辆实时位置光标 (带脉冲波纹) */}
          <g transform="translate(110, 130)">
            <circle r="12" fill="#0284C7" fillOpacity="0.2" className="animate-ping" />
            <circle r="6" fill="#0284C7" stroke="#FFFFFF" strokeWidth="2" />
          </g>
        </svg>

        {/* 目的地信息微标签 */}
        <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-white/90 px-2 py-0.5 border border-slate-200 text-[10px] font-medium text-slate-700 shadow-xs backdrop-blur-xs">
          <UtensilsIcon className="h-3 w-3 text-[#FE3C01]" />
          <span>赵记牛奶鸡蛋醪糟 · 顺路度 98%</span>
        </div>
      </div>

      {/* 底部到达时间与距离 (完全对齐图3的 15:50 到达 · 34.4公里 · 33分钟) */}
      <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-xs">
        <div>
          <span className="text-sm font-bold font-mono text-slate-900">20:00 到达</span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span className="text-slate-600 font-mono">950m</span>
          <span className="text-slate-400 mx-1.5">·</span>
          <span className="text-slate-600">4分钟</span>
        </div>

        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          全车同频中
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════ 5. 底部完整车控 Dock (完全对齐图3) ═════════════════════ */
function CockpitBottomDock() {
  return (
    <footer className="h-9 sm:h-10 shrink-0 bg-[#0A0C12] border-t border-white/10 px-2 sm:px-4 flex items-center justify-between text-xs text-white/80 select-none">
      {/* 左侧：主页按钮 + 主驾空调温度控制 (对齐图3 < 22.0° >) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button type="button" aria-label="返回中控主页" className="p-1 hover:text-white transition-colors">
          <span className="text-base leading-none">⌂</span>
        </button>
        <div className="flex items-center gap-1 font-mono text-white/90 text-[11px] bg-white/[0.06] px-2 py-0.5 rounded-full">
          <span className="text-white/40 cursor-pointer">‹</span>
          <span className="font-bold">22.0°</span>
          <span className="text-white/40 cursor-pointer">›</span>
        </div>
      </div>

      {/* 中间：车机应用坞 (对齐图3底部的应用图标群：地图、环视、音乐、电话、设置) */}
      <div className="flex items-center gap-2 sm:gap-4 text-sm sm:text-base">
        <span title="高精导航" className="cursor-pointer hover:scale-110 transition-transform">🗺️</span>
        <span title="360° 环视影像" className="cursor-pointer hover:scale-110 transition-transform">📸</span>
        <span title="音乐媒体" className="cursor-pointer hover:scale-110 transition-transform">🎵</span>
        <span title="蓝牙电话" className="cursor-pointer hover:scale-110 transition-transform hidden xs:inline">📞</span>
        <span title="车辆设置" className="cursor-pointer hover:scale-110 transition-transform">⚙️</span>
      </div>

      {/* 右侧：媒体播放微件 + 副驾空调 (对齐图3媒体条与右侧温度) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden md:flex items-center gap-1.5 text-[10px] text-white/60 font-sans max-w-[150px] truncate">
          <span>🎵 丝路民谣</span>
          <span className="text-white/40 font-mono">1:42</span>
        </div>
        <div className="flex items-center gap-1 font-mono text-white/90 text-[11px] bg-white/[0.06] px-2 py-0.5 rounded-full">
          <span className="text-white/40 cursor-pointer">‹</span>
          <span className="font-bold">22.0°</span>
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
