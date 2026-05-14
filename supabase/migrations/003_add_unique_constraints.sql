-- ==========================================
-- opceo.ai — Add Missing Unique Constraints
-- Migration: 003_add_unique_constraints
-- ==========================================
-- Context:
--   onboarding/page.tsx calls:
--     .upsert({ user_id: ... }, { onConflict: 'user_id' })
--   Supabase translates this to:
--     INSERT ... ON CONFLICT (user_id) DO UPDATE ...
--   PostgreSQL requires a UNIQUE or exclusion constraint on the
--   conflict target column. builders.user_id was only a FK — no UNIQUE.
--
-- All other upsert-like calls in the codebase were audited:
--   - settings/page.tsx:  storage.upload({ upsert: true }) — not a DB upsert, no fix needed
--   - api/cron/streak:    uses .update(), no conflict target
--   - ship_logs:          UNIQUE(builder_id, week_number, year) — already present, correct
--   - signal_bets:        UNIQUE(bettor_id, target_id) — already present, correct
--   - upvotes:            UNIQUE(builder_id, log_id) — already present, correct
--   - quest_claims:       UNIQUE(quest_id, claimer_id) — already present, correct
--
-- Tables that do not exist in this project (nothing to fix):
--   profiles, api_keys, rankings, build_logs, signals
-- ==========================================

-- builders: add UNIQUE(user_id) so onboarding upsert onConflict: 'user_id' works
-- One auth user must map to exactly one builder profile.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM   pg_constraint
    WHERE  conrelid = 'public.builders'::regclass
      AND  contype  = 'u'
      AND  conname  = 'builders_user_id_key'
  ) THEN
    ALTER TABLE public.builders
      ADD CONSTRAINT builders_user_id_key UNIQUE (user_id);
  END IF;
END;
$$;
