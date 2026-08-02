import type { Profile } from '../../../api';

export interface ProfileSelectorViewProps {
  profiles: Profile[];
  selectedProfile: Profile | null;
  setSelectedProfile: (profile: Profile | null) => void;
  pinDigits: string[];
  pinError: boolean;
  isLoggingIn: boolean;
  handleProfileClick: (profile: Profile) => void;
  handleDigitInput: (digit: string) => void;
  handleBackspace: () => void;
}
