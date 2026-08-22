"""
Duplicate detection.

Fuses four signals into one score, exactly matching the blueprint's
design (Section 9.3):
  - text similarity        (TF-IDF + cosine similarity)
  - geographic proximity   (haversine distance)
  - temporal proximity     (closeness of timestamps within a configurable window)
  - category agreement     (do the two reports share a category?)

TF-IDF + cosine similarity is used instead of sentence-transformer
embeddings — see the trimmed 2-day scope decision in the implementation
roadmap (Feature 10). It requires no model download, runs instantly on
CPU, and is sufficient to recognize paraphrased reports of the same event.
"""
import math
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Fusion weights — tunable, documented starting point per the blueprint.
W_TEXT = 0.40
W_GEO = 0.25
W_TIME = 0.20
W_CATEGORY = 0.15

GEO_FULL_SCORE_RADIUS_KM = 5.0   # within this distance, geo_score = 1.0
GEO_ZERO_SCORE_RADIUS_KM = 50.0  # beyond this distance, geo_score = 0.0


def _haversine_km(lat1, lng1, lat2, lng2):
    R = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return 2 * R * math.asin(math.sqrt(a))


def _geo_score(lat1, lng1, lat2, lng2):
    dist = _haversine_km(lat1, lng1, lat2, lng2)
    if dist <= GEO_FULL_SCORE_RADIUS_KM:
        return 1.0
    if dist >= GEO_ZERO_SCORE_RADIUS_KM:
        return 0.0
    # linear falloff between full and zero radius
    span = GEO_ZERO_SCORE_RADIUS_KM - GEO_FULL_SCORE_RADIUS_KM
    return 1.0 - (dist - GEO_FULL_SCORE_RADIUS_KM) / span


def _time_score(t1_iso, t2_iso, window_hours):
    try:
        t1 = datetime.fromisoformat(t1_iso.replace("Z", "+00:00"))
        t2 = datetime.fromisoformat(t2_iso.replace("Z", "+00:00"))
    except Exception:
        return 0.5  # unknown timestamps -> neutral score
    delta_hours = abs((t1 - t2).total_seconds()) / 3600.0
    if window_hours <= 0:
        return 0.0
    return max(0.0, 1.0 - min(delta_hours / window_hours, 1.0))


def _category_score(cat1, cat2):
    if cat1 == cat2:
        return 1.0
    # partial credit for closely related category pairs
    related_pairs = {
        frozenset(["rainfall", "flooding"]),
        frozenset(["rainfall", "thunderstorm"]),
        frozenset(["thunderstorm", "flooding"]),
        frozenset(["cyclone", "strong_wind"]),
        frozenset(["cyclone", "flooding"]),
    }
    if frozenset([cat1, cat2]) in related_pairs:
        return 0.5
    return 0.0


def compute_similarities(new_text, new_lat, new_lng, new_category, new_submitted_at,
                          candidates, time_window_hours=12.0):
    if not candidates:
        return []

    texts = [new_text] + [c["text"] for c in candidates]
    vectorizer = TfidfVectorizer(stop_words="english")
    try:
        tfidf_matrix = vectorizer.fit_transform(texts)
        sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
    except ValueError:
        # e.g. all texts were pure stopwords -> fall back to zero similarity
        sims = [0.0] * len(candidates)

    results = []
    for cand, text_sim in zip(candidates, sims):
        geo_score = _geo_score(new_lat, new_lng, cand["lat"], cand["lng"])
        time_score = _time_score(new_submitted_at, cand["submitted_at"], time_window_hours)
        category_score = _category_score(new_category, cand["category"])

        fused = (
            W_TEXT * float(text_sim)
            + W_GEO * geo_score
            + W_TIME * time_score
            + W_CATEGORY * category_score
        )

        results.append(
            {
                "candidate_id": cand["id"],
                "text_similarity": round(float(text_sim), 3),
                "geo_score": round(geo_score, 3),
                "time_score": round(time_score, 3),
                "category_score": round(category_score, 3),
                "fused_score": round(fused, 3),
            }
        )

    return results
