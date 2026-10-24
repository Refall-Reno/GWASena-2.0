# USER_FLOW.md — Arsitektur Alur Pengguna, Sesi, & Orkestrasi Layar GWASena 2.0

## 1. Gambaran Umum & Aktor Sistem
Dokumen ini mendefinisikan urutan interaksi pengguna, perpindahan antarlayar (S-00 s.d. S-10), aturan bisnis (BR-01 s.d. BR-05), kontrak antarmuka modul (IF-01 s.d. IF-12 pada LKP 4), serta perilaku respons sistem berdasarkan SKPL GWASena dan hasil audit repositori aktual (`origin/develop`).

### 1.1 Aktor dan Peran dalam Alur
| Aktor | Nilai `role` di Backend | Peran Utama dalam Alur Sistem | Sumber Acuan |
|---|---|---|---|
| **Pengguna Analisis** (Peneliti Non-IT, Akademisi, Praktikan, Mahasiswa Bioinformatika) | `"pengguna_analisis"` | Menjalankan seluruh siklus utama analisis GWAS (UC-01): registrasi, login, membuat sesi analisis, mengunggah dataset VCF & CSV, mengatur parameter QC/PCA/Model/Koreksi dengan bantuan panduan kontekstual `[EDU-HINT]`, memantau komputasi, mengeksplorasi Manhattan & QQ Plot, melihat anotasi kandidat gen, mengunduh hasil (CSV/PNG/Laporan), dan mengelola riwayat analisis miliknya sendiri. | SKPL Tabel 3, UC-01, FR-01 s.d. FR-12 |
| **Administrator** | `"administrator"` | Mengelola akun pengguna dan memantau status job di server. *(Catatan Keputusan DEC-08: Layar khusus S-11 berprioritas Could Have / Tentatif dan ditangguhkan pada fase awal; namun di backend, role administrator dapat melihat daftar sesi lintas pengguna pada `GET /api/analyses`).* | SKPL Tabel 3, FR-13, AC-12.1 |
| **Ensembl REST API / GFF3 Lokal** | Sistem Eksternal / Lokal | Sumber referensi genom untuk memetakan SNP signifikan ke kandidat gen terdekat pada Modul M-07. Bersifat *non-blocking* (AC-07.2). | SKPL FR-07, LKP 4 M-07 |

---

## 2. Aturan Pintu Masuk & Hybrid Onboarding (S-00, S-01, S-02, S-03)

Untuk memberikan pengalaman pertama yang berkelas (terinspirasi dari pacing dan storytelling *Microsoft Copilot Tasks*) tanpa memaksa pengguna lama menonton intro berulang kali, rute akar (`/`) menerapkan logika **Hybrid Onboarding Gatekeeper** berikut:

| No | Skenario Kunjungan | Status Token (`gwasena_access_token`) | Status Flag (`gwasena_intro_completed`) | Perilaku Navigasi & Transisi Sistem |
|---|---|---|---|---|
| **1** | **Pengunjung Baru Pertama Kali** | Tidak ada (`null`) | Tidak ada (`null`) | Sistem menampilkan **S-00 (`/welcome` — Interactive Intro Experience)** di atas latar video DNA 3D. Tersedia tombol konstan **"Lewati ke Masuk"** di pojok kanan atas setiap saat. |
| **2** | **Pengunjung Baru Menyelesaikan / Melewati Intro** | Tidak ada (`null`) | Disetel menjadi `"true"` | Saat pengguna menekan **"Masuk ke Akun"**, **"Daftar Akun Peneliti"**, atau **"Lewati"**, frontend menyimpan `localStorage.setItem('gwasena_intro_completed', 'true')` dan mentransisikan layar secara halus ke **S-01 (`/login`)** atau **S-02 (`/register`)** tanpa me-reload video DNA. |
| **3** | **Pengguna Lama Kembali (Belum Login / Baru Logout)** | Tidak ada (`null`) | Sudah bernilai `"true"` | Sistem melewati S-00 dan langsung menampilkan **S-01 (`/login`)**. Pada footer kartu login tetap tersedia tautan sekunder **"Lihat Pengenalan GWASena"** jika pengguna ingin memutar ulang S-00 secara sadar. |
| **4** | **Pengguna dengan Sesi Autentikasi Aktif** | Ada & terverifikasi `200 OK` via `GET /api/auth/me` | Apa pun | Sistem langsung mengarahkan pengguna ke **S-03 (`/dashboard` — Dashboard Peneliti)**. |
| **5** | **Akses Langsung ke Rute Terproteksi Tanpa Login (`AC-01.3`)** | Tidak ada atau tidak valid (`401 Unauthorized`) | Apa pun | *ProtectedRoute Guard* memblokir akses ke `/dashboard`, `/history`, atau `/analyses/:id`, menghapus token kedaluwarsa, menyimpan URL tujuan awal (`location.state.from`), dan mengalihkan pengguna ke **S-01 (`/login`)** dengan pesan peringatan: *"Silakan login terlebih dahulu."* |
| **6** | **Pengguna Selesai Mendaftar Akun Baru (`S-02`)** | Backend tidak menerbitkan token saat registrasi (`201 Created`) | Disetel menjadi `"true"` | Setelah `POST /api/auth/register` mengembalikan `201 Created`, sistem mengarahkan pengguna ke **S-01 (`/login`)**, mengisi otomatis kolom `username`, dan menampilkan pesan sukses hijau: *"Akun berhasil dibuat. Silakan login."* |

