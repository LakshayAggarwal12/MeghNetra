"""
Confidence scoring & verification status mapping.

Implements the blueprint's exact evidence-fusion formula (Section 10.3):
  confidence = 0.30*weather_observation_agreement
             + 0.25*independent_report_agreement (cross_source_agreement)
             + 0.20*source_reliability
             + 0.15*location_consistency
             + 0.10*temporal_consistency

The weights are a documented, tunable starting point — not a black box.
A hard override forces status='contradicted' when the caller explicitly
flags a direct contradiction against objective weather-API data,
regardless of the numeric score, matching the blueprint's distinct
"Contradicted by available observations" status.
"""

WEIGHTS = {
    "weather_observation_agreement": 0.30,
    "cross_source_agreement": 0.25,
    "source_reliability": 0.20,
    "location_consistency": 0.15,
    "temporal_consistency": 0.10,
}


def _clamp01(x: float) -> float:
    return max(0.0, min(1.0, x))


def compute_confidence(
    source_reliability: float,
    cross_source_agreement: float,
    weather_observation_agreement: float,
    location_consistency: float,
    temporal_consistency: float,
    contradiction_flag: bool = False,
):
    factors = {
        "weather_observation_agreement": _clamp01(weather_observation_agreement),
        "cross_source_agreement": _clamp01(cross_source_agreement),
        "source_reliability": _clamp01(source_reliability),
        "location_consistency": _clamp01(location_consistency),
        "temporal_consistency": _clamp01(temporal_consistency),
    }

    breakdown = {}
    total = 0.0
    for factor_name, value in factors.items():
        weight = WEIGHTS[factor_name]
        contribution = value * weight
        breakdown[factor_name] = {
            "value": round(value, 3),
            "weight": weight,
            "contribution": round(contribution, 3),
        }
        total += contribution

    confidence_pct = round(total * 100, 1)

    if contradiction_flag:
        status = "contradicted"
    elif confidence_pct >= 85:
        status = "verified"
    elif confidence_pct >= 65:
        status = "likely_authentic"
    elif confidence_pct >= 40:
        status = "unverified"
    elif confidence_pct >= 20:
        status = "suspicious"
    else:
        status = "contradicted"

    return {
        "confidence_score": confidence_pct,
        "status": status,
        "factor_breakdown": breakdown,
    }
