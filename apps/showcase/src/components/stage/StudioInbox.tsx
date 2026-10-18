'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { AT, bsec } from './agencyTimeline';
import { Grow, Scene, TapCursor, useProgress } from './primitives';
import { Badge, KeyValue, btn } from './ui';
import { ArrowLeftIcon, CheckIcon } from '@/components/common/Icons';

/**
 * B 端 04 · 咨询收件箱 → 报价 → 成交 → 白标交付（docs/17 §17.7、§17.8、§17.9）
 *
 * 咨询只带旅客授权发送的信息（联系方式等旅客同意后才可见）→ 一键生成分项报价 v1 →
 * 旅客想加一天 → 基于 v1 新建 v2，与上一版的差异自动列出（版本只增不改）→ 旅客接受 →
 * 合同与付款在平台外完成，标记成交 → 以旅行社自己的品牌交付路书，进入旅客的行程空间。
 */

const BREAKDOWN = [
  { item: '交通 · 7 座 MPV + 司导', price: '¥1,680' },
  { item: '住宿 · 8 晚舒适型', price: '¥2,240' },
  { item: '敦煌升级高档酒店 · 2 晚', price: '¥760' },
  { item: '门票 · 行程内首道门票', price: '¥620' },
  { item: '导游讲解', price: '¥980' },
  { item: '保险及其他', price: '¥760' },
];

