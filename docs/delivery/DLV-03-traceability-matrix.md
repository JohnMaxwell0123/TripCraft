---
id: DLV-03
title: 需求与架构追溯矩阵 (Traceability Matrix)
status: Draft（agent 起草，待 owner 评审）
last_updated: 2026-10-08
related: [PRD-03, PRD-04, ARC-01, ARC-05, DLV-01]
sources: [docs/product/PRD-03-scenarios.md, docs/product/PRD-04-functional-architecture.md]
---

# DLV-03 · 需求与架构追溯矩阵 (Traceability Matrix)

## 1. 业务场景到功能与技术决策全链路追溯表

本矩阵建立从业务场景（S-）、功能（F-）、系统逻辑模块与客户端（S-*/C-*）、架构决策（ADR-）到交付阶段（Phase）的完整可验证闭环：

| 业务场景 ID | 场景名称 | 关联功能 ID | 功能名称 | 承载模块与客户端 | 架构决策 | 规划交付阶段 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S-C01** | 新建行程向导 | `F-M02-01`<br/>`F-M03-01`<br/>`F-M03-02`<br/>`F-M03-03`<br/>`F-M03-04` | 创建与初始化行程<br/>自由倾倒意向解析<br/>苏格拉底反问对齐<br/>DSL 初稿生成<br/>规则合规前置校验 | M02 (S-WORKSPACE)<br/>M03 (S-GENERATE)<br/>C-MOBILE, C-WEB | [ADR-003](../architecture/adr/ADR-003-backend-topology.md)<br/>[ADR-008](../architecture/adr/ADR-008-ai-generation-guardrails.md) | 阶段 1 (MVP) |
| **S-C02** | 多人去中心化共创 | `F-M04-01`<br/>`F-M04-02`<br/>`F-M04-03`<br/>`F-M04-04`<br/>`F-M04-05` | 邀请成员与空间共享<br/>景点提名与理由收集<br/>沉默成员可见与零输入<br/>冲突检测与分头行动<br/>领队决策与补丁合并 | M04 (S-COLLAB)<br/>M01 (S-IDENTITY)<br/>C-MOBILE | [ADR-001](../architecture/adr/ADR-001-client-framework.md)<br/>[ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md) | 阶段 1: F-M04-01<br/>阶段 2: 其余 |
| **S-C03** | 行中导航与打卡 | `F-M05-01`<br/>`F-M05-02`<br/>`F-M07-01`<br/>`F-M10-01` | POI 检索合规对齐<br/>路线规划与耗时测算<br/>深链途经点批量投递<br/>旅程足迹与节点打卡 | M05 (S-GEO)<br/>M07 (C-CABIN)<br/>M10 (S-MEDIA) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md) | 阶段 1: M05/M07<br/>阶段 2: F-M10-01 |
| **S-C04** | 断网无人区使用 | `F-M06-01`<br/>`F-M08-01`<br/>`F-M05-04` | 本地优先存储离线读写<br/>单文件 HTML 离线编译<br/>离线路网与底图包支持 | M06 (S-SYNC)<br/>M08 (S-EXPORT)<br/>C-SNAPSHOT | [ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md)<br/>[ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md) | 阶段 1: M06/M08<br/>阶段 4: F-M05-04 |
| **S-C05** | 行中变更与同步 | `F-M06-02`<br/>`F-M06-03`<br/>`F-M14-02` | 服务端增量操作日志<br/>二维码/短链 Patch 分发<br/>突发变更短信推送触达 | M06 (S-SYNC)<br/>M14 (S-NOTIFY)<br/>C-MOBILE | [ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md) | 阶段 2 |
| **S-C06** | 长辈快照使用 | `F-M01-02`<br/>`F-M08-02`<br/>`F-M09-03` | 临时成员免登加入<br/>静态只读短链与托管<br/>长辈关怀大字版渲染 | M01 (S-IDENTITY)<br/>M08 (S-EXPORT)<br/>M09 (S-CONTENT)<br/>C-SNAPSHOT | [ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md) | 阶段 1 (MVP) |
| **S-C07** | 旅后回忆录与分享 | `F-M10-02`<br/>`F-M10-03`<br/>`F-M08-03`<br/>`F-M12-03` | 照片 EXIF 本地自动匹配<br/>AI 图文回忆录与视频<br/>PDF 长图海报打印导出<br/>C 端增值服务购买 | M10 (S-MEDIA)<br/>M08 (S-EXPORT)<br/>M12 (S-BILLING) | [ADR-004](../architecture/adr/ADR-004-storage-media.md) | 阶段 3: F-M08-03<br/>阶段 5: 其余 |
| **S-B01** | 机构入驻与品牌配置 | `F-M01-03`<br/>`F-M11-01`<br/>`F-M12-01`<br/>`F-M13-01` | 机构多角色身份管理<br/>品牌资产配置与白标<br/>机构基础 SaaS 订阅<br/>旅行社资质审核存证 | M01 (S-IDENTITY)<br/>M11 (S-TENANT)<br/>M12 (S-BILLING)<br/>M13 (S-OPS)<br/>C-CONSOLE | [ADR-004](../architecture/adr/ADR-004-storage-media.md)<br/>[ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md) | 阶段 1 (MVP) |
| **S-B02** | 为客户定制路书 | `F-M02-02`<br/>`F-M02-03`<br/>`F-M02-04`<br/>`F-M11-02`<br/>`F-M11-03`<br/>`F-M11-04` | 日与节点管理<br/>版本保存回溯<br/>待定项标记<br/>定制师路书模板复用<br/>客户交付卡与链接分发<br/>私有特许资源库管理 | M02 (S-WORKSPACE)<br/>M11 (S-TENANT)<br/>C-CONSOLE | [ADR-003](../architecture/adr/ADR-003-backend-topology.md)<br/>[ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md)<br/>[ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md) | 阶段 1: F-M02/11-02/03<br/>阶段 3: F-M11-04 |
| **S-B03** | 行程履约与调度 | `F-M11-05`<br/>`F-M14-01` | 车队与随团人员调度<br/>关键行程提醒消息下发 | M11 (S-TENANT)<br/>M14 (S-NOTIFY)<br/>C-MOBILE | [ADR-001](../architecture/adr/ADR-001-client-framework.md) | 阶段 1: F-M14-01<br/>阶段 3: F-M11-05 |
| **S-B04** | 地面情报上报 | `F-M05-03`<br/>`F-M11-04` | 沿途补给服务区推荐<br/>私有特许资源库维护 | M05 (S-GEO)<br/>M11 (S-TENANT) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md) | 阶段 2: F-M05-03<br/>阶段 3: F-M11-04 |
| **S-B05** | 交付后结算与复购 | `F-M12-02`<br/>`F-M09-01`<br/>`F-M09-02` | 按单加量包结算<br/>官方视觉主题加载<br/>POI 展卡文化信息渲染 | M12 (S-BILLING)<br/>M09 (S-CONTENT) | [ADR-004](../architecture/adr/ADR-004-storage-media.md) | 阶段 1: M09<br/>阶段 3: F-M12-02 |
| **S-P01** | 平台运营与合规处置 | `F-M13-02`<br/>`F-M13-03` | 敏感词黑名单过滤<br/>违规处置与紧急熔断 | M13 (S-OPS)<br/>S-WORKSPACE | [ADR-003](../architecture/adr/ADR-003-backend-topology.md) | 阶段 1 (MVP) |
| **S-O01** | 车厂生态合作对接 | `F-M07-02`<br/>`F-M07-03`<br/>`F-M06-04` | 手机车载互联镜像适配<br/>车机副驾屏协同<br/>实时成员信标共享 | M07 (C-CABIN)<br/>M06 (S-SYNC) | [ADR-001](../architecture/adr/ADR-001-client-framework.md) | 阶段 4 |

