'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { TRIPS } from '@/data/trip';
import { ease, useFadeStyle, useRange, useStep, useVisibility } from '@/lib/motion';
import { T, sec } from './timeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { Badge, Chip, Switch, btn } from './ui';
import { RouteGlyph } from './RouteGlyph';
import {
  ArrowLeftIcon,
  BuildingIcon,
  CarIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ElderIcon,
  LinkIcon,
  LockIcon,
  ShareIcon,
  SparklesIcon,
} from '@/components/common/Icons';

/**
 * 04 幕收尾 · 做成可分享的路书（PRD-03 S-C10，docs/09 §9.0）
 *
 * 全家同步到 v1.1 之后，领队点标题栏的「做成可分享的路书」：AI 按路线自动生成一套行程皮肤
 * （河西走廊 → 敦煌金，docs/09 §9.2.2），用这趟行程的路线形状生成封面，做出分享卡片与只读链接，所有人免费。
 * 卡片先是 App 的默认外观，随后换上皮肤——皮肤只作用于卡片里的行程内容，标题栏、右栏与按钮仍是统一的 App 外观。
 * 分享到家庭群 → 亲友在自己的手机上打开分享页（只读）→ 点「我也做一份」→ AI 对话的入口，和 01 幕的开场是同一个画面。
 *
 * 页脚的「用 TripCraft 制作」角标与「AI 生成」标识是平台层，用产品界面令牌（合规提示的颜色不随皮肤变化）；
 * 封面标「示意」，不用照片、不用 AI 生成的景点图。不演示会员功能：只有一个不抢戏的「更多样式 · 会员」入口，不写价格。
 */

const [XIXING] = TRIPS;

/** 分享卡片的封面：氧化金箔 → 赭石红（只在 .trip-surface 里能解析） */
const SKIN_COVER = ['rgb(var(--trip-primary))', 'rgb(var(--trip-accent))'] as const;

/** 卡片上的三个亮点：只写地点与安排，不写同行人的姓名（分享页先脱敏）；D0 的夜市是全家刚确认的提名 */
const HIGHLIGHTS = [
  { day: 'D0', title: '兰州 · 正宁路夜市', note: '20:00' },
  { day: 'D4', title: '莫高窟', note: '只看平层窟' },
  { day: 'D5', title: '鸣沙山 · 月牙泉', note: '19:30 日落' },
];

export function ShareRoadbookScene() {
  return (
    <Scene range={T.sharePageScene} label="做成可分享的路书">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-sunken text-ui-ink-2">
          <ArrowLeftIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold leading-5 text-ui-ink">做成可分享的路书</h3>
          <p className="truncate text-xs leading-4 text-ui-ink-3">西行计划 v1.1 · 皮肤与封面由 AI 按路线生成</p>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1 flex-col cq-sm:flex-row">
        <section className="flex min-h-0 min-w-0 flex-1 flex-col items-center justify-center p-3 cq-sm:p-4">
          <div className="w-full max-w-[340px]">
            <p className="mb-2 hidden text-xs font-medium text-ui-ink-3 cq-sm:block">分享卡片 · 预览</p>
            <SkinWash />
          </div>
        </section>

        <aside className="ui-aside flex shrink-0 flex-col gap-3 border-t border-ui-line p-3 cq-sm:w-[236px] cq-sm:border-t-0 cq-sm:p-4 cq-md:w-[272px]">
          <ShareOptions />
        </aside>

        <VisitorPhone />
      </div>
    </Scene>
  );
}

/* ── 卡片换上皮肤：默认外观在下，敦煌金在上淡入（两张卡尺寸相同，看起来是同一张卡换了一身） ── */
function SkinWash() {
  const p = useProgress();
  const [a, b] = T.skinWash;
  const skin = useFadeStyle(p, a, b);
  // 默认外观只在这一屏出现到皮肤完全盖住为止；其余时刻隐藏（这一屏还没出现时也不留 visible，重播时 iPad 不留残影）
  const plain = useRange(p, [b, b + sec(0.02)], [1, 0]);
  const plainVisibility = useVisibility(p, T.sharePageScene[0] - sec(0.05), b + sec(0.02));
  return (
    <div className="relative">
      <motion.div style={{ opacity: plain, visibility: plainVisibility }}>
        <ShareCard />
      </motion.div>
      <motion.div className="absolute inset-0" style={skin}>
        <ShareCard skinned />
      </motion.div>
    </div>
  );
}

