'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { scrollToSection } from '@/components/common/Navbar';
import { ChevronDownIcon, KeyIcon, SparklesIcon } from '@/components/common/Icons';

/**
 * 首屏（.agents/rules/unify-gtm-design-system.md §7）
 *
 * 左对齐的衬线大标题（关键词「定下来」用实测的贴边橙色投影，文字仍是炭黑）→ 导语与两个入口 →
 * 一块暖色氛围面板，上面放对话输入框（推荐说法、模型来源都在输入框里）。
 * 产品界面不在首屏重复：紧接着的 C 端舞台就是完整的使用流程。
 */

// 推荐说法：口语化的需求，覆盖路径 A（自己开车）与路径 B（找旅行社）
const PROMPTS = [
  {
    tag: '带长辈和孩子慢慢玩',
    full: '带爸妈和 4 岁宝宝自驾川西 6 天，老人膝盖不好不能爬陡坡，想要不赶路的慢游路线',
  },
  {
    tag: '想找旅行社',
    full: '国庆一家 5 口想走青海甘肃大环线 8 天，不想自己开车，想找旅行社小包团，人均预算 6000 左右',
  },
  {
    tag: '拍雪山和星空',
    full: '4 个人自驾新疆独库公路加伊犁 7 天，想拍雪山和星空，沿途想吃地道的手抓饭和烤包子',
  },
];

export function Hero() {
  const [text, setText] = useState('');
  const [hint, setHint] = useState(0);

  // 输入框为空时轮换占位文字
  useEffect(() => {
    const id = setInterval(() => setHint((i) => (i + 1) % PROMPTS.length), 4500);
    return () => clearInterval(id);
  }, []);

  const send = () => {
    if (!text) setText(PROMPTS[hint].full);
    scrollToSection('demo');
  };

  return (
    <section className="relative bg-[#FFFFF9] pb-12 pt-14 sm:pt-20 md:pb-16 lg:pt-24">
      <div className="mx-auto max-w-[1320px] px-5 sm:px-8 lg:px-10">
        <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="u-eyebrow">
          多端同步、多人共享的 AI 旅行规划 App
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mt-5 font-serif text-[40px] font-bold leading-[1.08] tracking-[-0.03em] text-[#241E20] sm:text-[56px] lg:text-[72px] lg:leading-[1.04]"
        >
          说出想去哪里，
          <br />
          全家一起把行程<span className="u-aura whitespace-nowrap">定下来</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end"
        >
          <p className="max-w-[720px] text-[17px] leading-relaxed text-[#241E20]/75 sm:text-xl sm:leading-relaxed">
            像和 AI 聊天一样说出想法，它会追问几句，帮你把需求想清楚；再给出两种方案：AI 规划的自驾路线，或按匹配度排好的持证旅行社线路。行程放进共享空间，家人一起看、一起提意见，手机、平板、电脑同步。
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => scrollToSection('demo')} className="u-btn u-btn-primary">
              看旅客完整流程
            </button>
            <button type="button" onClick={() => scrollToSection('agency')} className="u-btn u-btn-secondary">
              旅行社线路工作室
            </button>
          </div>
        </motion.div>

        {/* 氛围面板 + 对话输入框 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="atmo atmo-day mt-12 flex min-h-[420px] items-center justify-center rounded-[4px] px-4 py-16 sm:min-h-[480px] sm:px-8 lg:mt-14 lg:min-h-[540px]"
        >
          <div className="w-full max-w-[800px] rounded-[8px] bg-[#FFFFF9] shadow-[0_24px_60px_-20px_rgba(36,30,32,0.45),0_0_0_1px_rgba(36,30,32,0.06)]">
            <label htmlFor="hero-prompt" className="sr-only">
              用一句话描述你的出行需求
            </label>
            <textarea
              id="hero-prompt"
              name="prompt"
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={PROMPTS[hint].full}
              className="block w-full resize-none rounded-t-[8px] bg-transparent px-5 pt-4 text-base leading-relaxed text-[#241E20] placeholder:text-[#241E20]/50 focus:outline-none"
            />
            <div className="flex items-center gap-3 px-4 pb-4 pt-2">
              <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[5px] px-2.5 text-sm font-medium text-[#241E20] shadow-[inset_0_0_0_1px_rgba(36,30,32,0.14)]">
                <SparklesIcon className="h-3.5 w-3.5 text-[#FE3C01]" />
                平台模型
                <ChevronDownIcon className="h-3.5 w-3.5 text-[#241E20]/50" />
              </span>
              <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none]">
                {PROMPTS.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => setText(p.full)}
                    className="u-pill h-9 shrink-0 hover:text-[#241E20] hover:shadow-[inset_0_0_0_1px_rgba(36,30,32,0.4)]"
                  >
                    {p.tag}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={send}
                aria-label="开始对话规划"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#241E20] text-[#FFFFF9] shadow-[0_2px_0_rgba(254,60,1,0.9)] transition-colors hover:bg-[#3A3234]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="12" y1="19" x2="12" y2="5" />
                  <polyline points="5 12 12 5 19 12" />
                </svg>
              </button>
            </div>
            <p className="flex items-center gap-1.5 border-t border-[#241E20]/[0.08] px-5 py-3 text-[13px] text-[#241E20]/65">
              <KeyIcon className="h-3.5 w-3.5 shrink-0" />
              默认使用平台模型，也可以换用你自己的模型 API；自带的 Key 只保存在你的设备上。
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
