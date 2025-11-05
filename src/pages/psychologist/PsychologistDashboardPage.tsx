import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { dashboardService, type PsychologistDashboard } from '../../services/api/dashboard';
import styles from './PsychologistPages.module.scss';

export const PsychologistDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<PsychologistDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for scroll-triggered animations
  const statsGridRef = useRef<HTMLDivElement>(null);
  const dashboardGridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const user = authService.getStoredUser();

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
              <h3>⚠️ Error Loading Dashboard</h3>
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
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.today_appointments_count}</div>
                <div className={styles.statLabel}>Today's Appointments</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📆</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.upcoming_appointments_this_week}</div>
                <div className={styles.statLabel}>This Week</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.active_patients_count}</div>
                <div className={styles.statLabel}>Active Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📝</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.pending_notes_count}</div>
                <div className={styles.statLabel}>Pending Notes</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.completed_sessions_today}</div>
                <div className={styles.statLabel}>Completed Today</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>⭐</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{dashboardData.stats.average_rating.toFixed(1)}</div>
                <div className={styles.statLabel}>Avg Rating</div>
              </div>
            </div>
          </div>

          <div ref={dashboardGridRef} className={styles.dashboardGrid}>
            {/* Recent Notes Card */}
            <div className={styles.dashboardCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3>📝 Recent Progress Notes</h3>
                <button className={styles.viewAllButton} onClick={handleViewNotes}>
                  View All →
                </button>
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
              <h3>📊 This Month</h3>
              <div style={{ marginTop: '1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Total Appointments:</span>
                    <strong>{dashboardData.stats.total_appointments_this_month}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span>Sessions Completed (Week):</span>
                    <strong>{dashboardData.stats.sessions_completed_this_week}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Total Patients:</span>
                    <strong>{dashboardData.total_patients_count}</strong>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className={styles.dashboardCard}>
              <h3>⚡ Quick Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <button className={styles.actionButton} onClick={handleViewPatients}>
                  👥 Manage Patients
                </button>
                <button className={styles.actionButton} onClick={handleViewSchedule}>
                  📅 View Schedule
                </button>
                <button className={styles.actionButton} onClick={handleViewNotes}>
                  📝 Write Progress Note
                </button>
              </div>
            </div>

            {/* Overview Card */}
            <div className={styles.dashboardCard}>
              <h3>🏥 Practice Overview</h3>
              <div style={{ marginTop: '1rem' }}>
                <p style={{ fontSize: '0.9rem', color: '#6b7280', lineHeight: '1.6' }}>
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
