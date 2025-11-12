// Resources API service
import axiosInstance from './axiosInstance';

export interface Resource {
  id: number;
  title: string;
  description: string;
  // Category (both code and display name)
  category: string;
  category_display: string;
  // Type (both code and display name)
  type: string;
  type_display: string;
  // Visual
  icon: string;
  thumbnail_url?: string | null;
  thumbnail_image_url?: string | null; // Primary image URL (prefers uploaded file)
  image_file?: string; // Path to uploaded image
  image_file_url?: string; // Full URL to uploaded image
  // Duration
  duration_minutes?: number;
  estimated_time?: string; // "15 min read" or "20 min"
  // Difficulty
  difficulty_level: string;
  difficulty_display: string;
  // Statistics
  view_count: number;
  is_featured?: boolean;
  // User-specific
  is_bookmarked: boolean;
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface ResourceDetail extends Resource {
  // Content
  content: string;
  content_type: string;
  content_type_display?: string; // "HTML", "Markdown", "Video URL", etc.
  // Media URLs (legacy - for external links)
  media_url?: string | null;
  download_url?: string | null;
  // File URLs (frontend ready)
  pdf_file?: string; // Path to uploaded PDF
  pdf_file_url?: string; // Full URL to uploaded PDF
  download_file_url?: string; // Primary download URL (prefers PDF file)
  // Media flags (for conditional rendering)
  has_media?: boolean; // true if media_url exists
  has_download?: boolean; // true if pdf_file or download_url exists
  has_image?: boolean; // true if image_file or thumbnail_url exists
  // Metadata
  author: string;
  reviewer?: string;
  last_reviewed_date?: string;
  tags: string[];
  references?: Array<{
    title: string;
    url: string;
  }>;
  // Statistics
  average_rating: number;
  total_ratings: number;
  // User-specific data
  user_progress: number; // 0-100 percentage
  user_rating?: {
    rating: number;
    review?: string;
    created_at: string;
    updated_at: string;
  } | null;
  // Related resources
  related_resources?: Array<{
    id: number;
    title: string;
    type: string;
    type_display: string;
    icon?: string;
    thumbnail_url?: string | null;
    thumbnail_image_url?: string | null;
  }>;
  // Status
  is_published?: boolean;
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

  // 11. Create resource (staff only: admin/practice manager/psychologist)
  async createResource(data: CreateResourceRequest): Promise<Resource> {
    try {
      // Check if we have files to upload - if so, use FormData
      const hasFiles = data.image_file || data.pdf_file;
      
      if (hasFiles) {
        const formData = new FormData();
        
        // Append all text fields
        formData.append('title', data.title);
        formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('type', data.type);
        formData.append('icon', data.icon);
        
        if (data.content) formData.append('content', data.content);
        if (data.content_type) formData.append('content_type', data.content_type);
        if (data.duration_minutes !== undefined) formData.append('duration_minutes', data.duration_minutes.toString());
        if (data.difficulty_level) formData.append('difficulty_level', data.difficulty_level);
        if (data.tags && data.tags.length > 0) {
          data.tags.forEach(tag => formData.append('tags', tag));
        }
        if (data.is_published !== undefined) formData.append('is_published', data.is_published.toString());
        if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured.toString());
        if (data.thumbnail_url) formData.append('thumbnail_url', data.thumbnail_url);
        if (data.media_url) formData.append('media_url', data.media_url);
        if (data.download_url) formData.append('download_url', data.download_url);
        
        // Append files if provided
        if (data.image_file) {
          formData.append('image_file', data.image_file);
        }
        if (data.pdf_file) {
          formData.append('pdf_file', data.pdf_file);
        }
        
        // Don't set Content-Type - axios will set it automatically with boundary for FormData
        const response = await axiosInstance.post('/resources/', formData);
        return response.data;
      } else {
        // No files, use regular JSON request
        const response = await axiosInstance.post('/resources/', data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to create resource:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to create resource');
    }
  }

  // 12. Update resource (staff only)
  async updateResource(id: number, data: UpdateResourceRequest): Promise<Resource> {
    try {
      // Check if we have files to upload - if so, use FormData
      const hasFiles = data.image_file || data.pdf_file;
      
      if (hasFiles) {
        const formData = new FormData();
        
        // Append only provided fields
        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.category !== undefined) formData.append('category', data.category);
        if (data.type !== undefined) formData.append('type', data.type);
        if (data.icon !== undefined) formData.append('icon', data.icon);
        if (data.content !== undefined) formData.append('content', data.content);
        if (data.content_type !== undefined) formData.append('content_type', data.content_type);
        if (data.duration_minutes !== undefined) formData.append('duration_minutes', data.duration_minutes.toString());
        if (data.difficulty_level !== undefined) formData.append('difficulty_level', data.difficulty_level);
        if (data.tags !== undefined && data.tags.length > 0) {
          data.tags.forEach(tag => formData.append('tags', tag));
        }
        if (data.is_published !== undefined) formData.append('is_published', data.is_published.toString());
        if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured.toString());
        if (data.thumbnail_url !== undefined) formData.append('thumbnail_url', data.thumbnail_url || '');
        if (data.media_url !== undefined) formData.append('media_url', data.media_url || '');
        if (data.download_url !== undefined) formData.append('download_url', data.download_url || '');
        
        // Append files if provided
        if (data.image_file) {
          formData.append('image_file', data.image_file);
        } else if (data.image_file === null) {
          // To remove file, send null
          formData.append('image_file', '');
        }
        if (data.pdf_file) {
          formData.append('pdf_file', data.pdf_file);
        } else if (data.pdf_file === null) {
          // To remove file, send null
          formData.append('pdf_file', '');
        }
        
        // Don't set Content-Type - axios will set it automatically with boundary for FormData
        const response = await axiosInstance.put(`/resources/${id}/`, formData);
        return response.data;
      } else {
        // No files, use regular JSON request
        const response = await axiosInstance.put(`/resources/${id}/`, data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to update resource');
    }
  }

  // 13. Partial update resource (staff only)
  async patchResource(id: number, data: Partial<UpdateResourceRequest>): Promise<Resource> {
    try {
      // Check if we have files to upload - if so, use FormData
      const hasFiles = data.image_file || data.pdf_file;
      
      if (hasFiles) {
        const formData = new FormData();
        
        // Append only provided fields
        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.category !== undefined) formData.append('category', data.category);
        if (data.type !== undefined) formData.append('type', data.type);
        if (data.icon !== undefined) formData.append('icon', data.icon);
        if (data.content !== undefined) formData.append('content', data.content);
        if (data.content_type !== undefined) formData.append('content_type', data.content_type);
        if (data.duration_minutes !== undefined) formData.append('duration_minutes', data.duration_minutes.toString());
        if (data.difficulty_level !== undefined) formData.append('difficulty_level', data.difficulty_level);
        if (data.tags !== undefined && data.tags.length > 0) {
          data.tags.forEach(tag => formData.append('tags', tag));
        }
        if (data.is_published !== undefined) formData.append('is_published', data.is_published.toString());
        if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured.toString());
        if (data.thumbnail_url !== undefined) formData.append('thumbnail_url', data.thumbnail_url || '');
        if (data.media_url !== undefined) formData.append('media_url', data.media_url || '');
        if (data.download_url !== undefined) formData.append('download_url', data.download_url || '');
        
        // Append files if provided
        if (data.image_file) {
          formData.append('image_file', data.image_file);
        } else if (data.image_file === null) {
          // To remove file, send empty string
          formData.append('image_file', '');
        }
        if (data.pdf_file) {
          formData.append('pdf_file', data.pdf_file);
        } else if (data.pdf_file === null) {
          // To remove file, send empty string
          formData.append('pdf_file', '');
        }
        
        // Don't set Content-Type - axios will set it automatically with boundary for FormData
        const response = await axiosInstance.patch(`/resources/${id}/`, formData);
        return response.data;
      } else {
        // No files, use regular JSON request
        const response = await axiosInstance.patch(`/resources/${id}/`, data);
        return response.data;
      }
    } catch (error: any) {
      console.error('Failed to update resource:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to update resource');
    }
  }

