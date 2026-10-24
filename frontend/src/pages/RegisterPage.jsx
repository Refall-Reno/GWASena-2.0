import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Mail, ArrowRight, Loader2, Check, Sparkles } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';
import ErrorMessageArea from '../components/common/ErrorMessageArea.jsx';

/**
 * S-02: RegisterPage (Pendaftaran Akun Peneliti)
 * Acuan: docs/gwasena-v2/USER_FLOW.md Bagian 4 & WIREFRAME.md Layar S-02
 * Kontrak Skema: RegisterIn (username: 3-50, email: max 120, password: min 8)
 */
export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim();
    const cleanEmail = email.trim();

    // Validasi Sisi Klien
    const usernameRegex = /^[A-Za-z0-9_.-]+$/;
    if (!usernameRegex.test(cleanUsername)) {
      setError({
        message: 'Format nama pengguna tidak valid.',
        details: [
          'Hanya boleh mengandung huruf, angka, garis bawah (_), titik (.), atau tanda hubung (-).',
          'Panjang antara 3 hingga 50 karakter.',
        ],
      });
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi harus memiliki panjang minimal 8 karakter.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok dengan kata sandi yang dimasukkan.');
      return;
    }

    try {
      await register(cleanUsername, cleanEmail, password);

      // Tandai intro selesai dan arahkan ke login dengan membawa banner sukses
      localStorage.setItem('gwasena_intro_completed', 'true');
      navigate('/login', {
        state: { registered: true, username: cleanUsername },
        replace: true,
      });
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="w-full max-w-md animate-fade-in py-4">
      <div className="rounded-2xl border border-border-strong bg-surface/90 p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        {/* Header Form */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Daftar Akun Peneliti
          </h1>
          <p className="mt-1 text-xs text-text-secondary">
            Bergabunglah dengan platform analisis asosiasi genomik terpadu GWASena
          </p>
        </div>

        {/* Kotak Galat Pesan */}
        <ErrorMessageArea error={error} onDismiss={() => setError(null)} className="mb-4" />

        {/* Form Registrasi */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Kolom Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
            >
              Username
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
                minLength={3}
                maxLength={50}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="peneliti_ipb"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
              />
            </div>
            <span className="mt-1 block text-[10px] text-text-muted">
              3–50 karakter (huruf, angka, _, ., -)
            </span>
          </div>

          {/* Kolom Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
            >
              Alamat Email
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <Mail className="h-4 w-4" />
              </span>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={120}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="peneliti@apps.ipb.ac.id"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
              />
            </div>
          </div>

          {/* Kolom Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
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
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2 pl-9 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
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

          {/* Kolom Konfirmasi Password */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-xs font-semibold uppercase tracking-wider text-text-secondary mb-1"
            >
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-text-muted">
                <Lock className="h-4 w-4" />
              </span>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                style={{ color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface-elevated)' }}
                className="w-full rounded-xl border border-border-strong bg-surface-elevated py-2 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan transition-colors"
              />
            </div>
          </div>

          {/* Tombol Submit Registrasi */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary py-3 text-sm font-bold text-white shadow-md hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Mendaftarkan akun...</span>
              </>
            ) : (
              <>
                <span>Daftar Akun Peneliti</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>

          {/* Opsi Akses Demo Instan */}
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
              navigate('/login');
            }}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-accent-cyan/40 bg-accent-cyan/10 py-2.5 text-xs font-bold text-accent-cyan hover:bg-accent-cyan/20 transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Gunakan Akun Peneliti Demo di Layar Masuk &rarr;</span>
          </button>
        </form>

        {/* Footer Kartu Form */}
        <div className="mt-5 border-t border-border-subtle pt-3.5 text-center">
          <p className="text-xs text-text-secondary">
            Sudah memiliki akun?{' '}
            <Link
              to="/login"
              className="font-semibold text-accent-cyan hover:underline transition-colors"
            >
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
