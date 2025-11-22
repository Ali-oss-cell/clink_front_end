# Routes Quick Reference

## 🌐 Public Routes (6)
- `/` - Homepage
- `/about` - About page
- `/services` - Services
- `/telehealth-requirements` - Telehealth requirements
- `/resources` - Resources (placeholder)
- `/contact` - Contact (placeholder)

## 🔐 Auth Routes (2)
- `/login` - Login
- `/register` - Register

## 👤 Patient Routes (15)
- `/patient/dashboard` - Dashboard
- `/patient/intake-form` - Intake form
- `/patient/appointment` - Legacy booking
- `/patient/appointments` - Appointments list
- `/patient/account` - Account settings
- `/patient/invoices` - Invoices
- `/patient/resources` - Resources list
- `/patient/resources/:id` - Resource detail
- `/appointments/book-appointment` - Service selection
- `/appointments/psychologist-selection` - Psychologist selection
- `/appointments/date-time` - Date/time selection
- `/appointments/details` - Review details
- `/appointments/payment` - Payment
- `/appointments/confirmation` - Confirmation

## 🧠 Psychologist Routes (5)
- `/psychologist/dashboard` - Dashboard
- `/psychologist/profile` - Profile
- `/psychologist/schedule` - Schedule
- `/psychologist/patients` - Patients
- `/psychologist/notes` - Progress notes

## 👔 Practice Manager Routes (6)
- `/manager/dashboard` - Dashboard
- `/manager/staff` - Staff management
- `/manager/patients` - Patient management
- `/manager/appointments` - Appointment management
- `/manager/billing` - Billing
- `/manager/resources` - Resources

## 🔧 Admin Routes (11)
- `/admin/dashboard` - Dashboard
- `/admin/users` - User management
- `/admin/appointments` - Appointments
- `/admin/patients` - Patients
- `/admin/staff` - Staff
- `/admin/billing` - Billing
- `/admin/settings` - Settings
- `/admin/analytics` - Analytics
- `/admin/audit-logs` - Audit logs
- `/admin/data-deletion` - Data deletion
- `/admin/resources` - Resources

## 🔄 Shared Routes (2)
- `/recordings` - Session recordings (patient, psychologist, admin, manager)
- `/video-session/:appointmentId` - Video call (patient, psychologist, admin, manager)

**Total: 50+ routes**

See `ROUTES.md` for complete documentation with descriptions and role requirements.

