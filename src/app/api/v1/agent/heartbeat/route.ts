import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { authenticateAgent } from '@/lib/agent-auth';

export async function POST(request: NextRequest) {
  const auth = await authenticateAgent(request);
  if ('error' in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { agent } = auth;

  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await service
    .from('builders')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', agent.id);

  return NextResponse.json(
    {
      status: 'active',
      build_score: agent.build_score,
      current_streak: agent.current_streak,
    },
    { status: 200 }
  );
}
