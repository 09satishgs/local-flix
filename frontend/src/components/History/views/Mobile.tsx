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
import { PlayArrow, History as HistoryIcon, AccessTime, Movie, Delete } from '@mui/icons-material';
import type { HistoryViewProps } from './types';

export const MobileHistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  formatDate,
  onPlayVideo,
  handleDeleteHistoryItem,
}) => {
  return (
    <Box className="fade-in" sx={{ px: 2, pb: 4 }}>
      <Typography variant="h5" sx={{ color: '#fff', fontWeight: 700, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        <HistoryIcon sx={{ color: 'var(--localflix-red)', fontSize: 28 }} /> Watch History
      </Typography>

      {historyList.length > 0 ? (
        <Card sx={{ bgcolor: 'var(--bg-card)', border: '1px solid #222', borderRadius: 2 }}>
          <List disablePadding>
            {historyList.map((item, index) => {
              const isLast = index === historyList.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    alignItems="center"
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          size="small"
                          sx={{
                            color: 'rgba(255,255,255,0.4)',
                            '&:active': {
                              color: 'var(--localflix-red)',
                            }
                          }}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                        <IconButton
                          onClick={() => onPlayVideo(item.path, item.position)}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            '&:active': {
                              bgcolor: 'var(--localflix-red)',
                            }
                          }}
                        >
                          <PlayArrow fontSize="small" />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      px: 1.5,
                      py: 2,
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 1.5 }}>
                      <Avatar
                        variant="rounded"
                        src={item.thumbnail}
                        sx={{
                          width: 64,
                          height: 40,
                          bgcolor: '#222',
                          border: '1px solid #333',
                        }}
                      >
                        <Movie sx={{ color: 'var(--localflix-red)', fontSize: 20 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 'calc(100vw - 160px)' }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.25 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', color: 'var(--text-secondary)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.25 }}>
                              <AccessTime sx={{ fontSize: 12 }} />
                              <Typography variant="caption">
                                Stopped at {Math.floor(item.position / 60)}m
                              </Typography>
                            </Box>
                            <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                              {formatDate(item.watchedAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {!isLast && <Divider sx={{ borderColor: '#222' }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Card>
      ) : (
        <Box sx={{ border: '1px dashed #333', borderRadius: 2, p: 4, textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Typography variant="body2" sx={{ mb: 0.5 }}>
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
