---
description: 前端开发通用工程规范与架构守则（Tailwind CSS / Next.js / TypeScript / 容灾）
globs: ["**/*.tsx", "**/*.ts", "**/*.jsx", "**/*.js", "**/*.css", "**/*.html"]
---

# 前端开发通用工程规范与架构准则

本规范适用于当前项目的所有前端代码编写与重构，必须严格遵守以下原则：

## 1. 核心架构与容灾铁律
- **降级不可耻，白屏才是罪**：所有涉及第三方地图（高德/百度）、外部 API 或网络资源加载处，必须配置超时降级（例如 >3s 优雅降级为离线 SVG 或拓扑卡片列表），严禁未捕获的异常导致页面白屏。
- **拒绝静默失败**：所有 `try/catch` 必须显式处理或上报 ErrorBoundary，严禁空的 `catch {}` 块。
- **DSL 与契约唯一真相源**：涉及路书和核心业务数据时，必须符合 `spec/` 下的 JSON Schema 契约定义，出入库与状态变更需经过校验。
- **数据主权本地优先**：敏感数据（用户身份、本地轨迹、相册照片原图）默认存留在浏览器 IndexedDB，离线可浏览。

## 2. TypeScript 严格规范
- **禁止使用 `any`**：必须显式定义 Interface 或 Type。
- **Props 与 State 明确契约**：React 组件的 Props 必须有详尽的类型声明与默认值。
- **严格判空**：对深层嵌套对象必须使用可选链操作符（`?.`）与空值合并操作符（`??`）。

## 3. 样式与视觉系统（Tailwind CSS + Design Tokens）
- **禁止散落硬编码魔法值**：颜色、圆角、阴影必须使用项目 Tailwind 配置或 CSS 变量（如 `--tc-primary`, `--tc-glass-bg`）。
- **液态玻璃（Liquid Glass）规范**：毛玻璃效果必须配合 `backdrop-blur-*`、微透明背景（如 `bg-white/10` 或 `bg-neutral-900/60`）以及 1px 微微反光边框（`border border-white/15`）。
- **无障碍保障**：文本对比度需满足 WCAG AA 级（>= 4.5:1），交互热区至少 44x44px。

## 4. Next.js / React 渲染规范
- **服务端/客户端边界最小化**：默认采用 Server Components (RSC)，仅交互节点（表单、地图交互、弹窗控制器）使用 `'use client'` 标记并置于叶子节点。
- **严防水合不一致 (Hydration Mismatch)**：客户端特有状态（如 `localStorage`, `window.innerWidth`, 随机数, 日期格式化）必须在 `useEffect` 中挂载或使用安全包裹，禁止在首屏 SSR 中产生客户端不一致。
- **图片优化**：关键视口上方首屏核心大图（LCP 候选）必须标记 `priority`。
