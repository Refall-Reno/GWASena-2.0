# GWASena

Platform GWAS berbasis web yang interaktif dan edukatif untuk analisis asosiasi
genom pada **bawang putih (*Allium sativum* L.)**.
Mata kuliah BIF 1322 Pembangunan Perangkat Lunak, IPB University, Kelompok 04.

| Lapisan | Teknologi |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI (Python) |
| Basis data | PostgreSQL 16 (kolom JSONB) |
| Antrean tugas | Redis + Celery |
| Engine bioinformatika | PLINK 2 + GAPIT (menyusul Minggu 6–7) |

## Menjalankan di komputer pengembang (ringkas)

Prasyarat: Git, Python 3.11/3.12, Node.js 20 LTS, Docker Desktop.
Panduan lengkap dan pemecahan masalah ada di [`docs/SETUP_LOKAL.md`](docs/SETUP_LOKAL.md).

```bash
# 1. Salin konfigurasi
cp .env.example .env                  # Windows: copy .env.example .env

# 2. Nyalakan PostgreSQL + Redis
docker compose up -d

# 3. Backend (terminal 1, dari root repositori)
python -m venv .venv
source .venv/bin/activate             # Windows: .venv\Scripts\activate
pip install -r backend/requirements-dev.txt
uvicorn backend.main:app --reload     # http://localhost:8000/docs

# 4. Frontend (terminal 2)
cd frontend
npm install
npm run dev                           # http://localhost:5173
```

Berhasil bila halaman http://localhost:5173 menampilkan API, Basis data, dan
Redis berstatus **Terhubung**.

Alternatif satu perintah (semua di Docker): `docker compose --profile full up --build`.

## Struktur repositori

```
GWASena/
├── frontend/          # React: components/, pages/, services/
├── backend/           # FastAPI: api/, models/, services/, tasks/, core/
├── pipeline/          # engine GWAS per tahap: validation/, quality_control/, pca/, gwas/, annotation/
├── tests/             # pytest (dijalankan juga oleh GitHub Actions)
├── docs/              # SKPL, SDD, panduan
├── docker/            # Dockerfile per layanan
├── data/contoh/       # data DUMMY untuk uji alur
├── docker-compose.yml
└── README.md
```

## Endpoint yang sudah tersedia

| Method | Path | Keterangan |
|---|---|---|
| GET | `/api/health` | Status API, PostgreSQL (beserta daftar tabel), Redis |
| GET | `/api/health/worker` | Mengirim tugas uji ke Celery worker |
| GET | `/api/meta` | Organisme target, format input, daftar modul M-01–M-08 |
| GET | `/api/analyses` | Daftar sesi analisis (masih kosong) |
| GET | `/api/analyses/models` | Model uji asosiasi (GLM, MLM) dari basis data |
| POST | `/api/auth/register`, `/api/auth/login`, `/api/datasets/upload`, `/api/analyses` | Sudah terdaftar, mengembalikan 501 sampai diimplementasikan |

## Alur kerja Git

`feature/<nama-fitur>` → Pull Request → review → merge ke `develop` → rilis stabil ke `main`.
Format commit: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
