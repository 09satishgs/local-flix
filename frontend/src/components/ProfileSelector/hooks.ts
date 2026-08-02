import { useEffect, useState } from 'react';
import { api } from '../../api';
import type { Profile } from '../../api';

export const AVATAR_COLORS = [
  '#1e90ff', // Blue
  '#e50914', // Red
  '#2ecc71', // Green
  '#f1c40f', // Yellow
  '#9b59b6', // Purple
];

export const useProfileSelector = (onProfileSelected: (profileId: string, name: string) => void) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // PIN dialog state
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>([]);
  const [pinError, setPinError] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    api.getProfiles()
      .then((data) => {
        setProfiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError('Could not contact the local server. Is it running?');
        setLoading(false);
      });
  }, []);

  const performLogin = (profileId: string, pin: string) => {
    setIsLoggingIn(true);
    setPinError(false);
    api.login(profileId, pin)
      .then((res) => {
        localStorage.setItem('profileId', res.id);
        localStorage.setItem('profileName', res.name);
        localStorage.setItem('profileToken', res.token);
        onProfileSelected(res.id, res.name);
      })
      .catch((err) => {
        console.error(err);
        setPinError(true);
        setPinDigits([]); // clear digits
        setIsLoggingIn(false);
      });
  };

  const handleProfileClick = (profile: Profile) => {
    if (!profile.hasPin) {
      // Direct login
      performLogin(profile.id, '');
    } else {
      setSelectedProfile(profile);
      setPinDigits([]);
      setPinError(false);
    }
  };

  const handleDigitInput = (digit: string) => {
    if (pinDigits.length >= 4) return;
    const newDigits = [...pinDigits, digit];
    setPinDigits(newDigits);

    // If 4 digits entered, automatically submit
    if (newDigits.length === 4) {
      performLogin(selectedProfile!.id, newDigits.join(''));
    }
  };

  const handleBackspace = () => {
    setPinDigits(pinDigits.slice(0, -1));
  };

  // Keyboard support for PIN entry
  useEffect(() => {
    if (!selectedProfile) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigitInput(e.key);
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        setSelectedProfile(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedProfile, pinDigits]);

  return {
    profiles,
    loading,
    error,
    selectedProfile,
    setSelectedProfile,
    pinDigits,
    pinError,
    isLoggingIn,
    handleProfileClick,
    handleDigitInput,
    handleBackspace,
  };
};
