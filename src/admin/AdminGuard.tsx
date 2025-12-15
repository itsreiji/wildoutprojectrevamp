// AdminGuard component for protecting admin routes
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";
import { Navigate, Outlet } from "react-router-dom";

export const AdminGuard = ({ children }: { children?: ReactNode }) => {
  const { session, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen bg-black">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has admin role
  const isAdmin = session.user?.user_metadata?.role?.includes("admin");

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
