import React from 'react';
import { useMediaQuery, useTheme, Box, CircularProgress } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useHistory } from './hooks';
import { WebHistoryView } from './views/Web';
import { MobileHistoryView } from './views/Mobile';

interface HistoryProps {
  onPlayVideo: (path: string, position: number) => void;
}

const loadingContainerSx: SxProps<Theme> = { display: 'flex', justifyContent: 'center', py: 8 };
const progressSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

export const History: React.FC<HistoryProps> = ({ onPlayVideo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useHistory();

  if (state.loading) {
    return (
      <Box sx={loadingContainerSx} data-style="loadingContainerSx">
        <CircularProgress sx={progressSx} />
      </Box>
    );
  }

  if (isMobile) {
    return (
      <MobileHistoryView
        {...state}
        onPlayVideo={onPlayVideo}
      />
    );
  }

  return (
    <WebHistoryView
      {...state}
      onPlayVideo={onPlayVideo}
    />
  );
};
