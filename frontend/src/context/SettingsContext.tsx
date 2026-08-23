import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type MapTileStyle = "standard" | "muted";

interface SettingsState {
  theme: ThemeMode;
  compactMode: boolean;
  mapTileStyle: MapTileStyle;
  notificationsEnabled: boolean;
}

interface SettingsContextValue extends SettingsState {
  setTheme: (t: ThemeMode) => void;
  toggleTheme: () => void;
  setCompactMode: (v: boolean) => void;
  setMapTileStyle: (v: MapTileStyle) => void;
  setNotificationsEnabled: (v: boolean) => void;
}

const STORAGE_KEY = "meghnetra_settings_v1";

const defaultSettings: SettingsState = {
  theme: "light",
  compactMode: false,
  mapTileStyle: "standard",
  notificationsEnabled: true,
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return defaultSettings;
  }
}

const SettingsContext = createContext<SettingsContextValue | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    document.documentElement.classList.toggle("dark", settings.theme === "dark");
    document.documentElement.classList.toggle("compact", settings.compactMode);
  }, [settings]);

  const value: SettingsContextValue = {
    ...settings,
    setTheme: (theme) => setSettings((s) => ({ ...s, theme })),
    toggleTheme: () => setSettings((s) => ({ ...s, theme: s.theme === "light" ? "dark" : "light" })),
    setCompactMode: (compactMode) => setSettings((s) => ({ ...s, compactMode })),
    setMapTileStyle: (mapTileStyle) => setSettings((s) => ({ ...s, mapTileStyle })),
    setNotificationsEnabled: (notificationsEnabled) => setSettings((s) => ({ ...s, notificationsEnabled })),
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
