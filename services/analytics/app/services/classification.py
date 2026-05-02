import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, confusion_matrix

from app.domain.models import ObservationInput, ClassifyResult


def run_classification(observations: list[ObservationInput], target: str) -> ClassifyResult:
    df = pd.DataFrame([{
        "speciesName": o.speciesName,
        "lat": o.lat,
        "lng": o.lng,
        "month": int(o.date[5:7]) if len(o.date) >= 7 else 0,
        "year": int(o.date[:4]) if len(o.date) >= 4 else 0,
        "biome": o.biome,
        "region": o.region,
    } for o in observations])

    le_sp = LabelEncoder()
    le_target = LabelEncoder()

    df["species_enc"] = le_sp.fit_transform(df["speciesName"])
    target_col = target if target in df.columns else "biome"
    df["target"] = le_target.fit_transform(df[target_col])

    feature_cols = ["lat", "lng", "species_enc", "month", "year"]
    X = df[feature_cols].values
    y = df["target"].values

    if len(set(y)) < 2 or len(X) < 10:
        return ClassifyResult(
            accuracy=0.0,
            feature_importance={},
            confusion_labels=list(le_target.classes_),
            confusion_matrix=[],
            top_rules=[],
        )

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    dt = DecisionTreeClassifier(max_depth=4, random_state=42)
    dt.fit(X_train, y_train)
    y_pred = dt.predict(X_test)

    acc = accuracy_score(y_test, y_pred)
    cm = confusion_matrix(y_test, y_pred).tolist()

    importance = dict(zip(feature_cols, [float(v) for v in dt.feature_importances_]))
    importance = dict(sorted(importance.items(), key=lambda x: x[1], reverse=True))

    rules_text = export_text(dt, feature_names=feature_cols, max_depth=3)
    top_rules = [line.strip() for line in rules_text.split("\n") if "|---" in line][:6]

    labels: list[str] = list(le_target.classes_)

    return ClassifyResult(
        accuracy=float(acc),
        feature_importance=importance,
        confusion_labels=labels,
        confusion_matrix=cm,
        top_rules=top_rules,
    )
