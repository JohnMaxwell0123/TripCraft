import type { Metadata } from 'next';
import { ClimaxLab } from '@/components/film/lab/ClimaxLab';

/** 实验页：方向 A「一根线」的高潮（阶段 2，最终质量；不进导航，最终 PR 前删除） */
export const metadata: Metadata = { title: '高潮 · 一根线', robots: { index: false, follow: false } };

export default function LabClimax() {
  return <ClimaxLab />;
}
