import React, { useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";

export default function CitizenReport() {
  const [text, setText] = useState("");
  const [locationHint, setLocationHint] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [reportId, setReportId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const { data } = await client.post("/reports", { text, locationHint: locationHint || undefined });
      setReportId(data.reportId);
      setStatus("done");
      setText("");
      setLocationHint("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error?.message || "Failed to submit report. Please try again.");
      setStatus("error");
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <Link to="/" className="text-sm text-meghteal underline">
        ← Back to dashboard
      </Link>

      <h1 className="text-xl font-bold text-meghblue mt-2 mb-1">Submit a Weather Report</h1>
      <p className="text-sm text-gray-500 mb-4">
        Describe what you're observing — flooding, heavy rain, strong winds, fog, or any other severe
        weather. Your report will be automatically classified, geolocated, and cross-checked against
        other sources.
      </p>

      <form onSubmit={submit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">What are you observing?</label>
          <textarea
            className="w-full border rounded px-3 py-2 text-sm"
            rows={4}
            placeholder="e.g. Heavy flooding in Sector 62, Noida — roads are submerged"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            minLength={5}
          />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">City / locality (optional but helps accuracy)</label>
          <input
            className="w-full border rounded px-3 py-2 text-sm"
            placeholder="e.g. Noida"
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="bg-meghblue text-white text-sm px-4 py-2 rounded hover:bg-meghteal disabled:opacity-50"
        >
          {status === "submitting" ? "Submitting…" : "Submit Report"}
        </button>

        {status === "done" && (
          <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded p-3">
            Report received (ID: {reportId?.slice(0, 8)}…) and queued for processing. It will appear on
            the dashboard within a few seconds once classified and verified.
          </div>
        )}
        {status === "error" && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">{errorMsg}</div>
        )}
      </form>
    </div>
  );
}
