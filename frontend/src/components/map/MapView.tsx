import React from "react";
import { MapContainer, TileLayer, Circle, Tooltip, ZoomControl } from "react-leaflet";
import EventMarker from "./EventMarker";
import type { WeatherEvent } from "../../types/models";
import { useSettings } from "../../context/SettingsContext";

const INDIA_CENTER: [number, number] = [22.5, 80];

const TILE_URLS: Record<string, string> = {
  standard: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
  muted: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
};

// Layer 5 — Geospatial Analysis: render a translucent circle behind each
// distinct hotspot cluster (grouped by cluster_id) so the map shows
// concentration, not just individual pins. Purely additive to the existing
// marker rendering below.
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
            radius={60000}
            pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.12, weight: 1.5, dashArray: "4 4" }}
          >
            <Tooltip direction="top" opacity={0.9} sticky>
              Hotspot — {members.length} correlated events in this area
            </Tooltip>
          </Circle>
        );
      })}
    </>
  );
}

function MapLegend() {
  const items = [
    { color: "#22c55e", label: "Low" },
    { color: "#eab308", label: "Moderate" },
    { color: "#f97316", label: "High" },
    { color: "#dc2626", label: "Severe" },
  ];
  return (
    <div className="absolute bottom-3 left-3 z-[400] bg-white/95 dark:bg-slate-800/95 backdrop-blur rounded-lg shadow-card
                    border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs">
      <div className="font-semibold text-slate-600 dark:text-slate-300 mb-1">Severity</div>
      <div className="flex items-center gap-2.5">
        {items.map((it) => (
          <span key={it.label} className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: it.color }} />
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
    <div className="relative w-full h-full">
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
