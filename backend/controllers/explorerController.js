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

async function getFolders(req, res) {
  const queryPath = req.query.path;
  if (queryPath && !isPathAllowed(queryPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access to this directory is restricted" });
  }
  try {
    const result = await explorerService.getAvailableFolders(
      req.profile.id,
      req.profile.allowedPaths,
      queryPath
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to list folders" });
  }
}

async function deleteItem(req, res) {
  const { path: itemPath, paths: itemPaths } = req.body;

  if (Array.isArray(itemPaths) && itemPaths.length > 0) {
    for (const p of itemPaths) {
      if (!p || !isPathAllowed(p, req.profile.allowedPaths)) {
        return res.status(403).json({ error: "One or more paths are restricted or invalid" });
      }
    }
    try {
      const result = await explorerService.deleteItems(itemPaths, req.profile.id);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message || "Failed to delete items" });
    }
  }

  if (!itemPath || !isPathAllowed(itemPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    const result = await explorerService.deleteItem(itemPath, req.profile.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to delete item" });
  }
}

async function renameItem(req, res) {
  const { path: itemPath, newName } = req.body;
  if (!itemPath || !newName || !isPathAllowed(itemPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    const result = await explorerService.renameItem(itemPath, newName, req.profile.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to rename item" });
  }
}

async function moveItem(req, res) {
  const { sourcePath, sourcePaths, targetDirectory } = req.body;
  if (!targetDirectory || !isPathAllowed(targetDirectory, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted destination folder" });
  }

  if (Array.isArray(sourcePaths) && sourcePaths.length > 0) {
    for (const p of sourcePaths) {
      if (!p || !isPathAllowed(p, req.profile.allowedPaths)) {
        return res.status(403).json({ error: "One or more source paths are restricted or invalid" });
      }
    }
    try {
      const result = await explorerService.moveItems(sourcePaths, targetDirectory, req.profile.id);
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ error: err.message || "Failed to move items" });
    }
  }

  if (!sourcePath || !isPathAllowed(sourcePath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted source path" });
  }

  try {
    const result = await explorerService.moveItem(sourcePath, targetDirectory, req.profile.id);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to move item" });
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
  const { folderPath, title } = req.body;
  if (!folderPath || !isPathAllowed(folderPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    await explorerService.pinFolder(folderPath, title, req.profile.id);
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

async function setFolderThumbnail(req, res) {
  const { folderPath, thumbnail } = req.body;
  if (!folderPath || !thumbnail || !isPathAllowed(folderPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    await explorerService.setFolderThumbnail(folderPath, thumbnail, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to set thumbnail" });
  }
}

async function deleteFolderThumbnail(req, res) {
  const queryPath = req.query.path;
  if (!queryPath || !isPathAllowed(queryPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Invalid or restricted path" });
  }

  try {
    await explorerService.deleteFolderThumbnail(queryPath, req.profile.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete thumbnail" });
  }
}

module.exports = {
  getDirectoryContents,
  getFolders,
  deleteItem,
  renameItem,
  moveItem,
  getPins,
  pinFolder,
  unpinFolder,
  setFolderThumbnail,
  deleteFolderThumbnail,
};
