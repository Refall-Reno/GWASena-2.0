# WIREFRAME.md — Spesifikasi Struktural per Layar & Traceability Matrix (S-00 s.d. S-10)

## 1. Komponen Global Aplikasi
- **`[PUBLIC HEADER]` (S-00, S-01, S-02):** Logo resmi GWASena di kiri + Tombol ganti tema (Light/Dark) + Tombol `"Lewati Pengenalan"` (khusus di S-00).
- **`[APP HEADER / NAVBAR]` (S-03 s.d. S-10):**
  - Kiri: Logo GWASena (`From Genotype to Discovery`).
  - Tengah: Navigasi utama: `Dashboard` (`/dashboard`) | `Riwayat Analisis` (`/history`).
  - Kanan: Indikator Koneksi Sistem (lampu hijau/kuning dari `/api/health`), Toggle Tema (Light/Dark), dan Menu Akun Pengguna (`[Username (Role) ▼]` dengan aksi `Keluar / Logout`).
- **`[STEPPER 6 LANGKAH]` (S-04 s.d. S-09):**
  1. `1. Unggah & Validasi` (S-04)
  2. `2. Konfigurasi QC & Model` (S-05)
  3. `3. Komputasi Pipeline` (S-06)
  4. `4. Hasil & Visualisasi` (S-07)
  5. `5. Anotasi Gen` (S-08)
  6. `6. Ekspor & Laporan` (S-09)

---

## 2. Spesifikasi Detail Setiap Layar

### S-00 — Interactive Intro Experience (Pengenalan Pengguna Baru)
- **Tujuan:** Memberikan pengalaman penyambutan sinematik & edukatif bagi pengunjung baru sebelum masuk ke layar autentikasi.
- **Susunan Komponen (3 Babak Singkat / Scrollytelling atau Interactive Stepper Card):**
  - **Latar Belakang:** Video DNA 3D *seamless loop* (`Source 3`) dengan lapisan vignette gelap.
  - **Babak 1 (Hero):** Logo GWASena + Headline *"From Genotype to Discovery: Eksplorasi Asosiasi Genomik dalam Satu Alur Terpadu"* + Indikator lanjut/scroll.
  - **Babak 2 (Interactive Pill Showcase - Gaya Copilot):** Teks dinamis *"Dirancang untuk peneliti: Unggah data `[VCF & Fenotipe CSV]`, jalankan `[QC & PCA Otomatis]`, dan temukan `[SNP Signifikan & Kandidat Gen]` tanpa rumitnya command-line."*
  - **Babak 3 (How It Works & CTA Card):** Kartu ringkas 4 tahap alur kerja GWASena diikuti panel CTA kontras tinggi berisi dua tombol utama: **`[Masuk ke Akun]`** (menuju S-01) dan **`[Buat Akun Peneliti]`** (menuju S-02).
  - **Pojok Kanan Atas:** Tombol konstan **`[Lewati ke Masuk →]`**.

### S-01 — Login (`/login`)
- **Tujuan:** Autentikasi pengguna terdaftar (`FR-01`, `AC-01.1`, `AC-01.2`, `AC-01.3`).
- **Layout:** *Split-screen* pada Desktop (Kiri: Showcase visual DNA 3D + kutipan misi ilmiah GWASena IPB; Kanan: Kartu Form Login). Pada Mobile: Kartu form di tengah layar.
- **Komponen Form:**
  - Judul: `"Masuk ke GWASena"` & subjudul `"Masukkan kredensial akun peneliti Anda"`.
  - `[MESSAGE AREA]`: Menampilkan alert merah jika login gagal (`401`) atau banner hijau jika baru selesai registrasi dari S-02.
  - `[INPUT] Username atau Email` (mapping ke field `username` pada API).
  - `[INPUT] Kata Sandi` (dengan tombol ikon mata *show/hide password*).
  - `[CHECKBOX] Ingat sesi saya di perangkat ini`.
  - `[BUTTON Primary] Masuk` (menampilkan spinner saat loading).
  - Footer Kartu: Tautan `"Belum memiliki akun? Daftar Akun"` (ke S-02) dan tautan kecil `"✨ Putar ulang pengenalan GWASena"` (ke S-00).

