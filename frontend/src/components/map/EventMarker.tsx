import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

const SEVERITY_MARKER_COLOR: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  severe: "#dc2626",
};

function buildIcon(severity: string) {
  const color = SEVERITY_MARKER_COLOR[severity] || "#64748b";
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:2px solid white;
      box-shadow:0 0 4px rgba(0,0,0,0.5);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function EventMarker({ event }: { event: WeatherEvent }) {
  return (
    <Marker position={[event.lat, event.lng]} icon={buildIcon(event.severity)}>
      <Popup>
        <div className="space-y-1 min-w-[200px]">
          <div className="font-semibold text-meghblue">
            {event.category.toUpperCase()} — {event.city}, {event.state}
          </div>
          <div className="flex gap-1 flex-wrap">
            <CategoryBadge category={event.category} />
            <SeverityChip severity={event.severity} />
            <StatusBadge status={event.status} />
          </div>
          <div className="text-xs text-gray-600">
            {event.report_count} report(s) · {event.source_count} source(s) · Confidence:{" "}
            {Number(event.confidence_score).toFixed(0)}%
          </div>
          {event.is_hotspot && (
            <div className="text-xs text-red-600 font-medium">
              ⚠ Hotspot (cluster #{event.cluster_id})
              {event.affected_area_km2 != null && Number(event.affected_area_km2) > 0
                ? ` · ~${Number(event.affected_area_km2).toFixed(1)} km² affected`
                : ""}
            </div>
          )}
          <Link to={`/events/${event.id}`} className="text-xs text-meghteal underline">
            View full evidence →
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
