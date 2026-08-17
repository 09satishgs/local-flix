const path = require("path");
const fs = require("fs");
const os = require("os");
const crypto = require("crypto");
const { spawn, execFile } = require("child_process");
const ffmpegPath = "ffmpeg";
const ffprobePath = "ffprobe";
const { isValidAudioTrack, isVideoFile } = require("../utils/helpers");

async function getVideoMetadata(videoPath, profileId, allowedPaths) {
  // Sibling playlist scanning
  const parentDir = path.dirname(videoPath);
  let playlist = [];
  try {
    const files = fs.readdirSync(parentDir);
    playlist = files
      .map((file) => path.join(parentDir, file))
      .filter((file) => {
        let stats;
        try {
          stats = fs.statSync(file);
        } catch (e) {
          return false;
        }
        if (stats.isDirectory()) return false;
        return isVideoFile(file);
      });
    playlist.sort((a, b) =>
      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
    );
  } catch (err) {
    console.error("Failed to read playlist:", err);
  }

  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      [
        "-v",
        "error",
        "-show_format",
        "-show_streams",
        "-of",
        "json",
        videoPath,
      ],
      (err, stdout, stderr) => {
        if (err) {
          console.error("ffprobe error:", err);
          return reject(new Error("Failed to read video metadata"));
        }

        try {
          const metadata = JSON.parse(stdout);
          const streams = metadata.streams || [];

          const subtitles = streams
            .filter(
              (s) =>
                s.codec_type === "subtitle" &&
                [
                  "subrip",
                  "ass",
                  "ssa",
                  "mov_text",
                  "webvtt",
                  "hdmv_pgs_subtitle",
                  "dvd_subtitle",
                ].includes(s.codec_name),
            )
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
              trackIndex:
                s.index -
                streams.findIndex((str) => str.codec_type === "audio"),
              language: s.tags?.language || "Unknown",
              title: s.tags?.title || `Audio ${idx + 1} (${s.codec_name})`,
              codec: s.codec_name,
            }));

          console.log(`[Metadata Scan] Parsed for: ${videoPath}`);
          console.log(`[Metadata Scan] Raw Streams: ${JSON.stringify(streams.map(s => ({ index: s.index, codec_type: s.codec_type, codec_name: s.codec_name })), null, 2)}`);
          console.log(`[Metadata Scan] Audio Tracks: ${JSON.stringify(audioTracks, null, 2)}`);
          console.log(`[Metadata Scan] Subtitles: ${JSON.stringify(subtitles, null, 2)}`);

          const videoStream = streams.find((s) => s.codec_type === "video");
          const videoCodec = videoStream ? videoStream.codec_name : "unknown";

          resolve({
            duration: parseFloat(metadata.format?.duration || 0),
            videoCodec,
            subtitles,
            audioTracks,
            playlist,
          });
        } catch (e) {
          reject(new Error("Error parsing metadata"));
        }
      },
    );
  });
}

function extractSubtitles(videoPath, trackIndex, startOffset) {
  const args = [];
  if (startOffset) {
    args.push("-ss", startOffset);
  }
  args.push(
    "-i",
    videoPath,
    "-map",
    `0:${trackIndex}`,
    "-f",
    "webvtt",
    "pipe:1",
  );

  return spawn(ffmpegPath, args, { windowsHide: true });
}

function streamVideo(videoPath, startParam, audioTrack, req, res) {
  const isMkvOrTs =
    videoPath.toLowerCase().endsWith(".mkv") ||
    videoPath.toLowerCase().endsWith(".ts");

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
    "-fflags",
    "+genpts",
    "-analyzeduration",
    "0",
    "-probesize",
    "32",
    "-i",
    videoPath,
  );

  args.push("-c:v", "copy");
  args.push("-c:a", "aac");

  if (isValidAudioTrack(audioTrack)) {
    args.push("-map", "0:v:0", "-map", `0:${audioTrack}`);
  }

  args.push(
    "-f",
    "mp4",
    "-movflags",
    "frag_keyframe+empty_moov+default_base_moof",
    "-avoid_negative_ts",
    "make_zero",
    "-async",
    "1",
    "pipe:1",
  );

  const ffmpeg = spawn(ffmpegPath, args, { windowsHide: true });
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
    const segmentLength = isLast
      ? duration % targetDuration === 0
        ? targetDuration
        : duration % targetDuration
      : targetDuration;
    m3u8 += `#EXTINF:${segmentLength.toFixed(6)},\nsegment_${i}.ts\n`;
  }
  m3u8 += "#EXT-X-ENDLIST\n";
  return m3u8;
}

