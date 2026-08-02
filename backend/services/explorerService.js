const path = require("path");
const fs = require("fs");
const pinRepository = require("../repositories/pinRepository");
const progressRepository = require("../repositories/progressRepository");

async function getThumbnailsMap(profileId) {
  return pinRepository.getPins(profileId);
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

async function readDirectory(queryPath, profileId, allowedPaths) {
  const pins = await getThumbnailsMap(profileId);

  // If no path is requested, send the root allowed paths
  if (!queryPath) {
    const rootPaths = await Promise.all(
      allowedPaths.map(async (p) => {
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
    );
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
    const ext = path.extname(item).toLowerCase();
    const isVideo = [".mp4", ".mkv", ".ts", ".m4v", ".mov", ".avi"].includes(ext);

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

async function pinFolder(folderPath, customTitle, thumbnail, profileId) {
  const title = customTitle || path.basename(folderPath) || folderPath;
  return pinRepository.pinFolder(profileId, folderPath, title, thumbnail);
}

async function unpinFolder(folderPath, profileId) {
  return pinRepository.unpinFolder(profileId, folderPath);
}

async function getPinnedFolders(profileId) {
  return pinRepository.getPins(profileId);
}

module.exports = {
  readDirectory,
  pinFolder,
  unpinFolder,
  getPinnedFolders,
  getThumbnailsMap,
  matchThumbnail,
};
