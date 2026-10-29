'use client';

import type { ComponentType, ReactNode } from 'react';
import { motion, useTransform } from 'framer-motion';
import { useFadeStyle, useFadeVisibility, useRange, useScrollTypewriter, useStep, useVisibility, ease } from '@/lib/motion';
import { T, sec } from './timeline';
import { Grow, Scene, TapCursor, useProgress } from './primitives';
import type { FlightSpec } from './flight';
import { Badge, CatMark, Chip, Ring, btn } from './ui';
import {
  BuildingIcon,
  CalendarIcon,
  CarIcon,
  CheckIcon,
  ChevronDownIcon,
  CompassIcon,
  ElderIcon,
  HeightIcon,
  MoonIcon,
  PaperclipIcon,
  PersonGlyph,
  PinIcon,
  SparklesIcon,
  StairsIcon,
  UsersIcon,
  WalletIcon,
  type IconProps,
} from '@/components/common/Icons';

/**
 * 01 幕 · AI 对话与需求画像（docs/16 §16.2–§16.4）
 *
 * 对话框即入口：用户说需求 → AI 从这段话里逐项整理出需求画像 → 每轮一个追问 → 收敛后同时给出路径 A / 路径 B 两个入口。
 * 字句化形（导演版，2026-10-29）：句子发出后，被理解的短语逐个画上一道橙色下划线，化成小签飞进右侧画像的空位，
 * 落地时那一项才填上——观众看见的是「这句话变成了这份画像」。只有预算没有来源词：它是推断的，直接以虚线区间出现。
 * 追问得到的「总高 2.28 m」落位时亮一下，这是全片的伏笔（02 幕的地面车位、04 幕的限高地库都从它来）。
 * 画像的每一项用图形表达（同行人剪影、必去地点、日期条、车高、预算区间），先显示空位，聊到一项填一项。
 * 手机上没有右侧面板：短语飞进标题栏的画像进度环，收敛后画像以底部抽屉弹出。
 * 模型来源（平台模型 / 自带 API）留在输入框的胶囊里，自带 API 的细节在能力画廊讲，开场不再展开菜单。
 */

type PhraseId = keyof typeof T.phrase;

/** 每个短语落进画像的哪一项 */
const PHRASE_FIELD: Record<PhraseId, string> = {
  date: 'field-date',
  people: 'field-people',
  body: 'field-body',
  nap: 'field-body',
  sights: 'field-sights',
  mode: 'field-mode',
  height: 'field-vehicle',
};

/** 用户的需求：被理解的短语带 id，发出后依次画下划线、飞进画像（拼起来就是完整原文，打字机按原文逐字输入） */
const USER_SEGMENTS: readonly (string | { id: PhraseId; text: string })[] = [
  '全家 5 口',
  { id: 'date', text: '国庆前后' },
  '去河西走廊，玩 9 天左右。带 ',
  { id: 'people', text: '70 岁的爷爷和 4 岁的女儿' },
  '，爷爷膝盖做过手术',
  { id: 'body', text: '不能爬高台阶' },
  '，孩子',
  { id: 'nap', text: '每天要午休' },
  '。想看',
  { id: 'sights', text: '莫高窟和鸣沙山日落' },
  '，别太赶。',
  { id: 'mode', text: '自己开车或者找旅行社都行' },
  '。',
];

const USER_TEXT = USER_SEGMENTS.map((s) => (typeof s === 'string' ? s : s.text)).join('');

/** 追问的回答：「总高 2.28 米」是最后一个飞进画像的短语 */
const REPLY_HEIGHT = '总高 2.28 米';

/** 飞行中的小签：短语原文，白底、品牌橙字 */
function PhraseToken({ text }: { text: string }) {
  return <span className="ui-chip !h-7 !bg-ui-surface !text-ui-accent-ink shadow-ui-float ring-1 ring-ui-accent/25">{text}</span>;
}

