import React from 'react';
import type { SxProps, Theme } from '@mui/material';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
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
  Download,
  Star,
  StarBorder,
} from '@mui/icons-material';
import type { VideoPlayerViewProps } from './types';
import { useSeekThumbnail } from '../../../hooks/useSeekThumbnail';

const videoStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  maxHeight: '100vh',
  objectFit: 'contain',
};

const mobileContainerSx: SxProps<Theme> = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#000',
  zIndex: 1250,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  userSelect: 'none',
};

const subtitleToastSx: SxProps<Theme> = {
  position: 'absolute',
  bottom: 80, // positioned safely above mobile controls
  left: '50%',
  transform: 'translateX(-50%)',
  bgcolor: 'rgba(0, 0, 0, 0.8)',
  color: '#fff',
  px: 2.5,
  py: 0.75,
  borderRadius: 1.5,
  fontSize: '0.9rem',
  fontWeight: 600,
  pointerEvents: 'none',
  zIndex: 110,
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
  animation: 'fadeInOut 0.2s ease',
  '@keyframes fadeInOut': {
    from: { opacity: 0, transform: 'translate(-50%, 12px)' },
    to: { opacity: 1, transform: 'translate(-50%, 0)' }
  }
};

const endedOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: 'rgba(0, 0, 0, 0.9)',
  zIndex: 100,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  p: 3,
};

const endedTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 700,
  mb: 1,
  textAlign: 'center'
};

const endedActionsContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
  maxWidth: 260
};

const replayButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  py: 1.25,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' }
};

const goBackButtonSx: SxProps<Theme> = {
  borderColor: '#444',
  color: '#fff',
  fontWeight: 600,
  py: 1.25,
};

const loadingSpinnerSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  position: 'absolute',
  zIndex: 10,
};

const controlsOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.9) 100%)',
  transition: 'opacity 0.25s ease-in-out',
  zIndex: 5,
};

const headerContainerSx: SxProps<Theme> = {
  p: 2,
  display: 'flex',
  alignItems: 'center'
};

const backButtonSx: SxProps<Theme> = {
  color: '#fff',
  mr: 1
};

const headerTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 'calc(100vw - 80px)'
};

const centerControlsContainerSx: SxProps<Theme> = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 4,
};

const skipButtonSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(0,0,0,0.4)',
  p: 1.5,
  '&.Mui-disabled': { color: '#444' }
};

const playPauseButtonSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'var(--localflix-red)',
  p: 2,
  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
};

const bottomPanelSx: SxProps<Theme> = {
  px: 2.5,
  pb: 3
};

const timeScrubberContainerSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  mb: 2
};

const timeTextSx: SxProps<Theme> = {
  color: '#ccc',
  minWidth: 35
};

const sliderContainerSx: SxProps<Theme> = {
  position: 'relative',
  flexGrow: 1,
  display: 'flex',
  alignItems: 'center'
};

const sliderRailSx: SxProps<Theme> = {
  position: 'absolute',
  left: 0,
  right: 0,
  height: 4,
  bgcolor: 'rgba(255, 255, 255, 0.1)',
  borderRadius: 1,
  pointerEvents: 'none',
};

const sliderBufferTrackSx: SxProps<Theme> = {
  position: 'absolute',
  left: 0,
  height: 4,
  bgcolor: 'rgba(255, 255, 255, 0.35)',
  borderRadius: 1,
  pointerEvents: 'none',
};

const sliderSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  height: 4,
  padding: '13px 0',
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
  },
  '& .MuiSlider-rail': {
    opacity: 0,
  },
  '& .MuiSlider-track': {
    border: 'none',
  },
};

const settingsRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
};

const settingsGroupSx: SxProps<Theme> = {
  display: 'flex',
  gap: 2
};

const controlIconButtonSx: SxProps<Theme> = {
  color: '#fff'
};

const menuPaperPropsSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  color: '#fff',
  border: '1px solid #333'
};

const subtitleMenuItemSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 2,
  minWidth: 240
};

const subtitleMenuTextSx: SxProps<Theme> = {
  flexGrow: 1
};

const subtitleActionsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5
};

const starButtonSx: SxProps<Theme> = {
  p: 0.5,
};

const smallIconSx: SxProps<Theme> = {
  fontSize: 16
};

const downloadButtonSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  p: 0.5
};

const menuDividerSx: SxProps<Theme> = {
  borderTop: '1px solid #333',
  my: 1
};

const subtitleDelayContainerSx: SxProps<Theme> = {
  px: 2,
  py: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 1
};

const subtitleDelayLabelSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  fontWeight: 600
};

const subtitleDelayControlsSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
  justifyContent: 'space-between'
};

const delayButtonSx: SxProps<Theme> = {
  minWidth: 32,
  p: 0.5,
  border: '1px solid #333',
  color: '#fff'
};

