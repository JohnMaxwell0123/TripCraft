'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { layoutRect } from '@/components/stage/camera';
import { CatMark } from '@/components/stage/ui';
import { CheckIcon } from '@/components/common/Icons';
import { FilmClock, useBoxSize, useFilmTime, useKeys, useShown } from '../clock';
import { CAR, CarDisplay, LAPTOP, Laptop, PHONE, Phone, TABLET, Tablet } from '../devices';
import { CarNavScreen, NominationSheet, TripLaptopScreen, TripPhoneScreen, TripTabletScreen } from '../screens';

/**
 * 样片 B ·「一句话」的高潮（实验页 /lab/b，选定方向前的样片，最终 PR 前删除）
 *
 * 黑场里只有一块屏、一个按钮——点下。硬切：巨大的「v1.0」，最后一位滚成橙色的「1」。
 * 四次硬切：领队的手机、电脑、小雨的平板、阿杰的手机——每一块屏里新插入的「20:00 正宁路夜市」都落在画面同一个位置，分毫不差。
 * 再切：四块屏的名字排成一张表，右边是同一个 v1.1。出发当天：切到清晨的冷白，车机导航接手今天的路线。
 * 字是主角：衬线大字在屏幕外（片子的排版）；屏幕里是产品真有的界面。
 */

const DUR = 10;
const TAP = 2.0;
const CUT_V = 2.25;
const ROLL: readonly [number, number] = [2.48, 2.86];
const CUTS = [3.1, 3.52, 3.94, 4.36] as const;
const BOARD = 4.78;
const DAWN = 7.0;
const CAR_CUT = 7.95;
const CAR_ROUTE_T: readonly [number, number] = [8.05, 9.0];

const INK = '#161213';
const PAPER = '#FFFFF9';
const ORANGE_ON_DARK = '#FF6A3D';
const DAWN_BG = '#E7ECEF';

export function SampleB() {
  return (
    <FilmClock duration={DUR}>
      <Stage />
    </FilmClock>
  );
}

/** 一个镜头：[a, b) 之间可见，硬切 */
function useCut(a: number, b: number) {
  const t = useFilmTime();
  const o = useKeys(t, [a - 0.001, a, b - 0.001, b], [0, 1, 1, 0], ease.linear);
  return { opacity: o, visibility: useShown(o) };
}

function Stage() {
  const t = useFilmTime();
  const boxRef = useRef<HTMLDivElement>(null);
  const view = useBoxSize(boxRef);
  const bg = useKeys(t, [DAWN - 0.001, DAWN], [0, 1], ease.linear);
  const bgColor = useTransform(bg, (v) => (v > 0.5 ? DAWN_BG : INK));
  return (
    <motion.div ref={boxRef} className="fixed inset-0 overflow-hidden" style={{ background: bgColor }}>
      <ButtonShot view={view} />
      <VersionShot />
      <RowCut index={0} dev="hero" view={view} name="我的手机 · 领队" />
      <RowCut index={1} dev="laptop" view={view} name="我的电脑" />
      <RowCut index={2} dev="tablet" view={view} name="小雨的平板" />
      <RowCut index={3} dev="ajie" view={view} name="阿杰的手机" />
      <Board chip={Math.min(1.6, view.w / 1240)} />
      <DawnCard />
      <CarShot view={view} />
    </motion.div>
  );
}

/* ═════════════════════ 1 · 黑场里的按钮 ═════════════════════ */

