import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import { getSocket } from "../sockets/socket";
import { CategoryBadge, SeverityChip, StatusBadge } from "../components/shared/Badges";
import EvidencePanel from "../components/events/EvidencePanel";
import type { EventDetailResponse } from "../types/models";

function AdminActions({ eventId, onDone }: { eventId: string; onDone: () => void }) {
  const isAdmin = !!localStorage.getItem("meghnetra_admin_token");
  const [busy, setBusy] = useState(false);
  if (!isAdmin) return null;

  const act = async (action: "verify" | "reject") => {
    setBusy(true);
    try {
      await client.post(`/admin/events/${eventId}/${action}`);
      onDone();
    } catch (err) {
      alert("Action failed — are you still logged in as admin?");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3 border-t pt-3">
      <span className="text-xs text-gray-400 self-center mr-2">Admin actions:</span>
      <button
        disabled={busy}
        onClick={() => act("verify")}
        className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded hover:bg-emerald-700 disabled:opacity-50"
      >
        Verify Event
      </button>
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="text-xs bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 disabled:opacity-50"
      >
        Reject Event
      </button>
    </div>
  );
}

export default function EventDetail() {
  const { id } = useParams();
  const [data, setData] = useState<EventDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDetail = () => {
    client
      .get(`/events/${id}`)
      .then(({ data }) => setData(data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetail();
    const socket = getSocket();
    const onUpdate = (incoming: any) => {
      if (incoming.id === id) fetchDetail();
    };
    socket.on("event:update", onUpdate);
    return () => {
      socket.off("event:update", onUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div className="p-6 text-gray-500">Loading event…</div>;
  if (!data) return <div className="p-6 text-red-600">Event not found.</div>;

  const { event, verification, evidence, reports } = data;

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <Link to="/" className="text-sm text-meghteal underline">
        ← Back to dashboard
      </Link>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-meghblue">
              {event.category.toUpperCase()} — {event.city}, {event.state}
            </h1>
            <p className="text-sm text-gray-500">
              {reports.length} report(s) ·{" "}
              {new Set(reports.map((r) => r.source_type)).size} source type(s) · Confidence:{" "}
              <strong>{Number(event.confidence_score).toFixed(1)}%</strong>
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>
        <div className="flex gap-2 mt-3">
          <CategoryBadge category={event.category} />
          <SeverityChip severity={event.severity} />
          {event.is_hotspot && (
            <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
              ⚠ Hotspot · Cluster #{event.cluster_id}
            </span>
          )}
        </div>
        {event.is_hotspot && event.affected_area_km2 != null && Number(event.affected_area_km2) > 0 && (
          <p className="text-xs text-red-600 mt-1">
            Estimated affected area (geospatial cluster convex hull): ~
            {Number(event.affected_area_km2).toFixed(1)} km²
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          First seen {new Date(event.first_seen_at).toLocaleString()} · Last updated{" "}
          {new Date(event.last_updated_at).toLocaleString()}
        </p>
        <AdminActions eventId={event.id} onDone={fetchDetail} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <EvidencePanel verification={verification} evidence={evidence} />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
        <h3 className="text-sm font-semibold text-meghblue mb-3">Linked Reports (raw evidence trail)</h3>
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="border-b last:border-0 pb-2">
              <p className="text-sm text-gray-800">{r.raw_text}</p>
              <p className="text-xs text-gray-400 mt-1">
                {r.source_name} ({r.source_type}) · {new Date(r.submitted_at).toLocaleString()}
                {r.similarity_score !== null && ` · similarity ${Number(r.similarity_score).toFixed(2)}`}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
