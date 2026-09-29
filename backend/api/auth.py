"""M-01 Sesi dan Kontrol Akses (FR-01). Diimplementasikan pada tahap berikutnya."""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/auth", tags=["auth (M-01)"])

_BELUM = "Endpoint sudah terdaftar, implementasi menyusul sesuai jadwal (FR-01)."


@router.post("/register", status_code=501)
def register():
    raise HTTPException(status_code=501, detail=_BELUM)


@router.post("/login", status_code=501)
def login():
    raise HTTPException(status_code=501, detail=_BELUM)
