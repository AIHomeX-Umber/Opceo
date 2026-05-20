// app/page.tsx — Builder Intelligence Homepage
// Redesigned as editorial intelligence platform.
// Scope: ONLY this file changed. No DB queries — fully static.
// Fonts scoped to .hp-root wrapper via CSS variables; body font unchanged.
// Does NOT affect /explore, /agents, /quests, /calendar, /accelerate, rankings-v1.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, JetBrains_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';

// ── Homepage-scoped fonts ─────────────────────────────────────────────────────
// CSS variables applied only inside the .hp-root wrapper div.
// Global body font (Geist) is untouched.

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  weight: ['400', '500'],
});

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = gm({
  title: 'OpCEO.AI — Builder Intelligence',
  description:
    '按真实 Ship 记录追踪长期建造者。AI Native 创业者的结构化增长情报，每周更新。',
  path: '/',
});

// ── Intel card data (hardcoded) ───────────────────────────────────────────────

type IntelCard = {
  id: string;
  category: string;
  headline: string;
  subtext: string;
  stat: string;
  statLabel: string;
  tag: string;
  accent: string;
};

const INTEL_CARDS: IntelCard[] = [
  {
    id: 'consistency',
    category: 'CONSISTENCY INDEX',
    headline: '34% of active builders have maintained 7+ day streaks',
    subtext:
      'The top quartile shows a 4.2× compounding effect on build score after 90 consecutive days of shipping.',
    stat: '4.2×',
    statLabel: 'score multiplier at day 90',
    tag: 'Behavioral Signal',
    accent: '#534AB7',
  },
  {
    id: 'toolstack',
    category: 'TOOLSTACK TRENDS',
    headline: 'Claude + Cursor now leads AI-native builder tool stacks',
    subtext:
      'Single-LLM stacks show 40% higher abandonment. Tool diversity correlates strongly with project longevity.',
    stat: '−40%',
    statLabel: 'abandonment w/ multi-tool stacks',
    tag: 'Platform Intelligence',
    accent: '#1D9E75',
  },
  {
    id: 'crossborder',
    category: 'MARKET SIGNALS',
    headline: 'Southeast Asia AI tool demand up 120% this quarter',
    subtext:
      'Builders targeting cross-border markets report 2.4× faster time to first paying user than domestic-only focus.',
    stat: '+120%',
    statLabel: 'YoY demand, SEA market',
    tag: 'Market Signal',
    accent: '#D85A30',
  },
  {
    id: 'pivot-timing',
    category: 'BUILDER LIFECYCLE',
    headline: 'Solo builders average their first major pivot at week 8',
    subtext:
      'Projects that survive week 12 without pivoting have 3× higher long-term completion rates than early-pivot projects.',
    stat: 'W8',
    statLabel: 'median first pivot week',
    tag: 'Behavioral Signal',
    accent: '#534AB7',
  },
  {
    id: 'velocity',
    category: 'VELOCITY',
    headline: 'AI-native products: median 11 days from idea to first paying user',
    subtext:
      'Builders who ship publicly reach first revenue 2.4× faster than those building in stealth.',
    stat: '11天',
    statLabel: 'idea → first paying user',
    tag: 'Performance Signal',
    accent: '#1D9E75',
  },
  {
    id: 'compounding',
    category: 'COMPOUNDING EFFECT',
    headline: '90-day builders compound 4.2× faster than new entrants',
    subtext:
      'Each additional streak week adds disproportionate weight to ranking scores. Consistency is the structural moat.',
    stat: '90天',
    statLabel: 'the compounding threshold',
    tag: 'Network Intelligence',
    accent: '#D85A30',
  },
];

const FILTER_TABS = [
  'All',
  'Consistency',
  'Market Signals',
  'Toolstack',
  'Velocity',
  'Lifecycle',
];

// ── How It Works ──────────────────────────────────────────────────────────────

const HOW_STEPS = [
  {
    num: '01',
    title: '建造者每周 Ship',
    body: '每个 Builder 提交本周完成了什么、学到了什么、下周计划做什么。公开记录，积累信号。',
  },
  {
    num: '02',
    title: '系统提炼行为信号',
    body: '连续建造天数、产出频率、工具栈变化——这些行为模式比任何简历都更真实。',
  },
  {
    num: '03',
    title: '生成 Builder Intelligence',
    body: '跨建造者的聚合洞察：谁在加速、哪些工具正在崛起、哪个市场信号值得关注。',
  },
];

// ── Sparkline bars for preview card ──────────────────────────────────────────

const SPARKLINE = [3, 4, 4, 5, 5, 6, 6, 7, 8, 9, 11, 14, 18, 24, 32];
const SPARK_MAX = 32;

// ── Page ──────────────────────────────────────────────────────────────────────

