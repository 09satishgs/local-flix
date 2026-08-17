const path = require("path");
const videoService = require("../services/videoService");
const { isPathAllowed } = require("../config/security");
const { cleanWebVTT } = require("../utils/helpers");

async function getVideoMetadata(req, res) {
  const videoPath = req.query.path;
  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const meta = await videoService.getVideoMetadata(
      videoPath, 
      req.profile.id, 
      req.profile.allowedPaths
    );
    res.json(meta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function extractSubtitles(req, res) {
  const videoPath = req.query.path;
  const trackIndex = req.query.trackIndex;
  const startOffset = req.query.start;

  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }
  if (trackIndex === undefined) {
    return res.status(400).json({ error: "trackIndex required" });
  }

  const download = req.query.download;

  res.setHeader("Content-Type", "text/vtt; charset=utf-8");
  if (download === "true") {
    const filename = `${encodeURIComponent(path.basename(videoPath, path.extname(videoPath)))}.vtt`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  }

  const ffmpeg = videoService.extractSubtitles(videoPath, trackIndex, startOffset);
  
  let buffer = "";
  ffmpeg.stdout.on("data", (chunk) => {
    buffer += chunk.toString("utf8");
  });

  ffmpeg.stderr.on("data", (data) => {
    const log = data.toString();
    if (log.toLowerCase().includes("error")) {
      console.error(`Subtitles FFmpeg Log: ${log}`);
    }
  });

  ffmpeg.on("close", (code) => {
    if (code === 0 || buffer.length > 0) {
      const cleaned = cleanWebVTT(buffer);
      res.send(cleaned);
    } else {
      if (!res.headersSent) {
        res.status(500).end();
      }
    }
  });

  req.on("close", () => {
    ffmpeg.kill();
  });
}

function streamVideo(req, res) {
  const videoPath = req.query.path;
  const startParam = req.query.start;
  const audioTrack = req.query.audioTrack;

  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  videoService.streamVideo(videoPath, startParam, audioTrack, req, res);
}

async function getHlsPlaylist(req, res) {
  const videoPath = req.query.path;
  const audioTrack = req.query.audioTrack;
  const startTime = req.query.startTime;
  const subtitleTrack = req.query.subtitleTrack;
  const burnSubtitles = req.query.burnSubtitles;
  
  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const profileId = req.profile.id;
    const profileToken = req.headers['x-profile-token'] || req.query.profileToken || "";

    const playlist = await videoService.getHlsPlaylist(
      videoPath, 
      audioTrack, 
      profileId, 
      profileToken, 
      startTime,
      subtitleTrack,
      burnSubtitles
    );
    res.setHeader("Content-Type", "application/x-mpegURL");
    res.send(playlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function serveHlsFile(req, res) {
  const jobId = req.query.jobId;
  const name = req.query.name;
  if (!jobId || !name) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  videoService.serveHlsFile(jobId, name, res);
}

function stopHlsStream(req, res) {
  const videoPath = req.body.path;
  if (videoPath) {
    videoService.stopHlsStream(videoPath);
  }
  res.json({ success: true });
}

async function getThumbnailFrame(req, res) {
  const videoPath = req.query.path;
  const time = req.query.time;

  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const filePath = await videoService.getThumbnailFrame(videoPath, time);
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.sendFile(filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function startConversion(req, res) {
  const videoPath = req.body.path;
  const audioTrack = req.body.audioTrack;
  const subtitleTrack = req.body.subtitleTrack;

  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const result = await videoService.startConversion(
      videoPath,
      audioTrack,
      subtitleTrack,
      req.profile.allowedPaths
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getConversionStatus(req, res) {
  const status = videoService.getConversionStatus();
  res.json(status);
}

function stopConversion(req, res) {
  const videoPath = req.body.path;
  if (!videoPath) {
    return res.status(400).json({ error: "Path required" });
  }

  const stopped = videoService.stopConversion(videoPath);
  res.json({ success: stopped });
}

module.exports = {
  getVideoMetadata,
  extractSubtitles,
  streamVideo,
  getHlsPlaylist,
  serveHlsFile,
  stopHlsStream,
  getThumbnailFrame,
  startConversion,
  getConversionStatus,
  stopConversion,
};
