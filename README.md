# System Design: Scenario 1 — The Single Server Problem

A hands-on system design exercise for entry-level engineers.

You'll be dropped into a broken codebase, diagnose why it fails under load, and fix it — all in your browser, no local setup required.

**Concepts covered:** Connection Pooling · Database Indexes · Single Points of Failure  
**Level:** Entry  
**Time:** ~45 minutes

---

## Get Started

1. Click the green **Code** button above
2. Select the **Codespaces** tab
3. Click **Create codespace on main**
4. Wait ~2 minutes for the environment to build
5. When VS Code opens, follow the instructions in **SCENARIO.md**

That's it. Everything is already running inside the Codespace — the app, the database, the metrics dashboard. You don't need to install anything.

---

## What You'll Do

- Read a real Node.js backend and understand how it works
- Run a load test and watch the system fail in real time
- Diagnose why it's failing
- Apply two fixes and see the results change dramatically
- Reflect on what's still broken and what you'd do next

---

## Files

```
src/server.js          ← The broken backend. You'll work in here.
src/server.fixed.js    ← The solution. Don't peek until you've tried.
SCENARIO.md            ← Your guided walkthrough. Start here.
db/schema.sql          ← Database schema
db/seed.js             ← Populates the database with test data
db/fix.sql             ← The index fix (used in Step 3)
scripts/loadtest.js    ← The load test
```
