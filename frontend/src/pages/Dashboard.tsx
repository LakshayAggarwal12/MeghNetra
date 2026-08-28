import React, { useState } from "react";
import { Inbox, Radio } from "lucide-react";
import MapView from "../components/map/MapView";
import FilterBar from "../components/filters/FilterBar";
import StatCounters from "../components/stats/StatCounters";
import TrendChart from "../components/stats/TrendChart";
import EventCard from "../components/events/EventCard";
import { useLiveEvents, EventFilters } from "../hooks/useLiveEvents";

export default function Dashboard() {
  const [filters, setFilters] = useState<EventFilters>({});
  const { events, loading } = useLiveEvents(filters);

  return (
    <div className="-m-4 md:-m-6">
      {/* Dark gradient hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-meghblue to-meghteal px-6 pt-14 pb-32 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.08),transparent_60%)]" />

        <div className="relative inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-medium mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          Live · Real-Time Weather Monitoring
        </div>

        <h1 className="relative text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
          Eye On Every Storm,
          <br />
          Before It Becomes A Crisis
        </h1>
        <p className="relative max-w-xl mx-auto text-white/70 text-sm md:text-base">
          National weather-event monitoring, verified in real time from citizen
          reports, weather APIs, and news &mdash; powered by AI.
        </p>
      </div>

      {/* Floating panel, pulled up over the hero */}
      <div className="relative -mt-20 px-4 md:px-6 pb-6">
        <div className="max-w-7xl mx-auto space-y-4 bg-white dark:bg-meghcard-dark rounded-2xl shadow-xl
                        border border-slate-200 dark:border-slate-700 p-4 md:p-6">
          <StatCounters />
          <FilterBar filters={filters} onChange={setFilters} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 h-[520px] bg-white dark:bg-meghcard-dark rounded-xl shadow-card
                            border border-slate-200 dark:border-slate-700 overflow-hidden transition-surface">
              <MapView events={events} />
            </div>
            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {loading &&
                [0, 1, 2].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
                ))}
              {!loading && events.length === 0 && (
                <div className="text-center py-16 text-slate-400">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No events match the current filters.</p>
                </div>
              )}
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
          <TrendChart />
        </div>
      </div>
    </div>
  );
}
