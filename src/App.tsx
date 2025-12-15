/* @refresh reset */
import { useEffect, useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { RouterProvider } from "./components/router";
import { useAuth } from "./contexts/AuthContext";
import { supabaseClient } from "./supabase/client";

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
      <LandingPage />
    </RouterProvider>
  );
};

export default App;
