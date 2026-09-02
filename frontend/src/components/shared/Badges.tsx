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
  low: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:text-emerald-400",
  moderate: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:text-amber-400",
  high: "bg-orange-500/10 text-orange-700 border-orange-500/30 dark:text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.15)]",
  severe: "bg-rose-500/10 text-rose-700 border-rose-500/40 dark:text-rose-400 shadow-[0_0_12px_rgba(225,29,72,0.25)] animate-pulse",
};

const STATUS_META: Record<string, { color: string; icon: any; label: string }> = {
  verified: { color: "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.3)] border-emerald-400/50", icon: ShieldCheck, label: "Verified" },
  likely_authentic: { color: "bg-gradient-to-r from-teal-400 to-cyan-500 text-white shadow-[0_0_10px_rgba(20,184,166,0.3)] border-teal-300/50", icon: ShieldCheck, label: "Likely Authentic" },
  unverified: { color: "bg-gradient-to-r from-slate-400 to-slate-500 text-white border-slate-400/50", icon: ShieldQuestion, label: "Unverified" },
  suspicious: { color: "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-[0_0_10px_rgba(245,158,11,0.3)] border-amber-400/50", icon: ShieldAlert, label: "Suspicious" },
  contradicted: { color: "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-[0_0_10px_rgba(225,29,72,0.3)] border-rose-400/50", icon: ShieldX, label: "Contradicted" },
};

export function CategoryBadge({ category }: { category: string }) {
  const Icon = CATEGORY_ICONS[category] || HelpCircle;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider
                      bg-slate-100/80 text-slate-600 border border-slate-200/60
                      dark:bg-slate-800/60 dark:text-slate-300 dark:border-white/10 backdrop-blur-md transition-all hover:bg-slate-200/80 dark:hover:bg-slate-700/80 shadow-sm">
      <Icon className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

export function SeverityChip({ severity }: { severity: string }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-widest border backdrop-blur-sm transition-all ${
        SEVERITY_COLORS[severity] || "bg-gray-100 text-gray-700 border-gray-300"
      }`}
    >
      {severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const meta = STATUS_META[status] || { color: "bg-slate-500 text-white border-slate-400", icon: HelpCircle, label: status };
  const Icon = meta.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md transition-transform hover:scale-105 ${meta.color}`}>
      <Icon className="w-3.5 h-3.5 drop-shadow-sm" />
      {meta.label}
    </span>
  );
}

export const CATEGORY_OPTIONS = Object.entries(CATEGORY_LABELS);
export const STATUS_OPTIONS = Object.entries(
  Object.fromEntries(Object.entries(STATUS_META).map(([k, v]) => [k, v.label]))
);