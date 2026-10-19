/**
 * 舞台幕次的进度区间
 *
 * 每个舞台（C 端旅客流程 / B 端旅行社工作室）各有一条全局进度 0 → 1。
 * 幕次按时长比例首尾相接铺满这条线：前一幕的终点就是后一幕的起点，
 * 自动播放跨幕时进度连续，不会出现空档或跳帧；同时「一秒」在任何一幕里都对应同样的进度跨度，
 * primitives 里按进度书写的默认时长（光标淡入、弹出等）在各幕节奏一致。
 */

export type Range = readonly [number, number];

export interface ActTable<K extends string> {
  /** 各幕在全局进度上的区间 */
  acts: Record<K, Range>;
  /** 全部幕次的总时长（毫秒） */
  totalMs: number;
  /** 幕内局部进度 t（0 → 1）换算为全局进度 */
  actAt: (act: K, t: number) => number;
  /** 秒数换算为全局进度跨度 */
  sec: (seconds: number) => number;
}

export function buildActs<K extends string>(order: ReadonlyArray<readonly [K, number]>): ActTable<K> {
  const totalMs = order.reduce((sum, [, ms]) => sum + ms, 0);
  const acts = {} as Record<K, Range>;
  let acc = 0;
  for (const [id, ms] of order) {
    const start = acc / totalMs;
    acc += ms;
    acts[id] = [start, acc / totalMs] as const;
  }
  return {
    acts,
    totalMs,
    actAt: (act, t) => acts[act][0] + (acts[act][1] - acts[act][0]) * t,
    sec: (seconds) => (seconds * 1000) / totalMs,
  };
}
