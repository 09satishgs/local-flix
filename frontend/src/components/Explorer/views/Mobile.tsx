import React, { useState } from 'react';
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
} from '@mui/icons-material';
import type { ExplorerItem } from '../../../api';
import type { ExplorerViewProps } from './types';

const rootsBreadcrumbSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontWeight: 600, fontSize: '0.9rem' };
const breadcrumbsScrollContainerSx: SxProps<Theme> = { overflowX: 'auto', width: '100%', pb: 1, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333' } };
const breadcrumbsSx: SxProps<Theme> = { color: '#fff', fontSize: '0.85rem', flexWrap: 'nowrap', display: 'flex', whiteSpace: 'nowrap' };
const breadcrumbLinkSx: SxProps<Theme> = { color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer' };
const breadcrumbLastSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontWeight: 600, fontSize: '0.85rem' };
const breadcrumbNotAllowedSx: SxProps<Theme> = { color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.85rem', cursor: 'not-allowed', fontStyle: 'italic' };

const mobileExplorerContainerSx: SxProps<Theme> = { px: 2, pb: 4 };
const mobileSearchRowSx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 };
const mobileTitleRowSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 };
const mobileTitleSx: SxProps<Theme> = { color: '#fff', fontWeight: 700 };
const mobileBackNavGroupSx: SxProps<Theme> = { display: 'flex', gap: 1 };
const mobileBackButtonSx: SxProps<Theme> = {
  color: '#fff',
  border: '1px solid #333',
  borderRadius: 2,
  bgcolor: 'rgba(255,255,255,0.03)',
  '&.Mui-disabled': { color: '#444', borderColor: '#222' }
};

const mobileSearchIconSx: SxProps<Theme> = { color: 'var(--text-secondary)', fontSize: 20 };
const mobileSearchInputSx: SxProps<Theme> = {
  color: '#fff',
  bgcolor: 'var(--bg-card)',
  borderColor: '#333',
  borderRadius: 2,
  '& .MuiOutlinedInput-notchedOutline': {
    borderColor: '#333',
  },
};

const mobileLoadingContainerSx: SxProps<Theme> = { display: 'flex', justifyContent: 'center', py: 6 };
const mobileLoadingProgressSx: SxProps<Theme> = { width: '80%', bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: 'var(--localflix-red)' } };

const mobileCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  position: 'relative',
};

const mobileCardImageBaseSx: SxProps<Theme> = {
  height: 100,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
};

const mobileCardPlayOverlaySx: SxProps<Theme> = {
  position: 'absolute',
  bgcolor: 'rgba(0,0,0,0.6)',
  borderRadius: 1,
  p: 0.5,
  display: 'flex',
  gap: 0.5,
  zIndex: 5,
};
const mobilePlayBtnSx: SxProps<Theme> = {
  bgcolor: 'rgba(229, 9, 20, 0.9)',
  color: '#fff',
  p: 0.5,
};
const mobileReplayBtnSx: SxProps<Theme> = {
  bgcolor: 'rgba(0,0,0,0.6)',
  color: '#fff',
  p: 0.5,
};
const mobileCardPlayIconSx: SxProps<Theme> = { color: '#fff', fontSize: 18 };
const mobileFolderIconSx: SxProps<Theme> = { fontSize: 44, color: 'rgba(255,255,255,0.7)' };
const mobileMovieIconSx: SxProps<Theme> = { fontSize: 36, color: 'var(--localflix-red)' };

const mobileCardPinButtonSx: SxProps<Theme> = {
  position: 'absolute',
  top: 4,
  left: 4,
  bgcolor: 'rgba(0,0,0,0.4)',
};
const mobilePinIconSx: SxProps<Theme> = { fontSize: 16 };

const mobileCardMenuButtonSx: SxProps<Theme> = {
  position: 'absolute',
  top: 4,
  right: 4,
  color: 'rgba(255,255,255,0.7)',
  bgcolor: 'rgba(0,0,0,0.4)',
};
const mobileMenuIconSx: SxProps<Theme> = { fontSize: 16 };

const mobileCardContentSx: SxProps<Theme> = { p: 1.5, flexGrow: 1 };

