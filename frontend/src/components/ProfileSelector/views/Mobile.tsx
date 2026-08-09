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

const mobileContainerSx: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  bgcolor: 'var(--bg-dark)',
  px: 2,
  py: 4,
  userSelect: 'none',
};

const mobileHeadingSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  mb: 4,
  textAlign: 'center',
  letterSpacing: 0.5,
};

const mobileGridContainerSx: SxProps<Theme> = {
  maxWidth: 500,
  justifyContent: 'center',
};

const mobileGridItemSx: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
};

const mobileProfileCardSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  cursor: 'pointer',
  '&:active .avatar-card': {
    transform: 'scale(0.95)',
  },
};

const mobileAvatarPaperBaseSx: SxProps<Theme> = {
  width: 105,
  height: 105,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 2,
  border: '2px solid transparent',
  transition: 'var(--transition-smooth)',
  position: 'relative',
  mb: 1,
};

const mobileAvatarInitialsSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 700,
};

const mobileLockBadgeSx: SxProps<Theme> = {
  position: 'absolute',
  bottom: 6,
  right: 6,
  bgcolor: 'rgba(0,0,0,0.6)',
  borderRadius: '50%',
  p: 0.5,
  display: 'flex',
};

const mobileLockIconSx: SxProps<Theme> = {
  fontSize: 14,
  color: '#fff',
};

const mobileProfileNameSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  fontWeight: 600,
};

const mobilePinDialogPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-dark)',
  color: '#fff',
  p: 3,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
};

const mobilePinDialogContentSx: SxProps<Theme> = {
  p: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const mobilePinSubtitleSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  mb: 1,
};

const mobilePinTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  mb: 4,
  textAlign: 'center',
};

const mobilePinDotsContainerSx: SxProps<Theme> = {
  display: 'flex',
  gap: 3,
  mb: 4,
  minHeight: 40,
  alignItems: 'center',
};

const mobilePinDotBaseSx: SxProps<Theme> = {
  width: 18,
  height: 18,
  borderRadius: '50%',
  border: '2px solid #555',
  transition: 'var(--transition-smooth)',
};

const getMobilePinDotSx = (filled: boolean, pinError: boolean): SxProps<Theme> => ({
  ...(mobilePinDotBaseSx as object),
  bgcolor: filled ? '#fff' : 'transparent',
  boxShadow: filled ? '0 0 8px #fff' : 'none',
  transform: filled ? 'scale(1.1)' : 'scale(1)',
  ...(pinError && {
    border: '2px solid var(--localflix-red)',
    boxShadow: '0 0 8px var(--localflix-red)',
  }),
});

const mobilePinErrorTextSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  mb: 3,
  fontWeight: 500,
};

const mobileKeypadContainerSx: SxProps<Theme> = {
  width: '100%',
  maxWidth: 320,
};

const mobileKeypadDigitBtnSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  borderRadius: '50%',
  borderColor: '#333',
  color: '#fff',
  fontSize: '1.4rem',
  fontWeight: 600,
  '&:active': {
    bgcolor: 'var(--bg-hover)',
  },
};

const mobileKeypadCancelBtnSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
};

const mobileKeypadZeroBtnSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  borderRadius: '50%',
  borderColor: '#333',
  color: '#fff',
  fontSize: '1.4rem',
  fontWeight: 600,
};

const mobileKeypadClearBtnSx: SxProps<Theme> = {
  width: '100%',
  height: 60,
  color: 'var(--text-secondary)',
  fontSize: '0.85rem',
};

// --- Component ---

export const MobileProfileSelectorView: React.FC<ProfileSelectorViewProps> = ({
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
      data-style="mobileContainerSx"
      sx={mobileContainerSx}
    >
      <Typography variant="h4" sx={mobileHeadingSx}>
        Who's watching?
      </Typography>

      <Grid container spacing={2} sx={mobileGridContainerSx}>
        {profiles.map((profile, index) => {
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = profile.name.slice(0, 2).toUpperCase();

          return (
            <Grid item key={profile.id} xs={6} sm={4} sx={mobileGridItemSx}>
              <Box
                onClick={() => handleProfileClick(profile)}
                data-style="mobileProfileCardSx"
                sx={mobileProfileCardSx}
              >
                <Paper
                  className="avatar-card"
                  elevation={4}
                  sx={mobileAvatarPaperBaseSx}
                  style={{ backgroundColor: color }}
                >
                  <Typography variant="h4" sx={mobileAvatarInitialsSx}>
                    {initials}
                  </Typography>
                  {profile.hasPin && (
                    <Box
                      data-style="mobileLockBadgeSx"
                      sx={mobileLockBadgeSx}
                    >
                      <LockIcon sx={mobileLockIconSx} />
                    </Box>
                  )}
                </Paper>
                <Typography
                  className="profile-name"
                  variant="subtitle1"
                  sx={mobileProfileNameSx}
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
        fullScreen
        open={Boolean(selectedProfile)}
        onClose={() => !isLoggingIn && setSelectedProfile(null)}
        PaperProps={{
          sx: mobilePinDialogPaperSx,
        }}
      >
        <DialogContent sx={mobilePinDialogContentSx}>
          <Typography variant="body1" sx={mobilePinSubtitleSx}>
            Profile Lock is on.
          </Typography>
          <Typography variant="h5" sx={mobilePinTitleSx}>
            Enter your PIN to access {selectedProfile?.name}.
          </Typography>

          {/* PIN password indicator dots */}
          <Box data-style="mobilePinDotsContainerSx" sx={mobilePinDotsContainerSx}>
            {[0, 1, 2, 3].map((idx) => {
              const filled = pinDigits.length > idx;
              return (
                <Box
                  key={idx}
                  data-style="getMobilePinDotSx"
                  sx={getMobilePinDotSx(filled, pinError)}
                />
              );
            })}
          </Box>

          {pinError && (
            <Typography variant="body2" sx={mobilePinErrorTextSx}>
              Incorrect PIN. Please try again.
            </Typography>
          )}

          {/* Keypad */}
          <Box data-style="mobileKeypadContainerSx" sx={mobileKeypadContainerSx}>
            <Grid container spacing={2}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <Grid item xs={4} key={digit}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDigitInput(digit)}
                    disabled={isLoggingIn}
                    sx={mobileKeypadDigitBtnSx}
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
                  sx={mobileKeypadCancelBtnSx}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  onClick={() => handleDigitInput('0')}
                  disabled={isLoggingIn}
                  sx={mobileKeypadZeroBtnSx}
                >
                  0
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="text"
                  onClick={handleBackspace}
                  disabled={isLoggingIn || pinDigits.length === 0}
                  sx={mobileKeypadClearBtnSx}
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
