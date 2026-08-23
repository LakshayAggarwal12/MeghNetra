import React from "react";
import { Moon, Sun, LayoutGrid, Map as MapIcon, Bell, BellOff } from "lucide-react";
import { useSettings } from "../context/SettingsContext";

function SettingsCard({ icon: Icon, title, description, children }: any) {
  return (
    <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 transition-surface">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-meghblue/10 dark:bg-sky-400/10 text-meghblue dark:text-sky-300 shrink-0">
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-3">{description}</p>
          {children}
        </div>
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-surface border ${
        active
          ? "bg-meghblue text-white border-meghblue"
          : "bg-transparent text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:border-meghteal"
      }`}
    >
      {children}
    </button>
  );
}

export default function Settings() {
  const {
    theme,
    setTheme,
    compactMode,
    setCompactMode,
    mapTileStyle,
    setMapTileStyle,
    notificationsEnabled,
    setNotificationsEnabled,
  } = useSettings();

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        These preferences are stored locally in your browser and only affect how the dashboard looks and
        feels — they don't change any data, verification logic, or backend behavior.
      </p>

      <SettingsCard icon={theme === "light" ? Sun : Moon} title="Theme" description="Choose a light or dark appearance for the whole app.">
        <div className="flex gap-2">
          <ToggleButton active={theme === "light"} onClick={() => setTheme("light")}>
            <span className="flex items-center gap-1.5"><Sun className="w-3.5 h-3.5" /> Light</span>
          </ToggleButton>
          <ToggleButton active={theme === "dark"} onClick={() => setTheme("dark")}>
            <span className="flex items-center gap-1.5"><Moon className="w-3.5 h-3.5" /> Dark</span>
          </ToggleButton>
        </div>
      </SettingsCard>

      <SettingsCard icon={LayoutGrid} title="Compact Mode" description="Reduce spacing and font size to fit more on screen.">
        <div className="flex gap-2">
          <ToggleButton active={!compactMode} onClick={() => setCompactMode(false)}>Comfortable</ToggleButton>
          <ToggleButton active={compactMode} onClick={() => setCompactMode(true)}>Compact</ToggleButton>
        </div>
      </SettingsCard>

      <SettingsCard icon={MapIcon} title="Map Style" description="Preference for the map tile appearance (applied to the Leaflet basemap).">
        <div className="flex gap-2">
          <ToggleButton active={mapTileStyle === "standard"} onClick={() => setMapTileStyle("standard")}>Standard</ToggleButton>
          <ToggleButton active={mapTileStyle === "muted"} onClick={() => setMapTileStyle("muted")}>Muted</ToggleButton>
        </div>
      </SettingsCard>

      <SettingsCard
        icon={notificationsEnabled ? Bell : BellOff}
        title="Notification Indicator"
        description="Show a badge/toast style indicator in the UI when new events arrive live (visual only)."
      >
        <div className="flex gap-2">
          <ToggleButton active={notificationsEnabled} onClick={() => setNotificationsEnabled(true)}>Enabled</ToggleButton>
          <ToggleButton active={!notificationsEnabled} onClick={() => setNotificationsEnabled(false)}>Disabled</ToggleButton>
        </div>
      </SettingsCard>
    </div>
  );
}
