'use client';

import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { TRIPS } from '@/data/trip';
import { clamp01, ease, useFadeStyle, useFadeVisibility, useRange, useReduced } from '@/lib/motion';
import { T, STAGE_CAMERA, sec } from './timeline';
import { useProgress } from './primitives';
import { Badge, CatMark, CatTile } from './ui';
import { RouteGlyph } from './RouteGlyph';
import { NARROW_WIN, useLensCamera } from './camera';
import { CamRootContext, FlightLayer, type FlightSpec } from './flight';
import { CarIcon, CheckIcon, HeightIcon, NavigationIcon, ParkingIcon, WalkIcon } from '@/components/common/Icons';

/**
 * 04 幕 · 全家的每一块屏幕（导演版 B，SHOWCASE §4.2 幕 04 第 3–5 步）
 *
 * 看了五十秒的视窗，镜头拉远才发现它只是「我的电脑」：旁边是领队的手机、阿杰的手机、小雨的平板，
 * 还有一个空着的位置——车机导航，出发当天才接上。
 *   阿杰在自己的手机上提名夜市 → 领队的手机收到，AI 只算代价 → 领队点「加入 D0 晚上」→
 *   涟漪从这部手机扩散，波前到哪块屏、哪块屏插入 20:00 并翻到 v1.1 →
 *   时间卡「9 月 24 日 · 出发当天」→ 车机屏亮起 → 领队再点「投递到车机导航」→ 车机导航自己的界面接手今天的路线，
 *   终点是黄河边酒店的地面停车场入口（01 幕「总高 2.28 米」的伏笔在这里落地）→ 全景停住 → 镜头回到电脑。
 *
 * 能力边界（PRD-01 §5、docs/02 §2.1）：车机只演示「路线投递到车机导航，由车机导航引导」——屏上只有车机导航的界面与路线，
 * 不出现车速、电量、档位与领航辅助；投递是领队再点一下（深链），不是自动同步；车高写明来自需求画像。
 * 车机导航不是 TripCraft：界面用中性的样式，路线是交通类的蓝色，只在角上标「来自 TripCraft」。
 *
 * 版式：宽视窗按 840×660 的设计稿排、整体按视窗宽度缩放；手机布局按 335×620 另排一套（视窗本身就是「我的手机」，
 * 提名与「今天的路线」以视窗里的底部抽屉出现，镜头推近这扇缩小的视窗时它恢复接近原大）。两种布局同一套节拍。
 * 设备里的字按设计稿写（≥ 12px），拉远时是画面、推近时恢复原大；每块屏下面的标签不随设计稿缩放，任何时候都清楚。
 * 视窗满幅时这一层完全透明，视窗与之前一模一样；减弱动态效果时揭幕与回到电脑都是硬切，静帧停在全景。
 */

type DeviceId = 'window' | 'hero' | 'ajie' | 'xiaoyu' | 'laptop' | 'car';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Layout {
  w: number;
  h: number;
  /** 视窗缩进去的位置 */
  window: Rect;
  /** 涟漪从哪里出发（领队的手机） */
  heroCenter: [number, number];
  devices: Partial<Record<Exclude<DeviceId, 'window'>, Rect>>;
}

/** 宽视窗：左列电脑与车机，中间领队的手机，右列平板与阿杰的手机 */
const WIDE: Layout = {
  w: 840,
  h: 660,
  window: { x: 28, y: 40, w: 352, h: 277 },
  heroCenter: [404 + 116, 120 + 235],
  devices: {
    hero: { x: 404, y: 120, w: 232, h: 470 },
    xiaoyu: { x: 656, y: 40, w: 160, h: 116 },
    ajie: { x: 680, y: 236, w: 120, h: 244 },
    car: { x: 28, y: 396, w: 352, h: 160 },
  },
};

/** 手机布局：上排电脑与平板，中间是视窗（我的手机）与阿杰的手机，最下面是车机 */
const NARROW: Layout = {
  w: 335,
  h: 620,
  window: { x: 10, y: 150, w: 162, h: 300 },
  heroCenter: [10 + 81, 150 + 150],
  devices: {
    laptop: { x: 10, y: 16, w: 150, h: 104 },
    xiaoyu: { x: 178, y: 22, w: 147, h: 98 },
    ajie: { x: 192, y: 172, w: 112, h: 228 },
    car: { x: 10, y: 480, w: 315, h: 118 },
  },
};

const center = (r: Rect): [number, number] => [r.x + r.w / 2, r.y + r.h / 2];

/** 每台设备在涟漪里的先后：到领队手机的距离 / 最远距离（0 → 1） */
function waveOrder(layout: Layout): Record<DeviceId, number> {
  const [hx, hy] = layout.heroCenter;
  const all: [DeviceId, Rect][] = [['window', layout.window], ...(Object.entries(layout.devices) as [DeviceId, Rect][])];
  const dist = all.map(([id, r]) => {
    const [cx, cy] = center(r);
    return [id, Math.hypot(cx - hx, cy - hy)] as const;
  });
  const max = Math.max(...dist.map(([, d]) => d)) || 1;
  const out = {} as Record<DeviceId, number>;
  for (const [id, d] of dist) out[id] = d / max;
  return out;
}

const WAVE_ORDER = { wide: waveOrder(WIDE), narrow: waveOrder(NARROW) };

