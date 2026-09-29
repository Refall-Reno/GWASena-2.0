"""Endpoint pemeriksaan kesehatan sistem (bukti kerangka berjalan)."""
from fastapi import APIRouter

from backend.core.config import settings
from backend.core.database import check_database

router = APIRouter(prefix="/api/health", tags=["health"])


def check_redis() -> dict:
    try:
        import redis

        client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1)
        client.ping()
        return {"ok": True}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": str(exc).splitlines()[0]}


@router.get("")
def health():
    db = check_database()
    rd = check_redis()
    return {
        "status": "ok" if db["ok"] else "degraded",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
        "components": {"api": {"ok": True}, "database": db, "redis": rd},
    }


@router.get("/worker")
def worker_health():
    """Mengirim tugas 'ping' ke Celery worker dan menunggu balasan (maks. 5 detik)."""
    if not check_redis()["ok"]:
        return {"ok": False, "error": "Redis tidak dapat dihubungi, worker tidak bisa dicek."}
    try:
        from backend.tasks.pipeline_tasks import ping

        result = ping.apply_async(retry=False).get(timeout=5)
        return {"ok": result == "pong", "reply": result}
    except Exception as exc:  # noqa: BLE001
        return {"ok": False, "error": f"Worker tidak merespons: {exc}"}
