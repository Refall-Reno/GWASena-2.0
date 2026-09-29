"""Mengimpor semua entitas agar terdaftar di Base.metadata."""
from backend.models.entities import (  # noqa: F401
    AnalysisStatus,
    User,
    AnalysisModel,
    Analysis,
    Dataset,
    Sample,
    SNP,
    Genotype,
    Phenotype,
    AnalysisParameter,
    AssociationResult,
    VisualizationResult,
    AnalysisLog,
)
