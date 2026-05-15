-- ==========================================
-- opceo.ai — Ship Log: tool_stack + next_week required
-- Migration: 006_tool_stack
-- ==========================================

ALTER TABLE ship_logs ADD COLUMN IF NOT EXISTS next_week TEXT DEFAULT '';
ALTER TABLE ship_logs ADD COLUMN IF NOT EXISTS tool_stack JSONB DEFAULT '[]'::jsonb;

-- 1. Back-fill nulls so NOT NULL constraint succeeds
UPDATE ship_logs SET next_week = '' WHERE next_week IS NULL;
UPDATE ship_logs SET tool_stack = '[]'::jsonb WHERE tool_stack IS NULL;

-- 2. Copy legacy tags → tool_stack when both columns exist
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ship_logs'
      AND column_name = 'tags'
  ) THEN
    UPDATE ship_logs
    SET tool_stack = COALESCE(tool_stack, tags, '[]'::jsonb)
    WHERE tool_stack IS NULL OR tool_stack = '[]'::jsonb;
  END IF;
END $$;

-- 3. Make next_week required
ALTER TABLE ship_logs ALTER COLUMN next_week SET DEFAULT '';
ALTER TABLE ship_logs ALTER COLUMN next_week SET NOT NULL;
ALTER TABLE ship_logs ALTER COLUMN tool_stack SET DEFAULT '[]'::jsonb;
