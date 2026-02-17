# System Design: Scenario 1 — The Single Server Problem

A hands-on system design exercise for entry-level engineers.

You'll be dropped into a broken codebase, diagnose why it fails under load, and fix it — all in your browser. No installs. No setup. Just click and go.

**Concepts:** Connection Pooling · Database Indexes · Single Points of Failure  
**Level:** Entry  
**Time:** ~45 minutes

---

## How to Get Started (Step by Step)

### Step 1 — You need a GitHub account

If you don't have one, sign up free at [github.com](https://github.com). It takes 2 minutes.

### Step 2 — Open this repo on GitHub

Make sure you're on the main page of this repository at github.com. You should see a list of files above this text.

### Step 3 — Create a Codespace

1. Click the green **Code** button near the top right of the page
2. Click the **Codespaces** tab in the dropdown that appears
3. Click **Create codespace on main**

It will show a loading screen for about 2 minutes while it builds your environment. This is normal.

### Step 4 — Wait for it to finish

When it's done you'll see VS Code open in your browser with:

- A file called **SCENARIO.md** open in the editor
- A terminal panel at the bottom of the screen
- Your file explorer on the left showing the project files

### Step 5 — Start the scenario

Read **SCENARIO.md** from the top. Everything you need to do is in there.

---

## What is a Codespace?

A Codespace is VS Code running in your browser with a full development environment behind it — the app, the database, everything. You don't need to install Node, Docker, or anything else on your computer. It all runs in the cloud and you access it through your browser like a website.

When you're done, you can close the browser tab. Your Codespace will pause automatically. You can come back to it any time from [github.com/codespaces](https://github.com/codespaces).

---

## What You'll Do

- Read a real Node.js backend and understand how it works
- Run a load test and watch the system fail in real time
- Diagnose why it's failing
- Apply two fixes and see the results change dramatically
- Reflect on what's still broken and what you'd do next

---

## Files in This Project

```
src/server.js          ← The broken backend. You'll work in here.
src/server.fixed.js    ← The solution. Don't peek until you've tried.
SCENARIO.md            ← Your guided walkthrough. Start here.
db/schema.sql          ← Database schema
db/seed.js             ← Populates the database with test data
db/fix.sql             ← The index fix (used in Step 3 of the scenario)
scripts/loadtest.js    ← The load test
```

---

## Something Not Working?

| Problem                           | What to do                                                             |
| --------------------------------- | ---------------------------------------------------------------------- |
| Codespace taking too long to load | Wait up to 5 minutes, it's building the environment for the first time |
| Don't see SCENARIO.md open        | Click on SCENARIO.md in the file explorer on the left                  |
| Terminal not visible              | Press Ctrl+` or go to Terminal → New Terminal in the top menu          |
| Port 3002 (Grafana) not opening   | Wait 30 seconds and try again — it starts up slower than the app       |
