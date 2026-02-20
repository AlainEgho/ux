import { environment } from '../../environments/environment';

const AUTH_API_BASE = environment.apiBaseUrl;

export const AUTH_API = {
  baseUrl: AUTH_API_BASE,
  signup: `${AUTH_API_BASE}/api/auth/signup`,
  login: `${AUTH_API_BASE}/api/auth/login`,
  verifyEmail: (token: string) =>
    `${AUTH_API_BASE}/api/auth/verify-email?token=${encodeURIComponent(token)}`,
} as const;

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles: string[];
}

export interface AuthData {
  accessToken: string;
  tokenType: string;
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  roles: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address?: string;
  phoneNumber?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
