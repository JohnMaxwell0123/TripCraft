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
    desc: '微信扫码即加入，无需注册。想去的景点、想吃的店，朋友们一起丢进愿望池。',
  },
  {
    id: 'plan',
    no: '04',
    label: '编排',
    start: 0.62,
    end: 0.84,
    eyebrow: '04 · 编排',
    title: '每添一处心愿，路线自己重新想一遍',
    desc: '浏览器本地即时评估顺路度与代价，给出建议，由你一键决定。',
  },
  {
    id: 'deliver',
    no: '05',
    label: '同行',
    start: 0.84,
    end: 1,
    eyebrow: '05 · 多端同频',
    title: '多端同频 · 全团同行',
    desc: '桌面工作台掌控全局，副驾手机实时同步最新行程，座舱车机流转巡航提示与限高避险。线上实时协同，离线从容兜底。',
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
  sidebarIn: [0.21, 0.236],
  timelineIn: [0.218, 0.24],
  dayCardsStart: 0.234,
  dayCardStep: 0.0058,
  dayCardDur: 0.012,
  mapIn: [0.224, 0.25],
  camera: [0.236, 0.3],
  routeDraw: [0.29, 0.362],
  elevIn: [0.352, 0.372],
  elevDraw: [0.36, 0.392],
  badges: [0.384, 0.394, 0.404],

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
  modalOut: [0.75, 0.772],
  insertRow: [0.764, 0.782],
  stamp: 0.782,
  poolResolve: 0.77,
  poolResolveOut: [0.79, 0.802],
  lensIn: [0.772, 0.788],
  walkDraw: [0.788, 0.812],
  version: 0.8,
  toastSync: [0.804, 0.812, 0.838, 0.846],

  /* ── 05 多端同频 · 全团同行 ─────────────────── */
  syncStart: [0.842, 0.862],
  devicesIn: [0.852, 0.884],
  streamSync: [0.884, 0.918],
  deviceDetail: [0.918, 0.958],
  tagline: [0.958, 0.988],

  // 兼容别名与平滑过渡：工作台作为母体保持清晰可见，不再提前隐藏
  windowOut: [0.999, 1.0],
  fileIn: [0.852, 0.884],
  compileSteps: [0.886, 0.894, 0.902, 0.91],
  fileUp: [0.914, 0.934],
  devices: [0.852, 0.884],
} as const;

/** 舞台总滚动高度（相对视口高度的倍数） */
export const STAGE_VH = 1100;
