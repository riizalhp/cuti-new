/**
 * API Client for CUTI Dashboard
 *
 * Base configuration for making API calls to the CUTI backend.
 * This will be expanded as the backend API is developed.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

/**
 * Fetch wrapper with error handling
 */
export async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error: ApiError = {
      message: `API Error: ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  return response.json();
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: "GET" });
}

/**
 * POST request helper
 */
export async function apiPost<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(
  endpoint: string,
  body: unknown
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, { method: "DELETE" });
}
