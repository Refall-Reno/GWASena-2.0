import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  History,
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  RefreshCw,
  FolderOpen,
  Calendar,
  Loader2,
  FileText,
} from 'lucide-react';
import { analysisService } from '../services/analysisService.js';
import { ANALYSIS_STATUSES } from '../constants/defaultParams.js';
import ErrorMessageArea from '../components/common/ErrorMessageArea.jsx';
import AccessDeniedState from '../components/common/AccessDeniedState.jsx';

/**
 * S-10: HistoryPage (Riwayat Analisis Pengguna)
 * Acuan: docs/gwasena-v2/WIREFRAME.md Layar S-10 & USER_FLOW.md
 */
export default function HistoryPage() {
  const navigate = useNavigate();

  const [analyses, setAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  async function loadHistory() {
    setIsLoading(true);
    setError(null);
    setIsAccessDenied(false);

    try {
      const data = await analysisService.listAnalyses();
      setAnalyses(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.status === 403) {
        setIsAccessDenied(true);
      } else {
        setError(err);
      }
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadHistory();
  }, []);

  // Filter data berdasarkan search query & status
  const filteredAnalyses = useMemo(() => {
    return analyses.filter((a) => {
      const matchesSearch =
        (a.analysis_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(a.analysis_id).includes(searchQuery);

      const matchesStatus =
        statusFilter === 'ALL' || (a.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchQuery, statusFilter]);

  if (isAccessDenied) {
    return <AccessDeniedState />;
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* ── Header Halaman ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <History className="h-6 w-6 text-accent-cyan" />
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Riwayat Analisis GWAS
            </h1>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-text-secondary">
            Daftar seluruh sesi komputasi dan eksplorasi asosiasi genomik milik akun Anda (FR-12).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadHistory}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle bg-surface px-3 py-2 text-xs font-semibold text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors disabled:opacity-50"
            title="Muat Ulang Riwayat"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan</span>
          </button>

          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-accent-primary/90 transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Analisis Baru</span>
          </Link>
        </div>
      </div>

      <ErrorMessageArea error={error} onDismiss={() => setError(null)} />

      {/* ── Toolbar Pencarian & Filter ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-border-subtle bg-surface p-3.5 shadow-sm">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berdasarkan nama analisis atau ID sesi..."
            className="w-full rounded-xl border border-border-subtle bg-surface-elevated py-2 pl-9 pr-3 text-xs sm:text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
          />
        </div>

        {/* Filter Dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-text-muted shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-border-subtle bg-surface-elevated py-2 px-3 text-xs font-medium text-text-primary focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan cursor-pointer"
          >
            <option value="ALL">Semua Status ({analyses.length})</option>
            <option value="selesai">Selesai</option>
            <option value="berjalan">Sedang Berjalan</option>
            <option value="antre">Dalam Antrean</option>
            <option value="tervalidasi">Tervalidasi (Siap QC)</option>
            <option value="draft">Draft (Belum Upload)</option>
            <option value="gagal">Gagal</option>
          </select>
        </div>
      </div>

      {/* ── Konten Tabel / Loading / Empty State ── */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-cyan mb-2" />
          <p className="text-xs text-text-muted">Memuat daftar riwayat analisis...</p>
        </div>
      ) : filteredAnalyses.length === 0 ? (
        /* Empty State */
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-dashed border-border-strong bg-surface/50 p-8 text-center animate-fade-in">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-elevated text-text-muted mb-3">
            <FolderOpen className="h-7 w-7" />
          </div>

          <h3 className="text-base font-bold text-text-primary">
            {analyses.length === 0
              ? 'Belum Ada Sesi Analisis'
              : 'Tidak Ditemukan Analisis yang Cocok'}
          </h3>

          <p className="mt-1 max-w-sm text-xs text-text-secondary leading-relaxed">
            {analyses.length === 0
              ? 'Anda belum pernah menjalankan analisis GWAS. Mulai sesi pertama Anda dengan mengunggah dataset genotipe dan fenotipe.'
              : 'Cobalah sesuaikan kata kunci pencarian atau ubah filter status yang Anda pilih.'}
          </p>

          {analyses.length === 0 && (
            <Link
              to="/dashboard"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-accent-primary px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-accent-primary/90 transition-colors"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Mulai Analisis Pertama</span>
            </Link>
          )}
        </div>
      ) : (
        /* Tabel Riwayat */
        <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border-subtle bg-surface-elevated/70 text-text-secondary font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-20">ID</th>
                  <th className="py-3 px-4">Nama Sesi Analisis</th>
                  <th className="py-3 px-4 hidden md:table-cell">Organisme</th>
                  <th className="py-3 px-4 hidden sm:table-cell">Waktu Sesi</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {filteredAnalyses.map((item) => {
                  const statusConfig =
                    ANALYSIS_STATUSES[item.status?.toLowerCase()] || ANALYSIS_STATUSES.draft;

                  const formattedDate = item.analysis_time
                    ? new Date(item.analysis_time).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '—';

                  return (
                    <tr
                      key={item.analysis_id}
                      className="hover:bg-surface-elevated/50 transition-colors group"
                    >
                      {/* ID Sesi */}
                      <td className="py-3.5 px-4 font-mono font-bold text-accent-cyan tabular-nums">
                        #{item.analysis_id}
                      </td>

                      {/* Nama Analisis */}
                      <td className="py-3.5 px-4 font-medium text-text-primary">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-text-muted shrink-0" />
                          <span className="font-semibold text-sm group-hover:text-accent-primary dark:group-hover:text-accent-cyan transition-colors line-clamp-1">
                            {item.analysis_name}
                          </span>
                        </div>
                      </td>

                      {/* Organisme */}
                      <td className="py-3.5 px-4 hidden md:table-cell italic text-text-secondary">
                        {item.organism || 'Allium sativum'}
                      </td>

                      {/* Waktu Sesi */}
                      <td className="py-3.5 px-4 hidden sm:table-cell text-text-muted font-mono tabular-nums">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-text-muted" />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusConfig.badgeClass}`}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: statusConfig.color }}
                          />
                          {statusConfig.label}
                        </span>
                      </td>

                      {/* Tombol Aksi */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => navigate(`/analyses/${item.analysis_id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-border-subtle bg-surface px-3 py-1.5 text-xs font-semibold text-text-primary hover:border-accent-cyan hover:text-accent-cyan hover:bg-surface-elevated transition-colors"
                        >
                          <span>Buka Analisis</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
