// lib/types.ts — OPCEO core TypeScript types

export interface FeaturedLink {
  title: string;
  url: string;
  icon: string; // lucide icon name: "globe", "mail", "github", etc.
}

export interface ShowcaseItem {
  title: string;
  description: string;
  url: string;
  image_url: string | null;
}

export interface AgentMeta {
  model: string;
  framework?: string;
  repo?: string;
  capabilities: string[];
  status: 'active' | 'idle' | 'offline';
}

export interface Builder {
  id: string;
  user_id: string;
  slug: string;
  display_name: string;
  bio: string | null;
  building: string | null;
  avatar_url: string | null;
  links: { x?: string; github?: string; website?: string; wechat?: string };
  skills: string[];
  build_score: number;
  current_streak: number;
  longest_streak: number;
  total_logs: number;
  tier: 'explorer' | 'builder' | 'veteran' | 'founding';
  is_investor: boolean;
  headline: string | null;
  cover_url: string | null;
  featured_links: FeaturedLink[];
  showcase: ShowcaseItem[];
  builder_type: 'founder' | 'operator' | 'engineer' | 'researcher' | 'designer' | 'creator' | 'other' | null;
  entity_type: 'human' | 'agent';
  operator_id: string | null;
  agent_meta: AgentMeta | null;
  created_at: string;
  updated_at: string;
}

export interface ShipLog {
  id: string;
  builder_id: string;
  week_number: number;
  year: number;
  shipped: string;
  learned: string | null;
  next_week: string;
  tool_stack: string[];
  upvote_count: number;
  created_at: string;
  // joined
  builder?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'entity_type'>;
}

export interface Quest {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: 'ai-workflow' | 'content' | 'design' | 'dev' | 'research' | 'ops' | 'signal' | 'other';
  skills_needed: string[];
  reward_type: 'credit' | 'collab' | 'paid' | 'equity' | 'learning';
  reward_detail: string | null;
  difficulty: 'starter' | 'medium' | 'hard' | 'legendary';
  status: 'open' | 'claimed' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  max_claimers: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  // Signal-specific fields
  signal_strength: 'observed' | 'moderate' | 'strong' | 'validated' | null;
  signal_status: 'observed' | 'discussed' | 'validated' | 'building' | 'solved' | null;
  market_size: 'niche' | 'local' | 'national' | 'global' | null;
  location: string | null;
  seen_count: number;
  // joined
  poster?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
  claims_count?: number;
}

export interface SignalConfirmation {
  id: string;
  quest_id: string;
  builder_id: string;
  note: string | null;
  created_at: string;
  builder?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
}

export interface SignalBuilder {
  id: string;
  quest_id: string;
  builder_id: string;
  project_name: string;
  project_url: string | null;
  created_at: string;
  builder?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
}

export interface QuestClaim {
  id: string;
  quest_id: string;
  claimer_id: string;
  pitch: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed' | 'abandoned';
  submitted_work: string | null;
  score_reward: number;
  created_at: string;
  completed_at: string | null;
  // joined
  claimer?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
}

export interface SignalBet {
  id: string;
  bettor_id: string;
  target_id: string;
  created_at: string;
  bettor?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
}

export interface ConnectRequest {
  id: string;
  from_id: string;
  to_id: string;
  context: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  from?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'building'>;
}

export interface Spotlight {
  id: string;
  builder_id: string;
  week_number: number;
  year: number;
  reason: string | null;
  created_at: string;
  builder?: Builder;
}

export interface AgentApiKey {
  id: string;
  builder_id: string;
  key_prefix: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatar_url: string | null;
  lead_id: string;
  build_score: number;
  created_at: string;
  updated_at: string;
  members?: TeamMember[];
}

export interface TeamMember {
  id: string;
  team_id: string;
  builder_id: string;
  role: 'lead' | 'member';
  joined_at: string;
  builder?: Builder;
}

export interface ActivityItem {
  id: string;
  actor_id: string;
  action: string;
  target_id: string | null;
  summary: string;
  created_at: string;
  actor?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url' | 'entity_type'>;
}

export interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
