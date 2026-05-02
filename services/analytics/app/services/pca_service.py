import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans

from app.domain.models import ObservationInput, PCAResult, PCAPoint


def run_pca(observations: list[ObservationInput], n_components: int) -> PCAResult:
    df = pd.DataFrame([{
        "speciesName": o.speciesName,
        "lat": o.lat,
        "lng": o.lng,
        "biome": o.biome,
        "region": o.region,
        "month": int(o.date[5:7]) if len(o.date) >= 7 else 0,
    } for o in observations])

    le_biome = LabelEncoder()
    le_region = LabelEncoder()
    df["biome_enc"] = le_biome.fit_transform(df["biome"])
    df["region_enc"] = le_region.fit_transform(df["region"])

    features = df[["lat", "lng", "biome_enc", "region_enc", "month"]].values
    scaler = StandardScaler()
    features_scaled = scaler.fit_transform(features)

    nc = min(n_components, features_scaled.shape[1], features_scaled.shape[0])
    pca = PCA(n_components=nc)
    transformed = pca.fit_transform(features_scaled)

    kmeans = KMeans(n_clusters=min(4, len(df)), random_state=42, n_init=10)
    clusters = kmeans.fit_predict(transformed)

    points = [
        PCAPoint(
            speciesName=str(df.iloc[i]["speciesName"]),
            pc1=float(transformed[i][0]),
            pc2=float(transformed[i][1]) if nc > 1 else 0.0,
            cluster=int(clusters[i]),
        )
        for i in range(len(df))
    ]

    return PCAResult(
        points=points,
        explained_variance=[float(v) for v in pca.explained_variance_ratio_],
        components=pca.components_.tolist(),
    )
