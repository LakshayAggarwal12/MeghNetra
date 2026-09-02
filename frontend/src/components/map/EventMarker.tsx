import React from "react";
import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { MapPin, FileText, Radio, Flame, ArrowRight, Activity } from "lucide-react";
import type { WeatherEvent } from "../../types/models";
import { CategoryBadge, SeverityChip, StatusBadge } from "../shared/Badges";

const SEVERITY_MARKER_COLOR: Record<string, string> = {
  low: "#10b981",      // emerald-500
  moderate: "#f59e0b", // amber-500
  high: "#f97316",     // orange-500
  severe: "#e11d48",   // rose-600
};

function buildIcon(severity: string, isHotspot?: boolean) {
  const color = SEVERITY_MARKER_COLOR[severity] || "#64748b";
  
  // Tactical Radar Ping Animation
  return L.divIcon({
    className: "bg-transparent border-none", // Overrides default Leaflet square
    html: `
      <div class="relative flex items-center justify-center w-8 h-8">
        <span class="absolute inline-flex w-full h-full rounded-full opacity-40 ${isHotspot ? 'animate-[ping_1s_infinite]' : 'animate-[ping_2s_infinite]'}" style="background-color: ${color};"></span>
        <span class="relative inline-flex w-3.5 h-3.5 rounded-full border-[2.5px] border-white shadow-[0_0_8px_rgba(0,0,0,0.5)]" style="background-color: ${color};"></span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -14],
  });
}

export default function EventMarker({ event }: { event: WeatherEvent }) {
  return (
    <Marker position={[event.lat, event.lng]} icon={buildIcon(event.severity, event.is_hotspot)}>
      <Popup className="pro-gis-popup">
        <div className="space-y-3 min-w-[260px] font-sans p-0.5">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-cyan-600" />
                {event.category.toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> {event.city}, {event.state}
              </div>
            </div>
            <div className="shrink-0 scale-90 origin-top-right">
              <StatusBadge status={event.status} />
            </div>
          </div>

          {/* Badges */}
          <div className="flex gap-1.5 flex-wrap">
            <div className="scale-90 origin-left"><CategoryBadge category={event.category} /></div>
            <div className="scale-90 origin-left"><SeverityChip severity={event.severity} /></div>
          </div>

          {/* Hotspot Alert */}
          {event.is_hotspot && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-700 font-bold tracking-wide">
              <Flame className="w-4 h-4 animate-pulse" />
              Hotspot Cluster #{event.cluster_id}
              {event.affected_area_km2 != null && Number(event.affected_area_km2) > 0
                ? ` · ~${Number(event.affected_area_km2).toFixed(1)} km²`
                : ""}
            </div>
          )}

          {/* Stats Footer */}
          <div className="flex items-center gap-4 text-[11px] text-slate-600 font-medium pt-2 border-t border-slate-200">
            <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" /> {event.report_count}</span>
            <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-slate-400" /> {event.source_count}</span>
            <div className="ml-auto flex items-center gap-1">
              <span className="text-[9px] uppercase tracking-widest text-slate-400">Conf</span>
              <span className="font-bold text-cyan-700 tabular-nums">{Number(event.confidence_score).toFixed(0)}%</span>
            </div>
          </div>

          {/* Call to Action */}
          <Link
            to={`/events/${event.id}`}
            className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-white 
                       bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                       shadow-[0_4px_12px_rgba(8,145,178,0.25)] rounded-lg py-2.5 mt-1 transition-all hover:scale-[1.02]"
          >
            View Evidence <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </Popup>
    </Marker>
  );
}