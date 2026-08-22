"""
Severity estimation.

Approach: weighted keyword-intensity scoring, blended with numeric
signals (wind speed, rainfall) when the source provides them — numeric
weather-API data is the strongest, most credible signal and overrides
text heuristics when present (see roadmap Feature 9).
"""
import json
import os
import re

_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "severity_words.json")
with open(_PATH, "r", encoding="utf-8") as f:
    _SEVERITY_WORDS = json.load(f)

_LEVEL_ORDER = ["low", "moderate", "high", "severe"]
_LEVEL_SCORE = {"low": 0.2, "moderate": 0.45, "high": 0.7, "severe": 0.95}


def _text_severity_score(text: str) -> float:
    text_lower = text.lower()
    best_level = None
    for level in reversed(_LEVEL_ORDER):  # check severe first so strongest match wins
        for phrase in _SEVERITY_WORDS.get(level, []):
            if re.search(re.escape(phrase.lower()), text_lower):
                best_level = level
                break
        if best_level:
            break
    if best_level is None:
        return _LEVEL_SCORE["moderate"] * 0.6  # mild default when no cue found
    return _LEVEL_SCORE[best_level]


def _numeric_override(wind_speed_kmh, rainfall_mm):
    """Returns a severity score 0-1 from numeric weather signals, or None."""
    score = None
    if wind_speed_kmh is not None:
        if wind_speed_kmh >= 90:
            score = max(score or 0, 0.95)
        elif wind_speed_kmh >= 60:
            score = max(score or 0, 0.75)
        elif wind_speed_kmh >= 40:
            score = max(score or 0, 0.5)
    if rainfall_mm is not None:
        if rainfall_mm >= 100:
            score = max(score or 0, 0.9)
        elif rainfall_mm >= 50:
            score = max(score or 0, 0.7)
        elif rainfall_mm >= 15:
            score = max(score or 0, 0.45)
    return score


def _bucket(score: float) -> str:
    if score >= 0.85:
        return "severe"
    if score >= 0.6:
        return "high"
    if score >= 0.35:
        return "moderate"
    return "low"


def estimate_severity(text: str, category: str, wind_speed_kmh=None, rainfall_mm=None):
    numeric_score = _numeric_override(wind_speed_kmh, rainfall_mm)
    text_score = _text_severity_score(text)

    final_score = numeric_score if numeric_score is not None else text_score
    # If both present, take the max (numeric evidence should never be diluted downward
    # by mild-sounding phrasing).
    if numeric_score is not None:
        final_score = max(numeric_score, text_score * 0.5)

    return {"severity": _bucket(final_score), "score": round(final_score, 2)}
