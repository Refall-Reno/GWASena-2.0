"""
Skema basis data GWASena.

Mengikuti SKPL Tabel 6 (Data yang disimpan oleh sistem), disesuaikan untuk
fokus bawang putih (Allium sativum). Penyesuaian dari SKPL ditandai [PENYESUAIAN].
"""
from datetime import datetime

from sqlalchemy import (
    JSON,
    BigInteger,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    SmallInteger,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from backend.core.database import Base

# JSONB di PostgreSQL (sesuai SDP), JSON biasa di SQLite (khusus pengujian).
JSONType = JSON().with_variant(JSONB(), "postgresql")
# BIGINT di PostgreSQL; SQLite butuh INTEGER agar autoincrement jalan.
BigIntPK = BigInteger().with_variant(Integer(), "sqlite")


class AnalysisStatus:
    """Nilai kolom Analysis.status (dipakai modul M-03 Orkestrasi)."""
    DRAFT = "draft"                    # sesi dibuat, berkas belum lengkap
    TERVALIDASI = "tervalidasi"        # lolos validasi M-02 (BR-01, BR-02)
    ANTRE = "antre"                    # sudah dikirim ke Celery
    BERJALAN = "berjalan"              # komputasi berlangsung (BR-05: UI terkunci)
    SELESAI = "selesai"
    GAGAL = "gagal"


def _now():
    return mapped_column(DateTime(timezone=True), server_default=func.now())


# ---------------------------------------------------------------- M-01
class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    # [PENYESUAIAN] SKPL belum mencantumkan kolom kata sandi; wajib untuk FR-01.
    password_hash: Mapped[str | None] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="pengguna_analisis")  # atau "administrator"
    created_at: Mapped[datetime] = _now()


# ---------------------------------------------------------------- referensi model
class AnalysisModel(Base):
    __tablename__ = "analysis_models"

    model_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    model_name: Mapped[str] = mapped_column(String(20), unique=True)  # GLM / MLM
    software_version: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)


# ---------------------------------------------------------------- sesi analisis
class Analysis(Base):
    __tablename__ = "analyses"

    analysis_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id", ondelete="CASCADE"), index=True)
    analysis_name: Mapped[str] = mapped_column(String(150))
    status: Mapped[str] = mapped_column(String(20), default=AnalysisStatus.DRAFT, index=True)
    # [PENYESUAIAN] organisme dicatat eksplisit; default bawang putih.
    organism: Mapped[str] = mapped_column(String(80), default="Allium sativum")
    # [PENYESUAIAN] menghubungkan sesi dengan model yang dipilih (BR-03: satu model per sesi).
    model_id: Mapped[int | None] = mapped_column(ForeignKey("analysis_models.model_id"))
    analysis_time: Mapped[datetime] = _now()


# ---------------------------------------------------------------- M-02
class Dataset(Base):
    __tablename__ = "datasets"

    dataset_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.analysis_id", ondelete="CASCADE"), index=True)
    file_name: Mapped[str] = mapped_column(String(255))
    # vcf | plink_bed | plink_bim | plink_fam | phenotype_csv
    file_type: Mapped[str] = mapped_column(String(30))
    file_path: Mapped[str | None] = mapped_column(String(500))
    validation_status: Mapped[str] = mapped_column(String(20), default="belum_diperiksa")
    upload_time: Mapped[datetime] = _now()


class Sample(Base):
    __tablename__ = "samples"
    __table_args__ = (UniqueConstraint("dataset_id", "sample_code"),)

    sample_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.dataset_id", ondelete="CASCADE"), index=True)
    sample_code: Mapped[str] = mapped_column(String(100))
    # Nama varietas/aksesi bawang putih, mis. "Lumbu Hijau", "Sangga Sembalun".
    variety: Mapped[str | None] = mapped_column(String(100))


