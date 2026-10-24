import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, ArrowRight } from 'lucide-react';
import DnaBackdrop from '../components/common/DnaBackdrop.jsx';
import BrandLogo from '../components/common/BrandLogo.jsx';
import { useThemeStore } from '../store/useThemeStore.js';

/**
 * AuthLayout - Pembungkus Layar Publik (S-00, S-01, S-02)
 * Acuan: docs/gwasena-v2/FRONTEND_ARCHITECTURE.md & MOTION_SPEC.md Bagian 3
 * Mempertahankan DnaBackdrop persistent agar tidak unmount/reload antar halaman auth
 */
export default function AuthLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const isIntroPage = location.pathname === '/welcome' || location.pathname === '/';

  const handleSkipIntro = () => {
    localStorage.setItem('gwasena_intro_completed', 'true');
    navigate('/login');
  };

  return (
    <DnaBackdrop showDna={isIntroPage}>
      {/* ── Public Topbar ── */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border-subtle/40 bg-surface-glass px-4 py-3 sm:px-8 backdrop-blur-md">
        <BrandLogo size="md" />

        <div className="flex items-center gap-2.5">
          {/* Tombol Lewati Pengenalan (khusus saat di S-00) */}
          {isIntroPage && (
            <button
              type="button"
              onClick={handleSkipIntro}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-strong/70 bg-surface/50 px-3 py-1.5 text-xs font-semibold text-text-primary hover:bg-surface-elevated hover:text-accent-cyan transition-colors"
            >
              Lewati ke Masuk
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-border-subtle bg-surface/60 p-2 text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
            aria-label={`Ganti ke tema ${theme === 'dark' ? 'Terang' : 'Gelap'}`}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* ── Main Auth Content ── */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="z-10 border-t border-border-subtle/30 bg-surface/30 px-4 py-3 text-center text-xs text-text-muted backdrop-blur-sm">
        Platform GWAS · Program Studi Bioinformatika IPB University
      </footer>
    </DnaBackdrop>
  );
}
