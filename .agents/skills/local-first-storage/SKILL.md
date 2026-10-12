---
name: local-first-storage
description: >-
  Use this skill when designing, implementing, or debugging Local-First architecture, IndexedDB persistent storage, offline fallback strategies, zero-build self-contained single-file HTML export, or AJV schema validation.
---

# 本地优先架构与离线自包含交付规范 (Local-First Storage)

本 Skill 指导 TripCraft 项目核心技术底座落地：贯彻“本地优先（Local-First）”、“零构建交付（Zero-Build Delivery）”与“单文件自包含离线快照（C-SNAPSHOT）”。

---

## 1. 本地优先核心设计原则

1. **客户端数据主权 (Data Sovereignty)**：
   - 核心读写逻辑首选发生在端内 IndexedDB，用户在弱网或完全离线环境下可无损阅览、标记已打卡点位、记录旅行笔记。
   - 网络恢复后，通过增量补丁（TripPatch）与云端进行异步合流。
2. **DSL 为唯一真相源 (Single Source of Truth)**：
   - 所有前端编辑操作均映射为对符合 `spec/trip.schema.json` 的 AST 变更。
   - 出库、持久化与网络交换前，强制调用 AJV 2020-12 进行数据校验。

---

## 2. IndexedDB 存储工程标准

建议使用轻量 Promise 封装库 `idb`：

### 推荐表结构设计 (Object Stores)
- `trips`：存放完整的路书对象，以 `trip_id` 为主键。
- `patches`：存放未同步到云端或对端设备的本地编辑增量补丁，按时间戳排序。
- `media_cache`：存放本地照片原图 Blob、EXIF 元数据与已生成的缩略图，避免上传云端泄露隐私。

### 示例代码骨架：
```ts
import { openDB, type DBSchema } from 'idb';

interface TripCraftDB extends DBSchema {
  trips: {
    key: string;
    value: { id: string; dsl: any; updatedAt: number };
  };
  patches: {
    key: string;
    value: { id: string; tripId: string; op: any; timestamp: number };
    indexes: { 'by-trip': string };
  };
}

export async function initStorage() {
  return openDB<TripCraftDB>('tripcraft-local', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('trips')) {
        db.createObjectStore('trips', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('patches')) {
        const patchStore = db.createObjectStore('patches', { keyPath: 'id' });
        patchStore.createIndex('by-trip', 'tripId');
      }
    },
  });
}
```

---

## 3. 零构建单文件自包含 HTML 打包规范 (C-SNAPSHOT)

C-SNAPSHOT 是极端弱网下的灾难级容灾底牌，必须做到：**双击即开、零外部网络依赖、零 npm 运行时依赖。**

### 单文件构建四大硬指标：
1. **样式内联**：所有 CSS 规则统一编译提取并以内联 `<style>` 标签注入 HTML `<head>`，禁止依赖外部 CDN CSS 链接。
2. **脚本自包含**：渲染运行时（包括时间轴展开折叠、海拔高程 Canvas 绘制、SVG 地图交互）编译为纯 Vanilla JS，以内联 `<script>` 标签注入文档尾部。
3. **资源 Data-URI 化**：所有小图标优先使用内联 `<svg>`；必备图片转换为 Base64 `data:image/webp;base64,...` 嵌入。
4. **数据直注**：DSL JSON 数据作为全局常量直接写在 HTML 中：
   ```html
   <script id="trip-dsl-payload" type="application/json">
     <!-- JSON 字符串序列化注入 -->
   </script>
   ```
5. **完整性存证**：HTML 头部自动生成并声明 SHA-256 哈希防篡改指纹。
