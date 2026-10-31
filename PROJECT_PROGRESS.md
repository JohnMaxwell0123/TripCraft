# TripCraft · 项目进度与会话交接备忘 (PROJECT_PROGRESS.md)

> 本文件用于在新建 AI 对话（本机或云端会话）或多人协作时快速恢复项目上下文与执行进度。最后更新：2026-10-31。

---

## 1. 项目定位与当前状态

- **项目定位**（[产品基线 PRD-01 v3](docs/product/PRD-01-vision-positioning.md)）：多端同步、多人共享的 AI 旅行规划 App。用户通过 AI 对话（平台模型或自带 API）说清需求 → 追问形成需求画像 → **路径 A** AI 自主规划自驾路线，或 **路径 B** 匹配持证旅行社线路（匹配度 + 带分布图滑块的筛选页）。B 端为旅行社提供线路上架、AI 路书与路线动画、透明报价的线路工作室。
- **口径规则**：PRD-01 是唯一基准；其它文档冲突时按 PRD-01 §0 的优先级裁决，受影响章节已在章首注明。最近的定调与改动看 [CHANGELOG](CHANGELOG.md) 最上面几条。
- **实现状态**：仓库中只有设计文档、数据契约（`spec/` 6 份 Schema）、门禁工具（`tools/`）、样例数据（`examples/`）与演示站（`apps/showcase/`），**尚无产品代码**。
- **门禁状态**：`npm run check` 通过——Schema 与样例校验、Markdown 跨文件链接 0 失效、BR-025、追溯校验（21 场景 / 79 功能 / 48 项 P0 / 10 ADR / 20 假设）。GitHub Actions 在每次推送时跑 `check.yml`；推送 main 且改到 `apps/showcase/**` 时，`deploy-showcase.yml` 自动部署 GitHub Pages 演示站。

---

## 2. 关键文件索引

| 文件路径 | 性质 | 作用 |
| :--- | :--- | :--- |
| [`docs/product/PRD-01-vision-positioning.md`](docs/product/PRD-01-vision-positioning.md) | ★ 产品基线 | 定位、核心流程、能力边界、被取代的旧口径、决策事项 D5–D10 |
| [`docs/16-planning-paths-and-route-matching.md`](docs/16-planning-paths-and-route-matching.md) | ★ 主线专项 | 对话入口与模型选择、需求画像、路径 A、匹配度、筛选页 |
| [`docs/17-agency-route-studio.md`](docs/17-agency-route-studio.md) | ★ 主线专项 | 旅行社线路导入与上架、透明度、AI 路书与路线动画、报价版本、客户归属 |
| [`docs/product/`](docs/product/) | 产品包 | PRD-01 ~ PRD-05；[DEC-D6](docs/product/DEC-D6-onsite-transaction.md) 决策材料（平台是否代收团款） |
| [`docs/architecture/`](docs/architecture/) | 架构包 | ARC-01 ~ ARC-10、ADR-001 ~ ADR-010 |
| [`docs/delivery/`](docs/delivery/) | 交付包 | DLV-01 路线图（v3）、DLV-02 风险、DLV-03 追溯矩阵、[DLV-04](docs/delivery/DLV-04-metrics-and-data-collection.md) 指标与数据收集 |
| [`docs/09-visual-design-system.md`](docs/09-visual-design-system.md) §9.0 | 视觉口径 | App 外观统一；「行程皮肤」按路线生成（自动一套免费，深度定制属会员） |
| [`docs/SHOWCASE-web-design.md`](docs/SHOWCASE-web-design.md) | 演示站规范 | §4.1「视窗界面规范」即产品 App 的外观（D10） |
| [`docs/README.md`](docs/README.md) | 执行全书总览 | 章节地图、按角色阅读路径、核查与变更记录 |
| [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) | 假设台账 | A-01 ~ A-20 |
| [`docs/00-overview-and-glossary.md`](docs/00-overview-and-glossary.md) | 宪法层 | 十条铁律、三条责任边界、术语表、未决事项 OI-001 ~ OI-025 |
| [`spec/`](spec/) | 数据契约 | trip / node / brand / patch / profile / listing 六份 Schema |
| [`tools/`](tools/) | 门禁 | validate-schemas、check-links、check-br025、check-trace |
| [`apps/showcase/`](apps/showcase/) | 演示站 | Next.js 16 + React 19 静态导出；C 端演示片「一根线」（约 45 秒，2026-10-30 发布会级重拍，`src/components/film/`）+ B 端四章（约 68 秒） |
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
`apps/showcase` 首版滚动叙事，Unify GTM 暖纸视觉，GitHub Pages 自动部署。

