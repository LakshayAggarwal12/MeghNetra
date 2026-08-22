import React, { useEffect, useState } from "react";
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
    return <div className="text-sm text-gray-500">Loading statistics…</div>;
  }

  const cards = [
    { label: "Active Events", value: summary.totalActive, color: "bg-meghblue" },
    { label: "Verified", value: summary.byStatus["verified"] || 0, color: "bg-emerald-600" },
    { label: "Unverified", value: summary.byStatus["unverified"] || 0, color: "bg-slate-500" },
    { label: "Suspicious/Contradicted", value: (summary.byStatus["suspicious"] || 0) + (summary.byStatus["contradicted"] || 0), color: "bg-red-600" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((c) => (
        <div key={c.label} className={`rounded-lg p-4 text-white ${c.color} shadow-sm`}>
          <div className="text-2xl font-bold">{c.value}</div>
          <div className="text-xs opacity-90">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
