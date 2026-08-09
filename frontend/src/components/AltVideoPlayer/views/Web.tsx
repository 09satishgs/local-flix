import React from "react";
import type { SxProps, Theme } from "@mui/material";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
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
  Star,
  StarBorder,
} from "@mui/icons-material";
import type { VideoPlayerViewProps } from "./types";

const videoStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  objectFit: "contain",
};

const altPlayerContainerSx: SxProps<Theme> = {
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
};

const altEndedOverlaySx: SxProps<Theme> = {
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
};

const altPlaybackFinishedTextSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 700,
  mb: 1,
};
const altReplayButtonsContainerSx: SxProps<Theme> = { display: "flex", gap: 2 };
const altReplayButtonSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.1)",
  p: 1.5,
  "&:hover": { bgcolor: "var(--localflix-red)" },
};
const altReplayIconSx: SxProps<Theme> = { fontSize: 28 };
const altBackButtonSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.1)",
  p: 1.5,
  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
};
const altBackIconSx: SxProps<Theme> = { fontSize: 28 };

const altSpinnerContainerSx: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 50,
  bgcolor: "rgba(0,0,0,0.5)",
  borderRadius: "50%",
  p: 2,
  display: "flex",
};
const altSpinnerSx: SxProps<Theme> = { color: "var(--localflix-red)" };

const altHeaderOverlaySx: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 100,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
  display: "flex",
  alignItems: "center",
  px: 4,
  zIndex: 10,
};
const altHeaderBackButtonSx: SxProps<Theme> = {
  color: "#fff",
  mr: 2,
  "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
};
const altHeaderTitleSx: SxProps<Theme> = { color: "#fff", fontWeight: 600 };

const altControlsOverlaySx: SxProps<Theme> = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
  pt: 4,
  pb: 3,
  px: 4,
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const altTimelineContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};
const altTimelineTimeLeftSx: SxProps<Theme> = {
  color: "#fff",
  minWidth: 45,
  textAlign: "right",
};
const altTimelineSliderSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  height: 4,
  "& .MuiSlider-thumb": {
    width: 12,
    height: 12,
    transition: "0.2s",
    "&:before": { boxShadow: "none" },
    "&:hover, &.Mui-focusVisible, &.Mui-active": {
      boxShadow: "none",
      width: 16,
      height: 16,
    },
  },
  "& .MuiSlider-rail": {
    bgcolor: "rgba(255,255,255,0.2)",
    opacity: 1,
  },
  "& .MuiSlider-track": {
    border: "none",
  },
};
const altTimelineTimeRightSx: SxProps<Theme> = { color: "#fff", minWidth: 45 };

const altActionButtonsContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const altLeftControlsContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};
const altSkipButtonSx: SxProps<Theme> = {
  color: "#fff",
  "&.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
};
const altPlayPauseButtonSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.1)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
};

const altVolumeContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  ml: 2,
  width: 150,
};
const altVolumeButtonSx: SxProps<Theme> = { color: "#fff" };
const altVolumeSliderSx: SxProps<Theme> = {
  color: "#fff",
  "& .MuiSlider-thumb": {
    width: 10,
    height: 10,
  },
  "& .MuiSlider-rail": {
    bgcolor: "rgba(255,255,255,0.2)",
  },
};

const altRightControlsContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1,
};
const altSubtitleButtonSx: SxProps<Theme> = {};
const altSubtitleActiveButtonSx: SxProps<Theme> = {
  ...(altSubtitleButtonSx as object),
  color: "var(--localflix-red)",
};
const altSubtitleInactiveButtonSx: SxProps<Theme> = {
  ...(altSubtitleButtonSx as object),
  color: "#fff",
};
const altMenuPaperPropsSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
};
const altMenuItemTrackSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  minWidth: 240,
};
const altMenuItemTrackTitleSx: SxProps<Theme> = { flexGrow: 1 };
const altStarButtonSx: SxProps<Theme> = {
  "&:hover": { color: "#ffb400" },
  p: 0.5,
};
const altStarredButtonSx: SxProps<Theme> = {
  ...(altStarButtonSx as object),
  color: "#ffb400",
};
const altUnstarredButtonSx: SxProps<Theme> = {
  ...(altStarButtonSx as object),
  color: "var(--text-secondary)",
};
const altStarIconSx: SxProps<Theme> = { fontSize: 16 };
const altAudioButtonSx: SxProps<Theme> = {};
const altAudioActiveButtonSx: SxProps<Theme> = {
  ...(altAudioButtonSx as object),
  color: "var(--localflix-red)",
};
const altAudioInactiveButtonSx: SxProps<Theme> = {
  ...(altAudioButtonSx as object),
  color: "#fff",
};
const altSpeedButtonSx: SxProps<Theme> = { color: "#fff" };
const altPipButtonSx: SxProps<Theme> = { color: "#fff" };
const altFullscreenButtonSx: SxProps<Theme> = { color: "#fff" };

