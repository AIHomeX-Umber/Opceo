// app/page.tsx — OpCEO.AI public builder network homepage.
// Scope: homepage only. Global Nav is hidden on / via ConditionalNav.

import type { Metadata } from 'next';
import Link from 'next/link';
import { Newsreader, Source_Serif_4, JetBrains_Mono } from 'next/font/google';
import JsonLd from '@/components/JsonLd';
import { websiteJsonLd, organizationJsonLd } from '@/lib/jsonld';
import { generateMetadata as gm } from '@/lib/seo';
import { createClient } from '@/lib/supabase/server';
import type { Builder } from '@/lib/types';

import { LandingNav }    from './_components/home/LandingNav';
import { OrbitSculpture } from './_components/home/OrbitSculpture';
import { FeaturedBuilders } from './_components/home/FeaturedBuilders';
import { BuildLoop } from './_components/home/BuildLoop';
import { HomeEntryLinks } from './_components/home/HomeEntryLinks';
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
  title: 'OpCEO.AI — AI-native builders network',
  description:
    'OpCEO 是面向 AI 时代的公开建造者网络。每周发布、获得反馈、积累影响力，让世界看到你的成长轨迹。',
  path: '/',
});

// ── Page ──────────────────────────────────────────────────────────────────────

async function getFeaturedBuilders() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from('builders')
      .select(
        'id, user_id, slug, display_name, bio, building, avatar_url, links, skills, build_score, current_streak, longest_streak, total_logs, tier, is_investor, headline, cover_url, featured_links, showcase, builder_type, entity_type, operator_id, agent_meta, created_at, updated_at'
      )
      .eq('entity_type', 'human')
      .order('current_streak', { ascending: false })
      .order('total_logs', { ascending: false })
      .limit(3);

    return (data ?? []) as unknown as Builder[];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const builders = await getFeaturedBuilders();

  return (
    <>
      <JsonLd data={[websiteJsonLd(), organizationJsonLd()]} />

      <div
        className={`${newsreader.variable} ${sourceSerif4.variable} ${jetbrainsMono.variable} hp-root min-h-screen bg-[#FAFAF5] text-[#111111]`}
      >
        <LandingNav />

        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 py-28 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-32">
          <div>
            <p className="mb-7 font-mono-jb text-[0.72rem] uppercase tracking-[0.18em] text-black/40">
              AI-native builders network
            </p>
            <h1 className="max-w-3xl font-display text-[clamp(3.3rem,8vw,6.9rem)] font-medium leading-[0.95] tracking-[-0.055em] text-[#111111]">
              在公开中建造。
              <br />
              让世界看到你的成长轨迹。
            </h1>
            <p className="mt-8 max-w-xl font-body-serif text-[1.15rem] leading-8 text-black/58 sm:text-[1.25rem]">
              OpCEO 是面向 AI 时代的建造者网络。每周发布、获得反馈、积累影响力。
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth/register"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-[#111111] px-6 font-body-serif text-[0.95rem] text-white no-underline transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#2a244e]"
              >
                加入 OpCEO →
              </Link>
              <Link
                href="/explore?tab=builders"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-black/10 bg-white px-6 font-body-serif text-[0.95rem] text-[#111111] no-underline transition-all duration-200 hover:-translate-y-0.5 hover:border-black/20"
              >
                探索建造者 →
              </Link>
            </div>
          </div>

          <OrbitSculpture />
        </section>

        <FeaturedBuilders builders={builders} />
        <BuildLoop />
        <HomeEntryLinks />
        <LandingFooter />
      </div>
    </>
  );
}