/** 波前到达的时刻（全局进度）：从点下开始，最远的一块屏 0.85 秒后收到 */
const arrival = (order: number) => T.applyClick + sec(0.08) + sec(0.85) * order;

interface ConstellationValue {
  narrow: boolean;
  /** 这块屏翻到 v1.1 的时刻（全局进度）。视窗在宽视窗是「我的电脑」，在手机布局就是领队的手机 */
  updateAt: (id: DeviceId) => number;
}

const ConstellationContext = createContext<ConstellationValue>({
  narrow: false,
  updateAt: (id) => arrival(WAVE_ORDER.wide[id] ?? 0),
});

/** 视窗里的界面（行程空间）按同一个波前更新：插入 20:00、版本号、同步列表 */
export const useConstellation = () => useContext(ConstellationContext);

/** 揭幕程度：0 = 视窗满幅，1 = 缩进「我的电脑」的位置。减弱动态效果时在区间中点硬切 */
function useReveal() {
  const p = useProgress();
  const reduced = useReduced();
  const [a, b] = T.reveal;
  const [c, d] = T.return;
  return useTransform(p, (v) => {
    if (reduced) return v >= (a + b) / 2 && v < (c + d) / 2 ? 1 : 0;
    if (v <= a || v >= d) return 0;
    if (v < b) return ease.smooth((v - a) / (b - a));
    if (v <= c) return 1;
    return 1 - ease.smooth((v - c) / (d - c));
  });
}

export function ConstellationStage({ children }: { children: ReactNode }) {
  const p = useProgress();
  const boxRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 840, h: 660 });

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => setBox({ w: el.offsetWidth || 840, h: el.offsetHeight || 660 });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const narrow = box.w < NARROW_WIN;
  const layout = narrow ? NARROW : WIDE;
  const k = box.w / layout.w;
  const oy = Math.max(0, (box.h - layout.h * k) / 2);
  const px = (r: Rect): Rect => ({ x: r.x * k, y: oy + r.y * k, w: r.w * k, h: r.h * k });

  // 视窗缩进去：按「装进去」的比例缩放，水平居中、顶端对齐
  const slot = px(layout.window);
  const ws = Math.min(slot.w / box.w, slot.h / box.h);
  const geom = useRef({ tx: 0, ty: 0, s: 1 });
  geom.current = { tx: slot.x + (slot.w - box.w * ws) / 2, ty: slot.y, s: ws };

  const reveal = useReveal();
  const winX = useTransform(reveal, (r) => geom.current.tx * r);
  const winY = useTransform(reveal, (r) => geom.current.ty * r);
  const winScale = useTransform(reveal, (r) => 1 + (geom.current.s - 1) * r);
  // 拉远之后才裁切：视窗满幅时它的投影伸出舞台，不能被裁掉
  const clip = useTransform(reveal, (r) => (r > 0.92 ? 'inset(0 round 18px)' : 'none'));
  const backdrop = useTransform(reveal, (r) => clamp01(r * 1.4));
  const backdropVisibility = useFadeVisibility(backdrop);

  const cam = useLensCamera(p, STAGE_CAMERA, layerRef);

  const value = useMemo<ConstellationValue>(
    () => ({ narrow, updateAt: (id) => arrival(WAVE_ORDER[narrow ? 'narrow' : 'wide'][id] ?? 0) }),
    [narrow],
  );

  const flights = useMemo(() => stageFlights(), []);

  return (
    <ConstellationContext.Provider value={value}>
      <motion.div
        ref={boxRef}
        className="relative h-[620px] w-full sm:h-[640px] lg:h-[660px]"
        style={{ clipPath: clip, WebkitClipPath: clip }}
      >
        {/* 舞台底：视窗缩进去之后露出来的一块浅色平铺 */}
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-[18px] border border-[#E4E2DA] bg-[#F8F7F3]"
          style={{ opacity: backdrop, visibility: backdropVisibility }}
        />

        <CamRootContext.Provider value={layerRef}>
          <motion.div
            ref={layerRef}
            className="absolute inset-0"
            style={{ x: cam.x, y: cam.y, scale: cam.scale, transformOrigin: '0 0' }}
          >
            {/* 视窗缩进去的位置：镜头与飞行用它找「我的电脑」（手机布局就是领队的手机） */}
            <span aria-hidden data-cam={narrow ? 'dev-hero' : 'dev-window'} className="absolute" style={{ left: slot.x, top: slot.y, width: slot.w, height: slot.h }} />

            <motion.div className="absolute inset-0" style={{ x: winX, y: winY, scale: winScale, transformOrigin: '0 0' }}>
              {children}
            </motion.div>

            <Ripple origin={[layout.heroCenter[0] * k, oy + layout.heroCenter[1] * k]} radius={Math.hypot(box.w, box.h)} />

            {(Object.entries(layout.devices) as [Exclude<DeviceId, 'window'>, Rect][]).map(([id, r], i) => (
              <Device key={id} id={id} rect={px(r)} k={k} index={i} />
            ))}

            <DeviceLabel id="window" rect={slot} />
            <FlightLayer flights={flights} epoch={cam.epoch} />
          </motion.div>
        </CamRootContext.Provider>

        <TimeCard />
      </motion.div>
    </ConstellationContext.Provider>
  );
}

/* ═════════════════════ 涟漪：从领队的手机扩散，最远的一块屏 0.85 秒后收到 ═════════════════════ */

