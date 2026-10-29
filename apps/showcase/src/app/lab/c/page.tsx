import type { Metadata } from 'next';
import { SampleC } from '@/components/film/lab/SampleC';

/** 实验页：方向 C「同一束光」的高潮样片（不进导航，选定方向后删除） */
export const metadata: Metadata = { title: '样片 C · 同一束光', robots: { index: false, follow: false } };

export default function LabC() {
  return <SampleC />;
}