export const WebVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  isPlaying,
  duration,
  currentTime,
  currentVideoPath,
  volume,
  isMuted,
  isLoading,
  playbackSpeed,
  showControls,
  isFullscreen,
  isEnded,
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
  starredSubtitles,
  toggleStarSubtitle,
  onClose,
}) => {
  return (
    <Box
      ref={containerRef}
      sx={altPlayerContainerSx}
      data-style="altPlayerContainerSx"
      onDoubleClick={toggleFullscreen}
    >
      <video
        ref={videoRef}
        style={videoStyle}
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
      />

      {/* Ended Overlay Screen */}
      {isEnded && (
        <Box sx={altEndedOverlaySx} data-style="altEndedOverlaySx">
          <Typography variant="h4" sx={altPlaybackFinishedTextSx}>
            Playback Finished
          </Typography>
          <Box
            sx={altReplayButtonsContainerSx}
            data-style="altReplayButtonsContainerSx"
          >
            <Tooltip title="Replay">
              <IconButton
                onClick={handleReplay}
                sx={altReplayButtonSx}
                data-style="altReplayButtonSx"
              >
                <Replay sx={altReplayIconSx} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to Files">
              <IconButton
                onClick={onClose}
                sx={altBackButtonSx}
                data-style="altBackButtonSx"
              >
                <ArrowBack sx={altBackIconSx} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Buffer/Loading Spinner */}
      {isLoading && (
        <Box sx={altSpinnerContainerSx} data-style="altSpinnerContainerSx">
          <CircularProgress sx={altSpinnerSx} size={60} thickness={4} />
        </Box>
      )}

      {/* Player Header Overlay */}
      {showControls && (
        <Box sx={altHeaderOverlaySx} data-style="altHeaderOverlaySx">
          <IconButton
            onClick={onClose}
            sx={altHeaderBackButtonSx}
            data-style="altHeaderBackButtonSx"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={altHeaderTitleSx}>
            {currentVideoPath.replace(/\\/g, "/").split("/").pop()} (Alt Player)
          </Typography>
        </Box>
      )}

      {/* Player Controls Bar Overlay */}
      {showControls && (
        <Box sx={altControlsOverlaySx} data-style="altControlsOverlaySx">
          {/* Timeline slider bar */}
          <Box sx={altTimelineContainerSx} data-style="altTimelineContainerSx">
            <Typography variant="body2" sx={altTimelineTimeLeftSx}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              size="small"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              sx={altTimelineSliderSx}
            />
            <Typography variant="body2" sx={altTimelineTimeRightSx}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Action buttons controls */}
          <Box
            sx={altActionButtonsContainerSx}
            data-style="altActionButtonsContainerSx"
          >
            {/* Left Controls */}
            <Box
              sx={altLeftControlsContainerSx}
              data-style="altLeftControlsContainerSx"
            >
              <IconButton
                onClick={playPrevious}
                disabled={!hasPrevious}
                sx={altSkipButtonSx}
                data-style="altSkipButtonSx"
              >
                <SkipPrevious />
              </IconButton>
              <IconButton
                onClick={handlePlayPause}
                sx={altPlayPauseButtonSx}
                data-style="altPlayPauseButtonSx"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <Tooltip title="Restart Video">
                <IconButton
                  onClick={handleReplay}
                  sx={altSkipButtonSx}
                  data-style="altSkipButtonSx"
                >
                  <Replay />
                </IconButton>
              </Tooltip>
              <IconButton
                onClick={playNext}
                disabled={!hasNext}
                sx={altSkipButtonSx}
                data-style="altSkipButtonSx"
              >
                <SkipNext />
              </IconButton>

              {/* Volume Slider */}
              <Box sx={altVolumeContainerSx} data-style="altVolumeContainerSx">
                <IconButton
                  onClick={toggleMute}
                  sx={altVolumeButtonSx}
                  data-style="altVolumeButtonSx"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeOff />
                  ) : volume < 0.3 ? (
                    <VolumeMute />
                  ) : volume < 0.7 ? (
                    <VolumeDown />
                  ) : (
                    <VolumeUp />
                  )}
                </IconButton>
                <Slider
                  size="small"
                  value={isMuted ? 0 : volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleVolumeChange}
                  sx={altVolumeSliderSx}
                />
              </Box>
            </Box>

            {/* Right Controls */}
            <Box
              sx={altRightControlsContainerSx}
              data-style="altRightControlsContainerSx"
            >
              {/* Subtitles Selection */}
              {subtitles.length > 0 && (
                <>
                  <Tooltip title="Subtitles (QSV Hardcode)">
                    <IconButton
                      onClick={(e) => setSubtitleAnchor(e.currentTarget)}
                      sx={
                        activeSubtitle !== null
                          ? altSubtitleActiveButtonSx
                          : altSubtitleInactiveButtonSx
                      }
                      data-style={
                        activeSubtitle !== null
                          ? "altSubtitleActiveButtonSx"
                          : "altSubtitleInactiveButtonSx"
                      }
                    >
                      <Subtitles />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: altMenuPaperPropsSx,
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
                        sx={altMenuItemTrackSx}
                      >
                        <Typography
                          variant="body2"
                          sx={altMenuItemTrackTitleSx}
                        >
                          {track.title} [{track.language.toUpperCase()}]
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarSubtitle(track.title);
                          }}
                          sx={
                            starredSubtitles.includes(track.title)
                              ? altStarredButtonSx
                              : altUnstarredButtonSx
                          }
                          data-style={
                            starredSubtitles.includes(track.title)
                              ? "altStarredButtonSx"
                              : "altUnstarredButtonSx"
                          }
                          title="Star Subtitle"
                        >
                          {starredSubtitles.includes(track.title) ? (
                            <Star sx={altStarIconSx} />
                          ) : (
                            <StarBorder sx={altStarIconSx} />
                          )}
                        </IconButton>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Audio Selection */}
              {audioTracks.length > 0 && (
                <>
                  <Tooltip title="Audio Tracks">
                    <IconButton
                      onClick={(e) => setAudioAnchor(e.currentTarget)}
                      sx={
                        activeAudio !== null
                          ? altAudioActiveButtonSx
                          : altAudioInactiveButtonSx
                      }
                      data-style={
                        activeAudio !== null
                          ? "altAudioActiveButtonSx"
                          : "altAudioInactiveButtonSx"
                      }
                    >
                      <Audiotrack />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: altMenuPaperPropsSx,
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
                </>
              )}

              {/* Playback Speed */}
              <Tooltip title="Playback Speed">
                <IconButton
                  onClick={(e) => setSpeedAnchor(e.currentTarget)}
                  sx={altSpeedButtonSx}
                  data-style="altSpeedButtonSx"
                >
                  <Speed />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: altMenuPaperPropsSx,
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
                  sx={altPipButtonSx}
                  data-style="altPipButtonSx"
                >
                  <PictureInPicture />
                </IconButton>
              </Tooltip>

              {/* Fullscreen toggle button */}
              <Tooltip title="Fullscreen">
                <IconButton
                  onClick={toggleFullscreen}
                  sx={altFullscreenButtonSx}
                  data-style="altFullscreenButtonSx"
                >
                  {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
