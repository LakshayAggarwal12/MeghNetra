"""
Event standardization for STRUCTURED category labels.

This is distinct from, and does not duplicate, the existing free-text
classifier (app/models/classifier.py) which remains the authority for
unstructured report text. This module only handles the case where a
source already supplies an explicit category-like label (e.g. an IMD
bulletin field, or a citizen-app dropdown value) and that label needs to
be canonicalized to the SAME category vocabulary already used across the
project (see ai-service/app/data/keywords.json and the seeded
event_categories table) — rather than inventing a parallel vocabulary.

Returns None when no confident structured mapping exists, so callers fall
through to the existing ML classifier for free text.
"""
import re

# Canonical categories reused as-is from the project's existing vocabulary
# (ai-service/app/data/keywords.json / backend/src/db/seed_reference.sql).
_SYNONYMS = {
    "flooding": ["flood", "flooding", "flooded", "waterlogging", "inundation"],
    "rainfall": ["heavy rain", "heavy rainfall", "rain", "rainfall", "extreme rain", "moderate rain"],
    "thunderstorm": ["thunderstorm", "lightning", "hailstorm", "hail"],
    "heatwave": ["heatwave", "heat wave", "extreme heat"],
    "fog": ["fog", "dense fog", "mist"],
    "dust_storm": ["dust storm", "duststorm", "sandstorm"],
    "strong_wind": ["strong wind", "high wind", "gale", "windstorm"],
    "cyclone": ["cyclone", "hurricane", "typhoon", "tropical storm"],
}

_LOOKUP = {syn.lower(): canonical for canonical, syns in _SYNONYMS.items() for syn in syns}


def normalize_event_label(raw_label):
    if not raw_label:
        return None
    key = re.sub(r"\s+", " ", str(raw_label).strip().lower())
    if key in _LOOKUP:
        return _LOOKUP[key]
    # Loose containment match for near-variants not listed verbatim
    # (e.g. "Heavy Rain Warning" -> "rainfall").
    for syn, canonical in _LOOKUP.items():
        if syn in key:
            return canonical
    return None