### Phase 4：产品基线 v3 文档统一（2026-10-17）
按业主定调重写 PRD-01 并建立口径优先级；新增 docs/16、docs/17、ADR-009、ADR-010；PRD / ARC / DLV 全面对齐；新增 A-13 ~ A-18、OI-021 ~ OI-024；`npm run check` 接入 GitHub Actions；补 profile / listing 契约。

### Phase 5：演示站对齐 v3 并重做产品界面（2026-10-18 ~ 10-21）
演示区拆成 C 端旅客四幕与 B 端「定制师的一天」四章，幕间因果衔接；视窗里的产品界面重新设计（暖白 · 品牌橙、地图浮层用玻璃、视觉语言与示例线路无关）；整体 0.9 倍速；修 iPad 残影与横屏控制。

### Phase 6：视觉与商业化定调（2026-10-22）
- **D10 已定**：App 外观统一；docs/09 的主题 × 版式改为「行程皮肤」，只作用于行程页与产出物。
- **D9 已定**：免费版使用全部功能；AI 生成的可分享个性化路书免费，是获客入口（S-C10、A-19）；会员只做深度个性化。
- **D7 方向已定**：收入放在旅行社一侧、旅客无感；阶段 3 起以 D6 为前提加收对旅行社公开的成交服务费（F-M12-04、A-20）。

### Phase 7：三个云端任务（2026-10-23）
- [DEC-D6](docs/product/DEC-D6-onsite-transaction.md)：四个方案比较，推荐「阶段 1–2 维持现状 → 阶段 3 先做站内电子合同（不经手资金）→ 看数据再评估持牌机构分账 → 不自行代收」，律师问题 21 条（OI-025）。
- [DLV-04](docs/delivery/DLV-04-metrics-and-data-collection.md)：A-19 / A-20 的指标、事件、隐私做法与建议阈值；新增 F-M13-05 第一方统计与指标看板（P0 / 阶段 2）。
- 演示站 C 端第 4 幕补「做成可分享的路书」镜头（S-C10），两层令牌落到演示站。

### Phase 8：演示站 C 端重拍（2026-10-29 ~ 10-31）
- 导演版（PR #4，未合并）：01–03 幕加镜头、字幕与飞行，04 幕「全家的每一块屏幕」与车机投递。
- 发布会级重拍（方向 A「一根线」，业主选定）：首页 `#demo` 换成约 45 秒的演示片，静音、不读字也能记住三件事——说一句话 AI 就读懂这一家人、全家每一块屏同一个版本、出发当天路线交给车机导航。16:9 宽银幕与播放条，手机上是另一套构图的 9:16 竖屏；五轮重拍的评分表在 PR #5 里。规格见 SHOWCASE §4.2。
- 旧的 C 端舞台（`ScrollyStage.tsx`、`timeline.ts` 与只属于它的场景，连同 10-18 起就不挂载的三个场景，共 15 个文件）2026-10-31 业主同意后删除，随 PR #5 一起合并。

---

## 4. 下一步

