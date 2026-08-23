import React, { useState } from "react";
import { SendHorizontal, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
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
    <div className="max-w-xl mx-auto animate-fade-in">
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        Describe what you're observing — flooding, heavy rain, strong winds, fog, or any other severe
        weather. Your report will be automatically classified, geolocated, and cross-checked against
        other sources.
      </p>

      <form
        onSubmit={submit}
        className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5 space-y-4 transition-surface"
      >
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">What are you observing?</label>
          <textarea
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                       text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface resize-none"
            rows={4}
            placeholder="e.g. Heavy flooding in Sector 62, Noida — roads are submerged"
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            minLength={5}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1.5">
            City / locality (optional but helps accuracy)
          </label>
          <input
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800
                       text-slate-800 dark:text-slate-100 rounded-lg px-3 py-2.5 text-sm
                       focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface"
            placeholder="e.g. Noida"
            value={locationHint}
            onChange={(e) => setLocationHint(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex items-center gap-2 bg-meghblue text-white text-sm font-medium px-4 py-2.5 rounded-lg
                     hover:bg-meghteal disabled:opacity-50 transition-surface"
        >
          {status === "submitting" ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
          {status === "submitting" ? "Submitting…" : "Submit Report"}
        </button>

        {status === "done" && (
          <div className="flex items-start gap-2 text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Report received (ID: {reportId?.slice(0, 8)}…) and queued for processing. It will appear on
              the dashboard within a few seconds once classified and verified.
            </span>
          </div>
        )}
        {status === "error" && (
          <div className="flex items-start gap-2 text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-fade-in">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            {errorMsg}
          </div>
        )}
      </form>
    </div>
  );
}
