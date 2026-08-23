import React from "react";
import { Menu, Moon, Sun, Wifi, WifiOff } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";

interface Props {
  title: string;
  subtitle?: string;
  connected: boolean;
  onToggleSidebar: () => void;
}

export default function Topbar({ title, subtitle, connected, onToggleSidebar }: Props) {
  const { theme, toggleTheme } = useSettings();

  return (
    <header
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 md:px-6 py-3.5
                 bg-white/90 dark:bg-meghcard-dark/90 backdrop-blur border-b border-slate-200 dark:border-slate-700
                 transition-surface"
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-surface"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-bold text-meghblue dark:text-sky-300 truncate">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span
          className={`hidden sm:flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full transition-surface ${
            connected
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
              : "bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400"
          }`}
        >
          {connected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {connected ? "Live" : "Reconnecting…"}
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-surface"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 text-slate-600" />
          ) : (
            <Sun className="w-5 h-5 text-amber-300" />
          )}
        </button>
      </div>
    </header>
  );
}
