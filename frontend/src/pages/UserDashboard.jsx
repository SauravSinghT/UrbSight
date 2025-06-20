import { useEffect, useState } from "react";
import axios from "../api/axios";

export default function UserDashboard() {
  const [complaints, setComplaints] = useState([]);

  const fetchMyComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/complaints/my", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setComplaints(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load your complaints.");
    }
  };
  const handleDelete = async (id) => {
  if (!window.confirm("Are you sure you want to delete this complaint?")) return;

  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/complaints/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Complaint deleted successfully");
    setComplaints((prev) => prev.filter((c) => c._id !== id));
  } catch (err) {
    console.error(err);
    alert("Failed to delete complaint");
  }
};

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  return (
    <div className="max-w-4xl mx-auto mt-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Complaints</h1>
      {complaints.length === 0 ? (
        <p className="text-center text-gray-500">No complaints submitted yet.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="bg-white border p-4 rounded shadow">
              <h2 className="text-xl font-semibold">{c.title}</h2>
              <p className="text-gray-600">{c.description}</p>
              <p className="text-sm text-gray-500">Department: {c.department} | Region: {c.region}</p>
              <p className="text-sm text-gray-500">Priority: {c.priority}</p>
              <p className="text-sm text-blue-600">Status: <strong>{c.status}</strong></p>
              {c.createdAt && (
                <p className="text-xs text-gray-400">Submitted: {new Date(c.createdAt).toLocaleString()}</p>
              )}
              <div className="flex justify-end mt-2">
  <button
    onClick={() => handleDelete(c._id)}
    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
  >
    Delete
  </button>
</div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
