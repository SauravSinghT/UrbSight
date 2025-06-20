const Complaint = require("../models/Complaint");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");



// Create new complaint
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, department, region, priority } = req.body;
    const file = req.file ? req.file.filename : null;

    const complaint = new Complaint({
      title,
      description,
      department,
      region,
      priority,
      user: req.user.id,
      file,
    });

    await complaint.save();

    // ✅ Fetch full user info
    const user = await User.findById(req.user.id);

    // ✅ Now use user.email and user.name safely
    await sendEmail(
      user.email,
      "Complaint Received",
      `Hi ${user.name || "User"},\n\nYour complaint has been submitted successfully.\n\nTitle: ${title}\nPriority: ${priority}\n\nWe will get back to you shortly.\n\nThanks,\nComplaint Portal`
    );

    const io = req.app.get("io");
    io.emit("newComplaint", complaint);

    res.status(201).json(complaint);
  } catch (err) {
    console.error("Complaint creation error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};



exports.getPrioritizedComplaints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let filter = {};

    if (user.role === "admin") {
      if (user.region) filter.region = user.region;
      if (user.department) filter.department = user.department;
    }

    // Priority sorting logic
    const complaints = await Complaint.aggregate([
      { $match: filter },
      {
        $addFields: {
          priorityWeight: {
            $switch: {
              branches: [
                { case: { $eq: ["$priority", "high"] }, then: 1 },
                { case: { $eq: ["$priority", "medium"] }, then: 2 },
                { case: { $eq: ["$priority", "low"] }, then: 3 }
              ],
              default: 4
            }
          }
        }
      },
      { $sort: { priorityWeight: 1, createdAt: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" }
    ]);

    res.json({ complaints });
  } catch (err) {
    console.error("Priority queue error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

// complaintController.js
// complaintController.js
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    const user = await User.findById(req.user.id);

    // Allow deletion if user is the owner or an admin/superadmin
    if (
      complaint.user.toString() !== req.user.id &&
      user.role !== "admin" &&
      user.role !== "superadmin"
    ) {
      return res.status(403).json({ msg: "Unauthorized" });
    }

    await complaint.deleteOne();
    res.json({ msg: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};






exports.getComplaintStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let filter = {};

    if (user.role === "admin") {
      if (user.region) filter.region = user.region;
      if (user.department) filter.department = user.department;
    }

    // 1. Count by status
    const statusStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // 2. Count by priority
    const priorityStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // 3. Count by department
    const departmentStats = await Complaint.aggregate([
      { $match: filter },
      { $group: { _id: "$department", count: { $sum: 1 } } }
    ]);

    // 4. Daily trend (last 7 days)
    const dailyStats = await Complaint.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: 7 }
    ]);
    // 5. Count by region
const regionStats = await Complaint.aggregate([
  { $match: filter },
  { $group: { _id: "$region", count: { $sum: 1 } } }
]);



    res.json({
  statusStats,
  priorityStats,
  departmentStats,
  regionStats, // ✅ include this
  dailyStats
});
  } catch (err) {
    console.error("Stats error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};


// Get complaints for user
exports.getMyComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// Get all complaints for admin (filtered by region/department)
exports.getAllComplaints = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let filter = {};

    // Admin role-based filtering
    if (user.role === "admin") {
      if (user.region) filter.region = user.region;
      if (user.department) filter.department = user.department;
    }

    // Additional filters from query params
    if (req.query.region) filter.region = req.query.region;
    if (req.query.department) filter.department = req.query.department;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.status) filter.status = req.query.status;

    // Keyword search (title or description)
    if (req.query.search) {
      const search = req.query.search;
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Complaint.countDocuments(filter);
    const complaints = await Complaint.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      complaints,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error("Filter error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};


// Update complaint status (admin only)
exports.updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    res.json({ msg: "Status updated", complaint });
  } catch (err) {
    res.status(500).json({ msg: "Server Error" });
  }
};

// GET /api/complaints/stats
exports.getStats = async (req, res) => {
  const all = await Complaint.find();
  const statusCounts = {};
  const departmentCounts = {};
  const regionCounts = {};

  all.forEach((c) => {
    statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    departmentCounts[c.department] = (departmentCounts[c.department] || 0) + 1;
    regionCounts[c.region] = (regionCounts[c.region] || 0) + 1;
  });

  res.json({ total: all.length, statusCounts, departmentCounts, regionCounts });
};

// POST /complaints/:id/reply (admin only)
exports.replyToComplaint = async (req, res) => {
  try {
    const { message } = req.body;
    const complaint = await Complaint.findById(req.params.id).populate("user", "email name");

    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    const email = complaint.user.email;
    const name = complaint.user.name || "User";

    await sendEmail(
      email,
      `Response to Your Complaint: ${complaint.title}`,
      `Hello ${name},\n\n${message}\n\n- Complaint Support Team`
    );

    res.json({ msg: "Reply sent successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Failed to send reply" });
  }
};
// DELETE /api/complaints/:id
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) return res.status(404).json({ msg: "Complaint not found" });

    // Only allow user to delete their own complaint
    if (complaint.user.toString() !== req.user.id)
      return res.status(403).json({ msg: "Unauthorized" });

    await complaint.deleteOne();
    res.json({ msg: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Delete error:", err.message);
    res.status(500).json({ msg: "Server Error" });
  }
};

