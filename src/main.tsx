
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Error boundary to catch rendering errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "20px", color: "red", backgroundColor: "#0a0a0a", minHeight: "100vh" }}>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: "pre-wrap", marginTop: "10px" }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.error?.stack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

console.log("Bootstrapping React app");

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

try {
  createRoot(rootElement).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log("React app rendered successfully");
} catch (error) {
  console.error("Failed to render React app:", error);
  rootElement.innerHTML = `
    <div style="padding: 20px; color: red; background: #0a0a0a; min-height: 100vh;">
      <h2>Failed to initialize app</h2>
      <pre>${error instanceof Error ? error.stack : String(error)}</pre>
    </div>
  `;
}
