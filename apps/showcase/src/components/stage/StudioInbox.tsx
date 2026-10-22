'use client';

import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { LISTING_COVERS } from '@/data/trip';
import { ease, useFade, useFadeStyle, useRange, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Grow, Scene, TapCursor, Toast, useProgress } from './primitives';
import { Badge, btn } from './ui';
import { RouteGlyph } from './RouteGlyph';
import {
  ArrowLeftIcon,
  CalendarIcon,
  CheckIcon,
  ElderIcon,
  InboxIcon,
  LockIcon,
  PersonGlyph,
  PlusIcon,
  SlidersIcon,
  UsersIcon,
  WalletIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * B 端 04 · 咨询收件箱 → 报价 → 成交 → 白标交付（docs/17 §17.7、§17.8、§17.9）
 *
 * 16:20 新咨询到达（视窗顶部通知 + 侧栏角标），定制师点「咨询」打开收件箱。
 * 这条咨询就是 C 端 03 幕那一家人发出的：同一份需求画像、同一条线路、同一组价格（自助预估 ¥7,040）。
 * 咨询只带旅客授权发送的信息（联系方式等旅客同意后才可见）→ 一键生成分项报价 v1（分项用一条堆叠条表示占比）→
 * 全家在行程空间商量后想加一天 → 基于 v1 新建 v2，与上一版的差异自动列出，并对照旅客说的预算上限（版本只增不改）→
 * 旅客接受 → 合同与付款在平台外完成，标记成交 → 以旅行社自己的品牌交付路书，进入旅客的行程空间「西行计划」。
 */

/** 报价 v1 的分项（成人，合计 ¥7,040）；颜色沿用地点类别的配色，不另立一套 */
const BREAKDOWN: { item: string; price: number; color: string }[] = [
  { item: '交通 · 7 座 MPV + 司导', price: 1680, color: 'bg-ui-cat-transport' },
  { item: '住宿 · 8 晚舒适型', price: 2240, color: 'bg-ui-cat-stay' },
  { item: '敦煌升级高档酒店 · 2 晚', price: 760, color: 'bg-ui-cat-food' },
  { item: '门票 · 行程内首道门票', price: 620, color: 'bg-ui-cat-sight' },
  { item: '导游讲解', price: 980, color: 'bg-ui-cat-service' },
  { item: '保险及其他', price: 760, color: 'bg-ui-ink-3' },
];
const V1_TOTAL = BREAKDOWN.reduce((s, r) => s + r.price, 0);
const fmt = (n: number) => `¥${n.toLocaleString('en-US')}`;

const PIPELINE = ['咨询', '报价', '接受', '成交', '交付'] as const;

export function StudioInbox() {
  return (
    <Scene range={AT.inboxScene} label="咨询、报价与白标交付">
      <div className="relative flex h-full min-h-0">
        <InquiryList className="hidden w-[240px] border-r border-ui-line cq-md:flex" />
        <MobileInbox />
        <section className="relative flex min-w-0 flex-1 flex-col">
          <ThreadHeader />
          <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden bg-ui-sunken/60 px-3 pb-3 cq-sm:px-4 cq-sm:pb-4">
            <Grow at={AT.summaryIn} max={330}>
              <div className="pt-3">
                <SummaryCard />
              </div>
            </Grow>
            <Grow at={AT.quoteV1} max={300}>
              <div className="pt-3">
                <QuoteV1 />
              </div>
            </Grow>
            <Grow at={AT.travelerMsg} max={132}>
              <div className="pt-3">
                <TravelerMessage />
              </div>
            </Grow>
            <Grow at={AT.quoteV2} max={260}>
              <div className="pt-3">
                <QuoteV2 />
              </div>
            </Grow>
            <Grow at={AT.accepted} max={52}>
              <p className="flex items-center justify-center gap-1.5 pt-3 text-xs font-medium text-ui-success">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-ui-success text-white">
                  <CheckIcon className="h-3 w-3" />
                </span>
                旅客已接受报价 v2 · 16:58
              </p>
            </Grow>
            <Grow at={AT.closeCard} max={176}>
              <div className="pt-3">
                <CloseCard />
              </div>
            </Grow>
          </div>
          <WhiteLabelSheet />
        </section>
      </div>
    </Scene>
  );
}

/* ── 咨询列表：宽视窗常驻左侧；手机上是会话之前的一屏 ── */
function InquiryList({ className = '' }: { className?: string }) {
  const p = useProgress();
  const opened = useStep(p, [AT.openClick]) === 1;
  return (
    <aside className={`shrink-0 flex-col bg-ui-surface ${className}`}>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-ui-line px-4">
        <p className="flex items-center gap-2 text-[15px] font-semibold text-ui-ink">
          <InboxIcon className="h-4 w-4 text-ui-ink-3" />
          咨询
        </p>
        <span className="text-xs text-ui-ink-3">平均 2 小时内回复</span>
      </div>
      <div className="flex flex-col gap-0.5 p-2">
        <InquiryRow title="5 人 · 国庆前后" route="河西走廊 9 日 · 长辈友好私家团" time="16:20" status={opened ? undefined : 'new'} active={opened} cursor />
        <InquiryRow title="2 人 · 10 月中旬" route="敦煌 · 张掖 6 日" time="昨天" status="已报价" />
        <InquiryRow title="8 人 · 11 月初" route="河西走廊 9 日 · 长辈友好私家团" time="周一" status="已婉拒 · 团期已满" />
      </div>
    </aside>
  );
}

function MobileInbox() {
  const p = useProgress();
  const opacity = useRange(p, [AT.openClick + bsec(0.15), AT.openClick + bsec(0.45)], [1, 0]);
  const visibility = useVisibility(p, -1, AT.openClick + bsec(0.45));
  return (
    <motion.div className="absolute inset-0 z-30 cq-md:hidden" style={{ opacity, visibility }}>
      <InquiryList className="flex h-full w-full" />
    </motion.div>
  );
}

function InquiryRow({ title, route, time, status, active = false, cursor = false }: { title: string; route: string; time: string; status?: string; active?: boolean; cursor?: boolean }) {
  return (
    <div className={`relative flex gap-2.5 rounded-ui-ctl px-2.5 py-2 transition-colors duration-200 ${active ? 'bg-ui-sunken' : ''}`}>
      <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${status === 'new' ? 'bg-ui-accent/10 text-ui-accent-ink' : 'bg-ui-sunken text-ui-ink-3'}`}>
        <UsersIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ui-ink">{title}</span>
          <span className="shrink-0 text-xs tabular-nums text-ui-ink-3">{time}</span>
        </div>
        <p className="mt-0.5 truncate text-xs text-ui-ink-2">{route}</p>
        {status === 'new' ? (
          <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-ui-accent-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-ui-accent" />
            新咨询
          </span>
        ) : status ? (
          <p className="mt-1 truncate text-xs text-ui-ink-3">{status}</p>
        ) : null}
      </div>
      {cursor ? <TapCursor approach={AT.openCursor} clickAt={AT.openClick} hideAt={AT.openClick + bsec(0.4)} className="left-1/2 top-5" /> : null}
    </div>
  );
}

/* ── 会话标题：这条咨询走到了哪一步（咨询 → 报价 → 接受 → 成交 → 交付） ── */
function ThreadHeader() {
  const p = useProgress();
  const fade = useFadeStyle(p, AT.summaryIn[0], AT.summaryIn[1]);
  const stage = useStep(p, [AT.sendV1Click, AT.sendV2Click, AT.accepted[0], AT.closeClick, AT.deliverClick]);
  const label = ['咨询中', '已报价 v1', '已报价 v2', '已接受', '已成交', '已交付'][stage];
  // 报价 v1、v2 都算「报价」这一步
  const reached = [0, 1, 1, 2, 3, 4][stage];
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-sunken text-ui-ink-2 cq-md:hidden">
        <ArrowLeftIcon className="h-4 w-4" />
      </span>
      <motion.div className="min-w-0 flex-1" style={fade}>
        <p className="truncate text-[15px] font-semibold leading-5 text-ui-ink">5 人 · 1 长者 1 儿童 · 国庆前后</p>
        <p className="truncate text-xs leading-4 text-ui-ink-3">河西走廊 9 日 · 长辈友好私家团</p>
      </motion.div>
      <motion.div className="flex shrink-0 items-center gap-2" style={fade}>
        <ol aria-hidden className="hidden items-center gap-1 cq-lg:flex">
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-1">
              {i > 0 ? <span className={`h-px w-2.5 ${i <= reached ? 'bg-ui-success' : 'bg-ui-line-strong'}`} /> : null}
              <span className={`h-2 w-2 rounded-full ${i < reached ? 'bg-ui-success' : i === reached ? 'bg-ui-ink' : 'bg-ui-line-strong'}`} title={step} />
            </li>
          ))}
        </ol>
        <Badge tone={stage >= 4 ? 'success' : stage >= 3 ? 'dark' : 'neutral'}>{label}</Badge>
      </motion.div>
    </div>
  );
}

function Card({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="ui-card p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-ui-ink">{title}</p>
        {meta ? <span className="shrink-0 text-xs text-ui-ink-3">{meta}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ① 旅客授权发送的需求摘要：与旅客那一侧的需求画像同一种表达 */
function SummaryCard() {
  const p = useProgress();
  const press = useRange(p, [AT.quoteClick - bsec(0.12), AT.quoteClick, AT.quoteClick + bsec(0.12)], [1, 0.96, 1]);
  const rows: { Icon: ComponentType<IconProps>; k: string; v: ReactNode }[] = [
    {
      Icon: UsersIcon,
      k: '同行',
      v: (
        <span className="flex flex-col items-start gap-0.5">
          <span aria-hidden className="flex items-end text-ui-ink-2">
            <PersonGlyph kind="adult" className="-ml-1 h-4 w-4 first:ml-0" />
            <PersonGlyph kind="adult" className="-ml-1 h-4 w-4" />
            <PersonGlyph kind="adult" className="-ml-1 h-4 w-4" />
            <PersonGlyph kind="elder" className="-ml-0.5 h-4 w-4" />
            <PersonGlyph kind="child" className="-ml-0.5 h-3.5 w-3.5" />
          </span>
          5 人（3 成人 · 1 长者 70+ · 1 儿童 4 岁）
        </span>
      ),
    },
    { Icon: CalendarIcon, k: '日期', v: '国庆前后 · 8–10 天' },
    { Icon: WalletIcon, k: '预算', v: '人均 ¥5,000–7,000，可到 ¥8,000' },
    { Icon: ElderIcon, k: '身体', v: '少走台阶 · 孩子 13:00 午休' },
    { Icon: SlidersIcon, k: '已选调整', v: '敦煌 2 晚升级高档酒店 · 自助预估 ¥7,040' },
  ];
  return (
    <Card title="旅客授权发送的信息" meta="16:20">
      <dl className="flex flex-col gap-1.5">
        {rows.map(({ Icon, k, v }) => (
          <div key={k} className="flex items-start gap-2 text-[13px]">
            <dt className="flex w-[72px] shrink-0 items-center gap-1.5 text-xs leading-5 text-ui-ink-3">
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {k}
            </dt>
            <dd className="min-w-0 flex-1 text-ui-ink">{v}</dd>
          </div>
        ))}
        <div className="flex items-start gap-2 text-[13px]">
          <dt className="flex w-[72px] shrink-0 items-center gap-1.5 text-xs leading-5 text-ui-ink-3">
            <LockIcon className="h-3.5 w-3.5 shrink-0" />
            联系方式
          </dt>
          <dd className="min-w-0 flex-1 text-ui-ink-3">旅客同意后可见</dd>
        </div>
      </dl>
      <div className="mt-3 flex justify-end">
        <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
          生成报价
          <TapCursor approach={AT.quoteCursor} clickAt={AT.quoteClick} hideAt={AT.quoteClick + bsec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </Card>
  );
}

/* ② 报价 v1：分项明细 + 一条按占比堆叠的色条 */
function QuoteV1() {
  const p = useProgress();
  const sent = useStep(p, [AT.sendV1Click]) === 1;
  const press = useRange(p, [AT.sendV1Click - bsec(0.12), AT.sendV1Click, AT.sendV1Click + bsec(0.12)], [1, 0.96, 1]);
  return (
    <Card title="报价 v1 · 分项明细" meta={sent ? '已发送 · 16:32' : '草稿'}>
      <span aria-hidden className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full">
        {BREAKDOWN.map((r) => (
          <span key={r.item} className={`h-full ${r.color}`} style={{ width: `${(r.price / V1_TOTAL) * 100}%` }} />
        ))}
      </span>
      <ul className="mt-2 grid grid-cols-1 gap-x-4 cq-lg:grid-cols-2">
        {BREAKDOWN.map((r) => (
          <li key={r.item} className="flex h-6 items-center gap-2 text-xs">
            <span className={`h-2 w-2 shrink-0 rounded-full ${r.color}`} />
            <span className="min-w-0 flex-1 truncate text-ui-ink-2">{r.item}</span>
            <span className="shrink-0 tabular-nums text-ui-ink">{fmt(r.price)}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-end justify-between gap-3 border-t border-ui-line pt-2">
        <span className="text-xs text-ui-ink-2">
          成人合计 <b className="text-base font-semibold tabular-nums text-ui-ink">{fmt(V1_TOTAL)}</b>
          <span className="text-ui-ink-3"> · 全家 ¥33,300</span>
        </span>
        <motion.span className={`${sent ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: press }}>
          {sent ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已发送
            </>
          ) : (
            '发送给旅客'
          )}
          <TapCursor approach={AT.sendV1Cursor} clickAt={AT.sendV1Click} hideAt={AT.sendV1Click + bsec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </Card>
  );
}

