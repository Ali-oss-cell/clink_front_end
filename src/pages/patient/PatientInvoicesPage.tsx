import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Invoice } from '../../services/api/admin';
import { downloadInvoicePDF } from '../../utils/invoicePDF';
import { DocumentIcon, CreditCardIcon, ClockIcon } from '../../utils/icons';
import styles from './PatientPages.module.scss';

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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'overdue':
        return '#ef4444';
      case 'cancelled':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const calculateTotals = () => {
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    const paid = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    const pending = invoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
      .reduce((sum, inv) => sum + parseFloat(inv.amount || '0'), 0);
    
    return { total, paid, pending };
  };

  const totals = calculateTotals();

  if (loading) {
    return (
      <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
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
    <Layout user={user} isAuthenticated={true} className={styles.patientLayout}>
      <div className={styles.pageContainer}>
        <div className="container">
          <div className={styles.pageHeader}>
            <h1>My Invoices</h1>
            <p>View and download your invoices</p>
          </div>

          {error && (
            <div style={{
              background: '#fee2e2',
              border: '1px solid #ef4444',
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
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#3b82f6' }}>
                {formatCurrency(totals.total)}
              </div>
              <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Invoiced</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                {formatCurrency(totals.paid)}
              </div>
              <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Paid</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
                {formatCurrency(totals.pending)}
              </div>
              <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Pending</div>
            </div>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
                {invoices.length}
              </div>
              <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>Total Invoices</div>
            </div>
          </div>

          {/* Filter */}
          <div style={{ marginBottom: '1.5rem' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #d1d5db',
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
            </select>
          </div>

          {/* Invoices Table */}
          <div style={{
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {invoices.length === 0 ? (
              <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
                <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No invoices found</p>
                <p>You don't have any invoices yet.</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Invoice #
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Date
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Psychologist
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#374151' }}>
                      Amount
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                      Status
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: '600', color: '#374151' }}>
                      Due Date
                    </th>
                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: '600', color: '#374151' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, index) => (
                    <tr
                      key={invoice.id}
                      style={{
                        borderBottom: index < invoices.length - 1 ? '1px solid #e5e7eb' : 'none'
                      }}
                    >
                      <td style={{ padding: '1rem', color: '#111827' }}>
                        #{invoice.id}
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {formatDate(invoice.created_at)}
                      </td>
                      <td style={{ padding: '1rem', color: '#111827' }}>
                        {invoice.psychologist_name || 'N/A'}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right', fontWeight: '600', color: '#111827' }}>
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '12px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            backgroundColor: getStatusColor(invoice.status) + '20',
                            color: getStatusColor(invoice.status)
                          }}
                        >
                          {invoice.status?.toUpperCase() || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', color: '#6b7280' }}>
                        {formatDate(invoice.due_date)}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleDownloadPDF(invoice.id)}
                            disabled={downloadingId === invoice.id}
                            style={{
                              padding: '0.5rem 1rem',
                              background: downloadingId === invoice.id ? '#9ca3af' : '#3b82f6',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: downloadingId === invoice.id ? 'not-allowed' : 'pointer',
                              fontSize: '0.875rem',
                              fontWeight: '500',
                              opacity: downloadingId === invoice.id ? 0.6 : 1
                            }}
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
                          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                            <button
                              onClick={() => navigate(`/appointments/payment?invoice=${invoice.id}`)}
                              style={{
                                padding: '0.5rem 1rem',
                                background: '#10b981',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.875rem',
                                fontWeight: '500'
                              }}
                              title="Pay Invoice"
                            >
                              <CreditCardIcon size="sm" style={{ marginRight: '6px' }} />
                              Pay Now
                            </button>
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

