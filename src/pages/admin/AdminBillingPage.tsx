import { useState, useEffect } from 'react';
import { ClockIcon, DocumentIcon, CloseIcon } from '../../utils/icons';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Invoice, type Payment, type MedicareClaim } from '../../services/api/admin';
import { downloadInvoicePDF } from '../../utils/invoicePDF';
import styles from './AdminPages.module.scss';

export const AdminBillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [medicareClaims, setMedicareClaims] = useState<MedicareClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'claims'>('invoices');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchBillingData();
  }, [activeTab, statusFilter]);

  const fetchBillingData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (activeTab === 'invoices') {
        const params: any = { page: 1, page_size: 100 };
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        const response = await adminService.getAllInvoices(params);
        setInvoices(response.results || []);
      } else if (activeTab === 'payments') {
        const response = await adminService.getAllPayments({ page: 1, page_size: 100 });
        setPayments(response.results || []);
      } else if (activeTab === 'claims') {
        const params: any = { page: 1, page_size: 100 };
        if (statusFilter !== 'all') {
          params.status = statusFilter;
        }
        const response = await adminService.getAllMedicareClaims(params);
        setMedicareClaims(response.results || []);
      }
    } catch (err: any) {
      console.error('Failed to load billing data:', err);
      setError(err.message || 'Failed to load billing data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | number) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(numAmount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'completed':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'cancelled':
      case 'failed':
        return '#ef4444';
      default:
        return '#6b7280';
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

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.adminLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading billing data...</p>
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
            <h1>Billing & Financials</h1>
            <div className={styles.statsSummary}>
              <span>Invoices: {invoices.length}</span>
              <span>Payments: {payments.length}</span>
              <span>Claims: {medicareClaims.length}</span>
            </div>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
              <button onClick={() => setError(null)}><CloseIcon size="sm" /></button>
            </div>
          )}

          {/* Tabs */}
          <div className={styles.tabContainer}>
            <button
              className={`${styles.tab} ${activeTab === 'invoices' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('invoices')}
            >
              Invoices ({invoices.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'payments' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('payments')}
            >
              Payments ({payments.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'claims' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('claims')}
            >
              Medicare Claims ({medicareClaims.length})
            </button>
          </div>

          {/* Filters */}
          {(activeTab === 'invoices' || activeTab === 'claims') && (
            <div className={styles.filtersBar}>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          )}

          {/* Invoices Table */}
          {activeTab === 'invoices' && (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Patient</th>
                    <th>Psychologist</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Due Date</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? (
                    <tr>
                      <td colSpan={8} className={styles.emptyCell}>
                        No invoices found
                      </td>
                    </tr>
                  ) : (
                    invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td>#{invoice.id}</td>
                        <td>{invoice.patient_name}</td>
                        <td>{invoice.psychologist_name}</td>
                        <td>{formatCurrency(invoice.amount)}</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(invoice.status) }}
                          >
                            {invoice.status}
                          </span>
                        </td>
                        <td>{invoice.due_date ? formatDate(invoice.due_date) : 'N/A'}</td>
                        <td>{formatDate(invoice.created_at)}</td>
                        <td>
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            disabled={downloadingId === invoice.id}
                            className={styles.actionButton}
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
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Payments Table */}
          {activeTab === 'payments' && (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Invoice ID</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        No payments found
                      </td>
                    </tr>
                  ) : (
                    payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>#{payment.id}</td>
                        <td>#{payment.invoice}</td>
                        <td>{formatCurrency(payment.amount)}</td>
                        <td>{payment.payment_method}</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(payment.status) }}
                          >
                            {payment.status}
                          </span>
                        </td>
                        <td>{formatDate(payment.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Medicare Claims Table */}
          {activeTab === 'claims' && (
            <div className={styles.tableContainer}>
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Invoice ID</th>
                    <th>Patient</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {medicareClaims.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        No Medicare claims found
                      </td>
                    </tr>
                  ) : (
                    medicareClaims.map((claim) => (
                      <tr key={claim.id}>
                        <td>#{claim.id}</td>
                        <td>#{claim.invoice}</td>
                        <td>{claim.patient_name}</td>
                        <td>{formatCurrency(claim.amount)}</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(claim.status) }}
                          >
                            {claim.status}
                          </span>
                        </td>
                        <td>{formatDate(claim.created_at)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

