'use client';

import { useEffect, useId, useRef, useState, type RefObject } from 'react';
import { TRIPS, type TripSummary } from '@/data/trip';
import { RouteGlyph } from '@/components/stage/RouteGlyph';
import { ArrowLeftIcon, LinkIcon, SparklesIcon } from '@/components/common/Icons';

/**
 * 能力画廊 · 可分享的路书（PRD-03 S-C10；docs/09 §9.0；PRD-01 D9、D10）
 *
 * 行程定下来后，AI 按途经地区与季节把它归到五个主题族之一、生成一套行程皮肤，用路线形状画封面（标「示意」），
 * 做成只读的分享页；亲友点「我也做一份」进入 AI 对话，只记来源，不带分享者的个人信息。
 * 访客在这里换一条路线，皮肤跟着路线变：皮肤是按路线生成的，不是挑出来的。
 * 皮肤只作用于 .trip-surface 里的行程内容；页脚的「用 TripCraft 制作」、AI 生成标识与「我也做一份」是平台层，
 * 用产品界面令牌（data-ui），不随皮肤变。会员的手动定制只写一句，不演示。
 * 三条路线都是示例数据；这张卡里的字不小于 13px。
 */

type SkinId = 'dunhuang-gold' | 'plateau-cyan' | 'jiangnan-emerald';

/**
 * 每个主题族里哪种颜色能写小字（对比度见 globals.css「行程皮肤令牌」），封面渐变取主题自己的两种颜色。
 * 标题字体照 docs/09：敦煌金用衬线，高原青用无衬线、字距略宽，江南翠的楷体没有加载，用衬线代替。
 */
const SKIN_STYLE: Record<SkinId, { kicker: string; badge: string; title: string; cover: readonly [string, string] }> = {
  'dunhuang-gold': {
    kicker: 'text-trip-accent',
    badge: 'bg-trip-secondary/10 text-trip-secondary',
    title: 'font-serif',
    cover: ['rgb(var(--trip-primary))', 'rgb(var(--trip-accent))'],
  },
  'plateau-cyan': {
    kicker: 'text-trip-primary',
    badge: 'bg-trip-primary/[0.08] text-trip-primary',
    title: 'tracking-[0.04em]',
    cover: ['rgb(var(--trip-primary))', 'rgb(var(--trip-ink))'],
  },
  'jiangnan-emerald': {
    kicker: 'text-trip-accent',
    badge: 'bg-trip-primary/10 text-trip-primary',
    title: 'font-serif',
    cover: ['rgb(var(--trip-primary))', 'rgb(var(--trip-secondary))'],
  },
};

interface ShareRoute {
  id: string;
  label: string;
  trip: TripSummary;
  kicker: string;
  title: string;
  meta: string;
  highlights: ReadonlyArray<readonly [day: string, title: string, note: string]>;
  skin: { id: SkinId; name: string; reason: string };
}

/** 五个主题族与归类依据（docs/09 §9.2 的「触发」，摘要）；圆点是各自的主色，只作图例 */
const FAMILIES: ReadonlyArray<{ id: string; name: string; dot: string; when: string }> = [
  { id: 'dunhuang-gold', name: '敦煌金', dot: '#B8863B', when: '甘肃 · 青海 · 新疆 · 丝路沿线' },
  { id: 'cyber-blue', name: '赛博蓝', dot: '#00A3FF', when: '一线城市 · 港澳 · 夜景城市行' },
  { id: 'plateau-cyan', name: '高原青', dot: '#1E6F8C', when: '西藏 · 川西 · 甘南 · 高海拔' },
  { id: 'jiangnan-emerald', name: '江南翠', dot: '#3E6B5A', when: '江浙沪 · 皖南 · 水乡 · 园林' },
  { id: 'glacier-silver', name: '冰川银', dot: '#5A6B78', when: '雪山 · 极地 · 无法归类时兜底' },
];

const [XIXING, CHUANXI] = TRIPS;

/** 江南这条只在这张卡里用：苏州 → 同里 → 西塘 → 乌镇 → 杭州（近似经纬度） */
const JIANGNAN: TripSummary = {
  id: 'jiangnan',
  name: '水乡慢游',
  sub: '江南 · 5 天',
  palette: 'emerald',
  shape: [[120.62, 31.32], [120.72, 31.16], [120.89, 30.94], [120.49, 30.75], [120.16, 30.27]],
};

