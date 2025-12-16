/* @refresh reset */
import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { Router, RouterProvider } from "./components/router";
import { useAuth } from "./contexts/AuthContext";
import { AuthCallbackPage } from "./pages/AuthCallbackPage";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { AdminGuard } from "./admin/AdminGuard";
import supabaseClient from "./supabase/client";

// Define routes for the router
const routes = {
  '/': LandingPage,
  '/login': LoginPage,
  '/auth/callback': AuthCallbackPage,
  '/admin/*': AdminGuard,
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