function Ripple({ origin, radius }: { origin: [number, number]; radius: number }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full overflow-visible" style={{ zIndex: 5 }}>
      <RippleRing origin={origin} radius={radius} delay={0} width={2} />
      <RippleRing origin={origin} radius={radius} delay={0.18} width={1} />
    </svg>
  );
}

/** 一道波纹：半径先快后慢地长到最远的一块屏，透明度随之变淡；减弱动态效果时不画 */
function RippleRing({ origin, radius, delay, width }: { origin: [number, number]; radius: number; delay: number; width: number }) {
  const p = useProgress();
  const reduced = useReduced();
  const t0 = T.wave[0] + sec(delay);
  const t1 = t0 + sec(1.05);
  const r = useRange(p, [t0, t1], [0, radius * 0.62], { easing: ease.out });
  const opacity = useRange(p, [t0 - sec(0.01), t0, t1 - sec(0.35), t1], [0, reduced ? 0 : 0.85, reduced ? 0 : 0.25, 0]);
  const visibility = useFadeVisibility(opacity);
  return <motion.circle cx={origin[0]} cy={origin[1]} fill="none" stroke="#FE3C01" strokeWidth={width} style={{ r, opacity, visibility }} />;
}

/* ═════════════════════ 设备 ═════════════════════ */

const LABELS: Record<DeviceId, { who: string; wide?: string; narrow?: string }> = {
  window: { who: '', wide: '我的电脑', narrow: '我的手机 · 领队' },
  hero: { who: '我的手机 · 领队' },
  ajie: { who: '阿杰的手机' },
  xiaoyu: { who: '小雨的平板' },
  laptop: { who: '我的电脑' },
  car: { who: '车机导航 · 腾势 D9' },
};

/** 设备随揭幕依次出现 */
function useAppear(index: number) {
  const p = useProgress();
  const at = T.reveal[0] + sec(0.45) + sec(0.12) * index;
  const [out] = T.return;
  const opacity = useRange(p, [at, at + sec(0.3), out, out + sec(0.35)], [0, 1, 1, 0]);
  const y = useRange(p, [at, at + sec(0.4)], [14, 0], { easing: ease.out, rest: 0 });
  const visibility = useFadeVisibility(opacity);
  return { opacity, y, visibility };
}

function Device({ id, rect, k, index }: { id: Exclude<DeviceId, 'window'>; rect: Rect; k: number; index: number }) {
  const { narrow } = useConstellation();
  const appear = useAppear(index);
  const design = (narrow ? NARROW : WIDE).devices[id]!;
  return (
    <>
      <motion.div
        data-cam={`dev-${id}`}
        data-ui="app"
        className="absolute text-ui-ink"
        style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: appear.opacity, y: appear.y, visibility: appear.visibility, zIndex: id === 'hero' ? 20 : 10 }}
      >
        <div className="absolute left-0 top-0" style={{ width: design.w, height: design.h, transform: `scale(${k})`, transformOrigin: '0 0' }}>
          {id === 'hero' ? <HeroPhone /> : null}
          {id === 'ajie' ? <AjiePhone /> : null}
          {id === 'xiaoyu' ? <Tablet compact={narrow} /> : null}
          {id === 'laptop' ? <MiniLaptop /> : null}
          {id === 'car' ? <CarNav compact={narrow} /> : null}
        </div>
      </motion.div>
      <DeviceLabel id={id} rect={rect} appear={appear} />
    </>
  );
}

/** 屏下标签：谁的、现在是哪个版本（不随设计稿缩放，任何时候都清楚） */
function DeviceLabel({ id, rect, appear }: { id: DeviceId; rect: Rect; appear?: ReturnType<typeof useAppear> }) {
  const p = useProgress();
  const { narrow, updateAt } = useConstellation();
  const reveal = useReveal();
  const own = useFadeVisibility(reveal);
  const at = id === 'car' ? T.carRoute[0] : updateAt(id);
  const v11 = useRange(p, [at - sec(0.02), at], [0, 1]);
  const v10 = useTransform(v11, (v) => 1 - v);
  const v11Visibility = useFadeVisibility(v11);
  const v10Visibility = useFadeVisibility(v10);
  const name = LABELS[id].who || (narrow ? LABELS[id].narrow : LABELS[id].wide);
  const style = appear ? { opacity: appear.opacity, y: appear.y, visibility: appear.visibility } : { opacity: reveal, visibility: own };
  return (
    <motion.p
      className="absolute flex items-center gap-1.5 whitespace-nowrap text-[13px] leading-5 text-[#241E20]/75"
      style={{ left: rect.x, top: rect.y + rect.h + 6, zIndex: 25, ...style }}
    >
      <span className="font-medium text-[#241E20]">{name}</span>
      <span className="relative inline-flex h-5 items-center">
        {id === 'car' ? (
          <>
            <motion.span style={{ opacity: v10, visibility: v10Visibility }}>
              未连接
            </motion.span>
            <motion.span className="absolute left-0 inline-flex items-center gap-1 whitespace-nowrap font-medium text-[#0E7A5A]" style={{ opacity: v11, visibility: v11Visibility }}>
              <CheckIcon className="h-3 w-3" />
              已收到今天的路线
            </motion.span>
          </>
        ) : (
          <>
            <motion.span className="tabular-nums" style={{ opacity: v10, visibility: v10Visibility }}>
              v1.0
            </motion.span>
            <motion.span className="absolute left-0 inline-flex items-center gap-1 font-medium tabular-nums text-[#0E7A5A]" style={{ opacity: v11, visibility: v11Visibility }}>
              <CheckIcon className="h-3 w-3" />
              v1.1
            </motion.span>
          </>
        )}
      </span>
    </motion.p>
  );
}

