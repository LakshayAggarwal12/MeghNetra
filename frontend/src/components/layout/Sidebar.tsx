import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Map, Bell, ShieldCheck, SendHorizontal, Search, Settings, CloudDrizzle } from "lucide-react";

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
      className={`fixed md:sticky top-0 left-0 h-screen z-30 bg-gradient-to-b from-slate-900 via-meghblue to-meghblue text-white flex flex-col
        transition-all duration-300 ease-smooth overflow-hidden
        ${open ? "w-64" : "w-0 md:w-20"}`}
    >
      <div className={`flex items-center gap-2 px-5 py-5 border-b border-white/10 whitespace-nowrap`}>
        <CloudDrizzle className="w-7 h-7 text-sky-300 shrink-0" />
        <div className={`transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0 md:opacity-0"}`}>
          <div className="font-bold text-lg leading-tight">MEGHNETRA</div>
          <div className="text-[10px] text-sky-200 tracking-wide">EYE OF THE CLOUDS</div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap
               transition-surface ${
                 isActive
                   ? "bg-white/15 text-white shadow-inner"
                   : "text-sky-100/80 hover:bg-white/10 hover:text-white"
               }`
            }
            title={label}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span className={`${open ? "inline" : "hidden md:hidden"}`}>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={`px-4 py-4 border-t border-white/10 text-[11px] text-sky-200/70 whitespace-nowrap ${open ? "block" : "hidden"}`}>
        SIH PS 26069 · National Weather Intelligence
      </div>
    </aside>
  );
}
