import React, { useState, useEffect } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
 useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role) {
      navigate(role === "admin" ? "/admin" : "/user");
    }
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("name", res.data.user.name);
      alert("Login successful");

      if (res.data.user.role === "admin") navigate("/admin");
      else navigate("/user");
    } catch (err) {
      alert(err.response?.data?.msg || "Login failed.");
    }
  };

  return (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-md space-y-4">
      <h2 className="text-xl font-bold text-center">Login</h2>
      <input className="input" name="email" placeholder="Email" type="email" onChange={handleChange} required />
      <input className="input" name="password" placeholder="Password" type="password" onChange={handleChange} required />
      <button className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">Login</button>

      {/* New Register Link */}
      <p className="text-center text-sm mt-4">
        Not registered?{" "}
        <span
          onClick={() => navigate("/register")}
          className="text-blue-600 hover:underline cursor-pointer"
        >
          Register here
        </span>
      </p>
    </form>
  </div>
);

}
