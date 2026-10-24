# TripCraft · 交付规划与风险管理包 (Delivery Package)

> 本目录归档 TripCraft 分阶段路线图、项目风险登记册、需求与架构追溯矩阵、假设验证的指标与数据收集方案（DLV-01 ~ DLV-04）。设计状态：`Draft v3（按 2026-10-17 产品基线修订，待 owner 评审）`。

---

## 1. 交付文档索引与核心职责

| 编号 | 文档标题 | 文件名 | 核心职责与关键输出 |
| :--- | :--- | :--- | :--- |
| **DLV-01** | 路线图与 MVP 边界 | [`DLV-01-roadmap-mvp.md`](DLV-01-roadmap-mvp.md) | 阶段 1~5 规划（阶段 1：对话 + 路径 A + 共享同步 + 首批线路上架；阶段 2：路径 B + 线路工作室）、退出标准、Non-Goals、v3 优先级调整记录 |
| **DLV-02** | 项目风险登记册 | [`DLV-02-risk-register.md`](DLV-02-risk-register.md) | 16 条核心风险、概率与影响象限图、缓解措施 |
| **DLV-03** | 需求与架构追溯矩阵 | [`DLV-03-traceability-matrix.md`](DLV-03-traceability-matrix.md) | 场景 (S-) ➔ 功能 (F-) ➔ 模块 ➔ 决策 (ADR-) ➔ 阶段全链路追溯表 |
| **DLV-04** | 假设验证的指标与数据收集方案 | [`DLV-04-metrics-and-data-collection.md`](DLV-04-metrics-and-data-collection.md) | A-19（分享获客）与 A-20（成交服务费）的指标定义、事件清单、隐私与合规做法、建议的通过 / 淘汰标准、阶段 2 上线前的准备清单、试点旅行社访谈提纲 |

---

## 2. 自动化追溯验证工具

- **校验脚本**：[`tools/check-trace.mjs`](../../tools/check-trace.mjs)
- **校验规则**：
  1. `PRD-04` 中定义的所有功能均在 `DLV-03` 追溯矩阵中登记；
  2. 每个业务场景均关联至少 1 个功能；
  3. 全部 P0 功能均纳入 `DLV-01` 阶段 1 或阶段 2；
  4. 文档中引用的 `S- / F- / ADR- / A-` 编号均已合法定义。
- **运行方式**：`npm run check-trace`（已并入 `npm run check` 门禁）。