### 4.1 待业主决策（[PRD-01 §9](docs/product/PRD-01-vision-positioning.md#9-待业主确认的决策)）
| 编号 | 决策 | 现状 |
| :--- | :--- | :--- |
| D5 | 平台默认模型选型与自带 API 支持范围 | 待决；文档默认：国内可合规模型，OpenAI 兼容 + Anthropic 接口 |
| D6 | 是否在后续阶段做站内交易 | 待决，阶段 3 前定；决策材料见 DEC-D6（含 12 个待你决定的问题） |
| D7 | 路径 B 的收费方式 | 方向已定（2026-10-22） |
| D8 | MVP 切分 | 待决；文档默认见 DLV-01 v3 |
| D9 | C 端是否收费 | 已定（2026-10-22） |
| D10 | 产品 UI 视觉体系 | 已定（2026-10-22） |

另有 DLV-04 §7 的待定项（阈值、是否保留 F-M13-05、来源统计是否单独勾选等），默认值已写入文档。

### 4.2 外部动作
1. **律师咨询（一次解决）**：OI-016 / OI-017 / OI-021，顺带 OI-022 / OI-023、OI-025（DEC-D6 §6 的 21 条）与 DLV-04 §4.7。**OI-021 意见出具前路径 B 不对公众开放。**
2. **首个区域旅行社访谈与试点签约**（建议河西走廊 / 甘青环线 3–5 家）：验证 A-14、A-17；访谈同时用 DLV-04 §3.7 的提纲收集 A-20。
3. **询价（只询价、不签约）**：2–3 家电子合同服务商、2–3 家持牌支付机构（DEC-D6 的默认做法）。

### 4.3 工程开工（DLV-01 阶段 1）
1. 初始化 Monorepo：`packages/dsl-core`、`packages/agent-core`、`services/` 骨架（[ARC-01 §6](docs/architecture/ARC-01-overview.md#6-规划中代码仓库组织-proposed-monorepo-layout)）。
2. 对话 + 需求画像 + 路径 A 最小原型；行程空间与多端同步；旅行社行程单导入。
3. 阶段 2 要一起上线的：F-M13-05 第一方统计（上线当天开始收数）、F-M09-01 自动生成的行程皮肤与分享卡片。

### 4.4 工程与文档卫生
1. 演示站的 Next.js 16.4.0 构建时报已知安全漏洞（第一次构建会被拦下，重跑可继续）：待业主决定是否升级。
2. `docs/07` §7.4.4 隐私政策要点第 5–7 条仍写「行程与照片不上传、存在用户设备本地」，与 v3 的账号与多端同步不一致，需按 ARC-07 与 DLV-04 改写。
3. 演示站重拍之后待业主决定（2026-10-30）：PR #4（导演版）先合并还是直接关掉；分享路书（S-C10）与行程皮肤在首页没有画面了，要不要在能力画廊补一张卡；演示片的声音开关留不留。（旧的 C 端舞台文件删不删，2026-10-31 业主已同意删除。）

---

## 5. 工作方式（本机或云端会话通用）

- 每个任务开新分支，完成后推送并开 PR，由业主合并；不要直接推 main（会自动部署演示站）。PR 描述写清改了什么、怎么验证、「待你决定」。
- 提交前：根目录 `npm install --no-audit --no-fund`（根目录没有锁文件）后 `npm run check`；改了演示站的，先在 `apps/showcase` 下 `npm ci`，再在根目录跑 `npm run showcase:typecheck` 与 `npm run showcase:build`。推送后确认 GitHub Actions 的 Check 通过。
- CI 跑 Node 20：`tools/` 下不能用 Node 22+ 的 API；`apps/showcase/next-env.d.ts` 由 next dev 自动改写，不要提交；不改 LICENSE。
- 改产品文档时，新增场景 / 功能 / 假设须同步 PRD-03、PRD-04、DLV-01、DLV-03、ASSUMPTIONS；ASSUMPTIONS 的「证据」「结论」列由业主填写。
- 多个任务并行时，事先划分各自能改的文件；`CHANGELOG.md` 由合并的人统一补。

---

## 6. 新对话唤醒提示词

```text
请先阅读 PROJECT_PROGRESS.md、AGENTS.md 与 docs/product/PRD-01-vision-positioning.md，了解当前产品基线、执行进度与工作方式，再继续推进项目。
本次任务：【在这里写】
```