const mobileCardTitleSx: SxProps<Theme> = {
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

const mobileCardSizeSx: SxProps<Theme> = { color: 'var(--text-secondary)', display: 'block', mt: 0.5 };

const mobileCardProgressContainerSx: SxProps<Theme> = { width: '100%', px: 1.5, pb: 1.5 };
const mobileCardProgressBarSx: SxProps<Theme> = {
  bgcolor: '#333',
  height: 3,
  borderRadius: 1,
  '& .MuiLinearProgress-bar': {
    bgcolor: 'var(--localflix-red)',
  },
};

const mobileEmptyFolderSx: SxProps<Theme> = { border: '1px dashed #333', borderRadius: 2, p: 4, textAlign: 'center', color: 'var(--text-secondary)' };
const mobileEmptyFolderTitleSx: SxProps<Theme> = { mb: 0.5 };

const mobileMenuPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  color: '#fff',
  border: '1px solid #333',
  minWidth: 180,
  '& .MuiMenuItem-root': {
    fontSize: '0.9rem',
    py: 1.2,
    '&:hover': {
      bgcolor: 'rgba(255,255,255,0.05)',
    }
  }
};

const mobileRemoveThumbnailItemSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const mobileDialogPaperSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-dark)',
  color: '#fff',
  p: 2
};
const mobileDialogTitleSx: SxProps<Theme> = { fontWeight: 700, px: 2, pt: 2, pb: 1 };
const mobileDialogContentSx: SxProps<Theme> = { px: 2, py: 1 };
const mobileDialogBodySx: SxProps<Theme> = { display: 'flex', flexDirection: 'column', gap: 3, mt: 1 };

const mobileDialogInputSx: SxProps<Theme> = {
  '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
  '& .MuiInputBase-root': { color: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
};

const mobileDialogSubtitleSx: SxProps<Theme> = { color: 'var(--text-secondary)', mb: 1, fontWeight: 600 };
const mobileDialogSearchRowSx: SxProps<Theme> = { display: 'flex', gap: 1.5, mb: 2 };
const mobileDialogSearchInputSx: SxProps<Theme> = {
  '& .MuiInputBase-root': { color: '#fff' },
  '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
};
const mobileDialogSearchButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
  '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
};

const mobileDialogSearchLoadingSx: SxProps<Theme> = { display: 'flex', justifyContent: 'center', py: 4 };
const mobileDialogSearchSpinnerSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const mobileDialogSearchResultsGridSx: SxProps<Theme> = { maxHeight: 280, overflowY: 'auto', pr: 0.5 };
const mobileDialogSearchItemBaseSx: SxProps<Theme> = {
  height: 70,
  borderRadius: 1,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  position: 'relative',
  transition: 'all 0.2s',
};
const mobileDialogSearchItemSelectedIconContainerSx: SxProps<Theme> = { position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' };
const mobileDialogSearchItemSelectedIconSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontSize: 18 };

const mobileDialogSearchEmptySx: SxProps<Theme> = { border: '1px dashed #333', p: 3, textAlign: 'center', borderRadius: 1 };
const mobileDialogSearchEmptyTextSx: SxProps<Theme> = { color: 'var(--text-secondary)' };

const mobileDialogActionsSx: SxProps<Theme> = { p: 2 };
const mobileDialogCancelButtonSx: SxProps<Theme> = { color: 'var(--text-secondary)', fontWeight: 600 };
const mobileDialogSubmitButtonSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  px: 3,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' }
};
const mobileDialogSubmitButtonDisabledSx: SxProps<Theme> = {
  bgcolor: 'var(--localflix-red)',
  color: '#fff',
  fontWeight: 600,
  px: 3,
  '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
  '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
};

const getMobileCardImageSx = (isDir: boolean, thumbnail: string | null | undefined): SxProps<Theme> => ({
  ...(mobileCardImageBaseSx as object),
  bgcolor: isDir ? '#1b1b1b' : '#222222',
  ...(thumbnail && { backgroundImage: `url(${thumbnail})` }),
});

