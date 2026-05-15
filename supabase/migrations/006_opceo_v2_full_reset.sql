-- ==========================================
-- opceo.ai — V2 Production Recovery Reset
-- Migration: 006_opceo_v2_full_reset
-- ==========================================
-- Purpose:
--   Bring a partially-migrated production Supabase database up to the V2
--   schema expected by opceo.ai without failing on already-existing objects.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==========================================
-- 1. PROFILES
-- ==========================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  slug TEXT,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  tool_stack JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.profiles ALTER COLUMN tool_stack SET DEFAULT '[]'::jsonb;
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();

UPDATE public.profiles SET username = NULL WHERE btrim(username) = '';
UPDATE public.profiles SET slug = NULL WHERE btrim(slug) = '';
UPDATE public.profiles SET tool_stack = '[]'::jsonb WHERE tool_stack IS NULL;
UPDATE public.profiles SET created_at = now() WHERE created_at IS NULL;
UPDATE public.profiles SET updated_at = now() WHERE updated_at IS NULL;

-- Backfill V2 profiles from the legacy builders table when production is still
-- on the builder-shaped schema.
DO $$
BEGIN
  IF to_regclass('public.builders') IS NOT NULL THEN
    INSERT INTO public.profiles (
      user_id,
      username,
      slug,
      display_name,
      bio,
      avatar_url,
      tool_stack,
      created_at,
      updated_at
    )
    SELECT DISTINCT ON (b.user_id)
      b.user_id,
      b.slug,
      b.slug,
      b.display_name,
      b.bio,
      b.avatar_url,
      COALESCE(b.skills, '[]'::jsonb),
      COALESCE(b.created_at, now()),
      COALESCE(b.updated_at, now())
    FROM public.builders b
    WHERE b.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.user_id = b.user_id
      )
    ORDER BY b.user_id, b.created_at NULLS LAST, b.id;
  END IF;
END $$;

-- Make exact duplicate usernames/slugs unique before adding constraints.
WITH ranked AS (
  SELECT id, username, row_number() OVER (PARTITION BY username ORDER BY created_at, id) AS rn
  FROM public.profiles
  WHERE username IS NOT NULL
)
UPDATE public.profiles p
SET username = left(r.username, 48) || '-' || left(p.id::text, 8)
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

WITH ranked AS (
  SELECT id, slug, row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
  FROM public.profiles
  WHERE slug IS NOT NULL
)
UPDATE public.profiles p
SET slug = left(r.slug, 48) || '-' || left(p.id::text, 8)
FROM ranked r
WHERE p.id = r.id AND r.rn > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_user_id_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_key UNIQUE (user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_username_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_slug_key'
  ) THEN
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_slug ON public.profiles(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON public.profiles(updated_at DESC);

-- Keep the existing builders surface safe for the currently deployed app.
DO $$
BEGIN
  IF to_regclass('public.builders') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.builders'::regclass
        AND conname = 'builders_user_id_key'
    ) AND NOT EXISTS (
      SELECT 1
      FROM public.builders
      WHERE user_id IS NOT NULL
      GROUP BY user_id
      HAVING count(*) > 1
    ) THEN
      ALTER TABLE public.builders ADD CONSTRAINT builders_user_id_key UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conrelid = 'public.builders'::regclass
        AND conname = 'builders_slug_key'
    ) AND NOT EXISTS (
      SELECT 1
      FROM public.builders
      WHERE slug IS NOT NULL
      GROUP BY slug
      HAVING count(*) > 1
    ) THEN
      ALTER TABLE public.builders ADD CONSTRAINT builders_slug_key UNIQUE (slug);
    END IF;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_builders_user_id ON public.builders(user_id);
CREATE INDEX IF NOT EXISTS idx_builders_slug ON public.builders(slug);
CREATE INDEX IF NOT EXISTS idx_builders_updated_at ON public.builders(updated_at DESC);

ALTER TABLE public.builders ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;
UPDATE public.builders
SET tool_stack = COALESCE(tool_stack, skills, '[]'::jsonb)
WHERE tool_stack IS NULL OR tool_stack = '[]'::jsonb;
ALTER TABLE public.builders ALTER COLUMN tool_stack SET DEFAULT '[]'::jsonb;

-- ==========================================
-- 2. SHIP LOGS V2
-- ==========================================

