"""Koneksi basis data (SQLAlchemy 2.0)."""
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from backend.core.config import settings

_connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # SQLite hanya dipakai untuk pengujian otomatis (pytest / CI).
    _connect_args = {"check_same_thread": False}

engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    connect_args=_connect_args,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


class Base(DeclarativeBase):
    """Kelas dasar seluruh entitas (tabel)."""


def get_db():
    """Dependency FastAPI: membuka sesi DB per request lalu menutupnya."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def check_database() -> dict:
    """Dipakai endpoint /api/health untuk memastikan DB bisa dihubungi."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        tables = sorted(inspect(engine).get_table_names())
        return {"ok": True, "dialect": engine.dialect.name, "tables": tables}
    except Exception as exc:  # noqa: BLE001 - tampilkan pesan apa pun ke health check
        return {"ok": False, "error": str(exc).splitlines()[0]}
