'use client';

import { useEffect, useState } from 'react';
import { MenuIcon, XIcon } from '@/components/common/Icons';

/**
 * 顶部公告条 + 导航（.agents/rules/unify-gtm-design-system.md §6）
 *
 * - 公告条在文档流里，随页面滚走；只有导航条吸顶（sticky）。
 * - 导航条底色就是画布纸色（实色，不加模糊）；滚动后底边出现一条发丝线。
 * - 品牌在左，链接紧跟品牌左对齐；右侧：GitHub 文字链 · 竖线 · 次按钮「设计文档」· 主按钮「看演示」。
 * - 手机：品牌 + 主按钮 + 菜单按钮；公告条用短文案，保持一行。
 * 离线单文件样例是支撑能力（PRD-01 §3），不放进导航，只在能力画廊末尾的支撑能力条里提供下载。
 */

const REPO = 'https://github.com/JohnMaxwell0123/TripCraft';
const DOCS = `${REPO}/blob/main/docs/product/PRD-01-vision-positioning.md`;

const LINKS = [
  { id: 'demo', label: '旅客流程' },
  { id: 'agency', label: '线路工作室' },
  { id: 'bento', label: '产品能力' },
  { id: 'stories', label: '设计场景' },
  { id: 'foundation', label: '技术底座' },
] as const;

/** 吸顶导航条的高度（与 globals.css 的 scroll-padding-top 一致） */
const NAV_H = 64;

export function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - NAV_H + 1;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(id);
  };

  return (
    <>
      {/* 公告条：单行，随页面滚走 */}
      <div className="relative z-50 flex h-10 items-center justify-center bg-[#241E20] px-5 text-[#DCDCDC]">
        <button type="button" onClick={() => go('demo')} className="inline-flex min-w-0 items-center gap-2 text-sm font-medium hover:text-[#FFFFF9]">
          <span className="truncate">
            <span className="hidden sm:inline">一段对话说清需求：AI 规划自驾，或匹配持证旅行社的线路</span>
            <span className="sm:hidden">对话说需求，自驾或旅行社线路任选</span>
          </span>
          <span aria-hidden className="shrink-0">→</span>
        </button>
      </div>

      {/* 导航条：吸顶，实色纸面 */}
      <header className={`sticky top-0 z-50 bg-[#FFFFF9] transition-shadow duration-300 ${scrolled || open ? 'shadow-[0_1px_0_rgba(36,30,32,0.1)]' : ''}`}>
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-8 px-5 sm:px-8 lg:px-10">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="TripCraft 旅艺 首页"
            className="flex shrink-0 items-center gap-2.5 rounded-[5px] outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[5px] bg-[#241E20] font-serif text-[15px] font-bold text-[#FFFFF9]">旅</span>
            <span className="text-lg font-bold tracking-tight text-[#241E20]">
              TripCraft<span className="ml-1.5 font-serif text-sm font-medium text-[#241E20]/60">旅艺</span>
            </span>
          </a>

          <nav aria-label="主导航" className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => go(l.id)}
                className="rounded-[4px] px-3 py-2 text-[15px] font-medium text-[#241E20] outline-none focus-visible:ring-2 focus-visible:ring-[#FE3C01]"
              >
                <span className="u-link pb-0.5">{l.label}</span>
              </button>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            <a href={REPO} target="_blank" rel="noreferrer" className="hidden text-[15px] font-medium text-[#241E20] xl:inline">
              <span className="u-link pb-0.5">GitHub</span>
            </a>
            <span aria-hidden className="hidden h-5 w-px bg-[#241E20]/15 xl:block" />
            <a href={DOCS} target="_blank" rel="noreferrer" className="u-btn u-btn-secondary hidden sm:inline-flex">
              设计文档
            </a>
            <button type="button" onClick={() => go('demo')} className="u-btn u-btn-primary h-10 px-3.5 sm:h-11 sm:px-4">
              看演示
            </button>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
              className="flex h-10 w-10 items-center justify-center rounded-[5px] text-[#241E20] lg:hidden"
            >
              {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* 手机菜单 */}
        {open ? (
          <nav aria-label="移动端主导航" className="border-t border-[#241E20]/10 bg-[#FFFFF9] px-5 pb-5 pt-2 lg:hidden">
            <ul className="flex flex-col">
              {LINKS.map((l) => (
                <li key={l.id}>
                  <button type="button" onClick={() => go(l.id)} className="flex h-12 w-full items-center text-left text-base font-medium text-[#241E20]">
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <a href={DOCS} target="_blank" rel="noreferrer" className="u-btn u-btn-secondary">
                设计文档
              </a>
              <a href={REPO} target="_blank" rel="noreferrer" className="u-btn u-btn-secondary">
                GitHub
              </a>
            </div>
          </nav>
        ) : null}
      </header>
    </>
  );
}