/**
 * 分享卡片：.trip-surface 是行程皮肤的作用域，没有 data-trip-theme 时回落到 App 外观。
 * 敦煌金的标题用衬线体、数字不用等宽（docs/09 §9.2.2）；氧化金对比度不够，只画线条，小字用暖褐黑、青金石蓝与赭石红。
 */
function ShareCard({ skinned = false }: { skinned?: boolean }) {
  return (
    <div
      className="trip-surface overflow-hidden rounded-ui-card border border-ui-line bg-trip-canvas shadow-ui-float"
      data-trip-theme={skinned ? 'dunhuang-gold' : undefined}
    >
      <RouteGlyph trip={XIXING} tag colors={skinned ? SKIN_COVER : undefined} className="h-[104px] w-full cq-sm:h-[128px] cq-md:h-[148px]" />
      <div className="px-3.5 pb-3 pt-2.5">
        <p className="truncate text-xs font-medium text-trip-accent">河西走廊 · 9 天 · 9/24–10/2</p>
        <p className={`mt-0.5 truncate text-xl font-semibold leading-7 text-trip-ink ${skinned ? 'font-serif' : ''}`}>西行计划</p>
        <p className="truncate text-xs text-trip-ink/[0.78]">5 人同行 · 自驾 1,980 km</p>
        <span aria-hidden className="mt-2.5 block h-px bg-trip-primary/60" />
        <ul className="mt-2 flex flex-col gap-1">
          {HIGHLIGHTS.map((h, i) => (
            <li key={h.day} className={`h-6 items-center gap-2 text-[13px] text-trip-ink ${i === 2 ? 'hidden cq-sm:flex' : 'flex'}`}>
              <span className="flex h-5 w-7 shrink-0 items-center justify-center rounded-full bg-trip-secondary/10 text-xs font-semibold text-trip-secondary">{h.day}</span>
              <span className="min-w-0 flex-1 truncate">{h.title}</span>
              <span className="shrink-0 text-xs text-trip-ink/[0.78]">{h.note}</span>
            </li>
          ))}
        </ul>
      </div>
      <MadeWith />
    </div>
  );
}

/** 平台层页脚：「用 TripCraft 制作」角标 + 不可去除的「AI 生成」标识（产品界面令牌，不随皮肤变化） */
function MadeWith({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-1.5 border-t border-ui-line bg-ui-surface px-3 py-2">
      <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] bg-ui-primary text-xs font-bold leading-none text-ui-on-primary">旅</span>
      <span className="min-w-0 flex-1 truncate text-xs text-ui-ink-2">用 TripCraft 制作</span>
      <Badge tone="signal">
        {compact ? null : <SparklesIcon className="h-3 w-3" />}
        AI 生成
      </Badge>
    </div>
  );
}

/* ═════════════════════ 右栏：皮肤（自动生成 · 免费）与分享方式 ═════════════════════ */

function ShareOptions() {
  const p = useProgress();
  const ready = useStep(p, [(T.skinWash[0] + T.skinWash[1]) / 2]) === 1;
  const posted = useStep(p, [T.postClick]) === 1;
  const press = useRange(p, [T.postClick - sec(0.12), T.postClick, T.postClick + sec(0.12)], [1, 0.96, 1]);

  return (
    <>
      <div>
        <p className="hidden text-xs font-medium text-ui-ink-3 cq-sm:block">皮肤 · AI 按路线生成</p>
        <div className="flex h-9 items-center gap-2.5 cq-sm:mt-1.5">
          {ready ? (
            <>
              <Swatch />
              <span className="text-[13px] font-semibold text-ui-ink">敦煌金</span>
              <Badge tone="success">免费</Badge>
            </>
          ) : (
            <>
              <span className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-ui-line-strong border-t-ui-ink" />
              <span className="truncate text-[13px] text-ui-ink-2">按途经地区与季节配色…</span>
            </>
          )}
        </div>
        <p className="mt-0.5 hidden text-xs leading-relaxed text-ui-ink-3 cq-sm:block">途经甘肃 · 丝路沿线，出行在秋季</p>
      </div>

      <div className="hidden flex-col border-t border-ui-line pt-3 cq-sm:flex">
        <p className="text-xs font-medium text-ui-ink-3">分享方式</p>
        <OptionRow icon={<LinkIcon className="h-3.5 w-3.5" />} label="只读链接">
          <span className="truncate text-xs text-ui-ink-3">tc.trip/s/7QX</span>
        </OptionRow>
        <OptionRow icon={<LockIcon className="h-3.5 w-3.5" />} label="访问口令">
          <Switch on={false} />
        </OptionRow>
        <span className="mt-1 inline-flex h-8 items-center gap-1 text-xs text-ui-ink-3">
          更多样式 · 会员
          <ChevronRightIcon className="h-3 w-3" />
        </span>
      </div>

      <div className="mt-auto">
        <motion.span className={`${posted ? `${btn.secondary} !text-ui-success` : btn.primary} relative h-10 w-full`} style={{ scale: press }}>
          {posted ? <CheckIcon className="h-3.5 w-3.5" /> : <ShareIcon className="h-3.5 w-3.5" />}
          {posted ? '已分享到家庭群' : '分享到家庭群'}
          <TapCursor approach={T.postCursor} clickAt={T.postClick} hideAt={T.postClick + sec(0.4)} className="left-1/2 top-5" />
        </motion.span>
        <p className="mt-2 text-center text-xs text-ui-ink-3">分享页已隐去证件、房号与手机号</p>
      </div>
    </>
  );
}

