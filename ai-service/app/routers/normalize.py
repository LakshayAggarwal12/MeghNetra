from fastapi import APIRouter
from app.schemas import NormalizeRequest, NormalizeResponse
from app.normalization.timestamp_utils import to_utc_iso8601
from app.normalization.source_map import standardize_source
from app.normalization.event_synonyms import normalize_event_label

router = APIRouter()


@router.post("/normalize", response_model=NormalizeResponse)
def normalize(req: NormalizeRequest):
    cleaned_text = " ".join(req.raw_text.split())  # collapse whitespace only; no rewriting of content
    return {
        "cleaned_text": cleaned_text,
        "standardized_source": standardize_source(req.source),
        "normalized_timestamp": to_utc_iso8601(req.timestamp),
        "normalized_category": normalize_event_label(req.structured_category),
    }
