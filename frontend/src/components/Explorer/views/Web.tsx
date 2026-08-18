import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  IconButton,
  Breadcrumbs,
  Link,
  TextField,
  InputAdornment,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  Folder,
  Movie,
  Bookmark,
  BookmarkBorder,
  Search,
  ArrowUpward,
  PlayArrow,
  CheckCircle,
  MoreVert,
  Replay,
  Download,
  VideoLibrary,
} from '@mui/icons-material';
import { api } from '../../../api';
import type { ExplorerItem } from '../../../api';
import type { ExplorerViewProps } from './types';
import { ConvertDialog } from './ConvertDialog';
import { ConversionProgressPortal } from './ConversionProgressPortal';


const rootBreadcrumbTextSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontWeight: 600 };
const breadcrumbBarSx: SxProps<Theme> = { color: '#fff', mb: 3 };
const breadcrumbLinkSx: SxProps<Theme> = { color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#fff' } };
const breadcrumbDisabledSx: SxProps<Theme> = { color: 'rgba(255, 255, 255, 0.25)', cursor: 'not-allowed', fontStyle: 'italic' };
const explorerContainerSx: SxProps<Theme> = { px: { xs: 3, md: 6 }, pb: 6 };
const topToolbarSx: SxProps<Theme> = { display: 'flex', justifyItems: 'center', justifyContent: 'space-between', mb: 4, gap: 2 };
const titleTextSx: SxProps<Theme> = { color: '#fff', fontWeight: 700, mb: 1 };
const topToolbarActionsSx: SxProps<Theme> = { display: 'flex', gap: 2, alignItems: 'center' };
const upButtonSx: SxProps<Theme> = {
  borderColor: '#333',
  color: '#fff',
  bgcolor: 'rgba(255,255,255,0.03)',
  '&:hover': { borderColor: '#555', bgcolor: 'rgba(255,255,255,0.08)' },
  '&.Mui-disabled': { borderColor: '#222', color: '#444', bgcolor: 'transparent' }
};
const searchAdornmentSx: SxProps<Theme> = { color: 'var(--text-secondary)' };
const searchInputSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'var(--bg-card)',
  borderColor: '#333',
  borderRadius: 2,
  width: 240,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#333',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    borderColor: '#555',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    borderColor: 'var(--localflix-red)',
  },
};

const loadingContainerSx: SxProps<Theme> = { display: 'flex', justifyContent: 'center', py: 8 };
const linearProgressSx: SxProps<Theme> = { width: '50%', bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: 'var(--localflix-red)' } };
const folderCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
  cursor: 'pointer',
};
const cardImageContainerBaseSx: SxProps<Theme> = {
  height: 120,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
};
const playOverlayContainerSx: SxProps<Theme> = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: 'rgba(0,0,0,0.6)',
  borderRadius: 1,
  opacity: 0,
  transition: 'opacity 0.2s',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1.5,
  '.movie-card:hover &': { opacity: 1 },
};
const playOverlayBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(229, 9, 20, 0.9)',
  '&:hover': { bgcolor: 'var(--localflix-red)', transform: 'scale(1.1)' },
  transition: 'transform 0.2s',
};
const replayOverlayBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(255,255,255,0.2)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)', transform: 'scale(1.1)' },
  transition: 'transform 0.2s',
};
const downloadOverlayBtnSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'rgba(255,255,255,0.2)',
  '&:hover': { bgcolor: 'rgba(255,255,255,0.4)', transform: 'scale(1.1)' },
  transition: 'transform 0.2s',
};
const explorerToastSx: SxProps<Theme> = {
  position: 'fixed',
  bottom: 24,
  left: '50%',
  transform: 'translateX(-50%)',
  bgcolor: 'rgba(0, 0, 0, 0.9)',
  color: '#fff',
  px: 3,
  py: 1.5,
  borderRadius: 2,
  zIndex: 1300,
  border: '1px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
  fontSize: '0.9rem',
};
const folderIconSx: SxProps<Theme> = { fontSize: 56, color: 'rgba(255,255,255,0.7)' };
const movieIconSx: SxProps<Theme> = { fontSize: 50, color: 'var(--localflix-red)' };

