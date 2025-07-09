import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { Settings, Theme } from '../types';

interface SettingsContextType {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  saveSettings: (newSettings: Settings) => void;
}

const defaultSettings: Settings = {
  theme: 'cyan',
  artistName: '',
  studioName: 'BioSpark Studios',
  albumName: '',
  copyright: `© ${new Date().getFullYear()} My Music`,
  studioLogo: null,
  artistLogo: null,
  studioBio: '',
  studioWebsite: '',
  studioEmail: '',
  studioPhone: '',
  splashBackground: null,
  serverAddress: 'http://localhost:5173',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const storedSettings = localStorage.getItem('songweaver_settings');
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        // Ensure parsed data is a valid object before merging
        if (parsed && typeof parsed === 'object') {
          return { ...defaultSettings, ...parsed };
        }
      }
      return defaultSettings;
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    switch (settings.theme) {
        case 'rose':
            root.style.setProperty('--color-primary', '225 29 72');
            root.style.setProperty('--color-primary-accent', '244 63 94');
            break;
        case 'emerald':
            root.style.setProperty('--color-primary', '5 150 105');
            root.style.setProperty('--color-primary-accent', '16 185 129');
            break;
        case 'cyan':
        default:
            root.style.setProperty('--color-primary', '8 145 178');
            root.style.setProperty('--color-primary-accent', '6 182 212');
            break;
    }
  }, [settings.theme]);

  const saveSettings = (newSettings: Settings) => {
    try {
      localStorage.setItem('songweaver_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Failed to save settings to localStorage", error);
    }
  };

  const contextValue = useMemo(() => ({
    settings,
    setSettings,
    saveSettings
  }), [settings]);

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};