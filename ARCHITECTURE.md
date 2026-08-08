# Architecture & Design Decisions

This document details the system design, directory layout, database schema, and design trade-offs made in LocalFlix.

---

## System Workflows

### Playback Flow
```
1. User clicks a video file in the Explorer or Continue Watching card.
2. Frontend calls GET /api/video/hls/index.m3u8?path=...&startTime=...
3. Backend probes the file with ffprobe to get duration, audio, and subtitle track metadata.
4. Backend generates a full-length VOD .m3u8 manifest with all segment references.
5. Backend spawns FFmpeg to begin HLS segmentation starting from the requested startTime.
6. Hls.js loads the manifest, seeks to startPosition, and begins buffering .ts segments.
7. Frontend saves progress to SQLite every ~5 seconds via POST /api/playback/progress.
8. On seek outside buffer range, Hls.js requests a distant segment.
9. Backend detects the cache miss, kills FFmpeg, and restarts from the new timestamp.
10. On close, frontend calls POST /api/video/hls/stop to kill FFmpeg and clean temp files.
```

### Audio & Subtitle Hot Reloading Flow (Alt Player)
```
1. User selects a different audio track or subtitle track in AltVideoPlayer.
2. Frontend captures current playhead position (currentTimeRef) and sets the new track state.
3. Hls.js instance is destroyed, and the backend HLS job is stopped.
4. A new HLS stream request is sent with updated track indices (?audioTrack=N&subtitleTrack=M&burnSubtitles=true).
5. Backend spawns FFmpeg with the corresponding mapping/overlay filters, starting from the current position.
6. Hls.js loads with startPosition at the saved time, resuming playback with new burnt streams seamlessly.
```

---

## Architectural Diagram

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
│  │  Intel QSV Hardware transcode & burn-in (Alt Player) │ │
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
│   │   ├── videoService.js         # FFmpeg spawning, VOD manifest, QSV transcoding
│   │   ├── playbackService.js      # Progress upsert, history dedup, mark finished
│   │   └── imageSearchService.js   # DDG image scraper for folder thumbnails
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
│       │   ├── WebLayout.tsx       # Desktop layout (AppBar + sticky menus)
│       │   └── MobileLayout.tsx    # Mobile layout (Bottom Tab Navigation)
│       │
│       └── components/
│           ├── VideoPlayer/        # Standard HLS player (native WebVTT text tracks)
│           ├── AltVideoPlayer/     # QSV hardware transcode player (hardcoded image subs)
│           ├── Home/               # Dashboard layout
│           ├── Explorer/           # Directory list & pins
│           ├── History/            # Watch logging
│           └── ProfileSelector/    # PIN authorization grids
```

---

## Data Models (SQLite Schema)

### `playback_progress`
Tracks the current position of in-progress videos.
- `profile_id` (TEXT): Profile identifier.
- `filepath` (TEXT): Absolute path to the video file.
- `position` (REAL): Current playback position in seconds.
- `duration` (REAL): Total video duration in seconds.
- `last_watched` (INTEGER): Unix timestamp (ms) of the last progress save.
- **Primary Key**: `(profile_id, filepath)`

### `watch_history`
Maintains a chronological record of watched media (de-duplicated).
- `id` (INTEGER): Auto-incrementing primary key.
- `profile_id` (TEXT): Profile identifier.
- `filepath` (TEXT): Absolute path to the video file.
- `watched_at` (INTEGER): Unix timestamp (ms) of the last watch.
- `position` (REAL): Playback position when last saved.

### `pinned_folders`
Folder shortcuts displayed on the profile's home screen.
- `profile_id` (TEXT): Profile identifier.
- `path` (TEXT): Absolute path to the pinned directory.
- `title` (TEXT): Display name override.
- **Primary Key**: `(profile_id, path)`

### `folder_thumbnails`
Maintains folder cover arts decoupled from pinned items.
- `path` (TEXT): Absolute path to the directory.
- `thumbnail_url` (TEXT): Custom cover thumbnail image.
- **Primary Key**: `path`

---

## Design Decisions & Trade-offs

### 1. HLS Copy-Remux vs Transcoding
By default, LocalFlix copies the video stream (`-c:v copy`) and only remuxes the audio (`-c:a aac`) to guarantee minimal CPU footprint and zero fan noise on home mini PCs.

### 2. AltPlayer (QSV Hardware Burning) Fallback
For image subtitles (PGS, DVDsub) which browsers cannot decode, the Alt Player transcodes the video on the fly. It utilizes Intel Quick Sync Video (`h264_qsv`) for high performance, but dynamically self-heals by falling back to software `libx264` if driver conflicts occur.

### 3. Decoupled Pinning and Folder Thumbnails
Dividing pins and cover art into distinct tables (`pinned_folders` vs `folder_thumbnails`) ensures that if a folder is unpinned, its custom cover art remains saved. Pinned folders on the home screen can display these custom covers.

### 4. Separate Web and Mobile Components
Instead of bloated responsive CSS templates, Web and Mobile layouts are isolated into individual components. This allows desktop users to enjoy complete keyboard navigation, while mobile users navigate using touch gestures and mobile-optimized drawers.
