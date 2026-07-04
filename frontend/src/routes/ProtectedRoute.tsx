import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader } from "@/components/common/Loader";
import { useAuth } from "@/context/AuthContext";

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isBootstrapping } = useAuth();

  if (isBootstrapping) {
    return <Loader label="Checking your session" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
