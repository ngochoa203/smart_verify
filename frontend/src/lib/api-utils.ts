/**
 * Utility functions for API calls
 */

/**
 * Get the authentication token from localStorage
 * @returns The authentication token or null if not found
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    // Try to get token from localStorage first
    const token = localStorage.getItem('token');
    if (token) {
      return token;
    }
    
    // If not in localStorage, try to get from cookie
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.startsWith('auth_token=')) {
        const cookieToken = cookie.substring('auth_token='.length, cookie.length);
        // If found in cookie but not in localStorage, restore it to localStorage
        localStorage.setItem('token', cookieToken);
        return cookieToken;
      }
    }
  }
  return null;
}

/**
 * Generic API request helper
 */
export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  return handleApiResponse<T>(response);
}

/**
 * Set the authentication token in localStorage and as a cookie
 * @param token The authentication token
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined' && token) {
    // Store in localStorage for client-side access
    localStorage.setItem('token', token);
    
    // Store as cookie for server-side access (middleware)
    // Set secure and httpOnly in production
    const secure = process.env.NODE_ENV === 'production' ? '; secure' : '';
    document.cookie = `auth_token=${token}; path=/; max-age=86400${secure}`;
  }
}

/**
 * Remove the authentication token from localStorage and cookies
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }
}

/**
 * Create authorization headers with the token
 */
export function getAuthHeaders(): HeadersInit {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

/**
 * Handle API response and throw error if needed
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    } catch (jsonError) {
      throw new Error(`HTTP error ${response.status}`);
    }
  }
  
  try {
    return await response.json();
  } catch (jsonError) {
    throw new Error('Invalid JSON response');
  }
}