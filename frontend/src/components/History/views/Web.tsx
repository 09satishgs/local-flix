import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  Menu,
  MenuItem,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  PlayArrow,
  History as HistoryIcon,
  AccessTime,
  Movie,
  Delete,
  Replay,
  Tv,
  PlayCircleOutline,
} from "@mui/icons-material";
import type { HistoryViewProps } from "./types";

// --- Extracted sx style constants ---

const historyContainerSx: SxProps<Theme> = { px: { xs: 3, md: 6 }, pb: 6 };

const historyHeadingTypographySx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 700,
  mb: 4,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

const historyIconSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  fontSize: 36,
};

const historyCardSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  border: "1px solid #222",
  borderRadius: 2,
};

const actionButtonsContainerSx: SxProps<Theme> = { display: "flex", gap: 1 };

const deleteButtonSx: SxProps<Theme> = {
  bgcolor: "rgba(255,255,255,0.05)",
  color: "rgba(255,255,255,0.6)",
  "&:hover": {
    bgcolor: "var(--localflix-red)",
    color: "#fff",
  },
};

const restartButtonSx: SxProps<Theme> = {
  bgcolor: "rgba(255,255,255,0.05)",
  color: "#fff",
  "&:hover": {
    bgcolor: "var(--localflix-red)",
    color: "#fff",
  },
};

const playButtonSx: SxProps<Theme> = {
  bgcolor: "rgba(255,255,255,0.05)",
  color: "#fff",
  "&:hover": {
    bgcolor: "var(--localflix-red)",
    color: "#fff",
  },
};

const listItemSx: SxProps<Theme> = {
  px: 3,
  py: 2.5,
  "&:hover": {
    bgcolor: "rgba(255, 255, 255, 0.02)",
  },
};

const listItemAvatarSx: SxProps<Theme> = { mr: 2 };

const thumbnailAvatarSx: SxProps<Theme> = {
  width: 80,
  height: 50,
  bgcolor: "#222",
  border: "1px solid #333",
};

const movieIconSx: SxProps<Theme> = { color: "var(--localflix-red)" };

const itemNameTypographySx: SxProps<Theme> = { color: "#fff", fontWeight: 600 };

const secondaryContainerSx: SxProps<Theme> = { mt: 0.5 };

const pathTypographySx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  display: "block",
  mb: 0.5,
};

const metaRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
  color: "var(--text-secondary)",
};

const timeInfoSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 0.5,
};

const accessTimeIconSx: SxProps<Theme> = { fontSize: 14 };

const historyDividerSx: SxProps<Theme> = { borderColor: "#222" };

const emptyStateSx: SxProps<Theme> = {
  border: "2px dashed #333",
  borderRadius: 2,
  p: 6,
  textAlign: "center",
  color: "var(--text-secondary)",
};

const emptyHeadingTypographySx: SxProps<Theme> = { mb: 1 };

// --- Component ---

export const WebHistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  formatDate,
  onPlayVideo,
  handleDeleteHistoryItem,
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
    <Box
      className="fade-in"
      sx={historyContainerSx}
      data-style="historyContainerSx"
    >
      <Typography variant="h4" sx={historyHeadingTypographySx}>
        <HistoryIcon sx={historyIconSx} /> Watch History
      </Typography>

      {historyList.length > 0 ? (
        <Card sx={historyCardSx}>
          <List disablePadding>
            {historyList.map((item, index) => {
              const isLast = index === historyList.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    alignItems="flex-start"
                    tabIndex={0}
                    role="button"
                    aria-label={`Play ${item.name}`}
                    onClick={() => onPlayVideo(item.path, item.position)}
                    onContextMenu={(e) => handleOpenContextMenu(e, item)}
                    secondaryAction={
                      <Box
                        sx={actionButtonsContainerSx}
                        data-style="actionButtonsContainerSx"
                      >
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteHistoryItem(item.id);
                          }}
                          sx={deleteButtonSx}
                          data-style="deleteButtonSx"
                          title="Delete Record"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayVideo(item.path, 0);
                          }}
                          sx={restartButtonSx}
                          data-style="restartButtonSx"
                          title="Restart from Beginning"
                        >
                          <Replay />
                        </IconButton>
                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            onPlayVideo(item.path, item.position);
                          }}
                          sx={playButtonSx}
                          data-style="playButtonSx"
                          title="Resume Video"
                        >
                          <PlayArrow />
                        </IconButton>
                      </Box>
                    }
                    sx={listItemSx}
                  >
                    <ListItemAvatar sx={listItemAvatarSx}>
                      <Avatar
                        variant="rounded"
                        src={item.thumbnail}
                        sx={thumbnailAvatarSx}
                      >
                        <Movie sx={movieIconSx} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography
                          variant="subtitle1"
                          sx={itemNameTypographySx}
                        >
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box
                          sx={secondaryContainerSx}
                          data-style="secondaryContainerSx"
                        >
                          <Typography variant="caption" sx={pathTypographySx}>
                            Path: {item.path}
                          </Typography>
                          <Box sx={metaRowSx} data-style="metaRowSx">
                            <Box sx={timeInfoSx} data-style="timeInfoSx">
                              <AccessTime sx={accessTimeIconSx} />
                              <Typography variant="caption">
                                Stopped at {Math.floor(item.position / 60)}m
                              </Typography>
                            </Box>
                            <Typography variant="caption">
                              Watched on {formatDate(item.watchedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {!isLast && <Divider sx={historyDividerSx} />}
                </React.Fragment>
              );
            })}
          </List>
        </Card>
      ) : (
        <Box sx={emptyStateSx} data-style="emptyStateSx">
          <Typography variant="h6" sx={emptyHeadingTypographySx}>
            No history yet
          </Typography>
          <Typography variant="body2">
            Videos you watch will appear here so you can trace your activities.
          </Typography>
        </Box>
      )}

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
