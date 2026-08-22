import React from "react";
import { Link } from "react-router-dom";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

export default function EventCard({ event }: { event: WeatherEvent }) {
  return (
    <Link
      to={`/events/${event.id}`}
      className="block bg-white rounded-lg shadow-sm border border-gray-200 p-3 hover:border-meghteal transition-colors"
    >
      <div className="flex justify-between items-start">
        <div>
          <div className="font-semibold text-meghblue">
            {event.category.toUpperCase()} — {event.city}, {event.state}
          </div>
          <div className="text-xs text-gray-500">
            {event.report_count} report(s) · {event.source_count} source(s) · Confidence:{" "}
            {Number(event.confidence_score).toFixed(0)}%
          </div>
        </div>
        <StatusBadge status={event.status} />
      </div>
      <div className="flex gap-1 mt-2">
        <CategoryBadge category={event.category} />
        <SeverityChip severity={event.severity} />
      </div>
    </Link>
  );
}
