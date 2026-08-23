import React, { useState } from "react";
import { Inbox } from "lucide-react";
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
    <div className="max-w-7xl mx-auto space-y-4">
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
  );
}
