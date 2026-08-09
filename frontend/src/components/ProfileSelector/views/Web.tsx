import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  Dialog,
  DialogContent,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { AVATAR_COLORS } from '../hooks';
import type { ProfileSelectorViewProps } from './types';

// --- Extracted sx style constants ---

const rootContainerSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'var(--bg-dark)',
  px: 2,
  userSelect: 'none',
};

const titleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  mb: 6,
  textAlign: 'center',
  letterSpacing: 1,
};

const profilesGridSx: SxProps<Theme> = {
  maxWidth: 800,
  justifyContent: 'center',
};

const profileCardWrapperSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  '&:hover .avatar-card': {
    transform: 'scale(1.08)',
    borderColor: '#fff',
  },
  '&:hover .profile-name': {
    color: '#fff',
  },
};

const avatarCardSx: SxProps<Theme> = {
  width: 130,
  height: 130,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 2,
  border: '3px solid transparent',
  transition: 'var(--transition-smooth)',
  position: 'relative',
  mb: 1.5,
};

const avatarInitialsSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 700,
};

const lockIconBadgeSx: SxProps<Theme> = {
  position: 'absolute',
  bottom: 8,
  right: 8,
  bgcolor: 'rgba(0,0,0,0.6)',
  borderRadius: '50%',
  p: 0.5,
  display: 'flex',
};

const lockIconSx: SxProps<Theme> = {
  fontSize: 16,
  color: '#fff',
};

const profileNameSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  fontWeight: 500,
  transition: 'color 0.2s',
};

const pinDialogPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-darker)',
  color: '#fff',
  p: 4,
  width: 380,
  textAlign: 'center',
  borderRadius: 3,
  border: '1px solid #222',
  boxShadow: '0 20px 40px rgba(0,0,0,0.7)',
};

const dialogContentSx: SxProps<Theme> = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const pinLockMessageSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  mb: 1,
};

const pinPromptSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  mb: 4,
};

const pinDotsContainerSx: SxProps<Theme> = {
  display: 'flex',
  gap: 3,
  mb: 4,
  minHeight: 40,
  alignItems: 'center',
};

const pinDotBaseSx: SxProps<Theme> = {
  width: 20,
  height: 20,
  borderRadius: '50%',
  border: '2px solid #555',
  transition: 'var(--transition-smooth)',
};

const getPinDotSx = (filled: boolean, pinError: boolean): SxProps<Theme> => ({
  ...(pinDotBaseSx as object),
  bgcolor: filled ? '#fff' : 'transparent',
  boxShadow: filled ? '0 0 8px #fff' : 'none',
  transform: filled ? 'scale(1.1)' : 'scale(1)',
  ...(pinError && {
    border: '2px solid var(--localflix-red)',
    boxShadow: '0 0 8px var(--localflix-red)',
  }),
});

const pinErrorMessageSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  mb: 3,
  fontWeight: 500,
  animation: 'shake 0.3s',
};

const keypadContainerSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  width: '100%',
};

const digitButtonSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  borderRadius: 2,
  borderColor: '#333',
  color: '#fff',
  fontSize: '1.4rem',
  fontWeight: 600,
  fontFamily: 'inherit',
  '&:hover': {
    bgcolor: 'var(--bg-hover)',
    borderColor: '#555',
  },
};

const cancelButtonSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  color: 'var(--text-secondary)',
};

const zeroButtonSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  borderRadius: 2,
  borderColor: '#333',
  color: '#fff',
  fontSize: '1.4rem',
  fontWeight: 600,
  '&:hover': {
    bgcolor: 'var(--bg-hover)',
    borderColor: '#555',
  },
};

const clearButtonSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  color: 'var(--text-secondary)',
  fontSize: '1rem',
};

export const WebProfileSelectorView: React.FC<ProfileSelectorViewProps> = ({
  profiles,
  selectedProfile,
  setSelectedProfile,
  pinDigits,
  pinError,
  isLoggingIn,
  handleProfileClick,
  handleDigitInput,
  handleBackspace,
}) => {
  return (
    <Box
      className="fade-in"
      data-style="rootContainerSx"
      sx={rootContainerSx}
    >
      <Typography variant="h3" sx={titleSx}>
        Who's watching?
      </Typography>

      <Grid container spacing={4} sx={profilesGridSx}>
        {profiles.map((profile, index) => {
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = profile.name.slice(0, 2).toUpperCase();

          return (
            <Grid item key={profile.id}>
              <Box
                onClick={() => handleProfileClick(profile)}
                data-style="profileCardWrapperSx"
                sx={profileCardWrapperSx}
              >
                <Paper
                  className="avatar-card"
                  elevation={4}
                  sx={avatarCardSx}
                  style={{ backgroundColor: color }}
                >
                  <Typography variant="h3" sx={avatarInitialsSx}>
                    {initials}
                  </Typography>
                  {profile.hasPin && (
                    <Box
                      data-style="lockIconBadgeSx"
                      sx={lockIconBadgeSx}
                    >
                      <LockIcon sx={lockIconSx} />
                    </Box>
                  )}
                </Paper>
                <Typography
                  className="profile-name"
                  variant="h6"
                  sx={profileNameSx}
                >
                  {profile.name}
                </Typography>
              </Box>
            </Grid>
          );
        })}
      </Grid>

      {/* PIN entry dialog */}
      <Dialog
        open={Boolean(selectedProfile)}
        onClose={() => !isLoggingIn && setSelectedProfile(null)}
        PaperProps={{
          sx: pinDialogPaperSx,
        }}
      >
        <DialogContent sx={dialogContentSx}>
          <Typography variant="h6" sx={pinLockMessageSx}>
            Profile Lock is on.
          </Typography>
          <Typography variant="h5" sx={pinPromptSx}>
            Enter your PIN to access {selectedProfile?.name}.
          </Typography>

          {/* PIN password indicator dots */}
          <Box data-style="pinDotsContainerSx" sx={pinDotsContainerSx}>
            {[0, 1, 2, 3].map((idx) => {
              const filled = pinDigits.length > idx;
              return (
                <Box
                  key={idx}
                  data-style="getPinDotSx"
                  sx={getPinDotSx(filled, !!pinError)}
                />
              );
            })}
          </Box>

          {pinError && (
            <Typography variant="body2" sx={pinErrorMessageSx}>
              Incorrect PIN. Please try again.
            </Typography>
          )}

          {/* Custom numeric keypad */}
          <Box data-style="keypadContainerSx" sx={keypadContainerSx}>
            <Grid container spacing={2}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <Grid item xs={4} key={digit}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDigitInput(digit)}
                    disabled={isLoggingIn}
                    sx={digitButtonSx}
                  >
                    {digit}
                  </Button>
                </Grid>
              ))}
              <Grid item xs={4}>
                <Button
                  variant="text"
                  onClick={() => setSelectedProfile(null)}
                  disabled={isLoggingIn}
                  sx={cancelButtonSx}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  onClick={() => handleDigitInput('0')}
                  disabled={isLoggingIn}
                  sx={zeroButtonSx}
                >
                  0
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="text"
                  onClick={handleBackspace}
                  disabled={isLoggingIn || pinDigits.length === 0}
                  sx={clearButtonSx}
                >
                  Clear
                </Button>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};
