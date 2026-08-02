import type { ContinueItem, PinnedFolder } from '../../../api';

export interface HomeViewProps {
  continueList: ContinueItem[];
  pinnedList: PinnedFolder[];
  heroItem: ContinueItem | undefined;
  onPlayVideo: (path: string, position: number) => void;
  onNavigateToPath: (path: string) => void;
  handleRemoveContinue: (e: React.MouseEvent, filepath: string) => void;
  handleRemovePin: (e: React.MouseEvent, folderPath: string) => void;
}
