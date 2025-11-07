import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Patient } from '../../services/api/admin';
import styles from './ManagerPages.module.scss';

export const ManagerPatientsPage: React.FC = () => {
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
      const response = await adminService.getAllPatients({ page_size: 100 });
      setPatients(response.results);
    } catch (err: any) {
      console.error('Failed to load patients:', err);
      setError(err.message || 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  };

  const filteredPatients = (patients || []).filter(patient => {
    const name = patient.name || patient.fullName || patient.user_name || '';
    const email = patient.email || patient.emailAddress || patient.user_email || '';
    return (
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
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
    <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Patient Management</h1>
            <p>View and manage patient information</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search patients by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(patients || []).length}</div>
              <div className={styles.statLabel}>Total Patients</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>
                {(patients || []).filter(p => {
                  const created = p.created_at || p.registered_date || p.registeredDate;
                  if (!created) return false;
                  const monthAgo = new Date();
                  monthAgo.setMonth(monthAgo.getMonth() - 1);
                  return new Date(created) > monthAgo;
                }).length}
              </div>
              <div className={styles.statLabel}>New This Month</div>
            </div>
          </div>

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
                  <th>Registered</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className={styles.emptyState}>
                      No patients found
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient: Patient) => {
                    let name = patient.name ||
                               patient.fullName ||
                               patient.user_name;

                    if (!name && (patient.firstName || patient.first_name) && (patient.lastName || patient.last_name)) {
                      const firstName = patient.firstName || patient.first_name || '';
                      const lastName = patient.lastName || patient.last_name || '';
                      name = `${firstName} ${lastName}`.trim();
                    }

                    name = name || 'N/A';

                    const email = patient.email ||
                                 patient.emailAddress ||
                                 patient.user_email ||
                                 'N/A';

                    const phone = patient.phone ||
                                 patient.phone_number ||
                                 patient.user_phone ||
                                 'N/A';

                    const dateOfBirth = patient.date_of_birth ||
                                       patient.dateOfBirth ||
                                       '';

                    const gender = patient.gender ||
                                  patient.gender_identity ||
                                  'N/A';

                    const createdDate = patient.created_at ||
                                       patient.registered_date ||
                                       patient.registeredDate ||
                                       '';

                    return (
                      <tr key={patient.id}>
                        <td>{name}</td>
                        <td>{email}</td>
                        <td>{phone}</td>
                        <td>{formatDate(dateOfBirth)}</td>
                        <td>{gender}</td>
                        <td>
                          {patient.emergency_contact_name ? (
                            <div>
                              <div>{patient.emergency_contact_name}</div>
                              {patient.emergency_contact_phone && (
                                <div className={styles.smallText}>{patient.emergency_contact_phone}</div>
                              )}
                            </div>
                          ) : (
                            'N/A'
                          )}
                        </td>
                        <td>{formatDate(createdDate)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

