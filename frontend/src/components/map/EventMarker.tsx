import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MapPin, FileText, Radio, Flame, ArrowRight } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

const SEVERITY_MARKER_COLOR: Record<string, string> = {
  low: "#22c55e",
  moderate: "#eab308",
  high: "#f97316",
  severe: "#dc2626",
};

function buildIcon(severity: string, isHotspot?: boolean) {
  const color = SEVERITY_MARKER_COLOR[severity] || "#64748b";
  const ring = isHotspot ? `box-shadow:0 0 0 3px rgba(220,38,38,0.35), 0 0 4px rgba(0,0,0,0.4);` : `box-shadow:0 0 4px rgba(0,0,0,0.4);`;
  return L.divIcon({
    className: "",
    html: `<div style="
      width:16px;height:16px;border-radius:50%;
      background:${color};border:2px solid white;
      ${ring}
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

export default function EventMarker({ event }: { event: WeatherEvent }) {
  return (
    <Marker position={[event.lat, event.lng]} icon={buildIcon(event.severity, event.is_hotspot)}>
      <Popup>
        <div className="space-y-2 min-w-[220px] font-sans">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="font-bold text-meghblue text-sm">{event.category.toUpperCase()}</div>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="w-3 h-3" /> {event.city}, {event.state}
              </div>
            </div>
            <StatusBadge status={event.status} />
          </div>

          <div className="flex gap-1 flex-wrap">
            <CategoryBadge category={event.category} />
            <SeverityChip severity={event.severity} />
          </div>

          {event.is_hotspot && (
            <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
              <Flame className="w-3.5 h-3.5" />
              Hotspot (cluster #{event.cluster_id})
              {event.affected_area_km2 != null && Number(event.affected_area_km2) > 0
                ? ` · ~${Number(event.affected_area_km2).toFixed(1)} km²`
                : ""}
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
            <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {event.report_count}</span>
            <span className="flex items-center gap-1"><Radio className="w-3 h-3" /> {event.source_count}</span>
            <span className="ml-auto font-semibold text-meghteal">{Number(event.confidence_score).toFixed(0)}%</span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="flex items-center justify-center gap-1 text-xs font-medium text-white bg-meghblue
                       hover:bg-meghteal rounded-md py-1.5 transition-colors"
          >
            View full evidence <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}