async function getHlsPlaylist(
  videoPath,
  audioTrack,
  profileId,
  profileToken,
  startTime,
  subtitleTrack,
  burnSubtitles,
) {
  const jobId = `${videoPath}#a${audioTrack || "default"}#s${subtitleTrack || "none"}#b${burnSubtitles || "false"}`;
  console.log(`[HLS PLAYLIST REQUEST] path: ${videoPath}, audioTrack: ${audioTrack || "default"}, startTime: ${startTime || 0}, subtitleTrack: ${subtitleTrack || "none"}, burnSubtitles: ${burnSubtitles || "false"}`);
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
    const normalizedVideoPath = videoPath.replace(/\\/g, "/");
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "localflix-hls-")).replace(/\\/g, "/");
    const playlistPath = path.join(tempDir, "stream.m3u8").replace(/\\/g, "/");
    const segmentFilename = path.join(tempDir, "segment_%d.ts").replace(/\\/g, "/");

    // Retrieve video duration using ffprobe metadata call
    let meta = null;
    let duration = 0;
    try {
      meta = await getVideoMetadata(videoPath, profileId, []);
      duration = meta.duration;
    } catch (e) {
      console.error("Failed to read video metadata for manifest", e);
    }

    // Write full static VOD manifest immediately so Hls.js knows correct playhead timeline
    const manifestContent = generateVodManifest(duration || 100);
    fs.writeFileSync(playlistPath, manifestContent, "utf8");

    const startSecs = parseFloat(startTime || 0);
    const startSegment = Math.floor(startSecs / 5);

    const startJob = (useQsv = true) => {
      const args = ["-y"];
      if (!isNaN(startSecs) && startSecs > 0) {
        args.push("-ss", startSecs.toString());
      }
      args.push("-i", normalizedVideoPath);

      // Determine if burning subtitles
      const isBurning =
        burnSubtitles === "true" &&
        subtitleTrack !== undefined &&
        subtitleTrack !== null &&
        subtitleTrack !== "" &&
        subtitleTrack !== "none";
      let mappedVideo = false;

      if (isBurning && meta) {
        const subIdx = parseInt(subtitleTrack, 10);
        const subTrack = meta.subtitles.find((s) => s.index === subIdx);
        if (subTrack) {
          if (["hdmv_pgs_subtitle", "dvd_subtitle"].includes(subTrack.codec)) {
            // Image subtitle overlay
            args.push("-filter_complex", `[0:v:0][0:${subIdx}]overlay[v]`);
            args.push("-map", "[v]");
            mappedVideo = true;
          } else {
            // Text subtitle filter
            const escapedPath = videoPath
              .replace(/\\/g, "/")
              .replace(/:/g, "\\:");
            args.push(
              "-vf",
              `subtitles='${escapedPath}':si=${subTrack.trackIndex}`,
            );
          }
        }
      }

      if (!mappedVideo) {
        args.push("-map", "0:v:0");
      }

      if (isValidAudioTrack(audioTrack)) {
        args.push("-map", `0:${audioTrack}`);
      } else {
        args.push("-map", "0:a:0?");
      }

      // Video encoder settings
      if (isBurning) {
        if (useQsv) {
          args.push(
            "-c:v",
            "h264_qsv",
            "-b:v",
            "4000k",
            "-maxrate",
            "6000k",
            "-bufsize",
            "8000k",
            "-preset",
            "fast",
          );
        } else {
          args.push(
            "-c:v",
            "libx264",
            "-preset",
            "veryfast",
            "-b:v",
            "4000k",
            "-maxrate",
            "6000k",
            "-bufsize",
            "8000k",
          );
        }
      } else {
        // Direct stream copy
        args.push("-c:v", "copy");
      }

      args.push(
        "-c:a",
        "aac",
        "-sn",
        "-f",
        "hls",
        "-hls_time",
        "5",
        "-hls_list_size",
        "0",
        "-start_number",
        startSegment.toString(),
        "-hls_segment_filename",
        segmentFilename,
        path.join(tempDir, "stream.m3u8").replace(/\\/g, "/"),
      );

      console.log(`[FFmpeg Spawn] Command: ffmpeg ${args.join(" ")}`);
      const ffmpeg = spawn(ffmpegPath, args, { windowsHide: true });
      let stderrLog = "";
      let hasError = false;
      let startupLinesPrinted = 0;

      ffmpeg.stderr.on("data", (data) => {
        const str = data.toString();
        stderrLog += str;

        // Print first 150 lines of stderr to the console in real-time to debug startup issues
        if (startupLinesPrinted < 150) {
          const lines = str.split("\n");
          for (const line of lines) {
            if (startupLinesPrinted < 150 && line.trim()) {
              console.log(`[FFmpeg Spawn Stderr] ${line.trim()}`);
              startupLinesPrinted++;
            }
          }
        }

        if (
          useQsv &&
          !hasError &&
          (str.includes("Device setup failed") ||
            str.includes("Error open") ||
            (str.includes("qsv") && str.includes("failed")))
        ) {
          hasError = true;
        }
      });

      ffmpeg.on("exit", (code) => {
        if (code !== 0 && code !== null) {
          console.error(`[FFmpeg Exit Error] Process exited with code ${code}. Command: ffmpeg ${args.join(" ")}`);
          console.error(`[FFmpeg Error Stderr]:\n${stderrLog}`);
        }

        if (code !== 0 && code !== null && useQsv && !hasError) {
          hasError = true;
        }
        if (hasError && useQsv) {
          console.log("Retrying HLS stream job with software x264...");
          try {
            ffmpeg.kill();
          } catch (e) {}

          const softwareInstance = startJob(false);
          const currentJob = activeJobs.get(jobId);
          if (currentJob) {
            currentJob.ffmpeg = softwareInstance.ffmpeg;
            currentJob.getStderr = softwareInstance.getStderr;
          }
        }
      });

      return { ffmpeg, getStderr: () => stderrLog };
    };

    const initialInstance = startJob(true);

    job = {
      tempDir,
      playlistPath,
      ffmpeg: initialInstance.ffmpeg,
      createdAt: Date.now(),
      startTime: startSecs,
      startSegment,
      audioTrack,
      videoPath: normalizedVideoPath,
      getStderr: initialInstance.getStderr,
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
      console.log(
        `Seek detected! Requested segment ${requestedSegmentIndex}. Max segment on disk: ${maxSegmentOnDisk}. Restarting FFmpeg from ${targetTime}s...`,
      );

      // Kill the existing FFmpeg job
      try {
        job.ffmpeg.kill();
      } catch (e) {}

      // Spawn a new FFmpeg process starting at targetTime
      const segmentFilename = path.join(job.tempDir, "segment_%d.ts").replace(/\\/g, "/");
      const args = ["-y"];
      if (targetTime > 0) {
        args.push("-ss", targetTime.toString());
      }
      args.push("-i", job.videoPath);

      if (isValidAudioTrack(job.audioTrack)) {
        args.push("-map", "0:v:0", "-map", `0:${job.audioTrack}`);
      }

      args.push(
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-sn",
        "-f",
        "hls",
        "-hls_time",
        "5",
        "-hls_list_size",
        "0",
        "-start_number",
        requestedSegmentIndex.toString(),
        "-hls_segment_filename",
        segmentFilename,
        path.join(job.tempDir, "stream.m3u8").replace(/\\/g, "/"),
      );

      console.log(`[FFmpeg Spawn (Seek)] Command: ffmpeg ${args.join(" ")}`);
      const ffmpeg = spawn(ffmpegPath, args, { windowsHide: true });
      let stderrLog = "";
      let startupLinesPrinted = 0;
      ffmpeg.stderr.on("data", (data) => {
        const str = data.toString();
        stderrLog += str;
        if (startupLinesPrinted < 150) {
          const lines = str.split("\n");
          for (const line of lines) {
            if (startupLinesPrinted < 150 && line.trim()) {
              console.log(`[FFmpeg Seek Stderr] ${line.trim()}`);
              startupLinesPrinted++;
            }
          }
        }
      });

      ffmpeg.on("exit", (code) => {
        if (code !== 0 && code !== null) {
          console.error(`[FFmpeg Seek Exit Error] Process exited with code ${code}. Command: ffmpeg ${args.join(" ")}`);
          console.error(`[FFmpeg Seek Error Stderr]:\n${stderrLog}`);
        }
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
    console.error(`[HLS SEGMENT TIMEOUT] Segment file not found: ${name} for jobId: ${jobId} (waited 8000ms)`);
    if (job.getStderr) {
      console.error(`[FFmpeg Spawn Error Stderr]:\n${job.getStderr()}`);
    }
    return res.status(404).json({ error: `Segment file not found: ${name}` });
  }

  // Disable etag, lastModified, and caching to prevent 304 Not Modified responses
  res.sendFile(filePath, { maxAge: 0, lastModified: false, etag: false });
}

function stopHlsStream(videoPath) {
  let cleanedAny = false;
  for (const [id, job] of activeJobs.entries()) {
    if (job.videoPath === videoPath) {
      console.log(`[HLS Stop] Cleaning active job: ${id} for video: ${videoPath}`);
      cleanJob(id);
      cleanedAny = true;
    }
  }
  if (!cleanedAny) {
    console.log(`[HLS Stop] No active jobs found for video: ${videoPath}`);
  }
}

function getThumbnailFrame(videoPath, time) {
  return new Promise((resolve, reject) => {
    const cacheDir = path.join(__dirname, "..", "cache", "frame_thumbnails");
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }

    const bucketTime = Math.max(0, Math.round(parseFloat(time || 0) / 5) * 5);
    const hash = crypto.createHash("md5").update(videoPath).digest("hex");
    const cacheFileName = `${hash}_${bucketTime}.jpg`;
    const cacheFilePath = path.join(cacheDir, cacheFileName);

    if (fs.existsSync(cacheFilePath)) {
      return resolve(cacheFilePath);
    }

    const args = [
      "-ss",
      bucketTime.toString(),
      "-noaccurate_seek",
      "-i",
      videoPath,
      "-vframes",
      "1",
      "-vf",
      "scale=160:-1",
      "-q:v",
      "3",
      cacheFilePath,
    ];

    execFile(ffmpegPath, args, (err) => {
      if (err) {
        console.error("Failed to generate frame thumbnail:", err);
        return reject(new Error("Failed to generate frame thumbnail"));
      }
      resolve(cacheFilePath);
    });
  });
}

