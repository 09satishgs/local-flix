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
import { PlayArrow, History as HistoryIcon, AccessTime, Movie, Delete } from '@mui/icons-material';
import type { HistoryViewProps } from './types';

// --- Extracted sx style constants ---

const historyContainerSx: SxProps<Theme> = { px: { xs: 3, md: 6 }, pb: 6 };

const historyHeadingTypographySx: SxProps<Theme> = {
  color: '#fff',
  fontWeight: 700,
  mb: 4,
  display: 'flex',
  alignItems: 'center',
  gap: 1.5,
};

const historyIconSx: SxProps<Theme> = { color: 'var(--localflix-red)', fontSize: 36 };

const historyCardSx: SxProps<Theme> = {
  bgcolor: 'var(--bg-card)',
  border: '1px solid #222',
  borderRadius: 2,
};

const actionButtonsContainerSx: SxProps<Theme> = { display: 'flex', gap: 1 };

const deleteButtonSx: SxProps<Theme> = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: 'rgba(255,255,255,0.6)',
  '&:hover': {
    bgcolor: 'var(--localflix-red)',
    color: '#fff',
  },
};

const playButtonSx: SxProps<Theme> = {
  bgcolor: 'rgba(255,255,255,0.05)',
  color: '#fff',
  '&:hover': {
    bgcolor: 'var(--localflix-red)',
    color: '#fff',
  },
};

const listItemSx: SxProps<Theme> = {
  px: 3,
  py: 2.5,
  '&:hover': {
    bgcolor: 'rgba(255, 255, 255, 0.02)',
  },
};

const listItemAvatarSx: SxProps<Theme> = { mr: 2 };

const thumbnailAvatarSx: SxProps<Theme> = {
  width: 80,
  height: 50,
  bgcolor: '#222',
  border: '1px solid #333',
};

const movieIconSx: SxProps<Theme> = { color: 'var(--localflix-red)' };

const itemNameTypographySx: SxProps<Theme> = { color: '#fff', fontWeight: 600 };

const secondaryContainerSx: SxProps<Theme> = { mt: 0.5 };

const pathTypographySx: SxProps<Theme> = {
  color: 'var(--text-secondary)',
  display: 'block',
  mb: 0.5,
};

const metaRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  color: 'var(--text-secondary)',
};

const timeInfoSx: SxProps<Theme> = { display: 'flex', alignItems: 'center', gap: 0.5 };

const accessTimeIconSx: SxProps<Theme> = { fontSize: 14 };

const historyDividerSx: SxProps<Theme> = { borderColor: '#222' };

const emptyStateSx: SxProps<Theme> = {
  border: '2px dashed #333',
  borderRadius: 2,
  p: 6,
  textAlign: 'center',
  color: 'var(--text-secondary)',
};

const emptyHeadingTypographySx: SxProps<Theme> = { mb: 1 };

// --- Component ---

export const WebHistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  formatDate,
  onPlayVideo,
  handleDeleteHistoryItem,
}) => {
  return (
    <Box className="fade-in" sx={historyContainerSx} data-style="historyContainerSx">
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
                    secondaryAction={
                      <Box sx={actionButtonsContainerSx} data-style="actionButtonsContainerSx">
                        <IconButton
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          sx={deleteButtonSx}
                          data-style="deleteButtonSx"
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          onClick={() => onPlayVideo(item.path, item.position)}
                          sx={playButtonSx}
                          data-style="playButtonSx"
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
                        <Typography variant="subtitle1" sx={itemNameTypographySx}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={secondaryContainerSx} data-style="secondaryContainerSx">
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
        <Box
          sx={emptyStateSx}
          data-style="emptyStateSx"
        >
          <Typography variant="h6" sx={emptyHeadingTypographySx}>
            No history yet
          </Typography>
          <Typography variant="body2">
            Videos you watch will appear here so you can trace your activities.
          </Typography>
        </Box>
      )}
    </Box>
  );
};
