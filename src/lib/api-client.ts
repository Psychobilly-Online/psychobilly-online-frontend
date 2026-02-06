/**
 * API Client - Centralized fetch wrapper for API calls
 * Uses environment variables for base URLs
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const IMAGE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8001';

interface FetchOptions extends RequestInit {
  token?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Generic fetch wrapper with error handling
 */
async function fetchApi<T>(
  url: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge with any existing headers
  if (fetchOptions.headers) {
    Object.entries(fetchOptions.headers).forEach(([key, value]) => {
      if (typeof value === 'string') {
        headers[key] = value;
      }
    });
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.message || data.error || 'API request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error or server unavailable', 500);
  }
}

/**
 * API Client functions
 */
export const apiClient = {
  // Events
  events: {
    list: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchApi(`${API_URL}/events${query}`);
    },
    get: (id: number) => fetchApi(`${API_URL}/events/${id}`),
    create: (data: any, token: string) =>
      fetchApi(`${API_URL}/events`, {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
    update: (id: number, data: any, token: string) =>
      fetchApi(`${API_URL}/events/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
        token,
      }),
    delete: (id: number, token: string) =>
      fetchApi(`${API_URL}/events/${id}`, {
        method: 'DELETE',
        token,
      }),
  },

  // Venues
  venues: {
    list: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchApi(`${API_URL}/venues${query}`);
    },
    get: (id: number) => fetchApi(`${API_URL}/venues/${id}`),
    create: (data: any, token: string) =>
      fetchApi(`${API_URL}/venues`, {
        method: 'POST',
        body: JSON.stringify(data),
        token,
      }),
  },

  // Cities
  cities: {
    list: (params?: Record<string, any>) => {
      const query = params ? `?${new URLSearchParams(params).toString()}` : '';
      return fetchApi(`${API_URL}/cities${query}`);
    },
  },

  // Countries
  countries: {
    list: () => fetchApi(`${API_URL}/countries`),
  },

  // Categories
  categories: {
    list: () => fetchApi(`${API_URL}/categories`),
  },

  // Images
  images: {
    upload: async (file: File, source: string, token: string) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('source', source);

      const response = await fetch(`${IMAGE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new ApiError(
          error.message || 'Image upload failed',
          response.status,
          error
        );
      }

      return response.json();
    },
    getUrl: (imageId: string, variant: 'thumb' | 'medium' | 'full' | 'original' = 'medium') => {
      return `${IMAGE_URL}/${imageId}-${variant}.jpg`;
    },
  },
};

export { ApiError };
export type { FetchOptions };
