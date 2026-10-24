# DESIGN.md — Sistem Desain Visual, UI/UX, & Konten Edukatif GWASena 2.0

## 1. Arah Visual: "Precision Bioluminescence & Editorial Science"
GWASena 2.0 meninggalkan tampilan purwarupa lama yang kaku maupun estetika template AI generik. Pendekatan visualnya menggabungkan:
- **Dark-First Cinematic Onboarding & Auth:** Menggunakan atmosfer *Deep Genomic Navy* dan aksen *Bioluminescent Cyan* yang selaras dengan Logo Resmi GWASena dan video referensi heliks DNA 3D.
- **Dual-Theme Scientific Workspace (Light & Dark Mode Setara):** Area kerja analisis (Dashboard, Wizard Stepper, Tabel SNP, Manhattan/QQ Plot) mendukung **Light Mode** (*Crisp Alabaster/Slate*) dan **Dark Mode** (*Genomic Navy*) dengan kontras keterbacaan tingkat tinggi (standar WCAG AA).

## 2. Identitas Merek & Logo Resmi
- **Logo GWASena:** Menampilkan simbol untai ganda DNA yang bertransformasi menjadi panah arah ke kanan-atas dengan simpul molekul di ujungnya, bertuliskan *"From Genotype to Discovery."* di dalam pita DNA, serta logotype **"GWASena."** (`GWA` berwarna Deep Navy `#0A2472`, `Sena.` berwarna Bright Cyan `#0096FF`).
- **Aturan Logo:** Pertahankan proporsi asli logo pada Header/Navbar dan halaman Auth. Jangan mendistorsi rasio aspeknya.

## 3. Palet Warna & Semantic Design Tokens (Tailwind CSS & CSS Variables)

| Token Semantik | Dark Mode (Hex) | Light Mode (Hex) | Kegunaan Utama |
|---|---|---|---|
| `bg-background` | `#070B14` | `#F8FAFC` | Latar belakang utama halaman (Canvas) |
| `bg-surface` | `#0F172A` | `#FFFFFF` | Kartu utama, panel form, kontainer tabel & plot |
| `bg-surface-elevated` | `#1E293B` | `#F1F5F9` | Dropdown, hover baris tabel, kartu sekunder, tooltip |
| `bg-surface-glass` | `rgba(15, 23, 42, 0.72)` | `rgba(255, 255, 255, 0.82)` | Hanya untuk Header sticky, kartu Auth di atas video DNA, & floating bar (`backdrop-blur-md`) |
| `border-subtle` | `#1E293B` | `#E2E8F0` | Garis pembatas tabel, kartu, dan section |
| `border-strong` | `#334155` | `#CBD5E1` | Border input aktif, pembatas utama |
| `text-primary` | `#F8FAFC` | `#0F172A` | Judul, teks utama, angka ilmiah |
| `text-secondary` | `#94A3B8` | `#475569` | Label form, subjudul, deskripsi parameter |
| `text-muted` | `#64748B` | `#64748B` | Placeholder, caption, teks nonaktif |
| `accent-primary` | `#0284C7` / `#2F5FD0` | `#0369A1` / `#1D4ED8` | Tombol utama (Primary CTA), step aktif |
| `accent-cyan` | `#06B6D4` / `#38BDF8` | `#0891B2` | Highlight bioluminesensi, garis ambang Manhattan Plot, badge info |
| `accent-indigo` | `#6366F1` | `#4F46E5` | Aksen sekunder untuk pasangan kromosom ganjil/genap |
| `status-success` | `#10B981` | `#059669` | Status `tervalidasi`, `selesai`, Sample ID cocok |
| `status-warning` | `#F59E0B` | `#D97706` | Status `antre`, peringatan anotasi Ensembl non-blocking |
| `status-error` | `#EF4444` | `#DC2626` | Status `gagal`, error validasi 422, Sample ID tidak cocok |

## 4. Tipografi & Hierarki Teks
- **Font Family Utama (UI & Narasi):** `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif` (sudah terhubung di `frontend/index.html`).
- **Font Family Monospace (Data Ilmiah & Kode):** `'JetBrains Mono', 'Fira Code', monospace` + properti CSS `font-variant-numeric: tabular-nums` **WAJIB** diterapkan pada semua nilai *p-value*, *q-value*, *effect size*, koordinat posisi *base-pair*, dan `sample_id` agar kolom angka sejajar presisi.
- **Skala Ukuran:**
  - `display`: `clamp(2rem, 4vw, 3.25rem)`, `font-weight: 700`, `tracking-tight` (Khusus S-00 Intro).
  - `page-title`: `1.5rem` (24px), `font-weight: 700` (Judul layar S-03 s.d. S-10).
  - `section-title`: `1.125rem` (18px), `font-weight: 600` (Judul kartu/panel).
  - `body`: `0.9375rem` (15px), `line-height: 1.6`.
  - `table-cell` & `data-value`: `0.875rem` (14px), `tabular-nums`.

