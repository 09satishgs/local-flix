const { getDb } = require("../config/db");

async function getPins(profileId) {
  const db = getDb();
  return db.all(
    "SELECT path, title, thumbnail FROM pinned_folders WHERE profile_id = ?",
    [profileId]
  );
}

async function pinFolder(profileId, folderPath, title) {
  const db = getDb();
  return db.run(
    "INSERT OR REPLACE INTO pinned_folders (profile_id, path, title, thumbnail) VALUES (?, ?, ?, NULL)",
    [profileId, folderPath, title]
  );
}

async function unpinFolder(profileId, folderPath) {
  const db = getDb();
  return db.run(
    "DELETE FROM pinned_folders WHERE profile_id = ? AND path = ?",
    [profileId, folderPath]
  );
}

async function isFolderPinned(profileId, folderPath) {
  const db = getDb();
  const record = await db.get(
    "SELECT 1 FROM pinned_folders WHERE profile_id = ? AND path = ?",
    [profileId, folderPath]
  );
  return !!record;
}

module.exports = {
  getPins,
  pinFolder,
  unpinFolder,
  isFolderPinned,
};
