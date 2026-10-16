'use client';

import type { ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { FakeCursor, Reveal, Toast, useProgress } from './primitives';
import { SparklesIcon, UtensilsIcon, CarIcon, CheckIcon } from '@/components/common/Icons';

/* ═════════════════════ 弹窗背景遮罩 ═════════════════════ */
export function Backdrop() {
  const p = useProgress();
  const [a, b, c, d] = T.backdrop;
  const visibility = useVisibility(p, a - 0.005, d + 0.005);
  const opacity = useFade(p, a, b, c, d);
  return (
    <motion.div
      aria-hidden
      className="modal-backdrop pointer-events-none absolute inset-0 z-40 bg-slate-950/30 backdrop-blur-[4px]"
      style={{ opacity, visibility }}
    />
  );
}

/* ═════════════════════ 路线优化推荐决策弹窗 (In-App Decision Support Modal) ═════════════════════ */
export function RecommendModal() {
  const p = useProgress();
  const visibility = useVisibility(p, T.modalIn[0] - 0.005, T.modalOut[1] + 0.005);
  const opacity = useRange(p, [T.modalIn[0], T.modalIn[1] - 0.006, T.modalOut[0] + 0.008, T.modalOut[1]], [0, 1, 1, 0]);
  const scale = useRange(p, [T.modalIn[0], T.modalIn[1], T.modalOut[0], T.modalOut[1]], [0.92, 1, 1, 0.22], { easing: ease.out });
  const x = useRange(p, [T.modalOut[0], T.modalOut[1]], [0, -32]);
  const y = useRange(p, [T.modalIn[0], T.modalIn[1], T.modalOut[0], T.modalOut[1]], [20, 0, 0, -28], { rest: 0 });
  const shimmer = useRange(p, [T.shimmer[0], T.shimmer[1]], [-130, 130], { rest: -130 });
  const scoreRef = useScrollCounter(p, 0, 98, T.score[0], T.score[1]);

  const xs = usePct(x);
  const ys = usePct(y);
  const shimmerX = usePct(shimmer);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4">
      <motion.div
        role="dialog"
        aria-label="路线拓扑优化推荐决策"
        className="glass-strong relative w-[min(560px,100%)] overflow-hidden rounded-container border border-gold/40 p-3.5 sm:p-5 shadow-level-float gpu-layer [contain:layout_paint]"
        style={{ opacity, scale, x: xs, y: ys, visibility }}
      >
        {/* 45° 微光扫掠高光 */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/80 to-transparent gpu-layer"
          style={{ x: shimmerX }}
        />

        <div className="relative flex items-start gap-2.5 sm:gap-3">
          <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-control bg-gradient-to-br from-gold via-gold-ink to-ink text-paper shadow-level-static ring-1 ring-gold/40">
            <SparklesIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <p className="font-serif text-base sm:text-lg font-bold text-ink">AI 路线拓扑优化决策</p>
              <span className="chip rounded-pill bg-gold/15 text-gold-ink text-[10px] px-1.5 py-0 font-medium">
                顺路度 98%
              </span>
            </div>
            <p className="mt-0.5 text-[11px] text-ink-soft">来自阿杰的愿望池实时提名 · 算法毫秒级重排 · 领队一键确认</p>
          </div>
        </div>

        {/* 核心量化指标卡群 */}
        <Reveal at={[T.modalRows[0], T.modalRows[0] + 0.006]} y={6} className="relative mt-2.5 sm:mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
          <Metric label="顺路评分" value={<><span ref={scoreRef} className="tabular-nums font-mono">98</span>%</>} tone="gold" />
          <Metric label="增加车程" value={<span className="tabular-nums font-mono">0 km</span>} sub="漫步即达" tone="jade" />
          <Metric label="次日出发" value={<span className="tabular-nums font-mono">08:30</span>} sub="准点不变" tone="lapis" />
        </Reveal>

        {/* 前后对比表 (Diff Table) - 始终双列并排对比，清晰直观且节约小屏垂直高度 */}
        <Reveal at={[T.modalRows[1], T.modalRows[1] + 0.006]} y={6} className="relative mt-2 sm:mt-2.5 grid grid-cols-2 gap-1.5 sm:gap-2 text-[10px] sm:text-xs">
          <div className="rounded-control bg-ink/[0.04] p-2 sm:p-2.5 border border-ink/[0.06]">
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-ink-soft font-mono">原行程 · D0 晚间</p>
            <ul className="mt-1 space-y-0.5 sm:space-y-1 text-[9px] sm:text-[11px] text-ink-soft">
              <li><b className="tabular-nums font-mono text-ink">19:15</b> 入住酒店</li>
              <li><b className="tabular-nums font-mono text-ink">20:00</b> 自由活动 (各自觅食)</li>
              <li className="line-through decoration-ink/30 text-ink-soft/40">—</li>
            </ul>
          </div>
          <div className="rounded-control bg-gold/10 p-2 sm:p-2.5 border border-gold/40 shadow-level-static">
            <p className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gold-ink font-mono flex items-center justify-between">
              <span>优化后 · D0</span>
              <span className="chip rounded-pill bg-jade/15 text-jade text-[8px] sm:text-[9px] px-1 py-0 font-medium">推荐</span>
            </p>
            <ul className="mt-1 space-y-0.5 sm:space-y-1 text-[9px] sm:text-[11px] text-ink">
              <li><b className="tabular-nums font-mono">19:15</b> 统一办理入住</li>
              <li className="flex items-center gap-0.5 sm:gap-1 font-semibold text-gold-ink truncate">
                <b className="tabular-nums font-mono">20:00</b>
                <span className="truncate">正宁路夜市 (醪糟)</span>
                <UtensilsIcon className="inline h-2.5 w-2.5 sm:h-3 sm:w-3 text-gold-ink shrink-0" />
              </li>
              <li><b className="tabular-nums font-mono">21:30</b> 散步返回安歇</li>
            </ul>
          </div>
        </Reveal>

        {/* 7座豪华 MPV 物理避障安全提示 */}
        <Reveal at={[T.modalRows[2], T.modalRows[2] + 0.006]} y={6} className="relative mt-1.5 sm:mt-2">
          <div className="flex items-start gap-1.5 sm:gap-2 rounded-control bg-gold/10 p-2 sm:p-2.5 text-[10px] sm:text-xs leading-relaxed text-ink border border-gold/30">
            <CarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gold shrink-0 mt-0.5" />
            <p className="text-[10px] sm:text-[11px]">
              <b className="text-gold-ink">7座 MPV 车顶箱 2.28m 限高避障：</b>夜市街区地库限高 2.0m；已下发方案：MPV 停泊酒店地面车位，全家漫步 950m 前往。
            </p>
          </div>
        </Reveal>

        {/* 操作按钮组 */}
        <Reveal at={[T.modalRows[3], T.modalRows[3] + 0.006]} y={6} className="relative mt-3 flex items-center justify-end gap-2">
          <span className="btn-ghost rounded-pill min-h-[36px] border border-ink/[0.08] px-3.5 text-xs font-semibold text-ink-soft">
            保持原计划
          </span>
          <RecommendApplyButton />
        </Reveal>

        <FakeCursor times={[T.cursorApply[0], T.cursorApply[1]]} xs={[60, 82]} ys={[96, 88]} clickAt={T.clickApply} hideAt={T.modalOut[0]} />
      </motion.div>
    </div>
  );
}

function RecommendApplyButton() {
  const p = useProgress();
  const press = useRange(p, [T.clickApply - 0.003, T.clickApply, T.clickApply + 0.003], [1, 0.94, 1]);
  const applied = useStep(p, [T.clickApply + 0.001]) === 1;
  return (
    <motion.span
      className={`btn-primary inline-flex min-h-[36px] sm:min-h-[38px] items-center gap-1.5 rounded-pill px-4 sm:px-5 text-xs sm:text-sm font-semibold shadow-level-hover ${
        applied ? 'bg-jade text-paper shadow-level-static' : ''
      }`}
      style={{ scale: press }}
    >
      {applied ? (
        <>
          <CheckIcon className="h-4 w-4" />
          <span>已采纳，已重编排路线</span>
        </>
      ) : (
        <>
          <SparklesIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span>一键采纳并重排路线</span>
        </>
      )}
    </motion.span>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone: 'gold' | 'jade' | 'lapis' }) {
  const color = { gold: 'text-gold-ink', jade: 'text-jade', lapis: 'text-lapis' }[tone];
  return (
    <div className="rounded-control bg-paper/90 p-2 sm:p-2.5 text-center border border-ink/[0.08] shadow-level-static">
      <p className={`font-serif text-lg sm:text-xl font-bold tabular-nums font-mono ${color}`}>
        {value}
        {sub ? <span className="ml-1 text-[10px] font-medium text-ink-soft">{sub}</span> : null}
      </p>
      <p className="text-[10px] sm:text-[11px] text-ink-soft">{label}</p>
    </div>
  );
}

function usePct(v: MotionValue<number>) {
  return useTransform(v, (n) => `${n}%`);
}

/* ═════════════════════ 气泡通知栈 ═════════════════════ */
export function StageToasts() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[55] flex flex-col items-center gap-1.5 sm:gap-2">
      <Toast range={T.toastAJie}>阿杰 通过微信加入了协同空间 · 免登免密</Toast>
      <Toast range={T.toastXiaoyu}>小雨 也加入了 · 3 端实时同频中</Toast>
      <Toast range={T.toastSync} tone="gold">领队已确认新方案 · v1.1 已秒级推送到全团与车机</Toast>
    </div>
  );
}
