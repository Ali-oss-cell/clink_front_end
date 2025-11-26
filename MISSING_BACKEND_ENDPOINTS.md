# Missing Backend Endpoints Documentation

**Date:** 2025-01-19  
**Project:** Tailored Psychology - Frontend Requirements  
**Status:** Backend Implementation Required

---

## 📋 Executive Summary

This document outlines all backend endpoints that are **required** by the frontend but are **currently missing** from the Django backend API. These endpoints are needed to complete the application functionality.

**Priority Levels:**
- 🔴 **HIGH** - Blocks core functionality
- 🟡 **MEDIUM** - Important but not blocking
- 🟢 **LOW** - Nice to have, optional features

---

## 🎯 Quick Reference

### 🔴 HIGH PRIORITY (5 endpoints)
1. `POST /api/billing/payments/` - Process payment
2. `POST /api/billing/stripe/create-payment-intent/` - Create Stripe payment intent
3. `POST /api/billing/stripe/confirm-payment/` - Confirm Stripe payment
4. `GET /api/billing/payment-methods/` - Get saved payment methods
5. `POST /api/billing/invoices/{id}/pay/` - Pay invoice

**Impact:** Payment processing completely blocked. Users cannot complete appointment bookings.

### 🟡 MEDIUM PRIORITY (3 endpoints)
6. `GET /api/auth/admin/settings/` - Get system settings
7. `PUT /api/auth/admin/settings/` - Update system settings
8. `GET /api/auth/admin/analytics/` - Get system analytics

**Impact:** Admin features partially functional. Settings and analytics pages exist but cannot load/save data.

### 🟢 LOW PRIORITY (1 endpoint)
9. `POST /api/billing/create-invoice/` - Create invoice manually

**Impact:** Optional feature. Admins can still manage invoices through other means.

---

## 📊 Frontend Status

| Feature | Frontend Page | Service Methods | Backend Endpoint | Status |
|---------|--------------|-----------------|------------------|--------|
| Payment Processing | ✅ PaymentPage.tsx | ❌ Missing | ❌ Missing | 🔴 Blocked |
| System Settings | ✅ AdminSettingsPage.tsx | ✅ Exists | ❌ Missing | 🟡 Partial |
| System Analytics | ✅ AdminAnalyticsPage.tsx | ✅ Exists | ❌ Missing | 🟡 Partial |
| Invoice Payment | ✅ AdminBillingPage.tsx | ❌ Missing | ❌ Missing | 🟡 Partial |

---

## 🔴 HIGH PRIORITY - Payment Processing

### Overview
The frontend `PaymentPage.tsx` is ready but cannot process payments without these endpoints. This blocks the complete appointment booking flow.

---

### 1. Process Payment

**Endpoint:** `POST /api/billing/payments/`

**Authentication:** Required (Patient role)

**Description:** Process a payment for an appointment or invoice.

**Request Body:**
```json
{
  "appointment_id": 123,
  "invoice_id": null,  // Optional: if paying an invoice
  "amount": "180.00",
  "currency": "AUD",
  "payment_method": "card",  // "card", "bank_transfer", "medicare"
  "payment_method_id": "pm_1234567890",  // Stripe payment method ID (if card)
  "description": "Payment for appointment #123",
  "metadata": {
    "appointment_id": "123",
    "patient_id": "45"
  }
}
```

**Response (Success - 201 Created):**
```json
{
  "id": 789,
  "appointment_id": 123,
  "invoice_id": null,
  "amount": "180.00",
  "currency": "AUD",
  "status": "succeeded",  // "succeeded", "pending", "failed", "refunded"
  "payment_method": "card",
  "payment_intent_id": "pi_1234567890",  // Stripe payment intent ID
  "transaction_id": "txn_1234567890",
  "created_at": "2025-01-19T10:30:00Z",
  "receipt_url": "https://payments.stripe.com/receipts/...",
  "message": "Payment processed successfully"
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Payment processing failed",
  "details": "Insufficient funds",
  "code": "payment_failed"
}
```

