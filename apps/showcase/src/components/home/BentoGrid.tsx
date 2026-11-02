'use client';

import { useState, type ReactNode } from 'react';
import { scrollToSection } from '@/components/common/Navbar';
import { ShareCard } from '@/components/home/ShareCard';
import {
  BookOpenIcon,
  CarIcon,
  DownloadIcon,
  FileTextIcon,
  KeyIcon,
  LayersIcon,
  MessageIcon,
  RoadIcon,
  SignalSlashIcon,
  WifiIcon,
} from '@/components/common/Icons';

/**
 * 产品能力画廊（PRD-01 §3：三大支柱、一条 B 端线、四项支撑能力）
 *
 * 版式按 .agents/rules/unify-gtm-design-system.md：左对齐的分区标题；8px 圆角的发丝边卡片，
 * 眉题炭黑、标题衬线；卡片里的小演示放在浅石灰平铺块上；六张卡之后是讲可分享路书与行程皮肤的宽幅卡（S-C10，ShareCard.tsx）；
 * B 端宽幅卡用 1px 烈焰橙竖线列出定制师的一天；
 * 支撑能力只用一行文字栏，不再做成卡片，也不作为主卖点。
 * 这一段以圆角纸面压在上方 B 端深色氛围带上（-mt-7 + rounded-t）。
 */

// 路径 B 卡：示例线路的人均预估价分布（单位：元），用于价格分布图与滑块
const ROUTE_PRICES = [
  3280, 3650, 3980, 4200, 4380, 4520, 4680, 4960, 5100, 5280, 5420, 5580, 5880, 6080, 6200, 6450, 6880, 7200, 7680, 8300, 8900, 9600,
];
const PRICE_MIN = 3000;
const PRICE_MAX = 10000;
const BIN_COUNT = 14;
const BIN_WIDTH = (PRICE_MAX - PRICE_MIN) / BIN_COUNT;
const BINS = Array.from({ length: BIN_COUNT }, (_, i) => ROUTE_PRICES.filter((p) => p >= PRICE_MIN + i * BIN_WIDTH && p < PRICE_MIN + (i + 1) * BIN_WIDTH).length);
const BIN_PEAK = Math.max(...BINS);

