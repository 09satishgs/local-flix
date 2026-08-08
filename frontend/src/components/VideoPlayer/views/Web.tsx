import React from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
  Button,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  ArrowBack,
  Subtitles,
  VolumeDown,
  VolumeMute,
  Speed,
  PictureInPicture,
  Audiotrack,
  Replay,
  SkipNext,
  SkipPrevious,
  Download,
  Star,
  StarBorder,
} from "@mui/icons-material";
import type { VideoPlayerViewProps } from "./types";

export const WebVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  profileId,
  profileToken,
  isPlaying,
  duration,
  currentTime,
  bufferedTime,
  volume,
  isMuted,
  isLoading,
  playbackSpeed,
  showControls,
  isFullscreen,
  isEnded,
  currentVideoPath,
  subtitles,
  audioTracks,
  activeSubtitle,
  activeAudio,
  subtitleAnchor,
  setSubtitleAnchor,
  audioAnchor,
  setAudioAnchor,
  speedAnchor,
  setSpeedAnchor,
  handleTimeUpdate,
  handleProgress,
  handleLoadedMetadata,
  handlePlayPause,
  handleVideoEnded,
  handleReplay,
  handleSeeking,
  handleSeeked,
  handleWaiting,
  handlePlaying,
  hasPrevious,
  hasNext,
  playPrevious,
  playNext,
  handleSeek,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen,
  handleSpeedSelect,
  selectSubtitle,
  selectAudioTrack,
  togglePictureInPicture,
  formatTime,
  subtitleDelay,
  adjustSubtitleDelay,
  downloadSubtitles,
  subtitleToast,
  starredSubtitles,
  toggleStarSubtitle,
  onClose,
}) => {
  return (
    <Box
      ref={containerRef}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#000",
        zIndex: 1250,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Node */}
      <video
        ref={videoRef}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "100vh",
          objectFit: "contain",
        }}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleVideoEnded}
        onSeeking={handleSeeking}
        onSeeked={handleSeeked}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        crossOrigin="anonymous"
      >
        {subtitles.map((track) => (
          <track
            key={track.index}
            src={`/api/video/subtitles?path=${encodeURIComponent(currentVideoPath)}&trackIndex=${track.index}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`}
            kind="subtitles"
            srcLang={track.language}
            label={track.title}
          />
        ))}
      </video>

      {/* Subtitle Change Toast */}
      {subtitleToast && (
        <Box
          sx={{
            position: "absolute",
            bottom: 120, // positioned safely above control bar
            left: "50%",
            transform: "translateX(-50%)",
            bgcolor: "rgba(0, 0, 0, 0.8)",
            color: "#fff",
            px: 3,
            py: 1,
            borderRadius: 1.5,
            fontSize: "1.05rem",
            fontWeight: 600,
            pointerEvents: "none",
            zIndex: 110,
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.6)",
            animation: "fadeInOut 0.2s ease",
            "@keyframes fadeInOut": {
              from: { opacity: 0, transform: "translate(-50%, 15px)" },
              to: { opacity: 1, transform: "translate(-50%, 0)" },
            },
          }}
        >
          {subtitleToast}
        </Box>
      )}

      {/* Ended Overlay Screen */}
      {isEnded && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: "rgba(0, 0, 0, 0.85)",
            zIndex: 100,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            pointerEvents: "auto",
          }}
        >
          <Typography
            variant="h4"
            sx={{ color: "#fff", fontWeight: 700, mb: 1 }}
          >
            Video Finished
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "var(--text-secondary)", mb: 3 }}
          >
            Would you like to start over or return to browsing?
          </Typography>

          <Box sx={{ display: "flex", gap: 3 }}>
            <Button
              variant="contained"
              startIcon={<Replay />}
              onClick={handleReplay}
              sx={{
                bgcolor: "var(--localflix-red)",
                color: "#fff",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": { bgcolor: "var(--localflix-dark-red)" },
              }}
            >
              Start Over
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onClose}
              sx={{
                borderColor: "#555",
                color: "#fff",
                fontWeight: 600,
                px: 4,
                py: 1.5,
                "&:hover": {
                  borderColor: "#fff",
                  bgcolor: "rgba(255,255,255,0.05)",
                },
              }}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      )}

      {/* Buffering Spinner */}
      {isLoading && (
        <CircularProgress
          size={80}
          sx={{
            color: "var(--localflix-red)",
            position: "absolute",
            zIndex: 10,
          }}
        />
      )}

      {/* Controls Overlay */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) 80%, rgba(0,0,0,0.8) 100%)",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          pointerEvents: showControls ? "auto" : "none",
          zIndex: 5,
        }}
      >
        {/* Top Bar */}
        <Box sx={{ p: 3, display: "flex", alignItems: "center" }}>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              mr: 2,
              "&:hover": { color: "var(--localflix-red)" },
            }}
          >
            <ArrowBack fontSize="large" />
          </IconButton>
          <Typography variant="h6" sx={{ color: "#fff", fontWeight: 600 }}>
            {currentVideoPath.replace(/\\/g, "/").split("/").pop()}
          </Typography>
        </Box>

        {/* Center Play Button Overlay */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
          onClick={handlePlayPause}
        />

        {/* Bottom Bar */}
        <Box sx={{ px: 4, pb: 4 }}>
          {/* Progress Slider */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <Typography variant="body2" sx={{ color: "#ccc", minWidth: 45 }}>
              {formatTime(currentTime)}
            </Typography>
            <Box
              sx={{
                position: "relative",
                flexGrow: 1,
                display: "flex",
                alignItems: "center",
              }}
            >
              {/* Custom background rail */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: "rgba(255, 255, 255, 0.1)",
                  borderRadius: 1,
                  pointerEvents: "none",
                }}
              />
              {/* Custom buffered progress track */}
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%`,
                  height: 4,
                  bgcolor: "rgba(255, 255, 255, 0.35)",
                  borderRadius: 1,
                  pointerEvents: "none",
                }}
              />
              <Slider
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
                sx={{
                  color: "var(--localflix-red)",
                  height: 4,
                  padding: "13px 0",
                  "& .MuiSlider-thumb": {
                    width: 14,
                    height: 14,
                    transition: "0.3s ease-in-out",
                    "&:before": { boxShadow: "none" },
                    "&.Mui-active, &:hover": {
                      width: 20,
                      height: 20,
                      boxShadow: "0px 0px 0px 8px rgba(218, 26, 39, 0.16)",
                    },
                  },
                  "& .MuiSlider-rail": {
                    opacity: 0,
                  },
                  "& .MuiSlider-track": {
                    border: "none",
                  },
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "#ccc", minWidth: 45 }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Buttons Row */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Previous */}
              <IconButton
                onClick={playPrevious}
                disabled={!hasPrevious}
                sx={{ color: "#fff", "&.Mui-disabled": { color: "#555" } }}
              >
                <SkipPrevious fontSize="large" />
              </IconButton>

              {/* Play/Pause */}
              <IconButton onClick={handlePlayPause} sx={{ color: "#fff" }}>
                {isPlaying ? (
                  <Pause fontSize="large" />
                ) : (
                  <PlayArrow fontSize="large" />
                )}
              </IconButton>

              {/* Next */}
              <IconButton
                onClick={playNext}
                disabled={!hasNext}
                sx={{ color: "#fff", "&.Mui-disabled": { color: "#555" } }}
              >
                <SkipNext fontSize="large" />
              </IconButton>

              {/* Restart */}
              <IconButton onClick={handleReplay} sx={{ color: "#fff" }}>
                <Replay fontSize="large" />
              </IconButton>

              {/* Volume */}
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mr: 2 }}
              >
                <IconButton onClick={toggleMute} sx={{ color: "#fff" }}>
                  {isMuted ? (
                    <VolumeOff />
                  ) : volume > 0.5 ? (
                    <VolumeUp />
                  ) : volume > 0 ? (
                    <VolumeDown />
                  ) : (
                    <VolumeMute />
                  )}
                </IconButton>
                <Slider
                  value={isMuted ? 0 : volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleVolumeChange}
                  sx={{
                    width: 80,
                    color: "#fff",
                    height: 4,
                    "& .MuiSlider-thumb": {
                      width: 10,
                      height: 10,
                    },
                  }}
                />
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {/* Subtitles Selection */}
              {subtitles.length > 0 && (
                <Box>
                  <Tooltip title="Subtitles">
                    <IconButton
                      onClick={(e) => setSubtitleAnchor(e.currentTarget)}
                      sx={{
                        color:
                          activeSubtitle !== null
                            ? "var(--localflix-red)"
                            : "#fff",
                      }}
                    >
                      <Subtitles />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: {
                        bgcolor: "var(--bg-card)",
                        color: "#fff",
                        border: "1px solid #333",
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => selectSubtitle(null)}
                      selected={activeSubtitle === null}
                    >
                      Off
                    </MenuItem>
                    {subtitles.map((track) => (
                      <MenuItem
                        key={track.index}
                        onClick={() => selectSubtitle(track.index)}
                        selected={activeSubtitle === track.index}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          minWidth: 260,
                        }}
                      >
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {track.title} [{track.language.toUpperCase()}]
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSubtitle(track.title);
                            }}
                            sx={{
                              color: starredSubtitles.includes(track.title) ? "#ffb400" : "var(--text-secondary)",
                              "&:hover": { color: "#ffb400" },
                              p: 0.5,
                            }}
                            title="Star Subtitle"
                          >
                            {starredSubtitles.includes(track.title) ? <Star sx={{ fontSize: 16 }} /> : <StarBorder sx={{ fontSize: 16 }} />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSubtitles(track.index);
                            }}
                            sx={{
                              color: "var(--text-secondary)",
                              "&:hover": { color: "#fff" },
                              p: 0.5,
                            }}
                            title="Download Subtitles"
                          >
                            <Download sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Box>
                      </MenuItem>
                    ))}
                    {activeSubtitle !== null && (
                      <Box>
                        <Box sx={{ borderTop: "1px solid #333", my: 1 }} />
                        <Box
                          sx={{
                            px: 2,
                            py: 1,
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: "var(--text-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            SUBTITLE DELAY
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              justifyContent: "space-between",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={() => adjustSubtitleDelay(-0.5)}
                              sx={{
                                minWidth: 32,
                                p: 0.5,
                                border: "1px solid #333",
                                color: "#fff",
                                "&:hover": { border: "1px solid #555" },
                              }}
                            >
                              -0.5s
                            </Button>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                minWidth: 60,
                                textAlign: "center",
                              }}
                            >
                              {subtitleDelay > 0
                                ? `+${subtitleDelay.toFixed(1)}s`
                                : `${subtitleDelay.toFixed(1)}s`}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => adjustSubtitleDelay(0.5)}
                              sx={{
                                minWidth: 32,
                                p: 0.5,
                                border: "1px solid #333",
                                color: "#fff",
                                "&:hover": { border: "1px solid #555" },
                              }}
                            >
                              +0.5s
                            </Button>
                          </Box>
                        </Box>
                      </Box>
                    )}
                  </Menu>
                </Box>
              )}

              {/* Audio Selection */}
              {audioTracks.length > 0 && (
                <Box>
                  <Tooltip title="Audio Tracks">
                    <IconButton
                      onClick={(e) => setAudioAnchor(e.currentTarget)}
                      sx={{
                        color:
                          activeAudio !== null
                            ? "var(--localflix-red)"
                            : "#fff",
                      }}
                    >
                      <Audiotrack />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: {
                        bgcolor: "var(--bg-card)",
                        color: "#fff",
                        border: "1px solid #333",
                      },
                    }}
                  >
                    <MenuItem
                      onClick={() => selectAudioTrack(null)}
                      selected={activeAudio === null}
                    >
                      Default Audio
                    </MenuItem>
                    {audioTracks.map((track) => (
                      <MenuItem
                        key={track.index}
                        onClick={() => selectAudioTrack(track.index)}
                        selected={activeAudio === track.index}
                      >
                        {track.title} [{track.language.toUpperCase()}]
                      </MenuItem>
                    ))}
                  </Menu>
                </Box>
              )}

              {/* Playback Speed */}
              <Tooltip title="Playback Speed">
                <IconButton
                  onClick={(e) => setSpeedAnchor(e.currentTarget)}
                  sx={{ color: "#fff" }}
                >
                  <Speed />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: {
                    bgcolor: "var(--bg-card)",
                    color: "#fff",
                    border: "1px solid #333",
                  },
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <MenuItem
                    key={s}
                    onClick={() => handleSpeedSelect(s)}
                    selected={playbackSpeed === s}
                  >
                    {s === 1 ? "Normal" : `${s}x`}
                  </MenuItem>
                ))}
              </Menu>

              {/* Picture in Picture */}
              <Tooltip title="Picture-in-Picture">
                <IconButton
                  onClick={togglePictureInPicture}
                  sx={{ color: "#fff" }}
                >
                  <PictureInPicture />
                </IconButton>
              </Tooltip>

              {/* Fullscreen */}
              <IconButton onClick={toggleFullscreen} sx={{ color: "#fff" }}>
                {isFullscreen ? (
                  <FullscreenExit fontSize="large" />
                ) : (
                  <Fullscreen fontSize="large" />
                )}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
