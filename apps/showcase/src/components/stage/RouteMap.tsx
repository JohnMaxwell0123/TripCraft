'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { MAP_W, MAP_H, PROJECTED, ROUTE_D, ROUTE_LUT, TERRAIN, type ProjectedStop } from '@/data/trip';
import { local, useFade, useRange, ease, useReduced } from '@/lib/motion';
import { T } from './timeline';
import { useProgress } from './primitives';

/* 相机关键帧：中国尺度 → 河西走廊 → 兰州街区 */
const LZ = PROJECTED[0];
const VB_WIDE = [-700, -448, 2400, 1536];
const VB_CORRIDOR = [0, 0, MAP_W, MAP_H];
const ZW = 440;
const VB_LANZHOU = [LZ.x - ZW / 2, LZ.y - (ZW * MAP_H) / MAP_W / 2, ZW, (ZW * MAP_H) / MAP_W];

function viewBoxAt(v: number, reduced: boolean): string {
  const cam = reduced ? 1 : local(v, T.camera[0], T.camera[1]);
  const zoom = local(v, T.zoomLanzhou[0], T.zoomLanzhou[1]);
  const e1 = ease.smooth(cam);
  const e2 = ease.smooth(zoom);
  const out = VB_WIDE.map((w, i) => {
    const a = w + (VB_CORRIDOR[i] - w) * e1;
    return a + (VB_LANZHOU[i] - a) * e2;
  });
  return out.map((n) => (Math.round(n * 2) / 2).toFixed(1)).join(' ');
}

const ROUTE_DUR = T.routeDraw[1] - T.routeDraw[0];
export const stopAppearAt = (s: ProjectedStop) => T.routeDraw[0] + s.at * ROUTE_DUR;

// 静态经纬网路径合并为单条 path，消除 52 个单独 line DOM 节点
const GRATICULE_D = (() => {
  let d = '';
  for (let x = -2400; x <= 3600; x += 200) d += `M${x} -1600V2400`;
  for (let y = -1600; y <= 2400; y += 200) d += `M-2400 ${y}H3400`;
  return d;
})();

// 静态雪山与山脊合并路径
const SNOW_PEAKS_D = TERRAIN.snowPeaks
  .map(([x, y]) => `M ${x - 9} ${y + 6} L ${x} ${y - 9} L ${x + 9} ${y + 6} Z`)
  .join(' ');

const QILIAN_RIDGES_D = TERRAIN.qilianRidges.join(' ');

