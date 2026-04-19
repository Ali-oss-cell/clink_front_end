import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dashboardService } from '../../../services/api/dashboard';
import type { PatientDashboard } from '../../../services/api/dashboard';
import { authService, type PatientReferralStatusResponse } from '../../../services/api/auth';
import { TelehealthService, type TelehealthConsentResponse } from '../../../services/api/telehealth';
import { CheckCircleIcon, LightbulbIcon, MedicalFileIcon } from '../../../utils/icons';
import styles from './OnboardingProgress.module.scss';

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  actionText: string;
  actionUrl: string;
  priority: 'high' | 'medium' | 'low';
}

interface OnboardingProgressProps {
  user?: unknown;
  /** Dashboard: compact card grid aligned with Clinical Sanctuary reference */
  clinicalLayout?: boolean;
}

export const OnboardingProgress: React.FC<OnboardingProgressProps> = ({ clinicalLayout = false }) => {
  const [dashboardData, setDashboardData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [telehealthConsent, setTelehealthConsent] = useState<TelehealthConsentResponse | null>(null);
  const [telehealthLoading, setTelehealthLoading] = useState(true);
  const [referralStatus, setReferralStatus] = useState<PatientReferralStatusResponse | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await dashboardService.getPatientDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    const fetchTelehealthConsent = async () => {
      try {
        setTelehealthLoading(true);
        const consent = await TelehealthService.getConsent();
        setTelehealthConsent(consent);
      } catch (error) {
        console.warn('Failed to load telehealth consent:', error);
        setTelehealthConsent(null);
      } finally {
        setTelehealthLoading(false);
      }
    };

    fetchTelehealthConsent();
  }, []);

  useEffect(() => {
    const fetchReferralStatus = async () => {
      try {
        const referral = await authService.getReferralStatus();
        setReferralStatus(referral);
      } catch (error) {
        console.warn('Failed to load referral status:', error);
      }
    };

    fetchReferralStatus();
  }, []);

  // Main steps (counted in progress)
  const telehealthCompleted = Boolean(telehealthConsent?.consent_to_telehealth);
  
  // Check actual completion status from dashboard data
  const intakeCompleted = Boolean(dashboardData?.intake_completed);
  const hasAppointment = Boolean(dashboardData?.next_appointment) || (dashboardData?.total_sessions ?? 0) > 0;
  
  // Profile is considered complete if user has registered (they have dashboard data)
  // This means they've completed registration which includes basic profile info
  const profileCompleted = dashboardData !== null;

  const mainSteps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information and preferences',
      completed: profileCompleted,
      actionText: 'Go to My Account',
      actionUrl: '/patient/account',
      priority: 'high'
    },
    {
      id: 'intake',
      title: 'Fill Out Intake Form',
      description: 'Help us understand your needs and goals',
      completed: intakeCompleted,
      actionText: dashboardData?.intake_completed ? 'View Form' : 'Start Assessment',
      actionUrl: '/patient/intake-form',
      priority: 'high'
    },
    {
      id: 'telehealth-consent',
      title: 'Review Telehealth Consent',
      description: 'Provide emergency contact and confirm recording preferences for video sessions',
      completed: telehealthCompleted,
      actionText: telehealthCompleted ? 'Review Consent' : 'Complete Consent',
      actionUrl: '/patient/account?tab=privacy',
      priority: 'high'
    },
    {
      id: 'appointment',
      title: 'Book Your First Appointment',
      description: 'Schedule a session with your psychologist',
      completed: hasAppointment,
      actionText: hasAppointment ? 'View Appointments' : 'Schedule Session',
      actionUrl: hasAppointment ? '/patient/appointments' : '/appointments/book-appointment',
      priority: 'medium'
    }
  ];

  // Extra step (not counted in progress) - just a reminder
  const extraStep: OnboardingStep = {
    id: 'resources',
    title: 'Explore Resources',
    description: 'Access mental health tools and materials',
    completed: false, // Always show as available reminder
    actionText: 'View Resources',
    actionUrl: '/patient/resources',
    priority: 'low'
  };

  // Calculate progress based only on main steps
  const completedSteps = mainSteps.filter(step => step.completed).length;
  const totalSteps = mainSteps.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;
  
  // Combine main steps and extra step for display
  const allSteps = [...mainSteps, extraStep];
  const referralCode = referralStatus?.status ?? 'missing';

  if (loading || telehealthLoading) {
    return (
      <div className={clinicalLayout ? styles.clinical : styles.onboardingProgress}>
        <div className={clinicalLayout ? styles.clinicalHeader : styles.progressHeader}>
          <h3 className={clinicalLayout ? styles.clinicalTitle : styles.title}>
            {clinicalLayout ? 'Onboarding progress' : 'Getting Started'}
          </h3>
          {!clinicalLayout && (
            <>
              <div className={styles.progressBar}>
                <div className={styles.progressFill} style={{ width: '0%' }} />
              </div>
              <span className={styles.progressText}>Loading...</span>
            </>
          )}
          {clinicalLayout && <span className={styles.clinicalMeta}>…</span>}
        </div>
      </div>
    );
  }

  const referralVerified = referralCode === 'verified';
  const referralPendingReview = referralCode === 'uploaded_pending_review';

  if (clinicalLayout) {
    return (
      <section className={styles.clinical} aria-label="Onboarding progress">
        <div className={styles.clinicalHeader}>
          <h3 className={styles.clinicalTitle}>Onboarding progress</h3>
          <span className={styles.clinicalMeta}>
            {completedSteps} of {totalSteps}
          </span>
        </div>
        <div className={styles.clinicalGrid}>
          {mainSteps.map((step) => (
            <div
              key={step.id}
              className={`${styles.clinicalCard} ${step.completed ? styles.clinicalCardDone : styles.clinicalCardPending}`}
            >
              <div className={styles.clinicalCardTop}>
                <div
                  className={
                    step.completed ? styles.clinicalIconDone : styles.clinicalIconPending
                  }
                >
                  {step.completed ? <CheckCircleIcon size="sm" /> : null}
                </div>
                <div className={styles.clinicalCardText}>
                  <p className={styles.clinicalCardTitle}>{step.title}</p>
                  <p className={styles.clinicalCardStatus}>{step.completed ? 'Done' : 'Pending'}</p>
                </div>
              </div>
              <Link to={step.actionUrl} className={styles.clinicalLink}>
                {step.actionText}
              </Link>
            </div>
          ))}
        </div>

        {/* Semi-step: Medicare referral (not counted in main 4 — keeps header clean) */}
        <div
          className={`${styles.clinicalReferralSemi} ${
            referralVerified
              ? styles.clinicalReferralSemiOk
              : referralPendingReview
                ? styles.clinicalReferralSemiWarn
                : styles.clinicalReferralSemiAttention
          }`}
        >
          <div className={styles.clinicalReferralSemiIcon} aria-hidden>
            <MedicalFileIcon size="md" />
          </div>
          <div className={styles.clinicalReferralSemiCopy}>
            <p className={styles.clinicalReferralSemiKicker}>Medicare · semi-step</p>
            <p className={styles.clinicalReferralSemiTitle}>
              {referralVerified ? 'GP referral / MHTP verified' : 'GP referral / MHTP'}
            </p>
            <p className={styles.clinicalReferralSemiDesc}>
              {referralVerified
                ? 'You can book with Medicare claiming when you are ready.'
                : referralPendingReview
                  ? 'Your upload is with the team for review.'
                  : 'Add a referral in the booking wizard if you plan to claim Medicare.'}
            </p>
          </div>
          <div className={styles.clinicalReferralSemiActions}>
            <Link
              to={
                referralVerified
                  ? '/appointments/book-appointment?billing_path=medicare'
                  : '/appointments/book-appointment?billing_path=medicare&focus=referral'
              }
              className={styles.clinicalReferralSemiPrimary}
            >
              {referralVerified ? 'Book with Medicare' : 'Upload in booking wizard'}
            </Link>
            <Link
              to="/patient/intake-form?step=3&focus=gp_referral"
              className={styles.clinicalReferralSemiSecondary}
            >
              Intake referral details
            </Link>
            <Link to="/appointments/book-appointment?billing_path=private" className={styles.clinicalReferralSemiQuiet}>
              Book as private
            </Link>
          </div>
        </div>
        <div className={styles.clinicalExtra}>
          <div className={styles.clinicalExtraIcon}>
            <LightbulbIcon size="sm" />
          </div>
          <div className={styles.clinicalExtraBody}>
            <p className={styles.clinicalExtraTitle}>
              {extraStep.title}
              <span className={styles.clinicalOptional}> (optional)</span>
            </p>
            <p className={styles.clinicalExtraDesc}>{extraStep.description}</p>
          </div>
          <Link to={extraStep.actionUrl} className={styles.clinicalLink}>
            {extraStep.actionText}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className={styles.onboardingProgress}>
      <div className={styles.progressHeader}>
        <h3 className={styles.title}>Getting Started</h3>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <span className={styles.progressText}>
          {completedSteps} of {totalSteps} steps completed
        </span>
      </div>

      <div className={styles.stepsList}>
        {allSteps.map((step, index) => {
          const isMainStep = index < mainSteps.length;
          const isExtraStep = step.id === 'resources';
          
          return (
            <div 
              key={step.id} 
              className={`${styles.stepItem} ${step.completed ? styles.completed : ''} ${isExtraStep ? styles.extraStep : ''}`}
            >
              <div className={styles.stepNumber}>
                {step.completed ? (
                  <CheckCircleIcon size="sm" />
                ) : isExtraStep ? (
                  <LightbulbIcon size="sm" />
                ) : (
                  index + 1
                )}
              </div>
              <div className={styles.stepContent}>
                <h4 className={styles.stepTitle}>
                  {step.title}
                  {isExtraStep && <span className={styles.extraLabel}> (Optional)</span>}
                </h4>
                <p className={styles.stepDescription}>{step.description}</p>
              </div>
              <Link 
                to={step.actionUrl} 
                className={`${styles.stepAction} ${step.completed ? styles.completedAction : ''}`}
              >
                {step.actionText}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
