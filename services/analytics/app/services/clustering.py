import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

from app.domain.models import ObservationInput, ClusterResult


def run_kmeans(observations: list[ObservationInput], n_clusters: int) -> list[ClusterResult]:
    if len(observations) < n_clusters:
        n_clusters = max(1, len(observations) // 2)

    df = pd.DataFrame([{
        "id": o.id,
        "speciesName": o.speciesName,
        "lat": o.lat,
        "lng": o.lng,
        "biome": o.biome,
    } for o in observations])

    coords = df[["lat", "lng"]].values
    scaler = StandardScaler()
    coords_scaled = scaler.fit_transform(coords)

    kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
    df["cluster"] = kmeans.fit_predict(coords_scaled)

    centroids_scaled = kmeans.cluster_centers_
    centroids = scaler.inverse_transform(centroids_scaled)

    results: list[ClusterResult] = []
    for cid in range(n_clusters):
        group = df[df["cluster"] == cid]
        if group.empty:
            continue
        results.append(ClusterResult(
            cluster_id=cid,
            lat=float(group["lat"].mean()),
            lng=float(group["lng"].mean()),
            count=len(group),
            species=list(group["speciesName"].unique()),
            biomes=list(group["biome"].unique()),
            centroid_lat=float(centroids[cid][0]),
            centroid_lng=float(centroids[cid][1]),
        ))

    return sorted(results, key=lambda r: r.count, reverse=True)
