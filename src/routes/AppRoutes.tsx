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
import { PatientIntakeFormPage } from '../pages/patient/PatientIntakeFormPage';
import { PatientAppointmentPage } from '../pages/patient/PatientAppointmentPage';
import { ServiceSelectionPage } from '../pages/patient/ServiceSelectionPage';
import { PsychologistSelectionPage } from '../pages/patient/PsychologistSelectionPage';
import { DateTimeSelectionPage } from '../pages/patient/DateTimeSelectionPage';
import { AppointmentDetailsPage } from '../pages/patient/AppointmentDetailsPage';
import { PaymentPage } from '../pages/patient/PaymentPage';
import { ConfirmationPage } from '../pages/patient/ConfirmationPage';

// Psychologist pages
import { PsychologistDashboardPage } from '../pages/psychologist/PsychologistDashboardPage';

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
      
      {/* Patient Appointments - TODO */}
      <Route path="/patient/appointments" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['patient']}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Appointments Page Coming Soon</h1>
            <p>View and manage your appointments here.</p>
          </div>
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
      
      {/* Psychologist Schedule - TODO */}
      <Route path="/psychologist/schedule" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['psychologist']}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Schedule Page Coming Soon</h1>
            <p>Manage your appointment schedule here.</p>
          </div>
        </ProtectedRoute>
      } />
      
      {/* Psychologist Patients - TODO */}
      <Route path="/psychologist/patients" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['psychologist']}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Patients Page Coming Soon</h1>
            <p>View and manage your patient list here.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Practice Manager Routes - TODO */}
      <Route path="/manager/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['practice_manager']}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Manager Dashboard Coming Soon</h1>
            <p>Practice management dashboard will be here.</p>
          </div>
        </ProtectedRoute>
      } />

      {/* Admin Routes */}
      <Route path="/admin/dashboard" element={
        <ProtectedRoute 
          isAuthenticated={isAuthenticated} 
          user={user} 
          allowedRoles={['admin']}
        >
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>Admin Dashboard</h1>
            <p>System administration dashboard.</p>
            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
              <h3>Admin Features:</h3>
              <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
                <li>User Management</li>
                <li>System Configuration</li>
                <li>Reports & Analytics</li>
                <li>Security Settings</li>
              </ul>
            </div>
          </div>
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
