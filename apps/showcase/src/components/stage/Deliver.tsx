'use client';

import { motion } from 'framer-motion';
import { useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { useProgress } from './primitives';
import {
  CarIcon,
  CheckIcon,
  ShieldIcon,
  AlertTriangleIcon,
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

function DownloadIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

/**
 * 05 幕：零构建自包含离线交付与无人区安全舱 (SHOWCASE §4 终态闭环)
 *
 * 核心设计原则 (对齐设计铁律 #1 & #3)：
 * 1. 彻底移除小玩具卡片与多余白边，占满整个工作台主视窗，与前四幕保持 1:1 纯正原生应用高保真质感。
 * 2. 真实呈现 TripCraft 核心交付产物——《西行计划·9D深度自驾.html》自包含单文件。
 * 3. 黄金三栏架构：
 *    - 左栏 (28%)：离线 9 日行程全量节点与无人区应急保供专线 (交警 12122 / 中石油补能站 / 北斗坐标)
 *    - 中栏 (44%)：离线矢量拓扑沙盘 (0 外部瓦片拉取) 与 乌鞘岭 2980m 高程剖面安全包线
 *    - 右栏 (28%)：3 端同频在线状态 (领队端/手机端/腾势D9车机) 与 零构建单文件一键编译打包流水线
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
      aria-label="TripCraft 零构建自包含离线路书与无人区安全舱演示"
    >
      {/* 1. 离线安全舱自包含顶栏 */}
      <DeliverHeader />

      {/* 2. 离线工作台主体：三栏黄金比例 */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2 sm:gap-2.5 p-2 sm:p-3 overflow-hidden">
        {/* 左栏：离线 9 日日程与无人区生命线 */}
        <OfflineItineraryColumn />

        {/* 中栏：离线矢量拓扑沙盘与高程剖面 HUD */}
        <OfflineSandTableColumn />

        {/* 右栏：3端同频在线状态与单文件编译打包引擎 */}
        <ZeroBuildPackagerColumn />
      </div>

      {/* 3. 底栏状态与设计契约承诺 */}
      <DeliverFooter />
    </motion.div>
  );
}