const SAMPLE_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TripCraft · 青甘大环线 8 日（单文件路书样例）</title>
  <style>
    :root { --sand: #FFFFF9; --ink: #241E20; --accent: #FE3C01; --paper: #FFFFFF; }
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--sand); color: var(--ink); padding: 32px 20px; }
    .card { background: var(--paper); border: 1px solid rgba(36,30,32,0.1); border-radius: 8px; padding: 28px; max-width: 640px; margin: 0 auto; }
    h1 { font-size: 24px; font-weight: 700; margin-top: 0; font-family: Georgia, serif; }
    .badge { display: inline-block; color: var(--ink); font-size: 13px; font-weight: 600; letter-spacing: 0.08em; margin-bottom: 16px; }
    .day { border-left: 1px solid var(--accent); padding-left: 14px; margin-bottom: 18px; }
    .tip { background: #F8F7F3; border-radius: 4px; padding: 12px; font-size: 14px; line-height: 1.6; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">TripCraft · 单文件路书样例 · 断网也能打开</div>
    <h1>青甘大环线 · 8 日家庭自驾</h1>
    <p style="color: #625F61; font-size: 15px;">8 天 · 约 1,280 km · 一家 5 口（含 2 位长辈、1 名幼儿）</p>
    <div class="day">
      <strong>D1 · 西宁 → 日月山 → 青海湖</strong><br>
      <small style="color: #625F61;">沿湖观景台 · 午饭黑马河手抓羊肉 · 约 152 km</small>
    </div>
    <div class="day">
      <strong>D2 · 茶卡盐湖 → 德令哈</strong><br>
      <small style="color: #625F61;">盐湖栈道平缓 · 傍晚到达，不赶夜路 · 约 208 km</small>
    </div>
    <div class="tip">本路书为行程规划参考，实际行车请以车辆导航系统与现场交通标识为准。</div>
  </div>
</body>
</html>`;

function downloadSample() {
  const blob = new Blob([SAMPLE_HTML], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'TripCraft_单文件路书样例.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function BentoGrid() {
  // 卡 1：模型来源
  const [modelSource, setModelSource] = useState<'platform' | 'byok'>('platform');
  // 卡 4：价格上限滑块
  const [priceCap, setPriceCap] = useState(6500);
  const matchedCount = ROUTE_PRICES.filter((p) => p <= priceCap).length;
  // 卡 6：离线可读模拟
  const [isOffline, setIsOffline] = useState(false);

  return (
    <section id="bento" className="relative z-10 -mt-7 scroll-mt-16 rounded-t-[28px] bg-[#FFFFF9] pb-24 pt-24 md:pb-32 md:pt-32">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <div className="max-w-[760px]">
          <p className="u-eyebrow">产品能力 · 三大支柱与一条 B 端线</p>
          <h2 className="mt-4 break-keep font-serif text-[32px] font-semibold leading-[1.15] tracking-[-0.02em] text-[#241E20] sm:text-[40px] lg:text-[44px]">
            从一句话需求，到全家都认可的行程
          </h2>
          <p className="mt-5 text-[17px] leading-relaxed text-[#241E20]/75 sm:text-lg">
            AI 对话入口把需求问清楚，两条规划路径给出方案，行程空间让一家人一起商量、多台设备同步，定下来的行程还能做成一份可分享的路书；旅行社在线路工作室上架线路、生成路书、透明报价。
          </p>
        </div>

        {/* 六张能力卡 */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            eyebrow="支柱 1 · AI 对话入口"
            title="平台模型，或换用你自己的模型"
            body="像使用 ChatGPT、Claude 一样说出想法。默认用平台模型，也可以填入自己喜欢的模型 API；你的 Key 只保存在自己的设备上，不上传平台服务器。"
            tags={['平台默认模型', '自带 API']}
          >
            <div className="flex rounded-[5px] bg-[#FFFFF9] p-1 shadow-[inset_0_0_0_1px_rgba(36,30,32,0.12)]" role="radiogroup" aria-label="模型来源">
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
                  className={`h-9 flex-1 rounded-[4px] text-sm font-medium transition-colors ${modelSource === id ? 'bg-[#241E20] text-[#FFFFF9]' : 'text-[#241E20]/70 hover:text-[#241E20]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed text-[#241E20]/75">
              {modelSource === 'platform' ? (
                <>
                  <MessageIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  开箱即用，无需任何配置。
                </>
              ) : (
                <>
                  <KeyIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  填入你的模型 API Key，只存在本机；输出同样经过平台的校验管线。
                </>
              )}
            </p>
          </FeatureCard>

          <FeatureCard
            eyebrow="支柱 1 · 追问与需求画像"
            title="每轮只问一个问题"
            body="很多人一开始也没想清楚。AI 每轮只追问一个关键问题，最多三轮，把零散的想法整理成需求画像；推断出来的项单独标出，由你确认。"
            tags={['硬约束', '偏好与权重', '推断项待确认']}
          >
            <p className="text-sm text-[#241E20]/65">AI 追问</p>
            <p className="mt-1 font-serif text-[17px] font-medium leading-snug text-[#241E20]">「爸妈每天坐车，最多能接受几个小时？」</p>
            <dl className="mt-3 space-y-1.5 border-t border-[#241E20]/10 pt-3 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#241E20]">硬约束 · 每天车程 ≤ 4 小时</dt>
                <dd className="shrink-0 text-[#241E20]/60">你说的</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#241E20]">偏好 · 少爬台阶</dt>
                <dd className="shrink-0 font-medium text-[#C43200]">推断 · 待确认</dd>
              </div>
            </dl>
          </FeatureCard>

          <FeatureCard
            eyebrow="支柱 2 · 路径 A"
            title="AI 规划自驾路线"
            body="沿路线走廊检索真实地点，把沿线景点、打卡点、美食与补给编排进每一天。地点来自图商数据，AI 只负责编排，不编造景点。"
            tags={['沿线真实地点', '车程估算', '节奏均衡']}
          >
            <p className="flex items-center justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-[#241E20]">
                <RoadIcon className="h-4 w-4 shrink-0" />
                D2 · 茶卡盐湖 → 德令哈
              </span>
              <span className="shrink-0 text-[#241E20]/60">约 3.5 小时</span>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {['盐湖栈道', '茶卡羊肉', '服务区加油'].map((s) => (
                <span key={s} className="u-pill h-7 bg-[#FFFFF9] px-2.5 text-[13px]">
                  {s}
                </span>
              ))}
            </div>
            <p className="mt-3 border-t border-[#241E20]/10 pt-3 text-[13px] leading-relaxed text-[#241E20]/65">车程为估算，实际行车请以车辆导航系统与现场交通标识为准。</p>
          </FeatureCard>

          <FeatureCard
            eyebrow="支柱 2 · 路径 B"
            title="匹配持证旅行社的线路"
            body="按需求画像给出匹配度和理由；价格、天数分布图帮你看懂行情，再用滑块和条件方块筛选。付费不影响匹配度。"
            tags={['匹配度与理由', '分布图滑块', '条件方块']}
          >
            <div className="flex h-12 items-end gap-[3px]" aria-hidden>
              {BINS.map((count, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t-[2px] transition-colors ${PRICE_MIN + i * BIN_WIDTH <= priceCap ? 'bg-[#FE3C01]' : 'bg-[#241E20]/15'}`}
                  style={{ height: `${Math.max(8, (count / BIN_PEAK) * 100)}%` }}
                />
              ))}
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={100}
              value={priceCap}
              onChange={(e) => setPriceCap(Number(e.target.value))}
              aria-label="人均预估价上限"
              aria-valuetext={`人均预估价不超过 ${priceCap} 元，${matchedCount} 条线路`}
              className="mt-2 w-full cursor-pointer accent-[#241E20]"
            />
            <p className="mt-1 flex justify-between gap-2 text-sm">
              <span className="text-[#241E20]/75">
                人均预估 ≤ <b className="font-semibold tabular-nums text-[#241E20]">¥{priceCap.toLocaleString('zh-CN')}</b>
              </span>
              <span className="font-semibold tabular-nums text-[#241E20]">{matchedCount} 条线路</span>
            </p>
            <p className="mt-3 border-t border-[#241E20]/10 pt-3 text-[13px] leading-relaxed text-[#241E20]/65">线路由持证旅行社提供；匹配度为信息参考，具体以旅行社报价与合同为准。</p>
          </FeatureCard>

          <FeatureCard
            eyebrow="支柱 3 · 多人共享"
            title="一家人一起商量，不靠群接龙"
            body="发一个邀请链接，家人朋友就能加入行程空间。每人把想去的地方作为提名提交，AI 评估是否顺路；平台只负责收齐意见，由领队拍板。"
            tags={['邀请链接加入', '结构化提名', '只收齐不裁决']}
          >
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between gap-2">
                <span className="text-[#241E20]">鸣沙山看日落 · 小林提名</span>
                <span className="shrink-0 font-medium text-[#0E7A5A]">顺路</span>
              </li>
              <li className="flex items-center justify-between gap-2">
                <span className="text-[#241E20]">祁连山骑马 · 王叔提名</span>
                <span className="shrink-0 font-medium text-[#C43200]">绕行约 2 小时</span>
              </li>
            </ul>
            <p className="mt-3 border-t border-[#241E20]/10 pt-3 text-[13px] text-[#241E20]/65">冲突已标出，等待领队确认</p>
          </FeatureCard>

          <FeatureCard
            eyebrow="支柱 3 · 多端同步"
            title="手机、平板、电脑同一份行程"
            body="同一账号下的设备实时同步。进入没信号的路段，已同步的行程照常可读；恢复联网后，离线时的改动自动合并。"
            tags={['统一账号', '离线可读', '联网后合并']}
          >
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-[#241E20]/75">网络状态</span>
              <button
                type="button"
                onClick={() => setIsOffline(!isOffline)}
                aria-pressed={isOffline}
                className="inline-flex h-9 items-center gap-1.5 rounded-[5px] bg-[#FFFFF9] px-3 text-sm font-medium text-[#241E20] shadow-[inset_0_0_0_1px_rgba(36,30,32,0.16)] transition-shadow hover:shadow-[inset_0_0_0_1px_rgba(36,30,32,0.4)]"
              >
                {isOffline ? <SignalSlashIcon className="h-4 w-4 text-[#C43200]" /> : <WifiIcon className="h-4 w-4 text-[#0E7A5A]" />}
                {isOffline ? '模拟断网中' : '在线'}
              </button>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-[#241E20]/75">
              {isOffline ? '已同步的行程照常查看；你的改动先存在本机，联网后与家人的改动合并。' : '爸妈在平板上加的备注，已同步到你的手机。'}
            </p>
          </FeatureCard>
        </div>

        {/* 可分享的路书与行程皮肤（S-C10） */}
        <ShareCard />

        {/* B 端线：旅行社线路工作室 */}
        <div className="u-card mt-5 grid gap-10 p-7 sm:p-10 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <p className="u-eyebrow">B 端线 · 旅行社线路工作室</p>
            <h3 className="mt-3 font-serif text-[28px] font-semibold leading-tight tracking-[-0.01em] text-[#241E20] sm:text-[32px]">好线路被看见，报价说得清</h3>
            <p className="mt-4 text-base leading-relaxed text-[#241E20]/75">
              旅行社上传线路，就能被匹配给需求相符的旅客。AI 把线路生成可交互的路书与路线动画，价格与包含项透明列出；客户想改一天、换个酒店，直接调整线路与报价，每一版报价都留痕。
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {['导入行程单', 'AI 路书与路线动画', '透明报价', '报价版本留痕'].map((t) => (
                <span key={t} className="u-pill">
                  {t}
                </span>
              ))}
            </div>
            <button type="button" onClick={() => scrollToSection('agency')} className="u-btn u-btn-primary mt-8">
              看定制师的一天
            </button>
          </div>

          <div className="lg:col-span-7">
            <ol className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
              {[
                ['09:30', '导入 Word 行程单，AI 抽取逐日行程，低置信度字段逐项确认'],
                ['10:40', '填写上架信息：价格规则、可调选项，包含与不包含逐项列明'],
                ['14:00', '一键生成交互路书与 45 秒路线动画，AI 撰写内容已标注'],
                ['16:20', '旅客想加一天去阳关、玉门关，报价 v2 自动列出差异'],
              ].map(([time, text]) => (
                <li key={time} className="border-l border-[#FE3C01] pl-5">
                  <p className="font-mono text-[13px] tabular-nums text-[#241E20]/60">{time}</p>
                  <p className="mt-1.5 font-serif text-lg leading-snug text-[#241E20]">{text}</p>
                </li>
              ))}
            </ol>
            <p className="mt-8 border-t border-[#241E20]/10 pt-4 text-sm leading-relaxed text-[#241E20]/65">合同与付款由旅客与旅行社直接签订，平台不经手团款。</p>
          </div>
        </div>

        {/* 支撑能力：保留但不作主卖点 */}
        <div className="mt-16 border-t border-[#241E20]/10 pt-10">
          <p className="u-eyebrow">支撑能力 · 排期在主线之后</p>
          <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <SupportItem Icon={FileTextIcon} title="离线可读与单文件导出" text="无信号区域照常查看；给不装 App 的长辈发一个 HTML 文件，双击即开。">
              <button type="button" onClick={downloadSample} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-[#241E20]">
                <DownloadIcon className="h-4 w-4" />
                <span className="u-link pb-0.5">下载样例（.html）</span>
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

function FeatureCard({ eyebrow, title, body, tags, children }: { eyebrow: string; title: string; body: string; tags: string[]; children: ReactNode }) {
  return (
    <div className="u-card flex flex-col p-7">
      <p className="u-eyebrow">{eyebrow}</p>
      <h3 className="mt-3 break-keep font-serif text-[22px] font-semibold leading-snug text-[#241E20]">{title}</h3>
      <p className="mt-3 text-[15px] leading-relaxed text-[#241E20]/75">{body}</p>
      <div className="u-tile mt-6 p-4">{children}</div>
      <div className="mt-auto flex flex-wrap gap-2 pt-6">
        {tags.map((t) => (
          <span key={t} className="u-pill h-7 px-2.5 text-[13px]">
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function SupportItem({ Icon, title, text, children }: { Icon: typeof FileTextIcon; title: string; text: string; children?: ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-base font-semibold text-[#241E20]">
        <Icon className="h-4 w-4 shrink-0 text-[#241E20]/70" />
        {title}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-[#241E20]/70">{text}</p>
      {children}
    </div>
  );
}
