# FRONTEND_ARCHITECTURE.md — Arsitektur Teknis Frontend GWASena 2.0

## 1. Evaluasi Kondisi Aktual Repositori vs Target Arsitektur
Berdasarkan laporan audit read-only dari Antigravity pada workspace Repo-GWASena - Copy:
- Kondisi Awal (feature/upload-step): Menggunakan React 18.3.1 + Vite 5.4.11 (JavaScript ESM) tanpa sistem routing (react-router-dom belum ada), tanpa framework styling (Tailwind CSS belum ada), tanpa state management (Zustand belum ada), dan tanpa engine visualisasi grafik (Plotly belum ada). Selain itu, branch lokal tertinggal dari origin/develop (PR #19).
- Keputusan Arsitektur GWASena 2.0 (DEC-01 & DEC-02):
  1. Melakukan sinkronisasi Git (git merge origin/develop) terlebih dahulu agar backend autentikasi JWT/HMAC dan validasi dataset VCF/CSV dari PR #19 aktif di lokal.
  2. Mempertahankan fondasi React 18 + Vite (JavaScript .jsx) agar 100% kompatibel dengan konfigurasi Docker (docker/frontend.Dockerfile) dan vite.config.js tim.
  3. Menginstal paket ekosistem produksi yang ringkas dan teruji untuk mendukung 11 layar aplikasi (S-00 s.d. S-10) dan 8 modul sistem (M-01 s.d. M-08).

---

## 2. Spesifikasi Dependency Baru (frontend/package.json)

| Nama Package | Kategori | Alasan Teknis & Fungsi dalam Modul GWASena |
|---|---|---|
| react-router-dom (^6.28.0) | Routing & Guard | Mengelola navigasi URL deklaratif (/welcome, /login, /register, /dashboard, /analyses/:id, /history), ProtectedRoute (AC-01.3), dan pembacaan parameter analysis_id. |
| zustand (^5.0.0) | State Management | Mengelola state global sesi pengguna (useAuthStore), preferensi tema Light/Dark (useThemeStore), dan state aktif wizard analisis (useAnalysisStore) tanpa prop-drilling. |
| lucide-react (^0.460.0) | Ikonografi Ilmiah & UI | Menyediakan ikon vektor yang konsisten untuk Stepper, status validasi berkas, tooltip [EDU-HINT], tombol ekspor, dan navigasi. |
| plotly.js-dist-min (^2.35.2) | Engine Grafik Ilmiah | Merender Manhattan Plot dan QQ Plot interaktif pada S-07 (M-08, FR-08) menggunakan mode scattergl (WebGL/Canvas) agar sanggup menampilkan ratusan hingga puluhan ribu titik SNP dengan fitur klik titik (AC-08.2) dan ekspor gambar PNG (FR-09) tanpa membuat browser macet. |
| tailwindcss, postcss, autoprefixer | Design Tokens & Styling | Mengimplementasikan sistem desain Precision Bioluminescence & Editorial Science dengan dukungan kelas dark: (Dual-Theme Dark & Light Mode) serta responsive breakpoints (Desktop, Tablet, Mobile). |

---

## 3. Struktur Direktori Lengkap (frontend/src/)

frontend/
├── index.html                        # Memuat font Plus Jakarta Sans & JetBrains Mono
├── package.json                      # Konfigurasi dependency React 18 + Vite
├── vite.config.js                    # Konfigurasi port 5173 & proxy '/api' -> 'http://localhost:8000'
├── tailwind.config.js                # Definisi token warna semantik Dark/Light & font tabular-nums
├── postcss.config.js                 # Plugin tailwindcss & autoprefixer
├── public/
│   └── assets/
│       ├── logo-gwasena.png          # Logo resmi GWASena (From Genotype to Discovery.)
│       ├── dna-loop.mp4              # Video referensi DNA 3D seamless loop
│       └── dna-poster.jpg            # Gambar poster statis fallback video DNA
└── src/
    ├── main.jsx                      # Root render React 18 + BrowserRouter
    ├── App.jsx                       # Orkestrasi Routes, Root Gatekeeper, & Session Hydration
    ├── styles.css                    # Tailwind directives + CSS Variables tema Light & Dark
    ├── constants/
    │   ├── eduHints.js               # Katalog lengkap teks ilmiah [EDU-HINT] (S-05) & 5 Tips Edukatif (S-06)
    │   └── defaultParams.js          # Nilai default & batas validasi QC (mind, geno, maf, hwe, king_cutoff), PCA, GLM/MLM, Koreksi
    ├── store/
    │   ├── useAuthStore.js           # State: token, user, isLoading, login(), register(), fetchMe(), logout()
    │   ├── useThemeStore.js          # State: theme ('dark' | 'light'), toggleTheme(), initTheme()
    │   └── useAnalysisStore.js       # State: currentAnalysis, uploadSummary, params, jobStatus, results, activeStep
    ├── services/
    │   ├── apiClient.js              # HTTP wrapper (fetch) dengan injeksi Bearer token & normalisasi error 401/403/409/422/501
    │   ├── authService.js            # Endpoint /api/auth/register, /api/auth/login, /api/auth/me
    │   └── analysisService.js        # Endpoint /api/health, /api/meta, /api/analyses/* (CRUD, upload, parameters, run, status, results)
    ├── layouts/
    │   ├── AuthLayout.jsx            # Layout publik (S-00, S-01, S-02) dengan persistent DnaBackdrop
    │   └── AppLayout.jsx             # Layout aplikasi terproteksi (S-03 s.d. S-10) dengan Header, Navbar, Health Status, & User Menu
    ├── components/
    │   ├── common/
    │   │   ├── DnaBackdrop.jsx       # Komponen video DNA seamless loop + prefers-reduced-motion fallback
    │   │   ├── BrandLogo.jsx         # Komponen perender logo resmi GWASena dengan fallback SVG bersih
    │   │   ├── MessageArea.jsx       # Komponen standar [MESSAGE AREA] (mendukung string tunggal & objek 422 {pesan, rincian[]})
    │   │   ├── EduHintCard.jsx       # Komponen popover/inline [EDU-HINT] untuk parameter ilmiah
    │   │   ├── ProtectedRoute.jsx    # Penjaga rute autentikasi (redirect ke /login jika belum login - AC-01.3)
    │   │   └── AccessDeniedState.jsx # Komponen khusus HTTP 403 Forbidden (BR-04, AC-12.1)
    │   ├── wizard/
    │   │   ├── WizardStepper.jsx     # Stepper 6 langkah (terkunci saat komputasi BR-05; klik bebas pada langkah 4-6 saat selesai)
    │   │   ├── Step1Upload.jsx       # S-04 (M-02): Unggah VCF & CSV, ringkasan validasi, & tabel Sample ID tidak cocok
    │   │   ├── Step2Config.jsx       # S-05 (M-04, M-05, M-06): Form QC, badge PCA otomatis, radio eksklusif GLM/MLM, koreksi
    │   │   ├── Step3Computation.jsx  # S-06 (M-03): Layar tunggu terkunci, tahapan diskrit, ringkasan QC, & karusel Tips Edukatif
    │   │   ├── Step4Results.jsx      # S-07 (M-06, M-08): Manhattan Plot, QQ Plot, detail klik SNP, tabel SNP signifikan & terkoreksi
    │   │   ├── Step5Annotation.jsx   # S-08 (M-07): Tabel kandidat gen & penanganan non-blocking fallback Ensembl API
    │   │   └── Step6Export.jsx       # S-09 (M-08): Unduh CSV, unduh PNG plot, & cetak/unduh PDF/Web Report
    │   └── charts/
    │       ├── ManhattanPlot.jsx     # Wrapper Plotly.js untuk Manhattan Plot (warna kromosom 1-8, garis ambang, event onClick SNP)
    │       └── QQPlot.jsx            # Wrapper Plotly.js untuk QQ Plot diagnostik (Expected vs Observed -log10 P)
    └── pages/
        ├── IntroPage.jsx             # S-00: Pengalaman pengenalan pengunjung baru (Copilot-style onboarding)
        ├── LoginPage.jsx             # S-01: Halaman Masuk
        ├── RegisterPage.jsx          # S-02: Halaman Daftar Akun Peneliti
        ├── DashboardPage.jsx         # S-03: Dashboard utama (Kartu Analisis Baru, Kartu Riwayat, Info Organisme & Health)
        ├── AnalysisWizardPage.jsx    # Kontainer orkestrasi /analyses/:id (memuat Step 1 s.d. Step 6)
        └── HistoryPage.jsx           # S-10: Halaman daftar riwayat analisis milik akun aktif

---

## 4. Pemetaan Tanggung Jawab Komponen terhadap 8 Modul Sistem (LKP 4)

| Modul Sistem (LKP 4) | Kontrak Interface | Komponen & Service Frontend yang Bertanggung Jawab |
|---|---|---|
| M-01: Modul Sesi & Kontrol Akses | IF-01, IF-12 | authService.js, useAuthStore.js, ProtectedRoute.jsx, LoginPage.jsx (S-01), RegisterPage.jsx (S-02), HistoryPage.jsx (S-10), dan AccessDeniedState.jsx (menangani 403 Forbidden). |
| M-02: Modul Manajemen Input & Validasi Data | IF-02 | Step1Upload.jsx (S-04) & analysisService.uploadDataset(). Mengirim FormData (genotipe & fenotipe), merender metrik kecocokan Sample ID, dan merender daftar rincian ID yang tidak cocok saat 422. |
| M-03: Modul Orkestrasi Eksekusi Pipeline | IF-03, IF-04 | AnalysisWizardPage.jsx, WizardStepper.jsx, & Step3Computation.jsx (S-06). Mengunci form saat status "antre"/"berjalan" (BR-05), melakukan polling status, dan merotasi kartu Tips Edukatif (FR-10). |
| M-04: Modul Quality Control (QC) | IF-05 | Bagian QC pada Step2Config.jsx (S-05) (mind, geno, maf, hwe, king_cutoff) beserta kartu Ringkasan Penyaringan QC pada Step3Computation.jsx (AC-03.1). |
| M-05: Modul Analisis Struktur Populasi (PCA) | IF-06, IF-07 | Panel informasi wajib PCA Otomatis (n_pc = 3) pada Step2Config.jsx (S-05) yang dikunci agar tidak dapat dilewati (FR-04, AC-04.1). |
| M-06: Modul Uji Asosiasi & Koreksi Multiple Testing | IF-08, IF-09 | Komponen Single-Select Radio Card GLM vs MLM (BR-03) dan pemilih koreksi Bonferroni / FDR pada Step2Config.jsx (S-05), serta tabel hasil asosiasi pada Step4Results.jsx (S-07). |
| M-07: Modul Anotasi Gen | IF-10 | Step5Annotation.jsx (S-08). Menampilkan tabel kandidat gen terdekat (AC-07.1) dan mengisolasi kegagalan jaringan Ensembl REST API sebagai peringatan non-blocking (AC-07.2). |
| M-08: Modul Visualisasi & Ekspor Hasil | IF-11, IF-12 | ManhattanPlot.jsx, QQPlot.jsx pada Step4Results.jsx (S-07) serta Step6Export.jsx (S-09) untuk unduhan CSV, PNG plot, dan PDF/Web Report. |

---

## 5. Standar Penanganan Error Terpusat (apiClient.js & MessageArea.jsx)

Berdasarkan audit kode backend FastAPI, apiClient.js wajib menormalisasi dua pola struktur respons error dari backend menjadi satu format objek standar { message: string, details: string[], status: number }:
1. Error Validasi Dataset & Pipeline (HTTP 422 / HTTP 409):
   - Backend mengirimkan objek {"detail": {"pesan": "...", "rincian": ["...", "..."]}}.
   - apiClient.js mengekstrak detail.pesan sebagai message utama dan array detail.rincian sebagai details, lalu MessageArea.jsx merendernya sebagai kotak peringatan merah dengan daftar bullet points yang mudah dibaca oleh peneliti non-IT (NFR-04).
2. Error Standar FastAPI (HTTP 401, 403, 404, 501):
   - Backend mengirimkan string tunggal {"detail": "..."}.
   - Jika status === 401 (bukan pada halaman /login), hapus token dan arahkan ke /login.
   - Jika status === 403 pada halaman analisis/riwayat, tampilkan komponen AccessDeniedState (BR-04).
   - Jika status === 501 (untuk endpoint tahap lanjut yang sedang diselesaikan tim backend), tampilkan banner status transparan dan sediakan opsi Mode Pratinjau UI Terisolasi berlabel tegas agar seluruh interaksi grafik S-07, tabel S-08, dan ekspor S-09 tetap dapat diuji tanpa melanggar integritas ilmiah.