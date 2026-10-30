'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { motion, useMotionValue, useTransform, type MotionStyle, type MotionValue } from 'framer-motion';
import { ease } from '@/lib/motion';
import { useFilmTime, useKeys, useRaster, useShown } from './clock';

/**
 * 片子里的设备外壳：按原大排版（手机屏 390×844、电脑屏 1192×745、平板屏 1080×760、车机屏 1148×448），
 * 镜头缩放整个世界，设备里的字始终是 13–17px 的真实界面字号。
 * 外壳只是「一块屏」的轮廓：炭黑边框、极细的边缘高光与落在纸面上的柔和投影，不画任何品牌标识与实体按键。
 * 屏幕里面是产品真有的界面（data-ui 是产品界面令牌的作用域，SHOWCASE §4.1）。
 */

export const PHONE = { w: 414, h: 868, screenW: 390, screenH: 844, bezel: 12 } as const;
export const LAPTOP = { w: 1300, h: 834, lidW: 1240, lidH: 793, screenW: 1192, screenH: 745, bezel: 24 } as const;
export const TABLET = { w: 1124, h: 804, screenW: 1080, screenH: 760, bezel: 22 } as const;
export const CAR = { w: 1180, h: 480, screenW: 1148, screenH: 448, bezel: 16 } as const;

const FRAME = '#1C1819';
const EDGE = 'inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12)';

/** 投影：近处接触阴影 + 远处柔和的大投影（纸面上的物件感） */
export const DROP = '0 2px 4px rgba(36,30,32,0.10), 0 28px 60px -24px rgba(36,30,32,0.42)';

interface FrameProps {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** 屏幕里的内容层的类名（例如背景色） */
  screenClass?: string;
  shadow?: string;
}

export function Phone({ children, className = '', style, screenClass = 'bg-ui-panel', shadow = DROP }: FrameProps) {
  return (
    <div className={`relative ${className}`} style={{ width: PHONE.w, height: PHONE.h, borderRadius: 62, background: FRAME, boxShadow: `${EDGE}, ${shadow}`, padding: PHONE.bezel, ...style }}>
      <div data-ui="app" className={`relative h-full w-full overflow-hidden text-ui-ink ${screenClass}`} style={{ borderRadius: 50 }}>
        {children}
        <span aria-hidden className="absolute left-1/2 top-3 z-50 h-[34px] w-[118px] -translate-x-1/2 rounded-full" style={{ background: FRAME }} />
      </div>
    </div>
  );
}

export function Laptop({ children, className = '', style, screenClass = 'ui-shell', shadow = DROP }: FrameProps) {
  return (
    <div className={`relative ${className}`} style={{ width: LAPTOP.w, height: LAPTOP.h, ...style }}>
      {/* 用 left 定位而不是 translate 居中：镜头与线按 offset 链量取位置，不计 transform */}
      <div
        className="absolute top-0"
        style={{ left: (LAPTOP.w - LAPTOP.lidW) / 2, width: LAPTOP.lidW, height: LAPTOP.lidH, borderRadius: '30px 30px 10px 10px', background: FRAME, boxShadow: `${EDGE}, ${shadow}`, padding: `${LAPTOP.bezel}px ${LAPTOP.bezel}px ${LAPTOP.lidH - LAPTOP.screenH - LAPTOP.bezel}px` }}
      >
        <div data-ui="app" className={`relative h-full w-full overflow-hidden text-ui-ink ${screenClass}`} style={{ borderRadius: 8 }}>
          {children}
        </div>
      </div>
      {/* 底座：一条带圆角的浅色边，正面的开合缺口 */}
      <div aria-hidden className="absolute bottom-0 left-0 right-0" style={{ height: LAPTOP.h - LAPTOP.lidH + 4, borderRadius: '4px 4px 22px 22px', background: 'linear-gradient(#D9D6CE, #BDB9B0)', boxShadow: '0 22px 40px -22px rgba(36,30,32,0.45)' }}>
        <span className="absolute top-0 h-[10px] w-[180px] rounded-b-[10px] bg-[#A9A59C]" style={{ left: (LAPTOP.w - 180) / 2 }} />
      </div>
    </div>
  );
}

