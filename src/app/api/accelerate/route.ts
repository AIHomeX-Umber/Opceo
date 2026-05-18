import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { track, goal, timeline, wechat, email } = body as Record<string, string>;

  if (!track || !goal || !timeline || !wechat?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 422 });
  }

  const validTracks = ['solo', 'team', 'insider'];
  if (!validTracks.includes(track)) {
    return NextResponse.json({ error: 'Invalid track' }, { status: 422 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('accelerate_leads').insert({
    track,
    goal,
    timeline,
    wechat: wechat.trim(),
    email: email?.trim() || null,
  });

  if (error) {
    console.error('[accelerate] insert error:', error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
