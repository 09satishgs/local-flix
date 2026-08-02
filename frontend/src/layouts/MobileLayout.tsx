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
} from "@mui/material";
import {
  Home as HomeIcon,
  Folder as FolderIcon,
  History as HistoryIcon,
  SwitchAccount as SwitchAccountIcon,
} from "@mui/icons-material";

interface LayoutProps {
  activePage: "home" | "explorer" | "history";
  onPageChange: (page: "home" | "explorer" | "history") => void;
  profileName: string | null;
  avatarColor: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export const MobileLayout: React.FC<LayoutProps> = ({
  activePage,
  onPageChange,
  profileName,
  avatarColor,
  onLogout,
  children,
}) => {
  const [profileMenuAnchor, setProfileMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "var(--bg-dark)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        pb: "64px", // height of bottom navigation
      }}
    >
      {/* Mobile Top Header */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "rgba(20,20,20,0.95)",
          backgroundImage: "none",
          boxShadow: "none",
          borderBottom: "1px solid #1f1f1f",
          backdropFilter: "blur(10px)",
          zIndex: 100,
        }}
      >
        <Toolbar
          sx={{
            px: 2,
            display: "flex",
            justifyContent: "space-between",
            minHeight: 56,
          }}
        >
          <Typography
            variant="h6"
            onClick={() => onPageChange("home")}
            sx={{
              color: "var(--localflix-red)",
              fontWeight: 900,
              letterSpacing: 2,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              textTransform: "uppercase",
              fontSize: "1.3rem",
            }}
          >
            LocalFlix
          </Typography>

          <Box
            onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              p: 0.5,
              borderRadius: 1,
            }}
          >
            <Avatar
              sx={{
                width: 30,
                height: 30,
                bgcolor: avatarColor,
                fontSize: "0.85rem",
                fontWeight: 700,
                borderRadius: 0.75,
              }}
            >
              {profileName?.slice(0, 2).toUpperCase()}
            </Avatar>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
              PaperProps={{
                sx: {
                  bgcolor: "var(--bg-card)",
                  color: "#fff",
                  border: "1px solid #333",
                  mt: 1,
                  minWidth: 150,
                },
              }}
            >
              <MenuItem onClick={onLogout} sx={{ gap: 1.5 }}>
                <SwitchAccountIcon
                  fontSize="small"
                  sx={{ color: "var(--text-secondary)" }}
                />
                <Typography variant="body2">Switch Profile</Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content Area */}
      <Box sx={{ flexGrow: 1 }}>
        {children}
      </Box>

      {/* Bottom Navigation Bar */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderTop: "1px solid #1f1f1f",
        }}
        elevation={3}
      >
        <BottomNavigation
          value={activePage}
          onChange={(_event, newValue) => {
            onPageChange(newValue);
          }}
          sx={{
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
          }}
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
