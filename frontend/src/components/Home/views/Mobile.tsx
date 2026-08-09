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
import type { SxProps, Theme } from '@mui/material';
import {
  PlayArrow,
  FolderOpen,
  History,
  Bookmark,
  Close,
} from '@mui/icons-material';
import { CARD_GRADIENTS } from '../hooks';
import type { HomeViewProps } from './types';

const containerSx: SxProps<Theme> = { pb: 4 };

const heroBannerSx: SxProps<Theme> = {
  height: '35vh',
  width: '100%',
  position: 'relative',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 90%), url("https://images.unsplash.com/photo-1574375927938-d5a98e8edd85?q=80&w=600") no-repeat center/cover',
  display: 'flex',
  alignItems: 'flex-end',
  px: 2,
  pb: 3,
  mb: 3,
};

const heroContentBoxSx: SxProps<Theme> = { width: '100%' };

const heroOverlineSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontWeight: 800, letterSpacing: 2, fontSize: '0.75rem' };

const heroTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 800,
  mb: 1.5,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
};

const heroActionsBoxSx: SxProps<Theme> = { display: 'flex', gap: 1 };

const heroResumeBtnSx: SxProps<Theme> = {
  bgcolor: '#fff',
  color: '#000',
  fontWeight: 600,
  flexGrow: 1,
  '&:hover': { bgcolor: 'rgba(255,255,255,0.8)' },
};

const heroFolderBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(0, 0, 0, 0.4)',
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: 1,
  px: 1.5,
};

const emptyHeroBannerSx: SxProps<Theme> = {
  height: '25vh',
  width: '100%',
  position: 'relative',
  background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(20,20,20,1) 100%), url("https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=600") no-repeat center/cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  mb: 3,
};

const emptyHeroContentBoxSx: SxProps<Theme> = { textAlign: 'center', px: 2 };

const emptyHeroTitleSx: SxProps<Theme> = { color: '#fff', fontWeight: 800, mb: 0.5 };

const emptyHeroDescSx: SxProps<Theme> = { color: 'var(--text-secondary)' };

const mainRowsBoxSx: SxProps<Theme> = { px: 2 };

const continueWatchingBoxSx: SxProps<Theme> = { mb: 4 };

const sectionTitleSx: SxProps<Theme> = { color: '#fff', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 };

const historyIconSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontSize: '1.2rem' };

const continueCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  display: 'flex',
  height: 90,
  alignItems: 'center',
  position: 'relative',
};

const removeContinueBtnSx: SxProps<Theme> = {
  position: 'absolute',
  top: 4,
  right: 4,
  color: 'rgba(255, 255, 255, 0.4)',
  bgcolor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 10,
};

const removeIconSx: SxProps<Theme> = { fontSize: 14 };

const continueThumbBoxSx: SxProps<Theme> = {
  width: 120,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  flexShrink: 0,
};

const continuePlayBtnSx: SxProps<Theme> = {
  position: 'absolute',
  bgcolor: 'rgba(0,0,0,0.4)',
  color: '#fff',
};

const continueInfoBoxSx: SxProps<Theme> = { flexGrow: 1, p: 1.5, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' };

const continueTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const continueSubtitleSx: SxProps<Theme> = { color: 'var(--text-secondary)', display: 'block' };

const continueProgressSx: SxProps<Theme> = {
  bgcolor: '#333',
  height: 3,
  borderRadius: 1,
  '& .MuiLinearProgress-bar': {
    bgcolor: 'var(--localflix-red)',
  },
};

const pinnedSectionBoxSx: SxProps<Theme> = { mb: 4 };

const bookmarkIconSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontSize: '1.2rem' };

const pinnedCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  height: 90,
  display: 'flex',
  alignItems: 'center',
  position: 'relative',
  overflow: 'hidden',
};

const removePinBtnSx: SxProps<Theme> = {
  position: 'absolute',
  top: 4,
  right: 4,
  color: 'rgba(255, 255, 255, 0.4)',
  bgcolor: 'rgba(0, 0, 0, 0.4)',
  zIndex: 10,
};

const pinnedThumbBoxSx: SxProps<Theme> = {
  width: 80,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const pinnedFolderIconSx: SxProps<Theme> = { color: '#fff', fontSize: 28 };

const pinnedContentSx: SxProps<Theme> = { p: 1.5, width: 'calc(100% - 80px)', '&:last-child': { pb: 1.5 } };

const pinnedTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const pinnedSubtitleSx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  display: 'block',
};

const emptyPinnedBoxSx: SxProps<Theme> = {
  border: '1px dashed #333',
  borderRadius: 2,
  p: 3,
  textAlign: 'center',
  color: 'var(--text-secondary)',
};

const emptyPinnedTitleSx: SxProps<Theme> = { mb: 0.5 };

const emptyPinnedDescSx: SxProps<Theme> = { color: '#555', display: 'block' };