---

## 3. Peta Alur Utama End-to-End (UC-01: Run GWAS Pipeline)

Alur kerja utama mengintegrasikan 8 modul sistem (`M-01` s.d. `M-08`) dan kontrak antarmuka (`IF-01` s.d. `IF-12`):

1. **Tahap 0 — Onboarding & Autentikasi (M-01 / `IF-01`):**
   - `[S-00 Intro]` -> `[S-02 Register]` (opsional bagi pengguna baru) -> `[S-01 Login]`.
   - Pengguna memasukkan `username` (mendukung username atau email) dan `password` -> menekan **[Masuk]**.
   - Backend memverifikasi kredensial (`POST /api/auth/login`), mengembalikan Bearer token (masa aktif 12 jam) dan objek `pengguna` (`user_id`, `username`, `email`, `role`).
2. **Tahap 1 — Dashboard & Inisiasi Sesi Analisis (M-01 -> M-02 / `IF-01`):**
   - Di `[S-03 Dashboard]`, pengguna memilih kartu **"Analisis Baru"** -> mengisi nama sesi analisis (contoh: *"Analisis Bobot Umbi Bawang Putih"*) -> menekan **[Mulai Analisis]**.
   - Sistem memanggil `POST /api/analyses`, membentuk entitas `Analysis` baru dengan status awal `"draft"`, dan mengarahkan pengguna ke `/analyses/{analysis_id}` pada Langkah 1 Wizard.
3. **Tahap 2 — Unggah Berkas & Validasi Data Real-Time (M-02 / `IF-02`):**
   - Di `[S-04 Langkah 1: Unggah & Validasi Data]`, pengguna memilih berkas Genotipe (`.vcf` atau `.vcf.gz`) dan berkas Fenotipe (`.csv`).
   - Pengguna menekan **[Unggah & Validasi Berkas]** -> Frontend mengirim `FormData` (`genotipe`, `fenotipe`) ke `POST /api/analyses/{id}/upload`.
   - **Jalur Valid (`200 OK`, `AC-02.1`):** Backend memvalidasi struktur VCF bialelik, mengekstrak daftar `sifat_tersedia` dari CSV, dan memastikan kecocokan 100% *Sample ID* (`jumlah_sampel_cocok`). Status sesi berubah menjadi `"tervalidasi"`. Tombol **[Lanjut ke Konfigurasi QC]** diaktifkan.
   - **Jalur Gagal (`422 Unprocessable Entity`, `AC-02.2`, `AC-02.3`, `BR-01`, `BR-02`):** Jika salah satu berkas belum lengkap, format salah, atau terdapat *Sample ID* yang tidak cocok antara VCF dan CSV, sistem menampilkan pesan kesalahan di `[MESSAGE AREA]` beserta **Daftar Sample ID Tidak Sesuai** (`detail.rincian`) dan memblokir perpindahan ke langkah berikutnya.
