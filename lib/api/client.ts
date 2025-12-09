// Enhanced API Client with interceptors and error handling
import { serializeResponse } from "@/lib/utils/bigint-serializer";

type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
type ResponseInterceptor = (response: Response, data: any) => any | Promise<any>;
type ErrorInterceptor = (error: ApiError) => any | Promise<any>;

export interface RequestConfig extends RequestInit {
  url: string;
  params?: Record<string, string | number | boolean | undefined>;
  skipAuth?: boolean;
  retries?: number;
  timeout?: number;
  disableRetry?: boolean;
  abortSignal?: AbortSignal;
  disableDeduplication?: boolean; // NEW: Disable request deduplication
}

export interface ApiError extends Error {
  status?: number;
  code?: string;
  data?: any;
  fields?: Record<string, string[]>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
const DEFAULT_TIMEOUT = 30000;
const DEFAULT_RETRIES = 1;

class ApiClient {
  private requestInterceptors: RequestInterceptor[] = [];
  private responseInterceptors: ResponseInterceptor[] = [];
  private errorInterceptors: ErrorInterceptor[] = [];
  private activeRequests: Map<string, AbortController> = new Map();

  // Add interceptors
  addRequestInterceptor(interceptor: RequestInterceptor) {
    this.requestInterceptors.push(interceptor);
    return () => {
      const index = this.requestInterceptors.indexOf(interceptor);
      if (index > -1) this.requestInterceptors.splice(index, 1);
    };
  }

  addResponseInterceptor(interceptor: ResponseInterceptor) {
    this.responseInterceptors.push(interceptor);
    return () => {
      const index = this.responseInterceptors.indexOf(interceptor);
      if (index > -1) this.responseInterceptors.splice(index, 1);
    };
  }

  addErrorInterceptor(interceptor: ErrorInterceptor) {
    this.errorInterceptors.push(interceptor);
    return () => {
      const index = this.errorInterceptors.indexOf(interceptor);
      if (index > -1) this.errorInterceptors.splice(index, 1);
    };
  }

