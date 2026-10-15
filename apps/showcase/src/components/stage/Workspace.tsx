'use client';

import type { ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { DAYS, elevationPath, type DayPlan, type Tone } from '@/data/trip';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, Pop, Reveal, useLayout, useProgress } from './primitives';
import { RouteMap } from './RouteMap';
import {
  ElderIcon,
  BabyIcon,
  CarIcon,
  SunsetIcon,
  UtensilsIcon,
  SparklesIcon,
  CompassIcon,
  CheckIcon,
  LayersIcon,
  PlusIcon,
  MinusIcon,
  SunIcon,
  FlameIcon,
} from '@/components/common/Icons';

export function Workspace() {
  const p = useProgress();
  const inTimeline = useFade(p, T.timelineIn[0], T.timelineIn[1]);
  // 在车机大屏激活期间，母体工作台优雅后移微虚化 (scale: 0.95, opacity: 0.32)，凸显前台车机中控
  const cockpitDim = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [1, 0.32, 0.32, 1],
  );
  const scale = useRange(
    p,
    [T.cockpitIn[0], T.cockpitIn[1], T.cockpitOut[0], T.cockpitOut[1]],
    [1, 0.95, 0.95, 1],
    { rest: 1 },
  );
  const opacity = useTransform(
    [inTimeline, cockpitDim],
    ([tl, dim]) => (tl as number) * (dim as number),
  );
  const visibility = useVisibility(p, T.timelineIn[0] - 0.01, 1.0);

  return (
    <motion.div
      className="absolute inset-0 flex flex-col gap-2 p-2 sm:gap-3 sm:p-3 md:flex-row md:p-4 gpu-layer [contain:layout_paint] [container-type:size]"
      style={{ opacity, scale, visibility }}
    >
      <Sidebar />
      <TimelineColumn />
      <MapPanel />
      <FlyingCard />
    </motion.div>
  );
}

const SIDEBAR_CONSTRAINTS = [
  { Icon: ElderIcon, label: '少台阶 · 慢节奏', color: 'text-gold-ink' },
  { Icon: BabyIcon, label: '幼儿午休 13:00', color: 'text-ochre' },
  { Icon: CarIcon, label: '车高 2.15m 限高', color: 'text-lapis' },
  { Icon: SunsetIcon, label: '鸣沙山 19:30 日落', color: 'text-rose-600' },
];

/* ═════════════════════ 左侧：行程大纲导航 + 协作成员 (桌面端) ═════════════════════ */
function Sidebar() {
  const p = useProgress();
  const opacity = useFade(p, T.sidebarIn[0], T.sidebarIn[1]);
  const x = useRange(p, [T.sidebarIn[0], T.sidebarIn[1]], [-30, 0], { rest: 0 });
  const isCh5 = useStep(p, [0.842]) >= 1;

  return (
    <motion.aside
      className="glass-strong hidden w-[220px] shrink-0 flex-col gap-3 rounded-card border border-ink/[0.08] p-3.5 shadow-level-static xl:flex gpu-layer"
      style={{ opacity, x }}
    >
      {/* 行程概要信息卡 */}
      <div>
        <p className="eyebrow text-gold-ink font-semibold">行程概览</p>
        <div className="mt-1.5 rounded-control border border-ink/[0.08] bg-paper/85 p-2.5 text-xs shadow-level-static">
          <p className="font-semibold text-ink">河西走廊 9D 深度自驾</p>
          <p className="text-[11px] text-ink-soft mt-0.5">全家 5 口 · 腾势 D9 (7座豪华MPV)</p>
          <span className="mt-1.5 inline-flex items-center gap-1 rounded-pill bg-jade/10 px-1.5 py-0.2 text-[10px] font-semibold text-jade">
            <CheckIcon className="h-3 w-3" />
            <span>长辈无障碍慢游已锁定</span>
          </span>
        </div>
      </div>

      {/* 4 组风控规则 */}
      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow text-gold-ink font-semibold">排程风控 · 4</p>
          <span className="text-[10px] text-ink-soft font-mono">AST Hard</span>
        </div>
        <div className="mt-1.5 flex flex-col gap-1">
          {SIDEBAR_CONSTRAINTS.map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 rounded-control bg-paper/80 px-2 py-1 text-[11px] text-ink border border-ink/[0.06]"
            >
              <c.Icon className={`h-3 w-3 ${c.color} shrink-0`} />
              <span className="truncate font-medium">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 实时在网协作成员 */}
      <div>
        <div className="flex items-center justify-between">
          <p className="eyebrow text-gold-ink font-semibold">{isCh5 ? '全团协同 · 多端同频' : '团队协同'}</p>
          <span className="chip rounded-pill bg-jade/10 text-jade text-[9px] px-1.5 py-0 font-medium">3 端实时同频</span>
        </div>
        <ul className="mt-1.5 flex flex-col gap-1.5 text-xs">
          <li className="flex items-center gap-1.5">
            <Avatar name="我" tone="gold" size={22} />
            <span className="font-medium text-ink text-xs">我</span>
            <span
              className={`chip rounded-pill text-[9px] px-1 py-0 font-mono transition-colors duration-300 ${
                isCh5 ? 'bg-gold/15 text-gold-ink font-semibold' : 'bg-ink/[0.05] text-ink-soft'
              }`}
            >
              💻 桌面掌控
            </span>
            <span className="ml-auto text-[10px] text-gold-ink font-medium">领队确认</span>
          </li>
          <MemberRow name="阿杰" tone="jade" at={T.joinAJie[0]} device="📱 微信协同" active={isCh5} />
          <MemberRow name="小雨" tone="lapis" at={T.joinXiaoyu[0]} device="📱 手机 · 🚗 车机" active={isCh5} />
        </ul>
      </div>

      {/* 无人区离线容灾安全舱 */}
      <div className="mt-auto rounded-control bg-ink/[0.04] p-2 text-xs leading-relaxed text-ink-soft border border-ink/[0.08]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-jade flex items-center gap-1 text-[11px]">
            <span className="h-1.5 w-1.5 animate-breathe rounded-full bg-jade" />
            无人区离线容灾舱
          </span>
          <span className="chip rounded-pill bg-jade/10 text-jade font-mono text-[9px] px-1 py-0 font-bold">已就绪</span>
        </div>
        <p className="mt-1 text-[10px] text-ink-soft leading-tight">
          多端云同频实时互联<br />
          <span className="text-gold-ink font-medium">无信号区域自动无感保活</span>
        </p>
      </div>
    </motion.aside>
  );
}

