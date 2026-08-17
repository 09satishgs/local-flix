import React from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import { useExplorer } from './hooks';
import { WebExplorerView } from './views/Web';
import { MobileExplorerView } from './views/Mobile';

interface ExplorerProps {
  initialPath?: string;
  onPlayVideo: (path: string, position: number) => void;
  playerMode: "standard" | "qsv" | "direct";
}

export const Explorer: React.FC<ExplorerProps> = ({ initialPath = '', onPlayVideo, playerMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useExplorer(initialPath, playerMode);

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
