-- supabase/migrations/011_rankings_view.sql
-- ─────────────────────────────────────────────────────────────────────────────
-- builder_rankings — SQL view powering the Rankings tab in /explore.
--
-- Design principles
-- ─────────────────
-- • Consistency over volume
--     Streak weight = Ships/wk weight (0.35 each).
--     A builder who ships 1× a week for 10 weeks outranks
--     someone who shipped 5× in one week then disappeared.
--
-- • Anti-spam cap
--     ships_per_week is capped at 3.0 before it enters the formula.
--     This prevents a single burst week from catapulting a builder
--     to the top over sustained shippers.
--
-- • Long-term compounding
--     Small logarithmic bonus for total_logs: rewards history without
--     letting veterans coast (log scale flattens quickly).
--
-- • Cold-start protection
--     Builders with < 4 weeks of tenure get 0.85× of their score.
--     They still appear in rankings — just not at the top on day 1.
--
-- • completion_rate
--     Placeholder 0.0 until Phase 2 implements semantic matching of
--     next_week commitment text against the following week's shipped text.
--
-- • engagement_score
--     Log₁₀(1 + Σ upvote_count) across all ship_logs.
--     Log scale prevents high-upvote outliers from dominating.
--     quest_claims excluded: its SELECT policy requires auth.uid(),
--     so it is not visible to the anon API; will revisit in Phase 2.
--
-- • Chinese-friendly
--     - display_name / bio / building are plain text; no ASCII collation.
--     - skills is JSONB (array of text) — accepts zh/en tags freely.
--     - ORDER BY is numeric only (ranking_score DESC); no text sort issues.
--     - No hardcoded tag enumerations.
--
-- Idempotent: safe to re-run (DROP VIEW IF EXISTS).
-- Regular view (not materialized): always fresh. Convert to MATERIALIZED
-- + pg_cron if query latency becomes a concern at scale.
-- ─────────────────────────────────────────────────────────────────────────────

DROP VIEW IF EXISTS builder_rankings;

CREATE VIEW builder_rankings AS

WITH

-- ── 1. Recent shipping cadence ─────────────────────────────────────────────
-- Count ship_logs in the last 28 days (≈ 4 weeks) per builder.
-- Uses the index idx_logs_created + idx_logs_builder.
recent_ships AS (
  SELECT
    builder_id,
    COUNT(*)::INTEGER AS ships_last_4_weeks
  FROM  ship_logs
  WHERE created_at >= NOW() - INTERVAL '28 days'
  GROUP BY builder_id
),

-- ── 2. Engagement signal ───────────────────────────────────────────────────
-- Sum of upvote_count across ALL ship logs (lifetime).
-- upvote_count is an INTEGER counter on ship_logs, publicly readable.
-- quest_claims is auth-gated (SELECT requires auth.uid()), so excluded.
engagement_raw AS (
  SELECT
    builder_id,
    COALESCE(SUM(upvote_count), 0)::NUMERIC AS total_upvotes
  FROM  ship_logs
  GROUP BY builder_id
),

-- ── 3. Per-builder computation ─────────────────────────────────────────────
ranked AS (
  SELECT
    b.id                                                        AS builder_id,
    b.slug,
    b.display_name,                   -- supports zh; no special handling needed
    b.avatar_url,
    b.bio,
    b.tier,
    b.skills,                         -- JSONB text[]; zh/en tags, no hardcoded enum
    b.created_at,
    b.total_logs,
    b.current_streak,
    b.longest_streak,
    b.build_score,                    -- existing field, kept for reference / diff

    -- Recent cadence
    COALESCE(rs.ships_last_4_weeks, 0)                          AS ships_last_4_weeks,
    ROUND(
      COALESCE(rs.ships_last_4_weeks, 0) / 4.0,
      2
    )                                                           AS ships_per_week,

    -- completion_rate: Phase 2 placeholder.
    -- Will become: fulfilled_next_week_commitments / total_next_week_commitments
    -- using semantic matching (embedding cosine sim or keyword overlap).
    0.0::NUMERIC                                                AS completion_rate,

    -- engagement_score: log₁₀(1 + Σupvotes).
    -- Range: 0 (0 upvotes) → ~1 (10 upvotes) → ~2 (100) → ~3 (1000+)
    -- At weight 0.10 this contributes max ~0.30 to ranking_score.
    ROUND(
      LOG(1.0 + COALESCE(er.total_upvotes, 0)),
      3
    )                                                           AS engagement_score,

    -- Tenure in weeks; used for cold-start factor in final SELECT
    ROUND(
      EXTRACT(EPOCH FROM (NOW() - b.created_at)) / 604800.0,
      1
    )                                                           AS tenure_weeks

  FROM        builders       b
  LEFT JOIN   recent_ships   rs  ON rs.builder_id = b.id
  LEFT JOIN   engagement_raw er  ON er.builder_id = b.id
)

