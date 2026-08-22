"""
Location extraction & geocoding.

Approach (trimmed 2-day scope): match city/locality names mentioned in the
report text, or supplied as a location_hint, against a curated CSV of
Indian cities. This avoids a live NER model and avoids any external
network dependency (Nominatim) that could fail or rate-limit during a
live demo. It is a deliberate, documented simplification — see the
MEGHNETRA implementation roadmap, Feature 8 (trimmed-scope version).
"""
import csv
import os
import re

_CSV_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "india_cities.csv")

_CITIES = []  # list of dicts: {city, state, lat, lng, name_lower}

with open(_CSV_PATH, newline="", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        _CITIES.append(
            {
                "city": row["city"],
                "state": row["state"],
                "lat": float(row["lat"]),
                "lng": float(row["lng"]),
                "name_lower": row["city"].lower(),
            }
        )

# Sort longest name first so "Sector 62 Noida" matches before plain "Noida"
_CITIES.sort(key=lambda c: len(c["name_lower"]), reverse=True)

_DEFAULT_CITY = {"city": "New Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090}


def _find_in_text(text: str):
    text_lower = text.lower()
    for c in _CITIES:
        pattern = r"\b" + re.escape(c["name_lower"]) + r"\b"
        if re.search(pattern, text_lower):
            return c
    return None


def resolve_location(text: str, location_hint: str = None):
    # 1. Try to find an explicit city mention inside the free text (highest confidence).
    match = _find_in_text(text)
    if match:
        return {
            "locality": None,
            "city": match["city"],
            "state": match["state"],
            "lat": match["lat"],
            "lng": match["lng"],
            "resolved_via": "text_match",
        }

    # 2. Fall back to the location hint carried by the source itself
    #    (e.g. the city the weather-API connector polled).
    if location_hint:
        hint_match = _find_in_text(location_hint)
        if hint_match:
            return {
                "locality": None,
                "city": hint_match["city"],
                "state": hint_match["state"],
                "lat": hint_match["lat"],
                "lng": hint_match["lng"],
                "resolved_via": "location_hint",
            }

    # 3. Last resort: default to New Delhi so every report still gets a
    #    plottable, valid coordinate for the map (never [0,0]).
    return {
        "locality": None,
        "city": _DEFAULT_CITY["city"],
        "state": _DEFAULT_CITY["state"],
        "lat": _DEFAULT_CITY["lat"],
        "lng": _DEFAULT_CITY["lng"],
        "resolved_via": "default_fallback",
    }


def list_known_cities():
    return [{"city": c["city"], "state": c["state"], "lat": c["lat"], "lng": c["lng"]} for c in _CITIES]