const activeConversions = new Map();

function startConversion(videoPath, audioTrack, subtitleTrack, allowedPaths) {
  return new Promise(async (resolve, reject) => {
    try {
      if (activeConversions.has(videoPath)) {
        const job = activeConversions.get(videoPath);
        if (job.status === "processing") {
          return reject(new Error("Conversion for this video is already in progress"));
        }
      }

      // Check if there's any active conversion, and limit to 1 concurrent task
      for (const [key, job] of activeConversions.entries()) {
        if (job.status === "processing") {
          return reject(new Error("Another conversion is already in progress. Please wait."));
        }
      }

      const meta = await getVideoMetadata(videoPath, null, allowedPaths);
      const duration = meta.duration;

      const dir = path.dirname(videoPath);
      const ext = path.extname(videoPath);
      const base = path.basename(videoPath, ext);
      const outPath = path.join(dir, `${base}_converted.mp4`);

      const normalizedInput = videoPath.replace(/\\/g, "/");
      const normalizedOutput = outPath.replace(/\\/g, "/");

      const args = ["-y", "-i", normalizedInput];

      // Video encoding and mapping
      let hasFilter = false;
      let mappedVideo = false;
      if (subtitleTrack && subtitleTrack !== "none") {
        const subIdx = parseInt(subtitleTrack, 10);
        const subTrack = meta.subtitles.find((s) => s.index === subIdx);
        if (subTrack) {
          if (["hdmv_pgs_subtitle", "dvd_subtitle"].includes(subTrack.codec)) {
            args.push("-filter_complex", `[0:v:0][0:${subIdx}]overlay[v]`, "-map", "[v]");
            mappedVideo = true;
          } else {
            const escapedPath = videoPath.replace(/\\/g, "/").replace(/:/g, "\\:");
            args.push("-vf", `subtitles='${escapedPath}':si=${subTrack.trackIndex}`);
          }
          hasFilter = true;
        }
      }

      if (!mappedVideo) {
        args.push("-map", "0:v:0");
      }

      // Audio track mapping
      if (audioTrack && audioTrack !== "default" && audioTrack !== "") {
        args.push("-map", `0:${audioTrack}`);
      } else {
        // Find default or first audio track
        const firstAudio = meta.audioTracks[0];
        if (firstAudio) {
          args.push("-map", `0:${firstAudio.index}`);
        } else {
          args.push("-map", "0:a:0?");
        }
      }

      // Codecs & acceleration
      if (hasFilter) {
        // Subtitle burning requires decoding and re-encoding
        args.push("-c:v", "h264_qsv", "-b:v", "5000k", "-preset", "fast");
      } else {
        // Direct copy if video is already h264, else transcode
        if (meta.videoCodec === "h264") {
          args.push("-c:v", "copy");
        } else {
          args.push("-c:v", "h264_qsv", "-b:v", "5000k", "-preset", "fast");
        }
      }

      args.push("-c:a", "aac", "-b:a", "192k");
      // Output
      args.push(normalizedOutput);

      console.log(`[Conversion Spawn] Command: ffmpeg ${args.join(" ")}`);
      const ffmpeg = spawn(ffmpegPath, args, { windowsHide: true });

      const job = {
        videoPath,
        outPath,
        status: "processing",
        progress: 0,
        error: null,
        process: ffmpeg,
      };

      activeConversions.set(videoPath, job);

      let stderrBuffer = "";
      let startupLinesPrinted = 0;
      ffmpeg.stderr.on("data", (data) => {
        const str = data.toString();
        stderrBuffer += str;
        
        // Log the first 50 lines of conversion stderr output to the console for debugging
        if (startupLinesPrinted < 50) {
          const lines = str.split("\n");
          for (const line of lines) {
            if (startupLinesPrinted < 50 && line.trim()) {
              console.log(`[Conversion Stderr] ${line.trim()}`);
              startupLinesPrinted++;
            }
          }
        }

        const lines = stderrBuffer.split(/\r?\n/);
        stderrBuffer = lines.pop() || "";

        for (const line of lines) {
          const match = line.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
          if (match) {
            const hrs = parseInt(match[1], 10);
            const mins = parseInt(match[2], 10);
            const secs = parseFloat(`${match[3]}.${match[4]}`);
            const currentSecs = hrs * 3600 + mins * 60 + secs;

            if (duration > 0) {
              const pct = Math.min(99, Math.round((currentSecs / duration) * 100));
              job.progress = pct;
            }
          }
        }
      });

      ffmpeg.on("close", (code) => {
        if (code === 0) {
          job.status = "completed";
          job.progress = 100;
          console.log(`[Conversion Complete] Finished: ${videoPath} -> ${outPath}`);
        } else {
          job.status = "failed";
          job.error = `FFmpeg process exited with code ${code}`;
          console.error(`[Conversion Failed] Error: ${job.error}`);
        }
        // Keep the job in history but clean the process handle
        job.process = null;
      });

      ffmpeg.on("error", (err) => {
        job.status = "failed";
        job.error = err.message;
        job.process = null;
        console.error(`[Conversion Error] Error: ${err.message}`);
      });

      resolve({ outPath });
    } catch (err) {
      reject(err);
    }
  });
}

function getConversionStatus() {
  const list = [];
  for (const [key, job] of activeConversions.entries()) {
    list.push({
      videoPath: job.videoPath,
      outPath: job.outPath,
      status: job.status,
      progress: job.progress,
      error: job.error,
    });
  }
  return list;
}

function stopConversion(videoPath) {
  const job = activeConversions.get(videoPath);
  if (job && job.process) {
    try {
      job.process.kill();
    } catch (e) {}
    job.status = "failed";
    job.error = "Cancelled by user";
    job.process = null;
    return true;
  }
  return false;
}

module.exports = {
  getVideoMetadata,
  extractSubtitles,
  streamVideo,
  getHlsPlaylist,
  serveHlsFile,
  cleanJob,
  stopHlsStream,
  getThumbnailFrame,
  startConversion,
  getConversionStatus,
  stopConversion,
};
