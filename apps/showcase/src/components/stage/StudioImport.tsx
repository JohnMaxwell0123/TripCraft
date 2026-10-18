'use client';

import { motion, useTransform } from 'framer-motion';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { Badge, PageHeader, Steps, btn } from './ui';
import { CheckIcon, FileTextIcon, SparklesIcon, UploadIcon } from '@/components/common/Icons';

/**
 * B 端 01 · 导入行程单（docs/17 §17.3「先录已经写过的，不要求新写」）
 *
 * 定制师拖入已有的 Word 行程单 → AI 抽取为逐日行程 → 置信度低的字段高亮并标出置信度 →
 * 点开逐项核对：左侧原文对应的句子同时高亮 → 确认。不提供「全部接受」，地点经图商核验。
 */

export const WIZARD = ['导入', '上架信息', '路书'] as const;

interface Day {
  day: string;
  title: string;
  /** 里程（或当天安排的补充） */
  distance?: string;
  stay: string;
  meal: string;
  /** 低置信度字段：distance 或 meal */
  flag?: { field: 'distance' | 'meal'; conf: number; index: 0 | 1 };
}

const DAYS: Day[] = [
  { day: 'D1', title: '兰州集合 · 市区慢游', stay: '住兰州', meal: '含早' },
  { day: 'D2', title: '兰州 → 张掖', distance: '505 km', stay: '住张掖', meal: '含早餐', flag: { field: 'meal', conf: 62, index: 0 } },
  { day: 'D3', title: '七彩丹霞 → 嘉峪关', distance: '225 km', stay: '住嘉峪关', meal: '含早' },
  { day: 'D4', title: '嘉峪关 → 敦煌', distance: '383 km', stay: '住敦煌', meal: '含早', flag: { field: 'distance', conf: 74, index: 1 } },
  { day: 'D5', title: '莫高窟 · 无障碍接驳', stay: '住敦煌', meal: '含早' },
  { day: 'D6', title: '鸣沙山 · 月牙泉日落', stay: '住敦煌', meal: '含早' },
  { day: 'D7', title: '雅丹 → 敦煌', distance: '360 km', stay: '住敦煌', meal: '含早' },
];

/** 原文（Word 行程单节选）；mark 对应两处低置信度字段 */
const SOURCE: { text: string; mark?: 0 | 1 }[] = [
  { text: '第 1 天　兰州集合，市区慢游' },
  { text: '第 2 天　兰州—张掖，约 505 公里' },
  { text: '　　住宿：张掖舒适型酒店，含早', mark: 0 },
  { text: '第 3 天　七彩丹霞—嘉峪关' },
  { text: '第 4 天　嘉峪关—敦煌，约 380 公里', mark: 1 },
  { text: '第 5 天　莫高窟，无障碍接驳，参观平层窟' },
  { text: '第 6 天　鸣沙山、月牙泉，看日落' },
  { text: '费用：成人 6280 元起（4 人起订）' },
];

const POPOVERS = [
  {
    range: AT.popover1,
    source: '住宿：张掖舒适型酒店，含早',
    extracted: '含早餐（每人每天 1 份）',
    conf: 62,
    cursor: AT.confirm1Cursor,
    click: AT.confirm1Click,
  },
  {
    range: AT.popover2,
    source: '第 4 天　嘉峪关—敦煌，约 380 公里',
    extracted: '383 km（按图商算路）',
    conf: 74,
    cursor: AT.confirm2Cursor,
    click: AT.confirm2Click,
  },
] as const;

export function StudioImport() {
  return (
    <Scene range={AT.importScene} label="导入行程单">
      <PageHeader
        title="导入行程单"
        subtitle="线路 / 新建线路"
        actions={
          <>
            <Steps labels={WIZARD} active={0} className="hidden cq-md:flex" />
            <span className="text-xs tabular-nums text-[#828081] cq-md:hidden">1 / 3</span>
          </>
        }
      />
      <div className="relative flex min-h-0 flex-1">
        <SourcePane />
        <section className="relative flex min-w-0 flex-1 flex-col p-4">
          <ExtractHeader />
          <FileChip className="mt-3 cq-md:hidden" />
          <div className="relative mt-3 min-h-0 flex-1">
            <UploadState />
            <ol className="flex flex-col">
              {DAYS.map((d, i) => (
                <DayRow key={d.day} day={d} index={i} />
              ))}
            </ol>
          </div>
          <ImportFooter />
        </section>
      </div>
    </Scene>
  );
}

