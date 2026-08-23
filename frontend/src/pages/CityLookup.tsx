import React, { useState } from "react";
import { Search, CloudSun, Newspaper, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import client from "../api/client";

interface SearchResult {
  city: string;
  weather: { mode: string; summary: string | null } | null;
  weatherError: string | null;
  newsItemsFound: number;
  newsItemsQueued: number;
  reportIds: string[];
  message: string;
}

export default function CityLookup() {
  const [city, setCity] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const { data } = await client.post("/search/city", { city: city.trim() });
      setResult(data);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Lookup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-5">
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Enter any Indian city to fetch current weather-API conditions and search configured news/RSS
          feeds for mentions of that city, right now — bypassing the normal polling schedule. Anything
          found is queued through the same AI pipeline and will appear on the dashboard within seconds.
        </p>

        <form onSubmit={submit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600
                         bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100
                         focus:outline-none focus:ring-2 focus:ring-meghteal transition-surface"
              placeholder="e.g. Noida, Chennai, Guwahati…"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !city.trim()}
            className="px-4 py-2.5 rounded-lg bg-meghblue text-white text-sm font-medium hover:bg-meghteal
                       disabled:opacity-50 transition-surface flex items-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </form>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-300 border border-red-200 dark:border-red-800 rounded-lg p-3 animate-fade-in">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg p-3">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {result.message}
          </div>

          <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudSun className="w-4 h-4 text-meghteal" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Weather API result — {result.city}</h3>
            </div>
            {result.weather ? (
              <p className="text-sm text-slate-600 dark:text-slate-300">
                {result.weather.summary || "Fetched and queued for processing."}
                <span className="text-xs text-slate-400 ml-2">({result.weather.mode})</span>
              </p>
            ) : (
              <p className="text-sm text-red-500">{result.weatherError || "No weather data returned."}</p>
            )}
          </div>

          <div className="bg-white dark:bg-meghcard-dark rounded-xl shadow-card border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper className="w-4 h-4 text-meghteal" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">News / RSS mentions</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Found {result.newsItemsFound} item(s) mentioning "{result.city}", queued {result.newsItemsQueued}{" "}
              for processing.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