function MemberRow({ name, tone, at, device, active }: { name: string; tone: 'jade' | 'lapis'; at: number; device?: string; active?: boolean }) {
  return (
    <Reveal at={[at, at + 0.008]} y={4}>
      <li className="flex items-center gap-1.5">
        <Avatar name={name} tone={tone} size={22} />
        <span className="font-medium text-ink text-xs">{name}</span>
        {device ? (
          <span
            className={`chip rounded-pill px-1 py-0 text-[9px] font-mono transition-colors duration-300 ${
              active
                ? tone === 'jade'
                  ? 'bg-jade/15 text-jade font-semibold'
                  : 'bg-lapis/15 text-lapis font-semibold'
                : 'bg-ink/[0.05] text-ink-soft'
            }`}
          >
            {device}
          </span>
        ) : null}
        <span className="ml-auto flex items-center gap-0.5 text-[10px] text-jade">
          <span className="h-1 w-1 animate-breathe rounded-full bg-jade" /> 在线
        </span>
      </li>
    </Reveal>
  );
}

/* ═════════════════════ 中间：时序日程编排区 (桌面与移动端自适应) ═════════════════════ */
function TimelineColumn() {
  const p = useProgress();
  const { desktop } = useLayout();
  const opacity = useFade(p, T.timelineIn[0], T.timelineIn[1]);

  return (
    <motion.section
      aria-label="九天日程时序编排"
      className="glass-strong order-2 flex min-h-0 flex-1 flex-col rounded-card border border-ink/[0.08] p-2.5 sm:p-3 shadow-level-static md:order-none md:w-[310px] md:flex-none lg:w-[330px] gpu-layer"
      style={{ opacity }}
    >
      {/* 顶部标题与里程概览 */}
      <div className="flex items-baseline justify-between px-1 pb-1.5 border-b border-ink/[0.06]">
        <div>
          <h3 className="font-serif text-sm sm:text-base font-semibold text-ink">西行计划 · 9 天</h3>
          <p className="text-[10px] text-ink-soft">1,980 km · 日均 3.1h · 适老舒适 98分</p>
        </div>
        <span className="chip rounded-pill bg-gold/15 text-gold-ink font-mono text-[10px] px-1.5 py-0 font-semibold">
          腾势 D9
        </span>
      </div>

      {desktop ? (
        /* 桌面端：完整的 9 天日程时间线瀑布流 */
        <div className="mask-fade-b flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden pt-2">
          <ol className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
            {DAYS.map((d, i) => (
              <DayCard key={d.tag} day={d} index={i} />
            ))}
          </ol>
          <WishPool />
        </div>
      ) : (
        /* 移动端专属高保真日程卡：基于剧情进度智能高亮当日重点，杜绝 9 行挤压与文字截断 */
        <MobileActiveDayView />
      )}
    </motion.section>
  );
}

