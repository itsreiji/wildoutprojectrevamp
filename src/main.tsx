import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ContentProvider } from "./contexts/ContentContext";
import { EventsProvider } from "./contexts/EventsContext";
import { PartnersProvider } from "./contexts/PartnersContext";
import { StaticContentProvider } from "./contexts/StaticContentContext";
import { EnhancedStaticContentProvider } from "./contexts/EnhancedStaticContentContext";
import { TeamProvider } from "./contexts/TeamContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="dark" enableSystem={true} attribute="class">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ContentProvider>
            <StaticContentProvider>
              <EnhancedStaticContentProvider>
                <EventsProvider>
                  <PartnersProvider>
                    <TeamProvider>
                      <App />
                    </TeamProvider>
                  </PartnersProvider>
                </EventsProvider>
              </EnhancedStaticContentProvider>
            </StaticContentProvider>
          </ContentProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </React.StrictMode>
);
