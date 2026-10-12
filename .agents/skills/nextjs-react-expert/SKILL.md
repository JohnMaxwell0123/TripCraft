---
name: nextjs-react-expert
description: >-
  Use this skill when developing Next.js (App Router) and React components, setting up Server/Client component boundaries, managing state (Zustand + TanStack Query), resolving hydration errors, or optimizing Core Web Vitals.
---

# Next.js App Router 与 React 架构规范 (Next.js & React Expert)

本 Skill 提供 Next.js 14+（App Router 架构）与 React 18/19 深度开发指导，规范服务端组件 (RSC) 与客户端组件划分、多层状态管理、水合错误防御及性能调优。

---

## 1. RSC 与 Client Component 架构边界

### 黄金法则：把 `'use client'` 推向组件树的最叶子节点

- **默认 Server Components (RSC)**：
  - 页面布局 (`layout.tsx`)、静态内容、SEO 元数据 (`generateMetadata`)、服务端数据预拉取与 SSG 静态渲染。
  - 优势：零客户端 JS 体积、首屏直出 HTML 秒开。
- **Client Components (`'use client'`)**：
  - 仅用于：具有用户交互事件 (`onClick`, `onChange`)、使用 React Hook (`useState`, `useEffect`, `useRef`)、调用浏览器专属 API (`window`, `localStorage`, `IndexedDB`)、第三方需要客户端上下文的库（高德地图 SDK、动画库）。

### 错误范式 vs 推荐范式
❌ **错误范式**：在整个 `page.tsx` 或大型容器组件顶部盲目添加 `'use client'`，导致整页失去服务端渲染与流式加载优势。  
✅ **推荐范式**：容器作为 RSC，将需要交互的子组件（如 `LikeButton`, `MapCanvas`, `ThemeToggle`）单独抽取并标记 `'use client'`，通过 `children` 或 Props 插入。

---

## 2. 状态管理三层架构

避免“一个全局 Store 塞入所有数据”的单体混乱，采用分层设计：

```
┌─────────────────────────────────────────────────────────────┐
│ 1. 瞬时 UI 状态 (Transient UI State) -> Zustand             │
│    - 弹窗开关、当前激活 Tab、侧边栏折叠、地图选中的点位 ID  │
├─────────────────────────────────────────────────────────────┤
│ 2. 异步服务端缓存 (Server Cache) -> @tanstack/react-query   │
│    - 接口数据、自动重试、弱网去重、乐观更新 (Optimistic UI) │
├─────────────────────────────────────────────────────────────┤
│ 3. 本地优先持久化 (Local-First Storage) -> IndexedDB (idb)  │
│    - 离线路书数据、本地照片聚类缓存、未同步的增量补丁流     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 防御水合不一致 (Hydration Mismatch)

React 在服务端渲染的 HTML 与客户端首次渲染的 DOM 不一致时会抛出 Hydration Error。

### 常见雷区与标准解法：
1. **浏览器特定对象访问**（`localStorage`, `window.innerWidth`, `navigator.userAgent`）：
   ```tsx
   // 推荐：封装 useMounted Hook
   export function useMounted() {
     const [mounted, setMounted] = useState(false);
     useEffect(() => { setMounted(true); }, []);
     return mounted;
   }
   ```
2. **时间与随机数生成**（如 `new Date().toLocaleTimeString()` 或 `Math.random()`）：
   - 禁止在组件初次渲染直接计算客户端时间，在 `useEffect` 中赋值或通过服务端 Props 传入固定快照时间。
3. **不可避免的外部动态内容**：
   - 在包裹元素上添加 `suppressHydrationWarning`（仅限必要节点，不可滥用）。

---

## 4. Core Web Vitals (CWV) 性能指标调优

| 指标 | 目标 | 调优手段 |
| :--- | :--- | :--- |
| **LCP (最大内容绘制)** | `< 2.5s` | 首屏核心大图使用 `<Image priority fetchPriority="high" />`；关键字体预加载；服务端组件流式直出关键内容。 |
| **INP (交互到下次绘制)** | `< 200ms` | 耗时运算（如百万点位路线计算、EXIF 图片解析）移交 Web Worker；防抖防节流输入。 |
| **CLS (累积布局偏移)** | `< 0.1` | 所有图片与视频必须显式提供 `width/height` 或 `aspect-ratio` 容器；骨架屏 (Skeleton) 保持与真实内容等高。 |