4. **Tahap 3 — Konfigurasi QC, PCA Otomatis, Model, & Koreksi (M-04, M-05, M-06 / `IF-03`):**
   - Di `[S-05 Langkah 2: Konfigurasi Analisis]`, pengguna:
     1. Memilih sifat fenotipe (`trait`) yang akan dianalisis dari daftar `sifat_tersedia`.
     2. Mengatur parameter Quality Control (`M-04`, `FR-03`): `mind` (missingness per sampel), `geno` (missingness per SNP), `maf` (Minor Allele Frequency), `hwe` (Hardy-Weinberg Equilibrium), dan `king_cutoff` (relatedness), sambil membaca penjelasan kontekstual `[EDU-HINT]`.
     3. Meninjau panel **PCA Otomatis (`M-05`, `FR-04`, `AC-04.1`)**: Sistem menegaskan bahwa PCA (`n_pc = 3`) dijalankan otomatis pasca-QC sebagai kovariat struktur populasi dan **tidak dapat dilewati**.
     4. Memilih **tepat satu** model uji asosiasi (`M-06`, `FR-05`, `BR-03`, `AC-05.1`): **GLM** atau **MLM**. Memilih salah satu otomatis menonaktifkan pilihan lainnya. Jika **MLM** dipilih, sistem menampilkan informasi bahwa matriks kekerabatan (*kinship*) disertakan secara otomatis (`AC-05.2`).
     5. Memilih metode koreksi *multiple testing* (`FR-06`): **Bonferroni** dan/atau **FDR**, serta ambang signifikansi (`alpha`, default `0.05`).
   - Pengguna menekan **[Jalankan Analisis]** -> Sistem memvalidasi rentang numerik parameter, menyimpan konfigurasi ke `PUT /api/analyses/{id}/parameters`, dan memicu eksekusi asinkron melalui `POST /api/analyses/{id}/run`.
5. **Tahap 4 — Orkestrasi Eksekusi Pipeline & Layar Tunggu Terkunci (M-03 / `IF-04` s.d. `IF-09`):**
   - Di `[S-06 Langkah 3: Komputasi Pipeline]`, selama status sesi bernilai `"antre"` atau `"berjalan"`:
     - Seluruh kontrol input konfigurasi dan unggahan **dikunci sepenuhnya** (`BR-05`, `AC-10.1`).
     - Sistem melakukan *polling* berkala ke `GET /api/analyses/{id}/status` dan menampilkan status tahapan diskrit: `Quality Control` -> `PCA` -> `Uji Asosiasi & Koreksi` -> `Anotasi Gen`.
     - Begitu tahap QC selesai, sistem menampilkan kartu **Ringkasan Penyaringan QC** (jumlah sampel dan SNP yang lolos vs tersaring, `AC-03.1`).
     - Selama menunggu, sistem merotasi kartu **Tips Edukatif** secara dinamis setiap 6 detik untuk mengedukasi peneliti non-IT (`FR-10`).
