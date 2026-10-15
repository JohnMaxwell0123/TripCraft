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
} from '@/components/common/Icons';

/**
 * 智能座舱主场景 (TripCraft C-CABIN 原生座舱模式)
 *
 * 遵循《多端互联与车机智驾演示开发任务指南》：
 * - 真实 App 视角：TripCraft 原生座舱模式 (C-CABIN Mode)，统一继承主 App 设计语言
 * - 五幕叙事大纲：
 *   1. 镜头 1: 副驾手机端一键投车 (Companion Handoff) ➔ 触发脉冲飞向中控
 *   2. 镜头 2: 车机大屏唤醒与日程重排 (Cockpit Awakening & Schedule Reorder)
 *   3. 镜头 3: 车道级 3D 导航与智驾领航开启 (Autonomous Cruise & NOA)
 *   4. 镜头 4: 自驾车型物理规则拦截与智能改道 (Clearance Rule Assertion & Parking)
 *   5. 镜头 5: 驻车接力与下车步行雷达 (Off-car Handoff to Walk Lens)
 * - 纯 MotionValue 零重绘性能驱动，容器查询坐标自适应
 */
export function CockpitScene() {
  const p = useProgress();
  // 活跃可见性区间：在镜头 2 破空升起到镜头 5 驻车交接完毕
  const visibility = useVisibility(p, T.cockpitIn[0] - 0.008, T.cockpitOut[1] + 0.008);

  // 一体化连续变形镜头 (Continuous One-Take)：自后景破空升起与平滑退场
  const opacity = useFade(p, T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]);
  const scale = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [0.91, 1, 1, 0.95],
    { easing: ease.back, rest: 1 },
  );
  const y = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [48, 0, 0, -28],
    { easing: ease.out, rest: 0 },
  );

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-40 flex items-center justify-center p-1.5 sm:p-3 md:p-5 gpu-layer [contain:layout_paint]"
      style={{ visibility }}
      role="region"
      aria-label="TripCraft 车载座舱与自动驾驶领航导航"
    >
      {/* 手机投车到车机的数据流转高光脉冲 */}
      <PhoneToCockpitPulse />

      {/* 车载中控横向黑镜大屏外壳 (C-CABIN 硬件形态) */}
      <motion.div
        className="pointer-events-auto relative flex flex-col w-full max-w-[1020px] h-[min(540px,94%)] rounded-[20px] sm:rounded-[28px] bg-[#0c0f17] border border-white/15 p-2 sm:p-3 shadow-[0_32px_80px_rgba(0,0,0,0.85)] text-white overflow-hidden [container-type:size]"
        style={{ opacity, scale, y }}
      >
        {/* 屏幕顶部金属防眩高光条 */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="pointer-events-none absolute inset-0 rounded-[20px] sm:rounded-[28px] ring-1 ring-inset ring-white/10" />

        {/* 1. 车规顶栏 */}
        <CockpitHeader />

        {/* 2. 团队路书实时流转广播通知胶囊 */}
        <CockpitSyncNotification />

        {/* 3. 座舱中控主体：左侧时序行程流 + 右侧 3D 车道级智驾导航沙盘 */}
        <div className="relative flex-1 min-h-0 flex flex-col md:flex-row gap-2 sm:gap-3 mt-1.5 sm:mt-2 overflow-hidden">
          <CockpitScheduleFlow />
          <CockpitAutonomousNav />
        </div>

        {/* 4. 镜头 4: 2.15m 限高规则拦截与自动改道告警卡片 */}
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
  // 挡位切换：巡航时为 D 挡，泊车阶段 (parkEngage) 切换为 P 挡
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
          <span className="chip hidden sm:inline-flex rounded-pill bg-white/10 text-[9px] font-mono px-1.5 py-0 text-white/80">
            腾势 D9 · 7座豪华版
          </span>
        </div>
      </div>

      {/* 中间：挡位控制器 (D 挡巡航 ➔ P 挡驻车) 与当前行车模式 */}
      <div className="flex items-center gap-1 sm:gap-1.5 rounded-pill bg-white/[0.06] px-2 py-0.5 border border-white/10 font-mono text-[10px] sm:text-xs">
        <span
          className={`px-1.5 py-0.2 rounded font-bold transition-colors duration-300 ${
            isParked ? 'bg-jade text-black shadow-[0_0_8px_rgba(46,209,139,0.7)]' : 'text-white/40'
          }`}
        >
          P
        </span>
        <span className="text-white/30">|</span>
        <span className="text-white/40">R</span>
        <span className="text-white/30">|</span>
        <span className="text-white/40">N</span>
        <span className="text-white/30">|</span>
        <span
          className={`px-1.5 py-0.2 rounded font-bold transition-colors duration-300 ${
            !isParked ? 'bg-gold text-black shadow-[0_0_8px_rgba(212,160,78,0.7)]' : 'text-white/40'
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
  // 镜头 2 唤醒时从顶部滑入提示通知
  const notifOpacity = useFade(p, T.cockpitIn[1], T.cockpitIn[1] + 0.006, T.cockpitSchedule[1] + 0.015, T.cockpitSchedule[1] + 0.022);
  const notifY = useRange(p, [T.cockpitIn[1], T.cockpitIn[1] + 0.006], [-12, 0], { rest: 0 });

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
  const insertHeight = useRange(p, [T.cockpitSchedule[0], T.cockpitSchedule[1]], [0, 68], { easing: ease.back, rest: 68 });
  const insertOpacity = useFade(p, T.cockpitSchedule[0] + 0.003, T.cockpitSchedule[1]);
  const insertScale = useRange(p, [T.cockpitSchedule[0], T.cockpitSchedule[1]], [0.85, 1], { easing: ease.back, rest: 1 });

  // 镜头 4 动效：终点由夜市地库动态切为酒店地面大巴车位
  const isRerouted = useStep(p, [T.heightAlert[0]]) >= 1;

  return (
    <div className="relative flex flex-col w-full md:w-[32%] shrink-0 rounded-control bg-white/[0.04] p-2 sm:p-2.5 border border-white/10 overflow-hidden">
      {/* 行程头部 */}
      <div className="flex items-center justify-between pb-1.5 border-b border-white/10">
        <div>
          <p className="font-serif text-[11px] sm:text-xs font-bold text-white">今日行程 · D0 兰州</p>
          <p className="text-[9px] text-white/60 font-mono">1,980 km 丝路行程已同步</p>
        </div>
        <span className="chip rounded-pill bg-gold/15 text-gold text-[9px] font-mono px-1.5 py-0 font-semibold">
          {isRerouted ? '已自动避障改道' : '巡航导航中'}
        </span>
      </div>

      {/* 节点列表 */}
      <div className="flex-1 min-h-0 space-y-1.5 mt-1.5 overflow-hidden flex flex-col justify-between">
        {/* 节点 1: 已落地 */}
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/50">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-jade/20 text-jade">
            <CheckIcon className="h-2.5 w-2.5" />
          </span>
          <span className="font-mono">18:30</span>
          <span className="line-through">兰州中川机场集结</span>
        </div>

        {/* 节点 2: 酒店入住办理 */}
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
          <div className="rounded-control bg-gradient-to-r from-gold/20 via-gold/10 to-transparent p-1.5 sm:p-2 border border-gold/50 shadow-[0_0_12px_rgba(212,160,78,0.25)]">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[9px] font-bold text-gold flex items-center gap-1">
                <UtensilsIcon className="h-2.5 w-2.5 text-gold" />
                <span>20:00 正宁路夜市</span>
              </span>
              <span className="chip rounded-pill bg-jade/20 text-jade text-[8px] font-mono font-bold px-1">
                顺路度 98%
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] font-bold text-white mt-0.5 truncate">
              赵记牛奶鸡蛋醪糟 (舌尖推荐)
            </p>
            <div className="mt-1 flex items-center justify-between text-[8px] text-white/70 border-t border-white/10 pt-0.5">
              <span>阿杰提名 · 团队已确认</span>
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

        {/* 底部车型物理契约规则锁定条 */}
        <div className="rounded-control bg-white/[0.04] p-1.5 border border-white/10 text-[8px] sm:text-[9px] space-y-0.5 mt-auto">
          <div className="flex items-center justify-between text-white/80">
            <span className="flex items-center gap-1 font-semibold text-gold">
              <CarIcon className="h-3 w-3 text-gold" />
              <span>7座 MPV 车身契约</span>
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

/* ═════════════════════ 4. 右侧：3D 车道级智驾导航沙盘 (Autonomous NOA Sandbox) ══════════ */
function CockpitAutonomousNav() {
  const p = useProgress();

  // 镜头 3 & 4 动态车速：巡航时 82 km/h，限高改道后平稳减速泊车至 0 km/h
  const speedRef = useScrollCounter(p, 82, 0, T.parkEngage[0], T.parkEngage[1], 0);

  // 车道流动标线偏移量
  const laneOffset = useRange(p, [T.cockpitNav[0], T.cockpitNav[1]], [0, 100]);
  const laneDashOffset = useTransform(laneOffset, (v) => `${(v * 4) % 40}px`);

  // 引导轨迹路径铺设
  const pathDraw = useRange(p, [T.cockpitNav[0], T.cockpitNav[0] + 0.02], [0, 1]);

  // 镜头 4 改道高光指示
  const isRerouting = useStep(p, [T.heightAlert[0]]) >= 1;
  const isParked = useStep(p, [T.parkEngage[0]]) >= 1;

  return (
    <div className="relative flex-1 min-h-0 rounded-control bg-[#090b10] border border-white/10 overflow-hidden flex flex-col justify-between">
      {/* 顶部智驾辅助与领航状态胶囊条 */}
      <div className="relative z-20 flex items-center justify-between p-2 bg-gradient-to-b from-[#090b10] via-[#090b10]/90 to-transparent">
        {/* NOA 领航辅助状态 */}
        <div className="flex items-center gap-1.5">
          <span className="flex items-center gap-1 rounded-pill bg-jade/20 px-2 py-0.5 border border-jade/40 text-[9px] sm:text-[11px] font-bold text-jade">
            <span className="h-2 w-2 rounded-full bg-jade animate-ping" />
            <span>NOA 智驾领航巡航中</span>
          </span>
          <span className="text-[9px] font-mono text-white/60 hidden sm:inline">自主变道 · 居中保持</span>
        </div>

        {/* 下一机动点导航指示牌 */}
        <div className="flex items-center gap-1.5 rounded-control bg-white/10 px-2 py-0.5 border border-white/10 text-[9px] sm:text-[10px]">
          <CompassIcon className="h-3 w-3 text-gold" />
          <span className="text-white/80">前方 800m ➔</span>
          <span className="font-bold text-gold">
            {isRerouting ? '专属地面大巴车位 (右转)' : '白银路 (直行)'}
          </span>
        </div>
      </div>

      {/* 核心 3D 车道级透视领航透视区 */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden">
        {/* 背景深空与远方地平线微光 */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-[#0e1320] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />

        {/* 3D 透视道路网格与车道系统 */}
        <svg
          viewBox="0 0 600 360"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* 引导光毯渐变 */}
            <linearGradient id="noa-carpet" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="rgb(46 209 139)" stopOpacity="0.8" />
              <stop offset="65%" stopColor="rgb(212 160 78)" stopOpacity="0.95" />
              <stop offset="100%" stopColor="rgb(212 160 78)" stopOpacity="0.1" />
            </linearGradient>

            {/* 改道路径渐变 */}
            <linearGradient id="reroute-carpet" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="rgb(46 209 139)" stopOpacity="0.8" />
              <stop offset="60%" stopColor="rgb(212 160 78)" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(31 78 121)" stopOpacity="0.3" />
            </linearGradient>

            {/* 雷达探测扫描扇形 */}
            <radialGradient id="lidar-scan" cx="50%" cy="100%" r="100%">
              <stop offset="0%" stopColor="rgba(56, 189, 248, 0.45)" />
              <stop offset="70%" stopColor="rgba(56, 189, 248, 0.15)" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          {/* 道路黑色沥青基底 */}
          <polygon points="120,360 250,110 350,110 480,360" fill="#131722" />

          {/* 道路左右边缘硬隔离标线 */}
          <line x1="120" y1="360" x2="250" y2="110" stroke="#3b4254" strokeWidth="4" />
          <line x1="480" y1="360" x2="350" y2="110" stroke="#3b4254" strokeWidth="4" />

          {/* 车道 1 分隔虚线 */}
          <line
            x1="240"
            y1="360"
            x2="283"
            y2="110"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="16 16"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.45"
          />

          {/* 车道 2 分隔虚线 */}
          <line
            x1="360"
            y1="360"
            x2="317"
            y2="110"
            stroke="#ffffff"
            strokeWidth="2.5"
            strokeDasharray="16 16"
            strokeDashoffset={laneDashOffset as unknown as number}
            strokeOpacity="0.45"
          />

          {/* NOA 中央推荐行车光毯 (绿色到琥珀金流动光带) */}
          {!isRerouting ? (
            <motion.polygon
              points="248,360 286,118 314,118 352,360"
              fill="url(#noa-carpet)"
              style={{ opacity: pathDraw }}
            />
          ) : (
            /* 镜头 4: 触发限高后切入向右偏转的酒店专属大巴车位避障引导带 */
            <motion.polygon
              points="248,360 300,240 430,150 480,180 340,360"
              fill="url(#reroute-carpet)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.95 }}
              transition={{ duration: 0.4 }}
            />
          )}

          {/* 前向 35m 感知探测目标车 (虚拟线框) */}
          <g transform="translate(290, 150)">
            <rect x="-14" y="-8" width="28" height="18" rx="4" fill="rgba(255,255,255,0.12)" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="-10" y1="10" x2="10" y2="10" stroke="#ef4444" strokeWidth="2" />
            <text x="0" y="-12" textAnchor="middle" fill="#38bdf8" fontSize="9" fontFamily="monospace">前车 35m</text>
          </g>

          {/* 腾势 D9 豪华自车模型 (Ego Vehicle) */}
          <g transform="translate(300, 290)">
            {/* 激光雷达前向扫描波纹 */}
            <motion.path
              d="M -70 -40 L 0 0 L 70 -40 Z"
              fill="url(#lidar-scan)"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            {/* 自车阴影 */}
            <ellipse cx="0" cy="8" rx="30" ry="14" fill="rgba(0,0,0,0.6)" />

            {/* 腾势 D9 车身 (7座豪华 MPV 轮廓) */}
            <rect x="-24" y="-36" width="48" height="74" rx="10" fill="#1e2433" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
            {/* 车顶行李箱 (车高 2.15m 的核心物理特征) */}
            <rect x="-12" y="-18" width="24" height="42" rx="6" fill="#0d111a" stroke="rgb(212,160,78)" strokeWidth="1.5" />
            <text x="0" y="6" textAnchor="middle" fill="rgb(212,160,78)" fontSize="8" fontFamily="monospace" fontWeight="bold">
              2.15m
            </text>

            {/* 前大灯白光 */}
            <circle cx="-16" cy="-34" r="3" fill="#ffffff" />
            <circle cx="16" cy="-34" r="3" fill="#ffffff" />

            {/* 贯穿式红色 LED 尾灯 */}
            <rect x="-20" y="34" width="40" height="3" rx="1.5" fill="#ef4444" filter="drop-shadow(0 0 6px #ef4444)" />
          </g>

          {/* 右侧改道专属车位标记 (镜头 4 出现) */}
          {isRerouting && (
            <g transform="translate(450, 140)">
              <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#1f4e79" stroke="#2ed18b" strokeWidth="2" />
              <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                P 大巴车位
              </text>
              <text x="0" y="24" textAnchor="middle" fill="#2ed18b" fontSize="8" fontWeight="bold">
                无高度限制 · 已预留
              </text>
            </g>
          )}
        </svg>

        {/* 悬浮车规 HUD 投影仪 (Heads-Up Display) */}
        <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-col gap-1 rounded-control bg-black/60 p-2 border border-white/10 backdrop-blur-md">
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

          <div className="text-[8px] text-white/50 font-mono mt-0.5">
            {isParked ? '已安全泊车入位' : '距目的地 1.2km · 4分钟'}
          </div>
        </div>
      </div>

      {/* 车机底栏：当前路段信标与自驾物理防线 */}
      <footer className="relative z-20 flex h-6 sm:h-7 shrink-0 items-center justify-between border-t border-white/10 px-2 sm:px-3 bg-[#090b10] text-[8px] sm:text-[9px] font-mono text-white/60">
        <span className="truncate">白银路 ➔ 黄河水岸云上酒店地面通道</span>
        <span className="text-gold font-semibold hidden xs:inline">
          {isRerouting ? '刚性物理拦截生效中' : '自驾车规级决策引擎'}
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 rounded-card bg-[#1a0e0e]/95 p-2.5 sm:p-3.5 border-2 border-red-500/80 shadow-[0_16px_40px_rgba(239,68,68,0.35)] backdrop-blur-2xl max-w-xl">
        <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-control bg-red-600/30 text-red-400 border border-red-500/50 animate-pulse">
          <AlertTriangleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-serif text-xs sm:text-sm font-bold text-red-200">
              7座 MPV (车顶箱) 2.15m 限高硬拦截！
            </span>
            <span className="chip rounded-pill bg-red-500/20 text-red-400 text-[8px] font-mono font-bold px-1.5">
              物理风控
            </span>
          </div>
          <p className="mt-0.5 text-[9px] sm:text-[11px] text-white/90 leading-tight">
            正宁路夜市老城地库限高 <b className="text-red-400">2.0m</b> 无法进入！
          </p>
          <div className="mt-1 flex items-center gap-1 text-[9px] sm:text-[10px] text-gold font-medium">
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
  const y = useRange(p, [a, b], [20, 0], { easing: ease.back, rest: 0 });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-3 sm:inset-x-8 bottom-3 sm:bottom-4 z-40 flex justify-center"
      style={{ opacity, y, visibility }}
    >
      <div className="flex items-center justify-between w-full max-w-lg rounded-pill bg-gradient-to-r from-blue-950/95 via-slate-900/95 to-blue-950/95 px-3 py-1.5 border border-jade/50 shadow-[0_8px_30px_rgba(46,209,139,0.25)] backdrop-blur-xl text-[10px] sm:text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-jade text-black font-bold">
            P
          </span>
          <div>
            <span className="font-bold text-white">已安全泊入地面车位</span>
            <span className="text-jade font-mono ml-1.5">· 步行漫步接力已开启</span>
          </div>
        </div>

        <span className="chip rounded-pill bg-gold/20 text-gold text-[9px] font-mono px-2 py-0.5 font-semibold">
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

  // 从右下角副驾手机位置抛物线飞向屏幕中央车机
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
