import { AlertCircle, X } from 'lucide-react';

/**
 * Message Area Standar GWASena 2.0
 * Acuan: docs/gwasena-v2/FRONTEND_ARCHITECTURE.md Bagian 5
 * Mendukung string tunggal dan format galat 422 { message, details: [] }
 */
export default function ErrorMessageArea({ error, onDismiss, className = '' }) {
  if (!error) return null;

  let message = '';
  let details = [];

  if (typeof error === 'string') {
    message = error;
  } else if (typeof error === 'object') {
    message = error.message || error.pesan || 'Terjadi kesalahan pada sistem.';
    if (Array.isArray(error.details) && error.details.length > 0) {
      details = error.details;
    } else if (Array.isArray(error.rincian) && error.rincian.length > 0) {
      details = error.rincian;
    }
  }

  return (
    <div
      role="alert"
      className={`relative flex items-start gap-3 rounded-xl border border-status-error/30 bg-status-error/10 p-4 text-status-error backdrop-blur-sm animate-fade-in ${className}`}
    >
      <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-status-error" />

      <div className="flex-1 text-sm leading-relaxed">
        <p className="font-semibold text-text-primary dark:text-red-200">{message}</p>

        {details.length > 0 && (
          <div className="mt-2.5 rounded-lg bg-surface/60 p-3 border border-status-error/20">
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              Rincian Masalah ({details.length}):
            </span>
            <ul className="mt-1.5 max-h-48 space-y-1 overflow-y-auto pl-4 text-xs font-mono text-text-secondary list-disc">
              {details.map((detail, idx) => (
                <li key={idx} className="break-all">
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg p-1 text-text-muted hover:bg-status-error/20 hover:text-text-primary transition-colors"
          aria-label="Tutup pesan galat"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
