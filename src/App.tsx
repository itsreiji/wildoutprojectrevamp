/* @refresh reset */
import { useEffect, useState } from "react";
import { AdminGuard } from "./components/admin/AdminGuard";
import { LandingPage } from "./components/LandingPage";
import AllEventsPage from "./components/AllEventsPage";
import AdminDashboard from "./components/admin/AdminDashboard";
import { LoginPage } from "./components/auth/LoginPage";
import { Router, RouterProvider } from "./components/router";
import { useAuth } from "./contexts/AuthContext";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import supabaseClient from "./supabase/client";

// Admin dashboard component wrapped with guard
const AdminDashboardWrapper = () => (
  <AdminGuard>
    <AdminDashboard />
  </AdminGuard>
);

// Define routes for the router
const routes = {
  "/": LandingPage,
  "/events": AllEventsPage,
  "/login": LoginPage,
  "/auth/callback": AuthCallbackPage,
  "/admin/*": AdminDashboardWrapper,
};

const App = () => {
  const auth = useAuth();
  const { user, role, loading, error } = auth || {};
  const [_isDevelopment, _setIsDevelopment] = useState(false);

  useEffect(() => {
    const checkEnv = async () => {
      const {
        data: { session },
      } = await supabaseClient.auth.getSession();
      if (session) {
        // Session exists
      }
    };
    checkEnv();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black">Loading...</div>;
  }

  return (
    <RouterProvider>
      <Router routes={routes} />
    </RouterProvider>
  );
};

export default App;
