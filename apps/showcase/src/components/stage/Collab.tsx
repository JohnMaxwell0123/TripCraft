'use client';

import type { ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { DAYS, qrPath } from '@/data/trip';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Avatar, Reveal, Scene, TapCursor, Toast, useProgress, type AvatarTone } from './primitives';
import { Badge, PageHeader, btn } from './ui';
import { NominationCard } from './Recommend';
import { DeviceSync } from './SyncFinale';
import { BuildingIcon, CheckIcon, CopyIcon, LinkIcon, SparklesIcon, UtensilsIcon } from '@/components/common/Icons';

/**
 * 04 幕 · 行程空间：多人共享与多端同步（docs/15、PRD-01 支柱 3）
 *
 * 03 幕末尾点了侧栏「行程空间」，这一屏就是它的结果：02 幕存下的自驾草案与 03 幕刚发出的咨询并排放着
 * （PRD-01 §2：两条路径都落到行程空间）。等旅行社回复的时候——
 * 领队用链接邀请家人（加入后可查看与提名，改动由领队确认）→ 阿杰、小雨加入 →
 * 阿杰提名一个地点，AI 评估代价 → 领队确认，D0 晚上插入新安排，版本 v1.0 → v1.1 → 逐台设备同步。
 */

const QR = qrPath();

export function TripSpaceScene() {
  return (
    <Scene range={T.shareScene} label="行程空间：多人共享与多端同步">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            西行计划
            <VersionBadge />
          </span>
        }
        subtitle="河西走廊 · 两个方案 · 领队：我"
        actions={
          <>
            <Members />
            <InviteButton />
          </>
        }
      />

      <div className="relative flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-hidden px-4 py-3">
          <PlanStrip />
          <Itinerary />
        </section>

        <aside className="hidden w-[296px] shrink-0 flex-col gap-4 border-l border-[#EEEDE7] bg-[#FCFBF8] p-4 cq-md:flex">
          <NominationPanel />
          <Reveal at={T.syncIn} y={8}>
            <DeviceSync />
          </Reveal>
        </aside>

        <InvitePopover />
        <MobileSheet range={[T.nominationIn[0], T.nominationIn[1], T.nominationSheetOut[0], T.nominationSheetOut[1]]}>
          <NominationCard />
        </MobileSheet>
        <MobileSheet range={[T.syncIn[0], T.syncIn[1]]}>
          <DeviceSync />
        </MobileSheet>

        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex flex-col items-center gap-2">
          <Toast range={T.toastAJie}>阿杰 通过邀请链接加入</Toast>
          <Toast range={T.toastXiaoyu}>小雨 通过邀请链接加入</Toast>
        </div>
      </div>
    </Scene>
  );
}

/* ── 两个方案：路径 A 存下的草案（当前查看）与路径 B 发出的咨询（等待报价） ── */
function PlanStrip() {
  const p = useProgress();
  const [a, b] = T.planIn;
  const flash = useRange(p, [a, b, b + sec(1.4)], [0, 1, 0]);
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      <div className="min-w-0 rounded-[10px] border border-[#241E20] bg-white px-3 py-2">
        <p className="flex items-center gap-1.5 truncate text-xs text-[#625F61]">
          <SparklesIcon className="h-3 w-3 shrink-0 text-[#FE3C01]" />
          正在看 · AI 规划
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-[#241E20]">自驾草案 · 9 天</p>
      </div>
      <div className="relative min-w-0 rounded-[10px] border border-[#E2E2D8] bg-white px-3 py-2">
        <motion.span aria-hidden className="absolute -inset-px rounded-[10px] ring-2 ring-[#FE3C01]/40" style={{ opacity: flash }} />
        <p className="flex items-center gap-1.5 truncate text-xs text-[#625F61]">
          <BuildingIcon className="h-3 w-3 shrink-0" />
          已咨询 · 等待报价
        </p>
        <p className="mt-0.5 truncate text-[13px] font-medium text-[#241E20]">长辈友好私家团</p>
      </div>
    </div>
  );
}

