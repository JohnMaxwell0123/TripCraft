import type { Metadata } from 'next';
import { FilmLab } from '@/components/film/lab/FilmLab';

/** 实验页：旅客端演示片「一根线」整片（阶段 3；不进导航，最终 PR 前删除） */
export const metadata: Metadata = { title: '整片 · 一根线', robots: { index: false, follow: false } };

export default function LabFilm() {
  return <FilmLab />;
}
