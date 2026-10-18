'use client';

import { motion } from 'framer-motion';
import { DAYS, SELF_DRIVE_ROUTE, type DayPlan } from '@/data/trip';
import { ease, useFade, useRange, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Scene, TapCursor, useProgress } from './primitives';
import { PageHeader, btn } from './ui';
import { TripMap } from './RouteMap';
import { ArrowRightIcon, BuildingIcon } from '@/components/common/Icons';

/**
 * 02 幕 · 路径 A · AI 规划自驾（docs/16 §16.5）
 *
 * 一个页面一个任务：审阅 AI 按需求画像编排的九天自驾草案。
 * 地图上路线按天推进，下方日程同步高亮当天；每天一行写清它怎样照顾到画像（午休、台阶、车高、日落）。
 * 结果页底部出现与旅行社线路的交叉提示（§16.5.2），点击进入路径 B。
 */

const MAP_LABELS = ['lz', 'zy', 'jyg', 'dh', 'yd'] as const;

export function Workspace() {
  const p = useProgress();
  const draw = useRange(p, T.routeDraw.t, T.routeDraw.v, { easing: ease.linear });

  return (
    <Scene range={T.driveScene} label="路径 A：AI 规划的自驾草案">
      <PageHeader
        title="河西走廊 9 日 · 自驾草案"
        subtitle="按需求画像生成 · 地点与开放时间经图商核验，推荐理由由 AI 撰写"
        actions={
          <>
            <span className={`${btn.secondary} hidden cq-md:inline-flex`}>换一个方案</span>
            <span className={btn.primary}>
              <span className="cq-sm:hidden">保存</span>
              <span className="hidden cq-sm:inline">保存到行程空间</span>
            </span>
          </>
        }
      />

      <div className="relative min-h-0 flex-1 border-b border-[#EEEDE7] bg-[#FAF8F3]">
        <TripMap route={SELF_DRIVE_ROUTE} draw={draw} labels={MAP_LABELS} />
        <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs text-[#625F61] ring-1 ring-[#E2E2D8]">全程 1,980 km · 开车 6 天</span>
        <CrossHint />
      </div>

      <DayList />
    </Scene>
  );
}

/* ── 九天日程：宽视窗两列，手机单列显示前 5 天 ── */
function DayList() {
  const p = useProgress();
  const active = useStep(p, T.dayAt);
  return (
    <div className="shrink-0 px-2 py-2">
      <ol className="flex flex-col cq-md:grid cq-md:grid-flow-col cq-md:grid-cols-2 cq-md:grid-rows-5 cq-md:gap-x-2">
        {DAYS.map((day, i) => (
          <DayRow key={day.tag} day={day} index={i} active={active === i} className={i >= 5 ? 'hidden cq-md:flex' : ''} />
        ))}
        <li className="flex h-11 items-center px-2 text-xs text-[#828081] cq-md:hidden">还有 4 天 · D5–D8</li>
      </ol>
    </div>
  );
}

function DayRow({ day, index, active, className = '' }: { day: DayPlan; index: number; active: boolean; className?: string }) {
  const p = useProgress();
  const [a, b] = T.daysIn;
  const at = a + ((b - a) * index) / DAYS.length;
  const opacity = useFade(p, at, at + 0.006);
  const y = useRange(p, [at, at + 0.008], [6, 0], { easing: ease.out, rest: 0 });

  return (
    <motion.li
      className={`relative flex h-11 items-center gap-3 rounded-[5px] px-2 transition-colors duration-300 ${active ? 'bg-[#FE3C01]/[0.06]' : ''} ${className}`}
      style={{ opacity, y }}
    >
      <span aria-hidden className={`absolute inset-y-2 left-0 w-[2px] rounded-full transition-colors duration-300 ${active ? 'bg-[#FE3C01]' : 'bg-transparent'}`} />
      <span className={`w-6 shrink-0 text-xs font-semibold tabular-nums ${active ? 'text-[#C43200]' : 'text-[#828081]'}`}>{day.tag}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-[#241E20]">{day.title}</span>
        <span className="block truncate text-xs text-[#828081]">{day.meta}</span>
      </span>
      <span className="shrink-0 text-xs tabular-nums text-[#625F61]">{day.drive ?? ''}</span>
    </motion.li>
  );
}

/* ── 结果页底部：与旅行社线路的交叉提示 ── */
function CrossHint() {
  const p = useProgress();
  const [a, b] = T.crossHint;
  const opacity = useFade(p, a, b);
  const y = useRange(p, [a, b], [12, 0], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, 2);
  const press = useRange(p, [T.crossClick - 0.003, T.crossClick, T.crossClick + 0.003], [1, 0.96, 1]);

  return (
    <motion.div className="absolute inset-x-3 bottom-3 z-20" style={{ opacity, y, visibility }}>
      <div className="flex items-center gap-3 rounded-[12px] border border-[#E2E2D8] bg-white px-3 py-2 shadow-[0_12px_32px_rgba(36,30,32,0.12)]">
        <BuildingIcon className="h-4 w-4 shrink-0 text-[#625F61]" />
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-[#241E20]">
          有 <b className="font-semibold tabular-nums">5 条</b>旅行社线路与这份方案相似
          <span className="hidden text-[#625F61] cq-sm:inline">，最高匹配 91%</span>
        </p>
        <motion.span className={`${btn.secondary} relative`} style={{ scale: press }}>
          查看线路
          <ArrowRightIcon className="h-3.5 w-3.5" />
          <TapCursor approach={T.crossCursor} clickAt={T.crossClick} hideAt={T.filterScene[1]} className="left-8 top-4" />
        </motion.span>
      </div>
    </motion.div>
  );
}