export function RouteMap() {
  const p = useProgress();
  const reduced = useReduced();
  const svgRef = useRef<SVGSVGElement>(null);
  const lastVb = useRef('');

  const applyCamera = (v: number) => {
    // 相机视口更新防抖与 0.5px 量化：消除连续无意义微小浮点数 DOM 重写
    const nextVb = viewBoxAt(v, reduced);
    if (nextVb !== lastVb.current) {
      lastVb.current = nextVb;
      svgRef.current?.setAttribute('viewBox', nextVb);
    }
  };

  useEffect(() => {
    applyCamera(p.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);
  useMotionValueEvent(p, 'change', applyCamera);

  // 7座 MPV 车标移动：纯 MotionValue 驱动 + 静态预计算均匀弧长 LUT（0 运行时 DOM 读写）
  const carPos = useTransform(p, (v) => {
    const inRange = v > T.routeDraw[0] && v < T.routeDraw[1] + 0.006;
    if (!inRange) return { x: ROUTE_LUT[0].x, y: ROUTE_LUT[0].y, opacity: 0 };
    const t = ease.smooth(local(v, T.routeDraw[0], T.routeDraw[1]));
    const idx = t * (ROUTE_LUT.length - 1);
    const i0 = Math.floor(idx);
    const i1 = Math.min(i0 + 1, ROUTE_LUT.length - 1);
    const frac = idx - i0;
    const x = ROUTE_LUT[i0].x + (ROUTE_LUT[i1].x - ROUTE_LUT[i0].x) * frac;
    const y = ROUTE_LUT[i0].y + (ROUTE_LUT[i1].y - ROUTE_LUT[i0].y) * frac;
    return { x, y, opacity: 1 };
  });

  const carX = useTransform(carPos, (pos) => pos.x);
  const carY = useTransform(carPos, (pos) => pos.y);
  const carOpacity = useTransform(carPos, (pos) => pos.opacity);

  const terrain = useRange(p, [T.camera[0] + 0.02, T.camera[1]], [0.25, 1]);
  const graticule = useRange(p, [T.camera[0], T.camera[1], T.zoomLanzhou[0], T.zoomLanzhou[1]], [1, 0.35, 0.35, 0.15]);
  const contextLabel = useFade(p, T.camera[0] - 0.004, T.camera[0] + 0.004, T.camera[0] + 0.03, T.camera[1] - 0.01);
  const route = useRange(p, [T.routeDraw[0], T.routeDraw[1]], [0, 1]);
  const ghost = useFade(p, T.camera[1] - 0.01, T.camera[1]);
  const labels = useRange(p, [T.zoomLanzhou[0], T.zoomLanzhou[0] + 0.012], [1, 0]);
  const routeWidth = useRange(p, [T.zoomLanzhou[0], T.zoomLanzhou[1]], [4.5, 2.2]);

  return (
    <svg
      ref={svgRef}
      viewBox={VB_WIDE.join(' ')}
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full gpu-layer"
      role="img"
      aria-label="河西走廊九天路线图：兰州、乌鞘岭、张掖、七彩丹霞、嘉峪关、敦煌、阳关、玉门关、雅丹"
    >
      <defs>
        <radialGradient id="map-bg" cx="60%" cy="50%" r="80%">
          <stop offset="0%" stopColor="#f6eedd" />
          <stop offset="100%" stopColor="#e8d9bb" />
        </radialGradient>
        <linearGradient id="qilian-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c9b48f" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#b59b72" stopOpacity="0.55" />
        </linearGradient>
        <pattern id="dunes" width="14" height="10" patternUnits="userSpaceOnUse">
          <path d="M0 7 Q3.5 3 7 7 T14 7" fill="none" stroke="#c59a5c" strokeOpacity="0.45" strokeWidth="1" />
        </pattern>
        <linearGradient id="route-grad" x1="1" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(184 134 59)" />
          <stop offset="60%" stopColor="rgb(160 100 45)" />
          <stop offset="100%" stopColor="rgb(140 58 43)" />
        </linearGradient>
      </defs>

      <rect x={-2400} y={-1600} width={5800} height={4000} fill="url(#map-bg)" />

      {/* 经纬网：中国尺度时清晰，单条合并 Path，0 多元素冗余 */}
      <motion.path
        d={GRATICULE_D}
        fill="none"
        stroke="rgb(58 46 31)"
        strokeOpacity="0.12"
        strokeWidth="1.2"
        style={{ opacity: graticule }}
      />
      <motion.g style={{ opacity: contextLabel }} fill="rgb(58 46 31)" fontFamily="serif">
        <text x={500} y={-180} fontSize={110} textAnchor="middle" opacity={0.18} letterSpacing={40}>
          中国 · 西北
        </text>
        <rect x={-40} y={-40} width={1080} height={720} fill="none" stroke="rgb(184 134 59)" strokeWidth={6} strokeDasharray="24 16" rx={24} />
        <text x={500} y={780} fontSize={54} textAnchor="middle" fill="rgb(122 85 32)">
          甘肃 · 河西走廊
        </text>
      </motion.g>

      {/* 地形意象：合并雪峰与山脊 */}
      <motion.g style={{ opacity: terrain }}>
        <path d={TERRAIN.badain} fill="url(#dunes)" />
        <path d={TERRAIN.badain} fill="#d9b77e" fillOpacity="0.18" />
        <path d={TERRAIN.tengger} fill="url(#dunes)" />
        <path d={TERRAIN.kumtag} fill="url(#dunes)" />
        <path d={TERRAIN.kumtag} fill="#d9b77e" fillOpacity="0.2" />
        <path d={TERRAIN.qilian} fill="url(#qilian-fill)" />
        <path d={QILIAN_RIDGES_D} fill="none" stroke="#8f774f" strokeOpacity="0.35" strokeWidth="1.4" strokeDasharray="2 6" />
        <path d={SNOW_PEAKS_D} fill="#fbf7ef" stroke="#a89068" strokeWidth="1" />
        <path d={TERRAIN.yellowRiver} fill="none" stroke="#5b8db5" strokeWidth="5" strokeLinecap="round" strokeOpacity="0.7" />
        <path d={TERRAIN.greatWall} fill="none" stroke="#8c3a2b" strokeOpacity="0.45" strokeWidth="2" strokeDasharray="7 5" />
        <motion.g style={{ opacity: labels }} fontFamily="serif" fill="rgb(107 93 74)">
          <text x={420} y={318} fontSize={22} letterSpacing={10} transform="rotate(-30 420 318)">祁连山脉</text>
          <text x={740} y={150} fontSize={18} letterSpacing={8}>巴丹吉林沙漠</text>
          <text x={548} y={218} fontSize={15} letterSpacing={6} fill="rgb(140 58 43)" transform="rotate(-33 548 218)">河西走廊 · 长城</text>
          <text x={52} y={222} fontSize={14} letterSpacing={4}>库姆塔格沙漠</text>
          <text x={892} y={350} fontSize={14} letterSpacing={4}>腾格里沙漠</text>
          <text x={936} y={590} fontSize={14} fill="#3f6f96">黄河</text>
        </motion.g>
      </motion.g>

      {/* 路线：底层虚线预览 + 金色主线描绘 */}
      <motion.path d={ROUTE_D} fill="none" stroke="rgb(58 46 31)" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="4 8" style={{ opacity: ghost }} />
      <motion.path d={ROUTE_D} fill="none" stroke="rgb(255 250 240)" strokeWidth="9" strokeLinecap="round" strokeOpacity="0.8" style={{ pathLength: route }} />
      <motion.path
        d={ROUTE_D}
        fill="none"
        stroke="url(#route-grad)"
        strokeLinecap="round"
        style={{ pathLength: route, strokeWidth: routeWidth }}
      />

      {PROJECTED.map((s) => (s.kind === 'via' && s.id === 'dh2' ? null : <Pin key={s.id} stop={s} labels={labels} />))}

      {/* 跟随路线头部的 7座 MPV（纯 MotionValue 驱动） */}
      <motion.g style={{ x: carX, y: carY, opacity: carOpacity }} className="will-change-transform">
        <circle r={13} fill="rgb(31 78 121)" stroke="#fff" strokeWidth={2.5} />
        <g transform="translate(-7, -7) scale(0.58)" stroke="#ffffff" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9C2.1 11.2 2 11.6 2 12v4c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </g>
      </motion.g>

      <VehicleBadges />
    </svg>
  );
}

/* ── 图钉：路线到达时落地 + 双层涟漪 ─────────────────────── */
function Pin({ stop, labels }: { stop: ProjectedStop; labels: MotionValue<number> }) {
  const p = useProgress();
  const at = stopAppearAt(stop);
  const scale = useRange(p, [at - 0.002, at + 0.006], [0, 1], { easing: ease.back, rest: 1 });
  const opacity = useRange(p, [at - 0.002, at + 0.002], [0, 1]);
  const ripple1 = useRange(p, [at, at + 0.016], [0.6, 3.4], { easing: ease.out });
  const ripple2 = useRange(p, [at + 0.004, at + 0.022], [0.6, 3.4], { easing: ease.out });
  const r1o = useRange(p, [at, at + 0.002, at + 0.016], [0, 0.7, 0]);
  const r2o = useRange(p, [at + 0.004, at + 0.006, at + 0.022], [0, 0.5, 0]);
  const keep = stop.id === 'lz';

  const side = stop.labelSide ?? 'right';
  const dx = side === 'left' ? -18 : side === 'right' ? 18 : 0;
  const dy = side === 'top' ? -20 : side === 'bottom' ? 30 : 5;
  const anchor = side === 'left' ? 'end' : side === 'right' ? 'start' : 'middle';
  const isPass = stop.kind === 'pass';
  const r = stop.kind === 'city' ? 9 : 7;

  return (
    <g transform={`translate(${stop.x.toFixed(1)} ${stop.y.toFixed(1)})`}>
      <motion.circle r={10} fill="none" stroke="rgb(184 134 59)" strokeWidth={2} style={{ scale: ripple1, opacity: r1o }} className="will-change-transform" />
      <motion.circle r={10} fill="none" stroke="rgb(184 134 59)" strokeWidth={1.5} style={{ scale: ripple2, opacity: r2o }} className="will-change-transform" />
      <motion.g style={{ scale, opacity }} className="will-change-transform">
        {isPass ? (
          <path d="M -9 6 L 0 -10 L 9 6 Z" fill="rgb(255 250 240)" stroke="rgb(140 58 43)" strokeWidth={2.4} strokeLinejoin="round" />
        ) : (
          <>
            <circle r={r + 4} fill="rgb(255 250 240)" />
            <circle r={r} fill={stop.kind === 'city' ? 'rgb(31 78 121)' : 'rgb(184 134 59)'} />
          </>
        )}
        <motion.g style={{ opacity: keep ? 1 : labels }}>
          <text
            x={dx}
            y={dy}
            textAnchor={anchor}
            fontSize={17}
            fontWeight={600}
            fill="rgb(58 46 31)"
            stroke="rgb(250 245 235)"
            strokeWidth={5}
            paintOrder="stroke"
            fontFamily="serif"
          >
            {stop.name}
            <tspan fontSize={12} fontWeight={500} fill="rgb(122 85 32)" dx={5}>
              {stop.sub ? `${stop.day} · ${stop.sub}` : stop.day}
            </tspan>
          </text>
        </motion.g>
      </motion.g>
    </g>
  );
}

/* ── 车辆通行与适老徽标（SVG 原生，随相机缩放） ─────────────── */
function textWidth(s: string, size: number) {
  let w = 0;
  for (const ch of s) w += /[\u0000-\u00ff]/.test(ch) ? size * 0.58 : size;
  return w;
}

const BADGES = [
  { stop: 'wsl', text: '✓ G30 连霍高速 · 乌鞘岭长下坡防刹车过热', tone: 'jade' as const, dx: 26, dy: -36, w: textWidth('✓ G30 连霍高速 · 乌鞘岭长下坡防刹车过热', 15) + 24 },
  { stop: 'dx', text: '✓ 丹霞平缓步道 · 7座 MPV 车位充裕', tone: 'jade' as const, dx: -150, dy: 46, w: textWidth('✓ 丹霞平缓步道 · 7座 MPV 车位充裕', 15) + 24 },
  { stop: 'dh', text: '✓ 莫高窟预约无障碍摆渡 · 平层大窟', tone: 'jade' as const, dx: -20, dy: 62, w: textWidth('✓ 莫高窟预约无障碍摆渡 · 平层大窟', 15) + 24 },
];

function VehicleBadges() {
  return (
    <g>
      {BADGES.map((b, i) => {
        const s = PROJECTED.find((x) => x.id === b.stop);
        if (!s) return null;
        return <Badge key={b.stop} x={s.x + b.dx} y={s.y + b.dy} anchorX={s.x} anchorY={s.y} text={b.text} tone={b.tone} w={b.w} at={T.badges[i]} />;
      })}
    </g>
  );
}

function Badge({ x, y, anchorX, anchorY, text, tone, w, at }: { x: number; y: number; anchorX: number; anchorY: number; text: string; tone: 'jade' | 'amber'; w: number; at: number }) {
  const p = useProgress();
  const scale = useRange(p, [at, at + 0.008], [0.5, 1], { easing: ease.back, rest: 1 });
  const opacity = useRange(p, [at, at + 0.004, T.zoomLanzhou[0], T.zoomLanzhou[0] + 0.01], [0, 1, 1, 0]);
  const size = 15;
  const h = 30;
  const color = tone === 'jade' ? 'rgb(14 134 116)' : 'rgb(176 112 16)';
  return (
    <motion.g style={{ opacity, scale }} className="will-change-transform">
      <line x1={anchorX} y1={anchorY} x2={x + 10} y2={y} stroke={color} strokeWidth={1.4} strokeDasharray="3 3" />
      <rect x={x} y={y - h / 2} width={w} height={h} rx={h / 2} fill="rgb(255 252 246)" fillOpacity={0.94} stroke={color} strokeOpacity={0.5} />
      <text x={x + 12} y={y + 5.5} fontSize={size} fontWeight={600} fill={color}>
        {text}
      </text>
    </motion.g>
  );
}
