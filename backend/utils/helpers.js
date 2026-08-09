const path = require("path");

const VIDEO_EXTENSIONS = [".mp4", ".mkv", ".ts", ".m4v", ".mov", ".avi"];

function isVideoFile(filePath) {
  if (!filePath) return false;
  const ext = path.extname(filePath).toLowerCase();
  return VIDEO_EXTENSIONS.includes(ext);
}

function isValidAudioTrack(track) {
  return (
    track !== undefined &&
    track !== null &&
    track !== "" &&
    track !== "null" &&
    track !== "undefined"
  );
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
  VIDEO_EXTENSIONS,
  isVideoFile,
  isValidAudioTrack,
  cleanWebVTT,
};
