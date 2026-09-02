import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, ShieldQuestion, ShieldAlert, Zap } from "lucide-react";
import client from "../../api/client";
import { getSocket } from "../../sockets/socket";
import type { AnalyticsSummary, WeatherEvent } from "../../types/models";

export default function StatCounters() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  const fetchSummary = () => {
    client
      .get("/analytics/summary")
      .then(({ data }) => setSummary(data))
      .catch(() => {});
  };

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(fetchSummary, 30000); 
    const socket = getSocket();
    const onUpdate = (_event: WeatherEvent) => fetchSummary();
    socket.on("event:update", onUpdate);
    return () => {
      clearInterval(interval);
      socket.off("event:update", onUpdate);
    };
  }, []);

  if (!summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="relative h-32 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 overflow-hidden ring-1 ring-white/5">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        ))}
      </div>
    );
  }

  const cards = [
    { 
      label: "Active Events", 
      value: summary.totalActive, 
      icon: Activity, 
      bg: "from-cyan-500 to-blue-700",
      shadow: "hover:shadow-[0_12px_40px_-12px_rgba(6,182,212,1)]",
      live: true
    },
    { 
      label: "Verified", 
      value: summary.byStatus["verified"] || 0, 
      icon: ShieldCheck, 
      bg: "from-emerald-400 to-teal-700",
      shadow: "hover:shadow-[0_12px_40px_-12px_rgba(16,185,129,1)]",
      live: false
    },
    { 
      label: "Unverified", 
      value: summary.byStatus["unverified"] || 0, 
      icon: ShieldQuestion, 
      bg: "from-indigo-400 to-purple-700",
      shadow: "hover:shadow-[0_12px_40px_-12px_rgba(99,102,241,1)]",
      live: false
    },
    {
      label: "Suspicious / Contradicted",
      value: (summary.byStatus["suspicious"] || 0) + (summary.byStatus["contradicted"] || 0),
      icon: ShieldAlert,
      bg: "from-rose-400 to-red-700",
      shadow: "hover:shadow-[0_12px_40px_-12px_rgba(244,63,94,1)]",
      live: false
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`group relative overflow-hidden rounded-2xl p-6 text-white cursor-default
                      transition-all duration-500 ease-out hover:-translate-y-2
                      bg-gradient-to-br ${c.bg} ${c.shadow}`}
        >
          {/* Glass Bezel Overlay */}
          <div className="absolute inset-0 border border-white/20 rounded-2xl mix-blend-overlay pointer-events-none" />
          
          {/* Hover Shine Effect */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />

          {/* Faded background icon */}
          <c.icon className="absolute -right-4 -bottom-4 w-28 h-28 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500" />

          <div className="relative flex items-start justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <c.icon className="w-5 h-5 text-white drop-shadow-md" />
            </div>
            
            {/* Live Indicator Innovation */}
            {c.live && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
                </span>
                <span className="text-[9px] font-bold tracking-wider uppercase text-white/90">Live Sync</span>
              </div>
            )}
          </div>

          <div className="relative z-10 mt-2">
            <div className="text-4xl md:text-5xl font-extrabold tabular-nums tracking-tighter drop-shadow-sm group-hover:scale-[1.02] transition-transform origin-left">
              {c.value}
            </div>
            <div className="text-xs md:text-sm text-white/80 font-medium mt-1.5 tracking-wide">
              {c.label}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}