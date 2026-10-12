'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ease, useFade, useRange, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { Reveal, useProgress } from './primitives';

const STEPS = ['AJV Schema 校验通过 · 0 错误', '内联离线 SVG 底图与降级卡片', '字体子集化 · 186 KB', '单文件 1.8 MB · 0 外部请求'];

export function DeliverScene() {
  const p = useProgress();
  const visibility = useVisibility(p, T.fileIn[0] - 0.01, 1.0);
  const fileOpacity = useFade(p, T.fileIn[0], T.fileIn[1]);
  const fileScale = useRange(p, [T.fileIn[0], T.fileIn[1], T.fileUp[0], T.fileUp[1]], [0.7, 1, 1, 0.78], { easing: ease.out, rest: 1 });
  const fileY = useRange(p, [T.fileIn[0], T.fileIn[1], T.fileUp[0], T.fileUp[1]], [40, 0, 0, -150], { rest: 0 });
  const bar = useRange(p, [T.compileSteps[0] - 0.004, T.compileSteps[3] + 0.002], [0.04, 1], { easing: ease.linear });

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center gpu-layer [contain:layout_paint]"
      style={{ visibility }}
    >
      <motion.div className="glass-strong relative z-10 w-[min(400px,92%)] rounded-3xl p-5 gpu-layer" style={{ opacity: fileOpacity, scale: fileScale, y: fileY }}>
        <div className="flex items-center gap-4">
          <FileIcon />
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-semibold text-ink">西行计划.v1.1.html</p>
            <p className="mt-0.5 text-[11px] text-ink-soft">自包含 · 双击秒开 · 无需安装</p>
          </div>
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-ink/10">
          <motion.div className="h-full origin-left rounded-full bg-gradient-to-r from-gold to-jade" style={{ scaleX: bar }} />
        </div>
        <ul className="mt-3 space-y-1.5">
          {STEPS.map((s, i) => (
            <li key={s}>
              <Reveal at={[T.compileSteps[i], T.compileSteps[i] + 0.005]} y={4} className="flex items-center gap-2 text-[12px] text-ink">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-jade text-[9px] text-paper">✓</span>
                {s}
              </Reveal>
            </li>
          ))}
        </ul>
      </motion.div>

      <Devices />

      <Reveal at={[T.tagline[0], T.tagline[1]]} y={14} className="absolute inset-x-0 bottom-0 text-center">
        <p className="font-serif text-lg font-semibold text-ink md:text-2xl">从一段对话，到一件可以带走的作品。</p>
      </Reveal>
    </motion.div>
  );
}

function FileIcon() {
  return (
    <svg width="52" height="62" viewBox="0 0 52 62" aria-hidden className="shrink-0 drop-shadow-md">
      <path d="M4 4 a4 4 0 0 1 4-4 H34 L52 18 V58 a4 4 0 0 1-4 4 H8 a4 4 0 0 1-4-4 Z" fill="rgb(250 245 235)" stroke="rgb(184 134 59)" strokeWidth="1.5" />
      <path d="M34 0 V14 a4 4 0 0 0 4 4 H52" fill="rgb(242 232 213)" stroke="rgb(184 134 59)" strokeWidth="1.5" />
      <rect x="10" y="34" width="32" height="14" rx="3" fill="rgb(184 134 59)" />
      <text x="26" y="44.5" fontSize="9" fontWeight="700" textAnchor="middle" fill="#fff" fontFamily="monospace">HTML</text>
    </svg>
  );
}

/* ── 三端扇形展开：手机离线 / 车机投屏 / 打印手册 ─────────── */
function Devices() {
  const p = useProgress();
  const [a] = T.devices;
  const opacity = useFade(p, a, a + 0.01);
  return (
    <motion.div className="absolute inset-x-0 bottom-10 flex origin-bottom scale-[0.62] items-end justify-center gap-6 sm:scale-75 md:bottom-12 md:scale-90 lg:scale-100" style={{ opacity }}>
      <DeviceSlot offset={-1} rotate={-7}>
        <PhoneDevice />
      </DeviceSlot>
      <DeviceSlot offset={0} rotate={0}>
        <CockpitDevice />
      </DeviceSlot>
      <DeviceSlot offset={1} rotate={6}>
        <BookletDevice />
      </DeviceSlot>
    </motion.div>
  );
}

