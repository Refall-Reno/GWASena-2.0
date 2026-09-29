"""
Aplikasi Celery (worker komputasi asinkron, dipakai penuh mulai Minggu 8).

Menjalankan worker (dari root repositori, venv aktif):
  Windows : celery -A backend.tasks.celery_app:celery_app worker --loglevel=info --pool=solo
  Mac/Linux: celery -A backend.tasks.celery_app:celery_app worker --loglevel=info
"""
from celery import Celery

from backend.core.config import settings

celery_app = Celery(
    "gwasena",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["backend.tasks.pipeline_tasks"],
)
celery_app.conf.update(
    task_track_started=True,
    timezone="Asia/Jakarta",
    broker_connection_retry_on_startup=True,
)
