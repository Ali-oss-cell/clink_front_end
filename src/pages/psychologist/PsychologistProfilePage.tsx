import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { psychologistService } from '../../services/api/psychologist';
import { authService } from '../../services/api/auth';
import type { PsychologistProfile } from '../../services/api/psychologist';
import { StarIcon } from '../../utils/icons';
import styles from './PsychologistPages.module.scss';

export const PsychologistProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<PsychologistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<PsychologistProfile>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  const user = authService.getStoredUser();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await psychologistService.getMyProfile();
        setProfile(profileData);
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(`Failed to load profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        title: profile.title,
        qualifications: profile.qualifications,
        years_experience: profile.years_experience,
        bio: profile.bio,
        practice_name: profile.practice_name,
        practice_address: profile.practice_address,
        practice_phone: profile.practice_phone,
        practice_email: profile.practice_email,
        personal_website: profile.personal_website,
        languages_spoken: profile.languages_spoken,
        session_types: profile.session_types,
        insurance_providers: profile.insurance_providers,
        billing_methods: profile.billing_methods,
        medicare_rebate_amount: profile.medicare_rebate_amount,
        working_hours: profile.working_hours,
        working_days: profile.working_days || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        start_time: profile.start_time || '09:00',
        end_time: profile.end_time || '17:00',
        session_duration_minutes: profile.session_duration_minutes,
        break_between_sessions_minutes: profile.break_between_sessions_minutes,
        telehealth_available: profile.telehealth_available,
        in_person_available: profile.in_person_available,
        is_accepting_new_patients: profile.is_accepting_new_patients,
        max_patients_per_day: profile.max_patients_per_day || 10,
        is_active_practitioner: profile.is_active_practitioner || true
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      const updatedProfile = await psychologistService.updateProfile(profile.id, editForm);
      setProfile(updatedProfile);
      setIsEditing(false);
      setEditForm({});
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert(`Failed to update profile: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleInputChange = (field: keyof PsychologistProfile, value: any) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    try {
      setUploadingImage(true);
      const result = await psychologistService.uploadProfileImage(profile.id, file);
      
      // Update the profile with the new image URL
      setProfile(prev => prev ? { 
        ...prev, 
        profile_image_url: result.image_url,
        has_profile_image: true 
      } : null);
      
      alert('Profile image updated successfully!');
    } catch (err) {
      console.error('Failed to upload image:', err);
      alert(`Failed to upload image: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <Layout 
        user={user} 
        isAuthenticated={true}
        className={styles.psychologistLayout}
      >
        <div className={styles.profileContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>My Profile</h1>
              <p className={styles.pageSubtitle}>Loading your profile...</p>
            </div>
            <div className={styles.loadingState}>
              <p>Loading profile data...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout 
        user={user} 
        isAuthenticated={true}
        className={styles.psychologistLayout}
      >
        <div className={styles.profileContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>My Profile</h1>
              <p className={styles.pageSubtitle}>Error loading profile</p>
            </div>
            <div className={styles.errorState}>
              <h3>Unable to Load Profile</h3>
              <p><strong>Error:</strong> {error}</p>
              <button 
                className={styles.retryButton}
                onClick={() => window.location.reload()}
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout 
        user={user} 
        isAuthenticated={true}
        className={styles.psychologistLayout}
      >
        <div className={styles.profileContainer}>
          <div className="container">
            <div className={styles.pageHeader}>
              <h1 className={styles.pageTitle}>My Profile</h1>
              <p className={styles.pageSubtitle}>No profile data available</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.psychologistLayout}
    >
      <div className={styles.profileContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>My Profile</h1>
            <p className={styles.pageSubtitle}>
              Manage your professional profile and practice information.
            </p>
          </div>

          {/* Profile Card */}
          <div className={styles.profileCard}>
            <div className={styles.profileHeader}>
              <div className={styles.profilePicture}>
                {profile.profile_image_url ? (
                  <>
                    <img 
                      src={(() => {
                        if (!profile.profile_image_url) return '';
                        if (profile.profile_image_url.startsWith('http')) {
                          return profile.profile_image_url;
                        }
                        // For relative paths, construct URL from API base URL
                        // Remove /api suffix if present, as media files are served from root
                        const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
                        const baseUrl = apiBase.replace(/\/api$/, '');
                        const imagePath = profile.profile_image_url.startsWith('/') 
                          ? profile.profile_image_url 
                          : `/${profile.profile_image_url}`;
                        return `${baseUrl}${imagePath}`;
                      })()}
                      alt={`${profile.display_name} profile`}
                      className={styles.profileImage}
                    />
                    <div className={styles.uploadOverlay}>
                      <input
                        type="file"
                        id="profile-image-upload"
                        accept="image/*"
                        onChange={handleImageUpload}
                        style={{ display: 'none' }}
                        disabled={uploadingImage}
                      />
                      <label htmlFor="profile-image-upload" className={styles.uploadButton}>
                        {uploadingImage ? 'Uploading...' : 'Change Photo'}
                      </label>
                    </div>
                  </>
                ) : (
                  <div className={styles.profileImagePlaceholder}>
                    <input
                      type="file"
                      id="profile-image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                    <label htmlFor="profile-image-upload" className={styles.placeholderUploadButton}>
                      {uploadingImage ? 'Uploading...' : 'Upload Photo'}
                    </label>
                  </div>
                )}
              </div>
              
              <div className={styles.profileInfo}>
                <h2 className={styles.profileName}>{profile.display_name}</h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={styles.editableInput}
                    placeholder="Dr, Prof, etc."
                  />
                ) : (
                  <p className={styles.profileTitle}>{profile.title}</p>
                )}
                <div className={styles.profileBadges}>
                  <span className={styles.ahpraBadge}>AHPRA: {profile.ahpra_registration_number}</span>
                  <span className={styles.experienceBadge}>{profile.years_experience} years experience</span>
                </div>
              </div>
              
              <div className={styles.profileStatus}>
                <span className={styles.statusBadge}>
                  {profile.is_accepting_new_patients ? 'Accepting new patients' : 'Not accepting new patients'}
                </span>
                <p className={styles.nextAvailable}>Experience Level: {profile.experience_level}</p>
              </div>
            </div>
            
            <div className={styles.profileDetails}>
              {/* Qualifications */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Qualifications</h4>
                {isEditing ? (
                  <textarea
                    value={editForm.qualifications || ''}
                    onChange={(e) => handleInputChange('qualifications', e.target.value)}
                    className={styles.editableTextarea}
                    rows={3}
                  />
                ) : (
                  <p className={styles.sectionContent}>{profile.qualifications}</p>
                )}
              </div>
              
              {/* Specializations */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Specializations</h4>
                <div className={styles.specializationsList}>
                  {profile.specializations_list && Array.isArray(profile.specializations_list) ? 
                    profile.specializations_list.map((spec: any, index) => (
                      <span key={index} className={styles.specializationTag}>
                        {typeof spec === 'object' ? (spec as any).name || (spec as any).title || JSON.stringify(spec) : spec}
                      </span>
                    )) : (
                      <span className={styles.specializationTag}>No specializations listed</span>
                    )
                  }
                </div>
              </div>
              
              {/* Bio */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>About Me</h4>
                {isEditing ? (
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={styles.editableTextarea}
                    rows={4}
                  />
                ) : (
                  <p className={styles.sectionContent}>{profile.bio}</p>
                )}
              </div>
              
              {/* Consultation Fee */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Consultation Fee</h4>
                <div className={styles.feeDetails}>
                  <p><strong>Full Fee:</strong> ${profile.consultation_fee}</p>
                  <p><strong>Medicare Rebate:</strong> ${profile.medicare_rebate_amount}</p>
                  <p><strong>Your Cost:</strong> ${profile.patient_cost_after_rebate}</p>
                </div>
              </div>

              {/* Practice Location */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Practice Location</h4>
                {isEditing ? (
                  <div className={styles.editableFields}>
                    <input
                      type="text"
                      value={editForm.practice_name || ''}
                      onChange={(e) => handleInputChange('practice_name', e.target.value)}
                      className={styles.editableInput}
                      placeholder="Practice Name"
                    />
                    <textarea
                      value={editForm.practice_address || ''}
                      onChange={(e) => handleInputChange('practice_address', e.target.value)}
                      className={styles.editableTextarea}
                      rows={2}
                      placeholder="Practice Address"
                    />
                  </div>
                ) : (
                  <>
                    <p className={styles.sectionContent}>{profile.practice_name}</p>
                    <p className={styles.sectionContent}>{profile.practice_address}</p>
                  </>
                )}
              </div>

              {/* Contact Information */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Contact Information</h4>
                {isEditing ? (
                  <div className={styles.editableFields}>
                    <input
                      type="tel"
                      value={editForm.practice_phone || ''}
                      onChange={(e) => handleInputChange('practice_phone', e.target.value)}
                      className={styles.editableInput}
                      placeholder="Practice Phone"
                    />
                    <input
                      type="email"
                      value={editForm.practice_email || ''}
                      onChange={(e) => handleInputChange('practice_email', e.target.value)}
                      className={styles.editableInput}
                      placeholder="Practice Email"
                    />
                    <input
                      type="url"
                      value={editForm.personal_website || ''}
                      onChange={(e) => handleInputChange('personal_website', e.target.value)}
                      className={styles.editableInput}
                      placeholder="Personal Website"
                    />
                  </div>
                ) : (
                  <div className={styles.contactInfo}>
                    <p><strong>Phone:</strong> {profile.user_phone}</p>
                    <p><strong>Practice Phone:</strong> {profile.practice_phone}</p>
                    <p><strong>Email:</strong> {profile.user_email}</p>
                    <p><strong>Practice Email:</strong> {profile.practice_email}</p>
                    <p><strong>Website:</strong> <a href={profile.personal_website} target="_blank" rel="noopener noreferrer">{profile.personal_website}</a></p>
                  </div>
                )}
              </div>

              {/* Languages */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Languages</h4>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.languages_spoken || ''}
                    onChange={(e) => handleInputChange('languages_spoken', e.target.value)}
                    className={styles.editableInput}
                    placeholder="English, Spanish, French"
                  />
                ) : (
                  <div className={styles.languagesList}>
                    {profile.languages_list && Array.isArray(profile.languages_list) ? 
                      profile.languages_list.map((language: any, index) => (
                        <span key={index} className={styles.languageTag}>
                          {typeof language === 'object' ? (language as any).name || (language as any).title || JSON.stringify(language) : language}
                        </span>
                      )) : (
                        <span className={styles.languageTag}>No languages listed</span>
                      )
                    }
                  </div>
                )}
              </div>

              {/* Working Hours */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Working Hours</h4>
                <div className={styles.simpleFields}>
                  <div>
                    <label>Working Days:</label>
                    {isEditing ? (
                      <div className={styles.workingDays}>
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <label key={day} className={styles.dayCheckbox}>
                            <input
                              type="checkbox"
                              checked={(editForm as any).working_days?.includes(day) || false}
                              onChange={(e) => {
                                const currentDays = (editForm as any).working_days || [];
                                const newDays = e.target.checked 
                                  ? [...currentDays, day]
                                  : currentDays.filter((d: string) => d !== day);
                                handleInputChange('working_days' as any, newDays);
                              }}
                            />
                            <span>{day}</span>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.workingHoursDisplay}>
                        <div className={styles.workingDaysDisplay}>
                          {profile.working_days && profile.working_days.length > 0 ? (
                            (typeof profile.working_days === 'string' 
                              ? (profile.working_days as string).split(',').map((d: string) => d.trim())
                              : profile.working_days
                            ).map((day: string) => (
                              <span key={day} className={styles.dayTag}>
                                {day}
                              </span>
                            ))
                          ) : (
                            <span className={styles.noDaysSelected}>No working days set</span>
                          )}
                        </div>
                        {profile.start_time && profile.end_time && (
                          <div className={styles.timeRange}>
                            <span className={styles.timeDisplay}>
                              {new Date(`2000-01-01T${profile.start_time}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })} - {new Date(`2000-01-01T${profile.end_time}`).toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true 
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <label>Start Time:</label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={(editForm as any).start_time || '09:00'}
                        onChange={(e) => handleInputChange('start_time' as any, e.target.value)}
                        className={styles.editableInput}
                      />
                    ) : (
                      <span>{profile.start_time || '9:00 AM'}</span>
                    )}
                  </div>
                  <div>
                    <label>End Time:</label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={(editForm as any).end_time || '17:00'}
                        onChange={(e) => handleInputChange('end_time' as any, e.target.value)}
                        className={styles.editableInput}
                      />
                    ) : (
                      <span>{profile.end_time || '5:00 PM'}</span>
                    )}
                  </div>
                  <div>
                    <label>Session Duration:</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.session_duration_minutes || ''}
                        onChange={(e) => handleInputChange('session_duration_minutes', parseInt(e.target.value))}
                        className={styles.editableInput}
                        placeholder="50"
                      />
                    ) : (
                      <span>{profile.session_duration_minutes} minutes</span>
                    )}
                  </div>
                  <div>
                    <label>Break Between Sessions:</label>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editForm.break_between_sessions_minutes || ''}
                        onChange={(e) => handleInputChange('break_between_sessions_minutes', parseInt(e.target.value))}
                        className={styles.editableInput}
                        placeholder="10"
                      />
                    ) : (
                      <span>{profile.break_between_sessions_minutes} minutes</span>
                    )}
                  </div>
                  <div>
                    <label>Telehealth Available:</label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.telehealth_available || false}
                        onChange={(e) => handleInputChange('telehealth_available', e.target.checked)}
                      />
                    ) : (
                      <span>{profile.telehealth_available ? 'Yes' : 'No'}</span>
                    )}
                  </div>
                  <div>
                    <label>In-Person Available:</label>
                    {isEditing ? (
                      <input
                        type="checkbox"
                        checked={editForm.in_person_available || false}
                        onChange={(e) => handleInputChange('in_person_available', e.target.checked)}
                      />
                    ) : (
                      <span>{profile.in_person_available ? 'Yes' : 'No'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Statistics */}
              <div className={styles.detailSection}>
                <h4 className={styles.sectionTitle}>Professional Statistics</h4>
                <div className={styles.statsGrid}>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{profile.total_patients_seen}</span>
                    <span className={styles.statLabel}>Total Patients</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{profile.currently_active_patients}</span>
                    <span className={styles.statLabel}>Active Patients</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{profile.sessions_completed}</span>
                    <span className={styles.statLabel}>Sessions Completed</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{profile.average_rating}/5</span>
                    <span className={styles.statLabel}>Average Rating</span>
                  </div>
                  <div className={styles.statItem}>
                    <span className={styles.statNumber}>{profile.total_reviews}</span>
                    <span className={styles.statLabel}>Reviews</span>
                  </div>
                  {profile.is_highly_rated && (
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}><StarIcon size="lg" /></span>
                      <span className={styles.statLabel}>Highly Rated</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className={styles.profileActions}>
              {!isEditing ? (
                <button className={styles.editButton} onClick={handleEditClick}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button 
                    className={styles.saveButton} 
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button 
                    className={styles.cancelButton} 
                    onClick={handleCancelEdit}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};