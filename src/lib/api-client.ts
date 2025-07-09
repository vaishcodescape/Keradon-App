/**
 * Centralized API Client for frontend API calls
 * Provides standardized error handling, authentication, and request formatting
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: any;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  /**
   * Make a GET request
   */
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  /**
   * Make a POST request
   */
  async post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a PUT request
   */
  async put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      body: data ? JSON.stringify(data) : undefined,
      ...options,
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  /**
   * Upload a file
   */
  async uploadFile<T = any>(endpoint: string, formData: FormData, options?: RequestInit): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
      ...options,
    });
  }

  /**
   * Core request method with error handling
   */
  private async request<T = any>(endpoint: string, options: RequestInit): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Add default headers and credentials
      const requestOptions: RequestInit = {
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          ...options.headers,
        },
        ...options,
      };

      const response = await fetch(url, requestOptions);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data: any;

      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/')) {
        data = await response.text();
      } else {
        data = await response.blob();
      }

      // Handle HTTP error status codes
      if (!response.ok) {
        const error: ApiError = {
          message: data?.error || data?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          code: data?.code,
        };


        
        return {
          success: false,
          error: this.getUserFriendlyError(error),
          metadata: {
            status: response.status,
            statusText: response.statusText,
            url: endpoint,
          },
        };
      }

      // Handle successful response
      if (data && typeof data === 'object' && 'success' in data) {
        // Response already has success/error structure
        return data;
      } else {
        // Wrap raw data in success response
        return {
          success: true,
          data,
          metadata: {
            status: response.status,
            url: endpoint,
          },
        };
      }

    } catch (error: any) {
      
      const apiError: ApiError = {
        message: error.message || 'Network error occurred',
        status: 0,
        code: 'NETWORK_ERROR',
      };

      return {
        success: false,
        error: this.getUserFriendlyError(apiError),
        metadata: {
          url: endpoint,
          originalError: error.message,
        },
      };
    }
  }

  /**
   * Convert technical errors to user-friendly messages
   */
  private getUserFriendlyError(error: ApiError): string {
    const { message, status, code } = error;

    // Handle specific error codes
    switch (code) {
      case 'NETWORK_ERROR':
        return '🌐 Network error. Please check your internet connection and try again.';
      case 'TIMEOUT':
        return '⏱️ Request timeout. Please try again.';
      case 'UNAUTHORIZED':
        return '🔐 You are not authorized. Please sign in again.';
      case 'FORBIDDEN':
        return '🚫 Access denied. You don\'t have permission to perform this action.';
      case 'NOT_FOUND':
        return '🔍 The requested resource was not found.';
      case 'RATE_LIMITED':
        return '🚦 Too many requests. Please wait a moment before trying again.';
      case 'SERVER_ERROR':
        return '🔧 Server error. Please try again later.';
    }

    // Handle HTTP status codes
    switch (status) {
      case 0:
        return '🌐 Network error. Please check your internet connection.';
      case 400:
        return `❌ Bad request: ${message}`;
      case 401:
        return '🔐 You are not authenticated. Please sign in again.';
      case 403:
        return '🚫 Access denied. You don\'t have permission to perform this action.';
      case 404:
        return '🔍 The requested resource was not found.';
      case 408:
        return '⏱️ Request timeout. Please try again.';
      case 429:
        return '🚦 Too many requests. Please wait a moment before trying again.';
      case 500:
        return '🔧 Server error. Please try again later.';
      case 502:
        return '🔧 Bad gateway. The server is temporarily unavailable.';
      case 503:
        return '🔧 Service unavailable. Please try again later.';
      case 504:
        return '⏱️ Gateway timeout. Please try again.';
      default:
        return message || 'An unexpected error occurred.';
    }
  }
}

// Create and export a default API client instance
export const apiClient = new ApiClient();

// Export specific API methods for common endpoints
export const dashboardApi = {
  getStats: () => apiClient.get('/api/dashboard/stats'),
  getStatsFallback: () => apiClient.get('/api/dashboard/stats/fallback'),
};

export const projectsApi = {
  create: (data: any) => apiClient.post('/api/projects/create', data),
  getProjects: () => apiClient.get('/api/projects'),
  getProject: (id: string) => apiClient.get(`/api/projects/${id}`),
  updateProject: (id: string, data: any) => apiClient.put(`/api/projects/${id}`, data),
  deleteProject: (id: string) => apiClient.delete(`/api/projects/${id}`),
};

export const toolsApi = {
  datashark: {
    scrape: (data: { url: string; format: string }) => 
      apiClient.post('/api/tools/datashark', data),
  },
  queryhammerhead: {
    query: (data: { query: string; mode: string; context?: string; model?: string }) => 
      apiClient.post('/api/tools/queryhammerhead', data),
    getInfo: () => apiClient.get('/api/tools/queryhammerhead'),
  },
  vizfin: {
    processFile: (formData: FormData) => 
      apiClient.uploadFile('/api/tools/vizfin', formData),
    query: (data: any) => 
      apiClient.post('/api/tools/vizfin/query', data),
  },
};

export const authApi = {
  checkUser: () => apiClient.get('/api/auth/check-user'),
  createUser: (data: any) => apiClient.post('/api/auth/create-user', data),
  getFirebaseConfig: () => apiClient.get('/api/firebase-config'),
};

export const userApi = {
  getProfile: () => apiClient.get('/api/user/profile'),
  updateProfile: (data: any) => apiClient.put('/api/user/profile', data),
};

// Export types for use in components
export type { ApiResponse as ApiResponseType, ApiError as ApiErrorType }; 