import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { ExplorerItem, SearchImageResult, VideoMetadata, ConversionJob } from '../../api';

export const useExplorer = (initialPath: string, playerMode: "standard" | "qsv" | "direct") => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);

  // Conversion states
  const [conversionDialogOpen, setConversionDialogOpen] = useState(false);
  const [conversionTargetItem, setConversionTargetItem] = useState<ExplorerItem | null>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [meta, setMeta] = useState<VideoMetadata | null>(null);
  const [selectedAudio, setSelectedAudio] = useState('');
  const [selectedSubtitle, setSelectedSubtitle] = useState('none');
  const [activeJobs, setActiveJobs] = useState<ConversionJob[]>([]);

  // Pin dialog states
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinTargetItem, setPinTargetItem] = useState<ExplorerItem | null>(null);
  const [pinTitle, setPinTitle] = useState('');
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchImageResult[]>([]);
  const [searchingImages, setSearchingImages] = useState(false);
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null);

  const isPathAllowed = (pathStr: string) => {
    if (!pathStr) return true; // roots are always allowed to list
    let cleanPath = pathStr.replace(/\\/g, '/').toLowerCase();
    if (cleanPath.endsWith('/')) {
      cleanPath = cleanPath.slice(0, -1);
    }
    return allowedPaths.some(allowed => {
      let cleanAllowed = allowed.replace(/\\/g, '/').toLowerCase();
      if (cleanAllowed.endsWith('/')) {
        cleanAllowed = cleanAllowed.slice(0, -1);
      }
      return cleanPath === cleanAllowed || cleanPath.startsWith(cleanAllowed + '/');
    });
  };

  const loadDirectory = async (pathStr: string) => {
    setLoading(true);
    try {
      const data = await api.getExplorer(pathStr);
      setCurrentPath(data.currentPath);
      setItems(data.items);
    } catch (err) {
      console.error('Failed to load directory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.getCurrentProfile()
      .then(profile => {
        setAllowedPaths(profile.allowedPaths || []);
      })
      .catch(err => console.error('Failed to fetch profile details:', err));
  }, []);

  useEffect(() => {
    loadDirectory(initialPath);
  }, [initialPath]);

  // Poll conversions status
  useEffect(() => {
    const fetchStatus = () => {
      api.getConversionStatus()
        .then(jobs => {
          // Check if any job transitioned to completed to refresh file list
          const isNowDone = jobs.some(j => j.status === 'completed' && activeJobs.find(x => x.videoPath === j.videoPath)?.status === 'processing');
          
          if (isNowDone) {
            loadDirectory(currentPath);
          }
          setActiveJobs(jobs);
        })
        .catch(err => console.error(err));
    };

    fetchStatus(); // initial check

    const interval = setInterval(() => {
      fetchStatus();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentPath, activeJobs.length]);

  useEffect(() => {
    const handlePlaybackClosed = () => {
      loadDirectory(currentPath);
    };
    window.addEventListener('playback-closed', handlePlaybackClosed);
    return () => {
      window.removeEventListener('playback-closed', handlePlaybackClosed);
    };
  }, [currentPath]);

  const handleFolderClick = (pathStr: string) => {
    setSearchQuery('');
    loadDirectory(pathStr);
  };

  const handleBackClick = () => {
    if (!currentPath) return;

    // Find parent directory (supporting Windows paths)
    const separator = currentPath.includes('\\') ? '\\' : '/';
    const parts = currentPath.split(separator);
    parts.pop(); // remove last element
    const parentPath = parts.join(separator);

    let loadPath = parentPath;
    if (parentPath.endsWith(':')) {
      loadPath = parentPath + separator;
    }

    if (!isPathAllowed(loadPath)) {
      return;
    }

    loadDirectory(loadPath);
  };

  // Thumbnail dialog states
  const [thumbnailDialogOpen, setThumbnailDialogOpen] = useState(false);
  const [thumbnailTargetItem, setThumbnailTargetItem] = useState<ExplorerItem | null>(null);

  const handlePinToggle = async (e: React.MouseEvent | null, item: ExplorerItem) => {
    if (e) e.stopPropagation(); // prevent directory navigation click
    try {
      if (item.isPinned) {
        await api.unpinFolder(item.path);
        loadDirectory(currentPath);
      } else {
        setPinTargetItem(item);
        setPinTitle(item.name);
        setImageSearchQuery(item.name);
        setSearchResults([]);
        setSelectedThumbnail(item.thumbnail || null);
        setPinDialogOpen(true);

        // Trigger pre-search
        setSearchingImages(true);
        api.searchImages(item.name)
          .then(res => {
            setSearchResults(res);
          })
          .catch(err => console.error(err))
          .finally(() => setSearchingImages(false));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleThumbnailOpen = (e: React.MouseEvent | null, item: ExplorerItem) => {
    if (e) e.stopPropagation();
    setThumbnailTargetItem(item);
    setImageSearchQuery(item.name);
    setSearchResults([]);
    setSelectedThumbnail(item.thumbnail || null);
    setThumbnailDialogOpen(true);

    // Trigger pre-search
    setSearchingImages(true);
    api.searchImages(item.name)
      .then(res => {
        setSearchResults(res);
      })
      .catch(err => console.error(err))
      .finally(() => setSearchingImages(false));
  };

  const handleSearchImages = async () => {
    if (!imageSearchQuery.trim()) return;
    setSearchingImages(true);
    try {
      const res = await api.searchImages(imageSearchQuery);
      setSearchResults(res);
    } catch (err) {
      console.error(err);
    } finally {
      setSearchingImages(false);
    }
  };

  const handlePinSubmit = async () => {
    if (!pinTargetItem) return;
    try {
      await api.pinFolder(pinTargetItem.path, pinTitle);
      if (selectedThumbnail) {
        await api.setFolderThumbnail(pinTargetItem.path, selectedThumbnail);
      }
      setPinDialogOpen(false);
      loadDirectory(currentPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleThumbnailSubmit = async () => {
    if (!thumbnailTargetItem || !selectedThumbnail) return;
    try {
      await api.setFolderThumbnail(thumbnailTargetItem.path, selectedThumbnail);
      setThumbnailDialogOpen(false);
      loadDirectory(currentPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleThumbnailRemove = async (item: ExplorerItem) => {
    try {
      await api.deleteFolderThumbnail(item.path);
      loadDirectory(currentPath);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertClick = async (item: ExplorerItem) => {
    setConversionTargetItem(item);
    setLoadingMetadata(true);
    setConversionDialogOpen(true);
    setMeta(null);
    setSelectedAudio('');
    setSelectedSubtitle('none');

    try {
      const data = await api.getVideoMetadata(item.path);
      setMeta(data);
      if (data.audioTracks.length > 0) {
        setSelectedAudio(data.audioTracks[0].index.toString());
      }
    } catch (err) {
      console.error('Failed to load video metadata for conversion:', err);
    } finally {
      setLoadingMetadata(false);
    }
  };

  const handleStartConversion = async () => {
    if (!conversionTargetItem) return;
    try {
      await api.startConversion(conversionTargetItem.path, selectedAudio, selectedSubtitle);
      setConversionDialogOpen(false);
      const jobs = await api.getConversionStatus();
      setActiveJobs(jobs);
    } catch (err: any) {
      alert(err.message || 'Failed to start conversion');
    }
  };

  const handleCancelConversion = async (path: string) => {
    try {
      await api.stopConversion(path);
      const jobs = await api.getConversionStatus();
      setActiveJobs(jobs);
    } catch (err) {
      console.error('Failed to stop conversion:', err);
    }
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  // Filter items based on search query
  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    currentPath,
    items,
    loading,
    searchQuery,
    setSearchQuery,
    filteredItems,
    pinDialogOpen,
    setPinDialogOpen,
    pinTargetItem,
    pinTitle,
    setPinTitle,
    thumbnailDialogOpen,
    setThumbnailDialogOpen,
    thumbnailTargetItem,
    handleThumbnailOpen,
    handleThumbnailSubmit,
    handleThumbnailRemove,
    imageSearchQuery,
    setImageSearchQuery,
    searchResults,
    searchingImages,
    selectedThumbnail,
    setSelectedThumbnail,
    loadDirectory,
    handleFolderClick,
    handleBackClick,
    handlePinToggle,
    handleSearchImages,
    handlePinSubmit,
    formatSize,
    isPathAllowed,
    playerMode,
    conversionDialogOpen,
    setConversionDialogOpen,
    conversionTargetItem,
    loadingMetadata,
    meta,
    selectedAudio,
    setSelectedAudio,
    selectedSubtitle,
    setSelectedSubtitle,
    activeJobs,
    handleConvertClick,
    handleStartConversion,
    handleCancelConversion,
  };
};