/* ── 移动端专属自适应当日焦点卡片 ───────────────────────────── */
function MobileActiveDayView() {
  const p = useProgress();
  // 随剧情进度自动聚焦关键天：
  // 0: D0 (0~0.30, 兰州初排)
  // 1: D1 (0.30~0.36, 乌鞘岭下坡风控)
  // 2: D2 (0.36~0.42, 张掖丹霞)
  // 3: D4 (0.42~0.50, 莫高窟预约)
  // 4: D0 (0.50+, 回归兰州主线：愿望池提名 ➔ 算法重排采纳 ➔ D0 晚间节点弹性撑开 ➔ 多端同频)
  const step = useStep(p, [0.30, 0.36, 0.42, 0.50]);
  const currentDay = [DAYS[0], DAYS[1], DAYS[2], DAYS[4], DAYS[0]][step] || DAYS[0];
  const isD0 = currentDay.tag === 'D0';

  return (
    <div className="flex flex-col flex-1 justify-between pt-1.5 overflow-hidden">
      {/* 移动端天数导轨药丸栏 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs no-scrollbar">
        {DAYS.slice(0, 6).map((d) => {
          const isSelected = d.tag === currentDay.tag;
          return (
            <span
              key={d.tag}
              className={`chip rounded-pill px-2 py-0.5 text-[10px] font-mono transition-all duration-200 shrink-0 ${
                isSelected ? 'bg-blue-900 text-white font-bold shadow-level-static' : 'bg-ink/[0.05] text-ink-soft'
              }`}
            >
              {d.tag}
            </span>
          );
        })}
      </div>

      {/* 当日高保真重点日程卡 */}
      <div className="rounded-control bg-paper/95 p-2.5 border border-ink/[0.08] shadow-level-static flex-1 flex flex-col justify-between my-1">
        <div>
          <div className="flex items-center justify-between">
            <span className="font-serif text-xs font-bold text-gold-ink">{currentDay.tag} · {currentDay.title}</span>
            <span className="text-[10px] font-mono text-ink-soft">{currentDay.date}</span>
          </div>
          <p className="text-[11px] text-ink-soft mt-0.5">{currentDay.meta}</p>
        </div>

        {/* 当日路况与适老标签 */}
        <div className="my-1.5 flex items-center gap-1.5 flex-wrap">
          <span className="chip rounded-pill bg-jade/10 text-jade text-[9px] px-1.5 py-0 font-medium">
            ✓ 7座 MPV 通达
          </span>
          <span className="chip rounded-pill bg-gold/10 text-gold-ink text-[9px] px-1.5 py-0 font-medium">
            <SunIcon className="h-2.5 w-2.5 inline mr-0.5" /> 22℃ 适宜
          </span>
          {currentDay.badge ? (
            <span className="chip rounded-pill bg-ochre/10 text-ochre text-[9px] px-1.5 py-0 font-medium">
              {currentDay.badge.text}
            </span>
          ) : null}
        </div>

        {/* 采纳推荐后的 D0 插入节点演示（在 D0 聚焦时弹性撑开并盖章） */}
        {isD0 ? <InsertedNode /> : null}
      </div>

      {/* 底部愿望池状态 */}
      <WishPool />
    </div>
  );
}

const badgeTone: Record<Tone, string> = {
  jade: 'bg-jade/10 text-jade ring-jade/25',
  amber: 'bg-gold/10 text-gold-ink ring-gold/30',
  lapis: 'bg-lapis/10 text-lapis ring-lapis/25',
  ochre: 'bg-ochre/10 text-ochre ring-ochre/25',
};
const BADGE_AT: Record<string, number> = { D1: T.badges[0], D2: T.badges[1], D4: T.badges[2] };

