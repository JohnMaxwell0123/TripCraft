import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TripCraft · 旅艺 —— 多端同步、多人共享的 AI 旅行规划 App',
  description:
    '用对话说清需求：AI 追问并整理成需求画像，再为你规划自驾路线，或匹配持证旅行社的线路；行程空间里全家一起商量，手机、平板、电脑实时同步。旅行社可在线路工作室上架线路、生成 AI 路书与路线动画、透明报价。',
  keywords: [
    'TripCraft',
    '旅艺',
    'AI 旅行规划',
    '自驾路线规划',
    '旅行社线路匹配',
    '需求画像',
    '多人共享行程',
    '多端同步',
    '旅行社线路工作室',
    'AI 路书',
    '路线动画',
    '透明报价',
  ],
  authors: [{ name: 'TripCraft Team' }],
  icons: {
    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="%23241E20"/><text x="16" y="22.5" font-size="18" font-family="serif" font-weight="bold" text-anchor="middle" fill="%23FFFFF9">旅</text></svg>',
  },
};

export const viewport: Viewport = {
  themeColor: '#FFFFF9',
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
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased selection:bg-charcoal selection:text-canvas">
        {children}
      </body>
    </html>
  );
}
