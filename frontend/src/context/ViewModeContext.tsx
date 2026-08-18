import React, { createContext, useContext, useState, useEffect } from "react";

export type ViewMode = "web" | "mobile" | "tv";

interface ViewModeContextType {
  viewMode: ViewMode | null;
  setViewMode: (mode: ViewMode) => void;
  resetViewMode: () => void;
  isMobileView: boolean;
  isTvView: boolean;
  isWebView: boolean;
}

const STORAGE_KEY = "appViewMode";

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export const ViewModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewMode, setViewModeState] = useState<ViewMode | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "web" || saved === "mobile" || saved === "tv") {
      return saved;
    }
    return null;
  });

  const setViewMode = (mode: ViewMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setViewModeState(mode);
  };

  const resetViewMode = () => {
    localStorage.removeItem(STORAGE_KEY);
    setViewModeState(null);
  };

  useEffect(() => {
    if (viewMode === "tv") {
      document.body.classList.add("tv-mode-active");
    } else {
      document.body.classList.remove("tv-mode-active");
    }
  }, [viewMode]);

  const value: ViewModeContextType = {
    viewMode,
    setViewMode,
    resetViewMode,
    isMobileView: viewMode === "mobile",
    isTvView: viewMode === "tv",
    isWebView: viewMode === "web",
  };

  return (
    <ViewModeContext.Provider value={value}>
      {children}
    </ViewModeContext.Provider>
  );
};

export const useViewMode = (): ViewModeContextType => {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }
  return context;
};
