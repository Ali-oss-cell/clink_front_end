// Resources API service
import axiosInstance from './axiosInstance';

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
  duration_minutes?: number;
  difficulty_level: string;
  view_count: number;
  is_bookmarked: boolean;
  thumbnail_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ResourceDetail extends Resource {
  content: string;
  content_type: string;
  media_url?: string;
  download_url?: string;
  author: string;
  reviewer?: string;
  last_reviewed_date?: string;
  tags: string[];
  average_rating: number;
  total_ratings: number;
  user_progress: number;
  estimated_reading_time?: string;
  references?: Array<{
    title: string;
    url: string;
  }>;
  related_resources?: Array<{
    id: number;
    title: string;
    type: string;
    thumbnail_url?: string;
  }>;
}

export interface ResourceCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  resource_count: number;
}

export interface ResourcesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Resource[];
}

class ResourceService {
  // 1. Get all resources with filters
  async getResources(params?: {
    category?: string;
    type?: string;
    difficulty?: string;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<ResourcesResponse> {
    try {
      const queryParams: any = {};
      if (params?.category) queryParams.category = params.category;
      if (params?.type) queryParams.type = params.type;
      if (params?.difficulty) queryParams.difficulty = params.difficulty;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      if (params?.page_size) queryParams.page_size = params.page_size;

      const response = await axiosInstance.get('/resources/', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get resources:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load resources');
    }
  }

  // 2. Get single resource by ID
  async getResource(id: number): Promise<ResourceDetail> {
    try {
      const response = await axiosInstance.get(`/resources/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to get resource:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load resource');
    }
  }

  // 3. Get all categories
  async getCategories(): Promise<ResourceCategory[]> {
    try {
      const response = await axiosInstance.get('/resources/categories/');
      return response.data;
    } catch (error: any) {
      console.error('Failed to get categories:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load categories');
    }
  }

  // 4. Bookmark/unbookmark resource
  async toggleBookmark(id: number, action: 'add' | 'remove'): Promise<{ message: string; is_bookmarked: boolean }> {
    try {
      const response = await axiosInstance.post(`/resources/${id}/bookmark/`, { action });
      return response.data;
    } catch (error: any) {
      console.error('Failed to bookmark resource:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update bookmark');
    }
  }

  // 5. Track resource view
  async trackView(id: number): Promise<{ message: string; total_views: number }> {
    try {
      const response = await axiosInstance.post(`/resources/${id}/track-view/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to track view:', error);
      // Don't throw error for tracking - it's not critical
      return { message: 'Failed', total_views: 0 };
    }
  }

  // 6. Update progress
  async updateProgress(
    id: number, 
    progress_percentage: number, 
    current_time_seconds: number
  ): Promise<{ message: string; progress_percentage: number; is_completed: boolean }> {
    try {
      const response = await axiosInstance.post(`/resources/${id}/progress/`, {
        progress_percentage,
        current_time_seconds
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to update progress:', error);
      throw new Error(error.response?.data?.detail || 'Failed to update progress');
    }
  }

  // 7. Rate resource
  async rateResource(
    id: number, 
    rating: number, 
    review?: string
  ): Promise<{ message: string; average_rating: number; total_ratings: number }> {
    try {
      const response = await axiosInstance.post(`/resources/${id}/rate/`, {
        rating,
        review
      });
      return response.data;
    } catch (error: any) {
      console.error('Failed to rate resource:', error);
      throw new Error(error.response?.data?.detail || 'Failed to submit rating');
    }
  }

  // 8. Get user bookmarks
  async getBookmarks(page?: number): Promise<ResourcesResponse> {
    try {
      const params: any = {};
      if (page) params.page = page;
      
      const response = await axiosInstance.get('/resources/bookmarks/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get bookmarks:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load bookmarks');
    }
  }

  // 9. Get user history
  async getHistory(page?: number): Promise<ResourcesResponse> {
    try {
      const params: any = {};
      if (page) params.page = page;
      
      const response = await axiosInstance.get('/resources/history/', { params });
      return response.data;
    } catch (error: any) {
      console.error('Failed to get history:', error);
      throw new Error(error.response?.data?.detail || 'Failed to load history');
    }
  }

  // 10. Advanced search
  async searchResources(params: {
    q: string;
    categories?: string[];
    types?: string[];
    difficulty?: string;
    min_duration?: number;
    max_duration?: number;
    page?: number;
  }): Promise<ResourcesResponse> {
    try {
      const queryParams: any = { q: params.q };
      
      if (params.categories && params.categories.length > 0) {
        queryParams['categories[]'] = params.categories;
      }
      if (params.types && params.types.length > 0) {
        queryParams['types[]'] = params.types;
      }
      if (params.difficulty) queryParams.difficulty = params.difficulty;
      if (params.min_duration) queryParams.min_duration = params.min_duration;
      if (params.max_duration) queryParams.max_duration = params.max_duration;
      if (params.page) queryParams.page = params.page;

      const response = await axiosInstance.get('/resources/search/', { params: queryParams });
      return response.data;
    } catch (error: any) {
      console.error('Failed to search resources:', error);
      throw new Error(error.response?.data?.detail || 'Failed to search resources');
    }
  }
}

// Export singleton instance
export const resourceService = new ResourceService();

