/* @refresh reset */
import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AdminGuard } from "./admin/AdminGuard";
import { LandingPage } from "./components/LandingPage";
import { LoginPage } from "./components/auth/LoginPage";
import { RegisterPage } from "./components/auth/RegisterPage";
import { DashboardAbout } from "./components/dashboard/DashboardAbout";
import { DashboardAuditLog } from "./components/dashboard/DashboardAuditLog";
import { DashboardEvents } from "./components/dashboard/DashboardEvents";
import { DashboardGallery } from "./components/dashboard/DashboardGallery";
import { DashboardHero } from "./components/dashboard/DashboardHero";
import { DashboardHome } from "./components/dashboard/DashboardHome";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import { DashboardPartners } from "./components/dashboard/DashboardPartners";
import { DashboardSettings } from "./components/dashboard/DashboardSettings";
import { DashboardTeam } from "./components/dashboard/DashboardTeam";
import { useAuth } from "./contexts/AuthContext";
import AuthCallbackPage from "./pages/AuthCallbackPage";
import { supabaseClient } from "./supabase/client";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/auth/callback",
    element: <AuthCallbackPage />,
  },
  {
    path: "/admin",
    element: <AdminGuard />,
    children: [
      {
        path: "",
        element: <DashboardLayout>children</DashboardLayout>,
        children: [
          { path: "home", element: <DashboardHome /> },
          { path: "events", element: <DashboardEvents /> },
          { path: "events/new", element: <DashboardEvents /> },
          { path: "events/:id/edit", element: <DashboardEvents /> },
          { path: "partners", element: <DashboardPartners /> },
          { path: "partners/new", element: <DashboardPartners /> },
          { path: "partners/:id/edit", element: <DashboardPartners /> },
          { path: "team", element: <DashboardTeam /> },
          { path: "team/new", element: <DashboardTeam /> },
          { path: "team/:id/edit", element: <DashboardTeam /> },
          { path: "gallery", element: <DashboardGallery /> },
          { path: "gallery/new", element: <DashboardGallery /> },
          { path: "gallery/:id/edit", element: <DashboardGallery /> },
          { path: "hero", element: <DashboardHero /> },
          { path: "about", element: <DashboardAbout /> },
          { path: "settings", element: <DashboardSettings /> },
          { path: "audit-log", element: <DashboardAuditLog /> },
        ],
      },
    ],
  },
]);

const App = () => {
  const { session, isLoading } = useAuth();
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

  if (isLoading) {
    return <div className="min-h-screen bg-black">Loading...</div>;
  }

  return <RouterProvider router={router} />;
};

export default App;
