const { getDb } = require("../config/db");

async function getProgress(profileId, filepath) {
  const db = getDb();
  return db.get(
    "SELECT position, duration FROM playback_progress WHERE profile_id = ? AND filepath = ?",
    [profileId, filepath]
  );
}

async function upsertProgress(profileId, filepath, position, duration, lastWatched) {
  const db = getDb();
  return db.run(
    `INSERT OR REPLACE INTO playback_progress (profile_id, filepath, position, duration, last_watched)
     VALUES (?, ?, ?, ?, ?)`,
    [profileId, filepath, position, duration, lastWatched]
  );
}

async function deleteProgress(profileId, filepath) {
  const db = getDb();
  return db.run(
    "DELETE FROM playback_progress WHERE profile_id = ? AND filepath = ?",
    [profileId, filepath]
  );
}

async function getContinueWatchingList(profileId) {
  const db = getDb();
  return db.all(
    `SELECT filepath, position, duration, last_watched 
     FROM playback_progress 
     WHERE profile_id = ? AND position > 5 AND position < (duration * 0.95)
     ORDER BY last_watched DESC 
     LIMIT 10`,
    [profileId]
  );
}

module.exports = {
  getProgress,
  upsertProgress,
  deleteProgress,
  getContinueWatchingList,
};
