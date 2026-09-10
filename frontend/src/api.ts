export interface Profile {
  id: string;
  name: string;
  hasPin: boolean;
  isAdmin?: boolean;
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
  const adminBypassToken = sessionStorage.getItem('adminBypassToken') || '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Profile-ID': profileId,
    'X-Profile-Token': token,
  };
  if (adminBypassToken) {
    headers['X-Admin-Bypass-Token'] = adminBypassToken;
  }
  return headers;
};

export const api = {
  // Admin Bypass
  async unlockAdminBypass(passkey: string): Promise<{ success: boolean; token: string; drives: string[] }> {
    const res = await fetch('/api/admin/unlock', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ passkey }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to unlock admin bypass');
    }
    const data = await res.json();
    if (data.token) {
      sessionStorage.setItem('adminBypassToken', data.token);
      sessionStorage.setItem('adminBypassDrives', JSON.stringify(data.drives || []));
      window.dispatchEvent(new CustomEvent('admin-bypass-changed', { detail: { active: true } }));
    }
    return data;
  },

  lockAdminBypass(): void {
    sessionStorage.removeItem('adminBypassToken');
    sessionStorage.removeItem('adminBypassDrives');
    window.dispatchEvent(new CustomEvent('admin-bypass-changed', { detail: { active: false } }));
  },

  isAdminBypassActive(): boolean {
    return Boolean(sessionStorage.getItem('adminBypassToken'));
  },
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

  async pinFolder(folderPath: string, title?: string): Promise<void> {
    const res = await fetch('/api/explorer/pin', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderPath, title }),
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

  async setFolderThumbnail(folderPath: string, thumbnail: string): Promise<void> {
    const res = await fetch('/api/explorer/thumbnail', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ folderPath, thumbnail }),
    });
    if (!res.ok) throw new Error('Failed to set thumbnail');
  },

  async deleteFolderThumbnail(folderPath: string): Promise<void> {
    const res = await fetch(`/api/explorer/thumbnail?path=${encodeURIComponent(folderPath)}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete thumbnail');
  },

  async deleteItem(itemPath: string): Promise<{ success: boolean }> {
    const res = await fetch('/api/explorer/delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ path: itemPath }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete item');
    }
    return res.json();
  },

  async deleteItems(itemPaths: string[]): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/explorer/delete', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paths: itemPaths }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to delete items');
    }
    return res.json();
  },

  async renameItem(itemPath: string, newName: string): Promise<{ success: boolean; newPath: string; newName: string }> {
    const res = await fetch('/api/explorer/rename', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ path: itemPath, newName }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to rename item');
    }
    return res.json();
  },

  async moveItem(sourcePath: string, targetDirectory: string): Promise<{ success: boolean; newPath: string }> {
    const res = await fetch('/api/explorer/move', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sourcePath, targetDirectory }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to move item');
    }
    return res.json();
  },

  async moveItems(sourcePaths: string[], targetDirectory: string): Promise<{ success: boolean; count: number }> {
    const res = await fetch('/api/explorer/move', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ sourcePaths, targetDirectory }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to move items');
    }
    return res.json();
  },

  async getFolders(pathQuery?: string): Promise<{ currentPath: string; folders: { name: string; path: string }[] }> {
    const url = pathQuery ? `/api/explorer/folders?path=${encodeURIComponent(pathQuery)}` : '/api/explorer/folders';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Failed to list folders');
    }
    return res.json();
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

  async getCurrentProfile(): Promise<{ id: string; name: string; allowedPaths: string[]; isAdmin?: boolean; isAdminBypass?: boolean }> {
    const res = await fetch('/api/profiles/me', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch profile info');
    return res.json();
  },

  getAuthQueryParams(): string {
    const profileId = localStorage.getItem('profileId') || '';
    const token = localStorage.getItem('profileToken') || '';
    const adminBypassToken = sessionStorage.getItem('adminBypassToken') || '';
    let params = `profileId=${encodeURIComponent(profileId)}&profileToken=${encodeURIComponent(token)}`;
    if (adminBypassToken) {
      params += `&adminBypassToken=${encodeURIComponent(adminBypassToken)}`;
    }
    return params;
  },

  getDirectStreamUrl(videoPath: string, audioTrack?: number | null): string {
    let url = `/api/video?path=${encodeURIComponent(videoPath)}&${this.getAuthQueryParams()}`;
    if (audioTrack !== undefined && audioTrack !== null) {
      url += `&audioTrack=${audioTrack}`;
    }
    return url;
  },

  getHlsPlaylistUrl(
    videoPath: string,
    options: {
      audioTrack?: number | null;
      subtitleTrack?: number | string | null;
      burnSubtitles?: boolean;
      startTime?: number;
    } = {}
  ): string {
    return `/api/video/hls/index.m3u8?path=${encodeURIComponent(videoPath)}&audioTrack=${options.audioTrack ?? ''}&subtitleTrack=${options.subtitleTrack ?? ''}&burnSubtitles=${options.burnSubtitles ? 'true' : 'false'}&startTime=${options.startTime ?? 0}&${this.getAuthQueryParams()}`;
  },

  getSubtitleStreamUrl(videoPath: string, trackIndex: number, download: boolean = false): string {
    let url = `/api/video/subtitles?path=${encodeURIComponent(videoPath)}&trackIndex=${trackIndex}&${this.getAuthQueryParams()}`;
    if (download) {
      url += '&download=true';
    }
    return url;
  },

  getHoverThumbnailUrl(videoPath: string, time: number): string {
    return `/api/video/thumbnail?path=${encodeURIComponent(videoPath)}&time=${Math.round(time)}&${this.getAuthQueryParams()}`;
  },

  getVideoDownloadUrl(videoPath: string, audioTrack?: number | null): string {
    let url = `/api/video?path=${encodeURIComponent(videoPath)}&download=true&${this.getAuthQueryParams()}`;
    if (audioTrack !== undefined && audioTrack !== null) {
      url += `&audioTrack=${audioTrack}`;
    }
    return url;
  },

  downloadVideo(videoPath: string, audioTrack?: number | null): void {
    const url = this.getVideoDownloadUrl(videoPath, audioTrack);
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  async convertVideo(
    filepath: string,
    audioTrack?: number | null,
    subtitleTrack?: number | string | null,
    burnSubtitles?: boolean
  ): Promise<{ success: boolean; filename: string; status?: string; queued?: boolean }> {
    const res = await fetch('/api/video/convert', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        path: filepath,
        audioTrack,
        subtitleTrack,
        burnSubtitles,
      }),
    });
    if (!res.ok) throw new Error('Failed to start conversion');
    return res.json();
  },

  async cancelConversion(filepath: string): Promise<{ success: boolean; message?: string }> {
    const res = await fetch('/api/video/convert/cancel', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ path: filepath }),
    });
    if (!res.ok) throw new Error('Failed to cancel conversion');
    return res.json();
  },

  async getConversionStatus(filepath?: string): Promise<{
    status?: string;
    progress?: number;
    filename?: string;
    queuedCount?: number;
    conversions?: Record<string, { status: string; progress: number; filename: string; error?: string }>;
  }> {
    const url = filepath
      ? `/api/video/convert/status?path=${encodeURIComponent(filepath)}`
      : '/api/video/convert/status';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch conversion status');
    return res.json();
  },
};

export interface SearchImageResult {
  title: string;
  image: string;
  thumbnail: string;
}
