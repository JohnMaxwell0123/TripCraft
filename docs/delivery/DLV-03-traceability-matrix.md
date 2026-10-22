---
id: DLV-03
title: 需求与架构追溯矩阵 (Traceability Matrix)
status: Draft v3（按产品基线 PRD-01 v3 修订，待 owner 评审）
last_updated: 2026-10-17
related: [PRD-03, PRD-04, ARC-01, ARC-05, DLV-01]
sources: [docs/product/PRD-03-scenarios.md, docs/product/PRD-04-functional-architecture.md]
---

# DLV-03 · 需求与架构追溯矩阵 (Traceability Matrix)

## 1. 业务场景到功能与技术决策全链路追溯表

本矩阵建立从业务场景、功能、系统逻辑模块与客户端、架构决策到交付阶段的完整闭环。主线场景排在前面：

| 业务场景 ID | 场景名称 | 关联功能 ID | 功能名称 | 承载模块与客户端 | 架构决策 | 规划交付阶段 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **S-C01** | AI 对话与需求画像 | `F-M15-01`<br/>`F-M15-02`<br/>`F-M15-03`<br/>`F-M15-04`<br/>`F-M03-01`<br/>`F-M03-02`<br/>`F-M03-04`<br/>`F-M03-05`<br/>`F-M03-06` | 对话界面与模型选择<br/>自带模型 API<br/>平台模型额度<br/>发送前隐私脱敏<br/>自由倾倒解析<br/>苏格拉底反问<br/>规则合规前置校验<br/>需求画像结构化<br/>路径选择与推荐 | M15 (S-AI)<br/>M03 (S-GENERATE)<br/>C-MOBILE, C-WEB | [ADR-008](../architecture/adr/ADR-008-ai-generation-guardrails.md)<br/>[ADR-009](../architecture/adr/ADR-009-llm-provider-byok.md) | 阶段 1；F-M15-02 阶段 2 |
| **S-C08** | 路径 A：AI 自主规划自驾 | `F-M16-01`<br/>`F-M16-02`<br/>`F-M16-03`<br/>`F-M16-04`<br/>`F-M03-03`<br/>`F-M05-01`<br/>`F-M05-02`<br/>`F-M02-04` | 骨架与分段车程<br/>沿线走廊检索<br/>每日编排求解<br/>节点备选替换<br/>DSL 初稿生成<br/>POI 检索合规对齐<br/>路线规划与耗时<br/>待定项标记 | M16 (S-GENERATE + S-GEO)<br/>M05 (S-GEO)<br/>M02 (S-WORKSPACE) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md)<br/>[ADR-008](../architecture/adr/ADR-008-ai-generation-guardrails.md) | 阶段 1；F-M16-04 阶段 2 |
| **S-C09** | 路径 B：线路匹配、筛选与咨询 | `F-M17-01`<br/>`F-M17-02`<br/>`F-M17-03`<br/>`F-M17-04`<br/>`F-M17-05`<br/>`F-M17-06`<br/>`F-M17-07`<br/>`F-M18-05`<br/>`F-M18-06` | 资格判定与评分<br/>匹配理由与分项<br/>分布图范围滑块<br/>条件方块分面<br/>空结果放宽建议<br/>线路对比<br/>对话筛选联动<br/>自助调整预估价<br/>咨询与报价版本 | M17 (S-MATCH)<br/>M18 (S-CATALOG)<br/>C-MOBILE, C-WEB | [ADR-010](../architecture/adr/ADR-010-route-matching-scoring.md) | 阶段 2 |
| **S-C02** | 多人共享与共创 | `F-M04-01`<br/>`F-M04-02`<br/>`F-M04-03`<br/>`F-M04-04`<br/>`F-M04-05`<br/>`F-M01-04`<br/>`F-M06-02` | 邀请与空间共享<br/>结构化提名<br/>沉默成员可见<br/>冲突检测与分头行动<br/>领队决策合并<br/>设备与多端漫游<br/>服务端增量日志同步 | M04 (S-COLLAB)<br/>M01 (S-IDENTITY)<br/>M06 (S-SYNC)<br/>C-MOBILE, C-TABLET, C-WEB | [ADR-001](../architecture/adr/ADR-001-client-framework.md)<br/>[ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md) | 阶段 1：F-M04-01/02、F-M01-04、F-M06-02<br/>阶段 2：其余 |
| **S-C03** | 行中车机投递与打卡 | `F-M05-01`<br/>`F-M05-02`<br/>`F-M07-01`<br/>`F-M10-01` | POI 检索合规对齐<br/>路线规划与耗时<br/>深链途经点投递<br/>足迹与打卡 | M05 (S-GEO)<br/>M07 (C-CABIN)<br/>M10 (S-MEDIA) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md) | 阶段 1：M05<br/>阶段 3：F-M07-01、F-M10-01 |
| **S-C04** | 断网无人区使用 | `F-M06-01`<br/>`F-M08-01`<br/>`F-M05-04` | 本地优先存储<br/>单文件 HTML 编译<br/>离线路网与底图包 | M06 (S-SYNC)<br/>M08 (S-EXPORT)<br/>C-SNAPSHOT | [ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md)<br/>[ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md) | 阶段 1：F-M06-01<br/>阶段 3：F-M08-01<br/>阶段 4：F-M05-04 |
| **S-C05** | 行中变更与同步 | `F-M06-02`<br/>`F-M06-03`<br/>`F-M14-02` | 服务端增量日志<br/>二维码 Patch 分发<br/>突发变更触达 | M06 (S-SYNC)<br/>M14 (S-NOTIFY) | [ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md) | 阶段 1：F-M06-02<br/>阶段 3：其余 |
| **S-C06** | 长辈使用分享版 | `F-M01-02`<br/>`F-M08-02`<br/>`F-M09-03` | 临时成员加入<br/>只读分享链接<br/>长辈大字版 | M01 (S-IDENTITY)<br/>M08 (S-EXPORT)<br/>M09 (S-CONTENT) | [ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md) | 阶段 1：F-M01-02、F-M09-03<br/>阶段 2：F-M08-02 |
| **S-C07** | 旅后回忆录与分享 | `F-M10-02`<br/>`F-M10-03`<br/>`F-M08-03`<br/>`F-M12-03` | 照片 EXIF 匹配<br/>AI 回忆录与视频<br/>PDF 长图导出<br/>会员个性化服务（回忆录画册） | M10 (S-MEDIA)<br/>M08 (S-EXPORT)<br/>M12 (S-BILLING) | [ADR-004](../architecture/adr/ADR-004-storage-media.md) | 阶段 3：F-M08-03、F-M12-03<br/>阶段 5：其余 |
| **S-C10** | 可分享的个性化路书（传播与获客） | `F-M09-01`<br/>`F-M09-04`<br/>`F-M08-02`<br/>`F-M08-03`<br/>`F-M12-03` | 行程皮肤自动生成<br/>路线动画短视频<br/>只读分享链接<br/>长图海报导出<br/>会员个性化服务 | M09 (S-CONTENT)<br/>M08 (S-EXPORT)<br/>M12 (S-BILLING) | [ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md) | 阶段 2：F-M08-02、F-M09-01<br/>阶段 3：F-M09-04、F-M08-03、F-M12-03 |
| **S-B01** | 机构入驻与资质审核 | `F-M01-03`<br/>`F-M13-01`<br/>`F-M11-01`<br/>`F-M12-01` | 机构多角色管理<br/>资质审核存证<br/>品牌白标配置<br/>工作室订阅 | M01 (S-IDENTITY)<br/>M13 (S-OPS)<br/>M11 (S-TENANT)<br/>M12 (S-BILLING)<br/>C-CONSOLE | [ADR-004](../architecture/adr/ADR-004-storage-media.md)<br/>[ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md) | 阶段 1：F-M01-03、F-M13-01<br/>阶段 2：F-M11-01、F-M12-01 |
| **S-B06** | 旅行社上架线路 | `F-M18-01`<br/>`F-M18-02`<br/>`F-M13-04`<br/>`F-M05-01` | 行程单导入抽取<br/>上架信封与价格规则<br/>线路审核与上架准入<br/>POI 检索合规对齐 | M18 (S-CATALOG)<br/>M13 (S-OPS)<br/>M05 (S-GEO)<br/>C-CONSOLE | [ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md)<br/>[ADR-010](../architecture/adr/ADR-010-route-matching-scoring.md) | 阶段 1 |
| **S-B07** | AI 路书与路线动画 | `F-M18-03`<br/>`F-M18-04`<br/>`F-M09-02`<br/>`F-M11-01` | AI 交互路书<br/>路线动画<br/>POI 展卡渲染<br/>品牌白标 | M18 (S-CATALOG)<br/>M09 (S-CONTENT)<br/>M11 (S-TENANT) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md)<br/>[ADR-008](../architecture/adr/ADR-008-ai-generation-guardrails.md) | 阶段 2 |
| **S-B08** | 回复咨询与透明报价 | `F-M18-06`<br/>`F-M18-07`<br/>`F-M11-03`<br/>`F-M14-01` | 咨询与报价版本<br/>线路数据看板<br/>客户交付卡<br/>关键提醒 | M18 (S-CATALOG)<br/>M11 (S-TENANT)<br/>M14 (S-NOTIFY) | [ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md) | 阶段 2；F-M18-07 阶段 3 |
| **S-B02** | 为自有客户定制路书 | `F-M02-02`<br/>`F-M02-03`<br/>`F-M02-04`<br/>`F-M11-02`<br/>`F-M11-03`<br/>`F-M11-04` | 日与节点管理<br/>版本保存回溯<br/>待定项标记<br/>模板复用<br/>客户交付卡<br/>私有特许资源 | M02 (S-WORKSPACE)<br/>M11 (S-TENANT)<br/>C-CONSOLE | [ADR-003](../architecture/adr/ADR-003-backend-topology.md)<br/>[ADR-006](../architecture/adr/ADR-006-snapshot-delivery-format.md)<br/>[ADR-007](../architecture/adr/ADR-007-multitenancy-isolation.md) | 阶段 1：F-M02<br/>阶段 2：F-M11-02/03<br/>阶段 4：F-M11-04 |
| **S-B03** | 行程履约与调度 | `F-M11-05`<br/>`F-M14-01` | 车队与随团人员调度<br/>关键行程提醒 | M11 (S-TENANT)<br/>M14 (S-NOTIFY)<br/>C-MOBILE | [ADR-001](../architecture/adr/ADR-001-client-framework.md) | 阶段 2：F-M14-01<br/>阶段 4：F-M11-05 |
| **S-B04** | 地面情报上报 | `F-M05-03`<br/>`F-M11-04` | 沿途补给推荐<br/>私有特许资源维护 | M05 (S-GEO)<br/>M11 (S-TENANT) | [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md) | 阶段 3：F-M05-03<br/>阶段 4：F-M11-04 |
| **S-B05** | 交付后结算与复购 | `F-M12-02`<br/>`F-M12-04`<br/>`F-M09-01`<br/>`F-M09-02` | 按单加量结算<br/>成交服务费（以 D6 为前提）<br/>行程皮肤（白标可选官方版式）<br/>POI 展卡 | M12 (S-BILLING)<br/>M09 (S-CONTENT) | [ADR-004](../architecture/adr/ADR-004-storage-media.md) | 阶段 1：F-M09-02<br/>阶段 2：F-M09-01<br/>阶段 3：F-M12-04<br/>阶段 4：F-M12-02 |
| **S-P01** | 平台运营与合规处置 | `F-M13-02`<br/>`F-M13-03` | 敏感词黑名单<br/>违规处置与熔断 | M13 (S-OPS)<br/>S-WORKSPACE | [ADR-003](../architecture/adr/ADR-003-backend-topology.md) | 阶段 1 |
| **S-P02** | 线路审核与匹配规则治理 | `F-M13-04`<br/>`F-M13-02`<br/>`F-M17-01` | 线路审核与上架准入<br/>敏感词黑名单<br/>资格判定与评分 | M13 (S-OPS)<br/>M17 (S-MATCH) | [ADR-010](../architecture/adr/ADR-010-route-matching-scoring.md) | 阶段 1：F-M13-04<br/>阶段 2：F-M17-01 |
| **S-O01** | 车厂生态合作对接 | `F-M07-02`<br/>`F-M07-03`<br/>`F-M06-04` | 车载投屏镜像<br/>车机副驾屏协同<br/>实时成员信标 | M07 (C-CABIN)<br/>M06 (S-SYNC) | [ADR-001](../architecture/adr/ADR-001-client-framework.md) | 阶段 4 |

