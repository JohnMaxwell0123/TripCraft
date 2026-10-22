/**
 * 演示数据 · 西行计划（河西走廊 9 天，7座豪华 MPV 自驾）
 *
 * 地理坐标取自 examples/dunhuang-silkroad-9d/trip.json 与公开地理数据，
 * 经等距圆柱投影（纬度余弦校正）映射到 SVG viewBox 1000×640。
 * 本文件为「展示用快照」，非 DSL 真相源；真实路书以 spec/trip.schema.json 为准。
 */

export const MAP_W = 1000;
export const MAP_H = 640;

const LON0 = 92.6;
const LON1 = 104.4;
const LAT1 = 41.0;
const PX_PER_LON = 920 / (LON1 - LON0);
const PX_PER_LAT = 100;

export function project(lon: number, lat: number): [number, number] {
  return [40 + (lon - LON0) * PX_PER_LON, 40 + (LAT1 - lat) * PX_PER_LAT];
}

/* -------------------------------------------------------------------------- */
/*  日程                                                                         */
/* -------------------------------------------------------------------------- */

/** 地点类别（与界面的类别配色、图形一一对应，见 stage/ui.tsx） */
export type PlaceCategory = 'sight' | 'nature' | 'food' | 'stay' | 'transport' | 'service';

/** 日程标签的图形：这一天怎样照顾到需求画像 */
export type DayTagIcon = 'parking' | 'mountain' | 'bus' | 'sunset' | 'coffee' | 'accessible' | 'moon' | 'plane';

export interface DayPlan {
  tag: string;
  date: string;
  title: string;
  /** 这一天怎样照顾到需求画像（午休、台阶、车高、日落） */
  meta: string;
  /** 当天车程；不开车的日子留空 */
  drive?: string;
  /** 当天车程里程 */
  km?: number;
  /** 当天主要地点的类别 */
  cat: PlaceCategory;
  /** meta 拆成带图形的标签 */
  tags: { icon: DayTagIcon; text: string }[];
}

/** 路径 A 的自驾草案（全家 5 口 · 腾势 D9 带车顶箱，总高 2.28 m） */
export const DAYS: DayPlan[] = [
  { tag: 'D0', date: '09/24', title: '兰州 · 落地取车', meta: '酒店地面车位 · 避开 2.0 m 限高地库', cat: 'transport', tags: [{ icon: 'parking', text: '地面车位 · 避开 2.0 m 限高' }] },
  { tag: 'D1', date: '09/25', title: '兰州 → 张掖', meta: '翻越乌鞘岭 · 车上通过最高点', drive: '6 h', km: 505, cat: 'nature', tags: [{ icon: 'mountain', text: '乌鞘岭 · 车上通过最高点' }] },
  { tag: 'D2', date: '09/26', title: '七彩丹霞 → 嘉峪关', meta: '景区环保车 · 17:40 看丹霞', drive: '3 h', km: 225, cat: 'nature', tags: [{ icon: 'sunset', text: '17:40 看丹霞' }, { icon: 'bus', text: '景区环保车' }] },
  { tag: 'D3', date: '09/27', title: '嘉峪关 → 敦煌', meta: '13:00 瓜州服务区午休', drive: '4.5 h', km: 383, cat: 'service', tags: [{ icon: 'coffee', text: '13:00 瓜州服务区午休' }] },
  { tag: 'D4', date: '09/28', title: '莫高窟', meta: '无障碍接驳 · 只看平层窟', cat: 'sight', tags: [{ icon: 'accessible', text: '无障碍接驳 · 只看平层窟' }] },
  { tag: 'D5', date: '09/29', title: '鸣沙山 · 月牙泉', meta: '电瓶车上山 · 19:30 日落', cat: 'nature', tags: [{ icon: 'sunset', text: '19:30 日落' }, { icon: 'bus', text: '电瓶车上山' }] },
  { tag: 'D6', date: '09/30', title: '阳关 · 玉门关', meta: '午后回酒店休息', drive: '2.5 h', km: 220, cat: 'sight', tags: [{ icon: 'moon', text: '午后回酒店休息' }] },
  { tag: 'D7', date: '10/01', title: '雅丹', meta: '日落后原路返回，不夜行', drive: '3 h', km: 360, cat: 'nature', tags: [{ icon: 'sunset', text: '日落后返回 · 不夜行' }] },
  { tag: 'D8', date: '10/02', title: '敦煌还车 · 返程', meta: '11:20 航班', cat: 'transport', tags: [{ icon: 'plane', text: '11:20 航班' }] },
];

