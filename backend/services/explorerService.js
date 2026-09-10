const path = require("path");
const fs = require("fs");
const pinRepository = require("../repositories/pinRepository");
const progressRepository = require("../repositories/progressRepository");
const thumbnailRepository = require("../repositories/thumbnailRepository");
const historyRepository = require("../repositories/historyRepository");
const { isVideoFile } = require("../utils/helpers");

async function getThumbnailsMap(profileId) {
  return thumbnailRepository.getThumbnails(profileId);
}

function matchThumbnail(itemPath, pins) {
  let bestMatch = null;
  const resolvedItem = path.resolve(itemPath);
  for (const pin of pins) {
    if (!pin.thumbnail) continue;
    const resolvedPin = path.resolve(pin.path);
    if (resolvedItem === resolvedPin) {
      if (!bestMatch || pin.path.length > bestMatch.path.length) {
        bestMatch = pin;
      }
    } else {
      const relative = path.relative(resolvedPin, resolvedItem);
      const isSubpath = relative && !relative.startsWith("..") && !path.isAbsolute(relative);
      if (isSubpath) {
        if (!bestMatch || pin.path.length > bestMatch.path.length) {
          bestMatch = pin;
        }
      }
    }
  }
  return bestMatch ? bestMatch.thumbnail : null;
}

function isFolderEmpty(folderPath) {
  try {
    const subItems = fs.readdirSync(folderPath);
    const visibleSubItems = subItems.filter(
      (item) => item.toLowerCase() !== "temp" && !item.startsWith(".")
    );
    return visibleSubItems.length === 0;
  } catch (e) {
    return true; // Treat unreadable / inaccessible folders as empty
  }
}

async function readDirectory(queryPath, profileId, allowedPaths) {
  const pins = await getThumbnailsMap(profileId);

  // If no path is requested, send the root allowed paths
  if (!queryPath) {
    const rootPaths = (
      await Promise.all(
        allowedPaths.map(async (p) => {
          if (isFolderEmpty(p)) return null;
          const isPinned = await pinRepository.isFolderPinned(profileId, p);
          return {
            name: path.basename(p) || p,
            path: p,
            isDirectory: true,
            isPinned,
            isRoot: true,
            thumbnail: matchThumbnail(p, pins),
          };
        })
      )
    ).filter(Boolean);
    return { currentPath: "", items: rootPaths };
  }

  const items = fs.readdirSync(queryPath);
  const result = [];

  for (const item of items) {
    const fullPath = path.join(queryPath, item);
    let stats;
    try {
      stats = fs.statSync(fullPath);
    } catch (e) {
      continue; // Skip items that cannot be read
    }

    const isDirectory = stats.isDirectory();
    const isVideo = isVideoFile(fullPath);

    // Hide temp staging directory and hidden directories starting with dot
    if (isDirectory && (item.toLowerCase() === "temp" || item.startsWith("."))) {
      continue;
    }

    // Hide empty folders (no files or folders within them)
    if (isDirectory && isFolderEmpty(fullPath)) {
      continue;
    }

    // Only include directories or video files
    if (isDirectory || isVideo) {
      let progress = null;
      let isPinned = false;

      if (isDirectory) {
        isPinned = await pinRepository.isFolderPinned(profileId, fullPath);
      } else {
        const progressRecord = await progressRepository.getProgress(profileId, fullPath);
        if (progressRecord) {
          progress = progressRecord;
        }
      }

      result.push({
        name: item,
        path: fullPath,
        isDirectory,
        size: stats.size,
        progress,
        isPinned,
        thumbnail: matchThumbnail(fullPath, pins),
      });
    }
  }

  // Sort: folders first, then files
  result.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    return a.name.localeCompare(b.name);
  });

  return { currentPath: queryPath, items: result };
}

async function getAvailableFolders(profileId, allowedPaths, queryPath) {
  if (!queryPath) {
    const rootFolders = allowedPaths.map((p) => ({
      name: path.basename(p) || p,
      path: p,
    }));
    return { currentPath: "", folders: rootFolders };
  }

  if (!fs.existsSync(queryPath)) {
    throw new Error("Folder does not exist");
  }

  const items = fs.readdirSync(queryPath);
  const folders = [];

  for (const item of items) {
    if (item.toLowerCase() === "temp" || item.startsWith(".")) continue;
    const fullPath = path.join(queryPath, item);
    try {
      const stats = fs.statSync(fullPath);
      if (stats.isDirectory()) {
        folders.push({
          name: item,
          path: fullPath,
        });
      }
    } catch (e) {
      // Ignore inaccessible items
    }
  }

  folders.sort((a, b) => a.name.localeCompare(b.name));
  return { currentPath: queryPath, folders };
}

async function deleteItem(itemPath, profileId) {
  if (!fs.existsSync(itemPath)) {
    throw new Error("File or folder does not exist");
  }

  const stats = fs.statSync(itemPath);
  if (stats.isDirectory()) {
    fs.rmSync(itemPath, { recursive: true, force: true });
  } else {
    fs.unlinkSync(itemPath);
  }

  // Cleanup associated database records
  await Promise.all([
    progressRepository.deleteProgressByPath(itemPath),
    historyRepository.deleteHistoryByPath(itemPath),
    pinRepository.deletePinByPath(itemPath),
    thumbnailRepository.deleteThumbnailByPath(itemPath),
  ]);

  return { success: true };
}

