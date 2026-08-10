import { useState, useRef, useEffect, useCallback } from "react";
import { api } from "../api";

export const useSeekThumbnail = (videoPath: string, duration: number) => {
  const [isHovering, setIsHovering] = useState(false);
  const [hoverTime, setHoverTime] = useState<number | null>(null);
  const [hoverPositionX, setHoverPositionX] = useState(0);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);

  const debounceTimerRef = useRef<any>(null);
  const activeHoverTimeRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      if (!rect.width || !duration) return;

      const relativeX = e.clientX - rect.left;
      const pct = Math.max(0, Math.min(1, relativeX / rect.width));
      const targetTime = pct * duration;

      setIsHovering(true);
      setHoverPositionX(relativeX);
      setHoverTime(targetTime);
      activeHoverTimeRef.current = targetTime;

      // Clear previous debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // 1-second Debounce before triggering backend API call
      debounceTimerRef.current = setTimeout(() => {
        if (activeHoverTimeRef.current !== null) {
          const url = api.getHoverThumbnailUrl(
            videoPath,
            activeHoverTimeRef.current,
          );
          setThumbnailUrl(url);
        }
      }, 500);
    },
    [videoPath, duration],
  );

  const handleMouseLeave = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsHovering(false);
    setHoverTime(null);
    setThumbnailUrl(null);
    activeHoverTimeRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isHovering,
    hoverTime,
    hoverPositionX,
    thumbnailUrl,
    handleMouseMove,
    handleMouseLeave,
  };
};
