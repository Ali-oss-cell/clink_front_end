# 🗺️ **API-to-UI Mapping - Quick Reference**

## **10-Second Overview**

Your backend has **10 API endpoints** for the notes system. Here's **exactly where each one goes** in your React frontend:

---

## 📋 **ENDPOINT → UI MAPPING**

### **1. GET `/api/auth/progress-notes/`**
**📍 Where to use:**
- ✅ **PsychologistNotesPage** (main list view)
- ✅ **PsychologistDashboardPage** (recent notes card)
- ✅ **Search/Filter page** (notes search)

**🎯 Purpose:** Get all progress notes for logged-in psychologist  
**💡 Shows:** Paginated list of SOAP notes with patient names, dates, ratings

---

### **2. POST `/api/auth/progress-notes/`**
**📍 Where to use:**
- ✅ **SOAPNoteForm component** (new note creation)
- ✅ **PsychologistSchedulePage** (after session completion)
- ✅ **PsychologistDashboardPage** ("Write New Note" button)
- ✅ **PsychologistPatientsPage** ("Add Note" for patient)

**🎯 Purpose:** Create new SOAP note after therapy session  
**💡 Triggers:** "Complete Session", "Write Note", "Add Note" buttons

---

### **3. GET `/api/auth/progress-notes/{id}/`**
**📍 Where to use:**
- ✅ **NoteDetailModal component** (view full note)
- ✅ **PsychologistNotesPage** (clicking on a note)
- ✅ **SOAPNoteForm** (when editing existing note)

**🎯 Purpose:** Get full details of single SOAP note  
**💡 Shows:** Complete SOAP format with all fields

---

### **4. PUT `/api/auth/progress-notes/{id}/`**
**📍 Where to use:**
- ✅ **SOAPNoteForm component** (edit mode)
- ✅ **PsychologistNotesPage** ("Edit Note" button)

**🎯 Purpose:** Update existing SOAP note  
**💡 Allows:** Corrections, additions, rating updates

---

### **5. DELETE `/api/auth/progress-notes/{id}/`**
**📍 Where to use:**
- ✅ **PsychologistNotesPage** ("Delete Note" button)
- ✅ **NoteDetailModal** (delete action)

**🎯 Purpose:** Delete progress note (with confirmation dialog)  
**💡 Use Case:** Correcting mistakes, removing duplicates

---

### **6. GET `/api/auth/progress-notes/by_patient/?patient_id={id}`**
**📍 Where to use:**
- ✅ **PsychologistPatientsPage** (patient details modal - Notes tab)
- ✅ **PatientProgressView component** (patient history)
- ✅ **PsychologistNotesPage** (filter by patient)

**🎯 Purpose:** Get all notes for specific patient  
**💡 Shows:** Patient's complete therapy history, chronological notes

---

### **7. GET `/api/auth/patients/`**
**📍 Where to use:**
- ✅ **PsychologistPatientsPage** (main patient list)
- ✅ **SOAPNoteForm** (patient selection dropdown)
- ✅ **PsychologistDashboardPage** (patient stats)

**🎯 Purpose:** Get list of all patients  
**💡 Shows:** Patient roster with basic info and session counts

---

### **8. GET `/api/auth/patients/{patient_id}/`**
**📍 Where to use:**
- ✅ **PatientDetailsModal** (patient info)
- ✅ **PsychologistPatientsPage** (detailed view)

**🎯 Purpose:** Get detailed patient information  
**💡 Shows:** Full profile, emergency contacts, goals, risk factors

---

### **9. GET `/api/auth/patients/{patient_id}/progress/`**
**📍 Where to use:**
- ✅ **PatientProgressChart component** (progress visualization)
- ✅ **PsychologistPatientsPage** (Progress Analytics tab)
- ✅ **PatientReport component** (progress reports)

**🎯 Purpose:** Get comprehensive progress analytics for patient  
**💡 Shows:** Charts, trends, goals progress, session statistics

---

### **10. GET `/api/auth/dashboard/psychologist/`**
**📍 Where to use:**
- ✅ **PsychologistDashboardPage** (all dashboard cards)

**🎯 Purpose:** Get dashboard overview data  
**💡 Shows:** Today's appointments, pending notes, stats, recent activity

---

## 📱 **PAGE-BY-PAGE BREAKDOWN**

### **🏠 PsychologistDashboardPage**
```
Uses APIs:
├── GET /dashboard/psychologist/        → Overview stats
├── GET /progress-notes/?limit=5        → Recent notes
└── POST /progress-notes/               → Quick "Write Note" button
```

### **👥 PsychologistPatientsPage**
```
Uses APIs:
├── GET /patients/                      → Patient list
├── GET /patients/{id}/                 → Patient details
├── GET /progress-notes/by_patient/     → Patient's notes history
├── GET /patients/{id}/progress/        → Progress analytics
└── POST /progress-notes/               → "Add Note" for patient
```

