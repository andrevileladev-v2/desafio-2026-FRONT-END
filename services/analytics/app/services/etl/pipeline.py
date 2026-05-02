"""ETL pipeline: ingestão → limpeza → normalização → feature engineering → processado"""
import json
import os
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder

RAW_DIR = Path(__file__).parents[5] / "data" / "raw"
PROCESSED_DIR = Path(__file__).parents[5] / "data" / "processed"
PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ─── 1. Ingestão ──────────────────────────────────────────────────────────────

def ingest_csv(filename: str) -> pd.DataFrame:
    path = RAW_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Raw file not found: {path}")
    return pd.read_csv(path)


def ingest_from_memory(records: list[dict]) -> pd.DataFrame:
    return pd.DataFrame(records)


# ─── 2. Limpeza ───────────────────────────────────────────────────────────────

def clean_observations(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Remove duplicatas
    df = df.drop_duplicates(subset=["speciesId", "lat", "lng", "date"])

    # Remove coordenadas inválidas (Brasil: lat -34..5, lng -74..-28)
    df = df[df["lat"].between(-34, 5)]
    df = df[df["lng"].between(-74, -28)]

    # Normaliza datas
    df["date"] = pd.to_datetime(df["date"], errors="coerce").dt.strftime("%Y-%m-%d")
    df = df.dropna(subset=["date"])

    # Preenche notas vazias
    df["notes"] = df["notes"].fillna("")

    return df.reset_index(drop=True)


def clean_species(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df = df.drop_duplicates(subset=["scientificName"])
    df["description"] = df["description"].fillna("")
    df["biome"] = df["biome"].fillna("Desconhecido")
    return df.reset_index(drop=True)


# ─── 3. Normalização & Feature Engineering ───────────────────────────────────

def engineer_features(obs_df: pd.DataFrame) -> pd.DataFrame:
    df = obs_df.copy()
    df["date"] = pd.to_datetime(df["date"])

    # Coordenadas normalizadas [0,1]
    scaler = MinMaxScaler()
    df[["lat_norm", "lng_norm"]] = scaler.fit_transform(df[["lat", "lng"]])

    # Features temporais
    df["month"] = df["date"].dt.month
    df["year"] = df["date"].dt.year
    df["day_of_year"] = df["date"].dt.day_of_year
    df["season"] = df["month"].map({
        12: "Verão", 1: "Verão", 2: "Verão",
        3: "Outono", 4: "Outono", 5: "Outono",
        6: "Inverno", 7: "Inverno", 8: "Inverno",
        9: "Primavera", 10: "Primavera", 11: "Primavera",
    })

    # Encoding
    le = LabelEncoder()
    df["biome_enc"] = le.fit_transform(df["biome"].fillna("Desconhecido"))
    df["region_enc"] = le.fit_transform(df["region"].fillna("Desconhecido"))

    df["date"] = df["date"].dt.strftime("%Y-%m-%d")
    return df


# ─── 4. Estatísticas de resumo ────────────────────────────────────────────────

def compute_summary(obs_df: pd.DataFrame) -> dict:
    df = obs_df.copy()
    df["date"] = pd.to_datetime(df["date"])

    return {
        "total_observations": len(df),
        "unique_species": df["speciesName"].nunique(),
        "unique_biomes": df["biome"].nunique(),
        "date_range": {
            "start": df["date"].min().strftime("%Y-%m-%d"),
            "end": df["date"].max().strftime("%Y-%m-%d"),
        },
        "by_biome": df.groupby("biome").size().to_dict(),
        "by_year": df.groupby(df["date"].dt.year).size().to_dict(),
        "by_species": df.groupby("speciesName").size().nlargest(10).to_dict(),
        "lat_stats": {
            "mean": round(float(df["lat"].mean()), 4),
            "std": round(float(df["lat"].std()), 4),
        },
        "lng_stats": {
            "mean": round(float(df["lng"].mean()), 4),
            "std": round(float(df["lng"].std()), 4),
        },
    }


# ─── 5. Pipeline completo ─────────────────────────────────────────────────────

def run_pipeline(observations: list[dict]) -> dict:
    obs_df = ingest_from_memory(observations)

    obs_clean = clean_observations(obs_df)

    obs_features = engineer_features(obs_clean)

    summary = compute_summary(obs_clean)

    # Persiste dados processados
    obs_out = PROCESSED_DIR / "observations_processed.csv"
    obs_features.to_csv(obs_out, index=False)

    summary_out = PROCESSED_DIR / "summary.json"
    with open(summary_out, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2, default=str)

    removed = len(obs_df) - len(obs_clean)

    return {
        "input_rows": len(obs_df),
        "output_rows": len(obs_clean),
        "removed_rows": removed,
        "features_added": ["lat_norm", "lng_norm", "month", "year", "day_of_year", "season", "biome_enc", "region_enc"],
        "output_files": [str(obs_out), str(summary_out)],
        "summary": summary,
    }


def run_csv_pipeline(obs_filename: str = "observations_sample.csv") -> dict:
    obs_df = ingest_csv(obs_filename)
    obs_clean = clean_observations(obs_df)
    obs_features = engineer_features(obs_clean)
    summary = compute_summary(obs_clean)

    obs_out = PROCESSED_DIR / "observations_processed.csv"
    obs_features.to_csv(obs_out, index=False)

    summary_out = PROCESSED_DIR / "summary.json"
    with open(summary_out, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2, default=str)

    return {
        "input_rows": len(obs_df),
        "output_rows": len(obs_clean),
        "removed_rows": len(obs_df) - len(obs_clean),
        "features_added": ["lat_norm", "lng_norm", "month", "year", "day_of_year", "season", "biome_enc", "region_enc"],
        "output_files": [str(obs_out), str(summary_out)],
        "summary": summary,
    }
