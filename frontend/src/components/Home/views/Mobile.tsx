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

export const MobileHomeView: React.FC<HomeViewProps> = ({
  continueList,
  pinnedList,
  heroItem,
  onPlayVideo,
  onNavigateToPath,
  handleRemoveContinue,
  handleRemovePin,
}) => {
  return (
    <Box className="fade-in" sx={{ pb: 4 }}>
      {/* Hero Billboard Banner */}
      {heroItem ? (
        <Box
          sx={{
            height: '35vh',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 90%), url("https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?q=80&w=600") no-repeat center/cover',
            display: 'flex',
            alignItems: 'flex-end',
            px: 2,
            pb: 3,
            mb: 3,
          }}
        >
          <Box sx={{ width: '100%' }}>
            <Typography variant="overline" sx={{ color: 'var(--localflix-red)', fontWeight: 800, letterSpacing: 2, fontSize: '0.75rem' }}>
              CONTINUE WATCHING
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: '#fff',
                fontWeight: 800,
                mb: 1.5,
                lineHeight: 1.2,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {heroItem.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrow />}
                onClick={() => onPlayVideo(heroItem.path, heroItem.position)}
                sx={{
                  bgcolor: '#fff',
                  color: '#000',
                  fontWeight: 600,
                  flexGrow: 1,
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
                }}
              >
                Resume
              </Button>
              <IconButton
                size="small"
                onClick={() => onNavigateToPath(heroItem.path.substring(0, heroItem.path.lastIndexOf('\\')))}
                sx={{
                  color: '#fff',
                  bgcolor: 'rgba(0, 0, 0, 0.4)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: 1,
                  px: 1.5,
                }}
              >
                <FolderOpen />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Empty Hero placeholder with Netflix Billboard styling */
        <Box
          sx={{
            height: '25vh',
            width: '100%',
            position: 'relative',
            background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 100%), url("https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600") no-repeat center/cover',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <Box sx={{ textAlign: 'center', px: 2 }}>
            <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, mb: 0.5 }}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
              Open the file explorer to search and play videos.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Rows */}
      <Box sx={{ px: 2 }}>
        {/* Continue Watching Section */}
        {continueList.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History sx={{ color: 'var(--localflix-red)', fontSize: '1.2rem' }} /> Continue Watching
            </Typography>
            <Grid container spacing={2}>
              {continueList.map((item, index) => {
                const percentage = (item.position / item.duration) * 100;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                  <Grid item xs={12} sm={6} key={item.path}>
                    <Card
                      onClick={() => onPlayVideo(item.path, item.position)}
                      sx={{
                        bgcolor: 'var(--bg-card)',
                        border: '1px solid #222',
                        borderRadius: 2,
                        display: 'flex',
                        height: 90,
                        alignItems: 'center',
                        position: 'relative',
                      }}
                    >
                      {/* Remove button */}
                      <IconButton
                        onClick={(e) => handleRemoveContinue(e, item.path)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          color: 'rgba(255, 255, 255, 0.4)',
                          bgcolor: 'rgba(0, 0, 0, 0.4)',
                          zIndex: 10,
                        }}
                        size="small"
                      >
                        <Close sx={{ fontSize: 14 }} />
                      </IconButton>

                      <Box
                        sx={{
                          width: 120,
                          height: '100%',
                          background: item.thumbnail ? 'none' : gradient,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          flexShrink: 0,
                          ...(item.thumbnail && {
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }),
                        }}
                      >
                        <IconButton
                          size="small"
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.4)',
                            color: '#fff',
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Box>
                      <Box sx={{ flexGrow: 1, p: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
                        <Box>
                          <Typography
                            variant="body2"
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
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block' }}>
                            Resumes at {Math.floor(item.position / 60)}m
                          </Typography>
                        </Box>
                        {/* Playback progress bar */}
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={{
                            bgcolor: '#333',
                            height: 3,
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
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Bookmark sx={{ color: 'var(--localflix-red)', fontSize: '1.2rem' }} /> Pinned Shortcuts
          </Typography>
          {pinnedList.length > 0 ? (
            <Grid container spacing={2}>
              {pinnedList.map((folder, index) => {
                const gradient = CARD_GRADIENTS[(index + 2) % CARD_GRADIENTS.length];
                return (
                  <Grid item xs={12} sm={6} key={folder.path}>
                    <Card
                      onClick={() => onNavigateToPath(folder.path)}
                      sx={{
                        bgcolor: 'var(--bg-card)',
                        border: '1px solid #222',
                        borderRadius: 2,
                        height: 90,
                        display: 'flex',
                        alignItems: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                      }}
                    >
                      {/* Remove button */}
                      <IconButton
                        onClick={(e) => handleRemovePin(e, folder.path)}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          color: 'rgba(255, 255, 255, 0.4)',
                          bgcolor: 'rgba(0, 0, 0, 0.4)',
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
                          flexShrink: 0,
                          ...(folder.thumbnail && {
                            backgroundImage: `url(${folder.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                          }),
                        }}
                      >
                        {!folder.thumbnail && <FolderOpen sx={{ color: '#fff', fontSize: 28 }} />}
                      </Box>
                      <CardContent sx={{ p: 1.5, width: 'calc(100% - 80px)', '&:last-child': { pb: 1.5 } }}>
                        <Typography
                          variant="body2"
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
                border: '1px dashed #333',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}
            >
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                No pinned folders yet.
              </Typography>
              <Typography variant="caption" sx={{ color: '#555', display: 'block' }}>
                Bookmark folders in File Explorer to see them here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
