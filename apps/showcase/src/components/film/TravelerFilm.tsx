'use client';

import { useMemo, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { TimeGate, TimeShift, useCamera, useFilmTime, useKeys, useShown, type Cam, type CamRef, type View } from './clock';
import { CLIMAX_AT, O, OpeningWorld, buildOpening, openingCamAt, openingShots } from './opening/Opening';
import { BG_DAWN, BG_NIGHT, SYNC_GUESS, SyncOverlays, SyncWorld, T, macroStart, measureSync, useMeasured, useSyncModel, type Layout, type Prelude } from './sync/SyncScene';

/**
 * 旅客端演示片「一根线」（方向 A，发布会级重拍）：全片一个世界、一台镜头、一根线。
 * 横屏从左往右读，竖屏从上往下读：那句话 → 被读懂的词 → 2.28 米 → 分岔（旅行社线路 / 自驾路线）→ 领队的手机 →
 * 家人加入、阿杰提名 → 静 → 点下，线穿过全家每一块屏（高潮）→ 夜里熄屏、清晨 → 交给车机导航 → 片尾。
 * 开场按全片时钟写；高潮（SyncScene）按自己的 0 秒写，放在 CLIMAX_AT 之后。
 */

/** 片尾卡出现（硬切）的时刻：车机停稳之后 */
export const END_AT = CLIMAX_AT + 18.05;
export const FILM_DURATION = END_AT + 4.5;

/** 高潮之前在领队手机里发生的事（全片时间） */
const A6 = {
  joins: { ajie: 18.3, xiaoyu: 18.55 },
  sheetIn: 19.1,
  evalAt: [19.75, 20.15, 20.55] as const,
};

export function TravelerFilm({ layout, view }: { layout: Layout; view: View }) {
  const t = useFilmTime();
  const worldRef = useRef<HTMLDivElement>(null);
  const m = useMeasured(worldRef, measureSync, SYNC_GUESS, [layout]);
  const sync = useSyncModel(layout, view, m);
  const o = useMemo(() => buildOpening(layout, sync), [layout, sync]);
  const shots = useMemo(() => openingShots(o, macroStart(sync.w, sync.m, layout)), [o, sync.w, sync.m, layout]);

  // 全片的镜头：高潮之前走开场的机位，之后交给高潮自己的镜头；按时刻缓存，一帧只算一次
  const camFn = useMemo(() => {
    let lastV = Number.NaN;
    let lastView: View | null = null;
    let last: Cam = [0, 0, 1];
    return (v: number, V: View): Cam => {
      if (v !== lastV || V !== lastView) {
        last = v < CLIMAX_AT ? openingCamAt(shots, v, V) : sync.camFn(v - CLIMAX_AT, V);
        lastV = v;
        lastView = V;
      }
      return last;
    };
  }, [shots, sync]);
  const { transform } = useCamera(t, camFn, view);
  // 高潮里的叠层按高潮自己的时间取镜头
  const localCam = useMemo<CamRef>(() => ({ current: { fn: (v: number, V: View) => camFn(v + CLIMAX_AT, V), view } }), [camFn, view]);
  localCam.current.view = view;

  // 领队的手机第一次进画面的时刻（开场的镜头），在这之前不渲染
  const heroFrom = useMemo(() => {
    const b = sync.w.body.hero;
    for (let v = 0; v < CLIMAX_AT; v += 1 / 60) {
      const c = camFn(v, view);
      const x0 = c[0] + c[2] * (b.x0 - 70);
      const x1 = c[0] + c[2] * (b.x1 + 70);
      const y0 = c[1] + c[2] * (b.y0 - 70);
      const y1 = c[1] + c[2] * (b.y1 + 70);
      if (x1 > 0 && x0 < view.w && y1 > 0 && y0 < view.h) return v - 1 / 60;
    }
    return CLIMAX_AT;
  }, [camFn, sync.w, view]);

  const prelude = useMemo<Prelude>(
    () => ({
      wake: o.arrive - CLIMAX_AT,
      joins: { ajie: A6.joins.ajie - CLIMAX_AT, xiaoyu: A6.joins.xiaoyu - CLIMAX_AT },
      sheetIn: A6.sheetIn - CLIMAX_AT,
      evalAt: [A6.evalAt[0] - CLIMAX_AT, A6.evalAt[1] - CLIMAX_AT, A6.evalAt[2] - CLIMAX_AT],
      settle: [O.toPhone[1] + 0.05 - CLIMAX_AT, O.toSheet[1] + 0.02 - CLIMAX_AT],
      heroFrom: heroFrom - CLIMAX_AT,
    }),
    [o.arrive, heroFrom],
  );

  // 出发当天：一层白天冷白的底色淡入（只改透明度）
  const dawnIn = useKeys(t, [CLIMAX_AT + T.dawn[0], CLIMAX_AT + T.dawn[1]], [0, 1]);
  // 片尾卡盖住之后，世界整块不渲染
  const worldOn = useTransform(t, (v) => (v >= END_AT + 0.05 ? 'hidden' : 'visible'));

  return (
    <div data-film className="absolute inset-0 overflow-hidden" style={{ background: BG_NIGHT }}>
      <motion.div aria-hidden className="absolute inset-0" style={{ background: BG_DAWN, opacity: dawnIn, willChange: 'opacity' }} />
      <motion.div ref={worldRef} className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0', contentVisibility: worldOn, willChange: 'transform' }}>
        {/* 开场在高潮推近之后就退场，高潮在领队的手机进画面之前什么都看不见：各自只在自己的时段里跟着时钟走 */}
        <TimeGate from={0} to={CLIMAX_AT + 1.3}>
          <OpeningWorld o={o} lw={sync.lw} until={CLIMAX_AT + 1.2} />
        </TimeGate>
        <TimeGate from={heroFrom - 0.1} to={END_AT + 0.1}>
          <TimeShift by={CLIMAX_AT}>
            <SyncWorld model={sync} prelude={prelude} />
          </TimeShift>
        </TimeGate>
      </motion.div>
      <TimeShift by={CLIMAX_AT}>
        <SyncOverlays model={sync} cam={localCam} view={view} />
      </TimeShift>
      <EndCard layout={layout} view={view} />
    </div>
  );
}

/* ═════════════════════ 片尾 ═════════════════════ */

/** 片尾卡：硬切到纸面；品牌与一句话，线最后落成「定下来」下面的一道橙线 */
function EndCard({ layout, view }: { layout: Layout; view: View }) {
  const t = useFilmTime();
  const on = useKeys(t, [END_AT - 0.001, END_AT], [0, 1], ease.linear);
  const shown = useShown(on);
  // 硬切过来时字已经在纸上（不留一帧空白），线随后在「定下来」下面划出来
  const brand = useKeys(t, [END_AT - 0.001, END_AT], [0, 1], ease.linear);
  const line = useKeys(t, [END_AT + 0.45, END_AT + 1.25], [0, 1], ease.out);
  const land = layout === 'land';
  const big = land ? Math.min(view.w * 0.05, (view.h * 16 * 0.05) / 9) : view.w * 0.1;
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: BG_NIGHT, opacity: on, visibility: shown }}>
      <motion.p className="flex items-center gap-3 text-[#241E20]" style={{ opacity: brand, fontSize: Math.max(15, big * 0.34) }}>
        <span className="flex items-center justify-center rounded-[22%] bg-[#241E20] font-bold text-[#FFFFF9]" style={{ width: Math.max(22, big * 0.62), height: Math.max(22, big * 0.62), fontSize: Math.max(13, big * 0.36) }}>
          旅
        </span>
        <span className="font-semibold">TripCraft · 旅艺</span>
      </motion.p>
      <motion.p className="relative mt-[0.6em] text-center font-serif font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20]" style={{ opacity: brand, fontSize: big }}>
        全家一起把行程
        {land ? null : <br />}
        <span className="relative inline-block text-[#FE3C01]">
          定下来
          <motion.span aria-hidden className="absolute left-0 right-0 top-full block origin-left bg-[#FE3C01]" style={{ height: Math.max(2, big * 0.05), marginTop: big * 0.08, scaleX: line, willChange: 'transform' }} />
        </span>
        。
      </motion.p>
    </motion.div>
  );
}
