const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ["user", "block-admin", "group-admin", "super-admin"],
    default: "user",
  },
  state: { type: String },     // For all admin levels
  district: { type: String },  // For block and group-admin
  block: { type: String },     // For block-admin only
});

module.exports = mongoose.model("User", userSchema);
