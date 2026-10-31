# TripCraft · 旅艺 —— 官方交互演示官网 (Showcase Platform)

> **在线展示地址**：[https://johnmaxwell0123.github.io/TripCraft/](https://johnmaxwell0123.github.io/TripCraft/)  
> **代码目录**：`apps/showcase`  
> **技术栈基准**：Next.js 16 (App Router, webpack build), React 19, Tailwind CSS 3.4, Framer Motion 12  
> **设计规范契约**：[Unify GTM 页面美学（2026-10-20 实测复核版）](../../.agents/rules/unify-gtm-design-system.md)

---

## 1. 工程定位与核心使命

`apps/showcase` 是 **TripCraft（旅艺）** 的交互演示站：用一部演示片和一段场景动画讲清产品基线 v3（[PRD-01](../../docs/product/PRD-01-vision-positioning.md)）——旅客用一段对话说清需求，AI 规划自驾路线或匹配持证旅行社的线路，方案进入行程空间、全家多端同步；旅行社在线路工作室上架线路、生成路书、透明报价。访客无需注册登录，滚到哪段就播哪段。

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

## 3. 核心演示区：旅客端演示片 + 定制师的一天

演示区由两段互相独立的舞台组成，讲的是同一家人、同一条线路，详细规格见 [`docs/SHOWCASE-web-design.md` §4](../../docs/SHOWCASE-web-design.md)：

```text
C 端 · 演示片「一根线」（FilmStage，#demo，约 45 秒；2026-10-30 发布会级重拍）
  01 一句话 → 02 两条路 → 03 同一版本 → 04 交给车机
  （一根品牌橙的线从那句话出发：长出需求画像、分岔成两条路、走进领队的手机、
   穿过全家每一块屏——高潮「每一块屏，同一个版本」——出发当天落进车机屏，交给车机导航带路）

B 端 · 定制师的一天（AgencyStage，#agency，约 68 秒，黄昏氛围带）
  09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付
```

- **演示片要让人静音、不读字也记住三件事**：说一句话 AI 就读懂这一家人；全家每一块屏同一个版本；出发当天路线交给车机导航。筛选页、报价、分享路书等能力不在片子里，由能力画廊与 B 端舞台讲（删掉了什么见 SHOWCASE §4.2）。
- **演示片的播放器**（`src/components/film/FilmStage.tsx`）：标题在上，下面是 16:9 宽银幕（画框宽度 < 640px 时换成 9:16 竖屏，手机上通栏，是另一套构图而不是缩小）与一条播放条（播放 / 暂停 / 重播、四个章节、声音开关）；画框露出一半才开始播，离开就停，播完停在片尾。读屏软件读播放器下面的文字版。
- **演示片的部件**（`src/components/film/`，SHOWCASE §4.1「演示片」）：全片一个世界、一台镜头、一根线——`clock.tsx`（以秒计的时钟、镜头的画框与插值、`TimeShift`）、`line.tsx`（线与站点）、`devices.tsx`（手机、电脑、平板、车机）、`screens.tsx`（屏上的真实产品界面）、`opening/Opening.tsx`（01–02，按全片秒书写的 `O`）、`sync/SyncScene.tsx`（03–04，按高潮自己的秒书写的 `T`）、`TravelerFilm.tsx`（把两段接成一部片子，片尾）、`sound.ts`（默认关闭的 WebAudio 提示音）。屏上只放用产品界面令牌写的真界面，屏外是线、标签与片名。
- **演示片的性能**：镜头移动时只做合成（世界层固定光栅，线是实心条），停稳后让需要看清的几块重新光栅；入场之前的设备用 `content-visibility: hidden` 不渲染；会动的片名各自一层；看不见的那几段不跟着时钟重算（`TimeGate`）；演示片里的玻璃退回实色。
- **B 端的共用外壳**：`StageShell.tsx`（rAF 时钟、章节导航、播放控制；`tone="band"` 深色氛围带）与 `AppWindow.tsx`（标题栏与时钟、侧栏、状态栏、手机标签栏；导航项可带角标与演示光标）；章节按时长首尾相接（`acts.ts`），只播放一遍，离开视口时挂起，播放过程 0 React 重渲染；换章时版面不动。B 端 16:20 收到的是同一家人发来的咨询（SHOWCASE §4.0 的数据线）。时间轴在 `agencyTimeline.ts`，整体快慢只改 `StageShell.tsx` 的 `PLAYBACK_RATE`（0.9）。
- **屏上与视窗里的产品界面**（SHOWCASE §4.1「视窗界面规范」，D10 已定的 App 外观）：暖白 · 品牌橙为主，叠在地图上的浮层用玻璃（`.ui-glass`，不支持时退回实色）；组件只用 `globals.css`「产品界面令牌」与 `tailwind.config.ts` 的 `ui-*`。视觉语言与示例线路无关：示意矢量底图（`MapCanvas` + `data/basemap.ts`）、用路线形状生成的封面（`RouteGlyph`）、地点类别配色与图形（`ui.tsx`）。
- **行程皮肤**（docs/09 §9.0）：令牌在 `globals.css`「行程皮肤令牌」与 `tailwind.config.ts` 的 `trip-*`，只挂在 `.trip-surface[data-trip-theme]` 上。原来用在 C 端 04 幕收尾的分享卡片（`ShareRoadbook.tsx`，2026-10-31 随旧舞台删除）；令牌留着，首页目前没有用到。
- **透明度为 0 时同时隐藏**：只靠透明度隐藏的元素用 `useFadeVisibility` / `useFadeStyle`（演示片里是 `useShown`）绑上 `visibility`，iPad Safari 不留残影；显示时取 `inherit`（跟随祖先），不用 `visible`。演示片里整块设备改用 `content-visibility: hidden`：在大子树上切换会继承的 `visibility` 太慢。
- **按视窗宽度排版**（B 端）：视窗是 `container-name: win` 的容器，内部用 `cq-sm / cq-md / cq-lg` 变体（见 `tailwind.config.ts`）。
- **减弱动态效果**：`prefers-reduced-motion` 下两段都不自动播放；演示片的四个章节按钮切换四张静帧，B 端每章展示一张静帧。
- **旧的 C 端舞台**（`ScrollyStage.tsx`、`timeline.ts` 与只属于它的场景文件，连同更早就不挂载的 `ChatScene`、`CockpitScene`、`Deliver`）2026-10-30 起不再挂载，2026-10-31 业主同意后删除；要看旧舞台，到 git 历史里找（删除前的最后一版是 57aef87）。
- **视觉巡检**：控制台执行 `window.__setStageProgress(v)`（演示片，v 为全片进度 0–1；或 `window.__film.seek(秒)`）或 `window.__setAgencyProgress(v)` 跳到任意帧并暂停。演示片的 MP4 用仓库外的巡检脚本按 `window.__film.seek()` 逐帧截图合成；要整屏画面时临时加一个只渲染 `<FilmClock><TravelerFilm /></FilmClock>` 的页面，录完删掉，不进仓库。

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
