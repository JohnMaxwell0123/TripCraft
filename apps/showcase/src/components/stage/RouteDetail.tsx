'use client';

import { motion, useMotionValue } from 'framer-motion';
import { AGENCY_ROUTE } from '@/data/trip';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, Toast, useProgress } from './primitives';
import { Badge, Checkbox, PageHeader, Switch, btn } from './ui';
import { TripMap } from './RouteMap';
import { ArrowLeftIcon, CheckIcon, PlayIcon } from '@/components/common/Icons';

/**
 * 03 幕（下）· 线路详情与「按需调整」（docs/16 §16.8、docs/17 §17.5–§17.7）
 *
 * 详情页由旅行社在线路工作室生成：路线动画、逐日安排、透明报价（本线路选择「分项明细」档）。
 * 旅客打开一个可调选项，预估价随之更新（一律标注「预估」，以旅行社正式报价为准），
 * 再「向旅行社咨询」——发送前由旅客确认把哪些信息发给这家旅行社（§16.8，默认不含姓名与联系方式）。
 */

const fmt = (n: number) => `¥${Math.round(n).toLocaleString('en-US')}`;

const ITINERARY = [
  { day: 'D1', title: '兰州集合 · 市区慢游' },
  { day: 'D2', title: '兰州 → 张掖 · 翻越乌鞘岭' },
  { day: 'D3', title: '七彩丹霞 → 嘉峪关' },
  { day: 'D4', title: '嘉峪关 → 敦煌 · 瓜州午休' },
  { day: 'D5', title: '莫高窟 · 无障碍接驳' },
];

const CONSENT = [
  { label: '同行人员', value: '5 人 · 1 长者 1 儿童', checked: true },
  { label: '日期', value: '国庆前后 · 9–10 天', checked: true },
  { label: '预算', value: '人均 ¥5,000–7,000', checked: true },
  { label: '身体情况', value: '少走台阶 · 孩子午休', checked: true },
  { label: '已选调整', value: '敦煌升级高档酒店 · 预估 ¥7,040', checked: true },
  { label: '联系方式', value: '姓名与电话，对方回复后再决定', checked: false },
];

