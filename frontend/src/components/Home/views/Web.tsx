import React from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  LinearProgress,
} from '@mui/material';
import {
  PlayArrow,
  FolderOpen,
  History,
  Bookmark,
  Close,
} from '@mui/icons-material';
import { CARD_GRADIENTS } from '../hooks';
import type { HomeViewProps } from './types';

export const WebHomeView: React.FC<HomeViewProps> = ({
  continueList,
  pinnedList,
  heroItem,
  onPlayVideo,
  onNavigateToPath,
  handleRemoveContinue,
  handleRemovePin,
}) => {
  return (
    <Box className="fade-in" sx={{ pb: 6 }}>
      {/* Hero Billboard Banner */}
      {heroItem ? (
        <Box
          sx={{
            height: '45vh',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 90%), url("https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?q=80&w=1400") no-repeat center/cover',
            display: 'flex',
            alignItems: 'flex-end',
            px: { xs: 3, md: 6 },
            pb: 4,
            mb: 4,
          }}
        >
          <Box sx={{ maxWidth: 600 }}>
            <Typography variant="overline" sx={{ color: 'var(--localflix-red)', fontWeight: 800, letterSpacing: 3 }}>
              CONTINUE WATCHING
            </Typography>
            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', md: '3.5rem' },
                lineHeight: 1.1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {heroItem.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => onPlayVideo(heroItem.path, heroItem.position)}
                sx={{
                  bgcolor: '#fff',
                  color: '#000',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                }}
              >
                Resume
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                onClick={() => onNavigateToPath(heroItem.path.substring(0, heroItem.path.lastIndexOf('\\')))}
                sx={{
                  borderColor: 'rgba(255,255,255,0.4)',
                  color: '#fff',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  '&:hover': {
                    borderColor: '#fff',
                    bgcolor: 'rgba(0,0,0,0.6)',
                  },
                }}
              >
                Show Folder
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Empty Hero placeholder with Netflix Billboard styling */
        <Box
          sx={{
            height: '35vh',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 100%), url("https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1400") no-repeat center/cover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="h3" sx={{ color: '#fff', fontWeight: 800, mb: 1 }}>
              Welcome back
            </Typography>
            <Typography variant="h6" sx={{ color: 'var(--text-secondary)' }}>
              Browse the file explorer to play your videos and configure storage paths.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Rows */}
      <Box sx={{ px: { xs: 3, md: 6 } }}>
        {/* Continue Watching Section */}
        {continueList.length > 0 && (
          <Box sx={{ mb: 6 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: 'var(--localflix-red)' }} /> Continue Watching
            </Typography>
            <Grid container spacing={3}>
              {continueList.map((item, index) => {
                const percentage = (item.position / item.duration) * 100;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
                    <Card
                      className="movie-card"
                      onClick={() => onPlayVideo(item.path, item.position)}
                      sx={{
                        bgcolor: 'var(--bg-card)',
                        border: '1px solid #222',
                        borderRadius: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        cursor: 'pointer',
                      }}
                    >
                      <Box
                        sx={{
                          height: 140,
                          background: item.thumbnail ? 'none' : gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: 2,
                          position: 'relative',
                          ...(item.thumbnail && {
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }),
                        }}
                      >
                        {/* Remove button */}
                        <IconButton
                          onClick={(e) => handleRemoveContinue(e, item.path)}
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            color: 'rgba(255, 255, 255, 0.6)',
                            bgcolor: 'rgba(0, 0, 0, 0.5)',
                            '&:hover': {
                              color: '#fff',
                              bgcolor: 'var(--localflix-red)',
                            },
                            zIndex: 10,
                          }}
                          size="small"
                        >
                          <Close sx={{ fontSize: 16 }} />
                        </IconButton>

                        <IconButton
                          className="play-overlay"
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            color: '#fff',
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' },
                          }}
                        >
                          <PlayArrow fontSize="large" />
                        </IconButton>
                      </Box>
                      <CardContent sx={{ flexGrow: 1, p: 2, pb: 1 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                          Resumes at {Math.floor(item.position / 60)}m
                        </Typography>
                      </CardContent>
                      {/* Playback progress bar */}
                      <Box sx={{ width: '100%', px: 2, pb: 2 }}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            bgcolor: '#333',
                            height: 4,
                            borderRadius: 1,
                            '& .MuiLinearProgress-bar': {
                              bgcolor: 'var(--localflix-red)',
                            },
                          }}
                        />
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}

        {/* Pinned Folders Section */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bookmark sx={{ color: 'var(--localflix-red)' }} /> Pinned Shortcuts
          </Typography>
          {pinnedList.length > 0 ? (
            <Grid container spacing={3}>
              {pinnedList.map((folder, index) => {
                const gradient = CARD_GRADIENTS[(index + 2) % CARD_GRADIENTS.length];
                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={folder.path}>
                    <Card
                      className="movie-card"
                      onClick={() => onNavigateToPath(folder.path)}
                      sx={{
                        bgcolor: 'var(--bg-card)',
                        border: '1px solid #222',
                        borderRadius: 2,
                        height: 110,
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        cursor: 'pointer',
                      }}
                    >
                      {/* Remove button */}
                      <IconButton
                        onClick={(e) => handleRemovePin(e, folder.path)}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          color: 'rgba(255, 255, 255, 0.4)',
                          bgcolor: 'rgba(0, 0, 0, 0.4)',
                          '&:hover': {
                            color: '#fff',
                            bgcolor: 'var(--localflix-red)',
                          },
                          zIndex: 10,
                        }}
                        size="small"
                      >
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>

                      <Box
                        sx={{
                          width: 80,
                          height: '100%',
                          background: folder.thumbnail ? 'none' : gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...(folder.thumbnail && {
                            backgroundImage: `url(${folder.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }),
                        }}
                      >
                        {!folder.thumbnail && <FolderOpen sx={{ color: '#fff', fontSize: 32 }} />}
                      </Box>
                      <CardContent sx={{ p: 2, width: 'calc(100% - 80px)' }}>
                        <Typography
                          variant="subtitle1"
                          sx={{
                            color: '#fff',
                            fontWeight: 600,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {folder.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'var(--text-secondary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block',
                          }}
                        >
                          {folder.path}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          ) : (
            <Box
              sx={{
                border: '2px dashed #333',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                No pinned folders yet.
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Navigate to the File Explorer and click the bookmark icon on any directory to pin it here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
