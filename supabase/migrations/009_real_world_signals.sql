-- 009_real_world_signals.sql — Real World Signals extension to Quest system

-- 1. Add 'signal' to quest category
ALTER TABLE quests DROP CONSTRAINT IF EXISTS quests_category_check;
ALTER TABLE quests ADD CONSTRAINT quests_category_check
  CHECK (category IN (
    'ai-workflow', 'content', 'design', 'dev',
    'research', 'ops', 'signal', 'other'
  ));

-- 2. Signal-specific fields on quests
ALTER TABLE quests ADD COLUMN IF NOT EXISTS signal_strength TEXT
  CHECK (signal_strength IN ('observed', 'moderate', 'strong', 'validated'));

ALTER TABLE quests ADD COLUMN IF NOT EXISTS signal_status TEXT DEFAULT 'observed'
  CHECK (signal_status IN (
    'observed', 'discussed', 'validated', 'building', 'solved'
  ));

ALTER TABLE quests ADD COLUMN IF NOT EXISTS market_size TEXT
  CHECK (market_size IN ('niche', 'local', 'national', 'global'));

ALTER TABLE quests ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE quests ADD COLUMN IF NOT EXISTS seen_count INTEGER DEFAULT 0;

-- 3. signal_confirmations — "I've seen this too"
CREATE TABLE IF NOT EXISTS signal_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  note TEXT CHECK (char_length(note) <= 300),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quest_id, builder_id)
);

ALTER TABLE signal_confirmations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_confirmations' AND policyname = 'confirmations_select'
  ) THEN
    CREATE POLICY "confirmations_select" ON signal_confirmations FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_confirmations' AND policyname = 'confirmations_insert'
  ) THEN
    CREATE POLICY "confirmations_insert" ON signal_confirmations FOR INSERT WITH CHECK (
      builder_id IN (SELECT id FROM builders WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- 4. signal_builders — "I'm building for this"
CREATE TABLE IF NOT EXISTS signal_builders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  project_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(quest_id, builder_id)
);

ALTER TABLE signal_builders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_builders' AND policyname = 'signal_builders_select'
  ) THEN
    CREATE POLICY "signal_builders_select" ON signal_builders FOR SELECT USING (true);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'signal_builders' AND policyname = 'signal_builders_insert'
  ) THEN
    CREATE POLICY "signal_builders_insert" ON signal_builders FOR INSERT WITH CHECK (
      builder_id IN (SELECT id FROM builders WHERE user_id = auth.uid())
    );
  END IF;
END $$;

-- 5. Expand activity_feed action constraint
ALTER TABLE activity_feed DROP CONSTRAINT IF EXISTS activity_feed_action_check;
ALTER TABLE activity_feed ADD CONSTRAINT activity_feed_action_check
  CHECK (action IN (
    'shipped', 'bet', 'quest_posted', 'quest_claimed', 'quest_completed',
    'joined', 'team_created', 'streak_milestone',
    'signal_posted', 'signal_confirmed', 'signal_validated',
    'signal_building', 'signal_solved'
  ));
