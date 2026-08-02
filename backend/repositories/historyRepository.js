const { getDb } = require("../config/db");

async function getWatchHistory(profileId) {
  const db = getDb();
  return db.all(
    `SELECT id, filepath, watched_at, position 
     FROM watch_history 
     WHERE profile_id = ? 
     ORDER BY watched_at DESC 
     LIMIT 50`,
    [profileId]
  );
}

async function upsertHistoryEntry(profileId, filepath, watchedAt, position) {
  const db = getDb();
  const existing = await db.get(
    "SELECT id FROM watch_history WHERE profile_id = ? AND filepath = ?",
    [profileId, filepath]
  );
  if (existing) {
    return db.run(
      `UPDATE watch_history 
       SET watched_at = ?, position = ? 
       WHERE id = ?`,
      [watchedAt, position, existing.id]
    );
  } else {
    return db.run(
      `INSERT INTO watch_history (profile_id, filepath, watched_at, position)
       VALUES (?, ?, ?, ?)`,
      [profileId, filepath, watchedAt, position]
    );
  }
}

async function getLastHistoryEntry(profileId, filepath) {
  const db = getDb();
  return db.get(
    `SELECT watched_at FROM watch_history 
     WHERE profile_id = ? AND filepath = ? 
     ORDER BY watched_at DESC LIMIT 1`,
    [profileId, filepath]
  );
}

async function deleteHistoryEntry(profileId, id) {
  const db = getDb();
  return db.run(
    "DELETE FROM watch_history WHERE profile_id = ? AND id = ?",
    [profileId, id]
  );
}

module.exports = {
  getWatchHistory,
  upsertHistoryEntry,
  getLastHistoryEntry,
  deleteHistoryEntry,
};
