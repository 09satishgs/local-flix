import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { api } from "../../api";
import type { SubtitleTrack, AudioTrack } from "../../api";

export const useVideoPlayer = (videoPath: string, initialPosition: number) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const profileId = localStorage.getItem("profileId") || "";
  const profileToken = localStorage.getItem("profileToken") || "";

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(initialPosition);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("player_volume");
    return saved !== null ? parseFloat(saved) : 0.8;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isEnded, setIsEnded] = useState(false);

  const [currentVideoPath, setCurrentVideoPath] = useState(videoPath);
  const [playlist, setPlaylist] = useState<string[]>([]);

  // Hls.js instance reference
  const hlsRef = useRef<Hls | null>(null);
  const currentTimeRef = useRef(initialPosition);
  const [subtitles, setSubtitles] = useState<SubtitleTrack[]>([]);
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [activeSubtitle, setActiveSubtitle] = useState<number | null>(null); // absolute stream index
  const [activeAudio, setActiveAudio] = useState<number | null>(null); // relative audio index

  // Menu Anchors
  const [subtitleAnchor, setSubtitleAnchor] = useState<null | HTMLElement>(null);
  const [audioAnchor, setAudioAnchor] = useState<null | HTMLElement>(null);
  const [speedAnchor, setSpeedAnchor] = useState<null | HTMLElement>(null);

  const [loadingMetadata, setLoadingMetadata] = useState(true);
  const networkRetryCountRef = useRef(0);
  const mediaRetryCountRef = useRef(0);

  const [starredSubtitles, setStarredSubtitles] = useState<string[]>(() => {
    const saved = localStorage.getItem("starredSubtitles");
    return saved ? JSON.parse(saved) : [];
  });

  const toggleStarSubtitle = (title: string) => {
    setStarredSubtitles((prev) => {
      const next = prev.includes(title)
        ? prev.filter((t) => t !== title)
        : [...prev, title];
      localStorage.setItem("starredSubtitles", JSON.stringify(next));
      return next;
    });
  };

  // Load Metadata
  useEffect(() => {
    let active = true;
    setLoadingMetadata(true);
    api
      .getVideoMetadata(currentVideoPath)
      .then((meta) => {
        if (!active) return;
        setDuration(meta.duration);
        setSubtitles(meta.subtitles);
        setAudioTracks(meta.audioTracks);
        setPlaylist(meta.playlist || []);

        // Auto-select Japanese Audio if available
        const jpnAudio = meta.audioTracks.find(
          (t) =>
            t.language.toLowerCase().includes("jpn") ||
            t.language.toLowerCase().includes("japanese") ||
            t.title.toLowerCase().includes("japanese") ||
            t.title.toLowerCase().includes("jpn")
        );
        if (jpnAudio) {
          setActiveAudio(jpnAudio.index);
        } else {
          setActiveAudio(null);
        }

        // Auto-select starred subtitle or fallback to the last English track in the array
        const savedStarred = localStorage.getItem("starredSubtitles");
        const starredList: string[] = savedStarred ? JSON.parse(savedStarred) : [];

        let targetSub = null;
        if (starredList.length > 0) {
          targetSub = meta.subtitles.find(s => starredList.includes(s.title));
        }

        if (!targetSub) {
          const engSubs = meta.subtitles.filter(
            (t) =>
              t.language.toLowerCase().includes("eng") ||
              t.language.toLowerCase().includes("english") ||
              t.title.toLowerCase().includes("english") ||
              t.title.toLowerCase().includes("eng")
          );
          if (engSubs.length > 0) {
            targetSub = engSubs[engSubs.length - 1];
          }
        }

        if (targetSub) {
          setActiveSubtitle(targetSub.index);
        } else {
          setActiveSubtitle(null);
        }
        setLoadingMetadata(false);
      })
      .catch((err) => {
        console.error("Failed to load video metadata:", err);
        setLoadingMetadata(false);
      });
    return () => {
      active = false;
    };
  }, [currentVideoPath]);

  // Playlist navigation helpers
  const currentIdx = playlist.indexOf(currentVideoPath);
  const hasPrevious = currentIdx > 0;
  const hasNext = currentIdx >= 0 && currentIdx < playlist.length - 1;

  const syncUrlHash = (newVideoPath: string) => {
    const hash = window.location.hash || "#/";
    const pathname = hash.split("?")[0] || "#/";
    const params = new URLSearchParams(hash.split("?")[1] || "");
    if (newVideoPath) {
      params.set("video", newVideoPath);
      params.set("position", "0");
    } else {
      params.delete("video");
      params.delete("position");
    }
    const queryStr = params.toString();
    window.location.hash = queryStr ? `${pathname}?${queryStr}` : pathname;
  };

  const playPrevious = () => {
    if (hasPrevious) {
      const prevVideo = playlist[currentIdx - 1];
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setDuration(0);
      setIsEnded(false);
      setLoadingMetadata(true);
      setSubtitles([]);
      setAudioTracks([]);
      setActiveSubtitle(null);
      setActiveAudio(null);
      setCurrentVideoPath(prevVideo);
      setIsLoading(true);
      syncUrlHash(prevVideo);
    }
  };

  const playNext = () => {
    if (hasNext) {
      const nextVideo = playlist[currentIdx + 1];
      currentTimeRef.current = 0;
      setCurrentTime(0);
      setDuration(0);
      setIsEnded(false);
      setLoadingMetadata(true);
      setSubtitles([]);
      setAudioTracks([]);
      setActiveSubtitle(null);
      setActiveAudio(null);
      setCurrentVideoPath(nextVideo);
      setIsLoading(true);
      syncUrlHash(nextVideo);
    }
  };

  // Sync volume state to video ref on mount or volume update
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed, isLoading]);

  // Load HLS Stream with subtitle burning toggles
  useEffect(() => {
    if (loadingMetadata) return;

    const video = videoRef.current;
    if (!video) return;

    setIsEnded(false);
    const resumeTime = currentTimeRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const burnParam = activeSubtitle !== null ? "true" : "false";
    const playlistUrl = `/api/video/hls/index.m3u8?path=${encodeURIComponent(currentVideoPath)}&audioTrack=${activeAudio ?? ""}&subtitleTrack=${activeSubtitle ?? ""}&burnSubtitles=${burnParam}&startTime=${resumeTime}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`;

    setIsLoading(true);

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 900,
        maxMaxBufferLength: 1500,
        maxBufferSize: 1024 * 1024 * 1024,
        startPosition: resumeTime,
      });
      hlsRef.current = hls;
      hls.loadSource(playlistUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error)
          .finally(() => {
            setIsLoading(false);
          });
      });

      hls.on(Hls.Events.FRAG_LOADED, () => {
        networkRetryCountRef.current = 0;
        mediaRetryCountRef.current = 0;
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              if (networkRetryCountRef.current < 3) {
                networkRetryCountRef.current += 1;
                console.warn(`HLS Network Error, retrying (${networkRetryCountRef.current}/3)...`);
                hls.startLoad();
              } else {
                console.error("HLS Network Error: Max retry limit reached.");
                setIsLoading(false);
                setIsPlaying(false);
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              if (mediaRetryCountRef.current < 3) {
                mediaRetryCountRef.current += 1;
                console.warn(`HLS Media Error, recovering (${mediaRetryCountRef.current}/3)...`);
                hls.recoverMediaError();
              } else {
                console.error("HLS Media Error: Max recovery limit reached.");
                setIsLoading(false);
                setIsPlaying(false);
              }
              break;
            default:
              console.error("Fatal HLS error", data);
              setIsLoading(false);
              setIsPlaying(false);
              break;
          }
        }
      });
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = playlistUrl;
      const onMetadata = () => {
        if (resumeTime > 0) {
          video.currentTime = resumeTime;
        }
        video
          .play()
          .then(() => setIsPlaying(true))
          .catch(console.error)
          .finally(() => {
            setIsLoading(false);
          });
      };
      video.addEventListener("loadedmetadata", onMetadata);
      return () => {
        video.removeEventListener("loadedmetadata", onMetadata);
      };
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentVideoPath, activeAudio, activeSubtitle, loadingMetadata]);

  // Report watch history ticks
  useEffect(() => {
    if (isLoading || isEnded) return;

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        api.updateProgress(currentVideoPath, video.currentTime, duration || video.duration || 1).catch(console.error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [currentVideoPath, isLoading, isEnded]);

  // UI Event Handlers
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      currentTimeRef.current = video.currentTime;
    }
  };

  const handleProgress = () => {
    const video = videoRef.current;
    if (video && video.buffered.length > 0) {
      setBufferedTime(video.buffered.end(video.buffered.length - 1));
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(console.error);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
    // Mark as fully watched
    api.updateProgress(currentVideoPath, duration, duration || 1).catch(console.error);
    if (hasNext) {
      playNext();
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().then(() => {
        setIsEnded(false);
        setIsPlaying(true);
      }).catch(console.error);
    }
  };

  const handleSeeking = () => setIsLoading(true);
  const handleSeeked = () => setIsLoading(false);
  const handleWaiting = () => setIsLoading(true);
  const handlePlaying = () => setIsLoading(false);

  const handleSeek = (_e: any, value: number | number[]) => {
    const video = videoRef.current;
    if (video) {
      const newTime = Array.isArray(value) ? value[0] : value;
      video.currentTime = newTime;
      setCurrentTime(newTime);
      currentTimeRef.current = newTime;
    }
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (video) {
      const target = Math.max(0, Math.min(duration, video.currentTime + seconds));
      video.currentTime = target;
      setCurrentTime(target);
      currentTimeRef.current = target;
    }
  };

  const handleVolumeChange = (_e: any, value: number | number[]) => {
    const newVol = Array.isArray(value) ? value[0] : value;
    setVolume(newVol);
    localStorage.setItem("player_volume", newVol.toString());
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
      if (newVol > 0 && isMuted) {
        setIsMuted(false);
        video.muted = false;
      }
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      video.muted = nextMute;
    }
  };

  const adjustVolume = (delta: number) => {
    const newVol = Math.max(0, Math.min(1, volume + delta));
    setVolume(newVol);
    localStorage.setItem("player_volume", newVol.toString());
    const video = videoRef.current;
    if (video) {
      video.volume = newVol;
    }
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => setIsFullscreen(true)).catch(console.error);
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(console.error);
    }
  };

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    setSpeedAnchor(null);
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
    }
  };

  const selectSubtitle = (trackIndex: number | null) => {
    const video = videoRef.current;
    if (video) {
      // Capture current playhead position to restart HLS stream from the same point
      currentTimeRef.current = video.currentTime;
    }
    setActiveSubtitle(trackIndex);
    setSubtitleAnchor(null);
    setIsLoading(true);

    if (trackIndex !== null) {
      const track = subtitles.find(s => s.index === trackIndex);
      if (track) {
        localStorage.setItem("preferredSubtitleLanguage", track.language);
        localStorage.setItem("preferredSubtitleTitle", track.title);
      }
    } else {
      localStorage.removeItem("preferredSubtitleLanguage");
      localStorage.removeItem("preferredSubtitleTitle");
    }
  };

  const cycleSubtitles = () => {
    const video = videoRef.current;
    if (video) {
      currentTimeRef.current = video.currentTime;
    }
    setIsLoading(true);

    if (subtitles.length === 0) return;
    if (activeSubtitle === null) {
      selectSubtitle(subtitles[0].index);
    } else {
      const currentIdx = subtitles.findIndex((t) => t.index === activeSubtitle);
      if (currentIdx === subtitles.length - 1) {
        selectSubtitle(null);
      } else {
        selectSubtitle(subtitles[currentIdx + 1].index);
      }
    }
  };

  const selectAudioTrack = (trackIndex: number | null) => {
    const video = videoRef.current;
    if (video) {
      currentTimeRef.current = video.currentTime;
    }
    setActiveAudio(trackIndex);
    setAudioAnchor(null);
    setIsLoading(true);
  };

  const cycleAudio = () => {
    const video = videoRef.current;
    if (video) {
      currentTimeRef.current = video.currentTime;
    }
    setIsLoading(true);

    if (audioTracks.length === 0) return;
    if (activeAudio === null) {
      selectAudioTrack(audioTracks[0].index);
    } else {
      const currentIdx = audioTracks.findIndex((t) => t.index === activeAudio);
      if (currentIdx === audioTracks.length - 1) {
        selectAudioTrack(null);
      } else {
        selectAudioTrack(audioTracks[currentIdx + 1].index);
      }
    }
  };

  const togglePictureInPicture = async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch (e) {
      console.error("Failed to toggle Picture-in-Picture", e);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = Math.floor(secs % 60);

    const mStr = h > 0 && m < 10 ? `0${m}` : `${m}`;
    const sStr = s < 10 ? `0${s}` : `${s}`;

    return h > 0 ? `${h}:${mStr}:${sStr}` : `${mStr}:${sStr}`;
  };

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore keys if inside an input/textarea
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          handlePlayPause();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "arrowright":
          e.preventDefault();
          seekRelative(10);
          break;
        case "j":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "l":
          e.preventDefault();
          seekRelative(10);
          break;
        case "arrowup":
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case "arrowdown":
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        case "c":
          e.preventDefault();
          cycleSubtitles();
          break;
        case "v":
          e.preventDefault();
          cycleAudio();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [volume, isMuted, playbackSpeed, subtitles, activeSubtitle, audioTracks, activeAudio]);

  // Controls Visibility Handler
  useEffect(() => {
    let timeout: any;
    const handleMouseMove = () => {
      setShowControls(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  return {
    videoRef,
    containerRef,
    profileId,
    profileToken,
    isPlaying,
    setIsPlaying,
    duration,
    currentTime,
    bufferedTime,
    volume,
    isMuted,
    isLoading,
    setIsLoading,
    playbackSpeed,
    showControls,
    isFullscreen,
    isEnded,
    currentVideoPath,
    playlist,
    subtitles,
    audioTracks,
    activeSubtitle,
    activeAudio,
    subtitleAnchor,
    setSubtitleAnchor,
    audioAnchor,
    setAudioAnchor,
    speedAnchor,
    setSpeedAnchor,
    handleTimeUpdate,
    handleProgress,
    handleLoadedMetadata,
    handlePlayPause,
    handleVideoEnded,
    handleReplay,
    handleSeeking,
    handleSeeked,
    handleWaiting,
    handlePlaying,
    hasPrevious,
    hasNext,
    playPrevious,
    playNext,
    cycleAudio,
    handleSeek,
    seekRelative,
    handleVolumeChange,
    toggleMute,
    adjustVolume,
    toggleFullscreen,
    handleSpeedSelect,
    selectSubtitle,
    cycleSubtitles,
    selectAudioTrack,
    togglePictureInPicture,
    formatTime,
    starredSubtitles,
    toggleStarSubtitle,
  };
};
