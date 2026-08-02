import React from 'react';
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
} from '@mui/icons-material';
import type { VideoPlayerViewProps } from './types';

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
      {/* Video Node */}
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
            gap: 2,
            p: 3,
          }}
        >
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 1, textAlign: 'center' }}>
            Video Finished
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 260 }}>
            <Button
              variant="contained"
              startIcon={<Replay />}
              onClick={handleReplay}
              sx={{
                bgcolor: 'var(--localflix-red)',
                color: '#fff',
                fontWeight: 600,
                py: 1.25,
                '&:hover': { bgcolor: 'var(--localflix-dark-red)' }
              }}
            >
              Start Over
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBack />}
              onClick={onClose}
              sx={{
                borderColor: '#444',
                color: '#fff',
                fontWeight: 600,
                py: 1.25,
              }}
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
          sx={{
            color: 'var(--localflix-red)',
            position: 'absolute',
            zIndex: 10,
          }}
        />
      )}

      {/* Mobile Controls Overlay */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,0.9) 100%)',
          opacity: showControls ? 1 : 0,
          transition: 'opacity 0.25s ease-in-out',
          pointerEvents: showControls ? 'auto' : 'none',
          zIndex: 5,
        }}
      >
        {/* Top Header */}
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center' }}>
          <IconButton
            onClick={onClose}
            sx={{ color: '#fff', mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 80px)' }}>
            {currentVideoPath.replace(/\\/g, '/').split('/').pop()}
          </Typography>
        </Box>

        {/* Center Control Group (Play, Prev, Next) */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 4,
          }}
        >
          <IconButton
            onClick={playPrevious}
            disabled={!hasPrevious}
            sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.4)', p: 1.5, '&.Mui-disabled': { color: '#444' } }}
          >
            <SkipPrevious fontSize="large" />
          </IconButton>

          <IconButton
            onClick={handlePlayPause}
            sx={{ color: '#fff', bgcolor: 'var(--localflix-red)', p: 2, boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}
          >
            {isPlaying ? <Pause fontSize="large" /> : <PlayArrow fontSize="large" />}
          </IconButton>

          <IconButton
            onClick={playNext}
            disabled={!hasNext}
            sx={{ color: '#fff', bgcolor: 'rgba(0,0,0,0.4)', p: 1.5, '&.Mui-disabled': { color: '#444' } }}
          >
            <SkipNext fontSize="large" />
          </IconButton>
        </Box>

        {/* Bottom Panel */}
        <Box sx={{ px: 2.5, pb: 3 }}>
          {/* Time Scrubber */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
            <Typography variant="caption" sx={{ color: '#ccc', minWidth: 35 }}>
              {formatTime(currentTime)}
            </Typography>
            <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              {/* Custom background rail */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 1,
                  pointerEvents: 'none',
                }}
              />
              {/* Custom buffered progress track */}
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  width: `${duration > 0 ? (bufferedTime / duration) * 100 : 0}%`,
                  height: 4,
                  bgcolor: 'rgba(255, 255, 255, 0.35)',
                  borderRadius: 1,
                  pointerEvents: 'none',
                }}
              />
              <Slider
                value={currentTime}
                min={0}
                max={duration || 100}
                onChange={handleSeek}
                sx={{
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
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#ccc', minWidth: 35 }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Settings Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
                      >
                        {track.language.toUpperCase()} ({track.title})
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
            <IconButton onClick={toggleFullscreen} sx={{ color: '#fff' }}>
              {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
