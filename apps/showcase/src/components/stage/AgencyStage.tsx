'use client';

import { AGENCY_ACTS, AGENCY_ORDER, AGENCY_POINTS, AT, type AgencyActId } from './agencyTimeline';
import { StageShell, type StageChapter } from './StageShell';
import { AppWindow, type WindowNavItem, type WindowSection } from './AppWindow';
import { StudioImport } from './StudioImport';
import { StudioListing } from './StudioListing';
import { StudioRoadbook } from './StudioRoadbook';
import { StudioInbox } from './StudioInbox';
import { BarChartIcon, CheckIcon, InboxIcon, MapIcon, ReceiptIcon } from '@/components/common/Icons';

/**
 * B 端演示舞台：旅行社定制师的一天（docs/17 旅行社线路工作室）
 *
 * 09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付。
 * 与上方的 C 端舞台是两段独立的动画：各自的章节、进度与节奏。
 */

const COPY: Record<AgencyActId, { title: string; short: string; desc: string; time: string }> = {
  import: {
    time: '09:30',
    title: '导入已有的行程单',
    short: '导入',
    desc: '拖入现有的 Word 行程单，AI 抽取为逐日行程。置信度低的字段高亮，点开与原文并排核对、逐项确认，不提供「全部接受」；地点经图商核验。',
  },
  listing: {
    time: '10:40',
    title: '填写上架信息',
    short: '上架信息',
    desc: '价格规则、可调选项、包含 / 不包含逐项写清；价格展示用起价、区间还是分项明细由旅行社自己选；「适合长辈」这类标签必须附一句可核验的说明。',
  },
  roadbook: {
    time: '14:00',
    title: '生成路书与路线动画',
    short: '路书动画',
    desc: '一键生成交互路书与 45 秒路线动画，发布到线路详情。AI 撰写的介绍显式标注，图片逐张标明实拍或示意，不生成景点照片。',
  },
  inbox: {
    time: '16:20',
    title: '咨询、报价与交付',
    short: '咨询报价',
    desc: '咨询只带旅客授权发送的信息。报价 v1 发出后旅客想加一天，v2 自动列出差异；合同与付款在平台外完成，成交后以旅行社自己的品牌交付路书。',
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
  { id: 'inbox', label: '咨询', Icon: InboxIcon, badge: { text: '1', range: [AT.inquiryArrive[0], AT.openClick] } },
  { id: 'quotes', label: '报价', Icon: ReceiptIcon },
  { id: 'insights', label: '数据', Icon: BarChartIcon },
];

const SECTIONS: WindowSection[] = [
  { at: AGENCY_ACTS.import[0], nav: 'routes', status: '原文件已保留，随时可与抽取结果对照', statusRight: '抽取结果是草稿，确认前不会上架' },
  { at: AGENCY_ACTS.listing[0], nav: 'routes', status: '草稿已自动保存', statusRight: '成本价不会展示给旅客或其他旅行社' },
  { at: AGENCY_ACTS.roadbook[0], nav: 'routes', status: 'AI 撰写的文字与生成的画面均有标注', statusRight: '图片逐张标注实拍 / 示意' },
  { at: AGENCY_ACTS.inbox[0], nav: 'inbox', status: '沟通记录仅你与这位旅客可见', statusRight: '婉拒须注明原因，用于更新团期与匹配' },
];

export function AgencyStage() {
  return (
    <StageShell
      id="agency"
      ariaLabel="旅行社线路工作室演示：导入行程单、上架、生成路书与报价交付"
      eyebrow="旅行社 · 线路工作室"
      title={
        <>
          定制师的一天：
          <br />
          把行程单变成能被匹配的线路
        </>
      }
      intro="旅游仍然依赖本地资源。线路工作室让持证旅行社把已有的行程单上架、被需求相符的旅客匹配到，用交互路书和路线动画讲清线路，再用按版本留痕的透明报价把咨询谈成。"
      chapters={CHAPTERS}
      debugHook="__setAgencyProgress"
      tone="module"
    >
      <AppWindow
        title="TripCraft 线路工作室"
        product="线路工作室"
        nav={NAV}
        sections={SECTIONS}
        account={{
          avatar: <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1F4E5A] text-xs font-semibold text-white">敦</span>,
          name: '敦煌某国际旅行社',
          note: (
            <span className="inline-flex items-center gap-1 text-[#0E7A5A]">
              <CheckIcon className="h-3 w-3" />
              资质已认证
            </span>
          ),
        }}
        ariaLabel="TripCraft 线路工作室（旅行社端）界面演示，内容随左侧章节变化"
      >
        <StudioImport />
        <StudioListing />
        <StudioRoadbook />
        <StudioInbox />
      </AppWindow>
    </StageShell>
  );
}
