'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, XIcon } from '@/components/common/Icons';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [productDropdownOpen, setProductDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setProductDropdownOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const navOffset = typeof window !== 'undefined' && window.innerWidth >= 768 ? 80 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleDownloadSample = () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TripCraft · 数字化自驾路书 (出游容灾舱样例)</title>
  <style>
    :root { --sand: #FFFFF9; --ink: #241E20; --accent: #FE3C01; --paper: #FFFFFF; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--sand); color: var(--ink); padding: 32px 20px; }
    .card { background: var(--paper); border: 1px solid rgba(36,30,32,0.1); border-radius: 12px; padding: 28px; max-width: 640px; margin: 0 auto; box-shadow: 0 4px 20px rgba(36,30,32,0.06); }
    h1 { font-size: 24px; font-weight: 700; color: var(--ink); margin-top: 0; font-family: Georgia, serif; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(254,60,1,0.1); color: var(--accent); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .day { border-left: 3px solid var(--accent); padding-left: 14px; margin-bottom: 18px; }
    .tip { background: #faf8f5; border: 1px solid rgba(36,30,32,0.08); border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">✓ TripCraft 出游容灾舱 · 自包含离线保活样例</div>
    <h1>川西大环线 · 7日全地形自驾路书</h1>
    <p style="color: #6E6A67; font-size: 14px;">9 天 1,280 km · 2.15m 限高与高程刚性防御引擎 · AST 状态已封存</p>
    <div class="day">
      <strong>D1 · 成都 ➔ 康定 ➔ 折多山垭口</strong><br>
      <small style="color: #6E6A67;">全车整备 ➔ 2.15m 限高规避 ➔ 4,298m 海拔供氧提醒</small>
    </div>
    <div class="day">
      <strong>D2 · 塔公草原 ➔ 墨石公园 ➔ 八美镇</strong><br>
      <small style="color: #6E6A67;">微信愿望池置顶打卡点 ➔ 暗冰路段雷达预警 ➔ 驻车步行接力</small>
    </div>
    <div class="tip">
      <strong>[风控防御] BR-025 物理规则引擎：</strong>已核验车型外廓与老城地库限高，确保全地形探索安全无虞。
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TripCraft_数字化自驾路书_离线单文件样例.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex flex-col">
      {/* 1. Unify Top Announcement Banner */}
      <div className="w-full bg-[#241E20] text-[#FFFFF9] text-xs py-1.5 px-4 text-center font-medium flex items-center justify-center gap-2 select-none">
        <span className="opacity-90">TripCraft 2.0 · 零构建交付与智能座舱协同系统正式发布</span>
        <button
          type="button"
          onClick={() => scrollToSection('demo')}
          className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:text-[#FE3C01] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#FE3C01]"
        >
          <span>查看视差演进</span>
          <span aria-hidden="true" className="text-xs">→</span>
        </button>
      </div>

      {/* 2. Unify Mega Navbar */}
      <header
        className={`w-full transition-all duration-300 ${
          scrolled || mobileMenuOpen
            ? 'bg-[#FFFFF9]/92 backdrop-blur-md border-b border-[#241E20]/[0.08] shadow-[0_2px_16px_rgba(36,30,32,0.04)] py-3'
            : 'bg-[#FFFFF9]/80 backdrop-blur-sm border-b border-[#241E20]/[0.05] py-3.5'
        }`}
      >
        <div className="mx-auto flex max-w-[1640px] items-center justify-between px-6 sm:px-10 lg:px-12 xl:px-16">
          {/* Brand Wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="TripCraft 旅艺 首页"
            className="group flex items-center gap-2.5 no-underline min-h-[40px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01] rounded px-1"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded bg-[#241E20] text-[#FFFFF9] font-serif text-sm font-bold shadow-sm transition-transform duration-200 group-hover:scale-105">
              旅
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-sans text-lg font-bold tracking-tight text-[#241E20]">
                TripCraft
              </span>
              <span className="font-serif text-xs text-[#241E20]/60 font-medium">
                · 旅艺
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links (Unify Pattern) */}
          <nav aria-label="主导航" className="hidden items-center gap-1 lg:gap-2 text-sm font-medium text-[#241E20] md:flex">
            {/* Product Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setProductDropdownOpen(true)}
              onMouseLeave={() => setProductDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={() => setProductDropdownOpen(!productDropdownOpen)}
                className="inline-flex min-h-[40px] items-center gap-1.5 px-3 py-1.5 rounded text-sm text-[#241E20]/80 hover:text-[#241E20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
              >
                <span>产品体系</span>
                <svg
                  className={`h-3 w-3 transition-transform duration-200 ${productDropdownOpen ? 'rotate-180 text-[#FE3C01]' : 'opacity-60'}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {productDropdownOpen && (
                <div className="absolute left-0 top-full pt-1.5 w-64">
                  <div className="rounded-[8px] bg-[#FFFFFF] border border-[#241E20]/[0.08] p-2 shadow-[0_12px_32px_rgba(36,30,32,0.1)] flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => scrollToSection('demo')}
                      className="flex flex-col items-start p-2 rounded hover:bg-[#241E20]/[0.04] transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-[#241E20]">AI 倾诉对话智能体</span>
                      <span className="text-[11px] text-[#6E6A67]">启发式多轮诉求提取与日程自动编排</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('demo')}
                      className="flex flex-col items-start p-2 rounded hover:bg-[#241E20]/[0.04] transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-[#241E20]">微信全团愿望池</span>
                      <span className="text-[11px] text-[#6E6A67]">免登扫码加入，权重博弈与意图聚合</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('demo')}
                      className="flex flex-col items-start p-2 rounded hover:bg-[#241E20]/[0.04] transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-[#241E20]">2.15m 限高刚性风控</span>
                      <span className="text-[11px] text-[#6E6A67]">MPV/SUV 带行李箱地库物理规则拦截</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollToSection('demo')}
                      className="flex flex-col items-start p-2 rounded hover:bg-[#241E20]/[0.04] transition-colors text-left"
                    >
                      <span className="text-xs font-bold text-[#241E20]">离线单文件安全舱</span>
                      <span className="text-[11px] text-[#6E6A67]">双击秒开自包含 HTML，无人区断网保活</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => scrollToSection('demo')}
              className="inline-flex min-h-[40px] items-center px-3 py-1.5 rounded text-sm text-[#241E20]/80 hover:text-[#241E20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
            >
              车道级领航
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('bento')}
              className="inline-flex min-h-[40px] items-center px-3 py-1.5 rounded text-sm text-[#241E20]/80 hover:text-[#241E20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
            >
              能力矩阵
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('foundation')}
              className="inline-flex min-h-[40px] items-center px-3 py-1.5 rounded text-sm text-[#241E20]/80 hover:text-[#241E20] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
            >
              架构哲学
            </button>
          </nav>

          {/* Action Group (Unify Sign in + CTA) */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('demo')}
              className="hidden lg:inline-flex text-xs font-medium text-[#241E20] hover:text-[#FE3C01] transition-colors underline-offset-4 hover:underline"
            >
              免登协同
            </button>
            <div className="hidden lg:block h-3.5 w-[1px] bg-[#241E20]/15" />
            <button
              type="button"
              onClick={handleDownloadSample}
              className="unify-btn-secondary !min-h-[36px] !py-1.5 !px-3 text-xs hidden sm:inline-flex"
            >
              离线样例
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('demo')}
              className="unify-btn-primary !min-h-[36px] !py-1.5 !px-4 text-xs font-semibold"
            >
              <span>立即体验</span>
              <span className="text-[#FE3C01]">●</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
              className="flex h-9 w-9 items-center justify-center rounded border border-[#241E20]/15 bg-white text-[#241E20] transition-colors md:hidden"
            >
              {mobileMenuOpen ? <XIcon className="h-4 w-4" /> : <MenuIcon className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="移动端主导航"
            className="mx-4 mt-2 flex flex-col gap-1 rounded-[8px] border border-[#241E20]/10 bg-white p-3 shadow-lg md:hidden"
          >
            <button
              type="button"
              onClick={() => scrollToSection('demo')}
              className="flex min-h-[40px] items-center justify-between rounded px-3 py-2 text-sm font-medium text-[#241E20] hover:bg-[#241E20]/[0.04]"
            >
              <span>故事流视差演进</span>
              <span className="text-xs text-[#FE3C01] font-mono">01~05</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('bento')}
              className="flex min-h-[40px] items-center justify-between rounded px-3 py-2 text-sm font-medium text-[#241E20] hover:bg-[#241E20]/[0.04]"
            >
              <span>全能矩阵画廊</span>
              <span className="text-xs text-[#6E6A67]">6大核心能力</span>
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('foundation')}
              className="flex min-h-[40px] items-center justify-between rounded px-3 py-2 text-sm font-medium text-[#241E20] hover:bg-[#241E20]/[0.04]"
            >
              <span>技术底座与哲学</span>
              <span className="text-xs text-[#6E6A67]">工程铁律与契约</span>
            </button>
            <div className="pt-2 border-t border-[#241E20]/10 flex gap-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="w-1/2 unify-btn-secondary !min-h-[36px] !py-1 text-xs"
              >
                离线样例
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('demo')}
                className="w-1/2 unify-btn-primary !min-h-[36px] !py-1 text-xs"
              >
                立即体验
              </button>
            </div>
          </nav>
        )}
      </header>
    </div>
  );
}
