import React, { useState, useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import ReactDOM from "react-dom/client";
import Router from "./components/routes.jsx";
import "./styles.css";

function Index() {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch("/auth-status", {
          method: "GET",
          credentials: "include",
        });
        console.log("Response Status:", response.status);     
        const data = await response.json();
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
      <Router authenticated={authenticated} loading={loading} />
    </BrowserRouter>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Index />
  </React.StrictMode>
);
