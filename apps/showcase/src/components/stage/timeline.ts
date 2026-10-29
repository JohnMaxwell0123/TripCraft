import { buildActs } from './acts';
import { SELF_DRIVE_ROUTE } from '@/data/trip';
import type { CameraShot } from './camera';
import type { Cue } from './Captions';

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
 * 导演版（2026-10-29，SHOWCASE §4.1「镜头、字幕与飞行」）：虚拟摄影机只推近此刻唯一要看的地方（CAMERA），
 * 视窗下方一行字幕说这一拍的意思（CUES），跨区域的因果用「飞行」交代（ScrollyStage 的 FLIGHTS）。
 * 节奏分三档：过场一拍不到 1 秒，叙事 1–2 秒，高光停住；01–03 幕的关键帧按「幕内第几秒」书写（D / R / M）。
 * 删掉的死时间：开场的模型菜单、规划转圈、筛选页的静止。
 *
 * 四幕按时长比例首尾相接（acts.ts），调整节奏只改这里：幕时长改 ACT_ORDER，幕内节拍改 T。
 */

export const ACT_ORDER = [
  ['dialogue', 10800],
  ['drive', 11000],
  ['match', 11800],
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
const sceneIn = (at: number) => [at, at + FADE] as const;

/** 幕内第 n 秒 → 全局进度 */
const at = (id: ActId) => (n: number) => ACTS[id][0] + sec(n);
const D = at('dialogue');
const R = at('drive');
const M = at('match');
/** 04 幕仍按章内比例书写；幕时长 20 秒，s(0.05) = 1 秒 */
const s = (t: number) => actAt('share', t);

/* ── 01 幕：句子里的短语逐个亮起、飞进需求画像（字句化形），按它们在句子里的先后 ── */
const FLY = sec(0.62);
const PHRASE_TAKEOFF = { date: D(3.35), people: D(3.65), body: D(3.95), nap: D(4.25), sights: D(4.55), mode: D(4.85), height: D(7.05) } as const;
const land = (t: number) => t + FLY;

/* ── 02 幕路线描绘：D0 停在兰州，逐日推进；敦煌停留两天（D4 莫高窟、D5 鸣沙山）时线头不动 ── */
const arc = (id: string) => SELF_DRIVE_ROUTE.stops.find((x) => x.id === id)?.arc ?? 0;
const DRAW_FROM = R(0.9);
const DRAW_TO = R(6.5);
const HOLD_D0 = 0.05;
const HOLD_DH = 0.12;
const MOVING = 1 - HOLD_D0 - HOLD_DH;
const drawTime = (frac: number) => DRAW_FROM + (DRAW_TO - DRAW_FROM) * frac;
/** 线头到达弧长位置 a 的时刻（敦煌之后要加上停留） */
const reach = (a: number) => drawTime(HOLD_D0 + MOVING * a + (a > arc('dh') ? HOLD_DH : 0));
const T_DH = drawTime(HOLD_D0 + MOVING * arc('dh'));
const T_DH_END = T_DH + (DRAW_TO - DRAW_FROM) * HOLD_DH;
/** 途经点旁的标注：线头经过时出现，停一会儿（hold 秒）再淡出 */
const passing = (t: number, hold = 1.25) => [t - sec(0.1), t + sec(0.15), t + sec(hold), t + sec(hold + 0.25)] as const;

/** 04 幕：领队点「做成可分享的路书」的时刻（行程空间一屏在分享路书一屏盖住它之后隐藏） */
const SHARE_CLICK = s(0.695);

/** 关键帧（命名即语义，数值为全局进度） */
export const T = {
  /* ── 01 AI 对话与需求画像（DialogueScene） ─────── */
  dialogueScene: [-1, -0.5, ...cover(R(0) + FADE)] as const,
  askType: [D(0.45), D(2.7)] as const,
  askSend: D(2.9),
  askBubble: [D(2.9), D(3.3)] as const,
  phrase: PHRASE_TAKEOFF,
  phraseFly: FLY,
  followUp: [D(5.65), D(6.1)] as const,
  followUpPick: D(6.5),
  followUpReply: [D(6.6), D(7.0)] as const,
  /** 画像字段依次落位（按落地先后）：日期 · 同行 · 身体 · 必去 · 方式 · 车辆（追问所得）· 预算（推断，没有来源词） */
  profileFields: [
    land(PHRASE_TAKEOFF.date),
    land(PHRASE_TAKEOFF.people),
    land(PHRASE_TAKEOFF.body),
    land(PHRASE_TAKEOFF.sights),
    land(PHRASE_TAKEOFF.mode),
    land(PHRASE_TAKEOFF.height),
    D(8.0),
  ] as const,
  closing: [D(8.05), D(8.6)] as const,
  profileReady: [D(8.7), D(9.2)] as const,
  pathCursor: [D(9.55), D(10.0)] as const,
  pathClick: D(10.15),

  /* ── 02 路径 A · AI 规划自驾（Workspace） ─────── */
  driveScene: [...sceneIn(R(0)), ...cover(M(0) + FADE)] as const,
  daysIn: [R(0.35), R(0.9)] as const,
  /** 地图跟拍：推近兰州 → 跟着线头走 → 画完拉远露出全线 */
  follow: { t: [R(0.25), R(1.1), R(5.9), R(7.0)], v: [0, 1, 1, 0] },
  routeDraw: {
    t: [DRAW_FROM, drawTime(HOLD_D0), T_DH, T_DH_END, DRAW_TO],
    v: [0, 0, arc('dh'), arc('dh'), 1],
  },
  /** 当前高亮的日程（D1…D8 的起点）；与线头位置一致 */
  dayAt: [drawTime(HOLD_D0), reach(arc('zy')), reach(arc('jyg')), T_DH, (T_DH + T_DH_END) / 2, T_DH_END, reach(arc('ymg')), reach(arc('yd'))] as const,
  callouts: {
    wsl: passing(reach(arc('wsl'))),
    // 瓜州到敦煌只有一小段：瓜州的标注先收，敦煌的再出，两张不同时在画面里
    gz: passing(reach(arc('gz')), 0.45),
    dh: [T_DH + sec(0.2), T_DH + sec(0.4), T_DH_END + sec(0.3), T_DH_END + sec(0.55)] as const,
  },
  /** 草案画完，先存进行程空间「西行计划」（PRD-01 §2：路径 A → 行程空间）；路线缩成封面飞进侧栏 */
  saveCursor: [R(7.5), R(7.95)] as const,
  saveClick: R(8.1),
  saveFlight: [R(8.15), R(8.85)] as const,
  tripRowIn: [R(8.75), R(8.95)] as const,
  savedToast: [R(8.2), R(8.5), R(9.6), R(9.9)] as const,
  /** 结果页底部：同一份画像也匹配到旅行社线路（docs/16 §16.5.2）→ 进入路径 B */
  crossHint: [R(8.95), R(9.45)] as const,
  crossCursor: [R(9.75), R(10.2)] as const,
  crossClick: R(10.35),
  /** 91% 的匹配度环从交叉提示飞落成下一屏第一张结果卡的环（匹配剪辑） */
  ringFlight: [R(10.45), M(0.5)] as const,

  /* ── 03 路径 B · 线路筛选与详情（MatchScene / RouteDetail） ─────── */
  filterScene: [...sceneIn(M(0)), ...cover(M(5.4) + FADE)] as const,
  /** 套用画像：预算区间与天数范围着色、来自画像的方块依次选中 */
  priceRange: [M(0.55), M(1.05)] as const,
  dayRange: [M(0.7), M(1.1)] as const,
  tilesStart: M(0.95),
  tileStep: sec(0.15),
  /** 第一张卡随环落地出现，后两张紧跟 */
  resultCards: [M(0.42), M(0.85), M(1.1)] as const,
  ringLand: M(0.5),
  ringDur: sec(0.8),
  /** 手机：筛选抽屉先打开，点「查看 N 条线路」后收起 */
  drawerTap: M(1.55),
  drawerOut: [M(1.6), M(1.95)] as const,
  mobileCards: [M(1.9), M(2.2)] as const,
  askCursor: [M(1.75), M(2.1)] as const,
  askClick: M(2.2),
  /** 浮层说完就收：镜头推近价格分布时，结果数不被它挡住 */
  askPopover: [M(2.2), M(2.45), M(3.35), M(3.6)] as const,
  askReply: M(2.65),
  budgetDrag: [M(3.2), M(4.1)] as const,
  widened: M(3.95),
  caption: [M(4.15), M(4.45)] as const,
  pickCursor: [M(4.75), M(5.15)] as const,
  pickClick: M(5.3),
  detailScene: [...sceneIn(M(5.4)), ...cover(s(0) + FADE)] as const,
  optCursor: [M(6.15), M(6.55)] as const,
  optClick: M(6.7),
  estimate: [M(6.7), M(7.4)] as const,
  inquiryCursor: [M(7.75), M(8.1)] as const,
  inquiryClick: M(8.25),
  consent: [M(8.25), M(8.55), M(9.75), M(10.0)] as const,
  sendCursor: [M(8.95), M(9.35)] as const,
  sendClick: M(9.5),
  /** 发出后：确认面板收成一张卡飞向侧栏「行程空间」，角标随之出现 → 光标点它进入 04 幕 */
  inquiryFlight: [M(9.7), M(10.5)] as const,
  sentToast: [M(9.75), M(10.1)] as const,
  spaceBadge: [M(10.45), M(11.45)] as const,
  spaceCursor: [M(10.75), M(11.2)] as const,
  spaceClick: M(11.45),

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
 * 镜头脚本（camera.ts）：每个镜头 [开始移动, 到位]，到位后停到下一个镜头开始；target 是界面里的 data-cam。
 * 开场贴近对话一侧；发送时拉远，让句子和右侧空着的画像同框；追问的答案（2.28 m）落进画像时推近画像；
 * 点「AI 规划自驾路线」后回到全景（地图自己跟拍，见 T.follow）；筛选页在「可以到 8000」时贴近价格分布与结果数；
 * 详情页依次贴近可调选项与预估价、咨询按钮、发送前的确认面板；发出后拉回全景，看咨询飞进「行程空间」。
 * 手机布局已经是特写，镜头不推近（camera.ts 的 zoomNarrow 默认 1）。
 */
export const CAMERA: readonly CameraShot[] = [
  { t: [-1, -0.99], target: ['chat-opener', 'composer'], zoom: 1.45, pad: 16 },
  { t: [D(2.85), D(3.45)] },
  { t: [D(6.95), D(7.6)], target: ['field-vehicle', 'field-budget', 'path-buttons'], zoom: 1.3 },
  // 点了「AI 规划自驾路线」：AI 规划的那半秒里拉回全景，地图在全景里出现，再由地图自己跟拍
  { t: [D(10.2), D(10.75)] },
  { t: [M(2.75), M(3.25)], target: ['price-filter', 'results-count'], zoom: 1.5 },
  { t: [M(4.5), M(5.05)] },
  { t: [M(5.9), M(6.45)], target: ['price-adjust', 'price-estimate'], zoom: 1.45 },
  { t: [M(7.4), M(7.9)], target: ['price-estimate', 'inquiry-btn'], zoom: 1.45 },
  { t: [M(8.3), M(8.8)], target: 'consent-sheet', zoom: 1.3 },
  { t: [M(9.55), M(10.15)] },
];

/** 字幕：一拍一句大白话（Captions.tsx）；不超过 22 个字，手机上最多两行 */
export const CUES: readonly Cue[] = [
  { at: 0, text: '像聊天一样，把这趟旅行说出来' },
  { at: D(3.0), text: 'AI 从这段话里，一项一项整理出需求画像' },
  { at: D(5.65), text: '只追问一个问题：车有多高？' },
  { at: D(7.9), text: '预算是推断出来的，单独标出，等你确认' },
  { at: D(9.0), text: '画像好了：自驾和旅行社线路，都从它出发' },
  { at: R(0.2), text: '按这份画像，AI 把九天自驾路线画出来' },
  { at: R(2.3), text: '每一天都照着画像排：车上过垭口，按时午休' },
  { at: R(7.0), text: '1,980 km 的草案，存进全家的行程空间' },
  { at: R(9.0), text: '同一份画像，也匹配到 23 条旅行社线路' },
  { at: M(0.3), text: '画像直接变成筛选条件，线路按匹配度排好' },
  { at: M(2.2), text: '说一句「预算可以到 8000」，筛选跟着变' },
  { at: M(5.6), text: '打开一个选项，预估价当场更新' },
  { at: M(8.3), text: '发给旅行社之前，自己勾选要发出的信息' },
  { at: M(9.8), text: '咨询发出，回复会出现在行程空间' },
  { at: s(0.01), text: '自驾草案和旅行社咨询，并排放在行程空间' },
  { at: s(0.105), text: '家人用一个链接加入' },
  { at: s(0.355), text: '阿杰提名一个地点，AI 只算代价，不替大家决定' },
  { at: s(0.512), text: '领队确认，全家的设备同步到 v1.1' },
  { at: s(0.695), text: '再一键做成可分享的路书' },
  { at: s(0.855), text: '亲友看完，也能从一句话开始做一份' },
];

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
const local = (id: ActId, t: number) => (t - ACTS[id][0]) / (ACTS[id][1] - ACTS[id][0]);
export const CHAPTER_POINTS: Record<ActId, { enter: number; still: number }> = {
  // 静帧：画像七项齐全、两条路径的入口都在
  dialogue: { enter: 0, still: local('dialogue', D(9.4)) },
  // 静帧：全线画完、交叉提示已出现
  drive: { enter: local('drive', R(0) + FADE + sec(0.05)), still: local('drive', R(9.6)) },
  // 静帧：咨询已发出、侧栏「行程空间」出现角标
  match: { enter: local('match', M(0) + FADE + sec(0.05)), still: local('match', M(10.9)) },
  // 静帧取亲友刚打开分享页的一刻：换上皮肤的分享卡片、角标与 AI 标识、「我也做一份」都在画面里（手机宽度也看得到皮肤）
  share: { enter: (FADE + sec(0.05)) / (ACTS.share[1] - ACTS.share[0]), still: 0.89 },
};