/* ── 外壳 ── */

function PhoneFrame({ children, small = false }: { children: ReactNode; small?: boolean }) {
  return (
    <div className={`absolute inset-0 bg-[#241E20] shadow-[0_22px_44px_-20px_rgba(36,30,32,0.45)] ${small ? 'rounded-[22px] p-[4px]' : 'rounded-[32px] p-[6px]'}`}>
      <div className={`relative h-full w-full overflow-hidden bg-ui-panel ${small ? 'rounded-[18px]' : 'rounded-[26px]'}`}>
        <span aria-hidden className={`absolute left-1/2 z-30 -translate-x-1/2 rounded-full bg-[#241E20] ${small ? 'top-1.5 h-[7px] w-8' : 'top-2 h-[9px] w-14'}`} />
        {children}
      </div>
    </div>
  );
}

/** 小屏的头部：行程名 + 版本号（到达波前时翻到 v1.1） */
function MiniHeader({ id, size = 'md' }: { id: DeviceId; size?: 'sm' | 'md' }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt(id);
  const v11 = useRange(p, [at - sec(0.02), at], [0, 1]);
  const v10 = useTransform(v11, (v) => 1 - v);
  const v11Visibility = useFadeVisibility(v11);
  const v10Visibility = useFadeVisibility(v10);
  return (
    <div className={`flex items-center gap-1.5 ${size === 'md' ? 'px-3 pt-7' : 'px-2 pt-4'}`}>
      {size === 'md' ? <RouteGlyph trip={TRIPS[0]} className="h-7 w-7 shrink-0 rounded-[7px]" /> : null}
      <span className={`min-w-0 flex-1 truncate font-semibold ${size === 'md' ? 'text-[15px]' : 'text-xs'}`}>西行计划</span>
      <span className="relative inline-flex">
        <motion.span style={{ opacity: v10, visibility: v10Visibility }}>
          {size === 'md' ? <Badge>v1.0</Badge> : <span className="text-xs tabular-nums text-ui-ink-3">v1.0</span>}
        </motion.span>
        <motion.span className="absolute right-0 top-0" style={{ opacity: v11, visibility: v11Visibility }}>
          {size === 'md' ? <Badge tone="success">v1.1</Badge> : <span className="text-xs font-medium tabular-nums text-ui-success">v1.1</span>}
        </motion.span>
      </span>
    </div>
  );
}

/** D0 的几行：波前到达时插入 20:00 正宁路夜市（橙色底亮一下） */
function MiniD0({ id, size = 'md' }: { id: DeviceId; size?: 'sm' | 'md' }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt(id);
  const row = size === 'md' ? 28 : 20;
  const height = useRange(p, [at, at + sec(0.3)], [0, row]);
  const fade = useFadeStyle(p, at + sec(0.08), at + sec(0.3));
  const glow = useRange(p, [at + sec(0.15), at + sec(0.35), at + sec(1.6)], [0, 1, 0.25]);
  const md = size === 'md';
  return (
    <div className={md ? 'mx-3 mt-3 rounded-ui-card border border-ui-line bg-ui-surface p-2.5' : 'mx-2 mt-2'}>
      {md ? (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold">
          <span className="rounded-full bg-ui-ink px-1.5 text-xs leading-5 text-white">D0</span>
          9/24 · 兰州
        </p>
      ) : null}
      <ul className={md ? 'mt-1.5 flex flex-col' : 'flex flex-col'}>
        <MiniRow md={md} time="14:30" text={md ? '中川机场取车' : '取车'} cat="transport" />
        <MiniRow md={md} time="19:15" text={md ? '入住 · 地面车位' : '入住'} cat="stay" />
        <motion.li className="relative overflow-hidden" style={{ height }}>
          <motion.span aria-hidden className="absolute inset-0 rounded-ui-ctl bg-ui-accent/10" style={{ opacity: glow }} />
          <motion.span className="relative block" style={fade}>
            <MiniRowBody md={md} time="20:00" text={md ? '正宁路夜市' : '夜市'} cat="food" accent />
          </motion.span>
        </motion.li>
      </ul>
    </div>
  );
}

function MiniRow(props: { md: boolean; time: string; text: string; cat: 'transport' | 'stay' | 'food' }) {
  return (
    <li>
      <MiniRowBody {...props} />
    </li>
  );
}

