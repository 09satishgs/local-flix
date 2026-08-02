const path = require("path");
const progressRepository = require("../repositories/progressRepository");
const historyRepository = require("../repositories/historyRepository");
const explorerService = require("./explorerService");

async function getContinueWatching(profileId) {
  const pins = await explorerService.getThumbnailsMap(profileId);
  const items = await progressRepository.getContinueWatchingList(profileId);

  return items.map((item) => ({
    name: path.basename(item.filepath),
    path: item.filepath,
    position: item.position,
    duration: item.duration,
    lastWatched: item.last_watched,
    thumbnail: explorerService.matchThumbnail(item.filepath, pins),
  }));
}

async function getHistory(profileId) {
  const pins = await explorerService.getThumbnailsMap(profileId);
  const items = await historyRepository.getWatchHistory(profileId);

  return items.map((item) => ({
    id: item.id,
    name: path.basename(item.filepath),
    path: item.filepath,
    watchedAt: item.watched_at,
    position: item.position,
    thumbnail: explorerService.matchThumbnail(item.filepath, pins),
  }));
}

async function saveProgress(filepath, position, duration, profileId) {
  const now = Date.now();
  await progressRepository.upsertProgress(profileId, filepath, position, duration, now);

  // Append or update history entry if new session or throttled tick
  const lastHistory = await historyRepository.getLastHistoryEntry(profileId, filepath);
  if (!lastHistory || now - lastHistory.watched_at > 60000) {
    await historyRepository.upsertHistoryEntry(profileId, filepath, now, position);
  }
}

async function markFinished(filepath, profileId) {
  return progressRepository.deleteProgress(profileId, filepath);
}

async function removeProgress(filepath, profileId) {
  return progressRepository.deleteProgress(profileId, filepath);
}

async function removeHistoryItem(id, profileId) {
  return historyRepository.deleteHistoryEntry(profileId, id);
}

module.exports = {
  getContinueWatching,
  getHistory,
  saveProgress,
  markFinished,
  removeProgress,
  removeHistoryItem,
};
