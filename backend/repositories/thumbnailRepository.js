const { getDb } = require("../config/db");

async function getThumbnails(profileId) {
  const db = getDb();
  return db.all(
    "SELECT path, thumbnail FROM folder_thumbnails WHERE profile_id = ?",
    [profileId]
  );
}

async function setThumbnail(profileId, folderPath, thumbnail) {
  const db = getDb();
  return db.run(
    "INSERT OR REPLACE INTO folder_thumbnails (profile_id, path, thumbnail) VALUES (?, ?, ?)",
    [profileId, folderPath, thumbnail]
  );
}

async function deleteThumbnail(profileId, folderPath) {
  const db = getDb();
  return db.run(
    "DELETE FROM folder_thumbnails WHERE profile_id = ? AND path = ?",
    [profileId, folderPath]
  );
}

module.exports = {
  getThumbnails,
  setThumbnail,
  deleteThumbnail,
};
