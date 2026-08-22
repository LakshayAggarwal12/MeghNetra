from fastapi import APIRouter
from app.schemas import SeverityRequest, SeverityResponse
from app.models.severity import estimate_severity

router = APIRouter()


@router.post("/severity", response_model=SeverityResponse)
def severity(req: SeverityRequest):
    result = estimate_severity(req.text, req.category, req.wind_speed_kmh, req.rainfall_mm)
    return result
