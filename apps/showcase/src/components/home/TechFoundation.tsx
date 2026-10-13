'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ZapIcon, ShieldIcon, CheckIcon } from '@/components/common/Icons';

interface Pillar {
  id: string;
  tag: string;
  number: string;
  title: string;
  enTitle: string;
  quote: string;
  summary: string;
  highlights: { label: string; desc: string }[];
  contractBadge: string;
  shortTitle: string;
  codeSnippet: {
    filename: string;
    language: string;
    code: string;
  };
  interactiveDemoType: 'failover' | 'dsl' | 'guardrails' | 'compiler';
}

const PILLARS: Pillar[] = [
  {
    id: 'local-first',
    tag: '数据主权 · 极端弹性',
    number: '01',
    title: 'Local-First 本地优先与极端网络弹性',
    shortTitle: 'Local-First 架构',
    enTitle: 'Extreme Network Resilience & Local Sovereignty',
    quote: '“断网绝非异常，而是荒野自驾探索中的物理常态。”',
    summary:
      '用户的行程轨迹、家庭成员证件与照片默认保存在浏览器私有 IndexedDB，计算在 Web Worker 进行。无网弱网下具备 100% 完整阅读与编辑能力，网络恢复时经由 RFC 6902 JSON Patch 增量同步。',
    highlights: [
      {
        label: '三级容灾降级管道',
        desc: '高德/百度矢量瓦片超时 (>3s) 瞬间降级为离线矢量 SVG 底图；若 SVG 异常则退化至纯时序拓扑卡片，彻底消灭白屏。',
      },
      {
        label: '数据隐私端侧闭环',
        desc: '敏感信息不上云，所有点位聚类、高程积分与耗时计算完全消耗客户端本地算力。',
      },
      {
        label: '增量时钟协同合并',
        desc: '基于向量时钟与 JSON Patch 事务流，团队成员离线改动在线后自动无损合流。',
      },
    ],
    contractBadge: 'ADR-004 · 本地存储与三级降级管道',
    codeSnippet: {
      filename: 'src/lib/resilience/failover-pipeline.ts',
      language: 'typescript',
      code: `// 三级地图降级管道状态机：永远杜绝白屏
export async function resolveMapLayer(ctx: RenderContext): Promise<MapRenderer> {
  try {
    const tileSDK = await timeout(loadOnlineMapSDK(ctx.vendor), 3000);
    return new VectorTileRenderer(tileSDK);
  } catch (err) {
    console.warn('[Resilience] 在线瓦片加载超时，降级至 Level 2 离线矢量 SVG');
    if (ctx.offlineSvgGeometry) {
      return new OfflineSvgRenderer(ctx.offlineSvgGeometry);
    }
    console.warn('[Resilience] 触发 Level 3 极简时序拓扑卡片渲染');
    return new MinimalTopologyCardRenderer(ctx.tripNodes);
  }
}`,
    },
    interactiveDemoType: 'failover',
  },
  {
    id: 'dsl-truth',
    tag: '形式契约 · 语法中枢',
    number: '02',
    title: '可执行 DSL 作为唯一真相源',
    shortTitle: '可执行 DSL 契约',
    enTitle: 'Executable DSL as the Single Source of Truth',
    quote: '“路书不是凌乱的图文备忘，而是一份结构严谨、机器可执行的自驾程序。”',
    summary:
      '所有界面交互、AI 决策输出与协作补丁，全部映射至 spec/trip.schema.json 的抽象语法树（AST），并通过 AJV 严格校验。单一数据源编译驱动网页、车机与 A5 纸质手册全端表现。',
    highlights: [
      {
        label: '严格 JSON Schema 2020-12',
        desc: '经纬度坐标、车型尺寸、道路坡度、高程阶梯、餐饮补给均有形式化元数据定义。',
      },
      {
        label: '不可变 Patch 事务流',
        desc: '每一次微调均产生确定性 JSON Patch 事务，天然支持版本无损回滚、冲突比对与协同存证。',
      },
      {
        label: '全端同源编译驱动',
        desc: '同一份 trip.json 数据，既是前端动态画布的源动力，也是导出车机深链与纸质印刷排版的核心。',
      },
    ],
    contractBadge: 'spec/trip.schema.json · RFC 6902 JSON Patch',
    codeSnippet: {
      filename: 'spec/node.schema.json',
      language: 'json',
      code: `{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "TripNode",
  "type": "object",
  "required": ["id", "type", "geo", "schedule", "vehicle_constraints"],
  "properties": {
    "geo": {
      "type": "object",
      "required": ["lat", "lng", "altitude_m"],
      "properties": {
        "lat": { "type": "number", "minimum": -90, "maximum": 90 },
        "lng": { "type": "number", "minimum": -180, "maximum": 180 },
        "altitude_m": { "type": "number" }
      }
    },
    "vehicle_constraints": {
      "type": "object",
      "properties": {
        "max_height_m": { "type": "number" },
        "parking_type": { "enum": ["underground", "ground_open", "none"] }
      }
    }
  }
}`,
    },
    interactiveDemoType: 'dsl',
  },
  {
    id: 'ai-guardrails',
    tag: '客观刚性 · 拒绝幻觉',
    number: '03',
    title: '双轨防幻觉与物理安全断言',
    shortTitle: '双轨物理防御引擎',
    enTitle: 'Dual-Track Guardrails & Physical Rule Assertions',
    quote: '“客观物理规律是刚性红线，AI 是懂人性与美学的同路副驾。”',
    summary:
      '客观交通限制（车型限高、山路限速、刹车热衰减、特窟闭馆）标记为刚性「事实」；AI 定制师优化策略标记为「建议」。大模型输出必须通过 BR-001 ~ BR-025 物理规则引擎防御墙硬校验。',
    highlights: [
      {
        label: '事实与建议形式化分离',
        desc: '严禁 AI 擅自篡改既定行程。系统绝不伪造虚假通行能力，用户永远保留最终裁决权。',
      },
      {
        label: '25 道物理规则防御墙',
        desc: '长下坡制动热衰减警告、高反急剧爬升限速、地库限高 2.1m 拦截、无人区加油站极限间距刚性断言。',
      },
      {
        label: '苏格拉底启发式对谈',
        desc: '遇到路线冲突时，AI 绝不越俎代庖，而是通过权衡利弊选项引导领队做出清晰抉择。',
      },
    ],
    contractBadge: 'ADR-008 · BR-001~025 规则防御引擎',
    codeSnippet: {
      filename: 'src/lib/guardrails/physics-assert.ts',
      language: 'typescript',
      code: `// 物理规则硬拦截：BR-025 车型限高与地库断言
export function assertVehicleClearance(vehicle: VehicleMeta, poi: PoiNode): AssertionResult {
  if (vehicle.height_m > 2.0 && poi.parking_type === 'underground') {
    return {
      passed: false,
      code: 'BR-025_CLEARANCE_VIOLATION',
      severity: 'FATAL_OVERRIDE',
      fact: \`车辆加装车顶箱后总高 \${vehicle.height_m}m 超过该老城区地库限高 2.0m\`,
      suggestion: '已强制规划为酒店地面专用车位，并为全家生成慢步导引 950m（约12分钟）',
      fallbackParking: findNearbyGroundParking(poi.geo)
    };
  }
  return { passed: true };
}`,
    },
    interactiveDemoType: 'guardrails',
  },
  {
    id: 'zero-build-compiler',
    tag: '单文件秒开 · 座舱协议',
    number: '04',
    title: '零构建自包含编译器与座舱互联',
    shortTitle: '零构建单文件编译',
    enTitle: 'Zero-Build Compiler & Tier 0 Cockpit Protocol',
    quote: '“随处可开，零依赖安装，做一件真正能带走的数字化艺术品。”',
    summary:
      '自研单文件编译器将 9 天完整路书、内联离线矢量图、子集化中文字体与轻量运行时封装为单个 1.8 MB 自包含 HTML。配合极简 Tier 0 座舱深链协议，零 SDK 前装准入直接唤醒车机投屏。',
    highlights: [
      {
        label: '单文件双击秒开 (≤1.8 MB)',
        desc: '0 外部网络请求、0 npm 运行时依赖。无论戈壁滩还是飞机舱，随时随地双击瞬时呈现。',
      },
      {
        label: 'Tier 0 车机极简唤醒',
        desc: '无需漫长的车企前装认证流程，通过标准深链（URL Scheme / Geo URI）将全天途经点集群一键发往车机高德/百度。',
      },
      {
        label: '纸电双模 A5 印刷支持',
        desc: '遵循 CSS Paged Media 规范，内联打印样式表，一键输出符合自驾装订标准的 A5 实体路书折页。',
      },
    ],
    contractBadge: 'ADR-005 / ADR-006 · 单文件编译管线',
    codeSnippet: {
      filename: 'tools/compiler/pack-single-file.ts',
      language: 'typescript',
      code: `// 单文件编译器核心管线：全要素自包含离线封装
export async function compileSingleFile(tripDsl: TripDSL): Promise<string> {
  const [subsetFont, inlinedSvgMap, runtimeJs] = await Promise.all([
    subsetChineseFonts(tripDsl.allTexts),
    renderVectorMapSvg(tripDsl.waypoints),
    bundleMinimalRuntime()
  ]);

  return \`<!DOCTYPE html>
<html>
<head>
  <style>\${subsetFont.css}\${inlinedStyles}</style>
</head>
<body>
  <div id="trip-map">\${inlinedSvgMap}</div>
  <script>window.__TRIP_AST__ = \${JSON.stringify(tripDsl)};\${runtimeJs}</script>
</body>
</html>\`;
}`,
    },
    interactiveDemoType: 'compiler',
  },
];

