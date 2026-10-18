'use client';

import type { ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { PROJECTED, ROUTE_D, ROUTE_LUT, TERRAIN, MAP_H, MAP_W } from '@/data/trip';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, actSpan } from './timeline';
import { Reveal, TapCursor, useProgress } from './primitives';
import { MacTrafficLights } from './Collab';
import {
  AlertTriangleIcon,
  BuildingIcon,
  CameraIcon,
  CheckIcon,
  FileTextIcon,
  FilmIcon,
  SparklesIcon,
  UploadIcon,
} from '@/components/common/Icons';

/**
 * 04 幕 · 旅行社线路工作室（docs/17）
 *
 * 导入已有行程单 → AI 抽取后逐字段确认（§17.3）→ 一键生成交互路书与路线动画，
 * 矢量版、AI 文字显式标注（§17.6）→ 分项报价，按旅客要求生成新版本并自动列出差异（§17.5、§17.7）。
 */

const STEPS = ['导入行程单', 'AI 路书 · 路线动画', '透明报价 · 版本'];
const fade = actSpan('studio', 0.02);

export function StudioScene() {
  const p = useProgress();
  const opacity = useFade(p, T.studioIn[0], T.studioIn[1], T.studioOut[0], T.studioOut[1]);
  const visibility = useVisibility(p, T.studioIn[0] - 0.003, T.studioOut[1] + 0.002);
  const [ph1, ph2] = T.studioPhase;

  return (
    <motion.section
      aria-label="旅行社线路工作室：导入行程单、AI 路书与透明报价"
      className="pointer-events-none absolute inset-0 z-50 flex flex-col overflow-hidden rounded-[16px] bg-[#FAF8F5] text-left text-[#241E20] select-none"
      style={{ opacity, visibility }}
    >
      <StudioHeader />
      <Stepper />

      <div className="relative min-h-0 flex-1">
        <Phase range={[T.studioIn[0], T.studioIn[0], ph1 - fade, ph1]}>
          <ImportPhase />
        </Phase>
        <Phase range={[ph1 - fade, ph1, ph2 - fade, ph2]}>
          <ReelPhase />
        </Phase>
        <Phase range={[ph2 - fade, ph2]}>
          <QuotePhase />
        </Phase>
      </div>

      <p className="shrink-0 border-t border-[#E2E2D8] bg-white px-3 py-2 text-xs leading-relaxed text-[#625F61]">
        旅客自助调整的价格一律标注「预估」，以旅行社正式报价为准；旅游合同与付款由旅客与旅行社直接签订，平台不经手团款。
      </p>
    </motion.section>
  );
}

function Phase({ range, children }: { range: readonly number[]; children: ReactNode }) {
  const p = useProgress();
  const out = range.length === 4;
  const opacity = useRange(p, range, out ? [0, 1, 1, 0] : [0, 1]);
  const visibility = useVisibility(p, range[0] - 0.001, out ? range[3] : 2);
  return (
    <motion.div className="absolute inset-0 overflow-hidden p-2.5 sm:p-3" style={{ opacity, visibility }}>
      {children}
    </motion.div>
  );
}

