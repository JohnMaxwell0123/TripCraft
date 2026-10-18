'use client';

import { ACTS, CHAPTER_POINTS, ACT_ORDER, T, type ActId } from './timeline';
import { StageShell, type StageChapter } from './StageShell';
import { AppWindow, type WindowNavItem, type WindowSection } from './AppWindow';
import { Avatar } from './primitives';
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
 * 旅行社线路工作室在下方另一段舞台（AgencyStage），不插在旅客流程中间。
 */

const COPY: Record<ActId, { title: string; short: string; desc: string }> = {
  dialogue: {
    title: 'AI 对话与需求画像',
    short: '对话与画像',
    desc: '像和大模型聊天一样说出想法，平台模型或自带 API 都行。AI 每轮只追问一个问题，把同行人、身体情况、车辆与预算整理成一张需求画像，推断项单独标出、请你确认。',
  },
  drive: {
    title: '路径 A · AI 规划自驾',
    short: '路径 A',
    desc: '选自驾，AI 按画像编排九天路线：车程、午休、限高停车都已考虑；地点与开放时间来自图商核验，模型只写建议。结果页底部提示有相似的旅行社线路。',
  },
  match: {
    title: '路径 B · 线路筛选与详情',
    short: '路径 B',
    desc: '想省心就看持证旅行社的线路：价格滑块上方是真实的价格分布，来自需求的条件自动选中。打开详情调整选项即可看到预估价，再决定把哪些信息发给旅行社。',
  },
  share: {
    title: '行程空间 · 共享与同步',
    short: '共享同步',
    desc: '方案进入行程空间，家人用链接加入、提名想去的地方；AI 只评估顺不顺路，由领队确认。确认后的新版本同步到每个人的手机、平板和电脑，离线也能看。',
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
  { id: 'trips', label: '行程空间', Icon: MapIcon },
  { id: 'routes', label: '旅行社线路', Icon: BuildingIcon },
];

const SECTIONS: WindowSection[] = [
  { at: ACTS.dialogue[0], nav: 'chat', status: '平台模型 · 今日剩余 18 / 20 次', statusRight: '发送前隐去姓名与证件号' },
  { at: ACTS.drive[0], nav: 'trips', status: '地点与开放时间来自图商核验 · AI 只写推荐理由', statusRight: '每个地点都可以「换一个」' },
  { at: ACTS.match[0], nav: 'routes', status: '按匹配度排序 · 付费推广不影响匹配度', statusRight: '旅行社评分单独显示，不计入匹配度' },
  { at: ACTS.share[0], nav: 'trips', status: '行程空间 · 3 人可查看与提名', statusRight: '改动由领队确认后生效' },
  { at: T.version, nav: 'trips', status: 'v1.1 · 已同步到 3 台设备', statusRight: '离线可读' },
];

export function ScrollyStage() {
  return (
    <StageShell
      id="demo"
      ariaLabel="旅客使用流程演示：对话、两条规划路径与行程共享"
      eyebrow="旅客 · 一段对话到全家同步"
      title={
        <>
          说清需求，
          <br />
          自驾或旅行社线路任你选
        </>
      }
      intro="像和大模型聊天一样说出想法，AI 追问出一份需求画像；自驾就让 AI 规划路线，想省心就看持证旅行社的线路。定下的方案进入行程空间，全家一起看、多端同步。"
      chapters={CHAPTERS}
      debugHook="__setStageProgress"
    >
      <AppWindow
        title="TripCraft"
        product="TripCraft"
        nav={NAV}
        sections={SECTIONS}
        account={{ avatar: <Avatar name="我" tone="gold" size={24} />, name: '我', note: '3 台设备已登录' }}
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
