import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { generateMetadata as genMeta } from '@/lib/seo';
import { itemListJsonLd } from '@/lib/jsonld';
import ExploreClient from '@/components/ExploreClient';

export const metadata: Metadata = genMeta({
  title: 'Explore Builders',
  description:
    'Discover builders shipping in public on opceo.ai. Browse by build score, streak, and skills — then signal bet on the ones you believe in.',
  path: '/explore',
});

export default async function ExplorePage() {
  const supabase = await createClient();

  const { data: builders } = await supabase
    .from('builders')
    .select(
      'id, slug, display_name, bio, building, avatar_url, skills, build_score, current_streak, tier, created_at, is_investor, links, user_id, updated_at, longest_streak, total_logs'
    )
    .order('build_score', { ascending: false });

  const safeBuilders = builders || [];

  const jsonLd = itemListJsonLd(
    safeBuilders.slice(0, 100).map((b) => ({
      url: `https://opceo.ai/${b.slug}`,
      name: b.display_name,
    })),
    'Builders on opceo.ai'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-semibold text-white mb-2">Explore Builders</h1>
          <p className="text-white/40 text-sm max-w-lg">
            People shipping in public. Browse by score, streak, or skills — then bet on the ones
            you believe will go far.
          </p>
        </header>

        <ExploreClient builders={safeBuilders} />
      </main>
    </>
  );
}
