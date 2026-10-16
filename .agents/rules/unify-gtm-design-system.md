---
description: Unify GTM Design System 官方设计规范与智能体工程红线
globs: ["apps/showcase/**/*.{tsx,ts,jsx,js,css,html}"]
---

# Unify GTM Design System: Agent System Prompt & Design Specification

> 本规范适用于所有展示层与路书协同工作台的前端 UI 开发，必须严格遵从以下原则。

---

## 1. 核心审美范式 (Core Aesthetic Paradigm)
- **基调 (Tone)**：高奢编辑出版物（Editorial Prestige）与瑞士技术精密网格（Swiss Technical Precision）的交汇。典雅的商业周刊排版风格，融合高性能工业级控制台。
- **画布 (Canvas)**：主要浅色底色必须使用**温润纸张乳白（`#FFFFF9`）**，严禁使用冷调数字纯白（`#FFFFFF`）作为大页面底色。次级卡片/模块采用**亚麻浅石灰（`#F4F4EE`）**。深色对比区与暗黑段落使用**高奢暖炭黑（`#241E20` / `#121212`）**。
- **高能强调色 (Accent)**：**烈焰橙红（`#FE3C01`）**仅用于针对性的高能点测信号：核心关键词放射微光（Headline Aura Glow）、指标计数器、1px 垂直发丝分割线及关键行动指示。**严禁大面积使用烈焰橙填充卡片背景**。
- **发丝结构边框 (Borders)**：纯粹的 1px 机械发丝线（`#E2E2D8` / `#E5E5E0`）。杜绝 2px 粗黑笨重边框或随意散落的魔法描边。
- **环境光弥散阴影 (Shadows)**：仅使用极细腻的环境微高程阴影（`0px 4px 20px rgba(0, 0, 0, 0.04)`）。杜绝厚重黑色投影或卡通描边。

---

## 2. 严格圆角阶梯红线 (Strict Radius Hierarchy)

> ⚠️ **严禁任意混淆圆角规格！**

1. **操作按钮与行动链接 (Buttons & Action Links)**：
   - **严格等于 `rounded-[5px]`**（5px 机械精密圆角）。
   - 🔴 **绝对红线**：严禁在 CTA 按钮上使用 `rounded-full` 胶囊椭圆，严禁使用 `rounded-xl`！
2. **状态胶囊与步进指示器 (Badges, Pills, Step Indicators)**：
   - **严格等于 `rounded-full`**（`100px` 胶囊胶囊药丸圆角），用于分类标签、状态徽标、`1 / 5` 步进计数。
3. **内容卡片与功能模块 (Cards & Modules)**：
   - **严格等于 `rounded-[12px]`**。
4. **对话输入框与模拟窗口外框 (Prompt Input & Window Frames)**：
   - **严格等于 `rounded-[16px]`**。

---

## 3. 排版体系与字体栈 (Typography Rules)
- **展示性标题 (Display Headings: H1, H2)**：
  - 必须采用高对比衬线（Editorial Serif），极度紧凑行高与负字距：
    - `font-family: 'Feature Text', 'Instrument Serif', 'Playfair Display', 'Noto Serif SC', Georgia, serif;`
    - `letter-spacing: -0.04em;`（大标题 -2px ~ -3px 负压缩）
    - `line-height: 1.0 ~ 1.1;`
- **正文、导航与功能操作 (Body, Navigation, Buttons)**：
  - 现代几何无衬线字体（Geometric Grotesque Sans）：
    - `font-family: 'Saans', 'Plus Jakarta Sans', 'Inter', -apple-system, sans-serif;`
    - `letter-spacing: -0.01em;`
- **眉题与遥测数据 (Eyebrows & Telemetry)**：
  - 全大写，Tracking `0.08em ~ 0.1em`，字号 11px ~ 12px，字体使用 monospace / clean sans。
  - 计数器使用等宽字符（`JetBrains Mono`, `SF Mono`, `tabular-nums`）。

---

## 4. 颜色令牌类库 (Tailwind Repository)
- 画布底色：`bg-[#FFFFF9]`
- 模块卡片底色：`bg-[#F4F4EE]`
- 提升层（窗口/输入框）：`bg-[#FFFFFF]`
- 炭黑暗色块：`bg-[#241E20]`
- 主内容文本：`text-[#241E20]`
- 次级说明文本：`text-[#625F61]`
- 弱注/占位符：`text-[#828081]`
- 炭底反白文本：`text-[#FFFFF9]`
- 烈焰主强调：`text-[#FE3C01]`, `bg-[#FE3C01]`
- 1px 发丝边框：`border border-[#E2E2D8]`
- 次级发丝边框：`border border-[#E5E5E0]`
- 垂直烈焰发丝线：`border-l border-[#FE3C01]`

---

## 5. 首屏标题烈焰光晕标准规范 (Hero Flame Aura Pattern)
渲染首屏大标题时，必须将最关键的关键词用烈焰光晕包裹：
```html
<h1 class="text-[48px] sm:text-[60px] lg:text-[70px] font-bold font-serif text-[#241E20] leading-[1.05] tracking-[-0.04em]">
  让每一次自驾出行，<br />
  都成为有温度的
  <span class="relative inline-block text-[#FE3C01]">
    <span class="relative z-10">活路书</span>
    <span class="absolute inset-0 -m-3 bg-[#FE3C01]/25 blur-xl -z-1 rounded-full pointer-events-none"></span>
  </span>
</h1>
```

---

## 6. 绝对否定红线 (Instant Rejection Criteria)
- ❌ **驳回**：CTA 按钮使用 `rounded-full` 或 `rounded-xl`。
- ❌ **驳回**：泛滥的赛博朋克紫/青/粉渐变大面积光晕。
- ❌ **驳回**：全屏冷白 `#F8FAFC` 或纯数字平铺 `#FFFFFF`。
- ❌ **驳回**：通用 SaaS 假大空 3D 黏土小人或低幼卡通矢量插画。
- ❌ **驳回**：2px 粗黑边框新野兽派（Neo-brutalism）。
- ❌ **驳回**：在按钮、输入框、表格数据、导航条上滥用衬线体。
