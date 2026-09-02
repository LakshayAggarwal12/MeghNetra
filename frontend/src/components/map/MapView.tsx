import React from "react";
import { MapContainer, TileLayer, Circle, Tooltip, ZoomControl } from "react-leaflet";
import EventMarker from "./EventMarker";
import type { WeatherEvent } from "../../types/models";
import { useSettings } from "../../context/SettingsContext";

const INDIA_CENTER: [number, number] = [22.5, 80];

const TILE_URLS: Record<string, string> = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  muted: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
};

// Layer 5 — Geospatial Analysis: render a translucent glowing circle behind each
// distinct hotspot cluster with smooth dashed tactical borders.
function HotspotOverlays({ events }: { events: WeatherEvent[] }) {
  const hotspotEvents = events.filter((e) => e.is_hotspot && e.cluster_id !== null && e.cluster_id !== undefined);
  const byCluster = new Map<number, WeatherEvent[]>();
  for (const e of hotspotEvents) {
    const key = e.cluster_id as number;
    if (!byCluster.has(key)) byCluster.set(key, []);
    byCluster.get(key)!.push(e);
  }

  return (
    <>
      {Array.from(byCluster.entries()).map(([clusterId, members]) => {
        const avgLat = members.reduce((s, e) => s + e.lat, 0) / members.length;
        const avgLng = members.reduce((s, e) => s + e.lng, 0) / members.length;
        return (
          <Circle
            key={`hotspot-${clusterId}`}
            center={[avgLat, avgLng]}
            radius={55000}
            pathOptions={{ 
              color: "#e11d48", 
              fillColor: "#e11d48", 
              fillOpacity: 0.15, 
              weight: 2, 
              dashArray: "6 6" 
            }}
          >
            <Tooltip direction="top" opacity={0.95} className="custom-gis-tooltip">
              <span className="font-bold text-rose-600">🚨 Hotspot Cluster #{clusterId}</span> — {members.length} correlated events
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}

function MapLegend() {
  const items = [
    { color: "#10b981", label: "Low" },
    { color: "#f59e0b", label: "Moderate" },
    { color: "#f97316", label: "High" },
    { color: "#e11d48", label: "Severe" },
  ];
  return (
    <div className="absolute bottom-4 left-4 z-[400] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl shadow-xl
                    border border-slate-200/80 dark:border-white/10 px-4 py-3 text-xs">
      <div className="font-extrabold text-slate-700 dark:text-slate-200 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
        <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" /> Threat Severity Scale
      </div>
      <div className="flex items-center gap-3">
        {items.map((it) => (
          <span key={it.label} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 font-semibold text-[11px]">
            <span className="w-3 h-3 rounded-full shadow-sm inline-block border border-white/40" style={{ backgroundColor: it.color }} />
            {it.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MapView({ events }: { events: WeatherEvent[] }) {
  const { mapTileStyle } = useSettings();

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden">
      <MapContainer center={INDIA_CENTER} zoom={5} zoomControl={false} style={{ height: "100%", width: "100%" }}>
        <ZoomControl position="topright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={TILE_URLS[mapTileStyle] || TILE_URLS.standard}
        />
        <HotspotOverlays events={events} />
        {events
          .filter((e) => e.lat && e.lng)
          .map((event) => (
            <EventMarker key={event.id} event={event} />
          ))}
      </MapContainer>
      <MapLegend />
    </div>
  );
}