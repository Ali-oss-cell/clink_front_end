import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Patient } from '../../services/api/admin';
import { CloseIcon } from '../../utils/icons';
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
      const patientsData = response.results || [];
      
      // Debug: Log the first patient to see the actual structure
      if (patientsData.length > 0) {
        console.log('Sample patient data:', patientsData[0]);
      }
      
      setPatients(patientsData);
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
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
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
                  patients.map((patient: Patient) => {
                    // Extract name - API returns multiple formats (name, fullName, firstName+lastName)
                    let name = patient.name || 
                               patient.fullName || 
                               patient.user_name;
                    
                    // If no direct name field, try to construct from first/last name
                    if (!name && (patient.firstName || patient.first_name) && (patient.lastName || patient.last_name)) {
                      const firstName = patient.firstName || patient.first_name || '';
                      const lastName = patient.lastName || patient.last_name || '';
                      name = `${firstName} ${lastName}`.trim();
                    }
                    
                    name = name || 'N/A';
                    
                    // Extract email - API returns email or emailAddress
                    const email = patient.email || 
                                  patient.emailAddress || 
                                  patient.user_email || 
                                  'N/A';
                    
                    // Extract phone - API returns phone or phone_number
                    const phone = patient.phone || 
                                  patient.phone_number || 
                                  patient.user_phone || 
                                  'N/A';
                    
                    // Extract date of birth - API returns date_of_birth or dateOfBirth
                    const dateOfBirth = patient.date_of_birth || 
                                        patient.dateOfBirth || 
                                        '';
                    
                    // Extract gender - API returns gender or gender_identity
                    const gender = patient.gender || 
                                   patient.gender_identity || 
                                   'N/A';
                    
                    // Extract created/registered date
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

