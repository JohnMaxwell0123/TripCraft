import { buildActs } from './acts';

/**
 * B 端演示舞台时间轴：旅行社定制师的一天（docs/17）
 *
 *   09:30 导入行程单 → 10:40 填写上架信息 → 14:00 生成路书与路线动画 → 16:20 咨询、报价与交付
 *
 * 与 C 端舞台（timeline.ts）各自一条全局进度 0 → 1，互不影响；幕次同样按时长比例首尾相接（acts.ts）。
 */

export const AGENCY_ORDER = [
  ['import', 13000],
  ['listing', 15000],
  ['roadbook', 12000],
  ['inbox', 20000],
] as const;

export type AgencyActId = (typeof AGENCY_ORDER)[number][0];

const table = buildActs(AGENCY_ORDER);
export const AGENCY_ACTS = table.acts;
/** 秒 → 全局进度跨度 */
export const bsec = table.sec;

const FADE = bsec(0.35);
const cover = (t: number) => [t, t + bsec(0.02)] as const;
const sceneIn = (at: number) => [at, at + FADE] as const;

const im = (t: number) => table.actAt('import', t);
const li = (t: number) => table.actAt('listing', t);
const rb = (t: number) => table.actAt('roadbook', t);
const ib = (t: number) => table.actAt('inbox', t);

/** 上架信息的五个小节依次填写 */
const SECTION_AT = [li(0.03), li(0.2), li(0.37), li(0.54), li(0.71)] as const;

export const AT = {
  /* ── 01 导入行程单：AI 抽取为逐日行程，低置信度字段逐项确认（§17.3） ─────── */
  importScene: [-1, -0.5, ...cover(li(0) + FADE)] as const,
  dropFile: [im(0.03), im(0.07)] as const,
  upload: [im(0.05), im(0.12)] as const,
  parsing: [im(0.12), im(0.2)] as const,
  sourceIn: [im(0.12), im(0.16)] as const,
  dayRows: [im(0.2), im(0.4)] as const,
  reviewCount: im(0.42),
  flag1Cursor: [im(0.44), im(0.48)] as const,
  flag1Click: im(0.49),
  popover1: [im(0.49), im(0.51), im(0.6), im(0.62)] as const,
  confirm1Cursor: [im(0.53), im(0.57)] as const,
  confirm1Click: im(0.58),
  flag2Cursor: [im(0.63), im(0.66)] as const,
  flag2Click: im(0.67),
  popover2: [im(0.67), im(0.69), im(0.76), im(0.78)] as const,
  confirm2Cursor: [im(0.7), im(0.73)] as const,
  confirm2Click: im(0.74),
  allConfirmed: im(0.78),
  importNextCursor: [im(0.82), im(0.87)] as const,
  importNextClick: im(0.89),

  /* ── 02 上架信息：价格规则 · 可调选项 · 包含 / 不包含 · 价格展示档位 · 人群适配（§17.4–§17.5） ─────── */
  listingScene: [...sceneIn(li(0)), ...cover(rb(0) + FADE)] as const,
  sectionAt: SECTION_AT,
  sectionFade: bsec(0.25),
  priceRows: [li(0.06), li(0.16)] as const,
  optionRows: [li(0.24), li(0.34)] as const,
  includeRows: [li(0.41), li(0.5)] as const,
  tierCursor: [li(0.58), li(0.62)] as const,
  tierClick: li(0.63),
  elderNote: [li(0.74), li(0.83)] as const,
  childNote: [li(0.84), li(0.89)] as const,
  /** 完整度在每个小节填完时上升 */
  completeness: [li(0.17), li(0.34), li(0.51), li(0.64), li(0.89)] as const,
  listingNextCursor: [li(0.9), li(0.94)] as const,
  listingNextClick: li(0.95),

  /* ── 03 一键生成 AI 交互路书与路线动画（§17.6） ─────── */
  roadbookScene: [...sceneIn(rb(0)), ...cover(ib(0) + FADE)] as const,
  genCursor: [rb(0.04), rb(0.09)] as const,
  genClick: rb(0.1),
  genSteps: [rb(0.14), rb(0.19), rb(0.24)] as const,
  resultIn: [rb(0.26), rb(0.3)] as const,
  reelDraw: [rb(0.3), rb(0.78)] as const,
  roadbookCards: [rb(0.38), rb(0.46), rb(0.54)] as const,
  publishCursor: [rb(0.8), rb(0.85)] as const,
  publishClick: rb(0.86),
  publishedToast: [rb(0.87), rb(0.9)] as const,

  /* ── 04 咨询 → 报价 v1 → 旅客调整 → v2 自动列出差异 → 成交 → 白标交付（§17.7） ─────── */
  inboxScene: [...sceneIn(ib(0))] as const,
  inquiryArrive: [ib(0.04), ib(0.08)] as const,
  openCursor: [ib(0.09), ib(0.13)] as const,
  openClick: ib(0.14),
  summaryIn: [ib(0.14), ib(0.18)] as const,
  quoteCursor: [ib(0.2), ib(0.24)] as const,
  quoteClick: ib(0.25),
  quoteV1: [ib(0.25), ib(0.31)] as const,
  sendV1Cursor: [ib(0.33), ib(0.36)] as const,
  sendV1Click: ib(0.37),
  travelerMsg: [ib(0.42), ib(0.46)] as const,
  v2Cursor: [ib(0.48), ib(0.51)] as const,
  v2Click: ib(0.52),
  quoteV2: [ib(0.52), ib(0.58)] as const,
  sendV2Cursor: [ib(0.6), ib(0.63)] as const,
  sendV2Click: ib(0.64),
  accepted: [ib(0.68), ib(0.71)] as const,
  closeCard: [ib(0.72), ib(0.75)] as const,
  closeCursor: [ib(0.76), ib(0.79)] as const,
  closeClick: ib(0.8),
  deliverCursor: [ib(0.82), ib(0.85)] as const,
  deliverClick: ib(0.86),
  whiteLabel: [ib(0.86), ib(0.89)] as const,
} as const;

/** 每章的手动切入点与静帧（章内局部进度） */
export const AGENCY_POINTS: Record<AgencyActId, { enter: number; still: number }> = {
  import: { enter: 0, still: 0.8 },
  listing: { enter: (FADE + bsec(0.05)) / (AGENCY_ACTS.listing[1] - AGENCY_ACTS.listing[0]), still: 0.895 },
  roadbook: { enter: (FADE + bsec(0.05)) / (AGENCY_ACTS.roadbook[1] - AGENCY_ACTS.roadbook[0]), still: 0.8 },
  inbox: { enter: (FADE + bsec(0.05)) / (AGENCY_ACTS.inbox[1] - AGENCY_ACTS.inbox[0]), still: 0.97 },
};