function MiniRowBody({ md, time, text, cat, accent = false }: { md: boolean; time: string; text: string; cat: 'transport' | 'stay' | 'food'; accent?: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 text-xs ${md ? 'h-7' : 'h-5'}`}>
      <span className={`shrink-0 tabular-nums ${accent ? 'font-semibold text-ui-accent-ink' : 'text-ui-ink-3'}`}>{time}</span>
      {md ? <CatMark cat={cat} size={16} /> : null}
      <span className={`min-w-0 truncate ${accent ? 'font-medium' : ''} ${md ? 'text-[13px]' : ''}`}>{text}</span>
    </span>
  );
}

/** 从下往上滑出的抽屉（手机里的一张卡） */
function Sheet({ range, children }: { range: readonly [number, number, number, number]; children: ReactNode }) {
  const p = useProgress();
  const [a, b, c, d] = range;
  const y = useRange(p, [a, b, c, d], [105, 0, 0, 105], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const opacity = useRange(p, [a - sec(0.01), a, d, d + sec(0.01)], [0, 1, 1, 0]);
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.div className="ui-float absolute inset-x-0 bottom-0 z-20 rounded-t-[22px] !border-x-0 !border-b-0 px-3 pb-4 pt-2" style={{ y: yPct, opacity, visibility }}>
      <span aria-hidden className="mx-auto mb-2.5 block h-1 w-8 rounded-full bg-ui-line-strong" />
      {children}
    </motion.div>
  );
}

/** 手指点一下：手机上不画箭头光标，画一个按下去的指尖 */
function Touch({ approach, at, className = '' }: { approach: readonly [number, number]; at: number; className?: string }) {
  const p = useProgress();
  const reduced = useReduced();
  const [a, b] = approach;
  const opacity = useRange(p, [a, b, at + sec(0.25), at + sec(0.45)], [0, reduced ? 0 : 0.9, reduced ? 0 : 0.9, 0]);
  const visibility = useFadeVisibility(opacity);
  const scale = useRange(p, [b, at - sec(0.06), at, at + sec(0.15)], [1.25, 1, 0.82, 1], { rest: 1 });
  const ring = useRange(p, [at, at + sec(0.45)], [0.6, 1.9], { easing: ease.out });
  const ringOpacity = useRange(p, [at - sec(0.01), at, at + sec(0.45)], [0, reduced ? 0 : 0.6, 0]);
  return (
    <motion.span aria-hidden className={`pointer-events-none absolute z-40 h-7 w-7 -translate-x-1/2 -translate-y-1/2 ${className}`} style={{ opacity, visibility }}>
      <motion.span className="absolute inset-0 rounded-full border-2 border-ui-accent" style={{ scale: ring, opacity: ringOpacity }} />
      <motion.span className="absolute inset-0 rounded-full bg-[#241E20]/35 ring-2 ring-white/80" style={{ scale }} />
    </motion.span>
  );
}

/** 按钮按下去的状态：点之前一个样子，点之后另一个样子 */
function TwoState({ at, before, after }: { at: number; before: ReactNode; after: ReactNode }) {
  const p = useProgress();
  const done = useRange(p, [at, at + sec(0.06)], [0, 1]);
  const not = useTransform(done, (v) => 1 - v);
  const doneVisibility = useFadeVisibility(done);
  const notVisibility = useFadeVisibility(not);
  return (
    <span className="relative grid">
      <motion.span className="col-start-1 row-start-1" style={{ opacity: not, visibility: notVisibility }}>
        {before}
      </motion.span>
      <motion.span className="col-start-1 row-start-1" style={{ opacity: done, visibility: doneVisibility }}>
        {after}
      </motion.span>
    </span>
  );
}

/* ── 领队的手机（宽视窗）：收到提名 → AI 算代价 → 加入 D0 晚上 → 今天的路线 → 投递到车机导航 ── */

const HERO_DAYS = [
  { title: '兰州 → 张掖', cat: 'nature' },
  { title: '七彩丹霞 → 嘉峪关', cat: 'nature' },
  { title: '嘉峪关 → 敦煌', cat: 'service' },
  { title: '莫高窟', cat: 'sight' },
  { title: '鸣沙山 · 月牙泉', cat: 'nature' },
  { title: '阳关 · 玉门关', cat: 'sight' },
] as const;

function HeroPhone() {
  const p = useProgress();
  const banner = useRange(p, [T.heroBanner[0], T.heroBanner[1], T.nominationIn[1] + sec(0.6), T.nominationIn[1] + sec(0.9)], [0, 1, 1, 0]);
  const bannerY = useRange(p, [T.heroBanner[0], T.heroBanner[1]], [-16, 0], { easing: ease.out, rest: 0 });
  const bannerVisibility = useFadeVisibility(banner);
  return (
    <PhoneFrame>
      <MiniHeader id="hero" />
      <p className="px-3 pt-0.5 text-xs text-ui-ink-3">河西走廊 · 9/24–10/2 · 领队：我</p>
      <MiniD0 id="hero" />
      <ul className="mx-3 mt-2 flex flex-col">
        {HERO_DAYS.map((d, i) => (
          <li key={d.title} className="flex h-8 items-center gap-2 border-b border-ui-line text-[13px] last:border-b-0">
            <CatTile cat={d.cat} size={22} />
            <span className="w-5 shrink-0 text-xs font-semibold tabular-nums text-ui-ink-3">D{i + 1}</span>
            <span className="min-w-0 truncate">{d.title}</span>
          </li>
        ))}
      </ul>

      <motion.div
        className="ui-float absolute inset-x-2 top-6 z-30 flex items-center gap-2 rounded-[14px] px-2.5 py-2"
        style={{ opacity: banner, y: bannerY, visibility: bannerVisibility }}
      >
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0D8C87] text-xs font-semibold text-white">阿</span>
        <span className="min-w-0 text-xs leading-4">
          <span className="block font-semibold">阿杰 提名了一个地点</span>
          <span className="block truncate text-ui-ink-3">正宁路夜市 · 今晚</span>
        </span>
      </motion.div>

      <Sheet range={[T.nominationIn[0], T.nominationIn[1], T.nominationSheetOut[0], T.nominationSheetOut[1]]}>
        <HeroNomination />
      </Sheet>
      <Sheet range={T.routeSheet}>
        <HeroRoute />
      </Sheet>
    </PhoneFrame>
  );
}

/** 一条评估：图形 + 结论（通过 / 需要注意） */
function EvalLine({ at, ok, icon, children }: { at: number; ok: boolean; icon: ReactNode; children: ReactNode }) {
  const p = useProgress();
  const fade = useFadeStyle(p, at, at + sec(0.25));
  const x = useRange(p, [at, at + sec(0.3)], [6, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.li className="flex items-start gap-1.5 text-xs leading-4" style={{ ...fade, x }}>
      <span className={`mt-px flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-ui-success/10 text-ui-success' : 'bg-[#B45309]/10 text-[#B45309]'}`}>{icon}</span>
      <span className="min-w-0 flex-1">{children}</span>
    </motion.li>
  );
}

function HeroNomination() {
  const [e0, e1, e2] = T.evalRows;
  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <CatTile cat="food" size={30} />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">正宁路夜市 · 赵记醪糟</span>
          <span className="block truncate text-xs text-ui-ink-3">阿杰提名 · D0 晚上</span>
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-ui-ink-3">AI 只算代价，不替大家决定</p>
      <ul className="mt-1 flex flex-col gap-1">
        <EvalLine at={e0} ok icon={<WalkIcon className="h-2.5 w-2.5" />}>
          离酒店步行 950 m
        </EvalLine>
        <EvalLine at={e1} ok icon={<CarIcon className="h-2.5 w-2.5" />}>
          不增加车程
        </EvalLine>
        <EvalLine at={e2} ok={false} icon={<HeightIcon className="h-2.5 w-2.5" />}>
          地库限高 2.0 m：车停酒店地面车位
        </EvalLine>
      </ul>
      <div className="relative mt-2.5 flex justify-end gap-1.5">
        <span className="ui-btn ui-btn-secondary !h-8 !px-2.5 !text-xs">暂不</span>
        <span className="relative">
          <TwoState
            at={T.applyClick}
            before={<span className="ui-btn ui-btn-primary !h-8 !px-2.5 !text-xs">加入 D0 晚上</span>}
            after={
              <span className="ui-btn ui-btn-secondary !h-8 !px-2.5 !text-xs !text-ui-success">
                <CheckIcon className="h-3 w-3" />
                已加入
              </span>
            }
          />
          <Touch approach={T.applyCursor} at={T.applyClick} className="left-1/2 top-1/2" />
        </span>
      </div>
    </div>
  );
}

