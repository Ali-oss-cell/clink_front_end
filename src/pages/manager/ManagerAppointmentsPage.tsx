import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Appointment } from '../../services/api/admin';
import styles from './ManagerPages.module.scss';

export const ManagerAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page_size: 100 };
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminService.getAllAppointments(params);
      setAppointments(response.results);
    } catch (err: any) {
      console.error('Failed to load appointments:', err);
      setError(err.message || 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const filteredAppointments = (appointments || []).filter(apt => {
    const patientName = apt.patient_name?.toLowerCase() || '';
    const psychologistName = apt.psychologist_name?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return patientName.includes(search) || psychologistName.includes(search);
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return styles.statusScheduled;
      case 'completed':
        return styles.statusCompleted;
      case 'cancelled':
        return styles.statusCancelled;
      case 'no_show':
        return styles.statusNoShow;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
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
    <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Appointment Management</h1>
            <p>View and manage clinic appointments</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.filtersRow}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by patient or psychologist name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no_show">No Show</option>
            </select>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(appointments || []).length}</div>
              <div className={styles.statLabel}>Total</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {(appointments || []).filter(a => a.status === 'scheduled').length}
              </div>
              <div className={styles.statLabel}>Scheduled</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {(appointments || []).filter(a => a.status === 'completed').length}
              </div>
              <div className={styles.statLabel}>Completed</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {(appointments || []).filter(a => a.status === 'cancelled').length}
              </div>
              <div className={styles.statLabel}>Cancelled</div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Patient</th>
                  <th>Psychologist</th>
                  <th>Session Type</th>
                  <th>Status</th>
                  <th>Fee</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No appointments found
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.map((appointment) => (
                    <tr key={appointment.id}>
                      <td>{formatDate(appointment.appointment_date)}</td>
                      <td>{appointment.appointment_time || 'N/A'}</td>
                      <td>{appointment.patient_name || 'N/A'}</td>
                      <td>Dr. {appointment.psychologist_name || 'N/A'}</td>
                      <td>{appointment.session_type || 'N/A'}</td>
                      <td>
                        <span className={getStatusClass(appointment.status)}>
                          {appointment.status?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td>
                        {appointment.consultation_fee 
                          ? `$${parseFloat(appointment.consultation_fee).toFixed(2)}` 
                          : 'N/A'}
                      </td>
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

