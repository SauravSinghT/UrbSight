import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import socket from "../socket";
import axios from "../api/axios";
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#f87171", "#60a5fa", "#facc15"];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/complaints/stats", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const {
          statusStats = [],
          departmentStats = [],
          regionStats = []
        } = res.data || {};

        const statusCounts = Object.fromEntries(statusStats.map(s => [s._id, s.count]));
        const departmentCounts = Object.fromEntries(departmentStats.map(d => [d._id, d.count]));
        const regionCounts = Object.fromEntries(regionStats.map(r => [r._id, r.count]));

        setStats({ statusCounts, departmentCounts, regionCounts });

      } catch (err) {
        console.error("Stats fetch error:", err);
        alert("Failed to fetch analytics");
      }
    };

    fetchStats();

    socket.on("newComplaint", (data) => {
      alert(`📢 New complaint submitted: ${data.title} (${data.priority})`);
    });

    return () => socket.off("newComplaint");
  }, []);

  if (!stats) return <p className="text-center mt-10">Loading analytics...</p>;

  const pieData = [
    { name: "Open", value: stats?.statusCounts?.Open || 0 },
    { name: "In Progress", value: stats?.statusCounts?.["In Progress"] || 0 },
    { name: "Resolved", value: stats?.statusCounts?.Resolved || 0 },
  ];

  const departmentData = Object.entries(stats?.departmentCounts || {}).map(
    ([key, val]) => ({ name: key, count: val })
  );

  const regionData = Object.entries(stats?.regionCounts || {}).map(
    ([key, val]) => ({ name: key, count: val })
  );

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      {/* ✅ Navbar */}
      <nav className="flex justify-center gap-6 mb-6">
        <Link to="/admin" className="hover:underline">Dashboard</Link>
        <Link to="/admin/complaints" className="text-blue-600 font-medium hover:underline">
          Complaints Registered
        </Link>
      </nav>

      <h1 className="text-3xl font-bold mb-6 text-center">Admin Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Complaint Status Pie */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-semibold mb-4 text-center">Complaints by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                dataKey="value"
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {pieData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Complaints by Department Bar */}
        <div className="bg-white shadow p-4 rounded">
          <h2 className="text-lg font-semibold mb-4 text-center">Complaints by Department</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={departmentData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complaints by Region Bar */}
      <div className="bg-white shadow p-4 rounded mt-8">
        <h2 className="text-lg font-semibold mb-4 text-center">Complaints by Region</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={regionData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#34d399" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
