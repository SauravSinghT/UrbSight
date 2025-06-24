const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true,
    required: true
  },
  title: String,
  description: String,
  status: { type: String, default: "Open" },
  priority: {
    type: String,
    enum: ["low", "medium", "high"], // lowercase
    default: "medium",
    lowercase: true,
  },
  region: String,
  department: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  file: {
    type: String,
    default: null,
  },

  rejectReason: { type: String, default: "" },

  // ✅ NEW: Location Fields for Admin Hierarchy
  state: { type: String },
  district: { type: String },
  block: { type: String },  // town/city
});

module.exports = mongoose.model("Complaint", complaintSchema);
