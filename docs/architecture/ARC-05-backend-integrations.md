---
id: ARC-05
title: 后端与集成架构
status: Draft v3（按产品基线 PRD-01 v3 修订，待 owner 评审）
last_updated: 2026-10-17
related: [PRD-04, ARC-01, ARC-02, ADR-003, ADR-005, ADR-008, ADR-009, ADR-010]
sources: [docs/08-socratic-interaction-design.md, docs/05-compiler-pipeline.md, docs/07-legal-and-compliance.md]
---

# ARC-05 · 后端与集成架构

## 1. 后端逻辑模块清单 (Logical Service Modules)

系统按业务边界划分为 13 个高内聚后端逻辑模块，初期作为模块化单体（Modular Monolith）运行。v3 新增 `S-AI`、`S-MATCH`、`S-CATALOG`（★）：

| 逻辑模块 | 核心职责 | 拥有实体 | 对外能力清单 (动词 + 资源 + 用途) | 上游依赖 | 发布领域事件 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **S-AI** ★ | 平台默认模型网关、额度计量；为客户端编排器提供工具 API 的统一鉴权 | UsageQuota | `CompleteWithPlatformModel` 平台模型调用<br/>`MeterUsage` 额度计量<br/>`IssueToolToken` 签发工具调用凭证 | 外部 LLM | `QuotaExhausted` |
| **S-MATCH** ★ | 资格判定、匹配评分、分面计数与分布图数据（[ADR-010](adr/ADR-010-route-matching-scoring.md)） | MatchResult, 匹配规则版本 | `MatchRoutes` 资格判定与评分<br/>`FacetCounts` 方块计数与价格/天数分布<br/>`RelaxSuggestions` 空结果放宽建议<br/>`RecomputeForAppeal` 申诉复算 | S-CATALOG, S-GENERATE | `MatchRulesPublished` |
| **S-CATALOG** ★ | 线路上架、行程单抽取、AI 路书与动画、咨询与报价版本（[docs/17](../17-agency-route-studio.md)） | RouteListing, PriceRule, ListingOption, Inquiry, QuoteVersion | `ImportItinerary` 导入并抽取行程单<br/>`PublishListing` 提交上架<br/>`EstimatePrice` 计算预估价<br/>`CreateInquiry` 发起咨询<br/>`IssueQuote` 生成报价版本 | S-TENANT, S-GEO, S-AI, S-OPS | `ListingPublished`<br/>`InquiryCreated`<br/>`QuoteIssued`<br/>`QuoteAccepted` |
| **S-IDENTITY** | 用户认证、会话维护与多租户权限校验 | User, Device, Role | `AuthenticateUser` 登录认证<br/>`ValidateSession` 校验会话<br/>`AssignTenantRole` 分配租户角色 | 无 | `UserRegistered`<br/>`SessionExpired` |
| **S-WORKSPACE**| 行程真相源维护、版本演进与草案编辑 | Trip, Day, Node | `CreateTrip` 初始化行程<br/>`UpdateNode` 修改节点时序<br/>`LockTentative` 锁定待定项<br/>`FetchTripDSL` 获取真相源 | S-IDENTITY | `TripCreated`<br/>`TripUpdated`<br/>`TripArchived` |
| **S-GENERATE** | 追问、需求画像抽取、路径 A 编排与校验 | Conversation, RequirementProfile, 提示词模板 | `ParseIntent` 提取特征点<br/>`GenerateClarifyQuestion` 启发式反问<br/>`ValidateProfile` 校验需求画像 ★<br/>`PlanSelfDrive` 路径 A 编排 ★<br/>`ValidateDraft` 校验行程草案 ★ | S-AI, S-GEO | `ProfileConfirmed` ★<br/>`DraftSynthesized` |
| **S-COLLAB** | 团队成员邀请与“只收齐不裁决”意见收集 | Member, Nomination | `JoinTripSpace` 凭口令加入<br/>`SubmitNomination` 提交带理由提名<br/>`AggregatePreferences` 聚合意见清单 | S-WORKSPACE | `MemberJoined`<br/>`NominationReceived`<br/>`ConflictDetected` |
| **S-GEO** | 合规图商 POI 检索、走廊检索、算路耗时预估 | 坐标缓存 | `SearchPOI` 检索标准地名<br/>`SearchAlongRoute` 沿线走廊检索 ★<br/>`EstimateDriveTime` 测算相邻驾车耗时<br/>`BuildDeepLink` 生成座舱深链 | 外部地图服务 | `POIVerified`<br/>`RouteCalculated` |
| **S-SYNC** | 增量操作日志持久化与点对点补丁仲裁 | PendingOp, Revision | `PushOps` 提交离线操作流<br/>`PullDeltas` 拉取增量变更<br/>`BroadcastPatch` 广播熔断补丁 | S-WORKSPACE | `OpsCommitted`<br/>`VersionForkDetected`<br/>`PatchIssued` |
| **S-EXPORT** | 单文件 HTML 离线交付包编译与只读短链托管 | Snapshot | `CompileSingleFileHTML` 打包单文件<br/>`DeploySnapshotCDN` 发布静态托管<br/>`ExportPDF` 生成长图排版 | S-WORKSPACE, S-CONTENT | `SnapshotExported`<br/>`DeliveryReady` |
| **S-TENANT** | B 端机构租户管理、白标品牌物料与特许资源 | Tenant, Brand, Resource | `ConfigureBrand` 配置白标物料<br/>`ManageResource` 维护特许资源<br/>`CloneTemplate` 模板一键复用 | S-IDENTITY | `BrandConfigured`<br/>`ResourceUpdated` |
| **S-BILLING** | 机构 SaaS 订阅扣减、按单加量包与用量清算 | Subscription, Order | `DeductQuota` 扣减路书出单额度<br/>`ProcessOrder` 订单充值结算<br/>`CheckTenantStanding` 检查资信 | 外部支付服务 | `QuotaExhausted`<br/>`SubscriptionRenewed` |
| **S-OPS** | 资质审核合规存证、禁用词扫描与紧急熔断 | Audit, ComplianceRule | `VerifyLicense` 审核旅行社资质<br/>`ScanContentSafety` 敏感词巡检<br/>`FuseKillTrip` 紧急熔断下架 | S-WORKSPACE | `TenantVerified`<br/>`ContentFlagged`<br/>`TripFuseKilled` |