## 5. Tata Letak, Grid, & Responsivitas
- **Container Maksimum:** `max-w-7xl` (1280px) dengan padding horizontal responsif (`px-4 sm:px-6 lg:px-8`).
- **Breakpoints:**
  - **Mobile (`< 768px`):** Layout 1 kolom vertikal. Stepper berubah menjadi indikator ringkas (*"Langkah X dari 6: [Nama Langkah]"* dengan progress bar horizontal). Tabel memiliki pembungkus `overflow-x-auto`.
  - **Tablet (`768px – 1023px`):** Grid 2 kolom untuk kartu metrik/upload; panel form konfigurasi dan panduan ditumpuk rapi.
  - **Desktop (`>= 1024px`):** Grid penuh 12 kolom; Stepper horizontal lengkap dengan label 6 langkah; halaman konfigurasi menggunakan layout 2 kolom asimetris (8 kolom form utama : 4 kolom panel ringkasan & `[EDU-HINT]`).

## 6. Aturan Penggunaan Video DNA 3D (`Source 3`)
- **Lokasi yang Diizinkan:**
  1. **S-00 (Onboarding Intro):** Background layar penuh dengan *dark radial vignette overlay* (`rgba(7, 11, 20, 0.65)`).
  2. **S-01 (Login) & S-02 (Register):** Di dalam panel showcase visual (sisi kiri pada Desktop) atau ambient background gelap dengan *glass card* kontras tinggi untuk form input.
  3. **S-06 (Layar Tunggu Komputasi):** Hanya sebagai aksen ambient ber-opasitas rendah (`opacity: 0.18`) di dalam banner header kartu status komputasi aktif.
- **Lokasi yang DILARANG KERAS:**
  - **DILARANG** menampilkan video DNA bergerak di belakang halaman **S-03 (Dashboard)**, **S-04 (Upload)**, **S-05 (Konfigurasi QC)**, **S-07 (Manhattan/QQ Plot)**, **S-08 (Anotasi Gen)**, **S-09 (Ekspor)**, dan **S-10 (Riwayat)** agar fokus visual peneliti tidak terganggu dan kinerja GPU tetap optimal saat merender grafik.

## 7. Spesifikasi Visualisasi Ilmiah (Manhattan Plot & QQ Plot)
- **Manhattan Plot (Utama - S-07):**
  - Sumbu X: Kromosom Bawang Putih (Kromosom 1 s.d. 8 beserta posisi *base-pair*). Gunakan warna bergantian antar-kromosom (`#0284C7` dan `#6366F1` pada Light Mode; `#38BDF8` dan `#818CF8` pada Dark Mode).
  - Sumbu Y: $-\log_{10}(p\text{-value})$.
  - Garis Ambang Signifikansi (*Threshold Line*): Garis putus-putus horizontal berwarna Cyan/Emerald (`#06B6D4` atau `#10B981`) untuk batas Bonferroni/FDR.
  - Titik SNP Signifikan (yang melewati ambang): Ditonjolkan dengan warna kontras (`#10B981` atau `#F43F5E`) dan ukuran titik sedikit lebih besar (`7px` vs `5px`).
  - Interaksi Klik (`AC-08.2`): Mengklik titik SNP membuka kartu/popover detail yang menampilkan `SNP ID`, `Kromosom`, `Posisi (bp)`, `p-value`, `q-value (FDR)`, dan `Effect Size`.
- **QQ Plot (Diagnostik Sekunder - S-07):**
  - Sumbu X: *Expected* $-\log_{10}(P)$.
  - Sumbu Y: *Observed* $-\log_{10}(P)$.
  - Dilengkapi garis diagonal referensi ($y = x$) berwarna merah/amber tipis untuk mengevaluasi inflasi genomik ($\lambda_{GC}$).

## 8. Katalog Resmi Konten Edukatif (`[EDU-HINT]` & Tips Tunggu Komputasi)
Karena hasil audit repositori menunjukkan teks edukatif belum diimplementasikan di kode, frontend **WAJIB** menyediakan konstanta teks ilmiah berbahasa Indonesia berikut:

### A. Teks `[EDU-HINT]` pada Halaman Konfigurasi (S-05)
1. **Missingness per Sampel (`mind`, default `0.10`):**
   *"Menyaring sampel individu bawang putih yang memiliki terlalu banyak data genotipe kosong/hilang. Nilai 0.10 berarti sampel dengan >10% SNP kosong akan dikeluarkan agar tidak menimbulkan bias."*
