'use client';

import { useRef } from 'react';
import { FilmClock, useBoxSize } from '../clock';
import { SyncScene, T } from '../sync/SyncScene';

/** 实验页：阶段 2 的高潮（A7–A11）；画面竖着时用竖屏的线路图（最终 PR 前删除） */
export function ClimaxLab() {
  return (
    <FilmClock duration={T.end}>
      <Frame />
    </FilmClock>
  );
}

function Frame() {
  const ref = useRef<HTMLDivElement>(null);
  const view = useBoxSize(ref);
  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden bg-[#FFFFF9]">
      <SyncScene layout={view.h > view.w ? 'port' : 'land'} view={view} />
    </div>
  );
}
