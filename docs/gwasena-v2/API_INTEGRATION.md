# API_INTEGRATION.md — Kontrak Integrasi Frontend & Backend GWASena 2.0

Dokumen ini disusun berdasarkan hasil audit aktual kode backend pada origin/develop (PR #19) dan kontrak modul LKP 4. Semua implementasi frontend wajib mematuhi endpoint, payload, dan format respons di bawah ini.

## 1. Konfigurasi Proxy & Base URL
- Frontend berjalan di port 5173 dan menggunakan reverse proxy Vite (frontend/vite.config.js) untuk meneruskan semua panggilan berawalan /api ke backend FastAPI (http://localhost:8000 atau process.env.VITE_API_TARGET).
- Seluruh service di frontend memanggil path relatif seperti fetch('/api/auth/login', ...).

## 2. Standar Header Autentikasi
- Token disimpan di localStorage dengan key gwasena_access_token.
- Setiap request ke endpoint terproteksi wajib menyertakan HTTP header:
  Authorization: Bearer <access_token>
- Jika backend merespons dengan HTTP 401 Unauthorized, client wajib menghapus token yang kedaluwarsa dari localStorage dan mengarahkan pengguna kembali ke /login dengan pesan "Sesi Anda telah berakhir. Silakan login kembali."

## 3. Spesifikasi Endpoint Terverifikasi (Berfungsi Penuh di Backend)

### 3.1 Health & Metadata
- GET /api/health: Mengembalikan status ketersediaan API, basis data PostgreSQL, dan antrean Redis.
- GET /api/health/worker: Menguji koneksi Celery worker (pesan ping -> pong).
- GET /api/meta: Mengembalikan metadata organisme (Allium sativum L.), daftar format berkas yang didukung, dan status kesiapan modul.
- GET /api/analyses/models: Mengembalikan daftar referensi model asosiasi (GLM dan MLM).

### 3.2 Autentikasi (backend/api/auth.py)
1. Registrasi Akun (POST /api/auth/register — Layar S-02):
   - Request Body (application/json):
     {
       "username": "peneliti01",
       "email": "peneliti01@apps.ipb.ac.id",
       "password": "kataSandiAman123"
     }
   - Respons 201 Created:
     {
       "pesan": "Akun berhasil dibuat. Silakan login.",
       "pengguna": {
         "user_id": 1,
         "username": "peneliti01",
         "email": "peneliti01@apps.ipb.ac.id",
         "role": "pengguna_analisis"
       }
     }
   - Respons 409 Conflict: {"detail": "Username atau email sudah terdaftar."}
   - Perilaku Frontend: Setelah menerima status 201, arahkan ke /login (backend tidak melakukan auto-login).

2. Login Pengguna (POST /api/auth/login — Layar S-01):
   - Request Body (application/json):
     {
       "username": "peneliti01",
       "password": "kataSandiAman123"
     }
     (Catatan: Field username menerima input berupa username maupun alamat email).
   - Respons 200 OK:
     {
       "access_token": "<token_string>",
       "token_type": "bearer",
       "berlaku_jam": 12,
       "pengguna": {
         "user_id": 1,
         "username": "peneliti01",
         "email": "peneliti01@apps.ipb.ac.id",
         "role": "pengguna_analisis"
       }
     }
   - Respons 401 Unauthorized: {"detail": "Username/email atau kata sandi salah."}

3. Profil Pengguna Aktif (GET /api/auth/me):
   - Header: Authorization: Bearer <token>
   - Respons 200 OK: {"user_id": 1, "username": "peneliti01", "email": "...", "role": "pengguna_analisis"}

### 3.3 Manajemen Sesi Analisis & Riwayat (backend/api/analyses.py)
1. Daftar Riwayat Analisis (GET /api/analyses — Layar S-10):
   - Mengembalikan array daftar sesi analisis milik pengguna yang sedang login.
2. Buat Sesi Analisis Baru (POST /api/analyses — Layar S-03):
   - Request Body: {"analysis_name": "Analisis Bobot Umbi Bawang Putih"}
   - Respons 201 Created:
     {
       "analysis_id": 1,
       "analysis_name": "Analisis Bobot Umbi Bawang Putih",
       "status": "draft",
       "organism": "Allium sativum",
       "analysis_time": "2026-10-22T04:15:00Z",
       "langkah_berikutnya": "POST /api/analyses/1/upload"
     }
3. Detail Sesi Analisis (GET /api/analyses/{analysis_id}):
   - Mengembalikan detail sesi, status (draft, tervalidasi, antre, berjalan, selesai, gagal), berkas dataset, sifat fenotipe tersedia, dan konfigurasi parameter.
   - Kontrol Akses (BR-04): Jika sesi milik user lain, backend merespons HTTP 403 Forbidden ({"detail": "Anda tidak memiliki akses ke analisis ini."}). Frontend wajib menampilkan komponen AccessDeniedState.

### 3.4 Unggah & Validasi Dataset (POST /api/analyses/{analysis_id}/upload — Layar S-04)
- Content-Type: multipart/form-data
- FormData Keys:
  - genotipe: berkas File (.vcf atau .vcf.gz)
  - fenotipe: berkas File (.csv)
- Respons 200 OK:
  {
    "pesan": "Berkas valid dan sudah disimpan.",
    "analysis_id": 1,
    "status": "tervalidasi",
    "genotipe": {
      "nama_berkas": "genotipe_bawang_putih.vcf",
      "jumlah_sampel": 40,
      "jumlah_snp": 500,
      "varian_dilewati": { "multialelik": 2, "bukan_snp": 1 },
      "genotipe_disimpan_ke_tabel": true
    },
    "fenotipe": {
      "nama_berkas": "fenotipe_bawang_putih.csv",
      "jumlah_sampel": 40,
      "sifat_tersedia": ["bobot_umbi_g", "diameter_umbi_mm", "jumlah_siung"],
      "varietas_tercatat": 40
    },
    "kecocokan_sample_id": {
      "jumlah_sampel_cocok": 40,
      "status": "cocok"
    }
  }
- Respons 422 Unprocessable Entity (Format Salah atau Sample ID Tidak Cocok):
  {
    "detail": {
      "pesan": "ID sampel pada berkas genotipe dan fenotipe tidak cocok.",
      "rincian": [
        "3 ID ada di CSV tetapi tidak ada di VCF: BP038, BP039, BP040",
        "Perbaiki salah satu berkas agar ID sampelnya sama, lalu unggah ulang."
      ]
    }
  }
- Respons 409 Conflict (BR-05):
  {
    "detail": {
      "pesan": "Analisis sedang berjalan; unggahan dikunci sampai selesai.",
      "rincian": []
    }
  }

## 4. Kontrak Endpoint Pipeline Tahap Lanjut & Penanganan Status 501 Not Implemented
Endpoint berikut sudah terdaftar pada router backend namun saat ini masih mengembalikan status HTTP 501 Not Implemented (sedang diselesaikan tim backend/pipeline):
1. PUT /api/analyses/{analysis_id}/parameters (Layar S-05):
   Payload JSON yang dikirim frontend:
   {
     "qc": {
       "mind": 0.1,
       "geno": 0.1,
       "maf": 0.05,
       "hwe": 1e-6,
       "king_cutoff": 0.177
     },
     "model": "MLM",
     "n_pc": 3,
     "koreksi": ["bonferroni", "fdr"],
     "alpha": 0.05,
     "trait": "bobot_umbi_g"
   }
2. POST /api/analyses/{analysis_id}/run (Layar S-05 -> S-06): Memicu eksekusi pipeline di Celery worker.
3. GET /api/analyses/{analysis_id}/status (Layar S-06): Polling status setiap 3 detik saat status antre atau berjalan.
4. GET /api/analyses/{analysis_id}/results (Layar S-07, S-08, S-09): Mengambil data manhattan, qq, association_results, dan significant_snps.

### Aturan Penanganan HTTP 501 & Mode Pratinjau Terisolasi
- Jika frontend memanggil endpoint yang merespons HTTP 501 Not Implemented:
  1. Mode Normal (Live Backend): Tampilkan banner informasi yang jujur: "Endpoint komputasi tahap ini sedang dalam penyelesaian integrasi backend (HTTP 501). Konfigurasi parameter Anda telah divalidasi di antarmuka."
  2. Mode Pratinjau UI Terkontrol (Khusus Development Lokal): Jika variabel environment VITE_ENABLE_UI_SANDBOX=true diaktifkan, sediakan tombol berlabel tegas "[Mode Simulasi UI — Data Ilustrasi Non-Riil]" agar tim dapat menguji interaksi komponen S-06, Manhattan Plot S-07, Anotasi S-08, dan Ekspor S-09 dengan badge peringatan kuning yang selalu terlihat di atas layar sehingga tidak pernah disalahartikan sebagai hasil komputasi ilmiah nyata.