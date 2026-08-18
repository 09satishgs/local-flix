import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Slider,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  PlayArrow,
  Pause,
  ArrowBack,
  Subtitles,
  Audiotrack,
  FastForward,
  FastRewind,
  Check,
  Close,
} from "@mui/icons-material";
import { api } from "../../api";
import type { AudioTrack, SubtitleTrack } from "../../api";
import { logDebug } from "../../utils/debugLogger";
import { formatTime } from "../../utils/helpers";

interface TVPlayerProps {
  videoPath: string;
  initialPosition?: number;
  onClose: () => void;
}

const playerRootSx: SxProps<Theme> = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  bgcolor: "#000",
  zIndex: 1300,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
  userSelect: "none",
};

const videoSx: React.CSSProperties = {
  width: "100%",
  height: "100%",
  maxHeight: "100vh",
  objectFit: "contain",
};

const osdContainerSx = (visible: boolean): SxProps<Theme> => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  p: 4,
  background:
    "linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.92) 100%)",
  opacity: visible ? 1 : 0,
  pointerEvents: visible ? "auto" : "none",
  transition: "opacity 0.25s ease-in-out",
  zIndex: 10,
});

const topBarSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

const titleTextSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "1.4rem",
  textShadow: "0 2px 4px rgba(0,0,0,0.8)",
};

const seekBadgeSx: SxProps<Theme> = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "rgba(0, 0, 0, 0.88)",
  border: "2px solid var(--localflix-red)",
  borderRadius: 3,
  px: 4,
  py: 2.5,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 1.5,
  boxShadow: "0 0 35px rgba(229, 9, 20, 0.6)",
  zIndex: 20,
};

const seekDeltaTextSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 800,
  fontSize: "2.2rem",
  display: "flex",
  alignItems: "center",
  gap: 1,
};

const thumbnailBoxSx: SxProps<Theme> = {
  width: 240,
  height: 135,
  borderRadius: 2,
  overflow: "hidden",
  bgcolor: "#111",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bottomOsdSx: SxProps<Theme> = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
};

const progressRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2.5,
};

const timeLabelSx: SxProps<Theme> = {
  color: "#fff",
  fontWeight: 700,
  fontSize: "1.2rem",
  minWidth: 85,
};

const sliderSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  height: 10,
  "& .MuiSlider-thumb": {
    width: 22,
    height: 22,
    backgroundColor: "#fff",
    "&:hover, &.Mui-focusVisible": {
      boxShadow: "0 0 0 8px rgba(229, 9, 20, 0.4)",
    },
  },
  "& .MuiSlider-rail": {
    opacity: 0.35,
    backgroundColor: "#fff",
  },
};

const controlsRowSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  pt: 1,
};

const actionBtnGroupSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 2,
};

const tvButtonSx: SxProps<Theme> = {
  bgcolor: "rgba(255, 255, 255, 0.12)",
  color: "#fff",
  px: 2.5,
  py: 1,
  borderRadius: 2,
  border: "2px solid transparent",
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  cursor: "pointer",
  transition: "all 0.15s ease",
  "&:focus, &:focus-visible, &:hover": {
    bgcolor: "var(--localflix-red)",
    borderColor: "#fff",
    transform: "scale(1.08)",
    outline: "none",
  },
};

const dialogPaperSx: SxProps<Theme> = {
  bgcolor: "#181818",
  color: "#fff",
  border: "2px solid #333",
  borderRadius: 3,
  minWidth: 420,
  p: 1,
};

const dialogItemSx: SxProps<Theme> = {
  borderRadius: 2,
  my: 0.5,
  "&:focus, &:focus-visible, &:hover": {
    bgcolor: "var(--localflix-red)",
    color: "#fff",
    outline: "none",
  },
};

