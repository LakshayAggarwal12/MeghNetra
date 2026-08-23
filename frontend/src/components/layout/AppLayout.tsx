import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import { useSettings } from "../../context/SettingsContext";

const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  "/": { title: "Dashboard", subtitle: "National weather-event overview" },
  "/map": { title: "Live Map", subtitle: "India-wide event visualization" },
  "/alerts": { title: "Alerts", subtitle: "High-severity and hotspot events" },
  "/city-lookup": { title: "City Lookup", subtitle: "On-demand weather & news search" },
  "/report": { title: "Submit a Report", subtitle: "Citizen weather observation" },
  "/admin": { title: "Admin Panel", subtitle: "Human-in-the-loop verification" },
  "/settings": { title: "Settings", subtitle: "Frontend preferences" },
};

function resolveTitle(pathname: string) {
  if (PAGE_META[pathname]) return PAGE_META[pathname];
  if (pathname.startsWith("/events/")) return { title: "Event Detail", subtitle: "Full evidence view" };
  return { title: "MEGHNETRA" };
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const connected = useConnectionStatus();
  const location = useLocation();
  const { compactMode } = useSettings();
  const { title, subtitle } = resolveTitle(location.pathname);

  return (
    <div className="flex min-h-screen bg-meghsurface-light dark:bg-meghsurface-dark transition-colors duration-300">
      <Sidebar open={sidebarOpen} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={title}
          subtitle={subtitle}
          connected={connected}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
        />

        <main className={`flex-1 ${compactMode ? "p-3" : "p-4 md:p-6"} animate-fade-in`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
