'use client';

import { useMemo, useRef } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { TimeShift, useCamera, useFilmTime, useKeys, useShown, type Cam, type CamRef, type View } from './clock';
import { CLIMAX_AT, O, OpeningWorld, buildOpening, openingBeats, openingCamAt, openingShots } from './opening/Opening';
import { BG_DAWN, BG_NIGHT, SYNC_GUESS, SyncOverlays, SyncWorld, T, macroStart, measureSync, syncBeats, useMeasured, useSyncModel, type Layout, type Prelude } from './sync/SyncScene';
import { NOTE, pitch, useCues, type Cue, type FilmSound } from './sound';

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

export function TravelerFilm({ layout, view, sound }: { layout: Layout; view: View; sound?: { engine: FilmSound | null; on: boolean } }) {
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

  // 声音（可选，默认静音）：只给画面里已经发生的事加一个音
  const cues = useMemo(() => filmCues(openingBeats(o), syncBeats(sync)), [o, sync]);
  useCues(t, cues, sound?.engine ?? null, sound?.on ?? false);

  // 晨光：一层清晨冷白的底色淡入（只改透明度）
  const dawnIn = useKeys(t, [CLIMAX_AT + T.dawn[0], CLIMAX_AT + T.dawn[1]], [0, 1]);
  // 片尾卡盖住之后，世界整块不渲染
  const worldOn = useTransform(t, (v) => (v >= END_AT + 0.05 ? 'hidden' : 'visible'));

  return (
    <div data-film className="absolute inset-0 overflow-hidden" style={{ background: BG_NIGHT }}>
      <motion.div aria-hidden className="absolute inset-0" style={{ background: BG_DAWN, opacity: dawnIn, willChange: 'opacity' }} />
      <motion.div ref={worldRef} className="absolute left-0 top-0" style={{ transform, transformOrigin: '0 0', contentVisibility: worldOn, willChange: 'transform' }}>
        <OpeningWorld o={o} lw={sync.lw} until={CLIMAX_AT + 1.2} />
        <TimeShift by={CLIMAX_AT}>
          <SyncWorld model={sync} prelude={prelude} />
        </TimeShift>
      </motion.div>
      <TimeShift by={CLIMAX_AT}>
        <SyncOverlays model={sync} cam={localCam} view={view} />
      </TimeShift>
      <EndCard layout={layout} view={view} />
    </div>
  );
}

/* ═════════════════════ 声音 ═════════════════════ */

/**
 * 提示音：打字是极轻的键入声；画像的六站一站一个音（五声音阶往上走），「2.28 米」是一声低音（伏笔）；
 * 线走进手机是一个三和弦；静的那一刻完全无声；线到全家每一块屏各一个音，凑成一个和弦，全景停住时余音铺开；
 * 夜里一声很低的长音；投递到车机是一声按下，线进车机屏的一刻低音落定；片尾一个和弦收住。
 */
