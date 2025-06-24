import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  // Not logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Not authorized for this route
  if (
    role === "admin" &&
    !["admin", "super-admin", "group-admin", "block-admin"].includes(userRole)
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (role === "user" && userRole !== "user") {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
