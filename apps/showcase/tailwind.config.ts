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
      colors: {
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
      },
      fontFamily: {
        serif: ['"Noto Serif SC"', '"Source Han Serif SC"', '"Songti SC"', '"STSong"', '"SimSun"', 'serif'],
        sans: [
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei UI"',
          '"Microsoft YaHei"',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      borderRadius: {
        control: '0.75rem',
        card: '1rem',
        container: '1.5rem',
        pill: '9999px',
        glass: '1.5rem',
      },
      boxShadow: {
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
