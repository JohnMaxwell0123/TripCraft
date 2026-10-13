'use client';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-sand/60 border-t border-ink/[0.08] pt-10 pb-8 sm:pt-16 sm:pb-12 paper-texture">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Top Call-to-action Banner */}
        <div className="glass-strong glass-sheen relative overflow-hidden rounded-container p-6 sm:p-12 text-center shadow-level-float border border-ink/[0.08]">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(184,134,59,0.12),transparent_70%)] blur-2xl"
          />

          <span className="chip rounded-pill bg-gold/15 text-gold-ink font-semibold text-xs ring-1 ring-gold/30">
            开放体验 · 零门槛
          </span>
          <h2 className="mt-4 font-sans text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-ink leading-[1.3]">
            把下一次自驾，交给懂路也懂你的 TripCraft
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-ink-soft leading-relaxed">
            让同行安心、让探索尽兴、让车机与离线无忧。每一本路书，都是一份独一无二的自驾艺术品。
          </p>

          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={() => {
                const el = document.getElementById('demo');
                if (el) {
                  const top = el.getBoundingClientRect().top + window.scrollY;
                  window.scrollTo({ top, behavior: 'smooth' });
                }
              }}
              className="btn-primary min-h-[48px] px-8 text-sm font-semibold"
            >
              <span>立即向上滚动 · 体验路书演进</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="19" x2="12" y2="5" />
                <polyline points="5 12 12 5 19 12" />
              </svg>
            </button>
            <a
              href="https://github.com/JohnMaxwell0123/TripCraft"
              target="_blank"
              rel="noreferrer"
              className="btn-ghost min-h-[48px] px-6 text-sm font-semibold text-ink"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>GitHub 源码仓库</span>
            </a>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="mt-8 sm:mt-14 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & Philosophy */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-control bg-gradient-to-br from-gold via-gold-ink to-ink font-serif text-sm font-bold text-paper shadow-level-static ring-1 ring-gold/40">
                旅
              </span>
              <span className="font-sans text-base font-bold text-ink">TripCraft · 旅艺</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              面向自驾与深度游的智能旅行路书协同系统与数字化交付中枢。
              零构建交付，降级不可耻，白屏才是罪。
            </p>
          </div>

          {/* Column 2: Data Contracts & Specifications */}
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink">
              数据契约规范
            </p>
            <ul className="mt-3 space-y-2 text-xs text-ink-soft">
              <li>
                <span className="font-mono text-ink">spec/trip.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-ink">spec/patch.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-ink">spec/brand.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-ink">spec/node.schema.json</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Design Tokens & Systems */}
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink">
              视觉系统与主题
            </p>
            <ul className="mt-3 space-y-2 text-xs text-ink-soft">
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-gold" /> 敦煌金 (Dunhuang Gold)
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-jade" /> 青甘碧 (Qinggan Jade)
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#8C9DAE]" /> 雪山银 (Snow Mountain)
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-purple-600" /> 赛博紫 (Cyber Violet)
                </span>
              </li>
              <li>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-ochre" /> 丹霞红 (Danxia Ochre)
                </span>
              </li>
            </ul>
          </div>

          {/* Column 4: Compliance & Attestation */}
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-wider text-ink">
              无障碍与数据主权
            </p>
            <ul className="mt-3 space-y-2 text-xs text-ink-soft">
              <li>WCAG AA 无障碍标准</li>
              <li>适老化关怀排期</li>
              <li>Local-First 本地存储</li>
              <li>零依赖静态自包含</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Back to Top */}
        <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-ink/[0.06] pt-6 text-xs text-ink-soft gap-4">
          <p>© 2026 TripCraft (旅艺) 项目团队. 基于开源与专业自驾工程经验构建.</p>
          <button
            onClick={scrollToTop}
            className="min-h-[44px] px-3.5 py-2 flex items-center gap-1.5 text-gold-ink hover:text-gold transition-colors font-semibold rounded-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
          >
            <span>返回页面顶部</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