CREATE TABLE IF NOT EXISTS public.ship_logs (
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
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS week TEXT;
ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS next_week TEXT DEFAULT '';
ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS upvote_count INTEGER DEFAULT 0;
ALTER TABLE public.ship_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ship_logs'
      AND column_name = 'tags'
  ) THEN
    UPDATE public.ship_logs
    SET tool_stack = COALESCE(tool_stack, tags, '[]'::jsonb)
    WHERE tool_stack IS NULL OR tool_stack = '[]'::jsonb;
  END IF;
END $$;

UPDATE public.ship_logs SET next_week = '' WHERE next_week IS NULL;
UPDATE public.ship_logs SET tool_stack = '[]'::jsonb WHERE tool_stack IS NULL;
UPDATE public.ship_logs SET created_at = now() WHERE created_at IS NULL;

UPDATE public.ship_logs sl
SET user_id = b.user_id
FROM public.builders b
WHERE sl.user_id IS NULL AND sl.builder_id = b.id;

UPDATE public.ship_logs
SET week = year::text || '-W' || lpad(week_number::text, 2, '0')
WHERE week IS NULL AND year IS NOT NULL AND week_number IS NOT NULL;

ALTER TABLE public.ship_logs ALTER COLUMN next_week SET DEFAULT '';
ALTER TABLE public.ship_logs ALTER COLUMN next_week SET NOT NULL;
ALTER TABLE public.ship_logs ALTER COLUMN tool_stack SET DEFAULT '[]'::jsonb;
ALTER TABLE public.ship_logs ALTER COLUMN created_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ship_logs'::regclass
      AND conname = 'ship_logs_builder_week_year_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM public.ship_logs
    WHERE builder_id IS NOT NULL AND week_number IS NOT NULL AND year IS NOT NULL
    GROUP BY builder_id, week_number, year
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.ship_logs
      ADD CONSTRAINT ship_logs_builder_week_year_key UNIQUE (builder_id, week_number, year);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.ship_logs'::regclass
      AND conname = 'ship_logs_user_week_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM public.ship_logs
    WHERE user_id IS NOT NULL AND week IS NOT NULL
    GROUP BY user_id, week
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.ship_logs
      ADD CONSTRAINT ship_logs_user_week_key UNIQUE (user_id, week);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ship_logs_created_at_desc ON public.ship_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ship_logs_user_id ON public.ship_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_ship_logs_builder_id ON public.ship_logs(builder_id);
CREATE INDEX IF NOT EXISTS idx_ship_logs_week ON public.ship_logs(week);

-- ==========================================
-- 3. AGENT SYSTEM SCHEMA
-- ==========================================