**Response (Error - 402 Payment Required):**
```json
{
  "error": "Payment method declined",
  "details": "Card was declined",
  "code": "card_declined"
}
```

**Frontend Usage:**
- File: `src/pages/patient/PaymentPage.tsx`
- Method: `handlePayment()` function
- Status: ⚠️ Currently has mock implementation

---

### 2. Create Stripe Payment Intent

**Endpoint:** `POST /api/billing/stripe/create-payment-intent/`

**Authentication:** Required (Patient role)

**Description:** Create a Stripe payment intent for client-side payment processing.

**Request Body:**
```json
{
  "amount": 18000,  // Amount in cents
  "currency": "aud",
  "appointment_id": 123,
  "payment_method_types": ["card"],
  "metadata": {
    "appointment_id": "123",
    "patient_id": "45"
  }
}
```

**Response (Success - 200 OK):**
```json
{
  "client_secret": "pi_1234567890_secret_abcdef",
  "payment_intent_id": "pi_1234567890",
  "amount": 18000,
  "currency": "aud",
  "status": "requires_payment_method"
}
```

**Frontend Usage:**
- File: `src/pages/patient/PaymentPage.tsx`
- Purpose: Initialize Stripe Elements with client secret
- Status: ❌ Not implemented

---

### 3. Confirm Stripe Payment

**Endpoint:** `POST /api/billing/stripe/confirm-payment/`

**Authentication:** Required (Patient role)

**Description:** Confirm a Stripe payment after client-side processing.

**Request Body:**
```json
{
  "payment_intent_id": "pi_1234567890",
  "appointment_id": 123
}
```

**Response (Success - 200 OK):**
```json
{
  "id": 789,
  "appointment_id": 123,
  "amount": "180.00",
  "status": "succeeded",
  "payment_intent_id": "pi_1234567890",
  "transaction_id": "txn_1234567890",
  "receipt_url": "https://payments.stripe.com/receipts/...",
  "created_at": "2025-01-19T10:30:00Z"
}
```

**Frontend Usage:**
- File: `src/pages/patient/PaymentPage.tsx`
- Purpose: Finalize payment after Stripe confirmation
- Status: ❌ Not implemented

---

### 4. Get Payment Methods

**Endpoint:** `GET /api/billing/payment-methods/`

**Authentication:** Required (Patient role)

**Description:** Get saved payment methods for the current user.

**Response (Success - 200 OK):**
```json
{
  "payment_methods": [
    {
      "id": 1,
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2025-01-01T10:00:00Z"
    },
    {
      "id": 2,
      "type": "bank_account",
      "bank_account": {
        "bank_name": "Commonwealth Bank",
        "account_name": "John Doe",
        "bsb": "062-000",
        "account_number": "****1234"
      },
      "is_default": false,
      "created_at": "2025-01-05T10:00:00Z"
    }
  ]
}
```

**Frontend Usage:**
- File: `src/pages/patient/PaymentPage.tsx`
- Purpose: Display saved payment methods
- Status: ❌ Not implemented

---

### 5. Pay Invoice

**Endpoint:** `POST /api/billing/invoices/{id}/pay/`

**Authentication:** Required (Patient role or Admin/Practice Manager)

**Description:** Process payment for a specific invoice.

**Request Body:**
```json
{
  "amount": "180.00",  // Optional: if partial payment
  "payment_method": "card",
  "payment_method_id": "pm_1234567890"
}
```

**Response (Success - 200 OK):**
```json
{
  "payment": {
    "id": 789,
    "invoice_id": 456,
    "amount": "180.00",
    "status": "succeeded",
    "created_at": "2025-01-19T10:30:00Z"
  },
  "invoice": {
    "id": 456,
    "status": "paid",
    "amount_paid": "180.00",
    "amount_due": "0.00"
  }
}
```