/* ③ 旅客提出调整 */
function TravelerMessage() {
  const p = useProgress();
  const press = useRange(p, [AT.v2Click - bsec(0.12), AT.v2Click, AT.v2Click + bsec(0.12)], [1, 0.96, 1]);
  return (
    <div className="flex items-start gap-2">
      <span className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full bg-ui-accent/10 text-ui-accent-ink">
        <UsersIcon className="h-3.5 w-3.5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-ui-ink-3">旅客 · 16:41</p>
        <p className="mt-1 w-fit max-w-full rounded-[16px] rounded-tl-[6px] bg-ui-surface px-3 py-2 text-[13px] text-ui-ink shadow-ui-card">全家商量了一下，能再加一天去阳关和玉门关吗？</p>
        <motion.span className={`${btn.secondary} relative mt-2`} style={{ scale: press }}>
          <PlusIcon className="h-3.5 w-3.5" />
          基于 v1 新建报价 v2
          <TapCursor approach={AT.v2Cursor} clickAt={AT.v2Click} hideAt={AT.v2Click + bsec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </div>
  );
}

/* ④ 报价 v2：自动列出与 v1 的差异，并对照旅客说的人均上限 ¥8,000 */
function QuoteV2() {
  const p = useProgress();
  const sent = useStep(p, [AT.sendV2Click]) === 1;
  const press = useRange(p, [AT.sendV2Click - bsec(0.12), AT.sendV2Click, AT.sendV2Click + bsec(0.12)], [1, 0.96, 1]);
  return (
    <Card title="报价 v2 · 与 v1 的差异" meta={sent ? '已发送 · 16:45' : '草稿'}>
      <div className="flex items-center justify-between gap-3 rounded-ui-ctl bg-ui-success/[0.08] px-2 py-1.5 text-xs">
        <span className="flex min-w-0 items-center gap-1.5 truncate text-ui-ink">
          <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ui-success text-white">
            <PlusIcon className="h-3 w-3" />
          </span>
          增加 1 天 · 阳关 · 玉门关
        </span>
        <span className="shrink-0 font-medium tabular-nums text-ui-ink">+¥900 / 人</span>
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-3 text-[13px]">
        <span className="text-ui-ink-2">成人合计</span>
        <span className="tabular-nums text-ui-ink">
          <span className="text-ui-ink-3 line-through">¥7,040</span> → <b className="font-semibold">¥7,940</b>
        </span>
      </div>
      <div className="mt-0.5 flex items-baseline justify-between gap-3 text-xs text-ui-ink-2">
        <span>全家</span>
        <span className="tabular-nums">¥33,300 → ¥37,800</span>
      </div>
      {/* 对照预算上限：¥7,940 落在旅客说的 ¥8,000 以内 */}
      <div className="mt-2.5">
        <span aria-hidden className="relative block h-2 rounded-full bg-ui-line">
          <span className="absolute inset-y-0 left-0 rounded-full bg-ui-success" style={{ width: `${(7940 / 8600) * 100}%` }} />
          <span className="absolute -top-1 bottom-[-4px] w-0 border-l-2 border-dashed border-ui-ink" style={{ left: `${(8000 / 8600) * 100}%` }} />
        </span>
        <p className="mt-1 flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1 text-ui-success">
            <CheckIcon className="h-3 w-3" />
            仍在旅客说的人均 ¥8,000 以内
          </span>
          <span className="tabular-nums text-ui-ink-3">上限 ¥8,000</span>
        </p>
      </div>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-ui-ink-3">版本只增不改，旅客可逐版对比</span>
        <motion.span className={`${sent ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: press }}>
          {sent ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已发送
            </>
          ) : (
            '发送给旅客'
          )}
          <TapCursor approach={AT.sendV2Cursor} clickAt={AT.sendV2Click} hideAt={AT.sendV2Click + bsec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </Card>
  );
}

/* ⑤ 站外签约付款 → 标记成交 → 交付白标路书 */
function CloseCard() {
  const p = useProgress();
  const closed = useStep(p, [AT.closeClick]) === 1;
  const closePress = useRange(p, [AT.closeClick - bsec(0.12), AT.closeClick, AT.closeClick + bsec(0.12)], [1, 0.96, 1]);
  const deliverPress = useRange(p, [AT.deliverClick - bsec(0.12), AT.deliverClick, AT.deliverClick + bsec(0.12)], [1, 0.96, 1]);
  return (
    <Card title="请与旅客签订旅游合同并收款">
      <p className="text-xs leading-relaxed text-ui-ink-2">合同与付款在平台外完成，平台不经手团款；完成后标记成交。</p>
      <div className="mt-3 flex justify-end gap-2">
        <motion.span className={`${closed ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: closePress }}>
          {closed ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已成交
            </>
          ) : (
            '标记已成交'
          )}
          <TapCursor approach={AT.closeCursor} clickAt={AT.closeClick} hideAt={AT.closeClick + bsec(0.4)} className="left-1/2 top-4" />
        </motion.span>
        {closed ? (
          <motion.span className={`${btn.primary} relative`} style={{ scale: deliverPress }}>
            交付白标路书
            <TapCursor approach={AT.deliverCursor} clickAt={AT.deliverClick} hideAt={AT.deliverClick + bsec(0.4)} className="left-1/2 top-4" />
          </motion.span>
        ) : null}
      </div>
    </Card>
  );
}

