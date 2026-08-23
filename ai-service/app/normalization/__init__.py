"""
Layer -1: Normalization.

Converts heterogeneous raw report inputs (IMD/weather-API, citizen, RSS/news,
social media) into one common, validated representation before they reach
the existing AI/ML processing endpoints (classify/location/severity).

This package is intentionally small: it fills exactly the gaps that were not
already handled by the existing Node-side ingestion adapters (which already
produce a canonical {sourceType, rawText, locationHint, submittedAt}
object and already emit UTC ISO-8601 timestamps via `new Date().toISOString()`).
What was missing — and what lives here — is:

  1. Controlled-vocabulary source standardization (IMD/CITIZEN/SOCIAL_MEDIA/NEWS/API)
  2. Structured event-label -> canonical category synonym mapping
  3. A defensive timestamp normalizer for raw inputs that are NOT already ISO-8601
     (kept here so both Node and any future source adapter can rely on one
     single, tested implementation instead of duplicating date parsing logic)
"""