  // Token management
  getAccessToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accessToken");
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem("refreshToken");
    }
    return null;
  }

  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
    }
  }

  clearTokens() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }
  }

  // Cancel all active requests
  cancelAllRequests() {
    this.activeRequests.forEach((controller) => controller.abort());
    this.activeRequests.clear();
  }

  // Cancel specific request
  cancelRequest(requestKey: string) {
    const controller = this.activeRequests.get(requestKey);
    if (controller) {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }
  }

  // Parse Zod validation errors into field-specific errors
  private parseValidationErrors(data: any): Record<string, string[]> {
    const fields: Record<string, string[]> = {};

    if (data?.errorMessages && Array.isArray(data.errorMessages)) {
      // Handle Zod error format: [{ path: "body.email", message: "Invalid" }]
      data.errorMessages.forEach((err: any) => {
        if (err.path && err.message) {
          // Extract field name from path (e.g., "body.email" -> "email")
          const field = typeof err.path === "string" ? err.path.replace("body.", "") : err.path;
          if (!fields[field]) fields[field] = [];
          fields[field].push(err.message);
        }
      });
    }

    if (data?.errors) {
      if (Array.isArray(data.errors)) {
        // Handle array format: [{ field: "email", message: "Invalid" }]
        data.errors.forEach((err: any) => {
          if (err.field && err.message) {
            if (!fields[err.field]) fields[err.field] = [];
            fields[err.field].push(err.message);
          }
        });
      } else if (typeof data.errors === "object") {
        // Handle object format: { email: ["Invalid"], password: ["Too short"] }
        Object.entries(data.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            fields[field] = messages;
          } else if (typeof messages === "string") {
            fields[field] = [messages];
          }
        });
      }
    }

    return fields;
  }

  // Main request method
  async request<T = any>(config: RequestConfig): Promise<T> {
    let processedConfig = { ...config };

    // Run request interceptors
    for (const interceptor of this.requestInterceptors) {
      processedConfig = await interceptor(processedConfig);
    }

    const {
      url,
      params,
      skipAuth,
      retries = DEFAULT_RETRIES,
      timeout = DEFAULT_TIMEOUT,
      disableRetry = false,
      abortSignal,
      disableDeduplication = false, // NEW
      ...fetchOptions
    } = processedConfig;

    // Build URL with query params
    let fullUrl = `${API_BASE_URL}${url}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) searchParams.append(key, String(value));
      });
      const queryString = searchParams.toString();
      if (queryString) fullUrl += `?${queryString}`;
    }

    // Set headers
    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    };

    // Add auth token
    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
    }

    // Create request key for deduplication - add timestamp for unique requests
    const requestKey = disableDeduplication
      ? `${fetchOptions.method || "GET"}_${fullUrl}_${Date.now()}_${Math.random()}`
      : `${fetchOptions.method || "GET"}_${fullUrl}`;

    // FIXED: Only cancel previous request if deduplication is enabled
    if (!disableDeduplication && this.activeRequests.has(requestKey)) {
      this.activeRequests.get(requestKey)?.abort();
    }

    // Create abort controller for timeout and cancellation
    const controller = new AbortController();
    this.activeRequests.set(requestKey, controller);

    const timeoutId = setTimeout(() => {
      controller.abort();
      this.activeRequests.delete(requestKey);
    }, timeout);

    // Use provided abort signal if available
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        controller.abort();
        this.activeRequests.delete(requestKey);
      });
    }

    let lastError: ApiError | null = null;
    let attempts = 0;
    const maxRetries = disableRetry ? 0 : retries;

    while (attempts <= maxRetries) {
      try {
        const response = await fetch(fullUrl, {
          ...fetchOptions,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this.activeRequests.delete(requestKey);

        let data: any;
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          data = await response.json();
          // Apply BigInt serialization fix
          data = serializeResponse(data);
        } else {
          data = await response.text();
        }

        if (!response.ok) {
          const error: ApiError = new Error(data?.message || `HTTP ${response.status}`);
          error.status = response.status;
          error.code = data?.code;
          error.data = data;
          error.fields = this.parseValidationErrors(data);
          throw error;
        }

        // Run response interceptors
        let result = data;
        for (const interceptor of this.responseInterceptors) {
          result = await interceptor(response, result);
        }

        return result;
      } catch (err: any) {
        clearTimeout(timeoutId);
        this.activeRequests.delete(requestKey);

        // Handle abort
        if (err.name === "AbortError") {
          const abortError: ApiError = new Error("Request was cancelled");
          abortError.code = "REQUEST_CANCELLED";
          throw abortError;
        }

        lastError = err as ApiError;

        // Don't retry on client errors (4xx) except 429 (rate limit) and 408 (timeout)
        if (lastError.status && lastError.status >= 400 && lastError.status < 500) {
          if (lastError.status !== 429 && lastError.status !== 408) {
            break;
          }
        }

        attempts++;
        if (attempts <= maxRetries) {
          // Exponential backoff: 100ms, 200ms, 400ms, etc.
          const delay = Math.pow(2, attempts) * 100;
          // Add jitter to prevent thundering herd
          const jitter = Math.random() * 100;
          await new Promise((resolve) => setTimeout(resolve, delay + jitter));
        }
      }
    }

    // Run error interceptors
    for (const interceptor of this.errorInterceptors) {
      try {
        const result = await interceptor(lastError!);
        if (result !== undefined) return result;
      } catch {
        // Continue to next interceptor
      }
    }

    throw lastError;
  }

  // Convenience methods with abort signal support
  get<T = any>(url: string, params?: Record<string, any>, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, params, method: "GET" });
  }

  post<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "POST", body: JSON.stringify(data) });
  }

  patch<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "PATCH", body: JSON.stringify(data) });
  }

  put<T = any>(url: string, data?: any, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "PUT", body: JSON.stringify(data) });
  }

  delete<T = any>(url: string, config?: Partial<RequestConfig>) {
    return this.request<T>({ ...config, url, method: "DELETE" });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Default interceptors
apiClient.addRequestInterceptor((config) => {
  // Add request timestamp for debugging
  if (process.env.NODE_ENV === "development") {
    console.log(`[API] ${config.method || "GET"} ${config.url}`);
  }
  return config;
});

apiClient.addErrorInterceptor(async (error) => {
  // Handle 401 - try to refresh token once
  if (error.status === 401 && !error.data?.skipRefresh) {
    const refreshToken = apiClient.getRefreshToken();
    if (refreshToken) {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (response.ok) {
          const data = await response.json();
          apiClient.setTokens(data.accessToken, data.refreshToken);
          // Don't automatically retry - let caller handle
          throw error;
        }
      } catch {
        apiClient.clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
  }
  throw error;
});

// Cleanup on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    apiClient.cancelAllRequests();
  });
}

export default apiClient;
