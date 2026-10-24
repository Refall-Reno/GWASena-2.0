import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dna,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
  Layers,
  FileCheck2,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo.jsx';

/**
 * S-00: IntroPage (Interactive Onboarding)
 * Terinspirasi dari pacing dan storytelling Microsoft Copilot Tasks.
 * Acuan: docs/gwasena-v2/USER_FLOW.md Bagian 2 & WIREFRAME.md Layar S-00
 */
export default function IntroPage() {
  const navigate = useNavigate();
  const [activeCapability, setActiveCapability] = useState(0);

  const completeIntroAndNavigate = (targetPath) => {
    localStorage.setItem('gwasena_intro_completed', 'true');
    navigate(targetPath);
  };

  const capabilities = [
    {
      id: 0,
      badge: 'Langkah 1: Validasi',
      title: 'Validasi Genotipe & Fenotipe Otomatis',
      desc: 'Unggah berkas VCF/VCF.gz dan metadata CSV fenotipe. Sistem memverifikasi format bialelik dan mencocokkan 100% Sample ID seketika sebelum pipeline berjalan.',
      icon: FileCheck2,
      accent: 'text-accent-cyan border-accent-cyan/30 bg-accent-cyan/10',
    },
    {
      id: 1,
      badge: 'Langkah 2: Quality Control',
      title: 'QC Transparan & PCA Otomatis',
      desc: 'Bebaskan riset dari masalah black box. Konfigurasi parameter MAF, HWE, Missingness, dan Kinship dilengkapi panduan ilmiah [EDU-HINT] serta kovariat PCA otomatis.',
      icon: ShieldCheck,
      accent: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
    },
    {
      id: 2,
      badge: 'Langkah 3 & 4: Discovery',
      title: 'Model GLM/MLM, Manhattan Plot & Anotasi',
      desc: 'Jalankan uji asosiasi genomik, telusuri lokus signifikan pada Manhattan & QQ Plot interaktif beresolusi tinggi, lalu petakan kandidat gen ke referensi genom.',
      icon: BarChart3,
      accent: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    },
  ];

  const workflowSteps = [
    { num: '01', title: 'Unggah Dataset', desc: 'Genotipe VCF & Fenotipe CSV' },
    { num: '02', title: 'Konfigurasi Parameter', desc: 'Bantuan kontekstual EDU-HINT' },
    { num: '03', title: 'Komputasi Asinkron', desc: 'Orkestrasi terisolasi & Tips Edukatif' },
    { num: '04', title: 'Eksplorasi & Laporan', desc: 'Manhattan Plot, Anotasi & PDF' },
  ];

  return (
    <div className="w-full max-w-5xl py-6 px-4 animate-fade-in flex flex-col items-center text-center">
      {/* ── Babak 1: Hero Section ── */}
      <div className="flex flex-col items-center">
        {/* Badge Identitas */}
        <div className="inline-flex items-center gap-2 rounded-full border border-accent-cyan/30 bg-accent-cyan/10 px-3.5 py-1.5 text-xs font-semibold text-accent-cyan backdrop-blur-md mb-6 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-accent-cyan animate-pulse" />
          <span>GWASena 2.0 · Platform Genome-Wide Association Study Terpadu</span>
        </div>

        {/* Brand Display */}
        <div className="mb-4">
          <BrandLogo size="xl" showTagline={false} />
        </div>

        {/* Headline Ilmiah */}
        <h1 className="max-w-3xl text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary leading-[1.18]">
          Eksplorasi Asosiasi Genomik Tanpa Batas{' '}
          <span className="bg-gradient-to-r from-accent-cyan via-accent-primary to-accent-indigo bg-clip-text text-transparent">
            dalam Satu Alur Terpadu.
          </span>
        </h1>

        {/* Narasi Pacing */}
        <p className="mt-4 max-w-2xl text-base sm:text-lg text-text-secondary leading-relaxed">
          Dirancang untuk peneliti agronomi, pemulia tanaman, dan akademisi bioinformatika. Mengeliminasi kerumitan perintah CLI (PLINK 2 & GAPIT) dengan panduan parameter ilmiah yang transparan.
        </p>
      </div>

      {/* ── Babak 2: Interactive Capability Pills (Copilot-Inspired) ── */}
      <div className="mt-12 w-full max-w-3xl">
        <div className="flex items-center justify-center gap-2 border-b border-border-subtle pb-3 overflow-x-auto">
          {capabilities.map((cap, idx) => {
            const Icon = cap.icon;
            const isActive = activeCapability === idx;
            return (
              <button
                key={cap.id}
                type="button"
                onClick={() => setActiveCapability(idx)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
                  isActive
                    ? 'border border-border-strong bg-surface text-text-primary shadow-lg shadow-black/20'
                    : 'text-text-muted hover:bg-surface/50 hover:text-text-secondary'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-accent-cyan' : ''}`} />
                <span>{cap.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Capability Card Showcase */}
        <div className="mt-4 rounded-2xl border border-border-subtle bg-surface/85 p-6 sm:p-8 text-left shadow-xl backdrop-blur-md transition-all">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${capabilities[activeCapability].accent}`}>
              {(() => {
                const ActiveIcon = capabilities[activeCapability].icon;
                return <ActiveIcon className="h-6 w-6" />;
              })()}
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-text-primary">
                {capabilities[activeCapability].title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {capabilities[activeCapability].desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Babak 3: How GWASena Works (Sequential Steps) ── */}
      <div className="mt-12 w-full max-w-4xl">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Layers className="h-4 w-4 text-accent-cyan" />
          <h2 className="text-xs uppercase tracking-widest font-bold text-text-muted">
            4 Tahapan Analisis Terstruktur
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-left">
          {workflowSteps.map((ws, i) => (
            <div
              key={i}
              className="flex flex-col justify-between rounded-xl border border-border-subtle bg-surface/60 p-4 backdrop-blur-sm hover:border-border-strong transition-colors"
            >
              <div>
                <span className="font-mono text-xs font-bold text-accent-cyan">{ws.num}</span>
                <h4 className="mt-1 text-sm font-semibold text-text-primary">{ws.title}</h4>
                <p className="mt-1 text-xs text-text-muted leading-relaxed">{ws.desc}</p>
              </div>
              <div className="mt-3 flex items-center gap-1 text-[11px] font-medium text-status-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Terverifikasi Sistem</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Babak 4: High-Contrast Action Dock (CTA) ── */}
      <div className="mt-12 w-full max-w-md rounded-2xl border border-border-strong/80 bg-surface/90 p-5 shadow-2xl backdrop-blur-md">
        <p className="text-xs font-medium text-text-secondary mb-3">
          Siap memulai penemuan genetik tanaman bawang putih?
        </p>

        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={() => completeIntroAndNavigate('/login')}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all hover:shadow-accent-primary/20"
          >
            Masuk ke Workspace
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() => completeIntroAndNavigate('/register')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-strong bg-surface-elevated px-5 py-3 text-sm font-semibold text-text-primary hover:bg-surface hover:border-text-secondary focus:outline-none focus:ring-2 focus:ring-border-strong transition-all"
          >
            Daftar Akun Baru
          </button>
        </div>
      </div>
    </div>
  );
}
