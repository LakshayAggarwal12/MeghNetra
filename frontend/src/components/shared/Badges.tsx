import React from "react";

const CATEGORY_LABELS: Record<string, string> = {
  rainfall: "Rainfall",
  thunderstorm: "Thunderstorm",
  flooding: "Flooding",
  heatwave: "Heatwave",
  fog: "Fog",
  dust_storm: "Dust Storm",
  strong_wind: "Strong Wind",
  cyclone: "Cyclone",
  other: "Other",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-green-100 text-green-800 border-green-300",
  moderate: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  severe: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_COLORS: Record<string, string> = {
  verified: "bg-emerald-600 text-white",
  likely_authentic: "bg-teal-500 text-white",
  unverified: "bg-slate-400 text-white",
  suspicious: "bg-amber-500 text-white",
  contradicted: "bg-red-600 text-white",
};

const STATUS_LABELS: Record<string, string> = {
  verified: "Verified",
  likely_authentic: "Likely Authentic",
  unverified: "Unverified",
  suspicious: "Suspicious",
  contradicted: "Contradicted",
};

export function CategoryBadge({ category }: { category: string }) {
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-semibold bg-meghblue/10 text-meghblue border border-meghblue/20">
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-semibold border ${
        SEVERITY_COLORS[severity] || "bg-gray-100 text-gray-700 border-gray-300"
      }`}
    >
      {severity?.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
        STATUS_COLORS[status] || "bg-gray-400 text-white"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);
export const STATUS_OPTIONS = Object.entries(STATUS_LABELS);
