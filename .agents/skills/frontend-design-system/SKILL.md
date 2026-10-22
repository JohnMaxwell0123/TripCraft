---
name: frontend-design-system
description: >-
  Use this skill when developing, refactoring, or reviewing frontend UI components, styling, responsive layouts, Tailwind CSS tokens, the two-layer appearance model (unified App tokens + member trip skins), liquid glass on map overlays, or accessibility (WCAG AA & Senior Mode).
---

# 前端设计系统与现代 UI 开发规范 (Frontend Design System)

本 Skill 提供现代前端界面构建、样式系统与视觉质感落地指导，重点覆盖 Tailwind CSS、两层令牌（统一的 App 外观 + 会员行程皮肤）、地图浮层的液态玻璃与全端自适应布局。

---

## 1. 设计令牌 (Design Tokens)：两层

采用 **CSS Custom Properties + Tailwind CSS** 语义化映射。D10 已定（2026-10-22，[docs/09 §9.0](../../../docs/09-visual-design-system.md#90-两层app-外观与行程皮肤)）：**App 不换肤，行程换肤**。

### 1.1 App 外观令牌（所有人相同，不随目的地变化）
取值以 [SHOWCASE §4.1「视窗界面规范」](../../../docs/SHOWCASE-web-design.md#41-共用外壳与应用视窗) 为准（演示站 `apps/showcase/src/app/globals.css`「产品界面令牌」、`tailwind.config.ts` 的 `ui-*` 是参考实现）：
- 外壳 / 面板 / 下沉：`#F3F2EE` / `#FFFFFF` / `#F6F5F1`；文字 `#241E20` · `#5A5557` · `#757072`。
- 品牌橙 `#FE3C01`（12–13px 橙字用 `#C43200`）：路线、发送键、需要注意的信号；主按钮炭黑 `#241E20`，每屏一个。
- 语义色锁定、任何皮肤都不覆盖：成功 `#0E7A5A`；地点类别色 景点 `#6D5BD0` · 自然 `#279656` · 餐饮 `#E26C0A` · 住宿 `#BE3E86` · 交通 `#3A78D2` · 服务区 `#0D8C87`。
- 组件只引用语义令牌，不写死色值；不要按目的地切换 App 的配色。

### 1.2 行程皮肤（会员功能，只挂在行程内容根节点）
五个主题族（[docs/09 §9.2](../../../docs/09-visual-design-system.md#92-五大主题的完整设计)，`themeId` 即 DSL 枚举）：
- **敦煌金** `dunhuang-gold`：主色 `#B8863B`，底 `#F2E8D5`
- **赛博蓝** `cyber-blue`：主色 `#00A3FF`，底 `#0A1628`（深蓝黑，不是纯黑）
- **高原青** `plateau-cyan`：主色 `#1E6F8C`，底 `#EFF6F8`
- **江南翠** `jiangnan-emerald`：主色 `#3E6B5A`，底 `#F5F2EA`
- **冰川银** `glacier-silver`：主色 `#5A6B78`，底 `#F7F9FA`（无法归类时的兜底）

版式（原「流派」，`designSystem` 枚举）对用户只显示中性名称：默认（`apple-glass`）、流光、手账、极简、夜航；主题与版式的组合按 docs/09 §9.1.3 兼容性矩阵拦截。

### 1.3 CSS 变量声明示例
```css
/* App 外观 */
[data-ui] {
  --ui-panel: 255 255 255;
  --ui-ink: 36 30 32;
  --ui-accent: 254 60 1;
}

/* 行程皮肤：缺省回落到 App 外观；只作用于行程页、路书阅读、分享卡片、导出与回忆录 */
.trip-surface { --trip-primary: rgb(var(--ui-accent)); }
.trip-surface[data-trip-theme="dunhuang-gold"] { --trip-primary: #B8863B; --trip-canvas: #F2E8D5; }

/* 长辈模式与高对比压过皮肤 */
.senior-mode .trip-surface { --trip-primary: rgb(var(--ui-accent)); }
```

- 皮肤来自行程 DSL 的 `theme`（[docs/04 §4.6](../../../docs/04-dsl-specification-v1.md#46-theme--视觉主题)），随行程同步；生成后逐项校验对比度（正文 ≥ 4.5:1，长辈模式 ≥ 7:1）。
- 白标路书以旅行社品牌包为准，用户皮肤不覆盖；B 端线路工作室只用 App 外观。

---

## 2. 苹果液态玻璃 (Liquid Glass)：只用于叠在地图上的浮层

App 外观里，**玻璃只用于叠在地图上的浮层**：地图上的日程抽屉、全程概要胶囊、缩放 / 定位按钮、「示意底图」标注、封面与播放器上的浮标。不叠在地图上的弹窗、卡片、表单用实色（`.ui-card` / `.ui-float`）。玻璃是渐进增强：不支持 `backdrop-filter` 或 `prefers-reduced-transparency: reduce` 时退回实色。

### 核心要素三部曲：
1. **背景滤镜模糊**：`backdrop-blur-[20px]`。
2. **轻量透明底色**：亮色白 72%（`bg-white/70`）。
3. **高光反光边框**：`1px` 细边框 + `shadow-[inset_0_1px_0_rgba(255,255,255,0.6)]`。

### 标准 Tailwind 组件类示例：
```tsx
export function MapGlass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-ui-card border border-white/60 bg-white/70 shadow-ui-float backdrop-blur-[20px] supports-[not(backdrop-filter:blur(1px))]:bg-white ${className}`}
    >
      {children}
    </div>
  );
}
```

会员的「流光 / 手账 / 夜航」等版式只在行程皮肤内生效（§1.2），不改变 App 外壳。

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
