'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease } from '@/lib/motion';
import { FilmClock, useBoxSize, useFilmTime, useKeys, useShown } from '../clock';
import { LAPTOP, PHONE, TABLET } from '../devices';
import { NominationSheet, TodaySheet, TripLaptopScreen, TripPhoneScreen, TripTabletScreen } from '../screens';

/**
 * 样片 C ·「同一束光」的高潮（实验页 /lab/c，选定方向前的样片，最终 PR 前删除）
 *
 * 设备回到真实的空间：夜里一盏灯照着桌面，领队的手机、阿杰的手机、小雨的平板、电脑。低机位贴着领队的手机——静——点下。
 * 一圈光从这部手机沿桌面扩散，扫到哪块屏，哪块屏就亮起、换成同一行（20:00 正宁路夜市）与 v1.1；镜头同时升起、退后，露出全家的屏围着桌子。
 * 然后灯光从夜里的暖黄变成出发那天清晨的冷白，影子转向，别的屏熄灭，只剩领队手机上「今天的路线」。
 * CSS 3D：屏幕里仍是产品真有的界面（DOM），桌面、光与影是片子的语言。
 */

const DUR = 9.6;
const TAP = 2.0;
const DAWN: readonly [number, number] = [6.5, 7.6];

/** 桌面（世界坐标，px） */
const TABLE = { w: 6400, h: 4400 };
type Dev = 'hero' | 'ajie' | 'tablet' | 'laptop';
const PLACE: Record<Dev, { x: number; y: number; w: number; h: number; rot: number }> = {
  hero: { x: 2980, y: 2330, w: PHONE.w, h: PHONE.h, rot: -6 },
  ajie: { x: 4070, y: 1980, w: PHONE.w, h: PHONE.h, rot: 9 },
  tablet: { x: 1420, y: 1960, w: TABLET.w, h: TABLET.h, rot: 4 },
  laptop: { x: 2440, y: 980, w: LAPTOP.w, h: 860, rot: -2 },
};
const center = (d: Dev) => [PLACE[d].x + PLACE[d].w / 2, PLACE[d].y + PLACE[d].h / 2] as const;
const [HX, HY] = center('hero');
/** 光圈扩散：每秒走多远（世界 px） */
const WAVE_SPEED = 1500;
const WAVE_T0 = 2.45;
const arrive = (d: Dev) => {
  const [x, y] = center(d);
  return WAVE_T0 + Math.hypot(x - HX, y - HY) / WAVE_SPEED;
};

/** 机位：焦点（桌面坐标）、俯仰（度）、绕竖轴转（度）、焦点处的缩放 */
interface Shot {
  t: number;
  fx: number;
  fy: number;
  tilt: number;
  spin: number;
  s: number;
}
const SHOTS: Shot[] = [
  { t: 0, fx: HX + 10, fy: HY + 250, tilt: 62, spin: -10, s: 1.55 },
  { t: TAP, fx: HX + 10, fy: HY + 250, tilt: 61, spin: -9, s: 1.66 },
  { t: 2.5, fx: HX + 10, fy: HY + 120, tilt: 60, spin: -9, s: 1.5 },
  { t: 4.9, fx: 2380, fy: 1760, tilt: 36, spin: 3, s: 0.45 },
  { t: DAWN[0], fx: 2380, fy: 1770, tilt: 35, spin: 3.6, s: 0.462 },
  { t: 8.2, fx: HX + 30, fy: HY + 140, tilt: 40, spin: -3, s: 0.92 },
  { t: DUR, fx: HX + 30, fy: HY + 160, tilt: 40, spin: -3.4, s: 0.97 },
];
const PERSPECTIVE = 1700;

function useCamera(t: MotionValue<number>, view: { w: number; h: number }) {
  const k = Math.min(view.w / 1920, view.h / 1080);
  return useTransform(t, (v) => {
    let i = 0;
    while (i < SHOTS.length - 2 && v > SHOTS[i + 1].t) i++;
    const a = SHOTS[i];
    const b = SHOTS[i + 1];
    const u = ease.smooth(Math.max(0, Math.min(1, (v - a.t) / (b.t - a.t))));
    const lerp = (p: number, q: number) => p + (q - p) * u;
    const s = Math.exp(lerp(Math.log(a.s), Math.log(b.s))) * k;
    const d = PERSPECTIVE / s - PERSPECTIVE;
    return `translate3d(${(view.w / 2).toFixed(1)}px, ${(view.h * 0.54).toFixed(1)}px, ${(-d).toFixed(1)}px) rotateX(${lerp(a.tilt, b.tilt).toFixed(3)}deg) rotateZ(${lerp(a.spin, b.spin).toFixed(3)}deg) translate3d(${(-lerp(a.fx, b.fx)).toFixed(1)}px, ${(-lerp(a.fy, b.fy)).toFixed(1)}px, 0)`;
  });
}

