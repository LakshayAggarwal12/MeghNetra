import React from "react";
import { CheckCircle2, Circle, ListChecks, FileCheck2 } from "lucide-react";
import type { VerificationResult, EvidenceItem } from "../../types/models";

const FACTOR_LABELS: Record<string, string> = {
  weather_observation_agreement: "Weather observation agreement",
  cross_source_agreement: "Independent source agreement",
  source_reliability: "Source reliability",
  location_consistency: "Geographic consistency",
  temporal_consistency: "Temporal consistency",
};

export default function EvidencePanel({
  verification,
  evidence,
}: {
  verification: VerificationResult | null;
  evidence: EvidenceItem[];
}) {
  if (!verification) {
    return <div className="text-sm text-slate-500 dark:text-slate-400">No verification computed yet for this event.</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <ListChecks className="w-4 h-4 text-meghteal" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Evidence Factors</h3>
        </div>
        <ul className="space-y-2">
          {Object.entries(verification.factor_scores).map(([key, f]) => {
            const contributed = f.value > 0.5;
            return (
              <li
                key={key}
                className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-surface ${
                  contributed
                    ? "bg-emerald-50 dark:bg-emerald-900/20"
                    : "bg-slate-50 dark:bg-slate-800/50"
                }`}
              >
                {contributed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-300 dark:text-slate-600 shrink-0" />
                )}
                <span className={contributed ? "text-slate-800 dark:text-slate-100" : "text-slate-400 dark:text-slate-500"}>
                  {FACTOR_LABELS[key] || key}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto tabular-nums">
                  {f.value.toFixed(2)} × {f.weight} = {f.contribution.toFixed(3)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {evidence.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FileCheck2 className="w-4 h-4 text-meghteal" />
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Corroborating Evidence</h3>
          </div>
          <ul className="space-y-2">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {e.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
