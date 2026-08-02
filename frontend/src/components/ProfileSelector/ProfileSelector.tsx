import React from 'react';
import { useMediaQuery, useTheme, Box, CircularProgress, Typography, Button } from '@mui/material';
import { useProfileSelector } from './hooks';
import { WebProfileSelectorView } from './views/Web';
import { MobileProfileSelectorView } from './views/Mobile';

interface ProfileSelectorProps {
  onProfileSelected: (profileId: string, name: string) => void;
}

export const ProfileSelector: React.FC<ProfileSelectorProps> = ({ onProfileSelected }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const state = useProfileSelector(onProfileSelected);

  if (state.loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-dark)' }}>
        <CircularProgress size={60} sx={{ color: 'var(--localflix-red)' }} />
      </Box>
    );
  }

  if (state.error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: 'var(--bg-dark)', px: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ color: 'var(--localflix-red)', mb: 2, fontWeight: 700 }}>
          Connection Error
        </Typography>
        <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 3 }}>
          {state.error}
        </Typography>
        <Button variant="contained" onClick={() => window.location.reload()} sx={{ bgcolor: 'var(--localflix-red)', '&:hover': { bgcolor: 'var(--localflix-dark-red)' } }}>
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
