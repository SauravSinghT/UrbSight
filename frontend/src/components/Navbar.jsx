import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
  <nav className="bg-blue-800 text-white px-6 py-3 flex justify-between items-center shadow-md">
    {/* Website Name */}
    <div className="text-2xl font-bold tracking-wide">
      <Link to="/" className="hover:underline">Urbsight</Link>
    </div>

    {/* Navigation Links */}
    <div className="space-x-6 text-lg flex items-center">
      {token && (
        <Link
          to={role === "admin" ? "/admin" : "/user"}
          className={location.pathname.includes(role) ? "underline font-semibold" : ""}
        >
          Dashboard
        </Link>
      )}

      {token && role === "admin" && (
        <Link
          to="/admin/complaints"
          className={location.pathname === "/admin/complaints" ? "underline font-semibold" : ""}
        >
          Complaints Registered
        </Link>
      )}

      {token && (
        <Link to="/submit" className={location.pathname === "/submit" ? "underline font-semibold" : ""}>
          File Complaint
        </Link>
      )}

      {!token && <Link to="/login">Login</Link>}

      {token && (
        <button
          onClick={handleLogout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700 transition"
        >
          Logout
        </button>
      )}
    </div>
  </nav>
);

}
