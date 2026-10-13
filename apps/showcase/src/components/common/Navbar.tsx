'use client';

import { useState, useEffect } from 'react';
import { MenuIcon, XIcon } from '@/components/common/Icons';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      if (id === 'demo') {
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top, behavior: 'smooth' });
      } else {
        const navOffset = typeof window !== 'undefined' && window.innerWidth >= 768 ? 72 : 60;
        const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || mobileMenuOpen
          ? 'bg-paper/90 backdrop-blur-xl border-b border-ink/[0.08] shadow-level-static py-2.5'
          : 'bg-transparent py-3.5 sm:py-4'
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="TripCraft 旅艺 首页"
          className="group flex items-center gap-3 no-underline transition-opacity hover:opacity-90 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 rounded-control px-1"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-control bg-gradient-to-br from-gold via-gold-ink to-ink font-serif text-base font-bold text-paper shadow-level-static ring-1 ring-gold/40 transition-transform duration-300 group-hover:scale-105">
            旅
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
              TripCraft <span className="font-serif font-bold text-gold-ink text-sm">· 旅艺</span>
            </span>
            <span className="hidden text-xs font-medium tracking-wider text-ink-soft sm:inline">
              智能自驾路书协同中枢
            </span>
          </div>
        </a>

        {/* Desktop Navigation links */}
        <nav aria-label="主导航" className="hidden items-center gap-1 lg:gap-2 text-sm font-medium text-ink-soft md:flex">
          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('demo');
            }}
            className="inline-flex min-h-[44px] items-center px-3.5 py-2 rounded-pill transition-colors hover:text-gold-ink hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            故事流视差演进
          </a>
          <a
            href="#bento"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('bento');
            }}
            className="inline-flex min-h-[44px] items-center px-3.5 py-2 rounded-pill transition-colors hover:text-gold-ink hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            全能矩阵画廊
          </a>
          <a
            href="#foundation"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('foundation');
            }}
            className="inline-flex min-h-[44px] items-center px-3.5 py-2 rounded-pill transition-colors hover:text-gold-ink hover:bg-gold/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            技术底座与哲学
          </a>
        </nav>

        {/* Action group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CTA Button */}
          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('demo');
            }}
            className="btn-primary min-h-[44px] px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold"
          >
            <span>体验路书演进</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-bounce">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
            className="flex h-11 w-11 items-center justify-center rounded-pill border border-ink/10 bg-paper/85 text-ink shadow-level-static transition-colors hover:bg-paper hover:text-gold-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60 md:hidden"
          >
            {mobileMenuOpen ? (
              <XIcon className="h-5 w-5" />
            ) : (
              <MenuIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav
          aria-label="移动端主导航"
          className="mx-4 mt-2.5 flex flex-col gap-1 rounded-card border border-ink/10 bg-paper/95 p-3 shadow-level-float backdrop-blur-xl md:hidden animate-fadeIn"
        >
          <a
            href="#demo"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('demo');
            }}
            className="flex min-h-[44px] items-center justify-between rounded-control px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold/10 hover:text-gold-ink"
          >
            <span>故事流视差演进</span>
            <span className="text-xs font-mono text-gold-ink font-bold">01~05</span>
          </a>
          <a
            href="#bento"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('bento');
            }}
            className="flex min-h-[44px] items-center justify-between rounded-control px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold/10 hover:text-gold-ink"
          >
            <span>全能矩阵画廊</span>
            <span className="text-xs text-ink-soft">F-M05~M11</span>
          </a>
          <a
            href="#foundation"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('foundation');
            }}
            className="flex min-h-[44px] items-center justify-between rounded-control px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-gold/10 hover:text-gold-ink"
          >
            <span>技术底座与哲学</span>
            <span className="text-xs font-mono text-ink-soft">ADR / BR-025</span>
          </a>
        </nav>
      )}
    </header>
  );
}
