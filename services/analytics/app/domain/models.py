from pydantic import BaseModel
from typing import Optional


class ObservationInput(BaseModel):
    id: str
    speciesId: str
    speciesName: str
    lat: float
    lng: float
    date: str
    region: str
    biome: str
    notes: str = ""


class ClusterRequest(BaseModel):
    observations: list[ObservationInput]
    n_clusters: int = 5


class ClusterResult(BaseModel):
    cluster_id: int
    lat: float
    lng: float
    count: int
    species: list[str]
    biomes: list[str]
    centroid_lat: float
    centroid_lng: float


class TimeSeriesRequest(BaseModel):
    observations: list[ObservationInput]
    steps: int = 6
    granularity: str = "month"


class TimeSeriesResult(BaseModel):
    date: str
    count: int
    is_forecast: bool
    lower_ci: Optional[float] = None
    upper_ci: Optional[float] = None


class PCARequest(BaseModel):
    observations: list[ObservationInput]
    n_components: int = 2


class PCAPoint(BaseModel):
    speciesName: str
    pc1: float
    pc2: float
    cluster: int


class PCAResult(BaseModel):
    points: list[PCAPoint]
    explained_variance: list[float]
    components: list[list[float]]


class AnomalyRequest(BaseModel):
    observations: list[ObservationInput]
    contamination: float = 0.05


class AnomalyResult(BaseModel):
    id: str
    speciesName: str
    lat: float
    lng: float
    date: str
    region: str
    anomaly_score: float
    is_anomaly: bool


class ClassifyRequest(BaseModel):
    observations: list[ObservationInput]
    target: str = "biome"


class ClassifyResult(BaseModel):
    accuracy: float
    feature_importance: dict[str, float]
    confusion_labels: list[str]
    confusion_matrix: list[list[int]]
    top_rules: list[str]
