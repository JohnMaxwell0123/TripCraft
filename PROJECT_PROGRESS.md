# TripCraft · 项目进度与会话交接备忘 (PROJECT_PROGRESS.md)

> 本文件用于在新建 AI 对话窗口或多人协作时快速恢复项目上下文与执行进度。最后更新：2026-10-17。

---

## 1. 项目定位与当前状态

- **项目定位**（[产品基线 PRD-01 v3](docs/product/PRD-01-vision-positioning.md)）：多端同步、多人共享的 AI 旅行规划 App。用户通过 AI 对话（平台模型或自带 API）说清需求 → 追问形成需求画像 → **路径 A** AI 自主规划自驾路线，或 **路径 B** 匹配持证旅行社线路（匹配度 + 带分布图滑块的筛选页）。B 端为旅行社提供线路上架、AI 路书与路线动画、透明报价的线路工作室。
- **口径规则**：PRD-01 是唯一基准；其它文档冲突时按 PRD-01 §0 的优先级裁决，受影响章节已在章首注明。
- **实现状态**：仓库中只有设计文档、数据契约（`spec/`）、门禁工具（`tools/`）、样例数据（`examples/`）与演示站（`apps/showcase/`），**尚无产品代码**。
- **门禁状态**：`npm run check` 通过——4 份 Schema 与 1 份样例校验、Markdown 跨文件链接 0 失效、BR-025、追溯校验（20 场景 / 76 功能 / 47 项 P0 / 10 ADR / 18 假设）。门禁目前只在本地运行，CI 只负责部署演示站。

---

## 2. 关键文件索引

| 文件路径 | 性质 | 作用 |
| :--- | :--- | :--- |
| [`docs/product/PRD-01-vision-positioning.md`](docs/product/PRD-01-vision-positioning.md) | ★ 产品基线 | 定位、核心流程、能力边界、被取代的旧口径、待决策事项 D5–D10 |
| [`docs/16-planning-paths-and-route-matching.md`](docs/16-planning-paths-and-route-matching.md) | ★ 主线专项 | 对话入口与模型选择、需求画像、路径 A、匹配度、筛选页 |
| [`docs/17-agency-route-studio.md`](docs/17-agency-route-studio.md) | ★ 主线专项 | 旅行社线路导入与上架、透明度、AI 路书与路线动画、报价版本、客户归属 |
| [`docs/product/`](docs/product/) | 产品包 | PRD-01 ~ PRD-05 |
| [`docs/architecture/`](docs/architecture/) | 架构包 | ARC-01 ~ ARC-10、ADR-001 ~ ADR-010 |
| [`docs/delivery/`](docs/delivery/) | 交付包 | DLV-01 路线图（v3）、DLV-02 风险、DLV-03 追溯矩阵 |
| [`docs/README.md`](docs/README.md) | 执行全书总览 | 章节地图、按角色阅读路径、核查与变更记录 |
| [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) | 假设台账 | A-01 ~ A-18 |
| [`docs/00-overview-and-glossary.md`](docs/00-overview-and-glossary.md) | 宪法层 | 十条铁律、三条责任边界、术语表、未决事项 OI-001 ~ OI-024 |
| [`spec/`](spec/) | 数据契约 | trip / node / brand / patch 四份 Schema |
| [`tools/`](tools/) | 门禁 | validate-schemas、check-links、check-br025、check-trace |
| [`apps/showcase/`](apps/showcase/) | 演示站 | Next.js 16 + React 19，推送 main 自动部署 GitHub Pages |
| [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md) | 历史文档 | 早期白皮书，不作为现行口径 |
| [`TRIPCRAFT_ARCH_PLAN_v2.md`](TRIPCRAFT_ARCH_PLAN_v2.md)、[`tripcraft_showcase_agent_refactoring_spec.md`](tripcraft_showcase_agent_refactoring_spec.md) | 历史任务书 | 已执行完毕，已标注历史 |
| `TripCraft 商业可行性尽调…诊断报告.md` | AI 模拟报告 | **不是真实第三方尽调**，不得对外引用 |

