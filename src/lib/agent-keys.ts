// lib/agent-keys.ts — API key generation for agent authentication
import { randomBytes } from 'crypto';

export async function generateApiKey(): Promise<{
  key: string;
  prefix: string;
  hash: string;
}> {
  const raw = 'opc_' + randomBytes(24).toString('hex');
  const prefix = raw.slice(0, 8);

  // Dynamic import — bcryptjs is an optional dep; keeps server bundle clean
  const bcrypt = await import('bcryptjs');
  const hash = await bcrypt.hash(raw, 10);

  return { key: raw, prefix, hash };
}
