# Scope Decisions — Why This Build Looks The Way It Does

Every simplification below is a deliberate trade-off for a reliable 2-day
hackathon build, not an oversight. Each one preserves the PS 26069
capability it stands in for, while removing a risk (external network
dependency, training-data requirement, or long setup time) that could break
a live demo.

| Full-scope design (blueprint) | This build | Why |
|---|---|---|
| Trained scikit-learn classifier | Keyword/rule-based classifier | No training data or training step needed; fully explainable; upgradeable later by feeding ambiguous cases to a trained fallback without changing the API contract. |
| spaCy NER + Nominatim geocoding | Curated ~45-city lookup table | Removes an external network dependency (Nominatim) that could fail or rate-limit live in front of judges. Every seeded/demo city resolves instantly and deterministically. |
| Sentence-transformer embeddings for duplicate detection | TF-IDF + cosine similarity | No model download, no GPU/CPU load concern, installs instantly, and is sufficient to recognize paraphrased reports of the same event — verified against the "3 differently-worded reports about the same flood" test case. |
| Real weather API (OpenWeatherMap/IMD) | Simulated weather-API connector | A live demo must never depend on an external API's uptime or quota. The adapter boundary (`weatherApiAdapter.js`) is identical to what a real integration would use — swapping in a real HTTP call is a one-file change. |
| RSS/news ingestion wired into UI | Adapter built, not scheduled by default | Kept as a documented, ready-to-enable module (`rssAdapter.js`) rather than a live scheduled job, to reduce moving parts during the demo window. |
| Manual event-merge UI | Not built | Automated clustering (TF-IDF+geo+time+category fusion) is demonstrated directly; the manual override is documented as a fast follow-up. |
| Per-report suspicious-flagging UI | Data model supports it (`sources.config` rejection tracking), no dedicated UI | The event-level verification engine (which does ship) already demonstrates "assess potentially fake/misleading information" per PS 26069; the report-level flagging is an additive refinement. |
| Kafka/Redpanda streaming | Redis + BullMQ | Same architectural role (decouples ingestion from processing, retries on failure) at a fraction of the setup complexity — entirely appropriate for prototype scale. |

## What This Means For Judging Q&A

If asked "why isn't this using [more advanced technique]?", the honest and
strong answer is: **every simplification here trades sophistication for
demo reliability, and the underlying architecture is built so each one can
be swapped for the fuller version without changing any other layer** — the
adapter/service boundaries were designed with exactly that upgrade path in
mind. That is a stronger engineering answer than either (a) pretending the
simple version is the final word, or (b) having built something fragile
that might fail live.