CREATE TABLE IF NOT EXISTS public.agents (
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

ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public';
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agents ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.agents SET tool_stack = '[]'::jsonb WHERE tool_stack IS NULL;
UPDATE public.agents SET status = 'active' WHERE status IS NULL;
UPDATE public.agents SET visibility = 'public' WHERE visibility IS NULL;
UPDATE public.agents SET created_at = now() WHERE created_at IS NULL;
UPDATE public.agents SET updated_at = now() WHERE updated_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.agents'::regclass
      AND conname = 'agents_slug_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.agents
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.agents ADD CONSTRAINT agents_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agents_profile_id ON public.agents(profile_id);
CREATE INDEX IF NOT EXISTS idx_agents_slug ON public.agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_status ON public.agents(status);
CREATE INDEX IF NOT EXISTS idx_agents_visibility ON public.agents(visibility);
CREATE INDEX IF NOT EXISTS idx_agents_updated_at ON public.agents(updated_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_ship_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE NOT NULL,
  week TEXT NOT NULL,
  shipped TEXT NOT NULL,
  next_week TEXT NOT NULL DEFAULT '',
  blockers TEXT,
  tool_stack JSONB DEFAULT '[]'::jsonb,
  build_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS week TEXT;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS shipped TEXT;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS next_week TEXT DEFAULT '';
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS blockers TEXT;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS build_score INTEGER DEFAULT 0;
ALTER TABLE public.agent_ship_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

UPDATE public.agent_ship_logs SET next_week = '' WHERE next_week IS NULL;
UPDATE public.agent_ship_logs SET tool_stack = '[]'::jsonb WHERE tool_stack IS NULL;
UPDATE public.agent_ship_logs SET build_score = 0 WHERE build_score IS NULL;
UPDATE public.agent_ship_logs SET created_at = now() WHERE created_at IS NULL;

ALTER TABLE public.agent_ship_logs ALTER COLUMN next_week SET DEFAULT '';
ALTER TABLE public.agent_ship_logs ALTER COLUMN tool_stack SET DEFAULT '[]'::jsonb;
ALTER TABLE public.agent_ship_logs ALTER COLUMN build_score SET DEFAULT 0;
ALTER TABLE public.agent_ship_logs ALTER COLUMN created_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.agent_ship_logs'::regclass
      AND conname = 'agent_ship_logs_agent_week_key'
  ) AND NOT EXISTS (
    SELECT 1
    FROM public.agent_ship_logs
    WHERE agent_id IS NOT NULL AND week IS NOT NULL
    GROUP BY agent_id, week
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.agent_ship_logs
      ADD CONSTRAINT agent_ship_logs_agent_week_key UNIQUE (agent_id, week);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_ship_logs_agent_id ON public.agent_ship_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_ship_logs_week ON public.agent_ship_logs(week);
CREATE INDEX IF NOT EXISTS idx_agent_ship_logs_created_at_desc ON public.agent_ship_logs(created_at DESC);

CREATE TABLE IF NOT EXISTS public.agent_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE,
  key_prefix TEXT NOT NULL,
  key_hash TEXT NOT NULL,
  name TEXT DEFAULT 'default',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE;
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE;
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS key_prefix TEXT;
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS key_hash TEXT;
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS name TEXT DEFAULT 'default';
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS last_used_at TIMESTAMPTZ;
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.agent_api_keys ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

ALTER TABLE public.agent_api_keys ALTER COLUMN builder_id DROP NOT NULL;
ALTER TABLE public.agent_api_keys ALTER COLUMN name SET DEFAULT 'default';
ALTER TABLE public.agent_api_keys ALTER COLUMN created_at SET DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.agent_api_keys'::regclass
      AND conname = 'agent_api_keys_agent_or_builder_check'
  ) THEN
    ALTER TABLE public.agent_api_keys
      ADD CONSTRAINT agent_api_keys_agent_or_builder_check
      CHECK (agent_id IS NOT NULL OR builder_id IS NOT NULL);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_agent_api_keys_agent_id ON public.agent_api_keys(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_builder_id ON public.agent_api_keys(builder_id);
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_prefix ON public.agent_api_keys(key_prefix);
CREATE INDEX IF NOT EXISTS idx_agent_api_keys_revoked_at ON public.agent_api_keys(revoked_at);

-- ==========================================
-- 4. HUMAN x AGENT TEAMS
-- ==========================================

CREATE TABLE IF NOT EXISTS public.teams (
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

ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES public.builders(id) ON DELETE SET NULL;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS build_score INTEGER DEFAULT 0;
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

UPDATE public.teams SET build_score = 0 WHERE build_score IS NULL;
UPDATE public.teams SET created_at = now() WHERE created_at IS NULL;
UPDATE public.teams SET updated_at = now() WHERE updated_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.teams'::regclass
      AND conname = 'teams_slug_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.teams
    WHERE slug IS NOT NULL
    GROUP BY slug
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.teams ADD CONSTRAINT teams_slug_key UNIQUE (slug);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_teams_slug ON public.teams(slug);
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON public.teams(created_by);
CREATE INDEX IF NOT EXISTS idx_teams_lead_id ON public.teams(lead_id);
CREATE INDEX IF NOT EXISTS idx_teams_created_at_desc ON public.teams(created_at DESC);

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE NOT NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT now(),
  joined_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES public.agents(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS builder_id UUID REFERENCES public.builders(id) ON DELETE CASCADE;
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'member';
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE public.team_members ADD COLUMN IF NOT EXISTS joined_at TIMESTAMPTZ DEFAULT now();

ALTER TABLE public.team_members ALTER COLUMN builder_id DROP NOT NULL;
UPDATE public.team_members SET role = 'member' WHERE role IS NULL;
UPDATE public.team_members SET created_at = COALESCE(joined_at, now()) WHERE created_at IS NULL;
UPDATE public.team_members SET joined_at = COALESCE(created_at, now()) WHERE joined_at IS NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.team_members'::regclass
      AND conname = 'team_members_non_empty_member_check'
  ) THEN
    ALTER TABLE public.team_members
      ADD CONSTRAINT team_members_non_empty_member_check
      CHECK (profile_id IS NOT NULL OR agent_id IS NOT NULL OR builder_id IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.team_members'::regclass
      AND conname = 'team_members_team_profile_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE profile_id IS NOT NULL
    GROUP BY team_id, profile_id
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.team_members ADD CONSTRAINT team_members_team_profile_key UNIQUE (team_id, profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.team_members'::regclass
      AND conname = 'team_members_team_agent_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE agent_id IS NOT NULL
    GROUP BY team_id, agent_id
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.team_members ADD CONSTRAINT team_members_team_agent_key UNIQUE (team_id, agent_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.team_members'::regclass
      AND conname = 'team_members_team_builder_key'
  ) AND NOT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE builder_id IS NOT NULL
    GROUP BY team_id, builder_id
    HAVING count(*) > 1
  ) THEN
    ALTER TABLE public.team_members ADD CONSTRAINT team_members_team_builder_key UNIQUE (team_id, builder_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_profile_id ON public.team_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_team_members_agent_id ON public.team_members(agent_id);
CREATE INDEX IF NOT EXISTS idx_team_members_builder_id ON public.team_members(builder_id);

-- ==========================================
-- 5. LIVE PULSE
-- ==========================================

CREATE TABLE IF NOT EXISTS public.live_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_type TEXT NOT NULL,
  actor_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS actor_type TEXT;
ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS actor_id UUID;
ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS event_type TEXT;
ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS payload JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.live_events ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

UPDATE public.live_events SET payload = '{}'::jsonb WHERE payload IS NULL;
UPDATE public.live_events SET created_at = now() WHERE created_at IS NULL;

ALTER TABLE public.live_events ALTER COLUMN payload SET DEFAULT '{}'::jsonb;
ALTER TABLE public.live_events ALTER COLUMN created_at SET DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_live_events_created_at_desc ON public.live_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_live_events_actor_type ON public.live_events(actor_type);

-- ==========================================
-- 6. RLS POLICIES
-- ==========================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
  END LOOP;
END $$;

DROP POLICY IF EXISTS profiles_public_read ON public.profiles;
CREATE POLICY profiles_public_read ON public.profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS profiles_owner_insert ON public.profiles;
CREATE POLICY profiles_owner_insert ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS profiles_owner_update ON public.profiles;
CREATE POLICY profiles_owner_update ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS ship_logs_public_read ON public.ship_logs;
CREATE POLICY ship_logs_public_read ON public.ship_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS ship_logs_owner_insert ON public.ship_logs;
CREATE POLICY ship_logs_owner_insert ON public.ship_logs
  FOR INSERT WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = builder_id
    )
  );

DROP POLICY IF EXISTS ship_logs_owner_update ON public.ship_logs;
CREATE POLICY ship_logs_owner_update ON public.ship_logs
  FOR UPDATE USING (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = builder_id
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = builder_id
    )
  );

DROP POLICY IF EXISTS agents_public_read ON public.agents;
CREATE POLICY agents_public_read ON public.agents
  FOR SELECT USING (visibility = 'public' OR visibility IS NULL);

DROP POLICY IF EXISTS agents_owner_insert ON public.agents;
CREATE POLICY agents_owner_insert ON public.agents
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = profile_id
    )
  );