const mobilePinActiveButtonSx: SxProps<Theme> = { ...(mobileCardPinButtonSx as object), color: 'var(--localflix-red)' };
const mobilePinInactiveButtonSx: SxProps<Theme> = { ...(mobileCardPinButtonSx as object), color: 'rgba(255,255,255,0.7)' };

const mobileCardContentWithProgressSx: SxProps<Theme> = { ...(mobileCardContentSx as object), pb: 1, '&:last-child': { pb: 1 } };
const mobileCardContentNoProgressSx: SxProps<Theme> = { ...(mobileCardContentSx as object), pb: 1.5, '&:last-child': { pb: 1.5 } };

const getMobileSearchResultItemSx = (isSelected: boolean, thumbnail: string | null | undefined): SxProps<Theme> => ({
  ...(mobileDialogSearchItemBaseSx as object),
  border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
  backgroundImage: `url(${thumbnail})`,
});

export const MobileExplorerView: React.FC<ExplorerViewProps> = ({
  currentPath,
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

  const handleOpenMenu = (event: React.MouseEvent, item: ExplorerItem) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget as HTMLElement);
    setMenuItem(item);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuItem(null);
  };

  // Helper to construct breadcrumbs with horizontal scrolling
  const renderBreadcrumbs = () => {
    if (!currentPath) {
      return <Typography sx={rootsBreadcrumbSx}>Storage Roots</Typography>;
    }

    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator).filter(Boolean);

    return (
      <Box data-style="breadcrumbsScrollContainerSx" sx={breadcrumbsScrollContainerSx}>
        <Breadcrumbs separator="/" sx={breadcrumbsSx}>
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
                <Typography key={segmentPath} sx={breadcrumbLastSx}>
                  {part}
                </Typography>
              );
            }

            if (!isAllowed) {
              return (
                <Typography
                  key={segmentPath}
                  sx={breadcrumbNotAllowedSx}
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
      </Box>
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
    <Box className="fade-in" data-style="mobileExplorerContainerSx" sx={mobileExplorerContainerSx}>
      {/* Search and Navigation Row */}
      <Box data-style="mobileSearchRowSx" sx={mobileSearchRowSx}>
        <Box data-style="mobileTitleRowSx" sx={mobileTitleRowSx}>
          <Typography variant="h5" sx={mobileTitleSx}>
            Explorer
          </Typography>
          <Box data-style="mobileBackNavGroupSx" sx={mobileBackNavGroupSx}>
            {currentPath && (
              <IconButton
                data-style="mobileBackButtonSx"
                onClick={handleBackClick}
                disabled={!isUpAllowed}
                sx={mobileBackButtonSx}
              >
                <ArrowUpward fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>

        {renderBreadcrumbs()}

        <TextField
          placeholder="Search items..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={mobileSearchIconSx} />
              </InputAdornment>
            ),
            sx: mobileSearchInputSx
          }}
        />
      </Box>

      {/* Directory Contents Grid - 2 columns on mobile */}
      {loading ? (
        <Box data-style="mobileLoadingContainerSx" sx={mobileLoadingContainerSx}>
          <LinearProgress sx={mobileLoadingProgressSx} />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={2}>
          {filteredItems.map((item) => {
            const isDir = item.isDirectory;
            const hasProgress = item.progress && item.progress.position > 5;
            const progressPercent = hasProgress
              ? (item.progress!.position / item.progress!.duration) * 100
              : 0;

            return (
              <Grid item xs={6} key={item.path}>
                <Card
                  onClick={() => isDir ? handleFolderClick(item.path) : onPlayVideo(item.path, item.progress?.position || 0)}
                  sx={mobileCardSx}
                >
                  <Box
                    data-style="getMobileCardImageSx"
                    sx={getMobileCardImageSx(isDir, item.thumbnail)}
                  >
                    {item.thumbnail ? (
                      !isDir && (
                        <Box
                          data-style="mobileCardPlayOverlaySx"
                          sx={mobileCardPlayOverlaySx}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, item.progress?.position || 0);
                            }}
                            sx={mobilePlayBtnSx}
                            title={hasProgress ? "Resume Video" : "Play Video"}
                          >
                            <PlayArrow sx={mobileCardPlayIconSx} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, 0);
                            }}
                            sx={mobileReplayBtnSx}
                            title="Restart from Beginning"
                          >
                            <Replay sx={mobileCardPlayIconSx} />
                          </IconButton>
                        </Box>
                      )
                    ) : isDir ? (
                      <Folder sx={mobileFolderIconSx} />
                    ) : (
                      <>
                        <Movie sx={mobileMovieIconSx} />
                        <Box
                          data-style="mobileCardPlayOverlaySx"
                          sx={mobileCardPlayOverlaySx}
                        >
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, item.progress?.position || 0);
                            }}
                            sx={mobilePlayBtnSx}
                            title={hasProgress ? "Resume Video" : "Play Video"}
                          >
                            <PlayArrow sx={mobileCardPlayIconSx} />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              onPlayVideo(item.path, 0);
                            }}
                            sx={mobileReplayBtnSx}
                            title="Restart from Beginning"
                          >
                            <Replay sx={mobileCardPlayIconSx} />
                          </IconButton>
                        </Box>
                      </>
                    )}

                    {/* Bookmark Pin Button */}
                    {isDir && (
                      <IconButton
                        data-style={item.isPinned ? "mobilePinActiveButtonSx" : "mobilePinInactiveButtonSx"}
                        onClick={(e) => handlePinToggle(e, item)}
                        size="small"
                        sx={item.isPinned ? mobilePinActiveButtonSx : mobilePinInactiveButtonSx}
                      >
                        {item.isPinned ? <Bookmark sx={mobilePinIconSx} /> : <BookmarkBorder sx={mobilePinIconSx} />}
                      </IconButton>
                    )}

                    {/* Folder Menu Button */}
                    {isDir && (
                      <IconButton
                        data-style="mobileCardMenuButtonSx"
                        onClick={(e) => handleOpenMenu(e, item)}
                        size="small"
                        sx={mobileCardMenuButtonSx}
                      >
                        <MoreVert sx={mobileMenuIconSx} />
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={hasProgress ? mobileCardContentWithProgressSx : mobileCardContentNoProgressSx}>
                    <Typography
                      variant="body2"
                      sx={mobileCardTitleSx}
                    >
                      {item.name}
                    </Typography>
                    {!isDir && (
                      <Typography variant="caption" sx={mobileCardSizeSx}>
                        {formatSize(item.size)}
                      </Typography>
                    )}
                  </CardContent>

                  {!isDir && hasProgress && (
                    <Box data-style="mobileCardProgressContainerSx" sx={mobileCardProgressContainerSx}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
                        sx={mobileCardProgressBarSx}
                      />
                    </Box>
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box data-style="mobileEmptyFolderSx" sx={mobileEmptyFolderSx}>
          <Typography variant="body2" sx={mobileEmptyFolderTitleSx}>
            Empty Folder
          </Typography>
          <Typography variant="caption">
            No video files found.
          </Typography>
        </Box>
      )}

      {/* Pin Customization fullscreen dialog on Mobile */}
      {/* Folder Action/Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: mobileMenuPaperSx
        }}
      >
        {!menuItem?.isDirectory && (
          <MenuItem
            onClick={() => {
              if (menuItem) onPlayVideo(menuItem.path, 0);
              handleCloseMenu();
            }}
          >
            <Replay fontSize="small" sx={{ mr: 1, color: 'var(--text-secondary)' }} /> Restart from Beginning
          </MenuItem>
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
            sx={mobileRemoveThumbnailItemSx}
          >
            Remove Thumbnail
          </MenuItem>
        )}
      </Menu>

      {/* Pin Title Customization Dialog */}
      <Dialog
        fullScreen
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        PaperProps={{
          sx: mobileDialogPaperSx
        }}
      >
        <DialogTitle sx={mobileDialogTitleSx}>
          Pin Folder to Shortcuts
        </DialogTitle>
        <DialogContent sx={mobileDialogContentSx}>
          <Box data-style="mobileDialogBodySx" sx={mobileDialogBodySx}>
            <TextField
              fullWidth
              label="Pin Name"
              value={pinTitle}
              onChange={(e) => setPinTitle(e.target.value)}
              variant="outlined"
              size="small"
              sx={mobileDialogInputSx}
            />

            <Box>
              <Typography variant="body2" sx={mobileDialogSubtitleSx}>
                Select Thumbnail Cover Art (Optional)
              </Typography>
              <Box data-style="mobileDialogSearchRowSx" sx={mobileDialogSearchRowSx}>
                <TextField
                  fullWidth
                  placeholder="Search artwork..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={mobileDialogSearchInputSx}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={mobileDialogSearchButtonSx}
                >
                  {searchingImages ? <CircularProgress size={16} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box data-style="mobileDialogSearchLoadingSx" sx={mobileDialogSearchLoadingSx}>
                  <CircularProgress size={30} sx={mobileDialogSearchSpinnerSx} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={1} sx={mobileDialogSearchResultsGridSx}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} key={idx}>
                        <Box
                          data-style="getMobileSearchResultItemSx"
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={getMobileSearchResultItemSx(isSelected, item.thumbnail)}
                        >
                          {isSelected && (
                            <Box data-style="mobileDialogSearchItemSelectedIconContainerSx" sx={mobileDialogSearchItemSelectedIconContainerSx}>
                              <CheckCircle sx={mobileDialogSearchItemSelectedIconSx} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box data-style="mobileDialogSearchEmptySx" sx={mobileDialogSearchEmptySx}>
                  <Typography variant="caption" sx={mobileDialogSearchEmptyTextSx}>
                    Search images above to set thumbnail (Optional)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={mobileDialogActionsSx}>
          <Button onClick={() => setPinDialogOpen(false)} sx={mobileDialogCancelButtonSx}>
            Cancel
          </Button>
          <Button
            onClick={handlePinSubmit}
            variant="contained"
            sx={mobileDialogSubmitButtonSx}
          >
            Pin
          </Button>
        </DialogActions>
      </Dialog>

      {/* Thumbnail Selection Dialog */}
      <Dialog
        fullScreen
        open={thumbnailDialogOpen}
        onClose={() => setThumbnailDialogOpen(false)}
        PaperProps={{
          sx: mobileDialogPaperSx
        }}
      >
        <DialogTitle sx={mobileDialogTitleSx}>
          Set Folder Thumbnail
        </DialogTitle>
        <DialogContent sx={mobileDialogContentSx}>
          <Box data-style="mobileDialogBodySx" sx={mobileDialogBodySx}>
            <Box>
              <Typography variant="body2" sx={mobileDialogSubtitleSx}>
                Select Thumbnail Cover Art
              </Typography>
              <Box data-style="mobileDialogSearchRowSx" sx={mobileDialogSearchRowSx}>
                <TextField
                  fullWidth
                  placeholder="Search Images..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={mobileDialogSearchInputSx}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={mobileDialogSearchButtonSx}
                >
                  {searchingImages ? <CircularProgress size={16} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box data-style="mobileDialogSearchLoadingSx" sx={mobileDialogSearchLoadingSx}>
                  <CircularProgress size={30} sx={mobileDialogSearchSpinnerSx} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={1} sx={mobileDialogSearchResultsGridSx}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} key={idx}>
                        <Box
                          data-style="getMobileSearchResultItemSx"
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={getMobileSearchResultItemSx(isSelected, item.thumbnail)}
                        >
                          {isSelected && (
                            <Box data-style="mobileDialogSearchItemSelectedIconContainerSx" sx={mobileDialogSearchItemSelectedIconContainerSx}>
                              <CheckCircle sx={mobileDialogSearchItemSelectedIconSx} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box data-style="mobileDialogSearchEmptySx" sx={mobileDialogSearchEmptySx}>
                  <Typography variant="caption" sx={mobileDialogSearchEmptyTextSx}>
                    Search images above to set thumbnail
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={mobileDialogActionsSx}>
          <Button onClick={() => setThumbnailDialogOpen(false)} sx={mobileDialogCancelButtonSx}>
            Cancel
          </Button>
          <Button
            onClick={handleThumbnailSubmit}
            variant="contained"
            disabled={!selectedThumbnail}
            sx={mobileDialogSubmitButtonDisabledSx}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