**Frontend Usage:**
- Files: `src/pages/admin/AdminBillingPage.tsx`, `src/pages/manager/ManagerBillingPage.tsx`
- Purpose: Allow paying invoices from billing pages
- Status: ❌ Not implemented

---

## 🟡 MEDIUM PRIORITY - System Settings

### Overview
The frontend `AdminSettingsPage.tsx` exists and is fully functional, but cannot load or save settings without these endpoints.

---

### 6. Get System Settings

**Endpoint:** `GET /api/auth/admin/settings/`

**Authentication:** Required (Admin role only)

**Description:** Retrieve all system settings.

**Response (Success - 200 OK):**
```json
{
  "clinic": {
    "name": "Tailored Psychology",
    "address": "123 Health Street, Melbourne VIC 3000",
    "phone": "+61 3 9000 0000",
    "email": "info@tailoredpsychology.com.au",
    "website": "https://tailoredpsychology.com.au",
    "abn": "12 345 678 901"
  },
  "system": {
    "timezone": "Australia/Melbourne",
    "language": "en-au",
    "gst_rate": 0.10,
    "medicare_provider_number": "1234567A",
    "ahpra_registration_number": "PSY0001234567"
  },
  "notifications": {
    "email_enabled": true,
    "sms_enabled": true,
    "whatsapp_enabled": false
  },
  "billing": {
    "default_payment_method": "card",
    "invoice_terms_days": 30,
    "auto_generate_invoices": true
  }
}
```

**Frontend Usage:**
- File: `src/pages/admin/AdminSettingsPage.tsx`
- Service: `src/services/api/admin.ts` - `getSystemSettings()` method exists ✅
- Status: ⚠️ Frontend ready, backend endpoint missing

---

### 7. Update System Settings

**Endpoint:** `PUT /api/auth/admin/settings/`

**Authentication:** Required (Admin role only)

**Description:** Update system settings. All fields are optional (partial update).

**Request Body:**
```json
{
  "clinic": {
    "name": "Tailored Psychology",
    "address": "123 Health Street, Melbourne VIC 3000",
    "phone": "+61 3 9000 0000",
    "email": "info@tailoredpsychology.com.au",
    "website": "https://tailoredpsychology.com.au",
    "abn": "12 345 678 901"
  },
  "system": {
    "timezone": "Australia/Melbourne",
    "language": "en-au",
    "gst_rate": 0.10,
    "medicare_provider_number": "1234567A",
    "ahpra_registration_number": "PSY0001234567"
  },
  "notifications": {
    "email_enabled": true,
    "sms_enabled": true,
    "whatsapp_enabled": false
  },
  "billing": {
    "default_payment_method": "card",
    "invoice_terms_days": 30,
    "auto_generate_invoices": true
  }
}
```

**Response (Success - 200 OK):**
```json
{
  "message": "Settings updated successfully",
  "settings": {
    // Same structure as GET response
  }
}
```

**Response (Error - 400 Bad Request):**
```json
{
  "error": "Validation error",
  "details": {
    "system": {
      "ahpra_registration_number": ["Invalid AHPRA format. Expected: 3 letters followed by 10 digits"]
    }
  }
}
```

**Frontend Usage:**
- File: `src/pages/admin/AdminSettingsPage.tsx`
- Service: `src/services/api/admin.ts` - `updateSystemSettings()` method exists ✅
- Status: ⚠️ Frontend ready, backend endpoint missing

**Validation Notes:**
- AHPRA registration number must be validated (format: 3 letters + 10 digits)
- GST rate must be between 0 and 1
- Email must be valid format
- Phone must be valid Australian format

---

## 🟡 MEDIUM PRIORITY - System Analytics

### Overview
The frontend `AdminAnalyticsPage.tsx` exists but cannot display analytics without this endpoint.

---

### 8. Get System Analytics

**Endpoint:** `GET /api/auth/admin/analytics/`

**Authentication:** Required (Admin role only)

**Description:** Get system-wide analytics and metrics.

