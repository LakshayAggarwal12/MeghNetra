import React, { useMemo } from "react";
import { AlertTriangle, Flame, ShieldAlert } from "lucide-react";
import { useLiveEvents } from "../hooks/useLiveEvents";
import EventCard from "../components/events/EventCard";

/**
 * Alerts is a client-side view over the same event data already fetched by
 * useLiveEvents (GET /api/events) — no new API call. It simply highlights
 * events that are severe, flagged as hotspots, or suspicious/contradicted,
 * which is exactly the subset a "weather alerts" view should surface.
 */
export default function Alerts() {
  const { events, loading } = useLiveEvents({});

  const alerts = useMemo(
    () =>
      events.filter(
        (e) =>
          e.severity === "severe" ||
          e.severity === "high" ||
          e.is_hotspot ||
          e.status === "suspicious" ||
          e.status === "contradicted"
      ),
    [events]
  );

  const severe = alerts.filter((e) => e.severity === "severe" || e.severity === "high");
  const hotspots = alerts.filter((e) => e.is_hotspot);
  const flagged = alerts.filter((e) => e.status === "suspicious" || e.status === "contradicted");

  if (loading) return <div className="text-sm text-slate-500">Loading alerts…</div>;

  if (alerts.length === 0) {
    return (
      <div className="text-center py-16 text-slate-400">
        <ShieldAlert className="w-10 h-10 mx-auto mb-3 opacity-40" />
        <p className="text-sm">No active alerts right now — no severe, hotspot, or flagged events.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {severe.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">High / Severe Events ({severe.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {severe.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {hotspots.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-red-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Hotspot Clusters ({hotspots.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {hotspots.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}

      {flagged.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Suspicious / Contradicted ({flagged.length})</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {flagged.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
