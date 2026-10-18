'use client';

import { motion, useTransform } from 'framer-motion';
import { AGENCY_ROUTE } from '@/data/trip';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Reveal, Scene, TapCursor, Toast, useProgress } from './primitives';
import { Badge, PageHeader, Steps, btn } from './ui';
import { WIZARD } from './StudioImport';
import { TripMap } from './RouteMap';
import { CheckIcon, DownloadIcon, ImageIcon, PlayIcon } from '@/components/common/Icons';

/**
 * B 端 03 · 一键生成 AI 交互路书与路线动画（docs/17 §17.6）
 *
 * 输入：已确认的逐日行程、旅行社品牌包、实拍素材。生成后左侧是路线动画（风格化矢量版，不含图商底图，
 * OI-007 确认前的默认做法），每个停顿点的一句介绍由 AI 撰写并标注；右侧是交互路书，图片逐张标注「实拍 / 示意」。
 * 不提供 AI 生成景点照片：没有实拍的地方只用地图与文字。
 */

const INPUTS = ['逐日行程 · 9 天，已逐项确认', '品牌包 · 标志与主色', '实拍素材 · 12 张'];
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

const CARDS = [
  { day: 'D2', title: '兰州 → 张掖', tip: '翻越乌鞘岭，海拔 2,980 米的最高点在车上通过', media: '实拍' },
  { day: 'D5', title: '莫高窟', tip: '接驳车直达窟区，只看平层窟，不爬台阶', media: '实拍' },
  { day: 'D6', title: '鸣沙山 · 月牙泉', tip: '电瓶车上山，19:30 前后看日落', media: '示意' },
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
            <span className="text-xs tabular-nums text-[#828081] cq-md:hidden">3 / 3</span>
          </>
        }
      />
      <div className="relative min-h-0 flex-1">
        <GeneratePanel />
        <ResultView />
        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex justify-center">
          <Toast range={AT.publishedToast}>已发布：线路详情页显示路线动画与 AI 路书</Toast>
        </div>
      </div>
    </Scene>
  );
}

/* ── 生成前：输入清单 + 一键生成；点击后逐步完成 ── */
function GeneratePanel() {
  const p = useProgress();
  const out = useFade(p, AT.resultIn[0], AT.resultIn[1]);
  const opacity = useTransform(out, (v) => 1 - v);
  const visibility = useVisibility(p, -1, AT.resultIn[1]);
  const started = useStep(p, [AT.genClick]) === 1;
  const press = useRange(p, [AT.genClick - bsec(0.12), AT.genClick, AT.genClick + bsec(0.12)], [1, 0.96, 1]);

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center p-4" style={{ opacity, visibility }}>
      <div className="w-full max-w-[360px] rounded-[12px] border border-[#E2E2D8] p-4">
        <p className="text-[13px] font-semibold text-[#241E20]">{started ? '正在生成' : '用这条线路生成'}</p>
        <ul className="mt-3 flex flex-col gap-2">
          {(started ? STEPS_TEXT : INPUTS).map((text, i) =>
            started ? <GenStep key={text} text={text} at={AT.genSteps[i]} /> : <InputRow key={text} text={text} />,
          )}
        </ul>
        {started ? null : (
          <>
            <motion.span className={`${btn.primary} relative mt-4 w-full`} style={{ scale: press }}>
              生成交互路书与路线动画
              <TapCursor approach={AT.genCursor} clickAt={AT.genClick} hideAt={AT.genClick + bsec(0.4)} className="left-1/2 top-4" />
            </motion.span>
            <p className="mt-3 text-xs leading-relaxed text-[#828081]">不生成景点照片；没有实拍的地方只用地图与文字。</p>
          </>
        )}
      </div>
    </motion.div>
  );
}

function InputRow({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-2 text-[13px] text-[#241E20]">
      <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E7A5A]" />
      {text}
    </li>
  );
}

function GenStep({ text, at }: { text: string; at: number }) {
  const p = useProgress();
  const done = useStep(p, [at]) === 1;
  return (
    <li className={`flex items-center gap-2 text-[13px] ${done ? 'text-[#241E20]' : 'text-[#828081]'}`}>
      {done ? (
        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#0E7A5A]" />
      ) : (
        <span className="h-3.5 w-3.5 shrink-0 animate-spin rounded-full border-2 border-[#DCDBD3] border-t-[#241E20]" />
      )}
      {text}
    </li>
  );
}

