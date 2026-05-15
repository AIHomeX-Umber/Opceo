-- ==========================================
-- opceo.ai — Schema Snapshot
-- Generated: 2026-05-15
-- ==========================================
-- This file records the V2 recovery target represented by:
--   supabase/migrations/006_opceo_v2_full_reset.sql
--
-- Note:
--   This is a source-controlled target snapshot, not a live pg_dump. To replace
--   it with an exact production dump later, run:
--     supabase db dump --schema public > supabase/schema.snapshot.sql

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  username TEXT UNIQUE,
  slug TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  tool_stack JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.ship_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  week TEXT,
  week_number INTEGER,
  year INTEGER,
  shipped TEXT NOT NULL,
  learned TEXT,
  next_week TEXT NOT NULL DEFAULT '',
  tool_stack JSONB DEFAULT '[]'::jsonb,
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (builder_id, week_number, year),
  UNIQUE (user_id, week)
);

CREATE TABLE public.agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  tool_stack JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'active',
  visibility TEXT DEFAULT 'public',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.agent_ship_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  week TEXT NOT NULL,
  shipped TEXT NOT NULL,
  next_week TEXT NOT NULL DEFAULT '',
  blockers TEXT,
  tool_stack JSONB DEFAULT '[]'::jsonb,
  build_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (agent_id, week)
);

CREATE TABLE public.agent_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT DEFAULT 'default',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ,
  CHECK (agent_id IS NOT NULL OR builder_id IS NOT NULL)
);

CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  lead_id UUID REFERENCES public.builders(id) ON DELETE SET NULL,
  build_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now(),
  CHECK (profile_id IS NOT NULL OR agent_id IS NOT NULL OR builder_id IS NOT NULL),
  UNIQUE (team_id, profile_id),
  UNIQUE (team_id, agent_id),
  UNIQUE (team_id, builder_id)
);

CREATE TABLE public.live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL,
  actor_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_slug ON public.profiles(slug);
CREATE INDEX idx_profiles_updated_at ON public.profiles(updated_at DESC);
CREATE INDEX idx_ship_logs_created_at_desc ON public.ship_logs(created_at DESC);
CREATE INDEX idx_ship_logs_user_id ON public.ship_logs(user_id);
CREATE INDEX idx_ship_logs_builder_id ON public.ship_logs(builder_id);
CREATE INDEX idx_ship_logs_week ON public.ship_logs(week);
CREATE INDEX idx_agents_profile_id ON public.agents(profile_id);
CREATE INDEX idx_agents_slug ON public.agents(slug);
CREATE INDEX idx_agent_ship_logs_agent_id ON public.agent_ship_logs(agent_id);
CREATE INDEX idx_agent_api_keys_agent_id ON public.agent_api_keys(agent_id);
CREATE INDEX idx_agent_api_keys_builder_id ON public.agent_api_keys(builder_id);
CREATE INDEX idx_agent_api_keys_prefix ON public.agent_api_keys(key_prefix);
CREATE INDEX idx_teams_slug ON public.teams(slug);
CREATE INDEX idx_teams_created_by ON public.teams(created_by);
CREATE INDEX idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX idx_team_members_profile_id ON public.team_members(profile_id);
CREATE INDEX idx_team_members_agent_id ON public.team_members(agent_id);
CREATE INDEX idx_live_events_created_at_desc ON public.live_events(created_at DESC);
CREATE INDEX idx_live_events_actor_type ON public.live_events(actor_type);

