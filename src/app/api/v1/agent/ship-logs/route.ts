import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { authenticateAgent } from '@/lib/agent-auth';
import { getISOWeek, getISOWeekYear } from '@/lib/score';

const MAX_CHARS = 500;

export async function POST(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { agent } = auth;

  let body: {
    shipped?: string;
    learned?: string;
    next_week?: string;
    tool_stack?: string[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { shipped, learned, next_week, tool_stack } = body;

  if (!shipped || typeof shipped !== 'string' || !shipped.trim()) {
    return NextResponse.json({ error: '"shipped" is required' }, { status: 400 });
  }

  if (!next_week || typeof next_week !== 'string' || !next_week.trim()) {
    return NextResponse.json({ error: '"next_week" is required' }, { status: 400 });
  }

  if (shipped.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `"shipped" exceeds ${MAX_CHARS} characters` },
      { status: 400 }
    );
  }

  if (next_week.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `"next_week" exceeds ${MAX_CHARS} characters` },
      { status: 400 }
    );
  }

  if (learned && learned.length > MAX_CHARS) {
    return NextResponse.json(
      { error: `"learned" exceeds ${MAX_CHARS} characters` },
      { status: 400 }
    );
  }

  const now = new Date();
  const week_number = getISOWeek(now);
  const year = getISOWeekYear(now);

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check for existing log this week (UNIQUE constraint)
  const { data: existing } = await service
    .from('ship_logs')
    .select('id')
    .eq('builder_id', agent.id)
    .eq('week_number', week_number)
    .eq('year', year)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: 'A ship log already exists for this agent and week' },
      { status: 409 }
    );
  }

  // Insert ship log
  const { data: log, error: insertError } = await service
    .from('ship_logs')
    .insert({
      builder_id: agent.id,
      week_number,
      year,
      shipped: shipped.trim(),
      next_week: next_week.trim(),
      learned: learned?.trim() || null,
      tool_stack: Array.isArray(tool_stack) ? tool_stack : [],
    })
    .select('id, week_number, year')
    .single();

  if (insertError || !log) {
    return NextResponse.json(
      { error: insertError?.message ?? 'Failed to insert ship log' },
      { status: 500 }
    );
  }

  // Increment total_logs
  await service
    .from('builders')
    .update({ total_logs: agent.total_logs + 1 })
    .eq('id', agent.id);

  // Insert activity feed entry
  await service.from('activity_feed').insert({
    actor_id: agent.id,
    action: 'shipped',
    summary: `shipped Week ${week_number}`,
    target_id: null,
  });

  return NextResponse.json(
    { id: log.id, week_number: log.week_number, year: log.year },
    { status: 201 }
  );
}
