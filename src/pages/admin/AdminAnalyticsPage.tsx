import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type SystemAnalytics } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const AdminAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'year' | 'all'>('month');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [useCustomRange, setUseCustomRange] = useState(false);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchAnalytics();
  }, [period, startDate, endDate, useCustomRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {};
      if (useCustomRange && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      } else {
        params.period = period;
      }

      const data = await adminService.getSystemAnalytics(params);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      setError(err.message || 'Failed to load system analytics');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading analytics...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !analytics) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h3>Error Loading Analytics</h3>
              <p>{error || 'Failed to load analytics'}</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>System Analytics</h1>
          </div>

          {/* Period Selection */}
          <div className={styles.analyticsFilters}>
            <div className={styles.filterGroup}>
              <label>
                <input
                  type="checkbox"
                  checked={useCustomRange}
                  onChange={(e) => setUseCustomRange(e.target.checked)}
                />
                Use Custom Date Range
              </label>
            </div>
            
            {!useCustomRange ? (
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as any)}
                className={styles.filterSelect}
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            ) : (
              <div className={styles.dateRangeGroup}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={styles.dateInput}
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={styles.dateInput}
                />
              </div>
            )}
          </div>

          {analytics.period && (
            <div className={styles.periodInfo}>
              <p>
                Period: <strong>{analytics.period.type}</strong> • 
                {formatDate(analytics.period.start_date)} to {formatDate(analytics.period.end_date)}
              </p>
            </div>
          )}

          {/* User Analytics */}
          <div className={styles.analyticsSection}>
            <h2>👥 User Analytics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.users.total}</div>
                <div className={styles.analyticsLabel}>Total Users</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.users.verified_count}</div>
                <div className={styles.analyticsLabel}>Verified Users</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>
                  {analytics.users.verification_rate != null 
                    ? `${analytics.users.verification_rate.toFixed(1)}%` 
                    : 'N/A'}
                </div>
                <div className={styles.analyticsLabel}>Verification Rate</div>
              </div>
            </div>

            <div className={styles.analyticsTable}>
              <h3>Users by Role</h3>
              <table>
                <thead>
                  <tr>
                    <th>Role</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.users.by_role.map((item) => (
                    <tr key={item.role}>
                      <td>{item.role.replace('_', ' ').toUpperCase()}</td>
                      <td>{item.count}</td>
                      <td>
                        {analytics.users.total > 0 
                          ? `${((item.count / analytics.users.total) * 100).toFixed(1)}%` 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* User Growth Trend */}
            {analytics.users.growth && analytics.users.growth.length > 0 && (
              <div className={styles.analyticsTable}>
                <h3>User Growth Over Time</h3>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>New Users</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.users.growth.map((item, index) => (
                        <tr key={index}>
                          <td>{formatDate(item.date)}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ 
                  marginTop: '8px', 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  Total growth: {analytics.users.growth.reduce((sum, item) => sum + item.count, 0)} users
                </p>
              </div>
            )}
          </div>

          {/* Appointment Analytics */}
          <div className={styles.analyticsSection}>
            <h2>📅 Appointment Analytics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.appointments.total}</div>
                <div className={styles.analyticsLabel}>Total Appointments</div>
              </div>
            </div>

            <div className={styles.analyticsTable}>
              <h3>Appointments by Status</h3>
              <table>
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.appointments.by_status.map((item) => (
                    <tr key={item.status}>
                      <td>{item.status.toUpperCase()}</td>
                      <td>{item.count}</td>
                      <td>
                        {analytics.appointments.total > 0 
                          ? `${((item.count / analytics.appointments.total) * 100).toFixed(1)}%` 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className={styles.analyticsTable}>
              <h3>Appointments by Type</h3>
              <table>
                <thead>
                  <tr>
                    <th>Session Type</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.appointments.by_type.map((item) => (
                    <tr key={item.session_type}>
                      <td>{item.session_type.replace('_', ' ').toUpperCase()}</td>
                      <td>{item.count}</td>
                      <td>
                        {analytics.appointments.total > 0 
                          ? `${((item.count / analytics.appointments.total) * 100).toFixed(1)}%` 
                          : '0%'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Appointment Trends */}
            {analytics.appointments.trends && analytics.appointments.trends.length > 0 && (
              <div className={styles.analyticsTable}>
                <h3>Appointment Trends Over Time</h3>
                <div style={{ 
                  padding: '16px', 
                  backgroundColor: '#f9fafb', 
                  borderRadius: '8px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}>
                  <table style={{ width: '100%' }}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Appointments</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.appointments.trends.map((item, index) => (
                        <tr key={index}>
                          <td>{formatDate(item.date)}</td>
                          <td>{item.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p style={{ 
                  marginTop: '8px', 
                  fontSize: '0.875rem', 
                  color: '#6b7280',
                  fontStyle: 'italic'
                }}>
                  Average per day: {analytics.appointments.trends.length > 0
                    ? (analytics.appointments.trends.reduce((sum, item) => sum + item.count, 0) / analytics.appointments.trends.length).toFixed(1)
                    : '0'} appointments
                </p>
              </div>
            )}
          </div>

          {/* Financial Analytics */}
          <div className={styles.analyticsSection}>
            <h2>💰 Financial Analytics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{formatCurrency(analytics.financial.total_revenue)}</div>
                <div className={styles.analyticsLabel}>Total Revenue</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.financial.total_invoices}</div>
                <div className={styles.analyticsLabel}>Total Invoices</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.financial.paid_invoices}</div>
                <div className={styles.analyticsLabel}>Paid Invoices</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.financial.pending_invoices}</div>
                <div className={styles.analyticsLabel}>Pending Invoices</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.financial.total_medicare_claims}</div>
                <div className={styles.analyticsLabel}>Medicare Claims</div>
              </div>
            </div>
          </div>

          {/* Progress Notes */}
          <div className={styles.analyticsSection}>
            <h2>📝 Progress Notes</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.progress_notes.total}</div>
                <div className={styles.analyticsLabel}>Total Notes</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>
                  {analytics.progress_notes.average_rating != null 
                    ? analytics.progress_notes.average_rating.toFixed(1) 
                    : 'N/A'}
                </div>
                <div className={styles.analyticsLabel}>Average Rating</div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className={styles.analyticsSection}>
            <h2>⚡ Performance Metrics</h2>
            <div className={styles.analyticsGrid}>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.performance.active_patients}</div>
                <div className={styles.analyticsLabel}>Active Patients</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>{analytics.performance.total_users}</div>
                <div className={styles.analyticsLabel}>Total Users</div>
              </div>
              <div className={styles.analyticsCard}>
                <div className={styles.analyticsValue}>
                  {analytics.performance.verification_rate != null 
                    ? `${analytics.performance.verification_rate.toFixed(1)}%` 
                    : 'N/A'}
                </div>
                <div className={styles.analyticsLabel}>Verification Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

