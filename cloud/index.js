const mysql = require('mysql2/promise');  // using the async/await version

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // optional tuning:
  connectionLimit: 5
});



// index.js
const express = require('express');
const cors = require('cors');
const app = express();

// Enable JSON parsing and CORS so S3 can call this API from a different domain
app.use(express.json());
app.use(cors());

// In-memory "users" for demo (don't do this in production!)
//const demoUsers = [
  //{ id: 1, username: 'alice', password: 'password123' },
  //{ id: 2, username: 'bob', password: 'mypassword' }
//];

// Simple root route
app.get('/', (req, res) => {
  res.send('Hello from Elastic Beanstalk!');
});

// Basic login endpoint
app.post('/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Query the DB
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // We found a matching user
    const user = rows[0];

    // For demo, we return a "fake token" and user info
    const fakeToken = `fake-jwt-token-for-${user.username}`;

    return res.json({
      message: 'Login successful',
      token: fakeToken,
      user: { id: user.id, username: user.username }
    });
  } catch (err) {
    console.error('DB error:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});

// POST /threads
// Expects { title, body, authorId } in the request body
app.post('/threads', async (req, res) => {
  const { title, body, authorId } = req.body;

  if (!title || !body || !authorId) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO threads (title, body, author_id) VALUES (?, ?, ?)',
      [title, body, authorId]
    );

    return res.status(201).json({
      message: 'Thread created',
      threadId: result.insertId
    });
  } catch (err) {
    console.error('Error creating thread:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});


// GET /threads
app.get('/threads', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT t.id, t.title, t.body, t.created_at, u.username as authorName ' +
      'FROM threads t ' +
      'LEFT JOIN users u ON t.author_id = u.id ' +
      'ORDER BY t.created_at DESC'
    );

    return res.json(rows);
  } catch (err) {
    console.error('Error fetching threads:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});

// GET /threads/:id
app.get('/threads/:id', async (req, res) => {
  const threadId = req.params.id;

  try {
    // Fetch the thread info
    const [threads] = await pool.query(
      'SELECT t.*, u.username as authorName FROM threads t ' +
      'LEFT JOIN users u ON t.author_id = u.id ' +
      'WHERE t.id = ?',
      [threadId]
    );

    if (threads.length === 0) {
      return res.status(404).json({ message: 'Thread not found' });
    }

    const thread = threads[0];

    // Fetch comments
    const [comments] = await pool.query(
      'SELECT c.*, u.username as commenterName ' +
      'FROM comments c ' +
      'LEFT JOIN users u ON c.user_id = u.id ' +
      'WHERE c.thread_id = ? ' +
      'ORDER BY c.created_at ASC',
      [threadId]
    );

    // Return combined data
    return res.json({
      ...thread,
      comments
    });
  } catch (err) {
    console.error('Error fetching thread:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});

// POST /threads/:id/comments
app.post('/threads/:id/comments', async (req, res) => {
  const threadId = req.params.id;
  const { userId, body } = req.body;

  if (!userId || !body) {
    return res.status(400).json({ message: 'Missing fields' });
  }

  try {
    // Insert comment
    const [result] = await pool.query(
      'INSERT INTO comments (thread_id, user_id, body) VALUES (?, ?, ?)',
      [threadId, userId, body]
    );

    return res.status(201).json({
      message: 'Comment added',
      commentId: result.insertId
    });
  } catch (err) {
    console.error('Error adding comment:', err);
    return res.status(500).json({ message: 'Database error' });
  }
});


// Start server on port specified by EB or fallback to 3000
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