---

## 2. 核心领域事件清单 (Domain Events)

系统采用事件驱动（Event-Driven）解耦跨模块联动：

```mermaid
flowchart LR
    E1["TripUpdated<br/>(行程节点发生变更)"] --> S_SYNC["S-SYNC<br/>(递增版本并广播)"]
    E2["PatchIssued<br/>(领队发布绕行补丁)"] --> S_NOTIFY["S-NOTIFY<br/>(全员推送应急提醒)"]
    E3["SnapshotExported<br/>(路书完成打包)"] --> S_TENANT["S-TENANT<br/>(记录机构出单履历)"]
    E3 --> S_BILLING["S-BILLING<br/>(扣减当月出单额度)"]
    E4["TripFuseKilled<br/>(合规紧急熔断)"] --> S_EXPORT["S-EXPORT<br/>(下线静态托管短链)"]
    E5["ListingPublished<br/>(线路上架或更新)"] --> S_MATCH["S-MATCH<br/>(刷新匹配索引与分面统计)"]
    E6["InquiryCreated / QuoteIssued"] --> S_NOTIFY
    E7["QuoteAccepted<br/>(报价被接受并成交)"] --> S_WS["S-WORKSPACE<br/>(生成白标路书进入旅客行程空间)"]
```

---

## 3. 外部系统集成矩阵 (External Integrations)

