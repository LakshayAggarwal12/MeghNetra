import React from "react";
import { Link } from "react-router-dom";
import { MapPin, FileText, Radio, Flame, Activity } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function EventCard({ event }: { event: WeatherEvent }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="group relative block bg-white/60 dark:bg-slate-800/40 backdrop-blur-md rounded-2xl p-4
                 border border-slate-200 dark:border-white/5 shadow-sm
                 hover:shadow-md hover:-translate-y-1 hover:bg-white/90 dark:hover:bg-slate-800/80
                 hover:border-cyan-400/30 dark:hover:border-cyan-500/30
                 transition-all duration-300 overflow-hidden"
    >
      {/* Subtle hover gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/0 group-hover:from-cyan-500/5 group-hover:to-transparent transition-colors duration-500 pointer-events-none" />

      <div className="relative flex justify-between items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-900/50 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-cyan-100 dark:group-hover:bg-cyan-900/30 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors shrink-0 shadow-inner">
              <Activity className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm text-slate-800 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate">
                {event.category.toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                <span className="truncate">{event.city}, {event.state}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="shrink-0 mt-1">
          <StatusBadge status={event.status} />
        </div>
      </div>

      <div className="relative flex gap-2 mt-3 flex-wrap items-center">
        <CategoryBadge category={event.category} />
        <SeverityChip severity={event.severity} />
        {event.is_hotspot && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
                           bg-rose-100 text-rose-700 border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50 shadow-sm animate-pulse">
            <Flame className="w-3 h-3" /> Hotspot
          </span>
        )}
      </div>

      <div className="relative flex items-center gap-4 mt-4 pt-3 border-t border-slate-200 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
        <span className="flex items-center gap-1.5">
          <FileText className="w-3.5 h-3.5 text-slate-400" /> 
          {event.report_count} <span className="hidden sm:inline">reports</span>
        </span>
        <span className="flex items-center gap-1.5">
          <Radio className="w-3.5 h-3.5 text-slate-400" /> 
          {event.source_count} <span className="hidden sm:inline">sources</span>
        </span>
        
        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">Conf</span>
          <span className="font-bold text-cyan-700 dark:text-cyan-400 tabular-nums bg-cyan-50 dark:bg-cyan-900/20 px-1.5 py-0.5 rounded-md text-xs border border-cyan-100 dark:border-cyan-800/50 shadow-sm">
            {Number(event.confidence_score).toFixed(0)}%
          </span>
        </div>
      </div>
    </Link>
  );
}