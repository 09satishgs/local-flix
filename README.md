# LocalFlix

> [!IMPORTANT]
> LocalFlix is a self-hosted video streaming platform that turns any Windows PC into a personal Netflix-like media server. Stream your local video library to any device on your home network with on-the-fly HLS transcoding, multi-profile support, and a premium dark-themed UI.

<p align="center">
  <strong>On-demand HLS transcoding</strong> &bull;
  <strong>Multi-profile access control</strong> &bull;
  <strong>Resume & progress tracking</strong> &bull;
  <strong>Responsive mobile & desktop layouts</strong>
</p>

---

## Table of Contents

- [Why This Project Exists](#why-this-project-exists)
- [Who This README Is For](#who-this-readme-is-for)
- [Product Snapshot](#product-snapshot)
- [Feature Overview](#feature-overview)
- [How The System Works](#how-the-system-works)
- [Architecture Summary](#architecture-summary)
- [Project Structure](#project-structure)
- [Data Models](#data-models)
- [Configuration](#configuration)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [API Reference](#api-reference)
- [Design Decisions & Trade-offs](#design-decisions--trade-offs)
- [Tech Stack](#tech-stack)

---

## Why This Project Exists

### The backstory

I have a mini PC, an Intel 12th Gen i5-12500H with 32 GB DDR5, a 1 TB NVMe SSD, 2.5 Gb LAN, and Wi-Fi 6. It was lying around doing nothing. At the same time, our home has _way too many pen drives_: some for movies, some for web series and TV shows, and others for anime. Everyone watches from more than one drive, so there's a constant headache of figuring out who wants to watch what and which pen drive has it and who has it currently.

The fix was obvious: dump everything onto the mini PC and host it over Wi-Fi. Create a profile for each family member, give them access to only the shows they actually watch, and let everyone have their own watch history and resume capability and no more arguing over pen drives.

On top of that, I wanted a proper Picture-in-Picture mode for local videos on my PC, but VLC and other desktop players don't support browser-style PiP. That was the final push to build this.

### The technical motivation

Home media libraries are scattered across drives, NAS boxes, and external disks. Commercial solutions like Plex or Jellyfin are feature-rich but heavy, requiring transcoding pipelines, metadata scrapers, and database servers. Sometimes you just want to point a browser at a folder of MKVs and press play.

Beyond simplicity, commercial players lock you into their UX decisions. Want Picture-in-Picture? Keyboard shortcuts for power users? A completely different layout on mobile vs. desktop? You're at the mercy of their roadmap.

LocalFlix solves both problems with a lightweight, fully customizable streaming server:

- No media indexing or library scanning required — just point it at your video folders
- Real-time HLS segmentation means instant playback of any format FFmpeg can read (MKV, MP4, AVI, etc.)
- Multi-profile PIN locks let family members have their own watch history and pinned folders
- Path-based access control restricts each profile to only their allowed directories
- The entire stack runs on a single Node.js process with an embedded SQLite database
- **Power-user features out of the box** — Picture-in-Picture, keyboard shortcuts for every action (seek, volume, audio/subtitle cycling, next episode), and configurable playback speeds
- **Independent mobile and web designs** — Desktop and mobile layouts are completely separate JSX trees, not responsive CSS hacks. Each platform gets purpose-built UI: desktop has a top navbar with hover menus; mobile has a native-feeling bottom tab bar with touch gestures
- **Built to extend** — The modular hooks + views architecture means adding new features (e.g., watch parties, cast support, custom themes) only requires touching the relevant hook and view files without refactoring the entire component

---

## Who This README Is For

| Audience               | Start Here                                    | Why                                                            |
| ---------------------- | --------------------------------------------- | -------------------------------------------------------------- |
| End users              | [Product Snapshot](#product-snapshot)         | See what the app does and how to use it                        |
| Reviewers / evaluators | [How The System Works](#how-the-system-works) | Understand data flow, transcoding pipeline, and design choices |
| Contributors           | [Local Development](#local-development)       | Set up the project and work on it locally                      |
| Deployers              | [Configuration](#configuration)               | Configure profiles, allowed paths, and server settings         |

---

## Product Snapshot

### What users can do

| Area           | What it offers                                                                                            |
| -------------- | --------------------------------------------------------------------------------------------------------- |
| Profile Select | Choose a profile with optional 4-digit PIN authentication                                                 |
| Home           | View continue-watching cards with progress bars, pinned folder shortcuts with custom thumbnails           |
| File Explorer  | Browse allowed directories with breadcrumb navigation, folder pinning, and path-boundary access control   |
| Video Player   | Stream any video with HLS, switch audio tracks, toggle subtitles, adjust speed, PiP mode, and seek freely |
| History        | Chronological watch log with one entry per file, inline delete actions                                    |

### UX highlights

- Premium dark-themed UI with cherry-crimson (`#da1a27`) brand accents
- Responsive layouts — desktop gets a top navbar, mobile gets a bottom tab bar
- Real-time buffered progress indicator on the seek bar
- Auto-selection of Japanese audio and English subtitles when available
- Keyboard shortcuts: `Space` (play/pause), `←/→` (seek ±10s), `↑/↓` (volume), `A` (cycle audio), `S` (cycle subs), `N` (next video), `F` (fullscreen)
- Instant subtitle toggling via hidden track pre-fetching
- Picture-in-Picture support

---

## Feature Overview

### Core experience

| Feature                      | Description                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------- |
| On-demand HLS transcoding    | FFmpeg segments videos into `.ts` chunks on the fly — no pre-processing needed    |
| Resume playback              | Progress is saved to SQLite and restored via `startPosition` on reload            |
| Multi-audio track switching  | Cycle through embedded audio tracks (MKV, MP4) with instant FFmpeg restart        |
| Embedded subtitle extraction | Subtitles are extracted as WebVTT streams and pre-fetched for zero-delay toggling |
| Playlist navigation          | Skip Previous / Next buttons auto-advance through sibling files in a folder       |
| Custom folder thumbnails     | Pin folders with DuckDuckGo image search results as cover art                     |
| Path boundary enforcement    | Profiles can only browse and play files within their configured `allowedPaths`    |
| Unique watch history         | One entry per file per profile — updates in place instead of creating duplicates  |

### Playback engine

| Capability                   | Implementation                                                                          |
| ---------------------------- | --------------------------------------------------------------------------------------- |
| VOD manifest generation      | Full-length static `.m3u8` playlist generated from `ffprobe` duration on stream start   |
| Seek transcoding             | Backend detects cache-miss segment requests and restarts FFmpeg at the target timestamp |
| 25-minute buffer depth       | Hls.js configured with `maxMaxBufferLength: 1500` and `maxBufferSize: 1GB`              |
| Low-latency audio switching  | `-analyzeduration 0 -probesize 32` flags bypass FFmpeg's startup analysis               |
| Buffered range visualization | White-gray overlay on the seek bar shows how far ahead the player has downloaded        |

### Operational resilience

| Protection                | Why it exists                                                                             |
| ------------------------- | ----------------------------------------------------------------------------------------- |
| Segment file polling      | Holds requests for up to 8 seconds if a segment is still being written by FFmpeg          |
| FFmpeg process management | Tracks active jobs and kills stale segmenters when switching videos or closing the player |
| Ended event guard         | Ignores false `ended` events triggered by Hls.js teardown during audio/video transitions  |
| Database deduplication    | Startup migration purges duplicate watch history rows from older app versions             |

---

## How The System Works

### Playback flow

```
1. User clicks a video file in the Explorer or Continue Watching card
2. Frontend calls GET /api/video/hls/index.m3u8?path=...&startTime=...
3. Backend probes the file with ffprobe to get duration and audio/subtitle track metadata
4. Backend generates a full-length VOD .m3u8 manifest with all segment references
5. Backend spawns FFmpeg to begin HLS segmentation from the requested startTime
6. Hls.js loads the manifest, seeks to startPosition, and begins buffering .ts segments
7. Frontend saves progress to SQLite every ~5 seconds via POST /api/playback/progress
8. On seek outside buffer range, Hls.js requests a distant segment
9. Backend detects the cache miss, kills FFmpeg, restarts from the new timestamp
10. On close, frontend calls POST /api/video/hls/stop to kill FFmpeg and clean temp files
```

### Audio track switching flow

```
1. User presses 'A' or selects from the audio menu
2. Frontend saves currentTimeRef, sets new activeAudio state
3. useEffect triggers: destroys old Hls.js instance, calls stop on backend
4. New HLS stream starts with ?audioTrack=N parameter
5. Backend spawns FFmpeg with -map 0:a:N to select the requested audio stream
6. Hls.js loads with startPosition = saved time, playback resumes seamlessly
```

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────┐
│                      Browser Client                      │
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │   Home   │  │ Explorer │  │  Player  │  │ History  ││
│  │  hooks   │  │  hooks   │  │  hooks   │  │  hooks   ││
│  │  Web/Mob │  │  Web/Mob │  │  Web/Mob │  │  Web/Mob ││
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘│
│       │              │             │              │      │
│       └──────────────┴─────┬───────┴──────────────┘      │
│                            │                             │
│                      [ api.ts ]                          │
│                      REST + HLS                          │
└────────────────────────────┬─────────────────────────────┘
                             │ HTTP
┌────────────────────────────┴─────────────────────────────┐
│                    Express.js Server                      │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │                   Controllers                        │ │
│  │  profile · explorer · video · playback · imageSearch │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────────┐ │
│  │                    Services                          │ │
│  │  explorerService · videoService · playbackService    │ │
│  │  imageSearchService                                  │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────────┐ │
│  │                  Repositories                        │ │
│  │  progressRepo · historyRepo · pinRepo               │ │
│  └──────────────────────┬──────────────────────────────┘ │
│                         │                                │
│  ┌──────────────────────┴──────────────────────────────┐ │
│  │              SQLite (database.db)                    │ │
│  │  playback_progress · watch_history · pinned_folders  │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                          │
│  ┌─────────────────────────────────────────────────────┐ │
│  │              FFmpeg Process Manager                  │ │
│  │  On-demand HLS segmentation · Subtitle extraction    │ │
│  │  Dynamic seek transcoding · Audio track remuxing     │ │
│  └─────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

---

## Project Structure

```
local-flix/
├── package.json                    # Workspace root (npm workspaces)
│
├── backend/
│   ├── server.js                   # Express app entry point & route registration
│   ├── config.json                 # Profile definitions & allowed paths
│   ├── example.config.json         # Template configuration for new users
│   ├── database.db                 # SQLite database (auto-created)
│   ├── package.json
│   │
│   ├── config/
│   │   ├── db.js                   # SQLite initialization, migrations, deduplication
│   │   └── security.js             # Profile auth middleware & path boundary checks
│   │
│   ├── controllers/
│   │   ├── profileController.js    # GET /api/profiles, POST /api/profiles/login
│   │   ├── explorerController.js   # GET /api/explorer, pin/unpin endpoints
│   │   ├── videoController.js      # HLS playlist, segment serving, subtitle extraction
│   │   ├── playbackController.js   # Progress save/load, history, continue watching
│   │   └── imageSearchController.js# DuckDuckGo image search proxy
│   │
│   ├── services/
│   │   ├── explorerService.js      # Directory listing, thumbnail matching, path guards
│   │   ├── videoService.js         # FFmpeg spawning, VOD manifest, seek transcoding
│   │   ├── playbackService.js      # Progress upsert, history dedup, mark finished
│   │   └── imageSearchService.js   # DDG image scraper for folder thumbnails
│   │
│   ├── repositories/
│   │   ├── progressRepository.js   # playback_progress CRUD
│   │   ├── historyRepository.js    # watch_history upsert & dedup
│   │   └── pinRepository.js        # pinned_folders CRUD
│   │
│   └── dist/                       # Built frontend assets (generated by `npm run build`)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   │
│   └── src/
│       ├── main.tsx                # React entry point
│       ├── App.tsx                 # State orchestrator, layout selector, video overlay
│       ├── Router.tsx              # Page-state router (Home, Explorer, History)
│       ├── api.ts                  # Typed REST API client with auth headers
│       ├── index.css               # Global CSS variables & design tokens
│       │
│       ├── layouts/
│       │   ├── WebLayout.tsx       # Desktop: sticky top AppBar with nav links
│       │   └── MobileLayout.tsx    # Mobile: compact header + bottom tab navigation
│       │
│       └── components/
│           ├── ProfileSelector/    # Profile grid with PIN entry dialog
│           │   ├── ProfileSelector.tsx
│           │   ├── hooks.ts
│           │   ├── index.ts
│           │   └── views/ (Web.tsx, Mobile.tsx, types.ts)
│           │
│           ├── Home/               # Continue watching, pinned shortcuts dashboard
│           │   ├── Home.tsx
│           │   ├── hooks.ts
│           │   ├── index.ts
│           │   └── views/ (Web.tsx, Mobile.tsx, types.ts)
│           │
│           ├── Explorer/           # File browser with breadcrumbs, pin dialogs
│           │   ├── Explorer.tsx
│           │   ├── hooks.ts
│           │   ├── index.ts
│           │   └── views/ (Web.tsx, Mobile.tsx, types.ts)
│           │
│           ├── VideoPlayer/        # HLS player with full controls
│           │   ├── VideoPlayer.tsx
│           │   ├── hooks.ts
│           │   ├── index.ts
│           │   └── views/ (Web.tsx, Mobile.tsx, types.ts)
│           │
│           └── History/            # Watch log with delete actions
│               ├── History.tsx
│               ├── hooks.ts
│               ├── index.ts
│               └── views/ (Web.tsx, Mobile.tsx, types.ts)
```

### Component architecture pattern

Every component follows a consistent 4-file pattern:

| File               | Purpose                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `Component.tsx`    | Orchestrator — imports hooks, detects screen size, mounts view    |
| `hooks.ts`         | Custom React hooks with all state, effects, and event handlers    |
| `views/Web.tsx`    | Desktop JSX layout with keyboard shortcuts and hover effects      |
| `views/Mobile.tsx` | Touch-optimized JSX layout with tap gestures and compact controls |
| `views/types.ts`   | Shared TypeScript prop interfaces for both views                  |
| `index.ts`         | Barrel export for clean imports                                   |

---

## Data Models

### SQLite Tables (`backend/database.db`)

#### `playback_progress`

Tracks the current position of in-progress videos.

| Column         | Type    | Description                               |
| -------------- | ------- | ----------------------------------------- |
| `profile_id`   | TEXT    | Profile identifier                        |
| `filepath`     | TEXT    | Absolute path to the video file           |
| `position`     | REAL    | Current playback position in seconds      |
| `duration`     | REAL    | Total video duration in seconds           |
| `last_watched` | INTEGER | Unix timestamp (ms) of last progress save |

**Primary Key**: `(profile_id, filepath)`

#### `watch_history`

One entry per file per profile — updated in place on re-watch.

| Column       | Type    | Description                       |
| ------------ | ------- | --------------------------------- |
| `id`         | INTEGER | Auto-incrementing primary key     |
| `profile_id` | TEXT    | Profile identifier                |
| `filepath`   | TEXT    | Absolute path to the video file   |
| `watched_at` | INTEGER | Unix timestamp (ms) of last watch |
| `position`   | REAL    | Playback position when last saved |

#### `pinned_folders`

Folder bookmarks with optional custom thumbnails.

| Column       | Type | Description                           |
| ------------ | ---- | ------------------------------------- |
| `profile_id` | TEXT | Profile identifier                    |
| `path`       | TEXT | Absolute path to the pinned directory |
| `title`      | TEXT | Display name override                 |
| `thumbnail`  | TEXT | URL of the custom thumbnail image     |

**Primary Key**: `(profile_id, path)`

---

## Configuration

### `backend/config.json`

Copy `example.config.json` to `config.json` and customize:

```json
{
  "profiles": [
    {
      "id": "profile-user",
      "name": "User",
      "pin": "1234",
      "allowedPaths": ["D:\\Movies", "E:\\TVShows"]
    },
    {
      "id": "profile-guest",
      "name": "Guest",
      "pin": "",
      "allowedPaths": ["D:\\Movies\\Kids"]
    }
  ]
}
```

| Field          | Type     | Description                                                       |
| -------------- | -------- | ----------------------------------------------------------------- |
| `id`           | string   | Unique identifier for the profile                                 |
| `name`         | string   | Display name shown in the UI                                      |
| `pin`          | string   | 4-digit PIN for login (empty string = no PIN required)            |
| `allowedPaths` | string[] | Directories this profile can browse. Subdirectories are included. |

> [!NOTE]
> Path boundaries are enforced on both the backend (403 Forbidden) and frontend (grayed-out breadcrumbs). Even if a user manipulates API calls, the backend will reject any path outside their allowed directories.

### Prerequisites

- **Node.js** v18+ (LTS recommended)
- **FFmpeg** — Bundled via `ffmpeg-static` npm package (no manual install needed)

---

## Local Development

```bash
# 1. Clone the repository
git clone https://github.com/09satishgs/local-flix.git
cd local-flix

# 2. Install all dependencies (root + backend + frontend workspaces)
npm install

# 3. Configure profiles
cp backend/example.config.json backend/config.json
# Edit backend/config.json with your video folder paths

# 4. Start development servers
npm run dev
# → Backend:  http://localhost:5000  (nodemon with auto-reload)
# → Frontend: http://localhost:5173  (Vite with HMR)
```

### Workspace scripts

| Command         | What it does                                                        |
| --------------- | ------------------------------------------------------------------- |
| `npm run dev`   | Starts backend (nodemon) and frontend (Vite) concurrently           |
| `npm run build` | Compiles TypeScript and builds frontend assets into `backend/dist/` |
| `npm start`     | Runs the production server serving both API and built frontend      |

---

## Production Deployment

Ideal for a home mini PC (e.g., ASUS PN64) running 24/7 on your local network.

```bash
# Build the frontend
npm run build

# Start the production server
npm start
# → Server runs on http://0.0.0.0:5000
```

Access from any device on your network at `http://<server-ip>:5000`.

> [!TIP]
> On Windows, you can create a startup shortcut or use Task Scheduler to auto-start LocalFlix on boot. Point it at `npm start` in the project directory.

---

## API Reference

### Profile endpoints

| Method | Endpoint              | Auth     | Description                                |
| ------ | --------------------- | -------- | ------------------------------------------ |
| GET    | `/api/profiles`       | None     | List all profiles (names only, no PINs)    |
| POST   | `/api/profiles/login` | None     | Authenticate with profile ID + PIN         |
| GET    | `/api/profiles/me`    | Required | Get current profile details + allowedPaths |

### Explorer endpoints

| Method | Endpoint              | Auth     | Description                            |
| ------ | --------------------- | -------- | -------------------------------------- |
| GET    | `/api/explorer`       | Required | List directory contents with progress  |
| GET    | `/api/explorer/pins`  | Required | Get pinned folders for current profile |
| POST   | `/api/explorer/pin`   | Required | Pin a folder with optional thumbnail   |
| POST   | `/api/explorer/unpin` | Required | Remove a pinned folder                 |

### Video streaming endpoints

| Method | Endpoint                    | Auth     | Description                              |
| ------ | --------------------------- | -------- | ---------------------------------------- |
| GET    | `/api/video/metadata`       | Required | Probe video for audio/subtitle tracks    |
| GET    | `/api/video/subtitles`      | Required | Extract subtitle track as WebVTT         |
| GET    | `/api/video/hls/index.m3u8` | Required | Generate and serve HLS VOD playlist      |
| GET    | `/api/video/hls/file`       | Required | Serve HLS `.ts` segment files            |
| POST   | `/api/video/hls/stop`       | Required | Kill FFmpeg process and clean temp files |

### Playback endpoints

| Method | Endpoint                    | Auth     | Description                               |
| ------ | --------------------------- | -------- | ----------------------------------------- |
| GET    | `/api/playback/continue`    | Required | Get continue-watching list                |
| GET    | `/api/playback/history`     | Required | Get watch history                         |
| POST   | `/api/playback/progress`    | Required | Save/update playback progress             |
| POST   | `/api/playback/finished`    | Required | Mark video as finished (removes progress) |
| DELETE | `/api/playback/progress`    | Required | Remove a continue-watching entry          |
| DELETE | `/api/playback/history/:id` | Required | Delete a specific history entry           |

### Utility endpoints

| Method | Endpoint             | Auth     | Description                   |
| ------ | -------------------- | -------- | ----------------------------- |
| GET    | `/api/search-images` | Required | DuckDuckGo image search proxy |

---

## Design Decisions & Trade-offs

| Decision                                  | Rationale                                                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| HLS copy-remux instead of transcode       | `-c copy` avoids re-encoding, keeping CPU usage minimal while fixing timestamp alignment         |
| VOD manifest with all segments upfront    | Prevents Hls.js from treating the stream as "Live" and showing incorrect durations               |
| FFmpeg restart on cache-miss seeks        | Avoids pre-segmenting the entire video while still allowing instant seeks to any timestamp       |
| SQLite over PostgreSQL                    | Single-file embedded database — zero ops overhead for a personal home server                     |
| `startPosition` over manual `currentTime` | Prevents Hls.js from fetching segment 0 before seeking, which caused transcoding race conditions |
| `upsert` history instead of `insert`      | Keeps watch history clean with one row per file instead of growing unbounded                     |
| DuckDuckGo for image search               | No API keys required — works as a simple HTML scraper for folder thumbnail customization         |
| Component architecture pattern            | Every component splits into hooks (logic), views (Web/Mobile JSX), and types for maintainability |
| Separate Web/Mobile layouts               | Desktop users get a traditional navbar; mobile users get native-feeling bottom tab navigation    |
| `ffmpeg-static` npm package               | Bundles FFmpeg binaries — no system-level installation required                                  |

---

## Tech Stack

### Frontend

| Technology    | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| React 19      | UI framework                                                 |
| TypeScript 6  | Type safety                                                  |
| Vite 8        | Build tool and dev server with HMR                           |
| Material UI 6 | Component library (AppBar, Slider, Dialog, BottomNavigation) |
| Hls.js        | HLS adaptive streaming client                                |
| CSS Variables | Design tokens for theming (`--localflix-red`, `--bg-dark`)   |
| Google Fonts  | Outfit typeface for brand identity                           |

### Backend

| Technology    | Purpose                                                 |
| ------------- | ------------------------------------------------------- |
| Node.js       | Runtime                                                 |
| Express 4     | HTTP server and routing                                 |
| SQLite 3      | Embedded database for progress, history, and pins       |
| FFmpeg        | Video segmentation, audio remuxing, subtitle extraction |
| ffprobe       | Video metadata probing (duration, tracks, codecs)       |
| ffmpeg-static | Bundled FFmpeg/ffprobe binaries via npm                 |

### Infrastructure

| Component      | Purpose                                    |
| -------------- | ------------------------------------------ |
| npm workspaces | Monorepo management for frontend + backend |
| concurrently   | Parallel dev server execution              |
| nodemon        | Backend auto-reload in development         |

---

<p align="center">
  Built for personal use. Stream your own content, your own way.
</p>