function HeroRoute() {
  return (
    <div className="relative">
      <p className="text-xs font-medium text-ui-ink-3">今天的路线 · 9/24 · D0</p>
      <ol className="mt-1.5 flex flex-col">
        <li className="flex h-7 items-center gap-2 text-[13px]">
          <CatMark cat="transport" size={18} />
          <span className="min-w-0 truncate">中川机场 · 取车</span>
        </li>
        <li className="flex h-7 items-center gap-2 text-[13px]">
          <CatMark cat="stay" size={18} />
          <span className="min-w-0 truncate font-medium">黄河边酒店 · 地面停车场入口</span>
        </li>
      </ol>
      <p className="mt-1 flex flex-wrap items-center gap-x-1 rounded-ui-ctl bg-ui-accent/10 px-2 py-0.5 text-xs leading-5 text-ui-accent-ink">
        <HeightIcon className="h-3 w-3 shrink-0" />
        {/* 只在两段之间折行，「2.0 m」这样的数字和单位不拆开 */}
        <span className="whitespace-nowrap">车高 2.28 m（画像）</span>
        <span className="whitespace-nowrap">· 不进 2.0 m 地库</span>
      </p>
      <div className="relative mt-2.5">
        <TwoState
          at={T.dispatchClick}
          before={
            <span className="ui-btn ui-btn-primary !h-9 w-full !text-xs">
              <NavigationIcon className="h-3.5 w-3.5" />
              投递到车机导航
            </span>
          }
          after={
            <span className="ui-btn ui-btn-secondary !h-9 w-full !text-xs !text-ui-success">
              <CheckIcon className="h-3.5 w-3.5" />
              已投递 · 由车机导航带路
            </span>
          }
        />
        <Touch approach={T.dispatchCursor} at={T.dispatchClick} className="left-1/2 top-1/2" />
      </div>
    </div>
  );
}

/* ── 阿杰的手机：先在这里提名，信物飞向领队的手机；随后跟着波前更新 ── */

function AjiePhone() {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const [c0, c1] = T.ajieCompose;
  const compose = useRange(p, [c0, c1, T.ajieTap + sec(0.5), T.ajieTap + sec(0.8)], [0, 1, 1, 0]);
  const composeVisibility = useFadeVisibility(compose);
  const at = updateAt('ajie');
  const joined = useFadeStyle(p, at + sec(0.2), at + sec(0.45));
  return (
    <PhoneFrame small>
      <MiniHeader id="ajie" size="sm" />
      <MiniD0 id="ajie" size="sm" />
      <motion.div className="ui-float absolute inset-x-1.5 bottom-2 z-20 rounded-[12px] p-2" style={{ opacity: compose, visibility: composeVisibility }}>
        <p className="truncate text-xs font-semibold">提名 · 正宁路夜市</p>
        <div className="relative mt-1.5">
          <TwoState
            at={T.ajieTap}
            before={<span className="ui-btn ui-btn-primary !h-7 w-full !px-2 !text-xs">提交</span>}
            after={<span className="ui-btn ui-btn-secondary !h-7 w-full !px-2 !text-xs">已提交</span>}
          />
          <Touch approach={[T.ajieTap - sec(0.35), T.ajieTap - sec(0.08)]} at={T.ajieTap} className="left-1/2 top-1/2" />
        </div>
      </motion.div>
      <motion.p className="absolute inset-x-2 bottom-2 flex items-center gap-1 text-xs font-medium text-ui-success" style={joined}>
        <CheckIcon className="h-3 w-3 shrink-0" />
        <span className="truncate">已加入 D0</span>
      </motion.p>
    </PhoneFrame>
  );
}

