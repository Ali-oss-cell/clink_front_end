# Application Routes Documentation

This document lists all routes available in the Clink Frontend application.

## 📋 Table of Contents
- [Public Routes](#public-routes)
- [Authentication Routes](#authentication-routes)
- [Patient Routes](#patient-routes)
- [Psychologist Routes](#psychologist-routes)
- [Practice Manager Routes](#practice-manager-routes)
- [Admin Routes](#admin-routes)
- [Shared Routes](#shared-routes)
- [404 Route](#404-route)

---

## 🌐 Public Routes

These routes are accessible without authentication.

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Homepage` | Landing page |
| `/about` | `AboutPage` | About page |
| `/services` | `ServicesPage` | Services information page |
| `/telehealth-requirements` | `TelehealthRequirementsPage` | Telehealth requirements information |
| `/resources` | Coming Soon | Public resources page (placeholder) |
| `/contact` | Coming Soon | Contact page (placeholder) |

---

## 🔐 Authentication Routes

These routes redirect to dashboard if user is already authenticated.

| Route | Component | Description | Redirects If Authenticated |
|-------|-----------|-------------|---------------------------|
| `/login` | `LoginPage` | User login page | Yes |
| `/register` | `RegisterPage` | User registration page | Yes |

---

## 👤 Patient Routes

All patient routes require authentication and `patient` role.

| Route | Component | Description |
|-------|-----------|-------------|
| `/patient/dashboard` | `PatientDashboardPage` | Patient dashboard with overview |
| `/patient/intake-form` | `PatientIntakeFormPage` | Patient intake form |
| `/patient/appointment` | `PatientAppointmentPage` | Legacy appointment booking page |
| `/patient/appointments` | `PatientAppointmentsPage` | List of patient appointments |
| `/patient/account` | `PatientAccountPage` | Patient account settings and preferences |
| `/patient/invoices` | `PatientInvoicesPage` | Patient invoices list |
| `/patient/resources` | `PatientResourcesPage` | Patient resources list |
| `/patient/resources/:id` | `ResourceDetailPage` | Individual resource detail page |

### Enhanced Booking Flow Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/appointments/book-appointment` | `ServiceSelectionPage` | Step 1: Select service type |
| `/appointments/psychologist-selection` | `PsychologistSelectionPage` | Step 2: Select psychologist |
| `/appointments/date-time` | `DateTimeSelectionPage` | Step 3: Select date and time |
| `/appointments/details` | `AppointmentDetailsPage` | Step 4: Review appointment details |
| `/appointments/payment` | `PaymentPage` | Step 5: Payment processing |
| `/appointments/confirmation` | `ConfirmationPage` | Step 6: Booking confirmation |

---

## 🧠 Psychologist Routes

All psychologist routes require authentication and `psychologist` role.

| Route | Component | Description |
|-------|-----------|-------------|
| `/psychologist/dashboard` | `PsychologistDashboardPage` | Psychologist dashboard |
| `/psychologist/profile` | `PsychologistProfilePage` | Psychologist profile management |
| `/psychologist/schedule` | `PsychologistSchedulePage` | Psychologist schedule and calendar |
| `/psychologist/patients` | `PsychologistPatientsPage` | List of psychologist's patients |
| `/psychologist/notes` | `PsychologistNotesPage` | Progress notes management |

---

## 👔 Practice Manager Routes

All practice manager routes require authentication and `practice_manager` or `admin` role.

| Route | Component | Description | Allowed Roles |
|-------|-----------|-------------|---------------|
| `/manager/dashboard` | `PracticeManagerDashboardPage` | Practice manager dashboard | `practice_manager`, `admin` |
| `/manager/staff` | `ManagerStaffPage` | Staff management | `practice_manager`, `admin` |
| `/manager/patients` | `ManagerPatientsPage` | Patient management | `practice_manager`, `admin` |
| `/manager/appointments` | `ManagerAppointmentsPage` | Appointment management | `practice_manager`, `admin` |
| `/manager/billing` | `ManagerBillingPage` | Billing management | `practice_manager`, `admin` |
| `/manager/resources` | `ManagerResourcesPage` | Resource management | `practice_manager`, `admin`, `psychologist` |

---

## 🔧 Admin Routes

All admin routes require authentication and `admin` role (unless specified otherwise).

| Route | Component | Description | Allowed Roles |
|-------|-----------|-------------|---------------|
| `/admin/dashboard` | `AdminDashboardPage` | Admin dashboard | `admin` |
| `/admin/users` | `UserManagementPage` | User management | `admin` |
| `/admin/appointments` | `AdminAppointmentsPage` | Appointment management | `admin` |
| `/admin/patients` | `AdminPatientsPage` | Patient management | `admin` |
| `/admin/staff` | `AdminStaffPage` | Staff management | `admin` |
| `/admin/billing` | `AdminBillingPage` | Billing management | `admin` |
| `/admin/settings` | `AdminSettingsPage` | System settings | `admin` |
| `/admin/analytics` | `AdminAnalyticsPage` | Analytics and reports | `admin` |
| `/admin/audit-logs` | `AdminAuditLogsPage` | Audit logs | `admin` |
| `/admin/data-deletion` | `AdminDataDeletionPage` | Data deletion requests | `admin`, `practice_manager` |
| `/admin/resources` | `AdminResourcesPage` | Resource management | `admin`, `practice_manager`, `psychologist` |

---

## 🔄 Shared Routes

These routes are accessible to multiple roles.

| Route | Component | Description | Allowed Roles |
|-------|-----------|-------------|---------------|
| `/recordings` | `RecordingsPage` | Session recordings list | `patient`, `psychologist`, `admin`, `practice_manager` |
| `/video-session/:appointmentId` | `VideoCallPage` | Video call session page | `patient`, `psychologist`, `admin`, `practice_manager` |

---

## ❌ 404 Route

| Route | Component | Description |
|-------|-----------|-------------|
| `*` | 404 Page | Catch-all route for unmatched paths |

---

## 📊 Route Summary

- **Total Routes**: 50+
- **Public Routes**: 6
- **Auth Routes**: 2
- **Patient Routes**: 15
- **Psychologist Routes**: 5
- **Practice Manager Routes**: 6
- **Admin Routes**: 11
- **Shared Routes**: 2
- **404 Route**: 1

---

## 🔒 Route Protection

All routes (except public routes) are protected by the `ProtectedRoute` component which:
- Checks if user is authenticated
- Validates user role against `allowedRoles` array
- Redirects to `/login` if not authenticated
- Redirects to appropriate dashboard if role doesn't match

---

## 📝 Notes

- Dynamic routes use `:param` syntax (e.g., `/video-session/:appointmentId`)
- Some routes have multiple allowed roles (see "Allowed Roles" column)
- The booking flow routes (`/appointments/*`) are sequential and should be accessed in order
- Public routes `/resources` and `/contact` are currently placeholders

---

**Last Updated**: Generated from `src/routes/AppRoutes.tsx`