export function SampleC() {
  return (
    <FilmClock duration={DUR}>
      <Stage />
    </FilmClock>
  );
}

function Stage() {
  const t = useFilmTime();
  const boxRef = useRef<HTMLDivElement>(null);
  const view = useBoxSize(boxRef);
  const transform = useCamera(t, view);
  // 夜里的暖光 → 清晨的冷光（整块桌面的颜色，不是满屏渐变）
  const tableColor = useTransform(t, [DAWN[0], DAWN[1]], ['#D9D0C2', '#D6DBDF']);
  const room = useTransform(t, [DAWN[0], DAWN[1]], ['#2A2421', '#B9C2C9']);
  return (
    <motion.div ref={boxRef} className="fixed inset-0 overflow-hidden" style={{ background: room, perspective: PERSPECTIVE, perspectiveOrigin: '50% 54%' }}>
      <motion.div className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0', transformStyle: 'preserve-3d', width: TABLE.w, height: TABLE.h }}>
        <motion.div className="absolute inset-0 rounded-[80px]" style={{ background: tableColor }} />
        <Lamp />
        <Wave />
        {(['tablet', 'laptop', 'ajie', 'hero'] as Dev[]).map((d) => (
          <Shadow key={d} id={d} />
        ))}
        <DeviceOnTable id="tablet">
          <Glass id="tablet" radius={46} bezel={22} inner={26}>
            <TripTabletScreen updateAt={arrive('tablet')} open={arrive('tablet') - 0.1} />
          </Glass>
        </DeviceOnTable>
        <Laptop3D />
        <DeviceOnTable id="ajie">
          <Glass id="ajie" radius={62} bezel={12} inner={50} island>
            <TripPhoneScreen updateAt={arrive('ajie')} open={arrive('ajie') - 0.1} time="21:07" />
          </Glass>
        </DeviceOnTable>
        <DeviceOnTable id="hero">
          <Glass id="hero" radius={62} bezel={12} inner={50} island>
            <HeroScreen />
          </Glass>
        </DeviceOnTable>
      </motion.div>
      <Titles />
    </motion.div>
  );
}

/* ═════════════════════ 光 ═════════════════════ */

/** 灯：夜里一圈暖光照着领队的手机；清晨换成从右侧窗户进来的冷光 */
function Lamp() {
  const t = useFilmTime();
  const night = useKeys(t, [DAWN[0], DAWN[1]], [1, 0]);
  const dawn = useKeys(t, [DAWN[0] + 0.2, DAWN[1]], [0, 1]);
  return (
    <>
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{ left: HX - 2600, top: HY - 2400, width: 5200, height: 4800, opacity: night, background: 'radial-gradient(closest-side, rgba(255,239,212,0.95), rgba(255,232,196,0.55) 38%, rgba(60,44,30,0) 100%)' }}
      />
      <motion.div aria-hidden className="absolute inset-0 rounded-[80px]" style={{ opacity: night, background: 'radial-gradient(farthest-corner at 52% 56%, transparent 45%, rgba(30,22,16,0.42) 100%)' }} />
      <motion.div aria-hidden className="absolute inset-0 rounded-[80px]" style={{ opacity: dawn, background: 'linear-gradient(255deg, rgba(250,252,255,0.85) 0%, rgba(236,242,247,0.35) 45%, rgba(120,132,142,0.25) 100%)' }} />
    </>
  );
}

