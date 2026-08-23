"""
Timestamp normalization -> UTC ISO 8601.

Stdlib-only (no new dependency such as python-dateutil), handling the
formats realistically seen across MEGHNETRA's source types:
  - already-ISO-8601 (with or without a timezone offset) — the common case,
    since the existing Node adapters already emit this
  - a bare "YYYY-MM-DD HH:MM:SS" (space instead of "T")
  - Unix epoch seconds/milliseconds (int or numeric string) — common in raw
    third-party feed payloads
Falls back to "now" (UTC) if the input cannot be parsed, rather than raising,
since a report should never be dropped purely because of a timestamp format.
"""
from datetime import datetime, timezone


def to_utc_iso8601(raw) -> str:
    if raw is None or raw == "":
        return datetime.now(timezone.utc).isoformat()

    # Already a datetime object.
    if isinstance(raw, datetime):
        dt = raw if raw.tzinfo else raw.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()

    raw_str = str(raw).strip()

    # Unix epoch (seconds or milliseconds).
    if raw_str.replace(".", "", 1).isdigit():
        value = float(raw_str)
        if value > 1e12:  # milliseconds
            value /= 1000.0
        try:
            dt = datetime.fromtimestamp(value, tz=timezone.utc)
            return dt.isoformat()
        except (ValueError, OSError):
            pass

    # ISO-8601 variants, including a trailing "Z".
    candidate = raw_str.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(candidate)
        dt = dt if dt.tzinfo else dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).isoformat()
    except ValueError:
        pass

    # "YYYY-MM-DD HH:MM:SS" without a "T".
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%d/%m/%Y %H:%M:%S", "%d/%m/%Y"):
        try:
            dt = datetime.strptime(raw_str, fmt).replace(tzinfo=timezone.utc)
            return dt.isoformat()
        except ValueError:
            continue

    # Unparseable — fall back rather than failing the whole report.
    return datetime.now(timezone.utc).isoformat()