6. **Tahap 5 — Ruang Kerja Hasil, Anotasi Gen, & Ekspor Terpadu (M-06, M-07, M-08 / `IF-10`, `IF-11`, `IF-12`):**
   - Begitu status komputasi mencapai `"selesai"`, langkah pasca-komputasi (**Langkah 4: S-07 Hasil & Visualisasi**, **Langkah 5: S-08 Anotasi Gen**, dan **Langkah 6: S-09 Ekspor & Laporan**) dibuka sekaligus. Pengguna dapat berpindah bebas di antara ketiga langkah tersebut baik melalui Stepper maupun Tab Navigasi Cepat tanpa memicu komputasi ulang:
     - **Pada S-07 (Hasil & Visualisasi):** Sistem merender **Manhattan Plot** interaktif dan **QQ Plot** (`AC-08.1`). Saat pengguna mengklik titik SNP pada Manhattan Plot, sistem menampilkan detail posisi kromosom/*base-pair*, *p-value*, *q-value*, dan *effect size* (`AC-08.2`). Di bawah plot, sistem menyajikan **Tabel Daftar SNP Signifikan** (`AC-06.2`) dan **Tabel Hasil Asosiasi Terkoreksi** (`AC-06.1`) lengkap dengan pencarian, penyortiran, dan paginasi di sisi klien.
     - **Pada S-08 (Anotasi Gen — Non-Blocking):** Sistem menampilkan tabel kandidat gen terdekat, posisi, dan konsekuensi fungsional (`AC-07.1`). Jika Ensembl REST API gagal dihubungi atau referensi belum tersedia, sistem menampilkan pesan peringatan *non-blocking* tanpa menghalangi akses ke S-07 dan S-09 (`AC-07.2`).
     - **Pada S-09 (Ekspor & Laporan):** Sistem memverifikasi hak akses (`IF-12`) dan menyediakan tombol unduh **CSV Hasil Asosiasi**, **PNG Plot**, serta pembuatan **Laporan Komprehensif PDF/Web Report** (`AC-09.1`, `AC-09.2`).

---

## 4. Matriks Hubungan User Action <-> System Response Lengkap (S-00 s.d. S-10)

| No | Layar | Aksi Pengguna (User Action) | Respons Sistem (System Response) | Acuan SKPL / Kontrak |
|---|---|---|---|---|
| 1 | **S-00** | Membuka aplikasi pertama kali; membaca tahapan intro atau menekan `[Lewati ke Masuk]`. | Menyimpan flag `gwasena_intro_completed = 'true'` di `localStorage` dan menampilkan layar `S-01 (/login)`. | Revisi Onboarding Opsi A |
| 2 | **S-01** | Mengisi `username`/email dan `password`, lalu menekan `[Masuk]`. | Memanggil `POST /api/auth/login`. Jika valid (`200`), simpan Bearer token dan arahkan ke `S-03 (/dashboard)`. Jika salah (`401`), tampilkan pesan `"Username/email atau kata sandi salah."` di `[MESSAGE AREA]`. | `FR-01`, `AC-01.1`, `AC-01.2` |
| 3 | **S-01** | Mengakses URL `/dashboard`, `/history`, atau `/analyses/:id` tanpa sesi login aktif. | Menolak akses dan mengalihkan (*redirect*) pengguna ke `S-01 (/login)`. | `AC-01.3`, `IF-01` |
| 4 | **S-02** | Mengisi `username`, `email`, `password`, dan konfirmasi password, lalu menekan `[Daftar Akun]`. | Memanggil `POST /api/auth/register`. Jika `201 Created`, arahkan ke `S-01` dengan pesan sukses. Jika `409 Conflict`, tampilkan pesan `"Username atau email sudah terdaftar."`. | `FR-01`, Kontrak `RegisterIn` |
| 5 | **S-03** | Menekan tombol `[+ Mulai Analisis Baru]` dan memasukkan nama analisis. | Memanggil `POST /api/analyses`, membuat sesi berstatus `"draft"`, dan mengarahkan ke `/analyses/{analysis_id}` (Langkah 1: `S-04`). | `UC-01 Trigger`, `IF-01` |
| 6 | **S-04** | Mencoba menekan tombol lanjut saat berkas genotipe atau fenotipe belum dipilih/diunggah. | Memblokir aksi lanjut dan menampilkan status ketidaklengkapan berkas. | `AC-02.2`, `BR-01` |
| 7 | **S-04** | Mengunggah berkas VCF dan CSV yang memiliki perbedaan *Sample ID*. | Backend merespons `422`. Frontend menampilkan `detail.pesan` dan merender daftar rincian ID yang tidak cocok (`detail.rincian`), serta memblokir tombol lanjut. | `AC-02.3`, `BR-02`, `FR-11` |
| 8 | **S-04** | Mengunggah berkas VCF (`.vcf`/`.vcf.gz`) dan CSV yang valid dan 100% cocok, lalu menekan `[Lanjut ke Konfigurasi QC]`. | Backend merespons `200 OK` (status `"tervalidasi"`). Frontend menampilkan ringkasan jumlah sampel, SNP, daftar sifat fenotipe (`sifat_tersedia`), dan membuka `S-05`. | `AC-02.1`, `IF-02` |
| 9 | **S-05** | Mengisi ambang QC (`mind`, `geno`, `maf`, `hwe`, `king_cutoff`) dan mengarahkan kursor/klik pada ikon `[EDU-HINT]`. | Memvalidasi rentang angka secara *real-time* dan menampilkan kartu penjelasan statistik & biologis parameter terkait. | `FR-03`, `M-04`, `NFR-03` |
| 10 | **S-05** | Memilih model `GLM` atau `MLM` pada kartu *radio selection*. | Mengaktifkan model yang dipilih dan otomatis menonaktifkan model lainnya (`single-select`). Jika `MLM` dipilih, tampilkan indikator penyertaan otomatis matriks *kinship*. | `FR-05`, `BR-03`, `AC-05.1`, `AC-05.2` |
| 11 | **S-05** | Menekan tombol `[Jalankan Analisis]`. | Menyimpan konfigurasi parameter (`PUT /parameters`), memicu komputasi latar belakang (`POST /run`), dan memindahkan layar ke `S-06`. | `UC-01 Main Flow 4`, `IF-03` |
| 12 | **S-06** | Menunggu selama proses komputasi berjalan (`status: "antre" | "berjalan"`). | Mengunci seluruh form konfigurasi/unggah (`BR-05`), menampilkan progres tahapan diskrit, menampilkan ringkasan penyaringan QC (`AC-03.1`), dan merotasi kartu Tips Edukatif (`FR-10`). | `FR-10`, `AC-10.1`, `BR-05` |
| 13 | **S-07** | Mengklik salah satu titik SNP pada grafik **Manhattan Plot**. | Menampilkan popover/panel detail SNP terpilih yang memuat ID SNP, kromosom, posisi *base-pair*, nilai *p-value*, *q-value*, dan *effect size*. | `FR-08`, `AC-08.1`, `AC-08.2` |
| 14 | **S-07** | Meninjau tabel **Daftar SNP Signifikan** dan **Hasil Asosiasi Terkoreksi** (mencari SNP, menyortir *p-value*, berpindah halaman tabel). | Menampilkan SNP signifikan sesuai ambang koreksi (`AC-06.2`), atau menampilkan *Empty State* jika 0 SNP signifikan. Tabel merespons pencarian dan paginasi secara instan di sisi klien. | `FR-06`, `AC-06.1`, `AC-06.2` |
| 15 | **S-08** | Membuka langkah/tab **Anotasi Gen**. | Menampilkan tabel kandidat gen terdekat, posisi, dan konsekuensi fungsional (`AC-07.1`). Jika API Ensembl gagal/belum aktif, menampilkan pesan status *non-blocking* tanpa mengunci S-07/S-09 (`AC-07.2`). | `FR-07`, `AC-07.1`, `AC-07.2` |
| 16 | **S-09** | Menekan tombol unduh `CSV`, `PNG`, atau `Laporan PDF/Web Report`. | Memverifikasi kepemilikan sesi (`IF-12`) lalu mengunduh berkas CSV/PNG (`AC-09.1`) atau merender laporan komprehensif (`AC-09.2`). | `FR-09`, `AC-09.1`, `AC-09.2` |
| 17 | **S-10** | Membuka halaman **Riwayat Analisis (`/history`)** atau membuka URL analisis `/analyses/:id`. | Memanggil `GET /api/analyses` untuk menampilkan daftar analisis milik akun aktif. Jika mencoba mengakses ID analisis milik pengguna lain, backend membalas `403 Forbidden` dan frontend merender `[ACCESS-DENIED STATE]`. | `FR-12`, `BR-04`, `AC-12.1` |

---

## 5. Skenario Alternatif, Pemulihan Error, & Manajemen Sesi
1. **Penanganan Kegagalan Komputasi (`status === "gagal"` pada S-06):**
   - Jika pipeline gagal di tengah eksekusi, layar S-06 menghentikan *polling*, menampilkan pesan kesalahan spesifik beserta panduan perbaikan dari log analisis (`FR-11`), dan membuka kembali kunci navigasi dengan tombol **"<- Kembali ke Konfigurasi Parameter (S-05)"** atau **"Unggah Ulang Dataset (S-04)"**.
2. **Perilaku Saat Halaman Di-refresh (Browser Reload):**
   - Pada `/analyses/:id`, frontend memanggil `GET /api/analyses/{id}` saat *mount* dan otomatis menempatkan pengguna pada langkah Stepper yang sesuai dengan status sesi di database (`"draft"` -> Step 1, `"tervalidasi"` -> Step 2, `"antre"`/`"berjalan"` -> Step 3, `"selesai"` -> Step 4/5/6).
3. **Perilaku Logout:**
   - Menekan tombol **Keluar (Logout)** pada Navbar menghapus `gwasena_access_token` dan state pengguna dari `useAuthStore`, lalu mengarahkan pengguna langsung ke **S-01 (`/login`)** (tanpa menghapus flag `gwasena_intro_completed`, sehingga pengguna tidak dipaksa menonton intro S-00 lagi).