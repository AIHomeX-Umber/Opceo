-- ==========================================
-- opceo.ai — Seed Data
-- Migration: 002_seed_data
-- NOTE: Replace REPLACE_WITH_REAL_UUID with actual auth.users UUIDs
--       after registering each account in Supabase Auth.
-- ==========================================

-- Initial builder profiles
-- Run AFTER registering accounts and getting their UUIDs from auth.users

/*
INSERT INTO builders (user_id, slug, display_name, bio, building, skills, links, build_score, current_streak, total_logs) VALUES
('REPLACE_UMBER_UUID', 'umber', 'Umber',
 'CEO of Mashi Technology. Building at the intersection of AI and cross-border commerce.',
 'Mashi Technology — AI-native cross-border e-commerce OS + Makox digital employee platform',
 '["AI", "Cross-border", "Product", "Strategy"]',
 '{"x": "https://x.com/opceo_ai", "website": "https://opceo.ai"}',
 120, 4, 4),

('REPLACE_FLORA_UUID', 'flora', 'Flora',
 'COO of Mashi Technology. Brand strategy and channel operations.',
 'Mashi cross-border brand strategy and Wayfair/Amazon channel operations',
 '["Brand", "E-commerce", "Marketing", "Operations"]',
 '{}',
 80, 3, 3),

('REPLACE_SHUNCHENG_UUID', 'shuncheng', '顺成',
 'Intern at Mashi Technology. Learning AI workflows and content creation.',
 'AI content pipeline and workflow documentation at Mashi',
 '["AI", "Content", "Learning"]',
 '{}',
 55, 2, 2),

('REPLACE_YANGTONG_UUID', 'yangtong', '杨桐',
 'Intern at Mashi Technology. Platform operations and supply chain.',
 'Wayfair platform operations and supply chain coordination at Mashi',
 '["Operations", "Supply Chain", "E-commerce"]',
 '{}',
 45, 2, 2);

-- Example ship logs (replace builder_id with actual UUIDs after insert above)
INSERT INTO ship_logs (builder_id, week_number, year, shipped, learned, next_week, tags) VALUES
(
  (SELECT id FROM builders WHERE slug = 'umber'),
  20, 2026,
  'Launched opceo.ai V0 — the first public build log platform for serious builders. Shipped the full PRD (19 tasks, 6 sprints), bootstrapped the Supabase schema, and started recruiting founding builders.',
  'Writing a clear PRD before touching code cuts execution time in half. Every ambiguity you resolve upfront saves 3x the time in debugging.',
  'Recruit 4 founding builders, ship the onboarding flow, get first 10 ship logs on the platform.',
  '["opceo", "product", "launch", "AI"]'
),
(
  (SELECT id FROM builders WHERE slug = 'flora'),
  20, 2026,
  'Mapped Mashi brand positioning for 3 Wayfair product lines. Built a competitor matrix with 12 players. Drafted the first batch of enhanced listing copy for Q3.',
  'Cross-border brand work is 80% research, 20% writing. The research phase cannot be rushed.',
  'Finalize listing copy for first 20 SKUs. Set up A/B test framework.',
  '["brand", "e-commerce", "Wayfair", "copywriting"]'
),
(
  (SELECT id FROM builders WHERE slug = 'shuncheng'),
  20, 2026,
  'Built an AI-assisted content workflow using Claude API. Reduced weekly content production time from 8 hours to 2.5 hours. Documented the full process in Notion.',
  'The bottleneck is not writing — it is briefing and review. AI handles drafts, but judgment still needs a human.',
  'Test the workflow with Flora for listing copy. Add a quality check step.',
  '["AI", "workflow", "content", "automation"]'
),
(
  (SELECT id FROM builders WHERE slug = 'yangtong'),
  20, 2026,
  'Audited Wayfair inventory levels for 40 SKUs. Identified 6 stockout risks for Q3. Built a reorder alert spreadsheet that auto-flags at 30-day supply.',
  'Supply chain visibility is the real competitive advantage in cross-border e-commerce. You cannot compete on speed if you cannot see problems early.',
  'Connect the reorder alert to our supplier communication workflow. Automate the first email draft.',
  '["ops", "supply chain", "Wayfair", "inventory"]'
);
*/
