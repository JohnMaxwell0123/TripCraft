'use client';

import type { ComponentType } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { AGENCY_ROUTE, type PlaceCategory } from '@/data/trip';
import { ease, useFade, useFadeVisibility, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, Toast, useProgress } from './primitives';
import { Badge, CatTile, Checkbox, Ring, Switch, btn } from './ui';
import { MapCanvas } from './MapCanvas';
import type { FlightSpec } from './flight';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CarIcon,
  CheckIcon,
  ElderIcon,
  LockIcon,
  MessageIcon,
  PersonGlyph,
  PlayIcon,
  ShieldCheckIcon,
  SlidersIcon,
  SparklesIcon,
  StarIcon,
  UsersIcon,
  WalletIcon,
  XIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 03 幕（下）· 线路详情与「按需调整」（docs/16 §16.8、docs/17 §17.5–§17.7）
 *
 * 详情页由旅行社在线路工作室生成：路线动画（封面是线路在地图上的完整走向）、逐日安排、透明报价（本线路选「分项明细」档）。
 * 旅客打开一个可调选项，预估价随之更新（一律标注「预估」，以旅行社正式报价为准），
 * 再「向旅行社咨询」——发送前由旅客确认把哪些信息发给这家旅行社（§16.8，默认不含姓名与联系方式）。
 *
 * 导演版（2026-10-29）：镜头依次贴近可调选项与预估价、咨询按钮、发送前的确认面板；
 * 发出后确认面板收成一张小卡，飞向侧栏的「行程空间」，角标在它落地时出现——下一幕就从那里打开。
 */

/** 03 幕的飞行：发出的咨询飞向「行程空间」（侧栏或手机标签栏） */
export const DETAIL_FLIGHTS: FlightSpec[] = [
  {
    id: 'inquiry',
    from: 'consent-sheet',
    to: 'nav-trips',
    t: T.inquiryFlight,
    lift: 70,
    scale: [1, 0.7],
    token: (
      <span className="ui-float inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-full pl-1.5 pr-3 text-[13px] font-medium text-ui-ink !shadow-ui-pop">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-primary text-ui-on-primary">
          <MessageIcon className="h-3.5 w-3.5" />
        </span>
        咨询 · 敦煌某国际旅行社
      </span>
    ),
  },
];

const fmt = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;

const ITINERARY: { day: string; title: string; cat: PlaceCategory }[] = [
  { day: 'D1', title: '兰州集合 · 市区慢游', cat: 'stay' },
  { day: 'D2', title: '兰州 → 张掖 · 翻越乌鞘岭', cat: 'nature' },
  { day: 'D3', title: '七彩丹霞 → 嘉峪关', cat: 'nature' },
  { day: 'D4', title: '嘉峪关 → 敦煌 · 瓜州午休', cat: 'service' },
  { day: 'D5', title: '莫高窟 · 无障碍接驳', cat: 'sight' },
];

/** 与 01 幕的需求画像同一组数据；预算附上筛选页里刚说的「可以到 8000」 */
const CONSENT: { Icon: ComponentType<IconProps>; label: string; value: string; checked: boolean }[] = [
  { Icon: UsersIcon, label: '同行人员', value: '5 人 · 1 长者 1 儿童', checked: true },
  { Icon: CalendarIcon, label: '日期', value: '国庆前后 · 8–10 天', checked: true },
  { Icon: WalletIcon, label: '预算', value: '人均 ¥5,000–7,000，可到 ¥8,000', checked: true },
  { Icon: ElderIcon, label: '身体情况', value: '少走台阶 · 孩子 13:00 午休', checked: true },
  { Icon: SlidersIcon, label: '已选调整', value: '敦煌升级高档酒店 · 预估 ¥7,040', checked: true },
  { Icon: LockIcon, label: '联系方式', value: '姓名与电话，对方回复后再决定', checked: false },
];

const INCLUDED = ['住宿', '交通', '门票', '早餐', '讲解', '保险'];
const EXCLUDED = ['午晚餐', '接送站'];

