# MOTION_SPEC.md — Spesifikasi Motion Design, Interaksi, & Video DNA GWASena 2.0

## 1. Filosofi & Prinsip Motion Ilmiah
Motion pada GWASena 2.0 dirancang sebagai bagian struktural dari pengalaman pengguna (UX), bukan dekorasi tempelan pasca-implementasi:
1. **Kejelasan Status di Atas Hiasan (State Clarity):** Setiap animasi wajib memiliki fungsi komunikasi—menjelaskan perpindahan tahap wizard, menandai penguncian konfigurasi saat komputasi (`BR-05`), atau memberikan umpan balik validasi berkas (`FR-02`).
2. **Integritas Ilmiah Mutlak (Zero Fake Progress):** Dilarang menggunakan animasi *progress bar* yang berjalan sendiri ke 100% tanpa konfirmasi backend, dan dilarang menggunakan *number counter/ticker* acak pada angka *p-value*, *effect size*, atau koordinat kromosom.
3. **Kinerja Tinggi & Bebas Layout Shift (GPU-Friendly):** Hanya properti `transform` (`translate3d`, `scale`) dan `opacity` yang dianimasikan pada transisi UI. Dilarang menganimasikan properti tata letak (`height`, `width`, `margin`, `top`) yang memicu *reflow* saat browser sedang merender grafik Manhattan Plot.

---

## 2. Skala Durasi & Kurva Easing Standar (Motion Tokens)