export function StudioInbox() {
  return (
    <Scene range={AT.inboxScene} label="咨询、报价与白标交付">
      <div className="relative flex h-full min-h-0">
        <InquiryList className="hidden w-[236px] border-r border-[#EEEDE7] cq-md:flex" />
        <MobileInbox />
        <section className="relative flex min-w-0 flex-1 flex-col">
          <ThreadHeader />
          <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden px-4 pb-4">
            <Grow at={AT.summaryIn} max={312}>
              <div className="pt-3">
                <SummaryCard />
              </div>
            </Grow>
            <Grow at={AT.quoteV1} max={332}>
              <div className="pt-3">
                <QuoteV1 />
              </div>
            </Grow>
            <Grow at={AT.travelerMsg} max={132}>
              <div className="pt-3">
                <TravelerMessage />
              </div>
            </Grow>
            <Grow at={AT.quoteV2} max={232}>
              <div className="pt-3">
                <QuoteV2 />
              </div>
            </Grow>
            <Grow at={AT.accepted} max={52}>
              <p className="flex items-center justify-center gap-1.5 pt-3 text-xs text-[#0E7A5A]">
                <CheckIcon className="h-3.5 w-3.5" />
                旅客已接受报价 v2 · 16:58
              </p>
            </Grow>
            <Grow at={AT.closeCard} max={172}>
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
    <aside className={`shrink-0 flex-col bg-white ${className}`}>
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-[#EEEDE7] px-4">
        <p className="text-[15px] font-semibold text-[#241E20]">咨询</p>
        <span className="text-xs text-[#828081]">平均 2 小时内回复</span>
      </div>
      <div className="flex flex-col p-2">
        <Grow at={AT.inquiryArrive} max={72}>
          <InquiryRow title="5 人 · 国庆前后" route="河西走廊 9 日 · 长辈友好私家团" time="16:20" status={opened ? undefined : 'new'} active={opened} cursor />
        </Grow>
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
    <div className={`relative rounded-[8px] px-3 py-2 transition-colors duration-200 ${active ? 'bg-[#F4F4EE]' : ''}`}>
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#241E20]">{title}</span>
        <span className="shrink-0 text-xs tabular-nums text-[#828081]">{time}</span>
      </div>
      <p className="mt-0.5 truncate text-xs text-[#625F61]">{route}</p>
      {status === 'new' ? (
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#C43200]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#FE3C01]" />
          新咨询
        </span>
      ) : status ? (
        <p className="mt-1 truncate text-xs text-[#828081]">{status}</p>
      ) : null}
      {cursor ? <TapCursor approach={AT.openCursor} clickAt={AT.openClick} hideAt={AT.openClick + bsec(0.4)} className="left-1/2 top-5" /> : null}
    </div>
  );
}

/* ── 会话标题：这条咨询走到了哪一步 ── */
function ThreadHeader() {
  const p = useProgress();
  const opacity = useFade(p, AT.summaryIn[0], AT.summaryIn[1]);
  const stage = useStep(p, [AT.sendV1Click, AT.sendV2Click, AT.accepted[0], AT.closeClick, AT.deliverClick]);
  const label = ['咨询中', '已报价 v1', '已报价 v2', '已接受', '已成交', '已交付'][stage];
  return (
    <div className="flex h-14 shrink-0 items-center gap-3 border-b border-[#EEEDE7] px-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E2E2D8] text-[#625F61] cq-md:hidden">
        <ArrowLeftIcon className="h-4 w-4" />
      </span>
      <motion.div className="min-w-0 flex-1" style={{ opacity }}>
        <p className="truncate text-[15px] font-semibold leading-5 text-[#241E20]">5 人 · 1 长者 1 儿童 · 国庆前后</p>
        <p className="truncate text-xs leading-4 text-[#828081]">河西走廊 9 日 · 长辈友好私家团</p>
      </motion.div>
      <motion.span style={{ opacity }}>
        <Badge tone={stage >= 4 ? 'green' : stage >= 3 ? 'dark' : 'neutral'}>{label}</Badge>
      </motion.span>
    </div>
  );
}

function Card({ title, meta, children }: { title: ReactNode; meta?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-[12px] border border-[#E2E2D8] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#241E20]">{title}</p>
        {meta ? <span className="shrink-0 text-xs text-[#828081]">{meta}</span> : null}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

/* ① 旅客授权发送的需求摘要 */
function SummaryCard() {
  const p = useProgress();
  const press = useRange(p, [AT.quoteClick - bsec(0.12), AT.quoteClick, AT.quoteClick + bsec(0.12)], [1, 0.96, 1]);
  const rows: [string, string][] = [
    ['同行', '5 人（3 成人 · 1 长者 70+ · 1 儿童 4 岁）'],
    ['日期', '国庆前后 · 9–10 天'],
    ['预算', '人均 ¥5,000–7,000'],
    ['身体', '少走台阶 · 孩子 13:00 午休'],
    ['已选调整', '敦煌 2 晚升级高档酒店 · 自助预估 ¥7,040'],
  ];
  return (
    <Card title="旅客授权发送的信息" meta="16:20">
      <dl className="flex flex-col gap-1">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-3 text-[13px]">
            <dt className="w-14 shrink-0 text-xs leading-5 text-[#828081]">{k}</dt>
            <dd className="min-w-0 flex-1 text-[#241E20]">{v}</dd>
          </div>
        ))}
        <div className="flex gap-3 text-[13px]">
          <dt className="w-14 shrink-0 text-xs leading-5 text-[#828081]">联系方式</dt>
          <dd className="min-w-0 flex-1 text-[#A3A19B]">旅客同意后可见</dd>
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

/* ② 报价 v1：分项明细 */
function QuoteV1() {
  const p = useProgress();
  const sent = useStep(p, [AT.sendV1Click]) === 1;
  const press = useRange(p, [AT.sendV1Click - bsec(0.12), AT.sendV1Click, AT.sendV1Click + bsec(0.12)], [1, 0.96, 1]);
  return (
    <Card title="报价 v1" meta={sent ? '已发送 · 16:32' : '草稿'}>
      <ul className="flex flex-col">
        {BREAKDOWN.map((r) => (
          <li key={r.item} className="flex h-6 items-center justify-between gap-3 text-xs">
            <span className="min-w-0 truncate text-[#625F61]">{r.item}</span>
            <span className="shrink-0 tabular-nums text-[#241E20]">{r.price}</span>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-end justify-between gap-3 border-t border-[#F0EFE9] pt-2">
        <span className="text-xs text-[#625F61]">
          成人合计 <b className="text-[15px] font-semibold tabular-nums text-[#241E20]">¥7,040</b>
          <span className="text-[#828081]"> · 全家 ¥33,300</span>
        </span>
        <motion.span className={`${sent ? `${btn.secondary} text-[#0E7A5A]` : btn.primary} relative`} style={{ scale: press }}>
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
    <div>
      <p className="text-xs text-[#828081]">旅客 · 16:41</p>
      <p className="mt-1 w-fit max-w-[88%] rounded-[12px] rounded-tl-[4px] bg-[#F4F4EE] px-3 py-2 text-[13px] text-[#241E20]">能再加一天去阳关和玉门关吗？</p>
      <motion.span className={`${btn.secondary} relative mt-2`} style={{ scale: press }}>
        基于 v1 新建报价 v2
        <TapCursor approach={AT.v2Cursor} clickAt={AT.v2Click} hideAt={AT.v2Click + bsec(0.4)} className="left-1/2 top-4" />
      </motion.span>
    </div>
  );
}

/* ④ 报价 v2：自动列出与 v1 的差异 */
function QuoteV2() {
  const p = useProgress();
  const sent = useStep(p, [AT.sendV2Click]) === 1;
  const press = useRange(p, [AT.sendV2Click - bsec(0.12), AT.sendV2Click, AT.sendV2Click + bsec(0.12)], [1, 0.96, 1]);
  return (
    <Card title="报价 v2 · 与 v1 的差异" meta={sent ? '已发送 · 16:45' : '草稿'}>
      <div className="flex items-center justify-between gap-3 rounded-[6px] bg-[#FE3C01]/[0.06] px-2 py-1.5 text-xs">
        <span className="min-w-0 truncate text-[#241E20]">
          <span className="mr-1 font-semibold text-[#C43200]">+</span>增加 1 天 · 阳关 · 玉门关
        </span>
        <span className="shrink-0 tabular-nums text-[#241E20]">+¥900 / 人</span>
      </div>
      <KeyValue className="mt-2" label="成人合计" value={<>¥7,040 → <b className="font-semibold">¥7,940</b></>} />
      <KeyValue className="mt-1" label="全家" value="¥33,300 → ¥37,800" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-xs text-[#828081]">版本只增不改，旅客可逐版对比</span>
        <motion.span className={`${sent ? `${btn.secondary} text-[#0E7A5A]` : btn.primary} relative`} style={{ scale: press }}>
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
      <p className="text-xs leading-relaxed text-[#625F61]">合同与付款在平台外完成，平台不经手团款；完成后标记成交。</p>
      <div className="mt-3 flex justify-end gap-2">
        <motion.span className={`${closed ? `${btn.secondary} text-[#0E7A5A]` : btn.primary} relative`} style={{ scale: closePress }}>
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
      <motion.span aria-hidden className="absolute inset-0 bg-[#241E20]/20" style={{ opacity: backdrop }} />
      <motion.div
        role="dialog"
        aria-label="白标路书预览"
        className="relative w-full overflow-hidden rounded-t-[16px] border border-[#E2E2D8] bg-white shadow-[0_24px_60px_rgba(36,30,32,0.18)] cq-md:w-[360px] cq-md:rounded-[16px]"
        style={{ opacity, y }}
      >
        <div className="bg-[#1F4E5A] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-white text-xs font-bold text-[#1F4E5A]">敦</span>
            <span className="text-[13px] font-medium">敦煌某国际旅行社</span>
          </div>
          <p className="mt-2 text-[15px] font-semibold">河西走廊 9 日 · 长辈友好私家团</p>
          <p className="text-xs text-white/80">专属路书 · 9/24–10/03 · 10 天 · 5 人</p>
        </div>
        <ul className="px-4 py-2">
          {days.map(([d, t]) => (
            <li key={d} className="flex h-8 items-center gap-3 border-b border-[#F0EFE9] text-[13px] last:border-b-0">
              <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[#828081]">{d}</span>
              <span className="min-w-0 flex-1 truncate text-[#241E20]">{t}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-[#EEEDE7] bg-[#FAF8F3] px-4 py-3">
          <p className="flex items-center gap-1.5 text-xs font-medium text-[#0E7A5A]">
            <CheckIcon className="h-3.5 w-3.5" />
            已发送到旅客的行程空间，旅客可邀请家人一起看
          </p>
          <p className="mt-1 text-xs text-[#828081]">以贵社品牌交付，路书中不出现 TripCraft 标识。</p>
        </div>
      </motion.div>
    </motion.div>
  );
}
