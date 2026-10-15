'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
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
  SunsetIcon,
} from '@/components/common/Icons';

/**
 * TripCraft C-CABIN 原生智能座舱与车道级 NOA 领航沙盘
 *
 * 核心设计准则（全面继承 Opus 5.5 质感工程范式）：
 * 1. 东方人文与现代科技相融的高级座舱：拒绝廉价纯黑与粗糙梯形，采用深邃石板钛墨 (#131620 / #181c28) 配合琥珀金 (--tc-gold)、青甘碧 (--tc-jade)、丹霞红 (--tc-ochre)
 * 2. 高精度城市车道级矢量沙盘：精细道路网格、斑马线、导向箭头、水系微光、流动车道标线、NOA 引导流金光毯
 * 3. 腾势 D9 顶视流线豪华自车：金属漆反光、车顶行李箱 2.15m 刻线、激光雷达波纹扫描、前车 35m 感知框
 * 4. 五幕长镜头完美闭环：手机投车脉冲 ➔ 车机唤醒时序重排 ➔ 3D 车道级 NOA 巡航 ➔ 2.15m 限高拦截与地面改道 ➔ 驻车切换 P 挡与 WalkLens 接力
 */
export function CockpitScene() {
  const p = useProgress();
  const visibility = useVisibility(p, T.cockpitIn[0] - 0.008, T.cockpitOut[1] + 0.008);

  // 连续变形单镜头进出场：带有轻微物理质量感 (ease.back)
  const opacity = useFade(p, T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]);
  const scale = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [0.93, 1, 1, 0.96],
    { easing: ease.back, rest: 1 },
  );
  const y = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [40, 0, 0, -24],
    { easing: ease.out, rest: 0 },
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-6 gpu-layer [contain:layout_paint]"
      style={{ visibility }}
      role="region"
      aria-label="TripCraft 车载座舱与自动驾驶领航导航演示"
    >
      {/* 镜头 1: 手机投车飞向中控的流金高光脉冲 */}
      <PhoneToCockpitPulse />

      {/* 车载横向中控大屏外壳 (C-CABIN 硬件形态) */}
      <motion.div
        className="pointer-events-auto relative flex flex-col w-full max-w-[1040px] h-[min(530px,94%)] rounded-[22px] sm:rounded-[30px] bg-[#12151e]/98 border border-white/20 p-2 sm:p-3 shadow-[0_28px_80px_rgba(15,23,42,0.75)] text-white overflow-hidden [container-type:size] backdrop-blur-2xl"
        style={{ opacity, scale, y }}
      >
        {/* 顶部环境氛围光与金属微高光反光层 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[22px] sm:rounded-[30px] ring-1 ring-inset ring-white/10" />

        {/* 1. 车规顶栏 */}
        <CockpitHeader />

        {/* 2. 团队路书实时流转系统通知 */}
        <CockpitSyncNotification />

        {/* 3. 中控主体：左侧时序行程流 + 右侧车道级高精沙盘 */}
        <div className="relative flex-1 min-h-0 flex flex-col md:flex-row gap-2 sm:gap-3 mt-1.5 sm:mt-2 overflow-hidden">
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
    <header className="relative flex h-8 sm:h-9 shrink-0 items-center justify-between border-b border-white/10 px-1 sm:px-2 select-none">
      {/* 左侧：TripCraft 旅字标 + C-CABIN 原生座舱标识 + 车型 */}
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-gold via-gold-ink to-ink font-serif text-[10px] sm:text-xs font-bold text-paper shadow-level-static ring-1 ring-gold/40">
          旅
        </span>
        <div className="flex items-baseline gap-1.5 min-w-0">
          <span className="font-serif text-[11px] sm:text-xs font-bold tracking-wide text-white">
            TripCraft <span className="text-gold font-mono font-semibold">C-CABIN</span>
          </span>
          <span className="chip hidden sm:inline-flex rounded-pill bg-white/[0.08] text-[9px] font-mono px-1.5 py-0 text-white/80 border border-white/10">
            腾势 D9 · 7座旗舰版
          </span>
        </div>
      </div>

      {/* 中间：挡位控制器 (D 挡巡航 ➔ P 挡驻车) */}
      <div className="flex items-center gap-1 sm:gap-1.5 rounded-pill bg-black/40 px-2 py-0.5 border border-white/10 font-mono text-[10px] sm:text-xs">
        <span
          className={`px-1.5 py-0.2 rounded font-bold transition-all duration-300 ${
            isParked ? 'bg-jade text-black shadow-[0_0_10px_rgba(46,209,139,0.8)] scale-105' : 'text-white/35'
          }`}
        >
          P
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white/35">R</span>
        <span className="text-white/20">|</span>
        <span className="text-white/35">N</span>
        <span className="text-white/20">|</span>
        <span
          className={`px-1.5 py-0.2 rounded font-bold transition-all duration-300 ${
            !isParked ? 'bg-gold text-black shadow-[0_0_10px_rgba(212,160,78,0.8)] scale-105' : 'text-white/35'
          }`}
        >
          D
        </span>
      </div>

      {/* 右侧：RTK高精定位、5G网络信标、时间与室外温度 */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 font-mono text-[9px] sm:text-[11px] text-white/70">
        <span className="hidden xs:inline-flex items-center gap-1 text-jade">
          <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
          <span>RTK 厘米级</span>
        </span>
        <span className="text-white/20 hidden xs:inline">|</span>
        <span className="flex items-center gap-1 text-gold">
          <RadioIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gold" />
          <span>5G · 18ms</span>
        </span>
        <span className="text-white/20">|</span>
        <span className="text-white font-semibold">20:05</span>
        <span className="hidden sm:inline text-white/60">19°C 兰州</span>
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
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-pill bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-blue-950/95 px-3 py-1 border border-gold/40 shadow-level-float backdrop-blur-xl text-[10px] sm:text-xs">
        <SparklesIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gold animate-spin" />
        <span className="text-white font-medium">收到副驾小雨与领队同步的路书</span>
        <span className="chip rounded-pill bg-jade/20 text-jade text-[9px] font-mono font-bold px-1.5">v1.1</span>
        <span className="text-gold font-medium">· 正宁路夜市已注入中控排程 (顺路度 98%)</span>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 3. 左侧：时序行程流 (Cockpit Schedule Flow) ═════════════════ */
function CockpitScheduleFlow() {
  const p = useProgress();

  // 镜头 2 动效：正宁路夜市卡片向下弹性展开
  const insertHeight = useRange(p, [T.cockpitSchedule[0], T.cockpitSchedule[1]], [0, 72], {
    easing: ease.back,
    rest: 72,
  });
  const insertOpacity = useFade(p, T.cockpitSchedule[0] + 0.003, T.cockpitSchedule[1]);
  const insertScale = useRange(p, [T.cockpitSchedule[0], T.cockpitSchedule[1]], [0.85, 1], {
    easing: ease.back,
    rest: 1,
  });

  // 镜头 4 动效：终点由夜市地库动态切为酒店地面大巴车位
  const isRerouted = useStep(p, [T.heightAlert[0]]) >= 1;

  return (
    <div className="relative flex flex-col w-full md:w-[31%] shrink-0 rounded-control bg-white/[0.05] p-2 sm:p-2.5 border border-white/10 overflow-hidden">
      {/* 行程头部 */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
        <div>
          <p className="font-serif text-[11px] sm:text-xs font-bold text-white">今日行程 · D0 兰州</p>
          <p className="text-[9px] text-white/60 font-mono">1,980 km 丝路自驾已同步</p>
        </div>
        <span className="chip rounded-pill bg-gold/15 text-gold text-[9px] font-mono px-1.5 py-0 font-semibold border border-gold/30">
          {isRerouted ? '已自动避障改道' : '巡航导航中'}
        </span>
      </div>

      {/* 节点列表 */}
      <div className="flex-1 min-h-0 space-y-1.5 mt-1.5 overflow-hidden flex flex-col justify-between">
        {/* 节点 1: 已集结 */}
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/50">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-jade/20 text-jade">
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
          <span className="font-mono">18:30</span>
          <span className="line-through">兰州中川机场落地接机</span>
        </div>

        {/* 节点 2: 酒店入住 */}
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/50">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-jade/20 text-jade">
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
          <span className="font-mono">19:15</span>
          <span className="line-through">水岸云上酒店入住办理</span>
        </div>

        {/* 节点 3: 动态插入的正宁路夜市推荐 (镜头 2 核心呈现) */}
        <motion.div
          className="overflow-hidden"
          style={{ height: insertHeight, opacity: insertOpacity, scale: insertScale }}
        >
          <div className="relative rounded-control bg-gradient-to-r from-gold/25 via-gold/10 to-transparent p-1.5 sm:p-2 border border-gold/60 shadow-[0_0_14px_rgba(212,160,78,0.3)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-gold flex items-center gap-1">
                <UtensilsIcon className="h-2.5 w-2.5 text-gold" />
                <span>20:00 正宁路夜市</span>
              </span>
              <span className="chip rounded-pill bg-jade/20 text-jade text-[8px] font-mono font-bold px-1 border border-jade/30">
                顺路度 98%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-white mt-0.5 truncate">
              赵记牛奶鸡蛋醪糟 (舌尖名店)
            </p>
            <div className="mt-1 flex items-center justify-between text-[8px] text-white/70 border-t border-white/10 pt-0.5">
              <span>阿杰提名 · 领队已采纳</span>
              <span className="text-gold font-mono font-semibold">
                {isRerouted ? '泊车：大巴地面车位' : '距酒店 950m'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 节点 4: 晚间安歇 */}
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/50">
          <span className="h-4 w-4 shrink-0 rounded-full border border-white/20 flex items-center justify-center text-[8px]">
            4
          </span>
          <span className="font-mono">21:30</span>
          <span>漫步黄河铁桥返回酒店安歇</span>
        </div>

        {/* 底部自驾物理契约微标 */}
        <div className="rounded-control bg-black/30 p-1.5 border border-white/10 text-[8px] sm:text-[9px] space-y-0.5 mt-auto">
          <div className="flex items-center justify-between text-white/80">
            <span className="flex items-center gap-1 font-semibold text-gold">
              <CarIcon className="h-3 w-3 text-gold" />
              <span>7座 MPV 契约</span>
            </span>
            <span className="font-mono text-jade">车高 2.15m 限高硬约束</span>
          </div>
          <div className="flex items-center justify-between text-white/60">
            <span className="flex items-center gap-1">
              <ElderIcon className="h-2.5 w-2.5 text-gold" />
              <span>长辈无障碍慢游</span>
            </span>
            <span className="flex items-center gap-1">
              <BabyIcon className="h-2.5 w-2.5 text-ochre" />
              <span>幼儿作息锁定</span>
            </span>
          </div>
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

  // 道路标线随行车平滑流动
  const laneOffset = useRange(p, [T.cockpitNav[0], T.cockpitNav[1]], [0, 80]);
  const laneDashOffset = useTransform(laneOffset, (v) => `${(v * 3.5) % 36}px`);

  // NOA 领航引导光毯铺设
  const pathDraw = useRange(p, [T.cockpitNav[0], T.cockpitNav[0] + 0.018], [0, 1]);

  // 改道与泊车步进判断
  const isRerouting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 min-h-0 rounded-control bg-[#151824] border border-white/10 overflow-hidden flex flex-col justify-between">
      {/* 顶部智驾辅助与领航状态胶囊条 */}
      <div className="relative z-20 flex items-center justify-between p-2 bg-gradient-to-b from-[#151824] via-[#151824]/90 to-transparent">
        {/* NOA 状态胶囊 */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-pill bg-jade/20 px-2 py-0.5 border border-jade/40 text-[9px] sm:text-[11px] font-bold text-jade shadow-[0_0_8px_rgba(46,209,139,0.3)]">
            <span className="h-2 w-2 rounded-full bg-jade animate-ping" />
            <span>NOA 领航辅助巡航中</span>
          </span>
          <span className="text-[9px] font-mono text-white/60 hidden sm:inline">车道居中 · 绿波畅行</span>
        </div>

        {/* 下一机动点指示牌 */}
        <div className="flex items-center gap-1.5 rounded-control bg-black/40 px-2 py-0.5 border border-white/10 text-[9px] sm:text-[10px]">
          <CompassIcon className="h-3 w-3 text-gold" />
          <span className="text-white/80">前方 800m ➔</span>
          <span className="font-bold text-gold">
            {isRerouting ? '水岸云上酒店大巴车位 (右转)' : '白银路 (直行)'}
          </span>
        </div>
      </div>

      {/* 核心高精矢量车道沙盘透视区 */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {/* 远景夜空与黄河微波反光 */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-[#0c0e16] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-1/4 h-px bg-gradient-to-r from-transparent via-[#5b8db5]/40 to-transparent" />

        <svg
          viewBox="0 0 600 360"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* NOA 琥珀金与翡翠绿相间的领航光毯渐变 */}
            <linearGradient id="noa-gold-carpet" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgb(46 209 139)" stopOpacity="0.85" />
              <stop offset="60%" stopColor="rgb(212 160 78)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(212 160 78)" stopOpacity="0.15" />
            </linearGradient>

            {/* 改道地面车位引导光毯 */}
            <linearGradient id="reroute-gold-carpet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(46 209 139)" stopOpacity="0.85" />
              <stop offset="55%" stopColor="rgb(212 160 78)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(31 78 121)" stopOpacity="0.3" />
            </linearGradient>

            {/* 自车前向雷达同心圆波纹 */}
            <radialGradient id="lidar-cone" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor="rgba(46, 209, 139, 0.4)" />
              <stop offset="60%" stopColor="rgba(56, 189, 248, 0.18)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>

            {/* 车灯路面照明 */}
            <linearGradient id="headlight-beam" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>

          {/* 道路底基 (深邃夜间沥青石板) */}
          <polygon points="100,360 240,105 360,105 500,360" fill="#1b1f2e" />

          {/* 道路左右边缘路缘石与护栏微反光 */}
          <line x1="100" y1="360" x2="240" y2="105" stroke="#4a5568" strokeWidth="4" />
          <line x1="500" y1="360" x2="360" y2="105" stroke="#4a5568" strokeWidth="4" />

          {/* 车道标线 1 */}
          <line
            x1="233"
            y1="360"
            x2="280"
            y2="105"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeDasharray="16 16"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.5"
          />

          {/* 车道标线 2 */}
          <line
            x1="367"
            y1="360"
            x2="320"
            y2="105"
            stroke="#e2e8f0"
            strokeWidth="2.5"
            strokeDasharray="16 16"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.5"
          />

          {/* 路面导向箭头与斑马线标线 */}
          <g opacity="0.35" stroke="#ffffff" strokeWidth="2" fill="none">
            <path d="M 295 180 L 300 170 L 305 180 M 300 170 L 300 195" />
            <path d="M 400 240 L 415 225 L 430 225" />
          </g>

          {/* NOA 推荐巡航光毯 */}
          {!isRerouting ? (
            <motion.polygon
              points="240,360 283,115 317,115 360,360"
              fill="url(#noa-gold-carpet)"
              style={{ opacity: pathDraw }}
            />
          ) : (
            /* 镜头 4: 限高拦截后切向右侧地面大巴车位的引导光毯 */
            <motion.polygon
              points="240,360 295,245 425,155 470,185 345,360"
              fill="url(#reroute-gold-carpet)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 0.35 }}
            />
          )}

          {/* 前方 35m 感知探测目标车 (立体半透明框 + 测距微标) */}
          <g transform="translate(295, 150)">
            <rect x="-15" y="-9" width="30" height="20" rx="4" fill="rgba(255,255,255,0.15)" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="-12" y1="11" x2="12" y2="11" stroke="#ef4444" strokeWidth="2.5" />
            <rect x="-24" y="-22" width="48" height="12" rx="3" fill="rgba(15,23,42,0.85)" stroke="#38bdf8" strokeWidth="0.8" />
            <text x="0" y="-13" textAnchor="middle" fill="#38bdf8" fontSize="8" fontFamily="monospace" fontWeight="bold">
              前车 35m
            </text>
          </g>

          {/* 腾势 D9 顶视流线豪华自车 (Ego Vehicle) */}
          <g transform="translate(300, 290)">
            {/* 前大灯照明白光 */}
            <polygon points="-16,-34 -45,-120 45,-120 16,-34" fill="url(#headlight-beam)" />

            {/* 激光雷达波纹扫描 */}
            <motion.path
              d="M -75 -45 L 0 0 L 75 -45 Z"
              fill="url(#lidar-cone)"
              animate={{ opacity: [0.3, 0.75, 0.3] }}
              transition={{ duration: 2.2, repeat: Infinity }}
            />

            {/* 车身投影 */}
            <ellipse cx="0" cy="10" rx="32" ry="16" fill="rgba(0,0,0,0.65)" />

            {/* 腾势 D9 车身外轮廓 (双色流线豪华漆面) */}
            <rect x="-25" y="-38" width="50" height="76" rx="12" fill="#252b3d" stroke="#d4a04e" strokeWidth="1.8" />
            {/* 前后挡风玻璃 */}
            <path d="M -18 -18 L 18 -18 L 14 -2 M -14 -2 Z" fill="#131722" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            <path d="M -16 22 L 16 22 L 14 30 L -14 30 Z" fill="#131722" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />

            {/* 车顶旅行行李箱 (2.15m 限高核心物理特征) */}
            <rect x="-12" y="-14" width="24" height="38" rx="6" fill="#0f131d" stroke="rgb(212,160,78)" strokeWidth="1.5" />
            <text x="0" y="8" textAnchor="middle" fill="rgb(212,160,78)" fontSize="8" fontFamily="monospace" fontWeight="bold">
              2.15m
            </text>

            {/* 前大灯 */}
            <circle cx="-18" cy="-35" r="3" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />
            <circle cx="18" cy="-35" r="3" fill="#ffffff" filter="drop-shadow(0 0 4px #ffffff)" />

            {/* 贯穿式红色 LED 尾灯 */}
            <rect x="-22" y="35" width="44" height="3.5" rx="1.5" fill="#ef4444" filter="drop-shadow(0 0 8px #ef4444)" />
          </g>

          {/* 右侧专属大巴车位指示标 (镜头 4 出现) */}
          {isRerouting && (
            <g transform="translate(450, 140)">
              <rect x="-40" y="-16" width="80" height="32" rx="6" fill="#1f4e79" stroke="#2ed18b" strokeWidth="2" filter="drop-shadow(0 0 10px rgba(46,209,139,0.5))" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                P 地面大巴位
              </text>
              <text x="0" y="22" textAnchor="middle" fill="#2ed18b" fontSize="8" fontWeight="bold">
                无高度限制 · 已预留
              </text>
            </g>
          )}
        </svg>

        {/* 悬浮车规 HUD 投影仪 (Heads-Up Display) */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-control bg-black/60 p-2 border border-white/15 backdrop-blur-md">
          <div className="flex items-baseline gap-1">
            <span ref={speedRef} className="font-mono text-2xl sm:text-3xl font-extrabold text-white tabular-nums">
              82
            </span>
            <span className="text-[9px] font-mono text-white/60">km/h</span>
          </div>

          <div className="flex items-center gap-1.5 text-[8px] sm:text-[9px] font-mono">
            <span className="flex h-4 w-4 items-center justify-center rounded-full border border-red-500 bg-white font-bold text-black">
              80
            </span>
            <span className="text-jade font-semibold">绿波引导 75-85</span>
          </div>

          <div className="text-[8px] text-white/60 font-mono mt-0.5">
            {isParked ? '已安全泊入专属车位' : '距目的地 1.2km · 4分钟'}
          </div>
        </div>
      </div>

      {/* 车机底栏：当前路段信标 */}
      <footer className="relative z-20 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-white/10 px-2 sm:px-3 bg-[#151824] text-[8px] sm:text-[9px] font-mono text-white/60">
        <span className="truncate">白银路 ➔ 黄河水岸云上酒店地面通道</span>
        <span className="text-gold font-semibold hidden xs:inline">
          {isRerouting ? '物理风控避障中' : 'TripCraft 高精车规领航引擎'}
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
  const scale = useRange(p, [a, b, c, d], [0.88, 1, 1, 0.94], { easing: ease.back, rest: 1 });
  const y = useRange(p, [a, b, c, d], [24, 0, 0, -16], { rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-3 sm:inset-x-6 top-14 sm:top-16 z-50 flex justify-center"
      style={{ opacity, scale, y, visibility }}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-card bg-[#1a1215]/98 p-2.5 sm:p-3.5 border-2 border-amber-500/80 shadow-[0_16px_40px_rgba(217,119,6,0.4)] backdrop-blur-2xl max-w-xl">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-control bg-amber-500/20 text-amber-400 border border-amber-500/50 animate-pulse">
          <AlertTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs sm:text-sm font-bold text-amber-200">
              7座 MPV (车顶箱) 2.15m 限高物理规则拦截！
            </span>
            <span className="chip rounded-pill bg-amber-500/20 text-amber-300 text-[8px] font-mono font-bold px-1.5 border border-amber-500/30">
              刚性风控
            </span>
          </div>
          <p className="mt-0.5 text-[9px] sm:text-[11px] text-white/90 leading-tight">
            正宁路夜市老城地库限高 <b className="text-amber-400">2.0m</b> 无法驶入！已触发自驾风控。
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-jade font-medium">
            <CheckIcon className="h-3 w-3 text-jade shrink-0" />
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
      <div className="flex items-center justify-between w-full max-w-lg rounded-pill bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-blue-950/95 px-3 py-1.5 border border-jade/50 shadow-[0_8px_30px_rgba(46,209,139,0.3)] backdrop-blur-xl text-[10px] sm:text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jade text-black font-bold">
            P
          </span>
          <div>
            <span className="font-bold text-white">已安全泊入地面大巴位</span>
            <span className="text-jade font-mono ml-1.5">· 步行漫步接力开启</span>
          </div>
        </div>

        <span className="chip rounded-pill bg-gold/20 text-gold text-[9px] font-mono px-2 py-0.5 font-semibold border border-gold/30">
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
        <span className="h-6 w-6 rounded-full bg-gold animate-ping opacity-75" />
        <span className="absolute h-4 w-4 rounded-full bg-gradient-to-r from-gold to-ochre shadow-[0_0_16px_rgba(212,160,78,0.9)]" />
        <span className="absolute -top-4 font-mono text-[9px] font-bold text-gold whitespace-nowrap bg-black/80 px-1.5 py-0.2 rounded-pill border border-gold/40">
          ⚡ 途经点流转中
        </span>
      </div>
    </motion.div>
  );
}
