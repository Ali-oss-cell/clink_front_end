import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { OnboardingProgress } from '../../components/patient/OnboardingProgress/OnboardingProgress';
import { dashboardService } from '../../services/api/dashboard';
import type { PatientDashboard } from '../../services/api/dashboard';
import { authService, type BookingReadinessResponse } from '../../services/api/auth';
import { videoCallService } from '../../services/api/videoCall';
import { appointmentsService } from '../../services/api/appointments';
import type { PatientAppointment, MedicareSessionInfoResponse } from '../../services/api/appointments';
import {
  VideoIcon,
  CalendarIcon,
  ChartIcon,
  ClipboardIcon,
  StarIcon,
  BookIcon,
  WarningIcon,
  DollarIcon,
  DoctorIcon,
} from '../../utils/icons';
import { Button } from '../../components/ui/button';
import pageStyles from './PatientPages.module.scss';
import d from './PatientDashboard.module.scss';
import shell from './PatientShellChrome.module.scss';
import { formatSessionDurationMinutes } from '../../utils/formatSessionDuration';

const RING_R = 58;
const RING_C = 2 * Math.PI * RING_R;

export const PatientDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<PatientDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCallAppointments, setVideoCallAppointments] = useState<PatientAppointment[]>([]);
  const [medicareInfo, setMedicareInfo] = useState<MedicareSessionInfoResponse | null>(null);
  const [bookingReadiness, setBookingReadiness] = useState<BookingReadinessResponse | null>(null);

  const user = authService.getStoredUser() || {
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

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getPatientDashboard();
        setDashboardData(data);
      } catch (err: unknown) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  useEffect(() => {
    const loadMedicareInfo = async () => {
      try {
        const info = await appointmentsService.getMedicareSessionInfo();
        setMedicareInfo(info);
      } catch {
        console.warn('Failed to load Medicare session info');
      }
    };

    loadMedicareInfo();
  }, []);

  useEffect(() => {
    const loadBookingReadiness = async () => {
      try {
        const readiness = await authService.getBookingReadiness({ billing_path: 'medicare' });
        setBookingReadiness(readiness);
      } catch {
        console.warn('Failed to load booking readiness');
        setBookingReadiness(null);
      }
    };
    loadBookingReadiness();
  }, []);

  useEffect(() => {
    const loadVideoCallAppointments = async () => {
      try {
        const response = await appointmentsService.getPatientAppointments({
          status: 'upcoming',
          page: 1,
          page_size: 10,
        });

        const eligible = response.results.filter(
          (apt: PatientAppointment) =>
            videoCallService.isVideoCallAvailable(apt) && videoCallService.canJoinNow(apt)
        );

        setVideoCallAppointments(eligible);
      } catch (err) {
        console.error('Failed to load video call appointments:', err);
        setVideoCallAppointments([]);
      }
    };

    loadVideoCallAppointments();
  }, []);

  const nextAppt = dashboardData?.next_appointment as PatientAppointment | undefined;
  const hasNextAppt = Boolean(nextAppt && Object.keys(nextAppt).length > 0);

  const medicareOffset = useMemo(() => {
    if (!medicareInfo?.max_sessions) return RING_C;
    const ratio = Math.min(1, medicareInfo.sessions_used / medicareInfo.max_sessions);
    return RING_C * (1 - ratio);
  }, [medicareInfo]);

  const layoutProps = {
    user,
    isAuthenticated: true as const,
    patientShell: true as const,
    className: pageStyles.patientLayout,
  };

  if (loading) {
    return (
      <Layout {...layoutProps}>
        <div className={d.loadingBox}>
          <div className={d.spinner} />
          <p>Loading your dashboard…</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout {...layoutProps}>
        <div className={d.errorBox}>
          <h2>
            <WarningIcon size="lg" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Error loading dashboard
          </h2>
          <p>{error}</p>
          <Button className={pageStyles.retryButton} onClick={() => window.location.reload()}>
            Try again
          </Button>
        </div>
      </Layout>
    );
  }

  const primaryVideo = videoCallAppointments[0];
  const referralCode = bookingReadiness?.referral_status ?? 'missing';
  const referralLabel =
    referralCode === 'uploaded_pending_review'
      ? 'Uploaded, pending review'
      : referralCode.charAt(0).toUpperCase() + referralCode.slice(1);
  const referralReady = referralCode === 'verified';

  return (
    <Layout {...layoutProps}>
      <div className={shell.wrap}>
        <header className={shell.pageHeader}>
          <h1 className={shell.welcomeTitle}>Welcome back, {user.first_name}.</h1>
          <p className={shell.welcomeSubtitle}>
            Your journey to well-being is our priority. Here is an overview of your care with us.
          </p>
        </header>

        <OnboardingProgress user={user} clinicalLayout />

        {bookingReadiness && !bookingReadiness.telehealth_consent_complete && (
          <div className={d.consentBanner}>
            <div>
              <h3>
                <WarningIcon size="sm" style={{ verticalAlign: 'middle' }} />
                Telehealth consent required
              </h3>
              <p>
                Complete the telehealth consent form and emergency plan before booking or joining video
                appointments.
              </p>
            </div>
            <button
              type="button"
              className={d.btnPrimary}
              onClick={() =>
                navigate(bookingReadiness?.actions.telehealth_consent ?? '/patient/account?tab=privacy')
              }
            >
              Go to privacy settings
            </button>
          </div>
        )}

        <div className={d.bento}>
          {/* Video hero */}
          <section className={`${d.card} ${d.videoHero} ${d.span8}`}>
            <span className={d.decoIcon} aria-hidden>
              <VideoIcon size="lg" />
            </span>
            <div className={d.rel}>
              {primaryVideo ? (
                <>
                  <div className={d.badgeLive}>
                    <span className={d.pulseDot} />
                    Upcoming session
                  </div>
                  <h2 className={d.cardHeading}>Session with {primaryVideo.psychologist?.name ?? 'your clinician'}</h2>
                  <p className={d.sessionMeta}>
                    <VideoIcon size="sm" />
                    {videoCallService.getTimeUntilAppointment(primaryVideo)} · {primaryVideo.formatted_time}
                  </p>
                  <div className={d.actions}>
                    <button
                      type="button"
                      className={d.btnPrimary}
                      onClick={() => navigate(`/video-session/${primaryVideo.id}`)}
                    >
                      Join now
                    </button>
                    <button type="button" className={d.btnGhost} onClick={() => navigate('/patient/resources')}>
                      Prepare materials
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className={d.badgeLive}>
                    <VideoIcon size="sm" style={{ opacity: 0.8 }} />
                    Video sessions
                  </div>
                  <h2 className={d.cardHeading}>No session to join right now</h2>
                  <p className={d.placeholder}>
                    When you have an upcoming telehealth visit in the join window, it will show here.
                  </p>
                  <div className={d.actions}>
                    <button type="button" className={d.btnPrimary} onClick={() => navigate('/patient/appointments')}>
                      View appointments
                    </button>
                    <button
                      type="button"
                      className={d.btnGhost}
                      onClick={() => navigate('/appointments/book-appointment')}
                    >
                      Book appointment
                    </button>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Medicare */}
          {medicareInfo && (
            <section className={`${d.card} ${d.medicareCard} ${d.span4}`}>
              <h3 className={d.medicareTitle}>Medicare usage {medicareInfo.current_year}</h3>
              <div className={d.ringWrap}>
                <svg className={d.ringSvg} viewBox="0 0 128 128" aria-hidden>
                  <circle className={d.ringBg} cx="64" cy="64" r={RING_R} />
                  <circle
                    className={d.ringFg}
                    cx="64"
                    cy="64"
                    r={RING_R}
                    strokeDasharray={RING_C}
                    strokeDashoffset={medicareOffset}
                  />
                </svg>
                <div className={d.ringLabel}>
                  <span className={d.ringNumbers}>
                    {medicareInfo.sessions_used}/{medicareInfo.max_sessions}
                  </span>
                  <span className={d.ringSub}>sessions</span>
                </div>
              </div>
              <div className={d.medicareNote}>
                {medicareInfo.sessions_remaining} session{medicareInfo.sessions_remaining !== 1 ? 's' : ''}{' '}
                remaining this year
              </div>
              {medicareInfo.sessions_remaining === 0 && (
                <div className={d.medicareWarn}>
                  <WarningIcon size="sm" />
                  <span>Medicare limit reached. You can still book private sessions.</span>
                </div>
              )}
              {medicareInfo.sessions_remaining > 0 && medicareInfo.sessions_remaining <= 2 && (
                <div className={d.medicareWarn}>
                  <WarningIcon size="sm" />
                  <span>Only a few Medicare sessions remain this year.</span>
                </div>
              )}
            </section>
          )}

          {/* Next appointment */}
          <section className={`${d.card} ${d.span4}`}>
            <h3 className={d.cardTitle}>Following session</h3>
            {hasNextAppt ? (
              <div className={d.nextBlock}>
                <div className={d.nextRow}>
                  <div className={d.nextIcon}>
                    <CalendarIcon size="sm" />
                  </div>
                  <div>
                    <p className={d.nextPrimary}>{nextAppt?.formatted_date ?? 'Scheduled'}</p>
                    <p className={d.nextSecondary}>
                      {nextAppt?.formatted_time}
                      {nextAppt?.duration_minutes != null
                        ? ` · ${formatSessionDurationMinutes(nextAppt.duration_minutes)}`
                        : ''}
                    </p>
                  </div>
                </div>
                <div className={d.nextRow}>
                  <div className={d.nextIcon}>
                    <DoctorIcon size="sm" />
                  </div>
                  <div>
                    <p className={d.nextPrimary}>{nextAppt?.psychologist?.name ?? 'Your clinician'}</p>
                    <p className={d.nextSecondary}>Clinical session</p>
                  </div>
                </div>
                {nextAppt?.id && videoCallService.canJoinNow(nextAppt) && (
                  <button
                    type="button"
                    className={d.btnPrimary}
                    onClick={() => navigate(`/video-session/${nextAppt.id}`)}
                  >
                    Join video session
                  </button>
                )}
                <button type="button" className={d.linkSubtle} onClick={() => navigate('/patient/appointments')}>
                  View all appointments
                </button>
              </div>
            ) : (
              <div>
                <p className={d.placeholder}>No upcoming appointment on file.</p>
                <button type="button" className={d.btnPrimary} onClick={() => navigate('/appointments/book-appointment')}>
                  Book new appointment
                </button>
              </div>
            )}
          </section>

          {/* Total sessions */}
          <section className={`${d.card} ${d.span4}`}>
            <div className={d.statBlock}>
              <div className={d.statIconBox}>
                <ChartIcon size="lg" />
              </div>
              <div>
                <p className={d.statBig}>{dashboardData?.total_sessions ?? 0}</p>
                <p className={d.cardTitle} style={{ margin: 0 }}>
                  Total sessions completed
                </p>
              </div>
            </div>
          </section>

          {/* Invoices */}
          <section className={`${d.card} ${d.span4}`}>
            <div className={d.invoiceRow}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={d.invoiceIcon}>
                  <DollarIcon size="md" />
                </div>
                <div>
                  <p className={d.nextPrimary}>{dashboardData?.outstanding_invoices ?? 0} outstanding invoice(s)</p>
                  <p className={d.nextSecondary}>Review and pay from your invoices page</p>
                </div>
              </div>
              <button
                type="button"
                className={d.btnGhost}
                aria-label="Go to invoices"
                onClick={() => navigate('/patient/invoices')}
              >
                →
              </button>
            </div>
          </section>

          {/* Intake */}
          <section className={`${d.card} ${d.span4}`}>
            <h3 className={d.cardTitle}>Intake</h3>
            {dashboardData?.intake_completed ? (
              <div>
                <p className={d.intakeDone}>Completed</p>
                <p className={d.intakeSub}>Your intake form is on file.</p>
              </div>
            ) : (
              <div>
                <p className={d.placeholder}>Complete your intake so we can tailor your care.</p>
                <button
                  type="button"
                  className={d.btnPrimary}
                  onClick={() => navigate(bookingReadiness?.actions.intake_form ?? '/patient/intake-form')}
                >
                  Continue intake
                </button>
              </div>
            )}
          </section>

          {/* Medicare referral */}
          <section className={`${d.card} ${d.span4}`}>
            <h3 className={d.cardTitle}>Referral for Medicare</h3>
            <div className={d.referralStatusRow}>
              <span
                className={`${d.referralBadge} ${
                  referralReady
                    ? d.referralVerified
                    : referralCode === 'uploaded_pending_review'
                      ? d.referralPending
                      : d.referralMissing
                }`}
              >
                {referralLabel}
              </span>
              {bookingReadiness?.has_uploaded_referral && (
                <span className={d.referralMeta}>A referral document is on file.</span>
              )}
            </div>
            <p className={d.placeholder}>
              Upload your GP referral or MHTP to make Medicare booking smoother through the wizard.
            </p>
            <div className={d.referralActions}>
              <button
                type="button"
                className={d.btnPrimary}
                onClick={() =>
                  navigate(
                    bookingReadiness?.actions.wizard_medicare_referral ??
                      '/appointments/book-appointment?billing_path=medicare&focus=referral'
                  )
                }
              >
                {referralReady ? 'Book with Medicare' : 'Upload in booking wizard'}
              </button>
              <button
                type="button"
                className={d.btnGhost}
                onClick={() =>
                  navigate(
                    bookingReadiness?.actions.intake_referral_details ??
                      '/patient/intake-form?step=3&focus=gp_referral'
                  )
                }
              >
                Update intake referral details
              </button>
              <button
                type="button"
                className={d.linkSubtle}
                onClick={() =>
                  navigate(bookingReadiness?.actions.wizard_private ?? '/appointments/book-appointment?billing_path=private')
                }
              >
                Continue as private booking
              </button>
            </div>
          </section>

          {/* Recent progress */}
          <section className={`${d.card} ${d.span6}`}>
            <div className={d.progressHead}>
              <h3 className={d.progressTitle}>Recent progress</h3>
              <button type="button" className={d.linkSubtle} onClick={() => navigate('/patient/appointments')}>
                View all
              </button>
            </div>
            {dashboardData?.recent_progress && dashboardData.recent_progress.length > 0 ? (
              <div className={d.progressList}>
                {dashboardData.recent_progress.map((progress: Record<string, unknown>, index: number) => (
                  <div key={(progress.id as string) || index} className={d.progressRow}>
                    <div className={d.progressLeft}>
                      <span className={d.progressAccent} />
                      <div>
                        <p className={d.progressSession}>
                          Session #
                          {(progress.session_number as number) || index + 1}
                          {progress.progress_rating != null ? (
                            <span style={{ fontWeight: 600, marginLeft: '0.35rem' }}>
                              <StarIcon size="sm" style={{ verticalAlign: 'middle' }} />{' '}
                              {String(progress.progress_rating)}/10
                            </span>
                          ) : null}
                        </p>
                        <p className={d.progressMeta}>
                          {progress.psychologist_name ? `Dr. ${String(progress.psychologist_name)} · ` : ''}
                          {progress.session_date
                            ? new Date(String(progress.session_date)).toLocaleDateString('en-AU', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })
                            : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className={d.placeholder}>Your progress will appear here after sessions.</p>
            )}
          </section>

          {/* Resources */}
          <section className={`${d.card} ${d.span6}`}>
            <h3 className={d.progressTitle} style={{ marginBottom: '1.25rem' }}>
              Explore resources
            </h3>
            <div className={d.resourcesGrid}>
              <button type="button" className={d.resourceTile} onClick={() => navigate('/patient/resources')}>
                <BookIcon size="md" className={d.resourceTileIcon} />
                <p className={d.resourceTileLabel}>Articles & tools</p>
              </button>
              <button type="button" className={d.resourceTile} onClick={() => navigate('/patient/resources')}>
                <ClipboardIcon size="md" className={d.resourceTileIcon} />
                <p className={d.resourceTileLabel}>Worksheets</p>
              </button>
              <button type="button" className={d.resourceTile} onClick={() => navigate('/patient/resources')}>
                <ChartIcon size="md" className={d.resourceTileIcon} />
                <p className={d.resourceTileLabel}>Self-guided exercises</p>
              </button>
              <button type="button" className={d.resourceTile} onClick={() => navigate('/contact')}>
                <WarningIcon size="md" className={d.resourceTileIcon} />
                <p className={d.resourceTileLabel}>Crisis & support</p>
              </button>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};
