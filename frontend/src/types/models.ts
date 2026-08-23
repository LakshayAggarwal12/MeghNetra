export interface WeatherEvent {
  id: string;
  category: string;
  secondary_categories: string[];
  severity: "low" | "moderate" | "high" | "severe";
  status: "verified" | "likely_authentic" | "unverified" | "suspicious" | "contradicted";
  confidence_score: string | number;
  first_seen_at: string;
  last_updated_at: string;
  city: string;
  state: string;
  locality: string | null;
  lat: number;
  lng: number;
  report_count?: string | number;
  source_count?: string | number;
  // Layer 5 — Geospatial Analysis (DBSCAN clustering / hotspot / affected area)
  cluster_id?: number | null;
  is_hotspot?: boolean;
  affected_area_km2?: string | number | null;
}

export interface EvidenceItem {
  id: string;
  evidence_type: string;
  description: string;
  created_at: string;
}

export interface LinkedReport {
  id: string;
  raw_text: string;
  submitted_at: string;
  category_guess: string;
  severity_guess: string;
  source_name: string;
  source_type: string;
  similarity_score: number | null;
}

export interface FactorBreakdownItem {
  value: number;
  weight: number;
  contribution: number;
}

export interface VerificationResult {
  id: string;
  status: string;
  confidence_score: string | number;
  factor_scores: Record<string, FactorBreakdownItem>;
  computed_at: string;
}

export interface EventDetailResponse {
  event: WeatherEvent;
  verification: VerificationResult | null;
  evidence: EvidenceItem[];
  reports: LinkedReport[];
}

export interface AnalyticsSummary {
  totalActive: number;
  byCategory: Record<string, number>;
  byStatus: Record<string, number>;
  bySeverity: Record<string, number>;
}

export interface AuditLog {
  id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  timestamp: string;
}
