import { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AppRoutes } from './routes/AppRoutes';
import { authService } from './services/api/auth';
import type { User } from './types/simple-auth';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to update auth state (can be called from child components)
  const updateAuthState = () => {
    if (authService.isAuthenticated()) {
      const currentUser = authService.getStoredUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
        return true;
      } else {
        // User data is missing, clear auth state
        authService.logout();
        clearAuthState();
        return false;
      }
    } else {
      // Not authenticated, ensure state is cleared
      clearAuthState();
      return false;
    }
  };

  // Function to clear auth state (for logout)
  const clearAuthState = () => {
    setUser(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    // Check authentication status on app load
    const checkAuth = async () => {
      try {
        updateAuthState();
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid auth data
        authService.logout();
        clearAuthState();
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Listen for storage changes (when user logs in from another tab)
  useEffect(() => {
    const handleStorageChange = () => {
      updateAuthState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#2c5aa0'
      }}>
        Loading...
      </div>
    );
  }

  return (
    <Provider store={store}>
      <Router>
        <AppRoutes 
          isAuthenticated={isAuthenticated} 
          user={user}
          onAuthUpdate={updateAuthState}
          onAuthClear={clearAuthState}
        />
      </Router>
    </Provider>
  );
}

export default App;