/* ⑥ 白标路书：以旅行社品牌交付，不出现平台标识 */
function WhiteLabelSheet() {
  const p = useProgress();
  const [a, b] = AT.whiteLabel;
  const backdrop = useFade(p, a, b);
  const opacity = useFade(p, a, b);
  const y = useRange(p, [a, b], [16, 0], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, 2);
  const days: [string, string][] = [
    ['D1', '兰州集合 · 市区慢游'],
    ['D2', '兰州 → 张掖 · 翻越乌鞘岭'],
    ['D3', '七彩丹霞 → 嘉峪关'],
  ];

  return (
    <motion.div className="absolute inset-0 z-40 flex items-end justify-center cq-md:items-center" style={{ visibility }}>
      <motion.span aria-hidden className="absolute inset-0 bg-ui-ink/25" style={{ opacity: backdrop }} />
      <motion.div
        role="dialog"
        aria-label="白标路书预览"
        className="ui-float relative w-full overflow-hidden rounded-t-ui-panel !shadow-ui-pop cq-md:w-[372px] cq-md:rounded-ui-panel"
        style={{ opacity, y }}
      >
        <div className="relative bg-[#1F4E5A] px-4 pb-3 pt-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[6px] bg-white text-xs font-bold text-[#1F4E5A]">敦</span>
            <span className="text-[13px] font-medium">敦煌某国际旅行社</span>
          </div>
          <p className="mt-2 text-[15px] font-semibold">河西走廊 9 日 · 长辈友好私家团</p>
          <p className="text-xs text-white/80">专属路书 · 9/24–10/03 · 10 天 · 5 人</p>
        </div>
        <RouteGlyph trip={LISTING_COVERS.elder} className="h-12 w-full" />
        <ul className="px-4 py-2">
          {days.map(([d, t]) => (
            <li key={d} className="flex h-8 items-center gap-3 border-b border-ui-line text-[13px] last:border-b-0">
              <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-ui-ink-3">{d}</span>
              <span className="min-w-0 flex-1 truncate text-ui-ink">{t}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-ui-line bg-ui-sunken px-4 py-3">
          <p className="flex items-start gap-1.5 text-xs font-medium text-ui-success">
            <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            已发送到旅客的行程空间「西行计划」，同行的家人都能看到
          </p>
          <p className="mt-1 text-xs text-ui-ink-3">以贵社品牌交付，路书中不出现 TripCraft 标识。</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 16:20 新咨询到达：视窗顶部通知（盖在上一章的路书页上，定制师随后点侧栏「咨询」） ── */
export function InquiryNotice() {
  return (
    <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex justify-center">
      <Toast range={AT.inquiryNotice} tone="neutral">
        16:20 新咨询 · 5 人 · 国庆前后
        <span className="hidden font-normal text-ui-ink-2 cq-md:inline"> · 河西走廊 9 日 · 长辈友好私家团</span>
      </Toast>
    </div>
  );
}
