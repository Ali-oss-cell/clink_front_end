# 📄 PDF Invoice Implementation Guide

## 🎯 Pages Where to Implement PDF Invoice Download

Based on the codebase analysis, here are the **3 main pages** where you need to add PDF invoice download functionality:

---

## 1. ✅ **AdminBillingPage** (`src/pages/admin/AdminBillingPage.tsx`)

### **Location:** Admin → Billing & Financials

### **What to Add:**
- Add "Download PDF" button in the **Invoices table** (Actions column)
- Add download functionality for each invoice row

### **Implementation:**

```typescript
// Add import at top
import { downloadInvoicePDF } from '../../utils/invoicePDF';

// Add state for download loading
const [downloadingId, setDownloadingId] = useState<number | null>(null);

// Add download handler
const handleDownloadPDF = async (invoiceId: number) => {
  try {
    setDownloadingId(invoiceId);
    await downloadInvoicePDF(invoiceId);
  } catch (error: any) {
    alert(error.message || 'Failed to download invoice PDF');
  } finally {
    setDownloadingId(null);
  }
};

// Add Actions column to table header (line ~169)
<th>Actions</th>

// Add download button in table body (after line ~195)
<td>
  <button
    onClick={() => handleDownloadPDF(invoice.id)}
    disabled={downloadingId === invoice.id}
    className={styles.actionButton}
  >
    {downloadingId === invoice.id ? 'Downloading...' : '📄 Download PDF'}
  </button>
</td>
```

### **Where in the Table:**
- **Row:** Invoices table (lines 158-202)
- **Column:** Add new "Actions" column after "Created" column
- **Button:** In each invoice row

---

## 2. ✅ **ManagerBillingPage** (`src/pages/manager/ManagerBillingPage.tsx`)

### **Location:** Practice Manager → Billing & Invoices

### **What to Add:**
- Add "Download PDF" button in the **Invoices table** (Actions column)
- Same implementation as AdminBillingPage

### **Implementation:**

```typescript
// Add import at top
import { downloadInvoicePDF } from '../../utils/invoicePDF';

// Add state for download loading
const [downloadingId, setDownloadingId] = useState<number | null>(null);

// Add download handler
const handleDownloadPDF = async (invoiceId: number) => {
  try {
    setDownloadingId(invoiceId);
    await downloadInvoicePDF(invoiceId);
  } catch (error: any) {
    alert(error.message || 'Failed to download invoice PDF');
  } finally {
    setDownloadingId(null);
  }
};

// Add Actions column to table header (line ~171)
<th>Actions</th>

// Add download button in table body (after line ~193)
<td>
  <button
    onClick={() => handleDownloadPDF(invoice.id)}
    disabled={downloadingId === invoice.id}
    className={styles.actionButton}
  >
    {downloadingId === invoice.id ? 'Downloading...' : '📄 Download PDF'}
  </button>
</td>
```

### **Where in the Table:**
- **Row:** Invoices table (lines 160-199)
- **Column:** Add new "Actions" column after "Due Date" column
- **Button:** In each invoice row

---

## 3. ⚠️ **Patient Invoices Page** (NEW - Need to Create)

### **Location:** Patient → My Invoices / Billing

### **Status:** ❌ **Page doesn't exist yet - needs to be created**

### **What to Create:**
1. **New Page:** `src/pages/patient/PatientInvoicesPage.tsx`
2. **Route:** Add to `AppRoutes.tsx` as `/patient/invoices`
3. **Navigation:** Add link in Patient Dashboard and Header

### **Page Features:**
- List all invoices for the logged-in patient
- Show invoice status, amount, due date
- **Download PDF button** for each invoice
- Filter by status (paid, pending, overdue)
- Link to payment page for unpaid invoices

### **Implementation Template:**

```typescript
// src/pages/patient/PatientInvoicesPage.tsx
import { useState, useEffect } from 'react';
import { Layout } from '../../components/common/Layout/Layout';
import { authService } from '../../services/api/auth';
import { adminService, type Invoice } from '../../services/api/admin';
import { downloadInvoicePDF } from '../../utils/invoicePDF';
import styles from './PatientPages.module.scss';

export const PatientInvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const user = authService.getStoredUser();

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      // Note: Backend needs to filter by current patient
      const response = await adminService.getAllInvoices({ page_size: 100 });
      // Filter to only show current patient's invoices
      const patientInvoices = response.results.filter(
        inv => inv.patient_name === user?.full_name
      );
      setInvoices(patientInvoices);
    } catch (error) {
      console.error('Failed to load invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: number) => {
    try {
      setDownloadingId(invoiceId);
      await downloadInvoicePDF(invoiceId);
    } catch (error: any) {
      alert(error.message || 'Failed to download invoice PDF');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Layout user={user} isAuthenticated={true}>
      <div className={styles.pageContainer}>
        <h1>My Invoices</h1>
        <table>
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Due Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => (
              <tr key={invoice.id}>
                <td>#{invoice.id}</td>
                <td>{new Date(invoice.created_at).toLocaleDateString()}</td>
                <td>${invoice.amount}</td>
                <td>{invoice.status}</td>
                <td>{invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</td>
                <td>
                  <button
                    onClick={() => handleDownloadPDF(invoice.id)}
                    disabled={downloadingId === invoice.id}
                  >
                    {downloadingId === invoice.id ? 'Downloading...' : '📄 Download PDF'}
                  </button>
                  {invoice.status !== 'paid' && (
                    <button onClick={() => navigate(`/patient/payment?invoice=${invoice.id}`)}>
                      💳 Pay Now
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};
```