/** 分享页先脱敏：只写地点与安排，不写同行人的姓名；河西走廊这条是演示片里那一家人的「西行计划」 */
const ROUTES: ShareRoute[] = [
  {
    id: 'xixing',
    label: '河西走廊',
    trip: XIXING,
    kicker: '河西走廊 · 9 天 · 9/24–10/2',
    title: '西行计划',
    meta: '5 人同行 · 自驾 1,980 km',
    highlights: [
      ['D0', '兰州 · 正宁路夜市', '20:00'],
      ['D4', '莫高窟', '只看平层窟'],
      ['D5', '鸣沙山 · 月牙泉', '看日落'],
    ],
    skin: { id: 'dunhuang-gold', name: '敦煌金', reason: '途经甘肃 · 丝路沿线，秋季出行' },
  },
  {
    id: 'chuanxi',
    label: '川西',
    trip: CHUANXI,
    kicker: '川西 · 7 天 · 7/12–7/18',
    title: '稻城亚丁',
    meta: '3 人同行 · 自驾',
    highlights: [
      ['D2', '新都桥', '看光影'],
      ['D4', '稻城', '不赶路'],
      ['D5', '亚丁', '观光车进山'],
    ],
    skin: { id: 'plateau-cyan', name: '高原青', reason: '途经川西高原、海拔 3000 米以上，夏季出行' },
  },
  {
    id: 'jiangnan',
    label: '江南',
    trip: JIANGNAN,
    kicker: '江南 · 5 天 · 4/3–4/7',
    title: '水乡慢游',
    meta: '4 人同行 · 自驾',
    highlights: [
      ['D1', '苏州 · 拙政园', '早上人少'],
      ['D4', '乌镇 · 西栅', '住一晚'],
      ['D5', '杭州 · 西湖', '环湖'],
    ],
    skin: { id: 'jiangnan-emerald', name: '江南翠', reason: '途经江浙水乡与园林，春季出行' },
  },
];

