const path = require("path");
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

function cleanWebVTT(rawVtt) {
  if (!rawVtt) return "";
  
  const lines = rawVtt.split(/\r?\n/);
  const cleanCues = [];
  let currentCue = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if line is the WebVTT header
    if (line === "WEBVTT") {
      continue;
    }
    
    // Check if line is a timestamp indicator
    if (line.includes(" --> ")) {
      if (currentCue) {
        cleanCues.push(currentCue);
      }
      currentCue = {
        timestamps: line,
        textLines: []
      };
      continue;
    }
    
    // If it's a non-empty line and we have an active cue
    if (line && currentCue) {
      // Strip {...} ASS style blocks (e.g. {=1}, {\pos(x,y)}, etc.)
      let cleanedText = line.replace(/\{[^}]*\}/g, "").trim();
      
      // Strip ASS backslash formatting commands (e.g. \pos, \move, \an, \fade, etc.)
      cleanedText = cleanedText.replace(/\\(?:pos|move|an|fade|fad|t|clip|c|org|p|q|r|s|kf|ko|K|k|i|b|u|fn|fs|fe|fsp|scalex|scaley|spacing|blur|bord|shad|xbord|ysord|xshad|yshad|iclip|alpha|1a|2a|3a|4a|1c|2c|3c|4c)\([^)]*\)/g, "");
      cleanedText = cleanedText.replace(/\\([a-zA-Z]+[0-9]*)/g, ""); // strip generic backslash commands like \an5
      
      cleanedText = cleanedText.trim();
      if (cleanedText) {
        currentCue.textLines.push(cleanedText);
      }
    }
  }
  
  // Push the last cue if exists
  if (currentCue) {
    cleanCues.push(currentCue);
  }

  // Deduplicate and merge overlapping/identical timestamp cues
  const uniqueCues = [];
  const seenKeys = new Set();
  
  for (const cue of cleanCues) {
    const text = cue.textLines.join("\n").trim();
    if (!text) continue;
    
    if (text.length === 1) {
      uniqueCues.push({
        timestamps: cue.timestamps,
        textLines: [text]
      });
    } else {
      const key = `${cue.timestamps}|${text}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueCues.push({
          timestamps: cue.timestamps,
          textLines: [text]
        });
      }
    }
  }

  // Merge cues with identical timestamps
  const mergedCues = [];
  for (const cue of uniqueCues) {
    const last = mergedCues[mergedCues.length - 1];
    const text = cue.textLines[0];
    
    if (last && last.timestamps === cue.timestamps) {
      if (text.length === 1 || !last.textLines.includes(text)) {
        last.textLines.push(text);
      }
    } else {
      mergedCues.push({
        timestamps: cue.timestamps,
        textLines: [text]
      });
    }
  }

  const removeRepetitions = (str) => {
    if (!str) return "";
    const trimmed = str.trim();
    const parts = trimmed.split(/\s+/);
    if (parts.length <= 1) return trimmed;
    
    for (let len = 1; len <= Math.floor(parts.length / 2); len++) {
      if (parts.length % len === 0) {
        const pattern = parts.slice(0, len).join(" ");
        let isRepeating = true;
        for (let i = len; i < parts.length; i += len) {
          const nextPattern = parts.slice(i, i + len).join(" ");
          if (nextPattern !== pattern) {
            isRepeating = false;
            break;
          }
        }
        if (isRepeating) {
          return pattern;
        }
      }
    }
    return trimmed;
  };

  // Format final cues and join single-characters smartly
  const finalCues = mergedCues.map(cue => {
    let text = "";
    if (cue.textLines.every(line => line.length === 1)) {
      // If all lines are single characters, join them smartly (insert space on lower -> upper transition)
      for (let i = 0; i < cue.textLines.length; i++) {
        const char = cue.textLines[i];
        if (i > 0) {
          const prevChar = cue.textLines[i - 1];
          const isPrevLower = prevChar >= "a" && prevChar <= "z";
          const isCurrUpper = char >= "A" && char <= "Z";
          if (isPrevLower && isCurrUpper) {
            text += " ";
          }
        }
        text += char;
      }
    } else {
      // Otherwise join with space or newlines
      text = cue.textLines.join(" ");
    }
    
    text = removeRepetitions(text);
    return `${cue.timestamps}\n${text}`;
  });

  return "WEBVTT\n\n" + finalCues.join("\n\n");
}

module.exports = {
  getVideoMetadata,
  extractSubtitles,
  streamVideo,
  getHlsPlaylist,
  serveHlsFile,
  stopHlsStream,
};
