// Simple Express server with SQLite to store device queries and serve static files
const path = require('path');
const fs = require('fs');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directory exists
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'queries.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(
    `CREATE TABLE IF NOT EXISTS queries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      device TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    )`
  );
});

app.use(express.json());

// Static files (serve the landing page from this directory)
app.use(express.static(__dirname));

// Basic health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Store a new device query
app.post('/api/queries', (req, res) => {
  const { name, email, device, message } = req.body || {};
  if (
    !name ||
    !email ||
    !device ||
    !message ||
    !/^([^\s@]+)@([^\s@]+)\.[^\s@]+$/.test(String(email))
  ) {
    return res.status(400).json({ error: 'Invalid payload' });
  }
  const createdAt = new Date().toISOString();
  db.run(
    `INSERT INTO queries (name, email, device, message, created_at) VALUES (?, ?, ?, ?, ?)`,
    [name.trim(), String(email).trim(), device.trim(), message.trim(), createdAt],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save query' });
      }
      return res.status(201).json({ id: this.lastID, created_at: createdAt });
    }
  );
});

// Fallback to index.html for root route
app.get('/', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});