**Query Parameters:**
- `period` (optional): `"today"`, `"week"`, `"month"`, `"year"`, `"all"` (default: `"month"`)
- `start_date` (optional): ISO date string (e.g., `"2025-01-01"`)
- `end_date` (optional): ISO date string (e.g., `"2025-01-31"`)

**Example Request:**
```
GET /api/auth/admin/analytics/?period=month
GET /api/auth/admin/analytics/?start_date=2025-01-01&end_date=2025-01-31
```

**Response (Success - 200 OK):**
```json
{
  "period": {
    "type": "month",
    "start_date": "2025-01-01",
    "end_date": "2025-01-31"
  },
  "users": {
    "total": 1250,
    "new_this_period": 45,
    "active_this_period": 890,
    "growth_data": [
      { "date": "2025-01-01", "count": 1205 },
      { "date": "2025-01-08", "count": 1215 },
      { "date": "2025-01-15", "count": 1230 },
      { "date": "2025-01-22", "count": 1240 },
      { "date": "2025-01-31", "count": 1250 }
    ],
    "by_role": {
      "patient": 1000,
      "psychologist": 20,
      "practice_manager": 5,
      "admin": 2
    }
  },
  "appointments": {
    "total": 450,
    "completed": 380,
    "cancelled": 50,
    "pending": 20,
    "revenue": "81000.00",
    "trends": [
      { "date": "2025-01-01", "count": 12, "revenue": "2160.00" },
      { "date": "2025-01-08", "count": 15, "revenue": "2700.00" },
      { "date": "2025-01-15", "count": 18, "revenue": "3240.00" },
      { "date": "2025-01-22", "count": 14, "revenue": "2520.00" },
      { "date": "2025-01-31", "count": 16, "revenue": "2880.00" }
    ]
  },
  "revenue": {
    "total": "81000.00",
    "this_period": "81000.00",
    "previous_period": "75000.00",
    "growth_percentage": 8.0,
    "by_payment_method": {
      "card": "60000.00",
      "medicare": "15000.00",
      "bank_transfer": "6000.00"
    },
    "by_service": {
      "individual_therapy": "50000.00",
      "group_therapy": "20000.00",
      "assessment": "11000.00"
    }
  },
  "performance": {
    "average_appointment_duration": 60,
    "average_rating": 4.8,
    "patient_satisfaction": 92,
    "psychologist_utilization": 75,
    "no_show_rate": 5.2
  },
  "progress_notes": {
    "total": 1200,
    "this_period": 380,
    "average_per_patient": 3.2,
    "completion_rate": 95
  }
}
```

**Frontend Usage:**
- File: `src/pages/admin/AdminAnalyticsPage.tsx`
- Service: `src/services/api/admin.ts` - `getSystemAnalytics()` method exists ✅
- Status: ⚠️ Frontend ready, backend endpoint missing

**Charts Data Format:**
The frontend expects arrays of `{ date: string, count: number, revenue?: string }` for chart rendering.

---

## 🟢 LOW PRIORITY - Optional Features

### 9. Create Invoice

**Endpoint:** `POST /api/billing/create-invoice/`

**Authentication:** Required (Admin or Practice Manager role)

**Description:** Manually create an invoice.

**Request Body:**
```json
{
  "patient_id": 45,
  "appointment_id": 123,  // Optional
  "amount": "180.00",
  "description": "Individual therapy session",
  "due_date": "2025-02-19",
  "items": [
    {
      "description": "Individual Therapy Session",
      "quantity": 1,
      "unit_price": "180.00",
      "total": "180.00"
    }
  ]
}
```

**Response (Success - 201 Created):**
```json
{
  "id": 456,
  "invoice_number": "INV-2025-001",
  "patient_id": 45,
  "amount": "180.00",
  "status": "pending",
  "due_date": "2025-02-19",
  "created_at": "2025-01-19T10:00:00Z"
}
```

