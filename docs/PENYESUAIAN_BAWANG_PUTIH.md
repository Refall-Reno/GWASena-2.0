# Penyesuaian fokus: dari kesehatan ke bawang putih (*Allium sativum*)

Catatan untuk seluruh tim. Bagian bertanda **[Diskusi SA]** perlu diputuskan
bersama System Analyst sebelum Minggu 6.

## A. Yang sudah diubah di kode

- Kolom `Analysis.organism` default `Allium sativum`; `Sample.variety` untuk varietas/aksesi
  (mis. Lumbu Hijau, Sangga Sembalun).
- Contoh sifat fenotipe: bobot umbi (g), diameter umbi (mm), jumlah siung, tinggi tanaman (cm).
- `SNP.position` bertipe **BIGINT**: kromosom bawang putih bisa lebih panjang dari
  batas INTEGER (±2,1 miliar bp).
- `pipeline/organism.py` memuat opsi PLINK untuk genom tanaman 8 kromosom
  (`--allow-extra-chr --chr-set 8 no-xy no-mt`). Tanpa ini PLINK memperlakukan data sebagai manusia.
- Data contoh dummy bertema bawang putih di `data/contoh/`.

## B. Yang perlu diubah di dokumen (SKPL, SDP, LKP 5)

- **Pengguna sasaran**: ganti "tenaga kesehatan / bidang kesehatan" menjadi peneliti, pemulia
  tanaman, akademisi, dan mahasiswa bidang agronomi, pemuliaan tanaman, genomika, dan bioinformatika.
- **Tujuan & masalah**: "karakteristik kesehatan" → "karakter agronomi bawang putih".
- **Aturan bisnis SKPL 4.4**: "integritas input data klinis" → "integritas input data genotipe dan fenotipe".
- **Tabel 5 SKPL**: contoh fenotipe disesuaikan (bobot umbi, diameter umbi, jumlah siung).
- **Insentif UAT (SDP)**: peserta dari bidang agronomi/pemuliaan tanaman non-IT.

## C. Poin teknis yang perlu dicek [Diskusi SA]

1. **Sumber anotasi gen.** Dokumen menyebut Ensembl REST API. Pastikan dulu genom bawang putih
   benar-benar tersedia di sana; bila tidak, alternatifnya memakai berkas anotasi genom (GFF3)
   dari rilis genom bawang putih yang dipublikasikan dan dicocokkan secara lokal.
2. **Batas posisi PLINK.** PLINK menyimpan posisi sebagai bilangan 32-bit. Mini-VCF uji coba aman,
   tetapi data asli yang posisinya melewati ±2,1 miliar bp perlu strategi (mis. memecah kromosom).
3. **HWE dan relatedness.** Bawang putih umumnya diperbanyak secara klonal, sehingga filter HWE
   dan relatedness bisa membuang banyak SNP/sampel. Tetap sediakan sebagai parameter, tetapi
   nilai bawaan dan teks edukatifnya perlu ditinjau; MLM dengan kinship kemungkinan lebih relevan.
