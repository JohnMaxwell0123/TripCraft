'use client';

import { useState } from 'react';
import {
  MessageIcon,
  KeyIcon,
  RoadIcon,
  WifiIcon,
  SignalSlashIcon,
  BuildingIcon,
  FileTextIcon,
  CarIcon,
  LayersIcon,
  BookOpenIcon,
  DownloadIcon,
} from '@/components/common/Icons';

// 路径 B 卡：示例线路的人均预估价分布（单位：元），用于价格分布图与滑块
const ROUTE_PRICES = [
  3280, 3650, 3980, 4200, 4380, 4520, 4680, 4960, 5100, 5280, 5420, 5580, 5880, 6080, 6200, 6450, 6880, 7200,
  7680, 8300, 8900, 9600,
];
const PRICE_MIN = 3000;
const PRICE_MAX = 10000;
const BIN_COUNT = 14;
const BIN_WIDTH = (PRICE_MAX - PRICE_MIN) / BIN_COUNT;
const BINS = Array.from({ length: BIN_COUNT }, (_, i) =>
  ROUTE_PRICES.filter((p) => p >= PRICE_MIN + i * BIN_WIDTH && p < PRICE_MIN + (i + 1) * BIN_WIDTH).length,
);
const BIN_PEAK = Math.max(...BINS);

