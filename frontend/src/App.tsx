import { useState, useEffect } from "react";
import { ProfileSelector } from "./components/ProfileSelector";
import { VideoPlayer } from "./components/VideoPlayer";
import { AltVideoPlayer } from "./components/AltVideoPlayer";
import { TVPlayer } from "./components/TVPlayer";
import { ModeSelector } from "./components/ModeSelector";
import { DebugToast } from "./components/DebugToast";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { WebLayout } from "./layouts/WebLayout";
import { MobileLayout } from "./layouts/MobileLayout";
import { Router } from "./Router";
import { useTvNavigation } from "./hooks/useTvNavigation";
import { ViewModeProvider, useViewMode } from "./context/ViewModeContext";

import type { SxProps, Theme } from "@mui/material";

type Page = "home" | "explorer" | "history";
export type PlayerChoice = "hls" | "alt" | "tv";

const AVATAR_COLORS = ["#1e90ff", "#e50914", "#2ecc71", "#f1c40f", "#9b59b6"];

const appContainerSx: SxProps<Theme> = { minHeight: "100vh", bgcolor: "var(--bg-dark)" };

interface RouteState {
  page: Page;
  path: string;
  videoPath: string | null;
  videoPosition: number;
  playerType: PlayerChoice | null;
}

const parseHash = (): RouteState => {
  const hash = window.location.hash || "#/";
  const pathWithQuery = hash.slice(1);
  const [pathname, queryString] = pathWithQuery.split("?");
  
  const searchParams = new URLSearchParams(queryString || "");
  const path = searchParams.get("path") || "";
  const videoPath = searchParams.get("video") || null;
  const videoPosition = parseInt(searchParams.get("position") || "0", 10);
  const playerParam = searchParams.get("player");
  const playerType: PlayerChoice | null =
    playerParam === "hls" || playerParam === "alt" || playerParam === "tv"
      ? playerParam
      : null;

  let page: Page = "home";
  if (pathname === "/history") {
    page = "history";
  } else if (pathname === "/explorer") {
    page = "explorer";
  }

  return { page, path, videoPath, videoPosition, playerType };
};

const navigateTo = (
  page: Page,
  path: string,
  videoPath: string | null,
  position: number = 0,
  playerType?: PlayerChoice | null
) => {
  const pathname = page === "home" ? "/" : `/${page}`;
  const params = new URLSearchParams();
  if (path) {
    params.set("path", path);
  }
  if (videoPath) {
    params.set("video", videoPath);
    params.set("position", position.toString());
    if (playerType) {
      params.set("player", playerType);
    }
  }

  const queryStr = params.toString();
  window.location.hash = queryStr ? `${pathname}?${queryStr}` : pathname;
};

const isMp4 = (filePath: string) => /\.(mp4|m4v)$/i.test(filePath);

