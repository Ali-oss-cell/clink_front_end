/**
 * Patient Setup Wizard host page.
 *
 * Composes:
 *  - `useSetupDraft`  -> canonical server state + step helpers
 *  - `SetupWizardChrome` -> progress + title + actions shell
 *  - One step component per `SetupStepId`
 *
 * The page is intentionally thin: each step owns its own local form state.
 * The page wires saving/advance/draft into the shared hook so every wizard
 * phase behaves the same way.
 */

import { useCallback, useEffect, useMemo, useState, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSetupDraft } from '../../../hooks/useSetupDraft';
import SetupWizardChrome from '../../../components/patient/SetupWizardChrome/SetupWizardChrome';
import type { SetupStepId } from '../../../services/api/patientSetup';
import type { SetupStepComponentProps } from './steps/setupStepTypes';
import WelcomeStep from './steps/WelcomeStep';
import ContactStep from './steps/ContactStep';
import PrivacyTelehealthStep from './steps/PrivacyTelehealthStep';
import BillingPathStep from './steps/BillingPathStep';
import ReferralStep from './steps/ReferralStep';
import IntakeMinStep from './steps/IntakeMinStep';
import IntakeFullStep from './steps/IntakeFullStep';
import ReviewStep from './steps/ReviewStep';

const STEP_SUBTITLES: Record<SetupStepId, string> = {
  welcome: "Here's what we'll cover and how long it takes.",
  contact: 'A safe contact in case we ever need to check in.',
  privacy_telehealth:
    'A quick acknowledgement so telehealth sessions are safe and legal.',
  billing_path:
    'Pick how you want to pay — Medicare requires a GP referral.',
  referral: 'Upload your Mental Health Treatment Plan (MHTP).',
  intake_min:
    'A short summary so your psychologist can prepare for your first session.',
  intake_full:
    'Optional — a bit of clinical history if you want to share now.',
  review: 'One last look before we unlock booking.',
};

const STEP_TITLES: Record<SetupStepId, string> = {
  welcome: "Welcome aboard",
  contact: 'Contact details',
  privacy_telehealth: 'Privacy & telehealth',
  billing_path: 'How you want to pay',
  referral: 'Upload your GP referral',
  intake_min: 'About you',
  intake_full: 'Your health history',
  review: 'Review & finish',
};

const PatientSetupPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    state,
    loading,
    saving,
    completing,
    error,
    refresh,
    saveStep,
    saveDraft,
    complete,
  } = useSetupDraft();

  const [activeStep, setActiveStep] = useState<SetupStepId | null>(null);

  useEffect(() => {
    if (!state) return;
    const fromQuery = searchParams.get('step') as SetupStepId | null;
    const resume = (fromQuery || state.current_step) as SetupStepId;
    setActiveStep(resume);
  }, [state, searchParams]);

  useEffect(() => {
    if (state?.completed_at) {
      navigate('/patient/dashboard', { replace: true });
    }
  }, [state?.completed_at, navigate]);

  const setStep = useCallback(
    (step: SetupStepId) => {
      setActiveStep(step);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('step', step);
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const stepProps = useMemo<SetupStepComponentProps | null>(() => {
    if (!state || !activeStep) return null;
    return {
      state,
      saving,
      error,
      onAdvance: async (payload) => {
        const next = await saveStep(activeStep, payload, { advance: true });
        const moved = next.current_step;
        if (moved && moved !== activeStep) {
          setStep(moved);
        }
      },
      onDraft: async (payload) => {
        try {
          await saveDraft(activeStep, payload);
        } catch {
          // swallow: draft save errors surface via hook.error but shouldn't
          // block the user from continuing to type.
        }
      },
      onBack: () => {
        if (!state) return;
        const idx = state.steps.findIndex((s) => s.id === activeStep);
        if (idx > 0) {
          setStep(state.steps[idx - 1].id);
        }
      },
    };
  }, [state, activeStep, saving, error, saveStep, saveDraft, setStep]);

  if (loading || !state || !activeStep) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>Loading your setup…</p>
      </div>
    );
  }

  const currentMeta = state.steps.find((s) => s.id === activeStep);
  const title = STEP_TITLES[activeStep] || currentMeta?.title || 'Setup';
  const subtitle = STEP_SUBTITLES[activeStep];
  const idx = state.steps.findIndex((s) => s.id === activeStep);
  const canBack = idx > 0;

  const goBack = () => {
    if (canBack) {
      setStep(state.steps[idx - 1].id);
    }
  };

  const saveAndExit = async () => {
    if (!activeStep || !stepProps) return;
    await refresh();
    navigate('/patient/dashboard');
  };

  const renderStep = () => {
    if (!stepProps) return null;
    switch (activeStep) {
      case 'welcome':
        return <WelcomeStep {...stepProps} />;
      case 'contact':
        return <ContactStep {...stepProps} />;
      case 'privacy_telehealth':
        return <PrivacyTelehealthStep {...stepProps} />;
      case 'billing_path':
        return <BillingPathStep {...stepProps} />;
      case 'referral':
        return <ReferralStep {...stepProps} />;
      case 'intake_min':
        return <IntakeMinStep {...stepProps} />;
      case 'intake_full':
        return <IntakeFullStep {...stepProps} />;
      case 'review':
        return (
          <ReviewStep
            {...stepProps}
            completing={completing}
            onComplete={async () => {
              try {
                const res = await complete();
                if (res.completed) {
                  navigate('/patient/dashboard', { replace: true });
                }
              } catch {
                // surfaced via hook.error
              }
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        padding: '1.5rem 0 4rem',
        background: 'var(--cs-surface, #f7faf9)',
      }}
    >
      <SetupWizardChrome
        steps={state.steps}
        currentStepId={activeStep}
        title={title}
        subtitle={subtitle}
        banner={
          <span>
            We save your progress automatically — feel free to close the tab
            and come back. <strong>You can finish this in about 5 minutes.</strong>
          </span>
        }
        actions={
          <>
            {canBack && (
              <button
                type="button"
                className="patient-cta-secondary"
                onClick={goBack}
                disabled={saving || completing}
              >
                Back
              </button>
            )}
            <button
              type="button"
              className="patient-cta-secondary"
              onClick={() => void saveAndExit()}
              disabled={saving || completing}
            >
              Save &amp; exit
            </button>
          </>
        }
      >
        {renderStep()}
      </SetupWizardChrome>
    </main>
  );
};

export default PatientSetupPage;