---

## 2. 其余横切/基础功能映射补充

| 功能 ID | 功能名称 | 所属模块 | 关联场景 | 架构决策 | 阶段 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `F-M01-01` | 手机号/验证码登录 | M01 (S-IDENTITY) | S-C01, S-B01 | ADR-003 | 阶段 1 |
| `F-M02-01` | 创建与初始化行程 | M02 (S-WORKSPACE) | S-C08, S-B02 | ADR-003 | 阶段 1 |
| `F-M02-05` | 多方案对比与沙盘推演 | M02 (S-WORKSPACE) | S-C02, S-B02 | ADR-001 | 阶段 2 |

---

## 3. 追溯覆盖度自查结果 (Coverage Audit)

- **场景覆盖度**：20 个场景（C 端 9 个、B 端 8 个、平台 2 个、生态 1 个）均映射至具体功能；**未覆盖场景：0 个**。
- **功能覆盖度**：`PRD-04` 中定义的全部 78 个功能（M01–M18）均出现在本矩阵中；**未覆盖功能：0 个**。
- **P0 功能落地核查**：全部 P0 功能均纳入 `DLV-01` 阶段 1 或阶段 2；**遗漏：0 个**。
- **架构决策关联**：ADR-001 至 ADR-010 均在场景链条中被引用。
- **校验方式**：以上结论由 [`tools/check-trace.mjs`](../../tools/check-trace.mjs) 自动校验（`npm run check-trace`）。
