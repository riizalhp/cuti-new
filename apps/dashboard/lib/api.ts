/**
 * API Client for CUTI Dashboard
 *
 * Base configuration for making API calls to the CUTI backend.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
const AI_GATEWAY_URL = process.env.NEXT_PUBLIC_AI_GATEWAY_URL || "http://localhost:3002";

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

  try {
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

    return await response.json();
  } catch (err: any) {
    // If backend endpoint is unreachable or network error occurs, handle gracefully
    console.warn(`[apiFetch] API call to ${url} failed:`, err.message || err);
    throw err;
  }
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

/**
 * CV API Client
 */
export const cvApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/v1/cv");
      return res.data;
    } catch {
      return [];
    }
  },
  async getById<T = any>(id: string): Promise<T | null> {
    try {
      const res = await apiGet<T>(`/v1/cv/${id}`);
      return res.data;
    } catch {
      return null;
    }
  },
  async create<T = any>(cvData: unknown): Promise<T | null> {
    try {
      const res = await apiPost<T>("/v1/cv", cvData);
      return res.data;
    } catch {
      return null;
    }
  },
  async update<T = any>(id: string, cvData: unknown): Promise<T | null> {
    try {
      const res = await apiFetch<T>(`/v1/cv/${id}`, {
        method: "PATCH",
        body: JSON.stringify(cvData),
      });
      return res.data;
    } catch {
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/v1/cv/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Job Tracker API Client
 */
export const trackerApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/v1/job-applications");
      return res.data;
    } catch {
      return [];
    }
  },
  async create<T = any>(appData: unknown): Promise<T | null> {
    try {
      const res = await apiPost<T>("/v1/job-applications", appData);
      return res.data;
    } catch {
      return null;
    }
  },
  async updateStatus<T = any>(id: string, status: string): Promise<T | null> {
    try {
      const res = await apiPut<T>(`/v1/job-applications/${id}`, { status });
      return res.data;
    } catch {
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/v1/job-applications/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * User Profile API Client
 */
export const userApi = {
  async getProfile<T = any>(): Promise<T | null> {
    try {
      const res = await apiGet<T>("/v1/user/profile");
      return res.data;
    } catch {
      return null;
    }
  },
  async updateProfile<T = any>(profileData: unknown): Promise<T | null> {
    try {
      const res = await apiPut<T>("/v1/user/profile", profileData);
      return res.data;
    } catch {
      return null;
    }
  },
};

/**
 * AI Gateway API Client (Routes through Admin AI Gateway on port 3002 or API Proxy)
 */
export const aiGatewayApi = {
  async generateCompletion(prompt: string, options?: { systemInstruction?: string; model?: string }) {
    try {
      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          systemInstruction: options?.systemInstruction,
          model: options?.model,
        }),
      });
      if (!res.ok) throw new Error(`AI Gateway Error ${res.status}`);
      return await res.json();
    } catch (err: any) {
      console.error("[aiGatewayApi] Request failed:", err);
      throw err;
    }
  },
};

