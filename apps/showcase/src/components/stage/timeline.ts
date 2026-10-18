/**
 * 演示舞台时间轴（全局 progress 0 → 1）
 *
 * 所有场景共用这一份关键帧表，调整节奏只改这里。
 * 五幕与产品基线 v3 的核心流程一一对应（docs/product/PRD-01-vision-positioning.md §2，
 * 叙事说明见 docs/SHOWCASE-web-design.md §4）：
 *   01 对话与需求画像 → 02 路径 A 自驾规划 → 03 路径 B 线路匹配 → 04 旅行社线路工作室 → 05 多人共享 · 多端同步
 */

/** 五幕在全局进度上的区间；ScrollyStage 的每个 Tab 对应其中一幕 */
export const ACTS = {
  dialogue: [0, 0.198],
  drive: [0.2, 0.415],
  match: [0.42, 0.51],
  studio: [0.515, 0.6],
  share: [0.605, 0.998],
} as const;

export type ActId = keyof typeof ACTS;

/** 幕内局部进度 t（0 → 1）换算为全局进度 */
export const actAt = (act: ActId, t: number) => ACTS[act][0] + (ACTS[act][1] - ACTS[act][0]) * t;

/** 幕内时长（局部比例）换算为全局进度跨度 */
export const actSpan = (act: ActId, dt: number) => (ACTS[act][1] - ACTS[act][0]) * dt;

const d = (t: number) => actAt('dialogue', t);
const m = (t: number) => actAt('match', t);
const s = (t: number) => actAt('studio', t);

/** 05 幕沿用原「共创 + 编排」的编舞，整体后移到路径 B 与线路工作室之后 */
const SHARE_SHIFT = 0.19;
const sh = (v: number) => v + SHARE_SHIFT;

/**
 * 车机投递与离线交付是支撑能力，不再作为一幕挂载（PRD-01 §3）。
 * Workspace 的座舱淡出与 PhoneMock 的投车屏仍引用这几个键，取值放在 OFFSTAGE 之后——
 * 全局进度到不了，相关组件保持静止。
 */
const OFFSTAGE = 2;
const off = (v: number) => OFFSTAGE + (v - 0.78);

