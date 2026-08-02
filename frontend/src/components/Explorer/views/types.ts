import React from 'react';
import type { ExplorerItem, SearchImageResult } from '../../../api';

export interface ExplorerViewProps {
  currentPath: string;
  items: ExplorerItem[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredItems: ExplorerItem[];
  pinDialogOpen: boolean;
  setPinDialogOpen: (open: boolean) => void;
  pinTargetItem: ExplorerItem | null;
  pinTitle: string;
  setPinTitle: (title: string) => void;
  imageSearchQuery: string;
  setImageSearchQuery: (query: string) => void;
  searchResults: SearchImageResult[];
  searchingImages: boolean;
  selectedThumbnail: string | null;
  setSelectedThumbnail: (url: string | null) => void;
  loadDirectory: (path: string) => void;
  handleFolderClick: (path: string) => void;
  handleBackClick: () => void;
  handlePinToggle: (e: React.MouseEvent, item: ExplorerItem) => void;
  handleSearchImages: () => void;
  handlePinSubmit: () => void;
  formatSize: (bytes?: number) => string;
  onPlayVideo: (path: string, position: number) => void;
  isPathAllowed: (path: string) => boolean;
}
