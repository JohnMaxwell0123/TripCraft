import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';
import plugin from 'tailwindcss/plugin';

/**
 * 设计令牌映射：全部颜色走 CSS 变量（见 src/app/globals.css），
 * 使白标换肤 / 动态主题只需切换变量，不改组件。
 */
const withVar = (name: string) => `rgb(var(${name}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '420px',
      },
      maxWidth: {
        content: '1200px',
      },
      colors: {
        // Unify GTM 官方核心语义色彩
        canvas: '#FFFFF9',
        module: '#F4F4EE',
        charcoal: '#241E20',
        muted: '#625F61',
        caption: '#828081',
        flame: {
          DEFAULT: '#FE3C01',
          hover: '#E03500',
          subtle: 'rgba(254, 60, 1, 0.08)',
          glow: 'rgba(254, 60, 1, 0.28)',
        },
        hairline: {
          DEFAULT: '#E2E2D8',
          subtle: '#E5E5E0',
          dark: 'rgba(255, 255, 249, 0.12)',
        },
        // TripCraft 主题与 CSS 变量系统（对齐暖调基座）
        sand: withVar('--tc-sand'),
        paper: withVar('--tc-paper'),
        ink: withVar('--tc-ink'),
        'ink-soft': withVar('--tc-ink-soft'),
        gold: withVar('--tc-gold'),
        'gold-ink': withVar('--tc-gold-ink'),
        lapis: withVar('--tc-lapis'),
        'lapis-deep': withVar('--tc-lapis-deep'),
        ochre: withVar('--tc-ochre'),
        jade: withVar('--tc-jade'),
        amber: {
          ...colors.amber,
          DEFAULT: withVar('--tc-amber'),
        },
        dusk: withVar('--tc-dusk'),
        accent: withVar('--tc-accent'),
        // 演示舞台应用视窗内的产品界面令牌（globals.css「产品界面令牌」；data-ui 切换视觉方向）
        ui: {
          shell: withVar('--ui-shell'),
          panel: withVar('--ui-panel'),
          surface: withVar('--ui-surface'),
          sunken: withVar('--ui-sunken'),
          line: withVar('--ui-line'),
          'line-strong': withVar('--ui-line-strong'),
          ink: withVar('--ui-ink'),
          'ink-2': withVar('--ui-ink-2'),
          'ink-3': withVar('--ui-ink-3'),
          accent: withVar('--ui-accent'),
          'accent-ink': withVar('--ui-accent-ink'),
          primary: withVar('--ui-primary'),
          'on-primary': withVar('--ui-on-primary'),
          signal: withVar('--ui-signal'),
          'signal-ink': withVar('--ui-signal-ink'),
          success: withVar('--ui-success'),
          route: withVar('--ui-route'),
          'bubble-user': withVar('--ui-bubble-user'),
          'on-bubble-user': withVar('--ui-on-bubble-user'),
          'map-land': withVar('--ui-map-land'),
          'map-urban': withVar('--ui-map-urban'),
          'map-water': withVar('--ui-map-water'),
          'map-water-ink': withVar('--ui-map-water-ink'),
          'map-green': withVar('--ui-map-green'),
          'map-green-ink': withVar('--ui-map-green-ink'),
          'map-road': withVar('--ui-map-road'),
          'map-casing': withVar('--ui-map-casing'),
          'map-highway': withVar('--ui-map-highway'),
          'map-highway-casing': withVar('--ui-map-highway-casing'),
          'cat-sight': withVar('--ui-cat-sight'),
          'cat-nature': withVar('--ui-cat-nature'),
          'cat-food': withVar('--ui-cat-food'),
          'cat-stay': withVar('--ui-cat-stay'),
          'cat-transport': withVar('--ui-cat-transport'),
          'cat-service': withVar('--ui-cat-service'),
        },
        unify: {
          bg: '#FFFFF9',
          text: '#241E20',
          muted: '#625F61',
          orange: '#FE3C01',
          card: '#F4F4EE',
          border: '#E2E2D8',
          'border-strong': '#D0D0C4',
          subtle: 'rgba(36, 30, 32, 0.03)',
        },
      },
      fontFamily: {
        // 衬线展示字：Noto Serif SC（由 FontLoader 非阻塞加载，含与之匹配的拉丁字形）→ 系统宋体 → Georgia
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"Instrument Serif"', 'Georgia', 'serif'],
        // 界面与正文：Plus Jakarta Sans（拉丁）+ 系统中文无衬线
        sans: ['"Plus Jakarta Sans"', '"PingFang SC"', '"HarmonyOS Sans SC"', '"Microsoft YaHei UI"', '"Microsoft YaHei"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
      },
      borderRadius: {
        button: '5px',
        control: '5px',
        card: '12px',
        window: '16px',
        container: '16px',
        pill: '100px',
        glass: '12px',
        'ui-panel': 'var(--ui-r-panel)',
        'ui-card': 'var(--ui-r-card)',
        'ui-ctl': 'var(--ui-r-ctl)',
        'ui-btn': 'var(--ui-r-btn)',
      },
      boxShadow: {
        ambient: '0 4px 20px rgba(0, 0, 0, 0.04)',
        'flame-aura': '0 0 28px rgba(254, 60, 1, 0.28)',
        'level-static': '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.05)',
        'level-hover': '0 10px 25px -5px rgb(15 23 42 / 0.08), 0 8px 10px -6px rgb(15 23 42 / 0.04)',
        'level-float': '0 24px 50px -12px rgb(15 23 42 / 0.16), 0 12px 24px -6px rgb(15 23 42 / 0.08)',
        glass: '0 20px 50px rgb(58 46 31 / 0.08), inset 0 1px 0 rgb(255 255 255 / 0.85)',
        'glass-lg': '0 40px 100px rgb(31 34 48 / 0.16), inset 0 1px 0 rgb(255 255 255 / 0.9)',
        glow: '0 0 0 3px rgb(var(--tc-gold) / 0.22), 0 8px 24px rgb(var(--tc-gold) / 0.35)',
        'glow-sm': '0 0 0 2px rgb(var(--tc-gold) / 0.25)',
        'ui-card': 'var(--ui-shadow-card)',
        'ui-float': 'var(--ui-shadow-float)',
        'ui-pop': 'var(--ui-shadow-pop)',
      },
      keyframes: {
        scanline: { '0%': { transform: 'translateY(0)' }, '100%': { transform: 'translateY(100%)' } },
        breathe: { '0%,100%': { opacity: '0.55' }, '50%': { opacity: '1' } },
        twinkle: { '0%,100%': { opacity: '0.2' }, '50%': { opacity: '0.9' } },
        caret: { '0%,49%': { opacity: '1' }, '50%,100%': { opacity: '0' } },
        radar: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      },
      animation: {
        scanline: 'scanline 1.6s ease-in-out infinite alternate',
        breathe: 'breathe 2.4s ease-in-out infinite',
        twinkle: 'twinkle 3.2s ease-in-out infinite',
        caret: 'caret 1s steps(1) infinite',
        radar: 'radar 2.2s linear infinite',
      },
    },
  },
  plugins: [
    /**
     * 演示舞台的应用视窗按「自身宽度」而不是视口宽度排版：
     * 桌面双栏时视窗只占 8/12 列，堆叠时又占满整行，视口断点无法反映视窗的真实宽度。
     * 视窗根节点声明 container-name: win（见 stage/AppWindow.tsx），子元素用 cq-* 变体响应。
     *   cq-sm ≥ 560px：显示标题栏、图标侧栏与底部状态栏（手机宽度以下为移动端布局）
     *   cq-md ≥ 680px：显示上下文面板，主区可左右分栏
     *   cq-lg ≥ 800px：侧栏显示文字标签
     */
    plugin(({ addVariant }) => {
      addVariant('cq-sm', '@container win (min-width: 560px)');
      addVariant('cq-md', '@container win (min-width: 680px)');
      addVariant('cq-lg', '@container win (min-width: 800px)');
    }),
  ],
};

export default config;