// Intentionally not async — no DB queries on the new homepage.
export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

      {/*
        .hp-root: scopes the two font CSS variables.
        Background intentionally NOT set here — hero and sections each set their own bg.
        This avoids touching the global body bg used by all other routes.
      */}
      <div className={`${newsreader.variable} ${jetbrainsMono.variable}`}>

        {/* ── HERO ─────────────────────────────────────────────────────────
            Dark banner. Visually continuous with the sticky dark Nav above.
            Serif headline for editorial weight.
        ──────────────────────────────────────────────────────────────── */}
        <section className="bg-[#0a0a0a] text-white pt-20 pb-24 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">

            {/* Eyebrow */}
            <p
              className="text-[10px] tracking-[0.22em] uppercase mb-8 text-white/25"
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              Builder Intelligence Platform
            </p>

            {/* Headline */}
            <h1
              className="text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] font-medium tracking-tight mb-6 max-w-3xl"
              style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
            >
              Where builders are tracked
              <br />
              <span className="text-white/45">by what they ship,</span>
              <br />
              not what they say.
            </h1>

            <p className="text-base sm:text-lg text-white/40 mb-10 max-w-lg leading-relaxed">
              Structured growth intelligence on AI-native builders —
              every Ship, every streak, every signal. Weekly.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center h-10 px-5 bg-[#534AB7] hover:bg-[#4339a0] text-white text-sm font-medium rounded-sm transition-colors"
              >
                Try OpCEO →
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center h-10 px-5 border border-white/12 text-white/60 hover:border-white/25 hover:text-white text-sm font-medium rounded-sm transition-colors"
              >
                Login
              </Link>
              <Link
                href="#intelligence"
                className="inline-flex items-center h-10 px-5 border border-white/8 text-white/35 hover:text-white/60 text-sm font-medium rounded-sm transition-colors"
              >
                Browse intel ↓
              </Link>
            </div>
          </div>
        </section>

        {/* ── FILTER BAR ───────────────────────────────────────────────────
            Sticky below the site nav (top-14 = 56px = nav height).
            Underline tab style on warm parchment background.
            V1: visual affordance only — all tabs show the same grid.
        ──────────────────────────────────────────────────────────────── */}
        <div
          id="intelligence"
          className="bg-[#F3EFE6] border-b border-[#302B24]/10 sticky top-14 z-30"
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 overflow-x-auto">
            <div className="flex gap-0 min-w-max sm:min-w-0">
              {FILTER_TABS.map((tab, i) => (
                <button
                  key={tab}
                  className={`px-4 py-3 text-[11px] font-medium transition-colors whitespace-nowrap border-b-2 ${
                    i === 0
                      ? 'border-[#302B24] text-[#302B24]'
                      : 'border-transparent text-[#302B24]/35 hover:text-[#302B24]/65'
                  }`}
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── INTELLIGENCE GRID ────────────────────────────────────────────
            6 hardcoded intel cards on warm parchment.
            Each card has a colored top accent border per signal category.
        ──────────────────────────────────────────────────────────────── */}
        <section className="bg-[#F3EFE6] py-16 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">

            <div className="flex items-baseline justify-between mb-8">
              <h2
                className="text-lg font-medium text-[#302B24]"
                style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
              >
                Current Intelligence
              </h2>
              <span
                className="text-[10px] text-[#302B24]/30"
                style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
              >
                6 briefs · updated weekly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {INTEL_CARDS.map((card) => (
                <article
                  key={card.id}
                  className="bg-white rounded-sm border border-[#302B24]/8 hover:border-[#302B24]/16 hover:shadow-sm transition-all flex flex-col"
                  style={{ borderTopColor: card.accent, borderTopWidth: 2 }}
                >
                  <div className="px-5 pt-5 pb-4 flex-1">

                    {/* Category label */}
                    <p
                      className="text-[9px] tracking-[0.18em] uppercase mb-3"
                      style={{
                        fontFamily: 'var(--font-jetbrains-mono, monospace)',
                        color: card.accent,
                      }}
                    >
                      {card.category}
                    </p>

                    {/* Primary stat */}
                    <div className="mb-3">
                      <span
                        className="text-3xl font-semibold text-[#302B24]"
                        style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                      >
                        {card.stat}
                      </span>
                      <span
                        className="block text-[10px] text-[#302B24]/35 mt-0.5"
                        style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                      >
                        {card.statLabel}
                      </span>
                    </div>

                    {/* Headline */}
                    <h3
                      className="text-sm font-medium text-[#302B24] leading-snug mb-2"
                      style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                    >
                      {card.headline}
                    </h3>

                    {/* Supporting text */}
                    <p className="text-xs text-[#302B24]/50 leading-relaxed">
                      {card.subtext}
                    </p>
                  </div>

                  {/* Card footer */}
                  <div className="px-5 py-3 border-t border-[#302B24]/6 flex items-center justify-between">
                    <span
                      className="text-[9px] tracking-wider uppercase text-[#302B24]/25"
                      style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                    >
                      {card.tag}
                    </span>
                    <Link
                      href="#"
                      className="text-[10px] hover:underline transition-colors"
                      style={{
                        color: card.accent,
                        fontFamily: 'var(--font-jetbrains-mono, monospace)',
                      }}
                    >
                      Read brief →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <section className="bg-[#EDE9DF] py-16 px-4 sm:px-6 border-t border-[#302B24]/8">
          <div className="max-w-4xl mx-auto">
            <h2
              className="text-lg font-medium text-[#302B24] mb-10"
              style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
            >
              How it works
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
              {HOW_STEPS.map((step) => (
                <div key={step.num}>
                  <span
                    className="text-4xl font-medium text-[#302B24]/12 block mb-3 leading-none"
                    style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                  >
                    {step.num}
                  </span>
                  <h3
                    className="text-base font-medium text-[#302B24] mb-2"
                    style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#302B24]/50 leading-relaxed">
                    {step.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── INTEL BRIEF PREVIEW ──────────────────────────────────────────
            Left: positioning copy.
            Right: mock brief card with sparkline visualization.
        ──────────────────────────────────────────────────────────────── */}
        <section className="bg-[#F3EFE6] py-16 px-4 sm:px-6 border-t border-[#302B24]/8">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

              {/* Left: copy */}
              <div className="pt-2">
                <p
                  className="text-[10px] tracking-[0.2em] uppercase mb-4 text-[#302B24]/30"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  Sample Brief
                </p>
                <h2
                  className="text-2xl font-medium text-[#302B24] leading-snug mb-4"
                  style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                >
                  Every brief is a signal,
                  <br />
                  <span className="italic text-[#302B24]/50">not a story.</span>
                </h2>
                <p className="text-sm text-[#302B24]/50 leading-relaxed mb-6 max-w-sm">
                  We track what builders actually do — not what they say. Each weekly
                  Ship log becomes a data point. Aggregated across hundreds of builders,
                  patterns emerge that reveal where AI-native products are heading.
                </p>
                <Link
                  href="/explore?tab=rankings"
                  className="inline-flex items-center text-sm text-[#534AB7] hover:underline font-medium"
                >
                  See the rankings →
                </Link>
              </div>

              {/* Right: mock brief card */}
              <div
                className="bg-white rounded-sm border border-[#302B24]/8 p-6"
                style={{ borderTopColor: '#534AB7', borderTopWidth: 3 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span
                    className="text-[9px] tracking-[0.18em] uppercase text-[#534AB7]"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    INTEL BRIEF · W21
                  </span>
                  <span
                    className="text-[9px] text-[#302B24]/20"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    COMPOUNDING EFFECT
                  </span>
                </div>

                <h4
                  className="text-base font-medium text-[#302B24] leading-snug mb-3"
                  style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
                >
                  The 90-Day Threshold: When consistency becomes compounding
                </h4>

                <p className="text-xs text-[#302B24]/50 leading-relaxed mb-5">
                  Analysis of 847 builder Ship logs reveals a non-linear inflection point
                  at day 90. Before this threshold, build scores grow linearly with output.
                  After it, streak momentum adds disproportionate weight...
                </p>

                {/* Sparkline */}
                <div className="flex items-end gap-[2px] h-10 mb-2">
                  {SPARKLINE.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-[1px] transition-colors"
                      style={{
                        height: `${(h / SPARK_MAX) * 100}%`,
                        backgroundColor:
                          i < 10 ? 'rgba(83,74,183,0.18)' : '#534AB7',
                      }}
                    />
                  ))}
                </div>
                <p
                  className="text-[9px] text-[#302B24]/22"
                  style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                >
                  build score velocity · days 1–90 · n=847
                </p>

                <div className="mt-4 pt-4 border-t border-[#302B24]/6">
                  <Link
                    href="#"
                    className="text-[11px] font-medium text-[#534AB7] hover:underline"
                    style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
                  >
                    Read full brief →
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────
            Back to dark — visual bookend matching the hero.
        ──────────────────────────────────────────────────────────────── */}
        <section className="bg-[#0a0a0a] py-20 px-4 sm:px-6">
          <div className="max-w-4xl mx-auto">

            <p
              className="text-[10px] tracking-[0.22em] uppercase text-white/20 mb-6"
              style={{ fontFamily: 'var(--font-jetbrains-mono, monospace)' }}
            >
              Join the network
            </p>
            <h2
              className="text-3xl sm:text-4xl font-medium text-white mb-4 leading-snug max-w-lg"
              style={{ fontFamily: "var(--font-newsreader, Georgia, serif)" }}
            >
              Start building in public.
              <br />
              <span className="italic text-white/40">Let the work speak.</span>
            </h2>
            <p className="text-sm text-white/35 mb-8 max-w-xs">
              Submit your first Ship log. Join builders who compound in public.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center h-10 px-6 bg-[#534AB7] hover:bg-[#4339a0] text-white text-sm font-medium rounded-sm transition-colors"
              >
                Submit a builder →
              </Link>
              <Link
                href="/explore?tab=rankings"
                className="inline-flex items-center h-10 px-6 border border-white/12 text-white/50 hover:border-white/25 hover:text-white text-sm font-medium rounded-sm transition-colors"
              >
                View rankings
              </Link>
            </div>

          </div>
        </section>

      </div>
    </>
  );
}
