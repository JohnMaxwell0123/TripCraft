# TripCraft · 系统架构设计包 (System Architecture Package)

> 本目录归档 TripCraft 系统架构设计规范、领域模型、离线同步机制与技术决策（ARC-01 ~ ARC-09）。设计状态：`Draft（agent 起草，待 owner 评审）`。

---

## 1. 架构文档索引与核心职责

| 编号 | 文档标题 | 文件名 | 核心职责与关键输出 |
| :--- | :--- | :--- | :--- |
| **ARC-01** | 系统总体架构 | [`ARC-01-overview.md`](ARC-01-overview.md) | 上下文图、容器架构图、白皮书 L1–L5 映射表、Monorepo 目录规划、组件状态表。 |
| **ARC-02** | 领域模型与数据架构 | [`ARC-02-domain-data-model.md`](ARC-02-domain-data-model.md) | 17 大核心实体清单、ER 图、行程树模型、DSL 契约映射与数据主权划分。 |
| **ARC-03** | 离线优先与同步架构 | [`ARC-03-offline-sync.md`](ARC-03-offline-sync.md) | 本地与云端数据放置、DL0–DL4 降级、TripPatch 补丁分发、冲突解决与时序图。 |
| **ARC-04** | 客户端与交付渠道 | [`ARC-04-clients-channels.md`](ARC-04-clients-channels.md) | 跨端客户端矩阵、共享模块体系、页面路由树、座舱交付三级路径与设备协同。 |
| **ARC-05** | 后端与集成架构 | [`ARC-05-backend-integrations.md`](ARC-05-backend-integrations.md) | 10 大后端逻辑模块职责与能力清单、外部集成矩阵、AI 防幻觉管线。 |
| **ARC-06** | 多租户与白标架构 | [`ARC-06-multitenancy-whitelabel.md`](ARC-06-multitenancy-whitelabel.md) | 租户模型、RBAC 权限矩阵、白标配置与域名策略、资源库分级、资质准入流程。 |
| **ARC-07** | 安全、隐私与合规 | [`ARC-07-security-privacy-compliance.md`](ARC-07-security-privacy-compliance.md) | 六级数据资产分类、威胁与滥用矩阵、隐私设计原则、合规审查清单与应急响应。 |
| **ARC-08** | 非功能需求与拓扑 | [`ARC-08-nfr-deployment-cost.md`](ARC-08-nfr-deployment-cost.md) | 8 大 NFR 指标（Proposed）、云原生部署拓扑、节假日流量特征与成本驱动分析。 |
| **ARC-09** | 架构决策记录索引 | [`ARC-09-adr-index.md`](ARC-09-adr-index.md) | 汇总 ADR-001 ~ ADR-008 技术选型取舍与重新评估触发条件。 |

---

## 2. 架构决策记录清单 (ADR 目录)

详见 [`adr/`](adr/) 子目录：
- [`ADR-001 客户端技术路线选择`](adr/ADR-001-client-framework.md)：建议采用 React Native + Web 跨端共享方案。
- [`ADR-002 同步与冲突模型选择`](adr/ADR-002-sync-conflict-model.md)：建议采用服务端权威版本号 + 领域增量操作日志。
- [`ADR-003 后端服务形态架构`](adr/ADR-003-backend-topology.md)：建议采用模块化单体架构 (Modular Monolith)。
- [`ADR-004 主存储与媒体存储架构`](adr/ADR-004-storage-media.md)：建议采用 PostgreSQL (JSONB) + S3 兼容对象存储。
- [`ADR-005 地图与路线服务抽象`](adr/ADR-005-map-navigation-abstraction.md)：建议采用高德主选 + 百度备选，S-GEO 统一抽象隔离。
- [`ADR-006 离线快照交付格式`](adr/ADR-006-snapshot-delivery-format.md)：建议将零依赖自包含单文件 HTML 作为一等公民交付形态。
- [`ADR-007 多租户隔离方式架构`](adr/ADR-007-multitenancy-isolation.md)：建议采用共享数据库 + PostgreSQL 行级安全 (RLS)。
- [`ADR-008 AI 生成管线与防幻觉`](adr/ADR-008-ai-generation-guardrails.md)：建议采用结构化反问 + 图商硬校验确定性防护管线。
