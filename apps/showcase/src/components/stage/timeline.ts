import { buildActs } from './acts';
import { SELF_DRIVE_ROUTE } from '@/data/trip';

/**
 * C 端演示舞台时间轴（全局进度 0 → 1）
 *
 * 只讲旅客的完整使用流（PRD-01 §2，叙事说明见 docs/SHOWCASE-web-design.md §4）：
 *   01 AI 对话与需求画像 → 02 路径 A · AI 规划自驾 → 03 路径 B · 线路筛选与详情 → 04 行程空间 · 共享与同步
 * 旅行社线路工作室是 B 端的另一段舞台（agencyTimeline.ts），不插在这条流程中间。
 *
 * 四幕按时长比例首尾相接（acts.ts），调整节奏只改这里：幕时长改 ACT_ORDER，幕内节拍改 T。
 */

export const ACT_ORDER = [
  ['dialogue', 13000],
  ['drive', 12000],
  ['match', 20000],
  ['share', 17000],
] as const;

export type ActId = (typeof ACT_ORDER)[number][0];

const table = buildActs(ACT_ORDER);
export const ACTS = table.acts;
export const actAt = table.actAt;
/** 秒 → 全局进度跨度 */
export const sec = table.sec;

/** 一屏淡入的时长 */
const FADE = sec(0.35);
/** 被下一屏完全盖住后立即隐藏 */
const cover = (t: number) => [t, t + sec(0.02)] as const;

const d = (t: number) => actAt('dialogue', t);
const r = (t: number) => actAt('drive', t);
const m = (t: number) => actAt('match', t);
const s = (t: number) => actAt('share', t);

/* ── 02 幕路线描绘：D0 停在兰州，逐日推进；敦煌停留两天（D4 莫高窟、D5 鸣沙山）时线头不动 ── */
const arc = (id: string) => SELF_DRIVE_ROUTE.stops.find((x) => x.id === id)?.arc ?? 0;
const DRAW_FROM = r(0.12);
const DRAW_TO = r(0.7);
const HOLD_D0 = 0.05;
const HOLD_DH = 0.12;
const MOVING = 1 - HOLD_D0 - HOLD_DH;
const drawTime = (frac: number) => DRAW_FROM + (DRAW_TO - DRAW_FROM) * frac;
/** 线头到达弧长位置 a 的时刻（敦煌之后要加上停留） */
const reach = (a: number) => drawTime(HOLD_D0 + MOVING * a + (a > arc('dh') ? HOLD_DH : 0));
const T_DH = drawTime(HOLD_D0 + MOVING * arc('dh'));
const T_DH_END = T_DH + (DRAW_TO - DRAW_FROM) * HOLD_DH;

const sceneIn = (at: number) => [at, at + FADE] as const;