/** 01 幕的飞行：宽视窗落到对应的画像项，窄视窗（没有右侧面板）落进标题栏的画像进度环 */
export const DIALOGUE_FLIGHTS: FlightSpec[] = [
  ...USER_SEGMENTS.flatMap((s) =>
    typeof s === 'string'
      ? []
      : [{ id: `ph-${s.id}`, from: `ph-${s.id}`, to: [PHRASE_FIELD[s.id], 'profile-ring'], t: [T.phrase[s.id], T.phrase[s.id] + T.phraseFly] as const, token: <PhraseToken text={s.text} /> }],
  ),
  {
    id: 'ph-height',
    from: 'ph-height',
    to: ['field-vehicle', 'profile-ring'],
    t: [T.phrase.height, T.phrase.height + T.phraseFly],
    token: <PhraseToken text={REPLY_HEIGHT} />,
  },
];

const FIELD_COUNT = 7;

export function DialogueScene() {
  return (
    <Scene range={T.dialogueScene} label="AI 对话与需求画像">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-ui-line px-4">
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-ui-ink">新对话</h3>
        <HeaderProgress />
        <StatusBadge />
      </header>
      <div className="relative flex min-h-0 flex-1">
        <div data-cam="chat-col" className="relative flex min-w-0 flex-1 flex-col px-4 pb-4">
          <Thread />
          <Composer />
        </div>

        {/* 宽视窗：画像随对话逐项填入右侧面板 */}
        <aside className="ui-aside hidden w-[300px] shrink-0 flex-col cq-md:flex">
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
  return <Badge tone={stage === 3 ? 'signal' : 'neutral'}>{label}</Badge>;
}

/* ═════════════════════ 对话流：底部对齐，新消息把旧消息顶上去 ═════════════════════ */
function Thread() {
  const p = useProgress();
  const quickPicked = useStep(p, [T.followUpPick]) === 1;

  return (
    <div className="relative flex min-h-0 flex-1 flex-col justify-end overflow-hidden pb-4 pt-1">
      {/* AI 开场 + 零输入建议：示例说法与目的地无关 */}
      <AssistantTurn cam="chat-opener">
        <p>说说你想怎么玩？可以很随意，比如「周末带爸妈去海边住两晚，别太累」。</p>
        <div className="mt-2.5 hidden flex-wrap gap-1.5 cq-sm:flex">
          <Chip Icon={ElderIcon} tone="outline">带长辈</Chip>
          <Chip Icon={CarIcon} tone="outline">自驾</Chip>
          <Chip Icon={BuildingIcon} tone="outline">想找旅行社</Chip>
          <Chip Icon={CalendarIcon} tone="outline">只有 5 天</Chip>
        </div>
      </AssistantTurn>

      {/* 用户需求：被理解的短语画上下划线，随后飞进画像 */}
      <Grow at={T.askBubble} max={200}>
        <UserBubble>
          {USER_SEGMENTS.map((seg, i) =>
            typeof seg === 'string' ? (
              seg
            ) : (
              <Mark key={i} id={`ph-${seg.id}`} at={T.phrase[seg.id]}>
                {seg.text}
              </Mark>
            ),
          )}
        </UserBubble>
      </Grow>

      {/* 追问：每轮只问一个问题 */}
      <Grow at={T.followUp} max={176}>
        <AssistantTurn className="mt-4">
          <p className="flex items-center gap-1.5 text-xs text-ui-ink-3">
            <span aria-hidden className="flex gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-ui-accent" />
              <span className="h-1.5 w-1.5 rounded-full bg-ui-line-strong" />
              <span className="h-1.5 w-1.5 rounded-full bg-ui-line-strong" />
            </span>
            追问 1 / 3
          </p>
          <p className="mt-1 font-medium">自驾的话开什么车？车高大概多少？</p>
          <p className="mt-0.5 text-xs leading-relaxed text-ui-ink-2">用来避开限高停车场；找旅行社时也按人数和行李匹配车型。</p>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            <Chip Icon={CarIcon} tone="outline">5 座 SUV</Chip>
            <Chip Icon={quickPicked ? CheckIcon : CarIcon} tone={quickPicked ? 'selected' : 'outline'}>
              7 座 MPV · 带车顶箱
            </Chip>
            <Chip tone="outline">还没定</Chip>
          </div>
        </AssistantTurn>
      </Grow>

      {/* 用户回答：「总高 2.28 米」飞进画像的「车辆」 */}
      <Grow at={T.followUpReply} max={72}>
        <UserBubble className="w-fit">
          租腾势 D9，加了车顶箱，
          <Mark id="ph-height" at={T.phrase.height}>
            {REPLY_HEIGHT}
          </Mark>
          。
        </UserBubble>
      </Grow>

      {/* 画像收敛 */}
      <Grow at={T.closing} max={96}>
        <AssistantTurn className="mt-4">
          需求整理好了。预算是我按人数和住宿档次<b className="font-semibold text-ui-signal-ink">推断</b>的，请确认；两条路径共用这份画像，都可以看。
        </AssistantTurn>
      </Grow>
    </div>
  );
}

/**
 * 被理解的短语：起飞前画上一道品牌橙的下划线（从左向右划出），之后一直留着——这句话里哪些被读懂了，一眼可见。
 * 用背景渐变画线（box-decoration-break: clone），短语折行时每一行各画一段。
 */
function Mark({ id, at, children }: { id: string; at: number; children: ReactNode }) {
  const p = useProgress();
  const sweep = useRange(p, [at - sec(0.14), at + sec(0.06)], [0, 100]);
  const backgroundSize = useTransform(sweep, (v) => `${v.toFixed(1)}% 2px`);
  return (
    <motion.span
      data-cam={id}
      style={{
        backgroundImage: 'linear-gradient(rgb(var(--ui-accent) / 0.8), rgb(var(--ui-accent) / 0.8))',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: '0 100%',
        backgroundSize,
        WebkitBoxDecorationBreak: 'clone',
        boxDecorationBreak: 'clone',
      }}
    >
      {children}
    </motion.span>
  );
}

/** AI 的一轮：品牌标记 + 不加气泡的正文（与 ChatGPT / Claude 的读法一致） */
function AssistantTurn({ children, className = '', cam }: { children: ReactNode; className?: string; cam?: string }) {
  return (
    <div data-cam={cam} className={`flex shrink-0 items-start gap-2.5 ${className}`}>
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] bg-[#241E20] text-xs font-bold text-[#FFFFF9]">旅</span>
      <div className="min-w-0 flex-1 text-[13px] leading-relaxed text-ui-ink">{children}</div>
    </div>
  );
}

function UserBubble({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`ml-auto mt-4 max-w-[86%] rounded-[18px] rounded-br-[6px] bg-ui-bubble-user px-3.5 py-2 text-[13px] leading-relaxed text-ui-on-bubble-user ${className}`}>
      {children}
    </div>
  );
}

