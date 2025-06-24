import { useEffect, useState } from "react";
import axios from "../api/axios";
import PriorityQueue from "../utils/PriorityQueue";

const districtBlockMap = {
  Almora: ["Bhaisiya Chhana", "Bhikiyasain", "Chaukhutiya", "Dhauladevi", "Dwarahat", "Hawalbag", "Lamgarha", "Sult", "Syaldey", "Takula", "Tarikhet"],
  Bageshwar: ["Bageshwar", "Garur", "Kapkot", "Forest CD Block Bageshwar"],
  Chamoli: ["Dasholi", "Dewal", "Gairsain", "Ghat", "Joshimath", "Karnaprayag", "Narayan Bagar", "Pokhari", "Tharali"],
  Champawat: ["Champawat", "Pati", "Lohaghat", "Barakot"],
  Dehradun: ["Chakrata", "Kalsi", "Vikasnagar", "Sahaspur", "Raipur", "Doiwala"],
  Haridwar: ["Bhagwanpur", "Roorkee", "Narsan", "Bahadrabad", "Laksar", "Khanpur"],
  Nainital: ["Haldwani", "Bhimtal", "Ramnagar", "Kotabag", "Dhari", "Betalghat", "Ramgarh", "Okhalkanda"],
  Pauri: ["Kot", "Kaljikhal", "Pauri", "Pabo", "Thalisain", "Bironkhal", "Dwarikhal", "Dugadda", "Jaihrikhal", "Ekeshwer", "Rikhnikhal", "Yamkeshwar", "Pokhra", "Khirsu", "Nainidanda"],
  Pithoragarh: ["Munsyari", "Dharchula", "Didihat", "Kanalichina", "Gangolihat", "Berinag", "Bin", "Munakote"],
  Rudraprayag: ["Augustmuni", "Jakholi", "Ukhimath"],
  Tehri: ["Bhilangana", "Chamba", "Deoprayag", "Jakhanidhar", "Jaunpur", "Kirtinagar", "Narendranagar", "Pratapnagar", "Thauldhar"],
  "Udham Singh Nagar": ["Khatima", "Sitarganj", "Rudrapur", "Gadarpur", "Bazpur", "Kashipur", "Jaspur"],
  Uttarkashi: ["Bhatwari", "Chiniyalisaur", "Dunda", "Mori", "Naugaon", "Puraula"]
};

