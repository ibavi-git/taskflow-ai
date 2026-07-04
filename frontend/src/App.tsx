import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { GlobalLayout } from "@/layouts/GlobalLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute";

import Landing from "@/pages/auth/Landing";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";
import Dashboard from "@/pages/dashboard/Dashboard";
import CalendarPage from "@/pages/calendar/Calendar";
import NotificationsPage from "@/pages/common/Notifications";
import Projects from "@/pages/workspace/Projects";
import Reports from "@/pages/dashboard/Reports";
import Profile from "@/pages/common/Profile";
import Search from "@/pages/workspace/Search";
import Settings from "@/pages/common/Settings";
import NotFound from "@/pages/common/not-found";

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<GlobalLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/calendar" element={<CalendarPage />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/search" element={<Search />} />
              </Route>
            </Route>

            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
