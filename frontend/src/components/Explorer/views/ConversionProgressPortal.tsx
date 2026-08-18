import React, { useState } from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  CircularProgress,
  IconButton,
  Portal,
  Fade,
  Tooltip,
} from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import {
  CheckCircle,
  Close,
  Sync,
  Error as ErrorIcon,
  HourglassEmpty,
  Remove,
} from '@mui/icons-material';

interface ConversionProgressPortalProps {
  conversions: Record<string, { status: string; progress: number; filename: string; error?: string }>;
  onDismiss?: (path: string) => void;
  onCancel?: (path: string) => void;
}

const portalContainerSx: SxProps<Theme> = {
  position: 'fixed',
  bottom: { xs: 16, sm: 24 },
  right: { xs: 16, sm: 24 },
  zIndex: 1400,
  display: 'flex',
  flexDirection: 'column',
  gap: 1.5,
  maxWidth: { xs: 'calc(100vw - 32px)', sm: 380 },
  width: '100%',
  maxHeight: '50vh',
  overflowY: 'auto',
  pr: 0.5,
  pointerEvents: 'auto',
  '&::-webkit-scrollbar': { width: 4 },
  '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
  '&::-webkit-scrollbar-thumb': { bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 },
};

const cardSx: SxProps<Theme> = {
  pointerEvents: 'auto',
  bgcolor: '#1a1a1a',
  color: '#fff',
  p: 2,
  borderRadius: 2,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
};

const iconSpinSx: SxProps<Theme> = {
  animation: 'spin 2s linear infinite',
  '@keyframes spin': {
    '0%': { transform: 'rotate(0deg)' },
    '100%': { transform: 'rotate(360deg)' },
  },
  color: 'var(--localflix-red)',
  fontSize: 20,
};

const minimizedWidgetSx: SxProps<Theme> = {
  pointerEvents: 'auto',
  position: 'fixed',
  bottom: { xs: 16, sm: 24 },
  right: { xs: 16, sm: 24 },
  zIndex: 1400,
  width: 64,
  height: 64,
  borderRadius: '50%',
  bgcolor: '#1a1a1a',
  border: '2px solid rgba(255, 255, 255, 0.2)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.7)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
  '&:hover': {
    transform: 'scale(1.08)',
    borderColor: 'var(--localflix-red)',
    boxShadow: '0 10px 36px rgba(229, 9, 20, 0.4)',
  },
};

