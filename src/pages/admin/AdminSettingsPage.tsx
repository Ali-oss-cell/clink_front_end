import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type SystemSettings } from '../../services/api/admin';
import styles from './AdminPages.module.scss';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSystemSettings();
      setSettings(data);
    } catch (err: any) {
      console.error('Failed to load settings:', err);
      setError(err.message || 'Failed to load system settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      setError(null);
      setSuccess(null);
      await adminService.updateSystemSettings(settings);
      setSuccess('Settings updated successfully!');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      console.error('Failed to update settings:', err);
      setError(err.message || 'Failed to update system settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (section: keyof SystemSettings, field: string, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value
      }
    });
  };

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading settings...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!settings) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.errorState}>
              <h3>Error Loading Settings</h3>
              <p>{error || 'Failed to load settings'}</p>
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
            <h1>System Settings</h1>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}

          {success && (
            <div className={styles.successBanner}>
              <p>{success}</p>
              <button onClick={() => setSuccess(null)}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.settingsForm}>
            {/* Clinic Information */}
            <div className={styles.settingsSection}>
              <h2>Clinic Information</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.formGroup}>
                  <label>Clinic Name</label>
                  <input
                    type="text"
                    value={settings.clinic.name}
                    onChange={(e) => handleChange('clinic', 'name', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Address</label>
                  <input
                    type="text"
                    value={settings.clinic.address}
                    onChange={(e) => handleChange('clinic', 'address', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={settings.clinic.phone}
                    onChange={(e) => handleChange('clinic', 'phone', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={settings.clinic.email}
                    onChange={(e) => handleChange('clinic', 'email', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Website</label>
                  <input
                    type="url"
                    value={settings.clinic.website}
                    onChange={(e) => handleChange('clinic', 'website', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>ABN</label>
                  <input
                    type="text"
                    value={settings.clinic.abn}
                    onChange={(e) => handleChange('clinic', 'abn', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* System Configuration */}
            <div className={styles.settingsSection}>
              <h2>System Configuration</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.formGroup}>
                  <label>Timezone</label>
                  <select
                    value={settings.system.timezone}
                    onChange={(e) => handleChange('system', 'timezone', e.target.value)}
                  >
                    <option value="Australia/Sydney">Australia/Sydney</option>
                    <option value="Australia/Melbourne">Australia/Melbourne</option>
                    <option value="Australia/Brisbane">Australia/Brisbane</option>
                    <option value="Australia/Perth">Australia/Perth</option>
                    <option value="Australia/Adelaide">Australia/Adelaide</option>
                    <option value="Australia/Darwin">Australia/Darwin</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Language</label>
                  <select
                    value={settings.system.language}
                    onChange={(e) => handleChange('system', 'language', e.target.value)}
                  >
                    <option value="en-au">English (Australia)</option>
                    <option value="en-us">English (US)</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>GST Rate</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="1"
                    value={settings.system.gst_rate}
                    onChange={(e) => handleChange('system', 'gst_rate', parseFloat(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Medicare Provider Number</label>
                  <input
                    type="text"
                    value={settings.system.medicare_provider_number}
                    onChange={(e) => handleChange('system', 'medicare_provider_number', e.target.value)}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>AHPRA Registration Number</label>
                  <input
                    type="text"
                    value={settings.system.ahpra_registration_number}
                    onChange={(e) => handleChange('system', 'ahpra_registration_number', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className={styles.settingsSection}>
              <h2>Notification Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.email_enabled}
                      onChange={(e) => handleChange('notifications', 'email_enabled', e.target.checked)}
                    />
                    Email Notifications Enabled
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.sms_enabled}
                      onChange={(e) => handleChange('notifications', 'sms_enabled', e.target.checked)}
                    />
                    SMS Notifications Enabled
                  </label>
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.notifications.whatsapp_enabled}
                      onChange={(e) => handleChange('notifications', 'whatsapp_enabled', e.target.checked)}
                    />
                    WhatsApp Notifications Enabled
                  </label>
                </div>
              </div>
            </div>

            {/* Billing */}
            <div className={styles.settingsSection}>
              <h2>Billing Settings</h2>
              <div className={styles.settingsGrid}>
                <div className={styles.formGroup}>
                  <label>Default Payment Method</label>
                  <select
                    value={settings.billing.default_payment_method}
                    onChange={(e) => handleChange('billing', 'default_payment_method', e.target.value)}
                  >
                    <option value="card">Card</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="medicare">Medicare</option>
                  </select>
                </div>
                <div className={styles.formGroup}>
                  <label>Invoice Terms (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.billing.invoice_terms_days}
                    onChange={(e) => handleChange('billing', 'invoice_terms_days', parseInt(e.target.value))}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={settings.billing.auto_generate_invoices}
                      onChange={(e) => handleChange('billing', 'auto_generate_invoices', e.target.checked)}
                    />
                    Auto-generate Invoices
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.primaryButton} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
              <button type="button" onClick={fetchSettings} className={styles.secondaryButton}>
                Reset Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

