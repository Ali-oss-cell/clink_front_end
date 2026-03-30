# Theme Quick Reference Card

## Canonical Snapshot (2026-03-31)

Use this section as source-of-truth for active styling.

- Token source: `src/assets/styles/_variables.scss`
- Scoped patient CSS vars: `src/assets/styles/_clinicalSanctuary.scss`
- Governance standard: `docs/CSS_GOVERNANCE.md`

### Active Direction

- Current palette is sage/neutral (not legacy blue-only patient theme).
- Role theming is preserved using `$patient-*` and `$psychologist-*` token groups.
- Feature SCSS files should use tokens, not raw color literals.
- Dashboard buttons are standardized via shared role mixins in `src/assets/styles/_buttonSystem.scss`.
- Glassmorphism surfaces are standardized through shared tokens/mixins in `src/assets/styles/_variables.scss` and `src/assets/styles/_mixins.scss`.

### Core Rule

- Any token change requires synchronized updates to:
  - `COLOR_THEME_GUIDE.md`
  - `THEME_QUICK_REFERENCE.md`

## Summary
✅ **ALL patient pages are now BLUE** 🔵  
✅ **ALL psychologist pages are now GREEN** 🟢

---

## 🔵 Patient Theme (Blue)

### Colors
```scss
$patient-primary: #2563eb;      // Main blue
$patient-dark: #1e40af;         // Dark blue
$patient-light: #60a5fa;        // Light blue
Background: #dbeafe → #bfdbfe   // Blue gradient
```

### Pages Updated ✅
1. ✅ Patient Dashboard
2. ✅ **Patient Appointments** (`/patient/appointments`) ← **JUST UPDATED!**
3. ✅ Appointment Details
4. ✅ Date & Time Selection
5. ✅ Psychologist Selection
6. ✅ Confirmation
7. ✅ Payment
8. ✅ Account Settings
9. ✅ Intake Form
10. ✅ Invoices
11. ✅ Resources

### Components Updated ✅
- ✅ OnboardingProgress (blue theme)
- ✅ SessionTimer (blue theme)

---

## 🟢 Psychologist Theme (Green)

### Colors
```scss
$psychologist-primary: #10b981;  // Main green
$psychologist-dark: #059669;     // Dark green
$psychologist-light: #34d399;    // Light green
Background: #d1fae5 → #a7f3d0    // Green gradient
```

### Pages Updated ✅
1. ✅ Psychologist Dashboard
2. ✅ Schedule/Calendar
3. ✅ Patients List
4. ✅ Progress Notes
5. ✅ Profile Settings

### Components Updated ✅
- ✅ SOAPNoteForm (green theme)

---

## What Was Just Fixed

### Patient Appointments Page (`/patient/appointments`)

**Added:**
- ✅ Blue gradient background (#dbeafe to #bfdbfe)
- ✅ Blue gradient title heading
- ✅ Blue primary action buttons
- ✅ Blue accent on appointment cards
- ✅ Blue hover effects
- ✅ Blue filter tab highlights

**Styled Elements:**
```scss
// Background
.patientLayout { background: blue gradient }

// Title
.welcomeTitle { blue gradient text }

// Buttons
.primaryButton { blue gradient button }
.secondaryButton { blue outline button }

// Cards
.appointmentCard::before { blue top accent }
.appointmentCard:hover { blue border highlight }

// Filter Tabs
.filterTabActive { blue highlight }
```

---

## Files Modified (Complete List)

### Core Variables
- `src/assets/styles/_variables.scss`

### Patient Page Styles (Blue)
1. `src/pages/patient/PatientPages.module.scss`
2. `src/pages/patient/PatientAppointments.module.scss` ← **Latest update**
3. `src/pages/patient/AppointmentDetails.module.scss`
4. `src/pages/patient/DateTimeSelection.module.scss`
5. `src/pages/patient/PsychologistSelection.module.scss`
6. `src/pages/patient/Confirmation.module.scss`
7. `src/pages/patient/Payment.module.scss`

### Patient Component Styles (Blue)
1. `src/components/patient/OnboardingProgress/OnboardingProgress.module.scss`
2. `src/components/patient/SessionTimer/SessionTimer.module.scss`

### Psychologist Page Styles (Green)
1. `src/pages/psychologist/PsychologistPages.module.scss`

### Psychologist Component Styles (Green)
1. `src/components/psychologist/SOAPNoteForm/SOAPNoteForm.module.scss`

---

## How to Test

### Test Patient Pages (Should be Blue)
```bash
# Navigate to these URLs and verify blue theme:
http://localhost:5173/patient/dashboard
http://localhost:5173/patient/appointments      ← Check this one!
http://localhost:5173/patient/resources
http://localhost:5173/patient/account
```

**Expected:**
- 🔵 Light blue background gradient
- 🔵 Blue buttons and interactive elements
- 🔵 Blue gradient text headings
- 🔵 Blue hover effects and highlights

### Test Psychologist Pages (Should be Green)
```bash
# Navigate to these URLs and verify green theme:
http://localhost:5173/psychologist/dashboard
http://localhost:5173/psychologist/schedule
http://localhost:5173/psychologist/patients
http://localhost:5173/psychologist/notes
```

**Expected:**
- 🟢 Light green background gradient
- 🟢 Green buttons and interactive elements
- 🟢 Green gradient text headings
- 🟢 Green hover effects and highlights

---

## Visual Comparison

### Before (Generic)
```
All pages: Same gray/blue generic theme
```

### After (Role-Based)
```
Patient pages:      🔵 Blue theme (#2563eb)
Psychologist pages: 🟢 Green theme (#10b981)
```

---

## Quality Checks ✅

- [x] All patient pages use blue consistently
- [x] All psychologist pages use green consistently
- [x] Patient appointments page has blue theme ← **VERIFIED**
- [x] Buttons styled correctly per role
- [x] Hover states show appropriate colors
- [x] Background gradients applied
- [x] No SCSS linter errors
- [x] Responsive on all screens
- [x] Accessibility maintained

---

## Status: **COMPLETE** ✅

**All patient pages (including appointments) are now BLUE** 🔵  
**All psychologist pages are now GREEN** 🟢

No additional updates needed!

---

## Support Documentation

For more details, see:
- `COLOR_THEME_GUIDE.md` - Technical documentation
- `COLOR_THEME_SUMMARY.md` - User-friendly summary
- `THEME_QUICK_REFERENCE.md` - This reference card

