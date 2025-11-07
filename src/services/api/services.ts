// Services API
import axiosInstance from './axiosInstance';

export interface Service {
  id: number;
  name: string;
  description: string;
  standard_fee: string;
  duration_minutes: number;
  is_active: boolean;
}

export interface ServicesResponse {
  results?: Service[];
  data?: Service[];
}

class ServicesService {
  private servicesCache: Service[] | null = null;

  /**
   * Get all services (requires authentication)
   */
  async getAllServices(): Promise<Service[]> {
    try {
      // Return cached services if available
      if (this.servicesCache) {
        return this.servicesCache;
      }
      
      const response = await axiosInstance.get('/services/');
      const data = response.data;
      
      console.log('Services API response:', data);
      
      // Handle paginated or wrapped responses
      let services: Service[];
      if (Array.isArray(data)) {
        services = data;
      } else if (data.results) {
        services = data.results;
      } else if (data.data) {
        services = data.data;
      } else if (typeof data === 'object' && data !== null) {
        // Try to extract services from any property that looks like a list
        const possibleArrays = Object.values(data).filter(val => Array.isArray(val));
        if (possibleArrays.length > 0) {
          services = possibleArrays[0] as Service[];
        } else {
          console.error('API response format:', JSON.stringify(data, null, 2));
          throw new Error('Unexpected API response format - no array found in response');
        }
      } else {
        console.error('API response format:', JSON.stringify(data, null, 2));
        throw new Error('Unexpected API response format');
      }
      
      // Cache the services
      this.servicesCache = services;
      
      return services;
    } catch (error) {
      console.error('Failed to get services:', error);
      throw error;
    }
  }

  /**
   * Get service ID from slug
   */
  async getServiceIdFromSlug(slug: string): Promise<number | null> {
    try {
      const services = await this.getAllServices();
      
      const service = services.find(s => {
        const serviceSlug = s.name.toLowerCase().replace(/ /g, '-');
        
        // Try exact match first
        if (serviceSlug === slug) {
          return true;
        }
        
        // Try partial match (e.g., "individual-therapy" matches "individual-therapy-session")
        if (serviceSlug.includes(slug) || slug.includes(serviceSlug.split('-session')[0])) {
          return true;
        }
        
        return false;
      });
      
      return service ? service.id : null;
    } catch (error) {
      console.error('Failed to get service ID from slug:', error);
      return null;
    }
  }

  /**
   * Get service by ID
   */
  async getServiceById(id: number): Promise<Service | null> {
    try {
      const services = await this.getAllServices();
      return services.find(s => s.id === id) || null;
    } catch (error) {
      console.error('Failed to get service by ID:', error);
      return null;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.servicesCache = null;
  }
}

// Export singleton instance
export const servicesService = new ServicesService();

