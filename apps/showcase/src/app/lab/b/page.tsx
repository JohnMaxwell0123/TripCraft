import type { Metadata } from 'next';
import { SampleB } from '@/components/film/lab/SampleB';

/** 实验页：方向 B「一句话」的高潮样片（不进导航，选定方向后删除） */
export const metadata: Metadata = { title: '样片 B · 一句话', robots: { index: false, follow: false } };

export default function LabB() {
  return <SampleB />;
}
