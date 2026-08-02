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

export const WebHistoryView: React.FC<HistoryViewProps> = ({
  historyList,
  formatDate,
  onPlayVideo,
  handleDeleteHistoryItem,
}) => {
  return (
    <Box className="fade-in" sx={{ px: { xs: 3, md: 6 }, pb: 6 }}>
      <Typography variant="h4" sx={{ color: '#fff', fontWeight: 700, mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <HistoryIcon sx={{ color: 'var(--localflix-red)', fontSize: 36 }} /> Watch History
      </Typography>

      {historyList.length > 0 ? (
        <Card sx={{ bgcolor: 'var(--bg-card)', border: '1px solid #222', borderRadius: 2 }}>
          <List disablePadding>
            {historyList.map((item, index) => {
              const isLast = index === historyList.length - 1;

              return (
                <React.Fragment key={item.id}>
                  <ListItem
                    alignItems="flex-start"
                    secondaryAction={
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton
                          onClick={() => handleDeleteHistoryItem(item.id)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: 'rgba(255,255,255,0.6)',
                            '&:hover': {
                              bgcolor: 'var(--localflix-red)',
                              color: '#fff'
                            }
                          }}
                        >
                          <Delete />
                        </IconButton>
                        <IconButton
                          onClick={() => onPlayVideo(item.path, item.position)}
                          sx={{
                            bgcolor: 'rgba(255,255,255,0.05)',
                            color: '#fff',
                            '&:hover': {
                              bgcolor: 'var(--localflix-red)',
                              color: '#fff'
                            }
                          }}
                        >
                          <PlayArrow />
                        </IconButton>
                      </Box>
                    }
                    sx={{
                      px: 3,
                      py: 2.5,
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 0.02)'
                      }
                    }}
                  >
                    <ListItemAvatar sx={{ mr: 2 }}>
                      <Avatar
                        variant="rounded"
                        src={item.thumbnail}
                        sx={{
                          width: 80,
                          height: 50,
                          bgcolor: '#222',
                          border: '1px solid #333',
                        }}
                      >
                        <Movie sx={{ color: 'var(--localflix-red)' }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>
                          {item.name}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ color: 'var(--text-secondary)', display: 'block', mb: 0.5 }}>
                            Path: {item.path}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, color: 'var(--text-secondary)' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <AccessTime sx={{ fontSize: 14 }} />
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
                  {!isLast && <Divider sx={{ borderColor: '#222' }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Card>
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