### **Add to Routes:**

```typescript
// src/routes/AppRoutes.tsx
import { PatientInvoicesPage } from '../pages/patient/PatientInvoicesPage';

// Add route (around line 240)
<Route path="/patient/invoices" element={
  <ProtectedRoute 
    isAuthenticated={isAuthenticated} 
    user={user} 
    allowedRoles={['patient']}
  >
    <PatientInvoicesPage />
  </ProtectedRoute>
} />
```

### **Update Patient Dashboard:**

```typescript
// src/pages/patient/PatientDashboardPage.tsx
// Update "View Invoices" button (line ~180)
<button 
  className={styles.actionButton}
  onClick={() => navigate('/patient/invoices')}
>
  View Invoices
</button>
```

---

## 4. 🔗 **Patient Dashboard** (`src/pages/patient/PatientDashboardPage.tsx`)

### **Location:** Patient → Dashboard

### **What to Update:**
- Update "View Invoices" button to navigate to PatientInvoicesPage
- Already has link to invoices (line ~180), just needs route update

### **Implementation:**
- Just update the button onClick to navigate to `/patient/invoices`

---

## 📋 Implementation Checklist

### **Priority 1: Admin & Manager Pages** (High Priority)
- [ ] Add download button to **AdminBillingPage** invoices table
- [ ] Add download button to **ManagerBillingPage** invoices table
- [ ] Test PDF download functionality
- [ ] Add loading states for download

### **Priority 2: Patient Invoices Page** (Medium Priority)
- [ ] Create **PatientInvoicesPage.tsx**
- [ ] Add route to **AppRoutes.tsx**
- [ ] Add navigation link in **Patient Dashboard**
- [ ] Add navigation link in **Header** (if needed)
- [ ] Implement invoice list with download buttons
- [ ] Add filter by status
- [ ] Test patient-only access (security)

### **Priority 3: Enhancements** (Low Priority)
- [ ] Add "Preview PDF" option (opens in new tab)
- [ ] Add "Email PDF" button (for admin/manager)
- [ ] Add bulk download option (for admin)
- [ ] Add invoice detail modal/view

---

## 🎨 UI/UX Recommendations

### **Button Styles:**
```scss
// Add to AdminPages.module.scss and ManagerPages.module.scss
.actionButton {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover:not(:disabled) {
    background: #2563eb;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
```

### **Table Actions Column:**
- Keep buttons small and compact
- Use icons (📄) for visual clarity
- Show loading state during download
- Group related actions together

---

## 🔒 Security Considerations

### **Access Control:**
- ✅ **Admin:** Can download all invoices
- ✅ **Practice Manager:** Can download all invoices
- ✅ **Patient:** Can only download their own invoices
- ❌ **Psychologist:** Cannot download invoices (as per requirements)

### **Backend Validation:**
- Backend must verify user permissions
- Patient requests should only return their own invoices
- PDF download endpoint should check ownership/permissions

---

## 📝 Summary

### **Pages to Update:**

1. ✅ **AdminBillingPage.tsx** - Add download button (15 min)
2. ✅ **ManagerBillingPage.tsx** - Add download button (15 min)
3. ⚠️ **PatientInvoicesPage.tsx** - Create new page (1-2 hours)
4. 🔗 **PatientDashboardPage.tsx** - Update link (5 min)
5. 🔗 **AppRoutes.tsx** - Add route (5 min)

### **Total Implementation Time:**
- **Quick Implementation (Admin/Manager only):** ~30 minutes
- **Full Implementation (including Patient page):** ~2-3 hours

---

## 🚀 Quick Start

**To implement immediately in Admin/Manager pages:**

1. Import the utility:
   ```typescript
   import { downloadInvoicePDF } from '../../utils/invoicePDF';
   ```

2. Add download handler:
   ```typescript
   const handleDownloadPDF = async (invoiceId: number) => {
     try {
       await downloadInvoicePDF(invoiceId);
     } catch (error: any) {
       alert(error.message || 'Failed to download invoice PDF');
     }
   };
   ```

3. Add button in table:
   ```typescript
   <button onClick={() => handleDownloadPDF(invoice.id)}>
     📄 Download PDF
   </button>
   ```

That's it! The PDF will download automatically. 📄✨

