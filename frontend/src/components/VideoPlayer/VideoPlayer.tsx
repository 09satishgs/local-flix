import React from 'react';
import { useVideoPlayer } from './hooks';
import { WebVideoPlayerView } from './views/Web';
import { MobileVideoPlayerView } from './views/Mobile';
import { useViewMode } from '../../context/ViewModeContext';

interface VideoPlayerProps {
  videoPath: string;
  initialPosition?: number;
  onClose: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoPath,
  initialPosition = 0,
  onClose,
}) => {
  const { isMobileView } = useViewMode();
  const state = useVideoPlayer(videoPath, initialPosition);

  if (isMobileView) {
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