/* -------------------------------------------------------------------------- */
/*  行程封面：同一套「路线图形」画法，换任何目的地都成立（stage/RouteGlyph.tsx）    */
/* -------------------------------------------------------------------------- */

/** 封面渐变：一组与目的地无关的配色，按行程分配，不按地貌取色 */
export const COVER_PALETTES = {
  indigo: ['#4F46E5', '#8B5CF6'],
  ocean: ['#0F766E', '#2563EB'],
  berry: ['#BE185D', '#7C3AED'],
  sky: ['#0369A1', '#38BDF8'],
  emerald: ['#047857', '#0EA5A4'],
  plum: ['#6D28D9', '#DB2777'],
  slate: ['#334155', '#64748B'],
} as const;

export type CoverPalette = keyof typeof COVER_PALETTES;

export interface TripSummary {
  id: string;
  name: string;
  sub: string;
  palette: CoverPalette;
  /** 路线形状：途经点经纬度 */
  shape: ReadonlyArray<readonly [number, number]>;
}

/** 示例行程「西行计划」（河西走廊）与账号里其他目的地的行程——界面换了目的地照样成立 */
export const TRIPS: TripSummary[] = [
  {
    id: 'xixing',
    name: '西行计划',
    sub: '河西走廊 · 9 天',
    palette: 'indigo',
    shape: [[103.82, 36.06], [102.87, 37.2], [102.64, 37.93], [100.45, 38.93], [98.29, 39.77], [95.78, 40.52], [94.72, 40.1], [93.86, 40.35], [93.08, 40.55]],
  },
  {
    id: 'chuanxi',
    name: '川西 · 稻城亚丁',
    sub: '草稿 · 7 天',
    palette: 'ocean',
    shape: [[104.07, 30.67], [103.0, 29.98], [101.96, 30.05], [101.49, 30.07], [100.27, 29.99], [100.3, 29.04], [100.36, 28.43]],
  },
  {
    id: 'kyoto',
    name: '京都 · 赏枫',
    sub: '2025 · 5 天',
    palette: 'berry',
    shape: [[135.758, 34.985], [135.772, 34.967], [135.785, 34.995], [135.798, 35.027], [135.729, 35.039], [135.672, 35.009], [135.758, 34.985]],
  },
];

/** 路径 B 的旅行社线路封面（与 TRIPS 同一套画法；示例数据） */
export const LISTING_COVERS: Record<'elder' | 'charter' | 'family' | 'qinghai', TripSummary> = {
  elder: {
    id: 'elder',
    name: '河西走廊 9 日 · 长辈友好私家团',
    sub: '敦煌某国际旅行社',
    palette: 'sky',
    shape: [[103.82, 36.06], [102.87, 37.2], [102.64, 37.93], [100.45, 38.93], [100.0, 38.92], [98.29, 39.77], [95.78, 40.52], [94.72, 40.1], [93.08, 40.55], [94.8, 40.2]],
  },
  charter: {
    id: 'charter',
    name: '敦煌 · 张掖 8 日 · 包车带司机',
    sub: '张掖某旅行社',
    palette: 'emerald',
    shape: [[100.45, 38.93], [100.0, 38.92], [98.29, 39.77], [95.78, 40.52], [94.72, 40.1], [93.86, 40.35], [94.8, 40.2]],
  },
  family: {
    id: 'family',
    name: '河西走廊 10 日 · 亲子慢游小团',
    sub: '兰州某旅行社',
    palette: 'plum',
    shape: [[103.82, 36.06], [102.64, 37.93], [100.45, 38.93], [98.29, 39.77], [94.72, 40.1], [94.06, 39.93], [94.8, 40.2]],
  },
  qinghai: {
    id: 'qinghai',
    name: '河西 + 青海湖 11 日',
    sub: '西宁某旅行社',
    palette: 'slate',
    shape: [[101.78, 36.62], [100.2, 36.75], [99.1, 37.2], [100.25, 38.18], [100.45, 38.93], [98.29, 39.77], [94.72, 40.1]],
  },
};

/* -------------------------------------------------------------------------- */
/*  路线节点                                                                     */
/* -------------------------------------------------------------------------- */

