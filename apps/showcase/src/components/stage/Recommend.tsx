'use client';

import type { ReactNode } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { ease, useFade, useRange, useScrollCounter, useStep, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { FakeCursor, Reveal, Toast, useProgress } from './primitives';

/* ═════════════════════ 弹窗背景遮罩 ═════════════════════ */
export function Backdrop() {
  const p = useProgress();
  const [a, b, c, d] = T.backdrop;
  const visibility = useVisibility(p, a - 0.005, d + 0.005);
  const opacity = useFade(p, a, b, c, d);
  return (
    <motion.div
      aria-hidden
      className="modal-backdrop pointer-events-none absolute inset-0 z-40 bg-lapis-deep/25 backdrop-blur-[3px]"
      style={{ opacity, visibility }}
    />
  );
}

/* ═════════════════════ 路线优化推荐弹窗 ═════════════════════ */
export function RecommendModal() {
  const p = useProgress();
  const visibility = useVisibility(p, T.modalIn[0] - 0.005, T.modalOut[1] + 0.005);
  const opacity = useRange(p, [T.modalIn[0], T.modalIn[1] - 0.006, T.modalOut[0] + 0.008, T.modalOut[1]], [0, 1, 1, 0]);
  const scale = useRange(p, [T.modalIn[0], T.modalIn[1], T.modalOut[0], T.modalOut[1]], [0.92, 1, 1, 0.22], { easing: ease.out });
  const x = useRange(p, [T.modalOut[0], T.modalOut[1]], [0, -32]);
  const y = useRange(p, [T.modalIn[0], T.modalIn[1], T.modalOut[0], T.modalOut[1]], [24, 0, 0, -30], { rest: 0 });
  const shimmer = useRange(p, [T.shimmer[0], T.shimmer[1]], [-130, 130], { rest: -130 });
  const scoreRef = useScrollCounter(p, 0, 98, T.score[0], T.score[1]);

  const xs = usePct(x);
  const ys = usePct(y);
  const shimmerX = usePct(shimmer);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center p-3">
      <motion.div
        role="dialog"
        aria-label="路线优化推荐"
        className="glass-strong relative w-[min(560px,100%)] overflow-hidden rounded-3xl p-4 md:p-6 gpu-layer [contain:layout_paint]"
        style={{ opacity, scale, x: xs, y: ys, visibility }}
      >
        {/* 45° 微光扫掠 */}
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/70 to-transparent gpu-layer"
          style={{ x: shimmerX }}
        />

        <div className="relative flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-ochre text-lg text-paper shadow">✨</span>
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold text-ink md:text-xl">发现一条更顺路的安排</p>
            <p className="mt-0.5 text-[11px] text-ink-soft">来自阿杰的提名 · 浏览器本地计算 · 数据不出设备</p>
          </div>
        </div>

        <Reveal at={[T.modalRows[0], T.modalRows[0] + 0.006]} y={8} className="relative mt-4 grid grid-cols-3 gap-2">
          <Metric label="顺路度" value={<><span ref={scoreRef}>98</span>%</>} tone="gold" />
          <Metric label="增加车程" value="0 km" tone="jade" />
          <Metric label="次日出发" value="08:30" sub="不变" tone="lapis" />
        </Reveal>

        <Reveal at={[T.modalRows[1], T.modalRows[1] + 0.006]} y={8} className="relative mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-ink/[0.04] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-ink-soft">原计划 · D0 晚</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-ink-soft">
              <li><b className="tabular-nums text-ink">19:15</b> 入住酒店</li>
              <li><b className="tabular-nums text-ink">20:00</b> 自由活动</li>
              <li className="line-through decoration-ink/30">—</li>
            </ul>
          </div>
          <div className="rounded-xl bg-gold/10 p-3 ring-1 ring-gold/40">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-ink">优化后 · D0 晚</p>
            <ul className="mt-1.5 space-y-1 text-[12px] text-ink">
              <li><b className="tabular-nums">19:15</b> 入住酒店</li>
              <li><b className="tabular-nums text-gold-ink">20:00</b> 步行正宁路夜市 · 醪糟 🍜</li>
              <li><b className="tabular-nums">21:30</b> 回酒店休息</li>
            </ul>
          </div>
        </Reveal>

        <Reveal at={[T.modalRows[2], T.modalRows[2] + 0.006]} y={8} className="relative mt-3">
          <p className="flex gap-2 rounded-xl bg-amber/10 p-3 text-[12px] leading-relaxed text-ink ring-1 ring-amber/30">
            <span>🚙</span>
            <span>
              <b className="text-amber">7座 MPV 车顶箱限高提醒：</b>车辆加装车顶行李箱后高 2.15m，正宁路夜市老城地库限高 2.0m 无法驶入；建议停放酒店地面车位，全家慢行 950m（约 12 分钟）前往。
            </span>
          </p>
        </Reveal>

        <Reveal at={[T.modalRows[3], T.modalRows[3] + 0.006]} y={8} className="relative mt-4 flex items-center justify-end gap-2">
          <span className="btn-ghost min-h-[40px] border-ink/15 px-4 text-ink-soft">保持原计划</span>
          <RecommendApplyButton />
        </Reveal>

        <FakeCursor times={[T.cursorApply[0], T.cursorApply[1]]} xs={[60, 84]} ys={[130, 90]} clickAt={T.clickApply} hideAt={T.modalOut[0]} />
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
      className={`inline-flex min-h-[40px] items-center gap-1.5 rounded-full px-5 text-sm font-semibold text-paper transition-colors duration-200 ${
        applied ? 'bg-jade' : 'bg-gradient-to-b from-gold to-gold-ink shadow-glow'
      }`}
      style={{ scale: press }}
    >
      {applied ? '✓ 已采纳，正在重排' : '✨ 一键采纳并重排'}
    </motion.span>
  );
}

function Metric({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: string; tone: 'gold' | 'jade' | 'lapis' }) {
  const color = { gold: 'text-gold-ink', jade: 'text-jade', lapis: 'text-lapis' }[tone];
  return (
    <div className="rounded-xl bg-paper/80 p-2.5 text-center ring-1 ring-ink/5">
      <p className={`font-serif text-xl font-bold tabular-nums md:text-2xl ${color}`}>
        {value}
        {sub ? <span className="ml-1 text-[10px] font-medium text-ink-soft">{sub}</span> : null}
      </p>
      <p className="text-[10px] text-ink-soft">{label}</p>
    </div>
  );
}

function usePct(v: MotionValue<number>) {
  return useTransform(v, (n) => `${n}%`);
}

/* ═════════════════════ 气泡通知栈 ═════════════════════ */
export function StageToasts() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-3 z-[55] flex flex-col items-center gap-2">
      <Toast range={T.toastAJie}>阿杰 通过微信加入了协作空间 · 免注册</Toast>
      <Toast range={T.toastXiaoyu}>小雨 也加入了 · 当前 3 人在线</Toast>
      <Toast range={T.toastSync} tone="gold">路书已更新至 v1.1 · 已同步给全团</Toast>
    </div>
  );
}
