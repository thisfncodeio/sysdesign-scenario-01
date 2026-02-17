/**
 * wait-and-seed.js
 *
 * Waits for PostgreSQL to be ready, then seeds the database.
 * Used automatically when the Codespace starts.
 */

const { Pool } = require("pg");
const { execSync } = require("child_process");

const db = new Pool({
  host: process.env.DB_HOST || "postgres",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "feedapp",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
});

async function waitForPostgres(retries = 20, delay = 2000) {
  for (let i = 1; i <= retries; i++) {
    try {
      await db.query("SELECT 1");
      console.log("✅ PostgreSQL is ready.");
      return true;
    } catch (err) {
      console.log(`⏳ Waiting for PostgreSQL... (${i}/${retries})`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw new Error("PostgreSQL did not become ready in time.");
}

async function main() {
  try {
    await waitForPostgres();
    console.log("🌱 Seeding database...");
    execSync("node db/seed.js", { stdio: "inherit" });
    console.log("\n✅ Environment ready. Open SCENARIO.md to begin.\n");
  } catch (err) {
    console.error("Setup failed:", err.message);
    process.exit(1);
  } finally {
    await db.end();
  }
}

main();
