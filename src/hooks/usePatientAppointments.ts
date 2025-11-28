import { useState, useEffect, useCallback } from 'react';
import { appointmentsService, type PatientAppointmentsResponse } from '../services/api/appointments';

interface UseAppointmentsOptions {
  status?: 'all' | 'upcoming' | 'completed' | 'cancelled' | 'past';
  pageSize?: number;
  autoFetch?: boolean; // Prevent auto-fetch on mount if false
}

export const usePatientAppointments = (options: UseAppointmentsOptions = {}) => {
  const { status = 'all', pageSize = 10, autoFetch = true } = options;

  const [data, setData] = useState<PatientAppointmentsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // ✅ Use useCallback to prevent function recreation on every render
  const fetchAppointments = useCallback(async (page: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const response = await appointmentsService.getPatientAppointments({
        status: status === 'all' ? undefined : status,
        page,
        page_size: pageSize,
      });
      setData(response);
      setCurrentPage(page);
    } catch (err) {
      const errorMessage = err instanceof Error ? err : new Error('Failed to fetch appointments');
      setError(errorMessage);
      setData(null);
      
      // If 404, the endpoint might not exist yet - show empty state
      if ((err as any)?.response?.status === 404) {
        setData({ count: 0, next: null, previous: null, results: [] });
        setError(null); // Don't show error, just empty state
      }
    } finally {
      setLoading(false);
    }
  }, [status, pageSize]); // ✅ Dependencies: only status and pageSize

  // ✅ useEffect with proper dependencies - only runs when needed
  useEffect(() => {
    if (autoFetch) {
      fetchAppointments(1);
    }
  }, [fetchAppointments, autoFetch]); // ✅ Include fetchAppointments in deps

  // ✅ Manual fetch function (for refresh button, etc.)
  const refetch = useCallback(() => {
    fetchAppointments(currentPage);
  }, [fetchAppointments, currentPage]);

  // ✅ Pagination functions
  const nextPage = useCallback(() => {
    if (data?.next) {
      const nextPageNum = currentPage + 1;
      fetchAppointments(nextPageNum);
    }
  }, [data?.next, currentPage, fetchAppointments]);

  const previousPage = useCallback(() => {
    if (data?.previous) {
      const prevPageNum = currentPage - 1;
      fetchAppointments(prevPageNum);
    }
  }, [data?.previous, currentPage, fetchAppointments]);

  return {
    appointments: data?.results || [],
    count: data?.count || 0,
    loading,
    error,
    currentPage,
    hasNext: !!data?.next,
    hasPrevious: !!data?.previous,
    refetch,
    nextPage,
    previousPage,
    fetchAppointments, // Expose for manual control
  };
};