/** 点下之后的一圈光：沿桌面扩散，扫到哪块屏、哪块屏亮起（只缩放一张静态的光圈图，不逐帧重画渐变） */
function Wave() {
  const t = useFilmTime();
  const end = WAVE_T0 + 3400 / WAVE_SPEED;
  const r = useKeys(t, [WAVE_T0, end], [0.02, 1], ease.linear);
  const opacity = useKeys(t, [WAVE_T0 - 0.01, WAVE_T0 + 0.12, end - 0.5, end], [0, 1, 0.75, 0]);
  const shown = useShown(opacity);
  // 光扫过之后，整张桌子比原来亮一档：每块屏都亮着
  const fill = useKeys(t, [WAVE_T0, end, DAWN[0], DAWN[0] + 0.6], [0, 0.55, 0.55, 0]);
  const fillShown = useShown(fill);
  return (
    <>
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{ left: HX - 3400, top: HY - 3400, width: 6800, height: 6800, scale: r, opacity: fill, visibility: fillShown, background: 'radial-gradient(closest-side, rgba(255,246,226,0.55), rgba(255,246,226,0.32) 80%, transparent 100%)' }}
      />
      <motion.div
        aria-hidden
        className="absolute rounded-full"
        style={{
          left: HX - 3400,
          top: HY - 3400,
          width: 6800,
          height: 6800,
          scale: r,
          opacity,
          visibility: shown,
          background: 'radial-gradient(closest-side, transparent 80%, rgba(255,251,240,0.5) 90%, rgba(255,252,244,1) 96.5%, rgba(255,250,238,0.35) 98.5%, transparent 100%)',
        }}
      />
    </>
  );
}

/** 接触阴影：夜里背着灯，清晨背着窗 */
function Shadow({ id }: { id: Dev }) {
  const t = useFilmTime();
  const p = PLACE[id];
  const [cx, cy] = center(id);
  const nx = (cx - HX) / (Math.hypot(cx - HX, cy - HY) || 1);
  const ny = (cy - HY) / (Math.hypot(cx - HX, cy - HY) || 1);
  const dx = useKeys(t, [DAWN[0], DAWN[1]], [nx * 26, -46]);
  const dy = useKeys(t, [DAWN[0], DAWN[1]], [ny * 26 + 16, 18]);
  const fade = useKeys(t, [DAWN[0] + 0.2, DAWN[1]], [0.5, id === 'hero' ? 0.42 : 0]);
  const isLaptop = id === 'laptop';
  return (
    <motion.div
      aria-hidden
      className="absolute"
      style={{
        left: p.x,
        top: p.y + (isLaptop ? 300 : 0),
        width: p.w,
        height: isLaptop ? 560 : p.h,
        rotate: p.rot,
        x: dx,
        y: dy,
        opacity: fade,
        borderRadius: id === 'tablet' ? 46 : isLaptop ? 22 : 62,
        background: '#140F0B',
        filter: 'blur(26px)',
      }}
    />
  );
}

/* ═════════════════════ 设备 ═════════════════════ */

