'use client';

import type { ComponentType } from 'react';
import { useStep } from '@/lib/motion';
import { T } from './timeline';
import { useProgress } from './primitives';
import { CheckIcon, MonitorIcon, SmartphoneIcon, TabletIcon, type IconProps } from '@/components/common/Icons';

/**
 * 04 幕收束 · 多端同步（PRD-01 支柱 3）
 *
 * 领队确认后的新版本逐台同步到同行人的设备：每一行是谁的哪台设备、现在是哪个版本。
 * 离线可读作为支撑能力，用一句状态说明交代，不单独成幕。
 */

const DEVICES: { Icon: ComponentType<IconProps>; name: string; note?: string }[] = [
  { Icon: MonitorIcon, name: '我的电脑', note: '当前设备' },
  { Icon: SmartphoneIcon, name: '阿杰的手机' },
  { Icon: TabletIcon, name: '小雨的平板' },
];

export function DeviceSync() {
  const p = useProgress();
  const synced = useStep(p, T.syncRows);
  return (
    <div>
      <p className="text-[13px] font-semibold text-[#241E20]">同步</p>
      <ul className="mt-2 flex flex-col">
        {DEVICES.map((dev, i) => {
          const done = synced > i;
          return (
            <li key={dev.name} className="flex h-9 items-center gap-2 border-b border-[#F0EFE9] last:border-b-0">
              <dev.Icon className="h-4 w-4 shrink-0 text-[#828081]" />
              <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">
                {dev.name}
                {dev.note ? <span className="text-xs text-[#828081]"> · {dev.note}</span> : null}
              </span>
              {done ? (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[#0E7A5A]">
                  <CheckIcon className="h-3 w-3" />
                  v1.1
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-[#828081]">
                  <span className="h-2.5 w-2.5 animate-spin rounded-full border-[1.5px] border-[#C9C7BF] border-t-transparent" />
                  同步中
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 text-xs text-[#828081] cq-md:hidden">已同步的行程在无信号路段也能打开</p>
    </div>
  );
}
