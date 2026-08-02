const playbackService = require("../services/playbackService");
const { isPathAllowed } = require("../config/security");

async function getContinueWatching(req, res) {
  try {
    const list = await playbackService.getContinueWatching(req.profile.id);
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: "Failed to load continue watching list" });
  }
}

async function getWatchHistory(req, res) {
  try {
    const history = await playbackService.getHistory(req.profile.id);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to load history" });
  }
}

async function updateProgress(req, res) {
  const { filepath, position, duration } = req.body;
  if (!filepath || position === undefined || !duration) {
    return res.status(400).json({ error: "Missing parameters" });
  }
  if (!isPathAllowed(filepath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await playbackService.saveProgress(filepath, position, duration, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to save progress" });
  }
}

async function markFinished(req, res) {
  const { filepath } = req.body;
  if (!filepath) {
    return res.status(400).json({ error: "Filepath required" });
  }
  if (!isPathAllowed(filepath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    await playbackService.markFinished(filepath, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to clear progress" });
  }
}

async function deleteProgress(req, res) {
  const { filepath } = req.body;
  if (!filepath) {
    return res.status(400).json({ error: "Filepath required" });
  }
  try {
    await playbackService.removeProgress(filepath, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete progress" });
  }
}

async function deleteHistoryItem(req, res) {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: "History ID required" });
  }
  try {
    await playbackService.removeHistoryItem(parseInt(id, 10), req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete history item" });
  }
}

module.exports = {
  getContinueWatching,
  getWatchHistory,
  updateProgress,
  markFinished,
  deleteProgress,
  deleteHistoryItem,
};