/* ═════════════════════ 输入框 ═════════════════════ */

/**
 * 输入框（像 ChatGPT / Claude 的输入框）：上面是文本区，下面一行是模型选择器（平台模型 / 自带 API）、附件与发送。
 * 文本区从一行起，随文字逐行向上长高，最多 6 行；再多就在框内滚动，最新一行始终可见（底部对齐，超出部分从顶上裁掉）。
 * 输入框长高时，上方对话流随之上移；发送后文字进入用户气泡，输入框清空、收回一行。
 * 打字机直接写 textContent、不触发 React 渲染，高度靠文字自然撑开。
 */
function Composer() {
  const p = useProgress();
  const typedRef = useScrollTypewriter(p, USER_TEXT, T.askType[0], T.askType[1], T.askSend);
  const placeholder = useRange(p, [T.askType[0] - 0.002, T.askType[0], T.askSend, T.askSend + 0.004], [1, 0, 0, 1]);
  const placeholderVisibility = useFadeVisibility(placeholder);
  // 光标只在打字时闪
  const caret = useFadeStyle(p, T.askType[0] - 0.001, T.askType[0], T.askSend - 0.001, T.askSend);
  const sent = useStep(p, [T.askSend]) === 1;
  const sendScale = useRange(p, [T.askSend - sec(0.1), T.askSend, T.askSend + sec(0.1)], [1, 0.88, 1]);

  return (
    <div data-cam="composer" className="relative shrink-0">
      <div className="ui-card relative px-3 pb-2 pt-2.5 !shadow-ui-float">
        {/* 文本区：一行 20px，最多 6 行（120px），超出后裁掉最上面的行 */}
        <div className="relative flex max-h-[120px] min-h-5 flex-col justify-end overflow-hidden text-[13px] leading-5 text-ui-ink">
          <motion.span className="pointer-events-none absolute inset-x-0 top-0 truncate text-ui-ink-3" style={{ opacity: placeholder, visibility: placeholderVisibility }}>
            {sent ? '回答追问，或继续补充…' : '说说这趟旅行：谁去、去哪、在意什么…'}
          </motion.span>
          <p className="min-h-5 break-words">
            {/* 首帧为空：完整原文在发送后的用户气泡里 */}
            <span ref={typedRef} />
            <motion.span className="ml-0.5 inline-block h-3.5 w-[2px] animate-caret bg-ui-accent align-middle" style={caret} />
          </p>
        </div>

        <div className="mt-2 flex items-center gap-1.5">
          {/* 模型选择器：平台模型或自带 API（细节在能力画廊） */}
          <span className="relative inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-ui-sunken px-2.5 text-xs font-medium text-ui-ink">
            <SparklesIcon className="h-3.5 w-3.5 text-ui-accent" />
            平台模型
            <ChevronDownIcon className="h-3 w-3 text-ui-ink-3" />
          </span>
          <span className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ui-ink-3" title="附件：截图、行程 PDF、聊天记录">
            <PaperclipIcon className="h-4 w-4" />
          </span>
          <motion.span aria-hidden className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ui-accent text-white" style={{ scale: sendScale }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5" />
              <path d="m5 12 7-7 7 7" />
            </svg>
            <TapCursor approach={[T.askSend - sec(0.4), T.askSend - sec(0.03)]} clickAt={T.askSend} hideAt={T.askSend + sec(0.4)} className="left-4 top-4" />
          </motion.span>
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════ 需求画像（docs/16 §16.3.3）：每一项都是图形 ═════════════════════ */

interface ProfileField {
  label: string;
  Icon: ComponentType<IconProps>;
  /** 在 T.profileFields 中的出现顺序（按落地先后） */
  order: number;
  /** 镜头与飞行的落点（data-cam） */
  cam: string;
  /** 空位虚线的宽度（%） */
  empty: number;
  inferred?: boolean;
  full: ReactNode;
  compact: ReactNode;
}

/** 同行人：剪影按人数排开，长者与儿童单独标注 */
function Travelers() {
  const group = (kinds: ('adult' | 'elder' | 'child')[], caption: string) => (
    <span className="flex flex-col items-start gap-0.5">
      <span className="flex items-end text-ui-ink-2">
        {kinds.map((k, i) => (
          <PersonGlyph key={i} kind={k} className={k === 'child' ? '-ml-1 h-5 w-5 first:ml-0' : '-ml-1 h-6 w-6 first:ml-0'} />
        ))}
      </span>
      <span className="text-xs leading-4 text-ui-ink-2">{caption}</span>
    </span>
  );
  return (
    <span className="flex items-end gap-4">
      {group(['adult', 'adult', 'adult'], '成人 ×3')}
      {group(['elder'], '长者 70+')}
      {group(['child'], '儿童 4 岁')}
    </span>
  );
}

/** 日期：国庆前后，8–10 天的弹性区间 */
function DateBar() {
  return (
    <span className="block w-full">
      <span className="relative block h-5">
        <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-ui-sunken" />
        {/* 必须的 8 天实心，可延长的 2 天渐隐 */}
        <span className="absolute left-[8%] right-[26%] top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-ui-accent" />
        <span className="absolute left-[73%] right-[8%] top-1/2 h-1.5 -translate-y-1/2 rounded-r-full bg-gradient-to-r from-ui-accent/60 to-ui-accent/0" />
        {/* 10/1 国庆 */}
        <span className="absolute left-[60%] top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ui-surface bg-ui-ink" />
      </span>
      <span className="mt-0.5 flex justify-between text-xs leading-4 text-ui-ink-3">
        <span>9/24</span>
        <span className="text-ui-ink-2">国庆 · 8–10 天</span>
        <span>10/3</span>
      </span>
    </span>
  );
}

/**
 * 车高：追问得到的「总高 2.28 m」落位时亮一下（只亮一次，不循环）。这是全片的伏笔：
 * 02 幕 D0 的地面车位、04 幕夜市的限高地库，都是因为这一项。
 */
function HeightChip() {
  const p = useProgress();
  const landed = T.profileFields[5];
  const glow = useRange(p, [landed, landed + sec(0.25), landed + sec(1.6)], [0, 1, 0]);
  const glowVisibility = useFadeVisibility(glow);
  return (
    <span className="relative inline-flex">
      <motion.span aria-hidden className="absolute -inset-1 rounded-full ring-2 ring-ui-accent/45" style={{ opacity: glow, visibility: glowVisibility }} />
      <Chip Icon={HeightIcon} tone="accent">
        总高 2.28 m
      </Chip>
    </span>
  );
}

/** 预算：推断的人均区间（虚线框），刻度 ¥0–12k */
function BudgetBar() {
  return (
    <span className="block w-full">
      <span className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium tabular-nums text-ui-ink">
          ¥5,000–7,000 <span className="text-xs font-normal text-ui-ink-3">/ 人</span>
        </span>
        <Badge tone="signal">推断 · 请确认</Badge>
      </span>
      <span className="relative mt-1 block h-2 rounded-full bg-ui-sunken">
        <span className="absolute inset-y-[-2px] left-[41.6%] right-[41.6%] rounded-full border border-dashed border-ui-signal bg-ui-signal/15" />
      </span>
    </span>
  );
}

const FIELDS: { title: string; fields: ProfileField[] }[] = [
  {
    title: '必须满足',
    fields: [
      { label: '同行', Icon: UsersIcon, order: 1, cam: 'field-people', empty: 72, full: <Travelers />, compact: '3 成人 · 1 长者 70+ · 1 儿童 4 岁' },
      {
        label: '必去',
        Icon: PinIcon,
        order: 3,
        cam: 'field-sights',
        empty: 58,
        full: (
          <span className="flex flex-wrap gap-1.5">
            <Chip>
              <CatMark cat="sight" size={16} />
              莫高窟
            </Chip>
            <Chip>
              <CatMark cat="nature" size={16} />
              鸣沙山日落
            </Chip>
          </span>
        ),
        compact: '莫高窟 · 鸣沙山日落',
      },
      {
        label: '身体',
        Icon: ElderIcon,
        order: 2,
        cam: 'field-body',
        empty: 50,
        full: (
          <span className="flex flex-wrap gap-1.5">
            <Chip Icon={StairsIcon}>少走台阶</Chip>
            <Chip Icon={MoonIcon}>13:00 午休</Chip>
          </span>
        ),
        compact: '少走台阶 · 孩子 13:00 午休',
      },
      {
        label: '车辆',
        Icon: CarIcon,
        order: 5,
        cam: 'field-vehicle',
        empty: 46,
        full: (
          <span className="flex flex-wrap items-center gap-1.5">
            <span className="text-[13px] text-ui-ink">腾势 D9 · 车顶箱</span>
            <HeightChip />
          </span>
        ),
        compact: '腾势 D9 · 总高 2.28 m',
      },
    ],
  },
  {
    title: '偏好',
    fields: [
      { label: '日期', Icon: CalendarIcon, order: 0, cam: 'field-date', empty: 64, full: <DateBar />, compact: '国庆前后 · 8–10 天' },
      {
        label: '方式',
        Icon: CompassIcon,
        order: 4,
        cam: 'field-mode',
        empty: 80,
        full: (
          <span className="flex flex-wrap gap-1.5">
            <Chip Icon={CheckIcon}>自驾</Chip>
            <Chip Icon={CheckIcon}>旅行社</Chip>
          </span>
        ),
        compact: '自驾或旅行社都可以',
      },
      { label: '预算', Icon: WalletIcon, order: 6, cam: 'field-budget', empty: 68, inferred: true, full: <BudgetBar />, compact: '人均 ¥5,000–7,000' },
    ],
  },
];

/** 画像完成度：0 → 7 项，环形进度随每一项平滑推进 */
function useProfileCount() {
  const p = useProgress();
  const count = useStep(p, T.profileFields);
  const input: number[] = [];
  const output: number[] = [];
  T.profileFields.forEach((t, i) => {
    input.push(t, t + sec(0.2));
    output.push(i / FIELD_COUNT, (i + 1) / FIELD_COUNT);
  });
  const ring = useRange(p, input, output);
  return { count, ring };
}

function ProfilePanel() {
  const { count, ring } = useProfileCount();
  return (
    <div className="flex h-full w-full flex-col p-4">
      <div className="flex items-center gap-2.5">
        <Ring value={ring} size={30} stroke={3}>
          <span className="text-xs font-semibold tabular-nums text-ui-ink">{count}</span>
        </Ring>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-semibold leading-5 text-ui-ink">需求画像</p>
          <p className="text-xs leading-4 text-ui-ink-3">从对话里整理 · {count} / {FIELD_COUNT} 项</p>
        </div>
      </div>

      <div className="mt-3 min-h-0 flex-1">
        {FIELDS.map((g, gi) => (
          <div key={g.title} className={gi > 0 ? 'mt-2.5' : ''}>
            <p className="text-xs font-medium text-ui-ink-3">{g.title}</p>
            <ul className="mt-0.5 flex flex-col">
              {g.fields.map((f) => (
                <FieldRow key={f.label} field={f} />
              ))}
            </ul>
          </div>
        ))}
      </div>

      <PathButtons />
    </div>
  );
}

function FieldRow({ field }: { field: ProfileField }) {
  const p = useProgress();
  const at = T.profileFields[field.order];
  const opacity = useRange(p, [at - sec(0.06), at + sec(0.28)], [0, 1]);
  const visibility = useFadeVisibility(opacity);
  const y = useRange(p, [at - sec(0.06), at + sec(0.4)], [6, 0], { easing: ease.out, rest: 0 });
  const empty = useRange(p, [at - sec(0.1), at + sec(0.1)], [1, 0]);
  const emptyVisibility = useFadeVisibility(empty);

  return (
    <li className="flex gap-2 py-[5px]">
      <span className="flex h-6 w-[52px] shrink-0 items-center gap-1.5 text-xs text-ui-ink-3">
        <field.Icon className="h-3.5 w-3.5 shrink-0" />
        {field.label}
      </span>
      <span data-cam={field.cam} className="relative flex min-h-6 min-w-0 flex-1 items-center">
        {/* 空位：还没聊到这一项 */}
        <motion.span
          aria-hidden
          className="absolute left-0 top-1 h-4 rounded-full border border-dashed border-ui-line-strong"
          style={{ width: `${field.empty}%`, opacity: empty, visibility: emptyVisibility }}
        />
        <motion.span className="block w-full" style={{ opacity, visibility, y }}>
          {field.full}
        </motion.span>
      </span>
    </li>
  );
}

/* ── 两条路径入口（docs/16 §16.4）：路径 B 按钮直接显示匹配数量 ── */
function PathButtons() {
  const p = useProgress();
  const fade = useFadeStyle(p, T.profileReady[0], T.profileReady[1]);
  const y = useRange(p, T.profileReady, [8, 0], { rest: 0 });
  const picked = useStep(p, [T.pathClick]) === 1;
  const press = useRange(p, [T.pathClick - sec(0.12), T.pathClick, T.pathClick + sec(0.12)], [1, 0.96, 1]);

  return (
    <motion.div data-cam="path-buttons" className="flex shrink-0 flex-col gap-2 pt-3" style={{ ...fade, y }}>
      <motion.span className={`${btn.primary} relative h-10 w-full`} style={{ scale: press }}>
        {picked ? (
          <>
            <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
            正在规划自驾路线…
          </>
        ) : (
          <>
            <SparklesIcon className="h-4 w-4" />
            AI 规划自驾路线
          </>
        )}
        <TapCursor approach={T.pathCursor} clickAt={T.pathClick} hideAt={T.dialogueScene[2]} className="right-10 top-5" />
      </motion.span>
      <span className={`${btn.secondary} h-10 w-full`}>
        <BuildingIcon className="h-4 w-4 text-ui-ink-2" />
        看旅行社线路
        <span className="tabular-nums text-ui-ink-3">· 23 条匹配</span>
      </span>
    </motion.div>
  );
}

/* ═════════════════════ 窄视窗：顶部进度胶囊 + 底部抽屉 ═════════════════════ */

/** 窄视窗没有右侧面板：标题栏里用一个小进度环显示画像整理到第几项 */
function HeaderProgress() {
  const p = useProgress();
  const { count, ring } = useProfileCount();
  // 第一个短语起飞前就出现：手机上短语飞进的就是这个环
  const fade = useFadeStyle(p, T.phrase.date - sec(0.25), T.phrase.date);
  return (
    <motion.span className="flex shrink-0 items-center gap-1.5 text-xs text-ui-ink-2 cq-md:hidden" style={fade}>
      <span data-cam="profile-ring" className="inline-flex">
        <Ring value={ring} size={20} stroke={2.5} />
      </span>
      画像
      <span className="tabular-nums">
        {count}/{FIELD_COUNT}
      </span>
    </motion.span>
  );
}

function MobileProfileSheet() {
  const p = useProgress();
  const y = useRange(p, [T.profileReady[0] - sec(0.6), T.profileReady[1]], [105, 0], { easing: ease.out });
  const yPct = useTransform(y, (n) => `${n}%`);
  const visibility = useVisibility(p, T.profileReady[0] - sec(0.6), 2);

  return (
    <motion.div className="ui-float absolute inset-x-0 bottom-0 z-30 rounded-t-ui-panel !border-x-0 !border-b-0 px-4 pb-4 pt-2 cq-md:hidden" style={{ y: yPct, visibility }}>
      <span aria-hidden className="mx-auto mb-3 block h-1 w-9 rounded-full bg-ui-line-strong" />
      <div className="flex items-center gap-2.5">
        <Ring value={1} size={26} stroke={2.5}>
          <CheckIcon className="h-3.5 w-3.5 text-ui-accent-ink" />
        </Ring>
        <p className="min-w-0 flex-1 text-[15px] font-semibold text-ui-ink">需求画像 · 7 项</p>
        <Badge tone="signal">1 项推断</Badge>
      </div>
      <ul className="mt-2.5 flex flex-col">
        {FIELDS.flatMap((g) => g.fields).map((f) => (
          <li key={f.label} className="flex h-8 items-center gap-2 border-b border-ui-line last:border-b-0">
            <f.Icon className="h-3.5 w-3.5 shrink-0 text-ui-ink-3" />
            <span className="w-8 shrink-0 text-xs text-ui-ink-3">{f.label}</span>
            <span className="min-w-0 flex-1 truncate text-[13px] text-ui-ink">{f.compact}</span>
            {f.inferred ? <Badge tone="signal">推断</Badge> : null}
          </li>
        ))}
      </ul>
      <PathButtons />
    </motion.div>
  );
}