/* ═════════════════════ 1. 离线安全舱顶栏 ═════════════════════ */
function DeliverHeader() {
  return (
    <header className="h-10 shrink-0 border-b border-black/[0.08] bg-white/90 px-3 sm:px-4 flex items-center justify-between backdrop-blur-md text-xs">
      {/* 左侧：自包含离线单文件标题 */}
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-5 w-5 items-center justify-center rounded bg-[#FE3C01] text-white font-bold text-[10px]">
          旅
        </span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-bold text-xs text-[#1E2024] truncate">
            西行计划 · 9D 深度自驾
          </span>
          <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] bg-black/[0.04] text-black/60 font-mono border border-black/5 shrink-0">
            <span>西行计划_离线安全舱_v1.1.html</span>
          </span>
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] bg-emerald-50 text-emerald-700 font-mono font-bold border border-emerald-200 shrink-0">
            <span>1.84 MB 单文件</span>
          </span>
        </div>
      </div>

      {/* 中间：无网离线运行标识 */}
      <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-800 text-[10px] font-semibold border border-emerald-500/20">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>⚡ 飞行模式 / 离线全功能自包含 · 零外部网络依赖</span>
      </div>

      {/* 右侧：离线导出快捷工具 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          title="打印排版与 PDF 生成"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/70 text-[10px] font-medium transition-colors border border-black/[0.06]"
        >
          <PrinterIcon className="h-3 w-3 text-black/60" />
          <span>打印排版</span>
        </button>
        <button
          type="button"
          title="导出系统日历 (.ics)"
          className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-black/[0.03] hover:bg-black/[0.06] text-black/70 text-[10px] font-medium transition-colors border border-black/[0.06]"
        >
          <CalendarIcon className="h-3 w-3 text-black/60" />
          <span>日历导出</span>
        </button>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FE3C01] text-white text-[10px] font-semibold shadow-xs">
          <DownloadIcon className="h-3 w-3 text-white" />
          <span>自包含离线包已就绪</span>
        </span>
      </div>
    </header>
  );
}

/* ═════════════════════ 2. 左栏：离线 9 日行程与无人区生命线 ═════════════════════ */
function OfflineItineraryColumn() {
  const NODES = [
    {
      day: 'D0',
      title: '兰州 · 丝路集结夜',
      desc: '水岸云上酒店 · MPV 地面专属位 (2.28m 通行已核验)',
      sub: '晚 20:00 正宁路夜市 (牛奶鸡蛋醪糟) · 漫步 950m',
      status: '离线已缓',
    },
    {
      day: 'D1',
      title: '兰州 → 张掖 (翻越乌鞘岭)',
      desc: '505 km · 双司轮换预案 · 乌鞘岭 2980m (防高反提示已载入)',
      sub: '夜宿张掖国芳酒店 · 7座大车位充足',
      status: '离线已缓',
    },
    {
      day: 'D2',
      title: '七彩丹霞 → 嘉峪关',
      desc: '丹霞日落 17:40 黄金窗口 · 景区环保车无障碍通道',
      sub: '嘉峪关悬壁长城 · 老人平地轮椅慢步道',
      status: '离线已缓',
    },
    {
      day: 'D4',
      title: '莫高窟 · 特窟慢游',
      desc: '接驳车预约 · 4 个平层无阶梯特窟凭证已离线',
      sub: '下午避暑午休 · 鸣沙山 19:30 黄金落日机位',
      status: '离线已缓',
    },
  ];

  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06]">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
            <CompassIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            <span>离线行程节点 (全量自包含)</span>
          </span>
          <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
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

      {/* 无人区应急保障生命线卡片 (甘肃交警 / 连霍保供油站) */}
      <div className="mt-2 rounded-lg bg-rose-50/70 p-2 border border-rose-200/80 text-[9px]">
        <div className="flex items-center gap-1 text-rose-800 font-bold">
          <AlertTriangleIcon className="h-3 w-3 text-rose-600 shrink-0" />
          <span>无人区应急生命线 (脱网一键直拨)</span>
        </div>
        <div className="mt-1 space-y-0.5 text-rose-900/80 font-mono text-[8.5px]">
          <p>🚨 甘肃交警救援专线: <span className="font-bold text-rose-700">12122</span></p>
          <p>⛽ G30 无人区应急补能: <span className="font-bold text-rose-700">K1840 保供站</span></p>
          <p>🛰️ 北斗卫星 SOS 坐标: <span className="font-bold text-rose-700">38.05°N, 102.64°E</span></p>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 3. 中栏：离线矢量拓扑沙盘与高程剖面 HUD ═════════════════════ */
function OfflineSandTableColumn() {
  return (
    <div className="flex-1 min-w-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      {/* 顶部指示条 */}
      <div className="flex items-center justify-between pb-1.5 border-b border-black/[0.06] text-xs">
        <div className="flex items-center gap-1.5 font-bold text-[#1E2024]">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>离线矢量拓扑沙盘 (0 外部瓦片拉取)</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-black/50">
          <span>G30 连霍走廊</span>
          <span>·</span>
          <span>1,980 km 全程矢量</span>
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
          <span>⚡ 12 个离线航点全部校核 · 无外部拉取依赖</span>
        </div>
      </div>

      {/* 底部高程剖面 HUD (乌鞘岭 2980m 刚性安全包线) */}
      <div className="rounded-lg bg-black/[0.02] p-2 border border-black/[0.05] flex items-center justify-between text-[9px]">
        <div className="flex items-center gap-3">
          <span className="font-bold text-[#1E2024] flex items-center gap-1 font-mono">
            <span className="text-[#FE3C01]">▲</span>
            <span>最高海拔: 乌鞘岭 2,980m</span>
          </span>
          <span className="text-emerald-700 font-semibold font-mono">
            ✓ 远低于 70 岁长辈 3,600m 适老安全上限
          </span>
        </div>
        <span className="text-black/50 font-mono hidden sm:inline">
          全长 1,980km · 累计爬升 3,420m
        </span>
      </div>
    </div>
  );
}

/* ═════════════════════ 4. 右栏：3端同频网络与单文件编译打包引擎 ═════════════════════ */
function ZeroBuildPackagerColumn() {
  const p = useProgress();
  const step = useStep(p, [0.94, 0.952, 0.965, 0.978]);

  return (
    <div className="w-full lg:w-[28%] shrink-0 flex flex-col justify-between rounded-xl bg-white border border-black/[0.08] p-2.5 shadow-xs overflow-hidden">
      <div>
        {/* 卡片 1: 3端协同网实时在线状态 */}
        <div className="pb-1.5 border-b border-black/[0.06]">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
              <RadioIcon className="h-3.5 w-3.5 text-emerald-600 animate-pulse" />
              <span>3 端连续互联 (Continuity)</span>
            </span>
            <span className="font-mono text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-bold">
              18ms 同频
            </span>
          </div>

          <div className="mt-2 space-y-1.5 text-[9.5px]">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <MonitorIcon className="h-3 w-3 text-slate-700" />
                <span>领队桌面端</span>
              </span>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px]">
                主控就绪 · 本地已存
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <SmartphoneIcon className="h-3 w-3 text-emerald-600" />
                <span>副驾阿杰手机</span>
              </span>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px]">
                微信免登快照已缓
              </span>
            </div>

            <div className="flex items-center justify-between p-1.5 rounded-lg bg-black/[0.02] border border-black/[0.04]">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <CarIcon className="h-3 w-3 text-[#0284C7]" />
                <span>腾势 D9 车机</span>
              </span>
              <span className="font-mono text-emerald-700 font-semibold text-[8.5px]">
                巡航与限高包已推
              </span>
            </div>
          </div>
        </div>

        {/* 卡片 2: 零构建单文件编译流水线 */}
        <div className="mt-2 pt-1 border-t border-black/[0.06]">
          <span className="font-bold text-xs text-[#1E2024] flex items-center gap-1.5">
            <ShieldIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            <span>零构建自包含打包流水线</span>
          </span>

          <div className="mt-1.5 space-y-1 text-[9px]">
            {[
              { label: 'DSL AST 契约校验 (spec/trip.schema.json)', done: step >= 0 },
              { label: '离线高精矢量航线与等高线内联压缩', done: step >= 1 },
              { label: '70岁长辈慢节奏与 2.28m MPV 限高刚性锁死', done: step >= 2 },
              { label: '自包含单文件 HTML 编译生成 (1.84 MB)', done: step >= 3 },
            ].map((task) => (
              <div key={task.label} className="flex items-center gap-1.5 text-black/75">
                <span
                  className={`flex h-3.5 w-3.5 items-center justify-center rounded-full text-[8px] font-bold ${
                    task.done
                      ? 'bg-emerald-500 text-white'
                      : 'bg-black/10 text-black/40'
                  }`}
                >
                  ✓
                </span>
                <span className="truncate">{task.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 底部大按钮：一键下载自包含离线路书 */}
      <div className="mt-2 pt-2 border-t border-black/[0.06]">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#FE3C01] hover:bg-[#E03500] text-white text-xs font-bold shadow-sm transition-all"
        >
          <DownloadIcon className="h-3.5 w-3.5 text-white" />
          <span>下载自包含离线路书 (.html)</span>
        </button>
        <p className="mt-1 text-center font-mono text-[8px] text-black/45">
          双击即开 · 无网可用 · 严禁运行时外部拉取
        </p>
      </div>
    </div>
  );
}

/* ═════════════════════ 5. 底栏状态与设计契约承诺 ═════════════════════ */
function DeliverFooter() {
  return (
    <footer className="h-7 shrink-0 border-t border-black/[0.08] bg-[#FAF8F5] px-3 sm:px-4 flex items-center justify-between text-[9px] sm:text-[10px] font-mono text-black/60 select-none">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-emerald-700">
          <CheckIcon className="h-3 w-3 text-emerald-600" />
          <span>十大设计铁律 #1 零构建交付已达成</span>
        </span>
        <span className="text-black/20">|</span>
        <span className="hidden sm:inline">数据主权完全本地化 · 无网乐观保活</span>
      </div>

      <div className="flex items-center gap-2">
        <span>SHA-256: 8f9b4c2a</span>
        <span className="text-black/20">|</span>
        <span className="font-bold text-[#FE3C01]">TripCraft v1.1 离线舱</span>
      </div>
    </footer>
  );
}
