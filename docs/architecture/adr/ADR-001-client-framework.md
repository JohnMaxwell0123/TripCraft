# ADR-001 客户端技术路线选择

- **status**: Proposed
- **date**: 2026-10-08
- **背景与约束**：
  TripCraft 包含手机 App (C-MOBILE)、平板沙盘 (C-TABLET)、B 端工作台 (C-CONSOLE) 以及座舱投屏 (C-CABIN)。团队初期研发资源有限，需要兼顾研发效能、多端代码复用与离线 Local-First 性能。关联场景 [S-C01](../../product/PRD-03-scenarios.md#s-c01-ai-对话说清需求形成需求画像)、[S-C04](../../product/PRD-03-scenarios.md#s-c04-断网--无人区离线使用)。
  > 2026-10-17 补充（产品基线 v3）：主线界面新增 AI 对话入口与路径 B 筛选页（分布图滑块、条件方块），桌面 Web 与移动端都需要；自带模型 API 的编排器需在客户端运行（[ADR-009](ADR-009-llm-provider-byok.md)）。本 ADR 的结论不受影响：编排器作为 TypeScript 共享包，可同时运行于 React Native 与 Web。

- **选项对比**：
  - **选项 A：统一跨端混合框架（React Native / Flutter + Web 共享设计内核）**
    - *优点*：单一语言栈（TypeScript/Dart），移动端与平板端可复用 70% 以上业务逻辑与离线数据库封装；生态庞大。
    - *代价*：包体积相对原生偏大，复杂地图渲染手势需桥接原生组件。
    - *风险*：底层引擎跨平台桥接层在极端低性能 Android 手机上可能有轻微掉帧。
  - **选项 B：全原生开发（iOS Swift + Android Kotlin + 独立 Web）**
    - *优点*：性能与座舱互联系统兼容度最高，内存占用最小。
    - *代价*：需同时维护 3 套代码库，研发成本与多人协同沟通成本激增 2.5 倍以上。
    - *风险*：在团队早期导致进度严重拖延，无法按时交付 MVP。
  - **选项 C：纯 PWA / Webview 套壳**
    - *优点*：开发速度最快，全平台一套 Web 代码。
    - *代价*：车载投屏系统交互受限，弱网下离线文件持久化易被手机系统清理机制误删。
    - *风险*：微信与各家宿主环境沙箱策略多变，无法保证稳定的座舱投递体验。

- **评估标准**：多端代码复用率、离线 Local-First 支持成熟度、单人/小团队开发人效。

- **建议决策 (Proposed)**：
  **采纳选项 A**。采用 **React Native + Web 跨端共享方案**。移动端与平板采用 React Native 保持接近原生的触控体验与离线持久化能力；B 端工作台与管理后台采用 React/Next.js；离线快照 (C-SNAPSHOT) 保持零依赖 Vanilla JS。

- **影响**：
  可抽离 `@tripcraft/dsl-core`、`@tripcraft/design-tokens` 与 `@tripcraft/render-engine` 作为 Monorepo 内部共享包；需统一本地存储至成熟跨端库（如 SQLite / OPFS）。

- **重新评估的触发条件**：
  若后续进入座舱车厂 OEM 深度联合研发阶段，或遇到跨端框架无法克服的底层硬件性能瓶颈时重新评估。
