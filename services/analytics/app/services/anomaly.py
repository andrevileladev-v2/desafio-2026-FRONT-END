import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import LabelEncoder

from app.domain.models import ObservationInput, AnomalyResult


def run_anomaly_detection(observations: list[ObservationInput], contamination: float) -> list[AnomalyResult]:
    df = pd.DataFrame([{
        "id": o.id,
        "speciesName": o.speciesName,
        "lat": o.lat,
        "lng": o.lng,
        "date": o.date,
        "region": o.region,
        "biome": o.biome,
        "month": int(o.date[5:7]) if len(o.date) >= 7 else 0,
        "year": int(o.date[:4]) if len(o.date) >= 4 else 0,
    } for o in observations])

    le = LabelEncoder()
    df["species_enc"] = le.fit_transform(df["speciesName"])

    features = df[["lat", "lng", "species_enc", "month", "year"]].values

    clf = IsolationForest(contamination=contamination, random_state=42)
    scores = clf.fit_predict(features)
    raw_scores = clf.score_samples(features)

    results: list[AnomalyResult] = []
    for i, row in df.iterrows():
        idx = int(i)  # type: ignore
        results.append(AnomalyResult(
            id=str(row["id"]),
            speciesName=str(row["speciesName"]),
            lat=float(row["lat"]),
            lng=float(row["lng"]),
            date=str(row["date"]),
            region=str(row["region"]),
            anomaly_score=float(raw_scores[idx]),
            is_anomaly=bool(scores[idx] == -1),
        ))

    return sorted(results, key=lambda r: r.anomaly_score)