  // 14. Delete resource (staff only)
  async deleteResource(id: number): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/resources/${id}/`);
      return response.data;
    } catch (error: any) {
      console.error('Failed to delete resource:', error);
      throw new Error(error.response?.data?.detail || error.response?.data?.message || 'Failed to delete resource');
    }
  }
}

// Request/Response types for CRUD operations
export interface CreateResourceRequest {
  title: string;
  description: string;
  category: string;
  type: string;
  icon: string;
  content?: string;
  content_type?: string;
  duration_minutes?: number;
  difficulty_level?: string;
  tags?: string[];
  is_published?: boolean;
  is_featured?: boolean;
  thumbnail_url?: string;
  media_url?: string;
  download_url?: string;
  // File upload fields (for FormData)
  image_file?: File | null;
  pdf_file?: File | null;
}

export interface UpdateResourceRequest extends Partial<CreateResourceRequest> {
  title?: string;
  description?: string;
  category?: string;
  type?: string;
  icon?: string;
  content?: string;
  content_type?: string;
  duration_minutes?: number;
  difficulty_level?: string;
  tags?: string[];
  is_published?: boolean;
  is_featured?: boolean;
  thumbnail_url?: string;
  media_url?: string;
  download_url?: string;
  // File upload fields (for FormData)
  image_file?: File | null;
  pdf_file?: File | null;
}

// Export singleton instance
export const resourceService = new ResourceService();

