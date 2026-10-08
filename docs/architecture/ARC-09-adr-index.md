---
id: ARC-09
title: 架构决策记录索引 (ADR Index)
status: Draft（agent 起草，待 owner 评审）
last_updated: 2026-10-08
related: [ARC-01, ARC-03, ARC-05, ARC-07, DLV-03]
sources: [docs/WHITEPAPER.md, docs/01-resilience-and-failover.md]
---

# ARC-09 · 架构决策记录索引 (ADR Index)

> 架构决策记录 (Architectural Decision Records) 遵循附录 A.5 规范，所有建议决策均为 **`Proposed`**，待项目 Owner 审定后固化。

| ADR 编号 | 决策议题 | 建议采纳方案 (Proposed) | 状态 | 核心权衡理由 | 详情文档 |
| :--- | :--- | :--- | :---: | :--- | :--- |
| **ADR-001** | 客户端技术路线选择 | **React Native + Web 跨端共享方案** | Proposed | 兼顾多端 70%+ 代码复用与离线 Local-First 性能，小团队人效最优。 | [`ADR-001-client-framework.md`](adr/ADR-001-client-framework.md) |
| **ADR-002** | 同步与冲突模型选择 | **服务端权威日志 + 语义化操作 + 领队拍板** | Proposed | 增量补丁可压缩打入二维码（≤2KB），不使用复杂不可控的纯数学 CRDT。 | [`ADR-002-sync-conflict-model.md`](adr/ADR-002-sync-conflict-model.md) |
| **ADR-003** | 后端服务形态架构 | **模块化单体架构 (Modular Monolith)** | Proposed | 避免微服务过早优化的分布式与网络运维开销，边界清晰利于未来剥离。 | [`ADR-003-backend-topology.md`](adr/ADR-003-backend-topology.md) |
| **ADR-004** | 主存储与媒体存储架构 | **PostgreSQL (JSONB) + S3 对象存储** | Proposed | 原生支持 DSL 树状检索与行级多租户安全，静态产物与媒体解耦至 CDN。 | [`ADR-004-storage-media.md`](adr/ADR-004-storage-media.md) |
| **ADR-005** | 地图与路线服务抽象 | **高德地图主导 + 百度备选，S-GEO 抽象封装** | Proposed | 坚守中国大陆测绘合规红线与 BR-025 规则，支持座舱主流 Scheme 调起。 | [`ADR-005-map-navigation-abstraction.md`](adr/ADR-005-map-navigation-abstraction.md) |
| **ADR-006** | 离线快照交付格式 | **零外部依赖自包含单文件 HTML (C-SNAPSHOT)** | Proposed | 突破长辈与弱网阻碍，免登录高保真秒开，自包含运行时长久不变质。 | [`ADR-006-snapshot-delivery-format.md`](adr/ADR-006-snapshot-delivery-format.md) |
| **ADR-007** | 多租户隔离方式架构 | **共享数据库 + PostgreSQL 行级安全 (RLS)** | Proposed | 运维成本最低，引擎层强制 `tenant_id` 过滤，物理保障机构私域安全。 | [`ADR-007-multitenancy-isolation.md`](adr/ADR-007-multitenancy-isolation.md) |
| **ADR-008** | AI 生成管线与防幻觉 | **反问澄清 + 图商硬核验 + 待定项 (Tentative) 回显** | Proposed | 杜绝大模型编造野景点与错误营业时间，把好自驾行车安全首道防线。 | [`ADR-008-ai-generation-guardrails.md`](adr/ADR-008-ai-generation-guardrails.md) |