### S-02 — Register (`/register`)
- **Tujuan:** Pendaftaran akun peneliti baru (`FR-01`).
- **Komponen Form (Sesuai Kontrak `RegisterIn` di Backend):**
  - Judul: `"Daftar Akun Peneliti"`.
  - `[MESSAGE AREA]`: Alert merah untuk error validasi atau konflik `409 ("Username atau email sudah terdaftar.")`.
  - `[INPUT] Username`: Wajib, 3–50 karakter (`^[A-Za-z0-9_.-]+$`), dilengkapi helper text aturan karakter.
  - `[INPUT] Alamat Email`: Wajib, format email valid (maks 120 karakter).
  - `[INPUT] Kata Sandi`: Wajib, minimal 8 karakter.
  - `[INPUT] Konfirmasi Kata Sandi`: Validasi kecocokan di sisi klien sebelum kirim.
  - `[BUTTON Primary] Daftar Akun`.
  - Footer Kartu: `"Sudah memiliki akun? Masuk di sini"` (ke S-01).

### S-03 — Dashboard (`/dashboard`)
- **Tujuan:** Titik masuk utama pasca-login (`IF-01`).
- **Susunan Komponen:**
  - **Banner Sambutan Ilmiah:** Menampilkan sapaan kepada `pengguna.username`, badge peran (`Pengguna Analisis`), serta informasi organisme aktif dari `/api/meta` (*Allium sativum* L. — 8 Kromosom).
  - **Dua Kartu Aksi Utama (Sesuai `WIREFRAME.md` & `DESIGN.md`):**
    1. **Kartu 1: `Analisis Baru` (Primary Card):** Ikon DNA/Plus, penjelasan singkat tahapan wizard, dan tombol **`[+ Mulai Analisis Baru]`** (membuka input nama analisis lalu memanggil `POST /api/analyses`).
    2. **Kartu 2: `Riwayat Analisis` (Secondary Card):** Ikon Arsip/Tabel, penjelasan akses sesi terdahulu, dan tombol **`[Buka Riwayat Analisis →]`** (menuju S-10).
  - **Panel Status Infrastruktur Ringkas:** Menampilkan status kesiapan API Backend, Database PostgreSQL, dan Celery Worker dari `/api/health`.

### S-04 — Langkah 1: Unggah & Validasi Data (`/analyses/:id` - Step 1)
- **Tujuan:** Mengunggah berkas genotipe & fenotipe serta memvalidasi kecocokan Sample ID (`M-02`, `FR-02`, `BR-01`, `BR-02`).
- **Susunan Komponen:**
  - Header Sesi: Menampilkan `analysis_name`, ID sesi, dan badge status (`draft` / `tervalidasi`).
  - `[MESSAGE AREA]`: Menampilkan alert merah jika validasi gagal (`422`) beserta daftar rincian ID yang tidak cocok.
  - **Grid 2 Kolom Dropzone Unggahan:**
    - **Kolom Kiri — Berkas Genotipe (`genotipe`):** Dropzone interaktif menerima `.vcf` dan `.vcf.gz` (maks 200 MB). Menampilkan nama file, ukuran file, dan badge catatan informasi mengenai format VCF bialelik.
    - **Kolom Kanan — Berkas Fenotipe (`fenotipe`):** Dropzone interaktif menerima `.csv`. Menampilkan panduan kolom wajib (`sample_id` / `iid` + minimal 1 kolom sifat numerik seperti `bobot_umbi_g`).
  - **Tombol Aksi Validasi:** **`[Unggah & Validasi Berkas]`**.
  - **Panel Hasil Validasi & Pencocokan Sample ID (Muncul setelah respons API):**
    - Jika **Valid (`200 OK`)**: Menampilkan metrik `Jumlah Sampel Genotipe`, `Jumlah SNP Valid`, `Varian Dilewati (Multialelik/Non-SNP)`, `Jumlah Sampel Fenotipe`, daftar badge `Sifat Fenotipe Tersedia`, dan status hijau **`100% Sample ID Cocok`**.
    - Jika **Tidak Cocok (`422`)**: Menampilkan tabel/daftar merah **[Daftar Sample ID Tidak Sesuai]** (`AC-02.3`).
  - **Footer Wizard:** Tombol **`[Lanjut ke Konfigurasi QC →]`** (Hanya aktif/enabled jika status sesi sudah `tervalidasi`).

