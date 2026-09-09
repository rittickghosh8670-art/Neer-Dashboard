from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

from routers import garch, insights  # noqa: E402  (must load env before importing routers)

app = FastAPI(title="LBS Analytics Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(garch.router, prefix="/garch", tags=["garch"])
app.include_router(insights.router, prefix="/insights", tags=["insights"])


@app.get("/health")
def health():
    return {"status": "UP", "service": "lbs-analytics"}
