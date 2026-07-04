export interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER" | string;
  avatar?: string | null;
  bio?: string | null;
  createdAt?: string | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}
