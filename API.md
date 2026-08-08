# REST API Reference

All backend communication happens via a local JSON REST API. Requests targeting endpoints marked as **Auth Required** must specify the profile's authentication token inside the `X-Profile-Token` header.

---

## Profile APIs

### List Profiles
- **Endpoint**: `GET /api/profiles`
- **Auth**: None
- **Response**: List of profile summaries (name, avatar color, whether PIN is enabled).

### Login Profile
- **Endpoint**: `POST /api/profiles/login`
- **Auth**: None
- **Payload**:
  ```json
  { "id": "profile-id", "pin": "1234" }
  ```
- **Response**: Token credentials.
  ```json
  { "token": "uuid-auth-token" }
  ```

---

## Explorer APIs

### Browse Folders
- **Endpoint**: `GET /api/explorer?path=<absolute_path>`
- **Auth**: Required
- **Response**: Contents of the folder (files and subdirectories) alongside watch progress and thumbnail details.

### Pin Folder
- **Endpoint**: `POST /api/explorer/pin`
- **Auth**: Required
- **Payload**:
  ```json
  { "path": "C:\\Videos\\Anime", "title": "My Anime List" }
  ```

### Unpin Folder
- **Endpoint**: `POST /api/explorer/unpin`
- **Auth**: Required
- **Payload**:
  ```json
  { "path": "C:\\Videos\\Anime" }
  ```

### Set Folder Cover Art
- **Endpoint**: `POST /api/explorer/thumbnail`
- **Auth**: Required
- **Payload**:
  ```json
  { "path": "C:\\Videos\\Anime", "thumbnail": "https://image.url" }
  ```

### Remove Folder Cover Art
- **Endpoint**: `DELETE /api/explorer/thumbnail?path=<absolute_path>`
- **Auth**: Required

---

## Video & HLS Streaming APIs

### Get Video Metadata
- **Endpoint**: `GET /api/video/metadata?path=<absolute_path>`
- **Auth**: Required
- **Response**: Duration, size, whitelisted subtitle tracks (text and image-based), and audio tracks.

### Serve HLS Playlist
- **Endpoint**: `GET /api/video/hls/index.m3u8`
- **Auth**: Required
- **Query Parameters**:
  - `path`: Absolute file path.
  - `startTime`: Segment start offset in seconds.
  - `audioTrack`: Target audio track index override.
  - `subtitleTrack`: Target subtitle track index override.
  - `burnSubtitles`: `"true"` or `"false"` (forces QSV hardware transcode burning).

### Serve HLS Segment
- **Endpoint**: `GET /api/video/hls/file?jobId=<job_id>&name=segment_<idx>.ts`
- **Auth**: Required
- **Response**: Binary stream of the transport stream video chunk.

### Stop HLS Stream
- **Endpoint**: `POST /api/video/hls/stop`
- **Auth**: Required
- **Payload**:
  ```json
  { "path": "C:\\Videos\\movie.mkv", "audioTrack": "2" }
  ```

### Download Subtitle Track
- **Endpoint**: `GET /api/video/subtitles?path=<absolute_path>&index=<track_index>&download=true`
- **Auth**: Required
- **Response**: Attachment file stream of subtitle track formatted as a WebVTT document.

---

## Playback APIs

### Save Playback Progress
- **Endpoint**: `POST /api/playback/progress`
- **Auth**: Required
- **Payload**:
  ```json
  { "filepath": "C:\\Videos\\movie.mkv", "position": 350.5, "duration": 7200.0 }
  ```

### Get History
- **Endpoint**: `GET /api/playback/history`
- **Auth**: Required

### Delete History Item
- **Endpoint**: `DELETE /api/playback/history/:id`
- **Auth**: Required