function DayCard({ day, index }: { day: DayPlan; index: number }) {
  const p = useProgress();
  const at = T.dayCardsStart + index * T.dayCardStep;
  const opacity = useRange(p, [at, at + T.dayCardDur * 0.6], [0, 1]);
  const y = useRange(p, [at, at + T.dayCardDur], [28, 0], { easing: ease.back, rest: 0 });
  const bar = useRange(p, [at + T.dayCardDur * 0.4, at + T.dayCardDur * 1.4], [0, 1]);

  // 纯 MotionValue 高亮
  const dur = T.routeDraw[1] - T.routeDraw[0];
  const dayStart = T.routeDraw[0] + (index / DAYS.length) * dur;
  const dayEnd = T.routeDraw[0] + ((index + 1) / DAYS.length) * dur;
  const activeHighlight = useFade(p, dayStart - 0.001, dayStart + 0.001, dayEnd - 0.001, dayEnd + 0.001);

  return (
    <motion.li style={{ opacity, y }} className="shrink-0 will-change-transform">
      <div className="relative overflow-hidden rounded-control border border-ink/[0.08] bg-paper/80 px-2.5 py-1.5 shadow-level-static">
        {/* 活跃状态高亮图层 */}
        <motion.div aria-hidden className="pointer-events-none absolute inset-0 rounded-control bg-paper shadow-glow" style={{ opacity: activeHighlight }} />
        <motion.span className="absolute inset-y-0 left-0 w-1 origin-top bg-gradient-to-b from-gold to-ochre z-10" style={{ scaleY: bar }} />
        <div className="relative z-10 flex items-center gap-1.5">
          <span className="w-6 font-serif text-xs font-bold text-gold-ink">{day.tag}</span>
          <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink">{day.title}</span>
          <span className="text-[11px] tabular-nums font-mono text-ink-soft">{day.date}</span>
        </div>
        <div className="relative z-10 flex items-center gap-1.5 pl-7">
          <span className="min-w-0 truncate text-[11px] text-ink-soft tabular-nums">{day.meta}</span>
          {day.badge && BADGE_AT[day.tag] !== undefined ? (
            <Pop at={BADGE_AT[day.tag]} className="ml-auto shrink-0">
              <span className={`chip rounded-pill px-1.5 py-0 text-[10px] border border-transparent ${badgeTone[day.badge.tone]}`}>
                {day.badge.text}
              </span>
            </Pop>
          ) : null}
        </div>
        {index === 0 ? <InsertedNode /> : null}
      </div>
    </motion.li>
  );
}

/** D0 晚间插入的新节点（采纳推荐后弹性撑开） */
function InsertedNode() {
  const p = useProgress();
  const height = useRange(p, [T.insertRow[0], T.insertRow[1]], [0, 42]);
  const opacity = useFade(p, T.insertRow[0] + 0.006, T.insertRow[1]);
  const x = useRange(p, [T.insertRow[0] + 0.006, T.insertRow[1]], [-16, 0], { rest: 0 });
  const syncTagOpacity = useFade(p, 0.84, 0.854);
  return (
    <motion.div style={{ height }} className="overflow-hidden">
      <motion.div style={{ opacity, x }} className="mt-1 flex items-center gap-1.5 rounded-control border border-dashed border-gold/70 bg-gold/10 py-1 pl-2 pr-1.5">
        <span className="text-[11px] font-bold tabular-nums font-mono text-gold-ink">20:00</span>
        <span className="min-w-0 flex-1 truncate text-xs font-semibold text-ink inline-flex items-center gap-1">
          <UtensilsIcon className="h-3.5 w-3.5 text-gold-ink shrink-0" />
          <span>正宁路夜市 · 牛奶鸡蛋醪糟</span>
        </span>
        <motion.span style={{ opacity: syncTagOpacity }} className="hidden sm:inline-flex chip rounded-pill bg-jade/15 text-jade border border-jade/30 text-[9px] px-1 py-0 font-mono font-medium">
          ⚡ 3端同频
        </motion.span>
        <Pop at={T.stamp}>
          <span className="flex h-5 w-5 rotate-[-12deg] items-center justify-center rounded-full border border-gold text-[10px] font-bold text-gold-ink">
            打卡
          </span>
        </Pop>
      </motion.div>
    </motion.div>
  );
}

/* ── 待决愿望池 ─────────────────────────────── */
function WishPool() {
  const p = useProgress();
  const opacity = useFade(p, T.poolIn[0], T.poolIn[1]);
  return (
    <motion.div className="mt-1.5 rounded-control border border-dashed border-ink/20 bg-sand/60 p-1.5 sm:p-2" style={{ opacity }}>
      <div className="flex items-center justify-between px-1 pb-1">
        <span className="text-[11px] sm:text-xs font-semibold text-ink inline-flex items-center gap-1">
          <FlameIcon className="h-3 w-3 text-gold" />
          <span>待决愿望池</span>
        </span>
        <WishPoolBadge />
      </div>
      <div className="flex flex-col gap-1">
        <Reveal at={[T.poolIn[0] + 0.004, T.poolIn[1]]} y={6}>
          <WishItem who="小雨" tone="lapis" icon={<CompassIcon className="h-3.5 w-3.5 text-lapis" />} title="鸣沙山骆驼队 · 日落机位" />
        </Reveal>
        <PoolLanding />
      </div>
    </motion.div>
  );
}

