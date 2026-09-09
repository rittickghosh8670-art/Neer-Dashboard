from pydantic import BaseModel, Field


class RegimeRequest(BaseModel):
    prices: list[float] = Field(..., min_length=20, description="Ordered closing prices for the session")
    session_id: int | None = Field(None, description="Optional trade/session identifier for tracing")


class RegimeResponse(BaseModel):
    regime: str
    confidence: float
    direction: str
    avgConditionalVolatility: float
    unconditionalVolatility: float
    volatilityRatio: float
    trendRSquared: float
    isHighVol: bool
    isTrending: bool


class BatchRegimeRequest(BaseModel):
    sessions: dict[str, list[float]] = Field(
        ..., description="Map of session key (e.g. trade id) to ordered closing prices"
    )


class InsightRequest(BaseModel):
    trades: list[dict] = Field(..., description="Structured trade records to analyze")
    question: str | None = Field(
        None, description="Optional specific question to focus the analysis on"
    )
    image_base64: str | None = Field(
        None, description="Optional base64-encoded trade chart screenshot"
    )
    image_media_type: str | None = Field(
        "image/png", description="MIME type of the provided image"
    )


class InsightResponse(BaseModel):
    insight: str
    model: str
