import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from '../components/common/ProtectedRoute/ProtectedRoute';

// Public pages
import { Homepage } from '../pages/public/Homepage';
import { AboutPage } from '../pages/public/AboutPage';

// Auth pages
import { LoginPage } from '../pages/auth/LoginPage';
import { RegisterPage } from '../pages/auth/RegisterPage';

// Patient pages
import { PatientDashboardPage } from '../pages/patient/PatientDashboardPage';
import { PatientAccountPage } from '../pages/patient/PatientAccountPage';
import { PatientResourcesPage } from '../pages/patient/PatientResourcesPage';
import { ResourceDetailPage } from '../pages/patient/ResourceDetailPage';
import { PatientIntakeFormPage } from '../pages/patient/PatientIntakeFormPage';
import { PatientAppointmentPage } from '../pages/patient/PatientAppointmentPage';
import { PatientAppointmentsPage } from '../pages/patient/PatientAppointmentsPage';
import { PatientInvoicesPage } from '../pages/patient/PatientInvoicesPage';
import { ServiceSelectionPage } from '../pages/patient/ServiceSelectionPage';
import { PsychologistSelectionPage } from '../pages/patient/PsychologistSelectionPage';
import { DateTimeSelectionPage } from '../pages/patient/DateTimeSelectionPage';
import { AppointmentDetailsPage } from '../pages/patient/AppointmentDetailsPage';
import { PaymentPage } from '../pages/patient/PaymentPage';
import { ConfirmationPage } from '../pages/patient/ConfirmationPage';

// Psychologist pages
import { PsychologistDashboardPage } from '../pages/psychologist/PsychologistDashboardPage';
import { PsychologistProfilePage } from '../pages/psychologist/PsychologistProfilePage';
import { PsychologistSchedulePage } from '../pages/psychologist/PsychologistSchedulePage';
import { PsychologistPatientsPage } from '../pages/psychologist/PsychologistPatientsPage';
import { PsychologistNotesPage } from '../pages/psychologist/PsychologistNotesPage';

// Practice Manager pages
import { 
  PracticeManagerDashboardPage,
  ManagerStaffPage,
  ManagerPatientsPage,
  ManagerAppointmentsPage,
  ManagerBillingPage,
  ManagerResourcesPage
} from '../pages/manager';

// Admin pages
import { 
  AdminDashboardPage,
  UserManagementPage,
  AdminAppointmentsPage,
  AdminPatientsPage,
  AdminStaffPage,
  AdminBillingPage,
  AdminSettingsPage,
  AdminAnalyticsPage,
  AdminResourcesPage,
  AdminAuditLogsPage
} from '../pages/admin';

// Video call page
import { VideoCallPage } from '../pages/video';

// TODO: Import these when Redux store is set up
interface AppRoutesProps {
  isAuthenticated?: boolean;
  user?: any; // Will be properly typed when Redux is implemented
  onAuthUpdate?: () => boolean;
  onAuthClear?: () => void;
}

