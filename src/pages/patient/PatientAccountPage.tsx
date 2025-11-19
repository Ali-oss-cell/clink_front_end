import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { intakeService } from '../../services/api/intake';
import { authService } from '../../services/api/auth';
import { PrivacyPolicyStatusCard, ThirdPartyDataSharing } from '../../components/privacy';
import { TelehealthConsentCard } from '../../components/telehealth';
import { UserIcon, HospitalIcon, SettingsIcon, LockIcon, ClipboardIcon, DownloadIcon } from '../../utils/icons';
import styles from './PatientPages.module.scss';

type AccountTab = 'personal' | 'medical' | 'preferences' | 'security' | 'privacy';

export const PatientAccountPage: React.FC = () => {
  // Get user data from auth service
  const user = authService.getStoredUser() || {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    full_name: 'John Smith',
    username: 'john.smith',
    role: 'patient' as const,
    email: 'john.smith@example.com',
    phone_number: '+61 4XX XXX XXX',
    date_of_birth: '1990-01-01',
    age: 34,
    is_verified: true,
    created_at: '2024-01-01'
  };

  const [activeTab, setActiveTab] = useState<AccountTab>('personal');
  const [medicalInfo, setMedicalInfo] = useState<any>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [dataDownloadError, setDataDownloadError] = useState<string | null>(null);
  
  // Data deletion request state
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const location = useLocation();

  // Load data from intake form
  useEffect(() => {
    const medical = intakeService.getMedicalInfo();
    setMedicalInfo(medical);
  }, []);

  // Load deletion request status
  useEffect(() => {
    const fetchDeletionStatus = async () => {
      try {
        const status = await authService.getDataDeletionStatus();
        setDeletionStatus(status);
      } catch (error: any) {
        console.error('[PatientAccount] Error fetching deletion status:', error);
        // Don't show error if it's just no request found
        if (error.message && !error.message.includes('not found')) {
          setDeletionError(error.message);
        }
      }
    };
    
    if (activeTab === 'privacy') {
      fetchDeletionStatus();
    }
  }, [activeTab]);

  const tabs: { id: AccountTab; label: string; icon: ReactNode }[] = [
    { id: 'personal', label: 'Personal Info', icon: <UserIcon size="md" /> },
    { id: 'medical', label: 'Medical Info', icon: <HospitalIcon size="md" /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size="md" /> },
    { id: 'security', label: 'Security', icon: <LockIcon size="md" /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <LockIcon size="md" /> }
  ];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      const foundTab = tabs.find((t) => t.id === tab);
      if (foundTab) {
        setActiveTab(foundTab.id);
      }
    }
  }, [location.search]);

  const handleDownloadPDF = async () => {
    setDownloadingPDF(true);
    setDataDownloadError(null);
    
    try {
      console.log('[PatientAccount] Starting PDF download...');
      const result = await authService.requestDataAccess('pdf');
      
      // Service handles the download automatically
      if (result && result.success) {
        console.log('[PatientAccount] PDF download successful:', result.filename);
        // Success message is optional since download happens automatically
      }
    } catch (error: any) {
      console.error('[PatientAccount] Error downloading PDF:', error);
      setDataDownloadError(error.message || 'Failed to download your data as PDF. Please try again.');
    } finally {
      setDownloadingPDF(false);
    }
  };

  const handleDownloadCSV = async () => {
    setDownloadingCSV(true);
    setDataDownloadError(null);
    
    try {
      console.log('[PatientAccount] Starting CSV download...');
      const result = await authService.requestDataAccess('csv');
      
      // Service handles the download automatically
      if (result && result.success) {
        console.log('[PatientAccount] CSV download successful:', result.filename);
        // Success message is optional since download happens automatically
      }
    } catch (error: any) {
      console.error('[PatientAccount] Error downloading CSV:', error);
      setDataDownloadError(error.message || 'Failed to download your data as CSV. Please try again.');
    } finally {
      setDownloadingCSV(false);
    }
  };

  const handleRequestDeletion = async () => {
    setDeletionLoading(true);
    setDeletionError(null);
    
    try {
      await authService.requestDataDeletion(deletionReason || undefined);
      setDeletionReason('');
      // Refresh status
      const status = await authService.getDataDeletionStatus();
      setDeletionStatus(status);
      alert('Your data deletion request has been submitted successfully. An admin will review your request.');
    } catch (error: any) {
      console.error('[PatientAccount] Error requesting deletion:', error);
      setDeletionError(error.message || 'Failed to submit deletion request. Please try again.');
    } finally {
      setDeletionLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    if (!deletionStatus?.request?.id) return;
    
    if (!confirm('Are you sure you want to cancel your data deletion request?')) {
      return;
    }
    
    setDeletionLoading(true);
    setDeletionError(null);
    
    try {
      await authService.cancelDataDeletion(deletionStatus.request.id);
      // Refresh status
      const status = await authService.getDataDeletionStatus();
      setDeletionStatus(status);
      alert('Your data deletion request has been cancelled.');
    } catch (error: any) {
      console.error('[PatientAccount] Error cancelling deletion:', error);
      setDeletionError(error.message || 'Failed to cancel deletion request. Please try again.');
    } finally {
      setDeletionLoading(false);
    }
  };

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      className={styles.patientLayout}
    >
      <div className={styles.accountContainer}>
        <div className="container">
          <div className={styles.accountHeader}>
            <h1 className={styles.pageTitle}>My Account</h1>
            <p className={styles.pageSubtitle}>
              Manage your personal information, medical details, and account preferences
            </p>
          </div>

          <div className={styles.accountContent}>
            <div className={styles.sidebar}>
              <nav className={styles.tabNavigation}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                    onClick={() => setActiveTab(tab.id as any)}
                  >
                    <span className={styles.tabIcon}>{tab.icon}</span>
                    <span className={styles.tabLabel}>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className={styles.mainContent}>
              {activeTab === 'personal' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Personal Information</h2>
                  <div className={styles.infoGrid}>
                    <div className={styles.infoSection}>
                      <label className={styles.label}>Full Name</label>
                      <div className={styles.infoValue}>
                        {user.full_name || `${user.first_name} ${user.last_name}`}
                      </div>
                    </div>
                    
                    <div className={styles.infoSection}>
                      <label className={styles.label}>Email Address</label>
                      <div className={styles.infoValue}>
                        {user.email}
                      </div>
                    </div>
                    
                    <div className={styles.infoSection}>
                      <label className={styles.label}>Phone Number</label>
                      <div className={styles.infoValue}>
                        {user.phone_number}
                      </div>
                    </div>
                    
                    <div className={styles.infoSection}>
                      <label className={styles.label}>Date of Birth</label>
                      <div className={styles.infoValue}>
                        {user.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString() : 'Not provided'}
                      </div>
                    </div>
                  </div>
                  
                  {!intakeService.isIntakeFormCompleted() && (
                    <div className={styles.completionNotice}>
                      <div className={styles.noticeIcon}><ClipboardIcon size="lg" /></div>
                      <h3>Complete Your Intake Form</h3>
                      <p>Provide comprehensive information about your health and preferences.</p>
                      <button className={styles.primaryButton}>
                        Complete Intake Form
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'medical' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Medical Information</h2>
                  
                  {intakeService.isIntakeFormCompleted() ? (
                    <div className={styles.medicalInfo}>
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Current Medications</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.currentMedications || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Medical Conditions</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.medicalConditions || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Previous Therapy</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.previousTherapy || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Other Health Professionals</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.otherHealthProfessionals || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>GP Contact</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.gpContact || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Presenting Concerns</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.presentingConcerns || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                      
                      <div className={styles.infoSection}>
                        <label className={styles.label}>Therapy Goals</label>
                        <div className={styles.infoDisplay}>
                          <div className={styles.infoValue}>
                            {medicalInfo?.therapyGoals || 'Not provided'}
                          </div>
                          <button 
                            className={styles.editButton}
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.completionNotice}>
                      <div className={styles.noticeIcon}><ClipboardIcon size="lg" /></div>
                      <h3>Complete Your Intake Form</h3>
                      <p>To view and manage your medical information, please complete your intake form first.</p>
                      <button className={styles.primaryButton}>
                        Complete Intake Form
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Preferences & Settings</h2>
                  <div className={styles.preferencesGrid}>
                    <div className={styles.preferenceSection}>
                      <h3 className={styles.subsectionTitle}>Communication</h3>
                      <div className={styles.preferenceItem}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" className={styles.checkbox} defaultChecked />
                          <span>Email notifications</span>
                        </label>
                      </div>
                      <div className={styles.preferenceItem}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" className={styles.checkbox} />
                          <span>SMS notifications</span>
                        </label>
                      </div>
                      <div className={styles.preferenceItem}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" className={styles.checkbox} defaultChecked />
                          <span>Appointment reminders</span>
                        </label>
                      </div>
                    </div>

                    <div className={styles.preferenceSection}>
                      <h3 className={styles.subsectionTitle}>Session Preferences</h3>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Preferred Session Type</label>
                        <select className={styles.select}>
                          <option>Video sessions</option>
                          <option>In-person sessions</option>
                          <option>No preference</option>
                        </select>
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Best Times for Appointments</label>
                        <select className={styles.select}>
                          <option>Morning (9am-12pm)</option>
                          <option>Afternoon (12pm-5pm)</option>
                          <option>Evening (5pm-8pm)</option>
                          <option>Flexible</option>
                        </select>
                      </div>
                    </div>

                    <div className={styles.preferenceSection}>
                      <h3 className={styles.subsectionTitle}>Privacy</h3>
                      <div className={styles.preferenceItem}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" className={styles.checkbox} defaultChecked />
                          <span>Allow session recordings for quality assurance</span>
                        </label>
                      </div>
                      <div className={styles.preferenceItem}>
                        <label className={styles.checkboxLabel}>
                          <input type="checkbox" className={styles.checkbox} />
                          <span>Share progress with emergency contact</span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <button className={styles.saveButton}>Save Preferences</button>
                </div>
              )}

              {activeTab === 'security' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Security & Password</h2>
                  <div className={styles.securityGrid}>
                    <div className={styles.securitySection}>
                      <h3 className={styles.subsectionTitle}>Change Password</h3>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Current Password</label>
                        <input type="password" className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>New Password</label>
                        <input type="password" className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <input type="password" className={styles.input} />
                      </div>
                      <button className={styles.primaryButton}>Update Password</button>
                    </div>

                    <div className={styles.securitySection}>
                      <h3 className={styles.subsectionTitle}>Two-Factor Authentication</h3>
                      <div className={styles.securityStatus}>
                        <span className={styles.statusLabel}>Status:</span>
                        <span className={styles.statusInactive}>Not Enabled</span>
                      </div>
                      <p className={styles.securityDescription}>
                        Add an extra layer of security to your account
                      </p>
                      <button className={styles.secondaryButton}>Enable 2FA</button>
                    </div>

                    <div className={styles.securitySection}>
                      <h3 className={styles.subsectionTitle}>Login Activity</h3>
                      <div className={styles.activityItem}>
                        <div className={styles.activityInfo}>
                          <span className={styles.activityDevice}>Current Session</span>
                          <span className={styles.activityTime}>Now</span>
                        </div>
                        <span className={styles.activityLocation}>Melbourne, Australia</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Privacy & Data Management</h2>

                  <div className={styles.privacyWidgets}>
                    <PrivacyPolicyStatusCard />
                    <ThirdPartyDataSharing />
                  </div>
                  
                  <div className={styles.privacySection}>
                    <h3 className={styles.subsectionTitle}>Your Data Rights</h3>
                    <p className={styles.privacyDescription}>
                      Under the Australian Privacy Act 1988 (APP 12), you have the right to access 
                      all personal information we hold about you. You can request a copy of your data 
                      at any time.
                    </p>
                  </div>

                  <div className={styles.dataAccessSection}>
                    <h3 className={styles.subsectionTitle}>Download My Data</h3>
                    <p className={styles.dataAccessDescription}>
                      Download a complete copy of all your personal information, including:
                    </p>
                    <ul className={styles.dataList}>
                      <li>Personal information and account details</li>
                      <li>Medical information and health records</li>
                      <li>Appointment history</li>
                      <li>Progress notes and session records</li>
                      <li>Billing and payment information</li>
                      <li>Medicare claims</li>
                      <li>Consent records</li>
                      <li>Account activity logs</li>
                    </ul>
                    
                    {dataDownloadError && (
                      <div className={styles.errorAlert}>
                        <span>{dataDownloadError}</span>
                      </div>
                    )}

                    <div className={styles.downloadButtons}>
                      <button
                        className={styles.downloadButton}
                        onClick={handleDownloadPDF}
                        disabled={downloadingPDF || downloadingCSV}
                      >
                        {downloadingPDF ? (
                          <>
                            <span className={styles.spinner}></span>
                            Downloading PDF...
                          </>
                        ) : (
                          <>
                            <DownloadIcon size="md" />
                            Download as PDF
                          </>
                        )}
                      </button>

                      <button
                        className={`${styles.downloadButton} ${styles.downloadButtonSecondary}`}
                        onClick={handleDownloadCSV}
                        disabled={downloadingPDF || downloadingCSV}
                      >
                        {downloadingCSV ? (
                          <>
                            <span className={styles.spinner}></span>
                            Downloading CSV...
                          </>
                        ) : (
                          <>
                            <DownloadIcon size="md" />
                            Download as CSV
                          </>
                        )}
                      </button>
                    </div>
                    
                    <p className={styles.dataAccessNote}>
                      Choose your preferred format: PDF for a formatted document, or CSV for spreadsheet compatibility. 
                      This may take a few moments depending on the amount of data. All requests are logged for security purposes.
                    </p>
                  </div>

                  <div className={styles.dataDeletionSection}>
                    <h3 className={styles.subsectionTitle}>Request Data Deletion (APP 13)</h3>
                    <p className={styles.privacyDescription}>
                      Under the Australian Privacy Act 1988 (APP 13), you have the right to request 
                      deletion of your personal information. Your data will be archived after the 
                      legal retention period (7 years for adults, until age 25 for children).
                    </p>
                    
                    {deletionError && (
                      <div className={styles.errorAlert}>
                        <span>{deletionError}</span>
                      </div>
                    )}

                    {!deletionStatus?.has_request && (
                      <div className={styles.deletionRequestForm}>
                        <div className={styles.warningBox}>
                          <strong>⚠️ Important:</strong> Data deletion is permanent after the legal 
                          retention period. Once your data is deleted, it cannot be recovered. 
                          Please ensure you have downloaded a copy of your data before requesting deletion.
                        </div>
                        <textarea
                          className={styles.deletionReasonInput}
                          value={deletionReason}
                          onChange={(e) => setDeletionReason(e.target.value)}
                          placeholder="Optional: Please provide a reason for your deletion request..."
                          rows={4}
                        />
                        <button
                          className={styles.deleteButton}
                          onClick={handleRequestDeletion}
                          disabled={deletionLoading}
                        >
                          {deletionLoading ? (
                            <>
                              <span className={styles.spinner}></span>
                              Submitting Request...
                            </>
                          ) : (
                            'Submit Deletion Request'
                          )}
                        </button>
                      </div>
                    )}

                    {deletionStatus?.has_request && (
                      <div className={styles.deletionStatusCard}>
                        <div className={styles.statusHeader}>
                          <h4>Deletion Request Status</h4>
                          <span className={`${styles.statusBadge} ${styles[`status${deletionStatus.request.status.charAt(0).toUpperCase() + deletionStatus.request.status.slice(1)}`]}`}>
                            {deletionStatus.request.status}
                          </span>
                        </div>
                        
                        <div className={styles.statusDetails}>
                          <div className={styles.statusRow}>
                            <strong>Request Date:</strong>
                            <span>{new Date(deletionStatus.request.request_date).toLocaleDateString()}</span>
                          </div>
                          
                          {deletionStatus.request.earliest_deletion_date && (
                            <div className={styles.statusRow}>
                              <strong>Earliest Deletion Date:</strong>
                              <span>{new Date(deletionStatus.request.earliest_deletion_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {deletionStatus.request.scheduled_deletion_date && (
                            <div className={styles.statusRow}>
                              <strong>Scheduled Deletion Date:</strong>
                              <span>{new Date(deletionStatus.request.scheduled_deletion_date).toLocaleDateString()}</span>
                            </div>
                          )}
                          
                          {deletionStatus.request.retention_period_years && (
                            <div className={styles.statusRow}>
                              <strong>Retention Period:</strong>
                              <span>{deletionStatus.request.retention_period_years} years</span>
                            </div>
                          )}
                          
                          {deletionStatus.request.reason && (
                            <div className={styles.statusRow}>
                              <strong>Your Reason:</strong>
                              <span>{deletionStatus.request.reason}</span>
                            </div>
                          )}
                          
                          {deletionStatus.request.rejection_reason && (
                            <div className={styles.statusRow}>
                              <strong>Rejection Reason:</strong>
                              <span>{deletionStatus.request.rejection_reason}</span>
                            </div>
                          )}
                          
                          {deletionStatus.request.reviewer_notes && (
                            <div className={styles.statusRow}>
                              <strong>Admin Notes:</strong>
                              <span>{deletionStatus.request.reviewer_notes}</span>
                            </div>
                          )}
                        </div>

                        {['pending', 'approved'].includes(deletionStatus.request.status) && (
                          <button
                            className={styles.cancelButton}
                            onClick={handleCancelDeletion}
                            disabled={deletionLoading}
                          >
                            {deletionLoading ? 'Cancelling...' : 'Cancel Request'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className={styles.telehealthConsentSection}>
                    <h2 className={styles.sectionTitle}>Telehealth Consent</h2>
                    <TelehealthConsentCard />
                  </div>

                  <div className={styles.privacyInfoSection}>
                    <h3 className={styles.subsectionTitle}>Privacy Policy</h3>
                    <p className={styles.privacyDescription}>
                      For more information about how we collect, use, and protect your personal 
                      information, please review our Privacy Policy.
                    </p>
                    <button className={styles.secondaryButton}>
                      View Privacy Policy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

