import React, { useState } from "react";
import { Link } from "react-router-dom";
import MapView from "../components/map/MapView";
import FilterBar from "../components/filters/FilterBar";
import StatCounters from "../components/stats/StatCounters";
import TrendChart from "../components/stats/TrendChart";
import EventCard from "../components/events/EventCard";
import { useLiveEvents, EventFilters } from "../hooks/useLiveEvents";

export default function Dashboard() {
  const [filters, setFilters] = useState<EventFilters>({});
  const { events, loading, connected } = useLiveEvents(filters);

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-4">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-meghblue">MEGHNETRA</h1>
          <p className="text-sm text-gray-500">
            Eye of the Clouds — National Weather Event Intelligence Platform
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-1 rounded-full ${connected ? "bg-emerald-100 text-emerald-700" : "bg-gray-200 text-gray-500"}`}>
            {connected ? "● Live" : "○ Reconnecting…"}
          </span>
          <Link to="/report" className="bg-meghblue text-white text-sm px-3 py-2 rounded hover:bg-meghteal">
            Submit a Report
          </Link>
          <Link to="/admin" className="text-sm text-meghteal underline">
            Admin Panel
          </Link>
        </div>
      </header>

      <StatCounters />

      <FilterBar filters={filters} onChange={setFilters} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 h-[500px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <MapView events={events} />
        </div>
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {loading && <div className="text-sm text-gray-500">Loading events…</div>}
          {!loading && events.length === 0 && (
            <div className="text-sm text-gray-500">No events match the current filters.</div>
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
