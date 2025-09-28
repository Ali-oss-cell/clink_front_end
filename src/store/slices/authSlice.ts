import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/simple-auth';

// Types are imported from simple-auth.ts

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  registrationSuccess: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  registrationSuccess: false,
};

// Simple actions for now - async thunks can be added later

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRegistrationSuccess: (state) => {
      state.registrationSuccess = false;
    },
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setRegistrationSuccess: (state, action: PayloadAction<boolean>) => {
      state.registrationSuccess = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.registrationSuccess = false;
    },
  },
});

export const { 
  clearError, 
  clearRegistrationSuccess, 
  setUser, 
  setLoading, 
  setError, 
  setRegistrationSuccess, 
  logout 
} = authSlice.actions;
export default authSlice.reducer;
