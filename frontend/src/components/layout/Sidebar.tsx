import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Bell, ShieldCheck, SendHorizontal, Search, Settings, CloudDrizzle, Server } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/map", label: "Map", icon: Map },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/city-lookup", label: "City Lookup", icon: Search },
  { to: "/report", label: "Submit Report", icon: SendHorizontal },
  { to: "/admin", label: "Admin Panel", icon: ShieldCheck },
  { to: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar({ open }: { open: boolean }) {
  return (
    <aside
      className={`fixed md:sticky top-0 left-0 h-screen z-30 bg-slate-950/80 backdrop-blur-2xl border-r border-white/5 text-white flex flex-col
        transition-all duration-300 ease-in-out overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.2)]
        ${open ? "w-64" : "w-0 md:w-20"}`}
    >
      <div className={`flex items-center gap-3 px-5 py-6 border-b border-white/5 whitespace-nowrap`}>
        <div className="relative">
          <div className="absolute inset-0 bg-sky-400 blur-md opacity-40 animate-pulse rounded-full" />
          <CloudDrizzle className="relative w-8 h-8 text-sky-300 shrink-0 drop-shadow-md" />
        </div>
        <div className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 md:opacity-0 hidden md:block"}`}>
          <div className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-sky-200">
            MEGHNETRA
          </div>
          <div className="text-[9px] font-medium text-sky-400/80 tracking-widest uppercase">
            Eye of the Clouds
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-300
               ${
                 isActive
                   ? "bg-gradient-to-r from-sky-500/10 to-transparent text-sky-300 border-l-2 border-sky-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                   : "text-slate-400 border-l-2 border-transparent hover:text-white hover:bg-white/5 hover:translate-x-1"
               }`
            }
            title={label}
          >
            <Icon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />
            <span className={`transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 md:opacity-0 hidden md:block"}`}>
              {label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Innovation: System Health Micro-Widget */}
      <div className={`mx-4 mb-4 p-3 rounded-xl bg-black/40 border border-white/5 backdrop-blur-md transition-all duration-500 overflow-hidden ${open ? "opacity-100 max-h-32" : "opacity-0 max-h-0 hidden md:hidden"}`}>
        <div className="flex items-center gap-2 mb-3">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase flex items-center gap-1">
            <Server className="w-3 h-3" /> System Live
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-medium">Vector Search</span>
            <span className="text-emerald-400 font-mono tracking-tighter">14ms</span>
          </div>
          <div className="flex justify-between items-center text-[10px]">
            <span className="text-slate-500 font-medium">Semantic Cache</span>
            <span className="text-sky-400 font-mono tracking-tighter">98% Hit</span>
          </div>
        </div>
      </div>

      <div className={`px-5 py-4 border-t border-white/5 text-[10px] text-slate-500 whitespace-nowrap transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0 hidden md:block"}`}>
        SIH PS 26069 · AI Weather Intel
      </div>
    </aside>
  );
}