export function RouteDetail() {
  return (
    <Scene range={T.detailScene} label="线路详情与按需调整">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-sunken text-ui-ink-2">
          <ArrowLeftIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-ui-ink">河西走廊 9 日 · 长辈友好私家团</h3>
          <p className="flex items-center gap-1.5 truncate text-xs leading-4 text-ui-ink-3">
            敦煌某国际旅行社
            <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0 text-ui-success" />
            <span className="hidden cq-sm:inline">资质已认证 · 许可证编号公示</span>
            <span className="inline-flex shrink-0 items-center gap-0.5 tabular-nums text-ui-ink-2">
              <StarIcon className="h-3 w-3 text-ui-ink" />
              4.8
            </span>
          </p>
        </div>
        <span className="hidden shrink-0 items-center gap-2 rounded-full bg-ui-sunken py-1 pl-1 pr-3 cq-sm:flex">
          <Ring value={0.91} size={26} stroke={3} />
          <span className="text-xs text-ui-ink-2">
            匹配度 <b className="font-semibold tabular-nums text-ui-ink">91%</b>
          </span>
        </span>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col cq-md:flex-row">
        <section className="flex min-w-0 flex-col gap-3 p-3 cq-sm:p-4 cq-md:flex-1">
          <Hero />
          <div className="hidden flex-wrap gap-1.5 cq-sm:flex">
            <span className="ui-chip">
              <CalendarIcon className="h-3.5 w-3.5 text-ui-ink-3" />9 天 8 晚
            </span>
            <span className="ui-chip">
              <CarIcon className="h-3.5 w-3.5 text-ui-ink-3" />7 座 MPV + 司导
            </span>
            <span className="ui-chip">
              <ElderIcon className="h-3.5 w-3.5 text-ui-ink-3" />
              适合长辈
            </span>
            <span className="ui-chip">
              <PersonGlyph kind="child" className="h-3.5 w-3.5 text-ui-ink-3" />
              适合儿童
            </span>
          </div>
          <div className="hidden min-h-0 flex-1 flex-col cq-md:flex">
            <p className="text-xs font-medium text-ui-ink-2">逐日安排</p>
            <ol className="mt-1.5 flex flex-col gap-1">
              {ITINERARY.map((d) => (
                <li key={d.day} className="flex h-8 items-center gap-2.5 text-[13px]">
                  <CatTile cat={d.cat} size={26} />
                  <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-ui-ink-3">{d.day}</span>
                  <span className="min-w-0 flex-1 truncate text-ui-ink">{d.title}</span>
                </li>
              ))}
            </ol>
            <p className="mt-1 pl-9 text-xs text-ui-ink-3">还有 4 天 · 鸣沙山日落、雅丹、敦煌送机</p>
          </div>
        </section>

        <aside className="ui-aside flex min-h-0 flex-1 flex-col border-t border-ui-line p-3 cq-sm:p-4 cq-md:w-[292px] cq-md:flex-none cq-md:border-t-0">
          <PriceCard />
        </aside>

        <ConsentSheet />
        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex justify-center">
          <Toast range={T.sentToast}>
            16:20 已发给敦煌某国际旅行社
            <span className="hidden font-normal text-ui-ink-2 cq-sm:inline"> · 回复会出现在行程空间</span>
          </Toast>
        </div>
      </div>
    </Scene>
  );
}

/* ── 路线动画封面：线路在地图上的完整走向（动画由旅行社在工作室一键生成） ── */
function Hero() {
  const full = useMotionValue(1);
  return (
    <div className="relative h-[136px] shrink-0 overflow-hidden rounded-ui-card border border-ui-line cq-sm:h-[168px] cq-md:h-[188px]">
      <MapCanvas route={AGENCY_ROUTE} draw={full} labels={['lz', 'dh']} head={false} scale={false} minimal frame="inset-x-3 top-3 bottom-9" legendClass="right-2 top-2" />
      <span className="ui-glass absolute bottom-2 left-2 inline-flex h-8 items-center gap-2 rounded-full pl-1 pr-3 text-xs font-medium text-ui-ink">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-ink text-white">
          <PlayIcon className="h-3 w-3" />
        </span>
        路线动画 · 0:45
      </span>
      <span className="ui-glass absolute bottom-2 right-2 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium text-ui-ink">
        <SparklesIcon className="h-3.5 w-3.5 text-ui-accent" />
        AI 路书
      </span>
    </div>
  );
}

