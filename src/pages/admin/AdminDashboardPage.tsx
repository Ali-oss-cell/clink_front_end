import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { dashboardService, type AdminDashboard } from '../../services/api/dashboard';
import styles from './AdminPages.module.scss';

export const AdminDashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Refs for scroll-triggered animations
  const statsGridRef = useRef<HTMLDivElement>(null);
  const dashboardGridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await dashboardService.getAdminDashboard();
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
        dashboardGridRef.current,
        quickActionsRef.current
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'good':
        return '#10b981';
      case 'warning':
        return '#f59e0b';
      case 'error':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
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
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
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

  const { stats, system_health } = dashboardData;

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.adminLayout}
    >
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div ref={headerRef} className={styles.dashboardHeader}>
            <h1 className={styles.welcomeTitle}>Admin Dashboard</h1>
            <p className={styles.welcomeSubtitle}>
              System-wide overview and management
            </p>
          </div>

          {/* System Health Status */}
          <div className={styles.systemHealthCard}>
            <div className={styles.healthStatus}>
              <div 
                className={styles.healthIndicator}
                style={{ backgroundColor: getStatusColor(system_health.status) }}
              ></div>
              <div>
                <h3>System Status: <span style={{ color: getStatusColor(system_health.status) }}>
                  {system_health.status.toUpperCase()}
                </span></h3>
                <p>Verified Users: {system_health.verified_users_percentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>

          {/* Main Stats Cards */}
          <div ref={statsGridRef} className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>👥</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_users}</div>
                <div className={styles.statLabel}>Total Users</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🩺</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_patients}</div>
                <div className={styles.statLabel}>Patients</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>🧠</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_psychologists}</div>
                <div className={styles.statLabel}>Psychologists</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>📅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.total_appointments}</div>
                <div className={styles.statLabel}>Total Appointments</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>✅</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{stats.completed_appointments}</div>
                <div className={styles.statLabel}>Completed</div>
              </div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>💰</div>
              <div className={styles.statContent}>
                <div className={styles.statValue}>{formatCurrency(stats.total_revenue)}</div>
                <div className={styles.statLabel}>Total Revenue</div>
              </div>
            </div>
          </div>

          {/* Secondary Stats Grid */}
          <div className={styles.secondaryStatsGrid}>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>New Users This Month</div>
              <div className={styles.secondaryStatValue}>{stats.new_users_this_month}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>New Patients</div>
              <div className={styles.secondaryStatValue}>{stats.new_patients_this_month}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>New Psychologists</div>
              <div className={styles.secondaryStatValue}>{stats.new_psychologists_this_month}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Verified Users</div>
              <div className={styles.secondaryStatValue}>{stats.verified_users}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Unverified Users</div>
              <div className={styles.secondaryStatValue}>{stats.unverified_users}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Scheduled</div>
              <div className={styles.secondaryStatValue}>{stats.scheduled_appointments}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Cancelled</div>
              <div className={styles.secondaryStatValue}>{stats.cancelled_appointments}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Progress Notes</div>
              <div className={styles.secondaryStatValue}>{stats.total_progress_notes}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Invoices</div>
              <div className={styles.secondaryStatValue}>{stats.total_invoices}</div>
            </div>
            <div className={styles.secondaryStatCard}>
              <div className={styles.secondaryStatLabel}>Medicare Claims</div>
              <div className={styles.secondaryStatValue}>{stats.total_medicare_claims}</div>
            </div>
          </div>

          <div ref={dashboardGridRef} className={styles.dashboardGrid}>
            {/* User Statistics */}
            <div className={styles.dashboardCard}>
              <h3>👥 User Statistics</h3>
              <div className={styles.statisticsList}>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Total Patients</span>
                  <span className={styles.statisticValue}>{stats.total_patients}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Total Psychologists</span>
                  <span className={styles.statisticValue}>{stats.total_psychologists}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Practice Managers</span>
                  <span className={styles.statisticValue}>{stats.total_practice_managers}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Admins</span>
                  <span className={styles.statisticValue}>{stats.total_admins}</span>
                </div>
              </div>
            </div>

            {/* Appointment Statistics */}
            <div className={styles.dashboardCard}>
              <h3>📅 Appointment Statistics</h3>
              <div className={styles.statisticsList}>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Total</span>
                  <span className={styles.statisticValue}>{stats.total_appointments}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Completed</span>
                  <span className={styles.statisticValue}>{stats.completed_appointments}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Scheduled</span>
                  <span className={styles.statisticValue}>{stats.scheduled_appointments}</span>
                </div>
                <div className={styles.statisticItem}>
                  <span className={styles.statisticLabel}>Cancelled</span>
                  <span className={styles.statisticValue}>{stats.cancelled_appointments}</span>
                </div>
              </div>
            </div>

            {/* Financial Overview */}
            <div className={styles.dashboardCard}>
              <h3>💰 Financial Overview</h3>
              <div className={styles.financialSummary}>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Total Revenue</span>
                  <span className={styles.financialValue}>{formatCurrency(stats.total_revenue)}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Total Invoices</span>
                  <span className={styles.financialValue}>{stats.total_invoices}</span>
                </div>
                <div className={styles.financialItem}>
                  <span className={styles.financialLabel}>Medicare Claims</span>
                  <span className={styles.financialValue}>{stats.total_medicare_claims}</span>
                </div>
              </div>
            </div>

            {/* Recent Users */}
            <div className={styles.dashboardCard}>
              <h3>🆕 Recent Users</h3>
              {dashboardData.recent_users.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent users</p>
                </div>
              ) : (
                <div className={styles.usersList}>
                  {dashboardData.recent_users.map((user) => (
                    <div key={user.id} className={styles.userItem}>
                      <div className={styles.userHeader}>
                        <span className={styles.userName}>{user.full_name}</span>
                        <span className={styles.userRole}>{user.role}</span>
                      </div>
                      <div className={styles.userMeta}>
                        <span>{user.email}</span>
                        <span>•</span>
                        <span className={user.is_verified ? styles.verified : styles.unverified}>
                          {user.is_verified ? '✓ Verified' : '⚠ Unverified'}
                        </span>
                        <span>•</span>
                        <span>{formatDate(user.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions / Navigation Cards */}
          <div ref={quickActionsRef} className={styles.quickActionsGrid}>
            <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
            <div className={styles.quickActionsCards}>
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/users')}
              >
                <div className={styles.quickActionIcon}>👥</div>
                <div className={styles.quickActionContent}>
                  <h3>User Management</h3>
                  <p>Manage all system users, roles, and permissions</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/appointments')}
              >
                <div className={styles.quickActionIcon}>📅</div>
                <div className={styles.quickActionContent}>
                  <h3>All Appointments</h3>
                  <p>View and manage all clinic appointments</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/patients')}
              >
                <div className={styles.quickActionIcon}>🩺</div>
                <div className={styles.quickActionContent}>
                  <h3>All Patients</h3>
                  <p>View and manage all patient records</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/staff')}
              >
                <div className={styles.quickActionIcon}>👨‍💼</div>
                <div className={styles.quickActionContent}>
                  <h3>Staff Management</h3>
                  <p>View psychologists and practice managers</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/billing')}
              >
                <div className={styles.quickActionIcon}>💰</div>
                <div className={styles.quickActionContent}>
                  <h3>Billing & Financials</h3>
                  <p>Manage invoices, payments, and Medicare claims</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/settings')}
              >
                <div className={styles.quickActionIcon}>⚙️</div>
                <div className={styles.quickActionContent}>
                  <h3>System Settings</h3>
                  <p>Configure clinic information and system preferences</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
              
              <div 
                className={styles.quickActionCard}
                onClick={() => navigate('/admin/analytics')}
              >
                <div className={styles.quickActionIcon}>📊</div>
                <div className={styles.quickActionContent}>
                  <h3>System Analytics</h3>
                  <p>View detailed analytics and performance metrics</p>
                </div>
                <div className={styles.quickActionArrow}>→</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

