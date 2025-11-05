import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Patient } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const AdminPatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = {
        page: 1,
        page_size: 100
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await adminService.getAllPatients(params);
      setPatients(response.results || []);
    } catch (err: any) {
      console.error('Failed to load patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPatients();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
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
              <p>Loading patients...</p>
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
            <h1>All Patients</h1>
            <div className={styles.statsSummary}>
              <span>Total: {patients.length}</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Search */}
          <div className={styles.filtersBar}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                type="text"
                placeholder="Search patients by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchButton}>
                Search
              </button>
            </form>
          </div>

          {/* Patients Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Emergency Contact</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {patients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyCell}>
                      No patients found
                    </td>
                  </tr>
                ) : (
                  patients.map((patient) => (
                    <tr key={patient.id}>
                      <td>{patient.user_name}</td>
                      <td>{patient.user_email}</td>
                      <td>{patient.user_phone || 'N/A'}</td>
                      <td>{formatDate(patient.date_of_birth || '')}</td>
                      <td>{patient.gender || 'N/A'}</td>
                      <td>
                        {patient.emergency_contact_name && (
                          <div>
                            <div>{patient.emergency_contact_name}</div>
                            <div className={styles.smallText}>{patient.emergency_contact_phone}</div>
                          </div>
                        )}
                        {!patient.emergency_contact_name && 'N/A'}
                      </td>
                      <td>{formatDate(patient.created_at)}</td>
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