2. **Missingness per SNP (`geno`, default `0.10`):**
   *"Menyaring penanda SNP yang gagal terbaca pada banyak sampel. Nilai 0.10 membuang SNP yang hilang pada >10% populasi sampel."*
3. **Minor Allele Frequency (`maf`, default `0.05`):**
   *"Batas frekuensi alel langka minimum. Nilai 0.05 menyaring varian dengan frekuensi <5% karena alel yang terlalu langka memiliki daya statistik rendah dan rentan menghasilkan positif palsu."*
4. **Hardy-Weinberg Equilibrium (`hwe`, default `1e-6`):**
   *"Menguji penyimpangan frekuensi genotipe dari keseimbangan populasi. Catatan Agronomi Bawang Putih: Karena Allium sativum diperbanyak secara vegetatif (klonal), penyimpangan HWE alami sering terjadi; gunakan ambang longgar (1e-6) agar varian penting tidak terbuang."*
5. **Relatedness / Kinship Cutoff (`king_cutoff`, default `0.177`):**
   *"Batas koefisien kekerabatan antar-sampel (0.177 setara hubungan derajat pertama / klon dekat). Membantu mengidentifikasi duplikasi klon pada koleksi plasma nutfah."*
6. **Analisis Struktur Populasi (`PCA Otomatis`, default `n_pc = 3`):**
   *"Principal Component Analysis (PCA) dijalankan secara otomatis setelah tahap QC dan tidak dapat dilewati (FR-04). Komponen utama (PC1–PC3) disertakan sebagai kovariat untuk mengoreksi stratifikasi struktur populasi."*
7. **Pilihan Model Asosiasi (`GLM` vs `MLM` — Pilih Tepat Satu, `BR-03`):**
   - **GLM (General Linear Model):** *"Menguji asosiasi SNP terhadap sifat fenotipe dengan mengoreksi struktur populasi (kovariat PCA). Komputasi lebih cepat, cocok untuk populasi dengan kekerabatan rendah."*
   - **MLM (Mixed Linear Model):** *"Menggabungkan kovariat PCA (efek tetap) DAN matriks kekerabatan genetik / Kinship secara otomatis (efek acak). Sangat direkomendasikan untuk tanaman klonal seperti bawang putih guna menekan positif palsu."*
8. **Koreksi Multiple Testing (`Bonferroni` vs `FDR`) & Alpha (`0.05`):**
   - **Bonferroni:** *"Koreksi paling ketat (membagi alpha dengan total SNP diuji). Meminimalkan positif palsu secara ekstrem, ideal untuk mendeteksi lokus efek besar utama."*
   - **FDR (False Discovery Rate - Benjamini-Hochberg):** *"Mengontrol proporsi temuan positif palsu (q-value). Lebih sensitif dan adaptif dibanding Bonferroni untuk sifat agronomi kuantitatif yang dipengaruhi banyak gen (poligenik)."*

### B. Rotasi Kartu "Tips Edukatif" pada Layar Tunggu Komputasi (S-06 — `FR-10`)
Ditampilkan bergantian setiap 6 detik selama status job `antre` atau `berjalan`:
1. **Tip 1 (Genom Bawang Putih):** *"Tahukah Anda? Genom bawang putih (Allium sativum) berukuran sekitar 16 Gigabase—hampir lima kali lebih besar dari genom manusia—dan terdistribusi ke dalam 8 pasang kromosom."*
2. **Tip 2 (Pentingnya PCA):** *"Tanpa koreksi struktur populasi (PCA), perbedaan geografis asal kultivar bawang putih dapat disalahartikan sebagai asosiasi genetik terhadap bobot umbi."*
3. **Tip 3 (Membaca Manhattan Plot):** *"Pada Manhattan Plot, setiap titik mewakili satu SNP. Semakin tinggi posisi titik pada sumbu Y (-log10 P), semakin kuat bukti statistik asosiasi SNP tersebut dengan sifat fenotipe yang diuji."*
4. **Tip 4 (Membaca QQ Plot):** *"QQ Plot membantu memvalidasi kualitas model Anda. Jika titik-titik mengikuti garis lurus di awal lalu melengkung naik tajam hanya di ujung kanan atas, berarti model telah berhasil mengendalikan bias populasi."*
5. **Tip 5 (Sifat Non-Blocking Anotasi):** *"Setelah uji asosiasi selesai, GWASena memetakan SNP signifikan ke gen kandidat terdekat. Jika server referensi eksternal sedang sibuk, hasil statistik dan grafik Anda tetap aman dan dapat langsung diunduh."*