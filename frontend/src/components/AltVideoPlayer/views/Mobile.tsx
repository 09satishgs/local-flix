import React from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  Menu,
  MenuItem,
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
  Star,
  StarBorder,
} from '@mui/icons-material';
import type { VideoPlayerViewProps } from './types';

export const MobileVideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  videoRef,
  containerRef,
  isPlaying,
  duration,
  currentTime,
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
        onClick={handlePlayPause}
      />

      {/* Finished Overlay */}
      {isEnded && (
        <Box
          sx={{
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
            gap: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
            Playback Finished
          </Typography>
          <Box sx={{ display: 'flex', gap: 3 }}>
            <IconButton onClick={handleReplay} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', p: 2 }}>
              <Replay fontSize="large" />
            </IconButton>
            <IconButton onClick={onClose} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.08)', p: 2 }}>
              <ArrowBack fontSize="large" />
            </IconButton>
          </Box>
        </Box>
      )}

      {/* Spinner */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 50,
            bgcolor: 'rgba(0,0,0,0.6)',
            borderRadius: '50%',
            p: 1.5,
            display: 'flex',
          }}
        >
          <CircularProgress sx={{ color: 'var(--localflix-red)' }} size={50} thickness={4} />
        </Box>
      )}

      {/* Header Overlay */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 70,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            zIndex: 10,
          }}
        >
          <IconButton onClick={onClose} sx={{ color: '#fff', mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Alt Player (QSV Transcode)
          </Typography>
        </Box>
      )}

      {/* Controls Overlay Footer */}
      {showControls && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 100%)',
            pt: 4,
            pb: 2,
            px: 2,
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
          }}
        >
          {/* Timeline slider bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1.5 }}>
            <Typography variant="caption" sx={{ color: '#fff', minWidth: 35 }}>
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
                py: 1,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  '&:before': { boxShadow: 'none' },
                },
                '& .MuiSlider-rail': {
                  bgcolor: 'rgba(255,255,255,0.2)',
                  opacity: 1,
                },
              }}
            />
            <Typography variant="caption" sx={{ color: '#fff', minWidth: 35 }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Action buttons controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
            {/* Playback Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <IconButton onClick={playPrevious} disabled={!hasPrevious} sx={{ color: '#fff', p: 0.5, '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}>
                <SkipPrevious />
              </IconButton>
              <IconButton onClick={handlePlayPause} sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,0.1)', p: 1 }}>
                {isPlaying ? <Pause /> : <PlayArrow />}
              </IconButton>
              <IconButton onClick={playNext} disabled={!hasNext} sx={{ color: '#fff', p: 0.5, '&.Mui-disabled': { color: 'rgba(255,255,255,0.2)' } }}>
                <SkipNext />
              </IconButton>
            </Box>

            {/* Settings Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Subtitles Button */}
              {subtitles.length > 0 && (
                <>
                  <IconButton onClick={(e) => setSubtitleAnchor(e.currentTarget)} sx={{ color: activeSubtitle !== null ? 'var(--localflix-red)' : '#fff' }}>
                    <Subtitles />
                  </IconButton>
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
                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, minWidth: 240 }}
                      >
                        <Typography variant="body2" sx={{ flexGrow: 1 }}>
                          {track.language.toUpperCase()} ({track.title})
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarSubtitle(track.title);
                          }}
                          sx={{
                            color: starredSubtitles.includes(track.title) ? "#ffb400" : "var(--text-secondary)",
                            p: 0.5,
                          }}
                        >
                          {starredSubtitles.includes(track.title) ? <Star sx={{ fontSize: 16 }} /> : <StarBorder sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Audio Tracks */}
              {audioTracks.length > 0 && (
                <>
                  <IconButton onClick={(e) => setAudioAnchor(e.currentTarget)} sx={{ color: activeAudio !== null ? 'var(--localflix-red)' : '#fff' }}>
                    <Audiotrack />
                  </IconButton>
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
                        {track.language.toUpperCase()} ({track.title})
                      </MenuItem>
                    ))}
                  </Menu>
                </>
              )}

              {/* Playback Speed */}
              <IconButton onClick={(e) => setSpeedAnchor(e.currentTarget)} sx={{ color: '#fff' }}>
                <Speed />
              </IconButton>
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

              {/* Fullscreen toggle button */}
              <IconButton onClick={toggleFullscreen} sx={{ color: '#fff' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};
