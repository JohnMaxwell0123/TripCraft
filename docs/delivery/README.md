# TripCraft · 交付规划与风险管理包 (Delivery Package)

> 本目录归档 TripCraft 分阶段路线图、项目风险登记册、需求与架构追溯矩阵（DLV-01 ~ DLV-03）。设计状态：`Draft（agent 起草，待 owner 评审）`。

---

## 1. 交付文档索引与核心职责

| 编号 | 文档标题 | 文件名 | 核心职责与关键输出 |
| :--- | :--- | :--- | :--- |
| **DLV-01** | 路线图与 MVP 边界 | [`DLV-01-roadmap-mvp.md`](DLV-01-roadmap-mvp.md) | 阶段 1~5 演进规划、MVP 退出标准（DoD）、前置假设、各阶段“明确不做什么”。 |
| **DLV-02** | 项目风险登记册 | [`DLV-02-risk-register.md`](DLV-02-risk-register.md) | 8 大核心风险条目、概率与影响象限图、前置缓解应对措施、假设台账链接。 |
| **DLV-03** | 需求与架构追溯矩阵 | [`DLV-03-traceability-matrix.md`](DLV-03-traceability-matrix.md) | 场景 (S-) ➔ 功能 (F-) ➔ 模块 (S-/C-) ➔ 决策 (ADR-) ➔ 阶段全链路追溯表。 |

---

## 2. 自动化追溯验证工具

- **校验脚本**：[`tools/check-trace.mjs`](../../tools/check-trace.mjs)
- **校验规则**：
  1. `PRD-04` 中定义的所有功能均在 `DLV-03` 追溯矩阵中登记；
  2. 14 个核心业务场景均关联至少 1 个功能；
  3. 全部 P0 功能均纳入 `DLV-01` 阶段 1 (MVP) 或阶段 2；
  4. 文档中引用的 `S- / F- / ADR- / A-` 编号均已合法定义。
- **运行方式**：`npm run check-trace`（已并入 `npm run check` 门禁）。
