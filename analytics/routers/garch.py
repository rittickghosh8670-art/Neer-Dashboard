from fastapi import APIRouter, HTTPException

from models.schemas import BatchRegimeRequest, RegimeRequest, RegimeResponse
from services.garch_service import classify_regime

router = APIRouter()


@router.get("/status")
def status():
    return {"status": "garch router ready"}


@router.post("/classify", response_model=RegimeResponse)
def classify(request: RegimeRequest):
    try:
        result = classify_regime(request.prices)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return result


@router.post("/classify-batch")
def classify_batch(request: BatchRegimeRequest):
    results = {}
    errors = {}
    for session_key, prices in request.sessions.items():
        try:
            results[session_key] = classify_regime(prices)
        except ValueError as e:
            errors[session_key] = str(e)
    return {"results": results, "errors": errors}