export const TVPlayer: React.FC<TVPlayerProps> = ({
  videoPath,
  initialPosition = 0,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const profileId = localStorage.getItem("profileId") || "";
  const profileToken = localStorage.getItem("profileToken") || "";

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [osdVisible, setOsdVisible] = useState(true);

  // Metadata & Tracks
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<number | null>(null);
  const [activeAudio, setActiveAudio] = useState<number | null>(null);

  // Seeking & Thumbnail
  const [seekDelta, setSeekDelta] = useState<number | null>(null);
  const [targetSeekTime, setTargetSeekTime] = useState<number | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  // Dialogs
  const [audioDialogOpen, setAudioDialogOpen] = useState(false);
  const [subtitleDialogOpen, setSubtitleDialogOpen] = useState(false);

  const osdTimerRef = useRef<any>(null);
  const seekTimerRef = useRef<any>(null);
  const thumbDebounceRef = useRef<any>(null);
  const progressSaveTimerRef = useRef<any>(null);

  // Load Metadata
  useEffect(() => {
    let active = true;
    api
      .getVideoMetadata(videoPath)
      .then((meta) => {
        if (!active) return;
        setSubtitles(meta.subtitles || []);
        setAudioTracks(meta.audioTracks || []);
        if (meta.duration && meta.duration > 0) {
          setDuration(meta.duration);
        }
      })
      .catch((err) => console.error("Error loading video metadata:", err));

    return () => {
      active = false;
    };
  }, [videoPath]);

  // Initial Seek Position
  useEffect(() => {
    if (videoRef.current && initialPosition > 0) {
      videoRef.current.currentTime = initialPosition;
    }
  }, [initialPosition]);

  // Save Progress periodically & on unmount
  const saveProgress = useCallback(
    (pos: number, dur: number) => {
      if (dur > 0 && profileId) {
        api.updateProgress(videoPath, Math.round(pos), Math.round(dur)).catch(() => {});
      }
    },
    [videoPath, profileId]
  );

  useEffect(() => {
    const videoEl = videoRef.current;
    progressSaveTimerRef.current = setInterval(() => {
      if (videoEl) {
        const cur = videoEl.currentTime;
        const dur = videoEl.duration || duration;
        saveProgress(cur, dur);
      }
    }, 5000);

    return () => {
      if (progressSaveTimerRef.current) {
        clearInterval(progressSaveTimerRef.current);
      }
      if (videoEl) {
        const cur = videoEl.currentTime;
        const dur = videoEl.duration || duration;
        saveProgress(cur, dur);
      }
    };
  }, [saveProgress, duration]);

  const showOsdTemporarily = useCallback(() => {
    setOsdVisible(true);
    if (osdTimerRef.current) clearTimeout(osdTimerRef.current);
    osdTimerRef.current = setTimeout(() => {
      if (!audioDialogOpen && !subtitleDialogOpen) {
        setOsdVisible(false);
      }
    }, 4500);
  }, [audioDialogOpen, subtitleDialogOpen]);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    showOsdTemporarily();
  }, [showOsdTemporarily]);

  // Unlimited Seek Support for MP4
  const triggerRemoteSeek = useCallback(
    (seconds: number) => {
      showOsdTemporarily();
      const current = targetSeekTime !== null ? targetSeekTime : currentTime;
      const totalDuration = duration || (videoRef.current?.duration ?? 0);
      const nextTime = Math.max(0, Math.min(totalDuration, current + seconds));
      const nextDelta = (seekDelta ?? 0) + seconds;

      setSeekDelta(nextDelta);
      setTargetSeekTime(nextTime);

      if (thumbDebounceRef.current) clearTimeout(thumbDebounceRef.current);
      thumbDebounceRef.current = setTimeout(() => {
        setThumbnailUrl(api.getHoverThumbnailUrl(videoPath, nextTime));
      }, 150);

      if (seekTimerRef.current) clearTimeout(seekTimerRef.current);
      seekTimerRef.current = setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = nextTime;
          setCurrentTime(nextTime);
        }
        setSeekDelta(null);
        setTargetSeekTime(null);
        setThumbnailUrl(null);
      }, 600);
    },
    [currentTime, duration, seekDelta, targetSeekTime, videoPath, showOsdTemporarily]
  );

  const handleSliderSeek = (_: Event, value: number | number[]) => {
    const target = Array.isArray(value) ? value[0] : value;
    if (videoRef.current) {
      videoRef.current.currentTime = target;
      setCurrentTime(target);
    }
  };

  // TV Remote Keybindings & Debug Logging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const { key, code, keyCode, which } = e;

      // Debug Log every key pressed in TVPlayer
      logDebug(`[TVPlayer] key: "${key}" | code: "${code}" | keyCode: ${keyCode} | which: ${which}`);

      if (audioDialogOpen || subtitleDialogOpen) {
        if (
          key === "Escape" ||
          key === "Backspace" ||
          key === "GoBack" ||
          key === "Back" ||
          keyCode === 10009 ||
          keyCode === 27 ||
          keyCode === 8
        ) {
          e.preventDefault();
          setAudioDialogOpen(false);
          setSubtitleDialogOpen(false);
        }
        return;
      }

      switch (key) {
        case "ArrowLeft":
          e.preventDefault();
          triggerRemoteSeek(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          triggerRemoteSeek(10);
          break;
        case "ArrowUp":
        case "ArrowDown":
          e.preventDefault();
          showOsdTemporarily();
          break;
        case " ":
        case "MediaPlayPause":
          e.preventDefault();
          handlePlayPause();
          break;
        case "Enter":
          // If no interactive element has focus, toggle play/pause
          if (
            document.activeElement === document.body ||
            document.activeElement?.tagName === "VIDEO"
          ) {
            e.preventDefault();
            handlePlayPause();
          }
          break;
        case "Escape":
        case "Backspace":
        case "GoBack":
        case "Back":
          e.preventDefault();
          onClose();
          break;
        default:
          if (keyCode === 10009) {
            // Samsung / Smart TV Remote Back Key
            e.preventDefault();
            onClose();
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    audioDialogOpen,
    subtitleDialogOpen,
    triggerRemoteSeek,
    handlePlayPause,
    showOsdTemporarily,
    onClose,
  ]);

  const displayTime = targetSeekTime !== null ? targetSeekTime : currentTime;

  // Direct MP4 Stream URL
  const mp4StreamUrl = `/api/video?path=${encodeURIComponent(videoPath)}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}${activeAudio !== null ? `&audioTrack=${activeAudio}` : ""}`;

  return (
    <Box sx={playerRootSx} onMouseMove={showOsdTemporarily} onClick={showOsdTemporarily}>
      {/* HTML5 Native MP4 Video Player with Range & Unlimited Seek */}
      <video
        ref={videoRef}
        style={videoSx}
        src={mp4StreamUrl}
        preload="auto"
        crossOrigin="anonymous"
        autoPlay
        playsInline
        onTimeUpdate={() => {
          if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
          }
        }}
        onDurationChange={() => {
          if (videoRef.current && videoRef.current.duration) {
            setDuration(videoRef.current.duration);
          }
        }}
        onLoadedMetadata={() => {
          setIsLoading(false);
          if (videoRef.current) {
            if (videoRef.current.duration) {
              setDuration(videoRef.current.duration);
            }
            if (initialPosition > 0) {
              videoRef.current.currentTime = initialPosition;
            }
          }
        }}
        onWaiting={() => setIsLoading(true)}
        onPlaying={() => {
          setIsLoading(false);
          setIsPlaying(true);
        }}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          showOsdTemporarily();
        }}
      >
        {subtitles.map((sub) => (
          <track
            key={sub.index}
            kind="subtitles"
            label={sub.title || sub.language || `Track ${sub.index}`}
            srcLang={sub.language || "en"}
            src={`/api/video/subtitles?path=${encodeURIComponent(videoPath)}&trackIndex=${sub.index}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`}
            default={activeSubtitle === sub.index}
          />
        ))}
      </video>

      {/* Buffering Spinner */}
      {isLoading && (
        <CircularProgress
          size={70}
          sx={{
            position: "absolute",
            color: "var(--localflix-red)",
            zIndex: 15,
          }}
        />
      )}

      {/* Center D-Pad Seek Badge Overlay */}
      {seekDelta !== null && (
        <Box sx={seekBadgeSx}>
          <Typography sx={seekDeltaTextSx}>
            {seekDelta > 0 ? <FastForward fontSize="large" /> : <FastRewind fontSize="large" />}
            {seekDelta > 0 ? `+${seekDelta}s` : `${seekDelta}s`}
          </Typography>
          <Box sx={thumbnailBoxSx}>
            {thumbnailUrl ? (
              <Box
                component="img"
                src={thumbnailUrl}
                alt="Seek Preview"
                sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <CircularProgress size={32} sx={{ color: "var(--localflix-red)" }} />
            )}
          </Box>
          <Typography variant="body1" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.1rem" }}>
            {formatTime(displayTime)} / {formatTime(duration)}
          </Typography>
        </Box>
      )}

      {/* TV On-Screen Display (OSD) */}
      <Box sx={osdContainerSx(osdVisible)}>
        {/* Top Header */}
        <Box sx={topBarSx}>
          <IconButton
            onClick={onClose}
            sx={{
              color: "#fff",
              bgcolor: "rgba(255, 255, 255, 0.15)",
              "&:hover, &:focus": { bgcolor: "var(--localflix-red)" },
            }}
            data-focusable="true"
            tabIndex={0}
          >
            <ArrowBack fontSize="large" />
          </IconButton>
          <Typography variant="h5" sx={titleTextSx}>
            {videoPath.replace(/\\/g, "/").split("/").pop()}
          </Typography>
          <Chip
            label="MP4 TV Direct"
            size="small"
            sx={{
              bgcolor: "var(--localflix-red)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "0.8rem",
            }}
          />
        </Box>

        {/* Bottom OSD Bar */}
        <Box sx={bottomOsdSx}>
          {/* Progress Timeline */}
          <Box sx={progressRowSx}>
            <Typography sx={timeLabelSx}>{formatTime(displayTime)}</Typography>
            <Slider
              value={displayTime}
              min={0}
              max={duration || 100}
              onChange={handleSliderSeek}
              sx={sliderSx}
              data-focusable="true"
              tabIndex={0}
            />
            <Typography sx={timeLabelSx}>{formatTime(duration)}</Typography>
          </Box>

          {/* Action Buttons Row */}
          <Box sx={controlsRowSx}>
            <Box sx={actionBtnGroupSx}>
              {/* Play / Pause */}
              <Box
                component="button"
                onClick={handlePlayPause}
                sx={tvButtonSx}
                data-focusable="true"
                tabIndex={0}
              >
                {isPlaying ? <Pause fontSize="medium" /> : <PlayArrow fontSize="medium" />}
                <Typography variant="body1" fontWeight={700}>
                  {isPlaying ? "Pause" : "Play"}
                </Typography>
              </Box>

              {/* Rewind 10s */}
              <Box
                component="button"
                onClick={() => triggerRemoteSeek(-10)}
                sx={tvButtonSx}
                data-focusable="true"
                tabIndex={0}
              >
                <FastRewind fontSize="medium" />
                <Typography variant="body2" fontWeight={600}>
                  -10s
                </Typography>
              </Box>

              {/* Forward 10s */}
              <Box
                component="button"
                onClick={() => triggerRemoteSeek(10)}
                sx={tvButtonSx}
                data-focusable="true"
                tabIndex={0}
              >
                <FastForward fontSize="medium" />
                <Typography variant="body2" fontWeight={600}>
                  +10s
                </Typography>
              </Box>
            </Box>

            <Box sx={actionBtnGroupSx}>
              {/* Audio Tracks Selection */}
              {audioTracks.length > 0 && (
                <Box
                  component="button"
                  onClick={() => setAudioDialogOpen(true)}
                  sx={tvButtonSx}
                  data-focusable="true"
                  tabIndex={0}
                >
                  <Audiotrack fontSize="medium" />
                  <Typography variant="body2" fontWeight={600}>
                    Audio ({audioTracks.find((a) => a.index === activeAudio)?.title || "Default"})
                  </Typography>
                </Box>
              )}

              {/* Subtitles Selection */}
              {subtitles.length > 0 && (
                <Box
                  component="button"
                  onClick={() => setSubtitleDialogOpen(true)}
                  sx={tvButtonSx}
                  data-focusable="true"
                  tabIndex={0}
                >
                  <Subtitles fontSize="medium" />
                  <Typography variant="body2" fontWeight={600}>
                    Subtitles (
                    {activeSubtitle !== null
                      ? subtitles.find((s) => s.index === activeSubtitle)?.title || "On"
                      : "Off"}
                    )
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Remote Friendly Audio Track Dialog */}
      <Dialog
        open={audioDialogOpen}
        onClose={() => setAudioDialogOpen(false)}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Select Audio Track
          <IconButton onClick={() => setAudioDialogOpen(false)} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <List>
          {audioTracks.map((track) => {
            const isSelected = activeAudio === track.index;
            return (
              <ListItemButton
                key={track.index}
                onClick={() => {
                  const savedPos = videoRef.current ? videoRef.current.currentTime : currentTime;
                  setActiveAudio(track.index);
                  setAudioDialogOpen(false);
                  setTimeout(() => {
                    if (videoRef.current) {
                      videoRef.current.currentTime = savedPos;
                    }
                  }, 100);
                }}
                selected={isSelected}
                sx={dialogItemSx}
                data-focusable="true"
                tabIndex={0}
              >
                <ListItemIcon sx={{ color: isSelected ? "var(--localflix-red)" : "#888" }}>
                  {isSelected ? <Check /> : <Audiotrack />}
                </ListItemIcon>
                <ListItemText
                  primary={track.title || track.language || `Audio Track ${track.index + 1}`}
                  secondary={track.codec || undefined}
                  secondaryTypographyProps={{ color: "#aaa" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Dialog>

      {/* Remote Friendly Subtitle Dialog */}
      <Dialog
        open={subtitleDialogOpen}
        onClose={() => setSubtitleDialogOpen(false)}
        PaperProps={{ sx: dialogPaperSx }}
      >
        <DialogTitle
          sx={{
            color: "#fff",
            fontWeight: 700,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          Select Subtitles
          <IconButton onClick={() => setSubtitleDialogOpen(false)} sx={{ color: "#fff" }}>
            <Close />
          </IconButton>
        </DialogTitle>
        <List>
          <ListItemButton
            onClick={() => {
              setActiveSubtitle(null);
              setSubtitleDialogOpen(false);
            }}
            selected={activeSubtitle === null}
            sx={dialogItemSx}
            data-focusable="true"
            tabIndex={0}
          >
            <ListItemIcon sx={{ color: activeSubtitle === null ? "var(--localflix-red)" : "#888" }}>
              {activeSubtitle === null && <Check />}
            </ListItemIcon>
            <ListItemText primary="Off (Subtitles Disabled)" />
          </ListItemButton>

          {subtitles.map((sub) => {
            const isSelected = activeSubtitle === sub.index;
            return (
              <ListItemButton
                key={sub.index}
                onClick={() => {
                  setActiveSubtitle(sub.index);
                  setSubtitleDialogOpen(false);
                }}
                selected={isSelected}
                sx={dialogItemSx}
                data-focusable="true"
                tabIndex={0}
              >
                <ListItemIcon sx={{ color: isSelected ? "var(--localflix-red)" : "#888" }}>
                  {isSelected ? <Check /> : <Subtitles />}
                </ListItemIcon>
                <ListItemText
                  primary={sub.title || sub.language || `Subtitle Track ${sub.index}`}
                  secondary={sub.codec || undefined}
                  secondaryTypographyProps={{ color: "#aaa" }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Dialog>
    </Box>
  );
};
