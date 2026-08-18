import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Button,
  LinearProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  PlayArrow,
  FolderOpen,
  History,
  Bookmark,
  Close,
  Replay,
  Tv,
  PlayCircleOutline,
} from '@mui/icons-material';
import { CARD_GRADIENTS } from '../hooks';
import type { HomeViewProps } from './types';

const mainContainerSx: SxProps<Theme> = { pb: 6 };

const heroBannerSx: SxProps<Theme> = {
  height: '45vh',
  width: '100%',
  position: 'relative',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 90%), url("https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?q=80&w=1400") no-repeat center/cover',
  display: 'flex',
  alignItems: 'flex-end',
  px: { xs: 3, md: 6 },
  pb: 4,
  mb: 4,
};

const heroContentBoxSx: SxProps<Theme> = { maxWidth: 600 };

const heroSubtitleSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontWeight: 800, letterSpacing: 3 };

const heroTitleSx: SxProps<Theme> = {
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
};

const heroActionsBoxSx: SxProps<Theme> = { display: 'flex', gap: 2 };

const resumeButtonSx: SxProps<Theme> = {
  bgcolor: '#fff',
  color: '#000',
  fontWeight: 600,
  px: 3,
  py: 1,
  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
};

const showFolderButtonSx: SxProps<Theme> = {
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
};

const heroPlaceholderSx: SxProps<Theme> = {
  height: '35vh',
  width: '100%',
  position: 'relative',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 100%), url("https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1400") no-repeat center/cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 4,
};

const heroPlaceholderTextBoxSx: SxProps<Theme> = { textAlign: 'center', px: 2 };

const heroPlaceholderTitleSx: SxProps<Theme> = { color: '#fff', fontWeight: 800, mb: 1 };

const heroPlaceholderSubtitleSx: SxProps<Theme> = { color: 'var(--text-secondary)' };

const mainRowsContainerSx: SxProps<Theme> = { px: { xs: 3, md: 6 } };

const continueWatchingSectionSx: SxProps<Theme> = { mb: 6 };

const sectionTitleSx: SxProps<Theme> = { color: '#fff', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 };

const sectionIconSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const continueWatchingCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  cursor: 'pointer',
};

const cardImageBoxSx: SxProps<Theme> = {
  height: 140,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  px: 2,
  position: 'relative',
};

const removeButtonSx: SxProps<Theme> = {
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
};

const closeIconSx: SxProps<Theme> = { fontSize: 16 };

const playOverlayContainerSx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: 'rgba(0,0,0,0.6)',
  color: '#fff',
  opacity: 0,
  transition: 'opacity 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 2,
  '&:hover': { opacity: 1 },
};

const playOverlayBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(229, 9, 20, 0.9)',
  '&:hover': { bgcolor: 'var(--localflix-red)', transform: 'scale(1.1)' },
  transition: 'transform 0.2s',
};

const restartOverlayBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(255,255,255,0.2)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)', transform: 'scale(1.1)' },
  transition: 'transform 0.2s',
};

const cardContentSx: SxProps<Theme> = { flexGrow: 1, p: 2, pb: 1 };

const cardTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const cardSubtitleSx: SxProps<Theme> = { color: 'var(--text-secondary)' };

const progressBarContainerSx: SxProps<Theme> = { width: '100%', px: 2, pb: 2 };

const progressBarSx: SxProps<Theme> = {
  bgcolor: '#333',
  height: 4,
  borderRadius: 1,
  '& .MuiLinearProgress-bar': {
    bgcolor: 'var(--localflix-red)',
  },
};

const pinnedSectionSx: SxProps<Theme> = { mb: 6 };

const pinnedSectionIconSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const pinnedCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  height: 110,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
  cursor: 'pointer',
};

const pinnedRemoveButtonSx: SxProps<Theme> = {
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
};

const pinnedCloseIconSx: SxProps<Theme> = { fontSize: 14 };