function WishPoolBadge() {
  const p = useProgress();
  const count = useStep(p, [T.poolIn[0], T.poolLand[0], T.poolResolveOut[1]]);
  const n = [0, 1, 2, 1][count];
  return <span className="rounded-pill bg-ink/[0.05] px-1.5 text-[10px] tabular-nums font-mono text-ink-soft">{n}</span>;
}

function PoolLanding() {
  const p = useProgress();
  const opacity = useRange(p, [T.poolLand[0], T.poolLand[1], T.poolResolveOut[0], T.poolResolveOut[1]], [0, 1, 1, 0]);
  const scale = useRange(p, [T.poolLand[0], T.poolLand[1]], [0.8, 1], { easing: ease.back, rest: 1 });
  const height = useRange(p, [T.poolResolveOut[0], T.poolResolveOut[1]], [32, 0]);
  return (
    <motion.div style={{ opacity, scale, height }}>
      <ResolvedWishItem />
    </motion.div>
  );
}

function ResolvedWishItem() {
  const p = useProgress();
  const resolved = useStep(p, [T.poolResolve]) === 1;
  return (
    <WishItem
      who="阿杰"
      tone="jade"
      icon={<UtensilsIcon className="h-3.5 w-3.5 text-gold-ink" />}
      title="赵记牛奶鸡蛋醪糟"
      status={
        resolved ? (
          <span className="inline-flex items-center gap-0.5 text-[10px]">
            <CheckIcon className="h-2.5 w-2.5" />
            <span>已排入 D0 20:00</span>
          </span>
        ) : (
          <span className="text-[10px]">待编排</span>
        )
      }
      resolved={resolved}
    />
  );
}

function WishItem({ who, tone, icon, title, status, resolved }: { who: string; tone: 'jade' | 'lapis'; icon: ReactNode; title: string; status?: ReactNode; resolved?: boolean }) {
  return (
    <div className="flex h-8 items-center gap-1.5 rounded-control bg-paper/90 px-2 border border-ink/[0.08] shadow-level-static">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center">{icon}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] font-medium text-ink">{title}</span>
      {status ? <span className={`shrink-0 font-semibold ${resolved ? 'text-jade' : 'text-gold-ink'}`}>{status}</span> : null}
      <Avatar name={who} tone={tone} size={18} />
    </div>
  );
}

