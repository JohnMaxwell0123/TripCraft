'use client';

import { motion } from 'framer-motion';
import { PROJECTED, ROUTE_D, TERRAIN } from '@/data/trip';
import { useFade, useVisibility } from '@/lib/motion';
import { useProgress } from './primitives';
import {
  CarIcon,
  ShieldIcon,
  RadioIcon,
  SmartphoneIcon,
  MonitorIcon,
  CompassIcon,
} from '@/components/common/Icons';

function PrinterIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function CalendarIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

/**
 * 05 幕：多端同频与全自动无网离线守护 (SHOWCASE §4 终态闭环)
 */
export function DeliverScene() {
  const p = useProgress();
  // 在 Tab 05 阶段 (0.925 -> 1.0) 优雅淡入并占满主工作区
  const visibility = useVisibility(p, 0.925, 1.0);
  const opacity = useFade(p, 0.926, 0.932);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-40 flex flex-col bg-[#FAF8F5] text-[#1E2024] overflow-hidden select-none"
      style={{ visibility, opacity }}
      role="region"
      aria-label="TripCraft 多端同频与全自动离线守护演示"
    >
      {/* 1. 次级工具栏：无重复标题，专注脱网状态与随行导出工具 */}
      <DeliverSubToolbar />

      {/* 2. 主体三栏：黄金比例，单行标题不折行 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 p-2.5 sm:p-3 overflow-hidden">
        {/* 左栏 (28%)：离线 9 日行程纲目与极简安全专线 */}
        <OfflineItineraryColumn />

        {/* 中栏 (44%)：真实河西走廊离线矢量拓扑沙盘与高程 HUD */}
        <OfflineSandTableColumn />

        {/* 右栏 (28%)：多端实时互联与无感容灾中枢 */}
        <AutoOfflineEngineColumn />
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 1. 次级工具栏：告别双层重复 Topbar ═════════════════════ */
function DeliverSubToolbar() {
  return (
    <div className="h-9 shrink-0 border-b border-black/[0.06] bg-white/90 px-3 sm:px-3.5 flex items-center justify-between text-xs">
      {/* 左侧：离线包常驻状态 */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200/80 shrink-0 whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>戈壁无人区脱网守护模式</span>
        </span>
        <span className="text-[11px] text-black/60 truncate hidden sm:inline">
          全程 1,980km 矢量路网与 12 个特窟/酒店凭证 (48.6 MB) 已常驻本地
        </span>
      </div>

      {/* 右侧：随行实用工具 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="打印 A5 随车纸质路书折页"
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/75 text-[10px] font-medium transition-colors border border-black/[0.06] whitespace-nowrap"
        >
          <PrinterIcon className="h-3 w-3 text-black/60" />
          <span>打印纸质折页</span>
        </button>
        <button
          type="button"
          title="导出至系统日历 (.ics)"
          className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/75 text-[10px] font-medium transition-colors border border-black/[0.06] whitespace-nowrap"
        >
          <CalendarIcon className="h-3 w-3 text-black/60" />
          <span>同步手机日历</span>
        </button>
      </div>
    </div>
  );
}

/* ═════════════════════ 2. 左栏：离线行程与极简安全专线 ═════════════════════ */
function OfflineItineraryColumn() {
  const NODES = [
    {
      day: 'D0',
      title: '兰州 · 丝路集结夜',
      desc: '水岸云上酒店 · MPV 地面位 (2.28m 已核验)',
      sub: '20:00 正宁路夜市 (鸡蛋醪糟) · 步行 950m',
      status: '已就绪',
    },
    {
      day: 'D1',
      title: '兰州 → 张掖 (乌鞘岭)',
      desc: '505 km · 双司轮换 · 垭口 2980m 防高反预案',
      sub: '夜宿张掖国芳酒店 · 地面专属大车位',
      status: '已就绪',
    },
    {
      day: 'D2',
      title: '七彩丹霞 → 嘉峪关',
      desc: '丹霞日落 17:40 黄金机位 · 景区无障碍接驳',
      sub: '嘉峪关悬壁长城 · 老人平地慢行步道',
      status: '已就绪',
    },
    {
      day: 'D4',
      title: '莫高窟 · 特窟慢游',
      desc: '4 个平层无阶梯特窟预约码已离线缓存',
      sub: '午后酒店避暑 · 鸣沙山 19:30 落日机位',
      status: '已就绪',
    },
  ];

  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        <div className="flex items-center justify-between gap-1 pb-1.5 border-b border-black/[0.06]">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5 whitespace-nowrap">
            <CompassIcon className="h-3.5 w-3.5 text-[#FE3C01] shrink-0" />
            <span>离线行程大纲</span>
          </span>
          <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 shrink-0 whitespace-nowrap">
            9天 12节点
          </span>
        </div>

        {/* 节点卡片列表 */}
        <div className="mt-2 space-y-1.5">
          {NODES.map((node) => (
            <div
              key={node.day}
              className="rounded-lg bg-black/[0.02] p-2 border border-black/[0.04] text-[10px]"
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono font-bold text-[#FE3C01] shrink-0">{node.day}</span>
                <span className="font-semibold text-[#1E2024] truncate flex-1">
                  {node.title}
                </span>
                <span className="font-mono text-[8.5px] bg-emerald-100/70 text-emerald-800 px-1.5 py-0.2 rounded shrink-0 whitespace-nowrap">
                  {node.status}
                </span>
              </div>
              <p className="text-black/65 text-[9.5px] mt-0.5 truncate">{node.desc}</p>
              <p className="text-black/45 text-[8.5px] mt-0.5 truncate font-mono">{node.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 极简安全与应急专线：单行对齐，拒绝折行 */}
      <div className="mt-2 flex items-center justify-between gap-1 rounded-lg bg-black/[0.02] px-2.5 py-1.5 border border-black/[0.05] text-[9.5px] whitespace-nowrap">
        <div className="flex items-center gap-1 text-slate-700 font-medium">
          <ShieldIcon className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>脱网应急专线</span>
        </div>
        <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
          <span>12122</span>
          <span>·</span>
          <span>SOS 38.05°N</span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 3. 中栏：真实河西走廊离线矢量拓扑沙盘与高程 HUD ═════════════════════ */
const OFFLINE_KEY_STOPS = new Set(['lz', 'wsl', 'zy', 'jyg', 'dh', 'yd']);

function OfflineSandTableColumn() {
  const keyStops = PROJECTED.filter((s) => OFFLINE_KEY_STOPS.has(s.id));

  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      {/* 顶部指示条 (单行不折行) */}
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-black/[0.06] text-xs whitespace-nowrap">
        <div className="flex items-center gap-1.5 font-bold text-[#1E2024]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>离线矢量拓扑沙盘</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-black/55">
          <span>G30 走廊</span>
          <span>·</span>
          <span>1,980 km 本地矢量</span>
        </div>
      </div>

      {/* 核心离线矢量地图渲染 (复用真实河西走廊 SVG 拓扑与地形) */}
      <div className="relative flex-1 min-h-[190px] my-1.5 rounded-lg bg-[#F5EFE4] border border-black/[0.06] overflow-hidden">
        <svg
          viewBox="-10 -90 1000 820"
          className="w-full h-full select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="deliver-corridor-grad" x1="1" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="#FE3C01" />
              <stop offset="55%" stopColor="#D4A04E" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* 地形图层：戈壁沙丘、祁连山脉等高线、黄河水系 */}
          <path d={TERRAIN.badain} fill="rgb(212 160 78 / 0.14)" />
          <path d={TERRAIN.kumtag} fill="rgb(212 160 78 / 0.14)" />
          <path d={TERRAIN.qilian} fill="rgb(47 122 106 / 0.12)" stroke="rgb(47 122 106 / 0.25)" strokeWidth={1.5} />
          <path d={TERRAIN.yellowRiver} fill="none" stroke="rgb(37 99 166 / 0.35)" strokeWidth={5} strokeLinecap="round" />

          {/* 地理注记 */}
          <text x={390} y={405} fontSize={18} fill="rgb(47 122 106 / 0.65)" fontFamily="var(--font-serif), Georgia, serif" letterSpacing={6}>
            祁 连 山 脉
          </text>
          <text x={150} y={80} fontSize={16} fill="rgb(138 90 20 / 0.55)" fontFamily="var(--font-serif), Georgia, serif" letterSpacing={5}>
            库木塔格沙漠 · 无人区离线包覆盖
          </text>

          {/* 1,980km 河西走廊贝塞尔主干线 */}
          <path d={ROUTE_D} fill="none" stroke="rgb(212 160 78 / 0.28)" strokeWidth={14} strokeLinecap="round" />
          <path d={ROUTE_D} fill="none" stroke="url(#deliver-corridor-grad)" strokeWidth={5.5} strokeLinecap="round" />

          {/* 核心离线航点标注 */}
          {keyStops.map((s) => {
            const isStartOrEnd = s.id === 'lz' || s.id === 'yd';
            const labelY = s.labelSide === 'top' ? -20 : 28;
            return (
              <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                <circle r={isStartOrEnd ? 11 : 8} fill="#FFFFFF" stroke="#FE3C01" strokeWidth={3} />
                <circle r={isStartOrEnd ? 5 : 3.5} fill="#FE3C01" />
                <g transform={`translate(0, ${labelY})`}>
                  <rect x={-58} y={-13} width={116} height={24} rx={6} fill="#1E293B" fillOpacity={0.9} />
                  <text
                    x={0}
                    y={3}
                    fontSize={12.5}
                    fontWeight="bold"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontFamily="var(--font-sans), sans-serif"
                  >
                    {s.name} · {s.day}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* 离线浮动微标签 */}
        <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-white/95 px-2.5 py-1 rounded-md border border-black/10 text-[10px] font-semibold text-slate-700 shadow-xs whitespace-nowrap">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>12 个离线航点全量就绪 · 脱网 0 延迟秒开</span>
        </div>
      </div>

      {/* 底部高程与里程仪表 HUD */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-black/[0.02] p-2 border border-black/[0.05] text-center whitespace-nowrap">
        <div>
          <span className="block text-[8.5px] font-mono text-black/45">最高海拔</span>
          <span className="font-mono text-[10.5px] font-bold text-slate-800">
            2,980 m <span className="text-[8.5px] font-normal text-black/50">乌鞘岭</span>
          </span>
        </div>
        <div className="border-x border-black/[0.06]">
          <span className="block text-[8.5px] font-mono text-black/45">长辈舒适海拔</span>
          <span className="font-mono text-[10.5px] font-bold text-emerald-700">
            全程 &lt; 3,000 m
          </span>
        </div>
        <div>
          <span className="block text-[8.5px] font-mono text-black/45">全程车高避障</span>
          <span className="font-mono text-[10.5px] font-bold text-slate-800">
            2.28 m <span className="text-[8.5px] font-normal text-emerald-700">100% 核验</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右栏：全场景多端同频互联中枢 ═════════════════════ */
function AutoOfflineEngineColumn() {
  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        {/* 卡片 1: 3端协同网实时在线状态 (单行不折行) */}
        <div className="pb-2 border-b border-black/[0.06]">
          <div className="flex items-center justify-between gap-1 whitespace-nowrap">
            <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
              <RadioIcon className="h-3.5 w-3.5 text-emerald-600 animate-pulse shrink-0" />
              <span>多端实时互联</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold shrink-0">
              3 端已同步
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[9.5px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 min-w-0">
                <MonitorIcon className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block leading-tight truncate">领队桌面端</span>
                  <span className="text-[8.5px] text-black/45 font-mono truncate block">MacBook Pro · 主控</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0 whitespace-nowrap">
                实时镜像
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 min-w-0">
                <SmartphoneIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block leading-tight truncate">副驾阿杰手机</span>
                  <span className="text-[8.5px] text-black/45 font-mono truncate block">iPhone 16 Pro · 微信协同</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0 whitespace-nowrap">
                100% 同步
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5 min-w-0">
                <CarIcon className="h-3.5 w-3.5 text-[#0284C7] shrink-0" />
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800 block leading-tight truncate">腾势 D9 智能座舱</span>
                  <span className="text-[8.5px] text-black/45 font-mono truncate block">车道级 NOA · 限高守护</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60 shrink-0 whitespace-nowrap">
                巡航就绪
              </span>
            </div>
          </div>
        </div>

        {/* 卡片 2: 智能无感容灾保障体系 */}
        <div className="mt-2.5">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5 whitespace-nowrap">
            <ShieldIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>无人区无感容灾守护</span>
          </span>

          <div className="mt-2 space-y-1.5 text-[9px]">
            <div className="p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">脱网 0 秒自适应接管</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-black/55 text-[8.5px] mt-0.5">
                驶入戈壁断网区时，本地离线沙盘无缝接管，全程零白屏
              </p>
            </div>

            <div className="p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">重获信号自动合流</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-black/55 text-[8.5px] mt-0.5">
                驶出无人区恢复网络后，毫秒级静默同步全团离线批注
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部：极简状态标识 */}
      <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-[9px] text-black/50 font-mono whitespace-nowrap">
        <span>本地离线加密保险箱</span>
        <span className="text-emerald-700 font-semibold">● 守护常驻</span>
      </div>
    </div>
  );
}
