# Emoji to Icon Conversion Progress

## ✅ Completed Files

### Patient Pages
1. ✅ **PatientAppointmentsPage.tsx** - All emojis converted
   - Calendar, Video, Clipboard, Edit, Close icons
   
2. ✅ **PatientDashboardPage.tsx** - All emojis converted
   - Video, Calendar, Chart, Clipboard, Star, Book, Warning icons

### Status: 2/40 files completed

---

## 🔄 Remaining Files to Convert

### Patient Pages (10 remaining)
- [ ] PatientResourcesPage.tsx
- [ ] ResourceDetailPage.tsx
- [ ] PatientInvoicesPage.tsx
- [ ] PatientAccountPage.tsx
- [ ] PatientIntakeFormPage.tsx
- [ ] PsychologistSelectionPage.tsx
- [ ] ServiceSelectionPage.tsx
- [ ] DateTimeSelectionPage.tsx
- [ ] ConfirmationPage.tsx
- [ ] PaymentPage.tsx
- [ ] AppointmentDetailsPage.tsx

### Psychologist Pages (5 files)
- [ ] PsychologistDashboardPage.tsx
- [ ] PsychologistSchedulePage.tsx
- [ ] PsychologistPatientsPage.tsx
- [ ] PsychologistNotesPage.tsx
- [ ] PsychologistProfilePage.tsx

### Admin Pages (7 files)
- [ ] AdminDashboardPage.tsx
- [ ] AdminAppointmentsPage.tsx
- [ ] AdminResourcesPage.tsx
- [ ] AdminBillingPage.tsx
- [ ] AdminAnalyticsPage.tsx
- [ ] AdminStaffPage.tsx
- [ ] UserManagementPage.tsx

### Manager Pages (4 files)
- [ ] PracticeManagerDashboardPage.tsx
- [ ] ManagerResourcesPage.tsx
- [ ] ManagerBillingPage.tsx
- [ ] ManagerStaffPage.tsx

### Components (4 files)
- [ ] SessionTimer.tsx
- [ ] OnboardingProgress.tsx
- [ ] SOAPNoteForm.tsx
- [ ] Registration components

### Auth Pages (3 files)
- [ ] Login.tsx
- [ ] Register.tsx
- [ ] RegistrationSidebar.tsx

### Other (3 files)
- [ ] VideoCallPage.tsx
- [ ] bookingFlowValidator.ts (utility)
- [ ] testIntakeDataFlow.ts (test file)

---

## Common Emoji → Icon Mappings

```
📅 → <CalendarIcon />
🎥 → <VideoIcon />
👤 → <UserIcon />
👥 → <UsersIcon />
📋 → <ClipboardIcon />
📝 → <NotesIcon />
✖️ → <CloseIcon />
✅ → <CheckCircleIcon />
❌ → <ErrorCircleIcon />
⚙️ → <SettingsIcon />
🏥 → <HospitalIcon />
💬 → <ChatIcon />
📞 → <PhoneIcon />
📊 → <ChartIcon />
📈 → <ChartIcon />
💳 → <CreditCardIcon />
💰 → <DollarIcon />
🔍 → <SearchIcon />
📚 → <BookIcon />
⭐ → <StarIcon />
⚠️ → <WarningIcon />
ℹ️ → <InfoIcon />
```

---

## Standard Import Template

```typescript
import {
  // Add icons you need from this list:
  CalendarIcon,
  VideoIcon,
  UserIcon,
  UsersIcon,
  ClipboardIcon,
  NotesIcon,
  CloseIcon,
  CheckCircleIcon,
  ErrorCircleIcon,
  SettingsIcon,
  HospitalIcon,
  ChatIcon,
  PhoneIcon,
  ChartIcon,
  DollarIcon,
  CreditCardIcon,
  SearchIcon,
  BookIcon,
  StarIcon,
  WarningIcon,
  InfoIcon,
  DoctorIcon,
  EditIcon,
  DeleteIcon,
  SaveIcon,
  PlusIcon,
  CalendarPlusIcon,
  BackIcon,
  ForwardIcon,
  HomeIcon,
  BellIcon,
  LockIcon,
  DownloadIcon,
  PrintIcon
} from '../../utils/icons';  // Adjust path as needed
```

---

## Standard Usage Examples

### In Headings
```tsx
// Before
<h3>📅 Next Appointment</h3>

// After
<h3><CalendarIcon size="md" style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Next Appointment</h3>
```

### In Buttons
```tsx
// Before
<button>🎥 Join Video Session</button>

// After
<button>
  <VideoIcon size="sm" style={{ marginRight: '6px' }} />
  Join Video Session
</button>
```

### Inline in Text
```tsx
// Before
<span>⭐ {rating}/10</span>

// After
<span>
  <StarIcon size="sm" style={{ marginRight: '4px', color: '#f59e0b' }} />
  {rating}/10
</span>
```

### Icon Only (Large)
```tsx
// Before
<div className={styles.emptyIcon}>📅</div>

// After
<div className={styles.emptyIcon}>
  <CalendarIcon size="2xl" />
</div>
```

---

## Notes
- All patient pages should use patient blue theme
- All psychologist pages should use psychologist green theme
- Icon sizes: xs(12px), sm(16px), md(20px), lg(24px), xl(32px), 2xl(40px)
- Add marginRight for spacing: 4px (tight), 6px (normal), 8px (spacious)
- Use verticalAlign: 'middle' for inline icons

