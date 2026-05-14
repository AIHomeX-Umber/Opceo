import { createClient } from '@/lib/supabase/server';
import type { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: builders } = await supabase
    .from('builders')
    .select('slug, updated_at');

  const { data: logs } = await supabase
    .from('ship_logs')
    .select('id, created_at, builders(slug)')
    .order('created_at', { ascending: false })
    .limit(500);

  const { data: quests } = await supabase
    .from('quests')
    .select('id, updated_at')
    .neq('status', 'cancelled');

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: 'https://opceo.ai',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://opceo.ai/explore',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: 'https://opceo.ai/leaderboard',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://opceo.ai/quests',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: 'https://opceo.ai/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  const builderPages: MetadataRoute.Sitemap = (builders || []).map((b) => ({
    url: `https://opceo.ai/${b.slug}`,
    lastModified: new Date(b.updated_at),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  type LogRow = { id: string; created_at: string; builders: { slug: string }[] | null };
  const logPages: MetadataRoute.Sitemap = (logs as unknown as LogRow[] || [])
    .filter((l) => l.builders?.[0]?.slug)
    .map((l) => ({
      url: `https://opceo.ai/${l.builders![0].slug}/logs/${l.id}`,
      lastModified: new Date(l.created_at),
      changeFrequency: 'never',
      priority: 0.6,
    }));

  const questPages: MetadataRoute.Sitemap = (quests || []).map((q) => ({
    url: `https://opceo.ai/quests/${q.id}`,
    lastModified: new Date(q.updated_at),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  return [...staticPages, ...builderPages, ...logPages, ...questPages];
}
