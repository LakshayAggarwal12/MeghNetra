import React, { useEffect, useState } from "react";
import { Filter, X, Calendar, Tag, MapPin, ShieldCheck } from "lucide-react";
import client from "../../api/client";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "../shared/Badges";
import type { EventFilters } from "../../hooks/useLiveEvents";

interface Props {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

const fieldWrapper = "flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100/50 dark:hover:bg-white/5 transition-colors cursor-pointer group";
const fieldClass = "bg-transparent text-slate-700 dark:text-slate-200 text-sm font-medium focus:outline-none appearance-none cursor-pointer w-full max-w-[130px] truncate";
const iconClass = "w-4 h-4 text-slate-400 group-hover:text-cyan-500 transition-colors shrink-0";
const divider = "hidden lg:block w-px h-8 bg-slate-200 dark:bg-slate-700/50 mx-1";

export default function FilterBar({ filters, onChange }: Props) {
  const [states, setStates] = useState<string[]>([]);

  useEffect(() => {
    client
      .get("/events/meta/states")
      .then(({ data }) => setStates(data.states))
      .catch(() => setStates([]));
  }, []);

  const update = (key: keyof EventFilters, value: string) => {
    onChange({ ...filters, [key]: value || undefined });
  };

  const hasActiveFilters = filters.from || filters.to || filters.category || filters.state || filters.status;

  return (
    <div className="relative z-20 flex flex-wrap lg:flex-nowrap items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-white/10 p-1.5 transition-all w-full max-w-max mx-auto mb-6">
      
      {/* Title / Icon */}
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500/10 to-transparent rounded-xl border-l-2 border-cyan-400">
        <Filter className="w-4 h-4 text-cyan-500" />
        <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400">Filters</span>
      </div>

      <div className={divider} />

      {/* Date Range */}
      <div className={fieldWrapper}>
        <Calendar className={iconClass} />
        <input
          type="date"
          className={`${fieldClass} [&::-webkit-calendar-picker-indicator]:dark:invert`}
          value={filters.from ? filters.from.slice(0, 10) : ""}
          onChange={(e) => update("from", e.target.value)}
          title="From Date"
        />
      </div>
      <span className="text-slate-300 dark:text-slate-600 font-light">-</span>
      <div className={fieldWrapper}>
        <input
          type="date"
          className={`${fieldClass} [&::-webkit-calendar-picker-indicator]:dark:invert`}
          value={filters.to ? filters.to.slice(0, 10) : ""}
          onChange={(e) => update("to", e.target.value)}
          title="To Date"
        />
      </div>

      <div className={divider} />

      {/* Category Dropdown */}
      <div className={fieldWrapper}>
        <Tag className={iconClass} />
        <select className={fieldClass} value={filters.category || ""} onChange={(e) => update("category", e.target.value)}>
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map(([key, label]) => (
            <option key={key} value={key} className="bg-slate-900">{label}</option>
          ))}
        </select>
      </div>

      <div className={divider} />

      {/* State Dropdown */}
      <div className={fieldWrapper}>
        <MapPin className={iconClass} />
        <select className={fieldClass} value={filters.state || ""} onChange={(e) => update("state", e.target.value)}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s} className="bg-slate-900">{s}</option>
          ))}
        </select>
      </div>

      <div className={divider} />

      {/* Verification Status */}
      <div className={fieldWrapper}>
        <ShieldCheck className={iconClass} />
        <select className={fieldClass} value={filters.status || ""} onChange={(e) => update("status", e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(([key, label]) => (
            <option key={key} value={key} className="bg-slate-900">{label}</option>
          ))}
        </select>
      </div>

      {/* Clear Button (Dynamic) */}
      {hasActiveFilters && (
        <>
          <div className={divider} />
          <button
            className="flex items-center gap-1.5 px-4 py-2 ml-1 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition-colors text-xs font-bold tracking-wide uppercase"
            onClick={() => onChange({})}
          >
            <X className="w-3.5 h-3.5 stroke-[3]" /> Clear
          </button>
        </>
      )}
    </div>
  );
}