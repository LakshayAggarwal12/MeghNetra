import React, { useEffect, useState } from "react";
import client from "../../api/client";
import { CATEGORY_OPTIONS, STATUS_OPTIONS } from "../shared/Badges";
import type { EventFilters } from "../../hooks/useLiveEvents";

interface Props {
  filters: EventFilters;
  onChange: (filters: EventFilters) => void;
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

  return (
    <div className="flex flex-wrap gap-3 items-center bg-white rounded-lg shadow-sm border border-gray-200 p-3">
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">From</label>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={filters.from ? filters.from.slice(0, 10) : ""}
          onChange={(e) => update("from", e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">To</label>
        <input
          type="date"
          className="border rounded px-2 py-1 text-sm"
          value={filters.to ? filters.to.slice(0, 10) : ""}
          onChange={(e) => update("to", e.target.value)}
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Category</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value)}
        >
          <option value="">All categories</option>
          {CATEGORY_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">State</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filters.state || ""}
          onChange={(e) => update("state", e.target.value)}
        >
          <option value="">All states</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-500">Verification Status</label>
        <select
          className="border rounded px-2 py-1 text-sm"
          value={filters.status || ""}
          onChange={(e) => update("status", e.target.value)}
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>
      {(filters.from || filters.to || filters.category || filters.state || filters.status) && (
        <button
          className="text-xs text-meghteal underline mt-4"
          onClick={() => onChange({})}
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
