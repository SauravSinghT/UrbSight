import { useState } from "react";
import axios from "../api/axios";

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

export default function ComplaintForm() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    department: "",
    region: "",
    priority: "low",
    district: "",
    block: ""
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "district") {
      setForm({ ...form, district: value, block: "" });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    Object.keys(form).forEach((key) =>
      data.append(key, typeof form[key] === "string" ? form[key].trim() : form[key])
    );
    if (file) data.append("file", file);

    try {
      const token = localStorage.getItem("token");
      await axios.post("/complaints/create", data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        }
      });
      alert("Complaint submitted!");
      setForm({
        title: "",
        description: "",
        department: "",
        region: "",
        priority: "low",
        district: "",
        block: ""
      });
      setFile(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || "Submission failed");
    } finally {
      setLoading(false);
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
          <option value="North">Uttarakhand</option>
          
        </select>

        <select className="input" name="district" value={form.district} onChange={handleChange} required>
          <option value="">Select District</option>
          {Object.keys(districtBlockMap).map((district) => (
            <option key={district} value={district}>{district}</option>
          ))}
        </select>

        <select className="input" name="block" value={form.block} onChange={handleChange} required disabled={!form.district}>
          <option value="">Select Block</option>
          {form.district && districtBlockMap[form.district].map((block) => (
            <option key={block} value={block}>{block}</option>
          ))}
        </select>

        <div className="flex gap-4">
          {["low", "medium", "high"].map((level) => (
            <label key={level} className="flex items-center gap-2">
              <input type="radio" name="priority" value={level} checked={form.priority === level} onChange={handleChange} />
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </label>
          ))}
        </div>

        <input className="input" type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Submitting..." : "Submit Complaint"}
        </button>
      </form>
    </div>
  );
}
