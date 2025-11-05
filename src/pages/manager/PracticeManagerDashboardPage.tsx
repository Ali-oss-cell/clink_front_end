import { useState, useEffect, useRef } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { dashboardService, type PracticeManagerDashboard } from '../../services/api/dashboard';
import styles from './ManagerPages.module.scss';

export const PracticeManagerDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<PracticeManagerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Refs for scroll-triggered animations
  const statsGridRef = useRef<HTMLDivElement>(null);
  const dashboardGridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getPracticeManagerDashboard();
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
      rootMargin: '0px 0px -80px 0px',
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

    const setupObserver = () => {
      const sections = [
        headerRef.current,
        statsGridRef.current,
        dashboardGridRef.current
      ].filter(Boolean) as Element[];

      sections.forEach((section) => {
        observer.observe(section);
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          section.classList.add(styles.isVisible);
        }
      });

      const statCards = statsGridRef.current?.querySelectorAll(`.${styles.statCard}`);
      const dashboardCards = dashboardGridRef.current?.querySelectorAll(`.${styles.dashboardCard}`);
      
      [statCards, dashboardCards].forEach((nodeList) => {
        nodeList?.forEach((element) => {
          observer.observe(element);
          const rect = element.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            element.classList.add(styles.isVisible);
          }
        });
      });
    };

    setupObserver();
    const timeoutId = setTimeout(setupObserver, 100);

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [loading, dashboardData]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string, timeString: string) => {
    return `${formatDate(dateString)} at ${timeString}`;
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
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
      <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
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

  const { stats } = dashboardData;

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.managerLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div ref={headerRef} className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Welcome, {user?.first_name || 'Manager'}!</h1>
            <p className={styles.welcomeSubtitle}>
              Practice overview and management dashboard
            </p>
          </div>

          {/* Main Stats Cards */}
          <div ref={statsGridRef} className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.today_appointments}</div>
                <div className={styles.statLabel}>Today's Appointments</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📆</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.this_week_appointments}</div>
                <div className={styles.statLabel}>This Week</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_patients}</div>
                <div className={styles.statLabel}>Total Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🩺</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_psychologists}</div>
                <div className={styles.statLabel}>Psychologists</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.completed_sessions_today}</div>
                <div className={styles.statLabel}>Completed Today</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{formatCurrency(stats.today_revenue)}</div>
                <div className={styles.statLabel}>Today's Revenue</div>
              </div>
            </div>
          </div>

          {/* Secondary Stats */}
          <div className={styles.secondaryStatsGrid}>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Active Patients</div>
              <div className={styles.secondaryStatValue}>{stats.active_patients}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>New This Month</div>
              <div className={styles.secondaryStatValue}>{stats.new_patients_this_month}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>This Month Revenue</div>
              <div className={styles.secondaryStatValue}>{formatCurrency(stats.this_month_revenue)}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Total Revenue</div>
              <div className={styles.secondaryStatValue}>{formatCurrency(stats.total_revenue)}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Pending Invoices</div>
              <div className={styles.secondaryStatValue}>{stats.pending_invoices}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Cancelled Today</div>
              <div className={styles.secondaryStatValue}>{stats.cancelled_appointments_today}</div>
            </div>
          </div>

          <div ref={dashboardGridRef} className={styles.dashboardGrid}>
            {/* Recent Appointments */}
            <div className={styles.dashboardCard}>
              <h3>📋 Recent Appointments</h3>
              {dashboardData.recent_appointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent appointments</p>
                </div>
              ) : (
                <div className={styles.appointmentsList}>
                  {dashboardData.recent_appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentHeader}>
                        <span className={styles.patientName}>{appointment.patient_name}</span>
                        <span className={styles.appointmentStatus}>{appointment.status}</span>
                      </div>
                      <div className={styles.appointmentMeta}>
                        <span>Dr. {appointment.psychologist_name}</span>
                        <span>•</span>
                        <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className={styles.dashboardCard}>
              <h3>⏰ Upcoming Appointments</h3>
              {dashboardData.upcoming_appointments.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No upcoming appointments</p>
                </div>
              ) : (
                <div className={styles.appointmentsList}>
                  {dashboardData.upcoming_appointments.slice(0, 5).map((appointment) => (
                    <div key={appointment.id} className={styles.appointmentItem}>
                      <div className={styles.appointmentHeader}>
                        <span className={styles.patientName}>{appointment.patient_name}</span>
                        <span className={styles.appointmentStatus}>{appointment.status}</span>
                      </div>
                      <div className={styles.appointmentMeta}>
                        <span>Dr. {appointment.psychologist_name}</span>
                        <span>•</span>
                        <span>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top Psychologists */}
            <div className={styles.dashboardCard}>
              <h3>⭐ Top Psychologists</h3>
              {dashboardData.top_psychologists.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No psychologist data available</p>
                </div>
              ) : (
                <div className={styles.psychologistsList}>
                  {dashboardData.top_psychologists.map((psychologist) => (
                    <div key={psychologist.id} className={styles.psychologistItem}>
                      <div className={styles.psychologistName}>{psychologist.name}</div>
                      <div className={styles.psychologistStats}>
                        <span>{psychologist.appointment_count} appointments</span>
                        {psychologist.rating && (
                          <>
                            <span>•</span>
                            <span>⭐ {psychologist.rating.toFixed(1)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Financial Summary */}
            <div className={styles.dashboardCard}>
              <h3>💼 Financial Summary</h3>
              <div className={styles.financialSummary}>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Today</span>
                  <span className={styles.financialValue}>{formatCurrency(stats.today_revenue)}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>This Week</span>
                  <span className={styles.financialValue}>{formatCurrency(stats.this_week_revenue)}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>This Month</span>
                  <span className={styles.financialValue}>{formatCurrency(stats.this_month_revenue)}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Total</span>
                  <span className={styles.financialValue}>{formatCurrency(stats.total_revenue)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