| Kategori Interaksi | Rentang Durasi | Kurva Easing (CSS / Bezier) | Penerapan Spesifik pada Komponen GWASena |
|---|---|---|---|
| **Micro-Interaction Cepat** | `100ms – 150ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | Hover tombol, hover baris tabel SNP/Riwayat, fokus input form, klik *radio card* GLM/MLM, dan kemunculan *tooltip* titik SNP pada Manhattan Plot. |
| **Transisi Komponen Kontekstual** | `180ms – 220ms` | `cubic-bezier(0.16, 1, 0.3, 1)` | Pembukaan popover penjelasan `[EDU-HINT]`, kemunculan banner peringatan/error di `[MESSAGE AREA]`, dropdown menu pengguna, dan pergantian tema Light/Dark Mode. |
| **Transisi Antar-Langkah Wizard & Tab** | `240ms – 280ms` | `cubic-bezier(0.22, 1, 0.36, 1)` | Perpindahan langkah pada `AnalysisWizardPage` (S-04 -> S-05 -> S-06) serta perpindahan tab pasca-komputasi antara **Hasil Visualisasi (S-07)**, **Anotasi Gen (S-08)**, dan **Ekspor (S-09)** (`opacity: 0 -> 1`, `translateY: 6px -> 0`). |
| **Rotasi Kartu Tips Edukatif (S-06)** | Interval `6000ms` (Transisi `350ms`) | `ease-in-out` | Pergantian otomatis antar-kartu **Tips Edukatif** selama layar tunggu komputasi berjalan (`FR-10`). |
| **Koreografi Onboarding Intro (S-00)** | `450ms – 650ms` (`stagger: 90ms`) | `cubic-bezier(0.16, 1, 0.3, 1)` | Kemunculan bertahap narasi pengenalan produk dan *visual pills* pada layar pengunjung baru (`S-00`). |

---

## 3. Spesifikasi Teknis Video DNA 3D Seamless Loop (`Source 3`)

Berdasarkan evaluasi video referensi (`seamless looping animation of rotating dna strands`, resolusi 1080p, durasi 20 detik, nuansa *crystalline cyan-blue* di atas latar gelap):

### 3.1 Aturan Penempatan Selektif (Selective Placement Rule)
- **WAJIB DIGUNAKAN PADA:**
  1. **S-00 (`IntroPage` — Onboarding Pengunjung Baru):** Sebagai latar belakang atmosferik penuh dengan *radial vignette overlay* gelap.
  2. **S-01 (`LoginPage`) & S-02 (`RegisterPage`):** Dipasang pada level `AuthLayout` sebagai latar belakang sinematik atau panel *showcase* visual di sisi kiri layar Desktop.
  3. **S-06 (`Step3Computation` — Banner Komputasi Aktif):** Digunakan secara terbatas hanya di dalam kontainer header kartu status komputasi dengan opasitas rendah (`opacity: 0.15 – 0.20`) untuk menandakan pemrosesan genomik sedang berlangsung.
- **DILARANG DIGUNAKAN PADA:**
  - Halaman **S-03 (Dashboard)**, **S-04 (Unggah Data)**, **S-05 (Konfigurasi QC & Model)**, **S-07 (Manhattan & QQ Plot)**, **S-08 (Anotasi Gen)**, **S-09 (Ekspor)**, dan **S-10 (Riwayat Analisis)**. Halaman kerja analitik wajib memiliki permukaan statis yang bersih agar mata peneliti fokus penuh pada angka dan grafik.

### 3.2 Implementasi Teknis & Pencegahan Glitch (`DnaBackdrop.jsx`)
1. **Persistent Layout Mounting:** Komponen `<DnaBackdrop />` wajib diletakkan di dalam `AuthLayout.jsx` yang membungkus rute `/welcome`, `/login`, dan `/register` menggunakan `<Outlet />` dari React Router. Dengan demikian, saat pengguna menekan tombol pindah dari Intro (S-00) ke Login (S-01) atau ke Register (S-02), elemen `<video>` **tidak pernah di-unmount**, tidak berkedip hitam, dan tidak mengulang pemutaran dari detik `00:00`.
2. **Atribut Wajib Tag `<video>`:**
   - `autoPlay`, `loop`, `muted`, `playsInline` (wajib agar browser modern mengizinkan pemutaran otomatis tanpa blokir).
   - `preload="metadata"` dan `poster="/assets/dna-poster.jpg"` sebagai *fallback* instan sebelum frame pertama termuat atau saat koneksi lambat.
3. **Lapisan Kontras & Keterbacaan (Contrast Shielding):**
   - Di atas elemen `<video>`, pasang `div` overlay absolut dengan kombinasi `radial-gradient(circle at center, rgba(7, 11, 20, 0.40) 0%, rgba(7, 11, 20, 0.90) 85%, #070B14 100%)` dan `backdrop-blur-[2px]` pada kartu form agar rasio kontras teks putih di atas form selalu memenuhi standar WCAG AAA (`> 7:1`).

---

## 4. Koreografi Onboarding Pengguna Baru (S-00 — Copilot-Inspired)

Mengadaptasi pola pengalaman, *pacing*, dan struktur presentasi dari video referensi *Microsoft Copilot Tasks* (`Source 2`) ke dalam identitas ilmiah GWASena:

### 4.1 Urutan Babak (Scene Sequence) pada `IntroPage.jsx`
- **Kontrol Global S-00:** Di pojok kanan atas selalu terdapat tombol **`[Lewati ke Masuk ->]`** yang dapat diakses via klik maupun tombol `Tab + Enter` pada keyboard.
- **Babak 1 — Hero Statement:**
  - Menampilkan Logo Resmi GWASena (*"From Genotype to Discovery."*) diikuti judul utama: **"Eksplorasi Asosiasi Genomik dalam Satu Alur Kerja Terpadu"**.
  - Subteks menjelaskan misi GWASena untuk mengeliminasi fragmentasi alat CLI (PLINK 2 / GAPIT) bagi peneliti.
- **Babak 2 — Interactive Capability Pills (Terinspirasi Detik 00:03–00:07 Video Copilot):**
  - Menyajikan pernyataan interaktif bertahap dengan *inline visual pills* beraksen Cyan/Indigo:
    - *"Siapkan riset Anda: Unggah dataset"* **`[Genotipe VCF & Fenotipe CSV]`**
    - *"Kendalikan kualitas secara transparan:"* **`[Otomasi QC & Kovariat PCA]`**
    - *"Temukan lokus & gen kandidat:"* **`[Model GLM/MLM, Manhattan Plot & Anotasi Gen]`**
- **Babak 3 — How GWASena Works (Terinspirasi Detik 00:08–00:10 Video Copilot):**
  - Menampilkan kartu *step-by-step showcase* yang memperlihatkan alur sistematis 6 langkah wizard beserta fitur `[EDU-HINT]` yang memecahkan masalah *black box* parameter statistik.
- **Babak 4 — Floating Action Dock & High-Contrast CTA Card (Terinspirasi Detik 00:15–00:20 Video Copilot):**
  - Bagian bawah menampilkan panel aksi kontras tinggi dengan dua tombol utama:
    1. **`[Masuk ke Workspace (Sign In)]`** -> Menyetel `gwasena_intro_completed = 'true'` dan bertransisi ke `/login`.
    2. **`[Buat Akun Peneliti (Create Account)]`** -> Menyetel `gwasena_intro_completed = 'true'` dan bertransisi ke `/register`.

---

## 5. Spesifikasi Motion per Komponen Utama

1. **Dropzone Unggah Berkas (S-04):**
   - Saat berkas di-*drag* ke atas area dropzone (`onDragOver`), border berubah ke warna `accent-cyan` (`#06B6D4`) dengan latar belakang meningkat halus (`scale: 1.005`, durasi `150ms`).
   - Saat validasi gagal (`422 Sample ID Mismatch`), kotak `[MESSAGE AREA]` muncul dengan *fade-down* halus (`200ms`) tanpa efek guncangan (*no aggressive shake*) sesuai prinsip `DESIGN.md`.
2. **Pemilihan Eksklusif Model GLM vs MLM (S-05 — `BR-03`):**
   - Kartu model menggunakan transisi border dan indikator radio aktif selama `150ms`. Saat pengguna memilih `MLM`, badge informasi *"Matriks Kinship disertakan otomatis (AC-05.2)"* muncul dengan animasi *fade-in* lembut.
3. **Layar Tunggu Komputasi & Tahapan Diskrit (S-06 — `FR-10`, `BR-05`):**
   - Tahapan yang sedang aktif (`berjalan`) menampilkan indikator *pulse ring* halus berwarna Cyan (`animate-pulse`) di samping nama tahap (`Quality Control`, `PCA`, `Uji Asosiasi & Koreksi`, `Anotasi Gen`).
   - Tahapan yang telah selesai berubah menjadi ikon *checkmark* hijau emerald (`#10B981`) dengan transisi `250ms`.
   - Kartu **Tips Edukatif** berganti setiap 6 detik menggunakan transisi *cross-fade* (`opacity: 0 -> 1`). Saat kursor pengguna berada di atas kartu (*hover*), timer rotasi otomatis di-pause sementara agar peneliti dapat selesai membaca teks dengan tenang.
4. **Interaksi Grafik Manhattan & QQ Plot (S-07 — `AC-08.2`):**
   - *Hover* pada titik SNP menampilkan *tooltip* koordinat secara instan (`< 80ms`).
   - *Klik* pada titik SNP menyorot titik tersebut dan membuka panel **Detail SNP Terpilih** dengan transisi *slide-fade* `180ms`.

---

## 6. Aturan Aksesibilitas & `prefers-reduced-motion`
- Implementasi wajib menghormati pengaturan sistem operasi `@media (prefers-reduced-motion: reduce)`:
  1. Pada `DnaBackdrop.jsx`, tambahkan pemeriksaan `window.matchMedia('(prefers-reduced-motion: reduce)')` dan kelas Tailwind `motion-reduce:hidden` pada elemen `<video>`, sehingga pengguna dengan sensitivitas gerak hanya melihat gambar poster statis `dna-poster.jpg` yang tenang.
  2. Pada CSS global (`styles.css`), tambahkan aturan:
     ```css
     @media (prefers-reduced-motion: reduce) {
       *, ::before, ::after {
         animation-duration: 0.01ms !important;
         animation-iteration-count: 1 !important;
         transition-duration: 0.01ms !important;
         scroll-behavior: auto !important;
       }
     }
     ```