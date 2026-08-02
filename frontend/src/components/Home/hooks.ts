import { useEffect, useState } from "react";
import { api } from "../../api";
import type { ContinueItem, PinnedFolder } from "../../api";

export const CARD_GRADIENTS = [
  "linear-gradient(135deg, #2b5876 0%, #4e4376 100%)",
  "linear-gradient(135deg, #130cb7 0%, #52e5e7 100%)",
  "linear-gradient(135deg, #d4145a 0%, #fbb03b 100%)",
  "linear-gradient(135deg, #0091ff 0%, #00d2ff 100%)",
  "linear-gradient(135deg, #662d8c 0%, #ed1e79 100%)",
];

export const useHome = () => {
  const [continueList, setContinueList] = useState<ContinueItem[]>([]);
  const [pinnedList, setPinnedList] = useState<PinnedFolder[]>([]);

  const fetchHomeData = async () => {
    try {
      const [continueData, pinnedData] = await Promise.all([
        api.getContinueWatching(),
        api.getPins(),
      ]);
      setContinueList(continueData);
      setPinnedList(pinnedData);
    } catch (err) {
      console.error("Failed to fetch home data:", err);
    }
  };

  useEffect(() => {
    fetchHomeData();

    // player close event to refresh lists
    window.addEventListener("playback-closed", fetchHomeData);
    return () => {
      window.removeEventListener("playback-closed", fetchHomeData);
    };
  }, []);

  const handleRemoveContinue = async (e: React.MouseEvent, filepath: string) => {
    e.stopPropagation();
    try {
      await api.removeProgress(filepath);
      fetchHomeData();
    } catch (err) {
      console.error("Failed to remove progress:", err);
    }
  };

  const handleRemovePin = async (e: React.MouseEvent, folderPath: string) => {
    e.stopPropagation();
    try {
      await api.unpinFolder(folderPath);
      fetchHomeData();
    } catch (err) {
      console.error("Failed to remove pin:", err);
    }
  };

  const heroItem = continueList[0];

  return {
    continueList,
    pinnedList,
    heroItem,
    fetchHomeData,
    handleRemoveContinue,
    handleRemovePin,
  };
};
