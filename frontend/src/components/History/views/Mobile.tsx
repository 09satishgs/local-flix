import React from 'react';
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
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import { PlayArrow, History as HistoryIcon, AccessTime, Movie, Delete, Replay } from '@mui/icons-material';
import type { HistoryViewProps } from './types';

// --- Extracted sx style constants ---

const mobileHistoryContainerSx: SxProps<Theme> = { px: 2, pb: 4 };

const mobileHistoryTitleSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 700,
  mb: 3,
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

const mobileHistoryTitleIconSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  fontSize: 28,
};

const mobileHistoryCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
};

const mobileHistoryActionsContainerSx: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
};

const mobileHistoryDeleteBtnSx: SxProps<Theme> = {
  color: 'rgba(255,255,255,0.4)',
  '&:active': {
    color: 'var(--localflix-red)',
  },
};

const mobileHistoryRestartBtnSx: SxProps<Theme> = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: '#fff',
  '&:active': {
    bgcolor: 'var(--localflix-red)',
  },
};

const mobileHistoryPlayBtnSx: SxProps<Theme> = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: '#fff',
  '&:active': {
    bgcolor: 'var(--localflix-red)',
  },
};

const mobileHistoryListItemSx: SxProps<Theme> = {
  px: 1.5,
  py: 2,
};

const mobileHistoryListItemAvatarSx: SxProps<Theme> = { mr: 1.5 };

const mobileHistoryThumbnailSx: SxProps<Theme> = {
  width: 64,
  height: 40,
  bgcolor: '#222',
  border: '1px solid #333',
};

const mobileHistoryMovieIconSx: SxProps<Theme> = {
  color: 'var(--localflix-red)',
  fontSize: 20,
};

const mobileHistoryItemNameSx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 600,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  maxWidth: 'calc(100vw - 160px)',
};

const mobileHistorySecondaryWrapperSx: SxProps<Theme> = { mt: 0.25 };

const mobileHistorySecondaryColumnSx: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  color: 'var(--text-secondary)',
};

const mobileHistoryTimeRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
  mb: 0.25,
};

const mobileHistoryAccessTimeIconSx: SxProps<Theme> = { fontSize: 12 };

const mobileHistoryDateCaptionSx: SxProps<Theme> = { fontSize: '0.7rem' };

const mobileHistoryDividerSx: SxProps<Theme> = { borderColor: '#222' };

const mobileHistoryEmptyStateSx: SxProps<Theme> = {
  border: '1px dashed #333',
  borderRadius: 2,
  p: 4,
  textAlign: 'center',
  color: 'var(--text-secondary)',
};

const mobileHistoryEmptyTitleSx: SxProps<Theme> = { mb: 0.5 };

// --- Component ---

export const MobileHistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  formatDate,
  onPlayVideo,
  handleDeleteHistoryItem,
}) => {
  return (
    <Box className="fade-in" data-style="mobileHistoryContainerSx" sx={mobileHistoryContainerSx}>
      <Typography variant="h5" sx={mobileHistoryTitleSx}>
        <HistoryIcon sx={mobileHistoryTitleIconSx} /> Watch History
      </Typography>

      {historyList.length > 0 ? (
        <Card sx={mobileHistoryCardSx}>
          <List disablePadding>
            {historyList.map((item, index) => {
              const isLast = index === historyList.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    alignItems="center"
                    secondaryAction={
                      <Box data-style="mobileHistoryActionsContainerSx" sx={mobileHistoryActionsContainerSx}>
                        <IconButton
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          size="small"
                          data-style="mobileHistoryDeleteBtnSx"
                          sx={mobileHistoryDeleteBtnSx}
                          title="Delete Record"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => onPlayVideo(item.path, 0)}
                          size="small"
                          data-style="mobileHistoryRestartBtnSx"
                          sx={mobileHistoryRestartBtnSx}
                          title="Restart from Beginning"
                        >
                          <Replay fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => onPlayVideo(item.path, item.position)}
                          size="small"
                          data-style="mobileHistoryPlayBtnSx"
                          sx={mobileHistoryPlayBtnSx}
                          title="Resume Video"
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={mobileHistoryListItemSx}
                  >
                    <ListItemAvatar sx={mobileHistoryListItemAvatarSx}>
                      <Avatar
                        variant="rounded"
                        src={item.thumbnail}
                        sx={mobileHistoryThumbnailSx}
                      >
                        <Movie sx={mobileHistoryMovieIconSx} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={mobileHistoryItemNameSx}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box data-style="mobileHistorySecondaryWrapperSx" sx={mobileHistorySecondaryWrapperSx}>
                          <Box data-style="mobileHistorySecondaryColumnSx" sx={mobileHistorySecondaryColumnSx}>
                            <Box data-style="mobileHistoryTimeRowSx" sx={mobileHistoryTimeRowSx}>
                              <AccessTime sx={mobileHistoryAccessTimeIconSx} />
                              <Typography variant="caption">
                                Stopped at {Math.floor(item.position / 60)}m
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={mobileHistoryDateCaptionSx}>
                              {formatDate(item.watchedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {!isLast && <Divider sx={mobileHistoryDividerSx} />}
                </React.Fragment>
              );
            })}
          </List>
        </Card>
      ) : (
        <Box data-style="mobileHistoryEmptyStateSx" sx={mobileHistoryEmptyStateSx}>
          <Typography variant="body2" sx={mobileHistoryEmptyTitleSx}>
            No history yet
          </Typography>
          <Typography variant="caption">
            Videos you watch will appear here.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
