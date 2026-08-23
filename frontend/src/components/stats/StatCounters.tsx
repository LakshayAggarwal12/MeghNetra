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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className={`relative overflow-hidden rounded-xl p-4 text-white shadow-card hover:shadow-card-hover
                      transition-surface bg-gradient-to-br ${c.accent}`}
        >
          <c.icon className="absolute -right-2 -bottom-2 w-16 h-16 opacity-15" />
          <div className="relative">
            <div className="text-2xl font-bold tabular-nums">{c.value}</div>
            <div className="text-xs opacity-90 font-medium">{c.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
