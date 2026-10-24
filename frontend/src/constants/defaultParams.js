/**
 * Parameter Default & Batas Validasi GWASena 2.0
 * Acuan: docs/gwasena-v2/DESIGN.md & API_INTEGRATION.md
 */

export const DEFAULT_QC_PARAMS = {
  mind: 0.10,
  geno: 0.10,
  maf: 0.05,
  hwe: '1e-6',
  king_cutoff: 0.177,
};

export const DEFAULT_ANALYSIS_CONFIG = {
  trait: '',
  qc: { ...DEFAULT_QC_PARAMS },
  n_pc: 3,
  model: 'MLM',
  koreksi: ['bonferroni', 'fdr'],
  alpha: 0.05,
};

export const QC_PARAM_RANGES = {
  mind: { min: 0.0, max: 0.5, step: 0.01 },
  geno: { min: 0.0, max: 0.5, step: 0.01 },
  maf: { min: 0.01, max: 0.49, step: 0.01 },
  hwe: { min: 1e-10, max: 1e-1, step: 'scientific' },
  king_cutoff: { min: 0.0, max: 0.5, step: 0.001 },
  alpha: { min: 0.001, max: 0.1, step: 0.005 },
};

export const ANALYSIS_STATUSES = {
  draft: {
    label: 'Draft',
    badgeClass: 'bg-surface-elevated text-text-muted border-border-subtle',
    color: '#64748B',
  },
  tervalidasi: {
    label: 'Tervalidasi',
    badgeClass: 'bg-emerald-500/10 text-status-success border-emerald-500/20',
    color: '#10B981',
  },
  antre: {
    label: 'Dalam Antrean',
    badgeClass: 'bg-amber-500/10 text-status-warning border-amber-500/20',
    color: '#F59E0B',
  },
  berjalan: {
    label: 'Sedang Berjalan',
    badgeClass: 'bg-cyan-500/10 text-accent-cyan border-cyan-500/20',
    color: '#06B6D4',
  },
  selesai: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-500/10 text-status-success border-emerald-500/20',
    color: '#10B981',
  },
  gagal: {
    label: 'Gagal',
    badgeClass: 'bg-rose-500/10 text-status-error border-rose-500/20',
    color: '#EF4444',
  },
};

export const WIZARD_STEPS = [
  { step: 1, id: 'upload', label: 'Unggah & Validasi' },
  { step: 2, id: 'config', label: 'Konfigurasi QC & Model' },
  { step: 3, id: 'compute', label: 'Komputasi Pipeline' },
  { step: 4, id: 'results', label: 'Hasil & Visualisasi' },
  { step: 5, id: 'annotation', label: 'Anotasi Gen' },
  { step: 6, id: 'export', label: 'Ekspor & Laporan' },
];