export default function ComplaintList() {
  const [complaints, setComplaints] = useState([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [activeReplyId, setActiveReplyId] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBlock, setSelectedBlock] = useState("");
  const [showRejectPopup, setShowRejectPopup] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [complaintToReject, setComplaintToReject] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [blocksForUser, setBlocksForUser] = useState([]);
  const [isUserLoaded, setIsUserLoaded] = useState(false);

  const fetchComplaints = async () => {
    try {
      const token = localStorage.getItem("token");
      const query = [];
      if (selectedDept) query.push(`department=${selectedDept}`);
      if (selectedPriority) query.push(`priority=${selectedPriority}`);
      if (searchQuery.trim()) query.push(`search=${searchQuery.trim()}`);
      if (selectedBlock) query.push(`block=${selectedBlock}`);
      const queryString = query.length > 0 ? `?${query.join("&")}` : "";

      const res = await axios.get(`/complaints/all${queryString}`, {
  headers: { Authorization: `Bearer ${token}` }
});


      const pq = new PriorityQueue();
      res.data.complaints.forEach((c) => pq.enqueue(c));
      setComplaints(pq.getAll());
    } catch (err) {
      console.error(err);
      alert("Failed to load complaints");
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        const user = res.data;
        setUserRole(user.role);

        if (user.role === "group-admin" && user.district) {
          setBlocksForUser(districtBlockMap[user.district] || []);
        } else if (user.role === "block-admin" && user.block) {
          setBlocksForUser([user.block]);
          setSelectedBlock(user.block);
        } else {
          setBlocksForUser(Object.values(districtBlockMap).flat().sort());
        }

        setIsUserLoaded(true);
        setTimeout(fetchComplaints, 0); // trigger initial fetch
      } catch (err) {
        console.error(err);
        alert("Failed to load user info");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (isUserLoaded) fetchComplaints();
  }, [selectedDept, selectedPriority, selectedBlock, isUserLoaded]);

  const updateStatus = async (id, newStatus, reason = "") => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`/complaints/update/${id}`, { status: newStatus, reason }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchComplaints();
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
      <div className="flex gap-4 mb-6 flex-wrap">
        <select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} className="border p-2 rounded">
          <option value="">All Departments</option>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Road">Road</option>
          <option value="Sanitation">Sanitation</option>
        </select>
        <select value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)} className="border p-2 rounded">
          <option value="">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
        <select
          value={selectedBlock}
          onChange={(e) => setSelectedBlock(e.target.value)}
          className="border p-2 rounded"
          disabled={userRole === "block-admin"}
        >
          <option value="">All Blocks</option>
          {blocksForUser.map((block) => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Search by Complaint ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 rounded w-64"
        />
        <button onClick={fetchComplaints} className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
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
                  <p className="text-sm text-red-500">Complaint ID: <span className="font-mono">{c.complaintId}</span></p>
                  <p className="text-gray-600">{c.description}</p>
                  <p className="text-sm text-gray-500">Department: {c.department} | Block: {c.block}</p>
                  <p className="text-sm text-gray-500">Priority: {c.priority}</p>
                  <p className="text-sm text-gray-500">Status: <span className="font-medium">{c.status}</span></p>

                  {activeReplyId === c._id ? (
                    <div className="mt-2">
                      <textarea className="w-full border rounded p-2 mb-2" rows="3" placeholder="Enter your reply" value={replyMessage} onChange={(e) => setReplyMessage(e.target.value)} />
                      <button onClick={() => sendReply(c._id)} className="bg-green-600 text-white px-4 py-1 rounded mr-2">Send Reply</button>
                      <button onClick={() => setActiveReplyId(null)} className="text-sm text-gray-600">Cancel</button>
                    </div>
                  ) : (
                    <button onClick={() => setActiveReplyId(c._id)} className="text-red-600 text-sm mt-2 cursor-pointer font-semibold">📤 Reply via Email</button>
                  )}

                  {c.file && (
                    <div className="mt-3 flex flex-col items-start">
                      <img src={`http://localhost:5000/uploads/${c.file}`} alt="Complaint" className="w-32 h-32 object-cover border rounded shadow-sm" />
                      <a href={`http://localhost:5000/uploads/${c.file}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 font-semibold text-sm mt-1">View Full Image</a>
                    </div>
                  )}
                </div>

                <div className="space-y-2 flex flex-col items-start">
                  {["Pending", "In Progress", "Resolved"].map((s) => (
                    <button key={s} onClick={() => updateStatus(c._id, s)} className={`px-3 py-1 rounded text-sm text-white ${c.status === s ? (s === "Pending" ? "bg-red-600" : s === "In Progress" ? "bg-yellow-500" : "bg-green-600") : "bg-gray-400 text-black"}`} disabled={c.status === s}>Mark {s}</button>
                  ))}
                  <button onClick={() => { setComplaintToReject(c._id); setShowRejectPopup(true); }} className="px-3 py-1 rounded text-sm bg-red-700 text-white" disabled={c.status === "Rejected"}>Reject Complaint</button>
                  <div className="flex items-center gap-2 mt-3">
                    <span className={`w-4 h-4 rounded-full ${c.status === "Rejected" ? "bg-red-700 animate-pulse" : c.status === "Resolved" ? "bg-green-500 animate-blink-slow" : c.priority === "high" ? "bg-red-600 animate-blink-fast" : c.priority === "medium" ? "bg-orange-400 animate-blink-medium" : "bg-yellow-400 animate-blink-slow"}`} />
                    <span className={`text-sm font-medium ${c.status === "Rejected" ? "text-red-700 font-semibold" : ""}`}>
                      {c.status === "Rejected" ? "Rejected" : c.status === "Resolved" ? "Solved" : c.priority === "high" ? "High Priority" : c.priority === "medium" ? "Medium Priority" : "Low Priority"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showRejectPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold mb-4">Reject Complaint</h2>
            <p className="mb-2 text-sm">Are you sure you want to reject this complaint?</p>
            <textarea placeholder="Optional: Reason for rejection" className="w-full border p-2 mb-4 rounded" rows={3} value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
            <div className="flex justify-end gap-2">
              <button className="px-4 py-1 bg-gray-300 rounded" onClick={() => { setShowRejectPopup(false); setRejectReason(""); setComplaintToReject(null); }}>Cancel</button>
              <button className="px-4 py-1 bg-red-600 text-white rounded" onClick={async () => { await updateStatus(complaintToReject, "Rejected", rejectReason); setShowRejectPopup(false); setRejectReason(""); setComplaintToReject(null); }}>Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
