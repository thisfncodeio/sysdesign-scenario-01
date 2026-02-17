-- ======================================================
-- SCHEMA
--
-- Two simple tables: users and posts.
-- Notice there is no index on posts.created_at
-- This is intentional — it's one of the problems
-- you'll be asked to find and fix.
-- ======================================================

CREATE TABLE IF NOT EXISTS users (
  id          SERIAL PRIMARY KEY,
  username    VARCHAR(50) NOT NULL UNIQUE,
  created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id),
  content     VARCHAR(280) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()

  -- No index here. The feed endpoint sorts by this column.
  -- What do you think happens to query performance as the
  -- posts table grows to 100,000 rows? 1,000,000 rows?
);
