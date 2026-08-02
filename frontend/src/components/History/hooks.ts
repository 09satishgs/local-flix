import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { HistoryItem } from '../../api';

export const useHistory = () => {
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const data = await api.getHistory();
      setHistoryList(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();

    window.addEventListener('playback-closed', fetchHistory);
    return () => {
      window.removeEventListener('playback-closed', fetchHistory);
    };
  }, []);

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDeleteHistoryItem = async (id: number) => {
    try {
      await api.removeHistory(id);
      fetchHistory();
    } catch (err) {
      console.error('Failed to delete history item:', err);
    }
  };

  return {
    historyList,
    loading,
    formatDate,
    fetchHistory,
    handleDeleteHistoryItem,
  };
};