### S-05 — Langkah 2: Konfigurasi QC & Model (`/analyses/:id` - Step 2)
- **Tujuan:** Mengatur parameter Quality Control, melihat status PCA otomatis, memilih model uji asosiasi, dan metode koreksi (`M-04`, `M-05`, `M-06`, `FR-03` s.d. `FR-06`).
- **Layout 2 Kolom (8 Kolom Form : 4 Kolom Panel Ringkasan & Edukasi):**
  - **Bagian A — Pemilihan Sifat Fenotipe (Trait):** Dropdown memilih 1 trait dari `sifat_tersedia` (misal `bobot_umbi_g`).
  - **Bagian B — Parameter Quality Control (M-04):**
    - Input numerik + slider/presets untuk:
      1. `Missingness per Sampel (mind)` — Default: `0.10` (Rentang `0.00 - 0.50`) + `[EDU-HINT]`.
      2. `Missingness per SNP (geno)` — Default: `0.10` (Rentang `0.00 - 0.50`) + `[EDU-HINT]`.
      3. `Minor Allele Frequency (maf)` — Default: `0.05` (Rentang `0.01 - 0.49`) + `[EDU-HINT]`.
      4. `Hardy-Weinberg Equilibrium (hwe)` — Default: `1e-6` + Peringatan khusus tanaman klonal bawang putih + `[EDU-HINT]`.
      5. `Relatedness / Kinship Cutoff (king_cutoff)` — Default: `0.177` + `[EDU-HINT]`.
  - **Bagian C — Analisis Struktur Populasi / PCA (M-05, `FR-04`, `AC-04.1`):**
    - Kartu informasi *locked/mandatory* dengan badge **`[Otomatis & Wajib]`**: Menjelaskan bahwa PCA berjalan otomatis setelah QC sebagai kovariat. Menampilkan informasi jumlah komponen utama (`n_pc = 3`). **Tidak boleh ada tombol/checkbox untuk mematikan atau melewati PCA.**
  - **Bagian D — Pemilihan Model Uji Asosiasi (M-06, `FR-05`, `BR-03`):**
    - Komponen *Single-Select Radio Cards* (Eksklusif — memilih satu akan menonaktifkan yang lain):
      - **Pilihan 1: `GLM (General Linear Model)`** + penjelasan `[EDU-HINT]`.
      - **Pilihan 2: `MLM (Mixed Linear Model)`** + badge *"Direkomendasikan untuk Bawang Putih"* + info bahwa matriks *Kinship* disertakan otomatis (`AC-05.2`).
  - **Bagian E — Koreksi Multiple Testing & Signifikansi (`FR-06`):**
    - Pilihan metode koreksi: `Bonferroni` dan/atau `FDR (Benjamini-Hochberg)` + input `Ambang Signifikansi (Alpha)`, default `0.05`.
  - **Footer Wizard:** Tombol `← Kembali ke Unggah Data` dan Tombol Utama **`[Jalankan Analisis GWAS]`**.

### S-06 — Langkah 3: Komputasi / Layar Tunggu (`/analyses/:id` - Step 3)
- **Tujuan:** Menampilkan progres eksekusi asinkron dengan mengunci konfigurasi dan menyajikan edukasi (`M-03`, `FR-10`, `BR-05`, `AC-10.1`).
- **Susunan Komponen:**
  - **`[STATUS BANNER TERKUNCI]`:** Banner dengan latar belakang video DNA *subtle* yang menyatakan *"Komputasi Pipeline Sedang Berjalan — Konfigurasi Dikunci untuk Menjaga Integritas Data"*.
  - **Daftar Tahapan Pipeline Diskrit (Tanpa Persentase Palsu):**
    1. `Quality Control (Penyaringan Sampel & SNP)`
    2. `Analisis Struktur Populasi (PCA Otomatis)`
    3. `Uji Asosiasi Statistik (GLM / MLM) & Koreksi Multiple Testing`
    4. `Anotasi Kandidat Gen & Perenderan Visualisasi`
  - **`[CARD] Ringkasan Hasil Penyaringan QC` (`AC-03.1`):** Menampilkan jumlah sampel dan SNP sebelum vs sesudah penyaringan QC begitu tahap QC selesai.
  - **`[CARD] Tips Edukatif Dinamis` (`FR-10`):** Kartu karusel yang merotasi 5 Tips Edukatif ilmiah setiap 6 detik, dilengkapi tombol manual `Sebelumnya / Berikutnya`.