---

## 3. 已完成阶段

### Phase 1：修复与合规化（2026-10-07）
数据脱敏、NOA / SOC 能力边界纠偏、Git 存证表述修正、假设台账建立、日历星期对齐；OI-008 许可证冲突闭合（保持 MIT）。

### Phase 2：产品与系统架构包 v2（2026-10-08）
PRD-01 ~ 05、ARC-01 ~ 09、ADR-001 ~ 008、DLV-01 ~ 03；新增 `check-trace` 追溯门禁。

### Phase 3：演示站（2026-10-12 ~ 10-16）
`apps/showcase` 五幕滚动叙事（倾诉 → 河西沙盘 → 愿望池 → 座舱 → 离线交付），Unify GTM 暖纸视觉，GitHub Pages 自动部署。

### Phase 4：产品基线 v3 文档统一（2026-10-17）
按业主定调重写 PRD-01 并建立口径优先级；新增 docs/16、docs/17、ADR-009、ADR-010；PRD / ARC / DLV 全面对齐；执行全书章首标注；新增 A-13 ~ A-18、OI-021 ~ OI-024。明细见 [CHANGELOG](CHANGELOG.md)。

---

## 4. 下一步

### 4.1 待业主决策（[PRD-01 §9](docs/product/PRD-01-vision-positioning.md#9-待业主确认的决策)）
| 编号 | 决策 | 文档默认值 |
| :--- | :--- | :--- |
| D5 | 平台默认模型选型与自带 API 支持范围 | 国内可合规模型；OpenAI 兼容 + Anthropic 接口 |
| D6 | 是否在后续阶段做站内交易 | 阶段 1–2 不做 |
| D7 | 路径 B 的收费方式 | 工作室订阅 + 线索包，不收成交佣金 |
| D8 | MVP 切分 | 阶段 1：对话 + 路径 A + 共享同步 + 首批线路上架；阶段 2：路径 B |
| D9 | C 端是否收费 | 基础免费，平台模型设免费额度 |
| D10 | 产品 UI 视觉体系（docs/09 五主题 vs Unify GTM） | **无默认值** |

### 4.2 外部动作
1. **律师咨询**（一次解决 OI-016 / OI-017 / OI-021，并顺带 OI-022 / OI-023）：问题清单见 [docs/17 §17.10](docs/17-agency-route-studio.md#1710-合规要点全部待执业律师核验)。**OI-021 意见出具前路径 B 不对公众开放。**
2. **首个区域旅行社访谈与试点签约**（建议河西走廊 / 甘青环线 3–5 家）：验证 A-14、A-17。

### 4.3 工程开工（DLV-01 阶段 1）
1. 补数据契约：`profile.schema.json`、`listing.schema.json`（OI-024），纳入 `npm run validate`。
2. 初始化 Monorepo：`packages/dsl-core`、`packages/agent-core`、`services/` 骨架（[ARC-01 §6](docs/architecture/ARC-01-overview.md#6-规划中代码仓库组织-proposed-monorepo-layout)）。
3. 对话 + 需求画像 + 路径 A 最小原型；行程空间与多端同步；旅行社行程单导入。

### 4.4 工程卫生
1. 演示站叙事对齐基线：补路径 B 筛选页与旅行社线路工作室，车机与离线交付降为支撑（[SHOWCASE-web-design](docs/SHOWCASE-web-design.md) 章首说明）。
2. 把 `npm run check` 接入 GitHub Actions（当前只有部署工作流）。

---

## 5. 新对话唤醒提示词

```text
请先阅读 PROJECT_PROGRESS.md 与 docs/product/PRD-01-vision-positioning.md，了解当前产品基线与执行进度，再继续推进项目。
```
