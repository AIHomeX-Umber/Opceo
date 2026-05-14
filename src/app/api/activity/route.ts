// app/api/activity/route.ts — GET /api/activity
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { ActivityItem } from '@/lib/types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limitParam = parseInt(searchParams.get('limit') ?? '10', 10);
  const limit = Math.min(isNaN(limitParam) ? 10 : limitParam, 20);

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('activity_feed')
    .select(
      'id, action, summary, target_id, created_at, actor:builders!activity_feed_actor_id_fkey(slug, display_name, avatar_url, entity_type)'
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Normalize the Supabase join shape (actor may come as array)
  const items: ActivityItem[] = (data ?? []).map((row: Record<string, unknown>) => {
    const actorRaw = row.actor as ActivityItem['actor'] | ActivityItem['actor'][] | null;
    return {
      ...(row as unknown as ActivityItem),
      actor: Array.isArray(actorRaw) ? actorRaw[0] : actorRaw ?? undefined,
    };
  });

  return NextResponse.json(items);
}