export function Tablet({ children, className = '', style, screenClass = 'bg-ui-panel', shadow = DROP }: FrameProps) {
  return (
    <div className={`relative ${className}`} style={{ width: TABLET.w, height: TABLET.h, borderRadius: 46, background: FRAME, boxShadow: `${EDGE}, ${shadow}`, padding: TABLET.bezel, ...style }}>
      <div data-ui="app" className={`relative h-full w-full overflow-hidden text-ui-ink ${screenClass}`} style={{ borderRadius: 26 }}>
        {children}
      </div>
    </div>
  );
}

/** 车机屏：只有一块导航屏，没有仪表、档位与车速（PRD-01 §5） */
export function CarDisplay({ children, className = '', style, screenClass = 'bg-[#E9EDF1]', shadow = DROP }: FrameProps) {
  return (
    <div className={`relative ${className}`} style={{ width: CAR.w, height: CAR.h, borderRadius: 34, background: '#141112', boxShadow: `${EDGE}, ${shadow}`, padding: CAR.bezel, ...style }}>
      <div className={`relative h-full w-full overflow-hidden ${screenClass}`} style={{ borderRadius: 20 }}>
        {children}
      </div>
    </div>
  );
}

/* ═════════════════════ 放进世界里的设备 ═════════════════════ */

/**
 * 世界坐标里的一块设备。常驻合成层（will-change 始终含 opacity），按 fresh 时段切换其中的 transform（见 clock.tsx useRaster）：
 * 镜头推拉时不逐帧重画屏里的界面；淡入淡出只改这一层的透明度，由合成器完成。
 */
export function Placed({
  id,
  x,
  y,
  w,
  h,
  fresh,
  opacity,
  from = -1,
  until = Infinity,
  children,
}: {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  fresh: readonly (readonly [number, number])[];
  opacity?: MotionValue<number>;
  /** 在这一刻之前整块不渲染（还没进画面：不让浏览器按微距的倍数去栅格化画面外的屏） */
  from?: number;
  /** 从这一刻起整块不渲染（按时刻淡出的屏：opacity 在这一刻降到 0） */
  until?: number;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRaster(ref, fresh);
  const one = useMotionValue(1);
  const o = opacity ?? one;
  // 进画面之前、淡出之后整块不渲染。用 content-visibility 而不是 visibility：visibility 会继承，切换时整台设备上千个节点都要重算样式，
  // content-visibility: hidden 直接跳过子树的渲染，切换只花一帧里很少的工夫。
  // 按时刻算，不从 opacity 再派生：同一帧里时钟与 opacity 一起变时，两个输入的 useTransform 会漏掉第二次更新，
  // 暂停在这一帧（跳章、静帧）就会留下透明却仍在渲染的一整台屏
  const t = useFilmTime();
  const rendered = useTransform(t, (v) => (v < from || v >= until ? 'hidden' : 'visible'));
  return (
    <motion.div ref={ref} data-dev={id} className="absolute" style={{ left: x, top: y, width: w, height: h, willChange: 'transform, opacity', opacity: o, contentVisibility: rendered }}>
      {children}
    </motion.div>
  );
}

/**
 * 屏的明暗（单独一层，只改透明度，不重画屏里的界面）：keys 是时刻，values 是暗度（0 = 亮）。
 * 用来表现待机（线到之前是暗的，线一到就亮起来）与夜里熄屏、出发当天点亮。
 */
export function Dim({ keys, values }: { keys: readonly number[]; values: readonly number[] }) {
  const t = useFilmTime();
  const opacity = useKeys(t, keys, values, ease.out);
  const shown = useShown(opacity);
  return <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-[60] bg-[#120F10]" style={{ opacity, visibility: shown, willChange: 'opacity' }} />;
}

/** 待机：线到之前这块屏是暗的，线一到就亮起来 */
export function Sleep({ until, depth = 0.62 }: { until: number; depth?: number }) {
  return <Dim keys={[until - 0.02, until + 0.32]} values={[depth, 0]} />;
}

/**
 * 世界里的一块片子元素（大字、浮在纸面上的界面）：常驻合成层，栅格策略同 Placed——
 * 镜头推拉时只由合成器缩放，fresh 时段按当时的缩放重画一次。
 */
export function Layer({
  x,
  y,
  fresh = [],
  className = '',
  style,
  children,
}: {
  x: number;
  y: number;
  fresh?: readonly (readonly [number, number])[];
  className?: string;
  style?: MotionStyle;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useRaster(ref, fresh);
  return (
    <motion.div ref={ref} className={`absolute ${className}`} style={{ left: x, top: y, willChange: 'transform, opacity', ...style }}>
      {children}
    </motion.div>
  );
}
