'use client';

import type { ComponentType, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ease, useFadeStyle, useRange, useStep } from '@/lib/motion';
import { T, sec } from './timeline';
import { Avatar, TapCursor, useProgress } from './primitives';
import { CatTile, btn } from './ui';
import { AlertTriangleIcon, CarIcon, CheckIcon, HeightIcon, WalkIcon, type IconProps } from '@/components/common/Icons';

/**
 * 04 幕 · 同行人的提名与 AI 评估（docs/15 §15.5「只负责收齐，不负责裁决」）
 *
 * 阿杰提名一个地点并写下理由；AI 只评估代价——顺不顺路、要不要多开车、有没有限高之类的硬约束冲突——
 * 不替大家做决定；由领队确认后才写进行程。
 *
 * 导演版（2026-10-29）：宽视窗里领队是在自己的手机上点的（Constellation 的 HeroPhone），视窗（我的电脑）里这张卡
 * 不画光标，按波前到达电脑的时刻变成「已加入」（appliedAt）；手机布局的视窗就是领队的手机，照常有光标。
 */

export function NominationCard({ cursor = true, appliedAt = T.applyClick }: { cursor?: boolean; appliedAt?: number }) {
  const p = useProgress();
  const applied = useStep(p, [appliedAt]) === 1;
  const press = useRange(p, [appliedAt - sec(0.12), appliedAt, appliedAt + sec(0.12)], [1, 0.96, 1]);

  return (
    <div className="ui-card p-3">
      <div className="flex items-center gap-2">
        <Avatar name="阿杰" tone="teal" size={24} ring={false} />
        <span className="text-[13px] font-medium text-ui-ink">阿杰</span>
        <span className="text-xs text-ui-ink-3">提名 · 刚刚</span>
      </div>

      <div className="mt-2.5 flex items-center gap-2.5 rounded-ui-ctl bg-ui-sunken p-2">
        <CatTile cat="food" size={36} className="!bg-ui-surface" />
        <span className="min-w-0">
          <span className="block truncate text-[13px] font-semibold text-ui-ink">正宁路夜市 · 赵记醪糟</span>
          <span className="block truncate text-xs text-ui-ink-3">兰州 · 小吃 · D0 晚上</span>
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-ui-ink-2">“离第一晚的酒店走路就到，想带爷爷去喝碗醪糟。”</p>

      <div className="mt-2.5 border-t border-ui-line pt-2">
        <p className="text-xs font-medium text-ui-ink-3">AI 评估 · 只算代价，不替大家决定</p>
        <ul className="mt-1.5 flex flex-col gap-1.5">
          <EvalRow at={T.evalRows[0]} Icon={WalkIcon} ok>
            离 D0 酒店步行 950 m，约 12 分钟
          </EvalRow>
          <EvalRow at={T.evalRows[1]} Icon={CarIcon} ok>
            不增加车程，不影响次日出发
          </EvalRow>
          <EvalRow at={T.evalRows[2]} Icon={HeightIcon}>
            夜市地库限高 2.0 m：车停酒店地面车位
          </EvalRow>
        </ul>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {applied ? null : <span className={btn.secondary}>暂不</span>}
        <motion.span className={`${applied ? `${btn.secondary} !text-ui-success` : btn.primary} relative`} style={{ scale: press }}>
          {applied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已加入 D0 晚上
            </>
          ) : (
            '加入 D0 晚上'
          )}
          {cursor ? <TapCursor approach={T.applyCursor} clickAt={T.applyClick} hideAt={T.applyClick + sec(0.5)} className="left-1/2 top-4" /> : null}
        </motion.span>
      </div>
    </div>
  );
}

/** 一条评估：左边是这一条在说什么（步行、车程、限高），右边的标记说结论（通过 / 需要注意） */
function EvalRow({ at, Icon, ok = false, children }: { at: number; Icon: ComponentType<IconProps>; ok?: boolean; children: ReactNode }) {
  const p = useProgress();
  const fade = useFadeStyle(p, at, at + sec(0.3));
  const x = useRange(p, [at, at + sec(0.35)], [6, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.li className="flex items-start gap-2 text-xs leading-relaxed text-ui-ink" style={{ ...fade, x }}>
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${ok ? 'bg-ui-success/10 text-ui-success' : 'bg-[#B45309]/10 text-[#B45309]'}`}>
        <Icon className="h-3 w-3" />
      </span>
      <span className="min-w-0 flex-1 pt-px">{children}</span>
      {ok ? <CheckIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-ui-success" /> : <AlertTriangleIcon className="mt-1 h-3.5 w-3.5 shrink-0 text-[#B45309]" />}
    </motion.li>
  );
}
