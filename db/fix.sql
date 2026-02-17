-- ======================================================
-- FIX: ADD INDEX ON posts.created_at
--
-- The /feed endpoint sorts posts by created_at DESC.
-- Without an index, PostgreSQL reads every row in the
-- table and sorts them in memory — called a sequential scan.
--
-- With an index, PostgreSQL maintains a separate data
-- structure that keeps rows pre-sorted. It can jump
-- straight to the most recent rows without reading
-- the whole table.
--
-- Run this after you've diagnosed the slow query problem.
-- Then re-run the load test and compare the results.
-- ======================================================

-- This is safe to run even if the index already exists
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts (created_at DESC);

-- After running this, you can verify the index exists with:
-- SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'posts';

-- And you can confirm PostgreSQL is using it with:
-- EXPLAIN ANALYZE SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;
-- Look for "Index Scan" instead of "Seq Scan" in the output.
