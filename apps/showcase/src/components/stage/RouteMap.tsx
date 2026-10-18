'use client';

import { motion, useTransform, type MotionValue } from 'framer-motion';
import { MAP_VIEW, TERRAIN, pointOnRoute, type RouteGeometry } from '@/data/trip';
import { ease, useReduced } from '@/lib/motion';

/**
 * 路线地图（路径 A 草案、行程空间、线路详情缩略图与 B 端路线动画共用）
 *
 * 风格化矢量底图：只画祁连山、沙漠与黄河的意象，不含图商底图（docs/17 §17.6.2 的降级版本）。
 * 地形与路线用 SVG；地名用 HTML 叠加，字号固定 12px，不随地图缩放变小。
 * 视框按路线范围收拢（MAP_VIEW），容器用 cq 单位等比铺满，标签与 SVG 坐标严格对齐。
 */

const ASPECT = MAP_VIEW.w / MAP_VIEW.h;
const pctX = (x: number) => ((x - MAP_VIEW.x) / MAP_VIEW.w) * 100;
const pctY = (y: number) => ((y - MAP_VIEW.y) / MAP_VIEW.h) * 100;

type Side = 'left' | 'right' | 'top' | 'bottom';

const LABEL_POS: Record<Side, string> = {
  right: 'left-2.5 top-1/2 -translate-y-1/2',
  left: 'right-2.5 top-1/2 -translate-y-1/2',
  top: 'bottom-2 left-1/2 -translate-x-1/2',
  bottom: 'top-2 left-1/2 -translate-x-1/2',
};

interface TripMapProps {
  route: RouteGeometry;
  /** 路线描绘进度（0~1，按弧长） */
  draw: MotionValue<number>;
  /** 显示地名的节点 id */
  labels?: readonly string[];
  /** 是否画出移动中的线头 */
  head?: boolean;
  className?: string;
}

export function TripMap({ route, draw, labels = [], head = true, className = '' }: TripMapProps) {
  const reduced = useReduced();
  const point = useTransform(draw, (t) => pointOnRoute(route.lut, t));
  const left = useTransform(point, (pt) => `${pctX(pt.x)}%`);
  const top = useTransform(point, (pt) => `${pctY(pt.y)}%`);
  const headOpacity = useTransform(draw, (t) => (head && !reduced && t > 0.002 && t < 0.998 ? 1 : 0));

  return (
    <div className={`relative h-full w-full overflow-hidden [container-type:size] ${className}`}>
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{ width: `min(100cqw, calc(100cqh * ${ASPECT.toFixed(4)}))`, aspectRatio: `${MAP_VIEW.w} / ${MAP_VIEW.h}` }}
      >
        <svg viewBox={`${MAP_VIEW.x} ${MAP_VIEW.y} ${MAP_VIEW.w} ${MAP_VIEW.h}`} className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          <path d={TERRAIN.qilian} fill="#ECE6D8" />
          <path d={TERRAIN.badain} fill="#F2EDE2" />
          <path d={TERRAIN.kumtag} fill="#F2EDE2" />
          <path d={TERRAIN.yellowRiver} fill="none" stroke="#C6D6E2" strokeWidth={6} strokeLinecap="round" />
          <path d={route.d} fill="none" stroke="#CFCDC2" strokeWidth={3} strokeDasharray="1 9" strokeLinecap="round" />
          <motion.path d={route.d} fill="none" stroke="#FE3C01" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: draw }} />
        </svg>

        {route.stops.map((s, i) =>
          // 回到敦煌的终点与敦煌重合，不重复画
          route.stops.findIndex((x) => x.name === s.name) !== i ? null : (
            <Stop key={s.id} x={s.x} y={s.y} arc={s.arc} draw={draw} major={s.kind === 'city'} label={labels.includes(s.id) ? s.name : undefined} side={(s.labelSide ?? 'right') as Side} />
          ),
        )}

        <motion.span
          aria-hidden
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#FE3C01] shadow-[0_0_0_4px_rgba(254,60,1,0.18)]"
          style={{ left, top, opacity: headOpacity }}
        />
      </div>
    </div>
  );
}

function Stop({ x, y, arc, draw, major, label, side }: { x: number; y: number; arc: number; draw: MotionValue<number>; major: boolean; label?: string; side: Side }) {
  const shown = useTransform(draw, (t) => (arc <= 0.001 ? 1 : Math.max(0, Math.min(1, (t - arc + 0.012) / 0.024))));
  const scale = useTransform(shown, (v) => 0.4 + 0.6 * ease.back(v));
  return (
    <span className="absolute h-0 w-0" style={{ left: `${pctX(x)}%`, top: `${pctY(y)}%` }}>
      <motion.span
        className={`absolute left-0 top-0 rounded-full border-2 border-white ${major ? 'h-2.5 w-2.5 bg-[#241E20]' : 'h-2 w-2 bg-[#9A978F]'}`}
        style={{ opacity: shown, scale, x: '-50%', y: '-50%' }}
      />
      {label ? (
        <motion.span
          className={`absolute whitespace-nowrap text-xs font-medium text-[#241E20] [text-shadow:0_0_3px_#fff,0_0_3px_#fff,0_0_3px_#fff] ${LABEL_POS[side]}`}
          style={{ opacity: shown }}
        >
          {label}
        </motion.span>
      ) : null}
    </span>
  );
}
