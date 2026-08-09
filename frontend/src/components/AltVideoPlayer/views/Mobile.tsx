import React from "react";
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  PlayArrow,
  Pause,
  Fullscreen,
  FullscreenExit,
  ArrowBack,
  Subtitles,
  Speed,
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

const altMobilePlayerContainerSx: SxProps<Theme> = {
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

const altMobileEndedOverlaySx: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: "rgba(0, 0, 0, 0.9)",
  zIndex: 100,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
};

const altMobileFinishedTextSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 700,
};

const altMobileFinishedActionsSx: SxProps<Theme> = { display: "flex", gap: 3 };

const altMobileReplayButtonSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.08)",
  p: 2,
};

const altMobileCloseButtonSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.08)",
  p: 2,
};

const altMobileSpinnerOverlaySx: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  zIndex: 50,
  bgcolor: "rgba(0,0,0,0.6)",
  borderRadius: "50%",
  p: 1.5,
  display: "flex",
};

const altMobileCircularProgressSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
};

const altMobileHeaderOverlaySx: SxProps<Theme> = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: 70,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)",
  display: "flex",
  alignItems: "center",
  px: 2,
  zIndex: 10,
};

const altMobileHeaderBackButtonSx: SxProps<Theme> = { color: "#fff", mr: 1 };

const altMobileHeaderTitleSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 600,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const altMobileControlsFooterSx: SxProps<Theme> = {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)",
  pt: 4,
  pb: 2,
  px: 2,
  zIndex: 10,
  display: "flex",
  flexDirection: "column",
  gap: 1.5,
};

const altMobileTimelineContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 1.5,
};

const altMobileTimeTextSx: SxProps<Theme> = { color: "#fff", minWidth: 35 };

const altMobileSliderSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  height: 4,
  py: 1,
  "& .MuiSlider-thumb": {
    width: 12,
    height: 12,
    "&:before": { boxShadow: "none" },
  },
  "& .MuiSlider-rail": {
    bgcolor: "rgba(255,255,255,0.2)",
    opacity: 1,
  },
};

const altMobileActionButtonsContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  px: 1,
};

const altMobilePlaybackControlsSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2.5,
};

const altMobileSkipBtnSx: SxProps<Theme> = {
  color: "#fff",
  p: 0.5,
  "&.Mui-disabled": { color: "rgba(255,255,255,0.2)" },
};

const altMobilePlayPauseBtnSx: SxProps<Theme> = {
  color: "#fff",
  bgcolor: "rgba(255,255,255,0.1)",
  p: 1,
};

const altMobileSettingsRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

const altMobileSubtitlesBtnSx: SxProps<Theme> = {};

const altMobileSubtitlesMenuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
};

const altMobileSubtitlesMenuItemSx: SxProps<Theme> = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 2,
  minWidth: 240,
};

const altMobileSubtitlesTrackTitleSx: SxProps<Theme> = { flexGrow: 1 };

const altMobileSubtitlesStarBtnSx: SxProps<Theme> = { p: 0.5 };

const altMobileStarIconSx: SxProps<Theme> = { fontSize: 16 };

const altMobileAudioBtnSx: SxProps<Theme> = {};

const altMobileAudioMenuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
};

const altMobileSpeedBtnSx: SxProps<Theme> = { color: "#fff" };

const altMobileSpeedMenuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
};

const altMobileFullscreenBtnSx: SxProps<Theme> = { color: "#fff" };

const altMobileSubtitlesActiveSx: SxProps<Theme> = {
  ...(altMobileSubtitlesBtnSx as object),
  color: "var(--localflix-red)",
};
const altMobileSubtitlesInactiveSx: SxProps<Theme> = {
  ...(altMobileSubtitlesBtnSx as object),
  color: "#fff",
};

const altMobileStarredSx: SxProps<Theme> = {
  ...(altMobileSubtitlesStarBtnSx as object),
  color: "#ffb400",
};
const altMobileUnstarredSx: SxProps<Theme> = {
  ...(altMobileSubtitlesStarBtnSx as object),
  color: "var(--text-secondary)",
};

const altMobileAudioActiveSx: SxProps<Theme> = {
  ...(altMobileAudioBtnSx as object),
  color: "var(--localflix-red)",
};
const altMobileAudioInactiveSx: SxProps<Theme> = {
  ...(altMobileAudioBtnSx as object),
  color: "#fff",
};

