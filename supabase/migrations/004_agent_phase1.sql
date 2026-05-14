-- ==========================================
-- opceo.ai — Agent Phase 1
-- Migration: 004_agent_phase1
-- ==========================================

-- ── builders: add entity_type, operator_id, agent_meta ─────────────────────

ALTER TABLE builders
  ADD COLUMN IF NOT EXISTS entity_type TEXT DEFAULT 'human'
    CHECK (entity_type IN ('human', 'agent'));

ALTER TABLE builders
  ADD COLUMN IF NOT EXISTS operator_id UUID REFERENCES builders(id);

ALTER TABLE builders
  ADD COLUMN IF NOT EXISTS agent_meta JSONB DEFAULT NULL;

-- Index for filtering agents/humans efficiently
CREATE INDEX IF NOT EXISTS idx_builders_entity_type ON builders(entity_type);
CREATE INDEX IF NOT EXISTS idx_builders_operator ON builders(operator_id);

-- ── agent_api_keys ──────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS agent_api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id  UUID REFERENCES builders(id) ON DELETE CASCADE NOT NULL,
  key_hash    TEXT NOT NULL,
  key_prefix  TEXT NOT NULL,           -- first 8 chars, e.g. "opc_xxxx"
  name        TEXT DEFAULT 'default',
  last_used_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_keys_builder ON agent_api_keys(builder_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix  ON agent_api_keys(key_prefix);

ALTER TABLE agent_api_keys ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_api_keys' AND policyname='agent_keys_select') THEN
    CREATE POLICY "agent_keys_select" ON agent_api_keys FOR SELECT USING (
      builder_id IN (
        SELECT id FROM builders WHERE operator_id IN (
          SELECT id FROM builders WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_api_keys' AND policyname='agent_keys_insert') THEN
    CREATE POLICY "agent_keys_insert" ON agent_api_keys FOR INSERT WITH CHECK (
      builder_id IN (
        SELECT id FROM builders WHERE operator_id IN (
          SELECT id FROM builders WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='agent_api_keys' AND policyname='agent_keys_delete') THEN
    CREATE POLICY "agent_keys_delete" ON agent_api_keys FOR DELETE USING (
      builder_id IN (
        SELECT id FROM builders WHERE operator_id IN (
          SELECT id FROM builders WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

-- ── teams ───────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS teams (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url  TEXT,
  lead_id     UUID REFERENCES builders(id),
  build_score INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_teams_score ON teams(build_score DESC);
CREATE INDEX IF NOT EXISTS idx_teams_slug  ON teams(slug);

CREATE TABLE IF NOT EXISTS team_members (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id    UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
  builder_id UUID REFERENCES builders(id) ON DELETE CASCADE NOT NULL,
  role       TEXT DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  joined_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, builder_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team    ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_builder ON team_members(builder_id);

ALTER TABLE teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='teams_select') THEN
    CREATE POLICY "teams_select" ON teams FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='teams_insert') THEN
    CREATE POLICY "teams_insert" ON teams FOR INSERT WITH CHECK (
      lead_id IN (SELECT id FROM builders WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='teams' AND policyname='teams_update') THEN
    CREATE POLICY "teams_update" ON teams FOR UPDATE USING (
      lead_id IN (SELECT id FROM builders WHERE user_id = auth.uid())
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='members_select') THEN
    CREATE POLICY "members_select" ON team_members FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='members_insert') THEN
    CREATE POLICY "members_insert" ON team_members FOR INSERT WITH CHECK (
      team_id IN (
        SELECT id FROM teams WHERE lead_id IN (
          SELECT id FROM builders WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='team_members' AND policyname='members_delete') THEN
    CREATE POLICY "members_delete" ON team_members FOR DELETE USING (
      team_id IN (
        SELECT id FROM teams WHERE lead_id IN (
          SELECT id FROM builders WHERE user_id = auth.uid()
        )
      )
    );
  END IF;
END $$;

-- ── activity_feed ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS activity_feed (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID REFERENCES builders(id),
  action     TEXT NOT NULL CHECK (action IN (
    'shipped', 'bet', 'quest_posted', 'quest_claimed',
    'quest_completed', 'joined', 'team_created', 'streak_milestone'
  )),
  target_id  UUID,
  summary    TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_feed(created_at DESC);

ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='activity_feed' AND policyname='activity_select') THEN
    CREATE POLICY "activity_select" ON activity_feed FOR SELECT USING (true);
  END IF;
END $$;
