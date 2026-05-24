// app/page.tsx — OpCEO.AI public shipping homepage.
// Scope: homepage only. Global Nav is hidden on / via ConditionalNav.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';

import { LandingNav } from './_components/home/LandingNav';
import { LandingFooter } from './_components/home/LandingFooter';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600'],
});

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-body-serif',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['300', '400'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono-jb',
  display: 'swap',
  weight: ['400', '500'],
});

export const metadata: Metadata = gm({
  title: 'OpCEO.ai — AI Builder 的公开建造现场',
  description:
    'OpCEO 记录真实 AI Builder 的 Ship Log、工具栈、踩坑和增长路径。用 AI 做出来，然后公开 Ship。',
  path: '/',
});

type Signal = {
  signal: string;
  stack: string;
  learning: string;
  sample?: boolean;
};

const SAMPLE_SIGNALS: Signal[] = [
  {
    signal: '48h 做出第一个 AI Landing Page',
    stack: 'ChatGPT / Lovable / Vercel',
    learning: '学到：先上线，再修文案。',
    sample: true,
  },
  {
    signal: 'Reddit 零广告带来第一批用户',
    stack: 'Claude / Cursor / Supabase',
    learning: '学到：增长路径比功能更重要。',
    sample: true,
  },
  {
    signal: '工厂工作流用 AI 重构出第一版 SOP',
    stack: 'ChatGPT / Replit / Notion',
    learning: '学到：业务现场比模型参数更关键。',
    sample: true,
  },
  {
    signal: '非技术背景 Builder 的第一次公开 Ship',
    stack: 'Bolt / Midjourney / Vercel',
    learning: '学到：能演示，比完美更重要。',
    sample: true,
  },
];

const SUBMISSION_ITEMS = [
  ['Built', '你做出了什么'],
  ['Stack', '用了哪些 AI 工具'],
  ['Broke', '哪里失败了'],
  ['Learned', '这次真正学到了什么'],
];

const MISSION_RULES = [
  '可以 No-code',
  '可以半成品',
  '必须真实上线或可演示',
  '必须记录 Build Log',
  '第一次 Builder 友好',
];

function shortText(value: unknown, fallback: string) {
  if (typeof value !== 'string') return fallback;
  const text = value.trim().replace(/\s+/g, ' ');
  if (!text) return fallback;
  return text.length > 42 ? `${text.slice(0, 42)}...` : text;
}

function stackText(value: unknown) {
  if (!Array.isArray(value) || value.length === 0) return 'AI tools / Build stack';
  return value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .slice(0, 3)
    .join(' / ');
}

async function getLiveSignals(): Promise<Signal[]> {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('ship_logs')
      .select('shipped, learned, tool_stack, created_at')
      .not('builder_id', 'is', null)
      .order('created_at', { ascending: false })
      .limit(4);

    if (!data || data.length === 0) return SAMPLE_SIGNALS;

    return data.map((log) => ({
      signal: shortText(log.shipped, '一次新的 AI Build 记录'),
      stack: stackText(log.tool_stack),
      learning: `学到：${shortText(log.learned, '真实反馈会改变下一步。')}`,
    }));
  } catch {
    return SAMPLE_SIGNALS;
  }
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="font-mono-jb text-[0.7rem] uppercase tracking-[0.18em] text-[#A45A3B]">
      {children}
    </p>
  );
}

