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
  const [currentTime, setCurrentTime] = useState(0);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem("playerVolume");
    return saved ? parseFloat(saved) : 1;
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
  const [subtitleAnchor, setSubtitleAnchor] = useState<null | HTMLElement>(
    null,
  );
  const [audioAnchor, setAudioAnchor] = useState<null | HTMLElement>(null);
  const [speedAnchor, setSpeedAnchor] = useState<null | HTMLElement>(null);

  // Load Metadata
  useEffect(() => {
    let active = true;
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
            t.title.toLowerCase().includes("jpn"),
        );
        if (jpnAudio) {
          setActiveAudio(jpnAudio.index);
        } else {
          setActiveAudio(null);
        }

        // Auto-select English Subtitles if available
        const engSub = meta.subtitles.find(
          (t) =>
            t.language.toLowerCase().includes("eng") ||
            t.language.toLowerCase().includes("english") ||
            t.title.toLowerCase().includes("english") ||
            t.title.toLowerCase().includes("eng"),
        );
        if (engSub) {
          setActiveSubtitle(engSub.index);
        } else {
          setActiveSubtitle(null);
        }
      })
      .catch((err) => {
        console.error("Failed to load video metadata:", err);
      });
    return () => {
      active = false;
    };
  }, [currentVideoPath]);

  // Handle Controls Visibility on Mouse Move
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

    window.addEventListener("mousemove", handleMouseMove);
    handleMouseMove();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearTimeout(timeout);
    };
  }, [isPlaying]);

  // Periodic Progress Reporting to Backend (every 5 seconds)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const interval = setInterval(() => {
      if (isPlaying && video) {
        api.updateProgress(
          currentVideoPath,
          video.currentTime,
          duration || video.duration || 1,
        );
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      if (video) {
        api.updateProgress(
          currentVideoPath,
          video.currentTime,
          duration || video.duration || 1,
        );
      }
    };
  }, [currentVideoPath, isPlaying, duration]);

  const updateBufferedTime = () => {
    const video = videoRef.current;
    if (video && video.buffered && video.buffered.length > 0) {
      let currentBufferedEnd = 0;
      for (let i = 0; i < video.buffered.length; i++) {
        const start = video.buffered.start(i);
        const end = video.buffered.end(i);
        if (video.currentTime >= start && video.currentTime <= end) {
          currentBufferedEnd = end;
          break;
        }
      }
      if (currentBufferedEnd === 0 && video.buffered.length > 0) {
        currentBufferedEnd = video.buffered.end(video.buffered.length - 1);
      }
      setBufferedTime(currentBufferedEnd);
    }
  };

  // Update slider position
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (video) {
      setCurrentTime(video.currentTime);
      currentTimeRef.current = video.currentTime;
      updateBufferedTime();
    }
  };

  const handleProgress = () => {
    updateBufferedTime();
  };

  const handleLoadedMetadata = () => {
    setIsLoading(false);
    if (videoRef.current) {
      if (!duration) {
        setDuration(videoRef.current.duration);
      }
    }
  };

  const handleSeeking = () => {
    setIsLoading(true);
  };

  const handleSeeked = () => {
    setIsLoading(false);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
  };

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
      setIsLoading(false);
    } else {
      setIsLoading(true);
      video
        .play()
        .then(() => {
          setIsLoading(false);
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error("Playback failed:", err);
          setIsLoading(false);
        });
    }
  };

  const handleVideoEnded = () => {
    const video = videoRef.current;
    if (video && duration > 0 && Math.abs(video.currentTime - duration) > 10) {
      // Ignore false ended event triggered by HLS instance destruction/detachment
      return;
    }

    setIsEnded(true);
    setIsPlaying(false);
    api
      .markFinished(currentVideoPath)
      .then(() => setIsLoading(false))
      .catch((err) => console.error(err));
  };

  const handleReplay = () => {
    setIsEnded(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    const video = videoRef.current;
    if (video) {
      setIsLoading(true);
      video.currentTime = 0;
      video
        .play()
        .catch(console.error)
        .finally(() => setIsLoading(false));
    }
  };

  const currentIndex = playlist.indexOf(currentVideoPath);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex !== -1 && currentIndex < playlist.length - 1;

  const playPrevious = () => {
    if (!hasPrevious) return;
    const video = videoRef.current;
    if (video) {
      api
        .updateProgress(
          currentVideoPath,
          video.currentTime,
          duration || video.duration || 1,
        )
        .catch((err) => console.error(err));
    }
    const prevPath = playlist[currentIndex - 1];
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    setIsEnded(false);
    setCurrentVideoPath(prevPath);
    setIsLoading(true);
  };

  const playNext = () => {
    if (!hasNext) return;
    const video = videoRef.current;
    if (video) {
      api
        .updateProgress(
          currentVideoPath,
          video.currentTime,
          duration || video.duration || 1,
        )
        .catch((err) => console.error(err));
    }
    const nextPath = playlist[currentIndex + 1];
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setDuration(0);
    setIsEnded(false);
    setCurrentVideoPath(nextPath);
    setIsLoading(true);
  };

  const cycleAudio = () => {
    if (audioTracks.length === 0) return;
    if (activeAudio === null) {
      selectAudioTrack(audioTracks[0].index);
    } else {
      const currentIdx = audioTracks.findIndex((a) => a.index === activeAudio);
      if (currentIdx === audioTracks.length - 1) {
        selectAudioTrack(null);
      } else {
        selectAudioTrack(audioTracks[currentIdx + 1].index);
      }
    }
  };

  // Seeking logic
  const handleSeek = (
    _e: Event | React.SyntheticEvent,
    newValue: number | number[],
  ) => {
    const targetTime = newValue as number;
    const video = videoRef.current;
    if (!video) return;

    setIsLoading(true);
    video.currentTime = targetTime;
    setCurrentTime(targetTime);
    currentTimeRef.current = targetTime;
  };

  const seekRelative = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    const nextTime = Math.max(
      0,
      Math.min(duration, video.currentTime + seconds),
    );
    setIsLoading(true);
    video.currentTime = nextTime;
    setCurrentTime(nextTime);
    currentTimeRef.current = nextTime;
  };

  // Volume control
  const handleVolumeChange = (
    _e: Event | React.SyntheticEvent,
    newValue: number | number[],
  ) => {
    const v = newValue as number;
    setVolume(v);
    setIsMuted(v === 0);
    localStorage.setItem("playerVolume", v.toString());
    if (videoRef.current) {
      videoRef.current.volume = v;
      videoRef.current.muted = v === 0;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
      videoRef.current.volume = nextMuted ? 0 : volume;
    }
  };

  const adjustVolume = (delta: number) => {
    const nextVolume = Math.max(0, Math.min(1, volume + delta));
    setVolume(nextVolume);
    setIsMuted(nextVolume === 0);
    localStorage.setItem("playerVolume", nextVolume.toString());
    if (videoRef.current) {
      videoRef.current.volume = nextVolume;
      videoRef.current.muted = nextVolume === 0;
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .then(() => {
          setIsFullscreen(true);
        })
        .catch((err) => console.error(err));
    } else {
      document
        .exitFullscreen()
        .then(() => {
          setIsFullscreen(false);
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Speed
  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setSpeedAnchor(null);
  };

  // Subtitles
  const selectSubtitle = (trackIndex: number | null) => {
    setActiveSubtitle(trackIndex);
    setSubtitleAnchor(null);
  };

  const cycleSubtitles = () => {
    if (subtitles.length === 0) return;
    if (activeSubtitle === null) {
      selectSubtitle(subtitles[0].index);
    } else {
      const currentIdx = subtitles.findIndex((s) => s.index === activeSubtitle);
      if (currentIdx === subtitles.length - 1) {
        selectSubtitle(null); // Off
      } else {
        selectSubtitle(subtitles[currentIdx + 1].index);
      }
    }
  };

  // Synchronize subtitle track visibility programmatically
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const syncTracks = () => {
      const textTracks = video.textTracks;
      for (let i = 0; i < textTracks.length; i++) {
        const trackMeta = subtitles[i];
        if (trackMeta && trackMeta.index === activeSubtitle) {
          textTracks[i].mode = "showing";
        } else {
          textTracks[i].mode = "hidden";
        }
      }
    };

    syncTracks();

    const textTracks = video.textTracks;
    textTracks.addEventListener("addtrack", syncTracks);
    return () => {
      textTracks.removeEventListener("addtrack", syncTracks);
    };
  }, [activeSubtitle, subtitles, isLoading]);

  // Sync volume, mute, and speed on stream loads/changes
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.volume = volume;
      video.muted = isMuted;
      video.playbackRate = playbackSpeed;
    }
  }, [volume, isMuted, playbackSpeed, isLoading]);

  // Load HLS Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    setIsEnded(false);
    const resumeTime = currentTimeRef.current;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const playlistUrl = `/api/video/hls/index.m3u8?path=${encodeURIComponent(currentVideoPath)}&audioTrack=${activeAudio ?? ""}&startTime=${resumeTime}&profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(profileToken)}`;

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

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              console.error("Fatal HLS error", data);
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
      api.stopHlsStream(currentVideoPath, activeAudio).catch(console.error);
    };
  }, [currentVideoPath, activeAudio]);

  // Audio track switching
  const selectAudioTrack = (trackIndex: number | null) => {
    setActiveAudio(trackIndex);
    setAudioAnchor(null);
    setIsLoading(true);
  };

  // Picture in Picture
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

  // Format seconds to HH:MM:SS
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
      switch (e.code) {
        case "Space":
        case "KeyK":
          e.preventDefault();
          handlePlayPause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          seekRelative(-10);
          break;
        case "ArrowRight":
          e.preventDefault();
          seekRelative(10);
          break;
        case "ArrowUp":
          e.preventDefault();
          adjustVolume(0.05);
          break;
        case "ArrowDown":
          e.preventDefault();
          adjustVolume(-0.05);
          break;
        case "KeyM":
          e.preventDefault();
          toggleMute();
          break;
        case "KeyF":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "KeyP":
          e.preventDefault();
          togglePictureInPicture();
          break;
        case "KeyS":
        case "KeyJ":
          e.preventDefault();
          cycleSubtitles();
          break;
        case "KeyA":
          e.preventDefault();
          cycleAudio();
          break;
        case "KeyN":
          e.preventDefault();
          if (hasNext) playNext();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    subtitles,
    activeSubtitle,
    activeAudio,
    hasNext,
    playlist,
    currentVideoPath,
  ]);

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
  };
};
