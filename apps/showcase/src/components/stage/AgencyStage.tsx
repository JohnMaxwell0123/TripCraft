'use client';

import { AGENCY_ACTS, AGENCY_ORDER, AGENCY_POINTS, AT, type AgencyActId } from './agencyTimeline';
import { StageShell, type StageChapter } from './StageShell';
import { AppWindow, type WindowNavItem, type WindowSection } from './AppWindow';
import { StudioImport } from './StudioImport';
import { StudioListing } from './StudioListing';
import { StudioRoadbook } from './StudioRoadbook';
import { InquiryNotice, StudioInbox } from './StudioInbox';
import { BarChartIcon, InboxIcon, MapIcon, ReceiptIcon } from '@/components/common/Icons';

/**
 * B 端演示舞台：旅行社定制师的一天（docs/17 旅行社线路工作室）
 *
 * 09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付。
 * 同一位定制师、同一条线路、同一天：标题栏时钟随章节推进；16:20 收到的咨询就是上方 C 端那一家人发出的
 * （同一份需求画像、同一条线路、同一组价格 ¥7,040 → ¥7,940）。与 C 端舞台是两段独立的动画：各自的章节、进度与节奏。
 */

const COPY: Record<AgencyActId, { title: string; short: string; desc: string; time: string }> = {
  import: {
    time: '09:30',
    title: '导入已有的行程单',
    short: '导入',
    desc: '拖入现有的 Word 行程单，AI 抽成逐日行程；置信度低的字段与原文并排、逐项确认，没有「全部接受」。',
  },
  listing: {
    time: '10:40',
    title: '填写上架信息',
    short: '上架信息',
    desc: '价格规则、可调选项、包含与不包含逐项写清；价格展示档位由旅行社自选，「适合长辈」必须附可核验的说明。',
  },
  roadbook: {
    time: '14:00',
    title: '生成路书与路线动画',
    short: '路书动画',
    desc: '一键生成交互路书与 45 秒路线动画并发布。AI 撰写的介绍显式标注，图片逐张标明实拍或示意。',
  },
  inbox: {
    time: '16:20',
    title: '咨询、报价与交付',
    short: '咨询报价',
    desc: '上面那一家人的咨询到了，只带他们授权的信息。报价按版本留痕；平台外签约付款后，以旅行社的品牌交付路书。',
  },
};

const CHAPTERS: StageChapter[] = AGENCY_ORDER.map(([id, duration]) => ({
  id,
  duration,
  range: AGENCY_ACTS[id],
  ...COPY[id],
  ...AGENCY_POINTS[id],
}));

const NAV: WindowNavItem[] = [
  { id: 'routes', label: '线路', Icon: MapIcon },
  {
    id: 'inbox',
    label: '咨询',
    Icon: InboxIcon,
    badge: { text: '1', range: AT.inboxBadge },
    tap: { approach: AT.inboxNavCursor, clickAt: AT.inboxNavClick, hideAt: AT.inboxScene[1] },
  },
  { id: 'quotes', label: '报价', Icon: ReceiptIcon },
  { id: 'insights', label: '数据', Icon: BarChartIcon },
];

const SECTIONS: WindowSection[] = [
  { at: AGENCY_ACTS.import[0], time: '09:30', nav: 'routes', status: '原文件已保留，随时可与抽取结果对照', statusRight: '抽取结果是草稿，确认前不会上架' },
  { at: AGENCY_ACTS.listing[0], time: '10:40', nav: 'routes', status: '草稿已自动保存', statusRight: '成本价不会展示给旅客或其他旅行社' },
  { at: AGENCY_ACTS.roadbook[0], time: '14:00', nav: 'routes', status: 'AI 撰写的文字与生成的画面均有标注', statusRight: '图片逐张标注实拍 / 示意' },
  { at: AT.publishClick, time: '14:12', nav: 'routes', status: '已发布 · 线路开始参与匹配', statusRight: '付费推广不影响匹配度' },
  { at: AGENCY_ACTS.inbox[0], time: '16:20', nav: 'routes', status: '新咨询 · 只含旅客授权发送的信息', statusRight: '联系方式在旅客同意后可见' },
  { at: AT.inboxNavClick, time: '16:20', nav: 'inbox', status: '沟通记录仅你与这位旅客可见', statusRight: '婉拒须注明原因，用于更新团期与匹配' },
  { at: AT.sendV1Click, time: '16:32', nav: 'inbox', status: '报价 v1 已发送', statusRight: '报价只增不改，每版留痕' },
  { at: AT.travelerMsg[0], time: '16:41', nav: 'inbox', status: '旅客提出调整', statusRight: '报价只增不改，每版留痕' },
  { at: AT.sendV2Click, time: '16:45', nav: 'inbox', status: '报价 v2 已发送 · 与 v1 的差异已列出', statusRight: '报价只增不改，每版留痕' },
  { at: AT.accepted[0], time: '16:58', nav: 'inbox', status: '旅客已接受报价 v2', statusRight: '合同与付款在平台外完成，平台不经手团款' },
  { at: AT.deliverClick, time: '17:06', nav: 'inbox', status: '白标路书已交付到旅客的行程空间', statusRight: '路书中不出现 TripCraft 标识' },
];

export function AgencyStage() {
  return (
    <StageShell
      id="agency"
      ariaLabel="旅行社线路工作室演示：导入行程单、上架、生成路书与报价交付"
      eyebrow="旅行社端 · 场景演示"
      title={
        <>
          定制师的<em className="not-italic text-[#FF6A3D]">一天</em>
        </>
      }
      intro="同一天，线路的另一端：持证旅行社把已有的行程单变成能被匹配的线路，生成路书、透明报价。下午收到的，正是上面那一家人的咨询。"
      chapters={CHAPTERS}
      debugHook="__setAgencyProgress"
      tone="band"
    >
      <AppWindow
        title="TripCraft 线路工作室"
        product="线路工作室"
        nav={NAV}
        sections={SECTIONS}
        account={{
          avatar: <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1F4E5A] text-xs font-semibold text-white">林</span>,
          name: '林舟 · 定制师',
          note: '敦煌某国际旅行社',
        }}
        ariaLabel="TripCraft 线路工作室（旅行社端）界面演示，内容随左侧章节变化"
      >
        <StudioImport />
        <StudioListing />
        <StudioRoadbook />
        <StudioInbox />
        <InquiryNotice />
      </AppWindow>
    </StageShell>
  );
}
