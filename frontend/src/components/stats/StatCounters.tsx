import React, { useEffect, useState } from "react";
import { Activity, ShieldCheck, ShieldQuestion, ShieldAlert } from "lucide-react";
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
    const interval = setInterval(fetchSummary, 30000); // safety-net refetch
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    { label: "Active Events", value: summary.totalActive, icon: Activity, accent: "from-meghblue to-meghteal" },
    { label: "Verified", value: summary.byStatus["verified"] || 0, icon: ShieldCheck, accent: "from-emerald-600 to-emerald-500" },
    { label: "Unverified", value: summary.byStatus["unverified"] || 0, icon: ShieldQuestion, accent: "from-slate-500 to-slate-400" },
    {
      label: "Suspicious / Contradicted",
      value: (summary.byStatus["suspicious"] || 0) + (summary.byStatus["contradicted"] || 0),
      icon: ShieldAlert,
      accent: "from-red-600 to-red-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`group relative overflow-hidden rounded-2xl p-5 text-white
                      shadow-card hover:shadow-card-hover hover:-translate-y-1
                      transition-surface bg-gradient-to-br ${c.accent}`}
        >
          {/* faded large icon in background */}
          <c.icon className="absolute -right-3 -bottom-3 w-20 h-20 opacity-10 group-hover:opacity-15 group-hover:scale-110 transition-transform duration-300" />

          {/* small icon badge */}
          <div className="relative flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <c.icon className="w-5 h-5" />
            </div>
          </div>

          <div className="relative">
            <div className="text-3xl font-bold tabular-nums tracking-tight">{c.value}</div>
            <div className="text-xs opacity-90 font-medium mt-1">{c.label}</div>
          </div>

          {/* bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20" />
        </div>
      ))}
    </div>
  );
}
