import React from 'react';
import { useExplorer } from './hooks';
import { WebExplorerView } from './views/Web';
import { MobileExplorerView } from './views/Mobile';
import { useViewMode } from '../../context/ViewModeContext';

interface ExplorerProps {
  initialPath?: string;
  onPlayVideo: (path: string, position: number, playerType?: "hls" | "alt" | "tv") => void;
}

export const Explorer: React.FC<ExplorerProps> = ({ initialPath = '', onPlayVideo }) => {
  const { isMobileView } = useViewMode();
  const state = useExplorer(initialPath);

  if (isMobileView) {
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
