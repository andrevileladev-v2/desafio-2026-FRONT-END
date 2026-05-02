from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.analytics import router
from app.routes.etl import router as etl_router

app = FastAPI(
    title="EcoAnalysis — Python Analytics Service",
    description="K-Means, ARIMA, PCA, Isolation Forest e classificação para dados ambientais",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(etl_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "analytics"}
