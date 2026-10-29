'use client';

import type { ComponentType } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useFadeVisibility, useRange } from '@/lib/motion';
import { T, sec } from './timeline';
import { Avatar, useProgress, type AvatarTone } from './primitives';
import { useConstellation, type DeviceId } from './Constellation';
import { CarIcon, CheckIcon, MonitorIcon, SignalSlashIcon, SmartphoneIcon, TabletIcon, type IconProps } from '@/components/common/Icons';

/**
 * 04 幕收束 · 多端同步（PRD-01 支柱 3）
 *
 * 领队确认后的新版本逐台同步到同行人的设备：每一行是谁的哪块屏、现在是哪个版本。
 * 导演版（2026-10-29）：和舞台上的涟漪是同一个波前（Constellation 的 updateAt）——舞台上哪块屏先亮，这里哪一行先打勾；
 * 最后一行是车机导航：出发当天领队把今天的路线投递过去，由车机导航带路。
 * 离线可读作为支撑能力，用一句状态说明交代，不单独成幕。
 */

interface Row {
  device: DeviceId;
  Icon: ComponentType<IconProps>;
  owner: string;
  tone: AvatarTone;
  name: string;
  note?: string;
}

/** 宽视窗：视窗是「我的电脑」；手机布局：视窗是「我的手机」 */
const WIDE_ROWS: Row[] = [
  { device: 'window', Icon: MonitorIcon, owner: '我', tone: 'violet', name: '我的电脑', note: '当前设备' },
  { device: 'hero', Icon: SmartphoneIcon, owner: '我', tone: 'violet', name: '我的手机' },
  { device: 'ajie', Icon: SmartphoneIcon, owner: '阿杰', tone: 'teal', name: '阿杰的手机' },
  { device: 'xiaoyu', Icon: TabletIcon, owner: '小雨', tone: 'rose', name: '小雨的平板' },
];
const NARROW_ROWS: Row[] = [
  { device: 'window', Icon: SmartphoneIcon, owner: '我', tone: 'violet', name: '我的手机', note: '当前设备' },
  { device: 'laptop', Icon: MonitorIcon, owner: '我', tone: 'violet', name: '我的电脑' },
  { device: 'ajie', Icon: SmartphoneIcon, owner: '阿杰', tone: 'teal', name: '阿杰的手机' },
  { device: 'xiaoyu', Icon: TabletIcon, owner: '小雨', tone: 'rose', name: '小雨的平板' },
];

export function DeviceSync() {
  const { narrow } = useConstellation();
  const rows = narrow ? NARROW_ROWS : WIDE_ROWS;
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ui-ink">同步</p>
        <SyncCount rows={rows} />
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {rows.map((r) => (
          <SyncRow key={r.name} row={r} />
        ))}
        <CarRow />
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ui-ink-3">
        <SignalSlashIcon className="h-3.5 w-3.5 shrink-0" />
        已同步的行程在无信号路段也能打开
      </p>
    </div>
  );
}

/** 「n / 4 台已是 v1.1」：随波前逐台加一 */
function SyncCount({ rows }: { rows: Row[] }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const times = rows.map((r) => updateAt(r.device)).sort((a, b) => a - b);
  const n = useTransform(p, (v) => times.filter((t) => v >= t).length);
  const label = useTransform(n, (k) => `${k} / ${rows.length} 台已是 v1.1`);
  return <motion.span className="text-xs tabular-nums text-ui-ink-3">{label}</motion.span>;
}

function SyncRow({ row }: { row: Row }) {
  const p = useProgress();
  const { updateAt } = useConstellation();
  const at = updateAt(row.device);
  const done = useRange(p, [at - sec(0.02), at], [0, 1]);
  const pending = useTransform(done, (v) => 1 - v);
  const doneVisibility = useFadeVisibility(done);
  const pendingVisibility = useFadeVisibility(pending);
  return (
    <li className="flex h-10 items-center gap-2.5 rounded-ui-ctl bg-ui-sunken px-2.5">
      <Avatar name={row.owner} tone={row.tone} size={22} ring={false} />
      <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">
        {row.name}
        {row.note ? <span className="text-xs text-ui-ink-3"> · {row.note}</span> : null}
      </span>
      <row.Icon className="h-4 w-4 shrink-0 text-ui-ink-3" />
      <span className="relative inline-flex w-[62px] shrink-0 justify-end">
        <motion.span className="inline-flex items-center gap-1.5 text-xs text-ui-ink-3" style={{ opacity: pending, visibility: pendingVisibility }}>
          <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-ui-line-strong border-t-transparent" />
          同步中
        </motion.span>
        <motion.span
          className="absolute right-0 inline-flex items-center gap-1 rounded-full bg-ui-success/10 px-2 text-xs font-medium leading-5 text-ui-success"
          style={{ opacity: done, visibility: doneVisibility }}
        >
          <CheckIcon className="h-3 w-3" />
          v1.1
        </motion.span>
      </span>
    </li>
  );
}

/** 车机导航：不同步行程，只在出发当天收到领队投递的今天的路线（docs/02 Tier 0 深链），由车机导航带路 */
function CarRow() {
  const p = useProgress();
  const at = T.carRoute[0];
  const done = useRange(p, [at - sec(0.02), at], [0, 1]);
  const pending = useTransform(done, (v) => 1 - v);
  const doneVisibility = useFadeVisibility(done);
  const pendingVisibility = useFadeVisibility(pending);
  return (
    <li className="flex h-10 items-center gap-2.5 rounded-ui-ctl border border-dashed border-ui-line-strong px-2.5">
      <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-ui-sunken text-ui-ink-2">
        <CarIcon className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">车机导航</span>
      <span className="relative inline-flex shrink-0 justify-end">
        <motion.span className="whitespace-nowrap text-xs text-ui-ink-3" style={{ opacity: pending, visibility: pendingVisibility }}>
          出发当天投递
        </motion.span>
        <motion.span
          className="absolute right-0 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-ui-success/10 px-2 text-xs font-medium leading-5 text-ui-success"
          style={{ opacity: done, visibility: doneVisibility }}
        >
          <CheckIcon className="h-3 w-3" />
          今天的路线
        </motion.span>
      </span>
    </li>
  );
}
