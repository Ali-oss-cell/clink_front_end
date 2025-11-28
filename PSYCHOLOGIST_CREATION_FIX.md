# Psychologist Creation Fix

## Problem Identified
- Backend had psychologists without profiles (IDs 3, 4) - missing AHPRA registration
- Psychologist ID 1 was being referenced in bookings but didn't exist
- API endpoint returned psychologists without profiles, causing "Psychologist not found" errors

## Changes Made

### 1. Updated Admin Psychologist Creation Form
**Files Modified:**
- `src/services/api/admin.ts`
- `src/pages/admin/UserManagementPage.tsx`

**Changes:**
- ✅ Added `medicare_rebate_amount` field to `CreateUserRequest` interface
- ✅ Added medicare rebate amount input field to creation form (default: $87.45)
- ✅ Added help text for consultation fee and Medicare rebate fields
- ✅ Ensured AHPRA fields are sent to backend when creating psychologists

**Form Now Includes:**
- **Required Fields:**
  - Email, Password, Full Name, Role
  - AHPRA Registration Number (format: PSY + 10 digits)
  - AHPRA Expiry Date (YYYY-MM-DD)
  
- **Optional Fields:**
  - Phone Number
  - Title (Dr, Mr, Ms, Mrs)
  - Qualifications
  - Years of Experience
  - Consultation Fee (default: $180.00)
  - Medicare Rebate Amount (default: $87.45) ⬅️ **NEW**
  - Medicare Provider Number
  - Bio
  - Accepting New Patients (checkbox)

### 2. Fixed Psychologist Selection Page
**File Modified:**
- `src/pages/patient/PsychologistSelectionPage.tsx`

**Changes:**
- ✅ Filter out psychologists without profiles before displaying
- ✅ Only show psychologists with valid AHPRA registration numbers
- ✅ Added extensive logging to track psychologist IDs at each step
- ✅ Log which psychologists are filtered out and why

**Filter Logic:**
```typescript
const psychologistsWithProfiles = psychologistsData.filter((psych: PsychologistProfile) => {
  const hasProfile = psych.ahpra_registration_number && 
                    psych.ahpra_registration_number.trim() !== '' &&
                    psych.is_active_practitioner !== false;
  if (!hasProfile) {
    console.warn(`Filtering out psychologist ID ${psych.id} - no profile`);
  }
  return hasProfile;
});
```

**Logging Added:**
- Raw psychologists from API
- All psychologist IDs received
- Psychologists with profiles count
- Valid psychologist IDs
- Selected psychologist ID when navigating

## Expected Behavior After Fix

### For Admins:
1. When creating a psychologist, form includes:
   - AHPRA registration number (required with validation)
   - AHPRA expiry date (required)
   - Medicare rebate amount field (optional, default $87.45)
2. Backend creates both User account AND PsychologistProfile
3. No more "Profile not found" errors for new psychologists

### For Patients:
1. Psychologist selection page only shows psychologists with complete profiles
2. Only psychologists with AHPRA registration are displayed
3. Console logs show which psychologists are filtered out
4. Cannot select psychologist without profile
5. No more "Psychologist with ID X not found" errors during booking

## Testing Steps

### 1. Test Psychologist Creation (Admin)
```bash
# As admin user:
1. Go to Admin > User Management
2. Click "Create New User"
3. Select role "Psychologist"
4. Fill required fields:
   - Full Name: "Dr. Test Psychologist"
   - Email: "test.psych@clinic.com"
   - Password: "password123"
   - AHPRA Number: "PSY0001234999"
   - AHPRA Expiry: "2026-12-31"
5. Optional: Set consultation fee and Medicare rebate amount
6. Click "Create User"
7. Verify success message
8. Check psychologist appears with profile
```

### 2. Test Psychologist Selection (Patient)
```bash
# As patient user:
1. Go to Book Appointment
2. Select a service
3. Navigate to psychologist selection
4. Open browser console
5. Verify logs show:
   - "Psychologists with profiles: X"
   - "Valid psychologist IDs: [5, 6]" (or similar)
6. Verify only psychologists with profiles are shown
7. Select a psychologist
8. Continue to date/time selection
9. Verify no "Psychologist not found" errors
```

### 3. Verify Backend Data
```bash
# On backend server:
python check_psychologist.py

# Expected output:
# All displayed psychologists should have:
# ✅ Has Profile | AHPRA: PSY0000000000
# Active: True
```

## Backend Requirements (Already Implemented)

According to the backend guide:
- ✅ AHPRA registration number is required for psychologists
- ✅ AHPRA expiry date is required for psychologists
- ✅ Backend validates AHPRA format (PSY + 10 digits)
- ✅ Backend creates PsychologistProfile automatically when user is created
- ✅ Backend sets default values for optional fields

## API Endpoint Used
- `POST /api/auth/admin/create-user/` - Admin-specific user creation
- Includes automatic profile creation for psychologists

## Related Files
- `src/services/api/admin.ts` - Admin API service
- `src/pages/admin/UserManagementPage.tsx` - User management UI
- `src/pages/patient/PsychologistSelectionPage.tsx` - Psychologist selection UI
- `src/services/api/psychologist.ts` - Psychologist API service
- `src/services/api/appointments.ts` - Appointments service (available slots)

## Summary
✅ Admin can create psychologists with required AHPRA fields
✅ Medicare rebate amount field added to match backend specification
✅ Psychologist selection page filters out incomplete profiles
✅ Extensive logging for debugging psychologist ID issues
✅ No more "Psychologist not found" errors in booking flow

