---
name: web-devtools-qa
description: >-
  Use this skill to perform automated frontend quality assurance, visual regression checks, console error inspection, responsive breakpoint verification, and Lighthouse audits using Chrome DevTools MCP.
---

# Web 前端质量审计与浏览器联调规范 (Web DevTools QA)

本 Skill 指引 AI 智能体配合项目已配置的 **Chrome DevTools MCP (`chrome-devtools-mcp`)**，对前端页面进行自动化真机视口联调、控制台排错、网络瀑布流分析与 Lighthouse 综合审计。

---

## 1. 自动化质量审查标准 SOP

当开发完成新页面或对组件进行重大重构后，应按照以下 5 个步骤执行自动化质量核验：

### 步骤 1：本地服务与页面导航
1. 确保本地前端服务已启动（例如 `http://localhost:3000`）。
2. 调用 `navigate_page` 导航到待测页面：
   - 检查 HTTP 状态码与页面标题，确保无 404 / 500 崩溃。

### 步骤 2：多设备响应式视口截图核验 (Visual Inspection)
调用 `resize_page` 与 `take_screenshot` 对不同端视口进行截图并检查排版：
- **手机端 (Mobile)**：宽度 `390px`，高度 `844px`（模拟 iPhone 14/15 视口，检查单列流、底部安全区与无横向溢出滚动）。
- **平板端 (Tablet)**：宽度 `768px` 或 `1024px`，高度 `1024px`（检查双栏拆分、地图沙盘与时间轴是否正常协调）。
- **桌面端 (Desktop)**：宽度 `1440px`，高度 `900px`（检查三栏工作台与大屏排版）。
- **车载大屏 (Cockpit)**：宽度 `1920px`，高度 `720px`（横屏长条视口，检查大字模式与关键信息可见性）。

### 步骤 3：控制台异常与网络瀑布流巡检
1. 调用 `list_console_messages`：
   - **零报错准则**：必须保证 0 处未捕获的 Uncaught Error，无 React Hydration Mismatch 警告，无缺少 key 的数组渲染警告。
2. 调用 `list_network_requests`：
   - 检查是否存在失败（Status >= 400）的静态资源或 API 请求。
   - 检查是否存在体积过大（未压缩）的图片或阻塞性 JS chunk。

### 步骤 4：核心交互行为验证
- 若页面包含核心按钮或表单：
  - 调用 `click`、`fill`、`press_key` 模拟用户交互。
  - 验证弹窗是否正确弹出、Tab 是否平滑切换、地图标点是否触发信息卡片展开。

### 步骤 5：Lighthouse 性能与无障碍审计
调用 `lighthouse_audit` 生成完整体检报告：
- **Performance (性能)**：目标 `>= 85` 分。
- **Accessibility (无障碍)**：目标 `>= 90` 分（检查颜色对比度、aria 属性、表单标签）。
- **Best Practices (最佳实践)**：目标 `>= 90` 分（检查 HTTPS、控制台日志、现代 API）。
- **SEO (搜索引擎优化)**：目标 `100` 分（检查 title, description, viewport, og 标签）。

---

## 2. 常见问题排查命令备查清单

| 异常现象 | 诊断动作 | 解决思路 |
| :--- | :--- | :--- |
| 移动端横向出现多余空白滚动条 | 调用 `get_css_styles` 检查 `body` 及根节点宽度 | 查找缺少 `overflow-hidden` 或固定宽度超过 100vw 的子元素 |
| 按钮点击无效或被遮挡 | 调用 `take_snapshot` 检查 DOM 树与 z-index | 检查悬浮层（Overlay）是否缺少 `pointer-events-none` |
| 第三方地图加载超时白屏 | 检查 Console 日志是否抛出外部 SDK 跨域或网络错误 | 触发兜底机制，切换为静态 SVG 或预渲染卡片 |
