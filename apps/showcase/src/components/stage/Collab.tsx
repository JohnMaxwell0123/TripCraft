'use client';

import type { ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { DAYS, LISTING_COVERS, TRIPS, type PlaceCategory } from '@/data/trip';
import { ease, useFade, useFadeStyle, useFadeVisibility, useRange, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Avatar, Scene, TapCursor, Toast, useProgress, type AvatarTone } from './primitives';
import { Badge, CatMark, CatTile, btn } from './ui';
import { RouteGlyph } from './RouteGlyph';
import { NominationCard } from './Recommend';
import { DeviceSync } from './SyncFinale';
import { useConstellation } from './Constellation';
import { CarIcon, CheckIcon, ClockIcon, CopyIcon, HeightIcon, LinkIcon, NavigationIcon, ShareIcon, SparklesIcon } from '@/components/common/Icons';

/**
 * 04 幕 · 行程空间：多人共享与多端同步（docs/15、PRD-01 支柱 3）
 *
 * 03 幕末尾点了侧栏「行程空间」，这一屏就是它的结果：02 幕存下的自驾草案与 03 幕刚发出的咨询并排放着
 * （PRD-01 §2：两条路径都落到行程空间），两张方案卡各带自己的路线封面。等旅行社回复的时候——
 * 领队用链接邀请家人（加入后可查看与提名，改动由领队确认）→ 阿杰、小雨加入 →
 * 阿杰提名一个地点，AI 评估代价 → 领队确认，D0 晚上插入新安排，版本 v1.0 → v1.1 → 逐台设备同步 →
 * 领队点标题栏的「做成可分享的路书」，下一屏就是它的结果（ShareRoadbook.tsx）。
 *
 * 导演版（2026-10-29）：家人加入之后，镜头拉远（Constellation）：这扇视窗只是全家的屏幕之一。宽视窗里提名与确认发生在
 * 领队的手机上，视窗（我的电脑）按波前到达的时刻插入 20:00、翻到 v1.1；手机布局的视窗就是领队的手机，提名与「今天的路线 →
 * 投递到车机导航」都以底部抽屉出现在这里。邀请只留链接（二维码面板删了），两人加入合成一条提示。
 */

const [XIXING] = TRIPS;

export function TripSpaceScene() {
  return (
    <Scene range={T.shareScene} label="行程空间：多人共享与多端同步">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-ui-line px-4">
        <RouteGlyph trip={XIXING} className="h-10 w-10 shrink-0 rounded-[10px]" />
        <div className="min-w-0 flex-1">
          <h3 className="flex items-center gap-2 truncate text-[15px] font-semibold leading-5 text-ui-ink">
            西行计划
            <VersionBadge />
          </h3>
          <p className="truncate text-xs leading-4 text-ui-ink-3">河西走廊 · 9/24–10/2 · 两个方案 · 领队：我</p>
        </div>
        <Members />
        <InviteButton />
        <ShareButton />
      </header>

      <div className="relative flex min-h-0 flex-1">
        <section className="min-w-0 flex-1 overflow-hidden px-3 py-3 cq-sm:px-4">
          <PlanStrip />
          <Itinerary />
        </section>

        <aside className="ui-aside hidden w-[296px] shrink-0 flex-col gap-4 p-4 cq-md:flex">
          <NominationPanel />
          <SyncReveal />
        </aside>

        <InvitePopover />
        {/* 手机布局：视窗就是领队的手机——提名、今天的路线与同步都以底部抽屉出现 */}
        <MobileSheet range={[T.nominationIn[0], T.nominationIn[1], T.nominationSheetOut[0], T.nominationSheetOut[1]]}>
          <NominationCard />
        </MobileSheet>
        <MobileSheet range={T.routeSheet}>
          <TodayRoute />
        </MobileSheet>
        <MobileSheet range={[T.syncSheet[0], T.syncSheet[1]]}>
          <DeviceSync />
        </MobileSheet>

        <div className="pointer-events-none absolute inset-x-4 top-3 z-50 flex flex-col items-center gap-2">
          <Toast range={T.joinToast}>阿杰、小雨 通过邀请链接加入</Toast>
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
  const flashVisibility = useFadeVisibility(flash);
  return (
    <div className="mb-3 grid grid-cols-2 gap-2">
      <div className="ui-card flex min-w-0 items-center gap-2 !border-ui-ink p-2">
        <RouteGlyph trip={XIXING} className="hidden h-9 w-9 shrink-0 rounded-[8px] cq-sm:block" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ui-ink">自驾草案 · 9 天</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ui-ink-2">
            <SparklesIcon className="h-3 w-3 shrink-0 text-ui-accent" />
            AI 规划 · 正在看
          </p>
        </div>
      </div>
      <div className="ui-card relative flex min-w-0 items-center gap-2 p-2">
        <motion.span aria-hidden className="absolute -inset-px rounded-ui-card ring-2 ring-ui-accent/50" style={{ opacity: flash, visibility: flashVisibility }} />
        <RouteGlyph trip={LISTING_COVERS.elder} className="hidden h-9 w-9 shrink-0 rounded-[8px] cq-sm:block" />
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-ui-ink">长辈友好私家团</p>
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ui-signal-ink">
            <ClockIcon className="h-3 w-3 shrink-0" />
            已咨询 · 等待报价
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── 版本号：领队确认后 v1.0 → v1.1 ── */
function VersionBadge() {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const v11 = useStep(p, [updateAt('window')]) === 1;
  return <Badge tone={v11 ? 'success' : 'neutral'}>{v11 ? 'v1.1' : 'v1.0'}</Badge>;
}

/* ── 成员头像：加入时依次入列 ── */
function Members() {
  return (
    <span className="hidden items-center cq-sm:flex">
      <Avatar name="我" tone="violet" size={26} />
      <JoiningAvatar name="阿杰" tone="teal" range={T.joinAJie} />
      <JoiningAvatar name="小雨" tone="rose" range={T.joinXiaoyu} />
    </span>
  );
}

function JoiningAvatar({ name, tone, range }: { name: string; tone: AvatarTone; range: readonly [number, number] }) {
  const p = useProgress();
  const width = useRange(p, [range[0], range[1]], [0, 20]);
  const scale = useRange(p, [range[0], range[1]], [0.4, 1], { easing: ease.back, rest: 1 });
  const fade = useFadeStyle(p, range[0], range[1]);
  return (
    <motion.span className="relative flex h-[26px] justify-end" style={{ width }}>
      <motion.span className="relative" style={{ scale, ...fade }}>
        <Avatar name={name} tone={tone} size={26} />
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

/* ── 做成可分享的路书（S-C10）：手机宽度只留图标，下一屏的标题写明这一步 ── */
function ShareButton() {
  const p = useProgress();
  const press = useRange(p, [T.shareClick - sec(0.12), T.shareClick, T.shareClick + sec(0.12)], [1, 0.95, 1]);
  return (
    <motion.span className={`${btn.secondary} relative w-8 !px-0 cq-sm:w-auto cq-sm:!px-3`} style={{ scale: press }} title="做成可分享的路书">
      <ShareIcon className="h-3.5 w-3.5" />
      <span className="hidden cq-sm:inline">做成可分享的路书</span>
      <TapCursor approach={T.shareCursor} clickAt={T.shareClick} hideAt={T.shareClick + sec(0.4)} className="left-1/2 top-4" />
    </motion.span>
  );
}

/* ── 邀请面板：一个链接 + 复制，写清加入者的权限 ── */
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
      className="ui-float absolute right-4 top-2 z-40 w-[min(300px,calc(100%-2rem))] rounded-ui-panel p-3.5 !shadow-ui-pop"
      style={{ opacity, y, visibility }}
    >
      <p className="text-[15px] font-semibold text-ui-ink">邀请同行人</p>
      <div className="mt-2.5 flex items-center gap-2">
        <span className="flex h-8 min-w-0 flex-1 items-center gap-1.5 rounded-ui-ctl bg-ui-sunken px-2 text-xs tabular-nums text-ui-ink">
          <LinkIcon className="h-3.5 w-3.5 shrink-0 text-ui-ink-3" />
          <span className="truncate">tc.trip/j/7QX</span>
        </span>
        <motion.span className={`${btn.primary} relative`} style={{ scale: press }}>
          {copied ? <CheckIcon className="h-3.5 w-3.5" /> : <CopyIcon className="h-3.5 w-3.5" />}
          {copied ? '已复制' : '复制链接'}
          <TapCursor approach={T.copyCursor} clickAt={T.copyClick} hideAt={T.copyClick + sec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-ui-ink-2">加入者可以查看行程、提名地点；改动由你确认后生效。</p>
    </motion.div>
  );
}

/* ── 行程：D0 展开到小时，确认后插入新安排 ── */
function Itinerary() {
  return (
    <div className="flex flex-col">
      <div className="ui-card p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 shrink-0 items-center rounded-full bg-ui-ink px-2 text-xs font-semibold tabular-nums text-white">D0</span>
          <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-ui-ink">9/24 · 兰州 · 落地取车</span>
        </div>
        <div className="relative mt-2">
          <span aria-hidden className="absolute bottom-3 left-[59px] top-3 w-0 border-l-2 border-dotted border-ui-line-strong" />
          <ul className="relative flex flex-col">
            <TimeRow time="14:30" cat="transport" text="中川机场取车 · 腾势 D9" />
            <TimeRow time="19:15" cat="stay" text="入住黄河边酒店 · 地面车位" />
            <InsertedRow />
          </ul>
        </div>
      </div>
      <ol className="mt-2 flex flex-col">
        {DAYS.slice(1, 7).map((day) => (
          <li key={day.tag} className="flex h-10 items-center gap-2.5 border-b border-ui-line px-1">
            <CatTile cat={day.cat} size={26} />
            <span className="w-6 shrink-0 text-xs font-semibold tabular-nums text-ui-ink-3">{day.tag}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">{day.title}</span>
            {day.drive ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs tabular-nums text-ui-ink-3">
                <CarIcon className="h-3.5 w-3.5" />
                {day.drive}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}

function TimeRow({ time, cat, text }: { time: string; cat: PlaceCategory; text: ReactNode }) {
  return (
    <li className="relative flex h-8 items-center gap-2.5 text-[13px]">
      <span className="w-10 shrink-0 text-xs tabular-nums text-ui-ink-3">{time}</span>
      <CatMark cat={cat} size={20} className="relative ring-2 ring-ui-surface" />
      <span className="min-w-0 flex-1 truncate text-ui-ink">{text}</span>
    </li>
  );
}

function InsertedRow() {
  const p = useProgress();
  const { updateAt } = useConstellation();
  // 波前到达这块屏的一刻插入（宽视窗是「我的电脑」，手机布局就是领队的手机）
  const a = updateAt('window');
  const b = a + sec(0.35);
  const height = useRange(p, [a, b], [0, 32]);
  const fade = useFadeStyle(p, a + (b - a) * 0.4, b);
  const highlight = useRange(p, [b, b + sec(1.2)], [1, 0.4]);
  return (
    <motion.li style={{ height }} className="relative overflow-hidden">
      <motion.div className="relative flex h-8 items-center gap-2.5 rounded-ui-ctl text-[13px]" style={fade}>
        <motion.span aria-hidden className="absolute -inset-x-1.5 inset-y-0.5 rounded-ui-ctl bg-ui-accent/[0.08]" style={{ opacity: highlight }} />
        <span className="relative w-10 shrink-0 text-xs font-semibold tabular-nums text-ui-accent-ink">20:00</span>
        <CatMark cat="food" size={20} className="relative ring-2 ring-ui-surface" />
        <span className="relative min-w-0 flex-1 truncate font-medium text-ui-ink">正宁路夜市 · 赵记醪糟</span>
        <span className="relative hidden shrink-0 items-center gap-1 text-xs text-ui-ink-3 cq-sm:inline-flex">
          <Avatar name="阿杰" tone="teal" size={16} ring={false} />
          提名
        </span>
      </motion.div>
    </motion.li>
  );
}

/* ── 右侧面板：提名（收齐，不裁决）与同步 ── */
function NominationPanel() {
  const p = useProgress();
  const emptyOpacity = useRange(p, [T.nominationIn[0] - sec(0.2), T.nominationIn[0]], [1, 0]);
  const emptyVisibility = useFadeVisibility(emptyOpacity);
  const { updateAt } = useConstellation();
  const applied = updateAt('window');
  const [a, b] = T.nominationIn;
  const y = useRange(p, [a, b], [10, 0], { easing: ease.out, rest: 0 });
  const pending = useStep(p, [a, applied]);
  // 处理完收成一行：整张卡淡出并收起高度，「已加入 D0」一行长出来，下面的同步列表才放得下全家的屏幕
  const f0 = applied + sec(0.25);
  const f1 = applied + sec(0.6);
  const fMid = f0 + (f1 - f0) * 0.5;
  const cardOpacity = useRange(p, [a, b, f0, fMid], [0, 1, 1, 0]);
  const cardVisibility = useFadeVisibility(cardOpacity);
  const cardMax = useRange(p, [f0, f1], [360, 0]);
  const doneFade = useFadeStyle(p, fMid, f1);
  const doneMax = useRange(p, [f0, f1], [0, 48]);

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ui-ink">提名</p>
        <span className={`text-xs ${pending === 1 ? 'font-medium text-ui-accent-ink' : 'text-ui-ink-3'}`}>{['暂无', '1 条待你确认', '已处理'][pending]}</span>
      </div>
      <div className="relative mt-2">
        <motion.p
          className="absolute inset-x-0 top-0 rounded-ui-card border border-dashed border-ui-line-strong px-3 py-4 text-center text-xs leading-relaxed text-ui-ink-3"
          style={{ opacity: emptyOpacity, visibility: emptyVisibility }}
        >
          同行人提名的地点会出现在这里，由你确认后再加入行程。
        </motion.p>
        <motion.div className="overflow-hidden" style={{ maxHeight: cardMax }}>
          <motion.div style={{ opacity: cardOpacity, visibility: cardVisibility, y }}>
            <NominationCard cursor={false} appliedAt={applied} />
          </motion.div>
        </motion.div>
        <motion.div className="overflow-hidden" style={{ maxHeight: doneMax }}>
          <motion.div className="ui-card flex items-center gap-2.5 p-2" style={doneFade}>
            <CatTile cat="food" size={28} />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-ui-ink">正宁路夜市 · 赵记醪糟</span>
            <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-ui-success">
              <CheckIcon className="h-3 w-3" />
              已加入 D0
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

function SyncReveal() {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt('window') + sec(0.5);
  const fade = useFadeStyle(p, at, at + sec(0.3));
  const y = useRange(p, [at, at + sec(0.3)], [8, 0], { rest: 0 });
  return (
    <motion.div style={{ ...fade, y }}>
      <DeviceSync />
    </motion.div>
  );
}

/* ── 手机布局：今天的路线 → 投递到车机导航（领队再点一下；由车机导航带路） ── */
function TodayRoute() {
  const p = useProgress();
  const sent = useStep(p, [T.dispatchClick]) === 1;
  const press = useRange(p, [T.dispatchClick - sec(0.12), T.dispatchClick, T.dispatchClick + sec(0.12)], [1, 0.96, 1]);
  return (
    <div>
      <p className="text-xs font-medium text-ui-ink-3">今天的路线 · 9/24 · D0</p>
      <ol className="mt-1.5 flex flex-col">
        <li className="flex h-8 items-center gap-2 text-[13px] text-ui-ink">
          <CatMark cat="transport" size={20} />
          中川机场 · 取车
        </li>
        <li className="flex h-8 items-center gap-2 text-[13px] font-medium text-ui-ink">
          <CatMark cat="stay" size={20} />
          黄河边酒店 · 地面停车场入口
        </li>
      </ol>
      <p className="mt-1 flex flex-wrap items-center gap-x-1 rounded-ui-ctl bg-ui-accent/10 px-2 py-0.5 text-xs leading-5 text-ui-accent-ink">
        <HeightIcon className="h-3 w-3 shrink-0" />
        {/* 只在两段之间折行，「2.0 m」这样的数字和单位不拆开 */}
        <span className="whitespace-nowrap">车高 2.28 m（画像）</span>
        <span className="whitespace-nowrap">· 不进 2.0 m 地库</span>
      </p>
      <motion.span className={`${sent ? `${btn.secondary} !text-ui-success` : btn.primary} relative mt-3 h-10 w-full`} style={{ scale: press }}>
        {sent ? <CheckIcon className="h-3.5 w-3.5" /> : <NavigationIcon className="h-3.5 w-3.5" />}
        {sent ? '已投递 · 由车机导航带路' : '投递到车机导航'}
        <TapCursor approach={T.dispatchCursor} clickAt={T.dispatchClick} hideAt={T.dispatchClick + sec(0.4)} className="left-1/2 top-5" />
      </motion.span>
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
    <motion.div className="ui-float absolute inset-x-0 bottom-0 z-30 rounded-t-ui-panel !border-x-0 !border-b-0 px-4 pb-4 pt-2 cq-md:hidden" style={{ y: yPct, visibility }}>
      <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-ui-line-strong" />
      {children}
    </motion.div>
  );
}
