const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  status: { type: String, default: "Open" },
  priority: { type: String,
  enum: ["low", "medium", "high"], // 🔽 lowercase values
  default: "medium",
  lowercase: true, },
  region: String,
  department: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  file: {
  type: String,
  default: null,
},

});

module.exports = mongoose.model("Complaint", complaintSchema);
