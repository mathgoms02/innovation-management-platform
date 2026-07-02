import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import { updatePreferences } from '../../services/user';
import type { AccentName, UserPreferences } from '../../services/user';

const DEFAULT_PREFERENCES: UserPreferences = {
  accent: 'cyan',
  reduce_motion: false,
  notifications: true,
  plain_text: false,
  language: 'pt-BR',
};

// Each accent maps to the two neon CSS variables the theme is built on.
export const ACCENTS: Record<AccentName, { primary: string; secondary: string; label: string }> = {
  cyan: { primary: '#00f0ff', secondary: '#ff007a', label: 'Cyan' },
  magenta: { primary: '#ff2e88', secondary: '#00f0ff', label: 'Magenta' },
  lime: { primary: '#9dff00', secondary: '#ff007a', label: 'Lime' },
  violet: { primary: '#b17aff', secondary: '#00f0ff', label: 'Violet' },
};

interface PreferencesContextType {
  prefs: UserPreferences;
  setPreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => Promise<void>;
  /** Applies plain-text mode: strips the cyberpunk underscore styling when on. */
  fmt: (text: string) => string;
  notificationsEnabled: boolean;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();

  // Local mirror so toggles feel instant (optimistic), backed by the server.
  const [local, setLocal] = useState<UserPreferences | null>(null);

  const prefs: UserPreferences = useMemo(
    () => ({ ...DEFAULT_PREFERENCES, ...(user?.preferences ?? {}), ...(local ?? {}) }),
    [user?.preferences, local],
  );

  // Reset the optimistic mirror whenever the authenticated user changes.
  useEffect(() => {
    setLocal(null);
  }, [user?.id]);

  // Apply the accent to the document-level CSS variables.
  useEffect(() => {
    const accent = ACCENTS[prefs.accent] ?? ACCENTS.cyan;
    const root = document.documentElement;
    root.style.setProperty('--color-primary', accent.primary);
    root.style.setProperty('--color-secondary', accent.secondary);
  }, [prefs.accent]);

  // Toggle motion + plain-text via root classes consumed by index.css.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', prefs.reduce_motion);
    root.classList.toggle('plain-text', prefs.plain_text);
  }, [prefs.reduce_motion, prefs.plain_text]);

  const setPreference = async <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setLocal((prev) => ({ ...prefs, ...(prev ?? {}), [key]: value }));
    try {
      const updated = await updatePreferences({ [key]: value });
      if (updated?.preferences) {
        updateUser({ preferences: updated.preferences });
        setLocal(null);
      }
    } catch {
      // Roll back the optimistic change on failure.
      setLocal((prev) => ({ ...prefs, ...(prev ?? {}), [key]: prefs[key] }));
    }
  };

  const fmt = useMemo(() => {
    return (text: string) => (prefs.plain_text ? text.replace(/_/g, ' ') : text);
  }, [prefs.plain_text]);

  const value: PreferencesContextType = {
    prefs,
    setPreference,
    fmt,
    notificationsEnabled: prefs.notifications,
  };

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};