function filmCues(op: ReturnType<typeof openingBeats>, sy: ReturnType<typeof syncBeats>): Cue[] {
  const at = (v: number) => CLIMAX_AT + v;
  const cues: Cue[] = [];
  for (let v = O.type[0]; v < O.type[1]; v += 0.11) cues.push({ at: v, kind: 'tick', f: 2200 + ((v * 37) % 1) * 500, gain: 0.35, dur: 0.04 });
  cues.push({ at: O.send, kind: 'click', gain: 0.8 });
  op.marks.forEach((v) => cues.push({ at: v, kind: 'tick', f: 3000, gain: 0.5 }));
  const scale = [NOTE.C4, NOTE.D4, NOTE.E4, NOTE.G4, NOTE.A4, NOTE.C5];
  op.words.forEach((v, i) => cues.push({ at: v, kind: 'tone', f: pitch(scale[i]), gain: 0.55, dur: 0.8 }));
  cues.push({ at: O.ask[0], kind: 'tick', f: 1800, gain: 0.5 });
  cues.push({ at: O.answer, kind: 'low', f: [pitch(NOTE.C3), pitch(NOTE.G3)], gain: 0.9, dur: 1.6 });
  op.cards.forEach((v) => cues.push({ at: v, kind: 'tick', f: 2600, gain: 0.45 }));
  op.cities.forEach((v, i) => cues.push({ at: v, kind: 'tone', f: pitch([NOTE.C4, NOTE.E4, NOTE.G4, NOTE.A4][i]), gain: 0.45, dur: 0.7 }));
  cues.push({ at: op.arrive, kind: 'pad', f: [pitch(NOTE.C4), pitch(NOTE.E4), pitch(NOTE.G4)], gain: 0.8, dur: 1.8 });
  cues.push({ at: A6.joins.ajie, kind: 'tick', f: 2400, gain: 0.45 }, { at: A6.joins.xiaoyu, kind: 'tick', f: 2400, gain: 0.45 });
  cues.push({ at: A6.sheetIn + 0.2, kind: 'tone', f: pitch(NOTE.A4), gain: 0.35, dur: 0.6 });
  A6.evalAt.forEach((v, i) => cues.push({ at: v, kind: 'tick', f: i === 2 ? 1500 : 2200, gain: 0.45 }));
  // 高潮
  cues.push({ at: at(T.tap), kind: 'click', gain: 1 });
  cues.push({ at: at(T.open), kind: 'tone', f: pitch(NOTE.C5), gain: 0.6, dur: 1.4 });
  cues.push({ at: at(sy.laptop), kind: 'tone', f: pitch(NOTE.E5), gain: 0.6, dur: 1.6 });
  cues.push({ at: at(sy.tablet), kind: 'tone', f: pitch(NOTE.G5), gain: 0.6, dur: 1.8 });
  cues.push({ at: at(sy.ajie), kind: 'tone', f: pitch(NOTE.C6), gain: 0.55, dur: 2.0 });
  cues.push({ at: at(sy.wide), kind: 'pad', f: [pitch(NOTE.C4), pitch(NOTE.E4), pitch(NOTE.G4), pitch(NOTE.C5)], gain: 0.9, dur: 3.2 });
  cues.push({ at: at(T.night[0]), kind: 'low', f: [pitch(NOTE.C3)], gain: 0.5, dur: 1.8 });
  cues.push({ at: at(T.wake[0]), kind: 'tone', f: pitch(NOTE.G4), gain: 0.4, dur: 1.2 });
  cues.push({ at: at(T.dispatch), kind: 'click', gain: 0.9 });
  cues.push({ at: at(T.route[0]), kind: 'low', f: [pitch(NOTE.C3), pitch(NOTE.G3), pitch(NOTE.E4)], gain: 0.9, dur: 2.2 });
  cues.push({ at: END_AT + 0.25, kind: 'pad', f: [pitch(NOTE.C4), pitch(NOTE.G4), pitch(NOTE.E5)], gain: 0.7, dur: 3.0 });
  return cues.sort((a, b) => a.at - b.at);
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
        <span className="flex items-center justify-center rounded-[22%] bg-[#241E20] font-bold text-[#FFFFF9]" style={{ width: big * 0.62, height: big * 0.62, fontSize: big * 0.36 }}>
          旅
        </span>
        <span className="font-semibold">TripCraft · 旅艺</span>
      </motion.p>
      <motion.p className="relative mt-[0.6em] text-center font-serif font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20]" style={{ opacity: brand, fontSize: big }}>
        全家一起把行程
        {land ? null : <br />}
        <span className="relative inline-block text-[#FE3C01]">
          定下来
          <motion.span aria-hidden className="absolute left-0 right-0 top-full block origin-left bg-[#FE3C01]" style={{ height: Math.max(2, big * 0.05), marginTop: big * 0.08, scaleX: line }} />
        </span>
        。
      </motion.p>
    </motion.div>
  );
}
