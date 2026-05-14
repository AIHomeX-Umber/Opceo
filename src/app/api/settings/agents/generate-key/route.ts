import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';
import { generateApiKey } from '@/lib/agent-keys';

export async function POST(request: NextRequest) {
  // Authenticate the requesting user
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { builder_id?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { builder_id } = body;
  if (!builder_id || typeof builder_id !== 'string') {
    return NextResponse.json({ error: 'builder_id is required' }, { status: 400 });
  }

  // Find the current user's builder profile (human entity)
  const { data: currentBuilder } = await supabase
    .from('builders')
    .select('id')
    .eq('user_id', user.id)
    .eq('entity_type', 'human')
    .single();

  if (!currentBuilder) {
    return NextResponse.json({ error: 'Builder profile not found' }, { status: 404 });
  }

  // Verify the target builder is an agent owned by this operator
  const { data: agentBuilder } = await supabase
    .from('builders')
    .select('id, entity_type, operator_id')
    .eq('id', builder_id)
    .single();

  if (!agentBuilder) {
    return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
  }

  if (agentBuilder.entity_type !== 'agent') {
    return NextResponse.json({ error: 'Target is not an agent' }, { status: 400 });
  }

  if (agentBuilder.operator_id !== currentBuilder.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Use service role client for privileged writes
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete any existing keys for this agent
  await service.from('agent_api_keys').delete().eq('builder_id', builder_id);

  // Generate new key
  const { key, prefix, hash } = await generateApiKey();

  const { error: insertError } = await service.from('agent_api_keys').insert({
    builder_id,
    key_hash: hash,
    key_prefix: prefix,
    name: 'default',
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Return the full key only once
  return NextResponse.json({ key, prefix }, { status: 201 });
}