/** 从中心（文件所在处）沿 offset 方向扇出 */
function DeviceSlot({ offset, rotate, children }: { offset: number; rotate: number; children: ReactNode }) {
  const p = useProgress();
  const [a, b] = T.devices;
  const x = useRange(p, [a, b], [-offset * 180, 0], { easing: ease.out, rest: 0 });
  const y = useRange(p, [a, b], [-120, 0], { easing: ease.back, rest: 0 });
  const r = useRange(p, [a, b], [0, rotate], { easing: ease.out, rest: rotate });
  const scale = useRange(p, [a, b], [0.4, 1], { easing: ease.out, rest: 1 });
  return (
    <motion.div className="shrink-0 gpu-layer" style={{ x, y, rotate: r, scale }}>
      {children}
    </motion.div>
  );
}

function PhoneDevice() {
  return (
    <div className="h-[300px] w-[150px] rounded-[30px] bg-[#1b1a18] p-[6px] shadow-[0_30px_60px_rgba(0,0,0,0.3)]">
      <div className="flex h-full flex-col overflow-hidden rounded-[24px] bg-sand">
        <div className="flex items-center justify-between px-3 pt-2 text-[8px] font-semibold text-ink">
          <span>10:41</span>
          <span>✈ 无信号</span>
        </div>
        <div className="mx-2 mt-2 rounded-xl bg-gradient-to-br from-dusk via-gold to-ochre p-2 text-paper">
          <p className="font-serif text-[13px] font-bold">西行计划</p>
          <p className="text-[8px] opacity-85">D3 · 嘉峪关 → 敦煌</p>
        </div>
        <ul className="mt-2 space-y-1 px-2">
          {['08:30 出发 · G30', '13:00 瓜州午休', '17:20 抵达敦煌', '19:30 沙州夜市'].map((r) => (
            <li key={r} className="rounded-md bg-paper/90 px-2 py-1 text-[8.5px] text-ink">{r}</li>
          ))}
        </ul>
        <Reveal at={[T.deviceDetail[0], T.deviceDetail[1]]} y={4} className="mt-auto p-2">
          <p className="rounded-lg bg-jade px-2 py-1 text-center text-[8.5px] font-semibold text-paper">离线可读 · 本机 IndexedDB</p>
        </Reveal>
      </div>
    </div>
  );
}

function CockpitDevice() {
  return (
    <div className="w-[340px] rounded-2xl bg-[#14171c] p-2 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
      <div className="flex h-[130px] gap-3 rounded-xl bg-gradient-to-br from-[#1a2333] to-[#0e1420] p-3 text-white">
        <div className="flex flex-col justify-between">
          <p className="text-[9px] uppercase tracking-widest text-white/50">下一站</p>
          <p className="font-serif text-xl font-bold">乌鞘岭</p>
          <p className="text-[10px] text-white/70">128 km · 约 1h 35m</p>
          <p className="text-[9px] text-[#e7c27d]">⚠ 长下坡 18km · 低挡缓行</p>
        </div>
        <svg viewBox="0 0 140 100" className="flex-1">
          <path d="M10 90 C 40 70, 50 40, 80 36 S 120 20, 132 8" fill="none" stroke="#e7c27d" strokeWidth="3" strokeLinecap="round" />
          <circle cx="10" cy="90" r="5" fill="#5ab0ff" />
          <circle cx="132" cy="8" r="4" fill="#e7c27d" />
        </svg>
      </div>
      <Reveal at={[T.deviceDetail[0] + 0.004, T.deviceDetail[1] + 0.004]} y={4}>
        <p className="mt-2 text-center text-[10px] text-white/70">Tier 0 车机投屏 · 12 个途经点已发送 · 无需车企 SDK</p>
      </Reveal>
    </div>
  );
}

function BookletDevice() {
  return (
    <div className="paper-texture h-[220px] w-[160px] rounded-md bg-paper p-3 shadow-[0_24px_50px_rgba(58,46,31,0.25)] ring-1 ring-ink/10">
      <p className="text-[8px] tracking-[0.3em] text-gold-ink">TRIPCRAFT</p>
      <p className="mt-1 font-serif text-lg font-bold leading-tight text-ink">西行计划</p>
      <p className="text-[8px] text-ink-soft">丝路自驾路书 · 九日</p>
      <div className="mt-3 space-y-1.5">
        {[90, 75, 82, 60, 70].map((w, i) => (
          <span key={i} className="block h-1.5 rounded bg-ink/15" style={{ width: `${w}%` }} />
        ))}
      </div>
      <Reveal at={[T.deviceDetail[0] + 0.008, T.deviceDetail[1] + 0.008]} y={4} className="mt-4">
        <p className="rounded bg-ochre/10 px-1.5 py-1 text-center text-[9px] font-semibold text-ochre">A5 打印版 · 长辈大字</p>
      </Reveal>
    </div>
  );
}
