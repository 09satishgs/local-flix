const path = require("path");
const fs = require("fs");
const os = require("os");
const { spawn, execFile } = require("child_process");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;

function isValidAudioTrack(track) {
  return track !== undefined && track !== null && track !== "" && track !== "null" && track !== "undefined";
}

async function getVideoMetadata(videoPath, profileId, allowedPaths) {
  // Sibling playlist scanning
  const parentDir = path.dirname(videoPath);
  let playlist = [];
  try {
    const files = fs.readdirSync(parentDir);
    playlist = files
      .map(file => path.join(parentDir, file))
      .filter(file => {
        let stats;
        try {
          stats = fs.statSync(file);
        } catch (e) {
          return false;
        }
        if (stats.isDirectory()) return false;
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.mkv', '.ts', '.m4v', '.mov', '.avi'].includes(ext);
      });
    playlist.sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } catch (err) {
    console.error("Failed to read playlist:", err);
  }

  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      ["-v", "error", "-show_format", "-show_streams", "-of", "json", videoPath],
      (err, stdout, stderr) => {
        if (err) {
          console.error("ffprobe error:", err);
          return reject(new Error("Failed to read video metadata"));
        }

        try {
          const metadata = JSON.parse(stdout);
          const streams = metadata.streams || [];

          const subtitles = streams
            .filter((s) => s.codec_type === "subtitle" && ["subrip", "ass", "ssa", "mov_text", "webvtt"].includes(s.codec_name))
            .map((s, idx) => ({
              index: s.index,
              trackIndex: idx,
              language: s.tags?.language || "Unknown",
              title: s.tags?.title || `Track ${idx + 1} (${s.codec_name})`,
              codec: s.codec_name,
            }));

          const audioTracks = streams
            .filter((s) => s.codec_type === "audio")
            .map((s, idx) => ({
              index: s.index,
              trackIndex: s.index - streams.findIndex((str) => str.codec_type === "audio"),
              language: s.tags?.language || "Unknown",
              title: s.tags?.title || `Audio ${idx + 1} (${s.codec_name})`,
              codec: s.codec_name,
            }));

          resolve({
            duration: parseFloat(metadata.format?.duration || 0),
            subtitles,
            audioTracks,
            playlist
          });
        } catch (e) {
          reject(new Error("Error parsing metadata"));
        }
      }
    );
  });
}

function extractSubtitles(videoPath, trackIndex, startOffset) {
  const args = [];
  if (startOffset) {
    args.push("-ss", startOffset);
  }
  args.push(
    "-i", videoPath,
    "-map", `0:${trackIndex}`,
    "-f", "webvtt",
    "pipe:1"
  );

  return spawn(ffmpegPath, args);
}

function streamVideo(videoPath, startParam, audioTrack, req, res) {
  const isMkvOrTs = videoPath.toLowerCase().endsWith('.mkv') || videoPath.toLowerCase().endsWith('.ts');

  // Direct MP4 range streaming if not MKV/TS and no audio track override
  if (!isMkvOrTs && !isValidAudioTrack(audioTrack)) {
    let stat;
    try {
      stat = fs.statSync(videoPath);
    } catch (e) {
      return res.status(404).json({ error: "Video not found" });
    }
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });
      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(206, head);
      file.pipe(res);
      file.on("error", (err) => {
        if (err && !res.headersSent) {
          res.status(500).end();
        }
      });
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
    return;
  }

  // Remux (or seek) on-the-fly using FFmpeg!
  res.writeHead(200, {
    "Content-Type": "video/mp4",
    Connection: "keep-alive",
    "Transfer-Encoding": "chunked",
  });

  const args = [];
  if (startParam) {
    const startSecs = parseFloat(startParam);
    if (!isNaN(startSecs) && startSecs > 0) {
      args.push("-ss", startSecs.toString());
    }
  }

  args.push(
    "-fflags", "+genpts",
    "-analyzeduration", "0",
    "-probesize", "32",
    "-i", videoPath
  );

  args.push("-c:v", "copy");
  args.push("-c:a", "aac");

  if (isValidAudioTrack(audioTrack)) {
    args.push("-map", "0:v:0", "-map", `0:${audioTrack}`);
  }

  args.push(
    "-f", "mp4",
    "-movflags", "frag_keyframe+empty_moov+default_base_moof",
    "-avoid_negative_ts", "make_zero",
    "-async", "1",
    "pipe:1"
  );

  const ffmpeg = spawn(ffmpegPath, args);
  ffmpeg.stdout.pipe(res);

  ffmpeg.stderr.on("data", (data) => {
    // Suppress verbose logs
  });

  req.on("close", () => {
    ffmpeg.kill();
  });
}

