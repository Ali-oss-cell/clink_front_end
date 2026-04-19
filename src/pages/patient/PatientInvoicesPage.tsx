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
import { PatientShellPage, patientShellPageStyles as psp } from '../../components/patient/PatientShellPage/PatientShellPage';
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
        <PatientShellPage>
          <div className={styles.pageContainer}>
            <div className="container">
              <div className={invoiceStyles.loadingWrap}>
                <p>Loading your invoices...</p>
              </div>
            </div>
          </div>
        </PatientShellPage>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} patientShell className={styles.patientLayout}>
      <PatientShellPage>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={psp.pageHeader}>
            <h1 className={psp.welcomeTitle}>My Invoices</h1>
            <p className={psp.welcomeSubtitle}>View and download your invoices</p>
          </div>

          {error && (
            <div className={invoiceStyles.errorBanner} role="alert">
              <p>{error}</p>
            </div>
          )}

          {/* Stats Summary — L1 surfaces */}
          <div className={invoiceStyles.summaryGrid}>
            <div className={invoiceStyles.statCard}>
              <div className={invoiceStyles.statValue}>{formatCurrency(totals.total)}</div>
              <div className={invoiceStyles.statLabel}>Total Invoiced</div>
            </div>
            <div className={invoiceStyles.statCard}>
              <div className={`${invoiceStyles.statValue} ${invoiceStyles.statPaid}`}>{formatCurrency(totals.paid)}</div>
              <div className={invoiceStyles.statLabel}>Paid</div>
            </div>
            <div className={invoiceStyles.statCard}>
              <div className={`${invoiceStyles.statValue} ${invoiceStyles.statPending}`}>{formatCurrency(totals.pending)}</div>
              <div className={invoiceStyles.statLabel}>Pending</div>
            </div>
            <div className={invoiceStyles.statCard}>
              <div className={invoiceStyles.statValue}>{invoices.length}</div>
              <div className={invoiceStyles.statLabel}>Total Invoices</div>
            </div>
          </div>

          {/* Filter */}
          <div className={invoiceStyles.filterRow}>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={invoiceStyles.statusSelect}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </Select>
          </div>

          {/* Invoices Table — L1 glass container */}
          <div className={invoiceStyles.tableShell}>
            {invoices.length === 0 ? (
              <div className={invoiceStyles.emptyState}>
                <p className={invoiceStyles.emptyTitle}>No invoices found</p>
                <p>You don&apos;t have any invoices yet.</p>
              </div>
            ) : (
              <table className={invoiceStyles.table}>
                <thead>
                  <tr>
                    <th>Invoice #</th>
                    <th>Date</th>
                    <th>Psychologist</th>
                    <th className={invoiceStyles.thNum}>Amount</th>
                    <th>GST</th>
                    <th className={invoiceStyles.thCenter}>Status</th>
                    <th>Due Date</th>
                    <th className={invoiceStyles.thCenter}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      className={index < invoices.length - 1 ? invoiceStyles.trBorder : undefined}
                    >
                      <td className={invoiceStyles.tdStrong}>#{invoice.id}</td>
                      <td className={invoiceStyles.tdMuted}>{formatDate(invoice.created_at)}</td>
                      <td className={invoiceStyles.tdStrong}>{invoice.psychologist_name || 'N/A'}</td>
                      <td className={`${invoiceStyles.tdStrong} ${invoiceStyles.tdNum}`}>
                        {formatCurrency(invoice.total_amount ?? invoice.amount)}
                      </td>
                      <td className={invoiceStyles.tdGst}>
                        {invoice.is_gst_free ? 'GST-free' : 'Inc. GST'}
                      </td>
                      <td className={invoiceStyles.tdCenter}>
                        <span
                          className={invoiceStyles.statusChip}
                          style={{
                            backgroundColor: getStatusChipColors(invoice.status).bg,
                            color: getStatusChipColors(invoice.status).color,
                          }}
                        >
                          {invoice.status?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td className={invoiceStyles.tdMuted}>{formatDate(invoice.due_date)}</td>
                      <td className={invoiceStyles.tdCenter}>
                        <div className={invoiceStyles.actionCell}>
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
      </PatientShellPage>
    </Layout>
  );
};

