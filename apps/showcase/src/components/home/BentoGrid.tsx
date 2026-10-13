'use client';

import { useState } from 'react';
import {
  ZapIcon,
  SignalSlashIcon,
  RoadIcon,
  AlertTriangleIcon,
  CheckIcon,
  CameraIcon,
} from '@/components/common/Icons';

export function BentoGrid() {
  // Card 3 State: Offline network simulator
  const [isOffline, setIsOffline] = useState(false);

  // Card 4 State: B2B whitelabel brand customizer
  const [selectedBrand, setSelectedBrand] = useState({
    name: 'Horizon Expeditions · 高山探索社',
    primary: '#2563EB',
    accent: '#1D4ED8',
    themeName: '远峰蓝',
  });

  const BRANDS = [
    { name: 'Horizon Expeditions · 高山探索社', primary: '#2563EB', accent: '#1D4ED8', themeName: '远峰蓝' },
    { name: 'Silk Road Prestige · 丝路定制行', primary: '#B8863B', accent: '#7A5520', themeName: '敦煌金' },
    { name: 'Verdant Eco-Drive · 青翠生态巡航', primary: '#0E8674', accent: '#065F52', themeName: '青甘碧' },
    { name: 'Aurora Grand Tour · 极光纵横自驾', primary: '#7C3AED', accent: '#6D28D9', themeName: '赛博紫' },
  ];

  // Card 5 State: Vehicle Clearance Simulator (7-seat MPV + Roof Box)
  const [vehicleHeight, setVehicleHeight] = useState(2.15);

  return (
    <section id="bento" className="relative overflow-hidden py-12 sm:py-16 md:py-20 paper-texture scroll-mt-20 md:scroll-mt-24">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-10 left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,134,59,0.08),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-10 right-1/4 h-80 w-80 translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(14,134,116,0.06),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="eyebrow text-gold-ink font-semibold">CAPABILITY MATRIX · 工业级能力矩阵</p>
          <h2 className="mt-3 font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-[1.3]">
            不只是好看，更是坚韧的工业级系统
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-ink-soft">
            从极端弱网离线穿透，到车型物理安全规则刚性断言；从全家多代同行节奏设计，到地接社一键白标交付。
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-8 sm:mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: 零构建单文件 HTML 秒开沙盒 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-jade/15 text-jade font-semibold text-xs ring-1 ring-jade/30">
                  F-M08-01 交付铁律
                </span>
                <span className="font-mono text-xs text-ink-soft tabular-nums">1.8 MB · 零外部请求</span>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                零构建单文件 HTML 秒开
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                路书经专属单文件编译器打包为完全自包含的 HTML。无需 Node.js，无需服务器，双击秒开。
              </p>
            </div>

            <div className="mt-5 rounded-control bg-paper/90 p-4 border border-ink/[0.08] shadow-level-static">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-soft">首屏解析直出耗时 (LCP)</span>
                <span className="font-bold text-jade tabular-nums font-mono flex items-center gap-1">
                  <span>14 ms</span>
                  <ZapIcon className="h-3 w-3 text-jade" />
                </span>
              </div>
              <div className="mt-2.5 h-1.5 w-full bg-ink/10 rounded-pill overflow-hidden">
                <div className="h-full bg-jade rounded-pill w-[96%]" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-ink-soft">
                <div className="rounded-control bg-ink/[0.04] p-2">
                  <span className="block font-mono font-bold text-ink tabular-nums text-sm">0</span>
                  <span>运行时 npm</span>
                </div>
                <div className="rounded-control bg-ink/[0.04] p-2">
                  <span className="block font-mono font-bold text-ink tabular-nums text-sm">100%</span>
                  <span>内联矢量底图</span>
                </div>
                <div className="rounded-control bg-ink/[0.04] p-2">
                  <span className="block font-bold text-ink text-sm">永久</span>
                  <span>离线可归档</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 戈壁无人区离线断网模拟器 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-ochre/15 text-ochre font-semibold text-xs ring-1 ring-ochre/30">
                  F-M06-01 极度容灾
                </span>
                <button
                  type="button"
                  onClick={() => setIsOffline(!isOffline)}
                  className={`min-h-[44px] flex items-center gap-1.5 rounded-pill px-4 py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                    isOffline
                      ? 'bg-ochre text-paper ring-2 ring-ochre/40 shadow-level-static'
                      : 'bg-jade text-paper'
                  }`}
                >
                  {isOffline ? (
                    <>
                      <SignalSlashIcon className="h-3.5 w-3.5 text-paper" />
                      <span>正在断网演练</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-3.5 w-3.5 text-paper" />
                      <span>网络正常</span>
                    </>
                  )}
                </button>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                无人区离线与增量补丁
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                自驾途经荒野峡谷、高海拔隧道或远郊无信号区域，自动切入 IndexedDB 离线模式，绝不发生白屏崩溃。
              </p>
            </div>

            <div className="mt-5 rounded-control bg-paper/90 p-4 border border-ink/[0.08] shadow-level-static">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control font-bold text-paper ${
                    isOffline ? 'bg-ochre' : 'bg-jade'
                  }`}
                >
                  {isOffline ? '断' : '通'}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-ink">
                    {isOffline ? '已激活本地 IndexedDB 快照' : '实时 WebSocket 云端通道在线'}
                  </p>
                  <p className="text-xs text-ink-soft truncate">
                    {isOffline
                      ? '改动沉淀为 JSON Patch，面对面扫码即同步'
                      : <>延迟: <span className="font-mono tabular-nums font-semibold">28ms</span> · 成员实时光标广播中</>}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-control bg-ink/[0.04] px-3 py-2 text-xs">
                <span className="text-ink-soft">离线数据安全校验</span>
                <span className="font-mono font-semibold text-jade">spec/patch.schema.json ✓</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tier 0 智能座舱极简投车协议 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-lapis/15 text-lapis font-semibold text-xs ring-1 ring-lapis/30">
                  F-M07-01 极简互联
                </span>
                <span className="font-mono text-xs text-ink-soft">Tier 0 免签约</span>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                车机投屏与途经点协议
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                无需车企定制系统或蓝牙配对，利用原生 Intent 标准将 12 个途经点一键注入车机高德/百度。
              </p>
            </div>

            <div className="mt-5 rounded-control bg-[#14171c] p-4 text-paper shadow-level-static border border-white/10">
              <div className="flex items-center justify-between text-xs text-white/70">
                <span>车载大屏实时镜像</span>
                <span className="text-gold font-medium">HUD 导航中</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                <RoadIcon className="h-4 w-4 text-gold shrink-0" />
                <span className="truncate">当前路段：跨区域自驾主干道 ➔ 高原观景服务区</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-white/60 border-t border-white/10 pt-2.5">
                <span className="font-mono tabular-nums">车辆规格: 5.25m × 1.96m × 2.15m (7座 MPV 加装车顶箱)</span>
                <span className="text-jade font-semibold">无窄道预警 ✓</span>
              </div>
            </div>
          </div>

          {/* Card 4: 地接社 B 端品牌白标换肤滑块 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-gold/15 text-gold-ink font-semibold text-xs ring-1 ring-gold/30">
                  F-M11-01 B端定制
                </span>
                <span className="font-mono text-xs text-ink-soft">机构独家专属</span>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                旅行社白标与品牌换肤
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                一键隐去平台标识，注入定制机构 Logo、专属主题色及领队个人签名名片。
              </p>
            </div>

            <div>
              {/* Live brand switcher */}
              <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="B 端旅行社品牌换肤演练">
                {BRANDS.map((b) => (
                  <button
                    key={b.name}
                    type="button"
                    onClick={() => setSelectedBrand(b)}
                    className={`min-h-[44px] rounded-pill px-3.5 py-2 text-xs font-semibold transition-all inline-flex items-center gap-1.5 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 ${
                      selectedBrand.name === b.name
                        ? 'bg-gold text-paper shadow-level-static ring-1 ring-gold-ink'
                        : 'bg-paper/80 text-ink ring-1 ring-ink/10 hover:bg-paper'
                    }`}
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full inline-block"
                      style={{ backgroundColor: b.primary }}
                    />
                    <span>{b.themeName}</span>
                  </button>
                ))}
              </div>

              {/* Live Preview card */}
              <div
                className="mt-4 rounded-control p-4 transition-colors duration-300 shadow-level-static border border-ink/[0.08] bg-white"
                style={{
                  borderLeft: `5px solid ${selectedBrand.primary}`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="font-sans text-xs font-bold"
                    style={{ color: selectedBrand.primary }}
                  >
                    {selectedBrand.name}
                  </span>
                  <span className="text-xs text-ink-soft">官方认证路书</span>
                </div>
                <p className="mt-1.5 text-xs font-semibold text-ink">
                  全地形全景漫游 · 尊享 9 日私人订制行
                </p>
                <p className="mt-1 text-xs text-ink-soft">
                  已根据 spec/brand.schema.json 完成资产签名验真
                </p>
              </div>
            </div>
          </div>

          {/* Card 5: 7座 MPV / SUV 车顶箱通达性物理规则引擎 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-gold/15 text-gold-ink font-semibold text-xs ring-1 ring-gold/30">
                  F-M05-03 物理规则
                </span>
                <span className="font-mono text-xs text-ink-soft">自驾车型工程建模</span>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                7座 MPV 车顶箱限高通达校验
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                针对 5 口之家自驾常用的 7 座豪华 MPV（如腾势 D9/别克 GL8 加装车顶箱），精准建模车长 <span className="font-mono tabular-nums">5.25m</span>、转弯半径与 <span className="font-mono tabular-nums">2.15m</span> 限高。
              </p>
            </div>

            {/* Height slider */}
            <div className="mt-5 rounded-control bg-paper/90 p-4 border border-ink/[0.08] shadow-level-static">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft">当前模拟车辆总高：</span>
                <span className="font-mono font-bold tabular-nums text-ink text-sm">
                  {vehicleHeight.toFixed(2)} 米
                </span>
              </div>
              <input
                type="range"
                min="1.8"
                max="2.5"
                step="0.05"
                value={vehicleHeight}
                onChange={(e) => setVehicleHeight(parseFloat(e.target.value))}
                aria-label="车辆总高度滑块 (米)"
                className="mt-3 w-full h-3 accent-gold cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-pill"
              />

              {/* Responsive alert container - wraps gracefully without overflowing mobile */}
              <div className="mt-3.5 flex items-start text-xs">
                {vehicleHeight <= 2.0 ? (
                  <div className="rounded-control bg-jade/15 text-jade font-semibold text-xs p-2.5 ring-1 ring-jade/30 flex items-start gap-1.5 w-full leading-relaxed">
                    <CheckIcon className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>轿车/裸车 SUV 高度，所有地库与老城窄巷畅通</span>
                  </div>
                ) : vehicleHeight <= 2.2 ? (
                  <div className="rounded-control bg-gold/15 text-gold-ink font-semibold text-xs p-2.5 ring-1 ring-gold/30 flex items-start gap-1.5 w-full leading-relaxed">
                    <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-gold" />
                    <span>7座MPV+车顶箱：避开老城 2.0m 地库，自动规划地面车位</span>
                  </div>
                ) : (
                  <div className="rounded-control bg-rose-50 text-rose-800 font-semibold text-xs p-2.5 ring-1 ring-rose-300/60 flex items-start gap-1.5 w-full leading-relaxed">
                    <AlertTriangleIcon className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
                    <span>严重拦截！该高度超过景区与县道 2.2m 限高横杆</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 6: 本地 EXIF 照片隐私回忆录 */}
          <div className="glass-strong rounded-card p-5 sm:p-6 transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-ink/[0.08] flex flex-col justify-between min-w-0">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-ink/[0.06]">
                <span className="chip bg-jade/15 text-jade font-semibold text-xs ring-1 ring-jade/30">
                  F-M10-02 隐私零泄露
                </span>
                <span className="font-mono text-xs text-ink-soft">纯前端 Web Worker</span>
              </div>
              <h3 className="mt-4 font-sans text-base sm:text-lg font-bold tracking-tight text-ink">
                本地 EXIF 隐私足迹生成
              </h3>
              <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                手机拍摄的几百张家庭合影，原图完全不出浏览器。在 Worker 线程本地聚类生成旅行回忆录。
              </p>
            </div>

            <div className="mt-5 rounded-control bg-paper/90 p-4 border border-ink/[0.08] shadow-level-static">
              <div className="flex items-center justify-between border-b border-ink/[0.06] pb-2 text-xs">
                <span className="font-semibold text-ink"><span className="font-mono tabular-nums">342</span> 张合照时空足迹分析</span>
                <span className="text-jade font-bold">100% 本地运算</span>
              </div>
              <div className="mt-3 flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-blue-50 text-blue-600">
                  <CameraIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1 text-xs text-ink-soft">
                  <p className="font-semibold text-ink truncate">国家地质公园 · <span className="font-mono tabular-nums">19:42</span> 湖畔落日</p>
                  <p className="text-xs">根据 GPS 经纬度与时间戳自动对齐到路书 D4 节点</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-ink-soft flex items-center gap-1.5">
                <CheckIcon className="h-3.5 w-3.5 text-jade shrink-0" />
                <span>用户相册照片绝不上云 · 遵守个人信息保护法与 GDPR</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