export function BentoGrid() {
  // 卡 1：模型来源
  const [modelSource, setModelSource] = useState<'platform' | 'byok'>('platform');

  // 卡 4：价格上限滑块
  const [priceCap, setPriceCap] = useState(6500);
  const matchedCount = ROUTE_PRICES.filter((p) => p <= priceCap).length;

  // 卡 6：离线可读模拟
  const [isOffline, setIsOffline] = useState(false);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const navOffset = window.innerWidth >= 768 ? 80 : 64;
      const top = el.getBoundingClientRect().top + window.scrollY - navOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleDownloadSample = () => {
    const sampleHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TripCraft · 青甘大环线 8 日（单文件路书样例）</title>
  <style>
    :root { --sand: #FFFFF9; --ink: #241E20; --accent: #FE3C01; --paper: #FFFFFF; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--sand); color: var(--ink); padding: 32px 20px; }
    .card { background: var(--paper); border: 1px solid rgba(36,30,32,0.1); border-radius: 12px; padding: 28px; max-width: 640px; margin: 0 auto; box-shadow: 0 4px 20px rgba(36,30,32,0.06); }
    h1 { font-size: 24px; font-weight: 700; color: var(--ink); margin-top: 0; font-family: Georgia, serif; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(254,60,1,0.1); color: var(--accent); padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
    .day { border-left: 3px solid var(--accent); padding-left: 14px; margin-bottom: 18px; }
    .tip { background: #faf8f5; border: 1px solid rgba(36,30,32,0.08); border-radius: 8px; padding: 12px; font-size: 13px; line-height: 1.6; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">TripCraft · 单文件路书样例 · 断网也能打开</div>
    <h1>青甘大环线 · 8 日家庭自驾</h1>
    <p style="color: #6E6A67; font-size: 14px;">8 天 · 约 1,280 km · 一家 5 口（含 2 位长辈、1 名幼儿）</p>
    <div class="day">
      <strong>D1 · 西宁 → 日月山 → 青海湖</strong><br>
      <small style="color: #6E6A67;">沿湖观景台 · 午饭黑马河手抓羊肉 · 约 152 km</small>
    </div>
    <div class="day">
      <strong>D2 · 茶卡盐湖 → 德令哈</strong><br>
      <small style="color: #6E6A67;">盐湖栈道平缓 · 傍晚到达，不赶夜路 · 约 208 km</small>
    </div>
    <div class="tip">
      本路书为行程规划参考，实际行车请以车辆导航系统与现场交通标识为准。
    </div>
  </div>
</body>
</html>`;

    const blob = new Blob([sampleHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'TripCraft_单文件路书样例.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section id="bento" className="relative overflow-hidden py-16 sm:py-24 bg-[#FFFFF9] scroll-mt-20">
      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        {/* Section Header (Unify style: Eyebrow + Serif Headline) */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-wider text-[#FE3C01]">产品能力 · 三大支柱与一条 B 端线</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold tracking-[-0.035em] text-[#241E20] leading-[1.15] text-balance">
            从一句话需求，到全家都认可的行程
          </h2>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#625F61]">
            AI 对话入口把需求问清楚，两条规划路径给出方案，行程空间让一家人一起商量、多台设备同步；旅行社在线路工作室上架线路、生成路书、透明报价。
          </p>
        </div>

        {/* 1. 六张能力卡（Unify 三列卡片矩阵） */}
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3 text-left">
          {/* 卡 1：AI 对话入口 */}
          <FeatureCard
            eyebrow="支柱 1 · AI 对话入口"
            title="平台模型，或换用你自己的模型"
            body="像使用 ChatGPT / Claude 一样输入想法。默认使用平台模型，也可以填入自己喜欢的模型 API；你的 Key 只保存在自己的设备上，不上传平台服务器。"
            tags={['平台默认模型', '自带 API (BYOK)']}
          >
            <div className="flex rounded-full bg-[#241E20]/[0.04] p-1 border border-[#241E20]/[0.06]" role="radiogroup" aria-label="模型来源">
              {(
                [
                  ['platform', '平台模型'],
                  ['byok', '自带 API'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  role="radio"
                  aria-checked={modelSource === id}
                  onClick={() => setModelSource(id)}
                  className={`flex-1 rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    modelSource === id ? 'bg-white text-[#241E20] shadow-sm font-semibold' : 'text-[#6E6A67] hover:text-[#241E20]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-[#625F61]">
              {modelSource === 'platform' ? (
                <>
                  <MessageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FE3C01]" />
                  <span>开箱即用，无需任何配置。</span>
                </>
              ) : (
                <>
                  <KeyIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#FE3C01]" />
                  <span>填入你的模型 API Key，仅存在本机；输出同样经过平台的校验管线。</span>
                </>
              )}
            </div>
          </FeatureCard>

          {/* 卡 2：追问与需求画像 */}
          <FeatureCard
            eyebrow="支柱 1 · 追问与需求画像"
            title="每轮只问一个问题"
            body="很多人一开始也没想清楚。AI 每轮只追问一个关键问题，最多三轮，把零散的想法整理成需求画像；推断出来的项单独标出，由你确认。"
            tags={['硬约束', '偏好与权重', '推断项待确认']}
          >
            <p className="text-xs text-[#625F61]">AI 追问：</p>
            <p className="mt-1 text-sm font-medium text-[#241E20]">“爸妈每天坐车，最多能接受几个小时？”</p>
            <div className="mt-2.5 pt-2.5 border-t border-[#E2E2D8] space-y-1.5 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[#241E20]">硬约束 · 每天车程 ≤ 4 小时</span>
                <span className="shrink-0 text-[#625F61]">你说的</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#241E20]">偏好 · 少爬台阶</span>
                <span className="shrink-0 text-amber-700 font-medium">推断 · 待确认</span>
              </div>
            </div>
          </FeatureCard>

          {/* 卡 3：路径 A */}
          <FeatureCard
            eyebrow="支柱 2 · 路径 A"
            title="AI 规划自驾路线"
            body="沿路线走廊检索真实地点，把沿线景点、打卡点、美食与补给编排进每一天。地点来自图商数据，AI 只负责编排，不编造景点。"
            tags={['沿线真实 POI', '车程估算', '节奏均衡']}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[#241E20]">
                  <RoadIcon className="h-3.5 w-3.5 shrink-0 text-[#FE3C01]" />
                  D2 · 茶卡盐湖 → 德令哈
                </span>
                <span className="shrink-0 text-[#625F61]">约 3.5 小时</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['盐湖栈道', '茶卡羊肉', '服务区加油'].map((s) => (
                  <span key={s} className="rounded-full bg-white border border-[#E2E2D8] px-2 py-0.5 text-[#241E20]">
                    {s}
                  </span>
                ))}
              </div>
              <p className="pt-2 border-t border-[#E2E2D8] text-[#625F61] leading-relaxed">
                车程为估算，实际行车请以车辆导航系统与现场交通标识为准。
              </p>
            </div>
          </FeatureCard>

          {/* 卡 4：路径 B */}
          <FeatureCard
            eyebrow="支柱 2 · 路径 B"
            title="匹配持证旅行社的线路"
            body="按需求画像给出匹配度和理由；价格、天数分布图帮你看懂行情，再用滑块和条件方块筛选。付费不影响匹配度。"
            tags={['匹配度与理由', '分布图滑块', '条件方块']}
          >
            <div className="flex items-end gap-[3px] h-12" aria-hidden>
              {BINS.map((count, i) => {
                const binStart = PRICE_MIN + i * BIN_WIDTH;
                return (
                  <div
                    key={i}
                    className={`flex-1 rounded-t-[2px] transition-colors ${binStart <= priceCap ? 'bg-[#FE3C01]/70' : 'bg-[#241E20]/15'}`}
                    style={{ height: `${Math.max(8, (count / BIN_PEAK) * 100)}%` }}
                  />
                );
              })}
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={100}
              value={priceCap}
              onChange={(e) => setPriceCap(Number(e.target.value))}
              aria-label="人均预估价上限"
              className="mt-1 w-full accent-[#FE3C01] cursor-pointer"
            />
            <div className="mt-1 flex justify-between text-xs">
              <span className="text-[#625F61]">
                人均预估价 ≤ <span className="font-mono font-semibold text-[#241E20]">¥{priceCap.toLocaleString('zh-CN')}</span>
              </span>
              <span className="font-semibold text-[#FE3C01]">{matchedCount} 条线路</span>
            </div>
            <p className="mt-2 pt-2 border-t border-[#E2E2D8] text-xs text-[#625F61] leading-relaxed">
              线路由持证旅行社提供；匹配度为信息参考，具体以旅行社报价与合同为准。
            </p>
          </FeatureCard>

          {/* 卡 5：多人共享 */}
          <FeatureCard
            eyebrow="支柱 3 · 多人共享"
            title="一家人一起商量，不靠群接龙"
            body="发一个邀请链接，家人朋友就能加入行程空间。每人把想去的地方作为提名提交，AI 评估是否顺路、是否合适；平台只负责收齐意见，由领队拍板。"
            tags={['邀请链接加入', '结构化提名', '只收齐不裁决']}
          >
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#241E20]">鸣沙山看日落 · 小林提名</span>
                <span className="shrink-0 text-emerald-700 font-medium">顺路</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#241E20]">祁连山骑马 · 王叔提名</span>
                <span className="shrink-0 text-amber-700 font-medium">绕行约 2 小时</span>
              </div>
              <p className="pt-2 border-t border-[#E2E2D8] text-[#625F61]">冲突已标出，等待领队确认</p>
            </div>
          </FeatureCard>

          {/* 卡 6：多端同步与离线可读 */}
          <FeatureCard
            eyebrow="支柱 3 · 多端同步"
            title="手机、平板、电脑同一份行程"
            body="同一账号下的设备实时同步。进入没信号的路段，已同步的行程照常可读；恢复联网后，离线时的改动自动合并。"
            tags={['统一账号', '离线可读', '联网后合并']}
          >
            <div className="flex items-center justify-between gap-2 text-xs mb-2">
              <span className="text-[#625F61]">网络状态:</span>
              <button
                type="button"
                onClick={() => setIsOffline(!isOffline)}
                aria-pressed={isOffline}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] text-xs font-medium transition-colors ${
                  isOffline ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isOffline ? <SignalSlashIcon className="h-3.5 w-3.5" /> : <WifiIcon className="h-3.5 w-3.5" />}
                {isOffline ? '模拟断网中' : '在线'}
              </button>
            </div>
            <p className="text-xs leading-relaxed">
              {isOffline ? (
                <span className="text-amber-800">已同步的行程照常查看；你的改动先存在本机，联网后与家人的改动合并。</span>
              ) : (
                <span className="text-[#625F61]">爸妈在平板上加的备注，已同步到你的手机。</span>
              )}
            </p>
          </FeatureCard>
        </div>

        {/* 2. B 端线：旅行社线路工作室（Unify 宽幅卡） */}
        <div className="mt-6 rounded-[16px] bg-[#FFFFFF] border border-[#E2E2D8] p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] grid gap-8 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 space-y-4 text-left">
            <span className="text-xs font-semibold tracking-wider text-[#FE3C01]">B 端线 · 旅行社线路工作室</span>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#241E20] leading-snug tracking-tight">
              好线路被看见，报价说得清
            </h3>
            <p className="text-sm leading-relaxed text-[#625F61]">
              旅行社上传线路，就能被匹配给需求相符的旅客。AI 把线路生成可交互的路书与路线动画，价格与包含项透明列出；客户想改一天、换个酒店，直接调整线路与报价，每一版报价都留痕——不再只发一份 PDF 文字行程。
            </p>
            <div className="pt-1 flex flex-wrap gap-2">
              <span className="unify-pill-badge text-xs">导入行程单</span>
              <span className="unify-pill-badge text-xs">AI 路书与路线动画</span>
              <span className="unify-pill-badge text-xs">透明报价</span>
              <span className="unify-pill-badge text-xs">报价版本留痕</span>
            </div>
            <button
              type="button"
              onClick={() => scrollToSection('agency')}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-[5px] bg-[#241E20] px-5 text-sm font-semibold text-white hover:bg-[#FE3C01] transition-colors"
            >
              <BuildingIcon className="h-4 w-4" />
              看定制师的一天
            </button>
          </div>

          <div className="lg:col-span-6 rounded-[12px] bg-[#F4F4EE] border border-[#E2E2D8] p-4 text-[#241E20]">
            <div className="flex items-center justify-between gap-2 pb-2 mb-3 border-b border-[#E2E2D8] text-xs">
              <span className="font-bold text-[#241E20]">线路工作室 · 今天</span>
              <span className="text-[#625F61]">青甘大环线 8 日</span>
            </div>
            <ol className="space-y-2 text-sm leading-relaxed">
              <StudioStep time="09:30" text="导入 Word 行程单，AI 抽取 8 天行程，3 处低置信度字段逐项确认" />
              <StudioStep time="10:40" text="填写上架信息：起价附成团条件，包含 / 不包含逐项列明" />
              <StudioStep time="14:00" text="生成交互路书与路线动画，AI 生成内容已标注" />
              <StudioStep time="16:20" text="收到 3 条咨询；报价 v2 换成温泉酒店，差异自动列出" />
            </ol>
            <p className="mt-3 pt-2.5 border-t border-[#E2E2D8] text-xs text-[#625F61] leading-relaxed">
              合同与付款由旅客与旅行社直接签订，平台不经手团款。
            </p>
          </div>
        </div>

        {/* 3. 支撑能力：保留但不作主卖点 */}
        <div className="mt-6 rounded-[16px] border border-[#E2E2D8] bg-[#F4F4EE] p-5 sm:p-6 text-left">
          <p className="text-xs font-semibold tracking-wider text-[#625F61]">支撑能力</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SupportItem Icon={FileTextIcon} title="离线可读与单文件导出" text="无信号区域照常查看；给不装 App 的长辈发一个 HTML 文件，双击即开。">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#FE3C01] hover:underline"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
                下载样例 (.html)
              </button>
            </SupportItem>
            <SupportItem Icon={CarIcon} title="车机投递" text="把全天途经点一次交给车机导航；实际行车以车辆导航系统与现场交通标识为准。" />
            <SupportItem Icon={LayersIcon} title="白标交付" text="旅行社把成交后的路书以自有品牌交给客户，客户免登录查看。" />
            <SupportItem Icon={BookOpenIcon} title="旅后回忆录" text="旅行结束后整理照片与足迹，照片默认留在你自己的设备上。" />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  eyebrow,
  title,
  body,
  tags,
  children,
}: {
  eyebrow: string;
  title: string;
  body: string;
  tags: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="unify-card p-6 flex flex-col justify-between">
      <div>
        <span className="text-xs font-semibold tracking-wider text-[#FE3C01] block">{eyebrow}</span>
        <h4 className="mt-2 font-serif text-xl font-normal text-[#241E20]">{title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-[#6E6A67]">{body}</p>
      </div>

      <div className="mt-5 rounded-[10px] bg-[#FFFFF9] p-3 border border-[#E2E2D8]">{children}</div>

      <div className="mt-4 pt-3 border-t border-[#E2E2D8] flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span key={t} className="unify-pill-badge text-xs">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function StudioStep({ time, text }: { time: string; text: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="shrink-0 font-mono text-xs font-bold text-[#FE3C01] pt-0.5">{time}</span>
      <span className="text-[#241E20]">{text}</span>
    </li>
  );
}

function SupportItem({
  Icon,
  title,
  text,
  children,
}: {
  Icon: typeof FileTextIcon;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-[#241E20]">
        <Icon className="h-4 w-4 shrink-0 text-[#625F61]" />
        {title}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-[#625F61]">{text}</p>
      {children}
    </div>
  );
}
