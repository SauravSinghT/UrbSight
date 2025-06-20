import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    // Not logged in
    return <Navigate to="/" />;
  }

  if (role && role !== userRole) {
    // Role mismatch
    return <Navigate to="/" />;
  }

  return children;
}
