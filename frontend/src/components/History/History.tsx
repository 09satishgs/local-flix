import React from 'react';
import { useMediaQuery, useTheme, Box, CircularProgress } from '@mui/material';
import { useHistory } from './hooks';
import { WebHistoryView } from './views/Web';
import { MobileHistoryView } from './views/Mobile';

interface HistoryProps {
  onPlayVideo: (path: string, position: number) => void;
}

export const History: React.FC<HistoryProps> = ({ onPlayVideo }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const state = useHistory();

  if (state.loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: 'var(--localflix-red)' }} />
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
