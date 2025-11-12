import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Invoice } from '../../services/api/admin';
import { downloadInvoicePDF } from '../../utils/invoicePDF';
import styles from './ManagerPages.module.scss';

export const ManagerBillingPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const user = authService.getStoredUser();

  useEffect(() => {
    fetchInvoices();
  }, [statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { page_size: 100 };
      if (statusFilter) params.status = statusFilter;
      
      const response = await adminService.getAllInvoices(params);
      setInvoices(response.results);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      setError(err.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  const filteredInvoices = (invoices || []).filter(invoice => {
    const patientName = invoice.patient_name?.toLowerCase() || '';
    const invoiceId = invoice.id?.toString() || '';
    const search = searchTerm.toLowerCase();
    return patientName.includes(search) || invoiceId.includes(search);
  });

  const calculateTotals = () => {
    const total = (invoices || []).reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    const paid = (invoices || [])
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    const pending = (invoices || [])
      .filter(inv => inv.status === 'pending')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    
    return { total, paid, pending };
  };

  const totals = calculateTotals();

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD'
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
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
        return styles.statusPaid;
      case 'pending':
        return styles.statusPending;
      case 'overdue':
        return styles.statusOverdue;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
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
      <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
        <div className={styles.pageContainer}>
          <div className="container">
            <div className={styles.loadingState}>
              <p>Loading billing information...</p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user} isAuthenticated={true} className={styles.managerLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>Billing & Invoices</h1>
            <p>View and manage clinic billing</p>
          </div>

          {error && (
            <div className={styles.errorBanner}>
              <p>{error}</p>
            </div>
          )}

          <div className={styles.filtersRow}>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Search by patient name or invoice ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{formatCurrency(totals.total)}</div>
              <div className={styles.statLabel}>Total Revenue</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{formatCurrency(totals.paid)}</div>
              <div className={styles.statLabel}>Paid</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{formatCurrency(totals.pending)}</div>
              <div className={styles.statLabel}>Pending</div>
            </div>
            <div className={styles.statBox}>
              <div className={styles.statValue}>{(invoices || []).length}</div>
              <div className={styles.statLabel}>Total Invoices</div>
            </div>
          </div>

          <div className={styles.tableContainer}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>Invoice ID</th>
                  <th>Date</th>
                  <th>Patient</th>
                  <th>Psychologist</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Due Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className={styles.emptyState}>
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td>#{invoice.id}</td>
                      <td>{formatDate(invoice.created_at)}</td>
                      <td>{invoice.patient_name || 'N/A'}</td>
                      <td>Dr. {invoice.psychologist_name || 'N/A'}</td>
                      <td>{formatCurrency(invoice.amount)}</td>
                      <td>
                        <span className={getStatusClass(invoice.status)}>
                          {invoice.status?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td>{formatDate(invoice.due_date)}</td>
                      <td>
                        <button
                          onClick={() => handleDownloadPDF(invoice.id)}
                          disabled={downloadingId === invoice.id}
                          className={styles.actionButton}
                          title="Download Invoice PDF"
                        >
                          {downloadingId === invoice.id ? '⏳ Downloading...' : '📄 Download PDF'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

