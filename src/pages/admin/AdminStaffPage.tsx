import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, WarningIcon, CloseIcon } from '../../utils/icons';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type User } from '../../services/api/admin';
import styles from './AdminPages.module.scss';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export const AdminStaffPage: React.FC = () => {
  const [psychologists, setPsychologists] = useState<User[]>([]);
  const [practiceManagers, setPracticeManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'psychologists' | 'managers'>('psychologists');
  const [searchTerm, setSearchTerm] = useState('');

  const user = authService.getStoredUser();
  const navigate = useNavigate();

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

  const filteredPsychologists = psychologists.filter((p) => {
    const q = searchTerm.toLowerCase();
    const name = (p.full_name || '').toLowerCase();
    const email = (p.email || '').toLowerCase();
    const ahpra = (p.psychologist_profile?.ahpra_registration_number || '').toLowerCase();
    return name.includes(q) || email.includes(q) || ahpra.includes(q);
  });

  const filteredManagers = practiceManagers.filter((m) => {
    const q = searchTerm.toLowerCase();
    const name = (m.full_name || '').toLowerCase();
    const email = (m.email || '').toLowerCase();
    return name.includes(q) || email.includes(q);
  });

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
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  navigate('/admin/users', { state: { openCreatePsychologist: true } })
                }
              >
                Add psychologist
              </Button>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <Button onClick={() => setError(null)}><CloseIcon size="sm" /></Button>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabContainer}>
            <Button
              className={`${styles.tab} ${activeTab === 'psychologists' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('psychologists')}
            >
              Psychologists ({psychologists.length})
            </Button>
            <Button
              className={`${styles.tab} ${activeTab === 'managers' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('managers')}
            >
              Practice Managers ({practiceManagers.length})
            </Button>
          </div>

          {/* Search */}
          <div className={styles.filtersBar}>
            <Input
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
                  {activeTab === 'psychologists' && (
                    <>
                      <th>AHPRA</th>
                      <th>Accepting patients</th>
                    </>
                  )}
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentStaff.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === 'psychologists' ? 9 : 7}
                      className={styles.emptyCell}
                    >
                      No {activeTab} found
                    </td>
                  </tr>
                ) : (
                  currentStaff.map((staff) => (
                    <tr key={staff.id}>
                      <td>{staff.full_name}</td>
                      <td>{staff.email}</td>
                      <td>{staff.phone || staff.phone_number || 'N/A'}</td>
                      {activeTab === 'psychologists' && (
                        <>
                          <td>
                            {staff.psychologist_profile?.ahpra_registration_number || '—'}
                          </td>
                          <td>
                            {staff.psychologist_profile?.is_accepting_new_patients === false
                              ? 'No'
                              : 'Yes'}
                          </td>
                        </>
                      )}
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
                      <td>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            navigate('/admin/users', { state: { openUserId: staff.id } })
                          }
                        >
                          Manage
                        </Button>
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

