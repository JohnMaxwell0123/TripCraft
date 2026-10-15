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
  typeInput: [0.015, 0.064],
  send: 0.068,
  userBubble: [0.066, 0.076],
  modelLit: [0.074, 0.086],
  thinking: [0.076, 0.09],
  aiStream: [0.088, 0.132],
  chips: [0.112, 0.122, 0.132, 0.142],
  socraticIn: [0.148, 0.164],
  optionsIn: [0.162, 0.17],
  cursorA: [0.168, 0.182],
  clickA: 0.184,
  lockA: 0.188,
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
  shareCursor: [0.418, 0.43],
  shareClick: 0.432,
  shareSheet: [0.432, 0.446, 0.498, 0.51],
  phoneIn: [0.44, 0.456, 0.498, 0.514],
  phoneSteps: [0.458, 0.47, 0.482, 0.489],
  joinAJie: [0.488, 0.5],
  toastAJie: [0.494, 0.502, 0.53, 0.538],
  joinXiaoyu: [0.512, 0.524],
  toastXiaoyu: [0.518, 0.526, 0.55, 0.558],
  poolIn: [0.52, 0.534],
  presence: [0.5, 0.62],
  drawer: [0.534, 0.55, 0.612, 0.626],
  searchType: [0.552, 0.566],
  suggestIn: [0.566, 0.573],
  suggestPick: 0.577,
  reasonType: [0.582, 0.598],
  submitClick: 0.603,
  cardFly: [0.604, 0.618],
  poolLand: [0.614, 0.624],

  /* ── 04 编排 ─────────────────────────────── */
  zoomLanzhou: [0.626, 0.652],
  computing: [0.632, 0.64, 0.66, 0.668],
  backdrop: [0.664, 0.676, 0.75, 0.766],
  modalIn: [0.668, 0.686],
  shimmer: [0.678, 0.696],
  modalRows: [0.684, 0.69, 0.696, 0.702],
  score: [0.684, 0.704],
  cursorApply: [0.708, 0.734],
  clickApply: 0.74,
  modalOut: [0.75, 0.77],
  insertRow: [0.756, 0.772],
  stamp: 0.772,
  poolResolve: 0.76,
  poolResolveOut: [0.77, 0.782],
  version: 0.775,
  toastSync: [0.776, 0.784, 0.806, 0.814],

  /* ── 04.5 车机座舱智驾 (五幕长镜头) ──────────── */
  // 镜头 1: 副驾手机端一键投车 (Companion Handoff)
  phoneHandoff: [0.775, 0.796],
  streamFly: [0.788, 0.804],

  // 镜头 2: 车载大屏唤醒与日程重排 (Cockpit Awakening & Schedule Reorder)
  cockpitIn: [0.795, 0.818],
  cockpitSchedule: [0.812, 0.828],

  // 镜头 3: 车道级 3D 导航与智驾领航开启 (Autonomous Cruise & NOA)
  cockpitNav: [0.825, 0.87],
  cockpitHud: [0.832, 0.87],

  // 镜头 4: 自驾车型物理规则拦截与智能改道 (Clearance Rule Assertion & Parking)
  heightAlert: [0.865, 0.878, 0.898, 0.908],

  // 镜头 5: 驻车接力与下车步行雷达 (Off-car Handoff to Walk Lens)
  parkEngage: [0.898, 0.916],
  cockpitOut: [0.912, 0.932],
  lensIn: [0.912, 0.926],
  walkDraw: [0.922, 0.942],

  /* ── 05 多端同频 · 全团同行 ─────────────────── */
  syncStart: [0.94, 0.954],
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
