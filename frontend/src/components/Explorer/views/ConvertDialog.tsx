import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import { Download, VideoLibrary } from "@mui/icons-material";
import { api } from "../../../api";
import type { ExplorerItem, VideoMetadata, SubtitleTrack } from "../../../api";

interface ConvertDialogProps {
  open: boolean;
  item?: ExplorerItem | null;
  batchItems?: ExplorerItem[];
  onClose: () => void;
  onStartConvert: (
    videoPath: string,
    audioTrack: number | null,
    subtitleTrack: number | string | null,
    burnSubtitles: boolean
  ) => void;
  onStartBatchConvert?: (
    items: ExplorerItem[],
    audioTrack: number | null,
    subtitleTrack: number | string | null,
    burnSubtitles: boolean
  ) => void;
}

const dialogPaperSx: SxProps<Theme> = {
  bgcolor: "#1e1e1e",
  color: "#fff",
  borderRadius: 2,
  minWidth: { xs: "90%", sm: 440 },
  border: "1px solid rgba(255,255,255,0.1)",
};

const formControlSx: SxProps<Theme> = {
  mb: 2.5,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.4)" },
    "&.Mui-focused fieldset": { borderColor: "var(--localflix-red)" },
  },
  "& .MuiInputLabel-root": {
    color: "#aaa",
    "&.Mui-focused": { color: "var(--localflix-red)" },
  },
  "& .MuiSvgIcon-root": { color: "#fff" },
};

const selectMenuProps = {
  PaperProps: {
    sx: {
      bgcolor: "#2a2a2a",
      color: "#fff",
      "& .MuiMenuItem-root": {
        "&:hover": { bgcolor: "rgba(255,255,255,0.08)" },
        "&.Mui-selected": { bgcolor: "rgba(229, 9, 20, 0.2)", "&:hover": { bgcolor: "rgba(229, 9, 20, 0.3)" } },
      },
    },
  },
};