/** 皮肤色样：底色 · 主色 · 辅色 · 强调 · 文字（皮肤令牌的作用域只在这一小块） */
function Swatch() {
  return (
    <span aria-hidden className="trip-surface flex shrink-0 items-center" data-trip-theme="dunhuang-gold">
      {['bg-trip-canvas', 'bg-trip-primary', 'bg-trip-secondary', 'bg-trip-accent', 'bg-trip-ink'].map((c) => (
        <span key={c} className={`-ml-1 h-4 w-4 rounded-full ring-2 ring-ui-surface first:ml-0 ${c}`} />
      ))}
    </span>
  );
}

function OptionRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex h-9 items-center gap-2 border-b border-ui-line last:border-b-0">
      <span className="shrink-0 text-ui-ink-3">{icon}</span>
      <span className="shrink-0 text-[13px] text-ui-ink">{label}</span>
      <span className="ml-auto flex min-w-0 justify-end">{children}</span>
    </div>
  );
}

/* ═════════════════════ 亲友的手机：只读的分享页 → 「我也做一份」→ AI 对话入口 ═════════════════════ */

/**
 * 宽视窗（cq-md）：手机从右栏升起，右栏的选项淡出，左边的分享卡片一直看得见；
 * 窄视窗：手机居中，背后压暗。透明度为 0 时整块隐藏（useFadeStyle）。
 */