export default async function HomePage() {
  const signals = await getLiveSignals();

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

      <div
        className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} hp-root min-h-screen bg-[#FAFAF5] text-[#111111]`}
      >
        <LandingNav />

        <section className="mx-auto grid max-w-6xl grid-cols-1 gap-14 px-5 pb-20 pt-20 sm:px-8 sm:pt-28 lg:grid-cols-[1.18fr_0.82fr] lg:gap-16 lg:pb-28">
          <div>
            <Eyebrow>THE INFINITE BUILD FOR AI BUILDERS</Eyebrow>
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.05rem,6.4vw,5.8rem)] font-medium leading-[0.94] tracking-[-0.052em] text-[#111111]">
              用 AI 做出来，
              <br />
              然后公开 Ship。
            </h1>
            <p className="mt-8 max-w-2xl font-body-serif text-[1.1rem] leading-8 text-black/62 sm:text-[1.22rem]">
              这里不是 AI 资讯站，也不是一次性黑客松。OpCEO 记录真实的 Build Journey：你做了什么、用了什么工具、踩了什么坑、学到了什么。
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/ship"
                className="inline-flex h-12 items-center justify-center rounded-[6px] bg-[#111111] px-6 font-body-serif text-[0.98rem] text-white no-underline transition-colors hover:bg-[#302B24]"
              >
                提交 Ship Log
              </Link>
              <Link
                href="/explore?tab=live"
                className="inline-flex h-12 items-center justify-center rounded-[6px] border border-black/12 px-6 font-body-serif text-[0.98rem] text-[#111111] no-underline transition-colors hover:border-black/28"
              >
                查看真实 Build
              </Link>
            </div>
            <p className="mt-6 max-w-xl font-body-serif text-[0.98rem] leading-7 text-black/46">
              不需要你是工程师。只要你真的用 AI 做出了一个东西，就可以开始。
            </p>
          </div>

          <aside className="border-l border-black/10 pl-5 lg:mt-8">
            <p className="font-mono-jb text-[0.68rem] uppercase tracking-[0.16em] text-black/34">
              Frontier note
            </p>
            <p className="mt-5 max-w-sm font-display text-3xl font-medium leading-tight tracking-[-0.035em] text-[#111111] sm:text-4xl">
              不是发布会。
              <br />
              是建造记录。
            </p>
            <p className="mt-6 max-w-sm font-body-serif text-[1rem] leading-7 text-black/54">
              每一条 Ship Log 都应该留下过程，而不只是展示结果。
            </p>
          </aside>
        </section>

        <section id="signals" className="border-y border-black/8 bg-[#111111] px-5 py-16 text-[#FAFAF5] sm:px-8 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono-jb text-[0.7rem] uppercase tracking-[0.18em] text-white/38">
                  LIVE BUILD SIGNALS
                </p>
                <h2 className="mt-4 font-display text-4xl font-medium leading-tight tracking-[-0.04em] text-white sm:text-5xl">
                  正在发生的 AI Build 信号
                </h2>
              </div>
              <Link
                href="/explore?tab=live"
                className="font-body-serif text-[0.95rem] text-white/54 no-underline transition-colors hover:text-white"
              >
                查看更多 →
              </Link>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[6px] border border-white/12 bg-white/12 md:grid-cols-2">
              {signals.map((item) => (
                <article key={`${item.signal}-${item.stack}`} className="bg-[#111111] p-5 sm:p-6">
                  <div className="flex items-center justify-between gap-4">
                    <p className="font-mono-jb text-[0.62rem] uppercase tracking-[0.16em] text-white/32">
                      {item.sample ? '样例信号 / coming soon' : 'Live signal'}
                    </p>
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C15F3C]" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-medium leading-tight tracking-[-0.035em] text-white">
                    {item.signal}
                  </h3>
                  <p className="mt-5 font-mono-jb text-[0.72rem] uppercase tracking-[0.12em] text-white/42">
                    {item.stack}
                  </p>
                  <p className="mt-4 font-body-serif text-[0.98rem] leading-7 text-white/62">
                    {item.learning}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:gap-16">
            <div>
              <Eyebrow>WHAT GETS SUBMITTED</Eyebrow>
              <h2 className="mt-5 max-w-xl font-display text-4xl font-medium leading-tight tracking-[-0.045em] text-[#111111] sm:text-6xl">
                我们不只看结果，
                <br />
                我们记录建造过程。
              </h2>
              <p className="mt-6 max-w-md font-body-serif text-[1.08rem] leading-8 text-black/56">
                一个 Ship Log 不是项目介绍，而是一段真实的 Build Journey。
              </p>
            </div>

            <div className="grid gap-px overflow-hidden rounded-[6px] border border-black/10 bg-black/10 sm:grid-cols-2">
              {SUBMISSION_ITEMS.map(([label, body]) => (
                <div key={label} className="bg-[#FAFAF5] p-6 sm:p-7">
                  <p className="font-mono-jb text-[0.72rem] uppercase tracking-[0.16em] text-[#A45A3B]">
                    {label}
                  </p>
                  <p className="mt-8 font-body-serif text-[1.15rem] leading-7 text-[#302B24]">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="mission" className="bg-white px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div>
              <Eyebrow>WEEKLY MISSION</Eyebrow>
              <h2 className="mt-5 max-w-lg font-display text-4xl font-medium leading-tight tracking-[-0.045em] text-[#111111] sm:text-6xl">
                每周一个 Build Mission
              </h2>
            </div>

            <div className="rounded-[6px] border border-black/10 bg-[#FAFAF5] p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-mono-jb text-[0.72rem] uppercase tracking-[0.16em] text-black/34">
                    Ship Week 01
                  </p>
                  <h3 className="mt-5 max-w-xl font-display text-3xl font-medium leading-tight tracking-[-0.04em] text-[#111111] sm:text-5xl">
                    48 小时，用 AI 做一个真实可用的小东西。
                  </h3>
                </div>
                <span className="w-fit rounded-full border border-black/10 px-3 py-1 font-mono-jb text-[0.62rem] uppercase tracking-[0.14em] text-black/42">
                  first-builder friendly
                </span>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {MISSION_RULES.map((rule) => (
                  <p key={rule} className="border-t border-black/8 pt-3 font-body-serif text-[1rem] text-black/58">
                    {rule}
                  </p>
                ))}
              </div>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/ship"
                  className="inline-flex h-11 items-center justify-center rounded-[6px] bg-[#111111] px-5 font-body-serif text-[0.95rem] text-white no-underline transition-colors hover:bg-[#302B24]"
                >
                  加入本周 Mission
                </Link>
                <Link
                  href="/ship"
                  className="inline-flex h-11 items-center justify-center rounded-[6px] border border-black/12 px-5 font-body-serif text-[0.95rem] text-[#111111] no-underline transition-colors hover:border-black/28"
                >
                  先提交一个 Ship Log
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-18 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-6xl border-y border-black/10 py-14 sm:py-18">
            <p className="max-w-4xl font-display text-4xl font-medium leading-tight tracking-[-0.045em] text-[#111111] sm:text-6xl">
              未来的 Builder 简历，
              <br />
              不是学历，也不是 Title。
              <br />
              是持续 Ship 的记录。
            </p>
            <p className="mt-8 max-w-2xl font-body-serif text-[1.12rem] leading-8 text-black/58">
              OpCEO 帮你把每一次 AI 建造变成公开资产：作品、工具栈、踩坑、复盘、增长信号，都会沉淀成你的 Builder Track Record。
            </p>
          </div>
        </section>

        <section className="bg-[#111111] px-5 py-18 text-white sm:px-8 sm:py-24">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="max-w-3xl font-display text-5xl font-medium leading-[0.95] tracking-[-0.055em] sm:text-7xl">
              把你的第一次 AI Ship 留在这里。
            </h2>
            <div className="flex shrink-0 flex-col gap-3 sm:w-56">
              <Link
                href="/ship"
                className="inline-flex h-12 items-center justify-center rounded-[6px] bg-white px-6 font-body-serif text-[0.98rem] text-[#111111] no-underline transition-colors hover:bg-[#F3EFE6]"
              >
                提交 Ship Log
              </Link>
              <Link
                href="/explore?tab=live"
                className="inline-flex h-12 items-center justify-center rounded-[6px] border border-white/18 px-6 font-body-serif text-[0.98rem] text-white/70 no-underline transition-colors hover:border-white/34 hover:text-white"
              >
                查看 Build Signals
              </Link>
            </div>
          </div>
        </section>

        <LandingFooter />
      </div>
    </>
  );
}