/* ── 透明报价 + 可调选项 + 预估价 ── */
function PriceCard() {
  const p = useProgress();
  const upgraded = useStep(p, [T.optClick]) === 1;
  const estimateRef = useScrollCounter(p, 6280, 7040, T.estimate[0], T.estimate[1], 0, fmt);
  const familyRef = useScrollCounter(p, 29500, 33300, T.estimate[0], T.estimate[1], 0, fmt);
  const flash = useRange(p, [T.estimate[0], T.estimate[0] + sec(0.2), T.estimate[1] + sec(0.6)], [0, 1, 0]);
  const flashVisibility = useFadeVisibility(flash);
  const press = useRange(p, [T.inquiryClick - sec(0.12), T.inquiryClick, T.inquiryClick + sec(0.12)], [1, 0.97, 1]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[15px] font-semibold text-ui-ink">价格</p>
        <Badge tone="success">
          <CheckIcon className="h-3 w-3" />
          本线路提供分项明细
        </Badge>
      </div>
      <p className="mt-1 text-xs text-ui-ink-3">
        成人 <b className="font-semibold tabular-nums text-ui-ink">¥6,280</b> 起 · 4 人起订 · 舒适型住宿 · 平季
      </p>

      <p className="mt-3 text-xs font-medium text-ui-ink-2">可调整</p>
      <ul data-cam="price-adjust" className="mt-1 flex flex-col">
        <li className="relative flex h-10 items-center gap-3 border-b border-ui-line">
          <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">敦煌 2 晚升级高档酒店</span>
          <span className="shrink-0 text-xs tabular-nums text-ui-ink-2">+¥760 / 人</span>
          <span className="relative">
            <Switch on={upgraded} />
            <TapCursor approach={T.optCursor} clickAt={T.optClick} hideAt={T.optClick + sec(0.5)} className="left-3 top-2" />
          </span>
        </li>
        <li className="flex h-10 items-center gap-3 border-b border-ui-line">
          <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">增加 1 天 · 阳关 · 玉门关</span>
          <span className="shrink-0 text-xs tabular-nums text-ui-ink-2">+¥900 / 人</span>
          <Switch on={false} />
        </li>
      </ul>

      <div data-cam="price-estimate" className="relative mt-3 rounded-ui-card bg-ui-sunken px-3 py-2.5">
        <motion.span aria-hidden className="absolute inset-0 rounded-ui-card ring-2 ring-ui-accent/40" style={{ opacity: flash, visibility: flashVisibility }} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-ui-ink-2">成人预估</span>
          <span className="text-xl font-semibold tabular-nums text-ui-ink">
            <span ref={estimateRef}>{fmt(6280)}</span>
          </span>
        </div>
        <div className="mt-0.5 flex items-baseline justify-between gap-2 text-xs text-ui-ink-2">
          <span>全家 5 人预估</span>
          <span className="tabular-nums">
            <span ref={familyRef}>{fmt(29500)}</span>
          </span>
        </div>
        <p className="mt-1.5 text-xs text-ui-ink-3">预估价，以旅行社正式报价为准</p>
      </div>

      <div className="mt-3 hidden flex-col gap-1.5 text-xs cq-sm:flex">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-ink">
          <span className="w-6 shrink-0 text-ui-ink-3">含</span>
          {INCLUDED.map((x) => (
            <span key={x} className="inline-flex items-center gap-0.5">
              <CheckIcon className="h-3 w-3 text-ui-success" />
              {x}
            </span>
          ))}
        </p>
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-ui-ink-2">
          <span className="w-6 shrink-0 text-ui-ink-3">不含</span>
          {EXCLUDED.map((x) => (
            <span key={x} className="inline-flex items-center gap-0.5">
              <XIcon className="h-3 w-3 text-ui-ink-3" />
              {x}
            </span>
          ))}
        </p>
      </div>

      <div data-cam="inquiry-btn" className="mt-auto pt-3">
        <motion.span className={`${btn.primary} relative h-10 w-full`} style={{ scale: press }}>
          向旅行社咨询
          <TapCursor approach={T.inquiryCursor} clickAt={T.inquiryClick} hideAt={T.inquiryClick + sec(0.4)} className="right-1/4 top-5" />
        </motion.span>
        <p className="mt-2 text-center text-xs text-ui-ink-3">合同与付款由你与旅行社直接签订</p>
      </div>
    </div>
  );
}

/* ── 发送前确认：只发送勾选的信息（docs/16 §16.8） ── */
function ConsentSheet() {
  const p = useProgress();
  const [a, b, c, d] = T.consent;
  const backdrop = useFade(p, a, b, c, d);
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [16, 0, 0, 12], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);
  const sent = useStep(p, [T.sendClick]) === 1;
  const press = useRange(p, [T.sendClick - sec(0.12), T.sendClick, T.sendClick + sec(0.12)], [1, 0.96, 1]);

  return (
    <motion.div className="absolute inset-0 z-40 flex items-end justify-center cq-md:items-center" style={{ visibility }}>
      <motion.span aria-hidden className="absolute inset-0 bg-ui-ink/25" style={{ opacity: backdrop }} />
      <motion.div
        role="dialog"
        aria-label="发送给旅行社的信息"
        data-cam="consent-sheet"
        className="ui-float relative w-full rounded-t-ui-panel p-4 !shadow-ui-pop cq-md:w-[420px] cq-md:rounded-ui-panel"
        style={{ opacity, y }}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ui-success/10 text-ui-success">
            <ShieldCheckIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ui-ink">发送给敦煌某国际旅行社</p>
            <p className="mt-0.5 text-xs text-ui-ink-3">只发送你勾选的信息；沟通记录仅你和这家旅行社可见</p>
          </div>
        </div>
        <ul className="mt-3 flex flex-col rounded-ui-card border border-ui-line px-3">
          {CONSENT.map((row) => (
            <li key={row.label} className="flex h-9 items-center gap-2.5 border-b border-ui-line last:border-b-0">
              <Checkbox checked={row.checked} />
              <row.Icon className={`h-3.5 w-3.5 shrink-0 ${row.checked ? 'text-ui-ink-2' : 'text-ui-ink-3'}`} />
              <span className={`w-16 shrink-0 text-[13px] ${row.checked ? 'text-ui-ink' : 'text-ui-ink-3'}`}>{row.label}</span>
              <span className={`min-w-0 flex-1 truncate text-xs ${row.checked ? 'text-ui-ink-2' : 'text-ui-ink-3'}`}>{row.value}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex justify-end gap-2">
          <span className={btn.secondary}>取消</span>
          <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
            {sent ? (
              <>
                <CheckIcon className="h-3.5 w-3.5" />
                已发送
              </>
            ) : (
              '确认发送'
            )}
            <TapCursor approach={T.sendCursor} clickAt={T.sendClick} hideAt={T.consent[3]} className="left-1/2 top-4" />
          </motion.span>
        </div>
      </motion.div>
    </motion.div>
  );
}
