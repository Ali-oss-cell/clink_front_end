/**
 * Patient Setup Wizard host page.
 *
 * Composes:
 *  - `useSetupDraft`  -> canonical server state + draft helpers
 *  - `SetupWizardChrome` -> progress + title + actions shell
 *  - One step component per `SetupStepId`
 */

import { useCallback, useEffect, useMemo, type FC } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layout } from '../../../components/common/Layout/Layout';
import { authService } from '../../../services/api/auth';
import { useSetupDraft } from '../../../hooks/useSetupDraft';
import SetupWizardChrome from '../../../components/patient/SetupWizardChrome/SetupWizardChrome';
import pageStyles from '../PatientPages.module.scss';
import type { PatientSetupState, SetupStepId } from '../../../services/api/patientSetup';
import type { SetupStepComponentProps } from './steps/setupStepTypes';
import WelcomeStep from './steps/WelcomeStep';
import ContactStep from './steps/ContactStep';
import PrivacyTelehealthStep from './steps/PrivacyTelehealthStep';
import BillingPathStep from './steps/BillingPathStep';
import ReferralStep from './steps/ReferralStep';
import IntakeMinStep from './steps/IntakeMinStep';
import IntakeFullStep from './steps/IntakeFullStep';
import ReviewStep from './steps/ReviewStep';
import SetupCompleteStatus from './SetupCompleteStatus';

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
  review: 'Review & finish',
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

/** Resolve active step synchronously — avoids an extra render where `activeStep` is null forever. */
function resolveActiveStep(
  state: PatientSetupState | null,
  searchParams: URLSearchParams,
): SetupStepId | null {
  if (!state?.steps?.length) return null;
  const ids = state.steps.map((s) => s.id);
  const serverCurrent =
    state.current_step && ids.includes(state.current_step)
      ? state.current_step
      : state.steps[0].id;

  const q = searchParams.get('step');
  let candidate = serverCurrent;
  if (q && ids.includes(q as SetupStepId)) {
    candidate = q as SetupStepId;
  }

  // Never open "Review" from ?step= until the server says that step is current
  // (prevents bookmark / manual URL skips ahead of incomplete required steps).
  if (candidate === 'review' && serverCurrent !== 'review') {
    return serverCurrent;
  }

  return candidate;
}

const PatientSetupPage: FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const user =
    authService.getStoredUser() || {
      id: 1,
      email: 'john@example.com',
      username: 'john.smith',
      first_name: 'John',
      last_name: 'Smith',
      full_name: 'John Smith',
      role: 'patient' as const,
      phone_number: '+61412345678',
      date_of_birth: '1990-01-15',
      age: 34,
      is_verified: true,
      created_at: '2024-01-01',
    };

  const layoutProps = {
    user,
    isAuthenticated: true as const,
    patientShell: true as const,
    className: pageStyles.patientLayout,
  };

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

  const activeStep = useMemo(() => {
    if (!state?.steps?.length) return null;
    if (state.completed_at) {
      const ids = state.steps.map((s) => s.id);
      if (ids.includes('review')) return 'review';
      return state.steps[state.steps.length - 1]!.id;
    }
    return resolveActiveStep(state, searchParams);
  }, [state, searchParams]);

  /** Sync `?step=` when the URL jumps to Review before requirements are met. */
  useEffect(() => {
    if (state?.completed_at) return;
    if (!state?.steps?.length || !state.current_step) return;
    const ids = state.steps.map((s) => s.id);
    const serverCurrent = ids.includes(state.current_step)
      ? state.current_step
      : state.steps[0].id;
    if (searchParams.get('step') === 'review' && serverCurrent !== 'review') {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('step', serverCurrent);
          return next;
        },
        { replace: true },
      );
    }
  }, [state?.current_step, state?.steps, searchParams, setSearchParams]);

  const setStep = useCallback(
    (step: SetupStepId) => {
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
          // Errors surface via hook.error; typing should not break.
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

  const errorPanel = (message: string) => (
    <main
      style={{
        minHeight: '100vh',
        padding: '3rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--cs-surface, #f7faf9)',
      }}
    >
      <div
        style={{
          maxWidth: '28rem',
          padding: '1.5rem',
          borderRadius: 'var(--cs-radius-xl, 12px)',
          background: 'var(--cs-surface-lowest, #fff)',
          border: '1px solid color-mix(in srgb, var(--cs-outline, #ccc) 40%, transparent)',
          boxShadow: 'var(--cs-shadow-atmospheric, 0 8px 24px rgba(0,0,0,.08))',
        }}
      >
        <h1 style={{ margin: '0 0 0.75rem', fontSize: '1.25rem' }}>
          Could not load setup
        </h1>
        <p
          style={{
            margin: '0 0 1rem',
            color: 'var(--cs-on-surface-variant, #444)',
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
        <button type="button" className="patient-cta-primary" onClick={() => void refresh()}>
          Try again
        </button>
      </div>
    </main>
  );

  if (loading) {
    return (
      <Layout {...layoutProps}>
        <div style={{ padding: '3rem', textAlign: 'center' }}>
          <p>Loading your setup…</p>
        </div>
      </Layout>
    );
  }

  if (!state) {
    return (
      <Layout {...layoutProps}>
        {errorPanel(
          error ??
            'Setup could not be loaded. Check your connection, ensure the app is updated, then try again.',
        )}
      </Layout>
    );
  }

  if (!activeStep) {
    return (
      <Layout {...layoutProps}>
        {errorPanel(
          error ??
            'The server returned an empty setup wizard. Try again or contact support if this continues.',
        )}
      </Layout>
    );
  }

  const currentMeta = state.steps.find((s) => s.id === activeStep);
  const title = state.completed_at
    ? 'Setup complete'
    : STEP_TITLES[activeStep] || currentMeta?.title || 'Setup';
  const subtitle = state.completed_at
    ? 'Your profile status and booking readiness'
    : STEP_SUBTITLES[activeStep];
  const idx = state.steps.findIndex((s) => s.id === activeStep);
  const canBack = !state.completed_at && idx > 0;

  const goBack = () => {
    if (canBack) {
      setStep(state.steps[idx - 1].id);
    }
  };

  const saveAndExit = async () => {
    await refresh();
    navigate('/patient/dashboard');
  };

  const renderStep = () => {
    if (state?.completed_at) {
      return <SetupCompleteStatus state={state} />;
    }
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
                await complete();
              } catch {
                // surfaced via hook.error
              }
            }}
          />
        );
      default:
        return (
          <p style={{ color: 'var(--cs-error, #b3261e)', lineHeight: 1.5 }}>
            This setup step isn&apos;t available in this version of the app. Refresh the page or remove
            <code style={{ margin: '0 0.25rem' }}>?step=…</code>
            from the address bar.
          </p>
        );
    }
  };

  const stepBody = renderStep();

  return (
    <Layout {...layoutProps}>
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
            state.completed_at ? (
              <span>
                Onboarding is complete. Review your details below, then head to your dashboard anytime.
              </span>
            ) : (
              <span>
                We save your progress automatically — feel free to close the tab and come back.{' '}
                <strong>You can finish this in about 5 minutes.</strong>
              </span>
            )
          }
          actions={
            state.completed_at ? (
              <button
                type="button"
                className="patient-cta-primary"
                onClick={() => navigate('/patient/dashboard')}
              >
                Go to dashboard
              </button>
            ) : (
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
            )
          }
        >
          {stepBody}
        </SetupWizardChrome>
      </main>
    </Layout>
  );
};

export default PatientSetupPage;
