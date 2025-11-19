import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type User, type CreateUserRequest, type CreateUserResponse, type UpdateUserRequest } from '../../services/api/admin';
import { CheckCircleIcon, WarningIcon, InfoIcon, CloseIcon } from '../../utils/icons';
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
    role: 'practice_manager',
    phone_number: '',
    // Psychologist fields
    ahpra_registration_number: '',
    ahpra_expiry_date: '',
    title: 'Dr',
    qualifications: '',
    years_experience: 0,
    consultation_fee: '180.00',
    medicare_provider_number: '',
    bio: '',
    is_accepting_new_patients: true
  });

  const [editForm, setEditForm] = useState<UpdateUserRequest>({
    email: '',
    full_name: '',
    role: 'patient',
    is_verified: false,
    is_active: true,
    phone_number: '',
    date_of_birth: '',
    // Psychologist fields
    ahpra_registration_number: '',
    ahpra_expiry_date: '',
    title: 'Dr',
    qualifications: '',
    years_experience: 0,
    consultation_fee: '180.00',
    medicare_provider_number: '',
    bio: '',
    is_accepting_new_patients: true
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
      
      // Only add role filter if not 'all'
      if (roleFilter !== 'all') {
        params.role = roleFilter;
      }
      
      // Handle status filters (note: these are separate filters, not combined)
      if (statusFilter === 'verified') {
        params.is_verified = true;
      } else if (statusFilter === 'unverified') {
        params.is_verified = false;
      } else if (statusFilter === 'active') {
        params.is_active = true;
      } else if (statusFilter === 'inactive') {
        params.is_active = false;
      }

      console.log('Fetching users with params:', params);
      const response = await adminService.getAllUsers(params);
      console.log('Users response:', response);
      setUsers(response.results || []);
      
      if (!response.results || response.results.length === 0) {
        console.log('No users found. Total count:', response.count);
      }
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
      setError(null); // Clear previous errors
      
      // Validate psychologist required fields
      if (createForm.role === 'psychologist') {
        if (!createForm.ahpra_registration_number?.trim()) {
          setError('AHPRA registration number is required for psychologists');
          return;
        }
        if (!createForm.ahpra_expiry_date) {
          setError('AHPRA expiry date is required for psychologists');
          return;
        }
      }
      
      const response = await adminService.createUser(createForm);
      setShowCreateModal(false);
      
      // Reset form
      setCreateForm({ 
        email: '', 
        password: '', 
        full_name: '', 
        role: 'practice_manager', 
        phone_number: '',
        ahpra_registration_number: '',
        ahpra_expiry_date: '',
        title: 'Dr',
        qualifications: '',
        years_experience: 0,
        consultation_fee: '180.00',
        medicare_provider_number: '',
        bio: '',
        is_accepting_new_patients: true
      });
      
      fetchUsers();
      
      // Show success message
      if (response.message) {
        alert(response.message);
      } else if (createForm.role === 'psychologist') {
        alert('Psychologist created successfully with profile!');
      } else {
        alert('User created successfully!');
      }
    } catch (err: any) {
      console.error('Create user error:', err);
      let errorMessage = 'Failed to create user';
      
      if (err.response?.status === 405) {
        errorMessage = 'Error 405: POST method not allowed. The backend endpoint may not support user creation, or the endpoint path may be incorrect. Please check backend configuration.';
      } else if (err.response?.data) {
        // Try to extract detailed error message
        const errorData = err.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (typeof errorData === 'object') {
          // Handle validation errors
          const errorFields = Object.keys(errorData);
          if (errorFields.length > 0) {
            const fieldErrors = errorFields.map(field => {
              const messages = Array.isArray(errorData[field]) 
                ? errorData[field].join(', ') 
                : errorData[field];
              return `${field}: ${messages}`;
            });
            errorMessage = fieldErrors.join('\n');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    try {
      setError(null); // Clear previous errors
      await adminService.updateUser(selectedUser.id, editForm);
      setShowEditModal(false);
      setSelectedUser(null);
      // Reset edit form
      setEditForm({
        email: '',
        full_name: '',
        role: 'patient',
        is_verified: false,
        is_active: true,
        phone_number: '',
        date_of_birth: '',
        ahpra_registration_number: '',
        ahpra_expiry_date: '',
        title: 'Dr',
        qualifications: '',
        years_experience: 0,
        consultation_fee: '180.00',
        medicare_provider_number: '',
        bio: '',
        is_accepting_new_patients: true
      });
      fetchUsers();
      alert('User updated successfully!');
    } catch (err: any) {
      console.error('Update user error:', err);
      let errorMessage = 'Failed to update user';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'object') {
          // Handle validation errors (field-specific errors)
          const errorFields = Object.keys(errorData);
          if (errorFields.length > 0) {
            const fieldErrors = errorFields.map(field => {
              const messages = Array.isArray(errorData[field]) 
                ? errorData[field].join(', ') 
                : errorData[field];
              return `${field}: ${messages}`;
            });
            errorMessage = fieldErrors.join('\n');
          }
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setError(null); // Clear previous errors
      await adminService.deleteUser(id);
      fetchUsers();
      alert('User deleted successfully!');
    } catch (err: any) {
      console.error('Delete user error:', err);
      let errorMessage = 'Failed to delete user';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      // Show error in alert for delete operations (more visible)
      alert(errorMessage);
      setError(errorMessage);
    }
  };

  const openEditModal = async (user: User) => {
    setSelectedUser(user);
    
    // Fetch full user data including psychologist profile if needed
    let fullUserData = user;
    if (user.role === 'psychologist' && !user.psychologist_profile) {
      try {
        fullUserData = await adminService.getUserById(user.id);
      } catch (err) {
        console.error('Failed to fetch user details:', err);
        // Continue with basic user data if fetch fails
      }
    }
    
    const profile = fullUserData.psychologist_profile;
    
    setEditForm({
      email: fullUserData.email,
      full_name: fullUserData.full_name,
      role: fullUserData.role,
      is_verified: fullUserData.is_verified,
      is_active: fullUserData.is_active,
      phone_number: fullUserData.phone || fullUserData.phone_number || '',
      date_of_birth: fullUserData.date_of_birth || '',
      // Psychologist profile fields
      ahpra_registration_number: profile?.ahpra_registration_number || '',
      ahpra_expiry_date: profile?.ahpra_expiry_date || '',
      title: profile?.title || 'Dr',
      qualifications: profile?.qualifications || '',
      years_experience: profile?.years_experience || 0,
      consultation_fee: profile?.consultation_fee || '180.00',
      medicare_provider_number: profile?.medicare_provider_number || '',
      bio: profile?.bio || '',
      is_accepting_new_patients: profile?.is_accepting_new_patients ?? true,
      // Handle specializations and services (extract IDs if they're objects)
      specializations: profile?.specializations 
        ? profile.specializations.map((s: any) => typeof s === 'object' ? s.id : s)
        : undefined,
      services_offered: profile?.services_offered
        ? profile.services_offered.map((s: any) => typeof s === 'object' ? s.id : s)
        : undefined
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
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
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
                            {user.is_verified ? (
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
                  <button onClick={() => setShowCreateModal(false)}><CloseIcon size="sm" /></button>
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
                      <option value="practice_manager">Practice Manager</option>
                      <option value="psychologist">Psychologist</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone Number (Optional)</label>
                    <input
                      type="tel"
                      placeholder="+61400123456 or 0400123456"
                      value={createForm.phone_number || ''}
                      onChange={(e) => setCreateForm({ ...createForm, phone_number: e.target.value })}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Australian format: +61XXXXXXXXX or 0XXXXXXXXX
                    </small>
                  </div>

                  {/* Psychologist-specific fields */}
                  {createForm.role === 'psychologist' && (
                    <>
                      <div style={{ 
                        padding: '12px', 
                        marginBottom: '16px',
                        backgroundColor: '#dbeafe', 
                        border: '1px solid #3b82f6', 
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        color: '#1e40af'
                      }}>
                        <strong><InfoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Psychologist Profile:</strong> The psychologist profile will be created automatically with the information below.
                      </div>

                      <div className={styles.formGroup}>
                        <label>AHPRA Registration Number <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="text"
                          placeholder="PSY0001234567"
                          value={createForm.ahpra_registration_number || ''}
                          onChange={(e) => setCreateForm({ ...createForm, ahpra_registration_number: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>AHPRA Expiry Date <span style={{ color: '#ef4444' }}>*</span></label>
                        <input
                          type="date"
                          value={createForm.ahpra_expiry_date || ''}
                          onChange={(e) => setCreateForm({ ...createForm, ahpra_expiry_date: e.target.value })}
                          required
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Title (Optional)</label>
                        <select
                          value={createForm.title || 'Dr'}
                          onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                        >
                          <option value="Dr">Dr</option>
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Qualifications (Optional)</label>
                        <input
                          type="text"
                          placeholder="PhD Psychology, Master of Clinical Psychology"
                          value={createForm.qualifications || ''}
                          onChange={(e) => setCreateForm({ ...createForm, qualifications: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Years of Experience (Optional)</label>
                        <input
                          type="number"
                          min="0"
                          value={createForm.years_experience || 0}
                          onChange={(e) => setCreateForm({ ...createForm, years_experience: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Consultation Fee (AUD) (Optional)</label>
                        <input
                          type="text"
                          placeholder="180.00"
                          value={createForm.consultation_fee || '180.00'}
                          onChange={(e) => setCreateForm({ ...createForm, consultation_fee: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Medicare Provider Number (Optional)</label>
                        <input
                          type="text"
                          placeholder="1234567A"
                          value={createForm.medicare_provider_number || ''}
                          onChange={(e) => setCreateForm({ ...createForm, medicare_provider_number: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Bio (Optional)</label>
                        <textarea
                          rows={4}
                          placeholder="Professional biography..."
                          value={createForm.bio || ''}
                          onChange={(e) => setCreateForm({ ...createForm, bio: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={createForm.is_accepting_new_patients ?? true}
                            onChange={(e) => setCreateForm({ ...createForm, is_accepting_new_patients: e.target.checked })}
                          />
                          Accepting New Patients
                        </label>
                      </div>
                    </>
                  )}
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
                  <button onClick={() => setShowEditModal(false)}><CloseIcon size="sm" /></button>
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
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+61400123456 or 0400123456"
                      value={editForm.phone_number || ''}
                      onChange={(e) => setEditForm({ ...editForm, phone_number: e.target.value })}
                    />
                    <small style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                      Australian format: +61XXXXXXXXX or 0XXXXXXXXX
                    </small>
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
                  <div className={styles.formGroup}>
                    <label>Date of Birth (Optional)</label>
                    <input
                      type="date"
                      value={editForm.date_of_birth || ''}
                      onChange={(e) => setEditForm({ ...editForm, date_of_birth: e.target.value })}
                    />
                  </div>

                  {/* Psychologist-specific fields */}
                  {editForm.role === 'psychologist' && (
                    <>
                      <div style={{ 
                        padding: '12px', 
                        marginTop: '16px',
                        marginBottom: '16px',
                        backgroundColor: '#dbeafe', 
                        border: '1px solid #3b82f6', 
                        borderRadius: '4px',
                        fontSize: '0.875rem',
                        color: '#1e40af'
                      }}>
                        <strong><InfoIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Psychologist Profile:</strong> Update psychologist profile information below.
                      </div>

                      <div className={styles.formGroup}>
                        <label>AHPRA Registration Number</label>
                        <input
                          type="text"
                          placeholder="PSY0001234567"
                          value={editForm.ahpra_registration_number || ''}
                          onChange={(e) => setEditForm({ ...editForm, ahpra_registration_number: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>AHPRA Expiry Date</label>
                        <input
                          type="date"
                          value={editForm.ahpra_expiry_date || ''}
                          onChange={(e) => setEditForm({ ...editForm, ahpra_expiry_date: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Title</label>
                        <select
                          value={editForm.title || 'Dr'}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        >
                          <option value="Dr">Dr</option>
                          <option value="Mr">Mr</option>
                          <option value="Ms">Ms</option>
                          <option value="Mrs">Mrs</option>
                        </select>
                      </div>

                      <div className={styles.formGroup}>
                        <label>Qualifications</label>
                        <input
                          type="text"
                          placeholder="PhD Psychology, Master of Clinical Psychology"
                          value={editForm.qualifications || ''}
                          onChange={(e) => setEditForm({ ...editForm, qualifications: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Years of Experience</label>
                        <input
                          type="number"
                          min="0"
                          value={editForm.years_experience || 0}
                          onChange={(e) => setEditForm({ ...editForm, years_experience: parseInt(e.target.value) || 0 })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Consultation Fee (AUD)</label>
                        <input
                          type="text"
                          placeholder="180.00"
                          value={editForm.consultation_fee || '180.00'}
                          onChange={(e) => setEditForm({ ...editForm, consultation_fee: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Medicare Provider Number</label>
                        <input
                          type="text"
                          placeholder="1234567A"
                          value={editForm.medicare_provider_number || ''}
                          onChange={(e) => setEditForm({ ...editForm, medicare_provider_number: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>Bio</label>
                        <textarea
                          rows={4}
                          placeholder="Professional biography..."
                          value={editForm.bio || ''}
                          onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                        />
                      </div>

                      <div className={styles.formGroup}>
                        <label>
                          <input
                            type="checkbox"
                            checked={editForm.is_accepting_new_patients ?? true}
                            onChange={(e) => setEditForm({ ...editForm, is_accepting_new_patients: e.target.checked })}
                          />
                          Accepting New Patients
                        </label>
                      </div>
                    </>
                  )}
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