/* ── 左侧：原文（宽视窗） ── */
function SourcePane() {
  const p = useProgress();
  const opacity = useFade(p, AT.sourceIn[0], AT.sourceIn[1]);
  const scan = useRange(p, AT.parsing, [0, 100]);
  const scanTop = useTransform(scan, (n) => `${n}%`);
  const scanOpacity = useFade(p, AT.parsing[0], AT.parsing[0] + bsec(0.2), AT.parsing[1] - bsec(0.2), AT.parsing[1]);

  return (
    <section className="hidden w-[38%] shrink-0 flex-col border-r border-[#EEEDE7] bg-[#FAF8F3] p-4 cq-md:flex">
      <p className="text-xs font-medium text-[#625F61]">原文</p>
      <FileChip className="mt-3" />
      <motion.div className="relative mt-3 min-h-0 flex-1 overflow-hidden rounded-[8px] border border-[#E2E2D8] bg-white px-4 py-3" style={{ opacity }}>
        <p className="text-[13px] font-semibold text-[#241E20]">河西走廊 9 日 · 长辈友好私家团</p>
        <ul className="mt-2 flex flex-col gap-1.5">
          {SOURCE.map((line) => (
            <SourceLine key={line.text} text={line.text} mark={line.mark} />
          ))}
        </ul>
        <motion.span aria-hidden className="absolute inset-x-0 h-px bg-[#FE3C01]" style={{ top: scanTop, opacity: scanOpacity }} />
      </motion.div>
    </section>
  );
}

function SourceLine({ text, mark }: { text: string; mark?: 0 | 1 }) {
  const p = useProgress();
  const range = mark === undefined ? null : POPOVERS[mark].range;
  const highlight = useRange(p, range ? [range[0], range[1], range[2], range[3]] : [0, 1], range ? [0, 1, 1, 0] : [0, 0]);
  return (
    <li className="relative whitespace-pre-wrap text-xs leading-5 text-[#625F61]">
      {mark !== undefined ? <motion.span aria-hidden className="absolute -inset-x-1 inset-y-0 rounded-[3px] bg-[#FE3C01]/15" style={{ opacity: highlight }} /> : null}
      <span className="relative">{text}</span>
    </li>
  );
}

