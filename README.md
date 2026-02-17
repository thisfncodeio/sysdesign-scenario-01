# Scenario 1: The Single Server Problem

## What is this?

You've just joined a startup as a junior backend engineer.

This is the backend: a simple social post feed. Users can create posts, and anyone can fetch a feed of the 20 most recent ones. The code works fine with a handful of users. The team is happy with it.

But what happens when real traffic shows up?

Your job is to find out — and fix it.

---

## Before You Start

You don't need to be an expert. You need to be able to:

- Read JavaScript
- Run commands in a terminal
- Be curious about why things happen

Every step has an explanation. Nothing gets thrown at you without context.

---

## Setup

**Prerequisites:** Docker Desktop or OrbStack installed. That's it.

```bash
# 1. Start everything
docker compose up -d --build

# 2. Seed the database with test data
docker compose exec app npm run seed

# 3. Confirm the app is working
curl http://localhost:3000/health
# Expected: {"status":"ok"}

curl http://localhost:3000/feed
# Expected: an array of posts
```

---

## Part 1 — Read the Code

Before you break anything, understand what you're working with.

Open `src/server.js`. It has three endpoints:

- `GET /health` — confirms the server is running
- `POST /posts` — creates a new post
- `GET /feed` — returns the 20 most recent posts

Read through it and answer these questions in your own words before moving on:

1. What does `getDbConnection()` do, and when does it get called?
2. How does the `/feed` endpoint decide which posts to return and in what order?
3. Can you spot anything that looks like it might cause a problem under heavy traffic?

Write your answers down. You'll come back to them.

---

## Part 2 — Stress Test It

Now let's see what actually happens when traffic hits.

```bash
docker compose exec app npm run loadtest
```

This sends 100 concurrent users to the `/feed` endpoint for 30 seconds.

**What do you see?**

Look at:

- **Success rate** — what percentage of requests are succeeding?
- **Failed requests** — how many are failing and why?
- **Response times** — p50, p99, max

### Diagnosis Questions

Answer these before moving to the fix:

**Question 1:** The success rate is extremely low. Look at `getDbConnection()`. A new Pool is created with `max: 1` on every single request. What do you think happens when 100 requests all try to do this simultaneously?

**Question 2:** The `/feed` route has a 500ms delay simulating a slow database query. In a real system, what would cause a query to be that slow? (Hint: look at `db/schema.sql` — what's missing from the posts table?)

**Question 3:** If this server goes down completely, what happens to the app? What does "single point of failure" mean?

---

## Part 3 — Fix It

Two changes. Apply them in order and observe what each one does.

### Fix 1: Connection Pooling

**The problem:** `getDbConnection()` creates a brand new pool on every request with `max: 1`. Under load, 100 requests fight over a single connection with a 150ms timeout. Most lose and fail immediately.

**The fix:** Create one shared pool when the server starts. Reuse it for every request.

In `src/server.js`:

1. Move the `Pool` creation to the top of the file, outside of `getDbConnection()`, so it runs once at startup
2. Delete the `getDbConnection()` function
3. Change `max: 1` to `max: 10`
4. Remove `connectionTimeoutMillis: 150`
5. Remove all the `await db.end()` calls — you don't close a shared pool after each request
6. Remove the `setTimeout` delay from the `/feed` route

Restart the server after making changes:

```bash
docker compose restart app
```

Run the load test again. What changed?

---

### Fix 2: Add a Database Index

**The problem:** The `/feed` query sorts posts by `created_at DESC`. Without an index, PostgreSQL scans every row in the table on every request. With 10,000 posts this is manageable. In production with millions of rows, it becomes the bottleneck.

**The fix:** Add an index so PostgreSQL can find recent posts without a full table scan.

```bash
docker compose exec postgres psql -U postgres -d feedapp -f /app/db/fix.sql
```

Verify it worked:

```bash
docker compose exec postgres psql -U postgres -d feedapp -c \
  "EXPLAIN ANALYZE SELECT * FROM posts ORDER BY created_at DESC LIMIT 20;"
```

Look for `Index Scan` in the output. Before the fix you'd see `Seq Scan` — that's the expensive one.

Run the load test one final time. Compare all three runs:

| Run         | Success Rate | p99 Latency |
| ----------- | ------------ | ----------- |
| Broken      | ~0%          | —           |
| After Fix 1 | ?            | ?           |
| After Fix 2 | ?            | ?           |

---

## Part 4 — Reflect

You've significantly improved the system. But it still has a fundamental limitation.

Answer this before moving to Scenario 2:

**The system now handles load well, but it's still one server and one database. What happens if:**

- Traffic grows to 10x what it is today?
- The server machine dies unexpectedly?
- You need to deploy a new version without downtime?

What would you do next, and why?

There's no single right answer. Write down your thinking. This is exactly the conversation you'd have with a senior engineer on your team — and it's exactly what Scenario 2 is about.

---

## What You Learned

- **Connection pooling** is not optional in production. Creating a new database connection per request is one of the most common and costly mistakes in early backends. A shared pool with a sensible max is standard practice everywhere.
- **Indexes** are one of the highest-leverage performance tools available. A missing index on a column you sort or filter by will eventually bring a system to its knees as the table grows.
- **Single points of failure** exist in every system. Knowing where they are is the first step to designing around them.

You didn't just read about these concepts. You watched them fail in real time and fixed them.

---

## Files in This Project

```
src/
  server.js         ← The broken version. Make your changes here.
  server.fixed.js   ← The solution. Don't look until you've tried it yourself.
db/
  schema.sql        ← Database schema
  seed.js           ← Creates 50 users and 10,000 posts
  fix.sql           ← Adds the index (Part 3, Fix 2)
scripts/
  loadtest.js       ← The load test
dashboard/          ← Grafana and Prometheus config
docker-compose.yml  ← Starts everything
```
