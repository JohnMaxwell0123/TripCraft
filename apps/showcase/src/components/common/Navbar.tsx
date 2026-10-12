'use client';

import { useState, useEffect } from 'react';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

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
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_20px_rgba(15,23,42,0.03)] py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="mx-auto flex max-w-[1240px] items-center justify-between px-4 sm:px-8">
        {/* Brand */}
        <a
          href="#"
          className="group flex items-center gap-3 no-underline transition-opacity hover:opacity-90"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 font-sans text-base font-bold text-white shadow-md ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105">
            旅
          </span>
          <div className="flex flex-col">
            <span className="font-sans text-base font-bold tracking-tight text-ink sm:text-lg">
              TripCraft <span className="font-normal text-ink-soft text-sm">· 旅艺</span>
            </span>
            <span className="hidden text-[10px] font-medium tracking-wider text-ink-soft sm:inline">
              智能自驾路书协同中枢
            </span>
          </div>
        </a>

        {/* Navigation links */}
        <nav className="hidden items-center gap-7 text-sm font-medium text-ink-soft md:flex">
          <button
            onClick={() => scrollToSection('demo')}
            className="transition-colors hover:text-ink"
          >
            故事流视差演进
          </button>
          <button
            onClick={() => scrollToSection('bento')}
            className="transition-colors hover:text-ink"
          >
            全能矩阵画廊
          </button>
          <button
            onClick={() => scrollToSection('foundation')}
            className="transition-colors hover:text-ink"
          >
            技术底座与哲学
          </button>
        </nav>

        {/* Action group */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* CTA Button */}
          <button
            onClick={() => scrollToSection('demo')}
            className="btn-primary min-h-[38px] px-4 py-1.5 text-xs sm:text-sm font-medium"
          >
            <span>体验路书演进</span>
            <span className="animate-bounce">↓</span>
          </button>
        </div>
      </div>
    </header>
  );
}
