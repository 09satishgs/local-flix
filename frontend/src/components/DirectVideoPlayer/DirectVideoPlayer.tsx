import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  CircularProgress,
  AppBar,
  Toolbar
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  ArrowBack,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  FullscreenExit,
  Replay10,
  Forward10
} from '@mui/icons-material';
import { api } from '../../api';
import { formatTime } from '../../utils/helpers';

interface DirectVideoPlayerProps {
  videoPath: string;
  initialPosition?: number;
  onClose: () => void;
}

const STYLES = {
  container: {
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
  } as React.CSSProperties,
  video: {
    width: '100%',
    height: '100%',
    maxHeight: '100vh',
    objectFit: 'contain',
  } as React.CSSProperties,
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    opacity: 0,
    transition: 'opacity 0.3s ease-in-out',
    zIndex: 2,
  } as React.CSSProperties,
  centerControls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
  } as React.CSSProperties,
  bottomBar: {
    padding: '16px 24px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0))',
  } as React.CSSProperties,
};

export const DirectVideoPlayer: React.FC<DirectVideoPlayerProps> = ({
  videoPath,
  initialPosition = 0,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<any>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0); // offset within the current stream
  const [startTime, setStartTime] = useState(initialPosition); // start timestamp of the active stream
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('playerVolume');
    return saved ? parseFloat(saved) : 1;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [sliderValue, setSliderValue] = useState<number | null>(null);

  const [profileId] = useState(() => localStorage.getItem('profileId') || '');
  const [profileToken] = useState(() => localStorage.getItem('profileToken') || '');

  const videoName = videoPath.split(/[\\/]/).pop() || '';

  // Get Video Metadata
  useEffect(() => {
    api.getVideoMetadata(videoPath)
      .then(meta => {
        setDuration(meta.duration);
      })
      .catch(err => console.error('Failed to load video metadata:', err));
  }, [videoPath]);

  // Construct streaming source URL
  const videoSrc = `/api/video/stream?path=${encodeURIComponent(videoPath)}&start=${startTime}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`;

  // Controls Visibility Timeout
  const triggerControlsVisibility = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  useEffect(() => {
    triggerControlsVisibility();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      triggerControlsVisibility();
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleSkip(-10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleSkip(10);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, startTime, duration]);

  // Watch progress reporting to database
  useEffect(() => {
    if (isLoading) return;
    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        const absolutePos = startTime + video.currentTime;
        api.updateProgress(videoPath, absolutePos, duration || video.duration || 1)
          .catch(err => console.error('Failed to save progress:', err));
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [videoPath, startTime, duration, isLoading]);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Sync volume state to video ref on mount or change
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
    }
  }, [volume, isMuted, isLoading]);

  // Audio track switching cleanup
  useEffect(() => {
    return () => {
      // Save progress upon closure/unmount
      const video = videoRef.current;
      if (video && video.currentTime > 0) {
        const absolutePos = startTime + video.currentTime;
        api.updateProgress(videoPath, absolutePos, duration || video.duration || 1)
          .catch(err => console.error(err));
      }
    };
  }, [videoPath, startTime, duration]);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSkip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    const currentAbsolute = startTime + video.currentTime;
    let targetAbsolute = currentAbsolute + seconds;
    if (targetAbsolute < 0) targetAbsolute = 0;
    if (targetAbsolute > duration) targetAbsolute = duration;

    setIsLoading(true);
    setStartTime(targetAbsolute);
    setCurrentTime(0);
    setSliderValue(null);
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
    }
  };

  const handleTimelineChange = (_e: any, val: number | number[]) => {
    setSliderValue(val as number);
    triggerControlsVisibility();
  };

  const handleTimelineChangeCommitted = (_e: any, val: number | number[]) => {
    const targetAbsolute = val as number;
    setIsLoading(true);
    setStartTime(targetAbsolute);
    setCurrentTime(0);
    setSliderValue(null);
  };

  const handleVolumeChange = (_e: any, val: number | number[]) => {
    const v = val as number;
    setVolume(v);
    setIsMuted(v === 0);
    localStorage.setItem('playerVolume', v.toString());
    triggerControlsVisibility();
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    triggerControlsVisibility();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err));
    } else {
      document.exitFullscreen().catch(err => console.error(err));
    }
  };

  const handleVideoPlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handleVideoWaiting = () => {
    setIsLoading(true);
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Mark as finished if duration matches
    api.updateProgress(videoPath, duration, duration)
      .catch(err => console.error(err));
  };

  const displayTime = startTime + (sliderValue !== null ? (sliderValue - startTime) : currentTime);

  return (
    <Box
      ref={containerRef}
      style={STYLES.container}
      onMouseMove={triggerControlsVisibility}
      onClick={triggerControlsVisibility}
    >
      <video
        ref={videoRef}
        src={videoSrc}
        style={STYLES.video}
        autoPlay
        onTimeUpdate={handleTimeUpdate}
        onPlaying={handleVideoPlaying}
        onWaiting={handleVideoWaiting}
        onEnded={handleVideoEnded}
        onClick={handlePlayPause}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <Box
          style={{
            position: 'absolute',
            zIndex: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress sx={{ color: 'var(--localflix-red)' }} size={60} thickness={4} />
        </Box>
      )}

      {/* Playback Controls Overlay */}
      <Box
        style={{
          ...STYLES.overlay,
          opacity: showControls || isLoading ? 1 : 0,
          pointerEvents: showControls ? 'auto' : 'none',
        }}
      >
        {/* Header AppBar */}
        <AppBar position="static" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(0,0,0,0))', boxShadow: 'none' }}>
          <Toolbar>
            <IconButton edge="start" onClick={onClose} style={{ color: '#fff', marginRight: '16px' }}>
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" style={{ color: '#fff', fontWeight: 600 }}>
              {videoName}
            </Typography>
            <Typography variant="caption" sx={{ ml: 2, bgcolor: 'rgba(255,255,255,0.15)', px: 1, py: 0.5, borderRadius: 1 }}>
              Direct Stream (HEVC Fallback)
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Center Play/Pause Buttons */}
        <Box style={STYLES.centerControls} onClick={e => e.stopPropagation()}>
          <IconButton onClick={() => handleSkip(-10)} style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px' }}>
            <Replay10 style={{ fontSize: '32px' }} />
          </IconButton>
          <IconButton onClick={handlePlayPause} style={{ color: '#fff', backgroundColor: 'var(--localflix-red)', padding: '24px' }}>
            {isPlaying ? <Pause style={{ fontSize: '40px' }} /> : <PlayArrow style={{ fontSize: '40px' }} />}
          </IconButton>
          <IconButton onClick={() => handleSkip(10)} style={{ color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)', padding: '16px' }}>
            <Forward10 style={{ fontSize: '32px' }} />
          </IconButton>
        </Box>

        {/* Bottom Control Bar */}
        <Box style={STYLES.bottomBar} onClick={e => e.stopPropagation()}>
          {/* Timeline Slider */}
          <Box style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
            <Typography variant="body2" style={{ color: '#fff', minWidth: '45px', textAlign: 'right' }}>
              {formatTime(displayTime)}
            </Typography>
            <Slider
              min={0}
              max={duration || 100}
              value={sliderValue !== null ? sliderValue : (startTime + currentTime)}
              onChange={handleTimelineChange}
              onChangeCommitted={handleTimelineChangeCommitted}
              sx={{
                color: 'var(--localflix-red)',
                height: 4,
                '& .MuiSlider-thumb': {
                  width: 12,
                  height: 12,
                  transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                  '&:before': { boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)' },
                  '&:hover, &.Mui-focusVisible': {
                    boxShadow: '0px 0px 0px 8px rgba(229, 9, 20, 0.16)',
                  },
                },
                '& .MuiSlider-track': { border: 'none' },
                '& .MuiSlider-rail': { opacity: 0.28, backgroundColor: '#fff' },
              }}
            />
            <Typography variant="body2" style={{ color: '#fff', minWidth: '45px' }}>
              {formatTime(duration)}
            </Typography>
          </Box>

          {/* Volume and Screen controls */}
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Left Control Group */}
            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconButton onClick={toggleMute} style={{ color: '#fff' }}>
                {isMuted ? <VolumeOff /> : <VolumeUp />}
              </IconButton>
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                sx={{
                  color: '#fff',
                  width: 100,
                  height: 4,
                  '& .MuiSlider-thumb': { width: 8, height: 8 },
                  '& .MuiSlider-track': { border: 'none' },
                  '& .MuiSlider-rail': { opacity: 0.28, backgroundColor: '#fff' },
                }}
              />
            </Box>

            {/* Right Control Group */}
            <Box>
              <IconButton onClick={toggleFullscreen} style={{ color: '#fff' }}>
                {isFullscreen ? <FullscreenExit /> : <Fullscreen />}
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
