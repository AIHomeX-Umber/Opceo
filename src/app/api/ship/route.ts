import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const AI_TOOLS = new Set([
  'ChatGPT',
  'Claude',
  'Cursor',
  'Lovable',
  'Bolt',
  'Replit',
  'Supabase',
  'Midjourney',
  'Vercel',
  'Other',
]);

const MAX_TEXT_LENGTH = 4000;

function clean(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function nullable(value: unknown) {
  const cleaned = clean(value);
  return cleaned.length > 0 ? cleaned : null;
}

function makeTitle(whatBuilt: string) {
  const firstLine = whatBuilt.split('\n').find(Boolean) ?? whatBuilt;
  return firstLine.slice(0, 120);
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const whatBuilt = clean(body.what_built);

  if (!whatBuilt) {
    return NextResponse.json({ error: 'What did you build? is required.' }, { status: 422 });
  }

  const textFields = [
    whatBuilt,
    clean(body.why_built),
    clean(body.what_broke),
    clean(body.what_learned),
  ];

  if (textFields.some((value) => value.length > MAX_TEXT_LENGTH)) {
    return NextResponse.json(
      { error: `Text fields must be ${MAX_TEXT_LENGTH} characters or fewer.` },
      { status: 422 }
    );
  }

  const aiTools = Array.isArray(body.ai_tools)
    ? body.ai_tools.filter((tool): tool is string => typeof tool === 'string' && AI_TOOLS.has(tool))
    : [];

  const projectUrl = nullable(body.project_url);
  if (projectUrl) {
    try {
      new URL(projectUrl);
    } catch {
      return NextResponse.json({ error: 'Project URL must be a valid URL.' }, { status: 422 });
    }
  }

  const email = nullable(body.email);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Email must be valid.' }, { status: 422 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from('ship_logs').insert({
    title: makeTitle(whatBuilt),
    what_built: whatBuilt,
    why_built: nullable(body.why_built),
    ai_tools: aiTools,
    what_broke: nullable(body.what_broke),
    what_learned: nullable(body.what_learned),
    project_url: projectUrl,
    name: nullable(body.name),
    x_handle: nullable(body.x_handle),
    email,
    status: 'pending',
    shipped: whatBuilt,
    learned: nullable(body.what_learned),
    next_week: '',
    tool_stack: aiTools,
  });

  if (error) {
    console.error('[ship] insert error:', error.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
