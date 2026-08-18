import React from "react";
import { Box, Typography, Card, CardActionArea, Stack, Chip } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import TvIcon from "@mui/icons-material/Tv";
import type { ViewMode } from "../../context/ViewModeContext";

interface ModeSelectorProps {
  onSelectMode: (mode: ViewMode) => void;
  currentMode?: ViewMode | null;
}

const containerSx: SxProps<Theme> = {
  minHeight: "100vh",
  bgcolor: "var(--bg-dark)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  p: { xs: 2, sm: 4 },
  textAlign: "center",
};

const headerBoxSx: SxProps<Theme> = {
  mb: { xs: 4, md: 6 },
  maxWidth: 680,
};

const brandTitleSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  fontWeight: 900,
  letterSpacing: 3,
  textTransform: "uppercase",
  fontFamily: "'Outfit', sans-serif",
  fontSize: { xs: "2rem", md: "2.8rem" },
  mb: 1,
};

const titleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1.4rem", md: "2rem" },
  mb: 1,
  color: "#fff",
};

const subtitleSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  fontSize: { xs: "0.95rem", md: "1.1rem" },
};

const cardsGridSx: SxProps<Theme> = {
  display: "grid",
  gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
  gap: { xs: 2.5, md: 3 },
  width: "100%",
  maxWidth: 1050,
};

const cardSx: SxProps<Theme> = {
  bgcolor: "#141414",
  border: "2px solid #282828",
  borderRadius: 3,
  color: "#fff",
  transition: "transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
  "&:hover": {
    borderColor: "var(--localflix-red)",
    transform: "translateY(-6px)",
    boxShadow: "0 12px 30px rgba(229, 9, 20, 0.25)",
  },
  "&:focus-visible, &:focus": {
    borderColor: "var(--localflix-red)",
    outline: "none",
    transform: "translateY(-6px)",
    boxShadow: "0 0 20px rgba(229, 9, 20, 0.6)",
  },
};

const cardActionSx: SxProps<Theme> = {
  p: { xs: 3, md: 4 },
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  height: "100%",
  boxSizing: "border-box",
};

const iconCircleSx: SxProps<Theme> = {
  width: { xs: 70, md: 84 },
  height: { xs: 70, md: 84 },
  borderRadius: "50%",
  bgcolor: "rgba(229, 9, 20, 0.12)",
  color: "var(--localflix-red)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  mb: 2.5,
};

const cardTitleSx: SxProps<Theme> = {
  fontWeight: 700,
  fontSize: { xs: "1.2rem", md: "1.35rem" },
  mb: 1.5,
  color: "#fff",
};

const cardDescSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  fontSize: "0.9rem",
  lineHeight: 1.5,
  mb: 3,
  flexGrow: 1,
};

const chipSx: SxProps<Theme> = {
  bgcolor: "rgba(255, 255, 255, 0.08)",
  color: "#d8dde6",
  fontWeight: 600,
  fontSize: "0.75rem",
  borderRadius: 1.5,
  border: "1px solid rgba(255, 255, 255, 0.12)",
};

const OPTIONS: Array<{
  id: ViewMode;
  title: string;
  badge: string;
  description: string;
  icon: React.ReactNode;
}> = [
  {
    id: "web",
    title: "Web (Desktop / PC)",
    badge: "Web Layout • Standard Player",
    description:
      "Optimized for laptops, desktop computers, mouse & keyboard navigation with multi-pane browsing.",
    icon: <DesktopWindowsIcon sx={{ fontSize: { xs: 36, md: 44 } }} />,
  },
  {
    id: "mobile",
    title: "Mobile (Phone / Tablet)",
    badge: "Mobile Layout • Touch Player",
    description:
      "Optimized for handheld smartphones and tablets with bottom navigation and touch-friendly controls.",
    icon: <SmartphoneIcon sx={{ fontSize: { xs: 36, md: 44 } }} />,
  },
  {
    id: "tv",
    title: "Smart TV (Big Screen)",
    badge: "TV Remote D-Pad • TVPlayer",
    description:
      "Optimized for smart TVs, JioSphere browser, remote D-Pad navigation, and dedicated TV video player.",
    icon: <TvIcon sx={{ fontSize: { xs: 36, md: 44 } }} />,
  },
];

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onSelectMode, currentMode }) => {
  return (
    <Box sx={containerSx}>
      <Box sx={headerBoxSx}>
        <Typography variant="h3" sx={brandTitleSx}>
          LocalFlix
        </Typography>
        <Typography variant="h4" sx={titleSx}>
          Choose Your Experience
        </Typography>
        <Typography variant="body1" sx={subtitleSx}>
          Select how you want to use LocalFlix on this device. You can change this anytime in settings.
        </Typography>
      </Box>

      <Box sx={cardsGridSx}>
        {OPTIONS.map((opt) => {
          const isCurrent = currentMode === opt.id;
          return (
            <Card
              key={opt.id}
              sx={{
                ...cardSx,
                ...(isCurrent ? { borderColor: "var(--localflix-red)", bgcolor: "#1a1313" } : {}),
              }}
            >
              <CardActionArea
                onClick={() => onSelectMode(opt.id)}
                sx={cardActionSx}
                data-focusable="true"
                tabIndex={0}
              >
                <Box sx={iconCircleSx}>{opt.icon}</Box>
                <Typography variant="h6" sx={cardTitleSx}>
                  {opt.title}
                </Typography>
                <Typography variant="body2" sx={cardDescSx}>
                  {opt.description}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip label={opt.badge} size="small" sx={chipSx} />
                </Stack>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
