import React from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
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
} from '@mui/icons-material';
import type { VideoPlayerViewProps } from './types';

export const WebVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  isPlaying,
  duration,
  currentTime,
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
      sx={{
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
      }}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Node - Subtitles are burned into video on backend, so no track tags needed! */}
      <video
        ref={videoRef}
        style={{
          width: '100%',
          height: '100%',
          maxHeight: '100vh',
          objectFit: 'contain',
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
      />

      {/* Ended Overlay Screen */}
      {isEnded && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            Playback Finished
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tooltip title="Replay">
              <IconButton onClick={handleReplay} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, '&:hover': { bgcolor: 'var(--localflix-red)' } }}>
                <Replay sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Back to Files">
              <IconButton onClick={onClose} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', p: 1.5, '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                <ArrowBack sx={{ fontSize: 28 }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      )}

      {/* Buffer/Loading Spinner */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            bgcolor: 'rgba(0,0,0,0.5)',
            borderRadius: '50%',
            p: 2,
            display: 'flex',
          }}
        >
          <CircularProgress sx={{ color: 'var(--localflix-red)' }} size={60} thickness={4} />
        </Box>
      )}

      {/* Player Header Overlay */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            px: 4,
            zIndex: 10,
          }}
        >
          <IconButton onClick={onClose} sx={{ color: '#fff', mr: 2, '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600 }}>
            Alt Player (QSV Hardware Transcode Mode)
          </Typography>
        </Box>
      )}

      {/* Player Controls Bar Overlay */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            pt: 4,
            pb: 3,
            px: 4,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}
        >
          {/* Timeline slider bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#fff', minWidth: 45, textAlign: 'right' }}>
              {formatTime(currentTime)}
            </Typography>
            <Slider
              size="small"
              value={currentTime}
              min={0}
              max={duration || 100}
              onChange={handleSeek}
              sx={{
                color: 'var(--localflix-red)',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.2s',
                  '&:before': { boxShadow: 'none' },
                  '&:hover, &.Mui-focusVisible, &.Mui-active': {
                    boxShadow: 'none',
                    width: 16,
                    height: 16,
                  },
                },
                '& .MuiSlider-rail': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  opacity: 1,
                },
                '& .MuiSlider-track': {
                  border: 'none',
                },
              }}
            />
            <Typography variant="body2" sx={{ color: '#fff', minWidth: 45 }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Action buttons controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={playPrevious} disabled={!hasPrevious} sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}>
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={handlePlayPause} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', '&:hover': { bgcolor: 'rgba(255,255,255,0.2)' } }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={playNext} disabled={!hasNext} sx={{ color: '#fff', '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}>
                <SkipNext />
              </IconButton>

              {/* Volume Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2, width: 150 }}>
                <IconButton onClick={toggleMute} sx={{ color: '#fff' }}>
                  {isMuted || volume === 0 ? <VolumeOff /> : volume < 0.3 ? <VolumeMute /> : volume < 0.7 ? <VolumeDown /> : <VolumeUp />}
                </IconButton>
                <Slider
                  size="small"
                  value={isMuted ? 0 : volume}
                  min={0}
                  max={1}
                  step={0.05}
                  onChange={handleVolumeChange}
                  sx={{
                    color: '#fff',
                    '& .MuiSlider-thumb': {
                      width: 10,
                      height: 10,
                    },
                    '& .MuiSlider-rail': {
                      bgcolor: 'rgba(255,255,255,0.2)',
                    },
                  }}
                />
              </Box>
            </Box>

            {/* Right Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Subtitles Selection */}
              {subtitles.length > 0 && (
                <>
                  <Tooltip title="Subtitles (QSV Hardcode)">
                    <IconButton onClick={(e) => setSubtitleAnchor(e.currentTarget)} sx={{ color: activeSubtitle !== null ? 'var(--localflix-red)' : '#fff' }}>
                      <Subtitles />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={subtitleAnchor}
                    open={Boolean(subtitleAnchor)}
                    onClose={() => setSubtitleAnchor(null)}
                    PaperProps={{
                      sx: { bgcolor: 'var(--bg-card)', color: '#fff', border: '1px solid #333' }
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
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 2,
                          minWidth: 240,
                        }}
                      >
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {track.title} [{track.language.toUpperCase()}]
                        </Typography>
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
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Audio Selection */}
              {audioTracks.length > 0 && (
                <>
                  <Tooltip title="Audio Tracks">
                    <IconButton onClick={(e) => setAudioAnchor(e.currentTarget)} sx={{ color: activeAudio !== null ? 'var(--localflix-red)' : '#fff' }}>
                      <Audiotrack />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={audioAnchor}
                    open={Boolean(audioAnchor)}
                    onClose={() => setAudioAnchor(null)}
                    PaperProps={{
                      sx: { bgcolor: 'var(--bg-card)', color: '#fff', border: '1px solid #333' }
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
                        {track.title} [{track.language.toUpperCase()}]
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Playback Speed */}
              <Tooltip title="Playback Speed">
                <IconButton onClick={(e) => setSpeedAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
                  <Speed />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={speedAnchor}
                open={Boolean(speedAnchor)}
                onClose={() => setSpeedAnchor(null)}
                PaperProps={{
                  sx: { bgcolor: 'var(--bg-card)', color: '#fff', border: '1px solid #333' }
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((s) => (
                  <MenuItem key={s} onClick={() => handleSpeedSelect(s)} selected={playbackSpeed === s}>
                    {s === 1 ? 'Normal' : `${s}x`}
                  </MenuItem>
                ))}
              </Menu>

              {/* Picture in Picture */}
              <Tooltip title="Picture-in-Picture">
                <IconButton onClick={togglePictureInPicture} sx={{ color: '#fff' }}>
                  <PictureInPicture />
                </IconButton>
              </Tooltip>

              {/* Fullscreen toggle button */}
              <Tooltip title="Fullscreen">
                <IconButton onClick={toggleFullscreen} sx={{ color: '#fff' }}>
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
