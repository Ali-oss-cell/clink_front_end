import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Invoice } from '../../services/api/admin';
import { downloadInvoicePDF } from '../../utils/invoicePDF';
import { DocumentIcon, CreditCardIcon, ClockIcon } from '../../utils/icons';
import { Button } from '../../components/ui/button';
import { Select } from '../../components/ui/select';
import styles from './PatientPages.module.scss';
import shell from './PatientShellChrome.module.scss';
import invoiceStyles from './PatientInvoicesPage.module.scss';

export const PatientInvoicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const user = authService.getStoredUser();

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page_size: 100 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await adminService.getAllInvoices(params);
      
      // Filter to only show current patient's invoices
      // Note: Backend should ideally filter by patient, but we filter on frontend as fallback
      const patientInvoices = response.results.filter(
        (inv) => {
          // Match by patient name or user ID if available
          const patientName = user?.full_name || `${user?.first_name} ${user?.last_name}`;
          return inv.patient_name === patientName || inv.patient_name?.includes(user?.first_name || '');
        }
      );
      
      setInvoices(patientInvoices);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      setDownloadingId(invoiceId);
      await downloadInvoicePDF(invoiceId);
    } catch (error: any) {
      console.error('Failed to download invoice PDF:', error);
      alert(error.message || 'Failed to download invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(numAmount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return styles.statusPaid || 'status-paid';
      case 'pending':
        return styles.statusPending || 'status-pending';
      case 'overdue':
        return styles.statusOverdue || 'status-overdue';
      case 'cancelled':
        return styles.statusCancelled || 'status-cancelled';
      default:
        return '';
    }
  };

  const getStatusChipColors = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return {
          bg: 'var(--cs-secondary-container)',
          color: 'var(--cs-on-secondary-fixed-variant)',
        };
      case 'pending':
        return {
          bg: 'var(--cs-tertiary-fixed)',
          color: 'var(--cs-on-tertiary-fixed-variant)',
        };
      case 'overdue':
        return {
          bg: 'var(--cs-error-container)',
          color: 'var(--cs-on-error-container)',
        };
      case 'cancelled':
        return {
          bg: 'var(--cs-surface-variant)',
          color: 'var(--cs-on-surface-variant)',
        };
      default:
        return {
          bg: 'var(--cs-surface-variant)',
          color: 'var(--cs-on-surface-variant)',
        };
    }
  };

  const invoiceTotal = (inv: Invoice) =>
    parseFloat(String(inv.total_amount ?? inv.amount ?? '0'));

  const calculateTotals = () => {
    const total = invoices.reduce((sum, inv) => sum + invoiceTotal(inv), 0);
    const paid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + invoiceTotal(inv), 0);
    const pending = invoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + invoiceTotal(inv), 0);
    
    return { total, paid, pending };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p>Loading your invoices...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={shell.pageHeader}>
            <h1 className={shell.welcomeTitle}>My Invoices</h1>
            <p className={shell.welcomeSubtitle}>View and download your invoices</p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #c0392b',
              borderRadius: '8px',
              padding: '1rem',
              marginBottom: '2rem',
              color: '#991b1b'
            }}>
              <p>{error}</p>
            </div>
          )}

          {/* Stats Summary */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: 'var(--cs-surface-lowest)',
              padding: '1.5rem',
              borderRadius: 'var(--cs-radius-2xl)',
              boxShadow: 'var(--cs-shadow-atmospheric)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--cs-primary)' }}>
                {formatCurrency(totals.total)}
              </div>
              <div style={{ color: 'var(--cs-on-surface-variant)', marginTop: '0.5rem' }}>Total Invoiced</div>
            </div>
            <div style={{
              background: 'var(--cs-surface-lowest)',
              padding: '1.5rem',
              borderRadius: 'var(--cs-radius-2xl)',
              boxShadow: 'var(--cs-shadow-atmospheric)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--cs-on-secondary-fixed-variant)' }}>
                {formatCurrency(totals.paid)}
              </div>
              <div style={{ color: 'var(--cs-on-surface-variant)', marginTop: '0.5rem' }}>Paid</div>
            </div>
            <div style={{
              background: 'var(--cs-surface-lowest)',
              padding: '1.5rem',
              borderRadius: 'var(--cs-radius-2xl)',
              boxShadow: 'var(--cs-shadow-atmospheric)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--cs-on-tertiary-fixed-variant)' }}>
                {formatCurrency(totals.pending)}
              </div>
              <div style={{ color: 'var(--cs-on-surface-variant)', marginTop: '0.5rem' }}>Pending</div>
            </div>
            <div style={{
              background: 'var(--cs-surface-lowest)',
              padding: '1.5rem',
              borderRadius: 'var(--cs-radius-2xl)',
              boxShadow: 'var(--cs-shadow-atmospheric)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--cs-primary)' }}>
                {invoices.length}
              </div>
              <div style={{ color: 'var(--cs-on-surface-variant)', marginTop: '0.5rem' }}>Total Invoices</div>
            </div>
          </div>

          {/* Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #c8c5c0',
                fontSize: '1rem',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          {/* Invoices Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {invoices.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#7a7b7a' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No invoices found</p>
                <p>You don't have any invoices yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f6efe7', borderBottom: '2px solid #e2dfd9' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e1f1e' }}>
                      Invoice #
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e1f1e' }}>
                      Date
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e1f1e' }}>
                      Psychologist
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#1e1f1e' }}>
                      Amount
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e1f1e' }}>
                      GST
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1e1f1e' }}>
                      Status
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#1e1f1e' }}>
                      Due Date
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#1e1f1e' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      style={{
                        borderBottom: index < invoices.length - 1 ? '1px solid #e2dfd9' : 'none'
                      }}
                    >
                      <td style={{ padding: '1rem', color: '#111827' }}>
                        #{invoice.id}
                      </td>
                      <td style={{ padding: '1rem', color: '#7a7b7a' }}>
                        {formatDate(invoice.created_at)}
                      </td>
                      <td style={{ padding: '1rem', color: '#111827' }}>
                        {invoice.psychologist_name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                        {formatCurrency(invoice.total_amount ?? invoice.amount)}
                      </td>
                      <td style={{ padding: '1rem', color: '#4a4b4a', fontSize: '0.9rem' }}>
                        {invoice.is_gst_free ? 'GST-free' : 'Inc. GST'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            backgroundColor: getStatusChipColors(invoice.status).bg,
                            color: getStatusChipColors(invoice.status).color
                          }}
                        >
                          {invoice.status?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#7a7b7a' }}>
                        {formatDate(invoice.due_date)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <Button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            disabled={downloadingId === invoice.id}
                            className={invoiceStyles.downloadButton}
                            title="Download Invoice PDF"
                          >
                            {downloadingId === invoice.id ? (
                              <>
                                <ClockIcon size="sm" style={{ marginRight: '6px' }} />
                                Downloading...
                              </>
                            ) : (
                              <>
                                <DocumentIcon size="sm" style={{ marginRight: '6px' }} />
                                Download PDF
                              </>
                            )}
                          </Button>
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <Button
                              onClick={() => navigate(`/appointments/payment?invoice=${invoice.id}`)}
                              className={invoiceStyles.payButton}
                              title="Pay Invoice"
                            >
                              <CreditCardIcon size="sm" style={{ marginRight: '6px' }} />
                              Pay Now
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