export function TechFoundation() {
  const [activePillar, setActivePillar] = useState<Pillar>(PILLARS[0]);

  // Interactive micro-demos state
  const [failoverLevel, setFailoverLevel] = useState<1 | 2 | 3>(1);
  const [guardrailTested, setGuardrailTested] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activePillar.codeSnippet.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section id="foundation" className="relative overflow-hidden py-12 sm:py-16 md:py-24 bg-slate-50/60 border-t border-slate-200/80 scroll-mt-20 md:scroll-mt-24">
      {/* Decorative ambient background glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-12 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.06),transparent_70%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-12 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(217,119,6,0.05),transparent_70%)] blur-3xl"
      />

      <div className="relative mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Section Header */}
        <div className="text-center">
          <p className="eyebrow text-amber-600 font-semibold">ENGINEERING FOUNDATION & PHILOSOPHY · 技术底座与工程哲学</p>
          <h2 className="mt-3 font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-[1.3]">
            支撑旅艺的硬核技术底座
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed text-ink-soft">
            不盲从云端黑盒，不妥协荒野白屏。以 Local-First 本地主权、严谨 DSL 形式化契约与防幻觉物理断言，构筑坚不可摧的自驾协同中枢。
          </p>
        </div>

        {/* Engineering Hard Benchmarks Bar */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          <div className="glass rounded-card p-3.5 sm:p-5 text-center transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-slate-200/60">
            <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-600">≤ 1.8 MB</p>
            <p className="mt-1 text-xs font-semibold text-ink">单文件自包含体积</p>
            <p className="text-xs text-ink-soft">含全量矢量图与子集字体</p>
          </div>
          <div className="glass rounded-card p-3.5 sm:p-5 text-center transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-slate-200/60">
            <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-600">&lt; 300 ms</p>
            <p className="mt-1 text-xs font-semibold text-ink">离线双击秒开耗时</p>
            <p className="text-xs text-ink-soft">零网络冷启动首屏</p>
          </div>
          <div className="glass rounded-card p-3.5 sm:p-5 text-center transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-slate-200/60">
            <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-600">25 道</p>
            <p className="mt-1 text-xs font-semibold text-ink">物理规则刚性防御墙</p>
            <p className="text-xs text-ink-soft">BR-001~025 彻底杜绝幻觉</p>
          </div>
          <div className="glass rounded-card p-3.5 sm:p-5 text-center transition-all duration-300 shadow-level-static hover:shadow-level-hover border border-slate-200/60">
            <p className="font-mono text-2xl sm:text-3xl font-bold tabular-nums text-amber-600">Tier 0</p>
            <p className="mt-1 text-xs font-semibold text-ink">极简座舱互联协议</p>
            <p className="text-xs text-ink-soft">零前装准入深度唤醒</p>
          </div>
        </div>

        {/* 4 Pillars Interactive Tab Selector */}
        <div className="mt-8 sm:mt-12 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4" role="tablist" aria-label="技术底座四大支柱">
          {PILLARS.map((pillar) => {
            const isSelected = activePillar.id === pillar.id;
            return (
              <button
                key={pillar.id}
                id={`tab-${pillar.id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`panel-${pillar.id}`}
                onClick={() => {
                  setActivePillar(pillar);
                  setGuardrailTested(false);
                }}
                className={`relative rounded-card p-3.5 sm:p-4 text-left transition-all duration-300 flex flex-col justify-between shadow-level-static active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                  isSelected
                    ? 'glass-strong ring-2 ring-amber-500/70 shadow-level-hover border-amber-500/30 -translate-y-0.5'
                    : 'bg-paper/70 hover:bg-paper/95 border border-slate-200/50 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-lg font-bold tabular-nums ${
                        isSelected ? 'text-amber-600' : 'text-slate-400'
                      }`}
                    >
                      {pillar.number}
                    </span>
                    <span className="chip rounded-pill py-0 text-xs bg-ink/5 text-ink-soft">
                      {pillar.tag.split('·')[0].trim()}
                    </span>
                  </div>
                  <span className="block mt-2 font-sans text-sm font-bold text-ink sm:text-base leading-snug">
                    {pillar.shortTitle}
                  </span>
                </div>
                <p className="mt-3 text-xs text-ink-soft line-clamp-1">
                  {pillar.enTitle}
                </p>
              </button>
            );
          })}
        </div>

        {/* Main Interactive Stage for Selected Pillar */}
        <div className="mt-8 grid gap-8 lg:grid-cols-12 lg:items-start">
          {/* Left Column: Philosophy Description & Highlights */}
          <div
            className="space-y-6 lg:col-span-6 min-w-0"
            role="tabpanel"
            id={`panel-${activePillar.id}`}
            aria-labelledby={`tab-${activePillar.id}`}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activePillar.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.25 }}
                className="glass-strong rounded-container p-6 sm:p-8 shadow-level-static border border-slate-200/60"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-ink/[0.06] pb-4">
                  <span className="font-mono text-2xl font-bold tabular-nums text-amber-600">
                    PILLAR {activePillar.number}
                  </span>
                  <span className="chip rounded-pill bg-amber-50 text-amber-700 font-semibold text-xs ring-1 ring-amber-300/60">
                    {activePillar.contractBadge}
                  </span>
                </div>

                <h3 className="mt-5 font-sans text-xl sm:text-2xl font-bold text-ink leading-snug">
                  {activePillar.title}
                </h3>
                <p className="mt-1 text-xs font-mono uppercase tracking-wider text-ink-soft">
                  {activePillar.enTitle}
                </p>

                {/* Engineering philosophical quote */}
                <blockquote className="mt-5 rounded-control bg-amber-50/50 border-l-4 border-amber-500 p-4 text-xs font-sans italic text-ink sm:text-sm leading-relaxed">
                  {activePillar.quote}
                </blockquote>

                <p className="mt-5 text-xs text-ink-soft leading-relaxed sm:text-sm">
                  {activePillar.summary}
                </p>

                {/* Key Technical Highlights */}
                <div className="mt-6 space-y-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-ink">
                    工程落地要点：
                  </p>
                  {activePillar.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="rounded-control bg-paper/85 p-3.5 border border-slate-200/50 transition-all hover:bg-paper"
                    >
                      <p className="text-xs font-bold text-ink flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-ink-soft leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Interactive Mini-Sandbox for Current Pillar */}
                <div className="mt-6 rounded-card bg-sand/60 p-4 border border-slate-200/60">
                  <div className="text-xs font-bold text-ink flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <ZapIcon className="h-3.5 w-3.5 text-amber-600" />
                      <span>架构交互演练微沙盒：</span>
                    </span>
                    <span className="text-xs text-ink-soft font-normal">点击即时触发</span>
                  </div>

                  {/* Demo 1: Failover Pipeline Toggle */}
                  {activePillar.interactiveDemoType === 'failover' && (
                    <div className="mt-3 space-y-2">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFailoverLevel(1)}
                          className={`flex-1 min-h-[44px] rounded-control py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                            failoverLevel === 1
                              ? 'bg-jade text-paper shadow-level-static'
                              : 'bg-paper text-ink-soft hover:text-ink'
                          }`}
                        >
                          Level 1 在线瓦片
                        </button>
                        <button
                          type="button"
                          onClick={() => setFailoverLevel(2)}
                          className={`flex-1 min-h-[44px] rounded-control py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                            failoverLevel === 2
                              ? 'bg-amber-600 text-paper shadow-level-static'
                              : 'bg-paper text-ink-soft hover:text-ink'
                          }`}
                        >
                          Level 2 矢量SVG
                        </button>
                        <button
                          type="button"
                          onClick={() => setFailoverLevel(3)}
                          className={`flex-1 min-h-[44px] rounded-control py-2 text-xs font-semibold transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 ${
                            failoverLevel === 3
                              ? 'bg-ochre text-paper shadow-level-static'
                              : 'bg-paper text-ink-soft hover:text-ink'
                          }`}
                        >
                          Level 3 拓扑卡片
                        </button>
                      </div>
                      <div className="rounded-control bg-paper p-3 text-xs border border-slate-200/50">
                        {failoverLevel === 1 && (
                          <div className="flex items-center gap-2 text-jade font-semibold">
                            <span>● 网络畅通：</span>
                            <span className="text-ink">高德/百度高清矢量瓦片渲染中，帧率 <span className="font-mono tabular-nums">60fps</span></span>
                          </div>
                        )}
                        {failoverLevel === 2 && (
                          <div className="flex items-center gap-2 text-amber-700 font-semibold">
                            <span>▲ 触发超时降级：</span>
                            <span className="text-ink">网络中断，无缝秒级切换至内联离线 SVG 矢量图</span>
                          </div>
                        )}
                        {failoverLevel === 3 && (
                          <div className="flex items-center gap-2 text-ochre font-semibold">
                            <span>■ 极端极端兜底：</span>
                            <span className="text-ink">SVG 渲染受限，自动展开纯 CSS 文本拓扑卡片，杜绝白屏</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Demo 2: DSL AST Verification */}
                  {activePillar.interactiveDemoType === 'dsl' && (
                    <div className="mt-3 rounded-control bg-paper p-3 text-xs border border-slate-200/50 space-y-1.5">
                      <div className="flex items-center justify-between text-jade font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckIcon className="h-3.5 w-3.5 text-jade" />
                          <span>AJV 2020-12 契约校验</span>
                        </span>
                        <span className="font-mono text-xs bg-jade/10 px-2 py-0.5 rounded-pill tabular-nums">0 错误</span>
                      </div>
                      <p className="text-xs text-ink-soft">
                        节点 AST 包含 9 天全部 28 个途经点坐标、限高标签与餐厅打卡元数据，天然具备 SHA-256 签名存证。
                      </p>
                    </div>
                  )}

                  {/* Demo 3: Physics Guardrail Assertion Tester */}
                  {activePillar.interactiveDemoType === 'guardrails' && (
                    <div className="mt-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => setGuardrailTested(!guardrailTested)}
                        className="w-full min-h-[44px] rounded-control bg-ochre/10 text-ochre hover:bg-ochre/20 border border-ochre/30 py-2.5 px-3 text-xs font-semibold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 text-center"
                      >
                        <span>模拟大模型指令：7座 MPV (加装车顶箱 2.15m) 直接驶入 2.0m 老城地库</span>
                        <span className="underline shrink-0">触发断言拦截</span>
                      </button>
                      {guardrailTested && (
                        <div className="rounded-control bg-ochre/10 border border-ochre/30 p-3 text-xs text-ochre animate-fadeIn">
                          <p className="font-bold flex items-center gap-1.5">
                            <ShieldIcon className="h-4 w-4 text-ochre shrink-0" />
                            <span>BR-025 物理断言刚性拦截：</span>
                            <span className="font-mono text-xs bg-ochre text-paper px-2 py-0.5 rounded-pill">
                              FATAL_OVERRIDE
                            </span>
                          </p>
                          <p className="mt-1 text-xs leading-relaxed">
                            车高 2.15m &gt; 地库限高 2.0m！已强制拦截并将车辆停放点修正为「酒店地面专用车位」，为全家规划 950m（12分钟）平缓慢步导引，避免车顶箱刮蹭损坏。
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Demo 4: Compiler Pipeline */}
                  {activePillar.interactiveDemoType === 'compiler' && (
                    <div className="mt-3 rounded-control bg-paper p-3 text-xs border border-slate-200/50 space-y-2">
                      <div className="flex items-center justify-between font-mono text-xs">
                        <span className="text-ink font-semibold">打包目标: expedition-pro.v1.1.html</span>
                        <span className="text-jade font-bold tabular-nums">1.8 MB (已压缩)</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                        <span className="chip rounded-pill py-0 text-xs bg-ink/5">0 外部脚本</span>
                        <span className="chip rounded-pill py-0 text-xs bg-ink/5">字体子集化</span>
                        <span className="chip rounded-pill py-0 text-xs bg-ink/5">内联离线SVG</span>
                        <span className="chip rounded-pill py-0 text-xs bg-ink/5">Tier 0 深链</span>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Code & Formal Contract Inspector */}
          <div className="space-y-4 lg:col-span-6 lg:sticky lg:top-28 min-w-0">
            <div className="glass-strong rounded-container p-5 sm:p-7 shadow-level-float overflow-hidden border border-slate-200/60">
              {/* Code window chrome header */}
              <div className="flex items-center justify-between border-b border-ink/[0.06] pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-ochre/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-gold/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-jade/60" />
                  </div>
                  <span className="ml-2 font-mono text-xs font-semibold text-ink">
                    {activePillar.codeSnippet.filename}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="chip rounded-pill py-0 text-xs uppercase font-mono bg-ink/5 text-ink-soft">
                    {activePillar.codeSnippet.language}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="chip rounded-pill min-h-[40px] py-1.5 px-3.5 text-xs text-amber-700 hover:text-amber-800 transition-all active:scale-95 font-semibold border border-amber-300/60 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                    title="复制真实代码"
                  >
                    {copiedCode ? '已复制 ✓' : '复制代码'}
                  </button>
                </div>
              </div>

              {/* Code Content Box */}
              <div className="mt-4 overflow-x-auto rounded-control bg-ink/[0.04] p-4 font-mono text-xs text-ink leading-relaxed border border-ink/[0.06]">
                <pre>
                  <code>{activePillar.codeSnippet.code}</code>
                </pre>
              </div>

              {/* Contract Metadata Footer */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-ink/[0.06] pt-3 text-xs text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-jade" />
                  <span>与核心架构契约 100% 一致</span>
                </span>
                <span className="font-mono text-xs text-amber-700 font-medium">
                  TripCraft Architecture Spec v2
                </span>
              </div>
            </div>

            {/* Architecture Ecosystem Summary Card */}
            <div className="glass rounded-card p-5 border border-slate-200/60 text-xs shadow-level-static">
              <p className="font-serif font-bold text-ink text-sm">
                为什么我们坚守这些工程哲学？
              </p>
              <p className="mt-2 text-ink-soft leading-relaxed">
                自驾旅行不同于城市漫游，一旦踏入河西走廊戈壁、祁连山脉或无人区，面对的是剧烈的信号衰减、长坡限速与物理车辆限制。代码与界面终究会迭代，但对物理规律的敬畏、对用户数据的守护与对离线交付的执着，是旅艺最坚固的护城河。
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
