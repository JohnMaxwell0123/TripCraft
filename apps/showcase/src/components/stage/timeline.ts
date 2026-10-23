import { buildActs } from './acts';
import { SELF_DRIVE_ROUTE } from '@/data/trip';

/**
 * C 端演示舞台时间轴（全局进度 0 → 1）
 *
 * 只讲旅客的完整使用流（PRD-01 §2，叙事说明见 docs/SHOWCASE-web-design.md §4）：
 *   01 AI 对话与需求画像 → 02 路径 A · AI 规划自驾 → 03 路径 B · 线路筛选与详情 → 04 行程空间 · 共享与同步
 * 旅行社线路工作室是 B 端的另一段舞台（agencyTimeline.ts），不插在这条流程中间。
 *
 * 幕与幕之间按因果衔接：每幕最后一下点击，下一幕开头就是它的结果——
 *   01 点「AI 规划自驾路线」→ 02 自驾草案；02 存进行程空间后点「看旅行社线路」（同一份画像）→ 03 已套用画像的筛选页；
 *   03 咨询发出、侧栏「行程空间」出现角标，点它 → 04 行程空间里并排放着自驾草案与这条咨询。
 * 04 幕的终帧是全片的收尾（PRD-03 S-C10）：领队点「做成可分享的路书」→ AI 按路线生成皮肤与分享卡片 → 分享到家庭群 →
 *   亲友点开分享页、点「我也做一份」→ 回到 AI 对话的入口，和 01 幕的开场是同一个画面。
 *
 * 四幕按时长比例首尾相接（acts.ts），调整节奏只改这里：幕时长改 ACT_ORDER，幕内节拍改 T。
 * 04 幕 2026-10-23 由 18 秒加到 20 秒（实际播放约 22 秒）：共享与同步的节拍压缩约 3.5 秒，仍不够放下分享路书的三次点击，
 * 整段 C 端约 76 秒。
 */