function FileChip({ className = '' }: { className?: string }) {
  const p = useProgress();
  const opacity = useFade(p, AT.dropFile[0], AT.dropFile[1]);
  const y = useRange(p, AT.dropFile, [8, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.div className={`flex items-center gap-3 rounded-[8px] border border-[#E2E2D8] bg-white px-3 py-2 ${className}`} style={{ opacity, y }}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#EEF2F8] text-[#3D5A80]">
        <FileTextIcon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[#241E20]">河西走廊9日私家团.docx</span>
        <span className="block text-xs text-[#828081]">Word · 3 页 · 原文件保留</span>
      </span>
    </motion.div>
  );
}

/* ── 右侧标题：逐日行程 + 待确认数量 ── */
function ExtractHeader() {
  const p = useProgress();
  const stage = useStep(p, [AT.reviewCount, AT.confirm1Click, AT.confirm2Click]);
  const opacity = useFade(p, AT.dayRows[0], AT.dayRows[0] + bsec(0.3));
  return (
    <div className="flex h-6 items-center justify-between gap-2">
      <p className="flex items-center gap-1.5 text-[13px] font-semibold text-[#241E20]">
        <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
        AI 抽取的逐日行程
      </p>
      <motion.span style={{ opacity }}>
        {stage === 0 ? <Badge>抽取中</Badge> : null}
        {stage === 1 ? <Badge tone="flame">待确认 2 项</Badge> : null}
        {stage === 2 ? <Badge tone="flame">待确认 1 项</Badge> : null}
        {stage === 3 ? (
          <Badge tone="green">
            <CheckIcon className="h-3 w-3" />
            已全部确认
          </Badge>
        ) : null}
      </motion.span>
    </div>
  );
}

/* ── 上传与抽取进度（逐日行程出现之前） ── */
function UploadState() {
  const p = useProgress();
  const opacity = useFade(p, AT.dropFile[0], AT.dropFile[0] + bsec(0.2), AT.dayRows[0] - bsec(0.2), AT.dayRows[0]);
  const visibility = useVisibility(p, -1, AT.dayRows[0]);
  const upload = useRange(p, AT.upload, [0, 1]);
  const parsing = useStep(p, [AT.parsing[0]]) === 1;
  const bar = useRange(p, AT.parsing, [0, 1]);

  return (
    <motion.div className="absolute inset-x-0 top-0 rounded-[12px] border border-dashed border-[#DCDBD3] px-4 py-6 text-center" style={{ opacity, visibility }}>
      <UploadIcon className="mx-auto h-5 w-5 text-[#828081]" />
      <p className="mt-2 text-[13px] text-[#241E20]">{parsing ? 'AI 正在把行程单抽取为逐日行程…' : '拖入 Word、PDF 或 Excel 行程单'}</p>
      <p className="mt-1 text-xs text-[#828081]">{parsing ? '抽取结果会标出每个字段的置信度' : '上传中 · 河西走廊9日私家团.docx'}</p>
      <span className="mx-auto mt-3 block h-1 w-40 overflow-hidden rounded-full bg-[#EEEDE7]">
        <motion.span className="block h-full origin-left rounded-full bg-[#241E20]" style={{ scaleX: parsing ? bar : upload }} />
      </span>
    </motion.div>
  );
}

/* ── 一天一行：标题 + 里程 · 住宿 · 餐食；低置信度字段高亮 ── */
function DayRow({ day, index }: { day: Day; index: number }) {
  const p = useProgress();
  const [a, b] = AT.dayRows;
  const at = a + ((b - a) * index) / DAYS.length;
  const opacity = useFade(p, at, at + bsec(0.25));
  const y = useRange(p, [at, at + bsec(0.3)], [6, 0], { easing: ease.out, rest: 0 });

  return (
    <motion.li className={`relative border-b border-[#F0EFE9] py-1.5 ${index >= 5 ? 'hidden cq-md:block' : ''}`} style={{ opacity, y }}>
      <div className="flex items-center gap-3">
        <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[#828081]">{day.day}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">{day.title}</span>
      </div>
      <div className="mt-0.5 flex items-center gap-2 pl-9 text-xs text-[#625F61]">
        {day.distance ? day.flag?.field === 'distance' ? <FlagChip value={day.distance} flag={day.flag} /> : <span className="tabular-nums">{day.distance}</span> : null}
        {day.distance ? <span className="text-[#C9C7BF]">·</span> : null}
        <span>{day.stay}</span>
        <span className="text-[#C9C7BF]">·</span>
        {day.flag?.field === 'meal' ? <FlagChip value={day.meal} flag={day.flag} /> : <span>{day.meal}</span>}
      </div>
      {day.flag ? <ConfirmPopover index={day.flag.index} /> : null}
    </motion.li>
  );
}

function FlagChip({ value, flag }: { value: string; flag: NonNullable<Day['flag']> }) {
  const p = useProgress();
  const pop = POPOVERS[flag.index];
  const confirmed = useStep(p, [pop.click]) === 1;
  const click = flag.index === 0 ? AT.flag1Click : AT.flag2Click;
  const cursor = flag.index === 0 ? AT.flag1Cursor : AT.flag2Cursor;

  return (
    <span className="relative inline-flex">
      <span
        className={`inline-flex h-5 items-center gap-1 rounded-[4px] px-1.5 transition-colors duration-200 ${
          confirmed ? 'bg-[#0E7A5A]/[0.08] text-[#0E7A5A]' : 'border border-dashed border-[#FE3C01]/60 bg-[#FE3C01]/[0.06] text-[#241E20]'
        }`}
      >
        {confirmed ? <CheckIcon className="h-3 w-3" /> : null}
        <span className="tabular-nums">{value}</span>
        {confirmed ? null : <span className="tabular-nums text-[#C43200]">{flag.conf}%</span>}
      </span>
      <TapCursor approach={cursor} clickAt={click} hideAt={click + bsec(0.4)} className="left-6 top-3" />
    </span>
  );
}

/* ── 逐项核对：原文 vs 抽取结果 ── */
function ConfirmPopover({ index }: { index: 0 | 1 }) {
  const p = useProgress();
  const pop = POPOVERS[index];
  const [a, b, c, d] = pop.range;
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [-4, 0, 0, -4], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);
  const press = useRange(p, [pop.click - bsec(0.12), pop.click, pop.click + bsec(0.12)], [1, 0.94, 1]);

  return (
    <motion.div
      role="dialog"
      aria-label="核对抽取结果"
      className="absolute left-9 right-0 top-full z-40 mt-1 max-w-[300px] rounded-[12px] border border-[#E2E2D8] bg-white p-3 text-left shadow-[0_16px_40px_rgba(36,30,32,0.14)]"
      style={{ opacity, y, visibility }}
    >
      <p className="text-xs text-[#828081]">原文</p>
      <p className="mt-0.5 text-[13px] text-[#241E20]">「{pop.source.trim()}」</p>
      <p className="mt-2 text-xs text-[#828081]">AI 抽取</p>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] font-medium text-[#241E20]">{pop.extracted}</span>
        <span className="shrink-0 text-xs tabular-nums text-[#C43200]">置信度 {pop.conf}%</span>
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <span className={btn.secondary}>修改</span>
        <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
          确认
          <TapCursor approach={pop.cursor} clickAt={pop.click} hideAt={pop.click + bsec(0.4)} className="left-5 top-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}

/* ── 底部：核验说明 + 下一步 ── */
function ImportFooter() {
  const p = useProgress();
  const done = useStep(p, [AT.allConfirmed]) === 1;
  const press = useRange(p, [AT.importNextClick - bsec(0.12), AT.importNextClick, AT.importNextClick + bsec(0.12)], [1, 0.96, 1]);
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#EEEDE7] pt-3">
      <p className="min-w-0 text-xs leading-snug text-[#625F61]">{done ? '21 个地点已经图商核验' : '低置信度字段需逐项确认，不提供「全部接受」'}</p>
      <motion.span className={`${btn.primary} relative transition-opacity duration-300 ${done ? '' : 'opacity-40'}`} style={{ scale: press }}>
        下一步
        <TapCursor approach={AT.importNextCursor} clickAt={AT.importNextClick} hideAt={AT.listingScene[1]} className="left-1/2 top-4" />
      </motion.span>
    </div>
  );
}
