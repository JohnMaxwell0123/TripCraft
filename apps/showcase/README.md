# TripCraft · 旅艺 —— 官方交互演示官网 (Showcase Platform)

> **在线展示地址**：[https://johnmaxwell0123.github.io/TripCraft/](https://johnmaxwell0123.github.io/TripCraft/)  
> **代码目录**：`apps/showcase`  
> **技术栈基准**：Next.js 16 (App Router, webpack build), React 19, Tailwind CSS 3.4, Framer Motion 12  
> **设计规范契约**：[Unify GTM 页面美学（2026-10-20 实测复核版）](../../.agents/rules/unify-gtm-design-system.md)

---

## 1. 工程定位与核心使命

`apps/showcase` 是 **TripCraft（旅艺）** 的交互演示站：用两段场景动画讲清产品基线 v3（[PRD-01](../../docs/product/PRD-01-vision-positioning.md)）——旅客用一段对话说清需求，AI 规划自驾路线或匹配持证旅行社的线路，方案进入行程空间、全家多端同步；旅行社在线路工作室上架线路、生成路书、透明报价。访客无需注册登录，滚到哪段就播哪段。

TripCraft 仍在设计与原型阶段：演示用的是示例数据，「设计场景」一节是 PRD-03 的典型场景，不是用户评价。

---

## 2. 视觉规范（Unify GTM 实测复核版）

规范全文与对照表见 [`.agents/rules/unify-gtm-design-system.md`](../../.agents/rules/unify-gtm-design-system.md)（2026-10-20 按 unifygtm.com 的实测计算样式重写）。要点：

### 2.1 色彩
- **画布** `#FFFFF9`；**平铺块** `#F8F7F3`；**炭黑** `#241E20`（文字、主按钮、公告条）。
- **烈焰橙** `#FE3C01` 只用于：标题里的关键词（纯色无光晕）、1px 竖线与进度条、需要注意的信号（推断项、低置信度、角标）、首屏关键词的贴边投影；12–13px 的橙字用 `#C43200`。
- **氛围带**：B 端舞台的黄昏、首屏面板的白昼、页脚上方的夜色，都用渐变 + 模糊绘制（`.atmo-*`），不引入外部图片。

### 2.2 圆角
按钮 5px · 胶囊全圆 · 平铺块 4px · 卡片 8px · 产品窗口 18px · 页脚纸面 10px · 纸面压氛围带的收边 28px。

### 2.3 字体与字号
- 标题与大数字用衬线 Noto Serif SC（`FontLoader` 挂载后加载，不阻塞首次渲染）；正文与界面用 Plus Jakarta Sans + 系统中文无衬线。
- 首屏 72 / 56 / 40px，分区标题 44 / 40 / 32px，导语 18–20px，正文 15–16px，按钮与导航 15px，眉题 13px 炭黑；辅助字 ≥ 13px，视窗内 ≥ 12px。
- 首屏关键词「定下来」：文字仍是炭黑，加 `text-shadow: 1px 0 2px rgba(254,60,1,.65)`（`.u-aura`）。

### 2.4 常用类名（`src/app/globals.css`）
`.u-eyebrow` · `.u-aura` · `.u-btn` + `.u-btn-primary / -secondary / -light` · `.u-pill` · `.u-card` · `.u-tile` · `.u-link` · `.atmo` + `.atmo-day / -dusk / -night`

---

## 3. 核心演示区：两段独立的场景动画

演示区由两段互相独立的舞台组成，讲的是同一家人、同一条线路，详细规格见 [`docs/SHOWCASE-web-design.md` §4](../../docs/SHOWCASE-web-design.md)：

```text
C 端 · 旅客的完整使用流（ScrollyStage，#demo，66 秒）
  01 AI 对话与需求画像 → 02 路径 A · AI 规划自驾 → 03 路径 B · 线路筛选与详情 → 04 行程空间 · 共享与同步

B 端 · 定制师的一天（AgencyStage，#agency，61 秒，黄昏氛围带）
  09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付
```

- **幕间因果衔接**：每一幕以一次点击结束，下一幕开头就是它的结果（例：03 幕发出咨询后点侧栏「行程空间」，04 幕的行程空间里放着自驾草案与这条咨询）；B 端 16:20 收到的正是 C 端那一家人的咨询。衔接表与数据线见 SHOWCASE §4.0。
- **共用外壳**：`StageShell.tsx`（rAF 时钟、章节导航、播放控制；`tone="band"` 深色氛围带）与 `AppWindow.tsx`（标题栏与时钟、侧栏、状态栏、手机标签栏；导航项可带角标与演示光标）；章节按时长首尾相接（`acts.ts`），只播放一遍，离开视口时挂起，播放过程 0 React 重渲染。
- **换章版面不动**：各章说明同时收放、手机说明固定高度，避免浏览器滚动锚定把整页滚走。
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
