from fastapi import APIRouter
from app.schemas import SimilarityRequest, SimilarityResponse
from app.services.duplicate import compute_similarities

router = APIRouter()


@router.post("/similarity/batch", response_model=SimilarityResponse)
def similarity_batch(req: SimilarityRequest):
    candidates = [c.model_dump() for c in req.candidates]
    results = compute_similarities(
        new_text=req.new_text,
        new_lat=req.new_lat,
        new_lng=req.new_lng,
        new_category=req.new_category,
        new_submitted_at=req.new_submitted_at,
        candidates=candidates,
        time_window_hours=req.time_window_hours,
    )
    return {"results": results}
