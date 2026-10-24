import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, ArrowRight, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import ErrorMessageArea from '../components/common/ErrorMessageArea.jsx';

/**
 * S-01: LoginPage (Autentikasi Pengguna)
 * Acuan: docs/gwasena-v2/USER_FLOW.md Bagian 4 & WIREFRAME.md Layar S-01
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  // Ambil state pendaftaran jika pengguna baru dialihkan dari S-02
  const registeredSuccess = location.state?.registered;
  const prefilledUsername = location.state?.username || '';

  const [username, setUsername] = useState(prefilledUsername);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError('Mohon isi nama pengguna/email dan kata sandi Anda.');
      return;
    }

    try {
      await login(username.trim(), password);

      // Arahkan ke rute awal jika sebelumnya dialihkan oleh ProtectedRoute (AC-01.3)
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (err) {
      // Tangani galat kredensial salah (401) atau galat lainnya
      setError(err);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in">
      <div className="rounded-2xl border border-border-strong bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header Form */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Masuk ke GWASena
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Masukkan kredensial akun peneliti Anda untuk melanjutkan riset
          </p>
        </div>

        {/* Banner Registrasi Sukses */}
        {registeredSuccess && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-status-success/30 bg-status-success/10 p-3 text-xs text-status-success font-medium">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-status-success" />
            <span>Akun berhasil dibuat. Silakan masukkan kata sandi Anda untuk masuk.</span>
          </div>
        )}

        {/* Kotak Galat Pesan */}
        <ErrorMessageArea error={error} onDismiss={() => setError(null)} className="mb-4" />

        {/* Form Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Kolom Username / Email */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Username atau Alamat Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <User className="h-4 w-4" />
              </span>
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="peneliti atau email@apps.ipb.ac.id"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
              />
            </div>
          </div>

          {/* Kolom Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1.5"
            >
              Kata Sandi
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2.5 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-primary"
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Opsi Ingat Sesi */}
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-text-secondary select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-border-strong text-accent-primary focus:ring-accent-cyan/50"
              />
              <span>Ingat sesi saya di perangkat ini</span>
            </label>
          </div>

          {/* Tombol Masuk Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary py-3 text-sm font-bold text-white shadow-md hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Memverifikasi kredensial...</span>
              </>
            ) : (
              <>
                <span>Masuk ke Akun</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Opsi Akses Demo Instan (Pengujian UI & Backend Offline) */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-border-subtle"></div>
            <span className="flex-shrink mx-2 text-[10px] uppercase tracking-wider text-text-muted">
              atau mode pengujian
            </span>
            <div className="flex-grow border-t border-border-subtle"></div>
          </div>

          <button
            type="button"
            onClick={async () => {
              try {
                await login('peneliti_ipb', 'password123');
                navigate('/dashboard');
              } catch (e) {
                console.error(e);
              }
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 py-2.5 text-xs font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Masuk Cepat (Akun Peneliti Demo)</span>
          </button>
        </form>

        {/* Footer Kartu Form */}
        <div className="mt-6 border-t border-border-subtle pt-4 text-center space-y-2">
          <p className="text-xs text-text-secondary">
            Belum memiliki akun peneliti?{' '}
            <Link
              to="/register"
              className="font-semibold text-accent-cyan hover:underline transition-colors"
            >
              Daftar di sini
            </Link>
          </p>

          <div>
            <Link
              to="/welcome"
              className="inline-flex items-center gap-1 text-[11px] text-text-muted hover:text-accent-cyan transition-colors"
            >
              <span>✨ Lihat Pengenalan GWASena</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
