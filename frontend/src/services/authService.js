import { api } from "./api";

export const authService = {
  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async register(payload) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async forgotPassword(payload) {
    const { data } = await api.post("/auth/forgot-password", payload);
    return data;
  },

  async resetPassword(payload) {
    const { data } = await api.post("/auth/reset-password", payload);
    return data;
  },

  async getProfile() {
    const { data } = await api.get("/auth/profile");
    return data;
  },

  async logout() {
    const { data } = await api.post("/auth/logout");
    return data;
  },
};
