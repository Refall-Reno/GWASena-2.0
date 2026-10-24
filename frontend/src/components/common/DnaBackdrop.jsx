import { memo } from 'react';

/**
 * DnaBackdrop - Latar Belakang Atmosferik Heliks DNA Ringan
 * Menggunakan SVG dan CSS Glow yang halus tanpa beban video MP4 berat.
 * Menyesuaikan kontras pada Dark & Light mode serta prefers-reduced-motion.
 */
function DnaBackdrop({ children, showDna = true, showVignette = true, className = '' }) {
  return (
    <div className={`relative min-h-screen w-full overflow-hidden bg-background ${className}`}>
      {/* ── Background Glow & DNA Graphics (Only shown when showDna is true) ── */}
      {showDna && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
        >
          {/* Glow lingkaran Cyan bioluminesensi kiri atas */}
          <div className="absolute -left-[10%] -top-[10%] h-[35rem] w-[35rem] rounded-full bg-accent-cyan/15 blur-[120px] dark:bg-accent-cyan/10" />

          {/* Glow lingkaran Deep Blue / Indigo kanan tengah */}
          <div className="absolute -right-[15%] top-[25%] h-[40rem] w-[40rem] rounded-full bg-accent-primary/15 blur-[140px] dark:bg-accent-indigo/15" />

          {/* Glow aksen bawah */}
          <div className="absolute left-[30%] -bottom-[15%] h-[30rem] w-[30rem] rounded-full bg-accent-cyan/10 blur-[130px]" />

          {/* ── Pola Garis Kisi & Heliks DNA Vektor SVG ── */}
          <svg
            className="absolute inset-0 h-full w-full opacity-35 dark:opacity-20 motion-reduce:hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            viewBox="0 0 1000 1000"
          >
            <defs>
              <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284C7" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#6366F1" stopOpacity="0.1" />
              </linearGradient>
              <linearGradient id="dnaGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#6366F1" stopOpacity="0.8" />
                <stop offset="50%" stopColor="#0284C7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.1" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Untai Kurva DNA 1 */}
            <path
              d="M -100 200 Q 200 450, 500 250 T 1100 350"
              fill="none"
              stroke="url(#dnaGrad1)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              filter="url(#glow)"
            />

            {/* Untai Kurva DNA 2 (Pasangan Komplementer) */}
            <path
              d="M -100 400 Q 200 150, 500 350 T 1100 250"
              fill="none"
              stroke="url(#dnaGrad2)"
              strokeWidth="2.5"
              strokeDasharray="8 6"
              filter="url(#glow)"
            />

            {/* Untai Kurva DNA Bawah */}
            <path
              d="M -50 800 Q 300 600, 650 850 T 1150 700"
              fill="none"
              stroke="url(#dnaGrad1)"
              strokeWidth="2"
              strokeDasharray="6 4"
              opacity="0.6"
            />

            {/* Titik Simpul Nukleotida Bercahaya */}
            <circle cx="200" cy="450" r="4.5" fill="#06B6D4" className="animate-pulse" />
            <circle cx="500" cy="250" r="5" fill="#38BDF8" className="animate-pulse" />
            <circle cx="800" cy="300" r="4" fill="#6366F1" className="animate-pulse" />
            <circle cx="350" cy="280" r="3.5" fill="#10B981" />
            <circle cx="650" cy="850" r="4.5" fill="#06B6D4" className="animate-pulse" />
          </svg>

          {/* Lapisan Vignette Radial untuk Memastikan Keterbacaan Kontras (WCAG AAA) */}
          {showVignette && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/80 dark:from-[#070B14] dark:via-[#070B14]/60 dark:to-[#070B14]/85"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, transparent 20%, var(--bg-background) 80%)',
              }}
            />
          )}
        </div>
      )}

      {/* Konten Halaman */}
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}

export default memo(DnaBackdrop);
