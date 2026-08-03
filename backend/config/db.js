const path = require("path");
const sqlite = require("sqlite");
const sqlite3 = require("sqlite3");

let db;

async function initDatabase() {
  const dbPath = path.join(__dirname, "..", "database.db");
  db = await sqlite.open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS playback_progress (
      profile_id TEXT,
      filepath TEXT,
      position REAL,
      duration REAL,
      last_watched INTEGER,
      PRIMARY KEY (profile_id, filepath)
    );

    CREATE TABLE IF NOT EXISTS watch_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      profile_id TEXT,
      filepath TEXT,
      watched_at INTEGER,
      position REAL
    );

    CREATE TABLE IF NOT EXISTS pinned_folders (
      profile_id TEXT,
      path TEXT,
      title TEXT,
      thumbnail TEXT,
      PRIMARY KEY (profile_id, path)
    );

    CREATE TABLE IF NOT EXISTS folder_thumbnails (
      profile_id TEXT,
      path TEXT,
      thumbnail TEXT,
      PRIMARY KEY (profile_id, path)
    );
  `);

  // Deduplicate watch_history to keep only the latest entry per file per profile
  try {
    await db.exec(`
      DELETE FROM watch_history 
      WHERE id NOT IN (
        SELECT MAX(id) 
        FROM watch_history 
        GROUP BY profile_id, filepath
      );
    `);
  } catch (err) {
    console.error("Failed to deduplicate watch history:", err);
  }

  try {
    await db.exec(`ALTER TABLE pinned_folders ADD COLUMN thumbnail TEXT;`);
    console.log("Added thumbnail column to pinned_folders.");
  } catch (err) {
    // Ignore error if column already exists
  }

  console.log("Database initialized and tables verified.");
  return db;
}

function getDb() {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase first.");
  }
  return db;
}

module.exports = {
  initDatabase,
  getDb,
};
