-- ==========================================
-- opceo.ai — Profile Upgrade: headline, cover, featured_links, showcase
-- Migration: 007_profile_upgrade
-- ==========================================

ALTER TABLE builders ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS featured_links JSONB DEFAULT '[]'::jsonb;
ALTER TABLE builders ADD COLUMN IF NOT EXISTS showcase JSONB DEFAULT '[]'::jsonb;
