import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type User, type CreateUserRequest, type UpdateUserRequest } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    email: '',
    password: '',
    full_name: '',
    role: 'patient',
    phone: ''
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    email: '',
    full_name: '',
    role: 'patient',
    is_verified: false,
    is_active: true,
    phone: ''
  });

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: 1,
        page_size: 100
      };
      
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      if (statusFilter === 'verified') {
        params.is_verified = true;
      } else if (statusFilter === 'unverified') {
        params.is_verified = false;
      }
      
      if (statusFilter === 'active') {
        params.is_active = true;
      } else if (statusFilter === 'inactive') {
        params.is_active = false;
      }

      const response = await adminService.getAllUsers(params);
      setUsers(response.results || []);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createUser(createForm);
      setShowCreateModal(false);
      setCreateForm({ email: '', password: '', full_name: '', role: 'patient', phone: '' });
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to create user');
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      await adminService.updateUser(selectedUser.id, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await adminService.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      is_verified: user.is_verified,
      is_active: user.is_active,
      phone: user.phone || ''
    });
    setShowEditModal(true);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return '#dc2626';
      case 'psychologist': return '#2563eb';
      case 'practice_manager': return '#059669';
      case 'patient': return '#7c3aed';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading users...</p>
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
            <h1>User Management</h1>
            <button 
              className={styles.primaryButton}
              onClick={() => setShowCreateModal(true)}
            >
              + Create User
            </button>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {/* Filters */}
          <div className={styles.filtersBar}>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Roles</option>
              <option value="patient">Patients</option>
              <option value="psychologist">Psychologists</option>
              <option value="practice_manager">Practice Managers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Users Table */}
          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className={styles.emptyCell}>
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.full_name}</td>
                      <td>{user.email}</td>
                      <td>
                        <span 
                          className={styles.roleBadge}
                          style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                        >
                          {user.role.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <div className={styles.statusCell}>
                          <span className={user.is_verified ? styles.verified : styles.unverified}>
                            {user.is_verified ? '✓ Verified' : '⚠ Unverified'}
                          </span>
                          <span className={user.is_active ? styles.active : styles.inactive}>
                            {user.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.editButton}
                            onClick={() => openEditModal(user)}
                          >
                            Edit
                          </button>
                          <button 
                            className={styles.deleteButton}
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Create User Modal */}
          {showCreateModal && (
            <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Create New User</h2>
                  <button onClick={() => setShowCreateModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreateUser} className={styles.modalForm}>
                  <div className={styles.formGroup}>
                    <label>Full Name</label>
                    <input
                      type="text"
                      value={createForm.full_name}
                      onChange={(e) => setCreateForm({ ...createForm, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      value={createForm.email}
                      onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <input
                      type="password"
                      value={createForm.password}
                      onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                      required
                      minLength={8}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Role</label>
                    <select
                      value={createForm.role}
                      onChange={(e) => setCreateForm({ ...createForm, role: e.target.value as any })}
                      required
                    >
                      <option value="patient">Patient</option>
                      <option value="psychologist">Psychologist</option>
                      <option value="practice_manager">Practice Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone (Optional)</label>
                    <input
                      type="tel"
                      value={createForm.phone}
                      onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    />
                  </div>
                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowCreateModal(false)}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                      Create User
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
              <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                  <h2>Edit User</h2>
                  <button onClick={() => setShowEditModal(false)}>×</button>
                </div>
                <form onSubmit={handleEditUser} className={styles.modalForm}>
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
                    <label>Role</label>
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value as any })}
                      required
                    >
                      <option value="patient">Patient</option>
                      <option value="psychologist">Psychologist</option>
                      <option value="practice_manager">Practice Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>
                      <input
                        type="checkbox"
                        checked={editForm.is_verified}
                        onChange={(e) => setEditForm({ ...editForm, is_verified: e.target.checked })}
                      />
                      Verified
                    </label>
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
                      Update User
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

