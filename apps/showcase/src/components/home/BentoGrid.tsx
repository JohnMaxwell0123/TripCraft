'use client';

import { useState } from 'react';
import {
  ZapIcon,
  SignalSlashIcon,
  RoadIcon,
  AlertTriangleIcon,
  CheckIcon,
  CarIcon,
  CompassIcon,
  ClockIcon,
} from '@/components/common/Icons';

export function BentoGrid() {
  // Card 3 State: Vehicle Clearance Simulator (aligned with 2.28m Denza D9 + roof box)
  const [vehicleHeight, setVehicleHeight] = useState(2.28);

  // Card 5 State: Offline network simulator
  const [isOffline, setIsOffline] = useState(false);

  // Card 6 State: Dynamic AA split preview
  const [memberCount, setMemberCount] = useState(5);

  return (
    <section id="bento" className="relative overflow-hidden py-16 sm:py-24 bg-[#FFFFF9] scroll-mt-20">
      <div className="relative mx-auto max-w-[1640px] px-6 sm:px-10 lg:px-12 xl:px-16">
        {/* Section Header (Unify style: Eyebrow + Serif Headline) */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-wider text-[#FE3C01]">
            全地形能力矩阵 · 工业级工程基准
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[42px] font-normal tracking-tight text-[#241E20] leading-[1.2] text-balance">
            一套协同中枢，驾驭全场景自驾出行
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6E6A67]">
            拒绝华而不实的玩具模型。从 2.28m 车高老城地库物理截断，到无人区断网秒开的离线单文件容灾舱，每项能力皆针对荒野自驾真实痛点工程化落地。
          </p>
        </div>

        {/* 1. Large Top Hero Bento Card (Unify Wide Showcase Card) */}
        <div className="mt-12 rounded-[16px] bg-[#FFFFFF] border border-[#241E20]/10 p-6 sm:p-8 shadow-[0_4px_24px_rgba(36,30,32,0.04)] grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-semibold tracking-wider text-[#FE3C01]">
              全链路协同架构
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-normal text-[#241E20] leading-snug">
              智能体全局调度自驾全流程工具链
            </h3>
            <p className="text-sm leading-relaxed text-[#6E6A67]">
              从对话倾诉提炼诉求，到多人微信扫码博弈投票；从车道级领航避障，到离线单文件零构建交付。一个经过自驾形式化契约校验的工业级中枢。
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-xs">
              <span className="unify-pill-badge">自然语言提取约束</span>
              <span className="unify-pill-badge">微信免登全团同频</span>
              <span className="unify-pill-badge">50+ 物理自驾风控规则</span>
              <span className="unify-pill-badge">车规座舱双向流转</span>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-[12px] bg-[#FFFFF9] border border-[#241E20]/[0.08] p-4 text-xs text-[#241E20]">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#241E20]/[0.08]">
              <span className="font-bold text-[#FE3C01]">智能体协同调度流水</span>
              <span className="text-emerald-700 font-medium">执行状态：全部通过</span>
            </div>
            <div className="space-y-1.5 text-[11px] leading-relaxed">
              <p className="text-emerald-700">✓ [诉求抽取] 提取诉求: 川西 6 天 · 腾势 D9 带顶箱 · 长辈防高反</p>
              <p className="text-blue-800">✓ [愿望池] 微信全团 5 人意向聚合完成，折多山雪山观景置顶</p>
              <p className="text-amber-700">⚠ [限高风控] 拦截康定老城地下通道 (限高 2.0m &lt; 车高 2.28m)</p>
              <p className="text-emerald-700">✓ [动态避险] 自动规划地面开阔路线，距目的地 150m 专用车位</p>
              <p className="text-purple-700">✓ [离线编译] 生成自包含离线单文件 (1.2MB, 零外链依赖)</p>
            </div>
          </div>
        </div>

        {/* 2. 6-Feature Bento Grid (Unify 3-Column Card Matrix) */}
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
          {/* Card 1: AI Prompting & Route Generation */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                自如对话编排
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                倾诉式多轮对话生成
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                即使诉求零碎杂乱，规划师亦能从“带老人看雪山但不爬高楼”、“想吃牦牛肉汤锅”等口语中提炼出严谨的日程方案。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFFFF9] p-3 border border-[#241E20]/[0.06] text-xs">
              <span className="text-[#6E6A67] block text-[10px]">输入示例:</span>
              <span className="text-[#241E20] font-medium block mt-1">
                “我们 5 个人开 MPV 走川西，老人腿脚不便，千万别安排爬山的台阶！”
              </span>
              <div className="mt-2 pt-2 border-t border-[#241E20]/[0.06] flex items-center justify-between text-[11px] text-emerald-700 font-medium">
                <span>✓ 坡度过滤断言生效</span>
                <span>排除陡坡步道 14 处</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">多轮意图消歧</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">动态节奏均衡</span>
            </div>
          </div>

          {/* Card 2: WeChat Zero-Login Collaborative Wishlist */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                微信全团协同
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                全团微信免登愿望池
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                分享微信卡片，同乘伙伴无需下载应用即可点亮心仪打卡点。算法自动加权计算，智能平衡各方意图。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFFFF9] p-3 border border-[#241E20]/[0.06] space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="font-medium text-[#241E20]">鱼子西星空日落</span>
                <span className="text-[#FE3C01] font-mono text-[11px] font-semibold">4/5 票</span>
              </div>
              <div className="w-full bg-[#241E20]/10 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#FE3C01] h-full w-4/5" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-[#6E6A67]">
                <span>小林、王叔、张阿姨想去</span>
                <span>对齐 19:20 黄金时刻</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">免注册微信同频</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">冲突权重消解</span>
            </div>
          </div>

          {/* Card 3: 2.28m Height Clearance Simulator */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                刚性物理风控
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                2.28m 车高与限高刚性风控
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                7座 MPV 加装车顶行李箱后总高 2.28m。系统在路线规划与车机领航中全程物理拦截 2.0m 老城限高地库与涵洞。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFFFF9] p-3 border border-[#241E20]/[0.06]">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-[#6E6A67]">当前整车高度设定:</span>
                <span className="font-mono font-bold text-[#FE3C01]">{vehicleHeight.toFixed(2)} 米</span>
              </div>
              <input
                type="range"
                min="1.80"
                max="2.50"
                step="0.05"
                value={vehicleHeight}
                onChange={(e) => setVehicleHeight(parseFloat(e.target.value))}
                aria-label="整车高度滑块"
                className="w-full accent-[#FE3C01] cursor-pointer"
              />
              <div className="mt-2 text-[11px]">
                {vehicleHeight > 2.05 ? (
                  <span className="text-amber-700 font-semibold flex items-center gap-1">
                    <span>⚠</span> 触发拦截: 严禁进入 ≤2.0m 老城地库，已重定向至地面宽位
                  </span>
                ) : (
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <span>✓</span> 通行正常: 满足绝大多数普通地库标准
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">物理规则断言</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">地库涵洞强防御</span>
            </div>
          </div>

          {/* Card 4: Cockpit Autonomous NOA */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                座舱车道级领航
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                车机双向车道级领航协同
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                手机规划一键投屏腾势座舱，车道级流金光毯导引弯道变道，驻车 P 挡自动无感交接手机步行微镜头。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#241E20] text-white p-3 space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center text-white/70">
                <span>车道级领航巡航</span>
                <span className="text-emerald-400 font-bold">82 km/h</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-amber-400">
                <span>✦</span>
                <span>距限高涵洞 1.2km，已提前执行右车道驶出</span>
              </div>
              <div className="text-[10px] text-white/40 pt-1 border-t border-white/10 flex justify-between">
                <span>腾势 D9 顶视自车感知</span>
                <span>高精卫星定位校验</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">车机大屏定制</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">驻车步行接力</span>
            </div>
          </div>

          {/* Card 5: Zero-Build Deliverability & Offline Safe Cabin */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                零构建离线安全舱
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                零构建离线单文件安全舱
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                单文件自包含 HTML，零外部网络拉取。进入阿里/理塘无人区即使断网数日，路书依旧双击秒开，三级降级防御白屏。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFFFF9] p-3 border border-[#241E20]/[0.06]">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-[#6E6A67]">网络状态模拟器:</span>
                <button
                  type="button"
                  onClick={() => setIsOffline(!isOffline)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isOffline ? '已模拟无人区断网 ✖' : '当前在线 4G/5G ✓'}
                </button>
              </div>
              <div className="text-[11px] leading-tight">
                {isOffline ? (
                  <span className="text-amber-700 font-semibold">
                    [三级降级激活] 地图瓦片已切换离线 SVG 矢量拓扑，毫秒响应零白屏！
                  </span>
                ) : (
                  <span className="text-[#6E6A67]">
                    在线状态下实时同步天气预警与多人微信变更，自动持久化至本地存储。
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">零外部运行时依赖</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">三级降级防白屏</span>
            </div>
          </div>

          {/* Card 6: Multi-Dimensional Post-Trip Reporting */}
          <div className="unify-card p-6 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-semibold tracking-wider text-[#FE3C01] block">
                履约复盘与平账
              </span>
              <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">
                行程履约看板与智能平账
              </h4>
              <p className="mt-2 text-xs leading-relaxed text-[#6E6A67]">
                旅途结束后自动生成足迹热力图与耗电耗油复盘，多人费用支出通过最优平账算法一键结算。
              </p>
            </div>

            <div className="mt-5 rounded-lg bg-[#FFFFF9] p-3 border border-[#241E20]/[0.06] text-xs">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-[#6E6A67]">全车同行人数:</span>
                <div className="flex gap-1.5">
                  {[3, 4, 5, 7].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMemberCount(num)}
                      className={`h-5 w-5 rounded text-[10px] font-mono ${
                        memberCount === num ? 'bg-[#241E20] text-white font-bold' : 'bg-white border text-[#6E6A67]'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex justify-between items-center pt-1 text-[11px] font-mono text-[#241E20]">
                <span>总支出 ¥8,450 (油电+餐饮+门票)</span>
                <span className="text-[#FE3C01] font-bold">人均 ¥{(8450 / memberCount).toFixed(0)}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#241E20]/[0.06] flex flex-wrap gap-1.5 text-[11px]">
              <span className="unify-pill-badge !text-[10px] !py-0.5">最优分账矩阵</span>
              <span className="unify-pill-badge !text-[10px] !py-0.5">足迹轨迹回放</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