export const ACT_ORDER = [
  ['dialogue', 13000],
  ['drive', 14000],
  ['match', 21000],
  ['share', 20000],
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
const DRAW_FROM = r(0.1);
const DRAW_TO = r(0.6);
const HOLD_D0 = 0.05;
const HOLD_DH = 0.12;
const MOVING = 1 - HOLD_D0 - HOLD_DH;
const drawTime = (frac: number) => DRAW_FROM + (DRAW_TO - DRAW_FROM) * frac;
/** 线头到达弧长位置 a 的时刻（敦煌之后要加上停留） */
const reach = (a: number) => drawTime(HOLD_D0 + MOVING * a + (a > arc('dh') ? HOLD_DH : 0));
const T_DH = drawTime(HOLD_D0 + MOVING * arc('dh'));
const T_DH_END = T_DH + (DRAW_TO - DRAW_FROM) * HOLD_DH;

const sceneIn = (at: number) => [at, at + FADE] as const;

/** 04 幕：领队点「做成可分享的路书」的时刻（行程空间一屏在分享路书一屏盖住它之后隐藏） */
const SHARE_CLICK = s(0.695);

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
  daysIn: [r(0.03), r(0.13)] as const,
  routeDraw: {
    t: [DRAW_FROM, drawTime(HOLD_D0), T_DH, T_DH_END, DRAW_TO],
    v: [0, 0, arc('dh'), arc('dh'), 1],
  },
  /** 当前高亮的日程（D1…D8 的起点）；与线头位置一致 */
  dayAt: [drawTime(HOLD_D0), reach(arc('zy')), reach(arc('jyg')), T_DH, (T_DH + T_DH_END) / 2, T_DH_END, reach(arc('ymg')), reach(arc('yd'))] as const,
  /** 草案画完，先存进行程空间「西行计划」（PRD-01 §2：路径 A → 行程空间） */
  saveCursor: [r(0.62), r(0.67)] as const,
  saveClick: r(0.68),
  savedToast: [r(0.685), r(0.71), r(0.79), r(0.81)] as const,
  /** 结果页底部：同一份画像也匹配到旅行社线路（docs/16 §16.5.2）→ 进入路径 B */
  crossHint: [r(0.8), r(0.84)] as const,
  crossCursor: [r(0.89), r(0.94)] as const,
  crossClick: r(0.96),

  /* ── 03 路径 B · 线路筛选与详情（MatchScene / RouteDetail） ─────── */
  filterScene: [...sceneIn(m(0)), ...cover(m(0.61) + FADE)] as const,
  /** 套用画像：预算区间与天数范围着色、来自画像的方块依次选中 */
  priceRange: [m(0.03), m(0.07)] as const,
  dayRange: [m(0.05), m(0.08)] as const,
  tilesStart: m(0.07),
  tileStep: sec(0.18),
  resultCards: [m(0.12), m(0.145), m(0.17)] as const,
  ringDur: sec(0.8),
  /** 手机：筛选抽屉先打开，点「查看 N 条线路」后收起 */
  drawerTap: m(0.24),
  drawerOut: [m(0.245), m(0.28)] as const,
  mobileCards: [m(0.27), m(0.3)] as const,
  askCursor: [m(0.33), m(0.36)] as const,
  askClick: m(0.37),
  askPopover: [m(0.37), m(0.39), m(0.5), m(0.52)] as const,
  askReply: m(0.41),
  budgetDrag: [m(0.42), m(0.47)] as const,
  widened: m(0.46),
  caption: [m(0.47), m(0.5)] as const,
  pickCursor: [m(0.53), m(0.58)] as const,
  pickClick: m(0.6),
  detailScene: [...sceneIn(m(0.61)), ...cover(s(0) + FADE)] as const,
  optCursor: [m(0.65), m(0.69)] as const,
  optClick: m(0.7),
  estimate: [m(0.7), m(0.74)] as const,
  inquiryCursor: [m(0.75), m(0.78)] as const,
  inquiryClick: m(0.79),
  consent: [m(0.79), m(0.81), m(0.865), m(0.88)] as const,
  sendCursor: [m(0.82), m(0.85)] as const,
  sendClick: m(0.86),
  /** 发出后：提示回复会出现在行程空间，侧栏「行程空间」出现角标 → 光标点它进入 04 幕 */
  sentToast: [m(0.88), m(0.9)] as const,
  spaceBadge: [m(0.89), m(0.975)] as const,
  spaceCursor: [m(0.92), m(0.96)] as const,
  spaceClick: m(0.975),

  /* ── 04 行程空间 · 共享与同步（Collab / Recommend / SyncFinale）；幕时长 20 秒，s(0.05) = 1 秒 ─────── */
  /** 分享路书一屏盖住行程空间后，行程空间再隐藏 */
  shareScene: [...sceneIn(s(0)), ...cover(SHARE_CLICK + FADE)] as const,
  /** 打开行程空间：自驾草案与刚发出的咨询并排出现 */
  planIn: [s(0.02), s(0.065)] as const,
  inviteCursor: [s(0.07), s(0.095)] as const,
  inviteClick: s(0.105),
  invitePopover: [s(0.105), s(0.123), s(0.21), s(0.228)] as const,
  copyCursor: [s(0.14), s(0.162)] as const,
  copyClick: s(0.17),
  joinAJie: [s(0.232), s(0.257)] as const,
  toastAJie: [s(0.232), s(0.25), s(0.3), s(0.318)] as const,
  joinXiaoyu: [s(0.27), s(0.295)] as const,
  toastXiaoyu: [s(0.275), s(0.293), s(0.34), s(0.358)] as const,
  nominationIn: [s(0.355), s(0.385)] as const,
  evalRows: [s(0.4), s(0.425), s(0.45)] as const,
  applyCursor: [s(0.47), s(0.5)] as const,
  applyClick: s(0.512),
  /** 手机：提名以底部抽屉出现，领队确认后收起 */
  nominationSheetOut: [s(0.53), s(0.552)] as const,
  insertRow: [s(0.52), s(0.555)] as const,
  version: s(0.54),
  /** 宽视窗：提名处理完收成一行，给同步列表让出位置（右栏放不下整张提名卡 + 三台设备） */
  nominationFold: [s(0.556), s(0.58)] as const,
  syncIn: [s(0.572), s(0.595)] as const,
  syncRows: [s(0.605), s(0.625), s(0.645)] as const,

  /* ── 04 幕收尾 · 做成可分享的路书（ShareRoadbook，PRD-03 S-C10、docs/09 §9.0） ─────── */
  /** 全家都同步到 v1.1 后，领队点标题栏的「做成可分享的路书」 */
  shareCursor: [s(0.66), s(0.685)] as const,
  shareClick: SHARE_CLICK,
  sharePageScene: [...sceneIn(SHARE_CLICK)] as const,
  /** 卡片先是 App 的默认外观，随后换上按路线生成的皮肤（河西走廊 → 敦煌金） */
  skinWash: [s(0.725), s(0.75)] as const,
  /** 分享到家庭群 → 亲友的手机上打开分享页 */
  postCursor: [s(0.82), s(0.845)] as const,
  postClick: s(0.855),
  visitorIn: [s(0.86), s(0.885)] as const,
  /** 访客点「我也做一份」→ AI 对话的入口（S-C01） */
  makeMineCursor: [s(0.895), s(0.918)] as const,
  makeMineClick: s(0.928),
  chatIn: [s(0.932), s(0.952)] as const,

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
  drive: { enter: (FADE + sec(0.05)) / (ACTS.drive[1] - ACTS.drive[0]), still: 0.86 },
  match: { enter: (FADE + sec(0.05)) / (ACTS.match[1] - ACTS.match[0]), still: 0.91 },
  // 静帧取亲友刚打开分享页的一刻：换上皮肤的分享卡片、角标与 AI 标识、「我也做一份」都在画面里（手机宽度也看得到皮肤）
  share: { enter: (FADE + sec(0.05)) / (ACTS.share[1] - ACTS.share[0]), still: 0.89 },
};
