import React from "react";
import { Link } from "react-router-dom";
import { MapPin, FileText, Radio, Flame } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function EventCard({ event }: { event: WeatherEvent }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group block bg-white dark:bg-meghcard-dark rounded-xl shadow-card hover:shadow-card-hover
                 border border-slate-200 dark:border-slate-700 hover:border-meghteal/50 p-4
                 transition-surface animate-fade-in"
    >
      <div className="flex justify-between items-start gap-2">
        <div className="min-w-0">
          <div className="font-semibold text-meghblue dark:text-sky-300 group-hover:text-meghteal transition-surface truncate">
            {event.category.toUpperCase()}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3 shrink-0" />
            {event.city}, {event.state}
          </div>
        </div>
        <StatusBadge status={event.status} />
      </div>

      <div className="flex gap-1.5 mt-3 flex-wrap">
        <CategoryBadge category={event.category} />
        <SeverityChip severity={event.severity} />
        {event.is_hotspot && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold
                            bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
            <Flame className="w-3 h-3" /> Hotspot
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> {event.report_count} report(s)</span>
        <span className="flex items-center gap-1"><Radio className="w-3.5 h-3.5" /> {event.source_count} source(s)</span>
        <span className="ml-auto font-semibold text-meghteal dark:text-sky-300 tabular-nums">
          {Number(event.confidence_score).toFixed(0)}%
        </span>
      </div>
    </Link>
  );
}
