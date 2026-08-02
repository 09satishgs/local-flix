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
} from "@mui/material";
import SwitchAccountIcon from "@mui/icons-material/SwitchAccount";

interface LayoutProps {
  activePage: "home" | "explorer" | "history";
  onPageChange: (page: "home" | "explorer" | "history") => void;
  profileName: string | null;
  avatarColor: string;
  onLogout: () => void;
  children: React.ReactNode;
}

export const WebLayout: React.FC<LayoutProps> = ({
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
      }}
    >
      {/* Navigation Navbar */}
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
            px: { xs: 2, md: 6 },
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          {/* Logo & Navigation Links */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Typography
              variant="h5"
              onClick={() => onPageChange("home")}
              sx={{
                color: "var(--localflix-red)",
                fontWeight: 900,
                letterSpacing: 2,
                cursor: "pointer",
                fontFamily: "'Outfit', sans-serif",
                textTransform: "uppercase",
                mr: 2,
                fontSize: "1.8rem",
              }}
            >
              LocalFlix
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => onPageChange("home")}
                sx={{
                  color: activePage === "home" ? "#fff" : "var(--text-secondary)",
                  fontWeight: activePage === "home" ? 700 : 500,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Home
              </Button>
              <Button
                onClick={() => onPageChange("explorer")}
                sx={{
                  color: activePage === "explorer" ? "#fff" : "var(--text-secondary)",
                  fontWeight: activePage === "explorer" ? 700 : 500,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                Files
              </Button>
              <Button
                onClick={() => onPageChange("history")}
                sx={{
                  color: activePage === "history" ? "#fff" : "var(--text-secondary)",
                  fontWeight: activePage === "history" ? 700 : 500,
                  textTransform: "none",
                  fontSize: "1rem",
                }}
              >
                History
              </Button>
            </Box>
          </Box>

          {/* User Profile Info & Switch Account */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              onClick={(e) => setProfileMenuAnchor(e.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                cursor: "pointer",
                p: 0.5,
                borderRadius: 2,
                transition: "var(--transition-smooth)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.05)" },
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: avatarColor,
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  borderRadius: 1,
                }}
              >
                {profileName?.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#fff",
                }}
              >
                {profileName}
              </Typography>
            </Box>

            <Menu
              anchorEl={profileMenuAnchor}
              open={Boolean(profileMenuAnchor)}
              onClose={() => setProfileMenuAnchor(null)}
              PaperProps={{
                sx: {
                  bgcolor: "var(--bg-card)",
                  color: "#fff",
                  border: "1px solid #333",
                  mt: 1.5,
                  minWidth: 160,
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
      <Box sx={{ flexGrow: 1, py: 2 }}>
        {children}
      </Box>
    </Box>
  );
};
