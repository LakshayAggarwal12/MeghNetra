import React from "react";
import {
  CloudRain, Waves, Zap, Thermometer, CloudFog, Wind as WindIcon,
  Tornado, CircleDot, ShieldCheck, ShieldQuestion, ShieldAlert, ShieldX, HelpCircle,
} from "lucide-react";

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

const CATEGORY_ICONS: Record<string, any> = {
  rainfall: CloudRain,
  thunderstorm: Zap,
  flooding: Waves,
  heatwave: Thermometer,
  fog: CloudFog,
  dust_storm: WindIcon,
  strong_wind: WindIcon,
  cyclone: Tornado,
  other: CircleDot,
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  moderate: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  high: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
  severe: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
};

const STATUS_META: Record<string, { color: string; icon: any; label: string }> = {
  verified: { color: "bg-emerald-600 text-white", icon: ShieldCheck, label: "Verified" },
  likely_authentic: { color: "bg-teal-500 text-white", icon: ShieldCheck, label: "Likely Authentic" },
  unverified: { color: "bg-slate-400 text-white", icon: ShieldQuestion, label: "Unverified" },
  suspicious: { color: "bg-amber-500 text-white", icon: ShieldAlert, label: "Suspicious" },
  contradicted: { color: "bg-red-600 text-white", icon: ShieldX, label: "Contradicted" },
};

export function CategoryBadge({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] || HelpCircle;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold
                      bg-meghblue/10 text-meghblue border border-meghblue/20
                      dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20 transition-surface">
      <Icon className="w-3 h-3" />
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border transition-surface ${
        SEVERITY_COLORS[severity] || "bg-gray-100 text-gray-700 border-gray-300"
      }`}
    >
      {severity?.toUpperCase()}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { color: "bg-gray-400 text-white", icon: HelpCircle, label: status };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm transition-surface ${meta.color}`}>
      <Icon className="w-3.5 h-3.5" />
      {meta.label}
    </span>
  );
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);
export const STATUS_OPTIONS = Object.entries(
  Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]))
);
