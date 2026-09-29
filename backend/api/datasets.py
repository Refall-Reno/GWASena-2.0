"""M-02 Manajemen Input dan Validasi Data (FR-02, FR-11). Implementasi Minggu 6."""
from fastapi import APIRouter, HTTPException

router = APIRouter(prefix="/api/datasets", tags=["datasets (M-02)"])


@router.post("/upload", status_code=501)
def upload_dataset():
    raise HTTPException(
        status_code=501,
        detail="Unggah & validasi VCF/PLINK/CSV diimplementasikan Minggu 6 (FR-02).",
    )
