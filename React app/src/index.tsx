import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import { SocketProvider } from "./socketContext";
import Router from "./components/routes";
import "./styles.css";

interface AuthStatus {
  authenticated: boolean;
}

function Index() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/auth-status", {
          method: "GET",
          credentials: "include",
        });
        console.log("Response Status:", response.status);     
        const data: AuthStatus = await response.json();
        console.log("Auth Status Data:", data);
        setAuthenticated(data.authenticated);
      } catch (error) {
        console.error("Error checking auth status:", error);
      } finally {
        setLoading(false);
      }
    };
    checkAuthStatus();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <SocketProvider>
        <Router authenticated={authenticated} loading={loading} />
      </SocketProvider>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement as HTMLElement);
  root.render(
    <React.StrictMode>
      <Index />
    </React.StrictMode>
  );
}

