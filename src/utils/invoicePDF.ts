/**
 * Utility functions for downloading invoice PDFs
 * See PDF_INVOICE_USAGE_GUIDE.md for complete usage documentation
 */

import { adminService } from '../services/api/admin';

/**
 * Download invoice PDF and trigger browser download
 * @param invoiceId - ID of the invoice to download
 * @param invoiceNumber - Optional invoice number for filename (e.g., "INV-12345678")
 * @returns Promise that resolves when download is complete
 */
export const downloadInvoicePDF = async (
  invoiceId: number,
  invoiceNumber?: string
): Promise<void> => {
  try {
    // Get PDF blob from API
    const blob = await adminService.downloadInvoicePDF(invoiceId);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Set filename
    const filename = invoiceNumber 
      ? `Invoice_${invoiceNumber}.pdf`
      : `Invoice_${invoiceId}.pdf`;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download invoice PDF:', error);
    throw error;
  }
};

/**
 * Get invoice PDF as blob (for email attachment or preview)
 * @param invoiceId - ID of the invoice
 * @returns Promise that resolves with the PDF blob
 */
export const getInvoicePDFBlob = async (invoiceId: number): Promise<Blob> => {
  try {
    return await adminService.downloadInvoicePDF(invoiceId);
  } catch (error) {
    console.error('Failed to get invoice PDF blob:', error);
    throw error;
  }
};

/**
 * Open invoice PDF in new tab (for preview)
 * @param invoiceId - ID of the invoice
 * @returns Promise that resolves when PDF is opened
 */
export const previewInvoicePDF = async (invoiceId: number): Promise<void> => {
  try {
    const blob = await adminService.downloadInvoicePDF(invoiceId);
    const url = window.URL.createObjectURL(blob);
    window.open(url, '_blank');
    // Note: URL will be revoked when the tab is closed
  } catch (error) {
    console.error('Failed to preview invoice PDF:', error);
    throw error;
  }
};

