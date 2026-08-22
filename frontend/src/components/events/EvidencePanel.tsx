import React from "react";
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
    return <div className="text-sm text-gray-500">No verification computed yet for this event.</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-meghblue mb-2">Evidence Factors</h3>
        <ul className="space-y-1">
          {Object.entries(verification.factor_scores).map(([key, f]) => {
            const meaningfullyContributed = f.value > 0.5;
            return (
              <li key={key} className="flex items-center gap-2 text-sm">
                <span className={meaningfullyContributed ? "text-emerald-600" : "text-gray-300"}>
                  {meaningfullyContributed ? "✓" : "○"}
                </span>
                <span className={meaningfullyContributed ? "text-gray-800" : "text-gray-400"}>
                  {FACTOR_LABELS[key] || key}
                </span>
                <span className="text-xs text-gray-400 ml-auto">
                  value {f.value.toFixed(2)} × weight {f.weight} = {f.contribution.toFixed(3)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {evidence.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-meghblue mb-2">Corroborating Evidence</h3>
          <ul className="space-y-1">
            {evidence.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-emerald-600">✓</span>
                {e.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