const activeJobs = new Map();

async function waitForFile(filePath, timeoutMs = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(filePath)) {
      return true;
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  return false;
}

function cleanJob(jobId) {
  const job = activeJobs.get(jobId);
  if (job) {
    try {
      job.ffmpeg.kill();
      fs.rmSync(job.tempDir, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
    activeJobs.delete(jobId);
  }
}

function cleanAllJobs() {
  for (const jobId of activeJobs.keys()) {
    cleanJob(jobId);
  }
}

process.on("exit", cleanAllJobs);
process.on("SIGINT", () => {
  cleanAllJobs();
  process.exit(0);
});
process.on("SIGTERM", () => {
  cleanAllJobs();
  process.exit(0);
});

function generateVodManifest(duration, targetDuration = 5) {
  let m3u8 = `#EXTM3U\n#EXT-X-VERSION:3\n#EXT-X-TARGETDURATION:${targetDuration}\n#EXT-X-MEDIA-SEQUENCE:0\n#EXT-X-PLAYLIST-TYPE:VOD\n`;
  const segmentCount = Math.ceil(duration / targetDuration);
  for (let i = 0; i < segmentCount; i++) {
    const isLast = i === segmentCount - 1;
    const segmentLength = isLast ? (duration % targetDuration === 0 ? targetDuration : duration % targetDuration) : targetDuration;
    m3u8 += `#EXTINF:${segmentLength.toFixed(6)},\nsegment_${i}.ts\n`;
  }
  m3u8 += "#EXT-X-ENDLIST\n";
  return m3u8;
}

async function getHlsPlaylist(videoPath, audioTrack, profileId, profileToken, startTime) {
  const jobId = `${videoPath}#${audioTrack || "default"}`;
  const requestStartTime = parseFloat(startTime || 0);

  // Terminate and delete other streams to conserve CPU and NVMe storage
  for (const [id] of activeJobs.entries()) {
    if (id !== jobId) {
      cleanJob(id);
    }
  }

  let job = activeJobs.get(jobId);
  if (job && Math.abs(job.startTime - requestStartTime) > 5) {
    cleanJob(jobId);
    job = null;
  }

  if (!job) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "localflix-hls-"));
    const playlistPath = path.join(tempDir, "index.m3u8");
    const segmentFilename = path.join(tempDir, "segment_%d.ts");

    // Retrieve video duration using ffprobe metadata call
    let duration = 0;
    try {
      const meta = await getVideoMetadata(videoPath, profileId, []);
      duration = meta.duration;
    } catch (e) {
      console.error("Failed to read video metadata for manifest", e);
    }

    // Write full static VOD manifest immediately so Hls.js knows correct playhead timeline
    const manifestContent = generateVodManifest(duration || 100);
    fs.writeFileSync(playlistPath, manifestContent, "utf8");

    const startSecs = parseFloat(startTime || 0);
    const args = [];
    if (!isNaN(startSecs) && startSecs > 0) {
      args.push("-ss", startSecs.toString());
    }
    args.push("-i", videoPath);

    if (isValidAudioTrack(audioTrack)) {
      args.push("-map", "0:v:0", "-map", `0:${audioTrack}`);
    }

    const startSegment = Math.floor(startSecs / 5);

    args.push(
      "-c:v", "copy",
      "-c:a", "aac",
      "-sn",
      "-f", "hls",
      "-hls_time", "5",
      "-hls_list_size", "0",
      "-start_number", startSegment.toString(),
      "-hls_segment_filename", segmentFilename,
      path.join(tempDir, "stream.m3u8")
    );

    const ffmpeg = spawn(ffmpegPath, args);
    let stderrLog = "";
    ffmpeg.stderr.on("data", (data) => {
      stderrLog += data.toString();
    });

    job = {
      tempDir,
      playlistPath,
      ffmpeg,
      createdAt: Date.now(),
      startTime: startSecs,
      startSegment,
      audioTrack,
      videoPath,
      getStderr: () => stderrLog
    };
    activeJobs.set(jobId, job);
  }

  let content = fs.readFileSync(job.playlistPath, "utf8");
  // Replace segment filenames with custom segment streaming route URLs
  content = content.replace(/segment_(\d+)\.ts/g, (match) => {
    const query = new URLSearchParams({
      jobId,
      name: match,
      profileId: profileId || "",
      profileToken: profileToken || "",
    }).toString();
    return `/api/video/hls/file?${query}`;
  });

  return content;
}