function ButtonShot({ view }: { view: { w: number; h: number } }) {
  const t = useFilmTime();
  const cut = useCut(-1, CUT_V);
  const dim = useKeys(t, [1.15, 1.6], [1, 0.16]);
  const caption = useKeys(t, [0.15, 0.6, 1.15, 1.5], [0, 1, 1, 0]);
  const captionShown = useShown(caption);
  // 手机按原大排在世界里，镜头对准提名卡下半部，缓慢推近
  const s = useKeys(t, [0, TAP], [1.78, 1.88], ease.linear);
  const k = Math.min(view.w / 1920, view.h / 1080);
  const transform = useTransform(s, (v) => `translate(${view.w / 2}px, ${view.h / 2 + 70 * k}px) scale(${(v * k).toFixed(4)}) translate(${-PHONE.w / 2}px, ${-650}px)`);
  return (
    <motion.div className="absolute inset-0" style={cut}>
      <motion.div className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0' }}>
        <Phone shadow="none" style={{ background: INK }}>
          <TripPhoneScreen updateAt={99}>
            <NominationSheet tapAt={TAP} approach={[0.95, 1.4]} hideAt={[90, 91]} dim={dim} />
          </TripPhoneScreen>
        </Phone>
      </motion.div>
      {/* 手机上半部埋进黑里：只留下这张卡 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[30%]" style={{ background: `linear-gradient(${INK} 62%, transparent)` }} />
      <motion.p className="absolute left-1/2 top-[9%] -translate-x-1/2 whitespace-nowrap font-serif text-[min(2.3vw,44px)] font-semibold text-[#FFFFF9]/80" style={{ opacity: caption, visibility: captionShown }}>
        阿杰提名：今晚去正宁路夜市
      </motion.p>
    </motion.div>
  );
}

/* ═════════════════════ 2 · v1.0 → v1.1 ═════════════════════ */

function VersionShot() {
  const t = useFilmTime();
  const cut = useCut(CUT_V, CUTS[0]);
  const roll = useKeys(t, [ROLL[0], ROLL[1]], [0, -50], (x) => 1 - Math.pow(1 - x, 3));
  const y = useTransform(roll, (v) => `${v}%`);
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center" style={cut}>
      <p className="flex items-baseline font-serif font-semibold leading-none tracking-[-0.04em] text-[#FFFFF9]" style={{ fontSize: 'min(17vw, 330px)' }}>
        v1.
        <span className="relative inline-block h-[1em] overflow-hidden align-baseline" style={{ width: '0.6em' }}>
          <motion.span className="absolute left-0 top-0 flex flex-col" style={{ y }}>
            <span className="block h-[1em] leading-none">0</span>
            <span className="block h-[1em] leading-none" style={{ color: ORANGE_ON_DARK }}>
              1
            </span>
          </motion.span>
        </span>
      </p>
    </motion.div>
  );
}

/* ═════════════════════ 3 · 四次硬切：同一行，落在同一个位置 ═════════════════════ */

type Dev = 'hero' | 'laptop' | 'tablet' | 'ajie';
const SIZE: Record<Dev, { w: number; h: number }> = { hero: PHONE, laptop: LAPTOP, tablet: TABLET, ajie: PHONE };
/** 这一行在画面里的位置：中心偏下，高亮的左缘都对齐在同一条竖线上 */
const ROW_AT = { x: 0.5, y: 0.52 };
const CUT_SCALE = 1.9;

function DeviceBody({ dev, at }: { dev: Dev; at: number }) {
  // 行在切进来的一刻亮起：每一块屏都「收到」这一行
  const sweep = { from: 'left' as const, t: [at + 0.02, at + 0.24] as const };
  if (dev === 'laptop')
    return (
      <Laptop shadow="none">
        <TripLaptopScreen updateAt={at} open={-1} sweep={sweep} />
      </Laptop>
    );
  if (dev === 'tablet')
    return (
      <Tablet shadow="none">
        <TripTabletScreen updateAt={at} open={-1} sweep={sweep} />
      </Tablet>
    );
  return (
    <Phone shadow="none">
      <TripPhoneScreen updateAt={at} open={-1} sweep={sweep} time={dev === 'ajie' ? '21:07' : '21:06'} />
    </Phone>
  );
}

function RowCut({ index, dev, view, name }: { index: number; dev: Dev; view: { w: number; h: number }; name: string }) {
  const a = CUTS[index];
  const b = index < CUTS.length - 1 ? CUTS[index + 1] : BOARD;
  const cut = useCut(a, b);
  const ref = useRef<HTMLDivElement>(null);
  const [row, setRow] = useState({ x: SIZE[dev].w / 2, y: SIZE[dev].h / 2, w: 300 });
  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current?.querySelector<HTMLElement>('[data-row-anchor]');
      const r = el && ref.current ? layoutRect(ref.current, el) : null;
      if (r) setRow({ x: r.x, y: r.y + 22, w: r.w });
    };
    measure();
    document.fonts?.ready.then(measure, () => {});
  }, []);
  const k = Math.min(view.w / 1920, view.h / 1080) * CUT_SCALE;
  // 行的左缘对齐到画面的同一条竖线，纵向对齐到同一条水平线
  const left = view.w * ROW_AT.x - 300 * k - row.x * k;
  const top = view.h * ROW_AT.y - row.y * k;
  return (
    <motion.div className="absolute inset-0" style={cut}>
      <div ref={ref} className="absolute left-0 top-0" style={{ transform: `translate(${left}px, ${top}px) scale(${k})`, transformOrigin: '0 0', width: SIZE[dev].w, height: SIZE[dev].h }}>
        <DeviceBody dev={dev} at={a} />
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-[6vw] pb-[6vh] pt-24" style={{ background: `linear-gradient(transparent, ${INK} 62%)` }}>
        <p className="font-serif text-[min(2.6vw,50px)] font-semibold text-[#FFFFF9]">{name}</p>
        <p className="inline-flex items-center gap-3 font-serif text-[min(2.6vw,50px)] font-semibold tabular-nums" style={{ color: ORANGE_ON_DARK }}>
          <CheckIcon className="h-[0.7em] w-[0.7em]" />
          v1.1
        </p>
      </div>
    </motion.div>
  );
}

/* ═════════════════════ 4 · 一张表：四块屏，同一个版本 ═════════════════════ */

