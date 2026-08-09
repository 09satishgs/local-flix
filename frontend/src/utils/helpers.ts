/**
 * Formats time in seconds to a readable string (HH:MM:SS or MM:SS)
 */
export const formatTime = (secs: number): string => {
  if (isNaN(secs) || secs < 0) return "0:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = Math.floor(secs % 60);

  const mStr = h > 0 && m < 10 ? `0${m}` : `${m}`;
  const sStr = s < 10 ? `0${s}` : `${s}`;

  return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
};

/**
 * Synchronizes the URL hash state with the currently playing video path
 */
export const syncUrlHash = (newVideoPath: string): void => {
  const hash = window.location.hash || "#/";
  const pathname = hash.split("?")[0] || "#/";
  const params = new URLSearchParams(hash.split("?")[1] || "");
  if (newVideoPath) {
    params.set("video", newVideoPath);
    params.delete("position");
  } else {
    params.delete("video");
    params.delete("position");
  }
  const queryStr = params.toString();
  window.location.hash = queryStr ? `${pathname}?${queryStr}` : pathname;
};
