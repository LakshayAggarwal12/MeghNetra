"""
Weather-event classification.

Approach: rule-based keyword matching over a curated lexicon.
This is intentionally simple and fully explainable, appropriate for a
2-day prototype build (see MEGHNETRA implementation roadmap, Feature 7 —
trimmed-scope version). A trained scikit-learn classifier can be dropped
in later as a fallback for text with no keyword hits, without changing
the API contract of `classify_text()`.
"""
import json
import os
import re

_KEYWORDS_PATH = os.path.join(os.path.dirname(__file__), "..", "data", "keywords.json")

with open(_KEYWORDS_PATH, "r", encoding="utf-8") as f:
    _KEYWORDS = json.load(f)

# Highest-confidence keyword-based category first; used when nothing matches.
_DEFAULT_CATEGORY = "other"


def classify_text(text: str, max_categories: int = 3, threshold: float = 0.15):
    """
    Returns a list of {name, confidence} dicts and a primary_category.
    Multi-label: a report can plausibly belong to more than one category
    (e.g. "heavy rainfall caused flooding" -> rainfall + flooding).
    """
    text_lower = text.lower()
    scores = {}

    for category, phrases in _KEYWORDS.items():
        if not phrases:
            continue
        hits = 0
        for phrase in phrases:
            # word-boundary-ish match; phrases may be multi-word
            pattern = re.escape(phrase.lower())
            if re.search(pattern, text_lower):
                hits += 1
        if hits > 0:
            # confidence grows with number of distinct keyword hits, capped at 0.97
            scores[category] = min(0.6 + 0.12 * hits, 0.97)

    if not scores:
        return {
            "categories": [{"name": _DEFAULT_CATEGORY, "confidence": 0.4}],
            "primary_category": _DEFAULT_CATEGORY,
        }

    ranked = sorted(scores.items(), key=lambda kv: kv[1], reverse=True)
    ranked = [(name, conf) for name, conf in ranked if conf >= threshold][:max_categories]

    categories = [{"name": name, "confidence": round(conf, 2)} for name, conf in ranked]
    primary = categories[0]["name"]

    return {"categories": categories, "primary_category": primary}
