import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { intakeService } from '../../services/api/intake';
import { authService } from '../../services/api/auth';
import { UserIcon, HospitalIcon, SettingsIcon, LockIcon, ClipboardIcon, DownloadIcon } from '../../utils/icons';
import styles from './PatientPages.module.scss';

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

  const [activeTab, setActiveTab] = useState<'personal' | 'medical' | 'preferences' | 'security' | 'privacy'>('personal');
  const [medicalInfo, setMedicalInfo] = useState<any>(null);
  const [downloadingPDF, setDownloadingPDF] = useState(false);
  const [downloadingCSV, setDownloadingCSV] = useState(false);
  const [dataDownloadError, setDataDownloadError] = useState<string | null>(null);

  // Load data from intake form
  useEffect(() => {
    const medical = intakeService.getMedicalInfo();
    setMedicalInfo(medical);
  }, []);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: <UserIcon size="md" /> },
    { id: 'medical', label: 'Medical Info', icon: <HospitalIcon size="md" /> },
    { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size="md" /> },
    { id: 'security', label: 'Security', icon: <LockIcon size="md" /> },
    { id: 'privacy', label: 'Privacy & Data', icon: <LockIcon size="md" /> }
  ];

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

