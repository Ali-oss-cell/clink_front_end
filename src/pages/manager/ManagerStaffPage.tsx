import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type User } from '../../services/api/admin';
import styles from './ManagerPages.module.scss';

export const ManagerStaffPage: React.FC = () => {
  const [staff, setStaff] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    is_active: true
  });

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminService.getAllUsers({ role: 'psychologist', page_size: 100 });
      setStaff(response.results);
    } catch (err: any) {
      console.error('Failed to load staff:', err);
      setError(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (staffMember: User) => {
    setSelectedStaff(staffMember);
    setEditForm({
      full_name: staffMember.full_name,
      email: staffMember.email,
      phone_number: staffMember.phone_number || staffMember.phone || '',
      is_active: staffMember.is_active
    });
    setShowEditModal(true);
  };

  const handleEditStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff) return;

    try {
      setError(null);
      await adminService.updateUser(selectedStaff.id, editForm);
      setShowEditModal(false);
      setSelectedStaff(null);
      fetchStaff();
      alert('Staff member updated successfully!');
    } catch (err: any) {
      console.error('Update staff error:', err);
      setError(err.message || 'Failed to update staff member');
    }
  };

  const filteredStaff = (staff || []).filter(s => 
    s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <p>Loading staff...</p>
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
            <h1>Staff Management</h1>
            <p>Manage psychologist profiles and information</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.searchBar}>
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(staff || []).length}</div>
              <div className={styles.statLabel}>Total Staff</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(staff || []).filter(s => s.is_active).length}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(staff || []).filter(s => s.is_verified).length}</div>
              <div className={styles.statLabel}>Verified</div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyState}>
                      No staff members found
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staffMember) => (
                    <tr key={staffMember.id}>
                      <td>{staffMember.full_name}</td>
                      <td>{staffMember.email}</td>
                      <td>{staffMember.phone_number || staffMember.phone || 'N/A'}</td>
                      <td>
                        <span className={staffMember.is_active ? styles.statusActive : styles.statusInactive}>
                          {staffMember.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {staffMember.is_verified && <span className={styles.verifiedBadge}>✓</span>}
                      </td>
                      <td>{formatDate(staffMember.created_at)}</td>
                      <td>
                        <button
                          onClick={() => openEditModal(staffMember)}
                          className={styles.actionButton}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Edit Modal */}
          {showEditModal && selectedStaff && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h2>Edit Staff Member</h2>
                <form onSubmit={handleEditStaff}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number</label>
                    <input
                      type="text"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                      placeholder="+61XXXXXXXXX"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={editForm.is_active}
                        onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                      />
                      Active
                    </label>
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowEditModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                      Update
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