const pinButtonSx: SxProps<Theme> = {
  position: 'absolute',
  top: 8,
  left: 8,
  bgcolor: 'rgba(0,0,0,0.4)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
};
const menuButtonSx: SxProps<Theme> = {
  position: 'absolute',
  top: 8,
  right: 8,
  color: 'rgba(255,255,255,0.7)',
  bgcolor: 'rgba(0,0,0,0.4)',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
};
const bookmarkIconSx: SxProps<Theme> = { fontSize: 18 };
const cardContentSx: SxProps<Theme> = { p: 2, flexGrow: 1 };
const cardTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  lineHeight: 1.2,
  minHeight: '2.4em',
};
const sizeTextSx: SxProps<Theme> = { color: 'var(--text-secondary)', display: 'block', mt: 1 };
const progressContainerSx: SxProps<Theme> = { width: '100%', px: 2, pb: 2 };
const progressBarSx: SxProps<Theme> = {
  bgcolor: '#333',
  height: 4,
  borderRadius: 1,
  '& .MuiLinearProgress-bar': {
    bgcolor: 'var(--localflix-red)',
  },
};
const emptyFolderContainerSx: SxProps<Theme> = {
  border: '2px dashed #333',
  borderRadius: 2,
  p: 6,
  textAlign: 'center',
  color: 'var(--text-secondary)',
};
const emptyFolderTitleSx: SxProps<Theme> = { mb: 1 };
const contextMenuPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  color: '#fff',
  border: '1px solid #333',
  minWidth: 180,
  '& .MuiMenuItem-root': {
    fontSize: '0.9rem',
    py: 1,
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.05)',
    }
  }
};
const removeThumbnailItemSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const dialogPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 2,
  p: 1
};
const dialogTitleSx: SxProps<Theme> = { fontWeight: 700, pb: 1 };
const dialogContentDividerSx: SxProps<Theme> = { borderColor: '#333' };
const dialogContentBoxSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 3, mt: 1 };
const pinNameInputSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
  '& .MuiInputBase-root': { color: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
};
const searchSubtitleSx: SxProps<Theme> = { color: 'var(--text-secondary)', mb: 1.5, fontWeight: 600 };
const searchBoxSx: SxProps<Theme> = { display: 'flex', gap: 2, mb: 3 };
const searchImageInputSx: SxProps<Theme> = {
  '& .MuiInputBase-root': { color: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
};
const searchButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  px: 3,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
  '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
};
const searchSpinnerContainerSx: SxProps<Theme> = { display: 'flex', justifyContent: 'center', py: 4 };
const searchResultsGridSx: SxProps<Theme> = { maxHeight: 300, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 3 } };
const searchResultItemBaseSx: SxProps<Theme> = {
  height: 80,
  borderRadius: 1,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  cursor: 'pointer',
  position: 'relative',
  transition: 'all 0.2s',
  '&:hover': { opacity: 0.8 },
};
const selectedIconContainerSx: SxProps<Theme> = { position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' };
const selectedIconSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontSize: 20 };
const emptySearchBoxSx: SxProps<Theme> = { border: '1px dashed #333', p: 4, textAlign: 'center', borderRadius: 1 };

const dialogActionsSx: SxProps<Theme> = { p: 2, borderColor: '#333' };
const cancelButtonSx: SxProps<Theme> = { color: 'var(--text-secondary)', fontWeight: 600 };
const pinSubmitButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  px: 3,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' }
};
const thumbnailSubmitButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  px: 3,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
  '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
};

