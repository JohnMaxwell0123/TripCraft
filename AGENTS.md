# TripCraft · 旅艺 —— 智能体协作与开发指南 (AGENTS.md)

欢迎来到 **TripCraft（旅艺）** 代码仓库。本项目是一款**多端同步、多人共享的 AI 旅行规划 App**：用户通过 AI 对话（平台模型或自带 API）说清需求，系统追问并提取需求画像，然后 **路径 A** 由 AI 自主规划自驾路线，或 **路径 B** 匹配持证旅行社的线路（匹配度 + 带分布图滑块的筛选页）；同时为旅行社提供线路上架、AI 路书与路线动画、透明报价的**线路工作室**。

---

## 0. 产品口径（先读这一条）
- **产品基线**：[`docs/product/PRD-01-vision-positioning.md`](docs/product/PRD-01-vision-positioning.md)（v3，2026-10-17）是全仓库产品口径的唯一基准。文档冲突时按其 §0 的优先级裁决：PRD-01 > PRD-02~05 > ARC/ADR > DLV > 执行全书 `docs/00`~`docs/17` > WHITEPAPER 与根目录历史任务书。
- **主线专项**：对话、需求画像、双路径与筛选页见 [`docs/16`](docs/16-planning-paths-and-route-matching.md)；旅行社线路工作室见 [`docs/17`](docs/17-agency-route-studio.md)。
- **支撑能力**：离线单文件导出、车机投递、白标交付、旅后回忆录保留原设计，但排期在主线之后（[`DLV-01`](docs/delivery/DLV-01-roadmap-mvp.md)），不要在新代码或文案里把它们写成产品主卖点。
- **修改产品文档时**：新增场景 / 功能 / 假设须同步 PRD-03、PRD-04、DLV-01、DLV-03、ASSUMPTIONS，并通过 `npm run check`（含 `check-trace` 追溯校验）。
- **产品 UI 视觉体系已定（D10，2026-10-22）**：App 外观统一，按 [SHOWCASE §4.1「视窗界面规范」](docs/SHOWCASE-web-design.md#41-共用外壳与应用视窗)（暖白 · 品牌橙，玻璃只用于叠在地图上的浮层），不随目的地换色。`docs/09` 的五主题 × 版式是**「行程皮肤」**：按路线生成，只作用于行程页、路书阅读、分享卡片、导出与回忆录；AI 自动生成的一套对所有人免费（可分享的个性化路书是获客入口），手动定制等深度个性化是会员服务（[docs/09 §9.0](docs/09-visual-design-system.md#90-两层app-外观与行程皮肤)，PRD-01 D9）。不要再把目的地主题写成 App 的默认外观。Unify GTM 只约束 `apps/showcase` 的营销页面。

---

## 1. 核心铁律与工程基准
所有智能体在生成与重构代码时，必须严格遵守 `docs/00-overview-and-glossary.md` 规定的十条设计铁律（及其 §0.2 适用边界表）。以下是与前端代码最相关的五条：
1. **零构建交付**：离线单文件路书产物必须自包含，双击秒开，严禁依赖运行时外部拉取。
2. **降级不可耻，白屏才是罪**：地图 SDK/网络加载失败时，必须优雅降级为静态 SVG 或节点卡片，严禁白屏。
3. **数据主权本地化**：用户隐私轨迹、身份证信息及相册照片默认保存在浏览器端 IndexedDB，计算在 Web Worker 进行。
4. **DSL 是唯一真相源**：所有表单操作均操作符合 `spec/trip.schema.json` 的 AST，并通过 AJV 严格校验。
5. **拒绝静默失败**：所有异常必须经过 ErrorBoundary 捕获，严禁空 catch。

---

## 2. 前端技术栈 (Web Platform)
- **主框架**：Next.js 14+ (App Router), React 18/19, TypeScript
- **样式与视觉**：Tailwind CSS 3.4+, 原生 CSS 变量令牌 (Design Tokens), 苹果液态玻璃 (Liquid Glass)
- **状态管理**：
  - 瞬时 UI 状态：`Zustand`
  - 异步服务端缓存：`@tanstack/react-query`
  - 本地离线持久化：`idb` (IndexedDB)
- **数据契约**：`spec/trip.schema.json`, `spec/patch.schema.json` (AJV 2020-12 校验)

---

## 3. 本地专属配置的 MCP Servers 与 Skills

### 已就绪的 MCP Servers (配置在 `~/.gemini/config/mcp_config.json`)
- **`chrome-devtools-mcp`**：浏览器真机联调神器，支持控制台错误提取 (`list_console_messages`)、视口截图 (`take_screenshot`)、网络瀑布流 (`list_network_requests`) 及 Lighthouse 性能与无障碍体检 (`lighthouse_audit`)。
- **`mobbin`**：业界前沿移动端与 Web 界面 UI/UX 设计模式灵感库。
- **`sequential-thinking`**：复杂前端架构与算法深度推演引擎。
- **`github-mcp-server`**：GitHub 仓库与 Issue/PR 联动。

### 本地工程生效的 Skills (位于 `.agents/skills/`)
1. **`frontend-design-system`**：Tailwind CSS 规范、两层令牌（统一的 App 外观 + 行程皮肤的五个主题族：敦煌金/赛博蓝/高原青/江南翠/冰川银）、地图浮层的液态玻璃、多端断点与长辈模式。
2. **`nextjs-react-expert`**：Next.js App Router RSC/Client 边界划分、Suspense 骨架屏、三层状态解耦、Hydration 防御与 CWV 性能优化。
3. **`web-devtools-qa`**：与 `chrome-devtools-mcp` 深度协同的 5 步前端自动化质量审计流。
4. **`local-first-storage`**：Local-First 架构落地、IndexedDB 存储封装、单文件自包含 HTML 快照打包与 AJV Schema 契约校验。
5. **`modern-web-guidance`**（全局插件）：现代 Web 标准最佳实践检索（执行 `npx -y modern-web-guidance@latest search "<query>"`）。
