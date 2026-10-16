/**
 * Scrollytelling 主舞台时间轴（全局 scrollProgress 0 → 1）
 *
 * 所有场景共用这一份关键帧表，调整节奏只改这里。
 * 章节划分扩展自 docs/SHOWCASE-web-design.md §4（四阶段 + 交付收束）。
 */

export interface Chapter {
  id: 'tell' | 'generate' | 'share' | 'plan' | 'deliver';
  no: string;
  label: string;
  start: number;
  end: number;
  eyebrow: string;
  title: string;
  desc: string;
}

export const CHAPTERS: Chapter[] = [
  {
    id: 'tell',
    no: '01',
    label: '倾诉',
    start: 0,
    end: 0.2,
    eyebrow: '01 · 倾诉',
    title: '把心里那趟旅行，说给懂行的人听',
    desc: '不用填表。说出家人、车辆和在意的事，AI 老定制师会追问你没想到的细节。',
  },
  {
    id: 'generate',
    no: '02',
    label: '生成',
    start: 0.2,
    end: 0.42,
    eyebrow: '02 · 生成',
    title: '一段话，长成一本看得见的路书',
    desc: '九天日程、地图航线、海拔起伏、7座MPV通行性，几秒钟里依次就位。',
  },
  {
    id: 'share',
    no: '03',
    label: '共创',
    start: 0.42,
    end: 0.62,
    eyebrow: '03 · 共创',
    title: '旅行是大家的，路书也是',
    desc: '微信扫码免登秒入，多人实时同频。想去的景点、想吃的美食，全团一起投票讨论，丢进愿望池。',
  },
  {
    id: 'plan',
    no: '04',
    label: '编排',
    start: 0.62,
    end: 0.78,
    eyebrow: '04 · 编排',
    title: '每添一处心愿，路线自己重新想一遍',
    desc: '调度算法毫秒级评估顺路度与代价，给出推荐，由领队一键确认即全团同步。',
  },
  {
    id: 'deliver',
    no: '05',
    label: '同行',
    start: 0.78,
    end: 1,
    eyebrow: '05 · 车路云协同',
    title: '多端同频 · 全团同行',
    desc: '桌面掌控全局，副驾手机实时同频，座舱中控秒级流转巡航与限高避险。线上云端协同，无人区无感保活守护。',
  },
];

/** 关键帧（命名即语义，数值为全局进度） */
export const T = {
  windowIn: [0, 0.02],

  /* ── 01 倾诉 ─────────────────────────────── */
  typeInput: [0.003, 0.050],
  send: 0.052,
  userBubble: [0.003, 0.050],
  modelLit: [0.050, 0.062],
  thinking: [0.052, 0.066],
  aiStream: [0.056, 0.142],
  chips: [0.064, 0.076, 0.096, 0.128],
  socraticIn: [0.148, 0.164],
  optionsIn: [0.162, 0.17],
  cursorA: [0.048, 0.054],
  clickA: 0.052,
  lockA: 0.055,
  chatOut: [0.198, 0.222],

  /* ── 02 生成 ─────────────────────────────── */
  sidebarIn: [0.20, 0.22],
  timelineIn: [0.205, 0.22],
  dayCardsStart: 0.22,
  dayCardStep: 0.0058,
  dayCardDur: 0.012,
  mapIn: [0.205, 0.22],
  camera: [0.225, 0.29],
  routeDraw: [0.235, 0.362],
  elevIn: [0.30, 0.33],
  elevDraw: [0.32, 0.38],
  badges: [0.35, 0.365, 0.38, 0.395],

  /* ── 03 共创 ─────────────────────────────── */
  shareCursor: [0.422, 0.432],
  shareClick: 0.434,
  shareSheet: [0.434, 0.446, 0.506, 0.518],
  phoneIn: [0.44, 0.454, 0.508, 0.522],
  phoneSteps: [0.456, 0.472, 0.488, 0.494],
  joinAJie: [0.492, 0.504],
  toastAJie: [0.496, 0.504, 0.528, 0.536],
  joinXiaoyu: [0.512, 0.524],
  toastXiaoyu: [0.516, 0.524, 0.546, 0.554],
  poolIn: [0.518, 0.53],
  presence: [0.5, 0.62],
  drawer: [0.528, 0.542, 0.614, 0.626],
  searchType: [0.544, 0.56],
  suggestIn: [0.56, 0.566],
  suggestPick: 0.576,
  reasonType: [0.58, 0.6],
  submitClick: 0.606,
  cardFly: [0.608, 0.622],
  poolLand: [0.618, 0.628],

  /* ── 04 编排 ─────────────────────────────── */
  zoomLanzhou: [0.628, 0.652],
  computing: [0.632, 0.64, 0.656, 0.664],
  backdrop: [0.66, 0.672, 0.738, 0.75],
  modalIn: [0.664, 0.68],
  shimmer: [0.674, 0.692],
  modalRows: [0.68, 0.686, 0.692, 0.698],
  score: [0.68, 0.7],
  cursorApply: [0.704, 0.722],
  clickApply: 0.726,
  modalOut: [0.738, 0.75],
  insertRow: [0.744, 0.758],
  stamp: 0.76,
  poolResolve: 0.748,
  poolResolveOut: [0.758, 0.768],
  version: 0.754,
  toastSync: [0.744, 0.75, 0.76, 0.766],
  lensIn: [0.746, 0.758],
  walkDraw: [0.754, 0.768],

  /* ── 04.5 车机座舱智驾 (五幕长镜头) ──────────── */
  // 镜头 1: 副驾手机端一键投车 (Companion Handoff)
  phoneHandoff: [0.78, 0.798],
  streamFly: [0.798, 0.81],

  // 镜头 2: 车载大屏唤醒与日程重排 (Cockpit Awakening & Schedule Reorder)
  cockpitIn: [0.806, 0.818],
  cockpitSchedule: [0.816, 0.834],

  // 镜头 3: 车道级 3D 导航与智驾领航开启 (Autonomous Cruise & NOA)
  cockpitNav: [0.822, 0.895],
  cockpitHud: [0.826, 0.895],

  // 镜头 4: 自驾车型物理规则拦截与智能改道 (Clearance Rule Assertion & Parking)
  heightAlert: [0.858, 0.87, 0.926, 0.932],

  // 镜头 5: 驻车接力 (Full Cockpit Stay till end of Tab 04)
  parkEngage: [0.895, 0.91],
  cockpitOut: [0.926, 0.932],

  /* ── 05 多端同频 · 全团同行 ─────────────────── */
  syncStart: [0.93, 0.944],
  devicesIn: [0.946, 0.966],
  streamSync: [0.962, 0.982],
  deviceDetail: [0.975, 0.99],
  tagline: [0.985, 1.0],

  // 兼容别名与平滑过渡：工作台作为母体保持清晰可见，不再提前隐藏
  windowOut: [0.999, 1.0],
  fileIn: [0.946, 0.966],
  compileSteps: [0.962, 0.97, 0.978, 0.986],
  fileUp: [0.98, 0.992],
  devices: [0.946, 0.966],
} as const;

/** 舞台总滚动高度（相对视口高度的倍数） */
export const STAGE_VH = 1100;
