# Backend API Contract (Full)

This document defines the backend contract needed to make the current frontend fully production-ready, end-to-end.

Scope includes:
- Public website forms
- Auth and onboarding
- Booking flow
- Payment + confirmation
- Notifications and audit expectations

---

## 1) Base Conventions

## Base URL
- `https://<api-domain>/api`

## Auth
- Access token: `Authorization: Bearer <access_token>`
- Refresh endpoint:
  - `POST /auth/refresh/`

## Response conventions
- Success: `2xx` with JSON body
- Validation errors: `400`
- Unauthorized: `401`
- Forbidden: `403`
- Not found: `404`
- Conflict: `409`
- Rate limit: `429`
- Server error: `500`

## Error format (recommended unified)
```json
{
  "error": "Validation failed",
  "code": "validation_error",
  "details": {
    "field_name": ["Error message"]
  }
}
```

---

## 2) Public Endpoints

### 2.1 Contact form submission
Endpoint:
- `POST /public/contact/`

Request:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+61412345678",
  "subject": "booking",
  "message": "I want an appointment next week.",
  "source_page": "/contact"
}
```

Response `201`:
```json
{
  "message": "Enquiry submitted successfully.",
  "enquiry_id": "ENQ-2026-000123",
  "created_at": "2026-03-26T12:44:12Z"
}
```

Notes:
- Should trigger clinic notification email.
- Should be rate-limited (`429`) to prevent spam.

---

## 3) Authentication + Registration

### 3.1 Patient registration
Endpoint:
- `POST /auth/register/patient/`

Request:
```json
{
  "email": "patient@example.com",
  "password": "StrongPassword123!",
  "password_confirm": "StrongPassword123!",
  "first_name": "Ali",
  "last_name": "User",
  "phone_number": "+61412345678",
  "date_of_birth": "1990-08-15",
  "address_line_1": "12 Main St",
  "suburb": "Sydney",
  "state": "NSW",
  "postcode": "2000",
  "medicare_number": "1234567890"
}
```

Response `201`:
```json
{
  "message": "Registration successful",
  "access": "<jwt-access>",
  "refresh": "<jwt-refresh>",
  "user": {
    "id": 101,
    "email": "patient@example.com",
    "role": "patient",
    "first_name": "Ali",
    "last_name": "User"
  }
}
```

### 3.2 Login
- `POST /auth/login/`

### 3.3 Logout
- `POST /auth/logout/`

### 3.4 Password reset
- `POST /auth/forgot-password/`
- `POST /auth/reset-password/`

---

## 4) Intake Form

Use one endpoint family only (recommended: `/auth/intake-form/`).

### 4.1 Get intake
- `GET /auth/intake-form/`

### 4.2 Submit/update intake
- `PUT /auth/intake-form/`

Core fields expected by frontend include:
- Personal: `first_name`, `last_name`, `date_of_birth`, `phone_number`, `address_line_1`, `suburb`, `state`, `postcode`
- GP/referral: `has_gp_referral`, `gp_name`, `gp_provider_number`, `gp_referral_date`, `gp_referral_expiry_date`, `gp_mhcp_reference`
- Clinical history fields
- Consent fields:
  - `consent_to_treatment`
  - `privacy_policy_accepted`
  - telehealth consent fields where relevant

Response `200`:
```json
{
  "message": "Intake form updated",
  "intake_completed": true
}
```

---

## 5) Services + Psychologists

## IMPORTANT
Use stable, single routes; remove fallback route guessing.

### 5.1 Services list
- `GET /services/`

Response:
```json
{
  "results": [
    {
      "id": 1,
      "name": "Individual Therapy Session",
      "description": "50 minute session",
      "standard_fee": "180.00",
      "duration_minutes": 50,
      "is_active": true
    }
  ]
}
```

### 5.2 Psychologist list
- `GET /services/psychologists/`

### 5.3 Psychologist detail
- `GET /services/psychologists/{id}/`

---

## 6) Appointment Booking Flow

### 6.1 Available slots
- `GET /appointments/available-slots/?psychologist_id=...&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&service_id=...&session_type=telehealth|in_person`

### 6.2 Book enhanced appointment
- `POST /auth/appointments/book-enhanced/`

Request:
```json
{
  "psychologist_id": 12,
  "service_id": 3,
  "time_slot_id": 933,
  "session_type": "telehealth",
  "notes": ""
}
```

Response:
```json
{
  "message": "Appointment booked successfully",
  "appointment": {
    "id": 5531,
    "status": "pending_payment"
  }
}
```

### 6.3 Booking summary
- `GET /appointments/booking-summary/?appointment_id={id}`

Used by appointment review/payment pages.

### 6.4 Save appointment notes before payment
- `PATCH /appointments/{id}/details/`

Request:
```json
{
  "therapy_focus": "Anxiety and sleep",
  "special_requests": "Prefer concise steps",
  "additional_notes": "Work stress recently increased"
}
```

---

## 7) Payment (Required to remove mocks)

Current frontend has mock payment logic. Replace with this flow.

### 7.1 Create payment intent/session
- `POST /payments/create-intent/`

Request:
```json
{
  "appointment_id": 5531,
  "payment_method": "card"
}
```

Response:
```json
{
  "appointment_id": 5531,
  "amount": "92.55",
  "currency": "AUD",
  "payment_intent_id": "pi_xxx",
  "client_secret": "pi_xxx_secret_xxx",
  "status": "requires_payment_method"
}
```

### 7.2 Confirm payment
- `POST /payments/confirm/`

Request:
```json
{
  "appointment_id": 5531,
  "payment_intent_id": "pi_xxx"
}
```

Response:
```json
{
  "message": "Payment confirmed",
  "appointment_id": 5531,
  "appointment_status": "confirmed",
  "payment_status": "paid",
  "receipt_id": "RCT-2026-001924"
}
```

### 7.3 Payment/receipt details
- `GET /payments/receipt/?appointment_id={id}`

---

## 8) Confirmation Page Data

### 8.1 Canonical confirmation endpoint
- `GET /appointments/{id}/confirmation/`

Response:
```json
{
  "appointment_id": 5531,
  "booking_reference": "APT-2026-5531",
  "status": "confirmed",
  "patient": {
    "name": "Ali User",
    "email": "patient@example.com"
  },
  "psychologist": {
    "name": "Dr Sarah Johnson",
    "ahpra_number": "PSY0001234567"
  },
  "service": {
    "name": "Individual Therapy Session",
    "duration_minutes": 50
  },
  "session": {
    "type": "telehealth",
    "formatted_date": "Thursday, 4 April 2026",
    "formatted_time": "10:00 AM",
    "video_room_id": "room_abc123"
  },
  "pricing": {
    "consultation_fee": "180.00",
    "medicare_rebate": "87.45",
    "out_of_pocket_cost": "92.55",
    "gst_amount": "9.25",
    "total_paid": "101.80"
  },
  "receipt_id": "RCT-2026-001924"
}
```

---

## 9) Notifications + Side Effects

Trigger from backend events (not frontend):

- On booking created:
  - Optional booking pending email
- On payment confirmed:
  - Patient confirmation email
  - Clinic notification
  - Optional psychologist notification
  - Optional WhatsApp/SMS
  - Optional ICS/calendar invite

Recommended endpoint (admin/audit visibility):
- `GET /notifications/events/?appointment_id={id}`

---

## 10) Admin/Operational Completeness

To support ops and troubleshooting:

- Contact enquiries listing:
  - `GET /admin/contact-enquiries/`
- Contact enquiry detail:
  - `GET /admin/contact-enquiries/{id}/`
- Mark contact enquiry status:
  - `PATCH /admin/contact-enquiries/{id}/`

- Payment reconciliation endpoints:
  - `GET /billing/payments/`
  - `GET /billing/invoices/`

---

## 11) Frontend Mismatch Fixes Required (High Priority)

1. `PaymentPage` currently reads old query params (`service`, `psychologist`, etc.) while `AppointmentDetailsPage` passes only `appointment_id`.
   - Backend should support appointment-centric payment flow.
   - Frontend should fetch summary by `appointment_id`.

2. Contact form currently has no submit API call.
   - Add backend endpoint in section 2.1 and wire submit.

3. Confirmation page currently generates mock reference locally.
   - Must consume `/appointments/{id}/confirmation/`.

4. Remove endpoint fallbacks and standardize:
   - Intake: keep only one family (`/auth/intake-form/` recommended)
   - Psychologists: keep only one family (`/services/psychologists/` recommended)

---

## 12) Acceptance Criteria (Definition of Done)

The platform is "fully clear / production-ready" when:

- No booking/payment/confirmation step uses mock timeout or generated fake IDs.
- Contact submissions persist in backend and are visible to admin/ops.
- Payment success updates appointment status atomically.
- Confirmation page data comes from backend endpoint only.
- All endpoint families are standardized (no fallback guessing in frontend).
- Field-level validation errors are returned in consistent `details` format.
- End-to-end test path passes:
  - Register -> Intake -> Service -> Psychologist -> Slot -> Book -> Pay -> Confirm -> Notification.

---

## 13) Suggested Implementation Order

1. Contact endpoint (`/public/contact/`)
2. Payment create/confirm endpoints
3. Confirmation endpoint
4. Appointment notes patch endpoint
5. Notification jobs
6. Remove fallback endpoint variants + lock API contract