const delayValueTextSx: SxProps<Theme> = {
  fontWeight: 600,
  minWidth: 50,
  textAlign: 'center'
};

const controlsVisibleSx: SxProps<Theme> = { ...(controlsOverlaySx as object), opacity: 1, pointerEvents: 'auto' };
const controlsHiddenSx: SxProps<Theme> = { ...(controlsOverlaySx as object), opacity: 0, pointerEvents: 'none' };

const getBufferTrackSx = (duration: number, bufferedTime: number): SxProps<Theme> => ({
  ...(sliderBufferTrackSx as object),
  width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%`
});

const subtitleActiveButtonSx: SxProps<Theme> = { ...(controlIconButtonSx as object), color: 'var(--localflix-red)' };
const subtitleInactiveButtonSx: SxProps<Theme> = { ...(controlIconButtonSx as object), color: '#fff' };

const starredButtonSx: SxProps<Theme> = { ...(starButtonSx as object), color: '#ffb400' };
const unstarredButtonSx: SxProps<Theme> = { ...(starButtonSx as object), color: 'var(--text-secondary)' };

const audioActiveButtonSx: SxProps<Theme> = { ...(controlIconButtonSx as object), color: 'var(--localflix-red)' };
const audioInactiveButtonSx: SxProps<Theme> = { ...(controlIconButtonSx as object), color: '#fff' };

const thumbnailImageSx: SxProps<Theme> = {
  width: 140,
  height: 80,
  objectFit: 'cover',
  borderRadius: '4px',
  display: 'block',
};

const thumbnailLoadingSx: SxProps<Theme> = {
  width: 140,
  height: 80,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'rgba(0, 0, 0, 0.8)',
  borderRadius: '4px',
};

const thumbnailSpinnerSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
};

const thumbnailTimeSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  fontSize: '0.75rem',
  textAlign: 'center',
  mt: 0.5,
};

const getThumbnailContainerSx = (x: number): SxProps<Theme> => ({
  position: 'absolute',
  bottom: 24,
  left: x,
  transform: 'translateX(-50%)',
  pointerEvents: 'none',
  zIndex: 100,
  bgcolor: 'rgba(0, 0, 0, 0.9)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: '6px',
  p: 0.5,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
});

export const MobileVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  profileId,
  profileToken,
  isPlaying,
  duration,
  currentTime,
  bufferedTime,
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
  toggleFullscreen,
  handleSpeedSelect,
  selectSubtitle,
  selectAudioTrack,
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
  return (
    <Box
      ref={containerRef}
      sx={mobileContainerSx}
      data-style="mobileContainerSx"
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

      {/* Finished Overlay */}
      {isEnded && (
        <Box
          sx={endedOverlaySx}
          data-style="endedOverlaySx"
        >
          <Typography variant="h5" sx={endedTitleSx}>
            Video Finished
          </Typography>
          
          <Box sx={endedActionsContainerSx} data-style="endedActionsContainerSx">
            <Button
              variant="contained"
              startIcon={<Replay />}
              onClick={handleReplay}
              sx={replayButtonSx}
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

      {/* Buffering */}
      {isLoading && (
        <CircularProgress
          size={60}
          sx={loadingSpinnerSx}
        />
      )}

      {/* Mobile Controls Overlay */}
      <Box
        sx={showControls ? controlsVisibleSx : controlsHiddenSx}
        data-style={showControls ? "controlsVisibleSx" : "controlsHiddenSx"}
      >
        {/* Top Header */}
        <Box sx={headerContainerSx} data-style="headerContainerSx">
          <IconButton
            onClick={onClose}
            sx={backButtonSx}
            data-style="backButtonSx"
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="body1" sx={headerTitleSx}>
            {currentVideoPath.replace(/\\/g, '/').split('/').pop()}
          </Typography>
        </Box>

        {/* Center Control Group (Play, Prev, Next) */}
        <Box
          sx={centerControlsContainerSx}
          data-style="centerControlsContainerSx"
        >
          <IconButton
            onClick={playPrevious}
            disabled={!hasPrevious}
            sx={skipButtonSx}
            data-style="skipButtonSx"
          >
            <SkipPrevious fontSize="large" />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            sx={playPauseButtonSx}
            data-style="playPauseButtonSx"
          >
            {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
          </IconButton>

          <IconButton
            onClick={playNext}
            disabled={!hasNext}
            sx={skipButtonSx}
            data-style="skipButtonSx"
          >
            <SkipNext fontSize="large" />
          </IconButton>
        </Box>

        {/* Bottom Panel */}
        <Box sx={bottomPanelSx} data-style="bottomPanelSx">
          {/* Time Scrubber */}
          <Box sx={timeScrubberContainerSx} data-style="timeScrubberContainerSx">
            <Typography variant="caption" sx={timeTextSx}>
              {formatTime(currentTime)}
            </Typography>
            <Box
              sx={sliderContainerSx}
              data-style="sliderContainerSx"
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
                      <CircularProgress size={20} sx={thumbnailSpinnerSx} />
                    </Box>
                  )}
                  <Typography variant="caption" sx={thumbnailTimeSx}>
                    {formatTime(hoverTime)}
                  </Typography>
                </Box>
              )}
              {/* Custom background rail */}
              <Box
                sx={sliderRailSx}
                data-style="sliderRailSx"
              />
              {/* Custom buffered progress track */}
              <Box
                sx={getBufferTrackSx(duration, bufferedTime)}
                data-style="getBufferTrackSx"
              />
              <Slider
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
                sx={sliderSx}
              />
            </Box>
            <Typography variant="caption" sx={timeTextSx}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Settings Row */}
          <Box sx={settingsRowSx} data-style="settingsRowSx">
            <Box sx={settingsGroupSx} data-style="settingsGroupSx">
              {/* Subtitles Button */}
              {subtitles.length > 0 && (
                <>
                  <IconButton onClick={(e) => setSubtitleAnchor(e.currentTarget)} sx={activeSubtitle !== null ? subtitleActiveButtonSx : subtitleInactiveButtonSx} data-style={activeSubtitle !== null ? "subtitleActiveButtonSx" : "subtitleInactiveButtonSx"}>
                    <Subtitles />
                  </IconButton>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: menuPaperPropsSx
                    }}
                  >
                    <MenuItem onClick={() => selectSubtitle(null)} selected={activeSubtitle === null}>
                      Off
                    </MenuItem>
                    {subtitles.map((track) => (
                      <MenuItem
                        key={track.index}
                        onClick={() => selectSubtitle(track.index)}
                        selected={activeSubtitle === track.index}
                        sx={subtitleMenuItemSx}
                      >
                        <Typography variant="body2" sx={subtitleMenuTextSx}>
                          {track.language.toUpperCase()} ({track.title})
                        </Typography>
                        <Box sx={subtitleActionsSx} data-style="subtitleActionsSx">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarSubtitle(track.title);
                            }}
                            sx={starredSubtitles.includes(track.title) ? starredButtonSx : unstarredButtonSx}
                            data-style={starredSubtitles.includes(track.title) ? "starredButtonSx" : "unstarredButtonSx"}
                          >
                            {starredSubtitles.includes(track.title) ? <Star sx={smallIconSx} /> : <StarBorder sx={smallIconSx} />}
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              downloadSubtitles(track.index);
                            }}
                            sx={downloadButtonSx}
                            data-style="downloadButtonSx"
                          >
                            <Download sx={smallIconSx} />
                          </IconButton>
                        </Box>
                      </MenuItem>
                    ))}
                    {activeSubtitle !== null && (
                      <Box>
                        <Box sx={menuDividerSx} data-style="menuDividerSx" />
                        <Box sx={subtitleDelayContainerSx} data-style="subtitleDelayContainerSx">
                          <Typography variant="caption" sx={subtitleDelayLabelSx}>
                            SUBTITLE DELAY
                          </Typography>
                          <Box sx={subtitleDelayControlsSx} data-style="subtitleDelayControlsSx">
                            <Button
                              size="small"
                              onClick={() => adjustSubtitleDelay(-0.5)}
                              sx={delayButtonSx}
                            >
                              -0.5s
                            </Button>
                            <Typography variant="body2" sx={delayValueTextSx}>
                              {subtitleDelay > 0 ? `+${subtitleDelay.toFixed(1)}s` : `${subtitleDelay.toFixed(1)}s`}
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
                </>
              )}

              {/* Audio Tracks */}
              {audioTracks.length > 0 && (
                <>
                  <IconButton onClick={(e) => setAudioAnchor(e.currentTarget)} sx={activeAudio !== null ? audioActiveButtonSx : audioInactiveButtonSx} data-style={activeAudio !== null ? "audioActiveButtonSx" : "audioInactiveButtonSx"}>
                    <Audiotrack />
                  </IconButton>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: menuPaperPropsSx
                    }}
                  >
                    <MenuItem onClick={() => selectAudioTrack(null)} selected={activeAudio === null}>
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
              <IconButton onClick={(e) => setSpeedAnchor(e.currentTarget)} sx={controlIconButtonSx} data-style="controlIconButtonSx">
                <Speed />
              </IconButton>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: menuPaperPropsSx
                }}
              >
                {[0.5, 1, 1.5, 2].map((s) => (
                  <MenuItem
                    key={s}
                    onClick={() => handleSpeedSelect(s)}
                    selected={playbackSpeed === s}
                  >
                    {s === 1 ? 'Normal' : `${s}x`}
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Fullscreen Toggle */}
            <IconButton onClick={toggleFullscreen} sx={controlIconButtonSx} data-style="controlIconButtonSx">
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