export function RouteDetail() {
  return (
    <Scene range={T.detailScene} label="线路详情与按需调整">
      <PageHeader
        leading={
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] border border-[#E2E2D8] text-[#625F61]">
            <ArrowLeftIcon className="h-4 w-4" />
          </span>
        }
        title="河西走廊 9 日 · 长辈友好私家团"
        subtitle="敦煌某国际旅行社 · 资质已认证（许可证编号公示） · ★ 4.8"
        actions={<Badge tone="flame" className="hidden cq-sm:inline-flex">匹配度 91%</Badge>}
      />

      <div className="relative flex min-h-0 flex-1 flex-col cq-md:flex-row">
        <section className="flex min-w-0 flex-col gap-3 p-4 cq-md:flex-1">
          <RoutePreview />
          <div className="hidden min-h-0 flex-1 flex-col cq-md:flex">
            <p className="text-xs font-medium text-[#625F61]">逐日安排</p>
            <ol className="mt-1 flex flex-col">
              {ITINERARY.map((d) => (
                <li key={d.day} className="flex h-8 items-center gap-3 border-b border-[#F0EFE9] text-[13px]">
                  <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[#828081]">{d.day}</span>
                  <span className="min-w-0 flex-1 truncate text-[#241E20]">{d.title}</span>
                </li>
              ))}
              <li className="flex h-8 items-center text-xs text-[#828081]">还有 4 天 · 鸣沙山日落、雅丹、敦煌送机</li>
            </ol>
          </div>
        </section>

        <aside className="flex min-h-0 flex-1 flex-col border-t border-[#EEEDE7] p-4 cq-md:w-[288px] cq-md:flex-none cq-md:border-l cq-md:border-t-0">
          <PriceCard />
        </aside>

        <ConsentSheet />
        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex justify-center">
          <Toast range={T.sentToast}>已发送给敦煌某国际旅行社 · 通常 2 小时内回复</Toast>
        </div>
      </div>
    </Scene>
  );
}

/* ── 路线动画封面：矢量路线 + 时长（动画由旅行社在工作室一键生成） ── */
function RoutePreview() {
  const full = useMotionValue(1);
  return (
    <div className="relative h-[132px] shrink-0 overflow-hidden rounded-[12px] border border-[#E2E2D8] bg-[#FAF8F3] cq-md:h-[188px]">
      <TripMap route={AGENCY_ROUTE} draw={full} labels={['lz', 'dh']} head={false} />
      <span className="absolute bottom-2 left-2 inline-flex items-center gap-1.5 rounded-full bg-[#241E20] py-1 pl-1.5 pr-2.5 text-xs font-medium text-[#FFFFF9]">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-white/15">
          <PlayIcon className="h-2.5 w-2.5" />
        </span>
        路线动画 · 0:45
      </span>
      <span className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-xs text-[#625F61] ring-1 ring-[#E2E2D8]">AI 路书</span>
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
  const press = useRange(p, [T.inquiryClick - sec(0.12), T.inquiryClick, T.inquiryClick + sec(0.12)], [1, 0.97, 1]);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#241E20]">价格</p>
        <span className="text-xs text-[#625F61]">本线路提供分项明细</span>
      </div>
      <p className="mt-1 text-xs text-[#828081]">
        成人 <b className="font-semibold tabular-nums text-[#241E20]">¥6,280</b> 起 · 4 人起订 · 舒适型住宿 · 平季
      </p>

      <p className="mt-4 text-xs font-medium text-[#625F61]">可调整</p>
      <ul className="mt-1 flex flex-col">
        <li className="relative flex h-10 items-center gap-3 border-b border-[#F0EFE9]">
          <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">敦煌 2 晚升级高档酒店</span>
          <span className="shrink-0 text-xs tabular-nums text-[#625F61]">+¥760 / 人</span>
          <span className="relative">
            <Switch on={upgraded} />
            <TapCursor approach={T.optCursor} clickAt={T.optClick} hideAt={T.optClick + sec(0.5)} className="left-3 top-2" />
          </span>
        </li>
        <li className="flex h-10 items-center gap-3 border-b border-[#F0EFE9]">
          <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">增加 1 天 · 阳关 · 玉门关</span>
          <span className="shrink-0 text-xs tabular-nums text-[#625F61]">+¥900 / 人</span>
          <Switch on={false} />
        </li>
      </ul>

      <div className="relative mt-3 rounded-[10px] bg-[#F7F6F1] px-3 py-2">
        <motion.span aria-hidden className="absolute inset-0 rounded-[10px] ring-1 ring-[#FE3C01]/40" style={{ opacity: flash }} />
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-[#625F61]">成人预估</span>
          <span className="text-lg font-semibold tabular-nums text-[#241E20]">
            <span ref={estimateRef}>{fmt(6280)}</span>
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2 text-xs text-[#625F61]">
          <span>全家 5 人预估</span>
          <span className="tabular-nums">
            <span ref={familyRef}>{fmt(29500)}</span>
          </span>
        </div>
        <p className="mt-1 text-xs text-[#828081]">预估价，以旅行社正式报价为准</p>
      </div>

      <p className="mt-3 hidden text-xs leading-relaxed text-[#625F61] cq-sm:block">
        含：住宿 · 交通 · 门票 · 早餐 · 讲解 · 保险
        <br />
        不含：午晚餐 · 接送站
      </p>

      <div className="mt-auto pt-3">
        <motion.span className={`${btn.primary} relative h-9 w-full`} style={{ scale: press }}>
          向旅行社咨询
          <TapCursor approach={T.inquiryCursor} clickAt={T.inquiryClick} hideAt={T.inquiryClick + sec(0.4)} className="right-1/4 top-4" />
        </motion.span>
        <p className="mt-2 text-center text-xs text-[#828081]">合同与付款由你与旅行社直接签订</p>
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
      <motion.span aria-hidden className="absolute inset-0 bg-[#241E20]/20" style={{ opacity: backdrop }} />
      <motion.div
        role="dialog"
        aria-label="发送给旅行社的信息"
        className="relative w-full rounded-t-[16px] border border-[#E2E2D8] bg-white p-4 shadow-[0_24px_60px_rgba(36,30,32,0.18)] cq-md:w-[400px] cq-md:rounded-[16px]"
        style={{ opacity, y }}
      >
        <p className="text-[15px] font-semibold text-[#241E20]">发送给敦煌某国际旅行社</p>
        <p className="mt-0.5 text-xs text-[#828081]">只发送你勾选的信息；沟通记录仅你和这家旅行社可见</p>
        <ul className="mt-3 flex flex-col">
          {CONSENT.map((row) => (
            <li key={row.label} className="flex h-9 items-center gap-3 border-b border-[#F0EFE9] last:border-b-0">
              <Checkbox checked={row.checked} />
              <span className="w-16 shrink-0 text-[13px] text-[#241E20]">{row.label}</span>
              <span className={`min-w-0 flex-1 truncate text-xs ${row.checked ? 'text-[#625F61]' : 'text-[#A3A19B]'}`}>{row.value}</span>
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
