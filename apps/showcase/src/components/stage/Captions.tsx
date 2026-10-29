'use client';

import { motion } from 'framer-motion';
import { useFadeVisibility, useRange } from '@/lib/motion';
import { useProgress } from './primitives';

/**
 * 字幕：视窗下方一行大白话，说这一拍发生了什么（SHOWCASE §4.1「字幕」）
 *
 * 视窗里的界面字是 12–13px 的产品文字，第一次来的访客不必逐字读；字幕替他们说出这一拍的意思。
 * 一次只有一句，句与句之间交叉淡入；高度固定（桌面一行、手机两行），换句不改版面。
 * 字幕不是界面的一部分：用演示站的排版（炭黑 72%、左侧 1px 烈焰橙竖线），不进视窗。
 */

export interface Cue {
  /** 这一句出现的时刻（全局进度） */
  at: number;
  text: string;
}

/** 交叉淡入的时长（全局进度） */
const XFADE = 0.004;

export function Captions({ cues, className = '' }: { cues: readonly Cue[]; className?: string }) {
  return (
    <div aria-live="off" className={`relative mt-4 flex min-h-[52px] items-start gap-3 sm:min-h-[28px] ${className}`}>
      <span aria-hidden className="mt-[5px] h-[18px] w-px shrink-0 bg-[#FE3C01]" />
      <div className="relative min-w-0 flex-1">
        {cues.map((c, i) => (
          <Line key={c.at} cue={c} next={cues[i + 1]?.at} first={i === 0} />
        ))}
      </div>
    </div>
  );
}

function Line({ cue, next, first }: { cue: Cue; next?: number; first: boolean }) {
  const p = useProgress();
  // 第一句从一开始就在；最后一句停到舞台结束
  const input = [first ? -1 : cue.at - XFADE, first ? -0.5 : cue.at, ...(next !== undefined ? [next - XFADE, next] : [])];
  const output = [0, 1, ...(next !== undefined ? [1, 0] : [])];
  const opacity = useRange(p, input, output);
  const visibility = useFadeVisibility(opacity);
  return (
    <motion.p
      className="absolute inset-x-0 top-0 text-[15px] leading-[1.6] text-[#241E20]/[0.72] sm:text-[17px]"
      style={{ opacity, visibility }}
    >
      {cue.text}
    </motion.p>
  );
}
