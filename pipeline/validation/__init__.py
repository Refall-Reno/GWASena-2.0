"""M-02: validasi format VCF/PLINK/CSV dan pencocokan Sample ID (FR-02, BR-01, BR-02).

Rencana fungsi (Minggu 6):
    validate_vcf(path) -> dict
    validate_phenotype_csv(path) -> dict
    match_sample_ids(genotype_ids, phenotype_ids) -> dict
Setiap fungsi mengembalikan {"status": "valid"/"gagal", "message": ..., ...} (Asumsi A-06 LKP 4).
"""
