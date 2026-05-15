ALTER TABLE builders
  ADD COLUMN IF NOT EXISTS builder_type TEXT
  CHECK (builder_type IN ('founder', 'operator', 'engineer', 'researcher', 'designer', 'creator', 'other'));
