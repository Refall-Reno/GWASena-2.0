import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  History,
  Sun,
  Moon,
  LogOut,
  User,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Menu,
  X,
} from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { useThemeStore } from '../store/useThemeStore.js';
import { analysisService } from '../services/analysisService.js';

/**
 * AppLayout - Layout Aplikasi Terproteksi (S-03 s.d. S-10)
 * Acuan: docs/gwasena-v2/WIREFRAME.md Bagian 1 & DESIGN.md
 */
export default function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const [health, setHealth] = useState(null);
  const [isHealthOpen, setIsHealthOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Periksa status kesehatan sistem saat mount
  useEffect(() => {
    let isMounted = true;
    async function fetchHealth() {
      try {
        const data = await analysisService.checkHealth();
        if (isMounted) setHealth(data);
      } catch {
        if (isMounted) setHealth({ status: 'disconnected', components: {} });
      }
    }
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000); // Polling setiap 30 detik
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHealthy = health?.status === 'ok';
  const isDegraded = health?.status === 'degraded';

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col">
      {/* ── App Topbar / Header ── */}
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-surface-glass backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
          {/* Sisi Kiri: Logo & Navigasi Utama */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="focus:outline-none">
              <BrandLogo size="md" />
            </Link>

            <nav className="hidden md:flex items-center gap-1.5" aria-label="Navigasi Utama">
              <NavLink
                to="/dashboard"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary dark:text-accent-cyan font-semibold'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  }`
                }
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </NavLink>

              <NavLink
                to="/history"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-accent-primary/10 text-accent-primary dark:text-accent-cyan font-semibold'
                      : 'text-text-secondary hover:bg-surface-elevated hover:text-text-primary'
                  }`
                }
              >
                <History className="h-4 w-4" />
                Riwayat Analisis
              </NavLink>
            </nav>
          </div>

          {/* Sisi Kanan: Health Indicator, Theme Toggle, & User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {/* Status Koneksi Sistem */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHealthOpen(!isHealthOpen)}
                className="flex items-center gap-2 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs text-text-secondary hover:bg-surface-elevated transition-colors"
                title="Status Koneksi Sistem"
              >
                <span className="relative flex h-2 w-2">
                  <span
                    className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping ${
                      isHealthy ? 'bg-status-success' : isDegraded ? 'bg-status-warning' : 'bg-status-error'
                    }`}
                  />
                  <span
                    className={`relative inline-flex h-2 w-2 rounded-full ${
                      isHealthy ? 'bg-status-success' : isDegraded ? 'bg-status-warning' : 'bg-status-error'
                    }`}
                  />
                </span>
                <span className="hidden lg:inline text-xs font-medium">
                  {isHealthy ? 'Sistem Siap' : isDegraded ? 'Terdegradasi' : 'Offline'}
                </span>
                <Activity className="h-3.5 w-3.5 text-text-muted" />
              </button>

              {/* Popover Detail Kesehatan Sistem */}
              {isHealthOpen && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-border-strong bg-surface p-3.5 shadow-xl z-50 animate-fade-in text-xs">
                  <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-2 font-semibold">
                    <span>Status Komponen Backend</span>
                    <button
                      type="button"
                      onClick={() => setIsHealthOpen(false)}
                      className="text-text-muted hover:text-text-primary"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">API (FastAPI)</span>
                      <span className="flex items-center gap-1 text-status-success font-medium">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Terhubung
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Basis Data (PostgreSQL)</span>
                      {health?.components?.database?.ok ? (
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Siap
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-status-error font-medium">
                          <XCircle className="h-3.5 w-3.5" /> Galat
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary">Antrean (Redis & Worker)</span>
                      {health?.components?.redis?.ok ? (
                        <span className="flex items-center gap-1 text-status-success font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Aktif
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-status-warning font-medium">
                          <AlertTriangle className="h-3.5 w-3.5" /> Standby
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-border-subtle bg-surface p-2 text-text-secondary hover:bg-surface-elevated hover:text-text-primary transition-colors"
              aria-label="Ubah Tema"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
            </button>

            {/* User Profile Pill & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-border-subtle">
              <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-1.5 border border-border-subtle">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary/20 text-accent-primary dark:text-accent-cyan text-xs font-bold">
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User className="h-3.5 w-3.5" />}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-semibold leading-tight text-text-primary">
                    {user?.username || 'Peneliti'}
                  </span>
                  <span className="text-[10px] text-text-muted capitalize leading-none">
                    {user?.role?.replace('_', ' ') || 'Pengguna'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-border-subtle bg-surface px-2.5 py-1.5 text-xs font-medium text-text-muted hover:bg-status-error/10 hover:text-status-error hover:border-status-error/30 transition-colors"
                title="Keluar dari Akun"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          </div>

          {/* Tombol Menu Mobile */}
          <div className="flex md:hidden items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg border border-border-subtle p-2 text-text-secondary"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-border-subtle p-2 text-text-primary"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Menu Navigasi Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border-subtle bg-surface p-4 space-y-3 animate-fade-in">
            <NavLink
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </NavLink>
            <NavLink
              to="/history"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 rounded-lg p-2 text-sm font-medium text-text-secondary hover:bg-surface-elevated hover:text-text-primary"
            >
              <History className="h-4 w-4" />
              Riwayat Analisis
            </NavLink>
            <div className="pt-2 border-t border-border-subtle flex items-center justify-between">
              <span className="text-xs text-text-muted font-medium">Akun: {user?.username}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg text-xs font-semibold text-status-error"
              >
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ── Main Application Body ── */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* ── App Footer ── */}
      <footer className="border-t border-border-subtle/50 bg-surface/50 py-4 text-center text-xs text-text-muted">
        GWASena v2.0 · Platform Genome-Wide Association Study Terpadu Bawang Putih (<em>Allium sativum</em> L.)
      </footer>
    </div>
  );
}
