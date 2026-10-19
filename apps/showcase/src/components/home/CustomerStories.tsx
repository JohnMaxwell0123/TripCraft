'use client';

/**
 * 设计场景（原「客户故事」）
 *
 * 产品还在设计与原型阶段，没有真实用户，所以这里不放「用户评价」——改为 PRD-03 里的典型场景，
 * 并在标题下写明「不是用户评价」。版式学 Unify 的指标方块：浅石灰平铺块、4px 圆角，
 * 上方是场景编号，中间一句衬线大字，下方是场景说明与角色。数字均为设计目标或演示数据。
 */

const SCENES = [
  {
    code: 'S-C01 · S-C08',
    metric: '追问不超过 3 轮',
    text: '带 70 岁爷爷和 4 岁女儿的五口之家：一段对话说清同行人、身体情况与车高，推断出来的预算单独标出，确认后再让 AI 规划自驾路线。',
    role: '组织者 · 三代同堂自驾',
  },
  {
    code: 'S-C09',
    metric: '23 条线路，1 份咨询',
    text: '同一份需求画像筛出 23 条持证旅行社线路；打开匹配度最高的一条，把住宿升一档看预估价，只把勾选的信息发给这一家旅行社。',
    role: '组织者 · 不想自己开车',
  },
  {
    code: 'S-C02',
    metric: '5 个人，1 个版本',
    text: '家人用邀请链接加入、提名想去的地方；AI 只评估顺不顺路、要不要多开车，由领队确认后，新版本同步到每个人的手机、平板和电脑。',
    role: '组织者与同行家人',
  },
  {
    code: 'S-B06 · S-B08',
    metric: '报价 v1 → v2',
    text: '敦煌的定制师把 Word 行程单上架、生成路书与路线动画；客户想加一天，新报价自动列出差异，版本只增不改，合同与付款在平台外完成。',
    role: '持证旅行社 · 定制师',
  },
];

export function CustomerStories() {
  return (
    <section id="stories" className="scroll-mt-16 bg-[#FFFFF9] pb-24 md:pb-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="u-eyebrow">设计场景</p>
            <h2 className="mt-4 text-balance font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20] sm:text-[40px] lg:text-[44px]">
              四个典型场景，一条主线
            </h2>
          </div>
          <p className="text-base leading-relaxed text-[#241E20]/70 lg:col-span-5">
            取自产品需求文档 PRD-03 的场景清单，用来说明每项能力为谁解决什么问题。它们不是用户评价；数字是设计目标或上面演示里的示例数据。
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SCENES.map((s) => (
            <article key={s.code} className="u-tile flex min-h-[340px] flex-col p-6">
              <p className="font-mono text-[13px] tabular-nums text-[#241E20]/60">{s.code}</p>
              <p className="mt-6 break-keep font-serif text-[28px] font-medium leading-[1.2] tracking-[-0.01em] text-[#241E20] xl:text-[30px]">{s.metric}</p>
              <p className="mt-4 text-[15px] leading-relaxed text-[#241E20]/75">{s.text}</p>
              <p className="mt-auto border-t border-[#241E20]/10 pt-4 text-sm font-medium text-[#241E20]">{s.role}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
