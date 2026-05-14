-- ==========================================
-- opceo.ai — Initial Schema
-- Migration: 001_initial_schema
-- ==========================================

-- BUILDERS
CREATE TABLE builders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  building TEXT,
  avatar_url TEXT,
  links JSONB DEFAULT '{}',
  skills JSONB DEFAULT '[]',
  build_score INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_logs INTEGER DEFAULT 0,
  tier TEXT DEFAULT 'explorer'
    CHECK (tier IN ('explorer','builder','veteran','founding')),
  is_investor BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_builders_score ON builders(build_score DESC);
CREATE INDEX idx_builders_streak ON builders(current_streak DESC);
CREATE INDEX idx_builders_slug ON builders(slug);

-- SHIP LOGS
CREATE TABLE ship_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  shipped TEXT NOT NULL,
  learned TEXT,
  next_week TEXT,
  tags JSONB DEFAULT '[]',
  upvote_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, week_number, year)
);
CREATE INDEX idx_logs_created ON ship_logs(created_at DESC);
CREATE INDEX idx_logs_builder ON ship_logs(builder_id);

-- SIGNAL BETS
CREATE TABLE signal_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bettor_id UUID REFERENCES builders(id),
  target_id UUID REFERENCES builders(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(bettor_id, target_id)
);
CREATE INDEX idx_bets_target ON signal_bets(target_id);

-- UPVOTES
CREATE TABLE upvotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID REFERENCES builders(id),
  log_id UUID REFERENCES ship_logs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(builder_id, log_id)
);

-- QUESTS
CREATE TABLE quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poster_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL
    CHECK (category IN ('ai-workflow','content','design','dev','research','ops','other')),
  skills_needed JSONB DEFAULT '[]',
  reward_type TEXT DEFAULT 'credit'
    CHECK (reward_type IN ('credit','collab','paid','equity','learning')),
  reward_detail TEXT,
  difficulty TEXT DEFAULT 'medium'
    CHECK (difficulty IN ('starter','medium','hard','legendary')),
  status TEXT DEFAULT 'open'
    CHECK (status IN ('open','claimed','in_progress','review','completed','cancelled')),
  max_claimers INTEGER DEFAULT 1,
  deadline TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_quests_category ON quests(category);
CREATE INDEX idx_quests_created ON quests(created_at DESC);

-- QUEST CLAIMS
CREATE TABLE quest_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
  claimer_id UUID REFERENCES builders(id) ON DELETE CASCADE,
  pitch TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','completed','abandoned')),
  submitted_work TEXT,
  score_reward INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(quest_id, claimer_id)
);

-- CONNECT REQUESTS
CREATE TABLE connect_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID REFERENCES builders(id),
  to_id UUID REFERENCES builders(id),
  context TEXT NOT NULL,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','declined')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- WEEKLY SPOTLIGHT
CREATE TABLE spotlights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  builder_id UUID REFERENCES builders(id),
  week_number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- ROW LEVEL SECURITY
-- ==========================================
ALTER TABLE builders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ship_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_bets ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE quest_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE connect_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlights ENABLE ROW LEVEL SECURITY;

-- BUILDERS
CREATE POLICY "Builders are publicly readable"
  ON builders FOR SELECT USING (true);
CREATE POLICY "Users can insert own builder profile"
  ON builders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own builder profile"
  ON builders FOR UPDATE USING (auth.uid() = user_id);

-- SHIP LOGS
CREATE POLICY "Ship logs are publicly readable"
  ON ship_logs FOR SELECT USING (true);
CREATE POLICY "Users can insert own ship logs"
  ON ship_logs FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = builder_id)
  );

-- SIGNAL BETS
CREATE POLICY "Signal bets are publicly readable"
  ON signal_bets FOR SELECT USING (true);
CREATE POLICY "Authenticated users can bet"
  ON signal_bets FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = bettor_id)
  );

-- UPVOTES
CREATE POLICY "Upvotes are publicly readable"
  ON upvotes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can upvote"
  ON upvotes FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = builder_id)
  );

-- QUESTS
CREATE POLICY "Quests are publicly readable"
  ON quests FOR SELECT USING (true);
CREATE POLICY "Users can create quests"
  ON quests FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = poster_id)
  );
CREATE POLICY "Quest posters can update own quests"
  ON quests FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM builders WHERE id = poster_id)
  );

-- QUEST CLAIMS
CREATE POLICY "Quest claims visible to poster and claimer"
  ON quest_claims FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM builders WHERE id = claimer_id
      UNION
      SELECT b.user_id FROM builders b
        JOIN quests q ON q.poster_id = b.id
        WHERE q.id = quest_id
    )
  );
CREATE POLICY "Authenticated users can claim quests"
  ON quest_claims FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = claimer_id)
  );
CREATE POLICY "Poster and claimer can update claims"
  ON quest_claims FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id FROM builders WHERE id = claimer_id
      UNION
      SELECT b.user_id FROM builders b
        JOIN quests q ON q.poster_id = b.id
        WHERE q.id = quest_id
    )
  );

-- CONNECT REQUESTS
CREATE POLICY "Connect requests visible to sender and receiver"
  ON connect_requests FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM builders WHERE id IN (from_id, to_id)
    )
  );
CREATE POLICY "Authenticated users can send connect requests"
  ON connect_requests FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM builders WHERE id = from_id)
  );
CREATE POLICY "Receiver can update connect request status"
  ON connect_requests FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM builders WHERE id = to_id)
  );

-- SPOTLIGHTS
CREATE POLICY "Spotlights are publicly readable"
  ON spotlights FOR SELECT USING (true);

-- ==========================================
-- AUTO-CREATE BUILDER PROFILE ON SIGNUP
-- ==========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  base_slug := LOWER(REGEXP_REPLACE(
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1)),
    '[^a-z0-9\-]', '-', 'g'
  ));
  base_slug := REGEXP_REPLACE(base_slug, '-+', '-', 'g');
  base_slug := TRIM(BOTH '-' FROM base_slug);
  base_slug := LEFT(base_slug, 30);

  final_slug := base_slug;
  WHILE EXISTS (SELECT 1 FROM public.builders WHERE slug = final_slug) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;

  INSERT INTO public.builders (user_id, slug, display_name)
  VALUES (
    NEW.id,
    final_slug,
    COALESCE(NEW.raw_user_meta_data->>'name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
