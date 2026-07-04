import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/authService";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/utils/storage";
import type { LoginRequest, RegisterRequest, User } from "@/types/auth";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => getStoredUser());
  const [isBootstrapping, setIsBootstrapping] = useState(Boolean(getStoredToken()));

  const clearSession = useCallback(() => {
    clearAuthStorage();
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    async function bootstrapProfile() {
      if (!token) {
        setIsBootstrapping(false);
        return;
      }

      try {
        const profile = await authService.getProfile();
        if (!active) return;
        setUser(profile);
        setStoredUser(profile);
      } catch {
        if (active) clearSession();
      } finally {
        if (active) setIsBootstrapping(false);
      }
    }

    bootstrapProfile();

    return () => {
      active = false;
    };
  }, [clearSession, token]);

  useEffect(() => {
    const handleUnauthorized = () => clearSession();
    window.addEventListener("taskflow:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("taskflow:unauthorized", handleUnauthorized);
  }, [clearSession]);

  const login = useCallback(async (payload: LoginRequest) => {
    const response = await authService.login(payload);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    const response = await authService.register(payload);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getStoredToken()) {
        await authService.logout();
      }
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isBootstrapping,
      login,
      register,
      logout,
    }),
    [isBootstrapping, login, logout, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