async function serveHlsFile(jobId, name, res) {
  const job = activeJobs.get(jobId);
  if (!job) {
    return res.status(404).json({ error: "Active stream job not found" });
  }

  const match = name.match(/segment_(\d+)\.ts/);
  if (match) {
    const requestedSegmentIndex = parseInt(match[1], 10);
    const targetTime = requestedSegmentIndex * 5;

    // Scan files on disk to find maximum segment number
    let maxSegmentOnDisk = job.startSegment;
    try {
      const files = fs.readdirSync(job.tempDir);
      for (const f of files) {
        const m = f.match(/segment_(\d+)\.ts/);
        if (m) {
          const idx = parseInt(m[1], 10);
          if (idx > maxSegmentOnDisk) {
            maxSegmentOnDisk = idx;
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const isAhead = requestedSegmentIndex > maxSegmentOnDisk + 5;
    const isBehind = requestedSegmentIndex < job.startSegment;

    if (isAhead || isBehind) {
      console.log(`Seek detected! Requested segment ${requestedSegmentIndex}. Max segment on disk: ${maxSegmentOnDisk}. Restarting FFmpeg from ${targetTime}s...`);

      // Kill the existing FFmpeg job
      try {
        job.ffmpeg.kill();
      } catch (e) {}

      // Spawn a new FFmpeg process starting at targetTime
      const segmentFilename = path.join(job.tempDir, "segment_%d.ts");
      const args = [];
      if (targetTime > 0) {
        args.push("-ss", targetTime.toString());
      }
      args.push("-i", job.videoPath);

      if (isValidAudioTrack(job.audioTrack)) {
        args.push("-map", "0:v:0", "-map", `0:${job.audioTrack}`);
      }

      args.push(
        "-c:v", "copy",
        "-c:a", "aac",
        "-sn",
        "-f", "hls",
        "-hls_time", "5",
        "-hls_list_size", "0",
        "-start_number", requestedSegmentIndex.toString(),
        "-hls_segment_filename", segmentFilename,
        path.join(job.tempDir, "stream.m3u8")
      );

      const ffmpeg = spawn(ffmpegPath, args);
      let stderrLog = "";
      ffmpeg.stderr.on("data", (data) => {
        stderrLog += data.toString();
      });

      job.ffmpeg = ffmpeg;
      job.startSegment = requestedSegmentIndex;
      job.startTime = targetTime;
      job.getStderr = () => stderrLog;
    }
  }

  const filePath = path.join(job.tempDir, name);
  const exists = await waitForFile(filePath, 8000);
  if (!exists) {
    return res.status(404).json({ error: `Segment file not found: ${name}` });
  }

  res.sendFile(filePath);
}

module.exports = {
  getVideoMetadata,
  extractSubtitles,
  streamVideo,
  getHlsPlaylist,
  serveHlsFile,
  cleanJob,
};