DROP POLICY IF EXISTS agents_owner_update ON public.agents;
CREATE POLICY agents_owner_update ON public.agents
  FOR UPDATE USING (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = profile_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = profile_id
    )
  );

DROP POLICY IF EXISTS agent_ship_logs_public_read ON public.agent_ship_logs;
CREATE POLICY agent_ship_logs_public_read ON public.agent_ship_logs
  FOR SELECT USING (true);

DROP POLICY IF EXISTS agent_ship_logs_owner_insert ON public.agent_ship_logs;
CREATE POLICY agent_ship_logs_owner_insert ON public.agent_ship_logs
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
  );

DROP POLICY IF EXISTS agent_ship_logs_owner_update ON public.agent_ship_logs;
CREATE POLICY agent_ship_logs_owner_update ON public.agent_ship_logs
  FOR UPDATE USING (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
  );

DROP POLICY IF EXISTS agent_api_keys_owner_read ON public.agent_api_keys;
CREATE POLICY agent_api_keys_owner_read ON public.agent_api_keys
  FOR SELECT USING (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
    OR auth.uid() = (
      SELECT operator.user_id
      FROM public.builders agent
      JOIN public.builders operator ON operator.id = agent.operator_id
      WHERE agent.id = builder_id
    )
  );

DROP POLICY IF EXISTS agent_api_keys_owner_insert ON public.agent_api_keys;
CREATE POLICY agent_api_keys_owner_insert ON public.agent_api_keys
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
    OR auth.uid() = (
      SELECT operator.user_id
      FROM public.builders agent
      JOIN public.builders operator ON operator.id = agent.operator_id
      WHERE agent.id = builder_id
    )
  );