const getCardImageSx = (isDir: boolean, thumbnail?: string | null): SxProps<Theme> => ({
  ...(cardImageContainerBaseSx as object),
  bgcolor: isDir ? '#1b1b1b' : '#222222',
  ...(thumbnail && {
    backgroundImage: `url(${thumbnail})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }),
});

const pinActiveButtonSx: SxProps<Theme> = { ...(pinButtonSx as object), color: 'var(--localflix-red)' };
const pinInactiveButtonSx: SxProps<Theme> = { ...(pinButtonSx as object), color: 'rgba(255,255,255,0.7)' };

const cardContentWithProgressSx: SxProps<Theme> = { ...(cardContentSx as object), pb: 1 };
const cardContentNoProgressSx: SxProps<Theme> = { ...(cardContentSx as object), pb: 2 };

const getSearchResultItemSx = (isSelected: boolean, thumbnail: string): SxProps<Theme> => ({
  ...(searchResultItemBaseSx as object),
  border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
  backgroundImage: `url(${thumbnail})`,
});

export const WebExplorerView: React.FC<ExplorerViewProps> = ({
  currentPath,
  items,
  loading,
  searchQuery,
  setSearchQuery,
  filteredItems,
  pinDialogOpen,
  setPinDialogOpen,
  pinTitle,
  setPinTitle,
  thumbnailDialogOpen,
  setThumbnailDialogOpen,
  handleThumbnailOpen,
  handleThumbnailSubmit,
  handleThumbnailRemove,
  imageSearchQuery,
  setImageSearchQuery,
  searchResults,
  searchingImages,
  selectedThumbnail,
  setSelectedThumbnail,
  loadDirectory,
  handleFolderClick,
  handleBackClick,
  handlePinToggle,
  handleSearchImages,
  handlePinSubmit,
  formatSize,
  onPlayVideo,
  isPathAllowed,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuItem, setMenuItem] = useState<ExplorerItem | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [convertDialogItem, setConvertDialogItem] = useState<ExplorerItem | null>(null);
  const [batchConvertOpen, setBatchConvertOpen] = useState(false);
  const [conversions, setConversions] = useState<Record<string, { status: string; progress: number; filename: string }>>({});
  const completedConversionsRef = useRef<Set<string>>(new Set());

  const convertibleItems = items.filter(
    (it) => !it.isDirectory && !it.name.toLowerCase().endsWith('.mp4')
  );

  useEffect(() => {
    const interval = setInterval(() => {
      api.getConversionStatus().then((res) => {
        if (res.conversions) {
          setConversions(res.conversions);
          let newCompleted = false;
          for (const [key, c] of Object.entries(res.conversions)) {
            if (c.progress === 100 && !completedConversionsRef.current.has(key)) {
              completedConversionsRef.current.add(key);
              newCompleted = true;
            }
          }
          if (newCompleted) {
            loadDirectory(currentPath);
          }
        }
      }).catch(() => {});
    }, 1500);

    return () => clearInterval(interval);
  }, [currentPath, loadDirectory]);

  const handleStartConvert = (
    videoPath: string,
    audioTrack: number | null,
    subtitleTrack: number | string | null,
    burnSubtitles: boolean
  ) => {
    api.convertVideo(videoPath, audioTrack, subtitleTrack, burnSubtitles)
      .then((res) => {
        if (res.queued) {
          setToastMessage(`Added ${res.filename} to conversion queue.`);
        } else {
          setToastMessage(`Converting to ${res.filename}...`);
        }
        setTimeout(() => setToastMessage(null), 4000);
      })
      .catch((err) => {
        setToastMessage(`Conversion failed: ${err.message}`);
        setTimeout(() => setToastMessage(null), 4000);
      });
  };

  const handleStartBatchConvert = async (
    itemsToConvert: ExplorerItem[],
    audioTrack: number | null,
    subtitleTrack: number | string | null,
    burnSubtitles: boolean
  ) => {
    setToastMessage(`Queueing ${itemsToConvert.length} videos for conversion...`);
    setTimeout(() => setToastMessage(null), 4000);

    for (let i = 0; i < itemsToConvert.length; i++) {
      const it = itemsToConvert[i];
      api.convertVideo(it.path, audioTrack, subtitleTrack, burnSubtitles).catch((err) => {
        console.error(`Failed to queue ${it.name}:`, err);
      });
      if (i < itemsToConvert.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  const handleOpenMenu = (event: React.MouseEvent, item: ExplorerItem) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget as HTMLElement);
    setMenuItem(item);
  };

  const handleOpenContextMenu = (event: React.MouseEvent, item: ExplorerItem) => {
    event.preventDefault();
    setContextMenuPos({ x: event.clientX, y: event.clientY });
    setMenuItem(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setContextMenuPos(null);
    setMenuItem(null);
  };

  // Helper to construct breadcrumbs
  const renderBreadcrumbs = () => {
    if (!currentPath) {
      return <Typography sx={rootBreadcrumbTextSx}>Storage Roots</Typography>;
    }

    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator).filter(Boolean);

    return (
      <Breadcrumbs separator="/" sx={breadcrumbBarSx}>
        <Link
          component="button"
          onClick={() => loadDirectory('')}
          sx={breadcrumbLinkSx}
        >
          Roots
        </Link>
        {parts.map((part, index) => {
          const segmentPath = parts.slice(0, index + 1).join(separator);
          const isDrive = part.endsWith(':');
          const finalSegmentPath = isDrive ? part + separator : segmentPath;
          const isLast = index === parts.length - 1;
          const isAllowed = isPathAllowed(finalSegmentPath);

          if (isLast) {
            return (
              <Typography key={segmentPath} sx={rootBreadcrumbTextSx}>
                {part}
              </Typography>
            );
          }

          if (!isAllowed) {
            return (
              <Typography
                key={segmentPath}
                sx={breadcrumbDisabledSx}
              >
                {part}
              </Typography>
            );
          }

          return (
            <Link
              key={segmentPath}
              component="button"
              onClick={() => loadDirectory(finalSegmentPath)}
              sx={breadcrumbLinkSx}
            >
              {part}
            </Link>
          );
        })}
      </Breadcrumbs>
    );
  };

  const getUpPath = () => {
    if (!currentPath) return "";
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator);
    parts.pop();
    const parentPath = parts.join(separator);
    let upPath = parentPath;
    if (parentPath.endsWith(':')) {
      upPath = parentPath + separator;
    }
    return upPath;
  };
  const isUpAllowed = isPathAllowed(getUpPath());

  return (
    <Box className="fade-in" data-style="explorerContainerSx" sx={explorerContainerSx}>
      {/* Explorer Top Toolbar */}
      <Box data-style="topToolbarSx" sx={topToolbarSx}>
        <Box>
          <Typography variant="h4" sx={titleTextSx}>
            File Explorer
          </Typography>
          {renderBreadcrumbs()}
        </Box>

        <Box data-style="topToolbarActionsSx" sx={topToolbarActionsSx}>
          {currentPath && convertibleItems.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<VideoLibrary />}
              onClick={() => setBatchConvertOpen(true)}
              sx={{
                color: '#fff',
                borderColor: 'rgba(229, 9, 20, 0.6)',
                bgcolor: 'rgba(229, 9, 20, 0.12)',
                '&:hover': {
                  borderColor: 'var(--localflix-red)',
                  bgcolor: 'rgba(229, 9, 20, 0.25)',
                },
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Convert All ({convertibleItems.length})
            </Button>
          )}
          {currentPath && (
            <Button
              variant="outlined"
              startIcon={<ArrowUpward />}
              onClick={handleBackClick}
              disabled={!isUpAllowed}
              sx={upButtonSx}
            >
              Up
            </Button>
          )}
          <TextField
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={searchAdornmentSx} />
                </InputAdornment>
              ),
              sx: searchInputSx
            }}
          />
        </Box>
      </Box>

      {/* Directory Contents Grid */}
      {loading ? (
        <Box data-style="loadingContainerSx" sx={loadingContainerSx}>
          <LinearProgress sx={linearProgressSx} />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map((item) => {
            const isDir = item.isDirectory;
            const isMp4 = item.name.toLowerCase().endsWith('.mp4') || item.path.toLowerCase().endsWith('.mp4');
            const hasProgress = item.progress && item.progress.position > 5;
            const progressPercent = hasProgress
              ? (item.progress!.position / item.progress!.duration) * 100
              : 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
                <Card
                  className="movie-card"
                  tabIndex={0}
                  role="button"
                  aria-label={isDir ? `Open folder ${item.name}` : `Play video ${item.name}`}
                  onClick={() => isDir ? handleFolderClick(item.path) : onPlayVideo(item.path, item.progress?.position || 0)}
                  onContextMenu={(e) => handleOpenContextMenu(e, item)}
                  sx={folderCardSx}
                >
                  <Box
                    data-style="getCardImageSx"
                    sx={getCardImageSx(isDir, item.thumbnail)}
                  >
                    {item.thumbnail ? (
                      !isDir && (
                        <Box
                          className="play-overlay"
                          data-style="playOverlayContainerSx" sx={playOverlayContainerSx}
                        >
                          <IconButton
                            size="small"
                            data-style="playOverlayBtnSx"
                            sx={playOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, item.progress?.position || 0);
                            }}
                            title={hasProgress ? "Resume Video" : "Play Video"}
                          >
                            <PlayArrow fontSize="medium" />
                          </IconButton>
                          <IconButton
                            size="small"
                            data-style="replayOverlayBtnSx"
                            sx={replayOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, 0);
                            }}
                            title="Restart from Beginning"
                          >
                            <Replay fontSize="small" />
                          </IconButton>
                          {!isMp4 && (
                            <IconButton
                              size="small"
                              data-style="downloadOverlayBtnSx"
                              sx={downloadOverlayBtnSx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConvertDialogItem(item);
                              }}
                              title="Convert & Save as MP4"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      )
                    ) : isDir ? (
                      <Folder sx={folderIconSx} />
                    ) : (
                      <>
                        <Movie sx={movieIconSx} />
                        <Box
                          className="play-overlay"
                          data-style="playOverlayContainerSx" sx={playOverlayContainerSx}
                        >
                          <IconButton
                            size="small"
                            data-style="playOverlayBtnSx"
                            sx={playOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, item.progress?.position || 0);
                            }}
                            title={hasProgress ? "Resume Video" : "Play Video"}
                          >
                            <PlayArrow fontSize="medium" />
                          </IconButton>
                          <IconButton
                            size="small"
                            data-style="replayOverlayBtnSx"
                            sx={replayOverlayBtnSx}
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, 0);
                            }}
                            title="Restart from Beginning"
                          >
                            <Replay fontSize="small" />
                          </IconButton>
                          {!isMp4 && (
                            <IconButton
                              size="small"
                              data-style="downloadOverlayBtnSx"
                              sx={downloadOverlayBtnSx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setConvertDialogItem(item);
                              }}
                              title="Convert & Save as MP4"
                            >
                              <Download fontSize="small" />
                            </IconButton>
                          )}
                        </Box>
                      </>
                    )}

                    {/* Bookmark Pin Button */}
                    {isDir && (
                      <IconButton
                        onClick={(e) => handlePinToggle(e, item)}
                        data-style={item.isPinned ? "pinActiveButtonSx" : "pinInactiveButtonSx"} sx={item.isPinned ? pinActiveButtonSx : pinInactiveButtonSx}
                      >
                        {item.isPinned ? <Bookmark sx={bookmarkIconSx} /> : <BookmarkBorder sx={bookmarkIconSx} />}
                      </IconButton>
                    )}

                    {/* Folder Menu Button */}
                    {isDir && (
                      <IconButton
                        className="menu-button"
                        onClick={(e) => handleOpenMenu(e, item)}
                        data-style="menuButtonSx" sx={menuButtonSx}
                      >
                        <MoreVert sx={bookmarkIconSx} />
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={hasProgress ? cardContentWithProgressSx : cardContentNoProgressSx}>
                    <Typography
                      variant="subtitle1"
                      sx={cardTitleSx}
                    >
                      {item.name}
                    </Typography>
                    {!isDir && (
                      <Typography variant="caption" sx={sizeTextSx}>
                        {formatSize(item.size)}
                      </Typography>
                    )}
                  </CardContent>

                  {!isDir && hasProgress && (
                    <Box data-style="progressContainerSx" sx={progressContainerSx}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={progressBarSx}
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box data-style="emptyFolderContainerSx" sx={emptyFolderContainerSx}>
          <Typography variant="h6" sx={emptyFolderTitleSx}>
            Empty Folder
          </Typography>
          <Typography variant="body2">
            No playable video files or subfolders found.
          </Typography>
        </Box>
      )}

      {/* Folder Action/Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl) || contextMenuPos !== null}
        onClose={handleCloseMenu}
        anchorReference={contextMenuPos !== null ? 'anchorPosition' : 'anchorEl'}
        anchorPosition={
          contextMenuPos !== null
            ? { top: contextMenuPos.y, left: contextMenuPos.x }
            : undefined
        }
        PaperProps={{
          sx: contextMenuPaperSx
        }}
      >
        {!menuItem?.isDirectory && (
          <>
            <MenuItem
              onClick={() => {
                if (menuItem) onPlayVideo(menuItem.path, 0);
                handleCloseMenu();
              }}
            >
              <Replay fontSize="small" sx={{ mr: 1, color: 'var(--text-secondary)' }} /> Restart from Beginning
            </MenuItem>
            {!(menuItem?.name?.toLowerCase().endsWith('.mp4') || menuItem?.path?.toLowerCase().endsWith('.mp4')) && (
              <MenuItem
                onClick={() => {
                  if (menuItem) setConvertDialogItem(menuItem);
                  handleCloseMenu();
                }}
              >
                <Download fontSize="small" sx={{ mr: 1, color: 'var(--text-secondary)' }} /> Convert & Save as MP4
              </MenuItem>
            )}
          </>
        )}
        <MenuItem
          onClick={() => {
            if (menuItem) handleThumbnailOpen(null, menuItem);
            handleCloseMenu();
          }}
        >
          Set/Change Thumbnail
        </MenuItem>
        {menuItem?.thumbnail && (
          <MenuItem
            onClick={() => {
              if (menuItem) handleThumbnailRemove(menuItem);
              handleCloseMenu();
            }}
            sx={removeThumbnailItemSx}
          >
            Remove Thumbnail
          </MenuItem>
        )}
      </Menu>

      {/* Pin Title Customization Dialog */}
      <Dialog
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: dialogPaperSx
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          Pin Folder to Shortcuts
        </DialogTitle>
        <DialogContent dividers sx={dialogContentDividerSx}>
          <Box data-style="dialogContentBoxSx" sx={dialogContentBoxSx}>
            <TextField
              fullWidth
              label="Pin Name"
              value={pinTitle}
              onChange={(e) => setPinTitle(e.target.value)}
              variant="outlined"
              sx={pinNameInputSx}
            />

            <Box>
              <Typography variant="subtitle2" sx={searchSubtitleSx}>
                Search and Select Thumbnail Cover Art (Optional)
              </Typography>
              <Box data-style="searchBoxSx" sx={searchBoxSx}>
                <TextField
                  fullWidth
                  placeholder="Search artwork..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={searchImageInputSx}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={searchButtonSx}
                >
                  {searchingImages ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box data-style="searchSpinnerContainerSx" sx={searchSpinnerContainerSx}>
                  <CircularProgress sx={removeThumbnailItemSx} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={2} sx={searchResultsGridSx}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          data-style="getSearchResultItemSx" sx={getSearchResultItemSx(isSelected, item.thumbnail)}
                        >
                          {isSelected && (
                            <Box data-style="selectedIconContainerSx" sx={selectedIconContainerSx}>
                              <CheckCircle sx={selectedIconSx} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box data-style="emptySearchBoxSx" sx={emptySearchBoxSx}>
                  <Typography variant="body2" sx={searchAdornmentSx}>
                    Search for images above to select a thumbnail (Optional)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button onClick={() => setPinDialogOpen(false)} sx={cancelButtonSx}>
            Cancel
          </Button>
          <Button
            onClick={handlePinSubmit}
            variant="contained"
            sx={pinSubmitButtonSx}
          >
            Pin Shortcut
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thumbnail Selection Dialog */}
      <Dialog
        open={thumbnailDialogOpen}
        onClose={() => setThumbnailDialogOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: dialogPaperSx
        }}
      >
        <DialogTitle sx={dialogTitleSx}>
          Set Folder Thumbnail
        </DialogTitle>
        <DialogContent dividers sx={dialogContentDividerSx}>
          <Box data-style="dialogContentBoxSx" sx={dialogContentBoxSx}>
            <Box>
              <Typography variant="subtitle2" sx={searchSubtitleSx}>
                Search and Select Thumbnail Cover Art
              </Typography>
              <Box data-style="searchBoxSx" sx={searchBoxSx}>
                <TextField
                  fullWidth
                  placeholder="Search artwork..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={searchImageInputSx}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={searchButtonSx}
                >
                  {searchingImages ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box data-style="searchSpinnerContainerSx" sx={searchSpinnerContainerSx}>
                  <CircularProgress sx={removeThumbnailItemSx} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={2} sx={searchResultsGridSx}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          data-style="getSearchResultItemSx" sx={getSearchResultItemSx(isSelected, item.thumbnail)}
                        >
                          {isSelected && (
                            <Box data-style="selectedIconContainerSx" sx={selectedIconContainerSx}>
                              <CheckCircle sx={selectedIconSx} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box data-style="emptySearchBoxSx" sx={emptySearchBoxSx}>
                  <Typography variant="body2" sx={searchAdornmentSx}>
                    Search for images above to select a thumbnail
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={dialogActionsSx}>
          <Button onClick={() => setThumbnailDialogOpen(false)} sx={cancelButtonSx}>
            Cancel
          </Button>
          <Button
            onClick={handleThumbnailSubmit}
            variant="contained"
            disabled={!selectedThumbnail}
            sx={thumbnailSubmitButtonSx}
          >
            Save Thumbnail
          </Button>
        </DialogActions>
      </Dialog>
      {/* Convert Dialog */}
      <ConvertDialog
        open={Boolean(convertDialogItem) || batchConvertOpen}
        item={convertDialogItem}
        batchItems={batchConvertOpen ? convertibleItems : undefined}
        onClose={() => {
          setConvertDialogItem(null);
          setBatchConvertOpen(false);
        }}
        onStartConvert={handleStartConvert}
        onStartBatchConvert={handleStartBatchConvert}
      />

      {/* Conversion Progress Floating Portal */}
      <ConversionProgressPortal
        conversions={conversions}
        onCancel={(pathKey) => {
          api.cancelConversion(pathKey).catch(() => {});
        }}
        onDismiss={(pathKey) => {
          setConversions((prev) => {
            const next = { ...prev };
            delete next[pathKey];
            return next;
          });
        }}
      />

      {/* Notification Toast */}
      {toastMessage && (
        <Box sx={explorerToastSx}>
          {toastMessage}
        </Box>
      )}
    </Box>
  );
};
