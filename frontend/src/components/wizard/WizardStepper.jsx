import { Check, Lock } from 'lucide-react';
import { WIZARD_STEPS } from '../../constants/defaultParams.js';

/**
 * WizardStepper - Indikator Progres 6 Langkah GWASena
 * Acuan: docs/gwasena-v2/WIREFRAME.md & USER_FLOW.md
 * Mematuhi aturan penguncian saat komputasi (BR-05) dan navigasi bebas pasca-selesai (DEC-07).
 */
export default function WizardStepper({ activeStep, onStepClick, status }) {
  const isLockedDuringCompute = status === 'antre' || status === 'berjalan';
  const isFinished = status === 'selesai';
  const isTervalidasi = status === 'tervalidasi';

  // Tentukan apakah sebuah langkah dapat diklik
  const isStepClickable = (stepNum) => {
    if (isLockedDuringCompute) return false;
    if (isFinished) {
      // Saat selesai, langkah 4, 5, 6 dapat diklik bebas
      return stepNum >= 4 || stepNum === 1 || stepNum === 2;
    }
    if (isTervalidasi) {
      return stepNum === 1 || stepNum === 2;
    }
    return stepNum === 1;
  };

  return (
    <div className="w-full">
      {/* ── Tampilan Mobile (< 768px): Indikator Ringkas ── */}
      <div className="md:hidden rounded-2xl border border-border-subtle bg-surface p-4 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-accent-cyan">
            Langkah {activeStep} dari 6
          </span>
          <span className="text-text-muted font-medium">
            {WIZARD_STEPS[activeStep - 1]?.label}
          </span>
        </div>
        <div className="h-2 w-full rounded-full bg-surface-elevated overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-cyan transition-all duration-300"
            style={{ width: `${(activeStep / 6) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Tampilan Desktop (>= 768px): Stepper Horizontal ── */}
      <ol
        className="hidden md:flex items-center justify-between w-full rounded-2xl border border-border-subtle bg-surface/90 p-3 shadow-sm backdrop-blur-md"
        aria-label="Tahapan Analisis GWAS"
      >
        {WIZARD_STEPS.map((s, idx) => {
          const stepNum = s.step;
          const isActive = activeStep === stepNum;
          const isCompleted = stepNum < activeStep || (isFinished && stepNum <= 3);
          const clickable = isStepClickable(stepNum);

          return (
            <li key={s.id} className="flex-1 flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onStepClick?.(stepNum)}
                className={`group flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs transition-all w-full text-left ${
                  isActive
                    ? 'bg-accent-primary/10 text-text-primary font-bold shadow-sm'
                    : clickable
                    ? 'hover:bg-surface-elevated text-text-secondary cursor-pointer'
                    : 'opacity-40 cursor-not-allowed text-text-muted'
                }`}
              >
                {/* Lingkaran Angka / Icon */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-accent-primary text-white shadow-md shadow-accent-primary/30 ring-2 ring-accent-cyan/40'
                      : isCompleted
                      ? 'bg-status-success/20 text-status-success border border-status-success/40'
                      : isLockedDuringCompute
                      ? 'bg-surface-elevated text-text-muted border border-border-subtle'
                      : 'bg-surface-elevated text-text-secondary border border-border-subtle group-hover:border-text-secondary'
                  }`}
                >
                  {isCompleted && !isActive ? (
                    <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                  ) : isLockedDuringCompute && stepNum !== activeStep ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>

                {/* Label Step */}
                <div className="flex flex-col min-w-0">
                  <span
                    className={`truncate text-xs ${
                      isActive
                        ? 'text-accent-cyan font-bold'
                        : isCompleted
                        ? 'text-text-primary font-medium'
                        : 'text-text-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              </button>

              {/* Garis Penghubung antar Step */}
              {idx < WIZARD_STEPS.length - 1 && (
                <div
                  className={`h-0.5 w-4 shrink-0 mx-1 rounded-full ${
                    stepNum < activeStep ? 'bg-status-success/50' : 'bg-border-subtle'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
