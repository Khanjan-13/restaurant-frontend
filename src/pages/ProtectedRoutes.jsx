import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoutes = ({ children }) => {
  const token = localStorage.getItem("token");

  // If no token is found in localStorage, redirect to the login page
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Optionally, you can check for token expiration here if needed

  return children; // Render the protected page if the user is logged in
};

export default ProtectedRoutes;

