import type { HistoryItem } from '../../../api';

export interface HistoryViewProps {
  historyList: HistoryItem[];
  loading: boolean;
  formatDate: (timestamp: number) => string;
  onPlayVideo: (path: string, position: number, playerType?: "hls" | "alt" | "tv") => void;
  handleDeleteHistoryItem: (id: number) => void;
}
