from fastapi import APIRouter
from app.schemas import VerificationRequest, VerificationResponse
from app.services.confidence import compute_confidence

router = APIRouter()


@router.post("/verification/score", response_model=VerificationResponse)
def verification_score(req: VerificationRequest):
    result = compute_confidence(
        source_reliability=req.source_reliability,
        cross_source_agreement=req.cross_source_agreement,
        weather_observation_agreement=req.weather_observation_agreement,
        location_consistency=req.location_consistency,
        temporal_consistency=req.temporal_consistency,
        contradiction_flag=req.contradiction_flag,
    )
    return result
