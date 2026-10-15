'use client';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDemo = () => {
    const el = document.getElementById('demo');
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative bg-[#FFFFF9] border-t border-[#241E20]/[0.08] pt-12 pb-10 sm:pt-20 sm:pb-14 text-left">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-8">
        {/* Top Call-to-action Banner (Unify 'From prompt to pipeline' style) */}
        <div className="relative overflow-hidden rounded-[16px] bg-[#241E20] text-[#FFFFF9] p-8 sm:p-14 text-center shadow-2xl">
          {/* Subtle Orange Glow in bottom-right corner (Unify signature aura) */}
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(254,60,1,0.22),transparent_70%)] blur-2xl"
          />

          <span className="unify-pill-badge bg-white/10 border-white/20 text-white/90 text-xs font-mono">
            TripCraft · 旅艺 2.0 · 开源与本地优先
          </span>
          <h2 className="mt-5 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-white leading-tight max-w-2xl mx-auto">
            从一句话诉求，到全地形自驾探险
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-sm sm:text-base text-white/70 leading-relaxed font-normal">
            将每一次出发交托给懂路、懂车、更懂人性的专业自驾协同中枢。
            在万籁俱寂的荒野无人区，守护你的数据主权与出行安全。
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={scrollToDemo}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] bg-[#FFFFF9] px-6 text-sm font-semibold text-[#241E20] hover:bg-white hover:shadow-lg transition-all active:scale-95"
            >
              <span>立即体验五幕长镜头演进</span>
              <span className="text-[#FE3C01]">✦</span>
            </button>
            <a
              href="https://github.com/JohnMaxwell0123/TripCraft"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[6px] border border-white/20 bg-transparent px-6 text-sm font-medium text-white hover:bg-white/10 transition-all active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
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

        {/* Footer Navigation Columns (Unify Mega Footer) */}
        <div className="mt-14 grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {/* Column 1: Brand & Philosophy */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded bg-[#241E20] text-[#FFFFF9] font-serif text-sm font-bold shadow-sm">
                旅
              </div>
              <span className="font-sans font-bold text-base text-[#241E20]">
                TripCraft <span className="font-serif font-normal text-xs text-[#241E20]/60">· 旅艺</span>
              </span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#6E6A67]">
              面向自驾与深度游的智能旅行路书协同系统与数字化交付中枢。
              零构建交付，降级不可耻，白屏才是罪。
            </p>
          </div>

          {/* Column 2: Data Contracts & Specifications */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#241E20]">
              数据契约体系
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#6E6A67]">
              <li>
                <span className="font-mono text-[#241E20]">spec/trip.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-[#241E20]">spec/patch.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-[#241E20]">spec/node.schema.json</span>
              </li>
              <li>
                <span className="font-mono text-[#241E20]">RFC 6902 补丁事务</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Design Tokens & Systems */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#241E20]">
              自驾场景矩阵
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#6E6A67]">
              <li>全家长辈慢行关怀</li>
              <li>高原自驾高程爬升阶梯</li>
              <li>MPV/SUV 带顶箱 2.15m 限高</li>
              <li>微信免登协同愿望池</li>
              <li>无人区断网单文件保活</li>
            </ul>
          </div>

          {/* Column 4: Compliance & Attestation */}
          <div>
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-[#241E20]">
              工程基准与哲学
            </p>
            <ul className="mt-3 space-y-2 text-xs text-[#6E6A67]">
              <li>Local-First 本地优先架构</li>
              <li>IndexedDB 客户端持久化</li>
              <li>三级降级防白屏机制</li>
              <li>零外部依赖静态自包含</li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Back to Top */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between border-t border-[#241E20]/[0.08] pt-6 text-xs text-[#6E6A67] gap-4">
          <p>© 2026 TripCraft (旅艺) 项目团队. 严格遵循开源与本地优先工程规范.</p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 text-[#241E20] hover:text-[#FE3C01] transition-colors font-medium text-xs focus-visible:outline-none"
          >
            <span>返回页面顶部</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </footer>
  );
}