/** 关键帧（命名即语义，数值为全局进度） */
export const T = {
  /* ── 01 对话与需求画像 (DialogueScene) ─────── */
  modelMenu: [d(0.02), d(0.05), d(0.13), d(0.16)],
  askType: [d(0.17), d(0.39)],
  askSend: d(0.41),
  askBubble: [d(0.41), d(0.45)],
  followUp: [d(0.5), d(0.55)],
  followUpReply: [d(0.62), d(0.66)],
  /** 画像字段依次被提取：同行 · 目的地 · 日期 · 身体 · 出行方式 · 车辆（追问所得）· 预算（推断） */
  profileFields: [d(0.45), d(0.48), d(0.51), d(0.54), d(0.57), d(0.68), d(0.72)],
  profileReady: [d(0.74), d(0.79)],
  pathCursor: [d(0.82), d(0.9)],
  pathClick: d(0.92),
  chatOut: [0.198, 0.222],

  /* 旧 ChatScene 的键（该组件已不再挂载，保留以便编译） */
  typeInput: [0.003, 0.046],
  send: 0.052,
  userBubble: [0.05, 0.056],
  modelLit: [0.05, 0.062],
  chips: [0.064, 0.076, 0.096, 0.128],
  clickA: 0.051,

  /* ── 02 路径 A · AI 规划自驾 (Workspace) ─────── */
  sidebarIn: [0.2, 0.22],
  timelineIn: [0.205, 0.22],
  dayCardsStart: 0.22,
  dayCardStep: 0.0058,
  dayCardDur: 0.012,
  mapIn: [0.205, 0.22],
  camera: [0.225, 0.29],
  routeDraw: [0.235, 0.362],
  elevIn: [0.3, 0.33],
  elevDraw: [0.32, 0.38],
  badges: [0.35, 0.365, 0.38, 0.395],
  /** 结果页底部「有 N 条相似旅行社线路」→ 进入路径 B（docs/16 §16.5.2） */
  crossHint: [0.396, 0.401],
  crossCursor: [0.403, 0.409],
  crossClick: 0.411,

  /* ── 03 路径 B · 旅行社线路匹配 (MatchScene) ─────── */
  matchIn: [m(0), m(0.03)],
  priceBars: [m(0.03), m(0.16)],
  priceRange: [m(0.15), m(0.22)],
  dayBars: [m(0.18), m(0.28)],
  tilesStart: m(0.24),
  tileStep: actSpan('match', 0.018),
  resultCards: [m(0.3), m(0.36), m(0.42)],
  ringDur: actSpan('match', 0.09),
  askAi: [m(0.5), m(0.53), m(0.7), m(0.74)],
  budgetDrag: [m(0.54), m(0.61)],
  nearMiss: [m(0.62), m(0.68)],
  drawerTap: m(0.645),
  drawerOut: [m(0.65), m(0.71)],
  mobileCards: [m(0.7), m(0.74), m(0.78)],
  pickCursor: [m(0.78), m(0.86)],
  pickClick: m(0.88),

  /* ── 04 旅行社线路工作室 (StudioScene) ─────── */
  studioIn: [s(0), s(0.03)],
  studioOut: [actAt('share', 0), actAt('share', 0.015)],
  /** 三个阶段的切换点：导入行程单 → AI 路书与路线动画 → 透明报价与版本 */
  studioPhase: [s(0.36), s(0.66)],
  importFile: [s(0.03), s(0.08)],
  importScan: [s(0.06), s(0.17)],
  importFields: [s(0.1), s(0.13), s(0.16), s(0.19), s(0.22), s(0.25)],
  confirmCursor: [s(0.25), s(0.3)],
  confirmClick: s(0.32),
  reelDraw: [s(0.39), s(0.6)],
  roadbookCards: [s(0.4), s(0.45), s(0.5)],
  quoteRows: [s(0.67), s(0.75)],
  inquiryIn: [s(0.72), s(0.76)],
  diffRows: [s(0.78), s(0.81), s(0.84)],
  sendCursor: [s(0.85), s(0.91)],
  sendClick: s(0.93),

  /* ── 05 多人共享 · 多端同步 (Collab / Recommend / SyncFinale) ─────── */
  shareCursor: [sh(0.422), sh(0.432)],
  shareClick: sh(0.434),
  shareSheet: [sh(0.434), sh(0.446), sh(0.506), sh(0.518)],
  phoneIn: [sh(0.44), sh(0.454), sh(0.508), sh(0.522)],
  phoneSteps: [sh(0.456), sh(0.472), sh(0.488), sh(0.494)],
  joinAJie: [sh(0.492), sh(0.504)],
  toastAJie: [sh(0.496), sh(0.504), sh(0.528), sh(0.536)],
  joinXiaoyu: [sh(0.512), sh(0.524)],
  toastXiaoyu: [sh(0.516), sh(0.524), sh(0.546), sh(0.554)],
  poolIn: [sh(0.518), sh(0.53)],
  presence: [sh(0.5), sh(0.62)],
  drawer: [sh(0.528), sh(0.542), sh(0.614), sh(0.626)],
  searchType: [sh(0.544), sh(0.56)],
  suggestIn: [sh(0.56), sh(0.566)],
  suggestPick: sh(0.576),
  reasonType: [sh(0.58), sh(0.6)],
  submitClick: sh(0.606),
  cardFly: [sh(0.608), sh(0.622)],
  poolLand: [sh(0.618), sh(0.628)],
  zoomLanzhou: [sh(0.628), sh(0.652)],
  computing: [sh(0.632), sh(0.64), sh(0.656), sh(0.664)],
  backdrop: [sh(0.66), sh(0.672), sh(0.738), sh(0.75)],
  modalIn: [sh(0.664), sh(0.68)],
  shimmer: [sh(0.674), sh(0.692)],
  modalRows: [sh(0.68), sh(0.686), sh(0.692), sh(0.698)],
  score: [sh(0.68), sh(0.7)],
  cursorApply: [sh(0.704), sh(0.722)],
  clickApply: sh(0.726),
  modalOut: [sh(0.738), sh(0.75)],
  insertRow: [sh(0.744), sh(0.758)],
  stamp: sh(0.76),
  poolResolve: sh(0.748),
  poolResolveOut: [sh(0.758), sh(0.768)],
  version: sh(0.754),
  toastSync: [sh(0.744), sh(0.75), sh(0.76), sh(0.766)],
  lensIn: [sh(0.746), sh(0.758)],
  walkDraw: [sh(0.754), sh(0.768)],
  /** 收束：多端同步与支撑能力条 */
  syncStrip: [sh(0.762), sh(0.772)],

  /* ── 支撑能力（不挂载，见 OFFSTAGE） ─────── */
  phoneHandoff: [off(0.78), off(0.798)],
  streamFly: [off(0.798), off(0.81)],
  cockpitIn: [off(0.806), off(0.818)],
  cockpitNav: [off(0.822), off(0.895)],
  heightAlert: [off(0.858), off(0.87), off(0.926), off(0.932)],
  parkEngage: [off(0.895), off(0.91)],
  cockpitOut: [off(0.926), off(0.932)],
} as const;

/** 舞台总滚动高度（相对视口高度的倍数） */
export const STAGE_VH = 1100;