/* ── 生成后：路线动画 + 交互路书 ── */
function ResultView() {
  const p = useProgress();
  const opacity = useFade(p, AT.resultIn[0], AT.resultIn[1]);
  const visibility = useVisibility(p, AT.resultIn[0], 2);
  const press = useRange(p, [AT.publishClick - bsec(0.12), AT.publishClick, AT.publishClick + bsec(0.12)], [1, 0.96, 1]);
  const published = useStep(p, [AT.publishClick]) === 1;

  return (
    <motion.div className="absolute inset-0 flex flex-col p-4" style={{ opacity, visibility }}>
      <div className="flex min-h-0 flex-1 flex-col gap-4 cq-md:flex-row">
        <Player />
        <div className="flex min-h-0 min-w-0 flex-col cq-md:w-[42%]">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-[#241E20]">交互路书</p>
            <span className="text-xs text-[#828081]">9 天 · 逐日卡片</span>
          </div>
          <ul className="mt-2 flex flex-col">
            {CARDS.map((c, i) => (
              <Reveal key={c.day} at={[AT.roadbookCards[i], AT.roadbookCards[i] + bsec(0.35)]} y={6} className={i === 2 ? 'hidden cq-sm:block' : ''}>
                <li className="flex gap-3 border-b border-[#F0EFE9] py-2">
                  <span className="relative flex h-12 w-14 shrink-0 items-center justify-center rounded-[6px] bg-[#EFEAE0] text-[#A39C8D]">
                    <ImageIcon className="h-4 w-4" />
                    <span className="absolute bottom-1 left-1 rounded-[3px] bg-white/90 px-1 text-xs leading-4 text-[#241E20]">{c.media}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-[#241E20]">
                      <span className="mr-2 text-xs font-semibold tabular-nums text-[#828081]">{c.day}</span>
                      {c.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-[#625F61]">{c.tip}</span>
                  </span>
                </li>
              </Reveal>
            ))}
          </ul>
          <p className="mt-2 hidden text-xs text-[#828081] cq-md:block">介绍文字由 AI 撰写，已在路书与导出文件中标注。</p>
        </div>
      </div>
      <div className="mt-3 flex shrink-0 items-center justify-end gap-2 border-t border-[#EEEDE7] pt-3">
        <span className={`${btn.secondary} hidden cq-sm:inline-flex`}>
          <DownloadIcon className="h-3.5 w-3.5" />
          下载视频
        </span>
        <motion.span className={`${published ? `${btn.secondary} text-[#0E7A5A]` : btn.primary} relative`} style={{ scale: press }}>
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

/* ── 路线动画播放器 ── */
function Player() {
  const p = useProgress();
  const draw = useRange(p, AT.reelDraw, [0, 1], { easing: ease.linear });
  const timeRef = useScrollCounter(p, 0, 45, AT.reelDraw[0], AT.reelDraw[1], 0, (n) => `00:${String(Math.floor(n)).padStart(2, '0')}`, ease.linear);
  const caption = useStep(p, CAPTION_AT);
  const captionOpacity = useFade(p, CAPTION_AT[0] - bsec(0.2), CAPTION_AT[0]);

  return (
    <div className="flex min-h-0 min-w-0 flex-col cq-md:flex-1">
      <div className="relative h-[200px] shrink-0 overflow-hidden rounded-[12px] border border-[#E2E2D8] bg-[#FAF8F3] cq-md:h-auto cq-md:min-h-0 cq-md:flex-1">
        <TripMap route={AGENCY_ROUTE} draw={draw} labels={['lz', 'zy', 'jyg', 'dh']} />
        <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-[#625F61] ring-1 ring-[#E2E2D8]">敦煌某国际旅行社</span>
        <motion.div className="absolute inset-x-2 bottom-2 flex items-center gap-2 rounded-[8px] bg-white/95 px-2 py-1.5 ring-1 ring-[#E2E2D8]" style={{ opacity: captionOpacity }}>
          <Badge tone="flame">AI 撰写</Badge>
          <span className="min-w-0 truncate text-xs text-[#241E20]">{CAPTIONS[Math.max(0, caption - 1)].text}</span>
        </motion.div>
      </div>
      <div className="mt-2 flex shrink-0 items-center gap-2 text-xs text-[#625F61]">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#241E20] text-white">
          <PlayIcon className="h-3 w-3" />
        </span>
        <span className="shrink-0 tabular-nums">
          <span ref={timeRef}>00:00</span> / 00:45
        </span>
        <span className="relative h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-[#EEEDE7]">
          <motion.span className="absolute inset-0 origin-left rounded-full bg-[#241E20]" style={{ scaleX: draw }} />
        </span>
        <span className="hidden shrink-0 cq-sm:inline">矢量版 · 不含图商底图</span>
      </div>
    </div>
  );
}
