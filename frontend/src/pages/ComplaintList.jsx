import { useEffect, useState } from "react";
import axios from "../api/axios";
import PriorityQueue from "../utils/PriorityQueue";

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
const [selectedRegion, setSelectedRegion] = useState("");


  const fetchComplaints = async () => {
  try {
    const token = localStorage.getItem("token");
    const query = [];

    if (selectedDept) query.push(`department=${selectedDept}`);
    if (selectedRegion) query.push(`region=${selectedRegion}`);

    const queryString = query.length > 0 ? `?${query.join("&")}` : "";

    const res = await axios.get(`/complaints/all${queryString}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const pq = new PriorityQueue();
    res.data.complaints.forEach((c) => pq.enqueue(c));
    const sorted = pq.getAll();
    setComplaints(sorted);
  } catch (err) {
    console.error(err);
    alert("Failed to load complaints");
  }
};



 useEffect(() => {
  fetchComplaints();
}, [selectedDept, selectedRegion]);

  const updateStatus = async (id, newStatus) => {
  try {
    const token = localStorage.getItem("token");
    await axios.put(`/complaints/update/${id}`, { status: newStatus }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchComplaints(); // refresh list
  } catch (err) {
    console.error(err);
    alert("Could not update status");
  }
};


  const sendReply = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/complaints/${id}/reply`, { message: replyMessage }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Reply sent successfully!");
      setReplyMessage("");
      setActiveReplyId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to send reply");
    }
  };

  
  return (
    <div className="max-w-6xl mx-auto mt-8 p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Admin Complaint Dashboard</h1>
      <div className="flex gap-4 mb-6">
  <select
    value={selectedDept}
    onChange={(e) => setSelectedDept(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Departments</option>
    <option value="Water">Water</option>
    <option value="Electricity">Electricity</option>
    <option value="Road">Road</option>
    <option value="Sanitation">Sanitation</option>
    {/* Add more as needed */}
  </select>

  <select
    value={selectedRegion}
    onChange={(e) => setSelectedRegion(e.target.value)}
    className="border p-2 rounded"
  >
    <option value="">All Regions</option>
    <option value="North">North</option>
    <option value="South">South</option>
    <option value="East">East</option>
    <option value="West">West</option>
    {/* Add more regions */}
  </select>
</div>

      {complaints.length === 0 ? (
        <p>No complaints available.</p>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c._id} className="border p-4 rounded shadow-md bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold">{c.title}</h2>
                  <p className="text-gray-600">{c.description}</p>
                  <p className="text-sm text-gray-500">Department: {c.department} | Region: {c.region}</p>
                  <p className="text-sm text-gray-500">Priority: {c.priority}</p>
                  <p className="text-sm text-gray-500">Status: <span className="font-medium">{c.status}</span></p>
                  {c.user && <p className="text-sm text-gray-500">From: {c.user.name} ({c.user.email})</p>}
                  <div className="mt-2">
                    {activeReplyId === c._id ? (
                      <div className="mt-2">
                        <textarea
                          className="w-full border rounded p-2 mb-2"
                          rows="3"
                          placeholder="Enter your reply"
                          value={replyMessage}
                          onChange={(e) => setReplyMessage(e.target.value)}
                        />
                        <button
                          onClick={() => sendReply(c._id)}
                          className="bg-green-600 text-white px-4 py-1 rounded mr-2"
                        >
                          Send Reply
                        </button>
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="text-sm text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveReplyId(c._id)}
                        className="text-blue-600 text-sm underline mt-2"
                      >
                        Reply via Email
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Controls */}
                <div className="space-y-2">
  {["Pending", "In Progress", "Resolved"].map((s) => (
    <button
      key={s}
      onClick={() => updateStatus(c._id, s)}
      className={`px-3 py-1 rounded text-sm${
        c.status === s ? "bg-gray-300" : "bg-blue-600 text-white hover:bg-blue-700"
      }`}
      disabled={c.status === s}
    >
      Mark {s}
    </button>
  ))}
  
  
</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
