# TripCraft · 旅艺

面向自驾与深度游的旅行路书 DSL 规范、座舱交付协议与单文件交付架构。

---

## 状态

| 能力 | 状态 | 依据（文件路径或章节） |
| :--- | :--- | :--- |
| **DSL 规范与 JSON Schema** | 已实现 (v1.0.0) | [`spec/`](spec/)、[`docs/04-dsl-specification-v1.md`](docs/04-dsl-specification-v1.md) |
| **DSL → 单文件 HTML 编译器** | 仅规格（规划中） | [`docs/05-compiler-pipeline.md`](docs/05-compiler-pipeline.md)（无运行入口，规格见白皮书附录 B） |
| **示例路书（敦煌 9 天）** | 已实现（仅 DSL 数据） | [`examples/dunhuang-silkroad-9d/trip.json`](examples/dunhuang-silkroad-9d/trip.json) |
| **苏格拉底交互引擎 / Skill** | 仅规格 | [`docs/08-socratic-interaction-design.md`](docs/08-socratic-interaction-design.md) |
| **座舱投递（深链 / 镜像）** | 仅规格 / 部分待验证 | [`docs/02-cockpit-protocol.md`](docs/02-cockpit-protocol.md)（协议已定，途经点上限与镜像真机待验） |
| **账号与多端同步** | 规划中 / 未设计 | 无（见下文 Roadmap） |
| **B2B 白标** | 仅规格 | [`docs/03-b2b-agency-operations.md`](docs/03-b2b-agency-operations.md)、[`docs/13-agency-partnership-design.md`](docs/13-agency-partnership-design.md) |

---

## 为什么做

1. **解决旅行交付的割裂**：自驾与深度游的出行数据分散在机酒、门票、攻略与导航多个孤岛中，C 端缺乏高容灾的统一交付物，B 端从业者（地接社、车队）仍依赖凌乱文本交付。
2. **离线韧性与座舱交付**：面向西北大环线、川西高原等弱网场景，提供零依赖离线可用、多端自适应以及全天路线一键批量投递到车机导航的端到端能力。
3. **DSL 驱动与白标扩展**：以严谨的 JSON Schema 数据契约（TripCraft DSL）驱动路书渲染，支持机构白标定制与多主题动态切换。

---

## 快速开始

当前仓库为规范、设计全书与门禁工具集，运行以下命令验证规范与基准样例：

```bash
# 1. 安装开发依赖（ajv 等校验工具）
npm install

# 2. 执行全量门禁检查（Schema 校验 + 文档链接检查 + BR-025 算路几何合规扫描）
npm run check
```

---

## 示例

- **在线实战基准**：[trip-cts.pages.dev](https://trip-cts.pages.dev) —— 西行计划·丝路自驾路书（RELEASE v3.6.3）
- **基准 DSL 数据**：[`examples/dunhuang-silkroad-9d/trip.json`](examples/dunhuang-silkroad-9d/trip.json)
- **界面演示**：
  <!-- TODO(owner): add demo GIF -->

---

## 仓库结构

```text
TripCraft/
├── spec/              # 核心 JSON Schema 契约 (trip, brand, node, patch)
├── docs/              # 终极执行全书 (16章)、白皮书、假设台账与勘误记录
├── examples/          # 样例数据 (9天西北大环线 benchmark)
├── tools/             # 门禁与校验脚本 (validate-schemas, check-links, check-br025)
├── CHANGELOG.md       # 规范与架构变更记录
├── LICENSE            # 开源许可证 (MIT)
├── package.json       # 项目元数据与脚本入口
└── README.md          # 仓库首页
```

#### 规划中（尚未创建）

- `src/`：单文件 HTML 编译器与 Node CLI 入口（见 [`docs/05-compiler-pipeline.md`](docs/05-compiler-pipeline.md)）；
- `skills/`：苏格拉底反问引擎 Agent Skill 定义（见 [`docs/08-socratic-interaction-design.md`](docs/08-socratic-interaction-design.md)）；
- `templates/`：主题 CSS Token 切片与 HTML 骨架模板（见 [`docs/09-visual-design-system.md`](docs/09-visual-design-system.md)）；
- `examples/chuanxi-ring-5d/`、`examples/jiangnan-watertown-3d/`：后续扩充线路样例。

---

## 文档导航

- **架构全景白皮书**：[`docs/WHITEPAPER.md`](docs/WHITEPAPER.md)（产品定位、商业逻辑、座舱交付协议与知识产权全案）
- **商业假设台账**：[`docs/ASSUMPTIONS.md`](docs/ASSUMPTIONS.md)（未经验证的商业断言与验证标准）
- **历史勘误记录**：[`docs/ERRATA.md`](docs/ERRATA.md)（外部事实核查与能力边界更正记录）
- **终极执行全书**：[`docs/README.md`](docs/README.md)
  - 🎨 **设计轨**：[§8 澄清反问](docs/08-socratic-interaction-design.md) · [§9 视觉系统](docs/09-visual-design-system.md) · [§10 深度阅读](docs/10-roadbook-reading-design.md) · [§11 受众自适应](docs/11-audience-adaptive-rendering.md) · [§15 多设备协同](docs/15-multi-device-and-collaboration.md)
  - 💼 **商业轨**：[§3 B2B 运营](docs/03-b2b-agency-operations.md) · [§12 车厂合作](docs/12-oem-partnership-design.md) · [§13 地接社合作](docs/13-agency-partnership-design.md) · [§14 通用引擎扩展](docs/14-generic-engine-and-vertical-expansion.md)
  - ⚙️ **工程轨**：[§1 韧性与容灾](docs/01-resilience-and-failover.md) · [§2 座舱协议](docs/02-cockpit-protocol.md) · [§4 DSL 契约规范](docs/04-dsl-specification-v1.md) · [§5 编译器管线](docs/05-compiler-pipeline.md)
  - ⚖️ **支撑轨**：[§0 总纲与术语](docs/00-overview-and-glossary.md) · [§6 记忆日志引擎](docs/06-memory-journal-engine.md) · [§7 法律合规](docs/07-legal-and-compliance.md)

---

## Roadmap

- **阶段 1：契约规范与样例固化（当前已完成）**
  - 固化 `spec/` 下 4 份核心 JSON Schema 契约（`trip` / `brand` / `node` / `patch`）；
  - 建立基准数据样例与数据脱敏规范；
  - 建立自动化门禁检查（Schema 校验、文档链接检查、BR-025 扫描）。
- **阶段 2：编译引擎与交互原型（进行中）**
  - 实现单文件 HTML 编译器（`tools/compile.mjs`，见白皮书附录 B 规格）；
  - 固化四层渐进式澄清反问机制；
  - 提取多套主题 CSS 变量系统。
- **阶段 3：多端同步与平台探索（远期规划，待验证）**
  - 探索多端协同 App（Native/Flutter，支持统一账号与多设备云同步）；
  - 拓展更多地域主题样例（川西大环线、江南水乡）；
  - 深化与车机系统、地接机构的技术对接。

---

## 许可证

本项目开源采用 [MIT License](LICENSE)。
