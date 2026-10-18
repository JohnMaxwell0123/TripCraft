'use client';

import type { ComponentType } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useScrollTypewriter, useStep, useVisibility, ease } from '@/lib/motion';
import { T } from './timeline';
import { Grow, Reveal, TapCursor, useProgress } from './primitives';
import {
  CarIcon,
  CheckIcon,
  ChevronDownIcon,
  CompassIcon,
  ElderIcon,
  KeyIcon,
  PaperclipIcon,
  PinIcon,
  PlusIcon,
  SparklesIcon,
  UsersIcon,
  CalendarIcon,
  WalletIcon,
  BuildingIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 01 幕 · AI 对话与需求画像（docs/16 §16.2–§16.4）
 *
 * 对话框即入口：模型选择器（平台模型 / 自带 API）→ 用户说需求 → 每轮一个追问 →
 * 需求画像回显卡（明说与推断分开标注）→ 同时给出路径 A / 路径 B 两个入口。
 */

const USER_TEXT =
  '全家 5 口国庆前后去河西走廊，玩 9 天左右。带 70 岁的爷爷和 4 岁的女儿，爷爷膝盖做过手术不能爬高台阶，孩子每天要午休。想看莫高窟和鸣沙山日落，别太赶。自己开车或者找旅行社都行。';

const REPLY_TEXT = '租腾势 D9，加了车顶箱，总高 2.28 米。';

interface ProfileField {
  Icon: ComponentType<IconProps>;
  label: string;
  value: string;
  hard: boolean;
  inferred?: boolean;
}

/** 需求画像特征点（docs/16 §16.3.1）；顺序与 T.profileFields 的出现时刻一一对应 */
const PROFILE: ProfileField[] = [
  { Icon: UsersIcon, label: '同行', value: '5 人 · 3 成人 · 1 长者 70+ · 1 儿童 4 岁', hard: true },
  { Icon: PinIcon, label: '目的地', value: '河西走廊 · 必去莫高窟、鸣沙山', hard: true },
  { Icon: CalendarIcon, label: '日期', value: '国庆前后 · 8–10 天', hard: false },
  { Icon: ElderIcon, label: '身体', value: '少台阶 · 孩子 13:00 午休', hard: true },
  { Icon: CompassIcon, label: '方式', value: '自驾或旅行社均可', hard: false },
  { Icon: CarIcon, label: '车辆', value: '腾势 D9 · 总高 2.28 m', hard: true },
  { Icon: WalletIcon, label: '预算', value: '人均 ¥5,000–7,000', hard: false, inferred: true },
];

const MODELS = [
  { name: '平台模型', note: '默认 · 今日剩余 18/20', selected: true },
  { name: '我的 Claude', note: '自带 API · Anthropic 接口' },
  { name: '我的 DeepSeek', note: '自带 API · OpenAI 兼容接口' },
];

export function DialogueScene() {
  const p = useProgress();
  const opacity = useRange(p, [T.chatOut[0], T.chatOut[1]], [1, 0]);
  const x = useRange(p, [T.chatOut[0], T.chatOut[1]], [0, -36], { rest: 0 });
  const pointerEvents = useTransform(p, (v) => (v >= T.chatOut[1] ? 'none' : 'auto'));
  const visibility = useVisibility(p, 0, T.chatOut[1] + 0.005);

  return (
    <motion.section
      aria-label="AI 对话与需求画像"
      className="absolute inset-0 flex gap-4 lg:gap-5 bg-[#FAF8F5] p-3 sm:p-4 md:p-5 text-left select-none overflow-hidden gpu-layer"
      style={{ opacity, x, pointerEvents, visibility }}
    >
      <div className="flex min-w-0 flex-1 flex-col">
        <AssistantHeader />
        <Thread />
        <Composer />
      </div>

      {/* 桌面：画像随对话逐项填入右侧面板 */}
      <aside className="hidden md:flex w-[44%] max-w-[340px] shrink-0">
        <ProfileCard />
      </aside>

      {/* 手机：画像收敛后以底部抽屉弹出 */}
      <MobileProfileSheet />
    </motion.section>
  );
}

/* ── 顶栏：助手名 + 当前状态 ── */
function AssistantHeader() {
  const p = useProgress();
  const stage = useStep(p, [T.askBubble[0], T.followUp[0], T.profileReady[0]]);
  const status = ['等你开口', '理解需求中', '追问 1 / 3', '画像待确认'][stage];

  return (
    <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[#E2E2D8] pb-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-[#FFFFF9]">
          <SparklesIcon className="h-3.5 w-3.5" />
        </span>
        <span className="whitespace-nowrap text-[13px] font-semibold text-[#241E20]">AI 行程助手</span>
        <span className="hidden min-w-0 truncate text-xs text-[#828081] xl:inline">· 发送前隐去姓名与证件号</span>
      </div>
      <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-[#E2E2D8] bg-white px-2.5 py-0.5 font-mono text-xs text-[#625F61]">
        <span className="h-1.5 w-1.5 rounded-full bg-[#FE3C01]" />
        {status}
      </span>
    </div>
  );
}

/* ── 对话流：底部对齐，新消息把旧消息顶上去 ── */
function Thread() {
  const p = useProgress();
  const quickPicked = useStep(p, [T.followUpReply[0] - 0.006]) === 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col justify-end gap-2.5 overflow-hidden py-3">
      {/* AI 开场 + 零输入药丸 */}
      <div className="flex shrink-0 items-start gap-2.5">
        <AiBadge />
        <div className="min-w-0 rounded-[12px] rounded-tl-[4px] border border-[#E2E2D8] bg-[#F4F4EE] px-3 py-2.5">
          <p className="text-[13px] leading-relaxed text-[#241E20]">说说你想怎么玩？可以很随意，比如「暑假带爸妈和孩子去西北，别太累」。</p>
          <div className="mt-2 hidden flex-wrap gap-1.5 sm:flex">
            {['带长辈', '自驾', '想找旅行社', '只有 5 天'].map((t) => (
              <span key={t} className="rounded-full border border-[#E2E2D8] bg-white px-2.5 py-0.5 text-xs text-[#625F61]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 用户需求 */}
      <Grow at={T.askBubble} max={180}>
        <div className="ml-auto max-w-[92%] rounded-[12px] rounded-tr-[4px] bg-[#241E20] px-3 py-2.5 text-[13px] leading-relaxed text-[#FFFFF9]">
          {USER_TEXT}
        </div>
      </Grow>

      {/* 追问：每轮只问一个问题 */}
      <Grow at={T.followUp} max={170}>
        <div className="flex items-start gap-2.5">
          <AiBadge />
          <div className="min-w-0 rounded-[12px] rounded-tl-[4px] border border-[#E2E2D8] bg-[#F4F4EE] px-3 py-2.5">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#FE3C01]">追问 1 / 3</p>
            <p className="mt-1 text-[13px] font-medium leading-relaxed text-[#241E20]">自驾的话开什么车？车高大概多少？</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#625F61]">用来避开限高停车场；找旅行社时也按人数和行李匹配车型。</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <QuickReply label="5 座 SUV" />
              <QuickReply label="7 座 MPV · 带车顶箱" picked={quickPicked} />
              <QuickReply label="还没定" />
            </div>
          </div>
        </div>
      </Grow>

      {/* 用户回答 */}
      <Grow at={T.followUpReply} max={70}>
        <div className="ml-auto w-fit max-w-[92%] rounded-[12px] rounded-tr-[4px] bg-[#241E20] px-3 py-2 text-[13px] leading-relaxed text-[#FFFFF9]">
          {REPLY_TEXT}
        </div>
      </Grow>

      {/* 画像收敛 */}
      <Grow at={[T.profileFields[6], T.profileReady[0]]} max={90}>
        <div className="flex items-start gap-2.5">
          <AiBadge />
          <div className="min-w-0 rounded-[12px] rounded-tl-[4px] border border-[#E2E2D8] bg-[#F4F4EE] px-3 py-2.5 text-[13px] leading-relaxed text-[#241E20]">
            需求整理好了。预算是我按人数和住宿档次<b className="font-semibold text-[#FE3C01]">推断</b>的，请在画像卡里确认，然后选一条路径——两条都可以看。
          </div>
        </div>
      </Grow>
    </div>
  );
}

function AiBadge() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[#F4F4EE] font-mono text-xs font-bold text-[#241E20] ring-1 ring-[#E2E2D8]">
      AI
    </span>
  );
}

function QuickReply({ label, picked = false }: { label: string; picked?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs transition-colors duration-200 ${
        picked ? 'border-[#241E20] bg-[#241E20] text-[#FFFFF9]' : 'border-[#E2E2D8] bg-white text-[#625F61]'
      }`}
    >
      {picked ? <CheckIcon className="h-3 w-3" /> : null}
      {label}
    </span>
  );
}

/* ── 输入框：左侧模型选择器（平台模型 / 自带 API），右侧附件与发送 ── */
function Composer() {
  const p = useProgress();
  const typedRef = useScrollTypewriter(p, USER_TEXT, T.askType[0], T.askType[1]);
  const placeholder = useRange(p, [T.askType[0] - 0.002, T.askType[0], T.askSend, T.askSend + 0.004], [1, 0, 0, 1]);
  const typed = useRange(p, [T.askType[0] - 0.002, T.askType[0], T.askSend - 0.001, T.askSend + 0.002], [0, 1, 1, 0]);
  const sent = useStep(p, [T.askSend]) === 1;
  const sendScale = useRange(p, [T.askSend - 0.002, T.askSend, T.askSend + 0.002], [1, 0.86, 1]);
  const sendGlow = useRange(p, [T.askType[1] - 0.004, T.askType[1], T.askSend + 0.004], [0, 1, 0]);

  return (
    <div className="relative shrink-0 pt-1">
      <ModelMenu />
      <div className="relative flex items-center gap-2 rounded-[16px] border border-[#E2E2D8] bg-white p-1.5 pl-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        {/* 模型选择器 */}
        <span className="relative inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[5px] border border-[#E2E2D8] bg-[#F4F4EE] px-2 text-xs font-semibold text-[#241E20]">
          <SparklesIcon className="h-3 w-3 text-[#FE3C01]" />
          <span>平台模型</span>
          <ChevronDownIcon className="h-3 w-3 text-[#828081]" />
          <TapCursor approach={[0, T.modelMenu[0]]} clickAt={T.modelMenu[0]} hideAt={T.modelMenu[1] + 0.004} className="left-8 top-3" />
        </span>

        {/* 文本区：保留最后两行，模拟输入框随打字滚动 */}
        <div className="relative flex h-10 min-w-0 flex-1 flex-col justify-end overflow-hidden text-[13px] leading-5 text-[#241E20]">
          <motion.span className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 truncate text-[#828081]" style={{ opacity: placeholder }}>
            {sent ? '回答追问，或继续补充…' : '说说这趟旅行：谁去、去哪、在意什么…'}
          </motion.span>
          <motion.p style={{ opacity: typed }}>
            <span ref={typedRef}>{USER_TEXT}</span>
            <span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-[#FE3C01] align-middle" />
          </motion.p>
        </div>

        <span className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-[5px] text-[#828081] xs:flex" title="附件：截图、行程 PDF、聊天记录">
          <PaperclipIcon className="h-4 w-4" />
        </span>
        <motion.span
          aria-hidden
          className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#FE3C01] text-white"
          style={{ scale: sendScale }}
        >
          <motion.span className="absolute inset-0 rounded-[5px] shadow-[0_0_14px_rgba(254,60,1,0.55)]" style={{ opacity: sendGlow }} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="relative">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
          <TapCursor approach={[T.askType[1] - 0.006, T.askSend - 0.001]} clickAt={T.askSend} hideAt={T.askSend + 0.008} className="left-4 top-4" />
        </motion.span>
      </div>
    </div>
  );
}

function ModelMenu() {
  const p = useProgress();
  const [a, b, c, d] = T.modelMenu;
  const opacity = useFade(p, a, b, c, d);
  const y = useRange(p, [a, b, c, d], [8, 0, 0, 6], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, d);
  // 高亮从「平台模型」移到「自带 API」再回到默认项
  const hover = useStep(p, [b + (c - b) * 0.25, b + (c - b) * 0.55, b + (c - b) * 0.85]);
  const hoverIndex = [0, 1, 3, 0][hover];

  return (
    <motion.div
      role="listbox"
      aria-label="选择模型"
      className="absolute bottom-full left-0 z-30 mb-2 w-[min(272px,100%)] overflow-hidden rounded-[12px] border border-[#E2E2D8] bg-white p-1.5 shadow-[0_16px_40px_rgba(36,30,32,0.12)]"
      style={{ opacity, y, visibility }}
    >
      {MODELS.map((mdl, i) => (
        <div
          key={mdl.name}
          className={`flex items-center justify-between gap-2 rounded-[5px] px-2.5 py-1.5 transition-colors duration-150 ${hoverIndex === i ? 'bg-[#F4F4EE]' : ''}`}
        >
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-[#241E20]">{mdl.name}</span>
            <span className="block truncate text-xs text-[#828081]">{mdl.note}</span>
          </span>
          {mdl.selected ? <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#FE3C01]" /> : null}
        </div>
      ))}
      <div className={`flex items-center gap-1.5 rounded-[5px] px-2.5 py-1.5 text-[13px] font-semibold text-[#241E20] transition-colors duration-150 ${hoverIndex === 3 ? 'bg-[#F4F4EE]' : ''}`}>
        <PlusIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
        添加自己的 API
      </div>
      <p className="mt-1 flex items-center gap-1.5 border-t border-[#E5E5E0] px-2.5 pt-1.5 text-xs text-[#625F61]">
        <KeyIcon className="h-3 w-3 shrink-0" />
        自带 Key 只存在本机，请求直连服务商
      </p>
    </motion.div>
  );
}

/* ── 需求画像回显卡（docs/16 §16.3.3） ── */
function ProfileCard({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const emptyOpacity = useRange(p, [T.profileFields[0] - 0.006, T.profileFields[0]], [1, 0]);
  const count = useStep(p, T.profileFields);

  return (
    <div
      className={`flex w-full flex-col rounded-[12px] border border-[#E2E2D8] bg-white ${
        compact ? 'p-3' : 'h-full p-3.5 shadow-[0_4px_20px_rgba(0,0,0,0.04)]'
      }`}
    >
      <div className="flex items-center justify-between gap-2 border-b border-[#E5E5E0] pb-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-[#828081]">需求画像</p>
          <p className="text-[15px] font-semibold text-[#241E20]">你的出行需求</p>
        </div>
        <span className="shrink-0 rounded-full border border-[#E2E2D8] bg-[#F4F4EE] px-2.5 py-0.5 font-mono text-xs tabular-nums text-[#241E20]">
          {count} / {PROFILE.length} 项
        </span>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        {!compact ? (
          <motion.p className="absolute inset-x-0 top-3 text-xs leading-relaxed text-[#828081]" style={{ opacity: emptyOpacity }}>
            对话里提到的人数、日期、身体情况与预算，会在这里整理成一张可以确认的画像。
          </motion.p>
        ) : null}
        <ul className={`flex flex-col ${compact ? 'gap-1 pt-2' : 'gap-0.5 pt-2'}`}>
          {PROFILE.map((f, i) => (
            <ProfileRow key={f.label} field={f} at={T.profileFields[i]} compact={compact} />
          ))}
        </ul>
      </div>

      <Reveal at={T.profileReady} y={8} className={compact ? 'pt-2.5' : 'pt-3'}>
        <PathButtons />
      </Reveal>
    </div>
  );
}

function ProfileRow({ field, at, compact }: { field: ProfileField; at: number; compact: boolean }) {
  const p = useProgress();
  const opacity = useRange(p, [at, at + 0.006], [0, 1]);
  const x = useRange(p, [at, at + 0.008], [10, 0], { easing: ease.out, rest: 0 });
  const flash = useRange(p, [at, at + 0.004, at + 0.02], [0, 1, 0]);

  return (
    <motion.li className="relative" style={{ opacity, x }}>
      <motion.span aria-hidden className="absolute inset-0 rounded-[5px] bg-[#FE3C01]/[0.08]" style={{ opacity: flash }} />
      <div
        className={`relative rounded-[5px] px-2 ${compact ? 'flex items-center gap-2 py-1' : 'py-1 lg:py-1.5'} ${
          field.inferred ? 'border border-dashed border-[#FE3C01]/60 bg-[#FE3C01]/[0.04]' : ''
        }`}
      >
        {compact ? (
          <>
            <field.Icon className="h-3.5 w-3.5 shrink-0 text-[#625F61]" />
            <span className="w-11 shrink-0 text-xs text-[#828081]">{field.label}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[#241E20]">{field.value}</span>
            {field.inferred ? <SourceTag field={field} short /> : null}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5">
              <field.Icon className="h-3.5 w-3.5 shrink-0 text-[#625F61]" />
              <span className="min-w-0 flex-1 text-xs text-[#828081]">{field.label}</span>
              <SourceTag field={field} />
            </div>
            <p className="mt-0.5 pl-5 text-[13px] font-medium leading-snug text-[#241E20]">{field.value}</p>
          </>
        )}
      </div>
    </motion.li>
  );
}

/** 推断项标「推断 · 请确认」，其余标硬约束 / 偏好（docs/16 §16.3） */
function SourceTag({ field, short = false }: { field: ProfileField; short?: boolean }) {
  if (field.inferred) {
    return (
      <span className="shrink-0 whitespace-nowrap rounded-full border border-[#FE3C01]/50 px-2 py-0 text-xs font-medium text-[#FE3C01]">
        {short ? '推断' : '推断 · 请确认'}
      </span>
    );
  }
  return (
    <span
      className={`shrink-0 whitespace-nowrap rounded-full px-2 py-0 text-xs ${
        field.hard ? 'border border-[#241E20]/25 text-[#241E20]' : 'border border-[#E2E2D8] text-[#828081]'
      }`}
    >
      {field.hard ? '硬约束' : '偏好'}
    </span>
  );
}

/* ── 两条路径入口（docs/16 §16.4）：路径 B 按钮直接显示匹配数量 ── */
function PathButtons() {
  const p = useProgress();
  const picked = useStep(p, [T.pathClick]) === 1;
  const press = useRange(p, [T.pathClick - 0.003, T.pathClick, T.pathClick + 0.003], [1, 0.96, 1]);

  return (
    <div className="flex flex-col gap-1.5">
      <motion.span className="relative flex h-9 items-center justify-center gap-1.5 rounded-[5px] bg-[#241E20] px-3 text-[13px] font-semibold text-[#FFFFF9]" style={{ scale: press }}>
        {picked ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#FFFFF9] border-t-transparent" />
            <span>正在规划自驾路线…</span>
          </>
        ) : (
          <>
            <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            <span>AI 帮我规划自驾</span>
          </>
        )}
        <TapCursor approach={T.pathCursor} clickAt={T.pathClick} hideAt={T.chatOut[0]} className="right-10 top-4" />
      </motion.span>
      <span className="flex h-9 items-center justify-center gap-1.5 rounded-[5px] border border-[#E2E2D8] bg-white px-3 text-[13px] font-semibold text-[#241E20]">
        <BuildingIcon className="h-3.5 w-3.5 text-[#625F61]" />
        <span>看旅行社线路</span>
        <span className="font-mono tabular-nums text-[#FE3C01]">· 23 条匹配</span>
      </span>
      <p className="text-center text-xs text-[#828081] md:hidden lg:block">两条路径共用这份画像，可以都看</p>
    </div>
  );
}

function MobileProfileSheet() {
  const p = useProgress();
  const y = useRange(p, [T.profileReady[0] - 0.012, T.profileReady[1]], [105, 0], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, T.profileReady[0] - 0.012, T.chatOut[1] + 0.005);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-30 rounded-t-[16px] border-t border-[#E2E2D8] bg-[#FFFFF9] px-3 pb-3 pt-2 shadow-[0_-16px_40px_rgba(36,30,32,0.12)] md:hidden"
      style={{ y: yPct, visibility }}
    >
      <span aria-hidden className="mx-auto mb-2 block h-1 w-9 rounded-full bg-[#E2E2D8]" />
      <ProfileCard compact />
    </motion.div>
  );
}