/* ── 小雨的平板 ── */

function Tablet({ compact }: { compact: boolean }) {
  return (
    <div className="absolute inset-0 rounded-[16px] bg-[#241E20] p-[5px] shadow-[0_18px_36px_-18px_rgba(36,30,32,0.4)]">
      <div className="relative flex h-full w-full gap-2 overflow-hidden rounded-[12px] bg-ui-panel p-2">
        {/* 封面留出右边的宽度：「西行计划 v1.1」一行放得下，版本号翻转看得见 */}
        <RouteGlyph trip={TRIPS[0]} className={`shrink-0 rounded-[8px] ${compact ? 'h-10 w-10' : 'h-12 w-12'}`} />
        <div className="min-w-0 flex-1">
          <MiniHeaderInline id="xiaoyu" />
          <MiniD0Inline id="xiaoyu" />
        </div>
      </div>
    </div>
  );
}

/** 平板与小电脑里的头部：一行行程名 + 版本 */
function MiniHeaderInline({ id }: { id: DeviceId }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt(id);
  const v11 = useRange(p, [at - sec(0.02), at], [0, 1]);
  const v10 = useTransform(v11, (v) => 1 - v);
  const v11Visibility = useFadeVisibility(v11);
  const v10Visibility = useFadeVisibility(v10);
  return (
    <p className="flex items-center gap-1 text-xs font-semibold">
      <span className="min-w-0 truncate">西行计划</span>
      <span className="relative ml-auto inline-flex shrink-0">
        <motion.span className="text-ui-ink-3" style={{ opacity: v10, visibility: v10Visibility }}>
          v1.0
        </motion.span>
        <motion.span className="absolute right-0 text-ui-success" style={{ opacity: v11, visibility: v11Visibility }}>
          v1.1
        </motion.span>
      </span>
    </p>
  );
}

function MiniD0Inline({ id }: { id: DeviceId }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt(id);
  const height = useRange(p, [at, at + sec(0.3)], [0, 20]);
  const fade = useFadeStyle(p, at + sec(0.08), at + sec(0.3));
  return (
    <ul className="mt-1 flex flex-col text-xs">
      <li className="flex h-5 items-center gap-1">
        <span className="tabular-nums text-ui-ink-3">19:15</span>
        <span className="truncate">入住</span>
      </li>
      <motion.li className="overflow-hidden" style={{ height }}>
        <motion.span className="flex h-5 items-center gap-1" style={fade}>
          <span className="font-semibold tabular-nums text-ui-accent-ink">20:00</span>
          <span className="truncate font-medium">夜市</span>
        </motion.span>
      </motion.li>
    </ul>
  );
}

/* ── 手机布局里的「我的电脑」（宽视窗里它就是缩进去的视窗） ── */

