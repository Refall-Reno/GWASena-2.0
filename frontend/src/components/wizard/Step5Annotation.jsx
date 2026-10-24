import { useState } from 'react';
import {
  Dna,
  Database,
  AlertTriangle,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  Search,
  BookOpen,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { generateBenchmarkResults } from '../../services/mockResults.js';

/**
 * S-08 (Langkah 5): Anotasi Kandidat Gen
 * Acuan: docs/gwasena-v2/WIREFRAME.md, AC-07.1, AC-07.2
 *
 * Menampilkan pemetaan SNP signifikan ke kandidat gen Allium sativum
 * serta mekanisme non-blocking fallback jika layanan referensi offline.
 */
export default function Step5Annotation({ onNavigateStep }) {
  const { results, setResults, configParams, uploadSummary } = useAnalysisStore();

  const activeResults = results || generateBenchmarkResults(configParams, uploadSummary);
  const candidateGenes = activeResults.candidate_genes || [];

  const [searchQuery, setSearchQuery] = useState('');
  const [isSimulateFallback, setIsSimulateFallback] = useState(false);

  const filteredGenes = candidateGenes.filter((gene) => {
    const q = searchQuery.toLowerCase();
    return (
      gene.snp_id.toLowerCase().includes(q) ||
      gene.gene_id.toLowerCase().includes(q) ||
      gene.gene_name.toLowerCase().includes(q) ||
      gene.consequence.toLowerCase().includes(q)
    );
  });

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
            className="rounded-lg bg-surface px-3 py-1.5 text-xs font-bold text-accent-cyan shadow-sm"
          >
            Langkah 5: Anotasi Gen
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
            onClick={() => onNavigateStep(4)}
            className="inline-flex items-center gap-1 rounded-xl border border-border-strong bg-surface px-3 py-2 text-xs font-semibold text-text-primary hover:bg-surface-elevated"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Kembali ke Plot</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateStep(6)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-accent-primary/90"
          >
            <span>Lanjut ke Ekspor</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* ── Banner Status Referensi Genom Bawang Putih ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface-elevated/60 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text-primary flex items-center gap-2">
              <span>Basis Data Referensi: Allium sativum L. ASM12345v1</span>
              <span className="rounded-full bg-status-success/20 px-2 py-0.5 text-[10px] font-semibold text-status-success">
                Ensembl Plants REST API Terhubung
              </span>
            </h4>
            <p className="text-[11px] text-text-secondary">
              Pemetaan posisi lokus penanda SNP ke struktur ekson, intron, dan daerah pengatur gen
              (annotation window: &plusmn;20 kb).
            </p>
          </div>
        </div>

        {/* Demo Switch Fallback AC-07.2 */}
        <button
          type="button"
          onClick={() => setIsSimulateFallback(!isSimulateFallback)}
          className="rounded-lg border border-border-subtle bg-surface px-2.5 py-1 text-[11px] text-text-muted hover:text-text-primary self-start sm:self-auto"
          title="Uji ketahanan sistem jika server referensi luar offline"
        >
          {isSimulateFallback ? 'Pulihkan Status Normal' : 'Simulasi Offline (AC-07.2)'}
        </button>
      </div>

      {/* ── State Non-Blocking Fallback (AC-07.2) ── */}
      {isSimulateFallback ? (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-3 animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-text-primary">
                Layanan Referensi Anotasi Gen Sedang Tidak Tersedia (Non-Blocking AC-07.2)
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">
                Server API Ensembl Plants eksternal sedang mengalami latensi tinggi atau tidak dapat
                dihubungi. Sesuai prinsip ketahanan sistem GWASena 2.0, kegagalan anotasi gen bersifat{' '}
                <strong>non-fatal</strong>. Hasil statistik asosiasi Anda pada Langkah 4 dan fitur
                unduh CSV pada Langkah 6 tetap dapat digunakan sepenuhnya tanpa hambatan.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => onNavigateStep(6)}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-4 py-2 text-xs font-bold text-white hover:bg-accent-primary/90"
            >
              <span>Lanjut ke Pengunduhan Data (Langkah 6) &rarr;</span>
            </button>
          </div>
        </div>
      ) : (
        /* ── State Normal: Tabel Kandidat Gen (AC-07.1) ── */
        <div className="rounded-2xl border border-border-subtle bg-surface p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-subtle pb-3">
            <div>
              <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
                <Dna className="h-4 w-4 text-accent-cyan" />
                <span>Tabel Pemetaan Kandidat Gen (AC-07.1)</span>
              </h4>
              <p className="text-[11px] text-text-secondary">
                Ditemukan {candidateGenes.length} kandidat gen fungsional yang berdekatan dengan SNP
                signifikan.
              </p>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari gen / SNP..."
                className="w-48 sm:w-64 rounded-xl border border-border-subtle bg-surface-elevated pl-8 pr-3 py-1.5 text-xs text-text-primary focus:border-accent-cyan focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle text-[11px] text-text-muted uppercase">
                <tr>
                  <th className="py-2.5 px-3">SNP ID</th>
                  <th className="py-2.5 px-3">Kromosom & Posisi</th>
                  <th className="py-2.5 px-3">Kandidat Gen</th>
                  <th className="py-2.5 px-3">Jarak / Posisi Relatif</th>
                  <th className="py-2.5 px-3">Konsekuensi Fungsional</th>
                  <th className="py-2.5 px-3">Deskripsi Biologis & Agronomi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle/50">
                {filteredGenes.map((gene) => (
                  <tr key={gene.snp_id} className="hover:bg-surface-elevated transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-accent-cyan">{gene.snp_id}</td>
                    <td className="py-3 px-3 font-mono text-text-primary tabular-nums">
                      Chr {gene.chromosome} : {Number(gene.position).toLocaleString('id-ID')} bp
                    </td>
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-text-primary block">
                          {gene.gene_id}
                        </span>
                        <span className="text-[11px] text-text-muted italic block">
                          {gene.gene_name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-text-secondary">{gene.distance}</td>
                    <td className="py-3 px-3">
                      <span className="inline-block rounded-md border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 font-mono text-[11px] font-semibold text-indigo-400">
                        {gene.consequence}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-sm text-text-secondary text-[11px] leading-relaxed">
                      {gene.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="rounded-xl border border-border-subtle bg-surface-elevated/40 p-3 text-[11px] text-text-muted flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-accent-cyan shrink-0 mt-0.5" />
            <p>
              Anotasi gen biologis memetakan lokus kuantitatif (QTL) asosiasi dengan metabolisme
              organosulfur (alliin) dan regulasi pembesaran umbi bawang putih Allium sativum L.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
