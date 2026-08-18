import React from 'react';
import { useHome } from './hooks';
import { WebHomeView } from './views/Web';
import { MobileHomeView } from './views/Mobile';
import { useViewMode } from '../../context/ViewModeContext';

interface HomeProps {
  onPlayVideo: (path: string, position: number, playerType?: "hls" | "alt" | "tv") => void;
  onNavigateToPath: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onPlayVideo, onNavigateToPath }) => {
  const { isMobileView } = useViewMode();
  const state = useHome();

  if (isMobileView) {
    return (
      <MobileHomeView
        {...state}
        onPlayVideo={onPlayVideo}
        onNavigateToPath={onNavigateToPath}
      />
    );
  }

  return (
    <WebHomeView
      {...state}
      onPlayVideo={onPlayVideo}
      onNavigateToPath={onNavigateToPath}
    />
  );
};
