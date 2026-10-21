'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ease, useFade, useRange, useStep } from '@/lib/motion';
import { T, sec } from './timeline';
import { Avatar, TapCursor, useProgress } from './primitives';
import { btn } from './ui';
import { AlertTriangleIcon, CheckIcon } from '@/components/common/Icons';

/**
 * 04 幕 · 同行人的提名与 AI 评估（docs/15 §15.5「只负责收齐，不负责裁决」）
 *
 * 阿杰提名一个地点并写下理由；AI 只评估代价——顺不顺路、要不要多开车、有没有限高之类的硬约束冲突——
 * 不替大家做决定；由领队确认后才写进行程。
 */

export function NominationCard() {
  const p = useProgress();
  const applied = useStep(p, [T.applyClick]) === 1;
  const press = useRange(p, [T.applyClick - sec(0.12), T.applyClick, T.applyClick + sec(0.12)], [1, 0.96, 1]);

  return (
    <div className="rounded-[12px] border border-[#E2E2D8] bg-white p-3">
      <div className="flex items-center gap-2">
        <Avatar name="阿杰" tone="teal" size={24} />
        <span className="text-[13px] font-medium text-[#241E20]">阿杰</span>
        <span className="text-xs text-[#828081]">提名 · 刚刚</span>
      </div>
      <p className="mt-2 text-[13px] font-semibold text-[#241E20]">正宁路夜市 · 赵记醪糟</p>
      <p className="mt-0.5 text-xs leading-relaxed text-[#625F61]">“离第一晚的酒店走路就到，想带爷爷去喝碗醪糟。”</p>

      <div className="mt-3 border-t border-[#F0EFE9] pt-2">
        <p className="text-xs font-medium text-[#828081]">AI 评估</p>
        <ul className="mt-1 flex flex-col gap-1">
          <EvalRow at={T.evalRows[0]} ok>
            离 D0 酒店步行 950 m，约 12 分钟
          </EvalRow>
          <EvalRow at={T.evalRows[1]} ok>
            不增加车程，不影响次日出发
          </EvalRow>
          <EvalRow at={T.evalRows[2]}>夜市地库限高 2.0 m：车停酒店地面车位</EvalRow>
        </ul>
      </div>

      <div className="mt-3 flex justify-end gap-2">
        {applied ? null : <span className={btn.secondary}>暂不</span>}
        <motion.span
          className={`${applied ? `${btn.secondary} text-[#0E7A5A]` : btn.primary} relative`}
          style={{ scale: press }}
        >
          {applied ? (
            <>
              <CheckIcon className="h-3.5 w-3.5" />
              已加入 D0 晚上
            </>
          ) : (
            '加入 D0 晚上'
          )}
          <TapCursor approach={T.applyCursor} clickAt={T.applyClick} hideAt={T.applyClick + sec(0.5)} className="left-1/2 top-4" />
        </motion.span>
      </div>
    </div>
  );
}

function EvalRow({ at, ok = false, children }: { at: number; ok?: boolean; children: ReactNode }) {
  const p = useProgress();
  const opacity = useFade(p, at, at + sec(0.3));
  const x = useRange(p, [at, at + sec(0.35)], [6, 0], { easing: ease.out, rest: 0 });
  return (
    <motion.li className="flex items-start gap-2 text-xs leading-relaxed text-[#241E20]" style={{ opacity, x }}>
      {ok ? (
        <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0E7A5A]" />
      ) : (
        <AlertTriangleIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#B45309]" />
      )}
      <span className="min-w-0">{children}</span>
    </motion.li>
  );
}