**Frontend Usage:**
- Files: `src/pages/admin/AdminBillingPage.tsx`, `src/pages/manager/ManagerBillingPage.tsx`
- Purpose: Allow admins/managers to create invoices manually
- Status: ⚠️ Optional feature

---

## 📝 Implementation Notes

### Authentication
All endpoints require JWT authentication via the `Authorization: Bearer <token>` header.

### Error Handling
All endpoints should return consistent error responses:
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Validation
- Use Django REST Framework serializers for validation
- Return field-specific errors for form validation
- Validate AHPRA numbers (format: 3 letters + 10 digits)
- Validate Australian phone numbers
- Validate email addresses

### Stripe Integration
For payment endpoints:
- Store Stripe API keys securely (environment variables)
- Use Stripe webhooks for payment status updates
- Store payment intents and transactions in database
- Handle payment failures gracefully

### Database Models Needed

**Payment Model:**
```python
class Payment(models.Model):
    appointment = ForeignKey(Appointment, null=True)
    invoice = ForeignKey(Invoice, null=True)
    amount = DecimalField(max_digits=10, decimal_places=2)
    currency = CharField(max_length=3, default='AUD')
    status = CharField(max_length=20)  # succeeded, pending, failed, refunded
    payment_method = CharField(max_length=20)
    payment_intent_id = CharField(max_length=255, null=True)
    transaction_id = CharField(max_length=255, null=True)
    receipt_url = URLField(null=True)
    created_at = DateTimeField(auto_now_add=True)
```

**SystemSettings Model:**
```python
class SystemSettings(models.Model):
    # Clinic info
    clinic_name = CharField(max_length=255)
    clinic_address = TextField()
    clinic_phone = CharField(max_length=20)
    clinic_email = EmailField()
    clinic_website = URLField(null=True)
    clinic_abn = CharField(max_length=20, null=True)
    
    # System config
    timezone = CharField(max_length=50, default='Australia/Melbourne')
    language = CharField(max_length=10, default='en-au')
    gst_rate = DecimalField(max_digits=5, decimal_places=4, default=0.10)
    medicare_provider_number = CharField(max_length=20, null=True)
    ahpra_registration_number = CharField(max_length=13, null=True)
    
    # Notifications
    email_enabled = BooleanField(default=True)
    sms_enabled = BooleanField(default=True)
    whatsapp_enabled = BooleanField(default=False)
    
    # Billing
    default_payment_method = CharField(max_length=20, default='card')
    invoice_terms_days = IntegerField(default=30)
    auto_generate_invoices = BooleanField(default=True)
    
    updated_at = DateTimeField(auto_now=True)
```

---

## 🎯 Priority Implementation Order

### Phase 1: Critical (Week 1)
1. ✅ `POST /api/billing/stripe/create-payment-intent/`
2. ✅ `POST /api/billing/stripe/confirm-payment/`
3. ✅ `POST /api/billing/payments/`

### Phase 2: Important (Week 2)
4. ✅ `GET /api/billing/payment-methods/`
5. ✅ `POST /api/billing/invoices/{id}/pay/`
6. ✅ `GET /api/auth/admin/settings/`
7. ✅ `PUT /api/auth/admin/settings/`

### Phase 3: Analytics (Week 3)
8. ✅ `GET /api/auth/admin/analytics/`

### Phase 4: Optional (Week 4)
9. ✅ `POST /api/billing/create-invoice/`

---

## 🔗 Related Frontend Files

### Payment Processing
- `src/pages/patient/PaymentPage.tsx` - Main payment page (has TODOs)
- ❌ **Missing:** `src/services/api/billing.ts` - Needs to be created with payment methods:
  - `createPaymentIntent()`
  - `confirmPayment()`
  - `processPayment()`
  - `getPaymentMethods()`
  - `payInvoice()`

### System Settings
- `src/pages/admin/AdminSettingsPage.tsx` - Settings page
- `src/services/api/admin.ts` - Admin service (methods exist: `getSystemSettings()`, `updateSystemSettings()`) ✅

