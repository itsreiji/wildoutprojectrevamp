// AdminGuard component for protecting admin routes
import { useAuth } from "@/contexts/AuthContext";
import { type ReactNode } from "react";
import { useRouter } from "@/components/router";

export const AdminGuard = ({ children }: { children?: ReactNode }) => {
  const { role, isLoading, user } = useAuth();
  const { navigate } = useRouter();

  if (isLoading) {
    return <div className="min-h-screen bg-black">Loading...</div>;
  }

  if (!user) {
    navigate("/login");
    return <div className="min-h-screen bg-black">Redirecting...</div>;
  }

  // Check if user has admin role using the role from AuthContext
  const isAdmin = role === "admin";

  if (!isAdmin) {
    navigate("/");
    return <div className="min-h-screen bg-black">Redirecting...</div>;
  }

  // Render children if provided, otherwise return null
  // The router will handle rendering the appropriate component
  return children ? <>{children}</> : null;
};
