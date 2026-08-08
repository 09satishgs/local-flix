import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useVideoPlayer } from './hooks';
import { WebVideoPlayerView } from './views/Web';
import { MobileVideoPlayerView } from './views/Mobile';

interface VideoPlayerProps {
  videoPath: string;
  initialPosition?: number;
  onClose: () => void;
}

export const AltVideoPlayer: React.FC<VideoPlayerProps> = ({
  videoPath,
  initialPosition = 0,
  onClose,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useVideoPlayer(videoPath, initialPosition);

  if (isMobile) {
    return (
      <MobileVideoPlayerView
        {...state}
        onClose={onClose}
      />
    );
  }

  return (
    <WebVideoPlayerView
      {...state}
      onClose={onClose}
    />
  );
};
