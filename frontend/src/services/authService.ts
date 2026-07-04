import { api } from "./api";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  User,
} from "@/types/auth";

export const authService = {
  async login(payload: LoginRequest) {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  },

  async register(payload: RegisterRequest) {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);
    return data;
  },

  async forgotPassword(payload: ForgotPasswordRequest) {
    const { data } = await api.post<{ message: string }>("/auth/forgot-password", payload);
    return data;
  },

  async resetPassword(payload: ResetPasswordRequest) {
    const { data } = await api.post<{ message: string }>("/auth/reset-password", payload);
    return data;
  },

  async getProfile() {
    const { data } = await api.get<User>("/auth/profile");
    return data;
  },

  async logout() {
    const { data } = await api.post<{ message: string }>("/auth/logout");
    return data;
  },
};
