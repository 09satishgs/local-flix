import { useEffect } from "react";
import { logDebug } from "../utils/debugLogger";

interface TvNavigationOptions {
  enabled: boolean;
  activeVideoPath: string | null;
  activePage: "home" | "explorer" | "history";
  explorerPath: string;
  onClosePlayer: () => void;
  onNavigateFolder: (path: string) => void;
  onPageChange: (page: "home" | "explorer" | "history") => void;
}

export const useTvNavigation = ({
  enabled,
  activeVideoPath,
  activePage,
  explorerPath,
  onClosePlayer,
  onNavigateFolder,
  onPageChange,
}: TvNavigationOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const getFocusables = (): HTMLElement[] => {
      const selector =
        'button, a, [tabindex="0"], input, select, textarea, .MuiSlider-thumb, [data-focusable="true"]';
      const nodes = Array.from(document.querySelectorAll<HTMLElement>(selector));
      return nodes.filter((el) => {
        if (el.getAttribute("tabindex") === "-1" || el.hasAttribute("disabled")) {
          return false;
        }
        const rect = el.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          window.getComputedStyle(el).visibility !== "hidden" &&
          window.getComputedStyle(el).display !== "none"
        );
      });
    };

    const navigateSpatial = (direction: "up" | "down" | "left" | "right") => {
      const focusables = getFocusables();
      if (focusables.length === 0) return;

      const current = document.activeElement as HTMLElement;
      if (!current || current === document.body || !focusables.includes(current)) {
        focusables[0].focus();
        return;
      }

      const curRect = current.getBoundingClientRect();
      const curCenter = {
        x: curRect.left + curRect.width / 2,
        y: curRect.top + curRect.height / 2,
      };

      let candidates = focusables.filter((el) => el !== current);

      candidates = candidates.filter((el) => {
        const r = el.getBoundingClientRect();
        switch (direction) {
          case "up":
            return r.top < curRect.top;
          case "down":
            return r.top > curRect.top;
          case "left":
            return r.left < curRect.left;
          case "right":
            return r.left > curRect.left;
          default:
            return false;
        }
      });

      if (candidates.length === 0) return;

      let best: HTMLElement | null = null;
      let minScore = Infinity;

      candidates.forEach((el) => {
        const r = el.getBoundingClientRect();
        const candCenter = {
          x: r.left + r.width / 2,
          y: r.top + r.height / 2,
        };

        const dx = candCenter.x - curCenter.x;
        const dy = candCenter.y - curCenter.y;

        let primaryDist = 0;
        let secondaryDist = 0;

        if (direction === "up" || direction === "down") {
          primaryDist = Math.abs(dy);
          secondaryDist = Math.abs(dx);
        } else {
          primaryDist = Math.abs(dx);
          secondaryDist = Math.abs(dy);
        }

        // Weighted distance penalizing off-axis elements
        const score = primaryDist + secondaryDist * 2.5;

        if (score < minScore) {
          minScore = score;
          best = el;
        }
      });

      if (best) {
        (best as HTMLElement).focus();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      const code = e.code;
      const key = e.key;
      const keyCode = e.keyCode;
      const which = e.which;

      // Debug logging on every remote keypress
      logDebug(`key: "${key}" | code: "${code}" | keyCode: ${keyCode} | which: ${which}`);

      // Spatial Navigation
      if (code === "ArrowUp" || key === "ArrowUp" || keyCode === 38) {
        e.preventDefault();
        navigateSpatial("up");
        return;
      }
      if (code === "ArrowDown" || key === "ArrowDown" || keyCode === 40) {
        e.preventDefault();
        navigateSpatial("down");
        return;
      }
      if (code === "ArrowLeft" || key === "ArrowLeft" || keyCode === 37) {
        e.preventDefault();
        navigateSpatial("left");
        return;
      }
      if (code === "ArrowRight" || key === "ArrowRight" || keyCode === 39) {
        e.preventDefault();
        navigateSpatial("right");
        return;
      }

      // Enter / Select Key
      if (code === "Enter" || code === "NumpadEnter" || key === "Enter" || keyCode === 13) {
        const active = document.activeElement as HTMLElement;
        if (active && active !== document.body && typeof active.click === "function") {
          active.click();
        }
        return;
      }

      // TV Remote Back Button (Backspace, Escape, GoBack, Code 10009)
      if (
        code === "Escape" ||
        code === "Backspace" ||
        key === "GoBack" ||
        key === "Back" ||
        keyCode === 10009 ||
        keyCode === 27 ||
        keyCode === 8
      ) {
        // Prevent default browser back navigation when handling in-app back
        e.preventDefault();

        if (activeVideoPath) {
          onClosePlayer();
          return;
        }

        if (activePage === "explorer" && explorerPath) {
          const parts = explorerPath.replace(/\\/g, "/").split("/").filter(Boolean);
          parts.pop();
          const parentPath = parts.join("/");
          onNavigateFolder(parentPath);
          return;
        }

        if (activePage !== "home") {
          onPageChange("home");
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    enabled,
    activeVideoPath,
    activePage,
    explorerPath,
    onClosePlayer,
    onNavigateFolder,
    onPageChange,
  ]);
};