### **📅 PsychologistSchedulePage**
```
Uses APIs:
├── GET /appointments/                  → (existing)
├── GET /progress-notes/by_patient/     → Check if note exists
└── POST /progress-notes/               → Create note after session
```

### **📝 PsychologistNotesPage** *(NEW)*
```
Uses APIs:
├── GET /progress-notes/                → Main notes list
├── GET /progress-notes/{id}/           → View single note
├── POST /progress-notes/               → Create new note
├── PUT /progress-notes/{id}/           → Edit note
├── DELETE /progress-notes/{id}/        → Delete note
└── GET /progress-notes/by_patient/     → Filter by patient
```

### **👤 PsychologistProfilePage**
```
No notes APIs needed (uses psychologist profile endpoints)
```

---

## 🎨 **COMPONENT-BY-COMPONENT BREAKDOWN**

### **📝 SOAPNoteForm Component**
```typescript
// Used in: Dashboard, Patients, Schedule, Notes pages

APIS:
├── POST /progress-notes/               → Create new note
├── PUT /progress-notes/{id}/           → Update existing note
└── GET /patients/                      → Patient dropdown list

Props:
├── patientId?: number                  → Pre-fill patient
├── sessionDate?: string                → Pre-fill date
├── noteId?: number                     → For editing mode
└── onSave: () => void                  → Callback after save
```

### **📊 PatientProgressChart Component**
```typescript
// Used in: Patient details modal, Progress reports

APIS:
└── GET /patients/{id}/progress/        → Progress data for charts

Props:
├── patientId: number                   → Required
└── timeRange?: string                  → Filter (month/year/all)
```

### **📋 NotesList Component**
```typescript
// Used in: NotesPage, Patient details

APIS:
├── GET /progress-notes/                → All notes
└── GET /progress-notes/by_patient/     → Patient-specific

Props:
├── patientId?: number                  → Optional filter
├── limit?: number                      → Pagination
└── onNoteClick: (id) => void           → Click handler
```

### **👁️ NoteDetailModal Component**
```typescript
// Used in: NotesPage, Patient details

APIS:
├── GET /progress-notes/{id}/           → Get full note
├── PUT /progress-notes/{id}/           → Edit note
└── DELETE /progress-notes/{id}/        → Delete note

Props:
├── noteId: number                      → Required
├── isOpen: boolean                     → Modal state
└── onClose: () => void                 → Close handler
```

---

## 🎯 **USER ACTIONS → API CALLS**

### **Psychologist completes a therapy session:**
```
1. Schedule Page → Click "Complete Session"
2. SOAPNoteForm opens
3. Fill out S.O.A.P. sections
4. Click "Save"
5. POST /api/auth/progress-notes/
6. Success → Update UI → Close form
```

### **Psychologist views patient progress:**
```
1. Patients Page → Click patient card
2. Modal opens → Click "Progress" tab
3. GET /api/auth/patients/{id}/progress/
4. Charts render with analytics data
5. Show trends, goals, session stats
```

### **Psychologist searches for a note:**
```
1. Notes Page → Enter patient name in search
2. GET /api/auth/progress-notes/?search=Jane
3. Filter results by patient name
4. Display matching notes
```

### **Psychologist edits a note:**
```
1. Notes Page → Click note → Click "Edit"
2. GET /api/auth/progress-notes/{id}/
3. SOAPNoteForm pre-fills with existing data
4. Make changes
5. Click "Save"
6. PUT /api/auth/progress-notes/{id}/
7. Success → Update UI
```

### **Dashboard loads on login:**
```
1. Navigate to /psychologist/dashboard
2. Parallel API calls:
   ├── GET /api/auth/dashboard/psychologist/
   └── GET /api/auth/progress-notes/?limit=5
3. Render cards with real data
4. Show today's appointments, pending notes, stats
```

---

## 🔐 **AUTHENTICATION PATTERN**

All API calls use the same authentication pattern:

```typescript
const token = localStorage.getItem('access_token');

fetch(url, {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

---

## 🚨 **ERROR HANDLING**

For all API calls, handle these errors:

```typescript
// 401 Unauthorized → Redirect to login
if (response.status === 401) {
  localStorage.removeItem('access_token');
  navigate('/login');
}

// 403 Forbidden → Show "No permission" message
if (response.status === 403) {
  showError('You do not have permission to access this resource');
}

// 404 Not Found → Show "Not found" message
if (response.status === 404) {
  showError('Resource not found');
}

// 500 Server Error → Show "Try again" message
if (response.status === 500) {
  showError('Server error. Please try again later');
}
```

---

## 📦 **SERVICE FILE STRUCTURE**

**File:** `src/services/api/progressNotes.ts`

```typescript
import { axiosInstance } from './axiosInstance';