function DeviceOnTable({ id, children }: { id: Dev; children: ReactNode }) {
  const t = useFilmTime();
  const p = PLACE[id];
  // 景深：低机位时远处的屏是虚的，镜头升起时对上焦
  const blur = useKeys(t, [2.6, 4.4], [id === 'hero' ? 0 : 7, 0]);
  const filter = useTransform(blur, (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none'));
  const off = useKeys(t, [DAWN[0] + 0.2, DAWN[1]], [1, id === 'hero' ? 1 : 0]);
  const offShown = useShown(off);
  return (
    <motion.div className="absolute" style={{ left: p.x, top: p.y, width: p.w, height: p.h, rotate: p.rot, filter, opacity: off, visibility: offShown }}>
      {children}
    </motion.div>
  );
}

/** 屏幕：边框、玻璃上的反光；线到之前屏是暗的（待机），光一到就亮起；清晨熄灭 */
function Glass({ id, radius, bezel, inner, island = false, children }: { id: Dev; radius: number; bezel: number; inner: number; island?: boolean; children: ReactNode }) {
  const t = useFilmTime();
  const at = id === 'hero' ? -1 : arrive(id);
  const sleep = useKeys(t, [at - 0.05, at + 0.35, DAWN[0] + 0.3, DAWN[1]], [0.62, 0, 0, id === 'hero' ? 0 : 0.86], ease.out);
  const sleepShown = useShown(sleep);
  const sheen = useKeys(t, [at - 0.05, at + 0.55], [-60, 160], ease.linear);
  const sheenX = useTransform(sheen, (v) => `${v}%`);
  const sheenO = useKeys(t, [at - 0.05, at + 0.1, at + 0.45, at + 0.55], [0, id === 'hero' ? 0 : 0.9, id === 'hero' ? 0 : 0.6, 0]);
  return (
    <div className="relative h-full w-full" style={{ borderRadius: radius, background: '#1C1819', padding: bezel, boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.16)' }}>
      <div data-ui="app" className="relative h-full w-full overflow-hidden bg-ui-panel text-ui-ink" style={{ borderRadius: inner }}>
        {children}
        <motion.span aria-hidden className="pointer-events-none absolute inset-0 z-[60] bg-[#120E0C]" style={{ opacity: sleep, visibility: sleepShown }} />
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 z-[61] w-[55%]"
          style={{ left: 0, x: sheenX, opacity: sheenO, background: 'linear-gradient(100deg, transparent, rgba(255,255,255,0.55) 45%, rgba(255,255,255,0.0) 70%)' }}
        />
        {island ? <span aria-hidden className="absolute left-1/2 top-3 z-50 h-[34px] w-[118px] -translate-x-1/2 rounded-full bg-[#1C1819]" /> : null}
      </div>
    </div>
  );
}

function HeroScreen() {
  const t = useFilmTime();
  const dim = useKeys(t, [1.05, 1.5], [1, 0.3]);
  return (
    <TripPhoneScreen updateAt={2.62} open={2.45} sweep={{ from: 'center', t: [2.55, 2.85] }}>
      <NominationSheet tapAt={TAP} approach={[0.9, 1.4]} hideAt={[2.2, 2.45]} dim={dim} />
      <TodaySheet inAt={[DAWN[1] + 0.1, DAWN[1] + 0.5]} tapAt={99} approach={[98, 98.5]} />
    </TripPhoneScreen>
  );
}

/** 电脑：底座平放，屏幕立起（绕铰链转），屏幕朝着镜头 */
function Laptop3D() {
  const t = useFilmTime();
  const p = PLACE.laptop;
  const at = arrive('laptop');
  const blur = useKeys(t, [2.6, 4.4], [7, 0]);
  const filter = useTransform(blur, (b) => (b > 0.05 ? `blur(${b.toFixed(2)}px)` : 'none'));
  const off = useKeys(t, [DAWN[0] + 0.2, DAWN[1]], [1, 0]);
  const offShown = useShown(off);
  const LID_H = LAPTOP.lidH;
  return (
    <motion.div className="absolute" style={{ left: p.x, top: p.y, width: p.w, height: p.h, rotate: p.rot, transformStyle: 'preserve-3d', opacity: off, visibility: offShown }}>
      {/* 底座（键盘面） */}
      <div className="absolute inset-x-0 bottom-0 rounded-[26px]" style={{ height: 560, background: 'linear-gradient(#D3CFC7, #C2BDB4)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.5)' }}>
        <div className="absolute inset-x-[90px] top-[46px] h-[300px] rounded-[12px] bg-[#2B2627]/85" />
        <div className="absolute left-1/2 top-[380px] h-[150px] w-[440px] -translate-x-1/2 rounded-[14px] bg-[#B9B4AB]" />
      </div>
      {/* 屏幕：铰链在底座远端，立起约 100° */}
      <motion.div
        className="absolute"
        style={{ left: (p.w - LAPTOP.lidW) / 2, bottom: 560, width: LAPTOP.lidW, height: LID_H, transformOrigin: '50% 100%', rotateX: -78, filter }}
      >
        <Glass id="laptop" radius={30} bezel={24} inner={8}>
          <TripLaptopScreen updateAt={at} open={at - 0.1} />
        </Glass>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 片名字 ═════════════════════ */

function Titles() {
  const t = useFilmTime();
  const a = useKeys(t, [5.0, 5.5, DAWN[0] - 0.1, DAWN[0] + 0.3], [0, 1, 1, 0]);
  const aShown = useShown(a);
  const b = useKeys(t, [7.25, 7.75], [0, 1]);
  const bShown = useShown(b);
  const color = useTransform(t, [DAWN[0], DAWN[1]], ['#FFFFF9', '#241E20']);
  return (
    <div className="pointer-events-none absolute inset-0">
      <motion.h2 className="absolute left-[7vw] top-[6vh] font-serif text-[min(4.2vw,80px)] font-semibold leading-[1.1] tracking-[-0.02em]" style={{ opacity: a, visibility: aShown, color }}>
        每一块屏，<span className="text-[#FF6A3D]">同一个版本</span>。
      </motion.h2>
      <motion.div className="absolute left-[7vw] top-[8vh]" style={{ opacity: b, visibility: bShown, color }}>
        <p className="font-serif text-[min(4.2vw,80px)] font-semibold leading-[1.1] tracking-[-0.02em]">9 月 24 日</p>
        <p className="mt-4 text-[min(1.35vw,26px)] opacity-70">出发当天 · 清晨</p>
      </motion.div>
    </div>
  );
}

