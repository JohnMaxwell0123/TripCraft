# TripCraft · 旅艺 —— 官方交互演示官网 (Showcase Platform)

> **在线展示地址**：[https://johnmaxwell0123.github.io/TripCraft/](https://johnmaxwell0123.github.io/TripCraft/)  
> **代码目录**：`apps/showcase`  
> **技术栈基准**：Next.js 16 (App Router, webpack build), React 19, Tailwind CSS 3.4, Framer Motion 12  
> **设计规范契约**：[Unify GTM Design System](../../.agents/rules/unify-gtm-design-system.md)

---

## 1. 工程定位与核心使命

`apps/showcase` 是 **TripCraft（旅艺）** 面向全球自驾车主、家庭领队、精品地接社、新能源车企伙伴与开发者的**高保真交互演示与数字化交付中枢**。

它并非普通的静态营销宣传页，而是一个深度融合了 **Apple Scrollytelling 电影级故事流长镜头** 与 **沙盒微交互** 的数字化体验平台。访客无需注册登录，即可完整感受从一句话自然语言诉求到无人区单文件离线安全舱的全流程推演。

---

## 2. Unify GTM 官方设计系统落地

本工程严格践行 Unify GTM 高奢编辑出版物与瑞士精密工程设计范式：

### 2.1 核心色彩令牌
- **画布底色 (Canvas)**：温润纸张乳白 **`#FFFFF9`**，彻底杜绝冷调数字纯白 (`#FFFFFF`) 的生硬感；
- **模块底色 (Module)**：亚麻浅石灰 **`#F4F4EE`**，用于二级卡片与背景沉降区；
- **高奢对比色 (Charcoal)**：暖炭黑 **`#241E20`**，用于大屏座舱、代码视窗与重要强调区；
- **高能强调色 (Flame Accent)**：烈焰橙红 **`#FE3C01`**，精准聚焦关键行动指示、首屏 Aura Glow 与 1px 发丝指示条；
- **发丝结构边框 (Hairline)**：1px 机械发丝线 **`#E2E2D8`**。

### 2.2 严格圆角阶梯红线 (Strict Radius Hierarchy)
- 🔘 **所有操作按钮与行动链接 (Buttons)**：**严格等于 `rounded-[5px]`**（机械精密圆角，杜绝钝重胶囊感）；
- 💊 **所有状态胶囊与步进指示器 (Badges, Pills)**：**严格等于 `rounded-full` (100px)**；
- 🃏 **内容卡片与功能模块 (Cards)**：**严格等于 `rounded-[12px]`**（子框/次级卡片 `rounded-[10px]`）；
- 🪟 **输入外框与应用模拟视窗 (Windows, Frames)**：**严格等于 `rounded-[16px]`**。

### 2.3 排版体系与字体栈
- **展示性大标题 (H1, H2)**：高对比度编辑部衬线体（Editorial Serif）配 `-0.035em` 紧凑负字距与 `leading-[1.05]` 紧凑行高；
- **正文与功能操作 (Body, UI)**：现代几何无衬线字体（Geometric Grotesque Sans: Plus Jakarta Sans / Inter）；
- **遥测数据与代码 (Telemetry, Code)**：等宽字体（JetBrains Mono / SF Mono / tabular-nums）；
- **首屏关键词「定下来」**：注入 **Flame Aura Glow** 烈焰微光场多层扩散。

---

## 3. 核心演示区：两段独立的场景动画

演示区由两段互相独立的舞台组成，详细规格见 [`docs/SHOWCASE-web-design.md` §4](../../docs/SHOWCASE-web-design.md)：

```text
C 端 · 旅客的完整使用流（ScrollyStage，#demo）
  01 AI 对话与需求画像 → 02 路径 A · AI 规划自驾 → 03 路径 B · 线路筛选与详情 → 04 行程空间 · 共享与同步

B 端 · 定制师的一天（AgencyStage，#agency）
  09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付
```

- **共用外壳**：`StageShell.tsx`（rAF 时钟、章节导航、播放控制）与 `AppWindow.tsx`（标题栏、侧栏、状态栏、手机标签栏）；章节按时长首尾相接（`acts.ts`），只播放一遍，离开视口时挂起，播放过程 0 React 重渲染。
- **时间轴**：C 端 `timeline.ts`、B 端 `agencyTimeline.ts`；关键帧以全局进度书写，调整节奏只改这两份文件。
- **按视窗宽度排版**：视窗是 `container-name: win` 的容器，内部用 `cq-sm / cq-md / cq-lg` 变体（见 `tailwind.config.ts`）。
- **减弱动态效果**：`prefers-reduced-motion` 下不自动播放，每章展示一张静帧。
- **视觉巡检**：控制台执行 `window.__setStageProgress(v)` 或 `window.__setAgencyProgress(v)` 跳到任意帧并暂停。

---

## 4. 本地开发与工程验证

### 4.1 常用指令
```bash
# 启动本地热重载开发服务器 (默认端口 3000)
npm run dev

# 执行 TypeScript 严格类型检查
npm run typecheck

# 执行 Next.js 生产环境静态打包 (SSG 静态全量导出至 out/ 目录)
npm run build

# 启动本地极简生产静态托管验证 (依赖根目录 server.mjs)
npm run start
```

### 4.2 构建决策说明
在具备多层 NTFS 符号链接或 Junctions 的 Windows 工作区环境下，`next build --webpack` 能有效避免 Turbopack 路径解析异常，确保静态构建 100% 稳定通过。

### 4.3 CI/CD 与部署流水线
本项目代码推送至 GitHub `main` 分支时，将自动触发 `.github/workflows/deploy-showcase.yml`，执行自动化依赖安装、静态导出与 GitHub Pages 部署发布。
