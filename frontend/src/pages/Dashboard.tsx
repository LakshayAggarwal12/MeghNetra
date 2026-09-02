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
    <div className="-m-4 md:-m-6 bg-slate-50 dark:bg-slate-950 min-h-screen">
      {/* Enhanced Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-meghteal px-6 pt-20 pb-40 text-center isolate">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-meghblue/40 blur-[120px] rounded-full mix-blend-screen -z-10 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.05),transparent_70%)] -z-10" />

        <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-xs font-semibold tracking-wide mb-8 shadow-[0_0_15px_rgba(255,255,255,0.1)] backdrop-blur-md hover:scale-105 transition-transform cursor-default">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,113,0.8)]" />
          </span>
          Live · Real-Time Weather Monitoring
        </div>

        <h1 className="relative text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-50 to-white/60 tracking-tight mb-6 drop-shadow-sm">
          Eye On Every Storm,
          <br />
          Before It Becomes A Crisis
        </h1>
        <p className="relative max-w-2xl mx-auto text-white/80 text-base md:text-lg font-light leading-relaxed">
          National weather-event monitoring, verified in real time from citizen
          reports, weather APIs, and news &mdash; powered by AI.
        </p>
      </div>

      {/* Main Content Panel */}
      <div className="relative -mt-28 px-4 md:px-8 pb-10 z-10">
        <div className="max-w-7xl mx-auto space-y-6 bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-3xl shadow-2xl ring-1 ring-slate-200 dark:ring-white/10 p-6 md:p-8">
          
          <StatCounters />
          
          {/* FilterBar safely placed above the Map */}
          <div className="w-full flex justify-center pt-2">
            <FilterBar filters={filters} onChange={setFilters} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
            {/* Map Container */}
            <div className="lg:col-span-2 h-[560px] bg-slate-100 dark:bg-slate-800/50 rounded-2xl shadow-sm ring-1 ring-slate-200 dark:ring-white/5 overflow-hidden transition-all hover:shadow-md z-0">
              <MapView events={events} />
            </div>
            
            {/* Event Cards List */}
            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
              {loading &&
                [0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-28 rounded-2xl bg-slate-200/50 dark:bg-slate-800/50 animate-pulse ring-1 ring-slate-100 dark:ring-white/5" />
                ))}
              {!loading && events.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <Inbox className="w-10 h-10 mb-4 text-slate-400 dark:text-slate-600" />
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">No Active Events</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-500">Try adjusting your filters to see historical data.</p>
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