| 外部系统 | 业务用途 | 接入方式 | 可替换性 | 核心风险与合规约束 | 关联假设 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **合规商业图商 (高德/百度)** | POI 经纬度对齐、开闭馆时间、驾车耗时预估 | 服务端开放 REST API | **高**（通过 `S-GEO` 抽象层完全隔离） | API 商用授权成本及严禁持久化存储路线 polyline（BR-025） | [A-09](../ASSUMPTIONS.md), [ADR-005](adr/ADR-005-map-navigation-abstraction.md) |
| **车机原生地图** | 沿途途经点直接导航下发 | 客户端系统级 URI Scheme | **极高**（协议层解耦） | 依赖车主手机已装地图且已连接车辆，部分车机限制途经点数量 | [docs/02 §2.1](../02-cockpit-protocol.md) |
| **平台默认 LLM** | 追问、画像抽取、路径 A 编排、行程单抽取、AI 路书文字 | 服务端 HTTPS API，经 `ModelProvider` 抽象 | **极高**（OpenAI 兼容 / Anthropic 接口封装） | 幻觉须经图商二次校验；须为可合规对公众提供服务的模型（D5、OI-022） | [A-11](../ASSUMPTIONS.md), [ADR-008](adr/ADR-008-ai-generation-guardrails.md), [ADR-009](adr/ADR-009-llm-provider-byok.md) |
| **用户自带的模型服务商** ★ | 用户选择自带 API 时的对话与编排 | **客户端直连**（平台不经手 Key） | 由用户决定 | 输出不被信任，写入前经服务端校验；境外服务商涉及数据出境告知 | [ADR-009](adr/ADR-009-llm-provider-byok.md), [A-16](../ASSUMPTIONS.md) |
| **对象存储 & CDN (OSS / S3)**| 单文件快照静态托管、照片与媒体缩略图 | 标准 S3 API 协议 | **极高**（标准对象存储） | 产物过大导致流量成本激增，严格限制单文件 ≤ 2MB | [ADR-004](adr/ADR-004-storage-media.md), [ADR-006](adr/ADR-006-snapshot-delivery-format.md) |
| **第三方支付网关** | 机构月度 SaaS 订阅代扣、加量包充值 | 标准 Webhook / SDK | **高** | 严禁建立个人间旅游团费资金池，仅结算平台技术软件服务费 | [docs/07 §7.1.1](../07-legal-and-compliance.md#711-边界线与法律后果的对应) |
| **短信与推送服务商** | 验证码、司导变更通知、紧急熔断短信触达 | HTTP 短信网关 | **高** | 弱网环境下短信无法实时送达，作为辅助冗余渠道 | [docs/01 §1.9](../01-resilience-and-failover.md) |

> 📌 **D6 待决（2026-10-23）**：「第三方支付网关」行的资金约束是现行约束，暂不修改；平台是否在阶段 3 起做站内交易、届时本文件要改哪些地方，见 [D6 决策材料 §8.2](../product/DEC-D6-onsite-transaction.md#82-arc-05)。

---

## 4. AI 生成管线与防幻觉护栏 (AI Pipeline & Guardrails)

针对大模型在自驾领域的“编造景点、胡排时间、推荐危险野长城”等高危缺陷，系统设计四级硬防护管线：

```mermaid
flowchart TD
    INPUT["用户自由倾倒意图输入"] --> STAGE1["Stage 1: 语义澄清与约束收敛<br/>(苏格拉底引擎提取 party, 节点, 天数)"]
    STAGE1 --> STAGE2["Stage 2: 结构化草案初步生成<br/>(未核验项一律打上 tentative: true)"]
    STAGE2 --> STAGE3["Stage 3: 确定性图商与合规硬核验<br/>(经纬度对齐 / 开闭馆校对 / 敏感词过滤)"]
    STAGE3 --> STAGE4["Stage 4: 最终合规 DSL 渲染与回显<br/>(若图商校验失败则自动降级为模糊区域)"]

    style STAGE3 fill:#7f1d1d,stroke:#ef4444,color:#fee2e2
```

> ★ **v3 补充（模型无关）**：管线的 Stage 3–4 在服务端执行，与模型来源无关。使用平台模型时，Stage 1–2 在服务端编排；使用自带模型时，Stage 1–2 由客户端的 `agent-core` 编排器执行，通过工具 API 调用 `S-GEO` 与 `S-MATCH`，产出再提交服务端走 Stage 3–4（[ADR-009](adr/ADR-009-llm-provider-byok.md)）。

### 核心防幻觉与安全机制
1. **真实性锚定**：AI 提取的所有地点必须经由 `S-GEO` 在图商正规 POI 库反查，查无此点的地点禁止作为确信景点落库。
2. **待定弹性 (Tentative)**：AI 估算未确定营业状态的节点，强制标注 `tentative: true`，页面以虚线呈现，不作为刚性排程催促用户。
3. **安全红线过滤**：所有生成文本经过 BR-015 词表与涉密坐标黑名单扫描，发现高危野景点强制拦截。

---

## 5. 异步任务与后台工作流 (Background Jobs)

为保障核心请求低延迟，以下重型计算全部由后台任务队列异步承载：
- **单文件打包编译 (`Job:CompileSnapshot`)**：将 DSL、CSS Token、离线 JS 运行时内联压缩为单一 HTML 并上传 CDN。
- **旅后照片 EXIF 提取与匹配 (`Job:MatchMediaJournal`)**：在端侧/服务端比对照片拍摄时间戳与行程节点轨迹。
- **租户资质合规巡检 (`Job:PeriodicComplianceScan`)**：定时巡检机构工商注销状态与过期许可证；资质失效的机构，其线路自动下架。
- ★ **行程单导入抽取 (`Job:ExtractItinerary`)**：把旅行社上传的 Word / PDF / Excel 抽取为行程 DSL 草稿并标注字段置信度。
- ★ **路线动画渲染 (`Job:RenderRouteAnimation`)**：按镜头脚本渲染；算路几何只在渲染时使用，不落库（BR-025）。
- ★ **匹配索引刷新 (`Job:RefreshMatchIndex`)**：线路上架、更新、下架后刷新分面统计与分布图数据。
