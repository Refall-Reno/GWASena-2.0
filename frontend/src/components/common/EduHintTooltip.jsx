import { useState, useRef, useEffect } from 'react';
import { HelpCircle, Info, X } from 'lucide-react';
import { EDU_HINTS } from '../../constants/eduHints.js';

/**
 * EduHintTooltip - Popover Penjelasan Ilmiah [EDU-HINT]
 * Acuan: docs/gwasena-v2/DESIGN.md Bagian 8A
 */
export default function EduHintTooltip({ hintKey, title, content, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const hintData = hintKey ? EDU_HINTS[hintKey] : null;
  const displayTitle = title || hintData?.label || 'Penjelasan Ilmiah';
  const displayContent = content || hintData?.hint || '';

  // Tutup tooltip saat klik di luar
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!displayContent) return null;

  return (
    <div ref={containerRef} className={`relative inline-flex items-center ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center rounded-full p-1 text-text-muted hover:bg-surface-elevated hover:text-accent-cyan focus:outline-none focus:ring-2 focus:ring-accent-cyan/50 transition-colors"
        aria-label={`Informasi edukatif tentang ${displayTitle}`}
        aria-expanded={isOpen}
      >
        <HelpCircle className="h-4 w-4" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute left-1/2 bottom-full z-50 mb-2 w-72 sm:w-80 -translate-x-1/2 rounded-xl border border-border-strong bg-surface p-3.5 shadow-2xl backdrop-blur-md animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 border-b border-border-subtle pb-2">
            <div className="flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-accent-cyan/15 text-accent-cyan text-xs">
                <Info className="h-3.5 w-3.5" />
              </span>
              <span className="text-xs font-bold text-accent-cyan tracking-wide uppercase">
                EDU-HINT
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-0.5 text-text-muted hover:bg-surface-elevated hover:text-text-primary"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Title & Body */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-text-primary">{displayTitle}</p>
            <p className="mt-1 text-xs leading-relaxed text-text-secondary">
              {displayContent}
            </p>
          </div>

          {/* Arrow */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-surface" />
        </div>
      )}
    </div>
  );
}