function MiniLaptop() {
  return (
    <div className="absolute inset-0">
      <div className="absolute inset-x-[6px] top-0 bottom-[12px] rounded-[10px] bg-[#241E20] p-[4px] shadow-[0_14px_28px_-16px_rgba(36,30,32,0.45)]">
        <div className="h-full w-full overflow-hidden rounded-[7px] bg-ui-shell p-2">
          <div className="h-full rounded-[6px] border border-ui-line bg-ui-panel p-1.5">
            <MiniHeaderInline id="laptop" />
            <MiniD0Inline id="laptop" />
          </div>
        </div>
      </div>
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-[12px] rounded-b-[8px] rounded-t-[2px] bg-[#C9C6BE]" />
    </div>
  );
}

/* ═════════════════════ 车机导航：出发当天接上，收到今天的路线后由它带路 ═════════════════════ */

/** 车机导航不是 TripCraft 的界面：中性底色、交通蓝的路线，只在角上标「来自 TripCraft」 */
function CarNav({ compact }: { compact: boolean }) {
  const p = useProgress();
  const [i0, i1] = T.carIn;
  const lit = useRange(p, [i0, i1], [0, 1]);
  const litVisibility = useFadeVisibility(lit);
  const slot = useTransform(lit, (v) => 1 - v);
  const slotVisibility = useFadeVisibility(slot);
  const [r0, r1] = T.carRoute;
  const draw = useRange(p, [r0, r1], [0, 1]);
  const got = useFadeStyle(p, r0, r0 + sec(0.3));
  const idle = useRange(p, [r0 - sec(0.01), r0 + sec(0.2)], [1, 0]);
  const idleVisibility = useFadeVisibility(idle);
  return (
    <div className="absolute inset-0">
      {/* 出发前：空着的位置 */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 rounded-[14px] border-2 border-dashed border-[#D5D2CA] text-[#241E20]/60"
        style={{ opacity: slot, visibility: slotVisibility }}
      >
        <CarIcon className="h-5 w-5" />
        <span className="text-[13px]">出发当天接上</span>
      </motion.div>

      <motion.div className="absolute inset-0 rounded-[14px] bg-[#1C1819] p-[6px] shadow-[0_20px_40px_-20px_rgba(36,30,32,0.5)]" style={{ opacity: lit, visibility: litVisibility }}>
        <div className="relative flex h-full w-full overflow-hidden rounded-[9px] bg-[#EEF1F4]">
          {/* 地图：示意，中性的车机导航配色 */}
          <div className="relative min-w-0 flex-[1.35]">
            <svg viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
              <rect width="200" height="140" fill="#E8ECEF" />
              <path d="M-10 102 C 40 92, 90 110, 210 96" fill="none" stroke="#B9D3EA" strokeWidth="9" strokeLinecap="round" />
              <path d="M30 -10 L 64 150" fill="none" stroke="#FFFFFF" strokeWidth="5" />
              <path d="M-10 46 L 210 38" fill="none" stroke="#FFFFFF" strokeWidth="4" />
              <path d="M150 -10 C 140 40, 150 90, 128 150" fill="none" stroke="#FFFFFF" strokeWidth="4" />
              <path d={CAR_ROUTE} fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
              <motion.path d={CAR_ROUTE} fill="none" stroke="#3A78D2" strokeWidth="5" strokeLinecap="round" style={{ pathLength: draw }} />
              <circle cx="58" cy="16" r="5" fill="#3A78D2" stroke="#FFFFFF" strokeWidth="2.5" />
            </svg>
            <motion.span className="absolute bottom-[14%] left-[60%] flex h-5 w-5 -translate-x-1/2 -translate-y-full items-center justify-center rounded-full bg-[#241E20] text-white ring-2 ring-white" style={got}>
              <ParkingIcon className="h-3 w-3" />
            </motion.span>
            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/80 px-1.5 text-xs leading-5 text-[#5A5557]">示意</span>
          </div>
          {/* 目的地 */}
          <div className="relative flex min-w-0 flex-1 flex-col justify-center border-l border-[#D8DDE2] bg-white px-2.5">
            <p className="text-xs font-medium text-[#5A5557]">车机导航</p>
            <motion.p className="mt-1 text-[13px] text-[#5A5557]" style={{ opacity: idle, visibility: idleVisibility }}>
              未设置目的地
            </motion.p>
            <motion.div className="absolute inset-x-2.5 top-1/2 -translate-y-1/2" style={got}>
              <p className="text-xs text-[#5A5557]">前往</p>
              <p className={`font-semibold leading-snug text-[#241E20] ${compact ? 'text-[13px]' : 'text-[15px]'}`}>黄河边酒店</p>
              <p className="text-xs text-[#241E20]">地面停车场入口</p>
              <p className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-[#3A78D2]/10 px-1.5 text-xs leading-5 text-[#2F63B0]">
                <NavigationIcon className="h-3 w-3" />
                导航中
              </p>
            </motion.div>
            <motion.p className="absolute bottom-1.5 left-2.5 right-2 truncate text-xs text-[#5A5557]" style={got}>
              来自 TripCraft · 西行计划
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/** 车机地图上的路线：中川机场（右上）→ 黄河边酒店地面停车场（左下），示意 */
const CAR_ROUTE = 'M58 16 C 72 40, 92 52, 100 74 S 112 112, 120 120';

/* ═════════════════════ 时间卡：出发当天 ═════════════════════ */

function TimeCard() {
  const p = useProgress();
  const [a, b, c, d] = T.timeCard;
  const opacity = useRange(p, [a, b, c, d], [0, 1, 1, 0]);
  const visibility = useFadeVisibility(opacity);
  const y = useRange(p, [a, b], [8, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.div className="pointer-events-none absolute inset-0 z-[80] flex items-center justify-center" style={{ opacity, visibility }}>
      <span aria-hidden className="absolute inset-0 rounded-[18px] bg-[#FFFFF9]/80" />
      <motion.div className="relative text-center" style={{ y }}>
        <p className="font-serif text-[30px] font-semibold leading-tight tracking-[-0.01em] text-[#241E20] sm:text-[36px]">9 月 24 日</p>
        <p className="mt-2 text-[15px] text-[#241E20]/[0.72] sm:text-[17px]">出发当天 · 14:30 兰州中川机场取车</p>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════ 舞台上的飞行 ═════════════════════ */

function stageFlights(): FlightSpec[] {
  const route: FlightSpec = {
    id: 'to-car',
    from: 'dev-hero',
    to: 'dev-car',
    t: T.carFlight,
    lift: 50,
    scale: [1, 0.85],
    token: (
      <span data-ui="app" className="ui-float inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full pl-1 pr-2.5 text-xs font-medium text-ui-ink !shadow-ui-pop">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3A78D2] text-white">
          <NavigationIcon className="h-3 w-3" />
        </span>
        今天的路线
      </span>
    ),
  };
  return [
    {
      id: 'nominate',
      from: 'dev-ajie',
      to: 'dev-hero',
      t: T.ajieFlight,
      lift: 40,
      scale: [0.9, 1],
      token: (
        <span data-ui="app" className="ui-float inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full pl-1 pr-2.5 text-xs font-medium text-ui-ink !shadow-ui-pop">
          <CatMark cat="food" size={24} />
          提名 · 正宁路夜市
        </span>
      ),
    },
    route,
  ];
}

export type { DeviceId };
