import React, { useState } from "react";
import { Menu, Moon, Sun, LogOut, ChevronDown, UserCircle2, ShieldCheck } from "lucide-react";
import { useSettings } from "../../context/SettingsContext";
import { useAuth } from "../../context/AuthContext";

interface Props {
  title: string;
  subtitle?: string;
  connected: boolean;
  onToggleSidebar: () => void;
}

export default function Topbar({ title, subtitle, connected, onToggleSidebar }: Props) {
  const { theme, toggleTheme } = useSettings();
  const { user, isAuthenticated, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
    window.location.href = "/";
  };

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

        {/* Theme Toggle */}
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

        {/* User Menu */}
        {isAuthenticated && user ? (
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100/80 dark:bg-slate-800/60
                         border border-slate-200/60 dark:border-white/5 shadow-sm
                         text-slate-700 dark:text-slate-200 text-sm font-medium
                         hover:bg-cyan-500/10 hover:text-cyan-700 dark:hover:text-cyan-300 transition-all active:scale-95"
              aria-label="User menu"
              aria-expanded={userMenuOpen}
            >
              {user.role === "admin" ? (
                <ShieldCheck className="w-4 h-4 text-sky-500" />
              ) : (
                <UserCircle2 className="w-4 h-4" />
              )}
              <span className="hidden md:block max-w-[120px] truncate">{user.name}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {userMenuOpen && (
              <>
                {/* Backdrop */}
                <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-xl shadow-xl z-20 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/5">
                    <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className={`mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      user.role === "admin"
                        ? "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}>
                      {user.role === "admin" && <ShieldCheck className="w-2.5 h-2.5" />}
                      {user.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>
    </header>
  );
}