'use client';

import { motion } from 'framer-motion';
import { ease, useFade, useRange, useVisibility } from '@/lib/motion';
import { T } from './timeline';
import { useProgress } from './primitives';
import { CheckIcon, MonitorIcon, SmartphoneIcon, TabletIcon } from '@/components/common/Icons';

/**
 * 05 幕收束：领队确认后的新版本同步到同行人的每一台设备（PRD-01 支柱 3）；
 * 离线可读、单文件导出与车机投递作为支撑能力随行，不再单独成幕。
 */
const DEVICES = [
  { Icon: SmartphoneIcon, label: '手机' },
  { Icon: TabletIcon, label: '平板' },
  { Icon: MonitorIcon, label: '电脑' },
];

const SUPPORT = ['离线可读', '单文件导出', '车机投递'];

export function SyncFinale() {
  const p = useProgress();
  const [a, b] = T.syncStrip;
  const opacity = useFade(p, a, b);
  const y = useRange(p, [a, b], [16, 0], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, 1);

  return (
    <motion.div
      role="status"
      className="pointer-events-none absolute inset-x-2 bottom-2 z-[45] flex justify-center sm:bottom-3"
      style={{ opacity, y, visibility }}
    >
      <div className="flex max-w-full flex-wrap items-center justify-center gap-x-3 gap-y-1.5 rounded-[12px] border border-[#E2E2D8] bg-[#FFFFF9] px-3 py-2 text-xs shadow-[0_16px_40px_rgba(36,30,32,0.14)]">
        <span className="whitespace-nowrap text-[13px] font-semibold text-[#241E20]">v1.1 已同步到全团 3 人的设备</span>
        <span className="flex items-center gap-1.5">
          {DEVICES.map(({ Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-[#E2E2D8] bg-white px-2 py-0.5 text-[#241E20]">
              <Icon className="h-3 w-3 text-[#625F61]" />
              {label}
              <CheckIcon className="h-3 w-3 text-[#0E8A5F]" />
            </span>
          ))}
        </span>
        <span className="hidden h-4 w-px bg-[#E2E2D8] sm:block" />
        <span className="flex flex-wrap items-center gap-1.5 text-[#828081]">
          <span className="whitespace-nowrap">支撑能力</span>
          {SUPPORT.map((s) => (
            <span key={s} className="whitespace-nowrap rounded-full border border-dashed border-[#E2E2D8] px-2 py-0.5 text-[#625F61]">
              {s}
            </span>
          ))}
        </span>
      </div>
    </motion.div>
  );
}