### S-07 — Langkah 4: Hasil & Visualisasi (`/analyses/:id` - Step 4)
- **Tujuan:** Menyajikan grafik interaktif Manhattan Plot, QQ Plot, dan tabel hasil asosiasi (`M-06`, `M-08`, `FR-06`, `FR-08`).
- **Navigasi Cepat Pasca-Komputasi:** Baris tab di bagian atas yang memungkinkan perpindahan instan antara **Langkah 4 (Visualisasi & Tabel SNP)** ↔ **Langkah 5 (Anotasi Gen)** ↔ **Langkah 6 (Ekspor & Laporan)**.
- **Susunan Komponen:**
  1. **Bar Ringkasan Eksekusi:** Menampilkan model yang dipakai (`GLM`/`MLM`), metode koreksi, total SNP diuji, dan jumlah SNP signifikan yang ditemukan.
  2. **Panel Utama: `Manhattan Plot Interaktif` (`AC-08.1`, `AC-08.2`):** Dirender dengan Plotly/Canvas. Dilengkapi *tooltip hover* dan **Panel Detail SNP Terpilih** saat sebuah titik SNP diklik (menampilkan `SNP ID`, `Kromosom`, `Posisi bp`, `p-value`, `q-value`, `Effect Size`, `Std Error`).
  3. **Panel Diagnostik: `QQ Plot Interaktif`:** Menampilkan kurva *Expected vs Observed* $-\log_{10}(P)$.
  4. **Tabel 1: `Daftar SNP Signifikan` (`AC-06.2`):** Menampilkan SNP yang lolos ambang signifikansi. Jika 0 SNP lolos, tampilkan **`[EMPTY STATE]`** informatif (*"Tidak ditemukan SNP yang melewati ambang signifikansi saat ini"*).
  5. **Tabel 2: `Hasil Asosiasi Terkoreksi Lengkap` (`AC-06.1`):** Dilengkapi fitur *client-side search* (cari ID SNP / Kromosom), *sorting* berdasarkan `p_value` / `q_value` / `effect_size`, dan *pagination* (10/25/50 baris per halaman) agar browser tetap ringan.

### S-08 — Langkah 5: Anotasi Gen (`/analyses/:id` - Step 5)
- **Tujuan:** Menampilkan pemetaan SNP signifikan ke kandidat gen terdekat (`M-07`, `FR-07`, `AC-07.1`, `AC-07.2`).
- **Susunan Komponen:**
  - **Banner Status Referensi Genom:** Menunjukkan sumber anotasi (Ensembl REST API / GFF3 Lokal *Allium sativum*).
  - **State Normal (`AC-07.1`):** **`[TABLE] Kandidat Gen`** dengan kolom: `SNP ID`, `Kromosom & Posisi`, `ID / Nama Kandidat Gen`, `Jarak / Posisi Relatif`, `Konsekuensi Fungsional`, dan `Deskripsi Biologis`.
  - **State Non-Blocking Fallback (`AC-07.2`):** Jika layanan Ensembl tidak dapat diakses atau endpoint belum aktif, tampilkan kartu peringatan *non-fatal* berwarna kuning/amber: *"Layanan referensi anotasi gen sedang tidak tersedia. Hasil statistik asosiasi (S-07) dan fitur unduhan (S-09) tetap dapat Anda gunakan sepenuhnya."*

### S-09 — Langkah 6: Ekspor & Laporan (`/analyses/:id` - Step 6)
- **Tujuan:** Mengunduh berkas hasil analisis dan laporan komprehensif (`M-08`, `FR-09`, `AC-09.1`, `AC-09.2`).
- **Susunan Komponen (Grid 3 Kartu Ekspor):**
  1. **Kartu 1: `Unduh Tabel Hasil Asosiasi (CSV)` (*Must Have*):** Mengunduh data statistik lengkap (`snp_id`, `chr`, `pos`, `p_value`, `effect_size`, `q_value`).
  2. **Kartu 2: `Unduh Visualisasi Plot (PNG)` (*Must Have*):** Mengunduh gambar resolusi tinggi Manhattan Plot dan QQ Plot.
  3. **Kartu 3: `Buat Laporan Interpretasi (PDF / Web Report)` (*Should Have*):** Menghasilkan ringkasan eksekutif yang memuat konfigurasi parameter QC, model terpilih, grafik visualisasi, dan tabel SNP/kandidat gen.

### S-10 — Riwayat Analisis (`/history`)
- **Tujuan:** Menampilkan daftar sesi analisis milik pengguna yang sedang login dan menjaga kontrol akses (`M-01`, `FR-12`, `BR-04`, `AC-12.1`).
- **Susunan Komponen:**
  - Header Halaman + Kotak pencarian nama analisis + Filter status (`Semua`, `Selesai`, `Berjalan`, `Tervalidasi`, `Draft`, `Gagal`) + Tombol `[+ Analisis Baru]`.
  - **`[TABLE] Riwayat Analisis`:** Kolom `ID Sesi`, `Nama Analisis`, `Organisme`, `Waktu Dibuat`, `Status` (dengan badge warna semantik), dan `Aksi` (`[Buka Analisis →]`).
  - **`[EMPTY STATE]`:** Jika pengguna belum pernah membuat analisis, tampilkan ilustrasi bersih dan tombol memulai analisis pertama.
  - **`[ACCESS-DENIED STATE]` (`BR-04`, `HTTP 403`):** Jika pengguna mencoba membuka URL `/analyses/{id}` milik pengguna lain, tampilkan layar khusus **Akses Ditolak (403 Forbidden)** dengan penjelasan keamanan privasi riset dan tombol kembali ke Dashboard.