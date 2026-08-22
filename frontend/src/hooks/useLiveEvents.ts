import { useEffect, useRef, useState, useCallback } from "react";
import client from "../api/client";
import { getSocket } from "../sockets/socket";
import type { WeatherEvent } from "../types/models";

export interface EventFilters {
  from?: string;
  to?: string;
  category?: string;
  state?: string;
  status?: string;
}

export function useLiveEvents(filters: EventFilters) {
  const [events, setEvents] = useState<WeatherEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(
        Object.entries(filtersRef.current).filter(([, v]) => v !== undefined && v !== "")
      );
      const { data } = await client.get("/events", { params });
      setEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.from, filters.to, filters.category, filters.state, filters.status]);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => {
      setConnected(true);
      refetch(); // resync in case updates were missed while disconnected
    };
    const onDisconnect = () => setConnected(false);

    const onEventUpdate = (incoming: WeatherEvent) => {
      setEvents((prev) => {
        const idx = prev.findIndex((e) => e.id === incoming.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = { ...next[idx], ...incoming };
          return next;
        }
        return [incoming, ...prev];
      });
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("event:update", onEventUpdate);
    setConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("event:update", onEventUpdate);
    };
  }, [refetch]);

  return { events, loading, connected, refetch };
}
