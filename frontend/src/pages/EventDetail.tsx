import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Flame, ShieldCheck, ShieldX, Clock, MapPin } from "lucide-react";
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
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
      <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">Admin actions:</span>
      <button
        disabled={busy}
        onClick={() => act("verify")}
        className="flex items-center gap-1.5 text-xs font-medium bg-emerald-600 text-white px-3 py-1.5 rounded-lg
                   hover:bg-emerald-700 disabled:opacity-50 transition-surface"
      >
        <ShieldCheck className="w-3.5 h-3.5" /> Verify Event
      </button>
      <button
        disabled={busy}
        onClick={() => act("reject")}
        className="flex items-center gap-1.5 text-xs font-medium bg-red-600 text-white px-3 py-1.5 rounded-lg
                   hover:bg-red-700 disabled:opacity-50 transition-surface"
      >
        <ShieldX className="w-3.5 h-3.5" /> Reject Event
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }
  if (!data) return <div className="p-6 text-red-500">Event not found.</div>;

  const { event, verification, evidence, reports } = data;

  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-fade-in">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-meghteal hover:text-meghblue dark:hover:text-sky-300 transition-surface">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>

      <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 transition-surface">
        <div className="flex justify-between items-start gap-3">
          <div>
            <h1 className="text-xl font-bold text-meghblue dark:text-sky-300 flex items-center gap-2 flex-wrap">
              {event.category.toUpperCase()}
              <span className="text-slate-400 dark:text-slate-500 font-normal text-base flex items-center gap-1">
                <MapPin className="w-4 h-4" /> {event.city}, {event.state}
              </span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {reports.length} report(s) · {new Set(reports.map((r) => r.source_type)).size} source type(s) ·
              Confidence: <strong className="text-meghteal dark:text-sky-300">{Number(event.confidence_score).toFixed(1)}%</strong>
            </p>
          </div>
          <StatusBadge status={event.status} />
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
          <CategoryBadge category={event.category} />
          <SeverityChip severity={event.severity} />
          {event.is_hotspot && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold
                              bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800">
              <Flame className="w-3 h-3" /> Hotspot · Cluster #{event.cluster_id}
            </span>
          )}
        </div>

        {event.is_hotspot && event.affected_area_km2 != null && Number(event.affected_area_km2) > 0 && (
          <p className="text-xs text-red-500 dark:text-red-400 mt-2">
            Estimated affected area (geospatial cluster convex hull): ~{Number(event.affected_area_km2).toFixed(1)} km²
          </p>
        )}

        <p className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500 mt-3">
          <Clock className="w-3.5 h-3.5" />
          First seen {new Date(event.first_seen_at).toLocaleString()} · Last updated {new Date(event.last_updated_at).toLocaleString()}
        </p>

        <AdminActions eventId={event.id} onDone={fetchDetail} />
      </div>

      <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 transition-surface">
        <EvidencePanel verification={verification} evidence={evidence} />
      </div>

      <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 transition-surface">
        <h3 className="text-sm font-semibold text-meghblue dark:text-sky-300 mb-3">Linked Reports (raw evidence trail)</h3>
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id} className="border-b last:border-0 border-slate-100 dark:border-slate-800 pb-3">
              <p className="text-sm text-slate-800 dark:text-slate-200">{r.raw_text}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
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