async function renameItem(itemPath, newName, profileId) {
  if (!itemPath || !newName) {
    throw new Error("Invalid parameters");
  }

  const cleanName = newName.trim();
  if (!cleanName || cleanName === "." || cleanName === "..") {
    throw new Error("Invalid file name");
  }

  // Check for forbidden characters in Windows / cross-platform
  if (/[\\/:*?"<>|]/.test(cleanName)) {
    throw new Error('File name cannot contain any of the following characters: \\ / : * ? " < > |');
  }

  if (!fs.existsSync(itemPath)) {
    throw new Error("Item does not exist");
  }

  const targetPath = path.join(path.dirname(itemPath), cleanName);
  if (path.resolve(itemPath) !== path.resolve(targetPath) && fs.existsSync(targetPath)) {
    throw new Error("An item with this name already exists");
  }

  fs.renameSync(itemPath, targetPath);

  // Update associated database records
  await Promise.all([
    progressRepository.updateFilePath(itemPath, targetPath),
    historyRepository.updateFilePath(itemPath, targetPath),
    pinRepository.updateFolderPath(itemPath, targetPath),
    thumbnailRepository.updateFolderPath(itemPath, targetPath),
  ]);

  return { success: true, newPath: targetPath, newName: cleanName };
}

async function moveItem(sourcePath, targetDirectory, profileId) {
  if (!sourcePath || !targetDirectory) {
    throw new Error("Invalid parameters");
  }

  if (!fs.existsSync(sourcePath)) {
    throw new Error("Source item does not exist");
  }

  if (!fs.existsSync(targetDirectory)) {
    throw new Error("Destination folder does not exist");
  }

  const targetStats = fs.statSync(targetDirectory);
  if (!targetStats.isDirectory()) {
    throw new Error("Destination must be a directory");
  }

  const fileName = path.basename(sourcePath);
  const destPath = path.join(targetDirectory, fileName);

  if (path.resolve(sourcePath) === path.resolve(destPath)) {
    return { success: true, newPath: destPath };
  }

  if (fs.existsSync(destPath)) {
    throw new Error(`An item named "${fileName}" already exists in the destination folder`);
  }

  const sourceStats = fs.statSync(sourcePath);

  try {
    fs.renameSync(sourcePath, destPath);
  } catch (err) {
    if (err.code === "EXDEV") {
      // Cross-device / cross-drive move on Windows
      if (sourceStats.isDirectory()) {
        fs.cpSync(sourcePath, destPath, { recursive: true });
        fs.rmSync(sourcePath, { recursive: true, force: true });
      } else {
        fs.copyFileSync(sourcePath, destPath);
        fs.unlinkSync(sourcePath);
      }
    } else {
      throw err;
    }
  }

  // Update associated database records
  await Promise.all([
    progressRepository.updateFilePath(sourcePath, destPath),
    historyRepository.updateFilePath(sourcePath, destPath),
    pinRepository.updateFolderPath(sourcePath, destPath),
    thumbnailRepository.updateFolderPath(sourcePath, destPath),
  ]);

  return { success: true, newPath: destPath };
}

async function deleteItems(itemPaths, profileId) {
  if (!Array.isArray(itemPaths) || itemPaths.length === 0) {
    throw new Error("No items specified for deletion");
  }
  const results = [];
  for (const itemPath of itemPaths) {
    try {
      await deleteItem(itemPath, profileId);
      results.push({ path: itemPath, success: true });
    } catch (err) {
      results.push({ path: itemPath, success: false, error: err.message });
    }
  }
  return { success: true, count: results.filter(r => r.success).length, results };
}

async function moveItems(sourcePaths, targetDirectory, profileId) {
  if (!Array.isArray(sourcePaths) || sourcePaths.length === 0 || !targetDirectory) {
    throw new Error("Invalid parameters for bulk move");
  }
  const results = [];
  for (const sourcePath of sourcePaths) {
    try {
      const res = await moveItem(sourcePath, targetDirectory, profileId);
      results.push({ sourcePath, newPath: res.newPath, success: true });
    } catch (err) {
      results.push({ sourcePath, success: false, error: err.message });
    }
  }
  return { success: true, count: results.filter(r => r.success).length, results };
}

async function pinFolder(folderPath, customTitle, profileId) {
  const title = customTitle || path.basename(folderPath) || folderPath;
  return pinRepository.pinFolder(profileId, folderPath, title);
}

async function unpinFolder(folderPath, profileId) {
  return pinRepository.unpinFolder(profileId, folderPath);
}

async function getPinnedFolders(profileId) {
  const pins = await pinRepository.getPins(profileId);
  const thumbnails = await getThumbnailsMap(profileId);
  return pins.map(pin => ({
    path: pin.path,
    title: pin.title,
    thumbnail: matchThumbnail(pin.path, thumbnails)
  }));
}

async function setFolderThumbnail(folderPath, thumbnail, profileId) {
  return thumbnailRepository.setThumbnail(profileId, folderPath, thumbnail);
}

async function deleteFolderThumbnail(folderPath, profileId) {
  return thumbnailRepository.deleteThumbnail(profileId, folderPath);
}

module.exports = {
  readDirectory,
  getAvailableFolders,
  deleteItem,
  deleteItems,
  renameItem,
  moveItem,
  moveItems,
  pinFolder,
  unpinFolder,
  getPinnedFolders,
  getThumbnailsMap,
  matchThumbnail,
  setFolderThumbnail,
  deleteFolderThumbnail,
};