const getContinueThumbSx = (thumbnail: string | undefined | null, gradient: string): SxProps<Theme> => ({
  ...(continueThumbBoxSx as object),
  background: thumbnail ? 'none' : gradient,
  ...(thumbnail && {
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
});

const getPinnedThumbSx = (thumbnail: string | undefined | null, gradient: string): SxProps<Theme> => ({
  ...(pinnedThumbBoxSx as object),
  background: thumbnail ? 'none' : gradient,
  ...(thumbnail && {
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
});

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
    <Box className="fade-in" sx={containerSx} data-style="containerSx">
      {/* Hero Billboard Banner */}
      {heroItem ? (
        <Box
          sx={heroBannerSx}
          data-style="heroBannerSx"
        >
          <Box sx={heroContentBoxSx} data-style="heroContentBoxSx">
            <Typography variant="overline" sx={heroOverlineSx}>
              CONTINUE WATCHING
            </Typography>
            <Typography
              variant="h5"
              sx={heroTitleSx}
            >
              {heroItem.name}
            </Typography>
            <Box sx={heroActionsBoxSx} data-style="heroActionsBoxSx">
              <Button
                variant="contained"
                size="small"
                startIcon={<PlayArrow />}
                onClick={() => onPlayVideo(heroItem.path, heroItem.position)}
                sx={heroResumeBtnSx}
              >
                Resume
              </Button>
              <IconButton
                size="small"
                onClick={() => onNavigateToPath(heroItem.path.substring(0, heroItem.path.lastIndexOf('\\')))}
                sx={heroFolderBtnSx}
                data-style="heroFolderBtnSx"
              >
                <FolderOpen />
              </IconButton>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Empty Hero placeholder with Netflix Billboard styling */
        <Box
          sx={emptyHeroBannerSx}
          data-style="emptyHeroBannerSx"
        >
          <Box sx={emptyHeroContentBoxSx} data-style="emptyHeroContentBoxSx">
            <Typography variant="h5" sx={emptyHeroTitleSx}>
              Welcome back
            </Typography>
            <Typography variant="body2" sx={emptyHeroDescSx}>
              Open the file explorer to search and play videos.
            </Typography>
          </Box>
        </Box>
      )}

      {/* Main Rows */}
      <Box sx={mainRowsBoxSx} data-style="mainRowsBoxSx">
        {/* Continue Watching Section */}
        {continueList.length > 0 && (
          <Box sx={continueWatchingBoxSx} data-style="continueWatchingBoxSx">
            <Typography variant="subtitle1" sx={sectionTitleSx}>
              <History sx={historyIconSx} /> Continue Watching
            </Typography>
            <Grid container spacing={2}>
              {continueList.map((item, index) => {
                const percentage = (item.position / item.duration) * 100;
                const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];

                return (
                  <Grid item xs={12} sm={6} key={item.path}>
                    <Card
                      onClick={() => onPlayVideo(item.path, item.position)}
                      sx={continueCardSx}
                    >
                      {/* Remove button */}
                      <IconButton
                        onClick={(e) => handleRemoveContinue(e, item.path)}
                        sx={removeContinueBtnSx}
                        data-style="removeContinueBtnSx"
                        size="small"
                      >
                        <Close sx={removeIconSx} />
                      </IconButton>

                      <Box
                        sx={getContinueThumbSx(item.thumbnail, gradient)}
                        data-style="continueThumbBoxSx"
                      >
                        <IconButton
                          size="small"
                          sx={continuePlayBtnSx}
                          data-style="continuePlayBtnSx"
                        >
                          <PlayArrow />
                        </IconButton>
                      </Box>
                      <Box sx={continueInfoBoxSx} data-style="continueInfoBoxSx">
                        <Box>
                          <Typography
                            variant="body2"
                            sx={continueTitleSx}
                          >
                            {item.name}
                          </Typography>
                          <Typography variant="caption" sx={continueSubtitleSx}>
                            Resumes at {Math.floor(item.position / 60)}m
                          </Typography>
                        </Box>
                        {/* Playback progress bar */}
                        <LinearProgress
                          variant="determinate"
                          value={percentage}
                          sx={continueProgressSx}
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
        <Box sx={pinnedSectionBoxSx} data-style="pinnedSectionBoxSx">
          <Typography variant="subtitle1" sx={sectionTitleSx}>
            <Bookmark sx={bookmarkIconSx} /> Pinned Shortcuts
          </Typography>
          {pinnedList.length > 0 ? (
            <Grid container spacing={2}>
              {pinnedList.map((folder, index) => {
                const gradient = CARD_GRADIENTS[(index + 2) % CARD_GRADIENTS.length];
                return (
                  <Grid item xs={12} sm={6} key={folder.path}>
                    <Card
                      onClick={() => onNavigateToPath(folder.path)}
                      sx={pinnedCardSx}
                    >
                      {/* Remove button */}
                      <IconButton
                        onClick={(e) => handleRemovePin(e, folder.path)}
                        sx={removePinBtnSx}
                        data-style="removePinBtnSx"
                        size="small"
                      >
                        <Close sx={removeIconSx} />
                      </IconButton>

                      <Box
                        sx={getPinnedThumbSx(folder.thumbnail, gradient)}
                        data-style="pinnedThumbBoxSx"
                      >
                        {!folder.thumbnail && <FolderOpen sx={pinnedFolderIconSx} />}
                      </Box>
                      <CardContent sx={pinnedContentSx}>
                        <Typography
                          variant="body2"
                          sx={pinnedTitleSx}
                        >
                          {folder.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={pinnedSubtitleSx}
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
              sx={emptyPinnedBoxSx}
              data-style="emptyPinnedBoxSx"
            >
              <Typography variant="body2" sx={emptyPinnedTitleSx}>
                No pinned folders yet.
              </Typography>
              <Typography variant="caption" sx={emptyPinnedDescSx}>
                Bookmark folders in File Explorer to see them here.
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};
