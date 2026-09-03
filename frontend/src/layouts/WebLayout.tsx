import React, { useState, useEffect } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";
import DevicesIcon from "@mui/icons-material/Devices";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useViewMode } from "../context/ViewModeContext";

export interface LayoutProps {
  activePage: "home" | "explorer" | "history";
  onPageChange: (page: "home" | "explorer" | "history") => void;
  profileName: string | null;
  avatarColor: string;
  useAltPlayer: boolean;
  onToggleAltPlayer: (val: boolean) => void;
  debugToastEnabled?: boolean;
  onToggleDebugToast?: (val: boolean) => void;
  useTvMode?: boolean;
  onToggleTvMode?: (val: boolean) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const rootContainerSx: SxProps<Theme> = {
  minHeight: "100vh",
  bgcolor: "var(--bg-dark)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
};

const appBarSx: SxProps<Theme> = {
  bgcolor: "rgba(20,20,20,0.95)",
  backgroundImage: "none",
  boxShadow: "none",
  borderBottom: "1px solid #1f1f1f",
  backdropFilter: "blur(10px)",
  zIndex: 100,
};

const toolbarSx: SxProps<Theme> = {
  px: { xs: 2, md: 6 },
  display: "flex",
  justifyContent: "space-between",
};

const logoNavContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 4,
};

const logoTextSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  fontWeight: 900,
  letterSpacing: 2,
  cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
  textTransform: "uppercase",
  mr: 2,
  fontSize: "1.8rem",
};

const navButtonsContainerSx: SxProps<Theme> = {
  display: "flex",
  gap: 1,
};

const navButtonBaseSx: SxProps<Theme> = {
  textTransform: "none",
  fontSize: "1rem",
};

const navButtonActiveSx: SxProps<Theme> = {
  ...(navButtonBaseSx as object),
  color: "#fff",
  fontWeight: 700,
};

const navButtonInactiveSx: SxProps<Theme> = {
  ...(navButtonBaseSx as object),
  color: "var(--text-secondary)",
  fontWeight: 500,
};

const profileActionContainerSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
};

const fullscreenButtonSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
  "&:hover": {
    color: "#fff",
    bgcolor: "rgba(255,255,255,0.08)",
  },
};

const profileCardSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  cursor: "pointer",
  p: 0.5,
  borderRadius: 2,
  transition: "var(--transition-smooth)",
  "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
};

const avatarBaseSx: SxProps<Theme> = {
  width: 32,
  height: 32,
  fontSize: "0.9rem",
  fontWeight: 700,
  borderRadius: 1,
};

const profileNameSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "#fff",
};

const menuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
  mt: 1.5,
  minWidth: 200,
};

const toggleMenuItemSx: SxProps<Theme> = {
  gap: 1.5,
  py: 0.8,
  borderBottom: "1px solid #222",
  backgroundColor: "#33333366",
  cursor: "default",
};

const toggleLabelSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "#d8dde6",
};

const formControlLabelSx: SxProps<Theme> = {
  m: 0,
};

const logoutMenuItemSx: SxProps<Theme> = {
  gap: 1.5,
};

const switchAccountIconSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
};

const mainContentContainerSx: SxProps<Theme> = {
  flexGrow: 1,
  py: 2,
};

export const WebLayout: React.FC<LayoutProps> = ({
  activePage,
  onPageChange,
  profileName,
  avatarColor,
  useAltPlayer,
  onToggleAltPlayer,
  debugToastEnabled = false,
  onToggleDebugToast,
  onLogout,
  children,
}) => {
  const { viewMode, resetViewMode } = useViewMode();
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(
    Boolean(document.fullscreenElement)
  );

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Exit fullscreen failed:", err);
      });
    }
  };

  return (
    <Box sx={rootContainerSx} data-style="rootContainerSx">
      {/* Navigation Navbar */}
      <AppBar position="sticky" sx={appBarSx}>
        <Toolbar sx={toolbarSx}>
          {/* Logo & Navigation Links */}
          <Box sx={logoNavContainerSx} data-style="logoNavContainerSx">
            <Typography
              variant="h5"
              onClick={() => onPageChange("home")}
              sx={logoTextSx}
            >
              LocalFlix
            </Typography>

            <Box sx={navButtonsContainerSx} data-style="navButtonsContainerSx">
              <Button
                onClick={() => onPageChange("home")}
                sx={
                  activePage === "home"
                    ? navButtonActiveSx
                    : navButtonInactiveSx
                }
              >
                Home
              </Button>
              <Button
                onClick={() => onPageChange("explorer")}
                sx={
                  activePage === "explorer"
                    ? navButtonActiveSx
                    : navButtonInactiveSx
                }
              >
                Files
              </Button>
              <Button
                onClick={() => onPageChange("history")}
                sx={
                  activePage === "history"
                    ? navButtonActiveSx
                    : navButtonInactiveSx
                }
              >
                History
              </Button>
            </Box>
          </Box>

          {/* User Profile Info, Fullscreen & Switch Account */}
          <Box
            sx={profileActionContainerSx}
            data-style="profileActionContainerSx"
          >
            {/* Fullscreen PC Button */}
            <Tooltip title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}>
              <IconButton
                onClick={handleToggleFullscreen}
                sx={fullscreenButtonSx}
                size="medium"
                aria-label="Toggle Fullscreen"
              >
                {isFullscreen ? <FullscreenExitIcon /> : <FullscreenIcon />}
              </IconButton>
            </Tooltip>

            <Box
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
              sx={profileCardSx}
              data-style="profileCardSx"
            >
              <Avatar
                sx={avatarBaseSx}
                style={{ backgroundColor: avatarColor }}
              >
                {profileName?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="body2" sx={profileNameSx}>
                {profileName}
              </Typography>
            </Box>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
              PaperProps={{
                sx: menuPaperSx,
              }}
            >
              <MenuItem disableRipple sx={toggleMenuItemSx}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={useAltPlayer}
                      onChange={(e) => onToggleAltPlayer(e.target.checked)}
                      color="info"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={toggleLabelSx}>
                      Use Alt Player
                    </Typography>
                  }
                  sx={formControlLabelSx}
                />
              </MenuItem>
              <MenuItem disableRipple sx={toggleMenuItemSx}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={debugToastEnabled}
                      onChange={(e) => onToggleDebugToast?.(e.target.checked)}
                      color="warning"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={toggleLabelSx}>
                      Debug Toasts
                    </Typography>
                  }
                  sx={formControlLabelSx}
                />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  resetViewMode();
                }}
                sx={logoutMenuItemSx}
              >
                <DevicesIcon fontSize="small" sx={switchAccountIconSx} />
                <Typography variant="body2">
                  Change Mode ({viewMode === "tv" ? "TV" : viewMode === "mobile" ? "Mobile" : "Web"})
                </Typography>
              </MenuItem>
              <MenuItem onClick={onLogout} sx={logoutMenuItemSx}>
                <SwitchAccountIcon fontSize="small" sx={switchAccountIconSx} />
                <Typography variant="body2">Switch Profile</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={mainContentContainerSx} data-style="mainContentContainerSx">
        {children}
      </Box>
    </Box>
  );
};
