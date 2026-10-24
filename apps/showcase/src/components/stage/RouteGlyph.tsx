'use client';

import { useId } from 'react';
import { COVER_PALETTES, smoothPath, type TripSummary } from '@/data/trip';

/**
 * 行程封面：用这趟行程自己的路线形状画成一张图（渐变底 + 经纬点阵 + 白色路线），不用照片。
 * 每条路线形状不同，封面自然各不相同；配色取自一组与目的地无关的渐变，换任何目的地都成立。
 * 没有实拍素材，也不用 AI 生成的风景冒充实拍：封面大到能放字时，右上角标「示意」（docs/17 §17.6.3）。
 * colors 覆盖默认配色：分享卡片上用按路线生成的行程皮肤（例如 rgb(var(--trip-primary))），写进 style 才能解析 CSS 变量。
 */

const W = 120;
const H = 72;

/** 经纬度 → 封面坐标：按纬度余弦校正后等比收进画框，四周留白（padY 默认同 pad） */
function layout(shape: TripSummary['shape'], pad = 0.2, padY = pad) {
  const lat0 = shape.reduce((s, [, lat]) => s + lat, 0) / shape.length;
  const k = Math.cos((lat0 * Math.PI) / 180);
  const raw = shape.map(([lon, lat]) => [lon * k, -lat] as const);
  const xs = raw.map((p) => p[0]);
  const ys = raw.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const bw = W * (1 - pad * 2);
  const bh = H * (1 - padY * 2);
  const s = Math.min(bw / (x1 - x0 || 1), bh / (y1 - y0 || 1));
  const ox = (W - (x1 - x0) * s) / 2;
  const oy = (H - (y1 - y0) * s) / 2;
  return raw.map(([x, y]) => [ox + (x - x0) * s, oy + (y - y0) * s] as const);
}

export function RouteGlyph({
  trip,
  className = '',
  tag = false,
  colors,
  padY,
}: {
  trip: TripSummary;
  className?: string;
  tag?: boolean;
  colors?: readonly [string, string];
  /** 纵向留白（占高度的比例）。封面比 120:72 扁很多时，按比例裁切会切掉上下两端，调大它让路线留在中间 */
  padY?: number;
}) {
  const id = useId().replace(/:/g, '');
  const [c0, c1] = colors ?? COVER_PALETTES[trip.palette];
  const pts = layout(trip.shape, 0.2, padY);
  const d = smoothPath(pts, 0.45);
  const start = pts[0];
  const end = pts[pts.length - 1];
  const loop = Math.hypot(start[0] - end[0], start[1] - end[1]) < 2;

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" style={{ stopColor: c0 }} />
            <stop offset="1" style={{ stopColor: c1 }} />
          </linearGradient>
          <pattern id={`p${id}`} width="6" height="6" patternUnits="userSpaceOnUse">
            <circle cx="1.5" cy="1.5" r="0.55" fill="#fff" fillOpacity="0.22" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#g${id})`} />
        <rect width={W} height={H} fill={`url(#p${id})`} />
        <path d={d} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={start[0]} cy={start[1]} r="2.6" fill="#fff" />
        {loop ? null : <circle cx={end[0]} cy={end[1]} r="2.6" style={{ fill: c1 }} stroke="#fff" strokeWidth="1.6" />}
      </svg>
      {tag ? <span className="absolute right-1.5 top-1.5 rounded-full bg-black/25 px-1.5 text-xs leading-5 text-white backdrop-blur-sm">示意</span> : null}
    </span>
  );
}