### System Analytics
- `src/pages/admin/AdminAnalyticsPage.tsx` - Analytics page
- `src/services/api/admin.ts` - Admin service (method exists: `getSystemAnalytics()`) ✅

### Billing
- `src/pages/admin/AdminBillingPage.tsx` - Admin billing page
- `src/pages/manager/ManagerBillingPage.tsx` - Manager billing page
- `src/services/api/admin.ts` - Admin service (needs invoice payment method)

---

## 📦 Frontend Service Layer Status

### ✅ Already Implemented (Frontend Ready)
- `src/services/api/admin.ts`:
  - ✅ `getSystemSettings()` - Ready, waiting for backend
  - ✅ `updateSystemSettings()` - Ready, waiting for backend
  - ✅ `getSystemAnalytics()` - Ready, waiting for backend

### ❌ Needs to be Created
- `src/services/api/billing.ts` - **NEW FILE NEEDED** with:
  ```typescript
  // Payment Processing
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse>
  async confirmPayment(data: ConfirmPaymentRequest): Promise<PaymentResponse>
  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResponse>
  async getPaymentMethods(): Promise<PaymentMethodsResponse>
  async payInvoice(invoiceId: number, data: PayInvoiceRequest): Promise<PaymentResponse>
  ```

**Example Service Structure:**
```typescript
// src/services/api/billing.ts
import axiosInstance from './axiosInstance';

export interface CreatePaymentIntentRequest {
  amount: number; // in cents
  currency: string;
  appointment_id: number;
  payment_method_types?: string[];
  metadata?: Record<string, string>;
}

export interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
  currency: string;
  status: string;
}

export interface ProcessPaymentRequest {
  appointment_id: number;
  invoice_id?: number;
  amount: string;
  currency: string;
  payment_method: string;
  payment_method_id?: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface PaymentResponse {
  id: number;
  appointment_id: number;
  invoice_id?: number;
  amount: string;
  currency: string;
  status: string;
  payment_method: string;
  payment_intent_id?: string;
  transaction_id?: string;
  receipt_url?: string;
  created_at: string;
  message?: string;
}

export class BillingService {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    const response = await axiosInstance.post('/billing/stripe/create-payment-intent/', data);
    return response.data;
  }

  async confirmPayment(data: { payment_intent_id: string; appointment_id: number }): Promise<PaymentResponse> {
    const response = await axiosInstance.post('/billing/stripe/confirm-payment/', data);
    return response.data;
  }

  async processPayment(data: ProcessPaymentRequest): Promise<PaymentResponse> {
    const response = await axiosInstance.post('/billing/payments/', data);
    return response.data;
  }

  async getPaymentMethods(): Promise<{ payment_methods: any[] }> {
    const response = await axiosInstance.get('/billing/payment-methods/');
    return response.data;
  }

  async payInvoice(invoiceId: number, data: { amount?: string; payment_method: string; payment_method_id?: string }): Promise<PaymentResponse> {
    const response = await axiosInstance.post(`/billing/invoices/${invoiceId}/pay/`, data);
    return response.data;
  }
}

export const billingService = new BillingService();
```

---

## ✅ Testing Checklist

For each endpoint, test:
- [ ] Authentication (valid token)
- [ ] Authorization (correct role)
- [ ] Request validation
- [ ] Success response format
- [ ] Error handling
- [ ] Edge cases (empty data, invalid IDs, etc.)
- [ ] Rate limiting (if applicable)
- [ ] Database transactions (for payment endpoints)

---

## 📚 Additional Resources

- **Stripe API Documentation:** https://stripe.com/docs/api
- **Django REST Framework:** https://www.django-rest-framework.org/
- **AHPRA Validation:** See `FRONTEND_AHPRA_VALIDATION_GUIDE.md`
- **Frontend Service Layer:** See `src/services/api/` directory

---

**Last Updated:** 2025-01-19  
**Status:** 📋 Ready for Backend Implementation