function AppContent() {
  const { viewMode, setViewMode, isMobileView, isTvView } = useViewMode();

  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  
  const [useAltPlayer, setUseAltPlayer] = useState(() => localStorage.getItem("useAltPlayer") === "true");
  const [debugToastEnabled, setDebugToastEnabledState] = useState(() => localStorage.getItem("debugToastEnabled") === "true");

  const handleToggleAltPlayer = (val: boolean) => {
    setUseAltPlayer(val);
    localStorage.setItem("useAltPlayer", val ? "true" : "false");
  };

  const handleToggleDebugToast = (val: boolean) => {
    setDebugToastEnabledState(val);
    localStorage.setItem("debugToastEnabled", val ? "true" : "false");
    window.dispatchEvent(new CustomEvent("localflix-debug-toggle", { detail: { enabled: val } }));
  };

  const [route, setRoute] = useState<RouteState>(parseHash());

  useTvNavigation({
    enabled: isTvView,
    activeVideoPath: route.videoPath,
    activePage: route.page,
    explorerPath: route.path,
    onClosePlayer: () => navigateTo(route.page, route.path, null),
    onNavigateFolder: (path) => navigateTo("explorer", path, null),
    onPageChange: (page) => navigateTo(page, "", null),
  });

  // Listen for hash changes to sync routing state
  useEffect(() => {
    const handleHashChange = () => {
      setRoute(parseHash());
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Fetch logged in profile on load
  useEffect(() => {
    const savedId = localStorage.getItem("profileId");
    const savedName = localStorage.getItem("profileName");
    if (savedId && savedName) {
      setProfileId(savedId);
      setProfileName(savedName);
    }
  }, []);

  const handleProfileSelected = (id: string, name: string) => {
    setProfileId(id);
    setProfileName(name);
    // Clear out any old parameters and go home on login
    navigateTo("home", "", null);
  };

  const handleLogout = () => {
    localStorage.removeItem("profileId");
    localStorage.removeItem("profileName");
    localStorage.removeItem("profileToken");
    setProfileId(null);
    setProfileName(null);
    window.location.hash = "";
  };

  const handlePlayVideo = (path: string, position: number, playerType?: PlayerChoice) => {
    navigateTo(route.page, route.path, path, position, playerType);
  };

  const handleNavigateToFolder = (path: string) => {
    navigateTo("explorer", path, null);
  };

  const handlePageChange = (page: Page) => {
    // Reset folder path when clicking Explorer menu button directly,
    // so it starts from the root allowed paths.
    navigateTo(page, "", null);
  };

  // Get index for avatar color
  const getAvatarColor = () => {
    if (!profileName) return "#e50914";
    const charCode =
      profileName.charCodeAt(0) + (profileName.charCodeAt(1) || 0);
    return AVATAR_COLORS[charCode % AVATAR_COLORS.length];
  };

  // 1. First-time experience selection
  if (!viewMode) {
    return <ModeSelector onSelectMode={setViewMode} currentMode={viewMode} />;
  }

  // 2. Profile selection if not logged in
  if (!profileId) {
    return <ProfileSelector onProfileSelected={handleProfileSelected} />;
  }

  const Layout = isMobileView ? MobileLayout : WebLayout;

  // Player Resolution logic
  const effectivePlayer: PlayerChoice =
    route.playerType || (isTvView ? "tv" : useAltPlayer ? "alt" : "hls");

  // Non-MP4 check for TV mode or explicit TV Player selection
  const isTargetingTvPlayer = Boolean(route.videoPath && effectivePlayer === "tv");
  const isVideoNonMp4 = Boolean(route.videoPath && !isMp4(route.videoPath));
  const showNonMp4Dialog = isTargetingTvPlayer && isVideoNonMp4;

  return (
    <Box sx={appContainerSx} data-style="appContainerSx">
      <Layout
        activePage={route.page}
        onPageChange={handlePageChange}
        profileName={profileName}
        avatarColor={getAvatarColor()}
        useAltPlayer={useAltPlayer}
        onToggleAltPlayer={handleToggleAltPlayer}
        debugToastEnabled={debugToastEnabled}
        onToggleDebugToast={handleToggleDebugToast}
        onLogout={handleLogout}
      >
        <Router
          activePage={route.page}
          explorerPath={route.path}
          onPlayVideo={handlePlayVideo}
          onNavigateToPath={handleNavigateToFolder}
        />
      </Layout>

      {/* Non-MP4 Format Dialog for TV Mode */}
      <Dialog
        open={showNonMp4Dialog}
        onClose={() => navigateTo(route.page, route.path, null)}
        PaperProps={{
          sx: {
            bgcolor: "#181818",
            color: "#fff",
            border: "2px solid var(--localflix-red)",
            borderRadius: 3,
            p: 1.5,
            maxWidth: 480,
            width: "90vw",
          },
        }}
      >
        <DialogTitle sx={{ color: "#fff", fontWeight: 700, display: "flex", alignItems: "center", gap: 1.5 }}>
          <WarningAmberIcon sx={{ fontSize: 30, color: "var(--localflix-red)" }} />
          Non-MP4 Video Format
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ color: "#fff", mb: 1, fontWeight: 700 }}>
            {route.videoPath?.replace(/\\/g, "/").split("/").pop()}
          </Typography>
          <Typography variant="body2" sx={{ color: "var(--text-secondary)", mb: 2 }}>
            The TV MP4 Player is optimized for direct MP4 streaming. For MKV, TS, and other formats, please choose one of the alternative streaming players:
          </Typography>
        </DialogContent>
        <DialogActions sx={{ flexDirection: "column", gap: 1.5, px: 3, pb: 2 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() =>
              navigateTo(route.page, route.path, route.videoPath, route.videoPosition, "hls")
            }
            sx={{
              bgcolor: "var(--localflix-red)",
              "&:hover, &:focus": { bgcolor: "var(--localflix-dark-red)" },
              py: 1.2,
              fontWeight: 700,
            }}
            data-focusable="true"
            tabIndex={0}
          >
            Play with HLS Player (Standard)
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={() =>
              navigateTo(route.page, route.path, route.videoPath, route.videoPosition, "alt")
            }
            sx={{
              borderColor: "#555",
              color: "#fff",
              "&:hover, &:focus": { borderColor: "#fff", bgcolor: "rgba(255,255,255,0.08)" },
              py: 1.2,
              fontWeight: 700,
            }}
            data-focusable="true"
            tabIndex={0}
          >
            Play with Alt Player
          </Button>
          <Button
            fullWidth
            onClick={() => navigateTo(route.page, route.path, null)}
            sx={{ color: "var(--text-secondary)", "&:hover, &:focus": { color: "#fff" } }}
            data-focusable="true"
            tabIndex={0}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Fullscreen Video Player Overlay */}
      {route.videoPath && !showNonMp4Dialog && (
        effectivePlayer === "tv" ? (
          <TVPlayer
            key={`${route.videoPath}_${route.videoPosition}_tv`}
            videoPath={route.videoPath}
            initialPosition={route.videoPosition}
            onClose={() => {
              // Remove video param and preserve current page and explorer path
              navigateTo(route.page, route.path, null);
              // Refresh window locations/data triggers on close to reflect progress updates
              window.dispatchEvent(new Event("playback-closed"));
            }}
          />
        ) : effectivePlayer === "alt" ? (
          <AltVideoPlayer
            key={`${route.videoPath}_${route.videoPosition}_alt`}
            videoPath={route.videoPath}
            initialPosition={route.videoPosition}
            onClose={() => {
              // Remove video param and preserve current page and explorer path
              navigateTo(route.page, route.path, null);
              // Refresh window locations/data triggers on close to reflect progress updates
              window.dispatchEvent(new Event("playback-closed"));
            }}
          />
        ) : (
          <VideoPlayer
            key={`${route.videoPath}_${route.videoPosition}_hls`}
            videoPath={route.videoPath}
            initialPosition={route.videoPosition}
            onClose={() => {
              // Remove video param and preserve current page and explorer path
              navigateTo(route.page, route.path, null);
              // Refresh window locations/data triggers on close to reflect progress updates
              window.dispatchEvent(new Event("playback-closed"));
            }}
          />
        )
      )}
    </Box>
  );
}

function App() {
  return (
    <ViewModeProvider>
      <AppContent />
      <DebugToast />
    </ViewModeProvider>
  );
}

export default App;
