import { ProjectData } from "../types";

const API_BASE = '/api';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export const api = {
  getToken: () => localStorage.getItem('hikaya_token'),
  setToken: (token: string) => localStorage.setItem('hikaya_token', token),
  clearToken: () => localStorage.removeItem('hikaya_token'),
  
  async request(path: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong');
    }

    return data;
  },

  async login(credentials: any): Promise<AuthResponse> {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(data.token);
    return data;
  },

  async signup(details: any): Promise<AuthResponse> {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    this.setToken(data.token);
    return data;
  },

  async getProjects() {
    return this.request('/projects');
  },

  async saveProject(name: string, data: ProjectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, data }),
    });
  },

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, {
      method: 'DELETE',
    });
  }
};
