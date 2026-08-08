# LocalFlix

> [!IMPORTANT]
> LocalFlix is a self-hosted home video streaming platform that turns any mini PC into a personal Netflix-like media server. Stream local libraries to any device on your network with on-the-fly HLS transcoding, PIN-locked multi-profile access, and a gorgeous, fast dark-themed UI.

<p align="center">
  <strong>On-demand HLS Transcoding</strong> &bull;
  <strong>Multi-profile PIN Locks</strong> &bull;
  <strong>Decoupled Cover Art</strong> &bull;
  <strong>Adaptive Web & Mobile Layouts</strong> &bull;
  <strong>QSV Hardware Burning</strong>
</p>

---

## Technical Documentation Links

To keep this guide concise, advanced architecture and technical details are split into sub-files:

- See [ARCHITECTURE.md](file:///c:/Users/satis/Music/windows/home-video-streamer/ARCHITECTURE.md) for details on components, data structures, and the FFmpeg pipeline.
- See [API.md](file:///c:/Users/satis/Music/windows/home-video-streamer/API.md) for the complete HTTP JSON REST API reference.

---

## Key Feature Highlights

### 1. Unified State Routing (Hash Router)

- Synchronizes your active page, directory explorer level, and playing video offsets with `window.location.hash` and query parameters.
- Page reloads or browser back/forward buttons preserve your position and context.

### 2. Dual Streaming Modes: Standard vs. Alt Player

- **Standard Mode (Default)**: Remuxes videos on the fly (`-c:v copy`), serving text subtitles as pre-fetched WebVTT tracks. Uses almost 0% CPU.
- **Alt Player Mode (QSV Hardware Transcode)**: Burns subtitles (text and bitmap types like PGS/VOBSUB) directly onto video frames.
  - Automatically offloads transcoding to the Mini PC's Intel Xe GPU via `-c:v h264_qsv`.
  - Self-heals by falling back to standard software encoding (`libx264`) if QSV initialization errors are caught.
  - Subtitle track shifts or audio track changes trigger instant stream rebuilding, starting exactly from your current timestamp.

### 3. Favorite Subtitle Starring

- Star subtitle tracks in the player layout. Starred tracks are stored in `localStorage` under `starredSubtitles`.
- Playing a new video automatically scans tracks, matches starred titles first, and falls back to selecting the last English subtitle.

### 4. Advanced Subtitle Synchronizer

- Includes subtitle download controls inside the selection menu.
- Standard player has `-0.5s` and `+0.5s` sync buttons to shift cue timestamps dynamically inside the active view.
- Toggles trigger a center-bottom toast overlay notifying you of language changes.

### 5. Decoupled Pins & Custom Covers

- Bookmark files and folders to your dashboard.
- Cover art is stored in a separate table (`folder_thumbnails`), ensuring that unpinning a bookmark doesn't discard custom thumbnails.
- Right-click folders inside the explorer to change, select (using DuckDuckGo scrape API), or remove custom thumbnails.

---

## Local Development Setup

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **FFmpeg** — Automatically bundled on setup via `ffmpeg-static` (no manual system-level installation needed).

### Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/09satishgs/local-flix.git
cd local-flix

# 2. Install all workspace dependencies
npm install

# 3. Configure video folder boundaries
cp backend/example.config.json backend/config.json
# Open and edit config.json to declare user profiles and allowed directories

# 4. Start concurrent development servers
npm run dev
# → Backend API:  http://localhost:4000
# → Frontend app:  http://localhost:5173 (with Vite HMR)
```

---

## Production Deployment

Built to run 24/7 on your home Mini PC (e.g., Intel 12th Gen Core i5 12500H).

```bash
# Build production bundle
npm run build

# Start production server
npm start
# → Server runs on port 5000 (0.0.0.0:4000)
```

Access from any phone, TV, or computer on your Wi-Fi network at `http://<server-ip>:4000`.

---

<p align="center">
  Stream your own content, your own way.
</p>