export const AppRoutes: React.FC<AppRoutesProps> = ({ 
  isAuthenticated = false, 
  user = null,
  onAuthUpdate
}) => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Homepage />} />
      <Route path="/about" element={<AboutPage />} />
      
      {/* Services page - TODO */}
      <Route path="/services" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Services Page Coming Soon</h1>
          <p>Our comprehensive psychology services will be listed here.</p>
        </div>
      } />
      
      {/* Resources page - TODO */}
      <Route path="/resources" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Resources Page Coming Soon</h1>
          <p>Mental health resources and tools will be available here.</p>
        </div>
      } />
      
      {/* Contact page - TODO */}
      <Route path="/contact" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>Contact Page Coming Soon</h1>
          <p>Get in touch with MindWell Clinic.</p>
        </div>
      } />

      {/* Auth Routes - redirect to dashboard if already authenticated */}
      <Route path="/login" element={
        <ProtectedRoute 
          requireAuth={false} 
          isAuthenticated={isAuthenticated} 
          user={user}
        >
          <LoginPage onAuthUpdate={onAuthUpdate} />
        </ProtectedRoute>
      } />
      
      <Route path="/register" element={
        <ProtectedRoute 
          requireAuth={false} 
          isAuthenticated={isAuthenticated} 
          user={user}
        >
          <RegisterPage />
        </ProtectedRoute>
      } />

      {/* Patient Routes */}
      <Route path="/patient/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientDashboardPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Intake Form */}
      <Route path="/patient/intake-form" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientIntakeFormPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Appointment Booking */}
      <Route path="/patient/appointment" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientAppointmentPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Service Selection */}
      <Route path="/appointments/book-appointment" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <ServiceSelectionPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Psychologist Selection */}
      <Route path="/appointments/psychologist-selection" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PsychologistSelectionPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Date & Time Selection */}
      <Route path="/appointments/date-time" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <DateTimeSelectionPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Appointment Details */}
      <Route path="/appointments/details" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <AppointmentDetailsPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Payment */}
      <Route path="/appointments/payment" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PaymentPage />
        </ProtectedRoute>
      } />
      
      {/* Enhanced Booking Flow - Confirmation */}
      <Route path="/appointments/confirmation" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <ConfirmationPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Appointments */}
      <Route path="/patient/appointments" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientAppointmentsPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Account */}
      <Route path="/patient/account" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientAccountPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Invoices */}
      <Route path="/patient/invoices" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientInvoicesPage />
        </ProtectedRoute>
      } />
      
      {/* Video Call Session */}
      <Route path="/video-session/:appointmentId" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient', 'psychologist', 'admin', 'practice_manager']}
        >
          <VideoCallPage />
        </ProtectedRoute>
      } />
      
      {/* Patient Resources */}
      <Route path="/patient/resources" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <PatientResourcesPage />
        </ProtectedRoute>
      } />
      
      {/* Resource Detail */}
      <Route path="/patient/resources/:id" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <ResourceDetailPage />
        </ProtectedRoute>
      } />

      {/* Psychologist Routes */}
      <Route path="/psychologist/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['psychologist']}
        >
          <PsychologistDashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/psychologist/profile" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user}
          allowedRoles={['psychologist']}
        >
          <PsychologistProfilePage />
        </ProtectedRoute>
      } />
      
      <Route path="/psychologist/schedule" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user}
          allowedRoles={['psychologist']}
        >
          <PsychologistSchedulePage />
        </ProtectedRoute>
      } />
      
      {/* Psychologist Patients */}
      <Route path="/psychologist/patients" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['psychologist']}
        >
          <PsychologistPatientsPage />
        </ProtectedRoute>
      } />
      
      {/* Psychologist Progress Notes */}
      <Route path="/psychologist/notes" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['psychologist']}
        >
          <PsychologistNotesPage />
        </ProtectedRoute>
      } />

      {/* Practice Manager Routes */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin']}
        >
          <PracticeManagerDashboardPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/staff" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin']}
        >
          <ManagerStaffPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/patients" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin']}
        >
          <ManagerPatientsPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/appointments" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin']}
        >
          <ManagerAppointmentsPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/billing" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin']}
        >
          <ManagerBillingPage />
        </ProtectedRoute>
      } />
      <Route path="/manager/resources" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager', 'admin', 'psychologist']}
        >
          <ManagerResourcesPage />
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminDashboardPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/users" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <UserManagementPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/appointments" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminAppointmentsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/patients" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminPatientsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/staff" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminStaffPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/billing" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminBillingPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/settings" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminSettingsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/analytics" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminAnalyticsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/audit-logs" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <AdminAuditLogsPage />
        </ProtectedRoute>
      } />

      <Route path="/admin/resources" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin', 'practice_manager', 'psychologist']}
        >
          <AdminResourcesPage />
        </ProtectedRoute>
      } />

      {/* Catch-all route - 404 */}
      <Route path="*" element={
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h1>404 - Page Not Found</h1>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/">Return to Homepage</a>
        </div>
      } />
    </Routes>
  );
};
