import React, { useState, useEffect } from "react";
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
import type { SxProps, Theme } from "@mui/material";
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
import { useSeekThumbnail } from "../../../hooks/useSeekThumbnail";

const videoStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  objectFit: "contain",
};

const playerContainerSx: SxProps<Theme> = {
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

const subtitleToastSx: SxProps<Theme> = {
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
};

const endedOverlaySx: SxProps<Theme> = {
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
};

const videoFinishedTextSx: SxProps<Theme> = { color: "#fff", fontWeight: 700, mb: 1 };

const videoFinishedSubtextSx: SxProps<Theme> = { color: "var(--text-secondary)", mb: 3 };

const endedButtonsContainerSx: SxProps<Theme> = { display: "flex", gap: 3 };

const startOverButtonSx: SxProps<Theme> = {
  bgcolor: "var(--localflix-red)",
  color: "#fff",
  fontWeight: 600,
  px: 4,
  py: 1.5,
  "&:hover": { bgcolor: "var(--localflix-dark-red)" },
};

const goBackButtonSx: SxProps<Theme> = {
  borderColor: "#555",
  color: "#fff",
  fontWeight: 600,
  px: 4,
  py: 1.5,
  "&:hover": {
    borderColor: "#fff",
    bgcolor: "rgba(255,255,255,0.05)",
  },
};

const bufferingSpinnerSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  position: "absolute",
  zIndex: 10,
};

const controlsOverlaySx: SxProps<Theme> = {
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
  transition: "opacity 0.3s ease-in-out",
  zIndex: 5,
};

const topBarSx: SxProps<Theme> = { p: 3, display: "flex", alignItems: "center" };

const backIconButtonSx: SxProps<Theme> = {
  color: "#fff",
  mr: 2,
  "&:hover": { color: "var(--localflix-red)" },
};

const titleTextSx: SxProps<Theme> = { color: "#fff", fontWeight: 600 };

const centerPlayOverlaySx: SxProps<Theme> = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
};

const bottomBarSx: SxProps<Theme> = { px: 4, pb: 4 };

const progressContainerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 2, mb: 1 };

const timeTextSx: SxProps<Theme> = { color: "#ccc", minWidth: 45 };

const sliderWrapperSx: SxProps<Theme> = {
  position: "relative",
  flexGrow: 1,
  display: "flex",
  alignItems: "center",
};

const customRailSx: SxProps<Theme> = {
  position: "absolute",
  left: 0,
  right: 0,
  height: 4,
  bgcolor: "rgba(255, 255, 255, 0.1)",
  borderRadius: 1,
  pointerEvents: "none",
};

const bufferedTrackSx: SxProps<Theme> = {
  position: "absolute",
  left: 0,
  height: 4,
  bgcolor: "rgba(255, 255, 255, 0.35)",
  borderRadius: 1,
  pointerEvents: "none",
};

const progressSliderSx: SxProps<Theme> = {
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
};

const buttonsRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const buttonsGroupSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1 };

const disabledIconSx: SxProps<Theme> = { color: "#fff", "&.Mui-disabled": { color: "#555" } };

const baseIconSx: SxProps<Theme> = { color: "#fff" };

const volumeContainerSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 1, mr: 2 };

const volumeSliderSx: SxProps<Theme> = {
  width: 80,
  color: "#fff",
  height: 4,
  "& .MuiSlider-thumb": {
    width: 10,
    height: 10,
  },
};

const menuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
};

const subtitleMenuItemSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  minWidth: 260,
};

const flexGrowSx: SxProps<Theme> = { flexGrow: 1 };

const menuItemIconsSx: SxProps<Theme> = { display: "flex", alignItems: "center", gap: 0.5 };

const starIconBaseSx: SxProps<Theme> = {
  "&:hover": { color: "#ffb400" },
  p: 0.5,
};

const downloadIconSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  "&:hover": { color: "#fff" },
  p: 0.5,
};

const delayDividerSx: SxProps<Theme> = { borderTop: "1px solid #333", my: 1 };

const delayContainerSx: SxProps<Theme> = {
  px: 2,
  py: 1,
  display: "flex",
  flexDirection: "column",
  gap: 1,
};

const delayLabelSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  fontWeight: 600,
};

const delayControlsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  justifyContent: "space-between",
};

const delayButtonSx: SxProps<Theme> = {
  minWidth: 32,
  p: 0.5,
  border: "1px solid #333",
  color: "#fff",
  "&:hover": { border: "1px solid #555" },
};

