---
name: frontend-design-system
description: >-
  Use this skill when developing, refactoring, or reviewing frontend UI components, styling, responsive layouts, Tailwind CSS tokens, Apple-style liquid glass aesthetics, theme switching, or accessibility (WCAG AA & Senior Mode).
---

# 前端设计系统与现代 UI 开发规范 (Frontend Design System)

本 Skill 提供现代前端界面构建、样式系统与视觉质感落地指导，重点覆盖 Tailwind CSS、CSS 变量令牌体系、液态玻璃（Liquid Glass）视觉系统与全端自适应布局。

---

## 1. 设计令牌 (Design Tokens) 与主题体系

采用 **CSS Custom Properties + Tailwind CSS** 语义化映射。

### 1.1 五大核心色彩流转
根据业务场景与地理风貌自适应切换：
- **敦煌金 (Dunhuang Gold)**: 丝路历史、文化石窟、沙漠绿洲。主色：`#D4AF37` / 辅助：`#E6CA65`
- **青甘碧 (Qinggan Emerald)**: 高原湖泊、草原湿地、生态盐湖。主色：`#0E8674` / 辅助：`#2EB89B`
- **雪山银 (Snow Mountain Silver)**: 冰川雪峰、高海拔垭口、纯净极简。主色：`#94A3B8` / 辅助：`#CBD5E1`
- **赛博紫 (Cyber Purple)**: 航天基地、星空观测、未来科技感。主色：`#7C3AED` / 辅助：`#A78BFA`
- **丹霞红 (Danxia Red)**: 丹霞地貌、红色峡谷、戈壁夕阳。主色：`#DC2626` / 辅助：`#F87171`

### 1.2 CSS 变量声明示例
```css
:root {
  --tc-bg: #0a0f1d;
  --tc-surface: rgba(255, 255, 255, 0.06);
  --tc-surface-border: rgba(255, 255, 255, 0.12);
  --tc-text-primary: #f8fafc;
  --tc-text-secondary: #94a3b8;
  --tc-accent: #d4af37;
  --tc-accent-rgb: 212, 175, 55;
}

[data-theme="qinggan"] {
  --tc-accent: #0e8674;
  --tc-accent-rgb: 14, 134, 116;
}
```

---

## 2. 苹果液态玻璃 (Liquid Glass) 样式模式

液态玻璃是高质感自驾路书与 SaaS 工作台的核心视觉基调。

### 核心要素三部曲：
1. **背景滤镜模糊**：`backdrop-blur-md` 或 `backdrop-blur-xl`。
2. **轻量透明底色**：暗色模式采用 `bg-black/30` 或 `bg-slate-900/40`；亮色模式采用 `bg-white/60`。
3. **高光反光边框**：`1px` 细边框，`border border-white/15` 或 `shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]`。

### 标准 Tailwind 组件类示例：
```tsx
export function GlassCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/40 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-cyan-500/10 ${className}`}
    >
      {/* 顶部微高光反光层 */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
      {children}
    </div>
  );
}
```

---

## 3. 多端自适应与车载座舱大屏适配

| 端形态 | 典型视口 | 核心布局策略 |
| :--- | :--- | :--- |
| **手机随身端 (Mobile)** | `390px ~ 430px` | 单列流式、底部固定操作栏（Safe Area）、卡片式折叠、大点击热区（>=44px） |
| **平板沙盘端 (Tablet)** | `768px ~ 1024px` | 双栏分屏（左侧 40% 时间轴日程，右侧 60% 交互地图沙盘）、支持手势拖拽 |
| **桌面专业端 (Desktop)** | `1280px ~ 1920px` | 三栏专业工作台（左侧导航/目录，中间行程编排画布，右侧属性检查器与预案） |
| **车载座舱大屏 (Cockpit)** | `1920x720 / 1920x1080` (横屏) | 极简高对比度、大字体（>=20px）、一键大按钮操作、避免二级弹窗干扰行车 |

---

## 4. 无障碍 (a11y) 与长辈大字模式 (Senior Mode)

1. **色彩对比度**：正文文字与背景对比度必须 `>= 4.5:1`（WCAG AA 标准）。
2. **长辈模式切换**：
   - 根字体升至基准 `18px ~ 20px`。
   - 行间距扩大至 `leading-relaxed` 或 `leading-loose`。
   - 禁用复杂的左右滑动或长按操作，全部改为具备文字说明的大图标按钮。
   - 增加高对比度边框，避免纯依靠微弱半透明色块区分层级。
