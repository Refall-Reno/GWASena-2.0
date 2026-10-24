import { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Dna,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  ArrowRight,
  Loader2,
  Info,
  X,
} from 'lucide-react';
import { analysisService } from '../../services/analysisService.js';
import ErrorMessageArea from '../common/ErrorMessageArea.jsx';

/**
 * S-04: Step1Upload (Unggah & Validasi Data Genomik)
 * Modul: M-02 (FR-02, FR-11, BR-01, BR-02)
 * Acuan: docs/gwasena-v2/WIREFRAME.md Layar S-04 & API_INTEGRATION.md
 */
export default function Step1Upload({ analysisId, onUploadSuccess, onNext }) {
  const [genotypeFile, setGenotypeFile] = useState(null);
  const [phenotypeFile, setPhenotypeFile] = useState(null);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);

  const [isDraggingGeno, setIsDraggingGeno] = useState(false);
  const [isDraggingPheno, setIsDraggingPheno] = useState(false);

  const genoInputRef = useRef(null);
  const phenoInputRef = useRef(null);

  // Validasi ekstensi genotipe (.vcf, .vcf.gz)
  const handleGenotypeSelect = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.vcf') && !name.endsWith('.vcf.gz') && !name.endsWith('.gz')) {
      setError({
        message: 'Format berkas genotipe tidak didukung.',
        details: [
          `Berkas '${file.name}' harus berformat .vcf atau .vcf.gz.`,
          'Catatan: Format PLINK biner (.bed/.bim/.fam) belum didukung pada versi ini.',
        ],
      });
      setGenotypeFile(null);
      return;
    }
    setError(null);
    setGenotypeFile(file);
    setUploadResult(null); // Reset hasil jika ganti file
  };

  // Validasi ekstensi fenotipe (.csv)
  const handlePhenotypeSelect = (file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith('.csv')) {
      setError({
        message: 'Format berkas fenotipe tidak didukung.',
        details: [`Berkas '${file.name}' harus berformat .csv teks tabular.`],
      });
      setPhenotypeFile(null);
      return;
    }
    setError(null);
    setPhenotypeFile(file);
    setUploadResult(null);
  };

  const handleUploadAndValidate = async (e) => {
    e.preventDefault();
    if (!genotypeFile || !phenotypeFile) {
      setError('Mohon pilih kedua berkas (Genotipe dan Fenotipe) terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('genotipe', genotypeFile);
    formData.append('fenotipe', phenotypeFile);

    try {
      const res = await analysisService.uploadDataset(analysisId, formData);
      setUploadResult(res);
      onUploadSuccess?.(res);
    } catch (err) {
      setError(err);
      setUploadResult(null);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header Langkah ── */}
      <div className="border-b border-border-subtle pb-4">
        <h2 className="text-xl font-bold tracking-tight text-text-primary">
          1. Unggah & Validasi Dataset Bawang Putih
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-text-secondary leading-relaxed">
          Unggah data genotipe (varian SNP) dan data fenotipe (pengamatan sifat agronomi). Sistem
          akan memeriksa integritas format dan mencocokkan kesamaan 100% <em>Sample ID</em> (BR-02).
        </p>
      </div>

      <ErrorMessageArea error={error} onDismiss={() => setError(null)} />

      {/* ── Form Dropzone Grid (2 Kolom) ── */}
      <form onSubmit={handleUploadAndValidate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ── Dropzone 1: Genotipe ── */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingGeno(true);
            }}
            onDragLeave={() => setIsDraggingGeno(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingGeno(false);
              if (e.dataTransfer.files?.[0]) handleGenotypeSelect(e.dataTransfer.files[0]);
            }}
            className={`flex flex-col justify-between rounded-2xl border-2 border-dashed p-6 transition-all ${
              isDraggingGeno
                ? 'border-accent-cyan bg-accent-cyan/10 scale-[1.005]'
                : genotypeFile
                ? 'border-status-success/50 bg-status-success/5'
                : 'border-border-strong bg-surface hover:border-text-secondary'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Dna className="h-5 w-5 text-accent-cyan" />
                  <span className="text-sm font-bold text-text-primary">
                    Berkas Genotipe (VCF)
                  </span>
                </div>
                <span className="text-[11px] font-mono rounded-md bg-surface-elevated px-2 py-0.5 text-text-muted">
                  .vcf / .vcf.gz
                </span>
              </div>

              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Format VCF standar (bialelik) berisi varian penanda SNP genom bawang putih (8 kromosom).
              </p>

              {genotypeFile ? (
                <div className="flex items-center justify-between rounded-xl border border-status-success/30 bg-surface p-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck2 className="h-5 w-5 text-status-success shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {genotypeFile.name}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">
                        {(genotypeFile.size / (1024 * 1024)).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setGenotypeFile(null);
                      setUploadResult(null);
                    }}
                    className="p-1 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => genoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border-subtle bg-surface-elevated/40 cursor-pointer hover:bg-surface-elevated/80 transition-colors text-center"
                >
                  <UploadCloud className="h-8 w-8 text-text-muted mb-2" />
                  <span className="text-xs font-semibold text-text-primary">
                    Pilih atau Seret Berkas VCF ke Sini
                  </span>
                  <span className="mt-1 text-[11px] text-text-muted">Maksimal 200 MB</span>
                </div>
              )}

              <input
                ref={genoInputRef}
                type="file"
                accept=".vcf,.gz"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleGenotypeSelect(e.target.files[0]);
                }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 text-accent-cyan" />
              <span>Format PLINK biner (.bed/.bim/.fam) belum didukung pada rilis ini.</span>
            </div>
          </div>

          {/* ── Dropzone 2: Fenotipe ── */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingPheno(true);
            }}
            onDragLeave={() => setIsDraggingPheno(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingPheno(false);
              if (e.dataTransfer.files?.[0]) handlePhenotypeSelect(e.dataTransfer.files[0]);
            }}
            className={`flex flex-col justify-between rounded-2xl border-2 border-dashed p-6 transition-all ${
              isDraggingPheno
                ? 'border-accent-cyan bg-accent-cyan/10 scale-[1.005]'
                : phenotypeFile
                ? 'border-status-success/50 bg-status-success/5'
                : 'border-border-strong bg-surface hover:border-text-secondary'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-accent-indigo" />
                  <span className="text-sm font-bold text-text-primary">
                    Berkas Fenotipe (CSV)
                  </span>
                </div>
                <span className="text-[11px] font-mono rounded-md bg-surface-elevated px-2 py-0.5 text-text-muted">
                  .csv
                </span>
              </div>

              <p className="text-xs text-text-secondary mb-4 leading-relaxed">
                Tabel CSV memuat kolom ID sampel (<code>sample_id</code>) dan minimal 1 kolom sifat numerik (mis. <code>bobot_umbi_g</code>).
              </p>

              {phenotypeFile ? (
                <div className="flex items-center justify-between rounded-xl border border-status-success/30 bg-surface p-3">
                  <div className="flex items-center gap-2.5 truncate">
                    <FileCheck2 className="h-5 w-5 text-status-success shrink-0" />
                    <div className="truncate">
                      <div className="text-xs font-semibold text-text-primary truncate">
                        {phenotypeFile.name}
                      </div>
                      <div className="text-[11px] font-mono text-text-muted">
                        {(phenotypeFile.size / 1024).toFixed(1)} KB
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPhenotypeFile(null);
                      setUploadResult(null);
                    }}
                    className="p-1 rounded-lg text-text-muted hover:bg-surface-elevated hover:text-text-primary"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => phenoInputRef.current?.click()}
                  className="flex flex-col items-center justify-center p-6 rounded-xl border border-border-subtle bg-surface-elevated/40 cursor-pointer hover:bg-surface-elevated/80 transition-colors text-center"
                >
                  <UploadCloud className="h-8 w-8 text-text-muted mb-2" />
                  <span className="text-xs font-semibold text-text-primary">
                    Pilih atau Seret Berkas CSV ke Sini
                  </span>
                  <span className="mt-1 text-[11px] text-text-muted">Encoding UTF-8</span>
                </div>
              )}

              <input
                ref={phenoInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handlePhenotypeSelect(e.target.files[0]);
                }}
              />
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle text-[11px] text-text-muted flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 shrink-0 text-accent-indigo" />
              <span>Contoh kolom sifat: bobot_umbi_g, diameter_umbi_mm, jumlah_siung.</span>
            </div>
          </div>
        </div>

        {/* Tombol Unggah & Validasi */}
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isUploading || !genotypeFile || !phenotypeFile}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-bold text-white shadow-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memvalidasi Format & Mencocokkan Sample ID...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4" />
                <span>Unggah & Validasi Berkas Sekarang</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* ── Panel Hasil Validasi Sukses (200 OK - AC-02.1) ── */}
      {uploadResult && (
        <div className="rounded-2xl border border-status-success/40 bg-status-success/10 p-5 sm:p-6 shadow-xl backdrop-blur-md animate-fade-in space-y-4">
          <div className="flex items-center justify-between border-b border-status-success/20 pb-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-6 w-6 text-status-success shrink-0" />
              <div>
                <h3 className="text-base font-bold text-text-primary">
                  Validasi Dataset Berhasil! (100% Sample ID Cocok)
                </h3>
                <span className="text-xs text-status-success font-medium">
                  {uploadResult.pesan || 'Berkas valid dan siap dikonfigurasi.'}
                </span>
              </div>
            </div>
            <span className="rounded-full bg-status-success/20 px-3 py-1 text-xs font-bold text-status-success border border-status-success/30">
              Status: Tervalidasi
            </span>
          </div>

          {/* Grid Metrik Dataset */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border-subtle bg-surface p-3 text-center">
              <span className="text-[11px] text-text-muted uppercase font-medium">
                Sampel Cocok
              </span>
              <div className="font-mono text-xl font-bold text-accent-cyan tabular-nums mt-1">
                {uploadResult.genotipe?.jumlah_sampel || uploadResult.kecocokan_sample_id?.jumlah_sampel_cocok || 0}
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface p-3 text-center">
              <span className="text-[11px] text-text-muted uppercase font-medium">
                Jumlah SNP
              </span>
              <div className="font-mono text-xl font-bold text-text-primary tabular-nums mt-1">
                {uploadResult.genotipe?.jumlah_snp || 0}
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface p-3 text-center">
              <span className="text-[11px] text-text-muted uppercase font-medium">
                Varian Dilewati
              </span>
              <div className="font-mono text-xs font-semibold text-text-muted mt-2">
                {uploadResult.genotipe?.varian_dilewati?.multialelik || 0} Multialelik
              </div>
            </div>

            <div className="rounded-xl border border-border-subtle bg-surface p-3 text-center">
              <span className="text-[11px] text-text-muted uppercase font-medium">
                Varietas Tercatat
              </span>
              <div className="font-mono text-xl font-bold text-accent-indigo tabular-nums mt-1">
                {uploadResult.fenotipe?.varietas_tercatat || 0}
              </div>
            </div>
          </div>

          {/* Sifat Fenotipe Tersedia */}
          {uploadResult.fenotipe?.sifat_tersedia && (
            <div className="rounded-xl border border-border-subtle bg-surface p-3.5 space-y-2">
              <span className="text-xs font-semibold text-text-secondary block">
                Sifat Fenotipe yang Terdeteksi dalam CSV:
              </span>
              <div className="flex flex-wrap gap-2">
                {uploadResult.fenotipe.sifat_tersedia.map((trait) => (
                  <span
                    key={trait}
                    className="inline-flex items-center gap-1 rounded-lg border border-accent-cyan/30 bg-accent-cyan/10 px-2.5 py-1 text-xs font-mono font-medium text-accent-cyan"
                  >
                    <span>{trait}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tombol Lanjut ke Step 2 */}
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onNext}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-6 py-3 text-sm font-bold text-white shadow-md hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
            >
              <span>Lanjut ke Konfigurasi Parameter (Langkah 2)</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