function StudioHeader() {
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 bg-[#241E20] px-3 text-[#FFFFF9]">
      <MacTrafficLights />
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-[#FE3C01] text-xs font-bold text-white">旅</span>
      <span className="whitespace-nowrap text-[13px] font-semibold">线路工作室</span>
      <span className="hidden h-4 w-px bg-white/20 sm:block" />
      <span className="hidden min-w-0 items-center gap-1.5 truncate text-xs text-[#FFFFF9]/75 sm:flex">
        <BuildingIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">敦煌某国际旅行社 · 资质已认证并公示</span>
      </span>
      <span className="ml-auto shrink-0 whitespace-nowrap rounded-full border border-white/20 px-2.5 py-0.5 text-xs text-[#FFFFF9]/80">旅行社端</span>
    </header>
  );
}

function Stepper() {
  const p = useProgress();
  const step = useStep(p, T.studioPhase);
  return (
    <div className="flex h-10 shrink-0 items-center gap-1.5 overflow-hidden border-b border-[#E2E2D8] bg-white px-3">
      {STEPS.map((label, i) => {
        const active = i === step;
        const done = i < step;
        return (
          <span key={label} className="flex min-w-0 items-center gap-1.5">
            {i > 0 ? <span className="h-px w-3 shrink-0 bg-[#E2E2D8] sm:w-5" /> : null}
            <span
              className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors duration-300 ${
                active ? 'border-[#241E20] bg-[#241E20] font-semibold text-[#FFFFF9]' : done ? 'border-[#E2E2D8] text-[#241E20]' : 'border-[#E2E2D8] text-[#828081]'
              }`}
            >
              {done ? <CheckIcon className="h-3 w-3" /> : <span className="font-mono">{i + 1}</span>}
              <span className={active ? '' : 'hidden sm:inline'}>{label}</span>
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* ═════════════════════ ① 导入行程单：AI 抽取 + 逐字段确认（§17.3） ═════════════════════ */
const FIELDS: { label: string; value: string; conf: number; note?: string; review?: boolean }[] = [
  { label: '线路名', value: '河西走廊 9 日 · 长辈友好私家团', conf: 98 },
  { label: '天数 · 城市', value: '9 天 · 兰州 → 敦煌', conf: 99 },
  { label: '出行方式', value: '私家团 · 7 座 MPV + 司导', conf: 95 },
  { label: '用餐', value: '含早餐', conf: 62, review: true, note: '原文「含早」，请核对' },
  { label: '地点核验', value: '18 个地点已经图商核验', conf: 100 },
  { label: '人群适配', value: '适合长辈 · 全程无连续 50 级以上台阶', conf: 90, note: '标签须附说明' },
];

const SOURCE_LINES = [
  { text: '第 1 天　兰州集合 → 张掖，约 505 公里', mark: false },
  { text: '住宿：舒适型酒店，含早', mark: true },
  { text: '第 2 天　七彩丹霞 → 嘉峪关', mark: false },
  { text: '第 4 天　莫高窟，无障碍接驳，4 个平层窟', mark: false },
  { text: '费用：人均 6280 元起（6 人成团）', mark: false },
];

function ImportPhase() {
  return (
    <div className="flex h-full flex-col gap-2.5 md:flex-row">
      <SourceDoc />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[12px] border border-[#E2E2D8] bg-white p-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            AI 抽取 · 逐字段确认
          </p>
          <span className="shrink-0 text-xs text-[#828081]">不提供「全部接受」</span>
        </div>
        <ul className="mt-1.5 flex min-h-0 flex-col gap-1">
          {FIELDS.map((f, i) => (
            <FieldRow key={f.label} field={f} at={T.importFields[i]} />
          ))}
        </ul>
      </div>
    </div>
  );
}

function SourceDoc() {
  const p = useProgress();
  const opacity = useFade(p, T.importFile[0], T.importFile[1]);
  const scan = useRange(p, T.importScan, [0, 100]);
  const scanTop = useTransform(scan, (n) => `${n}%`);
  const scanOpacity = useFade(p, T.importScan[0], T.importScan[0] + fade, T.importScan[1] - fade, T.importScan[1]);
  const markOn = useFade(p, T.importFields[3], T.importFields[3] + fade, T.confirmClick, T.confirmClick + fade);

  return (
    <motion.div className="flex shrink-0 flex-col rounded-[12px] border border-[#E2E2D8] bg-[#F4F4EE] p-3 md:w-[40%]" style={{ opacity }}>
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-white text-[#625F61] ring-1 ring-[#E2E2D8]">
          <FileTextIcon className="h-4 w-4" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold">河西走廊9日私家团.pdf</span>
          <span className="block text-xs text-[#828081]">3 页 · 原文保留，与抽取结果并排对照</span>
        </span>
        <UploadIcon className="ml-auto h-4 w-4 shrink-0 text-[#828081]" />
      </div>
      {/* 原文页：桌面展示，手机只保留文件条 */}
      <div className="relative mt-2.5 hidden flex-1 overflow-hidden rounded-[5px] border border-[#E2E2D8] bg-white p-3 md:block">
        <ul className="flex flex-col gap-2 text-xs leading-relaxed text-[#625F61]">
          {SOURCE_LINES.map((l) => (
            <li key={l.text} className="relative">
              {l.mark ? <motion.span aria-hidden className="absolute -inset-x-1 -inset-y-0.5 rounded-[3px] bg-[#FE3C01]/15" style={{ opacity: markOn }} /> : null}
              <span className="relative">{l.text}</span>
            </li>
          ))}
          {[82, 64, 90, 48].map((w) => (
            <li key={w} aria-hidden className="h-2 rounded-full bg-[#F4F4EE]" style={{ width: `${w}%` }} />
          ))}
        </ul>
        <motion.span aria-hidden className="absolute inset-x-0 h-px bg-[#FE3C01] shadow-[0_0_10px_rgba(254,60,1,0.6)]" style={{ top: scanTop, opacity: scanOpacity }} />
      </div>
    </motion.div>
  );
}

function FieldRow({ field, at }: { field: (typeof FIELDS)[number]; at: number }) {
  const p = useProgress();
  const opacity = useFade(p, at, at + fade);
  const x = useRange(p, [at, at + fade * 1.5], [10, 0], { easing: ease.out, rest: 0 });
  const bar = useRange(p, [at, at + fade * 2], [0, field.conf / 100], { easing: ease.out });
  const confirmed = useStep(p, [T.confirmClick]) === 1;
  const press = useRange(p, [T.confirmClick - fade * 0.4, T.confirmClick, T.confirmClick + fade * 0.4], [1, 0.92, 1]);
  const pending = field.review && !confirmed;

  return (
    <motion.li
      className={`relative rounded-[5px] px-2 py-1.5 ${pending ? 'border border-dashed border-[#FE3C01]/60 bg-[#FE3C01]/[0.04]' : ''}`}
      style={{ opacity, x }}
    >
      <div className="flex items-center gap-2">
        <span className="w-[4.5rem] shrink-0 text-xs text-[#828081]">{field.label}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{field.value}</span>
        {field.review ? (
          confirmed ? (
            <span className="inline-flex shrink-0 items-center gap-0.5 text-xs font-semibold text-[#0E8A5F]">
              <CheckIcon className="h-3 w-3" />
              已确认
            </span>
          ) : (
            <motion.span className="relative shrink-0 rounded-[5px] bg-[#241E20] px-2 py-0.5 text-xs font-semibold text-[#FFFFF9]" style={{ scale: press }}>
              确认
              <TapCursor approach={T.confirmCursor} clickAt={T.confirmClick} hideAt={T.confirmClick + fade * 2} className="left-6 top-3" />
            </motion.span>
          )
        ) : (
          <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E8A5F]" />
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 pl-[5rem]">
        <span className="relative h-1 flex-1 overflow-hidden rounded-full bg-[#F4F4EE]">
          <motion.span
            className={`absolute inset-y-0 left-0 w-full origin-left rounded-full ${field.review ? 'bg-[#FE3C01]' : 'bg-[#241E20]/70'}`}
            style={{ scaleX: bar }}
          />
        </span>
        <span className={`shrink-0 font-mono text-xs tabular-nums ${field.review ? 'text-[#FE3C01]' : 'text-[#828081]'}`}>
          {field.conf === 100 ? '已核验' : `置信 ${field.conf}%`}
        </span>
      </div>
      {field.note ? (
        <p className={`mt-0.5 hidden pl-[5rem] text-xs sm:block ${pending ? 'text-[#C43200]' : 'text-[#828081]'}`}>
          {pending ? <AlertTriangleIcon className="mr-1 inline h-3 w-3 align-[-2px]" /> : null}
          {field.note}
        </p>
      ) : null}
    </motion.li>
  );
}

/* ═════════════════════ ② AI 路书与路线动画（§17.6） ═════════════════════ */
const REEL_STOPS = PROJECTED.filter((s) => s.kind === 'city' && s.id !== 'dh2');
const CAPTIONS: { id: string; text: string }[] = [
  { id: 'zy', text: 'D1 兰州 → 张掖 · 翻越乌鞘岭，双司机轮换' },
  { id: 'dx', text: 'D2 七彩丹霞 · 17:40 前后光线最好' },
  { id: 'jyg', text: 'D3 嘉峪关 → 敦煌 · 瓜州服务区午休' },
  { id: 'dh', text: 'D4 莫高窟 · 无障碍接驳，4 个平层窟' },
];
const reelAt = (at: number) => T.reelDraw[0] + (T.reelDraw[1] - T.reelDraw[0]) * at;
const CAPTION_AT = CAPTIONS.map((c) => reelAt(PROJECTED.find((s) => s.id === c.id)?.at ?? 0));

const ROADBOOK = [
  { day: 'D1', title: '兰州 → 张掖', meta: '505 km · 双司机轮换', media: '实拍' },
  { day: 'D2', title: '七彩丹霞 → 嘉峪关', meta: '景区环保车 · 少步行', media: '实拍' },
  { day: 'D4', title: '莫高窟 · 无障碍慢游', meta: '接驳车 · 4 个平层窟', media: '示意' },
];

function ReelPhase() {
  return (
    <div className="flex h-full flex-col gap-2.5 md:flex-row">
      <RouteReel />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2 rounded-[12px] border border-[#E2E2D8] bg-white p-3">
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2">
          <p className="text-[13px] font-semibold">交互路书 · 逐日安排</p>
          <span className="shrink-0 rounded-full border border-[#FE3C01]/40 px-2 py-0 text-xs text-[#FE3C01]">AI 撰写已标注</span>
        </div>
        <ul className="flex min-h-0 flex-col gap-1.5">
          {ROADBOOK.map((d, i) => (
            <Reveal key={d.day} at={[T.roadbookCards[i], T.roadbookCards[i] + fade * 1.5]} y={8} className={i === 2 ? 'hidden sm:block' : ''}>
              <li className="flex items-center gap-2.5 rounded-[5px] border border-[#E5E5E0] p-2">
                <span className="relative flex h-10 w-12 shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-[#E9E2D2] to-[#D8CDB6] text-[#625F61]">
                  <CameraIcon className="h-4 w-4" />
                  <span className="absolute bottom-0.5 right-0.5 rounded-[3px] bg-white/90 px-1 text-xs leading-4 text-[#241E20]">{d.media}</span>
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-semibold">
                    <span className="mr-1.5 font-mono text-[#FE3C01]">{d.day}</span>
                    {d.title}
                  </span>
                  <span className="block truncate text-xs text-[#625F61]">{d.meta}</span>
                </span>
              </li>
            </Reveal>
          ))}
        </ul>
        <p className="mt-auto hidden text-xs leading-relaxed text-[#828081] sm:block">图片逐张标注「实拍」或「示意」；不生成景点照片冒充实拍。</p>
      </div>
    </div>
  );
}

function RouteReel() {
  const p = useProgress();
  const [a, b] = T.reelDraw;
  const draw = useRange(p, [a, b], [0, 1], { easing: ease.linear });
  const left = useTransform(draw, (t) => `${(sampleRoute(t).x / MAP_W) * 100}%`);
  const top = useTransform(draw, (t) => `${(sampleRoute(t).y / MAP_H) * 100}%`);
  const timeRef = useScrollCounter(p, 0, 45, a, b, 0, (n) => `00:${String(Math.round(n)).padStart(2, '0')}`);
  const caption = useStep(p, CAPTION_AT);
  const captionOpacity = useFade(p, CAPTION_AT[0] - fade, CAPTION_AT[0]);

  return (
    <div className="flex shrink-0 flex-col rounded-[12px] border border-[#E2E2D8] bg-[#F4F4EE] p-2.5 md:w-[56%]">
      <div className="flex items-center justify-between gap-2 pb-2">
        <p className="flex items-center gap-1.5 text-[13px] font-semibold">
          <FilmIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
          路线动画
        </p>
        <span className="shrink-0 font-mono text-xs tabular-nums text-[#625F61]">
          <span ref={timeRef}>00:00</span> / 00:45
        </span>
      </div>

      <div className="relative w-full overflow-hidden rounded-[5px] border border-[#E2E2D8] bg-[#FFFFF9]" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
        <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} className="absolute inset-0 h-full w-full" aria-hidden>
          <path d={TERRAIN.qilian} fill="#E9E2D2" opacity={0.7} />
          <path d={TERRAIN.badain} fill="#F1EADB" />
          <path d={ROUTE_D} fill="none" stroke="#D0D0C4" strokeWidth={6} strokeDasharray="2 12" strokeLinecap="round" />
          <motion.path d={ROUTE_D} fill="none" stroke="#FE3C01" strokeWidth={7} strokeLinecap="round" style={{ pathLength: draw }} />
        </svg>
        {REEL_STOPS.map((s) => (
          <ReelStop key={s.id} name={s.name} day={s.day} x={s.x} y={s.y} at={reelAt(s.at)} />
        ))}
        <motion.span aria-hidden className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#FE3C01] shadow-[0_0_0_4px_rgba(254,60,1,0.25)]" style={{ left, top }} />
        <span className="absolute right-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0 text-xs text-[#625F61] ring-1 ring-[#E2E2D8]">矢量版 · 未含图商底图</span>
      </div>

      <motion.p className="mt-2 flex min-h-[20px] items-center gap-1.5 text-xs" style={{ opacity: captionOpacity }}>
        <span className="shrink-0 rounded-full border border-[#FE3C01]/40 px-1.5 text-[#FE3C01]">AI 撰写</span>
        <span className="truncate text-[#241E20]">{CAPTIONS[Math.max(0, caption - 1)].text}</span>
      </motion.p>
    </div>
  );
}

function ReelStop({ name, day, x, y, at }: { name: string; day: string; x: number; y: number; at: number }) {
  const p = useProgress();
  const scale = useRange(p, [at, at + fade], [0, 1], { easing: ease.back, rest: 1 });
  const opacity = useFade(p, at, at + fade * 0.6);
  return (
    <motion.span
      className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: `${(x / MAP_W) * 100}%`, top: `${(y / MAP_H) * 100}%`, opacity }}
    >
      <motion.span className="h-2.5 w-2.5 rounded-full border-2 border-[#241E20] bg-white" style={{ scale }} />
      <span className="mt-0.5 whitespace-nowrap rounded-[3px] bg-white/85 px-1 text-xs leading-4 text-[#241E20]">
        {name}
        <span className="ml-1 hidden font-mono text-[#828081] sm:inline">{day}</span>
      </span>
    </motion.span>
  );
}

/** 按弧长均匀采样的路线查表（与 RouteMap 相同的 ROUTE_LUT） */
function sampleRoute(t: number) {
  const idx = Math.max(0, Math.min(1, t)) * (ROUTE_LUT.length - 1);
  const i0 = Math.floor(idx);
  const i1 = Math.min(i0 + 1, ROUTE_LUT.length - 1);
  const f = idx - i0;
  return {
    x: ROUTE_LUT[i0].x + (ROUTE_LUT[i1].x - ROUTE_LUT[i0].x) * f,
    y: ROUTE_LUT[i0].y + (ROUTE_LUT[i1].y - ROUTE_LUT[i0].y) * f,
  };
}

/* ═════════════════════ ③ 透明报价与报价版本（§17.5、§17.7） ═════════════════════ */
const BREAKDOWN = [
  { item: '交通 · 7 座 MPV + 司机', price: '¥1,680' },
  { item: '住宿 · 舒适型 8 晚 · 含早', price: '¥2,240' },
  { item: '门票 · 莫高窟等', price: '¥620' },
  { item: '导游讲解服务费', price: '¥980' },
  { item: '保险及其他', price: '¥760' },
];

const DIFF = [
  { item: '敦煌 2 晚升级高档酒店', delta: '+¥760' },
  { item: '增加 1 天 · 阳关 · 玉门关', delta: '+¥900' },
];

function QuotePhase() {
  return (
    <div className="flex h-full flex-col gap-2.5 md:flex-row">
      <div className="flex shrink-0 flex-col rounded-[12px] border border-[#E2E2D8] bg-white p-3 md:w-[44%]">
        <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2">
          <p className="text-[13px] font-semibold">报价 v1</p>
          <span className="shrink-0 rounded-full border border-[#E2E2D8] bg-[#F4F4EE] px-2 py-0 text-xs">本线路提供分项明细</span>
        </div>
        <p className="mt-1.5 text-xs text-[#625F61] sm:hidden">交通 · 住宿 · 门票 · 讲解 · 保险，5 项逐项列出</p>
        <ul className="mt-1.5 hidden flex-col sm:flex">
          {BREAKDOWN.map((r, i) => (
            <Reveal key={r.item} at={[T.quoteRows[0] + (i * (T.quoteRows[1] - T.quoteRows[0])) / BREAKDOWN.length, T.quoteRows[0] + ((i + 1) * (T.quoteRows[1] - T.quoteRows[0])) / BREAKDOWN.length]} y={4}>
              <li className="flex items-center justify-between gap-2 border-b border-dashed border-[#E5E5E0] py-1 text-xs">
                <span className="truncate text-[#625F61]">{r.item}</span>
                <span className="shrink-0 font-mono tabular-nums">{r.price}</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <div className="mt-1.5 flex items-baseline justify-between">
          <span className="text-xs text-[#625F61]">人均合计</span>
          <span className="font-mono text-base font-bold tabular-nums">¥6,280</span>
        </div>
        <div className="mt-2 hidden flex-wrap gap-1 text-xs sm:flex">
          {['住宿', '交通', '门票', '早餐', '司导'].map((t) => (
            <span key={t} className="rounded-full border border-[#E2E2D8] px-2 py-0 text-[#241E20]">
              含{t}
            </span>
          ))}
          {['午晚餐', '个人消费'].map((t) => (
            <span key={t} className="rounded-full border border-dashed border-[#E2E2D8] px-2 py-0 text-[#828081]">
              不含{t}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col rounded-[12px] border border-[#E2E2D8] bg-white p-3">
        <p className="border-b border-[#E5E5E0] pb-2 text-[13px] font-semibold">咨询与报价版本</p>
        <Reveal at={T.inquiryIn} y={6} className="mt-2">
          <div className="rounded-[5px] border border-[#E2E2D8] bg-[#F4F4EE] p-2 text-xs leading-relaxed">
            <p className="font-semibold text-[#241E20]">旅客咨询 · 经本人同意发送的需求摘要</p>
            <p className="mt-0.5 text-[#625F61]">5 人（3 成人 1 长者 1 儿童）· 国庆前后 · 敦煌 2 晚想住好一点，再加 1 天阳关玉门关。自助调整预估价：人均 ¥7,940（预估）</p>
          </div>
        </Reveal>

        <div className="mt-2 flex items-center gap-1.5 text-xs">
          <span className="rounded-full border border-[#E2E2D8] px-2 py-0 font-mono">v1 ¥6,280</span>
          <span className="text-[#828081]">→</span>
          <Reveal at={[T.diffRows[0], T.diffRows[0] + fade]} y={0}>
            <span className="rounded-full bg-[#241E20] px-2 py-0.5 font-mono text-[#FFFFF9]">v2 ¥7,940</span>
          </Reveal>
          <span className="ml-auto hidden text-[#828081] sm:inline">版本只增不改</span>
        </div>
        <ul className="mt-1.5 flex flex-col gap-1">
          {DIFF.map((r, i) => (
            <Reveal key={r.item} at={[T.diffRows[i + 1], T.diffRows[i + 1] + fade]} y={4}>
              <li className="flex items-center justify-between gap-2 rounded-[5px] bg-[#FE3C01]/[0.06] px-2 py-1 text-xs">
                <span className="truncate">
                  <span className="mr-1 font-mono text-[#FE3C01]">+</span>
                  {r.item}
                </span>
                <span className="shrink-0 font-mono tabular-nums">{r.delta} / 人</span>
              </li>
            </Reveal>
          ))}
        </ul>
        <SendQuoteButton />
      </div>
    </div>
  );
}

function SendQuoteButton() {
  const p = useProgress();
  const sent = useStep(p, [T.sendClick]) === 1;
  const press = useRange(p, [T.sendClick - fade * 0.4, T.sendClick, T.sendClick + fade * 0.4], [1, 0.95, 1]);
  return (
    <div className="mt-auto flex items-center justify-between gap-2 pt-2">
      <span className="hidden text-xs text-[#828081] sm:inline">差异自动列出，旅客可逐版对比</span>
      <motion.span
        className={`relative ml-auto inline-flex h-8 shrink-0 items-center gap-1.5 rounded-[5px] px-3 text-xs font-semibold ${
          sent ? 'border border-[#E2E2D8] bg-white text-[#0E8A5F]' : 'bg-[#241E20] text-[#FFFFF9]'
        }`}
        style={{ scale: press }}
      >
        {sent ? (
          <>
            <CheckIcon className="h-3.5 w-3.5" />
            已发送 · 等待旅客确认
          </>
        ) : (
          '发送报价 v2'
        )}
        <TapCursor approach={T.sendCursor} clickAt={T.sendClick} hideAt={T.sendClick + fade * 2} className="left-1/2 top-4" />
      </motion.span>
    </div>
  );
}
