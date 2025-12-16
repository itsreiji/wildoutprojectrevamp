import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./contexts/AuthContext";
import { ContentProvider } from "./contexts/ContentContext";
import { EventsProvider } from "./contexts/EventsContext";
import { PartnersProvider } from "./contexts/PartnersContext";
import { StaticContentProvider } from "./contexts/StaticContentContext";
import { TeamProvider } from "./contexts/TeamContext";
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ContentProvider>
          <StaticContentProvider>
            <EventsProvider>
              <PartnersProvider>
                <TeamProvider>
                  <App />
                </TeamProvider>
              </PartnersProvider>
            </EventsProvider>
          </StaticContentProvider>
        </ContentProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