export const MobileVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  isPlaying,
  duration,
  currentTime,
  currentVideoPath,
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
  toggleFullscreen,
  handleSpeedSelect,
  selectSubtitle,
  selectAudioTrack,
  formatTime,
  starredSubtitles,
  toggleStarSubtitle,
  onClose,
}) => {
  return (
    <Box
      ref={containerRef}
      sx={altMobilePlayerContainerSx}
      data-style="altMobilePlayerContainerSx"
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
        onClick={handlePlayPause}
      />

      {/* Finished Overlay */}
      {isEnded && (
        <Box sx={altMobileEndedOverlaySx} data-style="altMobileEndedOverlaySx">
          <Typography variant="h5" sx={altMobileFinishedTextSx}>
            Playback Finished
          </Typography>
          <Box
            sx={altMobileFinishedActionsSx}
            data-style="altMobileFinishedActionsSx"
          >
            <IconButton
              onClick={handleReplay}
              sx={altMobileReplayButtonSx}
              data-style="altMobileReplayButtonSx"
            >
              <Replay fontSize="large" />
            </IconButton>
            <IconButton
              onClick={onClose}
              sx={altMobileCloseButtonSx}
              data-style="altMobileCloseButtonSx"
            >
              <ArrowBack fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Spinner */}
      {isLoading && (
        <Box
          sx={altMobileSpinnerOverlaySx}
          data-style="altMobileSpinnerOverlaySx"
        >
          <CircularProgress
            sx={altMobileCircularProgressSx}
            size={50}
            thickness={4}
          />
        </Box>
      )}

      {/* Header Overlay */}
      {showControls && (
        <Box
          sx={altMobileHeaderOverlaySx}
          data-style="altMobileHeaderOverlaySx"
        >
          <IconButton
            onClick={onClose}
            sx={altMobileHeaderBackButtonSx}
            data-style="altMobileHeaderBackButtonSx"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="subtitle1" sx={altMobileHeaderTitleSx}>
            {currentVideoPath.replace(/\\/g, "/").split("/").pop()} (Alt Player)
          </Typography>
        </Box>
      )}

      {/* Controls Overlay Footer */}
      {showControls && (
        <Box
          sx={altMobileControlsFooterSx}
          data-style="altMobileControlsFooterSx"
        >
          {/* Timeline slider bar */}
          <Box
            sx={altMobileTimelineContainerSx}
            data-style="altMobileTimelineContainerSx"
          >
            <Typography variant="caption" sx={altMobileTimeTextSx}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              size="small"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              sx={altMobileSliderSx}
            />
            <Typography variant="caption" sx={altMobileTimeTextSx}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Action buttons controls */}
          <Box
            sx={altMobileActionButtonsContainerSx}
            data-style="altMobileActionButtonsContainerSx"
          >
            {/* Playback Controls */}
            <Box
              sx={altMobilePlaybackControlsSx}
              data-style="altMobilePlaybackControlsSx"
            >
              <IconButton
                onClick={playPrevious}
                disabled={!hasPrevious}
                sx={altMobileSkipBtnSx}
                data-style="altMobileSkipBtnSx"
              >
                <SkipPrevious />
              </IconButton>
              <IconButton
                onClick={handlePlayPause}
                sx={altMobilePlayPauseBtnSx}
                data-style="altMobilePlayPauseBtnSx"
              >
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton
                onClick={handleReplay}
                sx={altMobileSkipBtnSx}
                data-style="altMobileSkipBtnSx"
                title="Restart Video"
              >
                <Replay />
              </IconButton>
              <IconButton
                onClick={playNext}
                disabled={!hasNext}
                sx={altMobileSkipBtnSx}
                data-style="altMobileSkipBtnSx"
              >
                <SkipNext />
              </IconButton>
            </Box>

            {/* Settings Row */}
            <Box
              sx={altMobileSettingsRowSx}
              data-style="altMobileSettingsRowSx"
            >
              {/* Subtitles Button */}
              {subtitles.length > 0 && (
                <>
                  <IconButton
                    onClick={(e) => setSubtitleAnchor(e.currentTarget)}
                    sx={
                      activeSubtitle !== null
                        ? altMobileSubtitlesActiveSx
                        : altMobileSubtitlesInactiveSx
                    }
                    data-style={
                      activeSubtitle !== null
                        ? "altMobileSubtitlesActiveSx"
                        : "altMobileSubtitlesInactiveSx"
                    }
                  >
                    <Subtitles />
                  </IconButton>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: altMobileSubtitlesMenuPaperSx,
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
                        sx={altMobileSubtitlesMenuItemSx}
                      >
                        <Typography
                          variant="body2"
                          sx={altMobileSubtitlesTrackTitleSx}
                        >
                          {track.language.toUpperCase()} ({track.title})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarSubtitle(track.title);
                          }}
                          sx={
                            starredSubtitles.includes(track.title)
                              ? altMobileStarredSx
                              : altMobileUnstarredSx
                          }
                          data-style={
                            starredSubtitles.includes(track.title)
                              ? "altMobileStarredSx"
                              : "altMobileUnstarredSx"
                          }
                        >
                          {starredSubtitles.includes(track.title) ? (
                            <Star sx={altMobileStarIconSx} />
                          ) : (
                            <StarBorder sx={altMobileStarIconSx} />
                          )}
                        </IconButton>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Audio Tracks */}
              {audioTracks.length > 0 && (
                <>
                  <IconButton
                    onClick={(e) => setAudioAnchor(e.currentTarget)}
                    sx={
                      activeAudio !== null
                        ? altMobileAudioActiveSx
                        : altMobileAudioInactiveSx
                    }
                    data-style={
                      activeAudio !== null
                        ? "altMobileAudioActiveSx"
                        : "altMobileAudioInactiveSx"
                    }
                  >
                    <Audiotrack />
                  </IconButton>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: altMobileAudioMenuPaperSx,
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
                        {track.language.toUpperCase()} ({track.title})
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Playback Speed */}
              <IconButton
                onClick={(e) => setSpeedAnchor(e.currentTarget)}
                sx={altMobileSpeedBtnSx}
                data-style="altMobileSpeedBtnSx"
              >
                <Speed />
              </IconButton>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: altMobileSpeedMenuPaperSx,
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

              {/* Fullscreen toggle button */}
              <IconButton
                onClick={toggleFullscreen}
                sx={altMobileFullscreenBtnSx}
                data-style="altMobileFullscreenBtnSx"
              >
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
