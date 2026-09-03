import React, { useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Switch,
  FormControlLabel,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import {
  Home as HomeIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
  SwitchAccount as SwitchAccountIcon,
  Devices as DevicesIcon,
} from "@mui/icons-material";
import { useViewMode } from "../context/ViewModeContext";

interface LayoutProps {
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

const mobileRootSx: SxProps<Theme> = {
  minHeight: "100vh",
  bgcolor: "var(--bg-dark)",
  color: "#fff",
  display: "flex",
  flexDirection: "column",
  pb: "64px", // height of bottom navigation
};

const mobileAppBarSx: SxProps<Theme> = {
  bgcolor: "rgba(20,20,20,0.95)",
  backgroundImage: "none",
  boxShadow: "none",
  borderBottom: "1px solid #1f1f1f",
  backdropFilter: "blur(10px)",
  zIndex: 100,
};

const mobileToolbarSx: SxProps<Theme> = {
  px: 2,
  display: "flex",
  justifyContent: "space-between",
  minHeight: 56,
};

const mobileLogoTextSx: SxProps<Theme> = {
  color: "var(--localflix-red)",
  fontWeight: 900,
  letterSpacing: 2,
  cursor: "pointer",
  fontFamily: "'Outfit', sans-serif",
  textTransform: "uppercase",
  fontSize: "1.3rem",
};

const mobileProfileCardSx: SxProps<Theme> = {
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
  p: 0.5,
  borderRadius: 1,
};

const mobileAvatarBaseSx: SxProps<Theme> = {
  width: 30,
  height: 30,
  fontSize: "0.85rem",
  fontWeight: 700,
  borderRadius: 0.75,
};

const mobileMenuPaperSx: SxProps<Theme> = {
  bgcolor: "var(--bg-card)",
  color: "#fff",
  border: "1px solid #333",
  mt: 1,
  minWidth: 180,
};

const mobileAltPlayerMenuItemSx: SxProps<Theme> = {
  gap: 1.5,
  py: 1,
  borderBottom: "1px solid #222",
  backgroundColor: "#5858589b",
  cursor: "default",
  "&:hover": { bgcolor: "transparent" },
};

const mobileAltPlayerLabelSx: SxProps<Theme> = {
  fontWeight: 600,
  color: "#fff",
};

const mobileFormControlLabelSx: SxProps<Theme> = {
  m: 0,
};

const mobileLogoutMenuItemSx: SxProps<Theme> = {
  gap: 1.5,
};

const mobileSwitchAccountIconSx: SxProps<Theme> = {
  color: "var(--text-secondary)",
};

const mobileMainContentSx: SxProps<Theme> = {
  flexGrow: 1,
};

const mobilePaperSx: SxProps<Theme> = {
  position: "fixed",
  bottom: 0,
  left: 0,
  right: 0,
  zIndex: 100,
  borderTop: "1px solid #1f1f1f",
};

const mobileBottomNavigationSx: SxProps<Theme> = {
  bgcolor: "rgba(20,20,20,0.98)",
  backdropFilter: "blur(15px)",
  height: 60,
  "& .MuiBottomNavigationAction-root": {
    color: "var(--text-secondary)",
    minWidth: "auto",
    padding: "6px 0",
    "&.Mui-selected": {
      color: "var(--localflix-red)",
      "& .MuiSvgIcon-root": {
        color: "var(--localflix-red)",
      },
    },
  },
};

export const MobileLayout: React.FC<LayoutProps> = ({
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

  return (
    <Box sx={mobileRootSx} data-style="mobileRootSx">
      {/* Mobile Top Header */}
      <AppBar position="sticky" sx={mobileAppBarSx}>
        <Toolbar sx={mobileToolbarSx}>
          <Typography
            variant="h6"
            onClick={() => onPageChange("home")}
            sx={mobileLogoTextSx}
          >
            LocalFlix
          </Typography>

          <Box
            onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            sx={mobileProfileCardSx}
            data-style="mobileProfileCardSx"
          >
            <Avatar
              sx={mobileAvatarBaseSx}
              style={{ backgroundColor: avatarColor }}
            >
              {profileName?.slice(0, 2).toUpperCase()}
            </Avatar>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
              PaperProps={{
                sx: mobileMenuPaperSx,
              }}
            >
              <MenuItem disableRipple sx={mobileAltPlayerMenuItemSx}>
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
                    <Typography variant="body2" sx={mobileAltPlayerLabelSx}>
                      Use Alt Player
                    </Typography>
                  }
                  sx={mobileFormControlLabelSx}
                />
              </MenuItem>
              <MenuItem disableRipple sx={mobileAltPlayerMenuItemSx}>
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
                    <Typography variant="body2" sx={mobileAltPlayerLabelSx}>
                      Debug Toasts
                    </Typography>
                  }
                  sx={mobileFormControlLabelSx}
                />
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setProfileMenuAnchor(null);
                  resetViewMode();
                }}
                sx={mobileLogoutMenuItemSx}
              >
                <DevicesIcon
                  fontSize="small"
                  sx={mobileSwitchAccountIconSx}
                />
                <Typography variant="body2">
                  Change Mode ({viewMode === "tv" ? "TV" : viewMode === "mobile" ? "Mobile" : "Web"})
                </Typography>
              </MenuItem>
              <MenuItem onClick={onLogout} sx={mobileLogoutMenuItemSx}>
                <SwitchAccountIcon
                  fontSize="small"
                  sx={mobileSwitchAccountIconSx}
                />
                <Typography variant="body2">Switch Profile</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={mobileMainContentSx} data-style="mobileMainContentSx">
        {children}
      </Box>

      {/* Bottom Navigation Bar */}
      <Paper sx={mobilePaperSx} elevation={3}>
        <BottomNavigation
          value={activePage}
          onChange={(_event, newValue) => {
            onPageChange(newValue);
          }}
          sx={mobileBottomNavigationSx}
        >
          <BottomNavigationAction
            label="Home"
            value="home"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            label="Files"
            value="explorer"
            icon={<FolderIcon />}
          />
          <BottomNavigationAction
            label="History"
            value="history"
            icon={<HistoryIcon />}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};
