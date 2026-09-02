import React from "react";
import { Menu, Moon, Sun, Wifi, WifiOff, Radio } from "lucide-react";
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
      className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 md:px-8 py-4
                 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl 
                 border-b border-slate-200/80 dark:border-white/5 
                 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all"
    >
      <div className="flex items-center gap-4 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300
                     hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:text-cyan-400 
                     transition-all border border-slate-200/60 dark:border-white/5 shadow-sm active:scale-95"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base md:text-lg font-extrabold text-slate-800 dark:text-white tracking-tight truncate flex items-center gap-2">
            {title}
          </h1>
          {subtitle && <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        {/* Connection Status Pill */}
        <span
          className={`hidden sm:flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-full border backdrop-blur-md transition-all ${
            connected
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
              : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 shadow-[0_0_12px_rgba(225,29,72,0.15)] animate-pulse"
          }`}
        >
          <span className="relative flex h-2 w-2">
            {connected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${connected ? "bg-emerald-500" : "bg-rose-500"}`} />
          </span>
          {connected ? "Live Stream" : "Reconnecting..."}
        </span>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/60 
                     text-slate-600 dark:text-amber-300 
                     hover:bg-cyan-500/10 hover:text-cyan-600 dark:hover:bg-white/10
                     border border-slate-200/60 dark:border-white/5 shadow-sm 
                     transition-all active:scale-95 group"
          aria-label="Toggle theme"
          title="Toggle light/dark theme"
        >
          {theme === "light" ? (
            <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
          ) : (
            <Sun className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
          )}
        </button>
      </div>
    </header>
  );
}