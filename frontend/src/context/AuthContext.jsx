import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { authService } from "@/services/authService";
import {
  clearAuthStorage,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser,
} from "@/utils/storage";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => getStoredToken());
  const [user, setUser] = useState(() => getStoredUser());
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

  const login = useCallback(async (payload) => {
    const response = await authService.login(payload);
    setStoredToken(response.token);
    setStoredUser(response.user);
    setToken(response.token);
    setUser(response.user);
  }, []);

  const register = useCallback(async (payload) => {
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

  const value = useMemo(
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
