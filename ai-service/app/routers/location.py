from fastapi import APIRouter
from app.schemas import LocationRequest, LocationResponse
from app.services.geocode import resolve_location

router = APIRouter()


@router.post("/location", response_model=LocationResponse)
def location(req: LocationRequest):
    result = resolve_location(req.text, req.location_hint)
    return result
