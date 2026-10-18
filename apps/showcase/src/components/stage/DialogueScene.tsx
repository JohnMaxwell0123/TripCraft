'use client';

import type { ComponentType } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useFade, useRange, useScrollTypewriter, useStep, useVisibility, ease } from '@/lib/motion';
import { T } from './timeline';
import { Grow, Reveal, Scene, TapCursor, useProgress } from './primitives';
import { Badge, PageHeader, btn } from './ui';
import {
  BuildingIcon,
  CalendarIcon,
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
  WalletIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 01 幕 · AI 对话与需求画像（docs/16 §16.2–§16.4）
 *
 * 对话框即入口：模型选择器（平台模型 / 自带 API）→ 用户说需求 → 每轮一个追问 →
 * 需求画像在右侧面板逐项填入（硬约束与偏好分组，推断项单独标出）→ 同时给出路径 A / 路径 B 两个入口。
 */

const USER_TEXT =
  '全家 5 口国庆前后去河西走廊，玩 9 天左右。带 70 岁的爷爷和 4 岁的女儿，爷爷膝盖做过手术不能爬高台阶，孩子每天要午休。想看莫高窟和鸣沙山日落，别太赶。自己开车或者找旅行社都行。';

const REPLY_TEXT = '租腾势 D9，加了车顶箱，总高 2.28 米。';

interface ProfileField {
  Icon: ComponentType<IconProps>;
  label: string;
  value: string;
  inferred?: boolean;
  /** 在 T.profileFields 中的出现顺序（按对话提及的先后） */
  order: number;
}

/** 需求画像特征点（docs/16 §16.3.1）：硬约束决定「能不能」，偏好决定「有多合适」 */
const HARD: ProfileField[] = [
  { Icon: UsersIcon, label: '同行', value: '3 成人 · 1 长者 70+ · 1 儿童 4 岁', order: 0 },
  { Icon: PinIcon, label: '必去', value: '莫高窟 · 鸣沙山日落', order: 1 },
  { Icon: ElderIcon, label: '身体', value: '少走台阶 · 孩子 13:00 午休', order: 3 },
  { Icon: CarIcon, label: '车辆', value: '腾势 D9 · 总高 2.28 m', order: 5 },
];
const SOFT: ProfileField[] = [
  { Icon: CalendarIcon, label: '日期', value: '国庆前后 · 8–10 天', order: 2 },
  { Icon: CompassIcon, label: '方式', value: '自驾或旅行社都可以', order: 4 },
  { Icon: WalletIcon, label: '预算', value: '人均 ¥5,000–7,000', inferred: true, order: 6 },
];

const MODELS = [
  { name: '平台模型', note: '默认 · 今日剩余 18 / 20 次', selected: true },
  { name: '我的 Claude', note: '自带 API · Anthropic 接口' },
  { name: '我的 DeepSeek', note: '自带 API · OpenAI 兼容接口' },
];

export function DialogueScene() {
  return (
    <Scene range={T.dialogueScene} label="AI 对话与需求画像">
      <PageHeader title="新对话" actions={<StatusBadge />} />
      <div className="relative flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col px-4 pb-4">
          <Thread />
          <Composer />
        </div>

        {/* 宽视窗：画像随对话逐项填入右侧面板 */}
        <aside className="hidden w-[288px] shrink-0 flex-col border-l border-[#EEEDE7] bg-[#FCFBF8] cq-md:flex">
          <ProfilePanel />
        </aside>

        {/* 窄视窗：画像收敛后以底部抽屉弹出 */}
        <MobileProfileSheet />
      </div>
    </Scene>
  );
}

/* ── 顶栏右侧：对话进行到哪一步 ── */
function StatusBadge() {
  const p = useProgress();
  const stage = useStep(p, [T.askBubble[0], T.followUp[0], T.profileReady[0]]);
  const label = ['等你开口', '理解需求中', '追问 1 / 3', '画像待确认'][stage];
  return <Badge tone={stage === 3 ? 'flame' : 'neutral'}>{label}</Badge>;
}

/* ── 对话流：底部对齐，新消息把旧消息顶上去 ── */
function Thread() {
  const p = useProgress();
  const quickPicked = useStep(p, [T.followUpPick]) === 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden pb-4 pt-1">
      {/* AI 开场 + 零输入药丸 */}
      <div className="flex shrink-0 items-start gap-2">
        <AiAvatar />
        <div className="min-w-0 rounded-[12px] rounded-tl-[4px] bg-[#F4F4EE] px-3 py-2">
          <p className="text-[13px] leading-relaxed text-[#241E20]">说说你想怎么玩？可以很随意，比如「暑假带爸妈和孩子去西北，别太累」。</p>
          <div className="mt-2 hidden flex-wrap gap-2 cq-sm:flex">
            {['带长辈', '自驾', '想找旅行社', '只有 5 天'].map((t) => (
              <span key={t} className="rounded-full border border-[#E2E2D8] bg-white px-2 py-0.5 text-xs text-[#625F61]">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 用户需求 */}
      <Grow at={T.askBubble} max={192}>
        <div className="ml-auto mt-3 max-w-[88%] rounded-[12px] rounded-tr-[4px] bg-[#241E20] px-3 py-2 text-[13px] leading-relaxed text-[#FFFFF9]">{USER_TEXT}</div>
      </Grow>

      {/* 追问：每轮只问一个问题 */}
      <Grow at={T.followUp} max={182}>
        <div className="mt-3 flex items-start gap-2">
          <AiAvatar />
          <div className="min-w-0 rounded-[12px] rounded-tl-[4px] bg-[#F4F4EE] px-3 py-2">
            <p className="text-xs text-[#828081]">追问 1 / 3</p>
            <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-[#241E20]">自驾的话开什么车？车高大概多少？</p>
            <p className="mt-0.5 text-xs leading-relaxed text-[#625F61]">用来避开限高停车场；找旅行社时也按人数和行李匹配车型。</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <QuickReply label="5 座 SUV" />
              <QuickReply label="7 座 MPV · 带车顶箱" picked={quickPicked} />
              <QuickReply label="还没定" />
            </div>
          </div>
        </div>
      </Grow>

      {/* 用户回答 */}
      <Grow at={T.followUpReply} max={82}>
        <div className="ml-auto mt-3 w-fit max-w-[88%] rounded-[12px] rounded-tr-[4px] bg-[#241E20] px-3 py-2 text-[13px] leading-relaxed text-[#FFFFF9]">{REPLY_TEXT}</div>
      </Grow>

      {/* 画像收敛 */}
      <Grow at={[T.profileFields[6], T.profileReady[0]]} max={102}>
        <div className="mt-3 flex items-start gap-2">
          <AiAvatar />
          <div className="min-w-0 rounded-[12px] rounded-tl-[4px] bg-[#F4F4EE] px-3 py-2 text-[13px] leading-relaxed text-[#241E20]">
            需求整理好了。预算是我按人数和住宿档次<b className="font-semibold text-[#C43200]">推断</b>的，请确认；两条路径共用这份画像，都可以看。
          </div>
        </div>
      </Grow>
    </div>
  );
}

function AiAvatar() {
  return (
    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] bg-[#241E20] text-[#FFFFF9]">
      <SparklesIcon className="h-3.5 w-3.5" />
    </span>
  );
}

function QuickReply({ label, picked = false }: { label: string; picked?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs transition-colors duration-200 ${
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
  const sendScale = useRange(p, [T.askSend - 0.002, T.askSend, T.askSend + 0.002], [1, 0.88, 1]);

  return (
    <div className="relative shrink-0">
      <ModelMenu />
      <div className="relative flex items-center gap-2 rounded-[16px] border border-[#E2E2D8] bg-white p-2 shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
        {/* 模型选择器 */}
        <span className="relative inline-flex h-8 shrink-0 items-center gap-1 whitespace-nowrap rounded-[5px] border border-[#E2E2D8] bg-[#F7F6F1] px-2 text-xs font-medium text-[#241E20]">
          <SparklesIcon className="h-3 w-3 text-[#FE3C01]" />
          平台模型
          <ChevronDownIcon className="h-3 w-3 text-[#828081]" />
          <TapCursor approach={T.modelCursor} clickAt={T.modelMenu[0]} hideAt={T.modelMenu[1] + 0.004} className="left-8 top-4" />
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
        <motion.span aria-hidden className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#FE3C01] text-white" style={{ scale: sendScale }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
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
  const [a, b, c, dd] = T.modelMenu;
  const opacity = useFade(p, a, b, c, dd);
  const y = useRange(p, [a, b, c, dd], [8, 0, 0, 6], { easing: ease.out, rest: 0 });
  const visibility = useVisibility(p, a, dd);
  // 高亮从「平台模型」移到「自带 API」再回到默认项
  const hover = useStep(p, [b + (c - b) * 0.25, b + (c - b) * 0.55, b + (c - b) * 0.85]);
  const hoverIndex = [0, 1, 3, 0][hover];

  return (
    <motion.div
      role="listbox"
      aria-label="选择模型"
      className="absolute bottom-full left-0 z-30 mb-2 w-[min(280px,100%)] overflow-hidden rounded-[12px] border border-[#E2E2D8] bg-white p-1 shadow-[0_16px_40px_rgba(36,30,32,0.12)]"
      style={{ opacity, y, visibility }}
    >
      {MODELS.map((mdl, i) => (
        <div key={mdl.name} className={`flex items-center justify-between gap-2 rounded-[5px] px-2 py-1.5 transition-colors duration-150 ${hoverIndex === i ? 'bg-[#F4F4EE]' : ''}`}>
          <span className="min-w-0">
            <span className="block text-[13px] font-medium text-[#241E20]">{mdl.name}</span>
            <span className="block truncate text-xs text-[#828081]">{mdl.note}</span>
          </span>
          {mdl.selected ? <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#241E20]" /> : null}
        </div>
      ))}
      <div className={`flex items-center gap-2 rounded-[5px] px-2 py-1.5 text-[13px] font-medium text-[#241E20] transition-colors duration-150 ${hoverIndex === 3 ? 'bg-[#F4F4EE]' : ''}`}>
        <PlusIcon className="h-3.5 w-3.5 text-[#625F61]" />
        添加自己的 API
      </div>
      <p className="mt-1 flex items-center gap-1.5 border-t border-[#EEEDE7] px-2 pb-1 pt-2 text-xs text-[#625F61]">
        <KeyIcon className="h-3 w-3 shrink-0" />
        自带 Key 只存在本机，请求直连服务商
      </p>
    </motion.div>
  );
}

/* ── 需求画像（docs/16 §16.3.3） ── */
function ProfilePanel({ compact = false }: { compact?: boolean }) {
  const p = useProgress();
  const emptyOpacity = useRange(p, [T.profileFields[0] - 0.006, T.profileFields[0]], [1, 0]);
  const count = useStep(p, T.profileFields);

  return (
    <div className={`flex h-full w-full flex-col ${compact ? '' : 'p-4'}`}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-[#241E20]">需求画像</p>
        <span className="text-xs tabular-nums text-[#828081]">
          {count} / {HARD.length + SOFT.length} 项
        </span>
      </div>

      <div className="relative mt-3 min-h-0 flex-1">
        {!compact ? (
          <motion.p className="absolute inset-x-0 top-0 text-xs leading-relaxed text-[#828081]" style={{ opacity: emptyOpacity }}>
            对话里提到的人数、日期、身体情况与预算，会在这里整理成一张可以确认的画像。
          </motion.p>
        ) : null}
        <FieldGroup title="硬约束" fields={HARD} compact={compact} />
        <FieldGroup title="偏好" fields={SOFT} compact={compact} className={compact ? 'mt-2' : 'mt-4'} />
      </div>

      <Reveal at={T.profileReady} y={8} className={compact ? 'pt-3' : 'pt-4'}>
        <PathButtons />
      </Reveal>
    </div>
  );
}

function FieldGroup({ title, fields, compact, className = '' }: { title: string; fields: ProfileField[]; compact: boolean; className?: string }) {
  const p = useProgress();
  const opacity = useFade(p, T.profileFields[fields[0].order] - 0.004, T.profileFields[fields[0].order]);
  return (
    <div className={className}>
      <motion.p className="text-xs text-[#828081]" style={{ opacity }}>
        {title}
      </motion.p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {fields.map((f) => (
          <ProfileRow key={f.label} field={f} compact={compact} />
        ))}
      </ul>
    </div>
  );
}

function ProfileRow({ field, compact }: { field: ProfileField; compact: boolean }) {
  const p = useProgress();
  const at = T.profileFields[field.order];
  const opacity = useRange(p, [at, at + 0.006], [0, 1]);
  const x = useRange(p, [at, at + 0.008], [8, 0], { easing: ease.out, rest: 0 });

  if (compact) {
    return (
      <motion.li className="flex h-7 items-center gap-2" style={{ opacity, x }}>
        <field.Icon className="h-3.5 w-3.5 shrink-0 text-[#828081]" />
        <span className="w-8 shrink-0 text-xs text-[#828081]">{field.label}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">{field.value}</span>
        {field.inferred ? <Badge tone="flame">推断</Badge> : null}
      </motion.li>
    );
  }

  return (
    <motion.li
      className={`rounded-[5px] px-2 ${field.inferred ? 'border border-dashed border-[#FE3C01]/50 bg-[#FE3C01]/[0.04] py-1' : ''}`}
      style={{ opacity, x }}
    >
      <div className="flex h-7 items-center gap-2">
        <field.Icon className="h-3.5 w-3.5 shrink-0 text-[#828081]" />
        <span className="w-8 shrink-0 text-xs text-[#828081]">{field.label}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] text-[#241E20]">{field.value}</span>
      </div>
      {field.inferred ? <p className="pb-0.5 pl-[62px] text-xs font-medium text-[#C43200]">推断 · 请确认</p> : null}
    </motion.li>
  );
}

/* ── 两条路径入口（docs/16 §16.4）：路径 B 按钮直接显示匹配数量 ── */
function PathButtons() {
  const p = useProgress();
  const picked = useStep(p, [T.pathClick]) === 1;
  const press = useRange(p, [T.pathClick - 0.003, T.pathClick, T.pathClick + 0.003], [1, 0.96, 1]);

  return (
    <div className="flex flex-col gap-2">
      <motion.span className={`${btn.primary} relative h-9 w-full`} style={{ scale: press }}>
        {picked ? (
          <>
            <span className="h-3 w-3 animate-spin rounded-full border-2 border-[#FFFFF9] border-t-transparent" />
            正在规划自驾路线…
          </>
        ) : (
          <>
            <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
            AI 规划自驾路线
          </>
        )}
        <TapCursor approach={T.pathCursor} clickAt={T.pathClick} hideAt={T.dialogueScene[2]} className="right-10 top-4" />
      </motion.span>
      <span className={`${btn.secondary} h-9 w-full`}>
        <BuildingIcon className="h-3.5 w-3.5 text-[#625F61]" />
        看旅行社线路
        <span className="tabular-nums text-[#625F61]">· 23 条匹配</span>
      </span>
    </div>
  );
}

function MobileProfileSheet() {
  const p = useProgress();
  const y = useRange(p, [T.profileReady[0] - 0.012, T.profileReady[1]], [105, 0], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, T.profileReady[0] - 0.012, 2);

  return (
    <motion.div
      className="absolute inset-x-0 bottom-0 z-30 rounded-t-[16px] border-t border-[#E2E2D8] bg-white px-4 pb-4 pt-2 shadow-[0_-16px_40px_rgba(36,30,32,0.12)] cq-md:hidden"
      style={{ y: yPct, visibility }}
    >
      <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-[#E2E2D8]" />
      <ProfilePanel compact />
    </motion.div>
  );
}
