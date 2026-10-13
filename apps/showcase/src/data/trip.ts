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

export type Tone = 'jade' | 'amber' | 'lapis' | 'ochre';

export interface DayPlan {
  tag: string;
  date: string;
  title: string;
  meta: string;
  badge?: { tone: Tone; text: string };
}

export const DAYS: DayPlan[] = [
  { tag: 'D0', date: '09/24', title: '兰州 · 丝路集结夜', meta: '14:30 落地中川 · 19:15 入住黄河边' },
  { tag: 'D1', date: '09/25', title: '兰州 → 张掖 · 翻越乌鞘岭', meta: '505 km · 双司机轮换', badge: { tone: 'amber', text: '超 350km · 领队已确认' } },
  { tag: 'D2', date: '09/26', title: '七彩丹霞 → 嘉峪关', meta: '225 km · 丹霞 17:40 最佳光线', badge: { tone: 'amber', text: '景区换乘环保车' } },
  { tag: 'D3', date: '09/27', title: '嘉峪关 → 敦煌', meta: '瓜州 13:00 午休 · 宝宝睡个好觉' },
  { tag: 'D4', date: '09/28', title: '莫高窟 · 无障碍慢游', meta: '接驳车 · 4 个平层大窟', badge: { tone: 'jade', text: '无台阶路线' } },
  { tag: 'D5', date: '09/29', title: '鸣沙山 · 月牙泉', meta: '19:30 日落窗口 · 电瓶车上山' },
  { tag: 'D6', date: '09/30', title: '阳关 · 玉门关', meta: '大漠孤烟 · 午后避暑' },
  { tag: 'D7', date: '10/01', title: '雅丹魔鬼城 · 星空', meta: '日落后原路返回 · 不夜行' },
  { tag: 'D8', date: '10/02', title: '敦煌 ➔ 航班返程', meta: '11:20 起飞 · 行李提前装车' },
];

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
}

export const STOPS: RouteStop[] = [
  { id: 'lz', name: '兰州', sub: '集结', day: 'D0', lon: 103.82, lat: 36.06, elev: 1520, kind: 'city', labelSide: 'left' },
  { id: 'wsl', name: '乌鞘岭', sub: '2980m', day: 'D1', lon: 102.87, lat: 37.2, elev: 2980, kind: 'pass', labelSide: 'left' },
  { id: 'ww', name: '武威', day: 'D1', lon: 102.64, lat: 37.93, elev: 1530, kind: 'via', labelSide: 'right' },
  { id: 'zy', name: '张掖', day: 'D1', lon: 100.45, lat: 38.93, elev: 1480, kind: 'city', labelSide: 'right' },
  { id: 'dx', name: '七彩丹霞', day: 'D2', lon: 100.0, lat: 38.92, elev: 1750, kind: 'sight', labelSide: 'bottom' },
  { id: 'jyg', name: '嘉峪关', day: 'D2', lon: 98.29, lat: 39.77, elev: 1700, kind: 'city', labelSide: 'bottom' },
  { id: 'gz', name: '瓜州', day: 'D3', lon: 95.78, lat: 40.52, elev: 1180, kind: 'via', labelSide: 'top' },
  { id: 'dh', name: '敦煌', sub: '莫高窟 · 鸣沙山', day: 'D3–D5', lon: 94.72, lat: 40.1, elev: 1140, kind: 'city', labelSide: 'bottom' },
  { id: 'yg', name: '阳关', day: 'D6', lon: 94.06, lat: 39.93, elev: 1250, kind: 'sight', labelSide: 'bottom' },
  { id: 'ymg', name: '玉门关', day: 'D6', lon: 93.86, lat: 40.35, elev: 1050, kind: 'sight', labelSide: 'left' },
  { id: 'yd', name: '雅丹', day: 'D7', lon: 93.08, lat: 40.55, elev: 930, kind: 'sight', labelSide: 'top' },
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
export function buildRouteLUT(samples = 256): Point2D[] {
  const points = PROJECTED.map((s) => [s.x, s.y] as const);
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
