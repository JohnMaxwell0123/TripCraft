'use client';

import { motion, useTransform } from 'framer-motion';
import { AGENCY_ROUTE, LISTING_COVERS, type PlaceCategory } from '@/data/trip';
import { ease, useFadeStyle, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Reveal, Scene, TapCursor, Toast, useProgress } from './primitives';
import { Badge, CatTile, PageHeader, Steps, btn } from './ui';
import { WIZARD } from './StudioImport';
import { MapCanvas } from './MapCanvas';
import { RouteGlyph } from './RouteGlyph';
import { CameraIcon, CheckIcon, DownloadIcon, FileTextIcon, ImageIcon, PlayIcon, SparklesIcon } from '@/components/common/Icons';

/**
 * B 端 03 · 一键生成 AI 交互路书与路线动画（docs/17 §17.6）
 *
 * 输入：已确认的逐日行程、旅行社品牌包、实拍素材。生成后左侧是路线动画（风格化矢量版，不含图商底图，
 * OI-007 确认前的默认做法），每个停顿点的一句介绍由 AI 撰写并标注；右侧是交互路书，配图逐张标注「实拍 / 示意」。
 * 不提供 AI 生成景点照片：实拍图位只放旅行社上传的照片（演示里用占位表示），没有实拍的地方用示意图并写明。
 */

const STEPS_TEXT = ['按行程顺序算路，生成镜头脚本', 'AI 撰写每个停顿点的一句介绍', '渲染路线动画（矢量版）'];

const arc = (id: string) => AGENCY_ROUTE.stops.find((s) => s.id === id)?.arc ?? 0;
const reelAt = (a: number) => AT.reelDraw[0] + (AT.reelDraw[1] - AT.reelDraw[0]) * a;

const CAPTIONS = [
  { id: 'zy', text: 'D2 兰州 → 张掖：翻越乌鞘岭，最高点在车上通过' },
  { id: 'dx', text: 'D3 七彩丹霞：17:40 前后光线最好' },
  { id: 'jyg', text: 'D3 嘉峪关：关城入口有无障碍坡道' },
  { id: 'dh', text: 'D5 莫高窟：无障碍接驳车直达，只看平层窟' },
  { id: 'yd', text: 'D7 雅丹：日落后原路返回，不夜行' },
];
const CAPTION_AT = CAPTIONS.map((c) => reelAt(arc(c.id)));

const CARDS: { day: string; title: string; tip: string; media: '实拍' | '示意'; cat: PlaceCategory }[] = [
  { day: 'D2', title: '兰州 → 张掖', tip: '翻越乌鞘岭，海拔 2,980 米的最高点在车上通过', media: '实拍', cat: 'nature' },
  { day: 'D5', title: '莫高窟', tip: '接驳车直达窟区，只看平层窟，不爬台阶', media: '实拍', cat: 'sight' },
  { day: 'D6', title: '鸣沙山 · 月牙泉', tip: '电瓶车上山，19:30 前后看日落', media: '示意', cat: 'nature' },
];

export function StudioRoadbook() {
  return (
    <Scene range={AT.roadbookScene} label="生成 AI 路书与路线动画">
      <PageHeader
        title="路书与路线动画"
        subtitle="线路 / 河西走廊 9 日 · 长辈友好私家团"
        actions={
          <>
            <Steps labels={WIZARD} active={2} className="hidden cq-md:flex" />
            <span className="text-xs tabular-nums text-ui-ink-3 cq-md:hidden">3 / 3</span>
          </>
        }
      />
      <div className="relative min-h-0 flex-1">
        <GeneratePanel />
        <ResultView />
        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex justify-center">
          <Toast range={AT.publishedToast}>
            已发布 · 线路开始参与匹配
            <span className="hidden font-normal text-ui-ink-2 cq-md:inline">，详情页显示路线动画与 AI 路书</span>
          </Toast>
        </div>
      </div>
    </Scene>
  );
}

