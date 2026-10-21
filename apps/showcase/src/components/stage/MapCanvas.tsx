'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { MAP_VIEW, pointOnRoute, type RouteGeometry } from '@/data/trip';
import { BASE_LABELS, GREENS, HIGHWAYS, KM_100, LAKES, RIVERS, ROADS, URBAN } from '@/data/basemap';
import { ease, useFadeVisibility, useReduced } from '@/lib/motion';
import { CatMark } from './ui';
import { LayersIcon, LocateIcon, MinusIcon, PlusIcon } from '@/components/common/Icons';

/**
 * 地图（路径 A 草案、线路详情、行程空间、B 端路线动画共用）
 *
 * 像地图 App 的矢量底图：浅灰陆地、蓝色水系、绿色保护地、城镇色块、高速与普通道路（data/basemap.ts，示意数据）。
 * 路线是白色描边 + 强调色的粗线，按弧长描绘；带类别的途经点画成类别图钉，路线画到时落下。
 * 地名用 HTML 叠加，字号固定 12px，不随地图缩放变小。
 *
 * 相机：frame 指定路线必须完整落进的区域（Tailwind 定位类，可按视窗断点变化，例如留出底部抽屉的高度）；
 * 底图要素比路线视框大一圈，视框外的部分铺满容器的其余地方，不留空白。
 */

const ASPECT = MAP_VIEW.w / MAP_VIEW.h;
const pctX = (x: number) => ((x - MAP_VIEW.x) / MAP_VIEW.w) * 100;
const pctY = (y: number) => ((y - MAP_VIEW.y) / MAP_VIEW.h) * 100;

type Side = 'left' | 'right' | 'top' | 'bottom';

const LABEL_POS: Record<Side, string> = {
  right: 'left-3 top-1/2 -translate-y-1/2',
  left: 'right-3 top-1/2 -translate-y-1/2',
  top: 'bottom-3 left-1/2 -translate-x-1/2',
  bottom: 'top-3 left-1/2 -translate-x-1/2',
};

/** 白色光晕，让叠在底图上的字在任何底色上都清楚 */
const HALO = '[text-shadow:0_0_2px_rgb(var(--ui-map-land)),0_0_2px_rgb(var(--ui-map-land)),0_0_3px_rgb(var(--ui-map-land)),0_0_4px_rgb(var(--ui-map-land))]';

export interface MapCanvasProps {
  route: RouteGeometry;
  /** 路线描绘进度（0~1，按弧长） */
  draw: MotionValue<number>;
  /** 显示地名的路线节点 id */
  labels?: readonly string[];
  /** 画出带类别的途经点图钉 */
  pins?: boolean;
  /** 画出移动中的线头 */
  head?: boolean;
  /** 路线完整落进的区域（默认铺满） */
  frame?: string;
  /** 缩放与定位按钮 */
  controls?: string | false;
  /** 比例尺与「示意底图」标注 */
  legend?: boolean;
  /** 「示意底图」标注的位置（默认右下角） */
  legendClass?: string;
  className?: string;
}

export function MapCanvas({
  route,
  draw,
  labels = [],
  pins = true,
  head = true,
  frame = 'inset-0',
  controls = false,
  legend = true,
  legendClass = 'bottom-2 right-2',
  className = '',
}: MapCanvasProps) {
  return (
    <div className={`relative h-full w-full overflow-hidden bg-ui-map-land ${className}`}>
      <div className={`absolute [container-type:size] ${frame}`}>
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: `min(100cqw, calc(100cqh * ${ASPECT.toFixed(4)}))`, aspectRatio: `${MAP_VIEW.w} / ${MAP_VIEW.h}` }}
        >
          <svg viewBox={`${MAP_VIEW.x} ${MAP_VIEW.y} ${MAP_VIEW.w} ${MAP_VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
            <Basemap />
            <path d={route.d} fill="none" className="stroke-ui-route/30" strokeWidth={3} strokeDasharray="2 8" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            <motion.path d={route.d} fill="none" stroke="#fff" strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
            <motion.path d={route.d} fill="none" className="stroke-ui-route" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
          </svg>

          {BASE_LABELS.map((l) => (
            <span
              key={l.text}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap text-xs ${HALO} ${
                l.kind === 'water' ? 'text-ui-map-water-ink' : l.kind === 'green' ? 'text-ui-map-green-ink' : 'text-ui-ink-3'
              } ${l.wideOnly ? 'hidden cq-md:block' : ''}`}
              style={{ left: `${pctX(l.x)}%`, top: `${pctY(l.y)}%` }}
            >
              {l.text}
            </span>
          ))}

          {route.stops.map((s, i) =>
            // 回到起点城市的终点与该城市重合，不重复画
            route.stops.findIndex((x) => x.name === s.name) !== i ? null : (
              <Stop key={s.id} stop={s} draw={draw} pin={pins && !!s.cat} label={labels.includes(s.id) ? s.name : undefined} />
            ),
          )}

          {head ? <Head route={route} draw={draw} /> : null}

          {legend ? (
            <span aria-hidden className="pointer-events-none absolute bottom-[3%] left-[2%]" style={{ width: `${(KM_100 / MAP_VIEW.w) * 100}%` }}>
              <span className={`block whitespace-nowrap text-xs leading-4 text-ui-ink-2 ${HALO}`}>100 km</span>
              <span className="block h-1.5 w-full border-x-2 border-b-2 border-ui-ink-2/70" />
            </span>
          ) : null}
        </div>
      </div>

      {legend ? (
        <span className={`pointer-events-none absolute rounded-full bg-ui-surface/80 px-2 text-xs leading-5 text-ui-ink-3 ${legendClass}`}>示意底图 · 非图商数据</span>
      ) : null}
      {controls ? <MapControls className={controls} /> : null}
    </div>
  );
}

