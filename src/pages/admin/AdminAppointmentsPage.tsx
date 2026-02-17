import { useState, useEffect } from 'react';
import { VideoIcon, HospitalIcon, CloseIcon } from '../../utils/icons';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type AdminAppointment } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const AdminAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: 1,
        page_size: 100
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }

      if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        params.date_from = today;
        params.date_to = today;
      } else if (dateFilter === 'week') {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        params.date_from = weekStart.toISOString().split('T')[0];
        params.date_to = today.toISOString().split('T')[0];
      } else if (dateFilter === 'month') {
        const today = new Date();
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        params.date_from = monthStart.toISOString().split('T')[0];
        params.date_to = today.toISOString().split('T')[0];
      }

      const response = await adminService.getAllAppointments(params);
      setAppointments(response.results || []);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      setError(err.message || 'Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString: string, timeString?: string) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    
    if (timeString) {
      return `${formattedDate} at ${timeString}`;
    }
    return formattedDate;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#2e7d42';
      case 'scheduled':
      case 'confirmed':
        return '#3d6d96';
      case 'cancelled':
        return '#c0392b';
      case 'pending':
        return '#d4841a';
      default:
        return '#7a7b7a';
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading appointments...</p>
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
            <h1>All Appointments</h1>
            <div className={styles.statsSummary}>
              <span>Total: {appointments.length}</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
            </div>
          )}

          {/* Filters */}
          <div className={styles.filtersBar}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="pending">Pending</option>
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {/* Appointments Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Patient</th>
                  <th>Psychologist</th>
                  <th>Service</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Duration</th>
                </tr>
              </thead>
              <tbody>
                {appointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      {loading ? 'Loading appointments...' : 'No appointments found'}
                    </td>
                  </tr>
                ) : (
                  appointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatDateTime(appointment.appointment_date, appointment.appointment_time)}</td>
                      <td>{appointment.patient_name || 'N/A'}</td>
                      <td>{appointment.psychologist_name || 'N/A'}</td>
                      <td>{appointment.service_name || 'N/A'}</td>
                      <td>
                        <span className={styles.sessionTypeBadge}>
                          {appointment.session_type === 'telehealth' ? (
                            <>
                              <VideoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                              Telehealth
                            </>
                          ) : (
                            <>
                              <HospitalIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                              In-Person
                            </>
                          )}
                        </span>
                      </td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getStatusColor(appointment.status) }}
                        >
                          {appointment.status_display || appointment.status}
                        </span>
                      </td>
                      <td>{appointment.duration_minutes || 0} min</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

