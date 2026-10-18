'use client';

import type { ReactNode, RefObject } from 'react';
import { motion } from 'framer-motion';
import { ease, useFade, useRange, useScrollTypewriter, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { Badge, PageHeader, Segmented, Steps, btn } from './ui';
import { WIZARD } from './StudioImport';
import { CheckIcon, PlusIcon } from '@/components/common/Icons';

/**
 * B 端 02 · 填写上架信息（docs/17 §17.4 上架信封、§17.5 透明度）
 *
 * 一条上架线路 = 逐日行程 + 上架信封。五个小节依次填写：
 * 价格规则 → 可调选项 → 包含 / 不包含（七项逐一勾选）→ 价格展示档位（起价 / 区间 / 分项明细，由旅行社选）→
 * 人群适配（标签必须附一句可核验的说明）。右侧实时预览旅客在路径 B 里看到的样子，并显示完整度。
 */

const SECTIONS = ['价格规则', '可调选项', '包含 / 不包含', '价格展示', '人群适配'] as const;

const PRICES = [
  { label: '成人', value: '¥6,280' },
  { label: '长者 65+', value: '¥5,980' },
  { label: '儿童 2–12 岁', value: '¥4,680' },
  { label: '单房差', value: '¥1,200' },
];

const OPTIONS = [
  { name: '敦煌升级高档酒店', price: '+¥380', unit: '每人每晚 · 最多 2 晚' },
  { name: '增加 1 天 · 阳关 · 玉门关', price: '+¥900', unit: '每人' },
  { name: '兰州中川机场接机', price: '+¥300', unit: '每单' },
];

const INCLUDES: { item: string; included: boolean; note: string }[] = [
  { item: '住宿', included: true, note: '8 晚舒适型' },
  { item: '交通', included: true, note: '7 座 MPV + 司导' },
  { item: '门票', included: true, note: '行程内首道门票' },
  { item: '餐', included: true, note: '含早餐，午晚餐自理' },
  { item: '导游讲解', included: true, note: '全程司导讲解' },
  { item: '保险', included: true, note: '旅行社责任险' },
  { item: '接送站', included: false, note: '可选加购' },
];

const TIERS = [
  { name: '起价', note: '需写明起价条件' },
  { name: '区间', note: '写明价格的决定因素' },
  { name: '分项明细', note: '交通、住宿、门票等逐项列出' },
];

const ELDER_NOTE = '全程没有连续 50 级以上的台阶；最高海拔 2,980 米（乌鞘岭，车上通过）。';
const CHILD_NOTE = '每天 13:00 前后安排午休。';

const COMPLETENESS = ['40%', '55%', '70%', '80%', '90%', '100%'];

export function StudioListing() {
  return (
    <Scene range={AT.listingScene} label="填写上架信息">
      <PageHeader
        title="上架信息"
        subtitle="线路 / 河西走廊 9 日 · 长辈友好私家团"
        actions={
          <>
            <Steps labels={WIZARD} active={1} className="hidden cq-md:flex" />
            <span className="text-xs tabular-nums text-[#828081] cq-md:hidden">2 / 3</span>
          </>
        }
      />
      <div className="relative flex min-h-0 flex-1">
        <SectionNav />
        <section className="flex min-w-0 flex-1 flex-col p-4">
          <CompactSectionTitle />
          <div className="relative mt-3 min-h-0 flex-1 cq-lg:mt-0">
            <Section index={0}>
              <PriceRules />
            </Section>
            <Section index={1}>
              <Options />
            </Section>
            <Section index={2}>
              <Includes />
            </Section>
            <Section index={3}>
              <PriceTier />
            </Section>
            <Section index={4}>
              <Audience />
            </Section>
          </div>
          <ListingFooter />
        </section>
        <aside className="hidden w-[248px] shrink-0 flex-col gap-4 border-l border-[#EEEDE7] bg-[#FCFBF8] p-4 cq-md:flex">
          <Preview />
        </aside>
      </div>
    </Scene>
  );
}

/* ── 小节导航：当前小节高亮，填完打勾（宽视窗） ── */
function useSection() {
  const p = useProgress();
  return useStep(p, AT.sectionAt.slice(1));
}

function SectionNav() {
  const active = useSection();
  const p = useProgress();
  const filled = useStep(p, AT.completeness);
  return (
    <nav aria-label="上架信息小节" className="hidden w-[148px] shrink-0 flex-col gap-0.5 border-r border-[#EEEDE7] p-3 cq-lg:flex">
      {SECTIONS.map((label, i) => (
        <span
          key={label}
          className={`flex h-8 items-center gap-2 rounded-[5px] px-2 text-[13px] transition-colors duration-200 ${i === active ? 'bg-[#F4F4EE] font-medium text-[#241E20]' : 'text-[#625F61]'}`}
        >
          <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${i < filled ? 'bg-[#0E7A5A] text-white' : 'border border-[#DCDBD3]'}`}>
            {i < filled ? <CheckIcon className="h-2.5 w-2.5" /> : null}
          </span>
          <span className="truncate">{label}</span>
        </span>
      ))}
    </nav>
  );
}

/** 窄一些的视窗没有小节导航，在表单上方写当前小节 */
function CompactSectionTitle() {
  const active = useSection();
  return (
    <p className="flex items-center justify-between text-xs text-[#828081] cq-lg:hidden">
      <span className="font-medium text-[#241E20]">{SECTIONS[active]}</span>
      <span className="tabular-nums">
        {active + 1} / {SECTIONS.length}
      </span>
    </p>
  );
}

function Section({ index, children }: { index: number; children: ReactNode }) {
  const p = useProgress();
  const start = AT.sectionAt[index];
  const end = AT.sectionAt[index + 1];
  const f = AT.sectionFade;
  const range = end === undefined ? [start - f, start] : [start - f, start, end - f, end];
  const opacity = useRange(p, range, end === undefined ? [0, 1] : [0, 1, 1, 0]);
  const y = useRange(p, [start - f, start], [8, 0], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, start - f, end ?? 2);
  return (
    <motion.div className="absolute inset-0 overflow-hidden" style={{ opacity, y, visibility }}>
      <p className="hidden text-[13px] font-semibold text-[#241E20] cq-lg:block">{SECTIONS[index]}</p>
      <div className="cq-lg:mt-3">{children}</div>
    </motion.div>
  );
}

function useRowIn(range: readonly [number, number], index: number, total: number) {
  const p = useProgress();
  const at = range[0] + ((range[1] - range[0]) * index) / total;
  const opacity = useFade(p, at, at + bsec(0.25));
  const x = useRange(p, [at, at + bsec(0.3)], [6, 0], { easing: ease.out, rest: 0 });
  return { opacity, x };
}

/* ① 价格规则 */
function PriceRules() {
  return (
    <div>
      <ul className="flex flex-col">
        {PRICES.map((row, i) => (
          <PriceRow key={row.label} label={row.label} value={row.value} index={i} />
        ))}
      </ul>
      <p className="mt-3 text-xs text-[#828081]">成团条件：4 人起订 · 淡旺季日历另设</p>
    </div>
  );
}

function PriceRow({ label, value, index }: { label: string; value: string; index: number }) {
  const style = useRowIn(AT.priceRows, index, PRICES.length);
  return (
    <motion.li className="flex h-10 items-center justify-between gap-3 border-b border-[#F0EFE9]" style={style}>
      <span className="text-[13px] text-[#625F61]">{label}</span>
      <span className="flex h-8 w-28 items-center justify-end rounded-[5px] border border-[#E2E2D8] px-2 text-[13px] tabular-nums text-[#241E20]">{value}</span>
    </motion.li>
  );
}

/* ② 可调选项：旅客在详情页自助调整时据此算预估价 */
function Options() {
  return (
    <div>
      <ul className="flex flex-col">
        {OPTIONS.map((o, i) => (
          <OptionRow key={o.name} option={o} index={i} />
        ))}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#625F61]">
        <PlusIcon className="h-3.5 w-3.5" />
        添加选项
      </p>
    </div>
  );
}

function OptionRow({ option, index }: { option: (typeof OPTIONS)[number]; index: number }) {
  const style = useRowIn(AT.optionRows, index, OPTIONS.length);
  return (
    <motion.li className="flex h-12 items-center gap-3 border-b border-[#F0EFE9]" style={style}>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] text-[#241E20]">{option.name}</span>
        <span className="block truncate text-xs text-[#828081]">{option.unit}</span>
      </span>
      <span className="shrink-0 text-[13px] font-medium tabular-nums text-[#241E20]">{option.price}</span>
    </motion.li>
  );
}

/* ③ 包含 / 不包含：七项必须逐一勾选 */
function Includes() {
  return (
    <ul className="flex flex-col">
      {INCLUDES.map((row, i) => (
        <IncludeRow key={row.item} row={row} index={i} />
      ))}
    </ul>
  );
}

function IncludeRow({ row, index }: { row: (typeof INCLUDES)[number]; index: number }) {
  const style = useRowIn(AT.includeRows, index, INCLUDES.length);
  return (
    <motion.li className="flex h-9 items-center gap-3 border-b border-[#F0EFE9]" style={style}>
      <span className="w-16 shrink-0 text-[13px] text-[#241E20]">{row.item}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-[#828081]">{row.note}</span>
      <Segmented options={['含', '不含']} active={row.included ? 0 : 1} />
    </motion.li>
  );
}

/* ④ 价格展示档位：粒度由旅行社选，平台只定最低线 */
function PriceTier() {
  const p = useProgress();
  const picked = useStep(p, [AT.tierClick]) === 1;
  const press = useRange(p, [AT.tierClick - bsec(0.12), AT.tierClick, AT.tierClick + bsec(0.12)], [1, 0.97, 1]);
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {TIERS.map((t, i) => {
          const selected = picked ? i === 2 : i === 0;
          return (
            <motion.li
              key={t.name}
              className={`relative flex items-center gap-3 rounded-[10px] border px-3 py-2 transition-colors duration-200 ${selected ? 'border-[#241E20] bg-[#FAF8F3]' : 'border-[#E2E2D8]'}`}
              style={i === 2 ? { scale: press } : undefined}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#241E20]' : 'border-[#CFCEC6]'}`}>
                {selected ? <span className="h-2 w-2 rounded-full bg-[#241E20]" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium text-[#241E20]">{t.name}</span>
                <span className="block truncate text-xs text-[#828081]">{t.note}</span>
              </span>
              {i === 2 ? <TapCursor approach={AT.tierCursor} clickAt={AT.tierClick} hideAt={AT.tierClick + bsec(0.5)} className="right-10 top-4" /> : null}
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-[#828081]">「起价」档必须写明条件；任何档位都要列全包含 / 不包含。</p>
    </div>
  );
}

/* ⑤ 人群适配：标签必须附说明 */
function Audience() {
  const p = useProgress();
  const elderRef = useScrollTypewriter(p, ELDER_NOTE, AT.elderNote[0], AT.elderNote[1]);
  const childRef = useScrollTypewriter(p, CHILD_NOTE, AT.childNote[0], AT.childNote[1]);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {['适合长辈', '适合儿童'].map((t) => (
          <span key={t} className="inline-flex h-7 items-center gap-1 rounded-[5px] border border-[#241E20] bg-[#F4F4EE] px-2 text-xs font-medium text-[#241E20]">
            <CheckIcon className="h-3 w-3" />
            {t}
          </span>
        ))}
        {['无障碍', '可带宠物'].map((t) => (
          <span key={t} className="inline-flex h-7 items-center rounded-[5px] border border-[#E2E2D8] px-2 text-xs text-[#625F61]">
            {t}
          </span>
        ))}
      </div>
      <NoteField label="「适合长辈」说明" textRef={elderRef} text={ELDER_NOTE} range={AT.elderNote} />
      <NoteField label="「适合儿童」说明" textRef={childRef} text={CHILD_NOTE} range={AT.childNote} />
    </div>
  );
}

function NoteField({ label, textRef, text, range }: { label: string; textRef: RefObject<HTMLSpanElement | null>; text: string; range: readonly [number, number] }) {
  const p = useProgress();
  const caret = useFade(p, range[0], range[0] + bsec(0.1), range[1], range[1] + bsec(0.2));
  return (
    <div className="block">
      <span className="text-xs text-[#625F61]">
        {label} <span className="text-[#C43200]">必填</span>
      </span>
      <span className="mt-1 block min-h-[52px] rounded-[8px] border border-[#E2E2D8] px-3 py-2 text-[13px] leading-relaxed text-[#241E20]">
        <span ref={textRef}>{text}</span>
        <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] bg-[#FE3C01] align-middle" style={{ opacity: caret }} />
      </span>
    </div>
  );
}

/* ── 底部：完整度 + 下一步 ── */
function ListingFooter() {
  const p = useProgress();
  const step = useStep(p, AT.completeness);
  const press = useRange(p, [AT.listingNextClick - bsec(0.12), AT.listingNextClick, AT.listingNextClick + bsec(0.12)], [1, 0.96, 1]);
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-[#EEEDE7] pt-3">
      <span className="flex min-w-0 items-center gap-2 text-xs text-[#625F61]">
        完整度
        <span className="relative h-1 w-20 overflow-hidden rounded-full bg-[#EEEDE7]">
          <span className="absolute inset-y-0 left-0 rounded-full bg-[#241E20] transition-[width] duration-500" style={{ width: COMPLETENESS[step] }} />
        </span>
        <span className="tabular-nums text-[#241E20]">{COMPLETENESS[step]}</span>
      </span>
      <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
        下一步
        <TapCursor approach={AT.listingNextCursor} clickAt={AT.listingNextClick} hideAt={AT.roadbookScene[1]} className="left-1/2 top-4" />
      </motion.span>
    </div>
  );
}

/* ── 右侧：旅客在路径 B 里看到的样子 ── */
function Preview() {
  const p = useProgress();
  const step = useStep(p, AT.completeness);
  const tierPicked = useStep(p, [AT.tierClick]) === 1;
  return (
    <>
      <div>
        <p className="text-[13px] font-semibold text-[#241E20]">旅客看到的样子</p>
        <p className="mt-0.5 text-xs text-[#828081]">路径 B 结果卡与线路详情</p>
      </div>
      <div className="rounded-[12px] border border-[#E2E2D8] bg-white p-3">
        <p className="text-[13px] font-semibold leading-snug text-[#241E20]">河西走廊 9 日 · 长辈友好私家团</p>
        <p className="mt-0.5 text-xs text-[#625F61]">敦煌某国际旅行社 · 已认证</p>
        <p className="mt-2 text-xs text-[#241E20]">
          <b className="font-semibold tabular-nums">成人 ¥6,280 起</b>
          <span className="text-[#828081]"> · 4 人起订</span>
        </p>
        {step >= 2 ? <p className="mt-1 text-xs text-[#625F61]">可调整 3 项，详情页显示预估价</p> : null}
        {step >= 3 ? <p className="mt-1 text-xs text-[#625F61]">含住宿 · 交通 · 门票 · 早餐 · 讲解 · 保险</p> : null}
        {tierPicked ? (
          <div className="mt-2">
            <Badge>本线路提供分项明细</Badge>
          </div>
        ) : null}
        {step >= 5 ? (
          <p className="mt-2 border-t border-[#F0EFE9] pt-2 text-xs leading-relaxed text-[#241E20]">
            <span className="font-medium">适合长辈</span>
            <span className="text-[#625F61]">：全程没有连续 50 级以上的台阶</span>
          </p>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-[#625F61]">
        {step >= 5 ? '已可出现在「适合长辈」「适合儿童」筛选中。' : '补全人群适配说明后，可出现在「适合长辈」「适合儿童」筛选中。'}
      </p>
    </>
  );
}
