# PROJECT.md — Spesifikasi Produk & Konteks Sistem GWASena 2.0

## 1. Visi & Identitas Produk
- **Nama Produk:** GWASena (Versi 2.0)
- **Tagline Resmi (dari Logo):** *"From Genotype to Discovery."*
- **Deskripsi Sistem:** GWASena adalah platform bioinformatika berbasis web yang mengintegrasikan seluruh tahapan pipeline *Genome-Wide Association Study* (GWAS)—mulai dari validasi data, *Quality Control* (QC), *Principal Component Analysis* (PCA), uji asosiasi statistik (GLM/MLM), koreksi *multiple testing* (Bonferroni/FDR), hingga anotasi kandidat gen dan visualisasi interaktif—ke dalam satu alur kerja tunggal yang sistematis dan edukatif.
- **Konteks Domain Ilmiah Saat Ini:** Berdasarkan repositori aktual (`docs/PENYESUAIAN_BAWANG_PUTIH.md` dan `/api/meta`), fokus organisme studi kasus utama platform ini adalah tanaman **Bawang Putih (*Allium sativum* L.)** yang memiliki karakteristik 8 kromosom, ukuran genom besar (~16 Gb, membutuhkan `BIGINT` untuk posisi *base-pair*), dan reproduksi klonal/vegetatif.

## 2. Masalah Utama yang Diselesaikan
1. **Fragmentasi Alat (Tool Fragmentation):** Peneliti/mahasiswa bioinformatika dan agronomi tidak perlu lagi berpindah-pindah antar perangkat lunak *command-line* (CLI) seperti PLINK 2, R/GAPIT, dan skrip plotting terpisah.
2. **Masalah *Black Box* Parameter:** Pengguna non-IT sering kesulitan memahami implikasi biologis dan statistik dari parameter QC (MAF, Missingness, HWE, Kinship KING) dan pemilihan model (GLM vs MLM). GWASena menyediakan komponen panduan kontekstual (`[EDU-HINT]`) dan kartu **Tips Edukatif** selama komputasi berlangsung.

## 3. Pengguna Sasaran & Peran Sistem
1. **Pengguna Analisis (`role: "pengguna_analisis"`):** Peneliti non-IT, pemulia tanaman, akademisi, dan mahasiswa bioinformatika yang menjalankan pipeline analisis GWAS dan mengelola riwayat analisis miliknya sendiri.
2. **Administrator (`role: "administrator"`):** Pengelola sistem (Fitur S-11 berprioritas *Could Have / Tentatif* pada SKPL; ditangguhkan pada fase implementasi UI awal untuk memfokuskan kualitas pada S-00 s.d. S-10).

## 4. Pemetaan 8 Modul Sistem (Arsitektur LKP 4 & SKPL)
Frontend GWASena 2.0 wajib selaras dengan dekomposisi 8 modul sistem dan kontrak antarmuka (`IF-01` s.d. `IF-12`):
- **M-01 (Sesi & Kontrol Akses):** Autentikasi (`FR-01`) dan pembatasan hak akses riwayat/hasil analisis (`FR-12`, `BR-04`).
- **M-02 (Manajemen Input & Validasi Data):** Unggah berkas genotipe (`.vcf` / `.vcf.gz`) dan fenotipe (`.csv`), validasi format *real-time*, dan pencocokan 100% *Sample ID* (`FR-02`, `FR-11`, `BR-01`, `BR-02`).
- **M-03 (Orkestrasi Eksekusi Pipeline):** Pengelolaan status sesi (`draft`, `tervalidasi`, `antre`, `berjalan`, `selesai`, `gagal`), penguncian antarmuka saat komputasi berjalan (`FR-10`, `BR-05`), dan penyajian tips edukatif.
- **M-04 (Quality Control):** Penyaringan sampel dan SNP berdasarkan ambang `mind`, `geno`, `maf`, `hwe`, dan `king_cutoff` (`FR-03`).
- **M-05 (Analisis Struktur Populasi / PCA):** Berjalan **otomatis** setelah QC untuk menghasilkan matriks komponen utama (`n_pc`) sebagai kovariat dan **tidak dapat dilewati oleh pengguna** (`FR-04`, `AC-04.1`).
- **M-06 (Uji Asosiasi & Koreksi Multiple Testing):** Pemilihan eksklusif satu model utama (**GLM** atau **MLM**, `FR-05`, `BR-03`) serta metode koreksi **Bonferroni** dan/atau **FDR** (`FR-06`).
- **M-07 (Anotasi Gen):** Pemetaan SNP signifikan ke kandidat gen terdekat via Ensembl REST API atau berkas anotasi GFF3 lokal (`FR-07`). Bersifat **non-blocking** (`AC-07.2`): kegagalan jaringan/referensi tidak boleh membatalkan akses ke hasil plot dan tabel asosiasi.
- **M-08 (Visualisasi & Ekspor Hasil):** Perenderan grafik interaktif **Manhattan Plot** dan **QQ Plot** (`FR-08`) serta fasilitasi unduhan CSV, PNG, dan PDF/Web Report (`FR-09`).

## 5. Persyaratan Nonfungsional (NFR-01 s.d. NFR-07)
- **NFR-01 & NFR-02 (Performance):** Validasi input cepat sebelum pipeline berjalan; antarmuka tetap responsif selama komputasi latar belakang dan saat merender ribuan titik SNP.
- **NFR-03 & NFR-04 (Usability):** Desain *guided wizard/stepper* yang jelas bagi non-programmer serta pesan kesalahan terstruktur (menampilkan ringkasan `pesan` dan daftar `rincian`).
- **NFR-05 (Security):** Proteksi *route* dan *endpoint* menggunakan Bearer Token (HMAC-SHA256, masa aktif 12 jam) serta isolasi kepemilikan sesi analisis.
- **NFR-06 & NFR-07 (Reliability & Maintainability):** Pemisahan tegas antara layer UI (`frontend/`), REST API (`backend/`), dan mesin komputasi (`pipeline/`).

## 6. Batasan & Aturan Mutlak Implementasi
1. **Sinkronisasi Git Wajib di Awal:** Cabang kerja wajib disinkronkan (`merge`/`rebase`) dengan `origin/develop` (yang memuat PR #19: Backend Auth JWT, Validasi VCF/CSV Python, dan skema DB) sebelum mengubah kode frontend.
2. **Dilarang Mengubah Backend/Pipeline:** Seluruh pekerjaan GWASena 2.0 berfokus pada direktori `frontend/` dan `docs/gwasena-v2/`. Jangan memodifikasi kode Python di `backend/` atau `pipeline/`.
3. **Integritas Ilmiah:** Dilarang memalsukan angka *p-value*, mengarang koordinat plot jika komputasi belum selesai, atau menyembunyikan status `501 Not Implemented` dengan data *dummy* palsu yang seolah-olah hasil perhitungan nyata.