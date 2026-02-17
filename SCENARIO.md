# Scenario 1: The Single Server Problem

**Difficulty:** Entry Level  
**Concepts:** Connection Pooling, Database Indexes, Single Points of Failure  
**Time:** ~45 minutes

---

## The Situation

You've just joined a startup as a junior backend engineer.

This is the backend: a simple social post feed. Users can create posts, anyone can fetch a feed of the most recent ones. The code is clean. It works. The team ships it to production.

A week later, traffic picks up. The app starts timing out. Users are getting errors. Your tech lead messages you:

> _"Something's wrong with the feed endpoint. Can you look into it?"_

Your job is to figure out what's breaking and fix it.

---

## Your Environment

Everything is already running. You don't need to install anything.

| Service           | URL       | What it is                                  |
| ----------------- | --------- | ------------------------------------------- |
| Feed API          | Port 3000 | The app you're investigating                |
| Grafana Dashboard | Port 3002 | Live metrics — watch this during load tests |

Open a terminal with **Ctrl+`** (or Terminal → New Terminal).

---

## Step 1 — Read the Code

Open `src/server.js`.

Read through it. It's not long. Then answer these questions — write your answers in the space below each one. This is not a test. It's how engineers actually think through a system before touching it.

**Q1: What does `getDbConnection()` do? When does it get called?**

```
Your answer:


```

**Q2: The `/feed` endpoint sorts posts by `created_at DESC`. Open `db/schema.sql`. Is there an index on that column?**

```
Your answer:


```

**Q3: Before running anything — what do you think will happen under heavy traffic? Make a guess.**

```
Your guess:


```

---

## Step 2 — Run the Load Test

In your terminal, run:

```bash
npm run loadtest
```

This sends 100 concurrent users at the `/feed` endpoint for 30 seconds.

**While it runs:** switch to the Grafana tab (Port 3002, login: admin / admin) and watch what happens to the metrics in real time.

**After it finishes**, record what you saw:

| Metric          | Value |
| --------------- | ----- |
| Success rate    |       |
| Failed requests |       |
| Average latency |       |
| p99 latency     |       |

**Q4: The success rate is extremely low. Look at `getDbConnection()` again. It creates a new Pool on every single request with `max: 1` and a 150ms connection timeout. What do you think happens when 100 requests all do this at the same time?**

```
Your answer:


```

**Q5: The `/feed` route has a 500ms artificial delay. In production, what would cause a real query to be that slow on a large table?**

```
Your answer:


```

**Q6: If this single server crashed right now, what would happen to the app?**

```
Your answer:


```

---

## Step 3 — Apply the Fixes

You've diagnosed the problem. Now fix it. Two changes, in order.

### ✅ Fix 1: Connection Pooling

**The problem:** A new pool with `max: 1` is created on every request. Under load, 100 requests fight over one connection with a 150ms timeout. Almost all of them lose immediately.

**What to do in `src/server.js`:**

- [ ] Move the `Pool` creation to the top of the file, outside `getDbConnection()`, so it runs **once** at startup
- [ ] Delete the `getDbConnection()` function entirely
- [ ] Change `max: 1` to `max: 10`
- [ ] Remove `connectionTimeoutMillis: 150`
- [ ] Remove all `await db.end()` calls from the routes — you don't close a shared pool after each request
- [ ] Remove the `setTimeout` delay from the `/feed` route

When done, restart the server:

```bash
# In terminal
npm run start
```

Then run the load test again:

```bash
npm run loadtest
```

What's the success rate now? Record it.

---

### ✅ Fix 2: Add a Database Index

**The problem:** The `/feed` query sorts by `created_at DESC` with no index. PostgreSQL scans every row in the table on every call. With 10,000 rows it's slow. With 1,000,000 it would be catastrophic.

**What to do:**

```bash
# Apply the index
npm run apply-fix

# Verify PostgreSQL is using it
npm run explain-query
```

Look for `Index Scan` in the output. Before the fix you'd see `Seq Scan` — that's the expensive path.

Run the load test one final time:

```bash
npm run loadtest
```

---

## Step 4 — Compare Your Results

Fill this in:

| Run             | Success Rate | p99 Latency | Req/sec |
| --------------- | ------------ | ----------- | ------- |
| Broken (Step 2) |              |             |         |
| After Fix 1     |              |             |         |
| After Fix 2     |              |             |         |

---

## Step 5 — Reflect

The system is dramatically better. But it still has a fundamental limitation.

**Q7: This is still one server and one database. What are three things that could still go wrong?**

```
1.

2.

3.
```

**Q8: If traffic grew to 10x overnight, what would you do first?**

```
Your answer:


```

**Q9: How would you deploy a new version of this code without any downtime?**

```
Your answer:


```

These are exactly the questions Scenario 2 addresses. You've just thought your way into it.

---

## What You Learned

**Connection pooling** is not optional in production. Creating a new database connection per request is one of the most common and costly mistakes in early backend code. A shared pool with a sensible `max` is standard practice everywhere.

**Indexes** are one of the highest-leverage tools available to a backend engineer. A missing index on a column you sort or filter by will work fine at small scale and become a crisis at large scale. Adding one can turn a seconds-long query into a milliseconds-long one.

**Single points of failure** exist in every system. Identifying them is the first step to designing around them. You just found three.

---

## Stuck?

- **Can't figure out Fix 1?** Open `src/server.fixed.js` — it has the solution with comments explaining each change. Try on your own first.
- **Load test still failing after fix?** Make sure you restarted the server: `npm run start`
- **Grafana showing nothing?** Give it 30 seconds after startup — it takes a moment to connect to Prometheus.

---

_Scenario 2: Load Balancing & Stateless Servers →_
