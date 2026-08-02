const explorerService = require("../services/explorerService");
const { isPathAllowed } = require("../config/security");

async function getDirectoryContents(req, res) {
  const queryPath = req.query.path;
  if (queryPath && !isPathAllowed(queryPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access to this directory is restricted" });
  }
  try {
    const result = await explorerService.readDirectory(
      queryPath, 
      req.profile.id, 
      req.profile.allowedPaths
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Failed to read directory" });
  }
}

async function getPins(req, res) {
  try {
    const pins = await explorerService.getPinnedFolders(req.profile.id);
    res.json(pins);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pinned folders" });
  }
}

async function pinFolder(req, res) {
  const { folderPath, title, thumbnail } = req.body;
  if (!folderPath || !isPathAllowed(folderPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    await explorerService.pinFolder(folderPath, title, thumbnail, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to pin folder" });
  }
}

async function unpinFolder(req, res) {
  const { folderPath } = req.body;
  try {
    await explorerService.unpinFolder(folderPath, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to unpin folder" });
  }
}

module.exports = {
  getDirectoryContents,
  getPins,
  pinFolder,
  unpinFolder,
};
