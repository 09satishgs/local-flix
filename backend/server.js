const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { initDatabase } = require("./config/db");
const { verifyProfile } = require("./config/security");

// Load Controllers
const profileController = require("./controllers/profileController");
const explorerController = require("./controllers/explorerController");
const videoController = require("./controllers/videoController");
const playbackController = require("./controllers/playbackController");
const imageSearchController = require("./controllers/imageSearchController");

const app = express();
app.use(cors());
app.use(express.json());

// Profile routes
app.get("/api/profiles", profileController.getProfiles);
app.post("/api/profiles/login", profileController.loginProfile);
app.get("/api/profiles/me", verifyProfile, profileController.getMe);

// Explorer routes
app.get(
  "/api/explorer",
  verifyProfile,
  explorerController.getDirectoryContents,
);
app.get("/api/explorer/pins", verifyProfile, explorerController.getPins);
app.post("/api/explorer/pin", verifyProfile, explorerController.pinFolder);
app.post("/api/explorer/unpin", verifyProfile, explorerController.unpinFolder);
app.post(
  "/api/explorer/thumbnail",
  verifyProfile,
  explorerController.setFolderThumbnail,
);
app.delete(
  "/api/explorer/thumbnail",
  verifyProfile,
  explorerController.deleteFolderThumbnail,
);

// Video streaming routes
app.get("/api/video/metadata", verifyProfile, videoController.getVideoMetadata);
app.get(
  "/api/video/subtitles",
  verifyProfile,
  videoController.extractSubtitles,
);
app.get("/api/video", verifyProfile, videoController.streamVideo);
app.get(
  "/api/video/hls/index.m3u8",
  verifyProfile,
  videoController.getHlsPlaylist,
);
app.get("/api/video/hls/file", verifyProfile, videoController.serveHlsFile);
app.post("/api/video/hls/stop", verifyProfile, videoController.stopHlsStream);

// Playback progress routes
app.get(
  "/api/playback/continue",
  verifyProfile,
  playbackController.getContinueWatching,
);
app.get(
  "/api/playback/history",
  verifyProfile,
  playbackController.getWatchHistory,
);
app.post(
  "/api/playback/progress",
  verifyProfile,
  playbackController.updateProgress,
);
app.post(
  "/api/playback/finished",
  verifyProfile,
  playbackController.markFinished,
);
app.delete(
  "/api/playback/progress",
  verifyProfile,
  playbackController.deleteProgress,
);
app.delete(
  "/api/playback/history/:id",
  verifyProfile,
  playbackController.deleteHistoryItem,
);

// Image search scraper route
app.get(
  "/api/search-images",
  verifyProfile,
  imageSearchController.searchImages,
);

// Serve frontend assets in production
const frontendDistPath = path.join(__dirname, "dist");
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(frontendDistPath, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("Server running. Frontend not built. Run npm run build.");
  });
}

// Start Server
const PORT = process.env.PORT || 4000;
initDatabase()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Accessible on local network via http://<YOUR-IP>:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err);
  });
