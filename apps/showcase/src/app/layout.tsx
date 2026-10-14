import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripCraft · 旅艺 —— 面向自驾与深度游的智能旅行路书协同中枢',
  description:
    '通过故事流视差滚动动画 (Apple Scrollytelling)，生动展示 TripCraft 从用户大白话诉求、AI 深度对谈推演、九天可视化路书渐进生成、三人微信免登协同愿望池、领队一键确认与算法重排，到多端同频车机流转与无人区离线容灾的全流程。',
  keywords: [
    'TripCraft',
    '旅艺',
    '自驾路书',
    'Scrollytelling',
    '视差滚动',
    '智能旅行',
    '甘青大环线',
    '7座豪华MPV',
    '全家自驾关怀',
    '车路云协同',
    '多端实时同频',
    '无人区离线舱',
  ],
  authors: [{ name: 'TripCraft Team' }],
};

export const viewport: Viewport = {
  themeColor: '#F8FAFC',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-lapis/15 selection:text-ink">
        {children}
      </body>
    </html>
  );
}
