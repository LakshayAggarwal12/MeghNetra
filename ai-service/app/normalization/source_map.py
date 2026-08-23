"""
Source standardization -> controlled vocabulary.

Maps the internal sourceType values already used by MEGHNETRA's existing
Node ingestion adapters (weather_api / citizen / rss), plus a few likely
raw external labels, onto the controlled vocabulary requested for the
common schema: IMD, CITIZEN, SOCIAL_MEDIA, NEWS, API.
"""

_SOURCE_MAP = {
    # Existing internal sourceType values (backend/src/ingestion/adapters/*).
    "weather_api": "IMD",
    "citizen": "CITIZEN",
    "rss": "NEWS",
    # Likely raw/external labels a real integration might send.
    "imd": "IMD",
    "news": "NEWS",
    "social_media": "SOCIAL_MEDIA",
    "twitter": "SOCIAL_MEDIA",
    "x": "SOCIAL_MEDIA",
    "api": "API",
    "web": "API",
}

CONTROLLED_SOURCES = {"IMD", "CITIZEN", "SOCIAL_MEDIA", "NEWS", "API"}


def standardize_source(raw_source: str) -> str:
    if not raw_source:
        return "API"
    key = str(raw_source).strip().lower()
    return _SOURCE_MAP.get(key, "API")
