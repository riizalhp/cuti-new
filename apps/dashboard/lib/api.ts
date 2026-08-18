/**
 * API Client for Employr Dashboard
 *
 * Base configuration for making API calls to the CUTI backend & database.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

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
  // If endpoint is relative (starts with /api or /v1), format correctly
  let url = endpoint;
  if (!endpoint.startsWith("http://") && !endpoint.startsWith("https://")) {
    if (endpoint.startsWith("/api")) {
      url = endpoint;
    } else if (API_BASE_URL) {
      url = `${API_BASE_URL}${endpoint}`;
    } else {
      url = endpoint.startsWith("/v1") ? `/api${endpoint.replace("/v1", "")}` : endpoint;
    }
  }

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
 * CV API Client - Connected directly to Database & User Session
 */
export const cvApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/api/cv");
      return res.data || [];
    } catch {
      return [];
    }
  },
  async getById<T = any>(id: string): Promise<T | null> {
    try {
      const res = await apiGet<T>(`/api/cv/${id}`);
      return res.data || null;
    } catch {
      return null;
    }
  },
  async create<T = any>(cvData: unknown): Promise<T | null> {
    try {
      const res = await apiPost<T>("/api/cv", cvData);
      return res.data || null;
    } catch {
      return null;
    }
  },
  async update<T = any>(id: string, cvData: unknown): Promise<T | null> {
    try {
      const res = await apiFetch<T>(`/api/cv/${id}`, {
        method: "PATCH",
        body: JSON.stringify(cvData),
      });
      return res.data || null;
    } catch {
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/api/cv/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Orders API Client - CV Service & Processing
 */
export const orderApi = {
  async getActiveOrder<T = any>(): Promise<T | null> {
    try {
      const res = await apiGet<T>("/api/orders/active");
      return res.data || null;
    } catch {
      return null;
    }
  },
  async createOrder<T = any>(orderData: unknown): Promise<T | null> {
    try {
      const res = await apiPost<T>("/api/orders", orderData);
      return res.data || null;
    } catch {
      return null;
    }
  },
};

/**
 * Job Tracker API Client - Connected directly to Database & User Session
 */
export const trackerApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/api/applications");
      return res.data || [];
    } catch {
      return [];
    }
  },
  async getById<T = any>(id: string): Promise<T | null> {
    try {
      const res = await apiGet<T>(`/api/applications/${id}`);
      return res.data || null;
    } catch {
      return null;
    }
  },
  async create<T = any>(appData: unknown): Promise<T | null> {
    try {
      const res = await apiPost<T>("/api/applications", appData);
      return res.data || null;
    } catch {
      return null;
    }
  },
  async update<T = any>(id: string, appData: unknown): Promise<T | null> {
    try {
      const res = await apiFetch<T>(`/api/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify(appData),
      });
      return res.data || null;
    } catch {
      return null;
    }
  },
  async updateStatus<T = any>(id: string, status: string): Promise<T | null> {
    try {
      const res = await apiFetch<T>(`/api/applications/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      return res.data || null;
    } catch {
      return null;
    }
  },
  async delete(id: string): Promise<boolean> {
    try {
      await apiDelete(`/api/applications/${id}`);
      return true;
    } catch {
      return false;
    }
  },
};

/**
 * Schedules & Reminders API Client
 */
export const scheduleApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/api/schedules");
      return res.data || [];
    } catch {
      return [];
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
 * Jobs API Client - Job scraping and matching
 */
export const jobsApi = {
  async getAll<T = any>(): Promise<T[]> {
    try {
      const res = await apiGet<T[]>("/api/jobs");
      return res.data || [];
    } catch {
      return [];
    }
  },
  async getRecommended<T = any>(limit: number = 10): Promise<T[]> {
    try {
      const res = await apiGet<T[]>(`/api/jobs/recommended?limit=${limit}`);
      return res.data || [];
    } catch {
      return [];
    }
  },
};

/**
 * Activities API Client - Track user activities and timeline
 */
export const activitiesApi = {
  async getAll<T = any>(limit: number = 10): Promise<T[]> {
    try {
      const res = await apiGet<T[]>(`/api/activities?limit=${limit}`);
      return res.data || [];
    } catch {
      return [];
    }
  },
};

/**
 * AI Gateway API Client (Routes through Admin AI Gateway on port 3002 or API Proxy)
 */
export const aiGatewayApi = {
  async generateCompletion(prompt: string, options?: { systemInstruction?: string; model?: string }) {
    try {
      const res = await fetch("/api/ai", {
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
