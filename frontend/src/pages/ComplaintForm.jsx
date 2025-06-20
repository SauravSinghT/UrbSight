import { useState } from "react";
import axios from "../api/axios";

export default function ComplaintForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    region: "",
    priority: "low"
  });
  const [file, setFile] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach((key) => data.append(key, form[key]));
    if (file) data.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post("/complaints/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      });
      alert("Complaint submitted!");
      setForm({ title: "", description: "", department: "", region: "", priority: "low" });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Submission failed");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white shadow-md p-6 rounded">
      <h2 className="text-2xl font-bold mb-4 text-center">Submit a Complaint</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="input" type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <textarea className="input" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <select className="input" name="department" value={form.department} onChange={handleChange} required>
          <option value="">Select Department</option>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Sanitation">Sanitation</option>
          <option value="Road">Road</option>
        </select>
        <select className="input" name="region" value={form.region} onChange={handleChange} required>
          <option value="">Select Region</option>
          <option value="North">North</option>
          <option value="South">South</option>
          <option value="East">East</option>
          <option value="West">West</option>
        </select>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input type="radio" name="priority" value="low" checked={form.priority === "low"} onChange={handleChange} />
            Low
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="priority" value="medium" checked={form.priority === "medium"} onChange={handleChange} />
            Medium
          </label>
          <label className="flex items-center gap-2">
            <input type="radio" name="priority" value="high" checked={form.priority === "high"} onChange={handleChange} />
            High
          </label>
        </div>
        <input className="input" type="file" onChange={(e) => setFile(e.target.files[0])} />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Submit Complaint</button>
      </form>
    </div>
  );
}
