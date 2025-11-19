import { useState, useEffect } from 'react';
import { CheckCircleIcon, WarningIcon, CloseIcon } from '../../utils/icons';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type User } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const AdminStaffPage: React.FC = () => {
  const [psychologists, setPsychologists] = useState<User[]>([]);
  const [practiceManagers, setPracticeManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'psychologists' | 'managers'>('psychologists');
  const [searchTerm, setSearchTerm] = useState('');

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [psychResponse, managerResponse] = await Promise.all([
        adminService.getPsychologists({ page: 1, page_size: 100 }),
        adminService.getPracticeManagers({ page: 1, page_size: 100 })
      ]);

      setPsychologists(psychResponse.results || []);
      setPracticeManagers(managerResponse.results || []);
    } catch (err: any) {
      console.error('Failed to load staff:', err);
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const filteredPsychologists = psychologists.filter(p => 
    p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredManagers = practiceManagers.filter(m => 
    m.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading staff...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const currentStaff = activeTab === 'psychologists' ? filteredPsychologists : filteredManagers;

  return (
    <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>All Staff</h1>
            <div className={styles.statsSummary}>
              <span>Psychologists: {psychologists.length}</span>
              <span>Managers: {practiceManagers.length}</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'psychologists' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('psychologists')}
            >
              Psychologists ({psychologists.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'managers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('managers')}
            >
              Practice Managers ({practiceManagers.length})
            </button>
          </div>

          {/* Search */}
          <div className={styles.filtersBar}>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Staff Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {currentStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      No {activeTab} found
                    </td>
                  </tr>
                ) : (
                  currentStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.full_name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phone || 'N/A'}</td>
                      <td>
                        <div className={styles.statusCell}>
                          <span className={staff.is_verified ? styles.verified : styles.unverified}>
                            {staff.is_verified ? (
                              <>
                                <CheckCircleIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Verified
                              </>
                            ) : (
                              <>
                                <WarningIcon size="xs" style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                Unverified
                              </>
                            )}
                          </span>
                          <span className={staff.is_active ? styles.active : styles.inactive}>
                            {staff.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(staff.created_at)}</td>
                      <td>{staff.last_login ? formatDate(staff.last_login) : 'Never'}</td>
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

