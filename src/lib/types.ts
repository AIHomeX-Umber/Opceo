// lib/types.ts — opceo.ai core TypeScript types

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
  next_week: string | null;
  tags: string[];
  upvote_count: number;
  created_at: string;
  // joined
  builder?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
}

export interface Quest {
  id: string;
  poster_id: string;
  title: string;
  description: string;
  category: 'ai-workflow' | 'content' | 'design' | 'dev' | 'research' | 'ops' | 'other';
  skills_needed: string[];
  reward_type: 'credit' | 'collab' | 'paid' | 'equity' | 'learning';
  reward_detail: string | null;
  difficulty: 'starter' | 'medium' | 'hard' | 'legendary';
  status: 'open' | 'claimed' | 'in_progress' | 'review' | 'completed' | 'cancelled';
  max_claimers: number;
  deadline: string | null;
  created_at: string;
  updated_at: string;
  // joined
  poster?: Pick<Builder, 'slug' | 'display_name' | 'avatar_url'>;
  claims_count?: number;
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

export interface SEOProps {
  title: string;
  description: string;
  path: string;
  type?: string;
  image?: string;
  publishedTime?: string;
  modifiedTime?: string;
}
