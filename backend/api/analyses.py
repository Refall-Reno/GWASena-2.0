"""Sesi analisis (M-03). Daftar sudah membaca DB; pembuatan sesi menyusul."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from backend.core.database import get_db
from backend.models import Analysis, AnalysisModel

router = APIRouter(prefix="/api/analyses", tags=["analyses (M-03)"])


@router.get("")
def list_analyses(db: Session = Depends(get_db)):
    # TODO (FR-12): filter berdasarkan user yang sedang login.
    rows = db.scalars(select(Analysis).order_by(Analysis.analysis_id.desc())).all()
    return [
        {
            "analysis_id": a.analysis_id,
            "analysis_name": a.analysis_name,
            "status": a.status,
            "organism": a.organism,
            "analysis_time": a.analysis_time,
        }
        for a in rows
    ]


@router.get("/models")
def list_models(db: Session = Depends(get_db)):
    rows = db.scalars(select(AnalysisModel).order_by(AnalysisModel.model_id)).all()
    return [
        {"model_id": m.model_id, "model_name": m.model_name, "description": m.description}
        for m in rows
    ]


@router.post("", status_code=501)
def create_analysis():
    raise HTTPException(status_code=501, detail="Pembuatan sesi analisis menyusul (UC-01).")
