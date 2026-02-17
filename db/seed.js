/**
 * SEED SCRIPT
 *
 * Populates the database with fake users and posts
 * so the load test has real data to work with.
 *
 * Run: node db/seed.js
 *
 * This inserts:
 *   - 50 users
 *   - 10,000 posts spread across those users
 *
 * Why 10,000 posts? Because with only 10 rows in the table,
 * every query feels fast. The problems only show up at scale.
 * This seed gives you enough data to actually feel the pain.
 */

const { Pool } = require('pg');

const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'feedapp',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

const USERS_TO_CREATE = 50;
const POSTS_TO_CREATE = 10000;

const sampleContent = [
  "Just shipped a new feature. Feels good.",
  "Anyone else think TypeScript is worth the overhead?",
  "Hot take: monoliths get a bad reputation they don't deserve.",
  "Three hours debugging a missing semicolon. I'm fine.",
  "Finally understood what a race condition actually is today.",
  "Good code is code your team can still read in six months.",
  "Spent all morning on a problem. Took a walk. Solved it in five minutes.",
  "Every system design starts with: what's the simplest thing that could work?",
  "Deployed on a Friday. Living dangerously.",
  "The real 10x engineers write less code, not more.",
];

async function seed() {
  console.log('Seeding database...');

  // Create users
  console.log(`Creating ${USERS_TO_CREATE} users...`);
  const userIds = [];

  for (let i = 1; i <= USERS_TO_CREATE; i++) {
    const result = await db.query(
      'INSERT INTO users (username) VALUES ($1) ON CONFLICT (username) DO NOTHING RETURNING id',
      [`user_${i}`]
    );
    if (result.rows[0]) {
      userIds.push(result.rows[0].id);
    }
  }

  // If users already existed, fetch their IDs
  if (userIds.length === 0) {
    const result = await db.query('SELECT id FROM users LIMIT $1', [USERS_TO_CREATE]);
    userIds.push(...result.rows.map(r => r.id));
  }

  console.log(`Created ${userIds.length} users`);

  // Create posts in batches for speed
  console.log(`Creating ${POSTS_TO_CREATE} posts...`);

  const BATCH_SIZE = 500;
  let created = 0;

  while (created < POSTS_TO_CREATE) {
    const batch = [];
    const values = [];
    let paramIndex = 1;

    for (let i = 0; i < BATCH_SIZE && created + i < POSTS_TO_CREATE; i++) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const content = sampleContent[Math.floor(Math.random() * sampleContent.length)];
      // Spread posts over the last 90 days so dates feel realistic
      const daysAgo = Math.floor(Math.random() * 90);
      const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      batch.push(`($${paramIndex}, $${paramIndex + 1}, $${paramIndex + 2})`);
      values.push(userId, content, createdAt.toISOString());
      paramIndex += 3;
    }

    await db.query(
      `INSERT INTO posts (user_id, content, created_at) VALUES ${batch.join(', ')}`,
      values
    );

    created += BATCH_SIZE;
    process.stdout.write(`\r${Math.min(created, POSTS_TO_CREATE)} / ${POSTS_TO_CREATE} posts created`);
  }

  console.log('\nDone! Database is ready for the load test.');
  await db.end();
}

seed().catch(err => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
