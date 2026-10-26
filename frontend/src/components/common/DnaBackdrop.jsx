import { memo } from 'react';

/**
 * DnaBackdrop - Latar Belakang Atmosferik Heliks DNA Sesuai Desain Figma
 * Menggunakan grafis vektor DNA ambient kiri & kanan serta gradasi kosmik halus.
 */
function DnaBackdrop({ children, showDna = true, showVignette = true, className = '' }) {
  return (
    <div
      className={`relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#EAE6FD] via-[#EFF3FE] to-[#DCE8FD] dark:from-[#1E1346] dark:via-[#131A45] dark:to-[#0C132B] ${className}`}
    >
      {/* ── Background Glow & DNA Graphics (Only shown when showDna is true) ── */}
      {showDna && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden select-none"
        >
          {/* Ambient Glow Kiri Atas & Kanan Tengah */}
          <div className="absolute -left-[10%] -top-[10%] h-[35rem] w-[35rem] rounded-full bg-[#06B6D4]/10 dark:bg-accent-cyan/10 blur-[120px]" />
          <div className="absolute -right-[15%] top-[20%] h-[40rem] w-[40rem] rounded-full bg-[#5B4DFE]/10 dark:bg-accent-indigo/15 blur-[140px]" />

          {/* Vektor DNA Ambient Kiri (Figma Assets) */}
          <img
            src="/assets/figma/dna-ambient-left.png"
            alt=""
            className="absolute left-0 top-1/4 max-h-[75vh] w-auto object-contain opacity-25 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal drop-shadow-[0_0_20px_rgba(6,182,212,0.15)] motion-reduce:hidden"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />

          {/* Vektor DNA Ambient Kanan (Figma Assets) */}
          <img
            src="/assets/figma/dna-ambient-right.png"
            alt=""
            className="absolute right-0 top-10 max-h-[75vh] w-auto object-contain opacity-25 dark:opacity-30 mix-blend-multiply dark:mix-blend-normal drop-shadow-[0_0_20px_rgba(99,102,241,0.15)] motion-reduce:hidden"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />

          {/* Lapisan Vignette Radial untuk Memastikan Keterbacaan Kontras (WCAG AAA) */}
          {showVignette && (
            <div
              className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/50 pointer-events-none"
              style={{
                backgroundImage:
                  'radial-gradient(circle at center, transparent 35%, var(--bg-background) 90%)',
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
