import React, { useState } from "react";
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
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";

interface LayoutProps {
  activePage: "home" | "explorer" | "history";
  onPageChange: (page: "home" | "explorer" | "history") => void;
  profileName: string | null;
  avatarColor: string;
  playerMode: "standard" | "qsv" | "direct";
  onPlayerModeChange: (val: "standard" | "qsv" | "direct") => void;
  useTvMode: boolean;
  onToggleTvMode: (val: boolean) => void;
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
  gap: 1,
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
  minWidth: 180,
};

const altPlayerMenuItemSx: SxProps<Theme> = {
  gap: 1.5,
  py: 1,
  borderBottom: "1px solid #222",
  backgroundColor: "#5858589b",
  cursor: "default",
};

const altPlayerLabelSx: SxProps<Theme> = {
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
  playerMode,
  onPlayerModeChange,
  useTvMode,
  onToggleTvMode,
  onLogout,
  children,
}) => {
  const [profileMenuAnchor, setProfileMenuAnchor] =
    useState<null | HTMLElement>(null);

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

          {/* User Profile Info & Switch Account */}
          <Box
            sx={profileActionContainerSx}
            data-style="profileActionContainerSx"
          >
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
              <MenuItem disableRipple sx={{ ...altPlayerMenuItemSx, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
                  <InputLabel id="player-mode-select-label" sx={{ color: '#aaa', '&.Mui-focused': { color: 'var(--localflix-red)' } }}>Player Mode</InputLabel>
                  <Select
                    labelId="player-mode-select-label"
                    value={playerMode}
                    label="Player Mode"
                    onChange={(e) => onPlayerModeChange(e.target.value as any)}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': { borderColor: '#444' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#666' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--localflix-red)' },
                      '.MuiSvgIcon-root': { color: '#fff' }
                    }}
                  >
                    <MenuItem value="standard">HLS Player</MenuItem>
                    <MenuItem value="qsv">Alt Player</MenuItem>
                    <MenuItem value="direct">MP4 Player</MenuItem>
                  </Select>
                </FormControl>
              </MenuItem>
              <MenuItem disableRipple sx={altPlayerMenuItemSx}>
                <FormControlLabel
                  control={
                    <Switch
                      size="small"
                      checked={useTvMode}
                      onChange={(e) => onToggleTvMode(e.target.checked)}
                      color="secondary"
                    />
                  }
                  label={
                    <Typography variant="body2" sx={altPlayerLabelSx}>
                      TV Mode (JioSphere)
                    </Typography>
                  }
                  sx={formControlLabelSx}
                />
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
