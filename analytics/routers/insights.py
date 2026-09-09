from fastapi import APIRouter, HTTPException

from models.schemas import InsightRequest, InsightResponse
from services.claude_service import analyze_trades

router = APIRouter()


@router.get("/status")
def status():
    return {"status": "insights router ready"}


@router.post("/analyze", response_model=InsightResponse)
def analyze(request: InsightRequest):
    if not request.trades:
        raise HTTPException(status_code=400, detail="At least one trade record is required.")

    try:
        result = analyze_trades(
            trades=request.trades,
            question=request.question,
            image_base64=request.image_base64,
            image_media_type=request.image_media_type or "image/png",
        )
    except RuntimeError as e:
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Claude API error: {e}")

    return result
