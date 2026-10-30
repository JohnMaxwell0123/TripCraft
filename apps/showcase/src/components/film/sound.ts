'use client';

import { useEffect, useRef } from 'react';
import type { MotionValue } from 'framer-motion';

/**
 * 片子的声音（可选，默认静音，由观众在播放条上打开）：WebAudio 现场合成，不放音频文件，也不涉及曲库授权。
 * 只在正常播放时按片子时间触发；拖动、跳章、暂停时不补放。静音时片子同样成立：声音只给已经在画面里发生的事加一个音。
 */

export type CueKind = 'tick' | 'tone' | 'click' | 'pad' | 'low';

export interface Cue {
  at: number;
  kind: CueKind;
  /** 频率（Hz）；pad 与 low 可给多个音组成和弦 */
  f?: number | readonly number[];
  /** 0–1，整体再乘总音量 */
  gain?: number;
  /** 秒 */
  dur?: number;
}

const MASTER = 0.22;

export class FilmSound {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;

  /** 必须在用户手势里调用（浏览器的自动播放策略） */
  enable() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return false;
      this.ctx = new Ctor();
      const out = this.ctx.createGain();
      out.gain.value = MASTER;
      // 一道柔和的低通，避免合成音发尖
      const lp = this.ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 5200;
      out.connect(lp).connect(this.ctx.destination);
      this.out = out;
    }
    void this.ctx.resume();
    return true;
  }

  disable() {
    void this.ctx?.suspend();
  }

  play(cue: Cue) {
    const ctx = this.ctx;
    const out = this.out;
    if (!ctx || !out || ctx.state !== 'running') return;
    const now = ctx.currentTime + 0.01;
    const freqs = cue.f === undefined ? [] : typeof cue.f === 'number' ? [cue.f] : cue.f;
    const g = cue.gain ?? 1;
    const note = (f: number, type: OscillatorType, attack: number, dur: number, peak: number) => {
      const o = ctx.createOscillator();
      const a = ctx.createGain();
      o.type = type;
      o.frequency.value = f;
      a.gain.setValueAtTime(0.0001, now);
      a.gain.exponentialRampToValueAtTime(peak, now + attack);
      a.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.connect(a).connect(out);
      o.start(now);
      o.stop(now + dur + 0.05);
    };
    switch (cue.kind) {
      case 'tick':
        note(cue.f as number ?? 2400, 'triangle', 0.004, cue.dur ?? 0.06, 0.12 * g);
        break;
      case 'click': {
        // 按下：一个极短的噪声脉冲
        const len = Math.floor(ctx.sampleRate * 0.03);
        const buf = ctx.createBuffer(1, len, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 6);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        const a = ctx.createGain();
        a.gain.value = 0.5 * g;
        src.connect(a).connect(out);
        src.start(now);
        break;
      }
      case 'tone':
        for (const f of freqs) note(f, 'sine', 0.01, cue.dur ?? 0.9, 0.32 * g);
        break;
      case 'pad':
        for (const f of freqs) note(f, 'sine', 0.35, cue.dur ?? 2.6, 0.14 * g);
        break;
      case 'low':
        for (const f of freqs) note(f, 'triangle', 0.04, cue.dur ?? 1.6, 0.26 * g);
        break;
    }
  }
}

/** 正常播放时，每一帧把这一帧跨过的提示音放出来；一帧跨度超过 0.25 秒（拖动、跳章）就不补放 */
export function useCues(t: MotionValue<number>, cues: readonly Cue[], sound: FilmSound | null, on: boolean) {
  const prev = useRef(t.get());
  const list = useRef(cues);
  list.current = cues;
  useEffect(() => {
    prev.current = t.get();
    return t.on('change', (v) => {
      const p = prev.current;
      prev.current = v;
      if (!on || !sound || v <= p || v - p > 0.25) return;
      for (const c of list.current) if (c.at > p && c.at <= v) sound.play(c);
    });
  }, [t, sound, on]);
}

/* ═════════════════════ 音高 ═════════════════════ */

/** 十二平均律：以 A4 = 440Hz 为准，n 是相对 A4 的半音数 */
export const pitch = (n: number) => 440 * Math.pow(2, n / 12);
/** C 大调五声音阶上的几个音（相对 A4 的半音数） */
export const NOTE = { C4: -9, D4: -7, E4: -5, G4: -2, A4: 0, C5: 3, D5: 5, E5: 7, G5: 10, A5: 12, C6: 15, C3: -21, G3: -14, E3: -17 } as const;
