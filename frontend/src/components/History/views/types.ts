import type { HistoryItem } from '../../../api';

export interface HistoryViewProps {
  historyList: HistoryItem[];
  loading: boolean;
  formatDate: (timestamp: number) => string;
  onPlayVideo: (path: string, position: number) => void;
  handleDeleteHistoryItem: (id: number) => void;
}
