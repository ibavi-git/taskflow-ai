import axios from "axios";
import { clearAuthStorage, getStoredToken } from "@/utils/storage";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401 || status === 403) {
      clearAuthStorage();
      window.dispatchEvent(new Event("taskflow:unauthorized"));
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as { error?: string; message?: string } | undefined;
    return body?.error || body?.message || error.message;
  }

  return "Something went wrong. Please try again.";
}
