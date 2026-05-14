// lib/agent-auth.ts — Authenticate incoming agent API requests via Bearer key
import { createClient } from '@/lib/supabase/server';
import type { Builder } from '@/lib/types';

export interface AgentAuthResult {
  agent: Builder;
  keyId: string;
}

export interface AgentAuthError {
  error: string;
  status: 401;
}

export async function authenticateAgent(
  request: Request
): Promise<AgentAuthResult | AgentAuthError> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Missing or malformed Authorization header', status: 401 };
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey.startsWith('opc_') || apiKey.length < 12) {
    return { error: 'Invalid API key format', status: 401 };
  }

  const prefix = apiKey.slice(0, 8);

  const supabase = await createClient();
  const { data: keys } = await supabase
    .from('agent_api_keys')
    .select('id, key_hash, builder_id')
    .eq('key_prefix', prefix);

  if (!keys?.length) {
    return { error: 'Invalid API key', status: 401 };
  }

  const bcrypt = await import('bcryptjs');

  for (const row of keys) {
    const valid = await bcrypt.compare(apiKey, row.key_hash);
    if (!valid) continue;

    // Touch last_used_at (fire and forget — don't block the response)
    supabase
      .from('agent_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', row.id)
      .then(() => {});

    const { data: agent } = await supabase
      .from('builders')
      .select('*')
      .eq('id', row.builder_id)
      .eq('entity_type', 'agent')
      .single();

    if (!agent) {
      return { error: 'Agent profile not found', status: 401 };
    }

    return { agent: agent as Builder, keyId: row.id };
  }

  return { error: 'Invalid API key', status: 401 };
}
