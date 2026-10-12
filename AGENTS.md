# TripCraft · 旅艺 —— 智能体协作与开发指南 (AGENTS.md)

欢迎来到 **TripCraft（旅艺）** 代码仓库。本项目是一套面向自驾与深度游的智能旅行路书协同系统与数字化交付中枢。

---

## 1. 核心铁律与工程基准
所有智能体在生成与重构代码时，必须严格遵守 `docs/00-overview-and-glossary.md` 规定的十大设计铁律：
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
1. **`frontend-design-system`**：Tailwind CSS 规范、五大主题色（敦煌金/青甘碧/雪山银/赛博紫/丹霞红）、液态玻璃质感、多端断点与长辈模式。
2. **`nextjs-react-expert`**：Next.js App Router RSC/Client 边界划分、Suspense 骨架屏、三层状态解耦、Hydration 防御与 CWV 性能优化。
3. **`web-devtools-qa`**：与 `chrome-devtools-mcp` 深度协同的 5 步前端自动化质量审计流。
4. **`local-first-storage`**：Local-First 架构落地、IndexedDB 存储封装、单文件自包含 HTML 快照打包与 AJV Schema 契约校验。
5. **`modern-web-guidance`**（全局插件）：现代 Web 标准最佳实践检索（执行 `npx -y modern-web-guidance@latest search "<query>"`）。
