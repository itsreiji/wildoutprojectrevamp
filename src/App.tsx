/* @refresh reset */
import { useEffect, lazy } from "react";
import { AdminGuard } from "./components/admin/AdminGuard";
import { Router, RouterProvider } from "./components/router";
import { useAuth } from "./contexts/AuthContext";
import supabaseClient from "./supabase/client";
import { Toaster } from "sonner";

// Lazy load components
const LandingPage = lazy(() => import("./components/LandingPage").then(m => ({ default: m.LandingPage })));
const AllEventsPage = lazy(() => import("./components/AllEventsPage"));
const AdminDashboard = lazy(() => import("./components/admin/AdminDashboard"));
const LoginPage = lazy(() => import("./components/auth/LoginPage").then(m => ({ default: m.LoginPage })));
const AuthCallbackPage = lazy(() => import("./pages/AuthCallbackPage").then(m => ({ default: m.AuthCallbackPage })));

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
  const { loading } = auth || {};

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
      <Toaster position="top-right" richColors />
      <Router routes={routes} />
    </RouterProvider>
  );
};

export default App;
