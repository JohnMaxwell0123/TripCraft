import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

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
        serif: [
          '"Noto Serif SC"',
          '"Instrument Serif"',
          '"Feature Text"',
          '"Playfair Display"',
          'Georgia',
          'serif',
        ],
        sans: [
          '"Plus Jakarta Sans"',
          '"Inter"',
          '"Saans"',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei UI"',
          'system-ui',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"SF Mono"',
          'Menlo',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        button: '5px',
        control: '5px',
        card: '12px',
        window: '16px',
        container: '16px',
        pill: '100px',
        glass: '12px',
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
  plugins: [],
};

export default config;