DROP POLICY IF EXISTS agent_api_keys_owner_update ON public.agent_api_keys;
CREATE POLICY agent_api_keys_owner_update ON public.agent_api_keys
  FOR UPDATE USING (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
    OR auth.uid() = (
      SELECT operator.user_id
      FROM public.builders agent
      JOIN public.builders operator ON operator.id = agent.operator_id
      WHERE agent.id = builder_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = agent_id
    )
    OR auth.uid() = (
      SELECT operator.user_id
      FROM public.builders agent
      JOIN public.builders operator ON operator.id = agent.operator_id
      WHERE agent.id = builder_id
    )
  );

DROP POLICY IF EXISTS teams_public_read ON public.teams;
CREATE POLICY teams_public_read ON public.teams
  FOR SELECT USING (true);

DROP POLICY IF EXISTS teams_owner_insert ON public.teams;
CREATE POLICY teams_owner_insert ON public.teams
  FOR INSERT WITH CHECK (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = created_by
    )
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = lead_id
    )
  );

DROP POLICY IF EXISTS teams_owner_update ON public.teams;
CREATE POLICY teams_owner_update ON public.teams
  FOR UPDATE USING (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = created_by
    )
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = lead_id
    )
  )
  WITH CHECK (
    auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = created_by
    )
    OR auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = lead_id
    )
  );

DROP POLICY IF EXISTS team_members_public_read ON public.team_members;
CREATE POLICY team_members_public_read ON public.team_members
  FOR SELECT USING (true);

DROP POLICY IF EXISTS team_members_owner_insert ON public.team_members;
CREATE POLICY team_members_owner_insert ON public.team_members
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT t.id
      FROM public.teams t
      LEFT JOIN public.profiles p ON p.id = t.created_by
      LEFT JOIN public.builders b ON b.id = t.lead_id
      WHERE p.user_id = auth.uid() OR b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS team_members_owner_update ON public.team_members;
CREATE POLICY team_members_owner_update ON public.team_members
  FOR UPDATE USING (
    team_id IN (
      SELECT t.id
      FROM public.teams t
      LEFT JOIN public.profiles p ON p.id = t.created_by
      LEFT JOIN public.builders b ON b.id = t.lead_id
      WHERE p.user_id = auth.uid() OR b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    team_id IN (
      SELECT t.id
      FROM public.teams t
      LEFT JOIN public.profiles p ON p.id = t.created_by
      LEFT JOIN public.builders b ON b.id = t.lead_id
      WHERE p.user_id = auth.uid() OR b.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS live_events_public_read ON public.live_events;
CREATE POLICY live_events_public_read ON public.live_events
  FOR SELECT USING (true);

DROP POLICY IF EXISTS live_events_owner_insert ON public.live_events;
CREATE POLICY live_events_owner_insert ON public.live_events
  FOR INSERT WITH CHECK (
    (actor_type = 'profile' AND auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = actor_id
    ))
    OR (actor_type = 'agent' AND auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = actor_id
    ))
    OR (actor_type = 'builder' AND auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = actor_id
    ))
  );

DROP POLICY IF EXISTS live_events_owner_update ON public.live_events;
CREATE POLICY live_events_owner_update ON public.live_events
  FOR UPDATE USING (
    (actor_type = 'profile' AND auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = actor_id
    ))
    OR (actor_type = 'agent' AND auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = actor_id
    ))
    OR (actor_type = 'builder' AND auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = actor_id
    ))
  )
  WITH CHECK (
    (actor_type = 'profile' AND auth.uid() = (
      SELECT p.user_id FROM public.profiles p WHERE p.id = actor_id
    ))
    OR (actor_type = 'agent' AND auth.uid() = (
      SELECT p.user_id
      FROM public.agents a
      JOIN public.profiles p ON p.id = a.profile_id
      WHERE a.id = actor_id
    ))
    OR (actor_type = 'builder' AND auth.uid() = (
      SELECT b.user_id FROM public.builders b WHERE b.id = actor_id
    ))
  );

-- Compatibility read policy for the currently deployed builders table.
DROP POLICY IF EXISTS builders_public_read_v2 ON public.builders;
CREATE POLICY builders_public_read_v2 ON public.builders
  FOR SELECT USING (true);

DROP POLICY IF EXISTS builders_owner_insert_v2 ON public.builders;
CREATE POLICY builders_owner_insert_v2 ON public.builders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS builders_owner_update_v2 ON public.builders;
CREATE POLICY builders_owner_update_v2 ON public.builders
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
