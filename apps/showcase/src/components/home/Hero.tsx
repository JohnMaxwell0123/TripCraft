'use client';

import { motion } from 'framer-motion';

export function Hero() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownloadSample = () => {
    // Generate a minimal self-contained HTML offline sample roadbook for download
    const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>西行计划 · 丝路自驾离线路书 (TripCraft 单文件样例)</title>
  <style>
    :root { --sand: #F2E8D5; --ink: #3A2E1F; --gold: #B8863B; --paper: #FAF5EB; --jade: #0E8674; }
    body { margin: 0; font-family: -apple-system, system-ui, sans-serif; background: var(--sand); color: var(--ink); padding: 24px; }
    .card { background: var(--paper); border: 1px solid rgba(58,46,31,0.15); border-radius: 16px; padding: 24px; max-width: 640px; margin: 0 auto; box-shadow: 0 10px 30px rgba(0,0,0,0.06); }
    h1 { font-family: serif; color: var(--ink); margin-top: 0; }
    .badge { display: inline-block; background: rgba(14,134,116,0.12); color: var(--jade); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .day { border-left: 3px solid var(--gold); padding-left: 12px; margin-bottom: 16px; }
    .tip { background: #fff4e5; border-radius: 8px; padding: 12px; font-size: 13px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ TripCraft 单文件离线自包含交付 · 双击秒开 · 零构建</div>
    <h1>西行计划 · 丝路自驾路书</h1>
    <p style="color: #6B5D4A; font-size: 14px;">9 天甘青大环线 · 7 座豪华 MPV (车顶行李箱) · 离线快照 v1.1</p>
    <div class="day">
      <strong>D0 · 兰州集结夜</strong><br>
      <small>15:30 落地中川 ➔ 19:15 入住水岸云上酒店 ➔ 20:00 漫步正宁路夜市（打卡牛奶鸡蛋醪糟）</small>
    </div>
    <div class="day">
      <strong>D1 · 兰州 ➔ 张掖 (505km)</strong><br>
      <small>翻越乌鞘岭 2980m ➔ 双司机轮换 ➔ 傍晚七彩丹霞</small>
    </div>
    <div class="tip">
      <strong>🚙 7座 MPV 车顶箱安全备忘：</strong>加装行李箱后车高 2.15m，夜市老城地库限高 2.0m，车停酒店地面车位，全家慢行 950m 前往正宁路。
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TripCraft_西行计划_单文件离线路书样例.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="relative overflow-hidden pt-28 pb-16 md:pt-36 md:pb-24 paper-texture">
      {/* Decorative ambient lights */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgb(var(--tc-gold)/0.28),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute top-40 right-10 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgb(var(--tc-lapis)/0.15),transparent_70%)] blur-3xl"
      />

      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Vision & Headlines */}
          <div className="text-center lg:col-span-7 lg:text-left">
            {/* Pill Tag */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-paper/90 px-3.5 py-1.5 shadow-sm"
            >
              <span className="flex h-2 w-2 rounded-full bg-jade animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-gold-ink">
                东方风物与现代工程美学 · 智能旅行数字化交付中枢
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="mt-6 font-serif text-3xl font-bold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.15]"
            >
              让每一次自驾出行，
              <br />
              <span className="bg-gradient-to-r from-gold-ink via-ochre to-lapis bg-clip-text text-transparent">
                都成为有温度的活路书。
              </span>
            </motion.h1>

            {/* Subheading */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-ink-soft sm:text-lg"
            >
              从一段大白话的诉求倾诉，到 AI 老定制师苏格拉底式反问；
              从好友微信免登协同添加美食，到浏览器纯前端毫秒级重算编排。
              零第三方强依赖，单文件自包含秒开，断网亦可在无人区穿行。
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 lg:justify-start"
            >
              <button
                onClick={() => scrollToSection('demo')}
                className="btn-primary min-h-[48px] px-7 text-sm font-semibold shadow-lg hover:shadow-xl"
              >
                <span>体验路书诞生故事流</span>
                <span className="text-base">↓</span>
              </button>

              <button
                onClick={handleDownloadSample}
                className="glass btn-ghost min-h-[48px] border-ink/20 px-6 text-sm text-ink hover:border-gold hover:bg-paper/80"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gold-ink">
                  <path
                    d="M12 3v13m0 0l-4-4m4 4l4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>下载离线单文件样例 (.html)</span>
              </button>
            </motion.div>

            {/* Trust points */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-soft lg:justify-start"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 免登体验
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 甘青 9 天真实工程数据
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 7座 MPV 车顶箱限高通达规则
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-jade font-bold">✓</span> 纯本地数据隐私安全
              </span>
            </motion.div>
          </div>

          {/* Right Column: Liquid Glass Compass & 3D Sand Dune Hero Card */}
          <div className="flex justify-center lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-strong glass-sheen relative w-full max-w-[440px] overflow-hidden rounded-3xl p-6 shadow-2xl"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-ink/[0.08] pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 font-serif text-sm font-bold text-gold-ink">
                    甘
                  </span>
                  <div>
                    <h3 className="font-serif text-sm font-bold text-ink">河西走廊 · 丝路探秘</h3>
                    <p className="text-[10px] text-ink-soft">9 天 8 晚 · 1,980 km 自驾大环线</p>
                  </div>
                </div>
                <span className="chip bg-jade/15 text-[11px] font-semibold text-jade ring-1 ring-jade/30">
                  7座 MPV 畅行
                </span>
              </div>

              {/* Liquid Glass Compass Graphic */}
              <div className="relative my-6 flex h-48 items-center justify-center">
                {/* Concentric rings */}
                <div className="absolute h-44 w-44 rounded-full border border-gold/30" />
                <div className="absolute h-32 w-32 rounded-full border border-dashed border-gold/50 animate-[spin_60s_linear_infinite]" />
                <div className="absolute h-20 w-20 rounded-full bg-gradient-to-br from-paper to-sand shadow-inner ring-1 ring-gold/40" />

                {/* Compass Needle */}
                <div className="relative flex h-28 w-28 items-center justify-center animate-[spin_30s_ease-in-out_infinite_alternate]">
                  <div className="h-24 w-1.5 bg-gradient-to-t from-ochre via-gold to-lapis shadow-sm rounded-full" />
                  <div className="absolute -top-1 h-3 w-3 rotate-45 bg-ochre" />
                  <div className="absolute -bottom-1 h-3 w-3 rotate-45 bg-lapis" />
                </div>

                {/* Cardinal Directions */}
                <span className="absolute top-1 font-serif text-[11px] font-bold text-ochre">北 (阳关·玉门关)</span>
                <span className="absolute bottom-1 font-serif text-[11px] font-bold text-lapis">南 (祁连雪山)</span>
                <span className="absolute left-2 font-serif text-[11px] font-bold text-gold-ink">西 (莫高窟)</span>
                <span className="absolute right-2 font-serif text-[11px] font-bold text-gold-ink">东 (兰州)</span>

                {/* Floating Chips */}
                <div className="absolute -right-2 top-2 rounded-xl bg-paper/90 px-3 py-1.5 shadow-md ring-1 ring-ink/10">
                  <p className="text-[10px] text-ink-soft">乌鞘岭最高海拔</p>
                  <p className="font-serif text-xs font-bold text-ochre">2,980 m</p>
                </div>

                <div className="absolute -left-2 bottom-2 rounded-xl bg-paper/90 px-3 py-1.5 shadow-md ring-1 ring-ink/10">
                  <p className="text-[10px] text-ink-soft">鸣沙山日落窗口</p>
                  <p className="font-serif text-xs font-bold text-gold-ink">19:30 - 20:15</p>
                </div>
              </div>

              {/* Card Footer status */}
              <div className="rounded-xl bg-ink/[0.04] p-3 text-xs">
                <div className="flex items-center justify-between text-ink-soft">
                  <span>长辈关怀约束状态：</span>
                  <span className="font-semibold text-jade">✓ 已规避险峻栈道</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-ink-soft">
                  <span>协同人员信标：</span>
                  <span className="font-medium text-ink">领队 · 阿杰 · 小雨 (3人连线)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
