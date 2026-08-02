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
import LockIcon from '@mui/icons-material/Lock';
import { AVATAR_COLORS } from '../hooks';
import type { ProfileSelectorViewProps } from './types';

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
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'var(--bg-dark)',
        px: 2,
        py: 4,
        userSelect: 'none',
      }}
    >
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 600, mb: 4, textAlign: 'center', letterSpacing: 0.5 }}>
        Who's watching?
      </Typography>

      <Grid container spacing={2} sx={{ maxWidth: 500, justifyContent: 'center' }}>
        {profiles.map((profile, index) => {
          const color = AVATAR_COLORS[index % AVATAR_COLORS.length];
          const initials = profile.name.slice(0, 2).toUpperCase();

          return (
            <Grid item key={profile.id} xs={6} sm={4} sx={{ display: 'flex', justifyContent: 'center' }}>
              <Box
                onClick={() => handleProfileClick(profile)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  '&:active .avatar-card': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <Paper
                  className="avatar-card"
                  elevation={4}
                  sx={{
                    width: 105,
                    height: 105,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: color,
                    borderRadius: 2,
                    border: '2px solid transparent',
                    transition: 'var(--transition-smooth)',
                    position: 'relative',
                    mb: 1,
                  }}
                >
                  <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700 }}>
                    {initials}
                  </Typography>
                  {profile.hasPin && (
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 6,
                        right: 6,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        borderRadius: '50%',
                        p: 0.5,
                        display: 'flex',
                      }}
                    >
                      <LockIcon sx={{ fontSize: 14, color: '#fff' }} />
                    </Box>
                  )}
                </Paper>
                <Typography
                  className="profile-name"
                  variant="subtitle1"
                  sx={{
                    color: 'var(--text-secondary)',
                    fontWeight: 600,
                  }}
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
          sx: {
            bgcolor: 'var(--bg-dark)',
            color: '#fff',
            p: 3,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          },
        }}
      >
        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1" sx={{ color: 'var(--text-secondary)', mb: 1 }}>
            Profile Lock is on.
          </Typography>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 600, mb: 4, textAlign: 'center' }}>
            Enter your PIN to access {selectedProfile?.name}.
          </Typography>

          {/* PIN password indicator dots */}
          <Box sx={{ display: 'flex', gap: 3, mb: 4, minHeight: 40, alignItems: 'center' }}>
            {[0, 1, 2, 3].map((idx) => {
              const filled = pinDigits.length > idx;
              return (
                <Box
                  key={idx}
                  sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    border: '2px solid #555',
                    bgcolor: filled ? '#fff' : 'transparent',
                    boxShadow: filled ? '0 0 8px #fff' : 'none',
                    transform: filled ? 'scale(1.1)' : 'scale(1)',
                    transition: 'var(--transition-smooth)',
                    ...(pinError && {
                      border: '2px solid var(--localflix-red)',
                      boxShadow: '0 0 8px var(--localflix-red)',
                    }),
                  }}
                />
              );
            })}
          </Box>

          {pinError && (
            <Typography variant="body2" sx={{ color: 'var(--localflix-red)', mb: 3, fontWeight: 500 }}>
              Incorrect PIN. Please try again.
            </Typography>
          )}

          {/* Keypad */}
          <Box sx={{ width: '100%', maxWidth: 320 }}>
            <Grid container spacing={2}>
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <Grid item xs={4} key={digit}>
                  <Button
                    variant="outlined"
                    onClick={() => handleDigitInput(digit)}
                    disabled={isLoggingIn}
                    sx={{
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
                    }}
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
                  sx={{ width: '100%', height: 60, color: 'var(--text-secondary)', fontSize: '0.85rem' }}
                >
                  Cancel
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="outlined"
                  onClick={() => handleDigitInput('0')}
                  disabled={isLoggingIn}
                  sx={{
                    width: '100%',
                    height: 60,
                    borderRadius: '50%',
                    borderColor: '#333',
                    color: '#fff',
                    fontSize: '1.4rem',
                    fontWeight: 600,
                  }}
                >
                  0
                </Button>
              </Grid>
              <Grid item xs={4}>
                <Button
                  variant="text"
                  onClick={handleBackspace}
                  disabled={isLoggingIn || pinDigits.length === 0}
                  sx={{ width: '100%', height: 60, color: 'var(--text-secondary)', fontSize: '0.85rem' }}
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
