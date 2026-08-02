import React from "react";
import { Home } from "./components/Home";
import { Explorer } from "./components/Explorer";
import { History } from "./components/History";

interface RouterProps {
  activePage: "home" | "explorer" | "history";
  explorerPath: string;
  onPlayVideo: (path: string, position: number) => void;
  onNavigateToPath: (path: string) => void;
}

export const Router: React.FC<RouterProps> = ({
  activePage,
  explorerPath,
  onPlayVideo,
  onNavigateToPath,
}) => {
  switch (activePage) {
    case "home":
      return <Home onPlayVideo={onPlayVideo} onNavigateToPath={onNavigateToPath} />;
    case "explorer":
      return (
        <Explorer
          key={explorerPath} // Force complete fresh mount when folder path changes
          initialPath={explorerPath}
          onPlayVideo={onPlayVideo}
        />
      );
    case "history":
      return <History onPlayVideo={onPlayVideo} />;
    default:
      return null;
  }
};
