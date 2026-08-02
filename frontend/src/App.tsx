import { useState, useEffect } from "react";
import { ProfileSelector } from "./components/ProfileSelector";
import { VideoPlayer } from "./components/VideoPlayer";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import { WebLayout } from "./layouts/WebLayout";
import { MobileLayout } from "./layouts/MobileLayout";
import { Router } from "./Router";

type Page = "home" | "explorer" | "history";

const AVATAR_COLORS = ["#1e90ff", "#e50914", "#2ecc71", "#f1c40f", "#9b59b6"];

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [profileId, setProfileId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [activePage, setActivePage] = useState<Page>("home");
  const [explorerPath, setExplorerPath] = useState<string>("");

  // Video playback overlays
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [videoPosition, setVideoPosition] = useState(0);

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
    setActivePage("home");
    setExplorerPath("");
  };

  const handleLogout = () => {
    localStorage.removeItem("profileId");
    localStorage.removeItem("profileName");
    localStorage.removeItem("profileToken");
    setProfileId(null);
    setProfileName(null);
    setActivePage("home");
    setExplorerPath("");
  };

  const handlePlayVideo = (path: string, position: number) => {
    setVideoPosition(position);
    setActiveVideo(path);
  };

  const handleNavigateToFolder = (path: string) => {
    setExplorerPath(path);
    setActivePage("explorer");
  };

  const handlePageChange = (page: Page) => {
    // Reset folder path when clicking Explorer menu button directly,
    // so it starts from the root allowed paths.
    if (page === "explorer") {
      setExplorerPath("");
    }
    setActivePage(page);
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
        activePage={activePage}
        onPageChange={handlePageChange}
        profileName={profileName}
        avatarColor={getAvatarColor()}
        onLogout={handleLogout}
      >
        <Router
          activePage={activePage}
          explorerPath={explorerPath}
          onPlayVideo={handlePlayVideo}
          onNavigateToPath={handleNavigateToFolder}
        />
      </Layout>

      {/* Custom Fullscreen Video Player Overlay */}
      {activeVideo && (
        <VideoPlayer
          videoPath={activeVideo}
          initialPosition={videoPosition}
          onClose={() => {
            setActiveVideo(null);
            setVideoPosition(0);
            // Refresh window locations/data triggers on close to reflect progress updates
            window.dispatchEvent(new Event("playback-closed"));
          }}
        />
      )}
    </Box>
  );
}

export default App;