export class ProgressNotesService {
  private baseURL = '/api/auth';
  
  // 1. List all notes
  async listNotes(params?: { page?: number; limit?: number; search?: string }) {
    return axiosInstance.get(`${this.baseURL}/progress-notes/`, { params });
  }
  
  // 2. Create note
  async createNote(data: CreateNoteRequest) {
    return axiosInstance.post(`${this.baseURL}/progress-notes/`, data);
  }
  
  // 3. Get single note
  async getNote(id: number) {
    return axiosInstance.get(`${this.baseURL}/progress-notes/${id}/`);
  }
  
  // 4. Update note
  async updateNote(id: number, data: UpdateNoteRequest) {
    return axiosInstance.put(`${this.baseURL}/progress-notes/${id}/`, data);
  }
  
  // 5. Delete note
  async deleteNote(id: number) {
    return axiosInstance.delete(`${this.baseURL}/progress-notes/${id}/`);
  }
  
  // 6. Get notes by patient
  async getNotesByPatient(patientId: number) {
    return axiosInstance.get(`${this.baseURL}/progress-notes/by_patient/`, {
      params: { patient_id: patientId }
    });
  }
  
  // 7. Get patient progress
  async getPatientProgress(patientId: number) {
    return axiosInstance.get(`${this.baseURL}/patients/${patientId}/progress/`);
  }
}

export const progressNotesService = new ProgressNotesService();
```

---

## 🎨 **UI STATE MANAGEMENT**

### **Loading States:**
```typescript
const [loading, setLoading] = useState(true);
const [notes, setNotes] = useState<ProgressNote[]>([]);

useEffect(() => {
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const data = await progressNotesService.listNotes();
      setNotes(data.results);
    } catch (error) {
      showError('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };
  fetchNotes();
}, []);
```

### **Form State:**
```typescript
const [formData, setFormData] = useState({
  patient: patientId,
  session_date: new Date().toISOString(),
  session_number: 1,
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
  session_duration: 50,
  progress_rating: 5
});
```

### **Modal State:**
```typescript
const [showNoteModal, setShowNoteModal] = useState(false);
const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);

const handleViewNote = (noteId: number) => {
  setSelectedNoteId(noteId);
  setShowNoteModal(true);
};
```

---

## ⚡ **OPTIMIZATION TIPS**

1. **Caching:**
   ```typescript
   // Cache patient list to avoid refetching
   const [patients, setPatients] = useState<Patient[]>([]);
   
   useEffect(() => {
     if (patients.length === 0) {
       fetchPatients();
     }
   }, [patients]);
   ```

2. **Debounced Search:**
   ```typescript
   // Debounce search to avoid too many API calls
   const debouncedSearch = useMemo(
     () => debounce((query: string) => {
       progressNotesService.listNotes({ search: query });
     }, 500),
     []
   );
   ```

3. **Pagination:**
   ```typescript
   // Load more on scroll
   const [page, setPage] = useState(1);
   const loadMore = () => {
     progressNotesService.listNotes({ page: page + 1 })
       .then(data => {
         setNotes(prev => [...prev, ...data.results]);
         setPage(page + 1);
       });
   };
   ```

---

## 🎯 **PRIORITY CHECKLIST**

### **Must Have (Week 1):**
- [x] Create `progressNotes.ts` service
- [ ] Build SOAP Note Form component
- [ ] Create Progress Notes page
- [ ] Update Dashboard with real data

### **Should Have (Week 2):**
- [ ] Add notes to Patient details
- [ ] Integrate with Schedule page
- [ ] Implement search and filtering
- [ ] Add progress charts

### **Nice to Have (Week 3+):**
- [ ] Export notes to PDF
- [ ] Advanced analytics
- [ ] Note templates
- [ ] Bulk operations

---

## 📞 **QUICK HELP**

**Backend not responding?**
- Check if Django server is running: `python manage.py runserver`
- Verify URL: `http://localhost:8000/api/auth/progress-notes/`
- Check JWT token in localStorage

**Getting 401 errors?**
- Token expired → Re-login
- Token missing → Check localStorage
- Token invalid → Clear storage and login again

**Getting 403 errors?**
- User not a psychologist → Check role
- User doesn't own the note → Can only edit own notes

**Empty data?**
- Create test data in Django admin
- Check backend logs for errors
- Verify API returns data in browser

---

## 🎉 **SUMMARY**

✅ **10 API endpoints** → Mapped to specific pages/components  
✅ **4 existing pages** → Need API integration  
✅ **1 new page** → Progress Notes management  
✅ **4 new components** → SOAP form, charts, lists, modals  
✅ **Clear user flows** → Action → API → UI update  

**Start with Phase 1, test frequently, iterate based on feedback!** 🚀

---

**Questions? Check the main integration plan: `NOTES_SYSTEM_INTEGRATION_PLAN.md`**

