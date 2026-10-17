# TripCraft · 系统架构设计包 (System Architecture Package)

> 本目录归档 TripCraft 系统架构设计规范、领域模型、离线同步机制与技术决策（ARC-01 ~ ARC-10、ADR-001 ~ ADR-010）。设计状态：`Draft v3（按 2026-10-17 产品基线修订，待 owner 评审）`。产品口径以 [PRD-01](../product/PRD-01-vision-positioning.md) 为准。

---

## 1. 架构文档索引与核心职责

| 编号 | 文档标题 | 文件名 | 核心职责与关键输出 |
| :--- | :--- | :--- | :--- |
| **ARC-01** | 系统总体架构 | [`ARC-01-overview.md`](ARC-01-overview.md) | 上下文图、容器架构图（13 个后端模块）、L1–L5 映射、Monorepo 规划、组件实现状态 |
| **ARC-02** | 领域模型与数据架构 | [`ARC-02-domain-data-model.md`](ARC-02-domain-data-model.md) | 25 个核心实体（含需求画像、上架线路、匹配结果、咨询与报价）、ER 图、生命周期、数据归属 |
| **ARC-03** | 离线优先与同步架构 | [`ARC-03-offline-sync.md`](ARC-03-offline-sync.md) | 本地与云端数据放置、降级、TripPatch、冲突解决与时序图 |
| **ARC-04** | 客户端与交付渠道 | [`ARC-04-clients-channels.md`](ARC-04-clients-channels.md) | 客户端矩阵、共享模块、各端路由树（含对话首页、筛选页、线路工作室）、座舱路径 |
| **ARC-05** | 后端与集成架构 | [`ARC-05-backend-integrations.md`](ARC-05-backend-integrations.md) | 13 个后端逻辑模块、领域事件、外部集成（含自带模型服务商）、AI 防幻觉管线 |
| **ARC-06** | 多租户与白标架构 | [`ARC-06-multitenancy-whitelabel.md`](ARC-06-multitenancy-whitelabel.md) | 租户模型、RBAC、白标与域名、资源库分级、资质准入 |
| **ARC-07** | 安全、隐私与合规 | [`ARC-07-security-privacy-compliance.md`](ARC-07-security-privacy-compliance.md) | 数据分级（含自带 Key、需求画像、咨询报价）、威胁矩阵、合规对照（待律师核验项） |
| **ARC-08** | 非功能需求与拓扑 | [`ARC-08-nfr-deployment-cost.md`](ARC-08-nfr-deployment-cost.md) | NFR 指标（Proposed）、部署拓扑、流量特征与成本驱动 |
| **ARC-09** | 架构决策记录索引 | [`ARC-09-adr-index.md`](ARC-09-adr-index.md) | ADR-001 ~ ADR-010 汇总 |
| **ARC-10** | Web 全功能系统开发设计 | [`ARC-10-web-system-design.md`](ARC-10-web-system-design.md) | Web 端技术架构与实施规格（M01–M14；M15–M18 见文首 v3 对齐说明） |

---

## 2. 架构决策记录清单 (ADR 目录)

详见 [`adr/`](adr/) 子目录：
- [`ADR-001 客户端技术路线选择`](adr/ADR-001-client-framework.md)：React Native + Web 跨端共享方案。
- [`ADR-002 同步与冲突模型选择`](adr/ADR-002-sync-conflict-model.md)：服务端权威版本号 + 领域增量操作日志。
- [`ADR-003 后端服务形态架构`](adr/ADR-003-backend-topology.md)：模块化单体 (Modular Monolith)。
- [`ADR-004 主存储与媒体存储架构`](adr/ADR-004-storage-media.md)：PostgreSQL (JSONB) + S3 兼容对象存储。
- [`ADR-005 地图与路线服务抽象`](adr/ADR-005-map-navigation-abstraction.md)：高德主选 + 百度备选，S-GEO 统一抽象。
- [`ADR-006 离线快照交付格式`](adr/ADR-006-snapshot-delivery-format.md)：导出格式为零依赖单文件 HTML（v3 起为支撑能力）。
- [`ADR-007 多租户隔离方式架构`](adr/ADR-007-multitenancy-isolation.md)：共享数据库 + PostgreSQL 行级安全 (RLS)。
- [`ADR-008 AI 生成管线与防幻觉`](adr/ADR-008-ai-generation-guardrails.md)：结构化反问 + 图商硬校验，v3 起与模型来源无关。
- [`ADR-009 模型接入抽象与自带 API`](adr/ADR-009-llm-provider-byok.md)：自带 Key 只存设备、客户端直连；校验统一在服务端。
- [`ADR-010 旅行社线路匹配评分`](adr/ADR-010-route-matching-scoring.md)：资格硬过滤 + 维度加权评分，可解释、可复现、付费不入分。
