import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna,
  PlusCircle,
  History,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  Sprout,
  Loader2,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import { analysisService } from '../services/analysisService.js';
import ErrorMessageArea from '../components/common/ErrorMessageArea.jsx';

/**
 * S-03: DashboardPage (Layar Utama Peneliti)
 * Acuan: docs/gwasena-v2/WIREFRAME.md Layar S-03 & USER_FLOW.md
 */
export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [meta, setMeta] = useState(null);
  const [health, setHealth] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [analysisName, setAnalysisName] = useState('Analisis Bobot Umbi Bawang Putih');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboardData() {
      try {
        const [metaData, healthData] = await Promise.allSettled([
          analysisService.getMeta(),
          analysisService.checkHealth(),
        ]);
        if (isMounted) {
          if (metaData.status === 'fulfilled') setMeta(metaData.value);
          if (healthData.status === 'fulfilled') setHealth(healthData.value);
        }
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
      }
    }
    loadDashboardData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleCreateAnalysis = async (e) => {
    e.preventDefault();
    if (!analysisName.trim()) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await analysisService.createAnalysis(analysisName.trim());
      setIsModalOpen(false);
      navigate(`/analyses/${res.analysis_id}`);
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
    }
  };

  const org = meta?.organisme;
  const isHealthy = health?.status === 'ok';

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* ── Banner Sambutan Peneliti & Organisme ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border-strong bg-gradient-to-br from-surface via-surface to-surface-elevated/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3 py-1 text-xs font-semibold text-accent-cyan">
              <Sprout className="h-3.5 w-3.5 text-accent-cyan" />
              <span>Studi Kasus Agronomi: Bawang Putih (Allium sativum L.)</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
              Selamat datang kembali,{' '}
              <span className="text-accent-cyan">{user?.username || 'Peneliti'}</span>!
            </h1>

            <p className="max-w-2xl text-sm text-text-secondary leading-relaxed">
              Mulai sesi analisis asosiasi genomik baru atau lanjutkan evaluasi hasil riset terdahulu
              pada genom 8 kromosom bawang putih.
            </p>
          </div>

          {/* Quick Species Badge */}
          {org && (
            <div className="shrink-0 rounded-2xl border border-border-subtle bg-surface-elevated/70 p-4 text-xs space-y-1.5 min-w-[220px]">
              <span className="font-semibold text-text-primary block">Spesimen Aktif:</span>
              <div className="font-mono text-accent-cyan font-bold italic text-sm">
                {org.nama_ilmiah}
              </div>
              <div className="text-text-muted">
                {org.ploidi} · {org.jumlah_kromosom} Pasang Kromosom
              </div>
              <div className="text-[11px] text-text-secondary">
                Ukuran Genom: {org.ukuran_genom_perkiraan}
              </div>
            </div>
          )}
        </div>

        {/* Subtle decorative glow */}
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent-cyan/10 blur-3xl" />
      </div>

      {/* ── Dua Kartu Aksi Utama (Sesuai WIREFRAME.md) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kartu 1: Analisis Baru (Primary CTA) */}
        <div className="flex flex-col justify-between rounded-3xl border-2 border-accent-primary/40 bg-surface/90 p-6 sm:p-8 shadow-xl hover:border-accent-cyan/60 hover:shadow-accent-cyan/10 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-primary/15 text-accent-primary dark:text-accent-cyan group-hover:scale-105 transition-transform">
                <Dna className="h-6 w-6" />
              </div>
              <span className="rounded-full bg-accent-primary/10 px-3 py-1 text-xs font-bold text-accent-cyan border border-accent-cyan/20">
                Alur Wizard 6 Langkah
              </span>
            </div>

            <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-cyan transition-colors">
              Mulai Analisis GWAS Baru
            </h2>

            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Jalankan siklus terpadu: unggah VCF & fenotipe CSV, penyaringan Quality Control, kovariat
              PCA otomatis, model GLM/MLM, hingga visualisasi Manhattan Plot interaktif.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary py-3 px-4 text-sm font-bold text-white shadow-md hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all hover:shadow-accent-primary/20"
            >
              <PlusCircle className="h-4 w-4" />
              <span>+ Inisiasi Sesi Analisis Baru</span>
            </button>
          </div>
        </div>

        {/* Kartu 2: Riwayat Analisis */}
        <div className="flex flex-col justify-between rounded-3xl border border-border-strong bg-surface/90 p-6 sm:p-8 shadow-xl hover:border-border-strong/80 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-elevated text-text-secondary group-hover:text-text-primary group-hover:scale-105 transition-all">
                <History className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-text-muted">
                Riwayat Tersimpan (FR-12)
              </span>
            </div>

            <h2 className="text-xl font-bold text-text-primary group-hover:text-accent-primary dark:group-hover:text-accent-cyan transition-colors">
              Buka Riwayat Analisis
            </h2>

            <p className="mt-2 text-sm text-text-secondary leading-relaxed">
              Akses kembali sesi analisis terdahulu, tinjau tabel SNP signifikan, periksa log
              komputasi, atau unduh ringkasan laporan PDF dan gambar plot publikasi.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle">
            <button
              type="button"
              onClick={() => navigate('/history')}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-elevated py-3 px-4 text-sm font-semibold text-text-primary hover:bg-surface hover:border-text-secondary transition-all"
            >
              <span>Buka Daftar Riwayat Analisis</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Panel Status Infrastruktur Ringkas ── */}
      <div className="rounded-2xl border border-border-subtle bg-surface/60 p-5 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-accent-cyan" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">
              Kesiapan Infrastruktur Komputasi
            </h3>
          </div>
          <span className="text-[11px] text-text-muted">
            Status: {isHealthy ? 'Optimal' : 'Memeriksa...'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* API Backend */}
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 text-xs">
            <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
            <div>
              <span className="font-semibold text-text-primary block">FastAPI Engine</span>
              <span className="text-[11px] text-text-muted">REST API v0.1.1 Siap</span>
            </div>
          </div>

          {/* Database PostgreSQL */}
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 text-xs">
            {health?.components?.database?.ok ? (
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-status-warning shrink-0" />
            )}
            <div>
              <span className="font-semibold text-text-primary block">PostgreSQL 16</span>
              <span className="text-[11px] text-text-muted">
                {health?.components?.database?.tables?.length || 12} Tabel Terindeks
              </span>
            </div>
          </div>

          {/* Celery & Redis */}
          <div className="flex items-center gap-3 rounded-xl border border-border-subtle bg-surface p-3 text-xs">
            {health?.components?.redis?.ok ? (
              <CheckCircle2 className="h-4 w-4 text-status-success shrink-0" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-status-warning shrink-0" />
            )}
            <div>
              <span className="font-semibold text-text-primary block">Celery & Redis</span>
              <span className="text-[11px] text-text-muted">Antrean Tugas Asinkron</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal Dialog Inisiasi Analisis Baru ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-border-strong bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border-subtle pb-3">
              <div className="flex items-center gap-2">
                <Dna className="h-5 w-5 text-accent-cyan" />
                <h3 className="text-lg font-bold text-text-primary">
                  Inisiasi Sesi Analisis Baru
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <ErrorMessageArea error={error} onDismiss={() => setError(null)} />

            <form onSubmit={handleCreateAnalysis} className="space-y-4">
              <div>
                <label
                  htmlFor="analysisName"
                  className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
                >
                  Nama Sesi Analisis
                </label>
                <input
                  id="analysisName"
                  type="text"
                  required
                  value={analysisName}
                  onChange={(e) => setAnalysisName(e.target.value)}
                  placeholder="Contoh: GWAS Bobot Umbi Bawang Putih 2026"
                  className="w-full rounded-xl border border-border-subtle bg-surface-elevated py-2.5 px-3.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                />
                <span className="mt-1 block text-[11px] text-text-muted">
                  Beri nama deskriptif sesuai sifat agronomi atau aksesi kultivar yang diuji.
                </span>
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface-elevated/50 p-3 text-xs text-text-secondary space-y-1">
                <div className="font-semibold text-text-primary">Tahap Berikutnya:</div>
                <p>
                  Setelah sesi dibuat, Anda akan diarahkan ke <strong>Langkah 1 (Unggah Data)</strong> untuk memilih berkas genotipe (.vcf / .vcf.gz) dan fenotipe (.csv).
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="rounded-xl border border-border-subtle px-4 py-2.5 text-xs font-semibold text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !analysisName.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-primary px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent-primary/90 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Membuat Sesi...</span>
                    </>
                  ) : (
                    <>
                      <span>Mulai Analisis</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
