const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

function getDbConnection() {
  return new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'feedapp',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 1,
    connectionTimeoutMillis: 150,
  });
}

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/posts', async (req, res) => {
  const { userId, content } = req.body;
  if (!userId || !content) return res.status(400).json({ error: 'userId and content are required' });
  if (content.length > 280) return res.status(400).json({ error: 'Post content cannot exceed 280 characters' });
  const db = getDbConnection();
  try {
    const result = await db.query('INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating post:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await db.end();
  }
});

app.get('/feed', async (req, res) => {
  const db = getDbConnection();
  try {
    const result = await db.query(`
      SELECT
        posts.id,
        posts.user_id,
        posts.content,
        posts.created_at,
        users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT 20
    `);

    // Simulates a sequential scan on a large unindexed table
    await new Promise(resolve => setTimeout(resolve, 500));

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching feed:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await db.end();
  }
});

app.get('/users/:id/posts', async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) return res.status(400).json({ error: 'Invalid user ID' });
  const db = getDbConnection();
  try {
    const result = await db.query('SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user posts:', err.message);
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    await db.end();
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
