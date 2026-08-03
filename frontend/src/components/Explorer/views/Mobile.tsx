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
      return <Typography sx={{ color: 'var(--localflix-red)', fontWeight: 600, fontSize: '0.9rem' }}>Storage Roots</Typography>;
    }

    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator).filter(Boolean);

    return (
      <Box sx={{ overflowX: 'auto', width: '100%', pb: 1, '&::-webkit-scrollbar': { height: 4 }, '&::-webkit-scrollbar-thumb': { bgcolor: '#333' } }}>
        <Breadcrumbs separator="/" sx={{ color: '#fff', fontSize: '0.85rem', flexWrap: 'nowrap', display: 'flex', whiteSpace: 'nowrap' }}>
          <Link
            component="button"
            onClick={() => loadDirectory('')}
            sx={{ color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer' }}
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
                <Typography key={segmentPath} sx={{ color: 'var(--localflix-red)', fontWeight: 600, fontSize: '0.85rem' }}>
                  {part}
                </Typography>
              );
            }

            if (!isAllowed) {
              return (
                <Typography
                  key={segmentPath}
                  sx={{ color: 'rgba(255, 255, 255, 0.25)', fontSize: '0.85rem', cursor: 'not-allowed', fontStyle: 'italic' }}
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
                sx={{ color: 'var(--text-secondary)', textDecoration: 'none', cursor: 'pointer' }}
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
    <Box className="fade-in" sx={{ px: 2, pb: 4 }}>
      {/* Search and Navigation Row */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700 }}>
            Explorer
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {currentPath && (
              <IconButton
                onClick={handleBackClick}
                disabled={!isUpAllowed}
                sx={{
                  color: '#fff',
                  border: '1px solid #333',
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.03)',
                  '&.Mui-disabled': { color: '#444', borderColor: '#222' }
                }}
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
                <Search sx={{ color: 'var(--text-secondary)', fontSize: 20 }} />
              </InputAdornment>
            ),
            sx: {
              color: '#fff',
              bgcolor: 'var(--bg-card)',
              borderColor: '#333',
              borderRadius: 2,
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#333',
              },
            }
          }}
        />
      </Box>

      {/* Directory Contents Grid - 2 columns on mobile */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <LinearProgress sx={{ width: '80%', bgcolor: '#333', '& .MuiLinearProgress-bar': { bgcolor: 'var(--localflix-red)' } }} />
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
                  sx={{
                    bgcolor: 'var(--bg-card)',
                    border: '1px solid #222',
                    borderRadius: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  <Box
                    sx={{
                      height: 100,
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
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            p: 0.5,
                            display: 'flex',
                          }}
                        >
                          <PlayArrow sx={{ color: '#fff', fontSize: 18 }} />
                        </Box>
                      )
                    ) : isDir ? (
                      <Folder sx={{ fontSize: 44, color: 'rgba(255,255,255,0.7)' }} />
                    ) : (
                      <>
                        <Movie sx={{ fontSize: 36, color: 'var(--localflix-red)' }} />
                        <Box
                          sx={{
                            position: 'absolute',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            borderRadius: '50%',
                            p: 0.5,
                            display: 'flex',
                          }}
                        >
                          <PlayArrow sx={{ color: '#fff', fontSize: 18 }} />
                        </Box>
                      </>
                    )}

                    {/* Bookmark Pin Button */}
                    {isDir && (
                      <IconButton
                        onClick={(e) => handlePinToggle(e, item)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          left: 4,
                          color: item.isPinned ? 'var(--localflix-red)' : 'rgba(255,255,255,0.7)',
                          bgcolor: 'rgba(0,0,0,0.4)',
                        }}
                      >
                        {item.isPinned ? <Bookmark sx={{ fontSize: 16 }} /> : <BookmarkBorder sx={{ fontSize: 16 }} />}
                      </IconButton>
                    )}

                    {/* Folder Menu Button */}
                    {isDir && (
                      <IconButton
                        onClick={(e) => handleOpenMenu(e, item)}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          color: 'rgba(255,255,255,0.7)',
                          bgcolor: 'rgba(0,0,0,0.4)',
                        }}
                      >
                        <MoreVert sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Box>
                  <CardContent sx={{ p: 1.5, flexGrow: 1, pb: hasProgress ? 1 : 1.5, '&:last-child': { pb: hasProgress ? 1 : 1.5 } }}>
                    <Typography
                      variant="body2"
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
                      <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mt: 0.5 }}>
                        {formatSize(item.size)}
                      </Typography>
                    )}
                  </CardContent>

                  {!isDir && hasProgress && (
                    <Box sx={{ width: '100%', px: 1.5, pb: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={progressPercent}
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
                  )}
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box sx={{ border: '1px dashed #333', borderRadius: 2, p: 4, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
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
          sx: {
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
        fullScreen
        open={pinDialogOpen}
        onClose={() => setPinDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: 'var(--bg-dark)',
            color: '#fff',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, px: 2, pt: 2, pb: 1 }}>
          Pin Folder to Shortcuts
        </DialogTitle>
        <DialogContent sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Pin Name"
              value={pinTitle}
              onChange={(e) => setPinTitle(e.target.value)}
              variant="outlined"
              size="small"
              sx={{
                '& .MuiInputLabel-root': { color: 'var(--text-secondary)' },
                '& .MuiInputBase-root': { color: '#fff' },
                '& .MuiOutlinedInput-notchedOutline': { borderColor: '#333' },
                '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#555' },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' }
              }}
            />

            <Box>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1, fontWeight: 600 }}>
                Select Thumbnail Cover Art (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
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
                    '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
                    '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
                  }}
                >
                  {searchingImages ? <CircularProgress size={16} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: 'var(--localflix-red)' }} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={1} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={{
                            height: 70,
                            borderRadius: 1,
                            border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' }}>
                              <CheckCircle sx={{ color: 'var(--localflix-red)', fontSize: 18 }} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ border: '1px dashed #333', p: 3, textAlign: 'center', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    Search images above to set thumbnail (Optional)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
          sx: {
            bgcolor: 'var(--bg-dark)',
            color: '#fff',
            p: 2
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, px: 2, pt: 2, pb: 1 }}>
          Set Folder Thumbnail
        </DialogTitle>
        <DialogContent sx={{ px: 2, py: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box>
              <Typography variant="body2" sx={{ color: 'var(--text-secondary)', mb: 1, fontWeight: 600 }}>
                Select Thumbnail Cover Art
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Search Images..."
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
                    '&:hover': { bgcolor: 'var(--localflix-dark-red)' },
                    '&.Mui-disabled': { bgcolor: '#444', color: '#888' }
                  }}
                >
                  {searchingImages ? <CircularProgress size={16} color="inherit" /> : 'Search'}
                </Button>
              </Box>

              {searchingImages && searchResults.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={30} sx={{ color: 'var(--localflix-red)' }} />
                </Box>
              ) : searchResults.length > 0 ? (
                <Grid container spacing={1} sx={{ maxHeight: 280, overflowY: 'auto', pr: 0.5 }}>
                  {searchResults.map((item, idx) => {
                    const isSelected = selectedThumbnail === item.thumbnail;
                    return (
                      <Grid item xs={6} key={idx}>
                        <Box
                          onClick={() => setSelectedThumbnail(isSelected ? null : item.thumbnail)}
                          sx={{
                            height: 70,
                            borderRadius: 1,
                            border: isSelected ? '3px solid var(--localflix-red)' : '1px solid #333',
                            backgroundImage: `url(${item.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            position: 'relative',
                            transition: 'all 0.2s',
                          }}
                        >
                          {isSelected && (
                            <Box sx={{ position: 'absolute', top: 4, right: 4, bgcolor: 'var(--bg-dark)', borderRadius: '50%', display: 'flex' }}>
                              <CheckCircle sx={{ color: 'var(--localflix-red)', fontSize: 18 }} />
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ) : (
                <Box sx={{ border: '1px dashed #333', p: 3, textAlign: 'center', borderRadius: 1 }}>
                  <Typography variant="caption" sx={{ color: 'var(--text-secondary)' }}>
                    Search images above to set thumbnail
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
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
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
