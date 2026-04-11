import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { dashboardService, type PsychologistDashboard } from '../../services/api/dashboard';
import { appointmentsService } from '../../services/api/appointments';
import { videoCallService } from '../../services/api/videoCall';
import {
  WarningIcon,
  CalendarIcon,
  UsersIcon,
  NotesIcon,
  VideoIcon,
  HospitalIcon,
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';
import d from './PsychologistDashboard.module.scss';
import shell from '../patient/PatientShellChrome.module.scss';
import { formatLocalDateYYYYMMDD } from '../../utils/dateLocal';
import { formatSessionDurationMinutes } from '../../utils/formatSessionDuration';

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export const PsychologistDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<PsychologistDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCallAppointments, setVideoCallAppointments] = useState<any[]>([]);

  const user = authService.getStoredUser();

  const handleJoinVideoCall = (appointmentId: number | string) => {
    navigate(`/video-session/${appointmentId}`);
  };

  const handleViewPatients = () => {
    navigate('/psychologist/patients');
  };

  const handleViewSchedule = () => {
    navigate('/psychologist/schedule');
  };

  const handleViewNotes = () => {
    navigate('/psychologist/notes');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getPsychologistDashboard();
        setDashboardData(data);
      } catch (err: unknown) {
        console.error('Failed to load dashboard:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const loadVideoCallAppointments = async () => {
    try {
      const response = await appointmentsService.getPsychologistSchedule({
        start_date: formatLocalDateYYYYMMDD(new Date()),
      });

      const eligibleAppointments = response.results.filter((apt: any) =>
        videoCallService.isVideoCallAvailable(apt)
      );

      setVideoCallAppointments(eligibleAppointments);
    } catch (err) {
      console.error('Failed to load video call appointments:', err);
    }
  };

  useEffect(() => {
    loadVideoCallAppointments();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      loadVideoCallAppointments();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={d.loadingBox}>
          <div className={d.spinner} />
          <p>Loading your dashboard…</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={d.errorBox}>
          <h2>
            <WarningIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            Error loading dashboard
          </h2>
          <p>{error}</p>
          <button type="button" className={`${d.actionBtn} ${d.actionBtnPrimary}`} onClick={() => window.location.reload()}>
            Try again
          </button>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const averageRating = dashboardData?.stats?.average_rating;
  const firstName = user?.first_name || 'there';

  const statItems = [
    { value: dashboardData.today_appointments_count, label: "Today's sessions" },
    { value: dashboardData.upcoming_appointments_this_week, label: 'This week' },
    { value: dashboardData.active_patients_count, label: 'Active patients' },
    { value: dashboardData.pending_notes_count, label: 'Pending notes' },
    { value: dashboardData.completed_sessions_today, label: 'Done today' },
    {
      value: typeof averageRating === 'number' ? averageRating.toFixed(1) : '—',
      label: 'Avg rating',
    },
  ];

  return (
    <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
      <div className={d.root}>
        <div className={d.inner}>
          <header className={shell.pageHeader}>
            <h1 className={shell.welcomeTitle}>
              {timeGreeting()}, {firstName}.
            </h1>
            <p className={shell.welcomeSubtitle}>
              Your practice at a glance — sessions, notes, and quick actions in one place.
            </p>
          </header>

          <div className={d.statsStrip} aria-label="Key metrics">
            {statItems.map((s) => (
              <div key={s.label} className={d.statChip}>
                <div className={d.statChipValue}>{s.value}</div>
                <div className={d.statChipLabel}>{s.label}</div>
              </div>
            ))}
          </div>

          <div className={d.bento}>
            <section className={`${d.card} ${d.videoHero} ${d.span8}`}>
              <span className={d.decoIcon} aria-hidden>
                <VideoIcon size="lg" />
              </span>
              <h2 className={d.cardTitle}>Video sessions</h2>
              {videoCallAppointments.length > 0 ? (
                <div className={d.scrollList}>
                  {videoCallAppointments.map((appointment) => {
                    const canJoin =
                      appointment.can_join_session === undefined ? true : appointment.can_join_session;
                    return (
                      <div key={appointment.id} className={d.videoRow}>
                        <div className={d.videoRowInfo}>
                          <div className={d.videoRowTop}>
                            <span className={d.patientName}>{appointment.patient_name}</span>
                            <span className={d.timeChip}>
                              {videoCallService.getTimeUntilAppointment(appointment)}
                            </span>
                          </div>
                          <div className={d.videoRowDetail}>
                            <span>{appointment.formatted_date}</span>
                            <span>•</span>
                            <span>{appointment.formatted_time}</span>
                            <span>•</span>
                            <span>{formatSessionDurationMinutes(appointment.duration_minutes)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className={d.joinBtn}
                          disabled={!canJoin}
                          title={
                            !canJoin ? 'Video call is not available at this time' : 'Join video session'
                          }
                          onClick={() => canJoin && handleJoinVideoCall(appointment.id)}
                        >
                          <VideoIcon size="sm" />
                          {!canJoin ? 'Not available' : 'Join now'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className={d.placeholder}>No telehealth sessions to join today in the current window.</p>
              )}
            </section>

            <section className={`${d.card} ${d.span4}`}>
              <div className={d.progressHead}>
                <h2 className={d.progressTitle}>Recent notes</h2>
                <button type="button" className={d.linkSubtle} onClick={handleViewNotes}>
                  View all
                </button>
              </div>
              {dashboardData.recent_notes.length === 0 ? (
                <p className={d.placeholder}>No recent progress notes.</p>
              ) : (
                <div className={d.scrollList}>
                  {dashboardData.recent_notes.map((note) => (
                    <div key={note.id} className={d.noteRow}>
                      <div className={d.noteRowTop}>
                        <span className={d.notePatient}>{note.patient_name}</span>
                        {note.progress_rating != null ? (
                          <span className={d.noteRating}>{note.progress_rating}/10</span>
                        ) : null}
                      </div>
                      <div className={d.noteMeta}>
                        Session #{note.session_number} · {formatDate(note.session_date)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={`${d.card} ${d.span4Row2}`}>
              <h2 className={d.cardTitle}>This month</h2>
              <div className={d.metaStack}>
                <div className={d.metaRow}>
                  <span>Appointments</span>
                  <strong>{dashboardData.stats.total_appointments_this_month}</strong>
                </div>
                <div className={d.metaRow}>
                  <span>Sessions completed (week)</span>
                  <strong>{dashboardData.stats.sessions_completed_this_week}</strong>
                </div>
                <div className={d.metaRow}>
                  <span>Total patients</span>
                  <strong>{dashboardData.total_patients_count}</strong>
                </div>
              </div>
            </section>

            <section className={`${d.card} ${d.span4Row2}`}>
              <h2 className={d.cardTitle}>Quick actions</h2>
              <div className={d.actionsStack}>
                <button type="button" className={`${d.actionBtn} ${d.actionBtnPrimary}`} onClick={handleViewPatients}>
                  <UsersIcon size="sm" />
                  Manage patients
                </button>
                <button type="button" className={d.actionBtn} onClick={handleViewSchedule}>
                  <CalendarIcon size="sm" />
                  View schedule
                </button>
                <button type="button" className={d.actionBtn} onClick={handleViewNotes}>
                  <NotesIcon size="sm" />
                  Write progress note
                </button>
              </div>
            </section>

            <section className={`${d.card} ${d.span4Row2}`}>
              <h2 className={d.cardTitle}>Practice overview</h2>
              <p className={d.bodyText}>
                <HospitalIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                You have <strong>{dashboardData.today_appointments_count}</strong> appointment
                {dashboardData.today_appointments_count !== 1 ? 's' : ''} today
                {dashboardData.pending_notes_count > 0 ? (
                  <>
                    {' '}
                    and <strong>{dashboardData.pending_notes_count}</strong> note
                    {dashboardData.pending_notes_count !== 1 ? 's' : ''} pending attention.
                  </>
                ) : (
                  <>.</>
                )}
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};
