import React, { useEffect, useState } from "react";
import { Filter, X, Calendar, Tag, MapPin, ShieldCheck } from "lucide-react";
import client from "../../api/client";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "../shared/Badges";
import type { EventFilters } from "../../hooks/useLiveEvents";

interface Props {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
}

const fieldClass =
  "border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 " +
  "rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface";

function FieldLabel({ icon: Icon, children }: { icon: any; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 mb-1">
      <Icon className="w-3 h-3" /> {children}
    </label>
  );
}

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
    <div className="flex flex-wrap gap-4 items-end bg-white dark:bg-meghcard-dark rounded-xl shadow-card
                    border border-slate-200 dark:border-slate-700 p-4 transition-surface">
      <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1 pr-1">
        <Filter className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wide">Filters</span>
      </div>

      <div className="flex flex-col">
        <FieldLabel icon={Calendar}>From</FieldLabel>
        <input
          type="date"
          className={fieldClass}
          value={filters.from ? filters.from.slice(0, 10) : ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <FieldLabel icon={Calendar}>To</FieldLabel>
        <input
          type="date"
          className={fieldClass}
          value={filters.to ? filters.to.slice(0, 10) : ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <FieldLabel icon={Tag}>Category</FieldLabel>
        <select className={fieldClass} value={filters.category || ""} onChange={(e) => update("category", e.target.value)}>
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <FieldLabel icon={MapPin}>State</FieldLabel>
        <select className={fieldClass} value={filters.state || ""} onChange={(e) => update("state", e.target.value)}>
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <FieldLabel icon={ShieldCheck}>Verification Status</FieldLabel>
        <select className={fieldClass} value={filters.status || ""} onChange={(e) => update("status", e.target.value)}>
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>
      {hasActiveFilters && (
        <button
          className="flex items-center gap-1 text-xs text-meghteal hover:text-meghblue dark:hover:text-sky-300 mb-1.5 transition-surface"
          onClick={() => onChange({})}
        >
          <X className="w-3.5 h-3.5" /> Clear filters
        </button>
      )}
    </div>
  );
}