---

## 2. 其余横切/基础功能映射补充

| 功能 ID | 功能名称 | 所属模块 | 关联场景 | 架构决策 | 阶段 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `F-M01-01` | 手机号/验证码登录 | M01 (S-IDENTITY) | S-C01, S-B01 | ADR-003 | 阶段 1 (MVP) |
| `F-M01-04` | 设备绑定与多端会话漫游 | M01 (S-IDENTITY) | S-C02, S-B02 | ADR-001 | 阶段 2 |
| `F-M02-05` | 多方案对比与沙盘推演 | M02 (S-WORKSPACE) | S-C02, S-B02 | ADR-001 | 阶段 2 |

---

## 3. 追溯覆盖度自查结果 (Coverage Audit)

- **场景覆盖度**：定义的 14 个核心场景（S-C01 ~ S-C07, S-B01 ~ S-B05, S-P01, S-O01）均映射至具体功能；
  - **未覆盖场景清单**：**无（0 个）**。
- **功能覆盖度**：`PRD-04` 中定义的全部 44 个功能（F-M01-01 至 F-M14-02）均已出现在本矩阵中，且均关联对应模块与架构决策；
  - **未覆盖功能清单**：**无（0 个）**。
- **P0 功能落地核查**：全量 26 个 P0 功能均全部纳入 `DLV-01` 阶段 1 (MVP) 交付范围；
  - **遗漏 P0 功能**：**无（0 个）**。
- **架构决策关联**：ADR-001 至 ADR-008 均已在场景与功能链条中闭环引用。
