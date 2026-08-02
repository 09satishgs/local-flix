const videoService = require("../services/videoService");
const { isPathAllowed } = require("../config/security");

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

  res.setHeader("Content-Type", "text/vtt; charset=utf-8");
  const ffmpeg = videoService.extractSubtitles(videoPath, trackIndex, startOffset);
  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    const log = data.toString();
    if (log.toLowerCase().includes("error")) {
      console.error(`Subtitles FFmpeg Log: ${log}`);
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
  
  if (!videoPath || !isPathAllowed(videoPath, req.profile.allowedPaths)) {
    return res.status(403).json({ error: "Access denied" });
  }

  try {
    const profileId = req.profile.id;
    const profileToken = req.headers['x-profile-token'] || req.query.profileToken || "";

    const playlist = await videoService.getHlsPlaylist(videoPath, audioTrack, profileId, profileToken, startTime);
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
  const audioTrack = req.body.audioTrack;
  if (videoPath) {
    const jobId = `${videoPath}#${audioTrack || "default"}`;
    videoService.cleanJob(jobId);
  }
  res.json({ success: true });
}

module.exports = {
  getVideoMetadata,
  extractSubtitles,
  streamVideo,
  getHlsPlaylist,
  serveHlsFile,
  stopHlsStream,
};
