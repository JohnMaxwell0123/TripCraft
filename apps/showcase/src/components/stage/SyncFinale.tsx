'use client';

import type { ComponentType } from 'react';
import { useStep } from '@/lib/motion';
import { T } from './timeline';
import { Avatar, useProgress, type AvatarTone } from './primitives';
import { CheckIcon, MonitorIcon, SignalSlashIcon, SmartphoneIcon, TabletIcon, type IconProps } from '@/components/common/Icons';

/**
 * 04 幕收束 · 多端同步（PRD-01 支柱 3）
 *
 * 领队确认后的新版本逐台同步到同行人的设备：每一行是谁的哪台设备、现在是哪个版本。
 * 离线可读作为支撑能力，用一句状态说明交代，不单独成幕。
 */

const DEVICES: { Icon: ComponentType<IconProps>; owner: string; tone: AvatarTone; name: string; note?: string }[] = [
  { Icon: MonitorIcon, owner: '我', tone: 'violet', name: '我的电脑', note: '当前设备' },
  { Icon: SmartphoneIcon, owner: '阿杰', tone: 'teal', name: '阿杰的手机' },
  { Icon: TabletIcon, owner: '小雨', tone: 'rose', name: '小雨的平板' },
];

export function DeviceSync() {
  const p = useProgress();
  const synced = useStep(p, T.syncRows);
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-ui-ink">同步</p>
        <span className="text-xs tabular-nums text-ui-ink-3">{synced} / {DEVICES.length} 台已是 v1.1</span>
      </div>
      <ul className="mt-2 flex flex-col gap-1.5">
        {DEVICES.map((dev, i) => {
          const done = synced > i;
          return (
            <li key={dev.name} className="flex h-10 items-center gap-2.5 rounded-ui-ctl bg-ui-sunken px-2.5">
              <Avatar name={dev.owner} tone={dev.tone} size={22} ring={false} />
              <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">
                {dev.name}
                {dev.note ? <span className="text-xs text-ui-ink-3"> · {dev.note}</span> : null}
              </span>
              <dev.Icon className="h-4 w-4 shrink-0 text-ui-ink-3" />
              {done ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-ui-success/10 px-2 text-xs font-medium leading-5 text-ui-success">
                  <CheckIcon className="h-3 w-3" />
                  v1.1
                </span>
              ) : (
                <span className="inline-flex shrink-0 items-center gap-1.5 text-xs text-ui-ink-3">
                  <span className="h-3 w-3 animate-spin rounded-full border-[1.5px] border-ui-line-strong border-t-transparent" />
                  同步中
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 flex items-center gap-1.5 text-xs text-ui-ink-3">
        <SignalSlashIcon className="h-3.5 w-3.5 shrink-0" />
        已同步的行程在无信号路段也能打开
      </p>
    </div>
  );
}