class SNP(Base):
    __tablename__ = "snps"

    snp_id: Mapped[int] = mapped_column(BigIntPK, primary_key=True)
    # [PENYESUAIAN] SNP dikaitkan ke dataset asalnya.
    dataset_id: Mapped[int] = mapped_column(ForeignKey("datasets.dataset_id", ondelete="CASCADE"), index=True)
    variant_code: Mapped[str | None] = mapped_column(String(100))  # kolom ID pada VCF
    chromosome: Mapped[str] = mapped_column(String(50))  # bawang putih: 8 kromosom
    # PENTING: BIGINT, bukan INTEGER. Kromosom bawang putih bisa > 2,1 miliar bp,
    # melebihi batas INTEGER PostgreSQL (2.147.483.647).
    position: Mapped[int] = mapped_column(BigInteger)
    ref_allele: Mapped[str | None] = mapped_column(String(50))
    alt_allele: Mapped[str | None] = mapped_column(String(50))


class Genotype(Base):
    __tablename__ = "genotypes"

    genotype_id: Mapped[int] = mapped_column(BigIntPK, primary_key=True)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.sample_id", ondelete="CASCADE"), index=True)
    snp_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("snps.snp_id", ondelete="CASCADE"), index=True)
    # Dosis alel: 0/1/2, NULL = missing.
    genotype_value: Mapped[int | None] = mapped_column(SmallInteger)


class Phenotype(Base):
    __tablename__ = "phenotypes"

    phenotype_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sample_id: Mapped[int] = mapped_column(ForeignKey("samples.sample_id", ondelete="CASCADE"), index=True)
    # Contoh sifat bawang putih: bobot_umbi_g, diameter_umbi_mm, jumlah_siung
    trait_name: Mapped[str] = mapped_column(String(100))
    phenotype_value: Mapped[float | None] = mapped_column(Float)


# ---------------------------------------------------------------- M-03
class AnalysisParameter(Base):
    __tablename__ = "analysis_parameters"

    parameter_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(
        ForeignKey("analyses.analysis_id", ondelete="CASCADE"), unique=True
    )
    # Contoh: {"qc": {"mind": 0.1, "geno": 0.1, "maf": 0.05, "hwe": 1e-6, "king_cutoff": 0.177},
    #          "model": "MLM", "n_pc": 3, "koreksi": ["bonferroni", "fdr"], "alpha": 0.05,
    #          "trait": "bobot_umbi_g"}
    parameter_config: Mapped[dict] = mapped_column(JSONType, default=dict)


class AnalysisLog(Base):
    __tablename__ = "analysis_logs"

    log_id: Mapped[int] = mapped_column(BigIntPK, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.analysis_id", ondelete="CASCADE"), index=True)
    stage: Mapped[str | None] = mapped_column(String(30))  # validasi/qc/pca/asosiasi/anotasi/visualisasi
    status: Mapped[str] = mapped_column(String(20))
    message: Mapped[str | None] = mapped_column(Text)
    timestamp: Mapped[datetime] = _now()


# ---------------------------------------------------------------- M-06 & M-08
class AssociationResult(Base):
    __tablename__ = "association_results"

    result_id: Mapped[int] = mapped_column(BigIntPK, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.analysis_id", ondelete="CASCADE"), index=True)
    snp_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("snps.snp_id", ondelete="CASCADE"))
    p_value: Mapped[float | None] = mapped_column(Float)
    effect_size: Mapped[float | None] = mapped_column(Float)
    std_error: Mapped[float | None] = mapped_column(Float)  # [PENYESUAIAN] SE ada di format ekspor CSV (SDP 4.1.1)
    q_value: Mapped[float | None] = mapped_column(Float)


class VisualizationResult(Base):
    __tablename__ = "visualization_results"

    visualization_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    analysis_id: Mapped[int] = mapped_column(ForeignKey("analyses.analysis_id", ondelete="CASCADE"), index=True)
    plot_type: Mapped[str] = mapped_column(String(20))  # manhattan / qq
    file_path: Mapped[str | None] = mapped_column(String(500))
    # [PENYESUAIAN] cache titik plot hasil smart downsampling (SDP 4.3, kolom JSONB).
    plot_cache: Mapped[dict | None] = mapped_column(JSONType)
