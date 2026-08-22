import os
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from dotenv import load_dotenv

from app.routers import classify, severity, location, similarity, verification

load_dotenv()

INTERNAL_API_KEY = os.getenv("INTERNAL_API_KEY", "change-me-shared-secret")

app = FastAPI(
    title="MEGHNETRA AI Service",
    description="Internal AI/ML microservice for weather-event classification, "
    "location extraction, severity estimation, duplicate detection, and "
    "evidence-based verification. Called only by the Node/Express backend.",
    version="1.0.0",
)


@app.middleware("http")
async def require_internal_key(request: Request, call_next):
    # /health and /docs are exempt so the service is easy to smoke-test.
    if request.url.path in ("/health", "/docs", "/openapi.json", "/redoc"):
        return await call_next(request)

    key = request.headers.get("x-internal-key")
    if key != INTERNAL_API_KEY:
        return JSONResponse(status_code=401, content={"detail": "Invalid or missing x-internal-key header"})

    return await call_next(request)


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    # Never leak raw tracebacks to the caller (Feature 26 — error handling).
    return JSONResponse(status_code=500, content={"detail": f"Internal AI-service error: {str(exc)}"})


@app.get("/health")
def health():
    return {"status": "ok", "service": "meghnetra-ai-service"}


app.include_router(classify.router, tags=["classification"])
app.include_router(severity.router, tags=["severity"])
app.include_router(location.router, tags=["location"])
app.include_router(similarity.router, tags=["similarity"])
app.include_router(verification.router, tags=["verification"])