export interface RouteStop {
  id: string;
  name: string;
  sub?: string;
  day: string;
  lon: number;
  lat: number;
  elev: number;
  /** 地图上是否绘制图钉（途经垭口仅绘制小三角） */
  kind: 'city' | 'sight' | 'pass' | 'via';
  labelSide?: 'left' | 'right' | 'top' | 'bottom';
  /** 地图图钉的类别（城市与途经点不画图钉，只画圆点） */
  cat?: PlaceCategory;
}

export const STOPS: RouteStop[] = [
  { id: 'lz', name: '兰州', sub: '中川机场集结', day: 'D0', lon: 103.82, lat: 36.06, elev: 1520, kind: 'city', labelSide: 'left' },
  { id: 'wsl', name: '乌鞘岭', sub: '2980m 特长隧道', day: 'D1', lon: 102.87, lat: 37.2, elev: 2980, kind: 'pass', labelSide: 'left', cat: 'nature' },
  { id: 'ww', name: '武威', sub: '天马故乡', day: 'D1', lon: 102.64, lat: 37.93, elev: 1530, kind: 'via', labelSide: 'right' },
  { id: 'zy', name: '张掖', sub: '甘州府', day: 'D1', lon: 100.45, lat: 38.93, elev: 1480, kind: 'city', labelSide: 'right' },
  { id: 'dx', name: '七彩丹霞', sub: '17:40 晚霞机位', day: 'D2', lon: 100.0, lat: 38.92, elev: 1750, kind: 'sight', labelSide: 'bottom', cat: 'nature' },
  { id: 'jyg', name: '嘉峪关', sub: '天下第一雄关', day: 'D2', lon: 98.29, lat: 39.77, elev: 1700, kind: 'city', labelSide: 'bottom', cat: 'sight' },
  { id: 'gz', name: '瓜州', sub: '服务区午休', day: 'D3', lon: 95.78, lat: 40.52, elev: 1180, kind: 'via', labelSide: 'top', cat: 'service' },
  { id: 'dh', name: '敦煌', sub: '莫高窟 · 鸣沙山', day: 'D3–D5', lon: 94.72, lat: 40.1, elev: 1140, kind: 'city', labelSide: 'bottom' },
  { id: 'yg', name: '阳关', sub: '丝路南道故址', day: 'D6', lon: 94.06, lat: 39.93, elev: 1250, kind: 'sight', labelSide: 'bottom', cat: 'sight' },
  { id: 'ymg', name: '玉门关', sub: '汉长城遗址', day: 'D6', lon: 93.86, lat: 40.35, elev: 1050, kind: 'sight', labelSide: 'right', cat: 'sight' },
  { id: 'yd', name: '雅丹', sub: '魔鬼城星空', day: 'D7', lon: 93.08, lat: 40.55, elev: 930, kind: 'sight', labelSide: 'top', cat: 'nature' },
  { id: 'dh2', name: '敦煌', day: 'D8', lon: 94.8, lat: 40.2, elev: 1140, kind: 'via' },
];

export interface ProjectedStop extends RouteStop {
  x: number;
  y: number;
  /** 沿路线累计长度占比（0~1），用于「路线画到这里时图钉落地」 */
  at: number;
}

function buildProjected(): ProjectedStop[] {
  const pts = STOPS.map((s) => {
    const [x, y] = project(s.lon, s.lat);
    return { ...s, x, y, at: 0 };
  });
  let total = 0;
  const cum: number[] = [0];
  for (let i = 1; i < pts.length; i++) {
    total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    cum.push(total);
  }
  return pts.map((p, i) => ({ ...p, at: cum[i] / total }));
}

export const PROJECTED: ProjectedStop[] = buildProjected();