/* ── 底图 ── */
function Basemap() {
  return (
    <g>
      {GREENS.map((d, i) => (
        <path key={`g${i}`} d={d} className="fill-ui-map-green" />
      ))}
      {URBAN.map((b, i) => (
        <ellipse key={`u${i}`} cx={b.cx} cy={b.cy} rx={b.rx} ry={b.ry} className="fill-ui-map-urban" />
      ))}
      {RIVERS.map((r, i) => (
        <path key={`r${i}`} d={r.d} fill="none" className="stroke-ui-map-water" strokeWidth={r.w * 0.55} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
      {LAKES.map((d, i) => (
        <path key={`l${i}`} d={d} className="fill-ui-map-water" />
      ))}
      {ROADS.map((d, i) => (
        <g key={`rd${i}`}>
          <path d={d} fill="none" className="stroke-ui-map-casing" strokeWidth={3.2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" className="stroke-ui-map-road" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
      {HIGHWAYS.map((d, i) => (
        <g key={`hw${i}`}>
          <path d={d} fill="none" className="stroke-ui-map-highway-casing" strokeWidth={4.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          <path d={d} fill="none" className="stroke-ui-map-highway" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </g>
      ))}
    </g>
  );
}

/* ── 途经点：城市画圆点，带类别的地点画图钉；路线画到时落下 ── */
function Stop({ stop, draw, pin, label }: { stop: RouteGeometry['stops'][number]; draw: MotionValue<number>; pin: boolean; label?: string }) {
  const shown = useTransform(draw, (t) => (stop.arc <= 0.001 ? 1 : Math.max(0, Math.min(1, (t - stop.arc + 0.012) / 0.024))));
  const visibility = useFadeVisibility(shown);
  const scale = useTransform(shown, (v) => 0.4 + 0.6 * ease.back(v));
  const major = stop.kind === 'city';
  const side = (stop.labelSide ?? 'right') as Side;

  return (
    <span className="absolute h-0 w-0" style={{ left: `${pctX(stop.x)}%`, top: `${pctY(stop.y)}%` }}>
      <motion.span className="absolute left-0 top-0" style={{ opacity: shown, visibility, scale, x: '-50%', y: '-50%' }}>
        {pin && stop.cat ? (
          <CatMark cat={stop.cat} size={22} className="ring-2 ring-white shadow-[0_2px_6px_rgba(0,0,0,0.25)]" />
        ) : (
          <span className={`block rounded-full border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.25)] ${major ? 'h-3 w-3 bg-ui-ink' : 'h-2.5 w-2.5 bg-ui-ink-3'}`} />
        )}
      </motion.span>
      {label ? (
        <motion.span
          className={`absolute whitespace-nowrap text-xs font-semibold text-ui-ink ${HALO} ${LABEL_POS[side]}`}
          style={{ opacity: shown, visibility, ...(pin ? PIN_LABEL_OFFSET[side] : {}) }}
        >
          {label}
        </motion.span>
      ) : null}
    </span>
  );
}

/** 图钉比圆点大，标签要再往外让一点 */
const PIN_LABEL_OFFSET: Record<Side, { left?: number; right?: number; top?: number; bottom?: number }> = {
  right: { left: 16 },
  left: { right: 16 },
  top: { bottom: 16 },
  bottom: { top: 16 },
};

/* ── 线头：白底圆点 + 强调色内点 ── */
function Head({ route, draw }: { route: RouteGeometry; draw: MotionValue<number> }) {
  const reduced = useReduced();
  const point = useTransform(draw, (t) => pointOnRoute(route.lut, t));
  const left = useTransform(point, (pt) => `${pctX(pt.x)}%`);
  const top = useTransform(point, (pt) => `${pctY(pt.y)}%`);
  const opacity = useTransform(draw, (t): number => (!reduced && t > 0.002 && t < 0.998 ? 1 : 0));
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.span
      aria-hidden
      className="absolute flex h-4 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-[0_0_0_5px_rgb(var(--ui-route)/0.18),0_1px_4px_rgba(0,0,0,0.3)]"
      style={{ left, top, opacity, visibility }}
    >
      <span className="h-2 w-2 rounded-full bg-ui-route" />
    </motion.span>
  );
}

/* ── 缩放、定位、图层按钮 ── */
function MapControls({ className = '' }: { className?: string }) {
  const cell = 'flex h-8 w-8 items-center justify-center text-ui-ink-2';
  return (
    <div aria-hidden className={`pointer-events-none absolute flex flex-col gap-2 ${className}`}>
      <span className="ui-float flex flex-col overflow-hidden rounded-ui-ctl">
        <span className={cell}>
          <PlusIcon className="h-4 w-4" />
        </span>
        <span className="mx-1.5 h-px bg-ui-line" />
        <span className={cell}>
          <MinusIcon className="h-4 w-4" />
        </span>
      </span>
      <span className={`ui-float rounded-ui-ctl ${cell}`}>
        <LocateIcon className="h-4 w-4" />
      </span>
      <span className={`ui-float rounded-ui-ctl ${cell}`}>
        <LayersIcon className="h-4 w-4" />
      </span>
    </div>
  );
}
