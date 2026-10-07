import { Appointment, Customer, User } from "../types";

export class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = "http://localhost:3000") {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/$/, "");
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data as T;
  }

  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const result = await this.request<{ success: boolean; token: string; user: User }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }
    );
    this.setToken(result.token);
    return result;
  }

  async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>("/api/auth/me");
  }

  async getTodayAppointments(): Promise<Appointment[]> {
    const today = new Date().toISOString().split("T")[0];
    return this.request<Appointment[]>(`/api/appointments?date=${today}`);
  }

  async getAppointment(id: string): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${id}`);
  }

  async updateAppointmentStatus(
    id: string,
    status: string,
    notes?: string
  ): Promise<Appointment> {
    return this.request<Appointment>(`/api/appointments/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status, notes }),
    });
  }

  async getCustomer(id: string): Promise<Customer & { appointments: Appointment[] }> {
    return this.request<Customer & { appointments: Appointment[] }>(`/api/customers/${id}`);
  }
}

export const api = new ApiClient();
