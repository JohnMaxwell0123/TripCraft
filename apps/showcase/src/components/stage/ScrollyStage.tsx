'use client';

import { ACTS, CHAPTER_POINTS, ACT_ORDER, T, type ActId } from './timeline';
import { StageShell, type StageChapter } from './StageShell';
import { AppWindow, type WindowNavItem, type WindowSection } from './AppWindow';
import { Avatar, Grow } from './primitives';
import { RouteGlyph } from './RouteGlyph';
import { TRIPS, type TripSummary } from '@/data/trip';
import { DialogueScene } from './DialogueScene';
import { Workspace } from './Workspace';
import { MatchScene } from './MatchScene';
import { RouteDetail } from './RouteDetail';
import { TripSpaceScene } from './Collab';
import { BuildingIcon, MapIcon, MessageIcon } from '@/components/common/Icons';

/**
 * C 端演示舞台：旅客的完整使用流（PRD-01 §2）
 *
 * 01 AI 对话与需求画像 → 02 路径 A · AI 规划自驾 → 03 路径 B · 线路筛选与详情 → 04 行程空间 · 共享与同步。
 * 一家人、一份需求画像贯穿四幕：01 的画像同时是 02 的规划输入与 03 的筛选条件；02 存下的草案与 03 发出的咨询，
 * 在 04 的行程空间里并排出现。旅行社线路工作室在下方另一段舞台（AgencyStage），不插在旅客流程中间。
 */

const COPY: Record<ActId, { title: string; short: string; desc: string }> = {
  dialogue: {
    title: 'AI 对话与需求画像',
    short: '对话与画像',
    desc: '像和大模型聊天一样说出想法，平台模型或自带 API 都行。AI 每轮只追问一个问题，整理出一份需求画像，推断项单独标出。',
  },
  drive: {
    title: '路径 A · AI 规划自驾',
    short: '路径 A',
    desc: '选自驾，AI 按画像编排九天路线，地点经图商核验。草案存进行程空间后，同一份画像也能直接去看旅行社线路。',
  },
  match: {
    title: '路径 B · 线路筛选与详情',
    short: '路径 B',
    desc: '带着同一份画像看持证旅行社的线路：条件自动套用，调整选项看预估价，确认授权信息后再向旅行社咨询。',
  },
  share: {
    title: '行程空间 · 共享与同步',
    short: '共享同步',
    desc: '等旅行社回复时，全家在行程空间里商量：链接加入、提名地点，领队确认后，新版本同步到每个人的设备。',
  },
};

const CHAPTERS: StageChapter[] = ACT_ORDER.map(([id, duration]) => ({
  id,
  duration,
  range: ACTS[id],
  ...COPY[id],
  ...CHAPTER_POINTS[id],
}));

const NAV: WindowNavItem[] = [
  { id: 'chat', label: '对话', Icon: MessageIcon },
  {
    id: 'trips',
    label: '行程空间',
    Icon: MapIcon,
    // 咨询发出后行程空间出现角标，光标点它进入 04 幕
    badge: { text: '1', range: T.spaceBadge },
    tap: { approach: T.spaceCursor, clickAt: T.spaceClick, hideAt: T.shareScene[1] },
  },
  { id: 'routes', label: '旅行社线路', Icon: BuildingIcon },
];

const SECTIONS: WindowSection[] = [
  { at: ACTS.dialogue[0], nav: 'chat', status: '平台模型 · 今日剩余 18 / 20 次', statusRight: '发送前隐去姓名与证件号' },
  { at: ACTS.drive[0], nav: 'chat', status: '地点与开放时间来自图商核验 · AI 只写推荐理由', statusRight: '每个地点都可以「换一个」' },
  { at: T.saveClick, nav: 'chat', status: '草案已存入行程空间「西行计划」', statusRight: '画像是两条路径的共同输入' },
  { at: T.crossClick, nav: 'routes', status: '按匹配度排序 · 付费推广不影响匹配度', statusRight: '旅行社评分单独显示，不计入匹配度' },
  { at: T.sendClick, nav: 'routes', status: '咨询已发出 · 只含你勾选的信息', statusRight: '回复会出现在行程空间' },
  { at: T.spaceClick, nav: 'trips', status: '行程空间 · 3 人可查看与提名', statusRight: '改动由领队确认后生效' },
  { at: T.version, nav: 'trips', status: 'v1.1 · 已同步到 3 台设备', statusRight: '离线可读' },
];

export function ScrollyStage() {
  return (
    <StageShell
      id="demo"
      ariaLabel="旅客使用流程演示：对话、两条规划路径与行程共享"
      eyebrow="旅客端 · 场景演示"
      title={
        <>
          说清需求，<em className="not-italic text-[#FE3C01]">自驾</em>或<em className="not-italic text-[#FE3C01]">旅行社线路</em>任你选
        </>
      }
      intro="一段对话追问出需求画像。想自己开，AI 规划自驾路线；想省心，看持证旅行社的线路。定下的方案进入行程空间，全家一起看。"
      chapters={CHAPTERS}
      debugHook="__setStageProgress"
      edge="sheet"
    >
      <AppWindow
        title="TripCraft"
        product="TripCraft"
        nav={NAV}
        sections={SECTIONS}
        account={{ avatar: <Avatar name="我" tone="violet" size={24} />, name: '我', note: '3 台设备已登录' }}
        sidebarExtra={<TripList />}
        ariaLabel="TripCraft 旅客端界面演示，内容随左侧章节变化"
      >
        <DialogueScene />
        <Workspace />
        <MatchScene />
        <RouteDetail />
        <TripSpaceScene />
      </AppWindow>
    </StageShell>
  );
}

/* ── 侧栏的行程列表：账号里其他目的地的行程一直在；「西行计划」在 02 幕保存草案时出现在最上面 ── */
function TripList() {
  const [current, ...others] = TRIPS;
  return (
    <div>
      <p className="px-2 text-xs font-medium text-ui-ink-3">我的行程</p>
      <div className="mt-1 flex flex-col">
        <Grow at={[T.saveClick, T.saveClick + 0.006]} max={44}>
          <TripRow trip={current} highlight />
        </Grow>
        {others.map((t) => (
          <TripRow key={t.id} trip={t} />
        ))}
      </div>
    </div>
  );
}

function TripRow({ trip, highlight = false }: { trip: TripSummary; highlight?: boolean }) {
  return (
    <div className={`flex items-center gap-2 rounded-ui-ctl px-1.5 py-1 ${highlight ? 'bg-ui-surface/70' : ''}`}>
      <RouteGlyph trip={trip} className="h-8 w-8 shrink-0 rounded-[8px]" />
      <span className="min-w-0">
        <span className="block truncate text-xs font-medium text-ui-ink">{trip.name}</span>
        <span className="block truncate text-xs text-ui-ink-3">{trip.sub}</span>
      </span>
    </div>
  );
}
