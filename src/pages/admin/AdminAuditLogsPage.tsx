import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { auditService, type AuditLog, type AuditLogStats } from '../../services/api/audit';
import { CloseIcon } from '../../utils/icons';
import styles from './AdminPages.module.scss';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditLogStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);
  
  // Filters
  const [filters, setFilters] = useState({
    action: '',
    user_role: '',
    start_date: '',
    end_date: '',
    search: ''
  });

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchAuditLogs();
    fetchStats();
  }, [currentPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: currentPage,
        page_size: pageSize,
        ordering: '-timestamp' // Newest first
      };
      
      if (filters.action) params.action = filters.action;
      if (filters.user_role) params.user_role = filters.user_role;
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.search) params.search = filters.search;
      
      const response = await auditService.getAuditLogs(params);
      setLogs(response.results);
      setTotalCount(response.count);
    } catch (err: any) {
      console.error('Failed to load audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await auditService.getAuditLogStats();
      setStats(data);
    } catch (err: any) {
      console.error('Failed to load audit log stats:', err);
      // Don't show error for stats, it's not critical
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatChanges = (changes: AuditLog['changes']) => {
    if (!changes || Object.keys(changes).length === 0) {
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No changes</span>;
    }
    
    return (
      <div style={{ fontSize: '0.875rem' }}>
        {Object.entries(changes).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '0.25rem' }}>
            <strong>{key}:</strong>{' '}
            <span style={{ color: '#ef4444' }}>{JSON.stringify(value.old)}</span>
            {' → '}
            <span style={{ color: '#10b981' }}>{JSON.stringify(value.new)}</span>
          </div>
        ))}
      </div>
    );
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'create':
        return '#10b981';
      case 'update':
        return '#3b82f6';
      case 'delete':
        return '#ef4444';
      case 'login':
        return '#8b5cf6';
      case 'logout':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  if (loading && logs.length === 0) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading audit logs...</p>
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
            <h1>Audit Logs</h1>
            <p>Track all system actions and changes</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
            </div>
          )}

          {/* Statistics Cards */}
          {stats && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                  {stats.total_logs.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Logs</div>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                  {stats.recent_logs_30_days.toLocaleString()}
                </div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Last 30 Days</div>
              </div>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                  {Object.keys(stats.actions_by_type).length}
                </div>
                <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Action Types</div>
              </div>
            </div>
          )}

          {/* Filters */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by user email, object name, or IP address..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <select
                value={filters.action}
                onChange={(e) => {
                  setFilters({ ...filters, action: e.target.value });
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
                <option value="view">View</option>
                <option value="download">Download</option>
                <option value="export">Export</option>
              </select>

              <select
                value={filters.user_role}
                onChange={(e) => {
                  setFilters({ ...filters, user_role: e.target.value });
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="practice_manager">Practice Manager</option>
                <option value="psychologist">Psychologist</option>
                <option value="patient">Patient</option>
              </select>

              <input
                type="date"
                value={filters.start_date}
                onChange={(e) => {
                  setFilters({ ...filters, start_date: e.target.value });
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
                placeholder="Start Date"
                style={{ padding: '0.5rem' }}
              />

              <input
                type="date"
                value={filters.end_date}
                onChange={(e) => {
                  setFilters({ ...filters, end_date: e.target.value });
                  setCurrentPage(1);
                }}
                className={styles.filterSelect}
                placeholder="End Date"
                style={{ padding: '0.5rem' }}
              />

              {(filters.action || filters.user_role || filters.start_date || filters.end_date || filters.search) && (
                <button
                  onClick={() => {
                    setFilters({
                      action: '',
                      user_role: '',
                      start_date: '',
                      end_date: '',
                      search: ''
                    });
                    setCurrentPage(1);
                  }}
                  className={styles.secondaryButton}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className={styles.tableContainer}>
            <div style={{ marginBottom: '1rem', color: '#6b7280' }}>
              Showing {logs.length} of {totalCount.toLocaleString()} logs
            </div>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Role</th>
                  <th>Action</th>
                  <th>Object</th>
                  <th>Changes</th>
                  <th>IP Address</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      No audit logs found
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id}>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}>
                        {formatDate(log.timestamp)}
                      </td>
                      <td>
                        {log.user_email || <span style={{ color: '#6b7280', fontStyle: 'italic' }}>Anonymous</span>}
                      </td>
                      <td>
                        {log.user_role ? (
                          <span className={styles.badge} style={{ textTransform: 'capitalize' }}>
                            {log.user_role.replace('_', ' ')}
                          </span>
                        ) : (
                          <span style={{ color: '#6b7280' }}>—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={styles.badge}
                          style={{
                            backgroundColor: getActionColor(log.action) + '20',
                            color: getActionColor(log.action)
                          }}
                        >
                          {log.action_display || log.action}
                        </span>
                      </td>
                      <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {log.object_repr || <span style={{ color: '#6b7280' }}>—</span>}
                      </td>
                      <td style={{ maxWidth: '300px', fontSize: '0.875rem' }}>
                        {formatChanges(log.changes)}
                      </td>
                      <td style={{ fontSize: '0.875rem', fontFamily: 'monospace' }}>
                        {log.ip_address || <span style={{ color: '#6b7280' }}>—</span>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem',
              marginTop: '2rem'
            }}>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={styles.secondaryButton}
                style={{ opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              
              <span style={{ color: '#6b7280' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={styles.secondaryButton}
                style={{ opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