/** 关键帧（命名即语义，数值为全局进度） */
export const T = {
  /* ── 01 AI 对话与需求画像（DialogueScene） ─────── */
  dialogueScene: [-1, -0.5, ...cover(r(0) + FADE)] as const,
  modelCursor: [d(0.005), d(0.035)] as const,
  modelMenu: [d(0.04), d(0.065), d(0.15), d(0.175)] as const,
  askType: [d(0.19), d(0.38)] as const,
  askSend: d(0.4),
  askBubble: [d(0.4), d(0.44)] as const,
  followUp: [d(0.47), d(0.52)] as const,
  followUpPick: d(0.58),
  followUpReply: [d(0.59), d(0.63)] as const,
  /** 画像字段依次被提取：同行 · 目的地 · 日期 · 身体 · 出行方式 · 车辆（追问所得）· 预算（推断） */
  profileFields: [d(0.44), d(0.465), d(0.49), d(0.515), d(0.54), d(0.65), d(0.69)] as const,
  profileReady: [d(0.71), d(0.77)] as const,
  pathCursor: [d(0.8), d(0.87)] as const,
  pathClick: d(0.89),

  /* ── 02 路径 A · AI 规划自驾（Workspace） ─────── */
  driveScene: [...sceneIn(r(0)), ...cover(m(0) + FADE)] as const,
  daysIn: [r(0.03), r(0.15)] as const,
  routeDraw: {
    t: [DRAW_FROM, drawTime(HOLD_D0), T_DH, T_DH_END, DRAW_TO],
    v: [0, 0, arc('dh'), arc('dh'), 1],
  },
  /** 当前高亮的日程（D1…D8 的起点）；与线头位置一致 */
  dayAt: [drawTime(HOLD_D0), reach(arc('zy')), reach(arc('jyg')), T_DH, (T_DH + T_DH_END) / 2, T_DH_END, reach(arc('ymg')), reach(arc('yd'))] as const,
  /** 结果页底部「有 5 条相似旅行社线路」→ 进入路径 B（docs/16 §16.5.2） */
  crossHint: [r(0.73), r(0.78)] as const,
  crossCursor: [r(0.82), r(0.87)] as const,
  crossClick: r(0.89),

  /* ── 03 路径 B · 线路筛选与详情（MatchScene / RouteDetail） ─────── */
  filterScene: [...sceneIn(m(0)), ...cover(m(0.64) + FADE)] as const,
  priceBars: [m(0.02), m(0.11)] as const,
  priceRange: [m(0.1), m(0.14)] as const,
  dayBars: [m(0.12), m(0.18)] as const,
  tilesStart: m(0.16),
  tileStep: sec(0.12),
  resultCards: [m(0.2), m(0.235), m(0.27)] as const,
  ringDur: sec(0.8),
  /** 手机：筛选抽屉先打开，点「查看 N 条线路」后收起 */
  drawerTap: m(0.27),
  drawerOut: [m(0.275), m(0.31)] as const,
  mobileCards: [m(0.3), m(0.33)] as const,
  askCursor: [m(0.37), m(0.4)] as const,
  askClick: m(0.41),
  askPopover: [m(0.41), m(0.43), m(0.55), m(0.57)] as const,
  askReply: m(0.45),
  budgetDrag: [m(0.46), m(0.52)] as const,
  widened: m(0.51),
  caption: [m(0.52), m(0.55)] as const,
  pickCursor: [m(0.57), m(0.62)] as const,
  pickClick: m(0.63),
  detailScene: [...sceneIn(m(0.64)), ...cover(s(0) + FADE)] as const,
  optCursor: [m(0.69), m(0.73)] as const,
  optClick: m(0.74),
  estimate: [m(0.74), m(0.78)] as const,
  inquiryCursor: [m(0.79), m(0.82)] as const,
  inquiryClick: m(0.83),
  consent: [m(0.83), m(0.85), m(0.905), m(0.92)] as const,
  sendCursor: [m(0.86), m(0.89)] as const,
  sendClick: m(0.9),
  sentToast: [m(0.92), m(0.95)] as const,

  /* ── 04 行程空间 · 共享与同步（Collab / Recommend / SyncFinale） ─────── */
  shareScene: [...sceneIn(s(0))] as const,
  inviteCursor: [s(0.03), s(0.07)] as const,
  inviteClick: s(0.08),
  invitePopover: [s(0.08), s(0.1), s(0.25), s(0.27)] as const,
  copyCursor: [s(0.15), s(0.19)] as const,
  copyClick: s(0.2),
  joinAJie: [s(0.29), s(0.32)] as const,
  toastAJie: [s(0.29), s(0.31), s(0.37), s(0.39)] as const,
  joinXiaoyu: [s(0.37), s(0.4)] as const,
  toastXiaoyu: [s(0.38), s(0.4), s(0.46), s(0.48)] as const,
  nominationIn: [s(0.48), s(0.52)] as const,
  evalRows: [s(0.54), s(0.57), s(0.6)] as const,
  applyCursor: [s(0.63), s(0.68)] as const,
  applyClick: s(0.7),
  /** 手机：提名以底部抽屉出现，领队确认后收起 */
  nominationSheetOut: [s(0.72), s(0.75)] as const,
  insertRow: [s(0.71), s(0.76)] as const,
  version: s(0.74),
  syncIn: [s(0.78), s(0.81)] as const,
  syncRows: [s(0.82), s(0.86), s(0.9)] as const,

  /* ── 已不挂载的旧场景（ChatScene / CockpitScene / Deliver）仍引用的键，取值在全局进度之外，保持静止 ── */
  ...legacyKeys(),
} as const;

/**
 * 车机座舱与离线交付是支撑能力（PRD-01 §3），旧版的倾诉、座舱、交付三幕已从舞台移除，
 * 组件文件保留未删（是否删除由业主决定）。这些键落在 2 以后，进度到不了。
 */
function legacyKeys() {
  const o = (v: number) => 2 + v;
  return {
    typeInput: [o(0.003), o(0.046)] as const,
    send: o(0.052),
    userBubble: [o(0.05), o(0.056)] as const,
    modelLit: [o(0.05), o(0.062)] as const,
    chips: [o(0.064), o(0.076), o(0.096), o(0.128)] as const,
    clickA: o(0.051),
    chatOut: [o(0.198), o(0.222)] as const,
    streamFly: [o(0.798), o(0.81)] as const,
    cockpitIn: [o(0.806), o(0.818)] as const,
    cockpitNav: [o(0.822), o(0.895)] as const,
    heightAlert: [o(0.858), o(0.87), o(0.926), o(0.932)] as const,
    parkEngage: [o(0.895), o(0.91)] as const,
    cockpitOut: [o(0.926), o(0.932)] as const,
  };
}

/** 每章的手动切入点与静帧（章内局部进度），供 StageShell 使用 */
export const CHAPTER_POINTS: Record<ActId, { enter: number; still: number }> = {
  dialogue: { enter: 0, still: 0.78 },
  drive: { enter: (FADE + sec(0.05)) / (ACTS.drive[1] - ACTS.drive[0]), still: 0.8 },
  match: { enter: (FADE + sec(0.05)) / (ACTS.match[1] - ACTS.match[0]), still: 0.97 },
  share: { enter: (FADE + sec(0.05)) / (ACTS.share[1] - ACTS.share[0]), still: 0.97 },
};