export const ConvertDialog: React.FC<ConvertDialogProps> = ({
  open,
  item,
  batchItems,
  onClose,
  onStartConvert,
  onStartBatchConvert,
}) => {
  const isBatch = Boolean(batchItems && batchItems.length > 0);
  const sampleItem = isBatch ? batchItems![0] : item;

  const [loading, setLoading] = useState(false);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<number | string>("");
  const [selectedSub, setSelectedSub] = useState<number | string>("none");
  const [burnSubtitles, setBurnSubtitles] = useState(true);

  useEffect(() => {
    if (!open || !sampleItem) {
      setMetadata(null);
      return;
    }

    setLoading(true);
    api.getVideoMetadata(sampleItem.path)
      .then((meta) => {
        setMetadata(meta);

        // Default Audio Selection (first track if available)
        if (meta.audioTracks && meta.audioTracks.length > 0) {
          setSelectedAudio(meta.audioTracks[0].index);
        } else {
          setSelectedAudio("");
        }

        // Subtitle Default Selection: Starred first, otherwise the LAST subtitle track
        if (meta.subtitles && meta.subtitles.length > 0) {
          const savedStarred = localStorage.getItem("starredSubtitles");
          const starredList: string[] = savedStarred ? JSON.parse(savedStarred) : [];
          let defaultSubTrack: SubtitleTrack | null = null;

          if (starredList.length > 0) {
            defaultSubTrack = meta.subtitles.find((s) => starredList.includes(s.title)) || null;
          }

          if (!defaultSubTrack) {
            // Default to the last subtitle track
            defaultSubTrack = meta.subtitles[meta.subtitles.length - 1];
          }

          if (defaultSubTrack) {
            setSelectedSub(defaultSubTrack.index);
            setBurnSubtitles(true);
          } else {
            setSelectedSub("none");
            setBurnSubtitles(false);
          }
        } else {
          setSelectedSub("none");
          setBurnSubtitles(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load metadata for conversion:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, sampleItem]);

  if (!sampleItem) return null;

  const handleSubmit = () => {
    const audioTrack = selectedAudio !== "" ? Number(selectedAudio) : null;
    const subtitleTrack = selectedSub !== "none" ? Number(selectedSub) : null;

    if (isBatch && batchItems && onStartBatchConvert) {
      onStartBatchConvert(batchItems, audioTrack, subtitleTrack, burnSubtitles);
    } else if (item) {
      onStartConvert(item.path, audioTrack, subtitleTrack, burnSubtitles);
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} PaperProps={{ sx: dialogPaperSx }}>
      <DialogTitle sx={{ fontWeight: 600, borderBottom: "1px solid rgba(255,255,255,0.1)", pb: 1.5, display: "flex", alignItems: "center", gap: 1 }}>
        {isBatch ? <VideoLibrary sx={{ color: "var(--localflix-red)" }} /> : <Download sx={{ color: "var(--localflix-red)" }} />}
        {isBatch ? `Convert All to MP4 (${batchItems?.length} videos)` : "Convert & Save as MP4"}
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {isBatch ? (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#aaa", mb: 0.5 }}>
              Found <strong style={{ color: "#fff" }}>{batchItems?.length}</strong> videos in this folder to convert.
            </Typography>
            <Typography variant="caption" sx={{ color: "#888", display: "block" }}>
              All converted videos will be saved into the <strong style={{ color: "#fff" }}>mp4/</strong> folder. Track settings selected below (sampled from <em>{sampleItem.name}</em>) will be applied to all videos.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ color: "#aaa", mb: 0.5 }}>
              Destination File:
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#fff",
                fontWeight: 600,
                bgcolor: "rgba(255,255,255,0.05)",
                p: 1.5,
                borderRadius: 1,
                fontFamily: "monospace",
                fontSize: "0.85rem",
              }}
            >
              mp4/{sampleItem.name.replace(/\.[^/.]+$/, "")}.mp4
            </Typography>
          </Box>
        )}

        {loading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 4, gap: 1.5 }}>
            <CircularProgress size={32} sx={{ color: "var(--localflix-red)" }} />
            <Typography variant="caption" sx={{ color: "#aaa" }}>
              Reading audio & subtitle streams...
            </Typography>
          </Box>
        ) : (
          <>
            {/* Audio Track Selector */}
            <FormControl sx={formControlSx} size="small">
              <InputLabel id="convert-audio-label">Audio Track</InputLabel>
              <Select
                labelId="convert-audio-label"
                value={selectedAudio}
                label="Audio Track"
                onChange={(e) => setSelectedAudio(e.target.value)}
                MenuProps={selectMenuProps}
              >
                {metadata?.audioTracks && metadata.audioTracks.length > 0 ? (
                  metadata.audioTracks.map((track) => (
                    <MenuItem key={track.index} value={track.index}>
                      {track.title} ({track.language})
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">Default Audio Stream</MenuItem>
                )}
              </Select>
            </FormControl>

            {/* Subtitle Track Selector */}
            <FormControl sx={formControlSx} size="small">
              <InputLabel id="convert-subtitle-label">Subtitle Track</InputLabel>
              <Select
                labelId="convert-subtitle-label"
                value={selectedSub}
                label="Subtitle Track"
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSub(val);
                  if (val === "none") {
                    setBurnSubtitles(false);
                  } else {
                    setBurnSubtitles(true);
                  }
                }}
                MenuProps={selectMenuProps}
              >
                <MenuItem value="none">None (No subtitles burned)</MenuItem>
                {metadata?.subtitles?.map((track) => (
                  <MenuItem key={track.index} value={track.index}>
                    {track.title} ({track.language}) [{track.codec}]
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Hardcode/Burn Subtitles Checkbox */}
            {selectedSub !== "none" && (
              <Box sx={{ mb: 1 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={burnSubtitles}
                      onChange={(e) => setBurnSubtitles(e.target.checked)}
                      sx={{
                        color: "rgba(255,255,255,0.4)",
                        "&.Mui-checked": { color: "var(--localflix-red)" },
                      }}
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ color: "#fff", fontWeight: 500 }}>
                        Burn subtitles into video (Hardcoded)
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#aaa" }}>
                        Subtitles will be rendered directly onto the video frames for 100% universal browser streaming.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5 }}>
        <Button onClick={onClose} sx={{ color: "#aaa", "&:hover": { color: "#fff" } }}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={isBatch ? <VideoLibrary /> : <Download />}
          sx={{
            bgcolor: "var(--localflix-red)",
            color: "#fff",
            "&:hover": { bgcolor: "#b71c1c" },
            "&.Mui-disabled": { bgcolor: "rgba(229, 9, 20, 0.4)", color: "rgba(255,255,255,0.5)" },
          }}
        >
          {isBatch ? `Convert All (${batchItems?.length})` : "Start Conversion"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
