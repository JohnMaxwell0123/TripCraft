# TripCraft · 项目进度与会话交接备忘 (PROJECT_PROGRESS.md)

> 本文件用于在新建 AI 对话窗口或多人协作时快速恢复项目上下文与执行进度。

---

## 1. 项目基本定位与当前状态

- **项目定位**：面向自驾与深度游的智能旅行路书协同系统、数字化交付与 B 端白标 SaaS 平台；以「统一账号多端协同」与「零依赖高保真单文件离线快照」为双轮驱动。
- **当前分支**：`main`（已完成 `docs/arch-package-v2` 架构包与全新首页的合入与推送，远程 `origin/main` 保持最新）。
- **门禁状态**：`npm run check` 100% 通过（4 份 JSON Schema 元校验、Dunhuang 示例校验、1100+ 处 Markdown 交叉链接 0 失效、BR-025 防内联算路几何规则通过、14 场景/51 功能/8 决策/12 假设全链路追溯校验通过）。

---

## 2. 关键文件索引与职责

| 文件路径 | 性质 | 作用与内容 |
| :--- | :--- | :--- |
| [`README.md`](README.md) | 核心展示页 | 项目落地首页，含全景项目定位 (About)、四大痛点破局、B2B2C 飞轮、五大核心亮点、架构图、边界与路线图。 |
| [`CHANGELOG.md`](CHANGELOG.md) | 变更记录 | 记录架构、规范与核心修复的发布演进。 |
| [`docs/product/`](docs/product/) | 产品架构包 | `PRD-01` ~ `PRD-05`，愿景定位、客群角色、14 个场景、51 项功能（29 个 P0 卡片）、商业模式。 |
| [`docs/architecture/`](docs/architecture/) | 系统架构包 | `ARC-01` ~ `ARC-08`，总览与Monorepo、领域模型、离线同步、客户端矩阵、后端集成、多租户、安全隐私、部署成本。 |
| [`docs/architecture/adr/`](docs/architecture/adr/) | 架构决策记录 | `ADR-001` ~ `ADR-008` 与 `ARC-09` 索引，涵盖跨端、同步、后端单体、存储、地图、快照、租户、AI防幻觉。 |
| [`docs/delivery/`](docs/delivery/) | 交付规划包 | `DLV-01` ~ `DLV-03`，5 阶段演进路线图、MVP 边界、8 项核心风险登记册、全链路追溯矩阵。 |
| [`docs/WHITEPAPER.md`](docs/WHITEPAPER.md) | 架构白皮书 | 涵盖商业逻辑、座舱协议、IP 保护指南等宏观背景。 |
| [`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md) | 假设台账 | 记录 A-01 至 A-12 商业与技术未验证断言。 |
| [`docs/ERRATA.md`](docs/ERRATA.md) | 勘误记录 | 记录历史能力边界纠偏与事实更正（NOA/SOC 边界、日历星期对齐等）。 |
| [`spec/`](spec/) | 数据契约 | `trip.schema.json`、`brand.schema.json`、`node.schema.json`、`patch.schema.json`。 |
| [`examples/dunhuang-silkroad-9d/`](examples/dunhuang-silkroad-9d/) | 标杆样例 | 丝路 9 天真实行程脱敏数据（`trip.json`，纯 DSL 数据）。 |
| [`tools/`](tools/) | 自动化门禁 | `validate-schemas.js`、`check-links.mjs`、`check-br025.mjs`、`check-trace.mjs`。 |
| [`TRIPCRAFT_FIX_PLAN.md`](TRIPCRAFT_FIX_PLAN.md) | 历史任务书 | **已全量执行完毕**的审计与修复计划（本地保留，不入库）。 |
| [`TRIPCRAFT_ARCH_PLAN_v2.md`](TRIPCRAFT_ARCH_PLAN_v2.md) | 历史任务书 | **已全量执行完毕**的产品与系统架构包 v2 执行计划（本地保留，不入库）。 |

---

## 3. 已完成阶段

### Phase 1：修复与合规化
1. **数据清洗与隐私脱敏**：高德 Key 占位符、虚构身份证号掩码脱敏、订单与房号模板化。
2. **能力边界与合规性纠偏**：纠正 NOA / SOC 夸大叙事，明确深链途经点投递与手机屏幕镜像。
3. **知识产权与法律主张修正**：修正 Git SHA-1 法律存证表述，确立思想与表达二分法，维持标准 MIT 许可证。
4. **商业断言解耦**：建立 `docs/ASSUMPTIONS.md` 假设台账（A-01~A-07）。
5. **日历星期全面对齐**：修复自然年历星期对应。
6. **文档分流与终审微调**：落地页精简，统一单文件编译器路径，标注在线体验站性质。

### Phase 2：产品与系统架构包 v2（分支：`docs/arch-package-v2`）
1. **工程自动化升级**：新增 `tools/check-trace.mjs`（场景-功能-决策-假设闭环），修复 `check-links.mjs` 门禁放行缺陷并增加目录相对链接校验，纳入 `npm run check`。
2. **产品架构体系 (`docs/product/`)**：完成 PRD-01 ~ PRD-05 与 README 索引，定义 14 个核心业务场景与 51 项功能（29 个 P0 验收卡），建立 B2B2C 商业模式与试点机制。
3. **系统架构体系 (`docs/architecture/`)**：完成 ARC-01 ~ ARC-08、ADR-001 ~ ADR-008 与 ARC-09 索引，定义 17 大领域实体、Local-First 离线同步模型、防幻觉 AI 生成管线与 RLS 多租户白标。
4. **交付规划体系 (`docs/delivery/`)**：完成 DLV-01 ~ DLV-03，制定 5 阶段演进路线图、MVP 范围及明确 Non-Goals、8 大风险登记册与全量追溯矩阵。
5. **首页与元数据重构**：重做根目录 `README.md` 与 `package.json`，彻底纠正历史关于定位的错误描述（About），明确统一账号多端协同与离线快照双轮驱动体系，补齐行业四大痛点破局表、B2B2C 飞轮图与 GitHub 仓库 About 元数据配置建议；同步更新 `docs/README.md`、`docs/WHITEPAPER.md`、`docs/ASSUMPTIONS.md` 与 `CHANGELOG.md`。

### Phase 3：展示与交互演示官网落地（Apple Scrollytelling 视差故事流与全能力矩阵）
1. **架构与工程解耦**：创建独立应用 `apps/showcase`（Next.js 16 + React 19 + Tailwind CSS 3.4 + Framer Motion 12 + TypeScript），采用纯静态 SSG 导出 (`output: 'export'`) 与零外部运行时依赖托管服务 `server.mjs`。
2. **Apple Scrollytelling 电影级长镜头故事流**：
   - **01 倾诉**：滚动打字输入自然语言诉求（5人家庭自驾+长辈幼儿+7座豪华MPV带车顶箱），AI 实体槽位瞬时抽取，苏格拉底反问卡片方案 A 自动锁定。
   - **02 织就**：纯矢量 SVG 航拍俯冲运镜（中国 ➔ 河西走廊 ➔ 兰州），7座 MPV 车标沿 Catmull-Rom 贝塞尔轨迹循迹，乌鞘岭长下坡防刹车过热与丹霞/莫高窟适老通行胶囊联动。
   - **03 齐心**：微信免登扫码好友模拟，愿望池抽屉开启，搜索「正宁路夜市·赵记牛奶鸡蛋醪糟」并抛物线飞入心愿池。
   - **04 重排**：苹果液态玻璃路线重算弹窗弹出，顺路度 98% 数字滚动跳动，原计划 vs 优化后路线条形对比，7座 MPV 车顶箱 2.15m 限高与夜市地面泊车建议，一键采纳并展开街区步行虚线放大镜 (`WalkLens`)。
   - **05 出发**：单文件 `西行计划.v1.1.html` 编译进度与清单、手机离线/车机 HUD/A5 纸质打印三端扇形展开。
3. **沉浸式交互微沙盒与全能力 Bento**：
   - 包含断网演练模拟开关、地接社白标实时换肤器、7座 MPV/SUV 车顶箱通过性动态滑块等 6 大核心 Bento 交互展卡。
   - **技术底座与工程哲学深度重构 (`TechFoundation.tsx`)**：移出教条式十大铁律，升级为 4 大硬核架构支柱（Local-First 数据主权、可执行 DSL 唯一真相源、双轨防幻觉与 BR-001~025 物理断言、零构建单文件与 Tier 0 车机协议）与实时可交互代码契约检视台。
   - **全站常驻长辈关怀模式 (`SeniorModeFab` + `data-senior`)**：支持常驻浮动控制栏与顶部一键切换，字号放大 25%、行间距加宽、对比度强化、大点击靶心与轻提示，满足 WCAG AA 适老化标准。
4. **自动化门禁与多端验证**：
   - 根目录集成 `showcase:dev`、`showcase:build`、`showcase:serve`、`showcase:typecheck` 脚本；
   - Chrome DevTools 真机桌面端与移动端 (iPhone 14) 全流程渲染、控制台 0 报错验证通过。

---

## 4. 下一步待办（Phase 3：工程落地与核心原型开发）

- **待 Owner 决策事项**：
  1. 评审确认 D2（MVP 切分：阶段 1 共用核心 + 3~5 家小 B 白标出单最小闭环）；
  2. 评审确认 ADR-001 至 ADR-008 的 Proposed 选型建议；
  3. 推进 3~5 家甘青/川西精品地接社实地访谈（验证 A-03 与 A-10 假设）。
- **工程开工阶段**（按 `DLV-01` 阶段 1 MVP 范围）：
  1. 初始化 Monorepo 骨架（`apps/`、`packages/`、`services/`）；
  2. 实现 `@tripcraft/dsl-core` 核心解析与操作库；
  3. 启动 `S-EXPORT` 单文件 HTML 编译器（`tools/compile.mjs` 原型化落地）；
  4. 搭建 C-CONSOLE 与 C-MOBILE 最小可交互原型。

---

## 5. 新对话唤醒提示词（Prompt 模板）

在新对话窗口中，直接输入以下内容即可无缝接续：

```text
/boost 请阅读项目根目录下的 PROJECT_PROGRESS.md，了解当前仓库状态与最新执行进度，继续推进项目。
```
