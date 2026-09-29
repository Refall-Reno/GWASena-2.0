"""Tugas-tugas Celery. Saat ini hanya tugas uji koneksi."""
from backend.tasks.celery_app import celery_app


@celery_app.task(name="gwasena.ping")
def ping() -> str:
    return "pong"


# Minggu 6–8: tambahkan di sini
# @celery_app.task(name="gwasena.run_pipeline")
# def run_pipeline(analysis_id: int): ...  # QC -> PCA -> asosiasi -> koreksi -> anotasi
