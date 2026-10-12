'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export function BentoGrid() {
  // Card 3 State: Offline network simulator
  const [isOffline, setIsOffline] = useState(false);

  // Card 4 State: B2B whitelabel brand customizer
  const [selectedBrand, setSelectedBrand] = useState({
    name: '金马国旅定制中心',
    primary: '#B8863B',
    accent: '#7A5520',
    themeName: '敦煌金 (Dunhuang Gold)',
  });

  const BRANDS = [
    { name: '金马国旅定制中心', primary: '#B8863B', accent: '#7A5520', themeName: '敦煌金' },
    { name: '大漠星途探险俱乐部', primary: '#1F4E79', accent: '#0E1A2C', themeName: '青金蓝' },
    { name: '青甘高原生态科考', primary: '#0E8674', accent: '#0A5D51', themeName: '青甘碧' },
    { name: '丝路极光奢享之旅', primary: '#7C3AED', accent: '#5B21B6', themeName: '赛博紫' },
  ];

  // Card 5 State: Vehicle Clearance Simulator (7-seat MPV + Roof Box)
  const [vehicleHeight, setVehicleHeight] = useState(2.15);

  return (
    <section id="bento" className="relative py-20 paper-texture">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="eyebrow text-gold-ink">CAPABILITY MATRIX · 全能力矩阵画廊</p>
          <h2 className="mt-2 font-sans text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            不只是好看，更是坚韧的工业级系统
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm text-ink-soft sm:text-base">
            从极端弱网离线穿透，到车型物理安全规则刚性断言；从全家多代同行节奏设计，到地接社一键白标交付。
          </p>
        </div>

        {/* Bento Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Card 1: 零构建单文件 HTML 秒开沙盒 (Span 1 or 2) */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-jade/15 text-jade font-semibold text-xs ring-1 ring-jade/30">
                F-M08-01 交付铁律
              </span>
              <span className="font-mono text-xs text-ink-soft">1.8 MB · 零外部请求</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              零构建单文件 HTML 秒开
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              路书经专属单文件编译器打包为完全自包含的 HTML。无需 Node.js，无需服务器，双击秒开。
            </p>

            <div className="mt-5 rounded-2xl bg-paper/90 p-4 ring-1 ring-ink/10 shadow-sm">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-ink-soft">首屏解析直出耗时 (LCP)</span>
                <span className="font-bold text-jade">14 ms ⚡</span>
              </div>
              <div className="mt-2.5 h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
                <div className="h-full bg-jade rounded-full w-[96%]" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-[10px] text-ink-soft">
                <div className="rounded-lg bg-ink/[0.04] p-1.5">
                  <span className="block font-bold text-ink">0</span>
                  <span>运行时 npm</span>
                </div>
                <div className="rounded-lg bg-ink/[0.04] p-1.5">
                  <span className="block font-bold text-ink">100%</span>
                  <span>内联矢量底图</span>
                </div>
                <div className="rounded-lg bg-ink/[0.04] p-1.5">
                  <span className="block font-bold text-ink">永久</span>
                  <span>离线可归档</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: 戈壁无人区离线断网模拟器 */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-ochre/15 text-ochre font-semibold text-xs ring-1 ring-ochre/30">
                F-M06-01 极度容灾
              </span>
              <button
                type="button"
                onClick={() => setIsOffline(!isOffline)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold transition-all ${
                  isOffline
                    ? 'bg-ochre text-paper ring-2 ring-ochre/40 shadow-sm'
                    : 'bg-jade text-paper'
                }`}
              >
                <span>{isOffline ? '✈ 正在断网演练' : '● 网络正常'}</span>
              </button>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              无人区离线与增量补丁
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              自驾途经敦煌西线雅丹等无信号区域，自动切入 IndexedDB 离线模式，绝不发生白屏崩溃。
            </p>

            <div className="mt-5 rounded-2xl bg-paper/90 p-4 ring-1 ring-ink/10">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-paper ${
                    isOffline ? 'bg-ochre' : 'bg-jade'
                  }`}
                >
                  {isOffline ? '断' : '通'}
                </div>
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-semibold text-ink">
                    {isOffline ? '已激活本地 IndexedDB 快照' : '实时 WebSocket 云端通道在线'}
                  </p>
                  <p className="text-[11px] text-ink-soft truncate">
                    {isOffline
                      ? '改动沉淀为 JSON Patch，面对面扫码即同步'
                      : '延迟: 28ms · 成员实时光标广播中'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-lg bg-ink/[0.04] px-3 py-2 text-[11px]">
                <span className="text-ink-soft">离线数据安全校验</span>
                <span className="font-mono font-semibold text-jade">spec/patch.schema.json ✓</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tier 0 智能座舱极简投车协议 */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-lapis/15 text-lapis font-semibold text-xs ring-1 ring-lapis/30">
                F-M07-01 极简互联
              </span>
              <span className="font-mono text-xs text-ink-soft">Tier 0 免签约</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              车机投屏与途经点协议
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              无需车企定制系统或蓝牙配对，利用原生 Intent 标准将 12 个途经点一键注入车机高德/百度。
            </p>

            <div className="mt-5 rounded-2xl bg-[#14171c] p-3.5 text-paper shadow-md">
              <div className="flex items-center justify-between text-[11px] text-white/60">
                <span>考斯特车载大屏实时镜像</span>
                <span className="text-gold">HUD 导航中</span>
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white">
                <span className="text-lg">🛣</span>
                <span>当前路段：G30 连霍高速 ➔ 武威服务区</span>
              </div>
              <div className="mt-2.5 flex items-center justify-between text-[10px] text-white/50 border-t border-white/10 pt-2">
                <span>车辆尺寸: 6.99m × 2.03m × 2.8m</span>
                <span className="text-jade font-semibold">全程无窄道预警 ✓</span>
              </div>
            </div>
          </div>

          {/* Card 4: 地接社 B 端品牌白标换肤滑块 */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-gold/20 text-gold-ink font-semibold text-xs ring-1 ring-gold/40">
                F-M11-01 B端定制
              </span>
              <span className="font-mono text-xs text-ink-soft">机构独家专属</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              旅行社白标与品牌换肤
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              一键隐去平台标识，注入定制机构 Logo、专属主题色及领队个人签名名片。
            </p>

            {/* Live brand switcher */}
            <div className="mt-4 flex flex-wrap gap-1.5">
              {BRANDS.map((b) => (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => setSelectedBrand(b)}
                  className={`chip text-[11px] font-semibold transition-all ${
                    selectedBrand.name === b.name
                      ? 'bg-ink text-paper shadow-sm'
                      : 'bg-paper/80 text-ink ring-1 ring-ink/10 hover:bg-paper'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full inline-block"
                    style={{ backgroundColor: b.primary }}
                  />
                  <span>{b.themeName}</span>
                </button>
              ))}
            </div>

            {/* Live Preview card */}
            <div
              className="mt-4 rounded-2xl p-4 transition-colors duration-300 shadow-sm border border-slate-200/80 bg-white"
              style={{
                borderLeft: `5px solid ${selectedBrand.primary}`,
              }}
            >
              <div className="flex items-center justify-between">
                <span
                  className="font-serif text-xs font-bold"
                  style={{ color: selectedBrand.primary }}
                >
                  {selectedBrand.name}
                </span>
                <span className="text-[10px] text-ink-soft">官方认证路书</span>
              </div>
              <p className="mt-1.5 text-xs font-semibold text-ink">
                甘青大环线 · 尊享 9 日私人订制行
              </p>
              <p className="mt-1 text-[10px] text-ink-soft">
                已根据 spec/brand.schema.json 完成资产签名验真
              </p>
            </div>
          </div>

          {/* Card 5: 7座 MPV / SUV 车顶箱通达性物理规则引擎 */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-amber/15 text-amber font-semibold text-xs ring-1 ring-amber/30">
                F-M05-03 物理规则
              </span>
              <span className="font-mono text-xs text-ink-soft">自驾车型工程建模</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              7座 MPV 车顶箱限高通达校验
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              针对 5 口之家自驾常用的 7 座豪华 MPV（如腾势 D9/别克 GL8 加装车顶箱），精准建模车长 5.25m、转弯半径与 2.15m 限高。
            </p>

            {/* Height slider */}
            <div className="mt-4 rounded-2xl bg-paper/90 p-4 ring-1 ring-ink/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-soft">当前模拟车辆总高：</span>
                <span className="font-serif font-bold text-ink text-sm">
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
                className="mt-2 w-full accent-gold cursor-pointer"
              />

              <div className="mt-3 flex items-center justify-between text-xs">
                {vehicleHeight <= 2.0 ? (
                  <span className="chip bg-jade/15 text-jade font-semibold text-[11px] ring-1 ring-jade/30">
                    ✓ 轿车/裸车 SUV 高度，所有地库与老城窄巷畅通
                  </span>
                ) : vehicleHeight <= 2.2 ? (
                  <span className="chip bg-amber/15 text-amber font-semibold text-[11px] ring-1 ring-amber/30">
                    ⚠ 7座MPV+车顶箱：避开老城 2.0m 地库，自动规划地面车位
                  </span>
                ) : (
                  <span className="chip bg-ochre/15 text-ochre font-semibold text-[11px] ring-1 ring-ochre/30">
                    ✕ 严重拦截！该高度超过景区与县道 2.2m 限高横杆
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Card 6: 本地 EXIF 照片隐私回忆录 */}
          <div className="glass-strong rounded-3xl p-6 transition-all hover:shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-ink/[0.08]">
              <span className="chip bg-jade/15 text-jade font-semibold text-xs ring-1 ring-jade/30">
                F-M10-02 隐私零泄露
              </span>
              <span className="font-mono text-xs text-ink-soft">纯前端 Web Worker</span>
            </div>
            <h3 className="mt-4 font-serif text-lg font-bold text-ink">
              本地 EXIF 隐私足迹生成
            </h3>
            <p className="mt-1 text-xs text-ink-soft leading-relaxed">
              手机拍摄的几百张家庭合影，原图完全不出浏览器。在 Worker 线程本地聚类生成旅行回忆录。
            </p>

            <div className="mt-5 rounded-2xl bg-paper/90 p-4 ring-1 ring-ink/10">
              <div className="flex items-center justify-between border-b border-ink/[0.06] pb-2 text-xs">
                <span className="font-semibold text-ink">342 张合照时空足迹分析</span>
                <span className="text-jade font-bold">100% 本地运算</span>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="rounded-md bg-gold/15 p-1.5 text-base">📸</span>
                <div className="min-w-0 flex-1 text-[11px] text-ink-soft">
                  <p className="font-medium text-ink truncate">莫高窟九层楼 · 19:42 鸣沙山落日</p>
                  <p className="text-[10px]">根据 GPS 经纬度与时间戳自动对齐到路书 D4 节点</p>
                </div>
              </div>
              <div className="mt-2.5 text-[10px] text-ink-soft">
                ✓ 用户相册照片绝不上云 · 遵守个人信息保护法与 GDPR
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
