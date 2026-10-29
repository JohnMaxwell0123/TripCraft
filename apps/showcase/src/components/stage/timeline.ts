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
  ['share', 21500],
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
const S = at('share');

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
const SHARE_CLICK = S(15.9);
/** 04 幕：领队在手机上点「加入 D0 晚上」的一刻——涟漪从这里出发 */
const APPLY = S(8.3);

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
  detailScene: [...sceneIn(M(5.4)), ...cover(S(0) + FADE)] as const,
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

  /* ── 04 行程空间 · 共享与同步（Collab / Constellation / ShareRoadbook）─────── */
  /** 分享路书一屏盖住行程空间后，行程空间再隐藏 */
  shareScene: [...sceneIn(S(0)), ...cover(SHARE_CLICK + FADE)] as const,
  /** 打开行程空间：自驾草案与刚飞进来的咨询并排，咨询卡闪一下 */
  planIn: [S(0.4), S(1.2)] as const,
  /** 邀请：只留链接与「复制链接」，加入者的权限写在面板里 */
  inviteCursor: [S(1.3), S(1.65)] as const,
  inviteClick: S(1.75),
  invitePopover: [S(1.75), S(2.05), S(2.7), S(2.95)] as const,
  copyCursor: [S(2.0), S(2.25)] as const,
  copyClick: S(2.35),
  joinAJie: [S(2.95), S(3.25)] as const,
  joinXiaoyu: [S(3.2), S(3.5)] as const,
  joinToast: [S(2.95), S(3.2), S(3.85), S(4.1)] as const,

  /* ── 04 幕 · 全家的每一块屏幕（Constellation，导演版 B）─────── */
  /**
   * 揭幕：看了五十秒的窗口缩成「我的电脑」（手机布局里视窗本身就是「我的手机」），全家的屏幕一块块亮起；
   * 随后镜头推近领队的手机做决定，点下之后拉远看涟漪。两种布局同一套节拍。
   */
  reveal: [S(4.0), S(5.1)] as const,
  /** 阿杰在自己的手机上提名，信物飞到领队的手机 */
  ajieCompose: [S(5.1), S(5.35)] as const,
  ajieTap: S(5.6),
  ajieFlight: [S(5.65), S(6.1)] as const,
  /** 领队的手机收到提名；AI 评估三条代价 */
  heroBanner: [S(6.0), S(6.25)] as const,
  nominationIn: [S(6.2), S(6.5)] as const,
  evalRows: [S(6.7), S(7.0), S(7.3)] as const,
  applyCursor: [S(7.75), S(8.1)] as const,
  applyClick: APPLY,
  /** 涟漪：波前到哪块屏，哪块屏插入 20:00 并翻到 v1.1（各屏的时刻按到手机的距离算，见 Constellation） */
  wave: [APPLY, APPLY + sec(1.0)] as const,
  nominationSheetOut: [S(8.6), S(8.9)] as const,
  /** 时间卡：出发当天；车机屏在它的位置上亮起 */
  timeCard: [S(9.6), S(9.85), S(10.7), S(11.0)] as const,
  carIn: [S(9.8), S(10.3)] as const,
  /** 今天的路线 → 投递到车机导航（领队再点一下，docs/02 Tier 0 深链）→ 车机导航接手；时间卡收起之后才出现 */
  routeSheet: [S(11.0), S(11.3), S(12.9), S(13.2)] as const,
  dispatchCursor: [S(11.45), S(11.8)] as const,
  dispatchClick: S(11.95),
  carFlight: [S(12.0), S(12.55)] as const,
  carRoute: [S(12.55), S(13.35)] as const,
  /** 全景停住，然后回到电脑的窗口 */
  return: [S(14.6), S(15.3)] as const,
  /** 窗口里：提名处理完收成一行，同步列表接上（宽视窗右栏）；手机布局以底部抽屉出现 */
  nominationFold: [S(8.8), S(9.1)] as const,
  syncIn: [S(9.0), S(9.3)] as const,
  syncSheet: [S(13.3), S(13.6)] as const,

  /* ── 04 幕收尾 · 做成可分享的路书（ShareRoadbook，PRD-03 S-C10、docs/09 §9.0） ─────── */
  /** 全家都同步到 v1.1 后，领队点标题栏的「做成可分享的路书」 */
  shareCursor: [S(15.45), S(15.75)] as const,
  shareClick: SHARE_CLICK,
  sharePageScene: [...sceneIn(SHARE_CLICK)] as const,
  /** 卡片先是 App 的默认外观，随后换上按路线生成的皮肤（河西走廊 → 敦煌金） */
  skinWash: [S(16.5), S(16.9)] as const,
  /** 分享到家庭群 → 亲友的手机上打开分享页 */
  postCursor: [S(17.3), S(17.65)] as const,
  postClick: S(17.8),
  visitorIn: [S(17.85), S(18.3)] as const,
  /** 访客点「我也做一份」→ AI 对话的入口（S-C01） */
  makeMineCursor: [S(18.6), S(18.9)] as const,
  makeMineClick: S(19.05),
  chatIn: [S(19.1), S(19.5)] as const,

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

/**
 * 04 幕「全家的每一块屏幕」的舞台镜头（Constellation 的摄影机，对准各台设备的 data-cam）：
 * 揭幕后推近领队的手机看清提名与 AI 评估，点下之后拉远看涟漪；出发当天再推近这部手机点「投递到车机导航」，
 * 镜头跟着信物移到车机，最后拉远停在全景。手机布局里「领队的手机」就是缩进去的视窗，推近后恢复接近原大，字不小于 12px。
 */
const HERO_SHOT = { target: 'dev-hero', zoom: 2, zoomNarrow: 2.2, pad: 6 } as const;
export const STAGE_CAMERA: readonly CameraShot[] = [
  { t: [S(5.85), S(6.4)], ...HERO_SHOT },
  { t: [APPLY + sec(0.05), APPLY + sec(0.65)] },
  { t: [S(10.95), S(11.45)], ...HERO_SHOT },
  { t: [S(12.3), S(12.85)], target: 'dev-car', zoom: 1.8, zoomNarrow: 1.35, pad: 18 },
  { t: [S(13.5), S(14.1)] },
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
  { at: S(0.2), text: '自驾草案和旅行社咨询，并排放在行程空间' },
  { at: S(1.75), text: '家人用一个链接加入' },
  { at: S(4.0), text: '全家每个人的屏幕上，都是这一份行程' },
  { at: S(5.15), text: '阿杰在自己的手机上，提名今晚去夜市' },
  { at: S(6.6), text: 'AI 只算代价，不替大家做决定' },
  { at: APPLY, text: '领队点一下，每一块屏幕同时变成 v1.1' },
  { at: S(11.0), text: '出发当天，今天的路线一键交给车机导航' },
  { at: S(12.55), text: '车高 2.28 米：导航直接开到地面停车场' },
  { at: S(13.7), text: '一份行程，每一块屏幕都是同一个版本' },
  { at: SHARE_CLICK, text: '再一键做成可分享的路书' },
  { at: T.postClick, text: '亲友看完，也能从一句话开始做一份' },
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
  // 静帧取「全家的每一块屏幕」停住的一刻：五块屏都是 v1.1，车机导航已接手今天的路线（2026-10-29 起，原为亲友打开分享页）
  share: { enter: local('share', S(0) + FADE + sec(0.05)), still: local('share', S(14.3)) },
};
