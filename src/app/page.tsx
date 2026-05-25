// app/page.tsx — OpCEO.AI Builder Intelligence Homepage
// Chinese-localized hero + warm editorial layout.
// Global Nav is hidden on / via ConditionalNav in layout.tsx.
// Fonts scoped to hp-root wrapper via CSS variables; global body font untouched.
// Scope: ONLY this file + src/app/_components/home/*
// Does NOT affect /explore, /agents, /quests, /calendar, rankings-v1.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';

import { LandingNav }       from './_components/home/LandingNav';
import { ThisWeekSignals }  from './_components/home/ThisWeekSignals';
import { FilterBar }        from './_components/home/FilterBar';
import { IntelGrid }        from './_components/home/IntelGrid';
import { HowItWorks }       from './_components/home/HowItWorks';
import { IntelPreview }     from './_components/home/IntelPreview';
import { RealWorldSignal }  from './_components/home/RealWorldSignal';
import { CTA }              from './_components/home/CTA';
import { LandingFooter }    from './_components/home/LandingFooter';

// ── Homepage-scoped fonts ─────────────────────────────────────────────────────
// CSS vars set on .hp-root only — global Geist body font unchanged.

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

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = gm({
  title: 'OpCEO.AI — AI 时代的建造情报站',
  description:
    '追踪真实 Builder 的增长路径、出海打法和变现复盘。结构化情报，每周更新，不是故事包装。',
  path: '/',
});

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

      {/*
        hp-root: scopes --font-display / --font-body-serif / --font-mono-jb vars
        and the ::selection tint. Does NOT override body background — each section
        controls its own bg to avoid bleed into other routes.
        Global Nav hidden on / via ConditionalNav — LandingNav is top-0 here.
      */}
      <div
        className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} hp-root`}
      >
        {/* 1. Landing Nav — sticky at top-0 (global Nav hidden on /) */}
        <LandingNav />

        {/* 2. Hero — dark editorial banner */}
        <section
          style={{
            background: '#191613',
            textAlign: 'center',
            padding: 'clamp(56px, 8vw, 88px) clamp(24px, 8vw, 120px) clamp(48px, 6vw, 72px)',
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          {/* Live Pulse */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginBottom: 28,
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.1s forwards',
            }}
          >
            <span className="hp-pulse-dot" />
            <span
              className="font-mono-jb"
              style={{ fontSize: '0.7rem', color: '#5C564C', letterSpacing: '0.06em' }}
            >
              7 builders active · 3 ships this month · updated weekly
            </span>
          </div>

          {/* Headline */}
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.8rem, 6vw, 4.5rem)',
              fontWeight: 400,
              lineHeight: 1.1,
              letterSpacing: '-0.025em',
              color: '#F3EFE6',
              maxWidth: 700,
              margin: '0 auto 20px',
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.2s forwards',
            }}
          >
            The builders are shipping.
            <br />
            <span style={{ fontStyle: 'italic', color: '#AEA899' }}>Are you watching?</span>
          </h1>

          {/* Subheadline */}
          <p
            className="font-body-serif"
            style={{
              fontSize: 'clamp(0.92rem, 1.4vw, 1.05rem)',
              color: '#AEA899',
              lineHeight: 1.75,
              maxWidth: 460,
              margin: '0 auto 12px',
              fontWeight: 300,
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.3s forwards',
            }}
          >
            Real build journeys. Real AI workflows. Real people shipping.
            <br />
            We track what&apos;s working — not what&apos;s trending.
          </p>

          {/* Chinese helper */}
          <p
            className="font-body-serif"
            style={{
              fontSize: '0.84rem',
              color: '#5C564C',
              lineHeight: 1.6,
              margin: '0 auto 36px',
              fontWeight: 300,
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.35s forwards',
            }}
          >
            不需要你是工程师。你只需要真的用 AI 做出了一个东西。
          </p>

          {/* CTAs */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'center',
              flexWrap: 'wrap',
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.45s forwards',
            }}
          >
            <Link
              href="#intelligence"
              className="font-body-serif"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                background: '#FAFAF5',
                color: '#191613',
                fontSize: '0.92rem',
                borderRadius: 8,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Browse Intel ↓
            </Link>
            <Link
              href="/ship"
              className="font-body-serif"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '13px 28px',
                background: 'transparent',
                color: '#AEA899',
                fontSize: '0.92rem',
                borderRadius: 8,
                textDecoration: 'none',
                border: '1px solid rgba(174,168,153,0.3)',
                transition: 'border-color 0.2s, color 0.2s',
              }}
            >
              Submit Your Build →
            </Link>
          </div>

          {/* Pulse dot + keyframe styles */}
          <style>{`
            .hp-pulse-dot {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #C15F3C;
              flex-shrink: 0;
              animation: hp-pulse 2s ease-in-out infinite;
            }
            @keyframes hp-pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.3; }
            }
          `}</style>
        </section>

        {/* 3. This Week's Signals — live dispatch feel */}
        <ThisWeekSignals />

        {/* 4. Filter Bar — sticky at 64px (just below LandingNav; no global nav) */}
        <FilterBar />

        {/* 5. Intel Grid — 6 hardcoded builder intel cards */}
        <IntelGrid />

        {/* 6. Transition line — replaces old 3-col explainer */}
        <HowItWorks />

        {/* 7. Intel Preview — split layout with sample brief */}
        <IntelPreview />

        {/* 8. Real-world signal — pull quote linking to /accelerate */}
        <RealWorldSignal />

        {/* 9. CTA — dual-path reader + builder */}
        <CTA />

        {/* 9. Landing Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
