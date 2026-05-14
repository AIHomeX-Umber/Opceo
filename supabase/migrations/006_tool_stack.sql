-- ==========================================
-- opceo.ai — Ship Log: tool_stack + next_week required
-- Migration: 006_tool_stack
-- ==========================================

-- 1. Back-fill nulls so NOT NULL constraint succeeds
UPDATE ship_logs SET next_week = '' WHERE next_week IS NULL;

-- 2. Make next_week required
ALTER TABLE ship_logs ALTER COLUMN next_week SET NOT NULL;

-- 3. Rename tags → tool_stack
ALTER TABLE ship_logs RENAME COLUMN tags TO tool_stack;