const delayTextSx: SxProps<Theme> = {
  fontWeight: 600,
  minWidth: 60,
  textAlign: "center",
};

const smallIconSx: SxProps<Theme> = { fontSize: 16 };

const controlsVisibleSx: SxProps<Theme> = { ...(controlsOverlaySx as object), opacity: 1, pointerEvents: "auto" };
const controlsHiddenSx: SxProps<Theme> = { ...(controlsOverlaySx as object), opacity: 0, pointerEvents: "none" };

const getBufferedTrackSx = (duration: number, bufferedTime: number): SxProps<Theme> => ({
  ...(bufferedTrackSx as object),
  width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%`,
});

const subtitleActiveIconSx: SxProps<Theme> = { ...(baseIconSx as object), color: "var(--localflix-red)" };
const subtitleInactiveIconSx: SxProps<Theme> = { ...(baseIconSx as object), color: "#fff" };

const starredSx: SxProps<Theme> = { ...(starIconBaseSx as object), color: "#ffb400" };
const unstarredSx: SxProps<Theme> = { ...(starIconBaseSx as object), color: "var(--text-secondary)" };

const audioActiveIconSx: SxProps<Theme> = { ...(baseIconSx as object), color: "var(--localflix-red)" };
const audioInactiveIconSx: SxProps<Theme> = { ...(baseIconSx as object), color: "#fff" };

const thumbnailImageSx: SxProps<Theme> = {
  width: 160,
  height: 90,
  objectFit: "cover",
  borderRadius: "4px",
  display: "block",
};

const thumbnailLoadingSx: SxProps<Theme> = {
  width: 160,
  height: 90,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  bgcolor: "rgba(0, 0, 0, 0.8)",
  borderRadius: "4px",
};

const thumbnailSpinnerSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
};

const thumbnailTimeSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.75rem",
  textAlign: "center",
  mt: 0.5,
};

const getThumbnailContainerSx = (x: number): SxProps<Theme> => ({
  position: "absolute",
  bottom: 24,
  left: x,
  transform: "translateX(-50%)",
  pointerEvents: "none",
  zIndex: 100,
  bgcolor: "rgba(0, 0, 0, 0.9)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  borderRadius: "6px",
  p: 0.5,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
});

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
  const {
    isHovering,
    hoverTime,
    hoverPositionX,
    thumbnailUrl,
    handleMouseMove,
    handleMouseLeave,
  } = useSeekThumbnail(currentVideoPath, duration);

  const [showFallback, setShowFallback] = useState(false);
  const [selectedAudioIndex, setSelectedAudioIndex] = useState<number | null>(activeAudio);

  useEffect(() => {
    if (!isLoading) {
      setShowFallback(false);
      return;
    }
    const timer = setTimeout(() => {
      setShowFallback(true);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    setSelectedAudioIndex(activeAudio);
  }, [activeAudio]);

  const getStreamUrl = (audioIdx: number | null) => {
    const origin = window.location.origin;
    let url = `${origin}/api/video?path=${encodeURIComponent(currentVideoPath)}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`;
    if (audioIdx !== null) {
      url += `&audioTrack=${audioIdx}`;
    }
    return url;
  };
  return (
    <Box
      ref={containerRef}
      sx={playerContainerSx}
      data-style="playerContainerSx"
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
          sx={subtitleToastSx}
          data-style="subtitleToastSx"
        >
          {subtitleToast}
        </Box>
      )}

      {/* Ended Overlay Screen */}
      {isEnded && (
        <Box
          sx={endedOverlaySx}
          data-style="endedOverlaySx"
        >
          <Typography
            variant="h4"
            sx={videoFinishedTextSx}
          >
            Video Finished
          </Typography>
          <Typography
            variant="body1"
            sx={videoFinishedSubtextSx}
          >
            Would you like to start over or return to browsing?
          </Typography>

          <Box sx={endedButtonsContainerSx} data-style="endedButtonsContainerSx">
            <Button
              variant="contained"
              startIcon={<Replay />}
              onClick={handleReplay}
              sx={startOverButtonSx}
            >
              Start Over
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onClose}
              sx={goBackButtonSx}
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
          sx={bufferingSpinnerSx}
        />
      )}

      {isLoading && showFallback && (
        <Box
          sx={{
            position: "absolute",
            top: "65%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            bgcolor: "rgba(0, 0, 0, 0.9)",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            zIndex: 10,
            boxShadow: 24,
            border: "1px solid rgba(255,255,255,0.1)",
            width: 380,
            maxWidth: "90%",
          }}
        >
          <Typography variant="body1" sx={{ color: "#fff", mb: 2, fontWeight: 500 }}>
            Having trouble playing this video?
          </Typography>

          {audioTracks.length > 1 && (
            <Box sx={{ mb: 2.5, textAlign: "left" }}>
              <Typography variant="caption" sx={{ color: "#aaa", mb: 0.5, display: "block", fontWeight: 600 }}>
                Select Audio Language:
              </Typography>
              <select
                value={selectedAudioIndex !== null ? selectedAudioIndex : ""}
                onChange={(e) => setSelectedAudioIndex(e.target.value ? Number(e.target.value) : null)}
                style={{
                  width: "100%",
                  backgroundColor: "#1a1a1a",
                  color: "#fff",
                  border: "1px solid #444",
                  borderRadius: "4px",
                  padding: "8px",
                  fontSize: "0.875rem",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">Default Audio</option>
                {audioTracks.map((track) => (
                  <option key={track.index} value={track.index}>
                    {track.title} ({track.language})
                  </option>
                ))}
              </select>
            </Box>
          )}

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
            <Button
              variant="contained"
              startIcon={<PlayArrow />}
              onClick={() => {
                const streamUrl = getStreamUrl(selectedAudioIndex);
                const vlcUrl = `vlc://${streamUrl.replace(/^https?:\/\//, "")}`;
                onClose();
                window.open(vlcUrl, "_self");
              }}
              sx={{ bgcolor: "var(--localflix-red)", color: "#fff", "&:hover": { bgcolor: "#b71c1c" } }}
            >
              Play in VLC
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                const streamUrl = getStreamUrl(selectedAudioIndex);
                onClose();
                window.open(streamUrl, "_blank");
              }}
              sx={{ color: "#fff", borderColor: "rgba(255,255,255,0.3)", "&:hover": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" } }}
            >
              Stream in New Tab
            </Button>
          </Box>
        </Box>
      )}

      {/* Controls Overlay */}
      <Box
        sx={showControls ? controlsVisibleSx : controlsHiddenSx}
        data-style={showControls ? "controlsVisibleSx" : "controlsHiddenSx"}
      >
        {/* Top Bar */}
        <Box sx={topBarSx} data-style="topBarSx">
          <IconButton
            onClick={onClose}
            sx={backIconButtonSx}
            data-style="backIconButtonSx"
          >
            <ArrowBack fontSize="large" />
          </IconButton>
          <Typography variant="h6" sx={titleTextSx}>
            {currentVideoPath.replace(/\\/g, "/").split("/").pop()}
          </Typography>
        </Box>

        {/* Center Play Button Overlay */}
        <Box
          sx={centerPlayOverlaySx}
          data-style="centerPlayOverlaySx"
          onClick={handlePlayPause}
        />

        {/* Bottom Bar */}
        <Box sx={bottomBarSx} data-style="bottomBarSx">
          {/* Progress Slider */}
          <Box sx={progressContainerSx} data-style="progressContainerSx">
            <Typography variant="body2" sx={timeTextSx}>
              {formatTime(currentTime)}
            </Typography>
            <Box
              sx={sliderWrapperSx}
              data-style="sliderWrapperSx"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Floating Seek Thumbnail Preview */}
              {isHovering && hoverTime !== null && (
                <Box
                  sx={getThumbnailContainerSx(hoverPositionX)}
                  data-style="getThumbnailContainerSx"
                >
                  {thumbnailUrl ? (
                    <Box
                      component="img"
                      src={thumbnailUrl}
                      alt="Preview"
                      sx={thumbnailImageSx}
                      data-style="thumbnailImageSx"
                    />
                  ) : (
                    <Box sx={thumbnailLoadingSx} data-style="thumbnailLoadingSx">
                      <CircularProgress size={24} sx={thumbnailSpinnerSx} />
                    </Box>
                  )}
                  <Typography variant="caption" sx={thumbnailTimeSx}>
                    {formatTime(hoverTime)}
                  </Typography>
                </Box>
              )}
              {/* Custom background rail */}
              <Box
                sx={customRailSx}
                data-style="customRailSx"
              />
              {/* Custom buffered progress track */}
              <Box
                sx={getBufferedTrackSx(duration, bufferedTime)}
                data-style="getBufferedTrackSx"
              />
              <Slider
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
                sx={progressSliderSx}
              />
            </Box>
            <Typography variant="body2" sx={timeTextSx}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Buttons Row */}
          <Box
            sx={buttonsRowSx}
            data-style="buttonsRowSx"
          >
            <Box sx={buttonsGroupSx} data-style="buttonsGroupSx">
              {/* Previous */}
              <IconButton
                onClick={playPrevious}
                disabled={!hasPrevious}
                sx={disabledIconSx}
                data-style="disabledIconSx"
              >
                <SkipPrevious fontSize="large" />
              </IconButton>

              {/* Play/Pause */}
              <IconButton onClick={handlePlayPause} sx={baseIconSx} data-style="baseIconSx">
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
                sx={disabledIconSx}
                data-style="disabledIconSx"
              >
                <SkipNext fontSize="large" />
              </IconButton>

              {/* Restart */}
              <IconButton onClick={handleReplay} sx={baseIconSx} data-style="baseIconSx">
                <Replay fontSize="large" />
              </IconButton>

              {/* Volume */}
              <Box
                sx={volumeContainerSx}
                data-style="volumeContainerSx"
              >
                <IconButton onClick={toggleMute} sx={baseIconSx} data-style="baseIconSx">
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
                  sx={volumeSliderSx}
                />
              </Box>
            </Box>

            <Box sx={buttonsGroupSx} data-style="buttonsGroupSx">
              {/* Subtitles Selection */}
              {subtitles.length > 0 && (
                <Box>
                  <Tooltip title="Subtitles">
                    <IconButton
                      onClick={(e) => setSubtitleAnchor(e.currentTarget)}
                      sx={activeSubtitle !== null ? subtitleActiveIconSx : subtitleInactiveIconSx}
                      data-style={activeSubtitle !== null ? "subtitleActiveIconSx" : "subtitleInactiveIconSx"}
                    >
                      <Subtitles />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: menuPaperSx
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
                        sx={subtitleMenuItemSx}
                      >
                        <Typography variant="body2" sx={flexGrowSx}>
                          {track.title} [{track.language.toUpperCase()}]
                        </Typography>
                        <Box sx={menuItemIconsSx} data-style="menuItemIconsSx">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSubtitle(track.title);
                            }}
                            sx={starredSubtitles.includes(track.title) ? starredSx : unstarredSx}
                            data-style={starredSubtitles.includes(track.title) ? "starredSx" : "unstarredSx"}
                            title="Star Subtitle"
                          >
                            {starredSubtitles.includes(track.title) ? <Star sx={smallIconSx} /> : <StarBorder sx={smallIconSx} />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSubtitles(track.index);
                            }}
                            sx={downloadIconSx}
                            data-style="downloadIconSx"
                            title="Download Subtitles"
                          >
                            <Download sx={smallIconSx} />
                          </IconButton>
                        </Box>
                      </MenuItem>
                    ))}
                    {activeSubtitle !== null && (
                      <Box>
                        <Box sx={delayDividerSx} data-style="delayDividerSx" />
                        <Box
                          sx={delayContainerSx}
                          data-style="delayContainerSx"
                        >
                          <Typography
                            variant="caption"
                            sx={delayLabelSx}
                          >
                            SUBTITLE DELAY
                          </Typography>
                          <Box
                            sx={delayControlsSx}
                            data-style="delayControlsSx"
                          >
                            <Button
                              size="small"
                              onClick={() => adjustSubtitleDelay(-0.5)}
                              sx={delayButtonSx}
                            >
                              -0.5s
                            </Button>
                            <Typography
                              variant="body2"
                              sx={delayTextSx}
                            >
                              {subtitleDelay > 0
                                ? `+${subtitleDelay.toFixed(1)}s`
                                : `${subtitleDelay.toFixed(1)}s`}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => adjustSubtitleDelay(0.5)}
                              sx={delayButtonSx}
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
                      sx={activeAudio !== null ? audioActiveIconSx : audioInactiveIconSx}
                      data-style={activeAudio !== null ? "audioActiveIconSx" : "audioInactiveIconSx"}
                    >
                      <Audiotrack />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: menuPaperSx
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
                  sx={baseIconSx}
                  data-style="baseIconSx"
                >
                  <Speed />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: menuPaperSx
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
                  sx={baseIconSx}
                  data-style="baseIconSx"
                >
                  <PictureInPicture />
                </IconButton>
              </Tooltip>

              {/* Fullscreen */}
              <IconButton onClick={toggleFullscreen} sx={baseIconSx} data-style="baseIconSx">
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
