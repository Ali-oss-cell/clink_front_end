import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { resourceService, type Resource, type CreateResourceRequest, type UpdateResourceRequest, type ResourceCategory } from '../../services/api/resources';
import styles from '../admin/AdminPages.module.scss';

export const ManagerResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [categories, setCategories] = useState<ResourceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateResourceRequest>({
    title: '',
    description: '',
    category: '',
    type: 'article',
    icon: '📄',
    content: '',
    content_type: 'html',
    duration_minutes: undefined,
    difficulty_level: 'beginner',
    tags: [],
    is_published: false,
    is_featured: false
  });

  const [editForm, setEditForm] = useState<UpdateResourceRequest>({
    title: '',
    description: '',
    category: '',
    type: 'article',
    icon: '📄',
    content: '',
    content_type: 'html',
    duration_minutes: undefined,
    difficulty_level: 'beginner',
    tags: [],
    is_published: false,
    is_featured: false
  });

  const [tagsInput, setTagsInput] = useState('');
  const [editTagsInput, setEditTagsInput] = useState('');

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchResources();
    fetchCategories();
  }, [categoryFilter, typeFilter, statusFilter]);

  const fetchResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = {
        page: 1,
        page_size: 100
      };
      
      if (categoryFilter !== 'all') {
        params.category = categoryFilter;
      }
      
      if (typeFilter !== 'all') {
        params.type = typeFilter;
      }

      const response = await resourceService.getResources(params);
      let filteredResources = response.results || [];
      
      if (statusFilter === 'published') {
        filteredResources = filteredResources.filter((r: any) => r.is_published !== false);
      } else if (statusFilter === 'unpublished') {
        filteredResources = filteredResources.filter((r: any) => r.is_published === false);
      }
      
      setResources(filteredResources);
    } catch (err: any) {
      console.error('Failed to load resources:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await resourceService.getCategories();
      setCategories(data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      
      if (!createForm.title.trim()) {
        setError('Title is required');
        return;
      }
      if (!createForm.description.trim()) {
        setError('Description is required');
        return;
      }
      if (!createForm.category) {
        setError('Category is required');
        return;
      }

      const tagsArray = tagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await resourceService.createResource({
        ...createForm,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });
      
      setShowCreateModal(false);
      setCreateForm({
        title: '',
        description: '',
        category: '',
        type: 'article',
        icon: '📄',
        content: '',
        content_type: 'html',
        duration_minutes: undefined,
        difficulty_level: 'beginner',
        tags: [],
        is_published: false,
        is_featured: false
      });
      setTagsInput('');
      fetchResources();
      alert('✅ Resource created successfully!');
    } catch (err: any) {
      console.error('Failed to create resource:', err);
      setError(err.message || 'Failed to create resource');
    }
  };

  const handleEditResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResource) return;
    
    try {
      setError(null);
      
      const tagsArray = editTagsInput.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      await resourceService.updateResource(selectedResource.id, {
        ...editForm,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      });
      
      setShowEditModal(false);
      setSelectedResource(null);
      fetchResources();
      alert('✅ Resource updated successfully!');
    } catch (err: any) {
      console.error('Failed to update resource:', err);
      setError(err.message || 'Failed to update resource');
    }
  };

  const handleDeleteResource = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
      return;
    }
    
    try {
      await resourceService.deleteResource(id);
      fetchResources();
      alert('✅ Resource deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete resource:', err);
      alert(`Failed to delete resource: ${err.message}`);
    }
  };

  const openEditModal = (resource: Resource) => {
    setSelectedResource(resource);
    setEditForm({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      icon: resource.icon,
      difficulty_level: resource.difficulty_level || 'beginner',
      duration_minutes: resource.duration_minutes,
      is_published: (resource as any).is_published ?? false,
      is_featured: (resource as any).is_featured ?? false
    });
    setEditTagsInput((resource as any).tags?.join(', ') || '');
    setShowEditModal(true);
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resourceTypes = ['article', 'video', 'audio', 'pdf', 'worksheet', 'infographic', 'interactive'];
  const difficultyLevels = ['beginner', 'intermediate', 'advanced'];

  return (
    <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
      <div className={styles.dashboardContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.welcomeTitle}>Resource Management</h1>
            <p className={styles.welcomeSubtitle}>Create, edit, and manage mental health resources</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          {/* Filters and Actions */}
          <div className={styles.filtersSection}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            
            <div className={styles.filterGroup}>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Types</option>
                {resourceTypes.map(type => (
                  <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
              </select>

              <button
                onClick={() => setShowCreateModal(true)}
                className={styles.primaryButton}
              >
                + Create Resource
              </button>
            </div>
          </div>

          {/* Resources Table */}
          {loading ? (
            <div className={styles.loadingState}>
              <p>Loading resources...</p>
            </div>
          ) : filteredResources.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No resources found.</p>
            </div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Icon</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Type</th>
                    <th>Difficulty</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResources.map((resource) => (
                    <tr key={resource.id}>
                      <td>{resource.icon}</td>
                      <td>
                        <div className={styles.resourceTitle}>
                          <strong>{resource.title}</strong>
                          <span className={styles.resourceDescription}>
                            {resource.description.substring(0, 60)}...
                          </span>
                        </div>
                      </td>
                      <td>{resource.category}</td>
                      <td>
                        <span className={styles.badge}>{resource.type}</span>
                      </td>
                      <td>{resource.difficulty_level}</td>
                      <td>{resource.view_count || 0}</td>
                      <td>
                        {(resource as any).is_published ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>Published</span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeWarning}`}>Draft</span>
                        )}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() => openEditModal(resource)}
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className={styles.deleteButton}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Modal - Same as Admin */}
          {showCreateModal && (
            <div className={styles.modalOverlay} onClick={() => setShowCreateModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2>Create New Resource</h2>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleCreateResource}>
                  <div className={styles.formGroup}>
                    <label>Title *</label>
                    <input
                      type="text"
                      value={createForm.title}
                      onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description *</label>
                    <textarea
                      value={createForm.description}
                      onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        value={createForm.category}
                        onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Type *</label>
                      <select
                        value={createForm.type}
                        onChange={(e) => setCreateForm({ ...createForm, type: e.target.value })}
                        required
                      >
                        {resourceTypes.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Icon</label>
                      <input
                        type="text"
                        value={createForm.icon}
                        onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
                        placeholder="📄"
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Difficulty Level</label>
                      <select
                        value={createForm.difficulty_level}
                        onChange={(e) => setCreateForm({ ...createForm, difficulty_level: e.target.value })}
                      >
                        {difficultyLevels.map(level => (
                          <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={createForm.duration_minutes || ''}
                        onChange={(e) => setCreateForm({ ...createForm, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Content (HTML)</label>
                    <textarea
                      value={createForm.content}
                      onChange={(e) => setCreateForm({ ...createForm, content: e.target.value })}
                      rows={6}
                      placeholder="<p>Enter HTML content here...</p>"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="anxiety, mental-health, self-help"
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={createForm.is_published}
                          onChange={(e) => setCreateForm({ ...createForm, is_published: e.target.checked })}
                        />
                        Published
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={createForm.is_featured}
                          onChange={(e) => setCreateForm({ ...createForm, is_featured: e.target.checked })}
                        />
                        Featured
                      </label>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowCreateModal(false)} className={styles.secondaryButton}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                      Create Resource
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal - Same as Admin */}
          {showEditModal && selectedResource && (
            <div className={styles.modalOverlay} onClick={() => setShowEditModal(false)}>
              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2>Edit Resource</h2>
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5rem',
                      color: '#6b7280',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '50%',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    ×
                  </button>
                </div>
                <form onSubmit={handleEditResource}>
                  <div className={styles.formGroup}>
                    <label>Title *</label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Description *</label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Category *</label>
                      <select
                        value={editForm.category}
                        onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                        required
                      >
                        <option value="">Select category</option>
                        {categories.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Type *</label>
                      <select
                        value={editForm.type}
                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                        required
                      >
                        {resourceTypes.map(type => (
                          <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Icon</label>
                      <input
                        type="text"
                        value={editForm.icon}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label>Difficulty Level</label>
                      <select
                        value={editForm.difficulty_level}
                        onChange={(e) => setEditForm({ ...editForm, difficulty_level: e.target.value })}
                      >
                        {difficultyLevels.map(level => (
                          <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                        ))}
                      </select>
                    </div>

                    <div className={styles.formGroup}>
                      <label>Duration (minutes)</label>
                      <input
                        type="number"
                        value={editForm.duration_minutes || ''}
                        onChange={(e) => setEditForm({ ...editForm, duration_minutes: e.target.value ? parseInt(e.target.value) : undefined })}
                        min="0"
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Content (HTML)</label>
                    <textarea
                      value={editForm.content}
                      onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                      rows={6}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Tags (comma-separated)</label>
                    <input
                      type="text"
                      value={editTagsInput}
                      onChange={(e) => setEditTagsInput(e.target.value)}
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={editForm.is_published}
                          onChange={(e) => setEditForm({ ...editForm, is_published: e.target.checked })}
                        />
                        Published
                      </label>
                    </div>

                    <div className={styles.formGroup}>
                      <label>
                        <input
                          type="checkbox"
                          checked={editForm.is_featured}
                          onChange={(e) => setEditForm({ ...editForm, is_featured: e.target.checked })}
                        />
                        Featured
                      </label>
                    </div>
                  </div>

                  <div className={styles.modalActions}>
                    <button type="button" onClick={() => setShowEditModal(false)} className={styles.secondaryButton}>
                      Cancel
                    </button>
                    <button type="submit" className={styles.primaryButton}>
                      Update Resource
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

