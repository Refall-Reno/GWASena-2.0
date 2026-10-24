import { useState, useMemo } from 'react';
import {
  BarChart3,
  Search,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  X,
  Dna,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import ManhattanPlot from '../charts/ManhattanPlot.jsx';
import QQPlot from '../charts/QQPlot.jsx';
import { generateBenchmarkResults } from '../../services/mockResults.js';

/**
 * S-07 (Langkah 4): Hasil Uji Asosiasi & Visualisasi Plot Interaktif
 * Acuan: docs/gwasena-v2/WIREFRAME.md, DESIGN.md (Bagian 7), AC-06.1, AC-06.2, AC-08.1, AC-08.2
 */
export default function Step4Results({ onNavigateStep }) {
  const { results, setResults, configParams, uploadSummary } = useAnalysisStore();

  // Pastikan ada data hasil (jika belum ada, gunakan benchmark simulasi)
  const activeResults = useMemo(() => {
    if (results && results.association_results) {
      return results;
    }
    const benchmark = generateBenchmarkResults(configParams, uploadSummary);
    setResults(benchmark);
    return benchmark;
  }, [results, configParams, uploadSummary, setResults]);

  const snps = activeResults.association_results || [];
  const significantSnps = activeResults.significant_snps || [];
  const summary = activeResults.summary || {};
  const qqData = activeResults.qq_data || [];
  const threshold = summary.neg_log10_threshold || 3.98;

  // Selected SNP State (AC-08.2)
  const [selectedSnp, setSelectedSnp] = useState(
    significantSnps.length > 0 ? significantSnps[0] : null
  );

  // Filter & Search State untuk Tabel Lengkap
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChr, setFilterChr] = useState('all');
  const [sortField, setSortField] = useState('p_value');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' | 'desc'
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Active sub-tab visualisasi: Manhattan vs QQ Plot
  const [activePlotTab, setActivePlotTab] = useState('manhattan'); // 'manhattan' | 'qq'

  // Filtered & Sorted SNPs
  const filteredSnps = useMemo(() => {
    return snps
      .filter((s) => {
        const matchesSearch =
          s.snp_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          `chr${s.chromosome}`.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChr = filterChr === 'all' || String(s.chromosome) === String(filterChr);
        return matchesSearch && matchesChr;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [snps, searchQuery, filterChr, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredSnps.length / pageSize) || 1;
  const paginatedSnps = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredSnps.slice(start, start + pageSize);
  }, [filteredSnps, page, pageSize]);

  function handleSort(field) {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Sub-Navigasi Cepat Pasca-Komputasi ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-surface-elevated/70 border border-border-subtle">
          <button
            type="button"
            className="rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-accent-cyan shadow-sm"
          >
            Langkah 4: Hasil & Visualisasi
          </button>
          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
          >
            Langkah 5: Anotasi Gen &rarr;
          </button>
          <button
            type="button"
            onClick={() => onNavigateStep(6)}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface/50 transition-colors"
          >
            Langkah 6: Ekspor & Laporan &rarr;
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateStep(5)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-accent-primary/90"
          >
            <span>Lanjut ke Anotasi Gen</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Bar Ringkasan Eksekusi ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">Model Asosiasi</span>
          <span className="font-mono text-sm font-bold text-text-primary">
            {summary.model || configParams.model || 'MLM'}
          </span>
          <span className="text-[10px] text-text-muted block truncate">
            Sifat: {summary.trait || configParams.trait || 'bobot_umbi_g'}
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">Total SNP Teruji</span>
          <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
            {summary.total_snps_tested?.toLocaleString('id-ID') || snps.length}
          </span>
          <span className="text-[10px] text-text-muted block">8 Kromosom</span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">Koreksi Berganda</span>
          <span className="font-mono text-sm font-bold text-accent-cyan truncate block">
            Bonferroni & FDR
          </span>
          <span className="text-[10px] text-text-muted block">Alpha: {summary.alpha || 0.05}</span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">Ambang Signifikansi</span>
          <span className="font-mono text-sm font-bold text-accent-cyan tabular-nums">
            -log₁₀P = {threshold.toFixed(2)}
          </span>
          <span className="text-[10px] text-text-muted block font-mono">
            p &lt; {summary.bonferroni_threshold || '1.04e-4'}
          </span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">SNP Signifikan</span>
          <span className="font-mono text-sm font-bold text-status-success tabular-nums">
            {significantSnps.length} SNP
          </span>
          <span className="text-[10px] text-status-success block">Lolos Ambang</span>
        </div>

        <div className="rounded-2xl border border-border-subtle bg-surface-elevated/40 p-3.5">
          <span className="text-[10px] text-text-muted block uppercase">Inflasi Genomik (λ)</span>
          <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
            {summary.lambda_gc || 1.024}
          </span>
          <span className="text-[10px] text-status-success block">Terkontrol (&lt; 1.05)</span>
        </div>
      </div>

      {/* ── Panel Visualisasi Plot Interaktif ── */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-text-primary flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-accent-cyan" />
              <span>Visualisasi Ilmiah GWAS</span>
            </h3>
          </div>

          {/* Toggle Tab Manhattan vs QQ Plot */}
          <div className="flex items-center gap-1 rounded-xl bg-surface-elevated p-1 border border-border-subtle text-xs">
            <button
              type="button"
              onClick={() => setActivePlotTab('manhattan')}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                activePlotTab === 'manhattan'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Manhattan Plot (Utama)
            </button>
            <button
              type="button"
              onClick={() => setActivePlotTab('qq')}
              className={`rounded-lg px-3 py-1 font-semibold transition-colors ${
                activePlotTab === 'qq'
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              QQ Plot (Diagnostik)
            </button>
          </div>
        </div>

        {activePlotTab === 'manhattan' ? (
          <div>
            <ManhattanPlot
              snps={snps}
              threshold={threshold}
              selectedSnpId={selectedSnp?.snp_id}
              onSelectSnp={(snp) => setSelectedSnp(snp)}
            />
            <p className="mt-2 text-[11px] text-text-muted">
              Petunjuk: Klik salah satu titik SNP pada Manhattan Plot untuk membuka kartu detail dan
              meninjau gen kandidat terkait.
            </p>
          </div>
        ) : (
          <div>
            <QQPlot qqData={qqData} lambdaGc={summary.lambda_gc || 1.024} />
            <p className="mt-2 text-[11px] text-text-muted">
              QQ Plot membandingkan distribusi p-value observasi dengan ekspektasi teoritis (null
              hypothesis). Nilai lambda GC = {summary.lambda_gc || 1.024} menunjukkan tidak adanya
              inflasi populasi palsu.
            </p>
          </div>
        )}
      </div>

      {/* ── Panel Detail SNP Terpilih (AC-08.2) ── */}
      {selectedSnp && (
        <div className="rounded-2xl border border-accent-cyan/40 bg-accent-cyan/5 p-4 sm:p-5 relative animate-fade-in shadow-md">
          <button
            type="button"
            onClick={() => setSelectedSnp(null)}
            className="absolute top-4 right-4 rounded-lg p-1 text-text-muted hover:text-text-primary hover:bg-surface-elevated"
            title="Tutup Panel Detail"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent-cyan/20 text-accent-cyan font-mono text-xs font-bold">
                Chr{selectedSnp.chromosome}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-mono text-base font-bold text-text-primary">
                    {selectedSnp.snp_id}
                  </h4>
                  {selectedSnp.is_significant && (
                    <span className="rounded-full bg-status-success/20 border border-status-success/40 px-2 py-0.5 text-[10px] font-bold text-status-success">
                      Signifikan
                    </span>
                  )}
                </div>
                <p className="font-mono text-xs text-text-secondary tabular-nums">
                  Kromosom {selectedSnp.chromosome} : Posisi{' '}
                  {Number(selectedSnp.position).toLocaleString('id-ID')} bp
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateStep(5)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent-cyan/50 bg-accent-cyan/10 px-3.5 py-1.5 text-xs font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-all self-start sm:self-auto"
            >
              <Dna className="h-3.5 w-3.5" />
              <span>Lihat Anotasi Gen Terkait &rarr;</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 text-xs">
            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">p-value</span>
              <span className="font-mono font-bold text-text-primary tabular-nums">
                {selectedSnp.p_value < 0.0001
                  ? Number(selectedSnp.p_value).toExponential(3)
                  : Number(selectedSnp.p_value).toFixed(6)}
              </span>
            </div>

            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">-log₁₀(p)</span>
              <span className="font-mono font-bold text-accent-cyan tabular-nums">
                {selectedSnp.neg_log10_p?.toFixed(3) ||
                  (-Math.log10(selectedSnp.p_value)).toFixed(3)}
              </span>
            </div>

            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">q-value (FDR)</span>
              <span className="font-mono font-bold text-text-primary tabular-nums">
                {selectedSnp.q_value ? Number(selectedSnp.q_value).toExponential(3) : '-'}
              </span>
            </div>

            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Effect Size (Beta)</span>
              <span className="font-mono font-bold text-text-primary tabular-nums">
                {selectedSnp.effect_size >= 0 ? '+' : ''}
                {selectedSnp.effect_size}
              </span>
            </div>

            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Std Error (SE)</span>
              <span className="font-mono font-bold text-text-primary tabular-nums">
                {selectedSnp.std_error}
              </span>
            </div>

            <div className="rounded-xl bg-surface/70 p-2.5 border border-border-subtle">
              <span className="text-[10px] text-text-muted block">Alel & MAF</span>
              <span className="font-mono font-bold text-text-primary">
                {selectedSnp.allele_ref || 'A'}/{selectedSnp.allele_alt || 'T'}{' '}
                <span className="text-[10px] font-normal text-text-muted">
                  ({selectedSnp.maf || 0.05})
                </span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Tabel 1: SNP Signifikan (AC-06.2) ── */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-border-subtle pb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-status-success" />
            <h4 className="text-sm font-bold text-text-primary">
              Daftar SNP Signifikan Lolos Ambang (AC-06.2)
            </h4>
          </div>
          <span className="rounded-full bg-status-success/20 px-2.5 py-0.5 font-mono text-xs font-bold text-status-success">
            {significantSnps.length} Ditemukan
          </span>
        </div>

        {significantSnps.length === 0 ? (
          <div className="py-8 text-center text-xs text-text-muted">
            <Info className="h-6 w-6 mx-auto mb-2 text-text-muted" />
            <p className="font-semibold text-text-primary">
              Tidak ditemukan penanda SNP yang melewati ambang signifikansi.
            </p>
            <p className="max-w-md mx-auto mt-1">
              Cobalah meninjau kembali kriteria seleksi MAF, melonggarkan ambang signifikansi alpha,
              atau menggunakan koreksi FDR yang lebih adaptif.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-[11px] text-text-muted uppercase">
                <tr>
                  <th className="py-2.5 px-3">SNP ID</th>
                  <th className="py-2.5 px-3">Kromosom</th>
                  <th className="py-2.5 px-3">Posisi (bp)</th>
                  <th className="py-2.5 px-3">p-value</th>
                  <th className="py-2.5 px-3">-log₁₀(P)</th>
                  <th className="py-2.5 px-3">q-value (FDR)</th>
                  <th className="py-2.5 px-3">Effect Size (Beta)</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50 font-scientific">
                {significantSnps.map((snp) => (
                  <tr
                    key={snp.snp_id}
                    className={`hover:bg-surface-elevated transition-colors ${
                      selectedSnp?.snp_id === snp.snp_id ? 'bg-accent-cyan/10' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-bold text-text-primary">{snp.snp_id}</td>
                    <td className="py-2.5 px-3">Chr {snp.chromosome}</td>
                    <td className="py-2.5 px-3">{Number(snp.position).toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 font-bold text-status-success">
                      {Number(snp.p_value).toExponential(3)}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-accent-cyan">
                      {snp.neg_log10_p?.toFixed(2) || (-Math.log10(snp.p_value)).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3">
                      {snp.q_value ? Number(snp.q_value).toExponential(3) : '-'}
                    </td>
                    <td className="py-2.5 px-3">
                      {snp.effect_size >= 0 ? '+' : ''}
                      {snp.effect_size}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedSnp(snp)}
                        className="rounded-lg bg-surface-elevated border border-border-subtle px-2 py-1 text-[11px] font-sans font-semibold text-accent-cyan hover:bg-accent-cyan hover:text-slate-950 transition-all"
                      >
                        Pilih
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Tabel 2: Hasil Asosiasi Terkoreksi Lengkap (AC-06.1) ── */}
      <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
          <div>
            <h4 className="text-sm font-bold text-text-primary">
              Hasil Asosiasi Terkoreksi Lengkap (AC-06.1)
            </h4>
            <p className="text-[11px] text-text-secondary">
              Menampilkan {filteredSnps.length} SNP dari total {snps.length} SNP teruji.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Cari SNP ID..."
                className="w-36 sm:w-44 rounded-xl border border-border-subtle bg-surface-elevated pl-8 pr-3 py-1.5 text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
              />
            </div>

            {/* Filter Kromosom */}
            <select
              value={filterChr}
              onChange={(e) => {
                setFilterChr(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-border-subtle bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
            >
              <option value="all">Semua Kromosom</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                <option key={c} value={c}>
                  Kromosom {c}
                </option>
              ))}
            </select>

            {/* Page Size */}
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-xl border border-border-subtle bg-surface-elevated px-2.5 py-1.5 text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
            >
              <option value={10}>10 baris</option>
              <option value={25}>25 baris</option>
              <option value={50}>50 baris</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border-subtle text-[11px] text-text-muted uppercase">
              <tr>
                <th
                  onClick={() => handleSort('snp_id')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>SNP ID</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('chromosome')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Chr</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('position')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Posisi (bp)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('p_value')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>p-value</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('neg_log10_p')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>-log₁₀(P)</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('q_value')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>q-value</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('effect_size')}
                  className="py-2.5 px-3 cursor-pointer hover:text-text-primary"
                >
                  <div className="flex items-center gap-1">
                    <span>Effect Size</span>
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle/50 font-scientific">
              {paginatedSnps.map((snp) => (
                <tr
                  key={snp.snp_id}
                  className={`hover:bg-surface-elevated transition-colors ${
                    selectedSnp?.snp_id === snp.snp_id ? 'bg-accent-cyan/10' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-bold text-text-primary">
                    <span className="flex items-center gap-1.5">
                      {snp.snp_id}
                      {snp.is_significant && (
                        <span className="h-1.5 w-1.5 rounded-full bg-status-success" />
                      )}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">Chr {snp.chromosome}</td>
                  <td className="py-2.5 px-3">{Number(snp.position).toLocaleString('id-ID')}</td>
                  <td
                    className={`py-2.5 px-3 ${
                      snp.is_significant ? 'font-bold text-status-success' : 'text-text-primary'
                    }`}
                  >
                    {snp.p_value < 0.001
                      ? Number(snp.p_value).toExponential(3)
                      : Number(snp.p_value).toFixed(5)}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-accent-cyan">
                    {snp.neg_log10_p?.toFixed(2) || (-Math.log10(snp.p_value)).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3">
                    {snp.q_value ? Number(snp.q_value).toExponential(3) : '-'}
                  </td>
                  <td className="py-2.5 px-3">
                    {snp.effect_size >= 0 ? '+' : ''}
                    {snp.effect_size}
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedSnp(snp)}
                      className="rounded-lg border border-border-subtle bg-surface-elevated px-2 py-1 text-[11px] font-sans font-semibold text-text-secondary hover:text-accent-cyan transition-colors"
                    >
                      Pilih
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border-subtle pt-3 text-xs">
          <span className="text-text-muted">
            Halaman {page} dari {totalPages} ({filteredSnps.length} total SNP)
          </span>

          <div className="flex items-center gap-1 self-end sm:self-auto">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-1 font-semibold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-elevated/80"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>Sebelumnya</span>
            </button>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface-elevated px-2.5 py-1 font-semibold text-text-primary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-elevated/80"
            >
              <span>Berikutnya</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
