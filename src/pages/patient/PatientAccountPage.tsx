import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { intakeService } from '../../services/api/intake';
import { authService, type ReferralDocument } from '../../services/api/auth';
import { PrivacyPolicyStatusCard, ThirdPartyDataSharing } from '../../components/privacy';
import { TelehealthConsentCard } from '../../components/telehealth';
import { UserIcon, HospitalIcon, SettingsIcon, LockIcon, ClipboardIcon, DownloadIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Checkbox } from '../../components/ui/checkbox';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import styles from './PatientPages.module.scss';
import { PatientShellPage } from '../../components/patient/PatientShellPage/PatientShellPage';
import shell from './PatientShellChrome.module.scss';

type AccountTab = 'personal' | 'medical' | 'preferences' | 'security' | 'privacy';

export const PatientAccountPage: React.FC = () => {
  const navigate = useNavigate();
  // Get user data from auth service
  const user = authService.getStoredUser() || {
    id: 1,
    first_name: 'John',
    last_name: 'Smith',
    full_name: 'John Smith',
    username: 'john.smith',
    role: 'patient' as const,
    email: 'john.smith@example.com',
    phone_number: '+61400123456',
    date_of_birth: '1990-01-01',
    age: 34,
    is_verified: true,
    created_at: '2024-01-01'
  };

  const [activeTab, setActiveTab] = useState<AccountTab>('personal');
  const [medicalInfo, setMedicalInfo] = useState<any>(null);
  const [intakeCompleted, setIntakeCompleted] = useState(false);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [dataDownloadError, setDataDownloadError] = useState<string | null>(null);
  
  // Data deletion request state
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [deletionLoading, setDeletionLoading] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');
  const [deletionError, setDeletionError] = useState<string | null>(null);
  const [referralStatus, setReferralStatus] = useState<{
    status: 'missing' | 'uploaded_pending_review' | 'verified' | 'rejected' | 'expired';
    has_uploaded_referral: boolean;
    latest_document: ReferralDocument | null;
  } | null>(null);
  const [referralFile, setReferralFile] = useState<File | null>(null);
  const [referralUploading, setReferralUploading] = useState(false);
  const [referralError, setReferralError] = useState<string | null>(null);
  const [referralSuccess, setReferralSuccess] = useState<string | null>(null);
  
  // Preferences type
  type PatientPreferences = {
    email_notifications_enabled: boolean;
    sms_notifications_enabled: boolean;
    appointment_reminders_enabled: boolean;
    telehealth_recording_consent: boolean;
    share_progress_with_emergency_contact: boolean;
  };

  // Preferences state
  const [preferences, setPreferences] = useState<PatientPreferences | null>(null);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  const [preferencesSaving, setPreferencesSaving] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesSuccess, setPreferencesSuccess] = useState<string | null>(null);
  
  const location = useLocation();

  // Load data from intake form
  useEffect(() => {
    let isMounted = true;

    const loadIntake = async () => {
      try {
        const intake = await intakeService.getIntakeForm();
        if (!isMounted) return;

        const isCompleted = Boolean(intake?.intake_completed || intake?.consent_to_treatment);
        setIntakeCompleted(isCompleted);
      } catch {
        if (!isMounted) return;
        setIntakeCompleted(intakeService.isIntakeFormCompleted());
      } finally {
        if (!isMounted) return;
        const medical = intakeService.getMedicalInfo();
        setMedicalInfo(medical);
      }
    };

    loadIntake();

    return () => {
      isMounted = false;
    };
  }, []);

  // Load preferences when preferences tab is active
  useEffect(() => {
    const loadPreferences = async () => {
      if (activeTab === 'preferences') {
        setPreferencesLoading(true);
        setPreferencesError(null);
        try {
          const result = await authService.getPatientPreferences();
          if (result.success && result.preferences) {
            setPreferences(result.preferences);
          }
        } catch (error: any) {
          console.error('[PatientAccount] Error loading preferences:', error);
          setPreferencesError(error.message || 'Failed to load preferences');
        } finally {
          setPreferencesLoading(false);
        }
      }
    };
    
    loadPreferences();
  }, [activeTab]);

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
    const fetchReferralStatus = async () => {
      try {
        const status = await authService.getReferralStatus();
        setReferralStatus(status);
      } catch (error: any) {
        console.error('[PatientAccount] Error fetching referral status:', error);
        setReferralError(error.message || 'Failed to load referral status');
      }
    };
    
    if (activeTab === 'privacy') {
      fetchDeletionStatus();
      fetchReferralStatus();
    }
  }, [activeTab]);

  const handleUploadReferral = async () => {
    if (!referralFile) {
      setReferralError('Please choose a referral PDF/image first.');
      return;
    }
    setReferralUploading(true);
    setReferralError(null);
    setReferralSuccess(null);
    try {
      const result = await authService.uploadReferralDocument({
        file: referralFile,
        has_gp_referral: true,
      });
      setReferralSuccess(result.message || 'Referral uploaded successfully.');
      setReferralFile(null);
      const status = await authService.getReferralStatus();
      setReferralStatus(status);
    } catch (error: any) {
      setReferralError(error.message || 'Failed to upload referral.');
    } finally {
      setReferralUploading(false);
    }
  };

  const getReferralStatusClass = (status: string | undefined) => {
    if (status === 'verified') return styles.statusApproved;
    if (status === 'rejected') return styles.statusRejected;
    if (status === 'expired') return styles.statusExpired;
    if (status === 'uploaded_pending_review') return styles.statusPending;
    return styles.statusMissing;
  };

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

  const handlePreferenceChange = (field: keyof PatientPreferences, value: boolean) => {
    if (preferences) {
      setPreferences({
        ...preferences,
        [field]: value,
      });
      // Clear success message when user makes changes
      setPreferencesSuccess(null);
    }
  };

  const handleSavePreferences = async () => {
    if (!preferences) return;
    
    setPreferencesSaving(true);
    setPreferencesError(null);
    setPreferencesSuccess(null);
    
    try {
      const result = await authService.updatePatientPreferences(preferences);
      if (result.success) {
        setPreferences(result.preferences);
        setPreferencesSuccess(result.message || 'Preferences saved successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setPreferencesSuccess(null), 3000);
      }
    } catch (error: any) {
      console.error('[PatientAccount] Error saving preferences:', error);
      setPreferencesError(error.message || 'Failed to save preferences. Please try again.');
    } finally {
      setPreferencesSaving(false);
    }
  };

  return (
    <Layout 
      user={user} 
      isAuthenticated={true}
      patientShell
      className={styles.patientLayout}
    >
      <PatientShellPage>
      <div className={styles.accountContainer}>
        <div className={shell.wrap}>
          <div className={styles.accountShellStack}>
          <div className={`${styles.accountHeader} ${shell.pageHeader}`}>
            <h1 className={shell.welcomeTitle}>My account</h1>
            <p className={shell.welcomeSubtitle}>
              Manage your personal information, medical details, and account preferences
            </p>
          </div>

          <div className={styles.accountContent}>
            <div className={styles.accountPanel}>
              <aside className={styles.accountNav} aria-label="Account sections">
                <nav className={styles.tabNavigation}>
                  {tabs.map((tab) => (
                    <button
                      type="button"
                      key={tab.id}
                      className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                      onClick={() => setActiveTab(tab.id as AccountTab)}
                    >
                      <span className={styles.tabIcon}>{tab.icon}</span>
                      <span className={styles.tabLabel}>{tab.label}</span>
                    </button>
                  ))}
                </nav>
              </aside>

            <div className={styles.accountMain}>
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
                  
                  {!intakeCompleted && (
                    <div className={styles.completionNotice}>
                      <div className={styles.noticeIcon}><ClipboardIcon size="lg" /></div>
                      <h3>Complete Your Intake Form</h3>
                      <p>Provide comprehensive information about your health and preferences.</p>
                      <Button className={styles.primaryButton} onClick={() => navigate('/patient/setup')}>
                        Continue setup
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'medical' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Medical Information</h2>

                  <div className={styles.completionNotice}>
                    <div className={styles.noticeIcon}><ClipboardIcon size="lg" /></div>
                    {intakeCompleted ? (
                      <>
                        <h3>Your intake is on file</h3>
                        <p>Need to update medical history? Jump back into the setup wizard at any time.</p>
                        <Button className={styles.primaryButton} onClick={() => navigate('/patient/setup')}>
                          Update intake
                        </Button>
                      </>
                    ) : (
                      <>
                        <h3>Finish setup to add medical info</h3>
                        <p>Complete the quick intake steps so your psychologist can prepare properly.</p>
                        <Button className={styles.primaryButton} onClick={() => navigate('/patient/setup')}>
                          Continue setup
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className={styles.tabContent}>
                  <h2 className={styles.sectionTitle}>Preferences & Settings</h2>
                  
                  {preferencesLoading ? (
                    <div className={styles.loadingMessage}>Loading preferences...</div>
                  ) : preferencesError ? (
                    <div className={styles.errorAlert}>
                      <span>{preferencesError}</span>
                    </div>
                  ) : preferences ? (
                    <>
                      {preferencesSuccess && (
                        <div className={styles.successAlert}>
                          <span>{preferencesSuccess}</span>
                        </div>
                      )}
                      
                      <div className={styles.preferencesGrid}>
                        <div className={styles.preferenceSection}>
                          <h3 className={styles.subsectionTitle}>Communication</h3>
                          <div className={styles.preferenceItem}>
                            <label className={styles.checkboxLabel}>
                              <Checkbox
                                className={styles.checkbox}
                                checked={preferences.email_notifications_enabled}
                                onChange={(e) => handlePreferenceChange('email_notifications_enabled', e.target.checked)}
                                disabled={preferencesSaving}
                              />
                              <span>Email notifications</span>
                            </label>
                          </div>
                          <div className={styles.preferenceItem}>
                            <label className={styles.checkboxLabel}>
                              <Checkbox
                                className={styles.checkbox}
                                checked={preferences.sms_notifications_enabled}
                                onChange={(e) => handlePreferenceChange('sms_notifications_enabled', e.target.checked)}
                                disabled={preferencesSaving}
                              />
                              <span>SMS notifications</span>
                            </label>
                          </div>
                          <div className={styles.preferenceItem}>
                            <label className={styles.checkboxLabel}>
                              <Checkbox
                                className={styles.checkbox}
                                checked={preferences.appointment_reminders_enabled}
                                onChange={(e) => handlePreferenceChange('appointment_reminders_enabled', e.target.checked)}
                                disabled={preferencesSaving}
                              />
                              <span>Appointment reminders</span>
                            </label>
                          </div>
                        </div>

                        <div className={styles.preferenceSection}>
                          <h3 className={styles.subsectionTitle}>Privacy</h3>
                          <div className={styles.preferenceItem}>
                            <label className={styles.checkboxLabel}>
                              <Checkbox
                                className={styles.checkbox}
                                checked={preferences.telehealth_recording_consent}
                                onChange={(e) => handlePreferenceChange('telehealth_recording_consent', e.target.checked)}
                                disabled={preferencesSaving}
                              />
                              <span>Allow session recordings for quality assurance</span>
                            </label>
                            <p className={styles.helpText}>
                              You can withdraw this consent at any time
                            </p>
                          </div>
                          <div className={styles.preferenceItem}>
                            <label className={styles.checkboxLabel}>
                              <Checkbox
                                className={styles.checkbox}
                                checked={preferences.share_progress_with_emergency_contact}
                                onChange={(e) => handlePreferenceChange('share_progress_with_emergency_contact', e.target.checked)}
                                disabled={preferencesSaving}
                              />
                              <span>Share progress with emergency contact</span>
                            </label>
                            <p className={styles.helpText}>
                              Allow your emergency contact to receive progress updates
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <Button
                        className={styles.primaryButton}
                        onClick={handleSavePreferences}
                        disabled={preferencesSaving}
                      >
                        {preferencesSaving ? (
                          <>
                            <span className={styles.spinner}></span>
                            Saving...
                          </>
                        ) : (
                          'Save Preferences'
                        )}
                      </Button>
                    </>
                  ) : (
                    <div className={styles.errorAlert}>
                      <span>Unable to load preferences. Please try again later.</span>
                    </div>
                  )}
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
                        <Input type="password" className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>New Password</label>
                        <Input type="password" className={styles.input} />
                      </div>
                      <div className={styles.formGroup}>
                        <label className={styles.label}>Confirm New Password</label>
                        <Input type="password" className={styles.input} />
                      </div>
                      <Button className={styles.primaryButton}>Update Password</Button>
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
                      <Button className={styles.secondaryButton}>Enable 2FA</Button>
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
                    <h3 className={styles.subsectionTitle}>Medicare referral status</h3>
                    <p className={styles.privacyDescription}>
                      If you want to claim Medicare rebates, upload your GP referral/MHTP document (usually PDF).
                      Our admin team reviews it before Medicare-claiming bookings.
                    </p>

                    {referralError && (
                      <div className={styles.errorAlert}>
                        <span>{referralError}</span>
                      </div>
                    )}
                    {referralSuccess && (
                      <div className={styles.successMessage}>
                        {referralSuccess}
                      </div>
                    )}

                    <div className={styles.deletionStatusCard}>
                      <div className={styles.statusHeader}>
                        <h4>Current referral state</h4>
                        <span
                          className={`${styles.statusBadge} ${getReferralStatusClass(referralStatus?.status)}`}
                        >
                          {referralStatus?.status || 'missing'}
                        </span>
                      </div>
                      {referralStatus?.latest_document && (
                        <div className={styles.statusDetails}>
                          {referralStatus.latest_document.file_name && (
                            <div className={styles.statusRow}>
                              <strong>Latest file:</strong>
                              <span>{referralStatus.latest_document.file_name}</span>
                            </div>
                          )}
                          {referralStatus.latest_document.submitted_at && (
                            <div className={styles.statusRow}>
                              <strong>Uploaded:</strong>
                              <span>{new Date(referralStatus.latest_document.submitted_at).toLocaleDateString('en-AU')}</span>
                            </div>
                          )}
                          {referralStatus.latest_document.rejection_reason && (
                            <div className={styles.statusRow}>
                              <strong>Admin note:</strong>
                              <span>{referralStatus.latest_document.rejection_reason}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className={styles.deletionRequestForm}>
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/*"
                        className={styles.input}
                        onChange={(e) => setReferralFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        className={styles.primaryButton}
                        onClick={handleUploadReferral}
                        disabled={referralUploading}
                      >
                        {referralUploading ? 'Uploading referral...' : 'Upload referral document'}
                      </Button>
                      <p className={styles.dataAccessNote}>
                        Accepted formats: PDF/image, max 8MB. You can still book private sessions while review is pending.
                      </p>
                    </div>
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
                      <Button
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
                      </Button>

                      <Button
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
                      </Button>
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
                        <Textarea
                          className={styles.deletionReasonInput}
                          value={deletionReason}
                          onChange={(e) => setDeletionReason(e.target.value)}
                          placeholder="Optional: Please provide a reason for your deletion request..."
                          rows={4}
                        />
                        <Button
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
                        </Button>
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
                          <Button
                            className={styles.secondaryButton}
                            onClick={handleCancelDeletion}
                            disabled={deletionLoading}
                          >
                            {deletionLoading ? 'Cancelling...' : 'Cancel Request'}
                          </Button>
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
                    <Button className={styles.secondaryButton}>
                      View Privacy Policy
                    </Button>
                  </div>
                </div>
              )}
            </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      </PatientShellPage>
    </Layout>
  );
};

