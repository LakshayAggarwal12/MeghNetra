import React from "react";
import { MapContainer, TileLayer, Circle, Tooltip } from "react-leaflet";
import EventMarker from "./EventMarker";
import type { WeatherEvent } from "../../types/models";

const INDIA_CENTER: [number, number] = [22.5, 80];

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
            pathOptions={{ color: "#dc2626", fillColor: "#dc2626", fillOpacity: 0.12, weight: 1 }}
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

export default function MapView({ events }: { events: WeatherEvent[] }) {
  return (
    <MapContainer center={INDIA_CENTER} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <HotspotOverlays events={events} />
      {events
        .filter((e) => e.lat && e.lng)
        .map((event) => (
          <EventMarker key={event.id} event={event} />
        ))}
    </MapContainer>
  );
}
