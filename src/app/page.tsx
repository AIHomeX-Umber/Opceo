// app/page.tsx — OpCEO.AI Builder Intelligence Homepage
// Second-pass redesign matching opceo-homepage-reference.html.
// Fonts scoped to hp-root wrapper via CSS variables; global body font untouched.
// Scope: ONLY this file + src/app/_components/home/*
// Does NOT affect /explore, /agents, /quests, /calendar, rankings-v1.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';

import { LandingNav }    from './_components/home/LandingNav';
import { FilterBar }     from './_components/home/FilterBar';
import { IntelGrid }     from './_components/home/IntelGrid';
import { HowItWorks }   from './_components/home/HowItWorks';
import { IntelPreview }  from './_components/home/IntelPreview';
import { CTA }           from './_components/home/CTA';
import { LandingFooter } from './_components/home/LandingFooter';

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
  title: 'OpCEO.AI — Builder Intelligence',
  description:
    '追踪真实建造者的增长弧线。AI Native 创业者的结构化情报，每周更新。',
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
      */}
      <div
        className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} hp-root`}
      >
        {/* 1. Landing Nav — sticky below global dark Nav (top-14 = 56px) */}
        <LandingNav />

        {/* 2. Hero — dark editorial banner */}
        <section
          style={{
            background: '#191613',
            textAlign: 'center',
            padding: '80px clamp(24px, 8vw, 120px) 88px',
          }}
        >
          {/* Icon */}
          <div style={{ marginBottom: 28, opacity: 0, animation: 'hp-fadeIn 0.6s ease 0.1s forwards' }}>
            <svg
              viewBox="0 0 48 48"
              fill="none"
              stroke="#F3EFE6"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="48"
              height="48"
              style={{ margin: '0 auto' }}
            >
              <path d="M8 36V18l16-10 16 10v18"/>
              <path d="M8 22l16 9 16-9"/>
              <path d="M24 31v11"/>
              <circle cx="24" cy="13" r="2.5"/>
            </svg>
          </div>

          {/* Headline */}
          <h1
            className="font-display"
            style={{
              fontSize: 'clamp(2.4rem, 5.5vw, 3.8rem)',
              fontWeight: 400,
              lineHeight: 1.12,
              letterSpacing: '-0.025em',
              color: '#F3EFE6',
              maxWidth: 640,
              margin: '0 auto 20px',
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.2s forwards',
            }}
          >
            The live board for builders
            <br />
            <span style={{ color: '#847E72', fontStyle: 'italic' }}>
              building in public.
            </span>
          </h1>

          {/* Subheading */}
          <p
            className="font-body-serif"
            style={{
              fontSize: 'clamp(0.95rem, 1.4vw, 1.08rem)',
              color: '#AEA899',
              lineHeight: 1.65,
              maxWidth: 440,
              margin: '0 auto 36px',
              fontWeight: 300,
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.35s forwards',
            }}
          >
            Structured growth intelligence on solo founders —
            every ship, every streak, every move. Weekly.
          </p>

          {/* CTA */}
          <Link
            href="#intel"
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
              opacity: 0,
              animation: 'hp-fadeIn 0.6s ease 0.45s forwards',
            }}
          >
            Browse intel ↓
          </Link>
        </section>

        {/* 3. Filter Bar — sticky at 120px (56px global nav + 64px landing nav) */}
        <FilterBar />

        {/* 4. Intel Grid — 6 hardcoded builder intel cards */}
        <IntelGrid />

        {/* 5. How It Works — 3-step section */}
        <HowItWorks />

        {/* 6. Intel Preview — split layout with sample brief */}
        <IntelPreview />

        {/* 7. CTA — closing call to action */}
        <CTA />

        {/* 8. Landing Footer */}
        <LandingFooter />
      </div>
    </>
  );
}
