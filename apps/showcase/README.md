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
- **首屏关键词「活路书」**：注入 **Flame Aura Glow** 烈焰微光场多层扩散。

---

## 3. 核心演示舞台：五幕长镜头演进 (`ScrollyStage`)

舞台采用纯 `MotionValue` 驱动的沙盒时钟引擎，**0 React 重渲染调度**，彻底消除跳帧卡顿与抢播：

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              五幕长镜头自运行演进时钟                                    │
│                                                                                        │
│  01 倾诉 ────> 02 生成 ────> 03 共创 ────> 04 领航 ────> 05 交付                         │
│  逐字打字机    9日拓扑航线    微信扫码免登    原生奢华座舱    多端全景离线                       │
│  思维链推演    高程起伏剖面    愿望池加权博弈  车道级导引光毯  1.2MB 单文件                      │
│  4项刚性风控   MPV专属车位    3D悬浮手机伴侣  2.0m地库限高拦截 三级降级防白屏                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **01 倾诉 (`ChatScene.tsx`)**：
   - 具备 `useScrollTypewriter` 逐字打字机流式输入（字符敲入 ➔ 光标呼吸 ➔ 模拟提交点击）；
   - 3 步层级思维链（CoT）推演树，与右侧「家庭出行守护清单」4 项刚性规则（70岁长辈膝关节风控、4岁幼儿作息避暑、2.28m MPV 限高避让、鸣沙山黄金采光）严格对齐展开。
2. **02 生成 (`Workspace.tsx`)**：
   - 9 日河西走廊大纲（兰州 ➔ 张掖 ➔ 嘉峪关 ➔ 敦煌）、矢量高程起伏剖面与高清 GIS 拓扑沙盘。
3. **03 共创 (`Collab.tsx`)**：
   - 微信扫码免登多人愿望池协同，副驾 3D 拟真手机伴侣悬浮探出视窗（无边缘硬切）。
4. **04 编排与领航 (`CockpitScene.tsx`)**：
   - 原生奢华车机中控大屏，分屏实时 HUD 车速、3D 车道级导引光毯与 2.0m 老城地库限高拦截预警，驻车 P 挡自动无感交接手机步行微镜头。
5. **05 离线交付 (`Deliver.tsx`)**：
   - 全自动多端离线安全守护，自包含祁连山脉、巴丹吉林/库姆塔格沙漠地形拓扑与应急专线，1.2MB 单文件自包含 HTML（零外部运行时依赖，三级降级防白屏）。

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