/* ═════════════════════ 右侧：高保真 GIS 路线沙盘工作台 ═════════════════════ */
function MapPanel() {
  const p = useProgress();
  const opacity = useFade(p, T.mapIn[0], T.mapIn[1]);
  const scale = useRange(p, [T.mapIn[0], T.camera[1]], [0.96, 1], { rest: 1 });
  return (
    <motion.section
      aria-label="GIS 路线拓扑沙盘"
      className="glass-strong relative order-1 h-[46%] sm:h-[48%] shrink-0 overflow-hidden rounded-card border border-ink/[0.08] shadow-level-static md:order-none md:h-auto md:flex-1 gpu-layer [container-type:size]"
      style={{ opacity, scale }}
    >
      <RouteMap />

      {/* 地图沙盘左上角：沙盘标题微标 */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1 z-20">
        <span className="chip rounded-pill glass-strong border border-ink/[0.08] px-2 py-0.5 text-[11px] tabular-nums text-ink shadow-level-static inline-flex items-center gap-1">
          <CompassIcon className="h-3 w-3 text-gold" />
          <span>河西走廊 3D 拓扑沙盘 · 12 站</span>
        </span>
        <span className="chip rounded-pill hidden bg-paper/85 border border-ink/[0.08] px-2 py-0.2 text-[10px] text-ink-soft md:inline-flex">
          矢量高保真沙盘 · 毫秒级拓扑渲染
        </span>
      </div>

      {/* 地图沙盘右上角：专业 GIS 地图控制器群 (图层切换 / 指北针 / 缩放) */}
      <InAppMapControls />

      {/* 地图沙盘右下角：比例尺与经纬度状态 HUD */}
      <div className="pointer-events-none absolute bottom-2 right-2.5 hidden sm:flex items-center gap-2 rounded-control bg-paper/75 px-2 py-0.5 border border-ink/[0.06] text-[10px] font-mono text-ink-soft z-20">
        <span>38.05°N, 102.64°E</span>
        <span className="text-ink/20">|</span>
        <span>100 km</span>
        <span className="inline-block h-1 w-6 bg-ink/40" />
      </div>

      <ElevationCard />
      <PresenceCursor name="阿杰" tone="jade" xs={[62, 48, 30, 26]} ys={[30, 46, 40, 58]} />
      <PresenceCursor name="小雨" tone="lapis" xs={[20, 28, 22, 34]} ys={[34, 30, 24, 20]} />
      <Radar />
      <ComputingPill />
      <WalkLens />
    </motion.section>
  );
}

/* ── 专业 GIS 地图控制按钮挂件 (Layer switcher + Compass + Zoom) ── */
function InAppMapControls() {
  return (
    <div className="pointer-events-none absolute right-2.5 top-2.5 flex flex-col items-end gap-1.5 z-20">
      {/* 图层切换器 */}
      <div className="hidden xs:flex items-center rounded-pill bg-paper/90 p-0.5 border border-ink/[0.08] shadow-level-static text-[10px] text-ink-soft">
        <span className="flex items-center gap-1 rounded-pill bg-blue-900 px-2 py-0.5 text-white font-medium">
          <LayersIcon className="h-2.5 w-2.5 text-gold" />
          <span>地形高程</span>
        </span>
        <span className="px-1.5 py-0.5 text-ink-soft hover:text-ink">卫星</span>
        <span className="px-1.5 py-0.5 text-ink-soft hover:text-ink">限高图层</span>
      </div>

      {/* 缩放与指北按钮群 */}
      <div className="flex flex-col rounded-control bg-paper/90 border border-ink/[0.08] shadow-level-static overflow-hidden">
        <button type="button" aria-label="放大地图" className="flex h-6 w-6 items-center justify-center text-ink hover:bg-ink/[0.05]">
          <PlusIcon className="h-3 w-3" />
        </button>
        <div className="h-px w-full bg-ink/[0.06]" />
        <button type="button" aria-label="缩小地图" className="flex h-6 w-6 items-center justify-center text-ink hover:bg-ink/[0.05]">
          <MinusIcon className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

/* ── 高程剖面 ─────────────────────────────── */
const EW = 260;
const EH = 64;
const ELEV = elevationPath(EW, EH);

function ElevationCard() {
  const p = useProgress();
  const opacity = useRange(p, [T.elevIn[0], T.elevIn[1], T.zoomLanzhou[0], T.zoomLanzhou[0] + 0.01], [0, 1, 1, 0]);
  const y = useRange(p, [T.elevIn[0], T.elevIn[1]], [40, 0], { easing: ease.out, rest: 0 });
  const draw = useRange(p, [T.elevDraw[0], T.elevDraw[1]], [0, 1]);
  const rise = useRange(p, [T.elevDraw[0], T.elevDraw[1]], [0, 1]);
  const peak = useFade(p, T.elevDraw[1] - 0.008, T.elevDraw[1]);
  return (
    <motion.div
      className="glass-strong absolute bottom-2.5 left-2.5 hidden w-[270px] rounded-control border border-ink/[0.08] p-2.5 shadow-level-float sm:block gpu-layer z-20"
      style={{ opacity, y }}
    >
      <div className="flex items-baseline justify-between">
        <span className="text-[11px] font-semibold text-ink">全程海拔剖面 HUD</span>
        <span className="text-[10px] font-mono tabular-nums text-jade inline-flex items-center gap-0.5">
          <span>&lt; 长辈上限 3600m</span>
          <CheckIcon className="h-3 w-3" />
        </span>
      </div>
      <svg viewBox={`0 -14 ${EW} ${EH + 16}`} className="mt-0.5 h-[62px] w-full overflow-visible">
        <defs>
          <linearGradient id="elev-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgb(184 134 59)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="rgb(184 134 59)" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        <motion.path d={ELEV.area} fill="url(#elev-fill)" style={{ scaleY: rise, originY: 1 }} />
        <motion.path d={ELEV.line} fill="none" stroke="rgb(140 58 43)" strokeWidth={1.8} style={{ pathLength: draw }} />
        <motion.g style={{ opacity: peak }}>
          <circle cx={ELEV.peak[0]} cy={ELEV.peak[1]} r={3.5} fill="rgb(140 58 43)" />
          <text x={ELEV.peak[0] + 5} y={ELEV.peak[1] - 2} fontSize={11} fill="rgb(58 46 31)" fontWeight={600}>
            乌鞘岭 2980m
          </text>
        </motion.g>
      </svg>
    </motion.div>
  );
}

/* ── 协作成员实时信标（WebSocket presence 演示） ──────────── */
function PresenceCursor({ name, tone, xs, ys }: { name: string; tone: 'jade' | 'lapis'; xs: number[]; ys: number[] }) {
  const p = useProgress();
  const [a, b] = T.presence;
  const visibility = useTransform(p, (v) => (v >= a - 0.005 && v <= b ? 'visible' : 'hidden'));
  const times = xs.map((_, i) => a + ((b - a) * i) / (xs.length - 1));
  const left = useRange(p, times, xs);
  const top = useRange(p, times, ys);
  const x = useTransform(left, (n) => `${n}cqw`);
  const y = useTransform(top, (n) => `${n}cqh`);
  const opacity = useRange(p, [a, a + 0.008, b - 0.01, b], [0, 1, 1, 0]);
  const color = tone === 'jade' ? 'rgb(14 134 116)' : 'rgb(31 78 121)';
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-0 top-0 gpu-layer [contain:layout_paint] z-20" style={{ x, y, opacity, visibility }}>
      <svg width="15" height="15" viewBox="0 0 24 24">
        <path d="M4 2.5 L19.5 12 L12.4 13.6 L9 20.5 Z" fill={color} stroke="#fff" strokeWidth="1.8" strokeLinejoin="round" />
      </svg>
      <span className="ml-2.5 rounded-pill px-1.5 py-0.2 text-[10px] font-semibold text-paper" style={{ background: color }}>
        {name}
      </span>
    </motion.div>
  );
}

/* ── 本地重算：雷达 + 计算胶囊 ─────────────────────── */
function Radar() {
  const p = useProgress();
  const opacity = useFade(p, T.computing[0], T.computing[1], T.computing[2], T.computing[3]);
  return (
    <motion.div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-44 w-44 -translate-x-1/2 -translate-y-1/2 z-20" style={{ opacity }}>
      <div className="absolute inset-0 rounded-full border border-gold/40" />
      <div className="absolute inset-8 rounded-full border border-gold/30" />
      <div className="absolute inset-0 animate-radar rounded-full bg-[conic-gradient(from_0deg,rgb(var(--tc-gold)/0.45),transparent_28%)]" />
    </motion.div>
  );
}

function ComputingPill() {
  const p = useProgress();
  const opacity = useFade(p, T.computing[0], T.computing[1], T.computing[2], T.computing[3]);
  const y = useRange(p, [T.computing[0], T.computing[1]], [-12, 0], { rest: 0 });
  return (
    <motion.div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center z-30" style={{ opacity, y }}>
      <span className="chip rounded-pill glass-strong border border-ink/[0.08] shadow-level-float gap-1.5 px-3 py-1 text-xs text-ink">
        <span className="h-2.5 w-2.5 animate-radar rounded-full border-2 border-gold border-t-transparent" />
        排程引擎毫秒计算 · 3 组候选方案 · <b className="tabular-nums font-mono text-gold-ink">42ms</b>
      </span>
    </motion.div>
  );
}

/* ── 街区放大镜：酒店 → 夜市 步行虚线 ─────────────────── */
function WalkLens() {
  const p = useProgress();
  const { desktop } = useLayout();
  const opacity = useFade(p, T.lensIn[0], T.lensIn[1], T.syncStart[0], T.syncStart[1]);
  const visibility = useVisibility(p, T.lensIn[0] - 0.005, T.syncStart[1] + 0.005);
  const scale = useRange(p, [T.lensIn[0], T.lensIn[1]], [0.6, 1], { easing: ease.back, rest: 1 });
  const walk = useRange(p, [T.walkDraw[0], T.walkDraw[1]], [0, 1]);
  const ripple = useRange(p, [T.walkDraw[1], T.walkDraw[1] + 0.016], [0.5, 3], { easing: ease.out });
  const rippleO = useRange(p, [T.walkDraw[1] - 0.001, T.walkDraw[1], T.walkDraw[1] + 0.016], [0, 0.8, 0]);
  const marketPin = useRange(p, [T.walkDraw[1] - 0.004, T.walkDraw[1] + 0.004], [0, 1], { easing: ease.back });
  const size = desktop ? 220 : 140;

  return (
    <motion.div
      className="glass-strong absolute right-2.5 top-1/2 overflow-hidden rounded-full border border-ink/[0.08] shadow-level-float md:right-5 gpu-layer z-25"
      style={{ opacity, scale, visibility, width: size, height: size, marginTop: -size / 2 }}
      aria-label="兰州街区放大：酒店步行 950 米至正宁路夜市"
    >
      <svg viewBox="0 0 200 200" className="h-full w-full">
        <rect width="200" height="200" fill="#f3ead9" />
        <g stroke="#d9c9a8" strokeWidth="6" strokeLinecap="round">
          <path d="M-10 60 L210 52" />
          <path d="M-10 128 L210 120" />
          <path d="M48 -10 L56 210" />
          <path d="M118 -10 L126 210" />
          <path d="M168 -10 L176 210" />
        </g>
        <path d="M-10 30 C 50 18, 120 34, 210 14" stroke="#8fb3cf" strokeWidth="16" fill="none" strokeLinecap="round" />
        <text x="150" y="20" fontSize="12" fontWeight="600" fill="#3f6f96">黄河</text>
        <motion.path d="M 62 96 C 80 110, 92 124, 120 128 S 150 150, 150 160" fill="none" stroke="rgb(184 134 59)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.01 9" style={{ pathLength: walk }} />
        <g transform="translate(62 96)">
          <circle r="9" fill="rgb(31 78 121)" stroke="#fff" strokeWidth="2.5" />
          <text y="3.5" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="700">宿</text>
          <text x="-2" y="-14" fontSize="12" textAnchor="middle" fill="rgb(58 46 31)" fontWeight="600">水岸云上酒店</text>
          <g transform="translate(-30 14)">
            <rect x="-11" y="-8" width="22" height="16" rx="4" fill="rgb(31 78 121)" />
            <text y="4" fontSize="10" textAnchor="middle" fill="#fff" fontWeight="700">P</text>
            <text y="21" fontSize="11" textAnchor="middle" fill="rgb(58 46 31)" fontWeight="600">MPV地面车位</text>
          </g>
        </g>
        <g transform="translate(150 160)">
          <motion.circle r="10" fill="none" stroke="rgb(184 134 59)" strokeWidth="2" style={{ scale: ripple, opacity: rippleO }} />
          <motion.g style={{ scale: marketPin }}>
            <circle r="10" fill="rgb(184 134 59)" stroke="#fff" strokeWidth="2.5" />
            <g transform="translate(-5, -5) scale(0.42)" stroke="#fff" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 2v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V2" />
              <path d="M15 2v18" />
              <path d="M6 2v20" />
              <path d="M4 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H4" />
            </g>
          </motion.g>
          <text x="-4" y="24" fontSize="12" textAnchor="middle" fill="rgb(58 46 31)" fontWeight="700">正宁路夜市</text>
        </g>
        <g transform="translate(100 186)">
          <rect x="-56" y="-11" width="112" height="22" rx="11" fill="rgb(255 252 246)" stroke="rgb(184 134 59)" strokeOpacity="0.6" />
          <text y="4" fontSize="11" textAnchor="middle" fill="rgb(122 85 32)" fontWeight="700">步行 950m · 12 分钟</text>
        </g>
      </svg>
    </motion.div>
  );
}

/* ═════════════════════ 提名卡片抛物线飞入愿望池 ═════════════════════ */
function FlyingCard() {
  const p = useProgress();
  const { desktop, wide } = useLayout();
  const [a, b] = T.cardFly;
  const visibility = useTransform(p, (v) => (v >= a - 0.002 && v <= b ? 'visible' : 'hidden'));
  const mid = a + (b - a) * 0.35;
  const fromX = desktop ? 70 : 15;
  const toX = desktop ? (wide ? 24 : 4) : 8;
  const left = useRange(p, [a, b], [fromX, toX], { easing: ease.in });
  const top = useRange(p, [a, mid, b], [44, 28, 82], { easing: ease.smooth });
  const x = useTransform(left, (n) => `${n}cqw`);
  const y = useTransform(top, (n) => `${n}cqh`);
  const scale = useRange(p, [a, b], [1, 0.55]);
  const rotate = useRange(p, [a, mid, b], [0, -8, 4]);
  const opacity = useRange(p, [a - 0.001, a, b - 0.003, b], [0, 1, 1, 0]);
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0 z-40 w-[230px] gpu-layer [contain:layout_paint]"
      style={{ x, y, scale, rotate, opacity, visibility }}
    >
      <div className="glass-strong flex items-center gap-2 rounded-control border border-gold/40 p-2 shadow-level-float bg-paper">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-gold/15 text-gold-ink">
          <UtensilsIcon className="h-4 w-4 text-gold-ink" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-semibold text-ink">赵记牛奶鸡蛋醪糟</span>
          <span className="block text-[10px] text-ink-soft">阿杰提名 · 飞入待决池</span>
        </span>
        <Avatar name="阿杰" tone="jade" size={20} />
      </div>
    </motion.div>
  );
}
