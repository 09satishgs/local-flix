import { useState, useEffect } from "react";
import { ProfileSelector } from "./components/ProfileSelector";
import { VideoPlayer } from "./components/VideoPlayer";
import { AltVideoPlayer } from "./components/AltVideoPlayer";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { WebLayout } from "./layouts/WebLayout";
import { MobileLayout } from "./layouts/MobileLayout";
import { Router } from "./Router";

type Page = "home" | "explorer" | "history";

const AVATAR_COLORS = ["#1e90ff", "#e50914", "#2ecc71", "#f1c40f", "#9b59b6"];

interface RouteState {
  page: Page;
  path: string;
  videoPath: string | null;
  videoPosition: number;
}

const parseHash = (): RouteState => {
  const hash = window.location.hash || "#/";
  const pathWithQuery = hash.slice(1);
  const [pathname, queryString] = pathWithQuery.split("?");
  
  const searchParams = new URLSearchParams(queryString || "");
  const path = searchParams.get("path") || "";
  const videoPath = searchParams.get("video") || null;
  const videoPosition = parseInt(searchParams.get("position") || "0", 10);

  let page: Page = "home";
  if (pathname === "/history") {
    page = "history";
  } else if (pathname === "/explorer") {
    page = "explorer";
  }

  return { page, path, videoPath, videoPosition };
};

const navigateTo = (page: Page, path: string, videoPath: string | null, position: number = 0) => {
  const pathname = page === "home" ? "/" : `/${page}`;
  const params = new URLSearchParams();
  if (path) {
    params.set("path", path);
  }
  if (videoPath) {
    params.set("video", videoPath);
  }
  if (position > 0) {
    params.set("position", position.toString());
  }

  const queryStr = params.toString();
  window.location.hash = queryStr ? `${pathname}?${queryStr}` : pathname;
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  
  const [useAltPlayer, setUseAltPlayer] = useState(() => localStorage.getItem("useAltPlayer") === "true");

  const handleToggleAltPlayer = (val: boolean) => {
    setUseAltPlayer(val);
    localStorage.setItem("useAltPlayer", val ? "true" : "false");
  };
  
  const [route, setRoute] = useState<RouteState>(parseHash());

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

  const handlePlayVideo = (path: string, position: number) => {
    navigateTo(route.page, route.path, path, position);
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

  if (!profileId) {
    return <ProfileSelector onProfileSelected={handleProfileSelected} />;
  }

  const Layout = isMobile ? MobileLayout : WebLayout;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "var(--bg-dark)" }}>
      <Layout
        activePage={route.page}
        onPageChange={handlePageChange}
        profileName={profileName}
        avatarColor={getAvatarColor()}
        useAltPlayer={useAltPlayer}
        onToggleAltPlayer={handleToggleAltPlayer}
        onLogout={handleLogout}
      >
        <Router
          activePage={route.page}
          explorerPath={route.path}
          onPlayVideo={handlePlayVideo}
          onNavigateToPath={handleNavigateToFolder}
        />
      </Layout>

      {/* Custom Fullscreen Video Player Overlay */}
      {route.videoPath && (
        useAltPlayer ? (
          <AltVideoPlayer
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

export default App;