/* ── 生成前：输入清单 + 一键生成；点击后逐步完成 ── */
function GeneratePanel() {
  const p = useProgress();
  const out = useRange(p, [AT.resultIn[0], AT.resultIn[1]], [1, 0]);
  const visibility = useVisibility(p, -1, AT.resultIn[1]);
  const started = useStep(p, [AT.genClick]) === 1;
  const press = useRange(p, [AT.genClick - bsec(0.12), AT.genClick, AT.genClick + bsec(0.12)], [1, 0.96, 1]);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center bg-ui-sunken/60 p-4" style={{ opacity: out, visibility }}>
      <div className="ui-card w-full max-w-[380px] p-4 !shadow-ui-float">
        <div className="flex items-center gap-3">
          <RouteGlyph trip={LISTING_COVERS.elder} className="h-11 w-11 shrink-0 rounded-[10px]" />
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ui-ink">{started ? '正在生成' : '用这条线路生成'}</p>
            <p className="truncate text-xs text-ui-ink-3">交互路书 + 45 秒路线动画</p>
          </div>
        </div>
        {started ? (
          <ul className="mt-4 flex flex-col gap-2.5">
            {STEPS_TEXT.map((text, i) => (
              <GenStep key={text} text={text} at={AT.genSteps[i]} />
            ))}
          </ul>
        ) : (
          <>
            <ul className="mt-4 flex flex-col gap-2">
              <li className="flex items-center gap-2.5 text-[13px] text-ui-ink">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-ui-ctl bg-ui-sunken text-ui-ink-2">
                  <FileTextIcon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">逐日行程 · 9 天</span>
                <CheckIcon className="h-4 w-4 text-ui-success" />
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-ui-ink">
                <span aria-hidden className="flex h-7 w-7 shrink-0 overflow-hidden rounded-ui-ctl">
                  <span className="h-full w-1/2 bg-[#1F4E5A]" />
                  <span className="h-full w-1/2 bg-[#E3B23C]" />
                </span>
                <span className="min-w-0 flex-1">品牌包 · 标志与主色</span>
                <CheckIcon className="h-4 w-4 text-ui-success" />
              </li>
              <li className="flex items-center gap-2.5 text-[13px] text-ui-ink">
                <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-ui-ctl bg-ui-sunken text-ui-ink-2">
                  <CameraIcon className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">实拍素材 · 12 张</span>
                <CheckIcon className="h-4 w-4 text-ui-success" />
              </li>
            </ul>
            <motion.span className={`${btn.primary} relative mt-4 h-10 w-full`} style={{ scale: press }}>
              <SparklesIcon className="h-4 w-4" />
              生成交互路书与路线动画
              <TapCursor approach={AT.genCursor} clickAt={AT.genClick} hideAt={AT.genClick + bsec(0.4)} className="left-1/2 top-5" />
            </motion.span>
            <p className="mt-3 text-xs leading-relaxed text-ui-ink-3">不生成景点照片；没有实拍的地方只用地图、示意图与文字。</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

function GenStep({ text, at }: { text: string; at: number }) {
  const p = useProgress();
  const done = useStep(p, [at]) === 1;
  return (
    <li className={`flex items-center gap-2.5 text-[13px] ${done ? 'text-ui-ink' : 'text-ui-ink-3'}`}>
      {done ? (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-success text-white">
          <CheckIcon className="h-3 w-3" />
        </span>
      ) : (
        <span className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-ui-line-strong border-t-ui-ink" />
      )}
      {text}
    </li>
  );
}

/* ── 生成后：路线动画 + 交互路书 ── */
function ResultView() {
  const p = useProgress();
  const fade = useFadeStyle(p, AT.resultIn[0], AT.resultIn[1]);
  const press = useRange(p, [AT.publishClick - bsec(0.12), AT.publishClick, AT.publishClick + bsec(0.12)], [1, 0.96, 1]);
  const published = useStep(p, [AT.publishClick]) === 1;

  return (
    <motion.div className="absolute inset-0 flex flex-col p-4" style={fade}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 cq-md:flex-row">
        <Player />
        <div className="flex min-h-0 min-w-0 flex-col cq-md:w-[42%]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-ui-ink">交互路书</p>
            <span className="text-xs text-ui-ink-3">9 天 · 逐日卡片</span>
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {CARDS.map((c, i) => (
              <Reveal key={c.day} at={[AT.roadbookCards[i], AT.roadbookCards[i] + bsec(0.35)]} y={6} className={i === 2 ? 'hidden cq-sm:block' : ''}>
                <div className="ui-card flex gap-3 p-2">
                  <MediaTile media={c.media} cat={c.cat} />
                  <span className="min-w-0 flex-1 py-0.5">
                    <span className="flex items-center gap-1.5 truncate text-[13px] font-medium text-ui-ink">
                      <span className="text-xs font-semibold tabular-nums text-ui-ink-3">{c.day}</span>
                      {c.title}
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-ui-ink-2">{c.tip}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
          <p className="mt-2 hidden items-center gap-1.5 text-xs text-ui-ink-3 cq-md:flex">
            <SparklesIcon className="h-3.5 w-3.5 shrink-0 text-ui-accent" />
            介绍文字由 AI 撰写，已在路书与导出文件中标注
          </p>
        </div>
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-end gap-2 border-t border-ui-line pt-3">
        <span className={`${btn.secondary} hidden cq-sm:inline-flex`}>
          <DownloadIcon className="h-3.5 w-3.5" />
          下载视频
        </span>
        <motion.span className={`${published ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: press }}>
          {published ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已发布
            </>
          ) : (
            '发布到线路详情'
          )}
          <TapCursor approach={AT.publishCursor} clickAt={AT.publishClick} hideAt={AT.publishClick + bsec(0.5)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}

/**
 * 配图位：「实拍」是旅行社上传的照片（演示里没有真实照片，用中性的图片占位表示这里放实拍）；
 * 「示意」是没有实拍时用的示意图（类别图形），不冒充实拍。
 */
function MediaTile({ media, cat }: { media: '实拍' | '示意'; cat: PlaceCategory }) {
  return (
    <span className="relative flex h-14 w-16 shrink-0 items-center justify-center overflow-hidden rounded-ui-ctl">
      {media === '实拍' ? (
        <span className="flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,rgb(var(--ui-sunken)),rgb(var(--ui-line-strong)))] text-ui-ink-3">
          <ImageIcon className="h-5 w-5" />
        </span>
      ) : (
        <CatTile cat={cat} size={64} className="!rounded-none" />
      )}
      <span className="absolute bottom-0.5 left-0.5 rounded-[4px] bg-white/90 px-1 text-xs leading-4 text-ui-ink">{media}</span>
    </span>
  );
}

/* ── 路线动画播放器：地图上的路线按时间推进，停顿点的介绍由 AI 撰写并标注 ── */
function Player() {
  const p = useProgress();
  const draw = useRange(p, AT.reelDraw, [0, 1], { easing: ease.linear });
  const timeRef = useScrollCounter(p, 0, 45, AT.reelDraw[0], AT.reelDraw[1], 0, (n) => `00:${String(Math.floor(n)).padStart(2, '0')}`, ease.linear);
  const caption = useStep(p, CAPTION_AT);
  const captionFade = useFadeStyle(p, CAPTION_AT[0] - bsec(0.2), CAPTION_AT[0]);
  const scrub = useTransform(draw, (v) => `${v * 100}%`);

  return (
    <div className="flex min-h-0 min-w-0 flex-col cq-md:flex-1">
      <div className="relative h-[196px] shrink-0 overflow-hidden rounded-ui-card border border-ui-line cq-md:h-auto cq-md:min-h-0 cq-md:flex-1">
        <MapCanvas route={AGENCY_ROUTE} draw={draw} labels={['lz', 'zy', 'jyg', 'dh']} scale={false} minimal frame="inset-x-3 top-11 bottom-12" legendClass="right-2 top-2" />
        <span className="ui-glass absolute left-2 top-2 inline-flex h-7 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-xs font-medium text-ui-ink">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F4E5A] text-xs font-bold leading-none text-white">敦</span>
          敦煌某国际旅行社
        </span>
        <motion.div className="ui-glass absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-ui-ctl px-2 py-1.5" style={captionFade}>
          <Badge tone="signal">
            <SparklesIcon className="h-3 w-3" />
            AI 撰写
          </Badge>
          <span className="min-w-0 truncate text-xs text-ui-ink">{CAPTIONS[Math.max(0, caption - 1)].text}</span>
        </motion.div>
      </div>
      <div className="mt-2 flex shrink-0 items-center gap-2.5 text-xs text-ui-ink-2">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-ink text-white">
          <PlayIcon className="h-3 w-3" />
        </span>
        <span className="shrink-0 tabular-nums">
          <span ref={timeRef}>00:00</span> / 00:45
        </span>
        <span className="relative h-1.5 min-w-0 flex-1 rounded-full bg-ui-line">
          <motion.span className="absolute inset-y-0 left-0 rounded-full bg-ui-route" style={{ width: scrub }} />
          <motion.span className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-ui-route shadow-ui-card" style={{ left: scrub }} />
        </span>
        <span className="hidden shrink-0 cq-sm:inline">矢量版 · 不含图商底图</span>
      </div>
    </div>
  );
}
