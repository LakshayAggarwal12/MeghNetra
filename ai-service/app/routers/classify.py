from fastapi import APIRouter
from app.schemas import ClassifyRequest, ClassifyResponse
from app.models.classifier import classify_text

router = APIRouter()


@router.post("/classify", response_model=ClassifyResponse)
def classify(req: ClassifyRequest):
    result = classify_text(req.text)
    return result
