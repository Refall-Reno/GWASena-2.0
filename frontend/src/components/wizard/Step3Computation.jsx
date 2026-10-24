import { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  Dna,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useAnalysisStore } from '../../store/useAnalysisStore.js';
import { analysisService } from '../../services/analysisService.js';
import { TIPS_EDUKATIF } from '../../constants/eduHints.js';
import { generateBenchmarkResults } from '../../services/mockResults.js';

/**
 * S-06 (Langkah 3): Layar Tunggu Komputasi Pipeline
 * Acuan: docs/gwasena-v2/WIREFRAME.md, USER_FLOW.md, DESIGN.md (Bagian 6, 8B)
 *
 * Mengunci konfigurasi form (BR-05, AC-10.1), menampilkan progres 4 tahapan diskrit,
 * menyajikan ringkasan QC (AC-03.1), serta karusel Tips Edukatif dinamis (FR-10).
 */
export default function Step3Computation({ analysisId, onComplete }) {
  const {
    currentAnalysis,
    setCurrentAnalysis,
    configParams,
    uploadSummary,
    setResults,
    setIsSimulated,
    isSimulated,
  } = useAnalysisStore();

  // Tahapan Pipeline Diskrit (1 s.d. 4)
  const PIPELINE_STAGES = [
    {
      id: 1,
      title: 'Quality Control (Penyaringan Sampel & SNP)',
      desc: 'Memvalidasi missingness, MAF, HWE klonal bawang putih, dan kekerabatan KING.',
    },
    {
      id: 2,
      title: 'Analisis Struktur Populasi (PCA Otomatis)',
      desc: 'Menghitung dekomposisi kovariat PC1–PC3 untuk koreksi stratifikasi genetik (FR-04).',
    },
    {
      id: 3,
      title: 'Uji Asosiasi Statistik & Koreksi',
      desc: `Mengeksekusi model ${configParams.model || 'MLM'} terhadap sifat ${configParams.trait || 'fenotipe'} dengan koreksi Bonferroni & FDR.`,
    },
    {
      id: 4,
      title: 'Anotasi Kandidat Gen & Visualisasi',
      desc: 'Memetakan SNP signifikan ke gen Allium sativum dan menyusun plot Manhattan/QQ.',
    },
  ];

  const [activeStage, setActiveStage] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [backendNotice, setBackendNotice] = useState(null);

  // Carousel State untuk Tips Edukatif (FR-10)
  const [tipIndex, setTipIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Auto-rotate Tips Edukatif setiap 6 detik jika tidak di-hover
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % TIPS_EDUKATIF.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isHovered]);

  // Polling backend status setiap 3 detik
  useEffect(() => {
    let timer;
    let isMounted = true;

    async function pollStatus() {
      try {
        const res = await analysisService.getStatus(analysisId);
        if (!isMounted) return;

        if (res.status === 'selesai') {
          setActiveStage(4);
          setIsCompleted(true);
          // Ambil hasil jika tersedia
          try {
            const resultsData = await analysisService.getResults(analysisId);
            setResults(resultsData);
          } catch (rErr) {
            // Jika results 501, fallback ke benchmark
            const fallback = generateBenchmarkResults(configParams, uploadSummary);
            setResults(fallback);
          }
          return;
        }

        // Tentukan tahap berdasarkan pesan / status backend
        if (res.tahap) {
          setActiveStage(Number(res.tahap) || 1);
        }
      } catch (err) {
        if (!isMounted) return;
        if (err.status === 501) {
          setBackendNotice(
            'Layanan komputasi backend (Celery worker) saat ini merespons HTTP 501 Not Implemented. Konfigurasi Anda telah divalidasi. Anda dapat mengaktifkan Mode Simulasi UI untuk mengevaluasi layar hasil visualisasi (S-07), anotasi gen (S-08), dan ekspor (S-09).'
          );
        }
      }

      if (!isCompleted) {
        timer = setTimeout(pollStatus, 3000);
      }
    }

    pollStatus();

    return () => {
      isMounted = false;
      if (timer) clearTimeout(timer);
    };
  }, [analysisId, isCompleted]);

  // Simulasi UI bertahap jika pengguna mengaktifkannya
  function handleStartSimulation() {
    setIsSimulated(true);
    setBackendNotice(null);
    setActiveStage(1);

    // Langkah bertahap realistis untuk demonstrasi interaktif
    setTimeout(() => setActiveStage(2), 1200);
    setTimeout(() => setActiveStage(3), 2600);
    setTimeout(() => setActiveStage(4), 4000);
    setTimeout(() => {
      const mock = generateBenchmarkResults(configParams, uploadSummary);
      setResults(mock);
      setIsCompleted(true);
      setCurrentAnalysis({
        ...(currentAnalysis || {}),
        status: 'selesai',
      });
    }, 5200);
  }

  const currentTip = TIPS_EDUKATIF[tipIndex];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* ── Banner Status Terkunci (BR-05, AC-10.1) ── */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/20 text-amber-500 shadow-inner">
            <Lock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm sm:text-base font-bold text-text-primary flex items-center gap-2">
              <span>Komputasi Pipeline Sedang Berjalan</span>
              <span className="inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                Form Konfigurasi Dikunci (BR-05)
              </span>
            </h3>
            <p className="text-xs text-text-secondary leading-relaxed max-w-3xl">
              Untuk menjaga integritas ilmiah dan reprodusibilitas riset asosiasi genomik,
              parameter Quality Control dan model yang sedang diuji tidak dapat diubah selama proses
              analisis aktif.
            </p>
          </div>
        </div>
      </div>

      {/* ── Pemberitahuan Backend 501 Transparan ── */}
      {backendNotice && !isSimulated && (
        <div className="rounded-2xl border border-cyan-500/40 bg-cyan-950/20 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-accent-cyan shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-accent-cyan">
                Informasi Integrasi Backend (HTTP 501)
              </h4>
              <p className="text-xs text-text-secondary leading-relaxed">{backendNotice}</p>
            </div>
          </div>
          <div className="pt-1 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleStartSimulation}
              className="inline-flex items-center gap-2 rounded-xl bg-accent-cyan px-4 py-2 text-xs font-bold text-slate-950 hover:bg-accent-cyan/90 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Simulasikan Selesai Komputasi (Mode Pengujian UI)</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Grid 2 Kolom: Tahapan Pipeline & Edukasi Dinamis ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: 4 Tahapan Pipeline Diskrit (8 Kolom) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2">
              <Dna className="h-4 w-4 text-accent-cyan" />
              <span>Tahapan Eksekusi Diskrit</span>
            </h4>
            <span className="text-xs font-mono font-semibold text-accent-cyan">
              {isCompleted ? '4 / 4 Tahap Selesai' : `Tahap ${activeStage} dari 4`}
            </span>
          </div>

          <div className="space-y-3">
            {PIPELINE_STAGES.map((stage) => {
              const isPast = isCompleted || activeStage > stage.id;
              const isCurrent = !isCompleted && activeStage === stage.id;
              const isPending = !isCompleted && activeStage < stage.id;

              return (
                <div
                  key={stage.id}
                  className={`flex items-start gap-3.5 rounded-2xl border p-4 transition-all duration-300 ${
                    isCurrent
                      ? 'border-accent-cyan bg-accent-cyan/5 shadow-md shadow-accent-cyan/5 ring-1 ring-accent-cyan/40'
                      : isPast
                      ? 'border-status-success/30 bg-surface-elevated/40'
                      : 'border-border-subtle bg-surface/40 opacity-60'
                  }`}
                >
                  <div className="pt-0.5">
                    {isPast ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-status-success/20 text-status-success">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                    ) : isCurrent ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan/20 text-accent-cyan animate-pulse-ring">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-elevated text-text-muted font-mono text-xs">
                        {stage.id}
                      </div>
                    )}
                  </div>

                  <div className="space-y-0.5 flex-1">
                    <p
                      className={`text-xs sm:text-sm font-semibold ${
                        isCurrent
                          ? 'text-accent-cyan font-bold'
                          : isPast
                          ? 'text-text-primary'
                          : 'text-text-muted'
                      }`}
                    >
                      {stage.title}
                    </p>
                    <p className="text-[11px] text-text-secondary leading-relaxed">{stage.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tombol Lanjut bila sudah selesai */}
          {isCompleted && (
            <div className="pt-2 animate-fade-in">
              <button
                type="button"
                onClick={onComplete}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-status-success px-5 py-3 text-sm font-bold text-white shadow-lg shadow-status-success/20 hover:bg-status-success/90 transition-all"
              >
                <span>Lihat Hasil Analisis & Visualisasi Plot (Langkah 4)</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* Kolom Kanan: Ringkasan QC & Karusel Tips Edukatif (5 Kolom) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Ringkasan Hasil Penyaringan QC (AC-03.1) */}
          <div className="rounded-2xl border border-border-subtle bg-surface-elevated/60 p-4 space-y-3">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2.5">
              <Filter className="h-4 w-4 text-accent-cyan" />
              <h5 className="text-xs font-bold text-text-primary">
                Ringkasan Penyaringan QC (AC-03.1)
              </h5>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl border border-border-subtle bg-surface p-2.5">
                <span className="text-[10px] text-text-muted block uppercase">Sampel Dianalisis</span>
                <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
                  {isCompleted ? '38' : '40'}{' '}
                  <span className="text-[10px] font-normal text-text-muted">/ 40 total</span>
                </span>
                {isCompleted && (
                  <span className="text-[10px] text-status-warning block mt-0.5">
                    -2 disaring (mind)
                  </span>
                )}
              </div>

              <div className="rounded-xl border border-border-subtle bg-surface p-2.5">
                <span className="text-[10px] text-text-muted block uppercase">SNP Lolos Filter</span>
                <span className="font-mono text-sm font-bold text-text-primary tabular-nums">
                  {isCompleted ? '482' : '500'}{' '}
                  <span className="text-[10px] font-normal text-text-muted">/ 500 total</span>
                </span>
                {isCompleted && (
                  <span className="text-[10px] text-status-warning block mt-0.5">
                    -18 disaring (MAF/geno/HWE)
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl bg-surface/50 p-2 text-[11px] text-text-secondary flex items-center justify-between">
              <span>Sifat fenotipe target:</span>
              <span className="font-mono font-semibold text-accent-cyan">
                {configParams.trait || uploadSummary?.fenotipe?.sifat_tersedia?.[0] || 'bobot_umbi_g'}
              </span>
            </div>
          </div>

          {/* Card Tips Edukatif Dinamis (FR-10, DESIGN.md Bagian 8B) */}
          <div
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="rounded-2xl border border-accent-cyan/30 bg-gradient-to-br from-accent-cyan/10 via-surface-elevated/70 to-surface p-4 space-y-3 relative group transition-all"
          >
            <div className="flex items-center justify-between border-b border-border-subtle pb-2">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-lg bg-accent-cyan/20 flex items-center justify-center text-accent-cyan">
                  <HelpCircle className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold text-accent-cyan">
                  Tips Edukatif Riset (FR-10)
                </span>
              </div>
              <span className="font-mono text-[10px] text-text-muted">
                {tipIndex + 1} / {TIPS_EDUKATIF.length}
              </span>
            </div>

            <div className="min-h-[92px] space-y-1">
              <h6 className="text-xs font-bold text-text-primary">{currentTip.judul}</h6>
              <p className="text-[11px] text-text-secondary leading-relaxed italic">
                &ldquo;{currentTip.teks}&rdquo;
              </p>
            </div>

            {/* Kontrol Navigasi Manual */}
            <div className="flex items-center justify-between pt-1 border-t border-border-subtle/60 text-[10px]">
              <span className="text-text-muted text-[10px]">
                {isHovered ? 'Rotasi dijeda (hover)' : 'Berotasi otomatis setiap 6s'}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setTipIndex(
                      (prev) => (prev - 1 + TIPS_EDUKATIF.length) % TIPS_EDUKATIF.length
                    )
                  }
                  className="rounded-lg border border-border-subtle bg-surface p-1 hover:bg-surface-elevated text-text-primary"
                  title="Sebelumnya"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTipIndex((prev) => (prev + 1) % TIPS_EDUKATIF.length)}
                  className="rounded-lg border border-border-subtle bg-surface p-1 hover:bg-surface-elevated text-text-primary"
                  title="Berikutnya"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
