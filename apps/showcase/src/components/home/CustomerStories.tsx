'use client';

export function CustomerStories() {
  const STORIES = [
    {
      metric: '80 km 无人区断网保活',
      quote:
        '自驾川藏线 318 遇到理塘与海子山长达 80 公里无信号盲区，同行其他车的在线协同全部白屏转圈崩溃。TripCraft 离线单文件 HTML 双击秒开，离线高程与补给拓扑全都在！',
      author: '雷队 · 极光纵横自驾领队',
      context: '川藏南线 318 穿越 / 4 辆车队',
      tag: '无人区离线自救',
    },
    {
      metric: '2.28m 车高 100% 避障',
      quote:
        '开腾势 D9 加装车顶行李箱总高整整 2.28 米，进入老城差点误入限高 2.0 米的地下通道。TripCraft 提前在车机中控预警并自动切换至地面专属大车位，保住了我们的车顶箱！',
      author: '程先生 · 全家自驾车主',
      context: '河西走廊 9 日游 / 腾势 D9 混动',
      tag: '物理规则刚性防御',
    },
    {
      metric: '微信群 100% 意图同频',
      quote:
        '以前规划行程全家在微信群里七嘴八舌，长辈想看雪山、孩子想喂土拨鼠。用 TripCraft 微信愿望池发群里，免登录点赞投票，算法自动把大家都想去的景点无缝嵌进日程！',
      author: '林女士 · 三代同堂家庭定制',
      context: '滇西慢行 9 日 / 6 人同行',
      tag: '全团愿望池博弈',
    },
  ];

  return (
    <section className="relative overflow-hidden py-16 sm:py-24 bg-[#FFFFF9] border-t border-[#241E20]/[0.06]">
      <div className="relative mx-auto max-w-[1640px] px-6 sm:px-10 lg:px-12 xl:px-16">
        {/* Section Header (Unify Hanging Quote Section Style) */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold tracking-wider text-[#FE3C01]">
            车主与领队真实见证
          </p>
          <h2 className="mt-3 font-serif text-3xl sm:text-5xl font-normal tracking-tight text-[#241E20] leading-[1.15]">
            万千自驾探索者的行路之选
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#6E6A67]">
            从川西大环线到阿里无人区，听听那些在极端路况下依靠 TripCraft 穿越险阻的车主故事。
          </p>
        </div>

        {/* 3-Card Stories Grid with Unify Hanging Quotes */}
        <div className="grid gap-6 md:grid-cols-3 text-left">
          {storiesToRender(STORIES)}
        </div>
      </div>
    </section>
  );
}

function storiesToRender(stories: Array<{ metric: string; quote: string; author: string; context: string; tag: string }>) {
  return stories.map((s, idx) => (
    <div
      key={idx}
      className="unify-card p-6 sm:p-7 flex flex-col justify-between"
    >
      <div>
        {/* Metric Badge */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#241E20]/[0.06]">
          <span className="font-mono text-base font-bold text-[#FE3C01]">
            {s.metric}
          </span>
          <span className="unify-pill-badge !text-[10px] !py-0.5 font-mono">
            {s.tag}
          </span>
        </div>

        {/* Hanging Quote */}
        <div className="unify-quote text-sm text-[#241E20] leading-relaxed font-normal">
          {s.quote}
        </div>
      </div>

      {/* Author & Context Footer */}
      <div className="mt-6 pt-4 border-t border-[#241E20]/[0.06] flex items-center justify-between">
        <div>
          <span className="font-semibold text-xs text-[#241E20] block">
            {s.author}
          </span>
          <span className="text-[11px] text-[#6E6A67] block mt-0.5">
            {s.context}
          </span>
        </div>
        <span className="h-6 w-6 rounded-full bg-[#241E20]/[0.05] text-[#241E20] font-serif text-xs flex items-center justify-center font-bold">
          ✓
        </span>
      </div>
    </div>
  ));
}