function VisitorPhone() {
  const p = useProgress();
  const [a, b] = T.visitorIn;
  const fade = useFadeStyle(p, a, b);
  const y = useRange(p, [a, b], [36, 0], { easing: ease.out, rest: 0 });
  const chat = useStep(p, [T.makeMineClick]) === 1;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center cq-md:left-auto cq-md:w-[272px] cq-md:border-l cq-md:border-ui-line"
      style={{ visibility: fade.visibility }}
    >
      <motion.span aria-hidden className="absolute inset-0 bg-ui-ink/25 cq-md:bg-ui-surface" style={{ opacity: fade.opacity }} />
      <motion.div className="relative" style={{ opacity: fade.opacity, y }}>
        <span className="absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-ui-surface px-2.5 text-xs font-medium leading-6 text-ui-ink shadow-ui-card ring-1 ring-ui-line">
          亲友在群里点开
        </span>
        <div className="rounded-[26px] bg-ui-ink p-[5px] shadow-ui-pop">
          <div className="flex h-[460px] w-[226px] flex-col overflow-hidden rounded-[21px] bg-ui-panel">
            <div className="flex h-8 shrink-0 items-center justify-center gap-1 bg-ui-sunken px-3 pt-0.5 text-xs text-ui-ink-3">
              <LockIcon className="h-3 w-3 shrink-0" />
              <span className="truncate">{chat ? 'tc.trip/new' : 'tc.trip/s/7QX'}</span>
            </div>
            <div className="relative min-h-0 flex-1">
              <SharePage />
              <ChatEntry />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** 分享页：和卡片同一套皮肤；底部是平台层的角标、AI 标识、规划参考声明与「我也做一份」 */
function SharePage() {
  const p = useProgress();
  const out = useRange(p, [T.chatIn[0], T.chatIn[1]], [1, 0]);
  // 只在手机出现之后、对话入口完全盖住之前可见
  const outVisibility = useVisibility(p, T.visitorIn[0], T.chatIn[1]);
  const press = useRange(p, [T.makeMineClick - sec(0.12), T.makeMineClick, T.makeMineClick + sec(0.12)], [1, 0.95, 1]);

  return (
    <motion.div className="absolute inset-0 flex flex-col" style={{ opacity: out, visibility: outVisibility }}>
      <div className="trip-surface flex min-h-0 flex-1 flex-col bg-trip-canvas" data-trip-theme="dunhuang-gold">
        <RouteGlyph trip={XIXING} tag colors={SKIN_COVER} className="h-[112px] w-full shrink-0" />
        <div className="min-h-0 flex-1 px-3 pt-2">
          <p className="truncate text-xs font-medium text-trip-accent">河西走廊 · 9 天</p>
          <p className="truncate font-serif text-lg font-semibold leading-6 text-trip-ink">西行计划</p>
          <p className="truncate text-xs text-trip-ink/[0.78]">9/24–10/2 · 5 人同行 · 自驾</p>
          <span aria-hidden className="mt-2 block h-px bg-trip-primary/60" />
          <ul className="mt-1.5 flex flex-col">
            {HIGHLIGHTS.map((h) => (
              <li key={h.day} className="flex h-6 items-center gap-1.5 text-xs text-trip-ink">
                <span className="flex h-5 w-7 shrink-0 items-center justify-center rounded-full bg-trip-secondary/10 font-semibold text-trip-secondary">{h.day}</span>
                <span className="min-w-0 flex-1 truncate">{h.title}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <MadeWith compact />
      <div className="shrink-0 bg-ui-surface px-3 pb-3">
        <p className="text-xs text-ui-ink-3">本路书为行程规划参考</p>
        <motion.span className={`${btn.primary} relative mt-2 h-9 w-full`} style={{ scale: press }}>
          <SparklesIcon className="h-3.5 w-3.5" />
          我也做一份
          <TapCursor approach={T.makeMineCursor} clickAt={T.makeMineClick} hideAt={T.makeMineClick + sec(0.4)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}

/** AI 对话的入口：和 01 幕开场同一个画面，记下「来自分享的路书」，不带分享者的个人信息 */
function ChatEntry() {
  const p = useProgress();
  const fade = useFadeStyle(p, T.chatIn[0], T.chatIn[1]);
  const y = useRange(p, [T.chatIn[0], T.chatIn[1]], [8, 0], { easing: ease.out, rest: 0 });

  return (
    <motion.div className="absolute inset-0 flex flex-col bg-ui-panel" style={fade}>
      <div className="flex h-10 shrink-0 items-center justify-center border-b border-ui-line text-[13px] font-semibold text-ui-ink">新对话</div>
      <motion.div className="flex min-h-0 flex-1 flex-col px-3 pb-3 pt-2.5" style={{ y }}>
        <Chip Icon={LinkIcon} className="self-start">
          来自分享的路书
        </Chip>
        <p className="mt-1 text-xs text-ui-ink-3">不带分享者的个人信息</p>

        <div className="mt-3 flex items-start gap-2">
          <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] bg-ui-primary text-xs font-bold leading-none text-ui-on-primary">旅</span>
          <p className="min-w-0 flex-1 text-[13px] leading-relaxed text-ui-ink">也想做一份？说说你想怎么玩，可以很随意。</p>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5 pl-7">
          <Chip Icon={ElderIcon} tone="outline">
            带长辈
          </Chip>
          <Chip Icon={CarIcon} tone="outline">
            自驾
          </Chip>
          <Chip Icon={BuildingIcon} tone="outline">
            想找旅行社
          </Chip>
        </div>

        <div className="ui-card mt-auto px-2.5 pb-2 pt-2 !shadow-ui-float">
          <p className="truncate text-[13px] leading-5 text-ui-ink-3">说说这趟旅行：谁去、去哪…</p>
          <div className="mt-1.5 flex items-center">
            <span className="inline-flex h-7 items-center gap-1 rounded-full bg-ui-sunken px-2 text-xs font-medium text-ui-ink">
              <SparklesIcon className="h-3 w-3 text-ui-accent" />
              平台模型
              <ChevronDownIcon className="h-3 w-3 text-ui-ink-3" />
            </span>
            <span aria-hidden className="ml-auto flex h-7 w-7 items-center justify-center rounded-full bg-ui-accent text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 19V5" />
                <path d="m5 12 7-7 7 7" />
              </svg>
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
