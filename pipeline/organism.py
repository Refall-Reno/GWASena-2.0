"""
Konfigurasi organisme target: bawang putih (Allium sativum L.).

Nilai di sini dipakai bersama oleh validasi, QC (PLINK 2), dan anotasi.
Poin bertanda [CEK] perlu diverifikasi tim dengan data asli pada Minggu 6.
"""

GARLIC = {
    "nama_ilmiah": "Allium sativum L.",
    "nama_umum": "Bawang putih",
    "ploidi": "diploid (2n = 2x = 16)",
    "jumlah_kromosom": 8,
    "ukuran_genom_perkiraan": "sekitar 16 Gb",
    "catatan_perbanyakan": "Umumnya diperbanyak secara vegetatif (klonal).",
    "contoh_sifat_fenotipe": [
        {"kolom": "bobot_umbi_g", "label": "Bobot umbi", "satuan": "g"},
        {"kolom": "diameter_umbi_mm", "label": "Diameter umbi", "satuan": "mm"},
        {"kolom": "jumlah_siung", "label": "Jumlah siung per umbi", "satuan": "siung"},
        {"kolom": "tinggi_tanaman_cm", "label": "Tinggi tanaman", "satuan": "cm"},
    ],
    "contoh_varietas": ["Lumbu Hijau", "Lumbu Kuning", "Tawangmangu Baru", "Sangga Sembalun"],
}

# Opsi PLINK 2 untuk genom non-manusia. Tanpa ini PLINK mengira data manusia
# (kromosom 1-22, X, Y) dan menolak/salah membaca kromosom tanaman. [CEK]
PLINK_CHROM_FLAGS = ["--allow-extra-chr", "--chr-set", "8", "no-xy", "no-mt"]

# PLINK menyimpan posisi varian sebagai bilangan bulat 32-bit (maks ~2,1 miliar bp),
# sedangkan beberapa kromosom bawang putih lebih panjang dari itu. Untuk Mini-VCF
# uji coba ini aman; untuk data asli perlu strategi khusus. [CEK]
PLINK_MAX_POSITION = 2**31 - 2