/** Catmull-Rom → 三次贝塞尔，生成平滑路线 */
export function smoothPath(points: ReadonlyArray<readonly [number, number]>, tension = 0.5): string {
  if (points.length < 2) return '';
  const p = points;
  let d = `M ${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

export const ROUTE_D = smoothPath(PROJECTED.map((s) => [s.x, s.y] as const));

export interface Point2D {
  x: number;
  y: number;
}

/** 预计算三次贝塞尔路线的均匀弧长查表矩阵（256采样），0 运行时 DOM 几何读取 */
export function buildRouteLUT(samples = 256, points: ReadonlyArray<readonly [number, number]> = PROJECTED.map((s) => [s.x, s.y] as const)): Point2D[] {
  if (points.length < 2) return [];
  const tension = 0.5;

  interface Segment {
    p1: readonly [number, number];
    c1: [number, number];
    c2: [number, number];
    p2: readonly [number, number];
  }

  const segments: Segment[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    segments.push({ p1, c1: [c1x, c1y], c2: [c2x, c2y], p2 });
  }

  const densePoints: Point2D[] = [];
  const denseLengths: number[] = [0];
  let totalLength = 0;
  const STEPS_PER_SEG = 32;

  for (const seg of segments) {
    for (let s = 0; s <= STEPS_PER_SEG; s++) {
      if (s === 0 && densePoints.length > 0) continue;
      const u = s / STEPS_PER_SEG;
      const u1 = 1 - u;
      const x =
        u1 * u1 * u1 * seg.p1[0] +
        3 * u1 * u1 * u * seg.c1[0] +
        3 * u1 * u * u * seg.c2[0] +
        u * u * u * seg.p2[0];
      const y =
        u1 * u1 * u1 * seg.p1[1] +
        3 * u1 * u1 * u * seg.c1[1] +
        3 * u1 * u * u * seg.c2[1] +
        u * u * u * seg.p2[1];
      const pt: Point2D = { x, y };
      if (densePoints.length > 0) {
        const prev = densePoints[densePoints.length - 1];
        totalLength += Math.hypot(x - prev.x, y - prev.y);
        denseLengths.push(totalLength);
      }
      densePoints.push(pt);
    }
  }

  const lut: Point2D[] = [];
  for (let i = 0; i < samples; i++) {
    const targetDist = (i / (samples - 1)) * totalLength;
    let low = 0;
    let high = denseLengths.length - 1;
    while (low < high - 1) {
      const mid = (low + high) >> 1;
      if (denseLengths[mid] <= targetDist) low = mid;
      else high = mid;
    }
    const d0 = denseLengths[low];
    const d1 = denseLengths[high];
    const span = d1 - d0 || 1;
    const frac = (targetDist - d0) / span;
    const pt0 = densePoints[low];
    const pt1 = densePoints[high];
    lut.push({
      x: Number((pt0.x + (pt1.x - pt0.x) * frac).toFixed(1)),
      y: Number((pt0.y + (pt1.y - pt0.y) * frac).toFixed(1)),
    });
  }
  return lut;
}

export const ROUTE_LUT: ReadonlyArray<Point2D> = buildRouteLUT(256);

/* -------------------------------------------------------------------------- */
/*  一条路线 = 若干节点：路径、弧长查表与每个节点在弧长上的位置                    */
/* -------------------------------------------------------------------------- */

export interface RouteGeometry {
  stops: ReadonlyArray<ProjectedStop & { arc: number }>;
  d: string;
  lut: ReadonlyArray<Point2D>;
}

/**
 * 按节点 id 组装一条路线。arc 是节点在曲线弧长上的位置（0~1）：
 * 路线用 pathLength 按弧长描绘，节点按 arc 落地，图钉与线头严丝合缝。
 */
export function routeFor(ids: readonly string[]): RouteGeometry {
  const picked = ids.map((id) => {
    const s = PROJECTED.find((p) => p.id === id);
    if (!s) throw new Error(`未知节点：${id}`);
    return s;
  });
  const points = picked.map((s) => [s.x, s.y] as const);
  const lut = buildRouteLUT(256, points);
  let from = 0;
  const stops = picked.map((s) => {
    // Catmull-Rom 曲线穿过每个节点：沿查表向前找最近的采样点即为该节点的弧长位置
    let best = from;
    let bestDist = Infinity;
    for (let i = from; i < lut.length; i++) {
      const dist = Math.hypot(lut[i].x - s.x, lut[i].y - s.y);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    }
    from = best;
    return { ...s, arc: best / (lut.length - 1) };
  });
  return { stops, d: smoothPath(points), lut };
}

/** 弧长查表上取点（t ∈ 0~1） */
export function pointOnRoute(lut: ReadonlyArray<Point2D>, t: number): Point2D {
  const idx = Math.max(0, Math.min(1, t)) * (lut.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, lut.length - 1);
  const f = idx - i0;
  return { x: lut[i0].x + (lut[i1].x - lut[i0].x) * f, y: lut[i0].y + (lut[i1].y - lut[i0].y) * f };
}

/** 路径 A：AI 规划的自驾路线（含阳关、玉门关、雅丹） */
export const SELF_DRIVE_ROUTE = routeFor(STOPS.map((s) => s.id));

/** 旅行社线路「河西走廊 9 日 · 长辈友好私家团」（阳关、玉门关是可加购的一天） */
export const AGENCY_ROUTE = routeFor(['lz', 'wsl', 'ww', 'zy', 'dx', 'jyg', 'gz', 'dh', 'yd', 'dh2']);

/** 地图视框：收拢全部路线节点并留出标签边距 */
export const MAP_VIEW = { x: 10, y: 20, w: 960, h: 560 } as const;

/* -------------------------------------------------------------------------- */
/*  地形意象（手绘近似，非测绘数据）                                              */
/* -------------------------------------------------------------------------- */

export const TERRAIN = {
  qilian: smoothPath(
    [
      [940, 640], [880, 560], [800, 470], [712, 392], [610, 318], [498, 252], [380, 214], [262, 206],
      [150, 222], [70, 262], [60, 330], [160, 352], [300, 346], [446, 372], [590, 440], [700, 530], [770, 640],
    ],
    0.45,
  ) + ' Z',
  qilianRidges: [
    smoothPath([[130, 260], [260, 238], [390, 250], [520, 290], [640, 350], [740, 430], [830, 540]], 0.5),
    smoothPath([[110, 300], [240, 288], [380, 300], [510, 335], [620, 400], [720, 490]], 0.5),
  ],
  badain: smoothPath([[560, 70], [720, 48], [900, 52], [962, 140], [930, 250], [820, 262], [700, 214], [600, 160], [560, 70]], 0.5),
  tengger: smoothPath([[880, 300], [970, 286], [988, 380], [940, 430], [880, 400], [870, 340], [880, 300]], 0.5),
  kumtag: smoothPath([[30, 160], [120, 168], [176, 196], [150, 252], [60, 268], [30, 230], [30, 160]], 0.5),
  yellowRiver: 'M 780 640 C 840 590, 880 560, 915 540 S 960 500, 975 470 S 990 420, 1000 400',
  greatWall: smoothPath([[480, 148], [560, 186], [650, 228], [738, 286], [816, 330], [870, 392], [900, 470]], 0.5),
  snowPeaks: [
    [300, 236], [430, 262], [560, 320], [672, 380], [766, 468], [200, 240],
  ] as Array<[number, number]>,
};

/* -------------------------------------------------------------------------- */
/*  高程剖面                                                                     */
/* -------------------------------------------------------------------------- */

export const ELEV_MIN = 800;
export const ELEV_MAX = 3200;

export function elevationPath(w: number, h: number): { line: string; area: string; peak: [number, number] } {
  const pts = PROJECTED.map((s) => {
    const x = s.at * w;
    const y = h - ((s.elev - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)) * h;
    return [x, y] as const;
  });
  const line = smoothPath(pts, 0.5);
  const peakStop = PROJECTED.reduce((a, b) => (b.elev > a.elev ? b : a));
  return {
    line,
    area: `${line} L ${w} ${h} L 0 ${h} Z`,
    peak: [peakStop.at * w, h - ((peakStop.elev - ELEV_MIN) / (ELEV_MAX - ELEV_MIN)) * h],
  };
}

/* -------------------------------------------------------------------------- */
/*  伪二维码（确定性生成，防水合不一致）                                          */
/* -------------------------------------------------------------------------- */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function qrPath(size = 25, seed = 20260924): string {
  const rnd = mulberry32(seed);
  const finder = (x: number, y: number) => {
    const inBox = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    return inBox(0, 0) || inBox(size - 7, 0) || inBox(0, size - 7);
  };
  const finderOn = (x: number, y: number) => {
    const local = (ox: number, oy: number) => {
      const lx = x - ox;
      const ly = y - oy;
      if (lx < 0 || ly < 0 || lx > 6 || ly > 6) return null;
      const ring = Math.min(lx, ly, 6 - lx, 6 - ly);
      return ring === 0 || ring >= 2;
    };
    return local(0, 0) ?? local(size - 7, 0) ?? local(0, size - 7) ?? false;
  };
  let d = '';
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const on = finder(x, y) ? finderOn(x, y) : x === 7 || y === 7 || x === size - 8 || y === size - 8 ? false : rnd() > 0.52;
      if (on) d += `M${x} ${y}h1v1h-1z`;
    }
  }
  return d;
}
