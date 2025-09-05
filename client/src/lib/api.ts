import { apiRequest } from "@/lib/queryClient";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  firstName: string;
  lastName: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

// Auth API
export const authApi = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    return response.json();
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },

  me: async (): Promise<AuthResponse["user"]> => {
    const response = await apiRequest("GET", "/api/auth/me");
    return response.json();
  },
};

// Dashboard API
export const dashboardApi = {
  getMetrics: async () => {
    const response = await apiRequest("GET", "/api/dashboard/metrics");
    return response.json();
  },
};

// Tickets API
export const ticketsApi = {
  getTickets: async (filters: any = {}) => {
    const params = new URLSearchParams(filters).toString();
    const response = await apiRequest("GET", `/api/tickets?${params}`);
    return response.json();
  },

  getTicket: async (id: string) => {
    const response = await apiRequest("GET", `/api/tickets/${id}`);
    return response.json();
  },

  createTicket: async (ticketData: any) => {
    const response = await apiRequest("POST", "/api/tickets", ticketData);
    return response.json();
  },

  updateTicket: async (id: string, updates: any) => {
    const response = await apiRequest("PATCH", `/api/tickets/${id}`, updates);
    return response.json();
  },

  getMessages: async (ticketId: string) => {
    const response = await apiRequest("GET", `/api/tickets/${ticketId}/messages`);
    return response.json();
  },

  sendMessage: async (ticketId: string, messageData: any) => {
    const response = await apiRequest("POST", `/api/tickets/${ticketId}/messages`, messageData);
    return response.json();
  },
};

// Customers API
export const customersApi = {
  getCustomers: async (params: any = {}) => {
    const searchParams = new URLSearchParams(params).toString();
    const response = await apiRequest("GET", `/api/customers?${searchParams}`);
    return response.json();
  },

  createCustomer: async (customerData: any) => {
    const response = await apiRequest("POST", "/api/customers", customerData);
    return response.json();
  },
};

// File upload API
export const uploadApi = {
  uploadFile: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    if (!response.ok) {
      throw new Error("Upload failed");
    }
    
    return response.json();
  },
};
