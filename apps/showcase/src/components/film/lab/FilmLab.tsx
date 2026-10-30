'use client';

import { useRef } from 'react';
import { FilmClock, useBoxSize } from '../clock';
import { FILM_DURATION, TravelerFilm } from '../TravelerFilm';

/** 实验页：整片（阶段 3 逐轮重拍用）；画面竖着时用竖屏的线路图（最终 PR 前删除） */
export function FilmLab() {
  return (
    <FilmClock duration={FILM_DURATION}>
      <Frame />
    </FilmClock>
  );
}

function Frame() {
  const ref = useRef<HTMLDivElement>(null);
  const view = useBoxSize(ref);
  return (
    <div ref={ref} className="fixed inset-0 overflow-hidden bg-[#FFFFF9]">
      <TravelerFilm layout={view.h > view.w ? 'port' : 'land'} view={view} />
    </div>
  );
}
