import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { ExplorerItem, SearchImageResult } from '../../api';

export const useExplorer = (initialPath: string) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [items, setItems] = useState<ExplorerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allowedPaths, setAllowedPaths] = useState<string[]>([]);

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
    const cleanPath = pathStr.replace(/\\/g, '/').toLowerCase();
    return allowedPaths.some(allowed => {
      const cleanAllowed = allowed.replace(/\\/g, '/').toLowerCase();
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

  const handlePinToggle = async (e: React.MouseEvent, item: ExplorerItem) => {
    e.stopPropagation(); // prevent directory navigation click
    try {
      if (item.isPinned) {
        await api.unpinFolder(item.path);
        loadDirectory(currentPath);
      } else {
        setPinTargetItem(item);
        setPinTitle(item.name);
        setImageSearchQuery(item.name);
        setSearchResults([]);
        setSelectedThumbnail(null);
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
      await api.pinFolder(pinTargetItem.path, pinTitle, selectedThumbnail || undefined);
      setPinDialogOpen(false);
      loadDirectory(currentPath);
    } catch (err) {
      console.error(err);
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
  };
};
