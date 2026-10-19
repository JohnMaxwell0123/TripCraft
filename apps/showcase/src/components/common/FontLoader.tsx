'use client';

import { useEffect } from 'react';

/**
 * 网络字体的非阻塞加载
 *
 * <head> 里的 <link rel="stylesheet"> 会阻塞首次渲染：fonts.googleapis.com 连不上时（中国大陆常见），
 * 整页会白屏到请求超时为止——违反「降级不可耻，白屏才是罪」。这里改为挂载后再插入样式表：
 * 先用系统字体渲染，网络字体到了再替换（font-display: swap）；加载失败只记一条警告，继续用系统字体。
 */
const FONT_CSS =
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap';

export function FontLoader() {
  useEffect(() => {
    if (document.querySelector('link[data-tc-fonts]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_CSS;
    link.dataset.tcFonts = '1';
    link.onerror = () => console.warn('[TripCraft] 网络字体加载失败，继续使用系统字体');
    document.head.appendChild(link);
  }, []);
  return null;
}
