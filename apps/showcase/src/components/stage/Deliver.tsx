'use client';

import { motion } from 'framer-motion';
import { useFade, useVisibility, useStep } from '@/lib/motion';
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
 *
 * 国际化高标准 App 界面原则：
 * 1. 消除繁杂与冗余：彻底移除双层底栏、刺眼红色地摊警告框以及大面积绿色口号卡片。
 * 2. 视觉重心清晰统一：以“全景自驾路线 + 干净的多端同频中枢”为核心，信息层次分明。
 * 3. 苹果/特斯拉级高级质感：采用单色微底与精致间距，安全专线与高程 HUD 均采用现代微型数据看板形式呈现。
 */
export function DeliverScene() {
  const p = useProgress();
  // 在 Tab 4 阶段 (0.925 -> 1.0) 优雅淡入并占满主视窗
  const visibility = useVisibility(p, 0.925, 1.0);
  const opacity = useFade(p, 0.926, 0.930);

  return (
    <motion.div
      className="pointer-events-auto absolute inset-0 z-40 flex flex-col bg-[#FAF8F5] text-[#1E2024] overflow-hidden select-none"
      style={{ visibility, opacity }}
      role="region"
      aria-label="TripCraft 多端同频与全自动离线守护演示"
    >
      {/* 1. 顶栏：极简通透的同频状态与工具 */}
      <DeliverHeader />

      {/* 2. 主体三栏：黄金比例，自然通达视窗底部，拒绝多层底栏切割 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 p-2.5 sm:p-3 overflow-hidden">
        {/* 左栏 (28%)：离线 9 日行程纲目与极简安全专线 */}
        <OfflineItineraryColumn />

        {/* 中栏 (44%)：离线矢量拓扑沙盘与 Strava 风格高程 HUD */}
        <OfflineSandTableColumn />

        {/* 右栏 (28%)：多端协同互联中枢 (Continuity Hub) */}
        <AutoOfflineEngineColumn />
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 1. 顶栏：极简通透 ═════════════════════ */
function DeliverHeader() {
  return (
    <header className="h-10 shrink-0 border-b border-black/[0.08] bg-white/95 px-3 sm:px-4 flex items-center justify-between backdrop-blur-md text-xs">
      {/* 左侧：行程标题与多端同频标识 */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FE3C01] text-white font-bold text-[10px] shrink-0">
          旅
        </span>
        <span className="font-bold text-xs text-[#1E2024] shrink-0">
          西行计划 · 9D 深度自驾
        </span>
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9.5px] bg-emerald-50 text-emerald-800 font-medium border border-emerald-200/80 shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>3 端实时同频 · 本地已就绪</span>
        </span>
      </div>

      {/* 右侧：离线导出快捷工具 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          title="打印排版与纸质路书备份"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/70 text-[10px] font-medium transition-colors border border-black/[0.06]"
        >
          <PrinterIcon className="h-3 w-3 text-black/60" />
          <span>打印备份</span>
        </button>
        <button
          type="button"
          title="同步至系统日历 (.ics)"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/70 text-[10px] font-medium transition-colors border border-black/[0.06]"
        >
          <CalendarIcon className="h-3 w-3 text-black/60" />
          <span>同步日历</span>
        </button>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-semibold shadow-xs">
          <ShieldIcon className="h-3 w-3 text-white" />
          <span>离线守护已就绪</span>
        </span>
      </div>
    </header>
  );
}

/* ═════════════════════ 2. 左栏：离线行程与极简安全专线 ═════════════════════ */
function OfflineItineraryColumn() {
  const NODES = [
    {
      day: 'D0',
      title: '兰州 · 丝路集结夜',
      desc: '水岸云上酒店 · MPV 地面专属位 (2.28m 通行已核验)',
      sub: '晚 20:00 正宁路夜市 (牛奶鸡蛋醪糟) · 漫步 950m',
      status: '本地就绪',
    },
    {
      day: 'D1',
      title: '兰州 → 张掖 (翻越乌鞘岭)',
      desc: '505 km · 双司轮换预案 · 乌鞘岭 2980m (防高反提示已载入)',
      sub: '夜宿张掖国芳酒店 · 7座大车位充足',
      status: '本地就绪',
    },
    {
      day: 'D2',
      title: '七彩丹霞 → 嘉峪关',
      desc: '丹霞日落 17:40 黄金窗口 · 景区环保车无障碍通道',
      sub: '嘉峪关悬壁长城 · 老人平地轮椅慢步道',
      status: '本地就绪',
    },
    {
      day: 'D4',
      title: '莫高窟 · 特窟慢游',
      desc: '接驳车预约 · 4 个平层无阶梯特窟凭证已离线',
      sub: '下午避暑午休 · 鸣沙山 19:30 黄金落日机位',
      status: '本地就绪',
    },
  ];

  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06]">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5 truncate">
            <CompassIcon className="h-3.5 w-3.5 text-[#FE3C01] shrink-0" />
            <span>离线行程大纲</span>
          </span>
          <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 shrink-0 whitespace-nowrap">
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
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-[#FE3C01]">{node.day}</span>
                <span className="font-semibold text-[#1E2024] truncate flex-1 ml-1.5">
                  {node.title}
                </span>
                <span className="font-mono text-[8px] bg-emerald-100/60 text-emerald-800 px-1 py-0.2 rounded shrink-0">
                  {node.status}
                </span>
              </div>
              <p className="text-black/60 text-[9px] mt-0.5 truncate">{node.desc}</p>
              <p className="text-black/45 text-[8px] mt-0.5 truncate font-mono">{node.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 极简安全与应急专线：沉静、专业、国际化设计 (取代原先大红色地摊警告框) */}
      <div className="mt-2 flex items-center justify-between rounded-lg bg-black/[0.02] px-2.5 py-2 border border-black/[0.05] text-[9.5px]">
        <div className="flex items-center gap-1.5 text-slate-700 font-medium">
          <ShieldIcon className="h-3 w-3 text-emerald-600 shrink-0" />
          <span>脱网应急专线常驻</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-slate-500">
          <span>交警 12122</span>
          <span>·</span>
          <span>SOS 38.05°N</span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 3. 中栏：矢量拓扑沙盘与 Strava 风格高程 HUD ═════════════════════ */
function OfflineSandTableColumn() {
  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      {/* 顶部指示条 */}
      <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#1E2024]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>离线矢量拓扑沙盘 (端侧原生渲染)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-black/50">
          <span>G30 连霍走廊</span>
          <span>·</span>
          <span>1,980 km 本地矢量</span>
        </div>
      </div>

      {/* 核心离线矢量地图渲染 */}
      <div className="relative flex-1 min-h-[190px] my-1.5 rounded-lg bg-[#FAF8F5] border border-black/[0.06] overflow-hidden">
        <svg viewBox="0 0 540 280" className="w-full h-full object-cover">
          <defs>
            <linearGradient id="offline-route" x1="0" y1="1" x2="1" y2="0">
              <stop offset="0%" stopColor="#FE3C01" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>
          </defs>

          {/* 地貌底色与微网格 */}
          <rect width="540" height="280" fill="#FAF8F5" />
          <path d="M 0 50 L 540 50 M 0 120 L 540 120 M 0 190 L 540 190" stroke="#000000" strokeWidth="1" strokeOpacity="0.03" />

          {/* 黄河水系与祁连山脉矢量轮廓 */}
          <path d="M 10 240 C 90 220, 140 250, 220 230" stroke="#BFDBFE" strokeWidth="16" fill="none" strokeLinecap="round" opacity="0.6" />
          <text x="80" y="245" fontSize="10" fontWeight="bold" fill="#3B82F6" opacity="0.5">黄河</text>

          {/* 祁连山余脉阴影 */}
          <path d="M 80 180 Q 180 150 280 170 T 480 130" stroke="#D1D5DB" strokeWidth="24" strokeLinecap="round" fill="none" opacity="0.4" />
          <text x="260" y="155" fontSize="10" fontWeight="bold" fill="#6B7280" opacity="0.6">祁连山脉 · 缓坡走廊</text>

          {/* G30 连霍高速主干线拓扑 */}
          <path
            d="M 50 240 L 140 190 L 250 160 L 370 120 L 490 80"
            stroke="url(#offline-route)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* 节点打卡标记 */}
          {[
            { x: 50, y: 240, label: '兰州 (D0)' },
            { x: 140, y: 190, label: '乌鞘岭 2980m (D1)' },
            { x: 250, y: 160, label: '七彩丹霞 (D2)' },
            { x: 370, y: 120, label: '嘉峪关 (D3)' },
            { x: 490, y: 80, label: '莫高窟·鸣沙山 (D4-D5)' },
          ].map((pt) => (
            <g key={pt.label} transform={`translate(${pt.x}, ${pt.y})`}>
              <circle r="6" fill="#FFFFFF" stroke="#FE3C01" strokeWidth="2" />
              <circle r="2.5" fill="#FE3C01" />
              <rect x="-35" y="-22" width="70" height="15" rx="3" fill="#1E293B" fillOpacity="0.85" />
              <text x="0" y="-11" fontSize="7.5" fontWeight="bold" textAnchor="middle" fill="#FFFFFF" fontFamily="sans-serif">
                {pt.label}
              </text>
            </g>
          ))}
        </svg>

        {/* 离线浮动微标签 */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded border border-black/10 text-[9px] font-semibold text-slate-700 shadow-xs backdrop-blur-xs">
          <span>⚡ 12 个离线航点全量就绪 · 脱网 0 延迟秒开</span>
        </div>
      </div>

      {/* 底部高程与里程仪表 HUD (像 Strava / Apple Fitness 般极简清晰) */}
      <div className="grid grid-cols-3 gap-2 rounded-lg bg-black/[0.02] p-2 border border-black/[0.05] text-center">
        <div>
          <span className="block text-[8px] font-mono text-black/40">最高海拔</span>
          <span className="font-mono text-[10.5px] font-bold text-slate-800">
            2,980 m <span className="text-[8.5px] font-normal text-black/45">乌鞘岭</span>
          </span>
        </div>
        <div className="border-x border-black/[0.06]">
          <span className="block text-[8px] font-mono text-black/40">适老安全包线</span>
          <span className="font-mono text-[10.5px] font-bold text-emerald-700">
            安全冗余 <span className="text-[8.5px] font-normal text-emerald-600/80">&lt;3600m</span>
          </span>
        </div>
        <div>
          <span className="block text-[8px] font-mono text-black/40">全程里程 / 爬升</span>
          <span className="font-mono text-[10.5px] font-bold text-slate-800">
            1,980 km <span className="text-[8.5px] font-normal text-black/45">+3420m</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右栏：全场景多端同频互联中枢 (Continuity Hub) ═════════════════════ */
function AutoOfflineEngineColumn() {
  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        {/* 卡片 1: 3端协同网实时在线状态 */}
        <div className="pb-2 border-b border-black/[0.06]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
              <RadioIcon className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>多端连续互联 (Continuity)</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              3端已对齐
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[9.5px]">
            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5">
                <MonitorIcon className="h-3.5 w-3.5 text-slate-700 shrink-0" />
                <div>
                  <span className="font-medium text-slate-800 block leading-tight">领队桌面端</span>
                  <span className="text-[8px] text-black/40 font-mono">MacBook Pro · 主控</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/50">
                实时镜像
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5">
                <SmartphoneIcon className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-medium text-slate-800 block leading-tight">副驾阿杰手机</span>
                  <span className="text-[8px] text-black/40 font-mono">iPhone 16 Pro · 微信协同</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/50">
                100% 同步
              </span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center gap-1.5">
                <CarIcon className="h-3.5 w-3.5 text-[#0284C7] shrink-0" />
                <div>
                  <span className="font-medium text-slate-800 block leading-tight">腾势 D9 座舱中控</span>
                  <span className="text-[8px] text-black/40 font-mono">车道级 NOA · 限高避险</span>
                </div>
              </div>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px] bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200/50">
                巡航包就绪
              </span>
            </div>
          </div>
        </div>

        {/* 卡片 2: 智能无感容灾保障体系 (与上方设备卡片语言统一，剔除冗余大横幅) */}
        <div className="mt-2.5">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
            <ShieldIcon className="h-3.5 w-3.5 text-emerald-600" />
            <span>智能无感容灾保障</span>
          </span>

          <div className="mt-2 space-y-1.5 text-[9px]">
            <div className="p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">脱网 0 秒自适应接管</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-black/50 text-[8.5px] mt-0.5">
                进入无人区断网时，本地沙盘全功能接管，拒绝白屏
              </p>
            </div>

            <div className="p-2 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">出网差量自动合流</span>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="text-black/50 text-[8.5px] mt-0.5">
                重获信号时毫秒级静默同步，全团成员状态零冲突对齐
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 底部：极简状态标识，自然落地 */}
      <div className="pt-2 border-t border-black/[0.06] flex items-center justify-between text-[9px] text-black/45 font-mono">
        <span>端侧数据加密存储</span>
        <span className="text-emerald-700 font-semibold">● 守护常驻</span>
      </div>
    </div>
  );
}
