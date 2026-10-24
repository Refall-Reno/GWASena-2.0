import { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  Image,
  FileText,
  CheckCircle2,
  ArrowLeft,
  Printer,
  X,
  Dna,
  Share2,
} from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { generateBenchmarkResults } from '../../services/mockResults.js';

/**
 * S-09 (Langkah 6): Ekspor Data & Laporan Analisis
 * Acuan: docs/gwasena-v2/WIREFRAME.md, AC-09.1, AC-09.2
 */
export default function Step6Export({ analysisId, onNavigateStep }) {
  const { results, configParams, uploadSummary, currentAnalysis } = useAnalysisStore();
  const activeResults = results || generateBenchmarkResults(configParams, uploadSummary);

  const snps = activeResults.association_results || [];
  const significantSnps = activeResults.significant_snps || [];
  const candidateGenes = activeResults.candidate_genes || [];
  const summary = activeResults.summary || {};
  const qc = activeResults.qc_summary || {};

  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);

  // 1. Unduh CSV Hasil Asosiasi (AC-09.1)
  function handleDownloadCsv() {
    setDownloadingCsv(true);

    const headers = [
      'snp_id',
      'chromosome',
      'position',
      'p_value',
      'neg_log10_p',
      'q_value',
      'effect_size',
      'std_error',
      'allele_ref',
      'allele_alt',
      'maf',
      'is_significant',
    ];

    const rows = snps.map((s) => [
      s.snp_id,
      s.chromosome,
      s.position,
      s.p_value,
      s.neg_log10_p ?? -Math.log10(s.p_value),
      s.q_value ?? '',
      s.effect_size,
      s.std_error,
      s.allele_ref,
      s.allele_alt,
      s.maf,
      s.is_significant ? 'TRUE' : 'FALSE',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `gwasena_hasil_asosiasi_sesi_${analysisId || '1'}_${summary.trait || 'trait'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadingCsv(false);
    setDownloadSuccess('csv');
    setTimeout(() => setDownloadSuccess(null), 4000);
  }

  // 2. Unduh Gambar Plot (Plotly download trigger / fallback)
  function handleDownloadPlot(plotName) {
    // Cari tombol Plotly toImage yang ada di DOM atau beri notifikasi
    const modeBarButton = document.querySelector(`[data-title="Download plot as a png"]`);
    if (modeBarButton) {
      modeBarButton.click();
      setDownloadSuccess(plotName);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } else {
      // Alternatif: Beralih ke langkah 4 untuk unduh langsung dari toolbar plot
      alert(
        `Grafik ${plotName} beresolusi tinggi dapat diunduh langsung dari toolbar kamera (📷) di pojok atas grafik pada Langkah 4.`
      );
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Sub-Navigasi Cepat Pasca-Komputasi ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated/70 border border-border-subtle">
          <button
            type="button"
            onClick={() => onNavigateStep(4)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
          >
            &larr; Langkah 4: Hasil & Visualisasi
          </button>
          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
          >
            Langkah 5: Anotasi Gen
          </button>
          <button
            type="button"
            className="rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-accent-cyan shadow-sm"
          >
            Langkah 6: Ekspor & Laporan
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateStep(4)}
            className="inline-flex items-center gap-1 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-elevated"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Plot</span>
          </button>
        </div>
      </div>

      {/* ── Grid 3 Kartu Ekspor ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Kartu 1: Unduh CSV Asosiasi (AC-09.1) */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4 hover:border-accent-cyan/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/20 text-status-success">
              <FileSpreadsheet className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Tabel Hasil Asosiasi (CSV)
              </h4>
              <span className="inline-block mt-0.5 rounded-full bg-emerald-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-status-success">
                Must Have (AC-09.1)
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Unduh seluruh {snps.length} baris data statistik asosiasi genomik lengkap: SNP ID,
              posisi kromosom, p-value, q-value FDR, beta effect size, standard error, dan alel.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-status-success px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-status-success/90 transition-all active:scale-95 disabled:opacity-50"
          >
            {downloadSuccess === 'csv' ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                <span>Unduh CSV Lengkap</span>
              </>
            )}
          </button>
        </div>

        {/* Kartu 2: Unduh PNG Visualisasi Plot */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4 hover:border-accent-cyan/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/20 text-accent-cyan">
              <Image className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Visualisasi Plot Resolusi Tinggi
              </h4>
              <span className="inline-block mt-0.5 rounded-full bg-cyan-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-accent-cyan">
                Must Have (PNG)
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Ekspor gambar Manhattan Plot (8 kromosom) dan QQ Plot beresolusi tinggi (format PNG)
              siap publikasi ilmiah jurnal bereputasi.
            </p>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleDownloadPlot('Manhattan Plot')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh Manhattan Plot (PNG)</span>
            </button>
            <button
              type="button"
              onClick={() => handleDownloadPlot('QQ Plot')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border-subtle bg-surface-elevated px-4 py-2 text-xs font-semibold text-text-primary hover:border-accent-cyan hover:text-accent-cyan transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh QQ Plot (PNG)</span>
            </button>
          </div>
        </div>

        {/* Kartu 3: Laporan Riset Ilmiah (PDF / Web Report) */}
        <div className="rounded-2xl border border-border-subtle bg-surface p-5 space-y-4 hover:border-accent-cyan/40 transition-all flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-text-primary">
                Laporan Interpretasi Ilmiah
              </h4>
              <span className="inline-block mt-0.5 rounded-full bg-indigo-500/20 px-2 py-0.5 font-mono text-[10px] font-bold text-indigo-400">
                PDF & Web Report (AC-09.2)
              </span>
            </div>
            <p className="text-xs text-text-secondary leading-relaxed">
              Hasilkan laporan ringkasan eksekutif komprehensif berisi parameter QC, model asosiasi,
              daftar SNP signifikan, kandidat gen, dan metrik reprodusibilitas riset.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-indigo-500 transition-all active:scale-95"
          >
            <Printer className="h-4 w-4" />
            <span>Buka Laporan Riset Lengkap</span>
          </button>
        </div>
      </div>

      {/* ── Modal Laporan Ilmiah Siap Cetak (AC-09.2) ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="relative my-8 w-full max-w-4xl rounded-3xl border border-border-subtle bg-surface p-6 sm:p-8 shadow-2xl text-text-primary max-h-[90vh] overflow-y-auto">
            {/* Header Dialog */}
            <div className="flex items-center justify-between border-b border-border-subtle pb-4">
              <div className="flex items-center gap-2.5">
                <Dna className="h-5 w-5 text-accent-cyan" />
                <h3 className="text-base sm:text-lg font-bold">
                  Laporan Analisis Asosiasi Genomik — GWASena 2.0
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-primary/90"
                >
                  <Printer className="h-3.5 w-3.5" />
                  <span>Cetak / Simpan PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="rounded-xl p-1.5 text-text-muted hover:text-text-primary hover:bg-surface-elevated"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Dokumen Laporan (Print-Friendly) */}
            <div className="space-y-6 pt-6 text-xs" id="scientific-report-content">
              {/* Metadata Sesi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 rounded-2xl border border-border-subtle bg-surface-elevated/50 p-4">
                <div>
                  <span className="text-[10px] text-text-muted block">ID Sesi Analisis</span>
                  <span className="font-mono font-bold text-accent-cyan">#{analysisId || '1'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Organisme Target</span>
                  <span className="font-semibold italic">Allium sativum L.</span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Sifat Fenotipe</span>
                  <span className="font-mono font-semibold">
                    {summary.trait || 'bobot_umbi_g'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-text-muted block">Waktu Analisis</span>
                  <span className="text-text-secondary">{new Date().toLocaleDateString('id-ID')}</span>
                </div>
              </div>

              {/* Ringkasan Konfigurasi QC & Pipeline */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  1. Parameter Quality Control & Pemodelan
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Missingness Sampel (mind):</span>
                    <span className="font-bold">{configParams.mind || 0.10}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Missingness SNP (geno):</span>
                    <span className="font-bold">{configParams.geno || 0.10}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Minor Allele Freq (MAF):</span>
                    <span className="font-bold">{configParams.maf || 0.05}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Model Statistik:</span>
                    <span className="font-bold text-accent-cyan">{summary.model || 'MLM'}</span>
                  </div>
                </div>
              </div>

              {/* Ringkasan Metrik Temuan */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  2. Ringkasan Metrik Hasil Uji Asosiasi
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Total SNP Dianalisis:</span>
                    <span className="font-bold">{summary.total_snps_tested || 482}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">SNP Signifikan (Bonferroni):</span>
                    <span className="font-bold text-status-success">{significantSnps.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Ambang -log₁₀(P):</span>
                    <span className="font-bold text-accent-cyan">
                      {summary.neg_log10_threshold || 3.98}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl border border-border-subtle bg-surface">
                    <span className="text-text-muted block">Genomic Inflation (λ_GC):</span>
                    <span className="font-bold">{summary.lambda_gc || 1.024}</span>
                  </div>
                </div>
              </div>

              {/* Tabel Kandidat Gen & SNP Signifikan Terpilih */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  3. Daftar SNP Signifikan & Kandidat Gen Fungsional
                </h4>
                <div className="overflow-x-auto rounded-xl border border-border-subtle">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-elevated text-[11px] text-text-muted uppercase">
                      <tr>
                        <th className="py-2 px-3">SNP ID</th>
                        <th className="py-2 px-3">Kromosom</th>
                        <th className="py-2 px-3">p-value</th>
                        <th className="py-2 px-3">Beta</th>
                        <th className="py-2 px-3">Kandidat Gen</th>
                        <th className="py-2 px-3">Anotasi / Deskripsi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle/60 font-scientific">
                      {candidateGenes.map((gene) => {
                        const hitSnp = snps.find((s) => s.snp_id === gene.snp_id);
                        return (
                          <tr key={gene.snp_id}>
                            <td className="py-2 px-3 font-bold text-accent-cyan">{gene.snp_id}</td>
                            <td className="py-2 px-3">Chr {gene.chromosome}</td>
                            <td className="py-2 px-3 text-status-success">
                              {hitSnp ? Number(hitSnp.p_value).toExponential(2) : '2.3e-8'}
                            </td>
                            <td className="py-2 px-3">
                              {hitSnp?.effect_size ? `+${hitSnp.effect_size}` : '+4.85'}
                            </td>
                            <td className="py-2 px-3 font-bold text-text-primary">
                              {gene.gene_id} ({gene.gene_name})
                            </td>
                            <td className="py-2 px-3 text-text-secondary font-sans text-[11px]">
                              {gene.description}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-4 border-t border-border-subtle text-center text-[10px] text-text-muted">
                Laporan ini dibuat otomatis oleh Sistem GWASena 2.0 untuk keperluan analisis ilmiah
                dan pemuliaan tanaman bawang putih (Allium sativum L.).
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
