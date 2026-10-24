import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { analysisService } from '../services/analysisService.js';
import { useAnalysisStore } from '../store/useAnalysisStore.js';
import { ANALYSIS_STATUSES } from '../constants/defaultParams.js';
import WizardStepper from '../components/wizard/WizardStepper.jsx';
import Step1Upload from '../components/wizard/Step1Upload.jsx';
import Step2Config from '../components/wizard/Step2Config.jsx';
import Step3Computation from '../components/wizard/Step3Computation.jsx';
import Step4Results from '../components/wizard/Step4Results.jsx';
import Step5Annotation from '../components/wizard/Step5Annotation.jsx';
import Step6Export from '../components/wizard/Step6Export.jsx';
import AccessDeniedState from '../components/common/AccessDeniedState.jsx';
import ErrorMessageArea from '../components/common/ErrorMessageArea.jsx';

/**
 * AnalysisWizardPage - Kontainer Orkestrasi Sesi Analisis GWAS (S-04 s.d. S-09)
 * Acuan: docs/gwasena-v2/USER_FLOW.md & WIREFRAME.md
 */
export default function AnalysisWizardPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    activeStep,
    setActiveStep,
    currentAnalysis,
    setCurrentAnalysis,
    uploadSummary,
    setUploadSummary,
    isSimulated,
  } = useAnalysisStore();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  async function loadAnalysis() {
    setIsLoading(true);
    setError(null);
    setIsAccessDenied(false);

    try {
      const data = await analysisService.getAnalysisDetail(id);
      setCurrentAnalysis(data);
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
    if (id) {
      loadAnalysis();
    }
  }, [id]);

  if (isAccessDenied) {
    return <AccessDeniedState analysisId={id} />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-accent-cyan mb-2" />
        <p className="text-xs text-text-muted">Memuat sesi analisis #{id}...</p>
      </div>
    );
  }

  const statusKey = currentAnalysis?.status?.toLowerCase() || 'draft';
  const statusConfig = ANALYSIS_STATUSES[statusKey] || ANALYSIS_STATUSES.draft;
  const availableTraits =
    uploadSummary?.fenotipe?.sifat_tersedia || currentAnalysis?.sifat_tersedia || [];

  return (
    <div className="space-y-6 pb-16 animate-fade-in">
      {/* ── Top Session Bar ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Dashboard</span>
            </Link>
            <span className="text-text-muted">/</span>
            <span className="font-mono text-xs text-accent-cyan font-semibold">Sesi #{id}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-text-primary">
              {currentAnalysis?.analysis_name || `Analisis GWAS #${id}`}
            </h1>

            {/* Badge Status */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold ${statusConfig.badgeClass}`}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: statusConfig.color }}
              />
              {statusConfig.label}
            </span>

            {/* Simulation Badge if active */}
            {isSimulated && (
              <span className="rounded-full bg-status-warning/20 border border-status-warning/40 px-2.5 py-0.5 text-[11px] font-bold text-status-warning">
                Simulasi UI Aktif
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs italic text-text-muted">
            {currentAnalysis?.organism || 'Allium sativum L.'}
          </span>
        </div>
      </div>

      <ErrorMessageArea error={error} onDismiss={() => setError(null)} />

      {/* ── Wizard Stepper 6 Langkah ── */}
      <WizardStepper
        activeStep={activeStep}
        onStepClick={(stepNum) => setActiveStep(stepNum)}
        status={currentAnalysis?.status}
      />

      {/* ── Konten Langkah Aktif ── */}
      <div className="rounded-3xl border border-border-subtle bg-surface/80 p-6 sm:p-8 shadow-xl backdrop-blur-md">
        {activeStep === 1 && (
          <Step1Upload
            analysisId={id}
            onUploadSuccess={(res) => {
              setUploadSummary(res);
              loadAnalysis(); // Muat ulang data sesi dari backend
            }}
            onNext={() => setActiveStep(2)}
          />
        )}

        {activeStep === 2 && (
          <Step2Config
            analysisId={id}
            availableTraits={availableTraits}
            onPrev={() => setActiveStep(1)}
            onRunSuccess={() => {
              setActiveStep(3);
              loadAnalysis();
            }}
          />
        )}

        {activeStep === 3 && (
          <Step3Computation
            analysisId={id}
            onComplete={() => {
              setActiveStep(4);
              loadAnalysis();
            }}
          />
        )}

        {activeStep === 4 && (
          <Step4Results
            onNavigateStep={(stepNum) => setActiveStep(stepNum)}
          />
        )}

        {activeStep === 5 && (
          <Step5Annotation
            onNavigateStep={(stepNum) => setActiveStep(stepNum)}
          />
        )}

        {activeStep === 6 && (
          <Step6Export
            analysisId={id}
            onNavigateStep={(stepNum) => setActiveStep(stepNum)}
          />
        )}
      </div>
    </div>
  );
}
