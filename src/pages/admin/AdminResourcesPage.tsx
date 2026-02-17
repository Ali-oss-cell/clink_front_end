import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { resourceService, type Resource, type CreateResourceRequest, type UpdateResourceRequest, type ResourceCategory } from '../../services/api/resources';
import { DocumentIcon, CheckCircleIcon, CloseIcon } from '../../utils/icons';
import styles from './AdminPages.module.scss';

export const AdminResourcesPage: React.FC = () => {
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
  
  // File upload states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null | undefined>(undefined);
  const [editPdfFile, setEditPdfFile] = useState<File | null | undefined>(undefined);
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [existingPdfUrl, setExistingPdfUrl] = useState<string | null>(null);

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
      
      // Client-side status filter (published/unpublished)
      if (statusFilter === 'published') {
        // Note: This assumes resources have is_published field in the response
        // You may need to adjust based on actual API response
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
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        image_file: imageFile || undefined,
        pdf_file: pdfFile || undefined
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
      setImageFile(null);
      setPdfFile(null);
      setImagePreview(null);
      fetchResources();
      alert('Resource created successfully!');
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
      
      const updateData: UpdateResourceRequest = {
        ...editForm,
        tags: tagsArray.length > 0 ? tagsArray : undefined
      };
      
      // Only include file fields if they were explicitly changed
      if (editImageFile !== undefined) {
        updateData.image_file = editImageFile;
      }
      if (editPdfFile !== undefined) {
        updateData.pdf_file = editPdfFile;
      }
      
      await resourceService.updateResource(selectedResource.id, updateData);
      
      setShowEditModal(false);
      setSelectedResource(null);
      setEditImageFile(undefined);
      setEditPdfFile(undefined);
      setEditImagePreview(null);
      setExistingImageUrl(null);
      setExistingPdfUrl(null);
      fetchResources();
      alert('Resource updated successfully!');
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
      alert('Resource deleted successfully!');
    } catch (err: any) {
      console.error('Failed to delete resource:', err);
      alert(`Failed to delete resource: ${err.message}`);
    }
  };

  const openEditModal = async (resource: Resource) => {
    setSelectedResource(resource);
    
    // Load full resource details to get media_url and download_url
    let resourceDetail: any = null;
    try {
      resourceDetail = await resourceService.getResource(resource.id);
    } catch (err) {
      console.error('Failed to load resource details:', err);
    }
    
    setEditForm({
      title: resource.title,
      description: resource.description,
      category: resource.category,
      type: resource.type,
      icon: resource.icon,
      difficulty_level: resource.difficulty_level || 'beginner',
      duration_minutes: resource.duration_minutes,
      is_published: (resource as any).is_published ?? false,
      is_featured: (resource as any).is_featured ?? false,
      thumbnail_url: resource.thumbnail_url || resourceDetail?.thumbnail_url || undefined,
      media_url: resourceDetail?.media_url || undefined,
      download_url: resourceDetail?.download_url || undefined
    });
    setEditTagsInput((resource as any).tags?.join(', ') || '');
    
    // Reset file states
    setEditImageFile(undefined);
    setEditPdfFile(undefined);
    setEditImagePreview(null);
    
    // Load existing file URLs if available
    if (resourceDetail) {
      setExistingImageUrl(resourceDetail.image_file_url || resourceDetail.thumbnail_image_url || null);
      setExistingPdfUrl(resourceDetail.pdf_file_url || null);
    } else {
      setExistingImageUrl(resource.thumbnail_image_url || resource.thumbnail_url || null);
      setExistingPdfUrl(null);
    }
    
    setShowEditModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handlePdfChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isEdit) {
        setEditPdfFile(file);
      } else {
        setPdfFile(file);
      }
    }
  };

  const removeImage = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditImageFile(null);
      setEditImagePreview(null);
      setExistingImageUrl(null);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const removePdf = (isEdit: boolean = false) => {
    if (isEdit) {
      setEditPdfFile(null);
      setExistingPdfUrl(null);
    } else {
      setPdfFile(null);
    }
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
                      <td>{resource.category_display || resource.category}</td>
                      <td>
                        <span className={styles.badge}>{resource.type_display || resource.type}</span>
                      </td>
                      <td>{resource.difficulty_display || resource.difficulty_level}</td>
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

          {/* Create Modal */}
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
                      color: '#7a7b7a',
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ebe8e3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <CloseIcon size="sm" />
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
                        placeholder="Document icon"
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

                  {/* File Upload Section */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Image File (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, false)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {imagePreview && (
                        <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                          <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              border: '1px solid #c8c5c0'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(false)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            <CloseIcon size="sm" />
                          </button>
                        </div>
                      )}
                      <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                        Upload an image file (JPEG, PNG, GIF, WebP)
                      </small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>PDF File (Optional)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handlePdfChange(e, false)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {pdfFile && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ color: '#2e7d42', fontSize: '0.875rem' }}>
                            <DocumentIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {pdfFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePdf(false)}
                            style={{
                              marginLeft: '0.5rem',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                        Upload a PDF file
                      </small>
                    </div>
                  </div>

                  {/* External URL Fields */}
                  <div className={styles.formGroup}>
                    <label>External Image URL (Optional - Alternative to file upload)</label>
                    <input
                      type="url"
                      value={createForm.thumbnail_url || ''}
                      onChange={(e) => setCreateForm({ ...createForm, thumbnail_url: e.target.value || undefined })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      Use this if you want to use an external image URL instead of uploading a file
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Media URL (Optional - For Videos/Audio)</label>
                    <input
                      type="url"
                      value={createForm.media_url || ''}
                      onChange={(e) => setCreateForm({ ...createForm, media_url: e.target.value || undefined })}
                      placeholder="https://www.youtube.com/watch?v=... or https://soundcloud.com/..."
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      For video/audio resources: YouTube, Vimeo, SoundCloud, or direct media links
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>External Download URL (Optional - Alternative to PDF upload)</label>
                    <input
                      type="url"
                      value={createForm.download_url || ''}
                      onChange={(e) => setCreateForm({ ...createForm, download_url: e.target.value || undefined })}
                      placeholder="https://example.com/document.pdf"
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      Use this if you want to use an external download URL instead of uploading a PDF file
                    </small>
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

          {/* Edit Modal */}
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
                      color: '#7a7b7a',
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
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ebe8e3'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <CloseIcon size="sm" />
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

                  {/* File Upload Section */}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label>Image File (Optional)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, true)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {editImagePreview && (
                        <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                          <img
                            src={editImagePreview}
                            alt="Preview"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              border: '1px solid #c8c5c0'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(true)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            <CloseIcon size="sm" />
                          </button>
                        </div>
                      )}
                      {existingImageUrl && !editImagePreview && (
                        <div style={{ marginTop: '0.5rem', position: 'relative', display: 'inline-block' }}>
                          <img
                            src={existingImageUrl}
                            alt="Current"
                            style={{
                              maxWidth: '200px',
                              maxHeight: '200px',
                              borderRadius: '8px',
                              border: '1px solid #c8c5c0'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(true)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            <CloseIcon size="sm" />
                          </button>
                          <small style={{ display: 'block', marginTop: '0.25rem', color: '#7a7b7a' }}>
                            Current image
                          </small>
                        </div>
                      )}
                      <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                        Upload a new image or remove existing one
                      </small>
                    </div>

                    <div className={styles.formGroup}>
                      <label>PDF File (Optional)</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => handlePdfChange(e, true)}
                        style={{ marginBottom: '0.5rem' }}
                      />
                      {editPdfFile && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <span style={{ color: '#2e7d42', fontSize: '0.875rem' }}>
                            <DocumentIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            {editPdfFile.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removePdf(true)}
                            style={{
                              marginLeft: '0.5rem',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      {existingPdfUrl && !editPdfFile && (
                        <div style={{ marginTop: '0.5rem' }}>
                          <a
                            href={existingPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: '#5a8cb8', fontSize: '0.875rem', textDecoration: 'none' }}
                          >
                            <DocumentIcon size="sm" style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                            View current PDF
                          </a>
                          <button
                            type="button"
                            onClick={() => removePdf(true)}
                            style={{
                              marginLeft: '0.5rem',
                              background: '#c0392b',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              padding: '0.25rem 0.5rem',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                      <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                        Upload a new PDF or remove existing one
                      </small>
                    </div>
                  </div>

                  {/* External URL Fields */}
                  <div className={styles.formGroup}>
                    <label>External Image URL (Optional - Alternative to file upload)</label>
                    <input
                      type="url"
                      value={editForm.thumbnail_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, thumbnail_url: e.target.value || undefined })}
                      placeholder="https://example.com/image.jpg"
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      Use this if you want to use an external image URL instead of uploading a file
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Media URL (Optional - For Videos/Audio)</label>
                    <input
                      type="url"
                      value={editForm.media_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, media_url: e.target.value || undefined })}
                      placeholder="https://www.youtube.com/watch?v=... or https://soundcloud.com/..."
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      For video/audio resources: YouTube, Vimeo, SoundCloud, or direct media links
                    </small>
                  </div>

                  <div className={styles.formGroup}>
                    <label>External Download URL (Optional - Alternative to PDF upload)</label>
                    <input
                      type="url"
                      value={editForm.download_url || ''}
                      onChange={(e) => setEditForm({ ...editForm, download_url: e.target.value || undefined })}
                      placeholder="https://example.com/document.pdf"
                    />
                    <small style={{ color: '#7a7b7a', display: 'block', marginTop: '0.25rem' }}>
                      Use this if you want to use an external download URL instead of uploading a PDF file
                    </small>
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