-- ── 4. Final SELECT with ranking_score ────────────────────────────────────
SELECT
  builder_id,
  slug,
  display_name,
  avatar_url,
  bio,
  tier,
  skills,
  created_at,
  total_logs,
  current_streak,
  longest_streak,
  build_score,
  ships_last_4_weeks,
  ships_per_week,
  completion_rate,
  engagement_score,
  tenure_weeks,

  -- ── ranking_score ──────────────────────────────────────────────────────
  --
  --   Component          Weight   Notes
  --   ─────────────────────────────────────────────────────────────────────
  --   ships_per_week     × 0.35   Capped at 3.0 to prevent burst gaming
  --   current_streak     × 0.35   Consistency; equal weight to ships/wk
  --   completion_rate    × 0.20   0.0 until Phase 2 semantic matching
  --   engagement_score   × 0.10   log₁₀(1 + upvotes), outlier-resistant
  --   + log-stability bonus       LEAST(log(total_logs)×0.05, 0.35)
  --   × cold-start factor         0.85 if tenure_weeks < 4 else 1.0
  --
  --   ranking_score is always ≥ 0.
  -- ─────────────────────────────────────────────────────────────────────────
  ROUND(
    GREATEST(
      (
          -- Core components
          LEAST(ships_per_week, 3.0) * 0.35
        + current_streak             * 0.35
        + completion_rate            * 0.20
        + engagement_score           * 0.10

          -- Stability bonus: rewards long-term builders gently.
          -- log₁₀(1 + total_logs) × 0.05, capped at +0.35
          -- Examples: 0 logs→0, 10→0.05, 100→0.10, 1000→0.15
        + LEAST(LOG(1.0 + total_logs) * 0.05, 0.35)
      )
      -- Cold-start multiplier: new builders (< 4 weeks) get 85% weight.
      -- Lets them appear in rankings while protecting veteran positions.
      * CASE WHEN tenure_weeks < 4 THEN 0.85 ELSE 1.0 END,
      0.0
    ),
    4  -- 4 decimal places for stable sort at close scores
  ) AS ranking_score

FROM ranked
ORDER BY ranking_score DESC;

-- ─── Permissions ──────────────────────────────────────────────────────────
-- Grant public read. The view is read-only by definition (no DML on views).
-- Underlying tables (builders, ship_logs) already have RLS
-- "FOR SELECT USING (true)" — anon can read all rows.
GRANT SELECT ON builder_rankings TO anon;
GRANT SELECT ON builder_rankings TO authenticated;
GRANT SELECT ON builder_rankings TO service_role;

-- ─── Indexes that help this view ──────────────────────────────────────────
-- Already exist from earlier migrations — listed here for reference:
--   idx_logs_created  ON ship_logs(created_at DESC)   → recent_ships CTE
--   idx_logs_builder  ON ship_logs(builder_id)         → both CTEs
--   idx_builders_score ON builders(build_score DESC)   → builders scan

-- ─── Phase 2 upgrade path ─────────────────────────────────────────────────
-- 1. completion_rate:
--    Replace 0.0 with a subquery over (next_week, shipped) pairs:
--      ROUND(
--        (SELECT COUNT(*)::numeric FROM ship_logs s2
--         WHERE s2.builder_id = b.id
--           AND <semantic_match>(s2.shipped, prev.next_week))
--        / NULLIF((SELECT COUNT(*) FROM ship_logs WHERE builder_id = b.id), 0),
--        3
--      )
--
-- 2. engagement_score:
--    Add quest_claims (once a public SELECT policy is added):
--      + (SELECT COUNT(*) FROM quest_claims WHERE claimer_id = b.id
--           AND status = 'completed')
--
-- 3. Materialized view (if latency becomes a concern):
--    DROP VIEW builder_rankings;
--    CREATE MATERIALIZED VIEW builder_rankings AS <same query>;
--    CREATE UNIQUE INDEX ON builder_rankings(builder_id);
--    SELECT cron.schedule(
--      'rankings-hourly-refresh',
--      '0 * * * *',
--      'REFRESH MATERIALIZED VIEW CONCURRENTLY builder_rankings'
--    );
-- ─────────────────────────────────────────────────────────────────────────────
