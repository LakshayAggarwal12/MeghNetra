import React from "react";
import { MapContainer, TileLayer } from "react-leaflet";
import EventMarker from "./EventMarker";
import type { WeatherEvent } from "../../types/models";

const INDIA_CENTER: [number, number] = [22.5, 80];

export default function MapView({ events }: { events: WeatherEvent[] }) {
  return (
    <MapContainer center={INDIA_CENTER} zoom={5} style={{ height: "100%", width: "100%" }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {events
        .filter((e) => e.lat && e.lng)
        .map((event) => (
          <EventMarker key={event.id} event={event} />
        ))}
    </MapContainer>
  );
}
