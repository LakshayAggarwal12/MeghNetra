from pydantic import BaseModel
from typing import List, Optional, Dict


class ClassifyRequest(BaseModel):
    text: str


class CategoryScore(BaseModel):
    name: str
    confidence: float


class ClassifyResponse(BaseModel):
    categories: List[CategoryScore]
    primary_category: str


class SeverityRequest(BaseModel):
    text: str
    category: str
    wind_speed_kmh: Optional[float] = None
    rainfall_mm: Optional[float] = None


class SeverityResponse(BaseModel):
    severity: str
    score: float


class LocationRequest(BaseModel):
    text: str
    location_hint: Optional[str] = None


class LocationResponse(BaseModel):
    locality: Optional[str] = None
    city: str
    state: str
    lat: float
    lng: float
    resolved_via: str


class SimilarityCandidate(BaseModel):
    id: str
    text: str
    lat: float
    lng: float
    category: str
    submitted_at: str  # ISO timestamp


class SimilarityRequest(BaseModel):
    new_text: str
    new_lat: float
    new_lng: float
    new_category: str
    new_submitted_at: str
    candidates: List[SimilarityCandidate]
    time_window_hours: float = 12.0


class SimilarityResult(BaseModel):
    candidate_id: str
    text_similarity: float
    geo_score: float
    time_score: float
    category_score: float
    fused_score: float


class SimilarityResponse(BaseModel):
    results: List[SimilarityResult]


class VerificationRequest(BaseModel):
    source_reliability: float
    cross_source_agreement: float
    weather_observation_agreement: float
    location_consistency: float
    temporal_consistency: float
    contradiction_flag: bool = False


class FactorContribution(BaseModel):
    value: float
    weight: float
    contribution: float


class VerificationResponse(BaseModel):
    confidence_score: float
    status: str
    factor_breakdown: Dict[str, FactorContribution]


# ============================================================
# Layer -1: Normalization — common schema
# ============================================================

class NormalizeRequest(BaseModel):
    raw_text: str
    source: str  # e.g. 'weather_api' | 'citizen' | 'rss' | 'IMD' | 'social_media' ...
    timestamp: Optional[str] = None
    structured_category: Optional[str] = None  # explicit label if the source provides one


class NormalizeResponse(BaseModel):
    cleaned_text: str
    standardized_source: str  # one of IMD, CITIZEN, SOCIAL_MEDIA, NEWS, API
    normalized_timestamp: str  # UTC ISO 8601
    normalized_category: Optional[str] = None  # canonical category if a structured label was confidently mapped


# ============================================================
# Layer 6: Final Weather Event — aggregated output contract
# ============================================================

class FinalWeatherEvent(BaseModel):
    event_id: str
    event_type: str
    location: str
    coordinates: Dict[str, float]  # {"lat": ..., "lng": ...}
    severity: str
    confidence: float
    cluster_id: Optional[int] = None
    affected_area_km2: Optional[float] = None
    status: str
    sources: List[str]
    timestamp: str