/* ── 版本号：领队确认后 v1.0 → v1.1 ── */
function VersionBadge() {
  const p = useProgress();
  const v11 = useStep(p, [T.version]) === 1;
  return <Badge tone={v11 ? 'green' : 'neutral'}>{v11 ? 'v1.1' : 'v1.0'}</Badge>;
}

/* ── 成员头像：加入时依次入列 ── */
function Members() {
  return (
    <span className="flex items-center">
      <Avatar name="我" tone="violet" size={24} />
      <JoiningAvatar name="阿杰" tone="teal" range={T.joinAJie} />
      <JoiningAvatar name="小雨" tone="rose" range={T.joinXiaoyu} />
    </span>
  );
}

function JoiningAvatar({ name, tone, range }: { name: string; tone: AvatarTone; range: readonly [number, number] }) {
  const p = useProgress();
  const width = useRange(p, [range[0], range[1]], [0, 18]);
  const scale = useRange(p, [range[0], range[1]], [0.4, 1], { easing: ease.back, rest: 1 });
  const opacity = useFade(p, range[0], range[1]);
  return (
    <motion.span className="relative flex h-6 justify-end" style={{ width }}>
      <motion.span className="relative" style={{ scale, opacity }}>
        <Avatar name={name} tone={tone} size={24} />
      </motion.span>
    </motion.span>
  );
}

function InviteButton() {
  const p = useProgress();
  const press = useRange(p, [T.inviteClick - sec(0.12), T.inviteClick, T.inviteClick + sec(0.12)], [1, 0.95, 1]);
  return (
    <motion.span className={`${btn.secondary} relative`} style={{ scale: press }}>
      <LinkIcon className="h-3.5 w-3.5" />
      邀请
      <TapCursor approach={T.inviteCursor} clickAt={T.inviteClick} hideAt={T.inviteClick + sec(0.4)} className="left-8 top-4" />
    </motion.span>
  );
}

