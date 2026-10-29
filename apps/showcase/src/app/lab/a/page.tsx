import type { Metadata } from 'next';
import { SampleA } from '@/components/film/lab/SampleA';

/** 实验页：方向 A「一根线」的高潮样片（不进导航，选定方向后删除） */
export const metadata: Metadata = { title: '样片 A · 一根线', robots: { index: false, follow: false } };

export default function LabA() {
  return <SampleA />;
}
