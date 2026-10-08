---
id: DLV-02
title: 项目风险登记册 (Risk Register)
status: Draft（agent 起草，待 owner 评审）
last_updated: 2026-10-08
related: [PRD-01, ARC-07, DLV-01, A-01, A-03, A-08, A-09, A-10, A-11]
sources: [docs/ASSUMPTIONS.md, docs/ERRATA.md, docs/07-legal-and-compliance.md]
---

# DLV-02 · 项目风险登记册 (Risk Register)

## 1. 风险全景概览

本风险登记册汇总系统演进中的核心业务、技术、法律与资源风险，与 [假设台账 ASSUMPTIONS.md](../ASSUMPTIONS.md) 及 [架构决策 ADR](../architecture/ARC-09-adr-index.md) 互相闭环追溯。

```mermaid
quadrantChart
    title 风险概率与影响矩阵
    x-axis 发生可能性 (Low --> High)
    y-axis 潜在危害影响 (Low --> High)
    quadrant-1 紧急监控与硬防线
    quadrant-2 高度关注与重点缓解
    quadrant-3 常规运维监控
    quadrant-4 流程与机制防御
    RSK-05 机构资质合规: [0.7, 0.95]
    RSK-04 地图商用成本与合规: [0.8, 0.85]
    RSK-06 AI 幻觉与虚构安全: [0.75, 0.8]
    RSK-01 OTA 数据接入不确定性: [0.85, 0.4]
    RSK-02 车机座舱能力越界: [0.3, 0.9]
    RSK-03 离线同步与并发分叉: [0.5, 0.7]
    RSK-07 位置隐私与信标外泄: [0.4, 0.75]
    RSK-08 单人研发资源瓶颈: [0.9, 0.6]
```

---

## 2. 核心风险条目清单

| 风险 ID | 风险类别 | 风险情景与危害描述 | 可能性 | 影响度 | 核心缓解与应对措施 | 关联假设 / ADR |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- |
| **RSK-01** | 商业依赖 | **OTA 数据接入不确定性**：主流 OTA 平台未开放公开返佣 API 或封禁外链，导致 CPS 变现通道受阻。 | **H** | **M** | 严格遵循非目标规范；将 OTA 外链定位为辅助参考，商业主线聚焦 B 端 SaaS 与白标交付技术费。 | [A-01](../ASSUMPTIONS.md), [PRD-05](../product/PRD-05-business-model.md) |
| **RSK-02** | 合规宣称 | **车机路径能力边界越界**：宣传或设计中夸大 NOA 接管、SOC 读取或原生车机适配，引发虚假宣传与用户安全责任。 | **L** | **H** | 严格以 [docs/ERRATA.md](../ERRATA.md) 为准绳；在 README 与 PRD 显著位置声明“深链投递 + 投屏镜像”边界，禁止越权承诺。 | [ERRATA](../ERRATA.md), [PRD-01](../product/PRD-01-vision-positioning.md) |
| **RSK-03** | 技术复杂 | **离线同步与版本分叉失控**：长周期离线导致团队成员版本严重分叉，自动合并破坏已商定的行程秩序。 | **M** | **H** | 坚决不使用不可控的无中心纯数学 CRDT；采用服务端权威日志；离线以增量 TripPatch 二维码点对点分发，坚持领队拍板。 | [A-08](../ASSUMPTIONS.md), [ADR-002](../architecture/adr/ADR-002-sync-conflict-model.md) |
| **RSK-04** | 法律与成本 | **地图商业授权与合规风险**：图商商业授权资费过高，或开发不慎将算路密集 polyline 内联落库导致侵权封禁。 | **H** | **H** | 封装 S-GEO 适配层隔离图商；设置本地 POI 缓存减少请求；CI 持续运行 `check-br025.mjs` 强制拦截违规密集点串。 | [A-09](../ASSUMPTIONS.md), [ADR-005](../architecture/adr/ADR-005-map-navigation-abstraction.md) |
| **RSK-05** | 法律红线 | **机构无证经营连带法律风险**：无旅行社资质的“黑车队/野领队”利用平台组合排程并向游客收款，平台被认定提供便利连带查处。 | **H** | **H** | 协作层绝不提供收款能力 (R1)；严格执行 S-OPS 入驻资质审核，对无资质机构仅开放交通路况模版，限制生成全包旅行产品。 | [A-10](../ASSUMPTIONS.md), [ARC-06](../architecture/ARC-06-multitenancy-whitelabel.md) |
| **RSK-06** | 安全与AI | **AI 幻觉推荐危险未开发野景点**：大模型生成虚构路线或推荐高危无人区野景点，导致自驾游客被困甚至伤亡。 | **H** | **H** | 建立四级确定性防护管线：大模型仅做草案提取；所有景点必须经由合规图商官方 POI 强核验；扫描黑名单；未核验项标“同行者提议”。 | [A-11](../ASSUMPTIONS.md), [ADR-008](../architecture/adr/ADR-008-ai-generation-guardrails.md) |
| **RSK-07** | 隐私合规 | **实时位置信标泄露与跟踪滥用**：车队信标遭恶意监听或未授权访问，侵犯旅客行动轨迹隐私。 | **M** | **H** | 实时经纬度采用独立通信信令通道，绝不写入永久 DSL；提供硬性常驻“隐身模式”开关；非行驶状态实施 500m 网格模糊化。 | [ARC-03](../architecture/ARC-03-offline-sync.md), [ARC-07](../architecture/ARC-07-security-privacy-compliance.md) |
| **RSK-08** | 资源限制 | **单人/小团队开发资源瓶颈**：多端形态庞大（手机、车机、iPad、Web），单人精力分散导致全线延期。 | **H** | **M** | 严格实施阶段 1 (MVP) 裁剪：阶段 1 仅做“共用核心 + B 端白标最小闭环”，iPad 沙盘、车机镜像与视频回忆录坚决推迟至阶段 2~5。 | [DLV-01](DLV-01-roadmap-mvp.md), [ADR-001](../architecture/adr/ADR-001-client-framework.md) |

---

## 3. 风险审查与动态跟踪机制

1. **双周合规巡检**：定期更新文旅部无证经营查处新案例与图商商用条款变更。
2. **假设台账联动**：每当完成 3–5 家机构试点访谈，立即在 [docs/ASSUMPTIONS.md](../ASSUMPTIONS.md) 中核销对应假设，并在本册调整风险等级。
