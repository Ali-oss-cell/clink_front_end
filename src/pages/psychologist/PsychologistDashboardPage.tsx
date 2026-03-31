import { useState, useEffect, useRef } from 'react';
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
  CheckCircleIcon,
  StarIcon,
  VideoIcon,
  ChartIcon,
  HospitalIcon,
  BoltIcon
} from '../../utils/icons';
import styles from './PsychologistPages.module.scss';
import { Button } from '../../components/ui/button';

export const PsychologistDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<PsychologistDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [videoCallAppointments, setVideoCallAppointments] = useState<any[]>([]);
  
  // Refs for scroll-triggered animations
  const statsGridRef = useRef<HTMLDivElement>(null);
  const dashboardGridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

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
      } catch (err: any) {
        console.error('Failed to load dashboard:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Load video call appointments
  const loadVideoCallAppointments = async () => {
    try {
      const response = await appointmentsService.getPsychologistSchedule({
        start_date: new Date().toISOString().split('T')[0]
      });
      
      // Filter for telehealth appointments that can be joined
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

  // Auto-refresh video call appointments every 30 seconds to update timer values
  useEffect(() => {
    const interval = setInterval(() => {
      loadVideoCallAppointments();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (loading || !dashboardData) return;

    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -80px 0px', // Trigger when element is 80px from bottom of viewport
      threshold: 0.1
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(styles.isVisible);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Small delay to ensure DOM is fully rendered
    const setupObserver = () => {
      // Observe all sections
      const sections = [
        headerRef.current,
        statsGridRef.current,
        dashboardGridRef.current
      ].filter(Boolean) as Element[];

      sections.forEach((section) => {
        observer.observe(section);
        // Check if element is already visible and trigger animation immediately
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          section.classList.add(styles.isVisible);
        }
      });

      // Observe individual cards
      const statCards = statsGridRef.current?.querySelectorAll(`.${styles.statCard}`);
      const dashboardCards = dashboardGridRef.current?.querySelectorAll(`.${styles.dashboardCard}`);
      const noteItems = dashboardGridRef.current?.querySelectorAll(`.${styles.noteItem}`);
      
      [statCards, dashboardCards, noteItems].forEach((nodeList) => {
        nodeList?.forEach((element) => {
          observer.observe(element);
          // Check if element is already visible
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add(styles.isVisible);
          }
        });
      });
    };

    // Setup immediately and also after a small delay for any dynamic content
    setupObserver();
    const timeoutId = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [loading, dashboardData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading dashboard...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.psychologistLayout}>
        <div className={styles.dashboardContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h3><WarningIcon size="md" className={styles.inlineIcon} /> Error Loading Dashboard</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!dashboardData) {
    return null;
  }

  const averageRating = dashboardData?.stats?.average_rating;

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.psychologistLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div ref={headerRef} className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Good morning, {user?.first_name || 'User'}!</h1>
            <p className={styles.welcomeSubtitle}>
              Here's your overview and quick access to key areas.
            </p>
          </div>

          {/* Stats Cards */}
          <div ref={statsGridRef} className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CalendarIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.today_appointments_count}</div>
                <div className={styles.statLabel}>Today's Appointments</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CalendarIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.upcoming_appointments_this_week}</div>
                <div className={styles.statLabel}>This Week</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><UsersIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.active_patients_count}</div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><NotesIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.pending_notes_count}</div>
                <div className={styles.statLabel}>Pending Notes</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><CheckCircleIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.completed_sessions_today}</div>
                <div className={styles.statLabel}>Completed Today</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}><StarIcon size="xl" /></div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>
                  {typeof averageRating === 'number' ? averageRating.toFixed(1) : '—'}
                </div>
                <div className={styles.statLabel}>Avg Rating</div>
              </div>
            </div>
          </div>

          <div ref={dashboardGridRef} className={styles.dashboardGrid}>
            {/* Video Sessions Card - Prominent */}
            <div className={`${styles.dashboardCard} ${styles.videoSessionsCard}`}>
              <h3><VideoIcon size="lg" className={styles.inlineIcon} /> Video Sessions</h3>
              <div className={styles.cardContent}>
                {videoCallAppointments.length > 0 ? (
                  <div className={styles.videoSessionsList}>
                    {videoCallAppointments.map((appointment) => (
                      <div key={appointment.id} className={styles.videoSessionItem}>
                        <div className={styles.videoSessionInfo}>
                          <div className={styles.videoSessionHeader}>
                            <span className={styles.videoSessionPatient}>
                              {appointment.patient_name}
                            </span>
                            <span className={styles.videoSessionTime}>
                              {videoCallService.getTimeUntilAppointment(appointment)}
                            </span>
                          </div>
                          <div className={styles.videoSessionDetails}>
                            <span>{appointment.formatted_date}</span>
                            <span>•</span>
                            <span>{appointment.formatted_time}</span>
                            <span>•</span>
                            <span>{appointment.duration_minutes} min</span>
                          </div>
                        </div>
                        <Button
                          className={`${styles.actionButton} ${styles.videoJoinButton} ${
                            appointment.can_join_session === false ? styles.disabledButton : ''
                          }`}
                          onClick={() => {
                            const canJoin = appointment.can_join_session !== undefined 
                              ? appointment.can_join_session 
                              : true; // Default to true if not specified
                            if (canJoin) {
                              handleJoinVideoCall(appointment.id);
                            }
                          }}
                          disabled={appointment.can_join_session === false}
                          title={
                            appointment.can_join_session === false 
                              ? 'Video call is not available at this time' 
                              : 'Join video session'
                          }
                        >
                          <VideoIcon size="sm" className={styles.inlineIcon} />
                          {
                            appointment.can_join_session === false 
                              ? 'Not Available' 
                              : 'Join Now'
                          }
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.placeholder}>
                    <p>No upcoming video sessions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Notes Card */}
            <div className={styles.dashboardCard}>
              <div className={styles.dashboardCardHeader}>
                <h3><NotesIcon size="lg" className={styles.inlineIcon} /> Recent Progress Notes</h3>
                <Button className={styles.viewAllButton} onClick={handleViewNotes}>
                  View All →
                </Button>
              </div>
              {dashboardData.recent_notes.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent notes</p>
                </div>
              ) : (
                <div className={styles.notesList}>
                  {dashboardData.recent_notes.map((note) => (
                    <div 
                      key={note.id} 
                      className={styles.noteItem}
                    >
                      <div className={styles.noteItemHeader}>
                        <span className={styles.notePatient}>{note.patient_name}</span>
                        {note.progress_rating && (
                          <span className={styles.noteRating}>
                            {note.progress_rating}/10
                          </span>
                        )}
                      </div>
                      <div className={styles.noteItemMeta}>
                        <span>Session #{note.session_number}</span>
                        <span>•</span>
                        <span>{formatDate(note.session_date)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats Card */}
            <div className={styles.dashboardCard}>
              <h3><ChartIcon size="lg" className={styles.inlineIcon} /> This Month</h3>
              <div className={styles.dashboardMetaStack}>
                <div className={styles.dashboardMetaStack}>
                  <div className={styles.dashboardInlineStatRow}>
                    <span>Total Appointments:</span>
                    <strong>{dashboardData.stats.total_appointments_this_month}</strong>
                  </div>
                  <div className={styles.dashboardInlineStatRow}>
                    <span>Sessions Completed (Week):</span>
                    <strong>{dashboardData.stats.sessions_completed_this_week}</strong>
                  </div>
                  <div className={styles.dashboardInlineStatRow}>
                    <span>Total Patients:</span>
                    <strong>{dashboardData.total_patients_count}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className={styles.dashboardCard}>
              <h3><BoltIcon size="md" className={styles.inlineIcon} /> Quick Actions</h3>
              <div className={styles.dashboardMetaStack}>
                <Button className={styles.actionButton} onClick={handleViewPatients}>
                  <UsersIcon size="sm" className={styles.inlineIcon} />
                  Manage Patients
                </Button>
                <Button className={styles.actionButton} onClick={handleViewSchedule}>
                  <CalendarIcon size="sm" className={styles.inlineIcon} />
                  View Schedule
                </Button>
                <Button className={styles.actionButton} onClick={handleViewNotes}>
                  <NotesIcon size="sm" className={styles.inlineIcon} />
                  Write Progress Note
                </Button>
              </div>
            </div>

            {/* Overview Card */}
            <div className={styles.dashboardCard}>
              <h3><HospitalIcon size="lg" className={styles.inlineIcon} /> Practice Overview</h3>
              <div className={styles.dashboardMetaStack}>
                <p className={styles.dashboardBodyText}>
                  You have <strong>{dashboardData.today_appointments_count}</strong> appointment{dashboardData.today_appointments_count !== 1 ? 's' : ''} today
                  {dashboardData.pending_notes_count > 0 && (
                    <> and <strong>{dashboardData.pending_notes_count}</strong> note{dashboardData.pending_notes_count !== 1 ? 's' : ''} pending.</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};