/* ── 邀请面板：链接 + 二维码，写清加入者的权限 ── */
function InvitePopover() {
  const p = useProgress();
  const [a, b, c, d] = T.invitePopover;
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [-6, 0, 0, -4], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);
  const copied = useStep(p, [T.copyClick]) === 1;
  const press = useRange(p, [T.copyClick - sec(0.12), T.copyClick, T.copyClick + sec(0.12)], [1, 0.94, 1]);

  return (
    <motion.div
      role="dialog"
      aria-label="邀请同行人"
      className="absolute right-4 top-2 z-40 w-[min(320px,calc(100%-2rem))] rounded-[12px] border border-[#E2E2D8] bg-white p-4 shadow-[0_16px_40px_rgba(36,30,32,0.14)]"
      style={{ opacity, y, visibility }}
    >
      <p className="text-[13px] font-semibold text-[#241E20]">邀请同行人</p>
      <div className="mt-3 flex gap-3">
        <span className="shrink-0 rounded-[8px] border border-[#E2E2D8] p-1.5">
          <svg viewBox="-1 -1 27 27" className="block h-20 w-20" shapeRendering="crispEdges" aria-hidden>
            <path d={QR} fill="#241E20" />
          </svg>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <span className="flex h-8 items-center rounded-[5px] border border-[#E2E2D8] bg-[#F7F6F1] px-2 text-xs tabular-nums text-[#241E20]">
            <span className="truncate">tc.trip/j/7QX</span>
          </span>
          <motion.span className={`${btn.primary} relative w-full`} style={{ scale: press }}>
            {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
            {copied ? '已复制链接' : '复制链接'}
            <TapCursor approach={T.copyCursor} clickAt={T.copyClick} hideAt={T.copyClick + sec(0.5)} className="left-1/2 top-4" />
          </motion.span>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-[#625F61]">微信扫码或打开链接即可加入。加入者可以查看行程、提名地点，改动由你确认后生效。</p>
    </motion.div>
  );
}

/* ── 行程：D0 展开到小时，确认后插入新安排 ── */
function Itinerary() {
  return (
    <div className="flex flex-col">
      <div className="rounded-[12px] border border-[#E2E2D8] p-3">
        <div className="flex items-center gap-3">
          <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[#828081]">D0</span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[#241E20]">09/24 · 兰州 · 落地取车</span>
        </div>
        <ul className="mt-2 flex flex-col gap-1 pl-9">
          <TimeRow time="14:30" text="中川机场取车 · 腾势 D9" />
          <TimeRow time="19:15" text="入住黄河边酒店 · 地面车位" />
          <InsertedRow />
        </ul>
      </div>
      <ol className="mt-2 flex flex-col">
        {DAYS.slice(1, 7).map((day) => (
          <li key={day.tag} className="flex h-10 items-center gap-3 border-b border-[#F0EFE9] px-3">
            <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-[#828081]">{day.tag}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">{day.title}</span>
            <span className="shrink-0 text-xs tabular-nums text-[#828081]">{day.drive ?? ''}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TimeRow({ time, text }: { time: string; text: string }) {
  return (
    <li className="flex h-6 items-center gap-3 text-[13px]">
      <span className="w-10 shrink-0 text-xs tabular-nums text-[#828081]">{time}</span>
      <span className="min-w-0 flex-1 truncate text-[#241E20]">{text}</span>
    </li>
  );
}

function InsertedRow() {
  const p = useProgress();
  const [a, b] = T.insertRow;
  const height = useRange(p, [a, b], [0, 28]);
  const opacity = useFade(p, a + (b - a) * 0.4, b);
  const highlight = useRange(p, [b, b + sec(1.2)], [1, 0.35]);
  return (
    <motion.li style={{ height }} className="overflow-hidden">
      <motion.div className="relative flex h-7 items-center gap-3 rounded-[5px] px-2 text-[13px]" style={{ opacity }}>
        <motion.span aria-hidden className="absolute inset-0 rounded-[5px] bg-[#FE3C01]/[0.08]" style={{ opacity: highlight }} />
        <span className="relative w-8 shrink-0 text-xs font-semibold tabular-nums text-[#C43200]">20:00</span>
        <UtensilsIcon className="relative h-3.5 w-3.5 shrink-0 text-[#C43200]" />
        <span className="relative min-w-0 flex-1 truncate text-[#241E20]">正宁路夜市</span>
        <span className="relative hidden shrink-0 text-xs text-[#828081] cq-sm:inline">阿杰提名</span>
      </motion.div>
    </motion.li>
  );
}

/* ── 右侧面板：提名（收齐，不裁决） ── */
function NominationPanel() {
  const p = useProgress();
  const empty = useFade(p, T.nominationIn[0] - sec(0.2), T.nominationIn[0]);
  const emptyOpacity = useTransform(empty, (v) => 1 - v);
  const [a, b] = T.nominationIn;
  const opacity = useFade(p, a, b);
  const y = useRange(p, [a, b], [10, 0], { easing: ease.out, rest: 0 });
  const pending = useStep(p, [a, T.applyClick]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-[#241E20]">提名</p>
        <span className="text-xs text-[#828081]">{['暂无', '1 条待你确认', '已处理'][pending]}</span>
      </div>
      <div className="relative mt-2">
        <motion.p className="absolute inset-x-0 top-0 text-xs leading-relaxed text-[#828081]" style={{ opacity: emptyOpacity }}>
          同行人提名的地点会出现在这里，由你确认后再加入行程。
        </motion.p>
        <motion.div style={{ opacity, y }}>
          <NominationCard />
        </motion.div>
      </div>
    </div>
  );
}

/* ── 窄视窗：提名与同步以底部抽屉出现 ── */
function MobileSheet({ range, children }: { range: readonly [number, number] | readonly [number, number, number, number]; children: ReactNode }) {
  const p = useProgress();
  const out = range.length === 4;
  const y = useRange(p, out ? [range[0], range[1], range[2], range[3]] : [range[0], range[1]], out ? [105, 0, 0, 105] : [105, 0], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, range[0], out ? range[3] : 2);
  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-30 rounded-t-[16px] border-t border-[#E2E2D8] bg-white px-4 pb-4 pt-2 shadow-[0_-16px_40px_rgba(36,30,32,0.12)] cq-md:hidden"
      style={{ y: yPct, visibility }}
    >
      <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-[#E2E2D8]" />
      {children}
    </motion.div>
  );
}
