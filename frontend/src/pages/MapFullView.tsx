import React, { useState } from "react";
import MapView from "../components/map/MapView";
import FilterBar from "../components/filters/FilterBar";
import { useLiveEvents, EventFilters } from "../hooks/useLiveEvents";

export default function MapFullView() {
  const [filters, setFilters] = useState<EventFilters>({});
  const { events, loading } = useLiveEvents(filters);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <FilterBar filters={filters} onChange={setFilters} />
      <div className="flex-1 min-h-[70vh] bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 overflow-hidden relative">
        {loading && (
          <div className="absolute inset-0 z-[400] flex items-center justify-center bg-white/60 dark:bg-slate-900/60 text-sm text-slate-500">
            Loading events…
          </div>
        )}
        <MapView events={events} />
      </div>
    </div>
  );
}
