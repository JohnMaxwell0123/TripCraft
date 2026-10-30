'use client';

import { type ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { ease } from '@/lib/motion';
import { LISTING_COVERS, type TripSummary } from '@/data/trip';
import { RouteGlyph } from '@/components/stage/RouteGlyph';
import { Ring } from '@/components/stage/ui';
import { CheckIcon, ChevronDownIcon, PaperclipIcon, ShieldCheckIcon, SparklesIcon, StarIcon } from '@/components/common/Icons';
import { shotCam, useFilmTime, useKeys, useShown, type Cam, type Frame, type Shot, type View } from '../clock';
import { Layer } from '../devices';
import { WorldLine, WorldStations, distAtX, headAt, makeTrack, pointAt, timeAt, type Box, type HeadMotion, type Pt, type Track } from '../line';
import type { Layout, SyncModel } from '../sync/SyncScene';

/**
 * 开场（分镜 A1–A5，全片时钟）：
 * A1 纸面上一个真输入框（微距），这家人的那句话逐字打出来，发送。
 * A2 句子进了气泡，被读懂的短语依次画上橙色下划线（产品真有的「字句化形」）；一根橙线从气泡里出来往下走，
 *    依次停靠六站——站名就是被读懂的那几个词（线右边的大字），线左边是需求画像里的项名：一句话变成一张画像。
 * A3 线停在第七站：AI 只追问一句「车有多高？」，回答落成「总高 2.28 米」（全片的伏笔）。
 * A4 线分岔：一支下行到 23 条持证旅行社线路（第一张 91% 匹配），主线继续，停靠兰州、张掖、嘉峪关、敦煌——AI 规划的自驾路线。
 * A5 主线走进领队的手机，手机亮起来：「西行计划」建好了。
 * 屏外的大字、线与站都是片子的语言；输入框、气泡、线路卡是产品真有的界面（SHOWCASE §4.1），按原大排版。
 */

/** 高潮（A7）在全片里开始的时刻 */
export const CLIMAX_AT = 22.7;

export const O = {
  type: [0.4, 3.3] as const,
  send: 3.5,
  /** 发送后镜头先退到气泡的位置停住，气泡再出现（不在运动中切字） */
  toBubble: [3.5, 4.0] as const,
  bubble: [3.95, 4.25] as const,
  /** 第一处下划线的时刻与间隔 */
  marks: [4.45, 0.2] as const,
  /** 线从气泡出来往下走，镜头随画像一起长，直到装下整张画像 */
  toList: [5.6, 7.3] as const,
  /** 第七站：问与答。镜头不动，前六站退成浅灰，眼睛自然落到问与答上 */
  ask: [10.05, 10.4] as const,
  answer: 11.0,
  /** 第二段线头：分岔、下行到旅行社线路 */
  toFork: [12.5, 13.6] as const,
  toPhone: [16.75, 17.95] as const,
  /** 镜头推到提名卡（接高潮的第一个机位） */
  toSheet: [20.9, 22.6] as const,
};

/** 三段线头：气泡 → 六站 → 第七站；第七站 → 分岔 → 旅行社线路；分岔 → 四座城 → 领队的手机 */
const HEAD1: HeadMotion = { launch: 5.6, speed: 300, ramp: 0.3 };
const HEAD2: HeadMotion = { launch: 12.6, speed: 1500, ramp: 0.3 };
const HEAD3: HeadMotion = { launch: 14.6, speed: 1350, ramp: 0.3 };

/** 那句话：被读懂的短语带 id（拼起来就是完整原文） */
const SEGMENTS: readonly (string | { id: string; text: string; field: string })[] = [
  '全家 5 口',
  { id: 'date', text: '国庆前后', field: '日期' },
  '去河西走廊，玩 9 天左右。带 ',
  { id: 'people', text: '70 岁的爷爷和 4 岁的女儿', field: '同行' },
  '，爷爷膝盖做过手术',
  { id: 'body', text: '不能爬高台阶', field: '身体' },
  '，孩子',
  { id: 'nap', text: '每天要午休', field: '身体' },
  '。想看',
  { id: 'sights', text: '莫高窟和鸣沙山日落', field: '必去' },
  '，别太赶。',
  { id: 'mode', text: '自己开车或者找旅行社都行', field: '方式' },
  '。',
];
const SENTENCE = SEGMENTS.map((s) => (typeof s === 'string' ? s : s.text)).join('');
const PHRASES = SEGMENTS.filter((s): s is { id: string; text: string; field: string } => typeof s !== 'string');
const CITIES = [
  { name: '兰州', day: 'D0' },
  { name: '张掖', day: 'D1' },
  { name: '嘉峪关', day: 'D2' },
  { name: '敦煌', day: 'D3–D5' },
];
/** 旅行社线路卡的放大倍数（片子里要在分岔的中景里读得出匹配度） */
const CARD_SCALE = 1.4;

const CARDS: { cover: TripSummary; title: string; agency: string; rating: string; score: number; reasons: string[]; price: string }[] = [
  { cover: LISTING_COVERS.elder, title: '河西走廊 9 日 · 长辈友好私家团', agency: '敦煌某国际旅行社', rating: '4.8', score: 91, reasons: ['必去 2/2', '日均车程 3.1 小时'], price: '¥6,280' },
  { cover: LISTING_COVERS.charter, title: '敦煌 · 张掖 8 日 · 包车带司机', agency: '张掖某旅行社', rating: '4.6', score: 86, reasons: ['必去 2/2', '全程无高台阶'], price: '¥5,460' },
  { cover: LISTING_COVERS.family, title: '河西走廊 10 日 · 亲子慢游小团', agency: '兰州某旅行社', rating: '4.7', score: 82, reasons: ['节奏轻松', '含莫高窟'], price: '¥5,180' },
];

/* ═════════════════════ 线路图 ═════════════════════ */

interface WordStation {
  x: number;
  y: number;
  text: string;
  field: string;
}

export interface OpeningModel {
  layout: Layout;
  composer: Box;
  bubble: Box;
  words: WordStation[];
  s228: Pt;
  fork: Pt;
  cities: Pt[];
  /** 旅行社线路卡（最前面一张）的外框；分支在它的左边（竖屏：上边）停住 */
  fan: Box;
  tracks: [Track, Track, Track];
  stations: [number[], number[], number[]];
  /** 镜头（全片时间） */
  shots: Shot[];
  /** 线走进手机的时刻 */
  arrive: number;
}

const box = (x0: number, y0: number, w: number, h: number): Box => ({ x0, y0, x1: x0 + w, y1: y0 + h });
const frameOf = (b: Box): Frame => ({ x: (b.x0 + b.x1) / 2, y: (b.y0 + b.y1) / 2, w: b.x1 - b.x0, h: b.y1 - b.y0 });
/** 取景框按画幅补高时，上沿不动、往下补（画面上沿正好落在两行字之间，不切字） */
const topAnchored = (b: Box, aspect: number): Frame => {
  const w = b.x1 - b.x0;
  const h = Math.max(b.y1 - b.y0, w / aspect);
  return { x: (b.x0 + b.x1) / 2, y: b.y0 + h / 2, w, h };
};

export function buildOpening(layout: Layout, sync: SyncModel): OpeningModel {
  const hero = sync.w.pos.hero;
  const cover = { x: hero.x + sync.m.cover.x + sync.m.cover.w / 2, y: hero.y + sync.m.cover.y + sync.m.cover.h / 2 };
  const heroBody = sync.w.body.hero;
  const land = layout === 'land';
  let composer: Box;
  let bubble: Box;
  let words: WordStation[];
  let s228: Pt;
  let fork: Pt;
  let cities: Pt[];
  let fan: Box;
  let p1: Pt[];
  let p2: Pt[];
  let p3: Pt[];
  const R = 90;
  const fanW = 620 * CARD_SCALE;
  const fanH = 128 * CARD_SCALE;
  if (land) {
    // 画像是一列：线从气泡右边出来，拐下来一站站往下走；走到封面的高度拐向右边，分岔，停靠四座城，从左边走进领队的手机
    const Y = cover.y;
    const LX = heroBody.x0;
    cities = [-2200, -1640, -1080, -520].map((dx) => ({ x: LX + dx, y: Y }));
    fork = { x: LX - 2760, y: Y };
    const Xt = LX - 3460;
    const Yb = Y - 1240;
    words = PHRASES.map((p, i) => ({ x: Xt, y: Yb + 200 + 132 * i, text: p.text, field: p.field }));
    s228 = { x: Xt, y: Y - 170 };
    bubble = box(Xt - 800, Yb - 62, 640, 124);
    composer = box(Xt - 800, Yb + 96, 640, 168);
    fan = box(fork.x + 290, Y + 510, fanW, fanH);
    p1 = [{ x: bubble.x1, y: Yb }, { x: Xt, y: Yb }, s228];
    p2 = [s228, { x: Xt, y: Y }, fork, { x: fork.x, y: fan.y0 + fanH / 2 }, { x: fan.x0, y: fan.y0 + fanH / 2 }];
    p3 = [fork, { x: LX, y: Y }];
  } else {
    // 竖屏：一根竖直的主干，正对封面，从手机顶边进去
    const X = cover.x;
    const TY = heroBody.y0;
    cities = [-2300, -1800, -1300, -800].map((dy) => ({ x: X, y: TY + dy }));
    fork = { x: X, y: TY - 3200 };
    s228 = { x: X, y: TY - 3900 };
    // 输入框在气泡下面、和字同在主干右边：第一站从输入框下面开始
    const Yb = TY - 5300;
    words = PHRASES.map((p, i) => ({ x: X, y: Yb + 380 + 150 * i, text: p.text, field: p.field }));
    bubble = box(X + 90, Yb - 66, 640, 132);
    composer = box(X + 90, Yb + 94, 640, 168);
    const pw = 620 * 1.2;
    fan = box(X + 268, fork.y + 240, pw, 128 * 1.2);
    p1 = [{ x: bubble.x0, y: Yb }, { x: X, y: Yb }, s228];
    p2 = [s228, fork, { x: fan.x0 + pw / 2, y: fork.y }, { x: fan.x0 + pw / 2, y: fan.y0 }];
    p3 = [fork, { x: X, y: TY }];
  }
  const tracks: [Track, Track, Track] = [makeTrack(p1, R), makeTrack(p2, R), makeTrack(p3, R)];
  const along = (tr: Track, pt: Pt) => {
    // 站点在轨道上的距离：水平段按横坐标直接算，其余按最近点找
    const direct = distAtX(tr, pt.y, pt.x);
    if (direct !== null) return direct;
    let best = 0;
    let bestErr = Infinity;
    for (let d = 0; d <= tr.len; d += 4) {
      const q = pointAt(tr, d);
      const e = Math.hypot(q.x - pt.x, q.y - pt.y);
      if (e < bestErr) {
        bestErr = e;
        best = d;
      }
    }
    return best;
  };
  const stations: [number[], number[], number[]] = [
    [...words.map((wd) => along(tracks[0], wd)), tracks[0].len],
    [tracks[1].len],
    [...cities.map((c) => along(tracks[2], c)), tracks[2].len],
  ];
  const arrive = timeAt(HEAD3, tracks[2].len);

  // 镜头
  const shots: Shot[] = [];
  const cw = composer;
  // 竖屏像一块空着的聊天屏：输入框在画面下部，上面留给对话
  const macro0: Frame = land ? { x: (cw.x0 + cw.x1) / 2, y: cw.y1 - 110, w: 720, h: 405 } : { x: (cw.x0 + cw.x1) / 2, y: cw.y1 - 348, w: 700, h: 1244 };
  const macro1: Frame = land ? { ...macro0, w: 660, h: 371 } : { ...macro0, w: 660, h: 1173 };
  shots.push({ t: 0, f: macro0 }, { t: O.type[1], from: 0.3, f: macro1, ease: ease.linear });
  // 发送：退到能看清下划线的气泡
  const bubbleView: Frame = land
    ? { x: (bubble.x0 + bubble.x1) / 2, y: (bubble.y0 + composer.y1) / 2, w: 1180, h: 664 }
    : { x: (bubble.x0 + bubble.x1) / 2, y: composer.y1 - 560, w: 1000, h: 1778 };
  shots.push({ t: O.toBubble[1], from: O.toBubble[0], f: bubbleView, ease: ease.smooth });
  // 整张画像：气泡、往下走的线、六站与第七站同框；线往下走时镜头只极慢地推近
  const listBox: Box = land
    ? { x0: bubble.x0 - 140, y0: bubble.y0 - 120, x1: s228.x + 1280, y1: s228.y + 230 }
    : { x0: cover.x - 210, y0: bubble.y0 - 140, x1: cover.x + 1120, y1: s228.y + 260 };
  const listF = frameOf(listBox);
  // 画像随线一站站长出来：镜头从气泡退到整张画像的进度跟着线头走到第三站的进度，画面里始终有正在发生的事
  const third = stations0(words, tracks[0])[2];
  const growing = (h: number): Frame => {
    const k = ease.smooth(Math.max(0, Math.min(1, h / third)));
    const lerp = (a: number, b: number) => a + (b - a) * k;
    return { x: lerp(bubbleView.x, listF.x), y: lerp(bubbleView.y, listF.y), w: lerp(bubbleView.w, listF.w), h: lerp(bubbleView.h, listF.h) };
  };
  shots.push(...sampled(growing, HEAD1, O.toList[0], O.toList[1]));
  // 取样做过滑动平均，最后一格没有完全到位：再用半秒稳稳落到整张画像上
  shots.push({ t: O.toList[1] + 0.5, from: O.toList[1], f: listF, ease: ease.smooth });
  // 第七站：镜头停在整张画像上不动（问与答靠前六站退成浅灰来突出，不推镜头，不切字）
  // 分岔：第七站、分岔、旅行社线路卡
  const forkView: Box = land
    ? { x0: s228.x - 260, y0: s228.y - 118, x1: fan.x1 + 200, y1: fan.y1 + 150 }
    : { x0: cover.x - 210, y0: s228.y - 150, x1: cover.x + 1120, y1: fan.y1 + 420 };
  const forkF = topAnchored(forkView, land ? 16 / 9 : 9 / 16);
  shots.push({ t: O.toFork[1], from: O.toFork[0], f: forkF, ease: ease.smooth });
  // 主线：分岔的画面停住，线头走过兰州、张掖；然后一次摇到「四座城 + 领队的手机」（旅行社线路退成浅灰，留在画面左下）
  const panAt = timeAt(HEAD3, stations[2][1]) - 0.05;
  if (land) {
    const routeF = topAnchored({ x0: cities[0].x - 300, y0: cities[0].y - 340, x1: heroBody.x0 + 560, y1: cities[0].y + 520 }, 16 / 9);
    shots.push({ t: panAt, f: forkF, ease: ease.linear }, { t: panAt + 0.85, from: panAt, f: routeF, ease: ease.smooth });
  } else {
    // 竖屏：窄一些的画框跟着线头往下走，站名更大
    const follow3 = (h: number): Frame => {
      const p = pointAt(tracks[2], Math.min(h, tracks[2].len));
      return { x: cover.x + 380, y: Math.max(forkF.y, p.y + 420), w: 1160, h: 2062 };
    };
    shots.push(...sampled(follow3, HEAD3, HEAD3.launch, O.toPhone[0]));
  }
  // 手机亮起：推到整部手机
  const phoneView: Box = land
    ? { x0: heroBody.x0 - 120, y0: heroBody.y0 - 100, x1: heroBody.x1 + 120, y1: heroBody.y1 + 100 }
    : { x0: heroBody.x0 - 90, y0: heroBody.y0 - 90, x1: heroBody.x1 + 90, y1: heroBody.y1 + 90 };
  shots.push({ t: O.toPhone[1], from: O.toPhone[0], f: frameOf(phoneView), ease: ease.smooth });
  return { layout, composer, bubble, words, s228, fork, cities, fan, tracks, stations, shots, arrive };
}

/** 第一段线上各站的轨道距离（镜头随画像长出来时用） */
function stations0(words: readonly WordStation[], tr: Track): number[] {
  return words.map((wd) => {
    let best = 0;
    let bestErr = Infinity;
    for (let d = 0; d <= tr.len; d += 4) {
      const q = pointAt(tr, d);
      const e = Math.hypot(q.x - wd.x, q.y - wd.y);
      if (e < bestErr) {
        bestErr = e;
        best = d;
      }
    }
    return best;
  });
}

/** 跟拍：取景框按 0.1 秒取样，再做一次滑动平均，起步与收住都是缓的 */
function sampled(frameAt: (h: number) => Frame, head: HeadMotion, from: number, to: number): Shot[] {
  const raw: Frame[] = [];
  for (let v = from; v <= to + 0.001; v += 0.1) raw.push(frameAt(headAt(head, v)));
  return raw.map((_, i) => {
    const win = raw.slice(Math.max(0, i - 3), i + 4);
    const avg = (k: keyof Frame) => win.reduce((sum, f) => sum + f[k], 0) / win.length;
    return { t: from + 0.1 * i, f: { x: avg('x'), y: avg('y'), w: avg('w'), h: avg('h') }, ease: ease.linear };
  });
}

/** 开场的镜头（全片时间；高潮之前的最后一个机位接高潮的第一个机位 m0） */
export function openingShots(o: OpeningModel, m0: Frame): Shot[] {
  return [...o.shots, { t: O.toSheet[1], from: O.toSheet[0], f: m0, ease: ease.smooth }];
}

export const openingCamAt = (shots: readonly Shot[], v: number, V: View): Cam => shotCam(v, shots, V);

/** 开场里各个节拍的时刻（全片时间；声音按它们触发） */
export function openingBeats(o: OpeningModel) {
  return {
    marks: PHRASES.map((_, i) => O.marks[0] + O.marks[1] * i),
    words: o.stations[0].slice(0, PHRASES.length).map((d) => timeAt(HEAD1, d)),
    station228: timeAt(HEAD1, o.tracks[0].len),
    cards: [0, 1, 2].map((i) => timeAt(HEAD2, o.tracks[1].len) + i * 0.08),
    cities: o.stations[2].slice(0, CITIES.length).map((d) => timeAt(HEAD3, d)),
    arrive: o.arrive,
  };
}

/* ═════════════════════ 世界里的内容 ═════════════════════ */

export function OpeningWorld({ o, lw, until }: { o: OpeningModel; lw: number; until: number }) {
  const t = useFilmTime();
  // 线走进手机之后，开场的线与站留在原地；镜头推到提名卡之后就看不见它们了，在高潮拉远之前退场（不在画面里）
  const gone = useKeys(t, [until - 0.01, until], [1, 0], ease.linear);
  const goneShown = useShown(gone);
  // 退场之后整块不渲染（不留图层，不花每一帧的图层更新）
  const rendered = useTransform(gone, (v) => (v <= 0.001 ? 'hidden' : 'visible'));
  const settle = (a: number): readonly [number, number] => [a, a + 0.06];
  // 镜头停住的时刻各重画一次：退到气泡、推到第七站、拉到分岔
  const fresh = [settle(O.toBubble[1] + 0.05), settle(O.toList[1] + 0.05), settle(O.toFork[1] + 0.05)];
  return (
    <motion.div className="absolute left-0 top-0" style={{ opacity: gone, visibility: goneShown, contentVisibility: rendered }}>
      <WorldLine track={o.tracks[0]} gaps={[[0, o.tracks[0].len]]} motion={HEAD1} width={lw} />
      <WorldLine track={o.tracks[1]} gaps={[[0, o.tracks[1].len]]} motion={HEAD2} width={lw} />
      <WorldLine track={o.tracks[2]} gaps={[[0, o.tracks[2].len]]} motion={HEAD3} width={lw} />
      <Chat o={o} fresh={fresh} />
      {o.words.map((wd, i) => (
        <Word key={wd.text} wd={wd} at={timeAt(HEAD1, o.stations[0][i])} fresh={fresh} />
      ))}
      <Station228 o={o} at={timeAt(HEAD1, o.tracks[0].len)} fresh={fresh} />
      <Fan o={o} at={timeAt(HEAD2, o.tracks[1].len)} fresh={fresh} />
      <Cities o={o} fresh={fresh} />
      <WorldStations track={o.tracks[0]} at={o.stations[0]} motion={HEAD1} width={lw} />
      <WorldStations track={o.tracks[1]} at={o.stations[1]} motion={HEAD2} width={lw} />
      <WorldStations track={o.tracks[2]} at={o.stations[2]} motion={HEAD3} width={lw} />
    </motion.div>
  );
}

/* ── 输入框与气泡（产品真有的界面，按原大） ── */

function Chat({ o, fresh }: { o: OpeningModel; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  const n = useTransform(t, (v) => Math.round(Math.max(0, Math.min(1, (v - O.type[0]) / (O.type[1] - O.type[0]))) * SENTENCE.length));
  const typed = useTransform(n, (k) => SENTENCE.slice(0, k));
  const sent = useKeys(t, [O.send, O.send + 0.01], [0, 1], ease.linear);
  const typing = useTransform(sent, (v) => 1 - v);
  const typingShown = useShown(typing);
  const placeholder = useKeys(t, [O.type[0] - 0.01, O.type[0], O.send, O.send + 0.01], [1, 0, 0, 1], ease.linear);
  const placeholderShown = useShown(placeholder);
  const placeholderText = useTransform(t, (v): string => (v < O.send ? '说说这趟旅行：谁去、去哪、在意什么…' : '回答追问，或继续补充…'));
  const press = useKeys(t, [O.send - 0.1, O.send, O.send + 0.12], [1, 0.86, 1]);
  const bubbleIn = useKeys(t, [O.bubble[0], O.bubble[1]], [0, 1], ease.out);
  const bubbleY = useTransform(bubbleIn, (v) => (1 - v) * 16);
  const bubbleShown = useShown(bubbleIn);
  const c = o.composer;
  const b = o.bubble;
  let markIndex = 0;
  return (
    <>
      <Layer x={b.x0} y={b.y0} fresh={fresh} style={{ width: b.x1 - b.x0, opacity: bubbleIn, y: bubbleY, visibility: bubbleShown }}>
        <div data-ui="app" className="ml-auto w-fit max-w-full rounded-[20px] rounded-br-[6px] bg-ui-bubble-user px-4 py-2.5 text-[16px] leading-[1.65] text-ui-on-bubble-user">
          {SEGMENTS.map((seg, i) => (typeof seg === 'string' ? seg : <Mark key={i} at={O.marks[0] + O.marks[1] * markIndex++}>{seg.text}</Mark>))}
        </div>
      </Layer>
      <Layer x={c.x0} y={c.y0} fresh={fresh} style={{ width: c.x1 - c.x0, height: c.y1 - c.y0 }}>
        <div data-ui="app" className="absolute inset-x-0 bottom-0">
          <div className="ui-card relative px-4 pb-2.5 pt-3 !shadow-ui-float">
            <div className="relative min-h-[26px] text-[16px] leading-[1.65] text-ui-ink">
              <motion.span className="pointer-events-none absolute inset-x-0 top-0 truncate text-ui-ink-3" style={{ opacity: placeholder, visibility: placeholderShown }}>
                {placeholderText}
              </motion.span>
              <motion.p className="break-words" style={{ opacity: typing, visibility: typingShown }}>
                <motion.span>{typed}</motion.span>
                <span className="ml-0.5 inline-block h-[18px] w-[2px] animate-caret bg-ui-accent align-middle" />
              </motion.p>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <span className="inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-ui-sunken px-3 text-[13px] font-medium text-ui-ink">
                <SparklesIcon className="h-4 w-4 text-ui-accent" />
                平台模型
                <ChevronDownIcon className="h-3.5 w-3.5 text-ui-ink-3" />
              </span>
              <span className="ml-auto flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ui-ink-3">
                <PaperclipIcon className="h-[18px] w-[18px]" />
              </span>
              <motion.span aria-hidden className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ui-accent text-white" style={{ scale: press }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </motion.span>
            </div>
          </div>
        </div>
      </Layer>
    </>
  );
}

/** 被读懂的短语：画上一道品牌橙的下划线（从左向右划出，产品真有的「字句化形」） */
function Mark({ at, children }: { at: number; children: ReactNode }) {
  const t = useFilmTime();
  const sweep = useKeys(t, [at - 0.14, at + 0.06], [0, 100], ease.out);
  const backgroundSize = useTransform(sweep, (v) => `${v.toFixed(1)}% 2px`);
  return (
    <motion.span
      style={{
        backgroundImage: 'linear-gradient(rgb(var(--ui-accent) / 0.85), rgb(var(--ui-accent) / 0.85))',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 100%',
        backgroundSize,
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
      }}
    >
      {children}
    </motion.span>
  );
}

/* ── 站名：被读懂的词（片子的大字） ── */

const SERIF = 'font-serif font-semibold tracking-[-0.01em] text-[#241E20]';

function Word({ wd, at, fresh }: { wd: WordStation; at: number; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  // 出现；AI 追问时退成浅灰（一刻一事：眼睛落到第七站）
  const k = useKeys(t, [at - 0.02, at + 0.32, O.ask[0] - 0.1, O.ask[0] + 0.3], [0, 1, 1, 0.3], ease.out);
  const shown = useShown(k);
  const dx = useTransform(k, (v) => (1 - v) * -14);
  return (
    <>
      {/* 线左边：需求画像里的项名 */}
      <Layer x={wd.x - 46} y={wd.y - 18} fresh={fresh} style={{ opacity: k, visibility: shown }}>
        <span className="block -translate-x-full whitespace-nowrap text-[28px] font-medium leading-[36px] text-[#241E20]/60">{wd.field}</span>
      </Layer>
      {/* 线右边：被读懂的那几个词 */}
      <Layer x={wd.x + 48} y={wd.y - 50} fresh={fresh} style={{ opacity: k, x: dx, visibility: shown }}>
        <span className={`${SERIF} block whitespace-nowrap text-[80px] leading-[100px]`}>{wd.text}</span>
      </Layer>
    </>
  );
}

/** 第七站：AI 只追问一句「车有多高？」，回答落成「总高 2.28 米」 */
function Station228({ o, at, fresh }: { o: OpeningModel; at: number; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  const label = useKeys(t, [at - 0.02, at + 0.32], [0, 1], ease.out);
  const labelShown = useShown(label);
  const ask = useKeys(t, [O.ask[0], O.ask[1], O.answer - 0.15, O.answer + 0.1], [0, 1, 1, 0]);
  const askShown = useShown(ask);
  const answer = useKeys(t, [O.answer, O.answer + 0.35], [0, 1], ease.out);
  const answerShown = useShown(answer);
  const ay = useTransform(answer, (v) => (1 - v) * 14);
  const { x, y } = o.s228;
  return (
    <>
      <Layer x={x - 46} y={y - 18} fresh={fresh} style={{ opacity: label, visibility: labelShown }}>
        <span className="block -translate-x-full whitespace-nowrap text-[28px] font-medium leading-[36px] text-[#241E20]/60">车辆</span>
      </Layer>
      <Layer x={x + 48} y={y - 92} fresh={fresh} style={{ opacity: label, visibility: labelShown }}>
        <span className="relative grid whitespace-nowrap">
          <motion.span className={`${SERIF} col-start-1 row-start-1 self-center text-[88px] leading-[184px] !text-[#241E20]/45`} style={{ opacity: ask, visibility: askShown }}>
            车有多高？
          </motion.span>
          <motion.span className={`${SERIF} col-start-1 row-start-1 text-[150px] leading-[184px]`} style={{ opacity: answer, y: ay, visibility: answerShown }}>
            总高 2.28 米
          </motion.span>
        </span>
        <motion.span className="mt-1 block whitespace-nowrap text-[28px] leading-[1.3] text-[#241E20]/60" style={{ opacity: answer, visibility: answerShown }}>
          AI 只追问了这一句 · 腾势 D9，加了车顶箱
        </motion.span>
      </Layer>
    </>
  );
}

/* ── 分岔：持证旅行社线路（路径 B） ── */

function Fan({ o, at, fresh }: { o: OpeningModel; at: number; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  const f = o.fan;
  const caption = useKeys(t, [at - 0.1, at + 0.3, HEAD3.launch, HEAD3.launch + 0.5], [0, 1, 1, 0.35], ease.out);
  const captionShown = useShown(caption);
  const land = o.layout === 'land';
  return (
    <>
      <Layer x={f.x0} y={land ? f.y0 - 118 : f.y1 + 64} fresh={fresh} style={{ opacity: caption, visibility: captionShown }}>
        <p className="whitespace-nowrap text-[34px] font-medium leading-[1.3] text-[#241E20]">
          也匹配到 <span className={`${SERIF} text-[56px]`}>23</span> 条持证旅行社线路
        </p>
        <p className="mt-1 whitespace-nowrap text-[22px] leading-[1.4] text-[#241E20]/60">匹配度为信息参考，以旅行社报价与合同为准</p>
      </Layer>
      {[2, 1, 0].map((i) => (
        <FanCard key={i} i={i} x={f.x0 + i * 30} y={f.y0 + i * 26} at={at + i * 0.08} scale={land ? CARD_SCALE : 1.2} fresh={fresh} />
      ))}
    </>
  );
}

function FanCard({ i, x, y, at, scale, fresh }: { i: number; x: number; y: number; at: number; scale: number; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  // 出现；主线接着走自驾时退成浅灰（另一条路还在，只是镜头的注意力移开了）
  const k = useKeys(t, [at, at + 0.4, HEAD3.launch, HEAD3.launch + 0.5], [0, 1, 1, 0.35], ease.out);
  const shown = useShown(k);
  const dy = useTransform(k, (v) => (1 - v) * -24);
  const fill = useKeys(t, [at + 0.2, at + 1.0], [0, CARDS[i].score / 100], ease.out);
  const card = CARDS[i];
  return (
    <Layer x={x} y={y} fresh={fresh} style={{ width: 620, zIndex: 3 - i, opacity: useTransform(k, (v) => v * (i === 0 ? 1 : 0.92)), y: dy, visibility: shown }}>
      <div data-ui="app" className="ui-card flex origin-top-left gap-3.5 p-3 !shadow-ui-float" style={{ width: 620, transform: `scale(${scale})` }}>
        <span className="relative shrink-0">
          <RouteGlyph trip={card.cover} className="h-[92px] w-[92px] rounded-[12px]" />
          <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/30 px-1.5 text-xs leading-5 text-white">示意</span>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[16px] font-semibold leading-6 text-ui-ink">{card.title}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ui-ink-2">
                <span className="truncate">{card.agency}</span>
                <ShieldCheckIcon className="h-4 w-4 shrink-0 text-ui-success" />
                <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums">
                  <StarIcon className="h-3.5 w-3.5 fill-ui-ink text-ui-ink" />
                  {card.rating}
                </span>
              </p>
            </div>
            <Ring value={fill} size={48} stroke={4}>
              <span className="text-[15px] font-semibold tabular-nums text-ui-ink">{card.score}</span>
            </Ring>
          </div>
          <p className="mt-2 flex items-center gap-3 whitespace-nowrap text-[13px] text-ui-ink">
            {card.reasons.map((r) => (
              <span key={r} className="inline-flex items-center gap-1">
                <CheckIcon className="h-3.5 w-3.5 text-ui-success" />
                {r}
              </span>
            ))}
            <span className="ml-auto text-ui-ink-3">
              <b className="text-[15px] font-semibold tabular-nums text-ui-ink">{card.price}</b> 起 / 人
            </span>
          </p>
        </div>
      </div>
    </Layer>
  );
}

/* ── 主线：AI 规划的自驾路线（路径 A） ── */

function Cities({ o, fresh }: { o: OpeningModel; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  const first = timeAt(HEAD3, o.stations[2][0]);
  const caption = useKeys(t, [first - 0.05, first + 0.35], [0, 1], ease.out);
  const captionShown = useShown(caption);
  const land = o.layout === 'land';
  const c0 = o.cities[0];
  return (
    <>
      <Layer x={land ? c0.x - 40 : c0.x + 60} y={land ? c0.y - 120 : c0.y - 170} fresh={fresh} style={{ opacity: caption, visibility: captionShown }}>
        <p className="whitespace-nowrap text-[34px] font-medium leading-[1.3] text-[#241E20]">
          自驾 · AI 规划 · <span className="tabular-nums">9 天 · 1,980 km</span>
        </p>
      </Layer>
      {o.cities.map((c, i) => (
        <City key={CITIES[i].name} c={c} name={CITIES[i].name} day={CITIES[i].day} at={timeAt(HEAD3, o.stations[2][i])} land={land} fresh={fresh} />
      ))}
    </>
  );
}

function City({ c, name, day, at, land, fresh }: { c: Pt; name: string; day: string; at: number; land: boolean; fresh: readonly (readonly [number, number])[] }) {
  const t = useFilmTime();
  const k = useKeys(t, [at - 0.02, at + 0.3], [0, 1], ease.out);
  const shown = useShown(k);
  return (
    <Layer x={land ? c.x : c.x + 60} y={land ? c.y + 32 : c.y - 46} fresh={fresh} style={{ opacity: k, visibility: shown }}>
      <span className={`flex whitespace-nowrap ${land ? '-translate-x-1/2 flex-col items-center' : 'items-baseline gap-4'}`}>
        <span className={`${SERIF} text-[64px] leading-[1.2]`}>{name}</span>
        <span className="text-[24px] font-medium tabular-nums text-[#241E20]/60">{day}</span>
      </span>
    </Layer>
  );
}

