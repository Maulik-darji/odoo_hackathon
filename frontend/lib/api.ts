const getApiBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8000/api/v1`;
  }
  return "http://localhost:8000/api/v1";
};

const API_BASE_URL = getApiBaseUrl();

export interface UserResponse {
  id: number;
  email: string;
  name: string | null;
  role: string;
  tour_completed: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  
  const headers = new Headers(options.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized by attempting to refresh the token
  if (response.status === 401) {
    const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    
    if (refreshToken && endpoint !== "/auth/login") {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (refreshRes.ok) {
            const data = await refreshRes.json();
            localStorage.setItem("access_token", data.access_token);
            if (data.refresh_token) {
              localStorage.setItem("refresh_token", data.refresh_token);
            }
            onRefreshed(data.access_token);
            
            // Retry the original request
            headers.set("Authorization", `Bearer ${data.access_token}`);
            response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
          } else {
            // Refresh failed, logout
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            window.location.href = "/login";
          }
        } catch (error) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        } finally {
          isRefreshing = false;
        }
      } else {
        // Wait for the token to be refreshed
        return new Promise<T>((resolve) => {
          subscribeTokenRefresh((newToken) => {
            headers.set("Authorization", `Bearer ${newToken}`);
            fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
              .then((res) => res.json())
              .then(resolve);
          });
        });
      }
    } else if (endpoint !== "/auth/login") {
      // No refresh token available, redirect to login
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    let errorMessage = "An error occurred";
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorMessage;
    } catch {
      // Ignore parsing errors
    }
    throw new ApiError(errorMessage, response.status);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Auth
  register: async (name: string, email: string, password: string, role: string = "Fleet Manager"): Promise<UserResponse> => {
    return request<UserResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  login: async (email: string, password: string): Promise<TokenResponse> => {
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    return request<TokenResponse>("/auth/login", {
      method: "POST",
      body: formData,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  },

  getMe: async (): Promise<UserResponse> => {
    return request<UserResponse>("/auth/me");
  },

  completeTour: async (): Promise<UserResponse> => {
    return request<UserResponse>("/auth/tour", { method: "PUT" });
  },

  getDashboardStats: async (): Promise<any> => {
    return request<any>("/analytics/dashboard");
  },

  // Vehicles
  getVehicles: async (): Promise<any[]> => request<any[]>("/vehicles/"),
  createVehicle: async (data: any): Promise<any> => request<any>("/vehicles/", { method: "POST", body: JSON.stringify(data) }),
  updateVehicle: async (id: number, data: any): Promise<any> => request<any>(`/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteVehicle: async (id: number): Promise<any> => request<any>(`/vehicles/${id}`, { method: "DELETE" }),

  // Drivers
  getDrivers: async (): Promise<any[]> => request<any[]>("/drivers/"),
  createDriver: async (data: any): Promise<any> => request<any>("/drivers/", { method: "POST", body: JSON.stringify(data) }),
  updateDriver: async (id: number, data: any): Promise<any> => request<any>(`/drivers/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteDriver: async (id: number): Promise<any> => request<any>(`/drivers/${id}`, { method: "DELETE" }),

  // Trips
  getTrips: async (): Promise<any[]> => request<any[]>("/trips/"),
  createTrip: async (data: any): Promise<any> => request<any>("/trips/", { method: "POST", body: JSON.stringify(data) }),
  updateTrip: async (id: number, data: any): Promise<any> => request<any>(`/trips/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteTrip: async (id: number): Promise<any> => request<any>(`/trips/${id}`, { method: "DELETE" }),

  // Maintenance
  getMaintenanceLogs: async (): Promise<any[]> => request<any[]>("/maintenance/"),
  createMaintenance: async (data: any): Promise<any> => request<any>("/maintenance/", { method: "POST", body: JSON.stringify(data) }),
  updateMaintenance: async (id: number, data: any): Promise<any> => request<any>(`/maintenance/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteMaintenance: async (id: number): Promise<any> => request<any>(`/maintenance/${id}`, { method: "DELETE" }),

  // Expenses
  getExpenses: async (): Promise<any[]> => request<any[]>("/expenses/"),
  createExpense: async (data: any): Promise<any> => request<any>("/expenses/", { method: "POST", body: JSON.stringify(data) }),
  updateExpense: async (id: number, data: any): Promise<any> => request<any>(`/expenses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteExpense: async (id: number): Promise<any> => request<any>(`/expenses/${id}`, { method: "DELETE" }),
};
