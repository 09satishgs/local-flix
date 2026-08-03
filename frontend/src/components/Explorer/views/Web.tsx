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
} from '@mui/icons-material';
import type { ExplorerItem } from '../../../api';
import type { ExplorerViewProps } from './types';

export const WebExplorerView: React.FC<ExplorerViewProps> = ({
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
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number } | null>(null);

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
      return <Typography sx={{ color: 'var(--localflix-red)', fontWeight: 600 }}>Storage Roots</Typography>;
    }

    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator).filter(Boolean);

    return (
      <Breadcrumbs separator="/" sx={{ color: '#fff', mb: 3 }}>
        <Link
          component="button"
          onClick={() => loadDirectory('')}
          sx={{ color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#fff' } }}
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
              <Typography key={segmentPath} sx={{ color: 'var(--localflix-red)', fontWeight: 600 }}>
                {part}
              </Typography>
            );
          }

          if (!isAllowed) {
            return (
              <Typography
                key={segmentPath}
                sx={{ color: 'rgba(255, 255, 255, 0.25)', cursor: 'not-allowed', fontStyle: 'italic' }}
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
              sx={{ color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer', '&:hover': { color: '#fff' } }}
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
    <Box className="fade-in" sx={{ px: { xs: 3, md: 6 }, pb: 6 }}>
      {/* Explorer Top Toolbar */}
      <Box sx={{ display: 'flex', justifyItems: 'center', justifyContent: 'space-between', mb: 4, gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 1 }}>
            File Explorer
          </Typography>
          {renderBreadcrumbs()}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {currentPath && (
            <Button
              variant="outlined"
              startIcon={<ArrowUpward />}
              onClick={handleBackClick}
              disabled={!isUpAllowed}
              sx={{
                borderColor: '#333',
                color: '#fff',
                bgcolor: 'rgba(255,255,255,0.03)',
                '&:hover': { borderColor: '#555', bgcolor: 'rgba(255,255,255,0.08)' },
                '&.Mui-disabled': { borderColor: '#222', color: '#444', bgcolor: 'transparent' }
              }}
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
                  <Search sx={{ color: 'var(--text-secondary)' }} />
                </InputAdornment>
              ),
              sx: {
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
              }
            }}
          />
        </Box>
      </Box>

      {/* Directory Contents Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <LinearProgress sx={{ width: '50%', bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: 'var(--localflix-red)' } }} />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={3}>
          {filteredItems.map((item) => {
            const isDir = item.isDirectory;
            const hasProgress = item.progress && item.progress.position > 5;
            const progressPercent = hasProgress
              ? (item.progress!.position / item.progress!.duration) * 100
              : 0;

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.path}>
                <Card
                  className="movie-card"
                  onClick={() => isDir ? handleFolderClick(item.path) : onPlayVideo(item.path, item.progress?.position || 0)}
                  onContextMenu={(e) => handleOpenContextMenu(e, item)}
                  sx={{
                    bgcolor: 'var(--bg-card)',
                    border: '1px solid #222',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    cursor: 'pointer',
                  }}
                >
                  <Box
                    sx={{
                      height: 120,
                      bgcolor: isDir ? '#1b1b1b' : '#222222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      ...(item.thumbnail && {
                        backgroundImage: `url(${item.thumbnail})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }),
                    }}
                  >
                    {item.thumbnail ? (
                      !isDir && (
                        <Box
                          className="play-overlay"
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            p: 1,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            '.movie-card:hover &': { opacity: 1 },
                          }}
                        >
                          <PlayArrow sx={{ color: '#fff' }} />
                        </Box>
                      )
                    ) : isDir ? (
                      <Folder sx={{ fontSize: 56, color: 'rgba(255,255,255,0.7)' }} />
                    ) : (
                      <>
                        <Movie sx={{ fontSize: 50, color: 'var(--localflix-red)' }} />
                        <Box
                          className="play-overlay"
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            p: 1,
                            opacity: 0,
                            transition: 'opacity 0.2s',
                            display: 'flex',
                            '.movie-card:hover &': { opacity: 1 },
                          }}
                        >
                          <PlayArrow sx={{ color: '#fff' }} />
                        </Box>
                      </>
                    )}

                    {/* Bookmark Pin Button */}
                    {isDir && (
                      <IconButton
                        onClick={(e) => handlePinToggle(e, item)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          color: item.isPinned ? 'var(--localflix-red)' : 'rgba(255,255,255,0.7)',
                          bgcolor: 'rgba(0,0,0,0.4)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                        }}
                      >
                        {item.isPinned ? <Bookmark sx={{ fontSize: 18 }} /> : <BookmarkBorder sx={{ fontSize: 18 }} />}
                      </IconButton>
                    )}

                    {/* Folder Menu Button */}
                    {isDir && (
                      <IconButton
                        className="menu-button"
                        onClick={(e) => handleOpenMenu(e, item)}
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: 'rgba(255,255,255,0.7)',
                          bgcolor: 'rgba(0,0,0,0.4)',
                          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
                        }}
                      >
                        <MoreVert sx={{ fontSize: 18 }} />
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={{ p: 2, flexGrow: 1, pb: hasProgress ? 1 : 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        color: '#fff',
                        fontWeight: 600,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.2,
                        minHeight: '2.4em',
                      }}
                    >
                      {item.name}
                    </Typography>
                    {!isDir && (
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mt: 1 }}>
                        {formatSize(item.size)}
                      </Typography>
                    )}
                  </CardContent>

                  {!isDir && hasProgress && (
                    <Box sx={{ width: '100%', px: 2, pb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
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
                  )}
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
            p: 6,
            textAlign: 'center',
            color: 'var(--text-secondary)',
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
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
          sx: {
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
          }
        }}
      >
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
            sx={{ color: 'var(--localflix-red)' }}
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
          sx: {
            bgcolor: 'var(--bg-card)',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Pin Folder to Shortcuts
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#333' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Pin Name"
              value={pinTitle}
              onChange={(e) => setPinTitle(e.target.value)}
              variant="outlined"
              sx={{
                '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                '& .MuiInputBase-root': { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
              }}
            />

            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', mb: 1.5, fontWeight: 600 }}>
                Search and Select Thumbnail Cover Art (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search artwork..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#fff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={{
                    bgcolor: 'var(--localflix-red)',
                    color: '#fff',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
                    '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
                  }}
                >
                  {searchingImages ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'var(--localflix-red)' }} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 3 } }}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={{
                            height: 80,
                            borderRadius: 1,
                            border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' }}>
                              <CheckCircle sx={{ color: 'var(--localflix-red)', fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ border: '1px dashed #333', p: 4, textAlign: 'center', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Search for images above to select a thumbnail (Optional)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderColor: '#333' }}>
          <Button onClick={() => setPinDialogOpen(false)} sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handlePinSubmit}
            variant="contained"
            sx={{
              bgcolor: 'var(--localflix-red)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: 'var(--localflix-dark-red)' }
            }}
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
          sx: {
            bgcolor: 'var(--bg-card)',
            color: '#fff',
            border: '1px solid #333',
            borderRadius: 2,
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
          Set Folder Thumbnail
        </DialogTitle>
        <DialogContent dividers sx={{ borderColor: '#333' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ color: 'var(--text-secondary)', mb: 1.5, fontWeight: 600 }}>
                Search and Select Thumbnail Cover Art
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  placeholder="Search artwork..."
                  value={imageSearchQuery}
                  onChange={(e) => setImageSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearchImages()}
                  variant="outlined"
                  size="small"
                  sx={{
                    '& .MuiInputBase-root': { color: '#fff' },
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearchImages}
                  disabled={searchingImages}
                  sx={{
                    bgcolor: 'var(--localflix-red)',
                    color: '#fff',
                    fontWeight: 600,
                    px: 3,
                    '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
                    '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
                  }}
                >
                  {searchingImages ? <CircularProgress size={20} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress sx={{ color: 'var(--localflix-red)' }} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={2} sx={{ maxHeight: 300, overflowY: 'auto', pr: 1, '&::-webkit-scrollbar': { width: 6 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333', borderRadius: 3 } }}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={{
                            height: 80,
                            borderRadius: 1,
                            border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            cursor: 'pointer',
                            position: 'relative',
                            transition: 'all 0.2s',
                            '&:hover': { opacity: 0.8 },
                          }}
                        >
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' }}>
                              <CheckCircle sx={{ color: 'var(--localflix-red)', fontSize: 20 }} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ border: '1px dashed #333', p: 4, textAlign: 'center', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'var(--text-secondary)' }}>
                    Search for images above to select a thumbnail
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderColor: '#333' }}>
          <Button onClick={() => setThumbnailDialogOpen(false)} sx={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            onClick={handleThumbnailSubmit}
            variant="contained"
            disabled={!selectedThumbnail}
            sx={{
              bgcolor: 'var(--localflix-red)',
              color: '#fff',
              fontWeight: 600,
              px: 3,
              '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
              '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
            }}
          >
            Save Thumbnail
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
