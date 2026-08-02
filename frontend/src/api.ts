export interface Profile {
  id: string;
  name: string;
  hasPin: boolean;
}

export interface PlaybackProgress {
  position: number;
  duration: number;
}

export interface ExplorerItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  progress?: PlaybackProgress | null;
  isPinned?: boolean;
  thumbnail?: string;
}

export interface PinnedFolder {
  path: string;
  title: string;
  thumbnail?: string;
}

export interface HistoryItem {
  id: number;
  name: string;
  path: string;
  watchedAt: number;
  position: number;
  thumbnail?: string;
}

export interface ContinueItem {
  name: string;
  path: string;
  position: number;
  duration: number;
  lastWatched: number;
  thumbnail?: string;
}

export interface SubtitleTrack {
  index: number;
  trackIndex: number;
  language: string;
  title: string;
  codec: string;
}

export interface AudioTrack {
  index: number;
  trackIndex: number;
  language: string;
  title: string;
  codec: string;
}

export interface VideoMetadata {
  duration: number;
  subtitles: SubtitleTrack[];
  audioTracks: AudioTrack[];
  playlist: string[];
}

const getHeaders = () => {
  const profileId = localStorage.getItem('profileId') || '';
  const token = localStorage.getItem('profileToken') || '';
  return {
    'Content-Type': 'application/json',
    'X-Profile-ID': profileId,
    'X-Profile-Token': token,
  };
};

export const api = {
  // Profiles
  async getProfiles(): Promise<Profile[]> {
    const res = await fetch('/api/profiles');
    if (!res.ok) throw new Error('Failed to fetch profiles');
    return res.json();
  },

  async login(profileId: string, pin: string): Promise<{ token: string; id: string; name: string }> {
    const res = await fetch('/api/profiles/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ profileId, pin }),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to login');
    }
    return res.json();
  },

  // File Explorer
  async getExplorer(pathQuery?: string): Promise<{ currentPath: string; items: ExplorerItem[] }> {
    const url = pathQuery ? `/api/explorer?path=${encodeURIComponent(pathQuery)}` : '/api/explorer';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to read folder');
    return res.json();
  },

  // Pinned folders
  async getPins(): Promise<PinnedFolder[]> {
    const res = await fetch('/api/explorer/pins', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pins');
    return res.json();
  },

  async pinFolder(folderPath: string, title?: string, thumbnail?: string): Promise<void> {
    const res = await fetch('/api/explorer/pin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderPath, title, thumbnail }),
    });
    if (!res.ok) throw new Error('Failed to pin folder');
  },

  async unpinFolder(folderPath: string): Promise<void> {
    const res = await fetch('/api/explorer/unpin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderPath }),
    });
    if (!res.ok) throw new Error('Failed to unpin folder');
  },

  // Metadata
  async getVideoMetadata(videoPath: string): Promise<VideoMetadata> {
    const res = await fetch(`/api/video/metadata?path=${encodeURIComponent(videoPath)}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch video metadata');
    return res.json();
  },

  async updateProgress(filepath: string, position: number, duration: number): Promise<void> {
    await fetch('/api/playback/progress', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ filepath, position, duration }),
    });
  },

  async markFinished(filepath: string): Promise<void> {
    await fetch('/api/playback/finished', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ filepath }),
    });
  },

  async getContinueWatching(): Promise<ContinueItem[]> {
    const res = await fetch('/api/playback/continue', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch continue watching');
    return res.json();
  },

  async getHistory(): Promise<HistoryItem[]> {
    const res = await fetch('/api/playback/history', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch history');
    return res.json();
  },

  async searchImages(query: string): Promise<SearchImageResult[]> {
    const res = await fetch(`/api/search-images?q=${encodeURIComponent(query)}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to search images');
    return res.json();
  },

  async stopHlsStream(filepath: string, audioTrack: number | null): Promise<void> {
    await fetch('/api/video/hls/stop', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ path: filepath, audioTrack })
    });
  },

  async removeProgress(filepath: string): Promise<void> {
    const res = await fetch('/api/playback/progress', {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ filepath }),
    });
    if (!res.ok) throw new Error('Failed to remove progress');
  },

  async removeHistory(id: number): Promise<void> {
    const res = await fetch(`/api/playback/history/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to remove history');
  },

  async getCurrentProfile(): Promise<{ id: string; name: string; allowedPaths: string[] }> {
    const res = await fetch('/api/profiles/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile info');
    return res.json();
  },
};

export interface SearchImageResult {
  title: string;
  image: string;
  thumbnail: string;
}
