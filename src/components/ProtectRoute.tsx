import React, { type ReactElement } from "react";
import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token"); // your token key

  if (!token) {
    return <Navigate to="/login" replace />; // redirect to login
  }

  return children; // token exists, render the component
};

export default ProtectedRoute;
