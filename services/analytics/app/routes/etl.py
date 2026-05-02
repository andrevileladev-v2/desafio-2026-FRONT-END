import io
import json
from pathlib import Path

import pandas as pd
from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel

from app.services.etl.pipeline import run_pipeline, run_csv_pipeline

router = APIRouter(prefix="/etl", tags=["etl"])

PROCESSED_DIR = Path(__file__).parents[4] / "data" / "processed"


class ETLRequest(BaseModel):
    observations: list[dict]


@router.post("/run")
def run_etl(req: ETLRequest):
    if not req.observations:
        raise HTTPException(status_code=400, detail="No observations provided")
    try:
        return run_pipeline(req.observations)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/run-csv")
def run_etl_csv(filename: str = "observations_sample.csv"):
    try:
        return run_csv_pipeline(filename)
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted")
    content = await file.read()
    try:
        df = pd.read_csv(io.StringIO(content.decode("utf-8")))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Invalid CSV: {e}")

    required = {"speciesName", "lat", "lng", "date"}
    missing = required - set(df.columns)
    if missing:
        raise HTTPException(status_code=422, detail=f"Missing columns: {missing}")

    observations = df.to_dict(orient="records")
    result = run_pipeline(observations)
    return {**result, "filename": file.filename, "columns": list(df.columns)}


@router.get("/summary")
def get_summary():
    path = PROCESSED_DIR / "summary.json"
    if not path.exists():
        raise HTTPException(status_code=404, detail="No processed data yet. Run the ETL pipeline first.")
    with open(path, encoding="utf-8") as f:
        return json.load(f)


@router.get("/processed")
def get_processed(limit: int = 100):
    path = PROCESSED_DIR / "observations_processed.csv"
    if not path.exists():
        raise HTTPException(status_code=404, detail="No processed data yet.")
    df = pd.read_csv(path).head(limit)
    return df.to_dict(orient="records")
