import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useHome } from './hooks';
import { WebHomeView } from './views/Web';
import { MobileHomeView } from './views/Mobile';

interface HomeProps {
  onPlayVideo: (path: string, position: number) => void;
  onNavigateToPath: (path: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onPlayVideo, onNavigateToPath }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useHome();

  if (isMobile) {
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
