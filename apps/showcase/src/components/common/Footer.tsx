'use client';

import { scrollToSection } from '@/components/common/Navbar';

/**
 * 收尾行动区 + 页脚（.agents/rules/unify-gtm-design-system.md §11）
 *
 * 夜色氛围带从上一段纸面的圆角下面伸出来：居中的衬线标题与两个入口；
 * 下面一张画布纸色的圆角卡片承载页脚：四列链接（分组名灰色、链接炭黑，均为 15px）、
 * 左下大号「旅」字标，右下版权与 docs/00 §0.3 的三条责任边界。
 */

const REPO = 'https://github.com/JohnMaxwell0123/TripCraft';
const BLOB = `${REPO}/blob/main`;

const COLUMNS: { title: string; links: { label: string; href?: string; section?: string }[] }[] = [
  {
    title: '演示',
    links: [
      { label: '旅客流程', section: 'demo' },
      { label: '线路工作室', section: 'agency' },
      { label: '产品能力', section: 'bento' },
      { label: '设计场景', section: 'stories' },
    ],
  },
  {
    title: '设计文档',
    links: [
      { label: '产品基线 PRD-01', href: `${BLOB}/docs/product/PRD-01-vision-positioning.md` },
      { label: '双路径与线路匹配', href: `${BLOB}/docs/16-planning-paths-and-route-matching.md` },
      { label: '旅行社线路工作室', href: `${BLOB}/docs/17-agency-route-studio.md` },
      { label: '架构决策 ADR', href: `${REPO}/tree/main/docs/architecture/adr` },
    ],
  },
  {
    title: '数据契约',
    links: [
      { label: '需求画像 profile', href: `${BLOB}/spec/profile.schema.json` },
      { label: '行程 trip', href: `${BLOB}/spec/trip.schema.json` },
      { label: '上架线路 listing', href: `${BLOB}/spec/listing.schema.json` },
      { label: '增量补丁 patch', href: `${BLOB}/spec/patch.schema.json` },
    ],
  },
  {
    title: '项目',
    links: [
      { label: 'GitHub 仓库', href: REPO },
      { label: '变更记录', href: `${BLOB}/CHANGELOG.md` },
      { label: '展示站设计规范', href: `${BLOB}/docs/SHOWCASE-web-design.md` },
      { label: 'MIT 许可证', href: `${BLOB}/LICENSE` },
    ],
  },
];

export function Footer() {
  return (
    <footer className="atmo atmo-night -mt-7 pt-[calc(7rem+1.75rem)] text-left md:pt-[calc(9rem+1.75rem)]">
      {/* 收尾行动区 */}
      <div className="mx-auto max-w-[1320px] px-5 text-center sm:px-8 lg:px-10">
        <h2 className="mx-auto max-w-[820px] break-keep font-serif text-[34px] font-semibold leading-[1.12] tracking-[-0.02em] text-[#FFFFF9] sm:text-[48px] lg:text-[56px]">
          从一句话需求，到全家同步的行程
        </h2>
        <p className="mx-auto mt-5 max-w-[620px] text-[17px] leading-relaxed text-[#FFFFF9]/80 sm:text-lg">
          TripCraft 还在设计与原型阶段，上面的演示用的是示例数据。产品基线、架构决策与数据契约都在仓库里公开。
        </p>
        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={() => scrollToSection('demo')} className="u-btn u-btn-light">
            看旅客完整流程
          </button>
          <a href={REPO} target="_blank" rel="noreferrer" className="u-btn text-[#FFFFF9] shadow-[inset_0_0_0_1px_rgba(255,255,249,0.35)] hover:shadow-[inset_0_0_0_1px_rgba(255,255,249,0.7)]">
            GitHub 仓库
          </a>
        </div>
      </div>

      {/* 页脚纸面 */}
      <div className="mx-auto mt-24 max-w-[1320px] px-3 pb-6 sm:px-6 md:mt-32 lg:px-8">
        <div className="rounded-[10px] bg-[#FFFFF9] px-6 pb-8 pt-12 sm:px-10 sm:pb-10">
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="text-[15px] font-medium text-[#6F6A64]">{col.title}</p>
                <ul className="mt-4 space-y-3">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      {l.section ? (
                        <button type="button" onClick={() => scrollToSection(l.section!)} className="text-left text-[15px] text-[#241E20]">
                          <span className="u-link pb-0.5">{l.label}</span>
                        </button>
                      ) : (
                        <a href={l.href} target="_blank" rel="noreferrer" className="text-[15px] text-[#241E20]">
                          <span className="u-link pb-0.5">{l.label}</span>
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-4">
              <span aria-hidden className="flex h-20 w-20 items-center justify-center rounded-[8px] bg-[#241E20] font-serif text-[44px] font-bold leading-none text-[#FFFFF9] sm:h-24 sm:w-24 sm:text-[52px]">
                旅
              </span>
              <p className="pb-1 text-[15px] leading-snug text-[#241E20]">
                <span className="block text-lg font-bold tracking-tight">TripCraft</span>
                <span className="block text-[#241E20]/65">旅艺 · 多端同步、多人共享的 AI 旅行规划 App</span>
              </p>
            </div>
            <div className="max-w-[560px] text-[13px] leading-relaxed text-[#6F6A64] md:text-right">
              <p>
                TripCraft 不是旅行社，也不是导航软件：线路由持证旅行社提供，匹配度为信息参考，预估价以旅行社正式报价为准，合同与付款由旅客与旅行社直接签订；实际行车请以车辆导航系统与现场交通标识为准。
              </p>
              <p className="mt-3">© 2026 TripCraft 项目 · MIT 许可证</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
