'use client';

import type { CSSProperties, ReactNode } from 'react';

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
