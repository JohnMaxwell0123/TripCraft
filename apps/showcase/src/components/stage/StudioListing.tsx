'use client';

import type { ComponentType, ReactNode, RefObject } from 'react';
import { motion } from 'framer-motion';
import { LISTING_COVERS } from '@/data/trip';
import { ease, useFadeStyle, useFadeVisibility, useRange, useScrollTypewriter, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { Badge, PageHeader, Ring, Segmented, Steps, btn } from './ui';
import { RouteGlyph } from './RouteGlyph';
import { WIZARD } from './StudioImport';
import {
  AccessibleIcon,
  BedIcon,
  BusIcon,
  CalendarIcon,
  CarIcon,
  CheckIcon,
  ElderIcon,
  PawIcon,
  PersonGlyph,
  PlaneIcon,
  PlusIcon,
  ShieldCheckIcon,
  TicketIcon,
  UsersIcon,
  UtensilsIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * B 端 02 · 填写上架信息（docs/17 §17.4 上架信封、§17.5 透明度）
 *
 * 一条上架线路 = 逐日行程 + 上架信封。五个小节依次填写：
 * 价格规则 → 可调选项 → 包含 / 不包含（七项逐一勾选）→ 价格展示档位（起价 / 区间 / 分项明细，由旅行社选）→
 * 人群适配（标签必须附一句可核验的说明）。右侧实时预览旅客在路径 B 里看到的结果卡，左上角的环显示完整度。
 */

const SECTIONS = ['价格规则', '可调选项', '包含 / 不包含', '价格展示', '人群适配'] as const;

const PRICES: { Icon: ComponentType<IconProps>; label: string; value: string }[] = [
  { Icon: (props) => <PersonGlyph kind="adult" {...props} />, label: '成人', value: '¥6,280' },
  { Icon: (props) => <PersonGlyph kind="elder" {...props} />, label: '长者 65+', value: '¥5,980' },
  { Icon: (props) => <PersonGlyph kind="child" {...props} />, label: '儿童 2–12 岁', value: '¥4,680' },
  { Icon: BedIcon, label: '单房差', value: '¥1,200' },
];

const OPTIONS: { Icon: ComponentType<IconProps>; name: string; price: string; unit: string }[] = [
  { Icon: BedIcon, name: '敦煌升级高档酒店', price: '+¥380', unit: '每人每晚 · 最多 2 晚' },
  { Icon: CalendarIcon, name: '增加 1 天 · 阳关 · 玉门关', price: '+¥900', unit: '每人' },
  { Icon: PlaneIcon, name: '兰州中川机场接机', price: '+¥300', unit: '每单' },
];

const INCLUDES: { Icon: ComponentType<IconProps>; item: string; included: boolean; note: string }[] = [
  { Icon: BedIcon, item: '住宿', included: true, note: '8 晚舒适型' },
  { Icon: CarIcon, item: '交通', included: true, note: '7 座 MPV + 司导' },
  { Icon: TicketIcon, item: '门票', included: true, note: '行程内首道门票' },
  { Icon: UtensilsIcon, item: '餐', included: true, note: '含早餐，午晚餐自理' },
  { Icon: UsersIcon, item: '导游讲解', included: true, note: '全程司导讲解' },
  { Icon: ShieldCheckIcon, item: '保险', included: true, note: '旅行社责任险' },
  { Icon: BusIcon, item: '接送站', included: false, note: '可选加购' },
];

const ELDER_NOTE = '全程没有连续 50 级以上的台阶；最高海拔 2,980 米（乌鞘岭，车上通过）。';
const CHILD_NOTE = '每天 13:00 前后安排午休。';

const COMPLETENESS = [40, 55, 70, 80, 90, 100];

export function StudioListing() {
  return (
    <Scene range={AT.listingScene} label="填写上架信息">
      <PageHeader
        title="上架信息"
        subtitle="线路 / 河西走廊 9 日 · 长辈友好私家团"
        actions={
          <>
            <Steps labels={WIZARD} active={1} className="hidden cq-md:flex" />
            <span className="text-xs tabular-nums text-ui-ink-3 cq-md:hidden">2 / 3</span>
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
        <aside className="ui-aside hidden w-[224px] shrink-0 flex-col gap-3 bg-ui-sunken/60 p-3.5 cq-md:flex">
          <Preview />
        </aside>
      </div>
    </Scene>
  );
}

/* ── 小节导航：完整度环 + 当前小节高亮，填完打勾（宽视窗） ── */
function useSection() {
  const p = useProgress();
  return useStep(p, AT.sectionAt.slice(1));
}

function useCompleteness() {
  const p = useProgress();
  const step = useStep(p, AT.completeness);
  const input: number[] = [];
  const output: number[] = [];
  AT.completeness.forEach((t, i) => {
    input.push(t, t + bsec(0.4));
    output.push(COMPLETENESS[i] / 100, COMPLETENESS[i + 1] / 100);
  });
  const ring = useRange(p, input, output);
  return { step, ring };
}

function SectionNav() {
  const active = useSection();
  const { step, ring } = useCompleteness();
  return (
    <nav aria-label="上架信息小节" className="hidden w-[144px] shrink-0 flex-col gap-0.5 border-r border-ui-line p-3 cq-lg:flex">
      <div className="mb-2 flex items-center gap-2 px-1">
        <Ring value={ring} size={30} stroke={3} tone="success">
          <span className="text-xs font-semibold tabular-nums text-ui-ink">{COMPLETENESS[step]}</span>
        </Ring>
        <span className="whitespace-nowrap text-xs leading-4 text-ui-ink-2">
          完整度
          <br />
          <span className="text-ui-ink-3">满 100 上架</span>
        </span>
      </div>
      {SECTIONS.map((label, i) => (
        <span
          key={label}
          className={`flex h-8 items-center gap-2 rounded-ui-ctl px-2 text-[13px] transition-colors duration-200 ${i === active ? 'bg-ui-sunken font-medium text-ui-ink' : 'text-ui-ink-2'}`}
        >
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
              i < step ? 'bg-ui-success text-white' : i === active ? 'border-2 border-ui-ink' : 'border border-ui-line-strong'
            }`}
          >
            {i < step ? <CheckIcon className="h-2.5 w-2.5" /> : null}
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
    <p className="flex items-center justify-between text-xs text-ui-ink-3 cq-lg:hidden">
      <span className="font-medium text-ui-ink">{SECTIONS[active]}</span>
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
      <p className="hidden text-[15px] font-semibold text-ui-ink cq-lg:block">{SECTIONS[index]}</p>
      <div className="cq-lg:mt-3">{children}</div>
    </motion.div>
  );
}

function useRowIn(range: readonly [number, number], index: number, total: number) {
  const p = useProgress();
  const at = range[0] + ((range[1] - range[0]) * index) / total;
  const fade = useFadeStyle(p, at, at + bsec(0.25));
  const x = useRange(p, [at, at + bsec(0.3)], [6, 0], { easing: ease.out, rest: 0 });
  return { ...fade, x };
}

/* ① 价格规则 */
function PriceRules() {
  return (
    <div>
      <ul className="flex flex-col">
        {PRICES.map((row, i) => (
          <PriceRow key={row.label} row={row} index={i} />
        ))}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1.5 rounded-ui-ctl bg-ui-sunken px-2.5 py-1.5 text-xs text-ui-ink-2">
        <UsersIcon className="h-3.5 w-3.5 text-ui-ink-3" />
        成团条件：4 人起订 · 淡旺季日历另设
      </p>
    </div>
  );
}

function PriceRow({ row, index }: { row: (typeof PRICES)[number]; index: number }) {
  const style = useRowIn(AT.priceRows, index, PRICES.length);
  return (
    <motion.li className="flex h-11 items-center gap-3 border-b border-ui-line" style={style}>
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ui-sunken text-ui-ink-2">
        <row.Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1 text-[13px] text-ui-ink-2">{row.label}</span>
      <span className="flex h-8 w-28 items-center justify-end rounded-ui-ctl border border-ui-line-strong bg-ui-surface px-2.5 text-[13px] font-medium tabular-nums text-ui-ink">{row.value}</span>
    </motion.li>
  );
}

/* ② 可调选项：旅客在详情页自助调整时据此算预估价 */
function Options() {
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {OPTIONS.map((o, i) => (
          <OptionRow key={o.name} option={o} index={i} />
        ))}
      </ul>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-ui-ink-2">
        <PlusIcon className="h-3.5 w-3.5" />
        添加选项
      </p>
    </div>
  );
}

function OptionRow({ option, index }: { option: (typeof OPTIONS)[number]; index: number }) {
  const style = useRowIn(AT.optionRows, index, OPTIONS.length);
  return (
    <motion.li className="ui-card flex items-start gap-2.5 px-2.5 py-2" style={style}>
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-ui-ctl bg-ui-sunken text-ui-ink-2">
        <option.Icon className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium leading-5 text-ui-ink">{option.name}</span>
        <span className="mt-0.5 flex items-center justify-between gap-2 text-xs text-ui-ink-3">
          <span className="truncate">{option.unit}</span>
          <span className="shrink-0 text-[13px] font-semibold tabular-nums text-ui-ink">{option.price}</span>
        </span>
      </span>
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
    <motion.li className="flex h-9 items-center gap-2.5 border-b border-ui-line" style={style}>
      <row.Icon className="h-4 w-4 shrink-0 text-ui-ink-3" />
      <span className="w-16 shrink-0 text-[13px] text-ui-ink">{row.item}</span>
      <span className="min-w-0 flex-1 truncate text-xs text-ui-ink-3">{row.note}</span>
      <Segmented options={['含', '不含']} active={row.included ? 0 : 1} />
    </motion.li>
  );
}

/* ④ 价格展示档位：粒度由旅行社选，平台只定最低线；每个档位配一张小样，看得出旅客会看到什么 */
function PriceTier() {
  const p = useProgress();
  const picked = useStep(p, [AT.tierClick]) === 1;
  const press = useRange(p, [AT.tierClick - bsec(0.12), AT.tierClick, AT.tierClick + bsec(0.12)], [1, 0.97, 1]);
  const tiers: { name: string; note: string; sample: ReactNode }[] = [
    { name: '起价', note: '需写明起价条件', sample: <span className="text-xs font-semibold tabular-nums text-ui-ink">¥6,280 起</span> },
    { name: '区间', note: '写明价格的决定因素', sample: <span className="text-xs font-semibold tabular-nums text-ui-ink">¥5,980–7,040</span> },
    {
      name: '分项明细',
      note: '交通、住宿、门票等逐项列出',
      sample: (
        <span aria-hidden className="flex h-2.5 w-[84px] overflow-hidden rounded-full">
          <span className="h-full w-[24%] bg-ui-cat-transport" />
          <span className="h-full w-[32%] bg-ui-cat-stay" />
          <span className="h-full w-[11%] bg-ui-cat-sight" />
          <span className="h-full w-[14%] bg-ui-cat-service" />
          <span className="h-full w-[19%] bg-ui-line-strong" />
        </span>
      ),
    },
  ];
  return (
    <div>
      <ul className="flex flex-col gap-2">
        {tiers.map((t, i) => {
          const selected = picked ? i === 2 : i === 0;
          return (
            <motion.li
              key={t.name}
              className={`relative flex items-center gap-3 rounded-ui-card border px-3 py-2.5 transition-colors duration-200 ${selected ? 'border-ui-ink bg-ui-sunken' : 'border-ui-line bg-ui-surface'}`}
              style={i === 2 ? { scale: press } : undefined}
            >
              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${selected ? 'border-ui-ink' : 'border-ui-line-strong'}`}>
                {selected ? <span className="h-2 w-2 rounded-full bg-ui-ink" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[13px] font-medium text-ui-ink">{t.name}</span>
                  <span className="hidden shrink-0 cq-sm:block">{t.sample}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-ui-ink-3">{t.note}</span>
              </span>
              {i === 2 ? <TapCursor approach={AT.tierCursor} clickAt={AT.tierClick} hideAt={AT.tierClick + bsec(0.5)} className="right-10 top-4" /> : null}
            </motion.li>
          );
        })}
      </ul>
      <p className="mt-3 text-xs text-ui-ink-3">「起价」档必须写明条件；任何档位都要列全包含 / 不包含。</p>
    </div>
  );
}

/* ⑤ 人群适配：标签必须附说明 */
function Audience() {
  const p = useProgress();
  const elderRef = useScrollTypewriter(p, ELDER_NOTE, AT.elderNote[0], AT.elderNote[1]);
  const childRef = useScrollTypewriter(p, CHILD_NOTE, AT.childNote[0], AT.childNote[1]);
  const tag = (Icon: ComponentType<IconProps>, label: string, on: boolean) => (
    <span
      key={label}
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs ${on ? 'border-ui-ink bg-ui-sunken font-medium text-ui-ink' : 'border-ui-line text-ui-ink-2'}`}
    >
      {on ? <CheckIcon className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5 text-ui-ink-3" />}
      {label}
    </span>
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {tag(ElderIcon, '适合长辈', true)}
        {tag((props) => <PersonGlyph kind="child" {...props} />, '适合儿童', true)}
        {tag(AccessibleIcon, '无障碍', false)}
        {tag(PawIcon, '可带宠物', false)}
      </div>
      <NoteField label="「适合长辈」说明" textRef={elderRef} text={ELDER_NOTE} range={AT.elderNote} />
      <NoteField label="「适合儿童」说明" textRef={childRef} text={CHILD_NOTE} range={AT.childNote} />
    </div>
  );
}

function NoteField({ label, textRef, text, range }: { label: string; textRef: RefObject<HTMLSpanElement | null>; text: string; range: readonly [number, number] }) {
  const p = useProgress();
  const caret = useFadeStyle(p, range[0], range[0] + bsec(0.1), range[1], range[1] + bsec(0.2));
  return (
    <div className="block">
      <span className="text-xs text-ui-ink-2">
        {label} <span className="text-ui-signal-ink">必填</span>
      </span>
      <span className="mt-1 block min-h-[52px] rounded-ui-ctl border border-ui-line-strong bg-ui-surface px-3 py-2 text-[13px] leading-relaxed text-ui-ink">
        <span ref={textRef}>{text}</span>
        <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] bg-ui-accent align-middle" style={caret} />
      </span>
    </div>
  );
}

/* ── 底部：完整度 + 下一步 ── */
function ListingFooter() {
  const p = useProgress();
  const { step } = useCompleteness();
  const press = useRange(p, [AT.listingNextClick - bsec(0.12), AT.listingNextClick, AT.listingNextClick + bsec(0.12)], [1, 0.96, 1]);
  return (
    <div className="flex shrink-0 items-center justify-between gap-3 border-t border-ui-line pt-3">
      <span className="flex min-w-0 items-center gap-2 whitespace-nowrap text-xs text-ui-ink-2">
        完整度
        <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-ui-line">
          <span className="absolute inset-y-0 left-0 rounded-full bg-ui-success transition-[width] duration-500" style={{ width: `${COMPLETENESS[step]}%` }} />
        </span>
        <span className="tabular-nums text-ui-ink">{COMPLETENESS[step]}%</span>
      </span>
      <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
        下一步
        <TapCursor approach={AT.listingNextCursor} clickAt={AT.listingNextClick} hideAt={AT.roadbookScene[1]} className="left-1/2 top-4" />
      </motion.span>
    </div>
  );
}

/* ── 右侧：旅客在路径 B 里看到的结果卡（随小节填完逐项补全） ── */
function Preview() {
  const p = useProgress();
  const { step } = useCompleteness();
  const tierPicked = useStep(p, [AT.tierClick]) === 1;
  const options = useFadeStyle(p, AT.completeness[1], AT.completeness[1] + bsec(0.3));
  const includes = useFadeStyle(p, AT.completeness[2], AT.completeness[2] + bsec(0.3));
  const elder = useFadeStyle(p, AT.completeness[4], AT.completeness[4] + bsec(0.3));
  const tierFade = useRange(p, [AT.tierClick, AT.tierClick + bsec(0.3)], [0, 1]);
  const tierVisible = useFadeVisibility(tierFade);
  return (
    <>
      <div>
        <p className="text-[13px] font-semibold text-ui-ink">旅客看到的样子</p>
        <p className="mt-0.5 text-xs text-ui-ink-3">路径 B 的结果卡与线路详情</p>
      </div>
      <div className="ui-card overflow-hidden">
        <span className="relative block">
          <RouteGlyph trip={LISTING_COVERS.elder} className="h-[84px] w-full" tag />
        </span>
        <div className="p-3">
          <p className="text-[13px] font-semibold leading-snug text-ui-ink">河西走廊 9 日 · 长辈友好私家团</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ui-ink-2">
            敦煌某国际旅行社
            <ShieldCheckIcon className="h-3.5 w-3.5 text-ui-success" />
          </p>
          <p className="mt-2 text-xs text-ui-ink-3">
            <b className="text-[13px] font-semibold tabular-nums text-ui-ink">¥6,280</b> 起 / 人 · 4 人起订
          </p>
          <motion.p className="mt-1 text-xs text-ui-ink-2" style={options}>
            可调整 3 项，详情页显示预估价
          </motion.p>
          <motion.p className="mt-1 text-xs text-ui-ink-2" style={includes}>
            含住宿 · 交通 · 门票 · 早餐 · 讲解 · 保险
          </motion.p>
          <motion.div className="mt-2" style={{ visibility: tierVisible }}>
            {tierPicked ? (
              <Badge tone="success">
                <CheckIcon className="h-3 w-3" />
                本线路提供分项明细
              </Badge>
            ) : null}
          </motion.div>
          <motion.p className="mt-2 flex items-start gap-1.5 border-t border-ui-line pt-2 text-xs leading-relaxed text-ui-ink" style={elder}>
            <ElderIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ui-ink-3" />
            <span>
              <span className="font-medium">适合长辈</span>
              <span className="text-ui-ink-2">：全程没有连续 50 级以上的台阶</span>
            </span>
          </motion.p>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-ui-ink-2">
        {step >= 5 ? '已可出现在「适合长辈」「适合儿童」筛选中。' : '补全人群适配说明后，可出现在「适合长辈」「适合儿童」筛选中。'}
      </p>
    </>
  );
}
