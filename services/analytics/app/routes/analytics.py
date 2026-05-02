from fastapi import APIRouter, HTTPException

from app.domain.models import (
    ClusterRequest, ClusterResult,
    TimeSeriesRequest, TimeSeriesResult,
    PCARequest, PCAResult,
    AnomalyRequest, AnomalyResult,
    ClassifyRequest, ClassifyResult,
)
from app.services.clustering import run_kmeans
from app.services.timeseries import run_timeseries
from app.services.pca_service import run_pca
from app.services.anomaly import run_anomaly_detection
from app.services.classification import run_classification

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.post("/clusters", response_model=list[ClusterResult])
def clusters(req: ClusterRequest):
    if not req.observations:
        raise HTTPException(status_code=400, detail="No observations provided")
    return run_kmeans(req.observations, req.n_clusters)


@router.post("/timeseries", response_model=list[TimeSeriesResult])
def timeseries(req: TimeSeriesRequest):
    if not req.observations:
        raise HTTPException(status_code=400, detail="No observations provided")
    return run_timeseries(req.observations, req.steps, req.granularity)


@router.post("/pca", response_model=PCAResult)
def pca(req: PCARequest):
    if len(req.observations) < 3:
        raise HTTPException(status_code=400, detail="Need at least 3 observations for PCA")
    return run_pca(req.observations, req.n_components)


@router.post("/anomalies", response_model=list[AnomalyResult])
def anomalies(req: AnomalyRequest):
    if len(req.observations) < 10:
        raise HTTPException(status_code=400, detail="Need at least 10 observations for anomaly detection")
    return run_anomaly_detection(req.observations, req.contamination)


@router.post("/classify", response_model=ClassifyResult)
def classify(req: ClassifyRequest):
    if not req.observations:
        raise HTTPException(status_code=400, detail="No observations provided")
    return run_classification(req.observations, req.target)
