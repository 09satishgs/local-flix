import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useExplorer } from './hooks';
import { WebExplorerView } from './views/Web';
import { MobileExplorerView } from './views/Mobile';

interface ExplorerProps {
  initialPath?: string;
  onPlayVideo: (path: string, position: number) => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ initialPath = '', onPlayVideo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useExplorer(initialPath);

  if (isMobile) {
    return (
      <MobileExplorerView
        {...state}
        onPlayVideo={onPlayVideo}
      />
    );
  }

  return (
    <WebExplorerView
      {...state}
      onPlayVideo={onPlayVideo}
    />
  );
};