export const ConversionProgressPortal: React.FC<ConversionProgressPortalProps> = ({
  conversions,
  onDismiss,
  onCancel,
}) => {
  const [isMinimized, setIsMinimized] = useState(true);

  const entries = Object.entries(conversions);
  if (entries.length === 0) return null;

  // Calculate X (current processing index) and Y (total queue count)
  const totalVideos = entries.length;
  const completedCount = entries.filter(
    ([, it]) => it.status === 'completed' || it.progress === 100
  ).length;
  const activeEntry = entries.find(([, it]) => it.status === 'converting');

  const currentProcessingIndex = activeEntry
    ? completedCount + 1
    : completedCount === totalVideos
    ? totalVideos
    : completedCount + 1;

  const currentProgress = activeEntry
    ? activeEntry[1].progress
    : completedCount === totalVideos
    ? 100
    : 0;

  const allCompleted = completedCount === totalVideos;

  if (isMinimized) {
    return (
      <Portal>
        <Tooltip
          title={`Converting [ ${currentProcessingIndex} / ${totalVideos} ] (${currentProgress}%) - Click to expand`}
          placement="left"
          arrow
        >
          <Box sx={minimizedWidgetSx} onClick={() => setIsMinimized(false)}>
            {/* Background Track */}
            <CircularProgress
              variant="determinate"
              value={100}
              size={56}
              thickness={4}
              sx={{
                color: 'rgba(255, 255, 255, 0.12)',
                position: 'absolute',
              }}
            />
            {/* Active Progress Track */}
            <CircularProgress
              variant="determinate"
              value={currentProgress}
              size={56}
              thickness={4}
              sx={{
                color: allCompleted ? '#4caf50' : 'var(--localflix-red)',
                position: 'absolute',
                '& .MuiCircularProgress-circle': {
                  strokeLinecap: 'round',
                  transition: 'stroke-dashoffset 0.4s ease',
                },
              }}
            />
            {/* Center [ X / Y ] Text */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1,
                userSelect: 'none',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: '0.72rem',
                  letterSpacing: '0.5px',
                  lineHeight: 1,
                }}
              >
                [{currentProcessingIndex}/{totalVideos}]
              </Typography>
            </Box>
          </Box>
        </Tooltip>
      </Portal>
    );
  }

  return (
    <Portal>
      <Box sx={portalContainerSx}>
        {entries.map(([pathKey, item], index) => {
          const isQueued = item.status === 'queued';
          const isConverting = item.status === 'converting';
          const isComplete = item.status === 'completed' || item.progress === 100;
          const isFailed = item.status === 'failed';

          return (
            <Fade in key={pathKey} timeout={300}>
              <Box sx={cardSx}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {isComplete ? (
                      <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                    ) : isFailed ? (
                      <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
                    ) : isQueued ? (
                      <HourglassEmpty sx={{ color: '#ffa726', fontSize: 20 }} />
                    ) : (
                      <Sync sx={iconSpinSx} />
                    )}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#fff' }}>
                      {isComplete
                        ? 'Conversion Complete'
                        : isFailed
                        ? 'Conversion Failed'
                        : isQueued
                        ? 'In Queue'
                        : 'Converting Video'}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {isConverting && (
                      <Typography
                        variant="body2"
                        sx={{ color: 'var(--localflix-red)', fontWeight: 700, fontSize: '0.875rem', mr: 0.5 }}
                      >
                        {item.progress}%
                      </Typography>
                    )}

                    {/* Minimize button on first card */}
                    {index === 0 && (
                      <Tooltip title="Minimize to circle">
                        <IconButton
                          size="small"
                          onClick={() => setIsMinimized(true)}
                          sx={{ color: 'rgba(255,255,255,0.6)', p: 0.25, '&:hover': { color: '#fff' } }}
                        >
                          <Remove fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}

                    {(isQueued || isConverting) && onCancel ? (
                      <Tooltip title={isQueued ? 'Cancel from queue' : 'Cancel conversion'}>
                        <IconButton
                          size="small"
                          onClick={() => onCancel(pathKey)}
                          sx={{ color: 'rgba(255,255,255,0.5)', p: 0.25, '&:hover': { color: '#f44336' } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      onDismiss && (
                        <IconButton
                          size="small"
                          onClick={() => onDismiss(pathKey)}
                          sx={{ color: 'rgba(255,255,255,0.5)', p: 0.25, '&:hover': { color: '#fff' } }}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )
                    )}
                  </Box>
                </Box>

                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '0.8rem',
                    mb: isConverting ? 1.5 : 0.5,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={item.filename}
                >
                  {item.filename}
                </Typography>

                {isConverting && (
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'var(--localflix-red)',
                        borderRadius: 3,
                        transition: 'transform 0.4s ease',
                      },
                    }}
                  />
                )}

                {isQueued && (
                  <Typography variant="caption" sx={{ color: '#ffa726', display: 'block' }}>
                    Waiting for active conversion to finish...
                  </Typography>
                )}

                {isComplete && (
                  <Typography variant="caption" sx={{ color: '#81c784', display: 'block', mt: 0.5 }}>
                    Saved in mp4/ folder.
                  </Typography>
                )}

                {isFailed && item.error && (
                  <Typography variant="caption" sx={{ color: '#e57373', display: 'block', mt: 0.5 }}>
                    {item.error}
                  </Typography>
                )}
              </Box>
            </Fade>
          );
        })}
      </Box>
    </Portal>
  );
};
