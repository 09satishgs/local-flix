import React from 'react';
import { useMediaQuery, useTheme, Box, CircularProgress, Typography, Button } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { useProfileSelector } from './hooks';
import { WebProfileSelectorView } from './views/Web';
import { MobileProfileSelectorView } from './views/Mobile';

interface ProfileSelectorProps {
  onProfileSelected: (profileId: string, name: string) => void;
}

const loadingContainerSx: SxProps<Theme> = { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-dark)' };
const loadingProgressSx: SxProps<Theme> = { color: 'var(--localflix-red)' };
const errorContainerSx: SxProps<Theme> = { minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-dark)', px: 3, textAlign: 'center' };
const errorTitleSx: SxProps<Theme> = { color: 'var(--localflix-red)', mb: 2, fontWeight: 700 };
const errorMessageSx: SxProps<Theme> = { color: 'var(--text-secondary)', mb: 3 };
const retryButtonSx: SxProps<Theme> = { bgcolor: 'var(--localflix-red)', '&:hover': { bgcolor: 'var(--localflix-dark-red)' } };

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelected }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const state = useProfileSelector(onProfileSelected);

  if (state.loading) {
    return (
      <Box sx={loadingContainerSx} data-style="loadingContainerSx">
        <CircularProgress size={60} sx={loadingProgressSx} />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={errorContainerSx} data-style="errorContainerSx">
        <Typography variant="h5" sx={errorTitleSx}>
          Connection Error
        </Typography>
        <Typography variant="body1" sx={errorMessageSx}>
          {state.error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={retryButtonSx}>
          Retry
        </Button>
      </Box>
    );
  }

  if (isMobile) {
    return <MobileProfileSelectorView {...state} />;
  }

  return <WebProfileSelectorView {...state} />;
};