export function ShareCard() {
  const [routeId, setRouteId] = useState(ROUTES[0].id);
  const [view, setView] = useState<'page' | 'chat'>('page');
  const route = ROUTES.find((r) => r.id === routeId) ?? ROUTES[0];
  const labelId = useId();

  // 换了画面才挪焦点：点「我也做一份」后落在「返回分享页」，返回后落回「我也做一份」；换路线时焦点留在单选上
  const makeRef = useRef<HTMLButtonElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const moveFocus = useRef(false);
  useEffect(() => {
    if (!moveFocus.current) return;
    moveFocus.current = false;
    (view === 'chat' ? backRef : makeRef).current?.focus();
  }, [view]);

  const go = (next: 'page' | 'chat') => {
    moveFocus.current = true;
    setView(next);
  };
  const choose = (id: string) => {
    moveFocus.current = false;
    setRouteId(id);
    setView('page');
  };

  return (
    <div className="u-card mt-5 grid gap-10 p-7 sm:p-10 xl:grid-cols-12 xl:items-center">
      <div className="max-w-[640px] xl:col-span-5">
        <p className="u-eyebrow">支柱 3 · 可分享的路书</p>
        <h3 className="mt-3 break-keep font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#241E20] sm:text-[32px]">一条路线，一份拿得出手的路书</h3>
        <p className="mt-4 text-base leading-relaxed text-[#241E20]/75">
          行程定下来后，AI 按途经地区与季节，从五个主题族里给它配一套行程皮肤，用路线的形状画封面。发到家庭群，亲友打开只读的分享页，点「我也做一份」，就从一句话开始规划自己的行程。
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {['按路线生成皮肤', '只读分享链接', '分享页先脱敏', '我也做一份'].map((t) => (
            <span key={t} className="u-pill">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="u-tile grid gap-6 p-4 sm:p-6 md:grid-cols-[minmax(0,1fr)_300px] md:grid-rows-[auto_1fr] xl:col-span-7">
        <div className="md:col-start-1 md:row-start-1">
          <p id={labelId} className="text-[13px] font-medium text-[#241E20]/75">
            换一条路线看看
          </p>
          <div role="radiogroup" aria-labelledby={labelId} className="mt-2 flex flex-col gap-1.5">
            {ROUTES.map((r) => {
              const on = r.id === route.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => choose(r.id)}
                  className={`flex h-11 items-center gap-3 rounded-[5px] px-3 text-left transition-colors ${on ? 'bg-[#FFFFF9] shadow-[inset_0_0_0_1px_rgba(36,30,32,0.16)]' : 'hover:bg-[#FFFFF9]/70'}`}
                >
                  <span className={`min-w-0 flex-1 text-[15px] ${on ? 'font-semibold text-[#241E20]' : 'font-medium text-[#241E20]/75'}`}>{r.label}</span>
                  <Swatch skin={r.skin.id} />
                  <span className="w-10 shrink-0 text-[13px] text-[#241E20]/75">{r.skin.name}</span>
                </button>
              );
            })}
          </div>
          {/* 留足两行：三条理由长短不一，换路线时下面的版面不跟着动 */}
          <p aria-live="polite" className="mt-3 min-h-[calc(2*1.625em)] text-[13px] leading-relaxed text-[#241E20]/75">
            AI 选了<b className="font-semibold text-[#241E20]">{route.skin.name}</b>：{route.skin.reason}。
          </p>
          {/* 手机上省掉这张图例：卡片已经很长，正文里说了「五个主题族」 */}
          <div className="mt-5 hidden border-t border-[#241E20]/10 pt-4 md:block">
            <p className="text-[13px] font-medium text-[#241E20]/75">五个主题族，按途经地区归类</p>
            <dl className="mt-2 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5 text-[13px] leading-5">
              {FAMILIES.map((f) => {
                const on = f.id === route.skin.id;
                return (
                  <div key={f.id} className="contents">
                    <dt className={`flex items-center gap-1.5 ${on ? 'font-semibold text-[#241E20]' : 'text-[#241E20]/75'}`}>
                      <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: f.dot }} />
                      {f.name}
                    </dt>
                    <dd className={`break-keep ${on ? 'text-[#241E20]' : 'text-[#241E20]/75'}`}>{f.when}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        <figure className="md:col-start-2 md:row-span-2 md:row-start-1">
          <figcaption className="mb-2 text-[13px] font-medium text-[#241E20]/75">亲友收到后，在手机上打开</figcaption>
          <div data-ui="app" className="grid overflow-hidden rounded-ui-card border border-ui-line bg-ui-surface text-ui-ink shadow-ui-float">
            {/* 两个画面叠在同一格里，高度取较高的那个，换画面时版面不动；藏起来的那个不可见、不可聚焦 */}
            <div className={`col-start-1 row-start-1 ${view === 'page' ? '' : 'invisible'}`} inert={view !== 'page'}>
              <SharePage route={route} onMake={() => go('chat')} makeRef={makeRef} />
            </div>
            <div className={`col-start-1 row-start-1 ${view === 'chat' ? '' : 'invisible'}`} inert={view !== 'chat'}>
              <ChatEntry onBack={() => go('page')} backRef={backRef} />
            </div>
          </div>
        </figure>

        <p className="text-[13px] leading-relaxed text-[#241E20]/75 md:col-start-1 md:row-start-2 md:self-end">
          这一套由 AI 自动生成，所有人免费；手动换主题与版式、纪念日扉页、去角标等深度定制属会员。皮肤只换行程自己的内容，App 外观不随目的地变。
        </p>
      </div>
    </div>
  );
}

/** 皮肤色样：底色 · 主色 · 辅色 · 强调 · 文字（皮肤令牌的作用域只在这一小块） */
function Swatch({ skin }: { skin: SkinId }) {
  return (
    <span aria-hidden className="trip-surface flex shrink-0 items-center" data-trip-theme={skin}>
      {['bg-trip-canvas', 'bg-trip-primary', 'bg-trip-secondary', 'bg-trip-accent', 'bg-trip-ink'].map((c) => (
        <span key={c} className={`-ml-1 h-4 w-4 rounded-full shadow-[inset_0_0_0_1px_rgba(36,30,32,0.14)] ring-2 ring-[#FFFFF9] first:ml-0 ${c}`} />
      ))}
    </span>
  );
}

/** 只读分享页：上半是行程皮肤；页脚的角标、AI 生成标识与「我也做一份」是平台层，不随皮肤变 */
function SharePage({ route, onMake, makeRef }: { route: ShareRoute; onMake: () => void; makeRef: RefObject<HTMLButtonElement | null> }) {
  const style = SKIN_STYLE[route.skin.id];
  return (
    <div className="flex h-full flex-col">
      <div className="trip-surface flex-1 bg-trip-canvas" data-trip-theme={route.skin.id}>
        <div className="relative">
          <RouteGlyph trip={route.trip} colors={style.cover} padY={0.3} className="h-[112px] w-full" />
          <span className="absolute right-2 top-2 rounded-full bg-black/25 px-2 text-[13px] leading-6 text-white backdrop-blur-sm">示意</span>
        </div>
        <div className="px-3.5 pb-3.5 pt-3 md:px-4">
          <p className={`text-[13px] font-medium leading-5 ${style.kicker}`}>{route.kicker}</p>
          <p className={`mt-0.5 text-[22px] font-semibold leading-8 text-trip-ink ${style.title}`}>{route.title}</p>
          <p className="text-[13px] leading-5 text-trip-ink/[0.78]">{route.meta}</p>
          <span aria-hidden className="mt-3 block h-px bg-trip-primary/60" />
          <ul className="mt-2.5 flex flex-col gap-1.5">
            {route.highlights.map(([day, title, note]) => (
              <li key={day} className="flex h-7 items-center gap-2 text-[14px] text-trip-ink">
                <span className={`flex h-6 w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold ${style.badge}`}>{day}</span>
                <span className="min-w-0 flex-1 whitespace-nowrap">{title}</span>
                <span className="shrink-0 whitespace-nowrap text-[13px] text-trip-ink/[0.78]">{note}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-ui-line px-3 py-2.5 md:px-4">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] bg-ui-primary text-[13px] font-bold leading-none text-ui-on-primary">旅</span>
        <span className="min-w-0 flex-1 whitespace-nowrap text-[13px] text-ui-ink-2">用 TripCraft 制作</span>
        <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-ui-signal/10 px-2 text-[13px] font-medium text-ui-signal-ink">AI 生成</span>
      </div>
      <div className="px-3 pb-3.5 md:px-4">
        <button
          ref={makeRef}
          type="button"
          onClick={onMake}
          className="flex h-10 w-full items-center justify-center gap-1.5 rounded-ui-btn bg-ui-primary text-[14px] font-medium text-ui-on-primary transition-opacity hover:opacity-90"
        >
          <SparklesIcon className="h-4 w-4" />
          我也做一份
        </button>
      </div>
    </div>
  );
}

/** 点「我也做一份」之后：AI 对话的入口，和演示片开场同一个画面；只记来源，不带分享者的个人信息 */
function ChatEntry({ onBack, backRef }: { onBack: () => void; backRef: RefObject<HTMLButtonElement | null> }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-11 shrink-0 items-center border-b border-ui-line px-1.5">
        <button ref={backRef} type="button" onClick={onBack} className="inline-flex h-9 items-center gap-1 rounded-ui-btn px-2 text-[13px] font-medium text-ui-ink-2 transition-colors hover:text-ui-ink">
          <ArrowLeftIcon className="h-4 w-4" />
          返回分享页
        </button>
        <span className="ml-auto pr-3 text-[14px] font-semibold text-ui-ink">新对话</span>
      </div>
      <div className="flex flex-1 flex-col px-3.5 pb-3.5 pt-3 md:px-4">
        <span className="inline-flex h-7 items-center gap-1.5 self-start rounded-full bg-ui-sunken px-2.5 text-[13px] text-ui-ink-2">
          <LinkIcon className="h-3.5 w-3.5" />
          来自分享的路书
        </span>
        <p className="mt-1.5 text-[13px] leading-5 text-ui-ink-3">只记来源，不带分享者的个人信息</p>
        <div className="mt-4 flex items-start gap-2.5">
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-ui-primary text-[13px] font-bold leading-none text-ui-on-primary">旅</span>
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ui-ink">也想做一份？说说你想怎么玩，可以很随意。</p>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 pl-[34px]">
          {['带长辈', '自驾', '想找旅行社'].map((t) => (
            <span key={t} className="inline-flex h-7 items-center rounded-full px-2.5 text-[13px] text-ui-ink-2 shadow-[inset_0_0_0_1px_rgb(var(--ui-line-strong))]">
              {t}
            </span>
          ))}
        </div>
        <div className="mt-auto pt-4">
          <div className="rounded-ui-card border border-ui-line bg-ui-surface px-3 py-2.5 shadow-ui-card">
            <p className="text-[14px] leading-5 text-ui-ink-3">说说这趟旅行：谁去、去哪…</p>
            <div className="mt-2 flex items-center">
              <span className="inline-flex h-7 items-center gap-1 rounded-full bg-ui-sunken px-2.5 text-[13px] font-medium text-ui-ink">
                <SparklesIcon className="h-3.5 w-3.5 text-ui-accent" />
                平台模型
              </span>
              <span aria-hidden className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-ui-accent text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 19V5" />
                  <path d="m5 12 7-7 7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