const pinnedImageBoxSx: SxProps<Theme> = {
  width: 80,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const folderOpenIconSx: SxProps<Theme> = { color: '#fff', fontSize: 32 };

const pinnedCardContentSx: SxProps<Theme> = { p: 2, width: 'calc(100% - 80px)' };

const pinnedCardTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const pinnedCardPathSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

const noPinnedPlaceholderSx: SxProps<Theme> = {
  border: '2px dashed #333',
  borderRadius: 2,
  p: 4,
  textAlign: 'center',
  color: 'var(--text-secondary)',
};

const noPinnedTextSx: SxProps<Theme> = { mb: 1 };

const noPinnedSubTextSx: SxProps<Theme> = { color: '#666' };

const getContinueWatchingImageSx = (thumbnail: string | undefined | null, gradient: string): SxProps<Theme> => ({
  ...(cardImageBoxSx as object),
  background: thumbnail ? 'none' : gradient,
  ...(thumbnail && {
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
});

const getPinnedFolderImageSx = (thumbnail: string | undefined | null, gradient: string): SxProps<Theme> => ({
  ...(pinnedImageBoxSx as object),
  background: thumbnail ? 'none' : gradient,
  ...(thumbnail && {
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
});

export const WebHomeView: React.FC<HomeViewProps> = ({
  continueList,
  pinnedList,
  heroItem,
  onPlayVideo,
  onNavigateToPath,
  handleRemoveContinue,
  handleRemovePin,
}) => {
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [contextMenuItem, setContextMenuItem] = useState<any>(null);

  const handleOpenContextMenu = (e: React.MouseEvent, item: any) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setContextMenuItem(item);
  };

  const handleCloseContextMenu = () => {
    setContextMenuPos(null);
    setContextMenuItem(null);
  };

  return (
    <Box className="fade-in" data-style="mainContainerSx" sx={mainContainerSx}>
      {/* Hero Billboard Banner */}
      {heroItem ? (
        <Box
          data-style="heroBannerSx"
          sx={heroBannerSx}
          onContextMenu={(e) => handleOpenContextMenu(e, heroItem)}
        >
          <Box data-style="heroContentBoxSx" sx={heroContentBoxSx}>
            <Typography variant="overline" sx={heroSubtitleSx}>
              CONTINUE WATCHING
            </Typography>
            <Typography
              variant="h3"
              sx={heroTitleSx}
            >
              {heroItem.name}
            </Typography>
            <Box data-style="heroActionsBoxSx" sx={heroActionsBoxSx}>
              <Button
                variant="contained"
                startIcon={<PlayArrow />}
                onClick={() => onPlayVideo(heroItem.path, heroItem.position)}
                sx={resumeButtonSx}
              >
                Resume
              </Button>
              <Button
                variant="outlined"
                startIcon={<Replay />}
                onClick={() => onPlayVideo(heroItem.path, 0)}
                sx={showFolderButtonSx}
              >
                Start Over
              </Button>
              <Button
                variant="outlined"
                startIcon={<FolderOpen />}
                onClick={() => onNavigateToPath(heroItem.path.substring(0, heroItem.path.lastIndexOf('\\')))}
                sx={showFolderButtonSx}
              >
                Show Folder
              </Button>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Empty Hero placeholder with Netflix Billboard styling */
        <Box
          data-style="heroPlaceholderSx"
          sx={heroPlaceholderSx}
        >
          <Box data-style="heroPlaceholderTextBoxSx" sx={heroPlaceholderTextBoxSx}>
            <Typography variant="h3" sx={heroPlaceholderTitleSx}>
              Welcome back
            </Typography>
            <Typography variant="h6" sx={heroPlaceholderSubtitleSx}>
              Browse the file explorer to play your videos and configure storage paths.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Rows */}
      <Box data-style="mainRowsContainerSx" sx={mainRowsContainerSx}>
        {/* Continue Watching Section */}
        {continueList.length > 0 && (
          <Box data-style="continueWatchingSectionSx" sx={continueWatchingSectionSx}>
            <Typography variant="h5" sx={sectionTitleSx}>
              <History sx={sectionIconSx} /> Continue Watching
            </Typography>
            <Grid container spacing={3}>
              {continueList.map((item, index) => {
                const percentage = (item.position / item.duration) * 100;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
                    <Card
                      className="movie-card"
                      tabIndex={0}
                      role="button"
                      aria-label={`Play ${item.name}`}
                      onClick={() => onPlayVideo(item.path, item.position)}
                      onContextMenu={(e) => handleOpenContextMenu(e, item)}
                      sx={continueWatchingCardSx}
                    >
                      <Box
                        data-style="getContinueWatchingImageSx"
                        sx={getContinueWatchingImageSx(item.thumbnail, gradient)}
                      >
                        {/* Remove button */}
                        <IconButton
                          data-style="removeButtonSx"
                          onClick={(e) => handleRemoveContinue(e, item.path)}
                          sx={removeButtonSx}
                          size="small"
                        >
                          <Close sx={closeIconSx} />
                        </IconButton>

                        <Box
                          className="play-overlay"
                          data-style="playOverlayContainerSx"
                          sx={playOverlayContainerSx}
                        >
                          <IconButton
                            data-style="playOverlayBtnSx"
                            sx={playOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, item.position);
                            }}
                            title="Resume Video"
                          >
                            <PlayArrow fontSize="large" />
                          </IconButton>
                          <IconButton
                            data-style="restartOverlayBtnSx"
                            sx={restartOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, 0);
                            }}
                            title="Restart from Beginning"
                          >
                            <Replay fontSize="medium" />
                          </IconButton>
                        </Box>
                      </Box>
                      <CardContent sx={cardContentSx}>
                        <Typography
                          variant="subtitle1"
                          sx={cardTitleSx}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" sx={cardSubtitleSx}>
                          Resumes at {Math.floor(item.position / 60)}m
                        </Typography>
                      </CardContent>
                      {/* Playback progress bar */}
                      <Box data-style="progressBarContainerSx" sx={progressBarContainerSx}>
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={progressBarSx}
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
        <Box data-style="pinnedSectionSx" sx={pinnedSectionSx}>
          <Typography variant="h5" sx={sectionTitleSx}>
            <Bookmark sx={pinnedSectionIconSx} /> Pinned Shortcuts
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
                      sx={pinnedCardSx}
                    >
                      {/* Remove button */}
                      <IconButton
                        data-style="pinnedRemoveButtonSx"
                        onClick={(e) => handleRemovePin(e, folder.path)}
                        sx={pinnedRemoveButtonSx}
                        size="small"
                      >
                        <Close sx={pinnedCloseIconSx} />
                      </IconButton>

                      <Box
                        data-style="getPinnedFolderImageSx"
                        sx={getPinnedFolderImageSx(folder.thumbnail, gradient)}
                      >
                        {!folder.thumbnail && <FolderOpen sx={folderOpenIconSx} />}
                      </Box>
                      <CardContent sx={pinnedCardContentSx}>
                        <Typography
                          variant="subtitle1"
                          sx={pinnedCardTitleSx}
                        >
                          {folder.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={pinnedCardPathSx}
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
              data-style="noPinnedPlaceholderSx"
              sx={noPinnedPlaceholderSx}
            >
              <Typography variant="body1" sx={noPinnedTextSx}>
                No pinned folders yet.
              </Typography>
              <Typography variant="body2" sx={noPinnedSubTextSx}>
                Navigate to the File Explorer and click the bookmark icon on any directory to pin it here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Video Context Menu */}
      <Menu
        open={contextMenuPos !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenuPos !== null
            ? { top: contextMenuPos.y, left: contextMenuPos.x }
            : undefined
        }
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-card)',
            color: '#fff',
            border: '1px solid #333',
            minWidth: 230,
            '& .MuiMenuItem-root': {
              fontSize: '0.9rem',
              py: 1,
              '&:hover': { bgcolor: 'rgba(255,255,255,0.08)' },
            },
          },
        }}
      >
        {contextMenuItem && (
          <>
            <MenuItem
              onClick={() => {
                onPlayVideo(contextMenuItem.path, contextMenuItem.position || 0, 'hls');
                handleCloseContextMenu();
              }}
            >
              <PlayArrow fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} /> Play with HLS Player
            </MenuItem>
            <MenuItem
              onClick={() => {
                onPlayVideo(contextMenuItem.path, contextMenuItem.position || 0, 'alt');
                handleCloseContextMenu();
              }}
            >
              <PlayCircleOutline fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} /> Play with Alt Player
            </MenuItem>
            <MenuItem
              onClick={() => {
                onPlayVideo(contextMenuItem.path, contextMenuItem.position || 0, 'tv');
                handleCloseContextMenu();
              }}
            >
              <Tv fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} /> Play with TV Player (MP4)
            </MenuItem>
            <MenuItem
              onClick={() => {
                onPlayVideo(contextMenuItem.path, 0);
                handleCloseContextMenu();
              }}
            >
              <Replay fontSize="small" sx={{ mr: 1.5, color: 'var(--text-secondary)' }} /> Restart from Beginning
            </MenuItem>
          </>
        )}
      </Menu>
    </Box>
  );
};