const BOARD_ROWS = ['我的手机 · 领队', '我的电脑', '小雨的平板', '阿杰的手机'];

function Board({ chip }: { chip: number }) {
  const t = useFilmTime();
  const cut = useCut(BOARD, DAWN);
  const head = useKeys(t, [5.55, 5.95], [0, 1]);
  const headShown = useShown(head);
  const headY = useKeys(t, [5.55, 6.05], [12, 0], ease.out);
  return (
    <motion.div className="absolute inset-0" style={cut}>
      <div className="absolute left-[9vw] right-[9vw] top-1/2 -translate-y-1/2">
        <p className="font-serif text-[min(2vw,38px)] font-semibold text-[#FFFFF9]/55">领队点了一下</p>
        <ul className="mt-[3.2vh] flex flex-col">
          {BOARD_ROWS.map((name, i) => (
            <BoardRow key={name} name={name} at={BOARD + 0.06 + i * 0.13} chip={chip} />
          ))}
        </ul>
        <motion.p className="mt-[5.5vh] font-serif text-[min(4vw,76px)] font-semibold leading-tight tracking-[-0.02em] text-[#FFFFF9]" style={{ opacity: head, visibility: headShown, y: headY }}>
          每一块屏，<span style={{ color: ORANGE_ON_DARK }}>同一个版本</span>。
        </motion.p>
      </div>
    </motion.div>
  );
}

function BoardRow({ name, at, chip }: { name: string; at: number; chip: number }) {
  const t = useFilmTime();
  const o = useKeys(t, [at - 0.001, at], [0, 1], ease.linear);
  const shown = useShown(o);
  return (
    <motion.li className="flex items-center gap-[2vw] border-b border-[#FFFFF9]/[0.14] py-[1.5vh]" style={{ opacity: o, visibility: shown }}>
      <span className="w-[22vw] shrink-0 font-serif text-[min(2.6vw,50px)] font-semibold text-[#FFFFF9]">{name}</span>
      {/* 每一行里都是同一行行程：重复本身就是信息 */}
      <span className="flex min-w-0 flex-1 items-center">
        <span data-ui="app" className="flex origin-left items-center gap-3 rounded-[12px] bg-ui-panel px-4 py-2.5 text-ui-ink" style={{ transform: `scale(${chip})` }}>
          <span className="relative h-6 w-[3px] rounded-full bg-ui-accent" />
          <span className="text-[15px] font-semibold tabular-nums text-ui-accent-ink">20:00</span>
          <CatMark cat="food" size={24} />
          <span className="whitespace-nowrap text-[16px] font-semibold">正宁路夜市 · 赵记醪糟</span>
        </span>
      </span>
      <span className="inline-flex w-[8vw] shrink-0 items-center justify-end gap-2 font-serif text-[min(2.6vw,50px)] font-semibold tabular-nums" style={{ color: ORANGE_ON_DARK }}>
        v1.1
      </span>
    </motion.li>
  );
}

/* ═════════════════════ 5 · 出发当天 → 车机导航 ═════════════════════ */

function DawnCard() {
  const cut = useCut(DAWN, CAR_CUT);
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-[#241E20]" style={cut}>
      <p className="font-serif font-semibold leading-none tracking-[-0.03em]" style={{ fontSize: 'min(10vw, 200px)' }}>
        9 月 24 日
      </p>
      <p className="mt-[3vh] text-[min(1.6vw,30px)] text-[#241E20]/70">出发当天 · 14:30 兰州中川机场取车</p>
    </motion.div>
  );
}

function CarShot({ view }: { view: { w: number; h: number } }) {
  const t = useFilmTime();
  const cut = useCut(CAR_CUT, 99);
  const s = useKeys(t, [CAR_CUT, DUR], [1.12, 1.2], ease.linear);
  const k = Math.min(view.w / 1920, view.h / 1080);
  const transform = useTransform(s, (v) => `translate(${view.w / 2}px, ${view.h * 0.47}px) scale(${(v * k).toFixed(4)}) translate(${-CAR.w / 2}px, ${-CAR.h / 2}px)`);
  const line = useKeys(t, [8.55, 8.95], [0, 1]);
  const lineShown = useShown(line);
  return (
    <motion.div className="absolute inset-0" style={cut}>
      <motion.div className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0' }}>
        <CarDisplay>
          <CarNavScreen litAt={CAR_CUT - 0.6} routeAt={CAR_ROUTE_T} />
        </CarDisplay>
      </motion.div>
      <motion.p className="absolute bottom-[8vh] left-1/2 -translate-x-1/2 whitespace-nowrap font-serif text-[min(3.4vw,64px)] font-semibold tracking-[-0.02em] text-[#241E20]" style={{ opacity: line, visibility: lineShown }}>
        导航，交给车机。
      </motion.p>
    </motion.div>
  );
}

