// AdminGuard component for protecting admin routes
import { useAuth } from "@/contexts/AuthContext";
import { type ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AdminGuard = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black">Loading...</div>;
  }

  if (!session) {
    return <Navigate replace to="/login" />;
  }

  // Check if user has admin role
  const isAdmin = session.user?.user_metadata?.role?.includes("admin");

  if (!isAdmin) {
    return <Navigate replace to="/" />;
  }

  return children ? <>{children}</> : <Outlet />;
};
